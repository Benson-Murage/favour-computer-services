import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin/audit.server";

export const adminListEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("email_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminRetryEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error } = await context.supabase
      .from("email_log")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error || !row) throw new Error(error?.message ?? "not found");
    await context.supabase
      .from("email_log")
      .update({ status: "pending", error: null })
      .eq("id", data.id);
    const { sendAndUpdateLog, wrapHtml } = await import("./email/brevo.server");
    const body = (row.payload as { body?: string } | null)?.body ?? "";
    const result = await sendAndUpdateLog(context.supabase, row.id, {
      to: row.recipient,
      subject: row.subject,
      html: wrapHtml(row.subject, body),
    });
    return { ok: result.ok, error: result.error };
  });
