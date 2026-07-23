import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_profiles")
      .select("full_name, phone")
      .eq("user_id", context.userId)
      .maybeSingle();
    return {
      email: context.claims?.email ?? "",
      full_name: data?.full_name ?? "",
      phone: data?.phone ?? "",
    };
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { full_name?: string; phone?: string }) =>
    z
      .object({ full_name: z.string().max(120).optional(), phone: z.string().max(40).optional() })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_profiles")
      .upsert(
        { user_id: context.userId, full_name: data.full_name ?? null, phone: data.phone ?? null },
        { onConflict: "user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", context.userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const AddressInput = z.object({
  id: z.string().uuid().optional(),
  label: z.string().max(60).optional().nullable(),
  recipient_name: z.string().max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  line1: z.string().min(1).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  region: z.string().max(120).optional().nullable(),
  postal_code: z.string().max(40).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  is_default: z.boolean().optional(),
});

export const upsertMyAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof AddressInput>) => AddressInput.parse(d))
  .handler(async ({ data, context }) => {
    const payload = { ...data, user_id: context.userId };
    if (data.is_default) {
      await context.supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", context.userId);
    }
    const { data: row, error } = data.id
      ? await context.supabase
          .from("user_addresses")
          .update(payload)
          .eq("id", data.id)
          .eq("user_id", context.userId)
          .select()
          .single()
      : await context.supabase.from("user_addresses").insert(payload).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteMyAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_addresses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setDefaultAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", context.userId);
    const { error } = await context.supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const changeMyPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { new_password: string }) =>
    z.object({ new_password: z.string().min(8).max(200) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(context.userId, {
      password: data.new_password,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
