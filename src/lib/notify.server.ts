import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { sendAndUpdateLog, wrapHtml } from "./email/brevo.server";

export const OWNER_EMAIL = process.env.ADMIN_EMAIL || "bensonmurage254@gmail.com";

/**
 * Records an email send attempt to the email_log table. This is the single
 * source of truth for "Email Center" in admin. Real provider delivery is
 * layered on once a sender domain is configured; until then entries stay
 * `pending` and are visible/resendable from the admin UI.
 */
export async function recordEmail(
  supabase: SupabaseClient<Database>,
  params: {
    recipient: string;
    subject: string;
    template: string;
    body?: string;
    relatedType?: string;
    relatedId?: string;
    payload?: Record<string, unknown>;
  },
) {
  try {
    const { data: inserted } = await supabase.from("email_log").insert({
      recipient: params.recipient,
      subject: params.subject,
      template: params.template,
      status: "pending",
      related_type: params.relatedType ?? null,
      related_id: params.relatedId ?? null,
      payload: { body: params.body ?? "", ...(params.payload ?? {}) } as never,
    }).select("id").single();
    if (inserted?.id) {
      const html = wrapHtml(params.subject, params.body ?? "");
      // fire-and-await; errors are recorded on the row and never thrown
      await sendAndUpdateLog(supabase, inserted.id, {
        to: params.recipient,
        subject: params.subject,
        html,
      });
    }
  } catch {
    /* non-fatal */
  }
}

/** Records a customer-facing notification (visible in their account history). */
export async function recordNotification(
  supabase: SupabaseClient<Database>,
  params: {
    userId?: string | null;
    recipientEmail: string;
    kind: string;
    subject: string;
    body: string;
    relatedType?: string;
    relatedId?: string;
    metadata?: Record<string, unknown>;
  },
) {
  try {
    await supabase.from("notifications").insert({
      user_id: params.userId ?? null,
      recipient_email: params.recipientEmail,
      kind: params.kind,
      subject: params.subject,
      body: params.body,
      related_type: params.relatedType ?? null,
      related_id: params.relatedId ?? null,
      metadata: (params.metadata ?? {}) as never,
      channel: "email",
    });
  } catch {
    /* non-fatal */
  }
}

/** Convenience: queue an email to the admin owner inbox AND log a notification to the customer. */
export async function notifyBoth(
  supabase: SupabaseClient<Database>,
  params: {
    customerEmail: string;
    customerUserId?: string | null;
    kind: string;
    adminSubject: string;
    adminBody: string;
    customerSubject: string;
    customerBody: string;
    relatedType?: string;
    relatedId?: string;
  },
) {
  await Promise.all([
    recordEmail(supabase, {
      recipient: OWNER_EMAIL,
      subject: params.adminSubject,
      template: `${params.kind}-admin`,
      body: params.adminBody,
      relatedType: params.relatedType,
      relatedId: params.relatedId,
    }),
    recordEmail(supabase, {
      recipient: params.customerEmail,
      subject: params.customerSubject,
      template: `${params.kind}-customer`,
      body: params.customerBody,
      relatedType: params.relatedType,
      relatedId: params.relatedId,
    }),
    recordNotification(supabase, {
      userId: params.customerUserId ?? null,
      recipientEmail: params.customerEmail,
      kind: params.kind,
      subject: params.customerSubject,
      body: params.customerBody,
      relatedType: params.relatedType,
      relatedId: params.relatedId,
    }),
  ]);
}