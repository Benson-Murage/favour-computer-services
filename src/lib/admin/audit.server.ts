import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export async function logAudit(
  supabase: SupabaseClient<Database>,
  params: {
    adminId: string;
    adminEmail: string;
    action: string;
    entity: string;
    entityId?: string;
    details?: Record<string, unknown>;
  },
) {
  await supabase.from("admin_audit_log").insert({
    admin_id: params.adminId,
    admin_email: params.adminEmail,
    action: params.action,
    entity: params.entity,
    entity_id: params.entityId ?? "",
    details: (params.details ?? {}) as never,
  });
}

export async function assertAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin access required");
}