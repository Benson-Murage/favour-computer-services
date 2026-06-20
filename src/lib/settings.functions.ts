import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, logAudit } from "./admin/audit.server";
import type { Database } from "@/integrations/supabase/types";

export const getBusinessSettings = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

type SettingsUpdate = Partial<{
  company_name: string;
  business_description: string;
  address: string;
  email: string;
  phone: string;
  whatsapp: string;
  till_number: string;
  paybill_number: string;
  account_number: string;
  payment_instructions: string;
  pickup_location: string;
}>;

export const updateBusinessSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: SettingsUpdate) => input)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row, error: rerr } = await context.supabase
      .from("business_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (rerr) throw new Error(rerr.message);
    if (!row) throw new Error("Settings row missing");
    const { error } = await context.supabase
      .from("business_settings")
      .update(data)
      .eq("id", row.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "update",
      entity: "business_settings",
      entityId: row.id,
      details: data as Record<string, unknown>,
    });
    return { ok: true };
  });