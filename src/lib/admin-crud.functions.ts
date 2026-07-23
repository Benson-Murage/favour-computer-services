import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin, logAudit } from "./admin/audit.server";

// =================== PRODUCTS ===================

export const listAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("products")
      .select("*, categories(name, slug), brands(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const ProductInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(240),
  description: z.string().max(8000).optional().nullable(),
  price: z.coerce.number().nonnegative(),
  compare_at_price: z.coerce.number().nonnegative().optional().nullable(),
  condition: z.enum(["new", "refurbished"]).default("new"),
  category_id: z.string().uuid().optional().nullable(),
  brand_id: z.string().uuid().optional().nullable(),
  image_url: z.string().max(20000).optional().nullable(),
  images: z.array(z.string()).optional().default([]),
  image_urls: z.array(z.string().max(20000)).optional().default([]),
  stock: z.coerce.number().int().min(0).default(0),
  warranty: z.string().max(400).optional().default(""),
  ram: z.string().max(80).optional().nullable(),
  storage: z.string().max(80).optional().nullable(),
  processor: z.string().max(160).optional().nullable(),
  specs: z.record(z.string(), z.any()).optional().default({}),
  is_featured: z.boolean().optional().default(false),
  is_new_arrival: z.boolean().optional().default(false),
  is_best_seller: z.boolean().optional().default(false),
  is_on_offer: z.boolean().optional().default(false),
  offer_starts_at: z.string().optional().nullable(),
  offer_ends_at: z.string().optional().nullable(),
  offer_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  offer_price: z.coerce.number().nonnegative().optional().nullable(),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: z.infer<typeof ProductInput>) => ProductInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload: Record<string, unknown> = { ...data };
    delete payload.id;
    let id = data.id;
    if (id) {
      const { error } = await context.supabase
        .from("products")
        .update(payload as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await context.supabase
        .from("products")
        .insert(payload as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = row.id;
    }
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: data.id ? "update" : "create",
      entity: "product",
      entityId: id!,
      details: { name: data.name },
    });
    return { id };
  });

export const setProductArchived = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string; archived: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("products")
      .update({ archived_at: data.archived ? new Date().toISOString() : null })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: data.archived ? "archive" : "restore",
      entity: "product",
      entityId: data.id,
    });
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "delete",
      entity: "product",
      entityId: data.id,
    });
    return { ok: true };
  });

// =================== CATEGORIES ===================

const CategoryInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  icon: z.string().max(80).optional().nullable(),
  sort_order: z.coerce.number().int().optional().default(0),
});

export const listCategoriesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof CategoryInput>) => CategoryInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await context.supabase.from("categories").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("categories")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("categories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== BRANDS ===================

const BrandInput = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  logo_url: z.string().max(20000).optional().nullable(),
  sort_order: z.coerce.number().int().optional().default(0),
});

export const listBrandsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("brands")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof BrandInput>) => BrandInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await context.supabase.from("brands").update(rest).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("brands")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("brands").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== INVENTORY ===================

export const adjustStock = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { product_id: string; delta: number; reason?: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: prod, error: e1 } = await context.supabase
      .from("products")
      .select("stock, name")
      .eq("id", data.product_id)
      .single();
    if (e1) throw new Error(e1.message);
    const newStock = Math.max(0, (prod.stock ?? 0) + data.delta);
    const { error: e2 } = await context.supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", data.product_id);
    if (e2) throw new Error(e2.message);
    const { error: e3 } = await context.supabase.from("inventory_movements").insert({
      product_id: data.product_id,
      delta: data.delta,
      reason: data.reason ?? "adjustment",
      admin_id: context.userId,
    });
    if (e3) throw new Error(e3.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "stock_adjust",
      entity: "product",
      entityId: data.product_id,
      details: { delta: data.delta, new_stock: newStock, reason: data.reason },
    });
    return { stock: newStock };
  });

export const inventoryHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("inventory_movements")
      .select("*, products(name, slug)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// =================== SERVICE PACKAGES ===================

const PackageInput = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["cctv", "livestream"]),
  name: z.string().min(1).max(120),
  tagline: z.string().max(200).optional().default(""),
  price: z.coerce.number().optional().nullable(),
  price_label: z.string().max(80).optional().default(""),
  description: z.string().max(3000).optional().default(""),
  features: z.array(z.string()).optional().default([]),
  equipment: z.array(z.string()).optional().default([]),
  sort_order: z.coerce.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
});

export const listPackagesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("service_packages")
      .select("*")
      .order("kind")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof PackageInput>) => PackageInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      ...data,
      features: data.features as never,
      equipment: data.equipment as never,
    };
    if (data.id) {
      const { id, ...rest } = payload;
      const { error } = await context.supabase
        .from("service_packages")
        .update(rest as never)
        .eq("id", id!);
      if (error) throw new Error(error.message);
      return { id };
    }
    delete (payload as { id?: string }).id;
    const { data: row, error } = await context.supabase
      .from("service_packages")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("service_packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== PROMOTIONS ===================

const PromoInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(160),
  product_id: z.string().uuid().optional().nullable(),
  percent_off: z.coerce.number().min(0).max(100).optional().nullable(),
  price_override: z.coerce.number().optional().nullable(),
  starts_at: z.string().optional().nullable(),
  ends_at: z.string().optional().nullable(),
  active: z.boolean().optional().default(true),
});

export const listPromotionsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("promotions")
      .select("*, products(name, slug)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const savePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof PromoInput>) => PromoInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const { id, ...rest } = data;
      const { error } = await context.supabase
        .from("promotions")
        .update(rest as never)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { id: _omit, ...insertData } = data;
    void _omit;
    const { data: row, error } = await context.supabase
      .from("promotions")
      .insert(insertData as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("promotions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =================== ORDERS / PICKUPS ===================

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    (d: {
      id: string;
      status: "pending" | "paid" | "ready" | "picked_up" | "delivered" | "cancelled";
    }) => d,
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await logAudit(context.supabase, {
      adminId: context.userId,
      adminEmail: context.claims?.email ?? "",
      action: "status",
      entity: "order",
      entityId: data.id,
      details: { status: data.status },
    });
    return { ok: true };
  });

export const adminGetOrder = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Order not found");
    const { data: payments } = await context.supabase
      .from("payments")
      .select("*")
      .eq("order_id", data.id)
      .order("created_at", { ascending: false });
    return { order, payments: payments ?? [] };
  });
