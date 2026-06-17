import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  ArrowRight, Laptop, Monitor, Smartphone, Tablet, HardDrive, MemoryStick,
  MonitorSmartphone, Printer, Wifi, Gamepad2, Headphones, RefreshCw,
  ShieldCheck, Truck, BadgeCheck, CreditCard, Wrench, Sparkles, Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop, Monitor, Smartphone, Tablet, HardDrive, MemoryStick,
  MonitorSmartphone, Printer, Wifi, Gamepad2, Headphones, RefreshCw,
};

const homeData = queryOptions({
  queryKey: ["home"],
  queryFn: async () => {
    const [cats, featured, refurb] = await Promise.all([
      supabase.from("categories").select("slug,name,icon"),
      supabase
        .from("products")
        .select("id,slug,name,price,compare_at_price,image_url,rating,review_count,condition,brand:brands(name)")
        .eq("is_featured", true)
        .limit(8),
      supabase
        .from("products")
        .select("id,slug,name,price,compare_at_price,image_url,rating,review_count,condition,brand:brands(name)")
        .neq("condition", "new")
        .limit(4),
    ]);
    return {
      categories: cats.data ?? [],
      featured: (featured.data ?? []) as unknown as ProductCardData[],
      refurb: (refurb.data ?? []) as unknown as ProductCardData[],
    };
  },
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voltline — Premium Electronics, New & Certified Refurbished" },
      { name: "description", content: "Shop laptops, phones, components and accessories — new and certified-refurbished with warranty." },
      { property: "og:title", content: "Voltline — Premium Electronics" },
      { property: "og:description", content: "New & certified-refurbished tech with warranty and fast shipping." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeData);
  },
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeData);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute inset-0 -z-10 opacity-30 [background-image:radial-gradient(circle_at_20%_30%,white,transparent_40%),radial-gradient(circle_at_80%_70%,white,transparent_45%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 text-background md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> New season drops
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              The tech you want.<br />
              <span className="text-[color:var(--accent)]">New or certified refurbished.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-background/75 md:text-lg">
              Save up to 60% on inspected, warrantied devices — or shop the latest releases at the right
              price. Free 2-day shipping over $99.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground transition hover:scale-[1.02]">
                Shop now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/shop"
                search={{ condition: "refurb" }}
                className="inline-flex h-12 items-center gap-2 rounded-full border border-background/30 bg-background/5 px-6 text-sm font-semibold text-background backdrop-blur transition hover:bg-background/15"
              >
                See refurbished deals
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-sm">
              <Stat n="120k+" l="Customers" />
              <Stat n="4.9★" l="Rated service" />
              <Stat n="1-yr" l="Refurb warranty" />
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -right-10 top-10 h-72 w-72 rounded-full bg-[color:var(--accent)]/30 blur-3xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {data.featured.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  className={`overflow-hidden rounded-3xl bg-background/95 p-4 shadow-2xl backdrop-blur ${i % 2 ? "translate-y-6" : ""}`}
                >
                  <div className="aspect-square overflow-hidden rounded-2xl bg-secondary">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <p className="mt-3 line-clamp-1 text-xs font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground">${Number(p.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 text-sm md:grid-cols-4">
          <Trust Icon={Truck} t="Free 2-day shipping" s="On orders $99+" />
          <Trust Icon={ShieldCheck} t="1-yr warranty" s="On every refurb" />
          <Trust Icon={BadgeCheck} t="Genuine products" s="Authorized only" />
          <Trust Icon={CreditCard} t="Secure checkout" s="256-bit encryption" />
        </div>
      </section>

      {/* CATEGORIES */}
      <Section title="Shop by category" subtitle="Everything from ultralight laptops to enterprise networking.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {data.categories.map((c) => {
            const Ic = ICONS[c.icon ?? ""] ?? Laptop;
            return (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition hover:-translate-y-0.5 hover:[box-shadow:var(--shadow-card)]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary transition group-hover:bg-foreground group-hover:text-background">
                  <Ic className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* FEATURED */}
      <Section title="Featured products" subtitle="Hand-picked by our staff this week." action={{ label: "View all", to: "/shop" }}>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.featured.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </Section>

      {/* REFURBISHED */}
      <section className="mx-auto mt-20 max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-foreground text-background">
          <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)]/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--accent)]">
                <RefreshCw className="h-3.5 w-3.5" /> Certified Refurbished
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                Like-new tech. Up to 60% off.
              </h2>
              <p className="mt-3 max-w-md text-background/70">
                Every device passes our 41-point inspection, ships with a 1-year warranty, and includes
                genuine accessories.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <RefurbStep n="01" t="Tested" />
                <RefurbStep n="02" t="Cleaned" />
                <RefurbStep n="03" t="Certified" />
                <RefurbStep n="04" t="Warrantied" />
              </div>
              <Link
                to="/shop"
                search={{ condition: "refurb" }}
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 text-sm font-semibold text-accent-foreground"
              >
                Shop refurbished <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {data.refurb.map((p) => (
                <Link
                  key={p.id}
                  to="/products/$slug"
                  params={{ slug: p.slug }}
                  className="overflow-hidden rounded-2xl bg-background/5 p-4 ring-1 ring-background/10 transition hover:ring-[color:var(--accent)]"
                >
                  <div className="aspect-square overflow-hidden rounded-xl bg-background/10">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <p className="mt-3 line-clamp-1 text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-[color:var(--accent)]">${Number(p.price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <Section title="Why Voltline" subtitle="A retailer built around trust, speed, and after-sale care.">
        <div className="grid gap-4 md:grid-cols-3">
          <Feature Icon={BadgeCheck} t="100% Genuine" s="Sourced from authorized distributors and brand partners only." />
          <Feature Icon={Wrench} t="Tested Refurbs" s="41-point inspection, deep clean, and software wipe before relisting." />
          <Feature Icon={ShieldCheck} t="Warranty included" s="1-year coverage on refurbs. Manufacturer warranty on new." />
          <Feature Icon={Truck} t="Fast shipping" s="Free 2-day shipping over $99. Same-day in select metros." />
          <Feature Icon={CreditCard} t="Secure payments" s="Encrypted checkout. Multiple payment options." />
          <Feature Icon={Headphones} t="Real support" s="Talk to a human via chat, email, or phone — 7 days a week." />
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section title="Loved by 120,000+ customers">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { n: "Maria S.", r: "The refurbished MacBook arrived in pristine condition. Could not tell from new." },
            { n: "Devon K.", r: "Best price on a new ROG laptop, and shipping was overnight. Buying again." },
            { n: "Priya R.", r: "Support actually answered the phone. Replaced my SSD without hassle." },
          ].map((t) => (
            <div key={t.n} className="rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]">
              <div className="flex gap-0.5 text-[color:var(--warning)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-sm text-foreground">"{t.r}"</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.n}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* NEWSLETTER */}
      <section className="mx-auto my-20 max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl border border-border bg-secondary p-10 md:p-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Be first to know.</h2>
            <p className="mt-3 text-muted-foreground">Drop alerts, restock notifications, and member-only deals.</p>
            <form className="mx-auto mt-6 flex max-w-md gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                required
                className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm outline-none ring-ring/30 focus:ring-2"
              />
              <button className="h-12 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({
  title, subtitle, action, children,
}: { title: string; subtitle?: string; action?: { label: string; to: string }; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4">
      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action && (
          <Link to={action.to} className="hidden text-sm font-semibold text-foreground hover:underline sm:inline-flex">
            {action.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-bold">{n}</div>
      <div className="text-xs uppercase tracking-wider text-background/60">{l}</div>
    </div>
  );
}

function Trust({ Icon, t, s }: { Icon: React.ComponentType<{ className?: string }>; t: string; s: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-background">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="font-semibold">{t}</div>
        <div className="text-xs text-muted-foreground">{s}</div>
      </div>
    </div>
  );
}

function Feature({ Icon, t, s }: { Icon: React.ComponentType<{ className?: string }>; t: string; s: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition hover:[box-shadow:var(--shadow-card)]">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{t}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{s}</p>
    </div>
  );
}

function RefurbStep({ n, t }: { n: string; t: string }) {
  return (
    <div className="rounded-xl bg-background/5 px-3 py-2 ring-1 ring-background/10">
      <div className="text-[10px] font-bold text-[color:var(--accent)]">{n}</div>
      <div className="text-sm font-semibold">{t}</div>
    </div>
  );
}
