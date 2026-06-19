import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ShieldCheck, Moon, Activity, Smartphone, Cloud, ArrowRight, MessageCircle, Phone } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";

export const Route = createFileRoute("/cctv")({
  head: () => ({
    meta: [
      { title: "CCTV Installation Nairobi — Favour Computer Services" },
      { name: "description", content: "Professional CCTV supply and installation in Nairobi for homes, offices, schools and businesses. HD cameras, night vision, remote monitoring." },
      { property: "og:title", content: "CCTV Installation in Nairobi" },
      { property: "og:description", content: "HD CCTV cameras, installation and remote monitoring across Kenya." },
      { property: "og:url", content: "/cctv" },
    ],
    links: [{ rel: "canonical", href: "/cctv" }],
  }),
  component: CctvPage,
});

const PACKAGES = [
  { name: "Home Package", cams: "2 – 4 cameras", best: "Apartments & residential homes", from: "From KSh 18,000" },
  { name: "Small Business", cams: "4 – 8 cameras", best: "Shops, offices and salons", from: "From KSh 38,000" },
  { name: "School Package", cams: "8 – 16 cameras", best: "Schools and learning institutions", from: "From KSh 85,000" },
  { name: "Enterprise", cams: "16+ cameras", best: "Warehouses, estates, large premises", from: "Custom quote" },
];

const FEATURES = [
  { Icon: Camera, t: "HD & 4K Cameras", s: "Crisp footage day and night." },
  { Icon: Moon, t: "Night Vision", s: "Infrared cameras for low-light." },
  { Icon: Activity, t: "Motion Detection", s: "Smart alerts when it matters." },
  { Icon: Smartphone, t: "Mobile App Access", s: "View live feeds from anywhere." },
  { Icon: Cloud, t: "Cloud Recording", s: "Secure backup of footage." },
  { Icon: ShieldCheck, t: "Professional Install", s: "Clean wiring, neat finishing." },
];

function CctvPage() {
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
              Protect what matters with <span className="text-[color:var(--accent)]">professional CCTV.</span>
            </h1>
            <p className="mt-5 max-w-lg text-background/75 md:text-lg">
              Supply and installation of CCTV systems for homes, offices, schools and businesses across
              Nairobi and Kenya — with mobile app access and remote monitoring.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quote" className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground">Request a quote <ArrowRight className="h-4 w-4" /></a>
              <a href="https://wa.me/254726548592" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 text-sm font-semibold text-accent-foreground">
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">CCTV Packages</h2>
        <p className="mt-2 text-sm text-muted-foreground">Right-sized solutions for every space. All packages include installation and setup.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.best}</p>
              <div className="mt-4 text-sm font-semibold text-foreground">{p.cams}</div>
              <div className="mt-1 text-[color:var(--accent)] font-bold">{p.from}</div>
              <a href="#quote" className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">Request quote</a>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What's included</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background"><f.Icon className="h-5 w-5" /></span>
              <h3 className="mt-4 text-base font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.s}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="quote" className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-secondary p-8 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Get a CCTV quote</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tell us about your space and we'll get back with a tailored proposal.</p>
          <QuoteForm defaultService="CCTV Installation" />
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Prefer to call? <a href="tel:+254726548592" className="font-semibold text-foreground"><Phone className="inline h-3.5 w-3.5" /> 0726 548 592</a>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 text-center">
        <Link to="/live-streaming" className="text-sm font-semibold text-foreground hover:underline">Also explore our Live Streaming services →</Link>
      </div>
    </div>
  );
}
