import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, logAudit } from "./admin/audit.server";
import { notifyBoth } from "./notify.server";

const SubmitInput = z.object({
  order_id: z.string().uuid(),
  amount: z.coerce.number().min(0),
  method: z.string().trim().max(40).optional().default(""),
  reference: z.string().trim().max(120).optional().default(""),
  proof_path: z.string().trim().max(500).optional().default(""),
  proof_mime: z.string().trim().max(80).optional().default(""),
});

export const submitPaymentProof = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof SubmitInput>) => SubmitInput.parse(d))
  .handler(async ({ data, context }) => {
    const { data: order, error: oerr } = await context.supabase
      .from("orders")
      .select("id, invoice_number, customer_email, customer_name, user_id")
      .eq("id", data.order_id)
      .maybeSingle();
    if (oerr) throw new Error(oerr.message);
    if (!order) throw new Error("Order not found");

    if (!data.proof_path && !data.reference) {
      throw new Error("Provide a transaction reference or upload a screenshot.");
    }
    const { data: row, error } = await context.supabase
      .from("payments")
      .insert({
        order_id: data.order_id,
        user_id: context.userId,
        amount: data.amount,
        method: data.method ?? "",
        reference: data.reference ?? "",
        proof_path: data.proof_path || null,
        proof_mime: data.proof_mime ?? "",
        status: "pending",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    await context.supabase
      .from("orders")
      .update({ payment_status: "awaiting_verification" })
      .eq("id", data.order_id);

    await notifyBoth(context.supabase, {
      customerEmail: order.customer_email,
      customerUserId: order.user_id,
      kind: "payment-submitted",
      adminSubject: `Payment proof submitted for ${order.invoice_number}`,
      adminBody: `${order.customer_name} uploaded a payment proof for ${order.invoice_number}.\nAmount: KES ${data.amount.toLocaleString()} via ${data.method || "M-Pesa"}.\nReference: ${data.reference || "—"}\n\nReview in Admin → Payments.`,
      customerSubject: `We received your payment proof for ${order.invoice_number}`,
      customerBody: `Hi ${order.customer_name},\n\nWe received your payment proof and it is now awaiting verification. You'll get another email once it has been approved.\n\nFavour Computer Services`,
      relatedType: "payment",
      relatedId: row.id,
    });
    return { id: row.id };
  });

export const getProofSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { path: string }) => z.object({ path: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    // RLS on storage.objects enforces ownership/admin access.
    const { data: signed, error } = await context.supabase.storage
      .from("payment-proofs")
      .createSignedUrl(data.path, 60 * 10);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

// ───────── Admin ─────────

export const adminListPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("payments")
      .select(
        "*, order:orders(id, invoice_number, customer_name, customer_email, total, payment_status)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ReviewInput = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  notes: z.string().max(2000).optional().default(""),
});

export const adminReviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: z.infer<typeof ReviewInput>) => ReviewInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: pay, error } = await context.supabase
      .from("payments")
      .select("id, order_id")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);

    const status = data.action === "approve" ? "approved" : "rejected";
    await context.supabase
      .from("payments")
      .update({
        status,
        admin_notes: data.notes,
        reviewed_by: context.userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    const { data: order } = await context.supabase
      .from("orders")
      .select("id, customer_email, customer_name, invoice_number, user_id, status")
      .eq("id", pay.order_id)
      .single();

    if (data.action === "approve" && order) {
      const nextStatus = order.status === "pending" ? "paid" : order.status;
      await context.supabase
        .from("orders")
        .update({ payment_status: "paid", status: nextStatus })
        .eq("id", pay.order_id);
      await notifyBoth(context.supabase, {
        customerEmail: order.customer_email,
        customerUserId: order.user_id,
        kind: "payment-approved",
        adminSubject: `Payment approved for ${order.invoice_number}`,
        adminBody: `Approved by admin. Notes: ${data.notes || "—"}`,
        customerSubject: `Payment confirmed for ${order.invoice_number}`,
        customerBody: `Hi ${order.customer_name},\n\nGreat news — your payment for ${order.invoice_number} has been verified. We're preparing your order.\n\nFavour Computer Services`,
        relatedType: "order",
        relatedId: pay.order_id,
      });
    } else if (order) {
      await context.supabase
        .from("orders")
        .update({ payment_status: "unpaid" })
        .eq("id", pay.order_id);
      await notifyBoth(context.supabase, {
        customerEmail: order.customer_email,
        customerUserId: order.user_id,
        kind: "payment-rejected",
        adminSubject: `Payment rejected for ${order.invoice_number}`,
        adminBody: `Rejected by admin. Notes: ${data.notes || "—"}`,
        customerSubject: `Payment proof rejected for ${order.invoice_number}`,
        customerBody: `Hi ${order.customer_name},\n\nWe were unable to verify your payment proof for ${order.invoice_number}.\nReason: ${data.notes || "Please double-check the screenshot and try again."}\n\nFavour Computer Services`,
        relatedType: "order",
        relatedId: pay.order_id,
      });
    }

    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: data.action,
      entity: "payment",
      entityId: data.id,
      details: { notes: data.notes },
    });
    return { ok: true };
  });
