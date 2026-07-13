import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const QuoteInput = z.object({
  source: z.enum(["cctv", "livestream", "product", "contact", "general"]).default("general"),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  service_type: z.string().max(200).optional().default(""),
  package: z.string().max(200).optional().default(""),
  location: z.string().max(300).optional().default(""),
  message: z.string().trim().max(3000).optional().default(""),
  product_id: z.string().uuid().optional().nullable(),
});
export type QuoteInputType = z.infer<typeof QuoteInput>;

function adminClient() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((data: QuoteInputType) => QuoteInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = adminClient();
    const { data: row, error } = await supabase
      .from("quotes")
      .insert({
        source: data.source,
        name: data.name,
        email: data.email,
        phone: data.phone,
        service_type: data.service_type ?? "",
        package: data.package ?? "",
        location: data.location ?? "",
        message: data.message ?? "",
        product_id: data.product_id ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    // Notify admin (queue via business settings email). Email infra hookable later.
    try {
      await supabase.from("admin_audit_log").insert({
        admin_id: null,
        admin_email: data.email,
        action: "submit",
        entity: "quote",
        entity_id: row.id,
        details: data as never,
      });
    } catch {
      /* non-fatal */
    }
    {
      const { notifyBoth } = await import("./notify.server");
      await notifyBoth(supabase, {
        customerEmail: data.email,
        customerUserId: null,
        kind: `quote-${data.source}`,
        adminSubject: `New ${data.source} quote request from ${data.name}`,
        adminBody: `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nPackage: ${data.package || "—"}\nLocation: ${data.location || "—"}\nService: ${data.service_type || "—"}\n\nMessage:\n${data.message || "—"}`,
        customerSubject: `We received your request — Favour Computer Services`,
        customerBody: `Hi ${data.name},\n\nThanks for reaching out. Our team has received your ${data.source} inquiry and will get back to you shortly with a tailored quote.\n\nFavour Computer Services\n0726 548 592`,
        relatedType: "quote",
        relatedId: row.id,
      });
    }
    return { id: row.id };
  });

const BookingInput = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  event_type: z.string().max(120).optional().default(""),
  event_date: z.string().optional().nullable(),
  event_location: z.string().max(300).optional().default(""),
  package: z.string().max(200).optional().default(""),
  requirements: z.string().max(3000).optional().default(""),
});

export const submitBooking = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof BookingInput>) => BookingInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = adminClient();
    const { data: row, error } = await supabase
      .from("bookings")
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        event_type: data.event_type ?? "",
        event_date: data.event_date || null,
        event_location: data.event_location ?? "",
        package: data.package ?? "",
        requirements: data.requirements ?? "",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    const { notifyBoth } = await import("./notify.server");
    await notifyBoth(supabase, {
      customerEmail: data.email,
      customerUserId: null,
      kind: "booking-livestream",
      adminSubject: `New live-streaming booking from ${data.name}`,
      adminBody: `Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nEvent type: ${data.event_type}\nDate: ${data.event_date ?? "—"}\nLocation: ${data.event_location}\nPackage: ${data.package}\n\nRequirements:\n${data.requirements || "—"}`,
      customerSubject: `Booking received — Favour Computer Services`,
      customerBody: `Hi ${data.name},\n\nThanks for booking our live-streaming service. We've recorded your event details and our team will confirm availability and pricing shortly.\n\nFavour Computer Services`,
      relatedType: "booking",
      relatedId: row.id,
    });
    return { id: row.id };
  });

// ---------- Admin queries ----------

export const listQuotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin/audit.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("quotes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin/audit.server");
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const UpdateQuote = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "quoted", "converted", "cancelled"]).optional(),
  internal_notes: z.string().max(5000).optional(),
});

export const updateQuote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof UpdateQuote>) => UpdateQuote.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin/audit.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("quotes").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "update",
      entity: "quote",
      entityId: id,
      details: patch,
    });
    return { ok: true };
  });

const UpdateBooking = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "contacted", "quoted", "confirmed", "completed", "cancelled"]).optional(),
  internal_notes: z.string().max(5000).optional(),
});

export const updateBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: z.infer<typeof UpdateBooking>) => UpdateBooking.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin, logAudit } = await import("./admin/audit.server");
    await assertAdmin(context.supabase, context.userId);
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("bookings").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "update",
      entity: "booking",
      entityId: id,
      details: patch,
    });
    return { ok: true };
  });
