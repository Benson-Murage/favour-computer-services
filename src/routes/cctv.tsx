import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Camera,
  ShieldCheck,
  Moon,
  Activity,
  Smartphone,
  Cloud,
  ArrowRight,
  MessageCircle,
  Phone,
  Check,
} from "lucide-react";
import { useState } from "react";
import { QuoteModal } from "@/components/quote-modal";
import { getPublicServicePackages } from "@/lib/services-public.functions";

export const Route = createFileRoute("/cctv")({
  head: () => ({
    meta: [
      { title: "CCTV Installation Nairobi — Favour Computer Services" },
      {
        name: "description",
        content:
          "Professional CCTV supply and installation in Nairobi for homes, offices, schools and businesses. HD cameras, night vision, remote monitoring.",
      },
      { property: "og:title", content: "CCTV Installation in Nairobi" },
      {
        property: "og:description",
        content: "HD CCTV cameras, installation and remote monitoring across Kenya.",
      },
      { property: "og:url", content: "/cctv" },
    ],
    links: [{ rel: "canonical", href: "/cctv" }],
  }),
  component: CctvPage,
});

const FEATURES = [
  { Icon: Camera, t: "HD & 4K Cameras", s: "Crisp footage day and night." },
  { Icon: Moon, t: "Night Vision", s: "Infrared cameras for low-light." },
  { Icon: Activity, t: "Motion Detection", s: "Smart alerts when it matters." },
  { Icon: Smartphone, t: "Mobile App Access", s: "View live feeds from anywhere." },
  { Icon: Cloud, t: "Cloud Recording", s: "Secure backup of footage." },
  { Icon: ShieldCheck, t: "Professional Install", s: "Clean wiring, neat finishing." },
];

function CctvPage() {
  const fn = useServerFn(getPublicServicePackages);
  const { data } = useQuery({
    queryKey: ["pub", "pkg", "cctv"],
    queryFn: () => fn({ data: "cctv" }),
  });
  const [quote, setQuote] = useState<{ pkg: string } | null>(null);
  const packages = (data ?? []) as Array<{
    id: string;
    name: string;
    tagline: string | null;
    price_label: string | null;
    description: string | null;
    features: string[] | null;
  }>;
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 text-background md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Camera className="h-3.5 w-3.5" /> CCTV Solutions
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Protect what matters with{" "}
              <span className="text-[color:var(--accent)]">professional CCTV.</span>
            </h1>
            <p className="mt-5 max-w-lg text-background/75 md:text-lg">
              Supply and installation of CCTV systems for homes, offices, schools and businesses
              across Nairobi and Kenya — with mobile app access and remote monitoring.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setQuote({ pkg: "" })}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground"
              >
                Request a quote <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="https://wa.me/254726548592"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 text-sm font-semibold text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">CCTV Packages</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Right-sized solutions for every space. All packages include installation and setup.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {packages.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]"
            >
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {p.tagline && <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>}
              {p.price_label && (
                <div className="mt-3 text-[color:var(--accent)] font-bold">{p.price_label}</div>
              )}
              {p.description && (
                <p className="mt-3 text-xs text-muted-foreground">{p.description}</p>
              )}
              {(p.features ?? []).length > 0 && (
                <ul className="mt-4 space-y-1.5 text-xs">
                  {(p.features ?? []).slice(0, 6).map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <Check className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" /> {f}
                    </li>
                  ))}
                </ul>
              )}
              <button onClick={() => setQuote({ pkg: p.name })} className="mt-auto pt-5">
                <span className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  Request quote
                </span>
              </button>
            </div>
          ))}
          {packages.length === 0 && (
            <div className="col-span-full text-sm text-muted-foreground">Loading packages…</div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What's included</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background">
                <f.Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">Ready to get started?</h2>
        <p className="mt-2 text-sm text-muted-foreground">Request a CCTV quote — no obligation.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setQuote({ pkg: "" })}
            className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background"
          >
            Request CCTV quote
          </button>
          <a
            href="tel:+254726548592"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold"
          >
            <Phone className="h-4 w-4" /> 0726 548 592
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 text-center">
        <Link
          to="/live-streaming"
          className="text-sm font-semibold text-foreground hover:underline"
        >
          Also explore our Live Streaming services →
        </Link>
      </div>

      <QuoteModal
        open={!!quote}
        onClose={() => setQuote(null)}
        source="cctv"
        packageName={quote?.pkg}
        title={quote?.pkg ? `Request quote — ${quote.pkg}` : "Request CCTV quote"}
      />
    </div>
  );
}
