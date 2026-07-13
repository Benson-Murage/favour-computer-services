import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, assertSuperAdmin, logAudit } from "./admin/audit.server";

type AppRole = "super_admin" | "admin" | "staff" | "customer";
const ROLE_VALUES = ["super_admin", "admin", "staff", "customer"] as const;

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (error) throw new Error(error.message);
    const ids = list.users.map((u) => u.id);
    const [profiles, roles] = await Promise.all([
      supabaseAdmin.from("user_profiles").select("*").in("user_id", ids),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", ids),
    ]);
    const profMap = new Map((profiles.data ?? []).map((p) => [p.user_id, p]));
    const roleMap = new Map<string, string[]>();
    (roles.data ?? []).forEach((r: { user_id: string; role: string }) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    return list.users.map((u) => {
      const prof = profMap.get(u.id) as
        | {
            full_name?: string | null;
            phone?: string | null;
            disabled?: boolean;
            last_login_at?: string | null;
          }
        | undefined;
      const userRoles = roleMap.get(u.id) ?? [];
      const top: AppRole = userRoles.includes("super_admin")
        ? "super_admin"
        : userRoles.includes("admin")
          ? "admin"
          : userRoles.includes("staff")
            ? "staff"
            : "customer";
      return {
        id: u.id,
        email: u.email ?? "",
        full_name: prof?.full_name ?? (u.user_metadata?.full_name as string | undefined) ?? "",
        phone: prof?.phone ?? "",
        role: top,
        roles: userRoles,
        disabled: !!prof?.disabled || !!u.banned_until,
        last_login_at: prof?.last_login_at ?? u.last_sign_in_at ?? null,
        created_at: u.created_at,
      };
    });
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; role: AppRole }) =>
    z.object({ user_id: z.string().uuid(), role: z.enum(ROLE_VALUES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // Only super_admin can assign admin/super_admin roles
    if (data.role === "admin" || data.role === "super_admin") {
      await assertSuperAdmin(context.supabase, context.userId);
    } else {
      await assertAdmin(context.supabase, context.userId);
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Replace roles atomically: delete all then insert the chosen role
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.user_id, role: data.role });
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "set_role",
      entity: "user",
      entityId: data.user_id,
      details: { role: data.role },
    });
    return { ok: true };
  });

export const setUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; disabled: boolean }) =>
    z.object({ user_id: z.string().uuid(), disabled: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Ban or unban in auth
    await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.disabled ? "876000h" : "none",
    } as never);
    await supabaseAdmin
      .from("user_profiles")
      .upsert({ user_id: data.user_id, disabled: data.disabled }, { onConflict: "user_id" });
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: data.disabled ? "disable" : "enable",
      entity: "user",
      entityId: data.user_id,
    });
    return { ok: true };
  });

export const sendPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string; redirect_to?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: data.email,
      options: data.redirect_to ? { redirectTo: data.redirect_to } : undefined,
    });
    if (error) throw new Error(error.message);
    // Log it to email_log so admin sees the dispatch attempt
    await context.supabase.from("email_log").insert({
      recipient: data.email,
      subject: "Reset your password",
      template: "password-reset-admin-trigger",
      status: "pending",
      payload: { action_link: link?.properties?.action_link ?? null } as never,
    });
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "reset_password",
      entity: "user",
      details: { email: data.email },
    });
    return { ok: true, action_link: link?.properties?.action_link ?? null };
  });

export const forceSignOut = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.signOut(data.user_id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "force_signout",
      entity: "user",
      entityId: data.user_id,
    });
    return { ok: true };
  });

export const getCurrentUserRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    return (data ?? []).map((r: { role: string }) => r.role);
  });
