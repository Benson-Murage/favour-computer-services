import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getPublicServicePackages = createServerFn({ method: "GET" })
  .inputValidator((kind: "cctv" | "livestream") => kind)
  .handler(async ({ data }) => {
    const supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data: rows, error } = await supabase
      .from("service_packages")
      .select("*")
      .eq("kind", data)
      .eq("active", true)
      .order("sort_order");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
