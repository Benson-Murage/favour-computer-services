import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdmin } from "./admin/audit.server";
import { recordEmail, OWNER_EMAIL } from "./notify.server";

const SubInput = z.object({
  email: z.string().trim().email().max(255),
  name: z.string().trim().max(120).optional().default(""),
  source: z.string().trim().max(80).optional().default("footer"),
});

function admin() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((d: z.infer<typeof SubInput>) => SubInput.parse(d))
  .handler(async ({ data }) => {
    const supabase = admin();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { email: data.email.toLowerCase(), name: data.name || null, source: data.source },
        { onConflict: "email" },
      );
    if (error) throw new Error(error.message);

    await recordEmail(supabase, {
      recipient: OWNER_EMAIL,
      subject: `Newsletter signup: ${data.email}`,
      template: "newsletter-admin",
      body: `${data.email}${data.name ? ` (${data.name})` : ""} subscribed via ${data.source}.`,
    });
    await recordEmail(supabase, {
      recipient: data.email,
      subject: "Welcome to Favour Computer Services",
      template: "newsletter-welcome",
      body: `Thanks for subscribing. You'll be the first to hear about new arrivals, refurbished deals, and CCTV / live-streaming offers from our team in Nairobi.`,
    });
    return { ok: true };
  });

export const adminListSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminDeleteSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
