import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const verifyReceipt = createServerFn({ method: "GET" })
  .validator((d: { code: string }) => z.object({ code: z.string().trim().min(4).max(64) }).parse(d))
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: result, error } = await supabase.rpc(
      "verify_receipt" as never,
      { _code: data.code.toUpperCase() } as never,
    );
    if (error) throw new Error(error.message);
    return { json: JSON.stringify(result ?? { valid: false }) };
  });

export const lookupProductSpecs = createServerFn({ method: "GET" })
  .validator((d: { ids: string[] }) =>
    z.object({ ids: z.array(z.string().uuid()).max(50) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!data.ids.length)
      return {
        products: [] as Array<{
          id: string;
          name: string;
          processor: string;
          ram: string;
          storage: string;
          warranty: string;
          condition: string;
        }>,
      };
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: prods, error } = await supabase
      .from("products")
      .select("id, name, processor, ram, storage, warranty, condition")
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    return {
      products: (prods ?? []).map((p) => ({
        id: String(p.id),
        name: String(p.name ?? ""),
        processor: String(p.processor ?? ""),
        ram: String(p.ram ?? ""),
        storage: String(p.storage ?? ""),
        warranty: String(p.warranty ?? ""),
        condition: String(p.condition ?? ""),
      })),
    };
  });
