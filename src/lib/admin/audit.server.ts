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
  const [{ data: isAdmin, error: e1 }, { data: isSuper, error: e2 }] = await Promise.all([
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }),
    supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" as never }),
  ]);
  if (e1 && e2) throw new Error(e1.message);
  if (!isAdmin && !isSuper) throw new Error("Forbidden: admin access required");
}

export async function assertSuperAdmin(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" as never });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super admin access required");
}