import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string(),
  price: z.coerce.number().nonnegative(),
  qty: z.coerce.number().int().min(1),
});

const OrderInput = z.object({
  customer_name: z.string().trim().min(2),
  customer_email: z.string().trim().email(),
  customer_phone: z.string().trim().min(7),
  fulfillment: z.enum(["delivery", "pickup"]),
  delivery_address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  items: z.array(ItemSchema).min(1),
});

function gen(prefix: string, n: number) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = prefix;
  for (let i = 0; i < n; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: z.infer<typeof OrderInput>) => OrderInput.parse(data))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const subtotal = data.items.reduce((s, it) => s + it.price * it.qty, 0);
    const total = subtotal; // no tax/shipping for v1
    const isPickup = data.fulfillment === "pickup";
    const reservation_number = isPickup ? `FCS-${gen("", 6)}` : null;
    const pickup_code = isPickup ? gen("", 4) : null;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        fulfillment: data.fulfillment,
        delivery_address: data.delivery_address ?? "",
        items: data.items as never,
        subtotal,
        total,
        notes: data.notes ?? "",
        status: "pending",
        reservation_number,
        pickup_code,
      })
      .select("id, reservation_number, pickup_code")
      .single();
    if (error) throw new Error(error.message);

    // Decrement stock
    for (const it of data.items) {
      const { data: prod } = await supabase.from("products").select("stock").eq("id", it.product_id).single();
      const newStock = Math.max(0, (prod?.stock ?? 0) - it.qty);
      await supabase.from("products").update({ stock: newStock }).eq("id", it.product_id);
      await supabase.from("inventory_movements").insert({
        product_id: it.product_id, delta: -it.qty, reason: "order", reference_id: order.id, admin_id: null,
      });
    }
    return order;
  });