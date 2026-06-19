import { createFileRoute, Link } from "@tanstack/react-router";
import { Video, Mic, Camera, Wifi, Youtube, Facebook, ArrowRight, MessageCircle } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";

export const Route = createFileRoute("/live-streaming")({
  head: () => ({
    meta: [
      { title: "Live Streaming Services Nairobi — Favour Computer Services" },
      { name: "description", content: "Multi-camera live streaming for churches, conferences, weddings and corporate events in Nairobi. YouTube, Facebook Live and custom platforms." },
      { property: "og:title", content: "Live Streaming Services in Nairobi" },
      { property: "og:description", content: "Professional live streaming for events, churches and conferences across Kenya." },
      { property: "og:url", content: "/live-streaming" },
    ],
    links: [{ rel: "canonical", href: "/live-streaming" }],
  }),
  component: StreamingPage,
});

const PACKAGES = [
  { name: "Single Camera", best: "Small services, webinars", from: "From KSh 15,000 / event", inc: ["1 HD camera", "Audio mix", "1 streaming platform"] },
  { name: "Multi-Camera Pro", best: "Churches, conferences, weddings", from: "From KSh 35,000 / event", inc: ["3 HD cameras", "Live switching", "Multi-platform stream"] },
  { name: "Premium Event", best: "Concerts, product launches", from: "Custom quote", inc: ["4+ cameras", "Lower thirds & overlays", "Recording & highlights"] },
];

const EVENTS = ["Church Services", "Conferences", "Weddings", "Corporate Events", "Concerts", "Product Launches"];

function StreamingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 text-background md:grid-cols-2 md:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
              <Video className="h-3.5 w-3.5" /> Live Streaming
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Broadcast your event in <span className="text-[color:var(--accent)]">crystal-clear quality.</span>
            </h1>
            <p className="mt-5 max-w-lg text-background/75 md:text-lg">
              Professional multi-camera live streaming for churches, conferences, weddings, concerts and
              corporate events — on YouTube, Facebook Live or any platform you choose.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#book" className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground">Book streaming <ArrowRight className="h-4 w-4" /></a>
              <a href="https://wa.me/254726548592" target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 text-sm font-semibold text-accent-foreground"><MessageCircle className="h-4 w-4" /> WhatsApp us</a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Events we cover</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {EVENTS.map((e) => (
            <span key={e} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">{e}</span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Equipment & setup</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Eq Icon={Camera} t="HD Cameras" s="Multi-cam setup with live switching." />
          <Eq Icon={Mic} t="Pro Audio" s="Wired and wireless mics, audio mixing." />
          <Eq Icon={Wifi} t="Reliable Internet" s="Bonded connections for stability." />
          <Eq Icon={Youtube} t="Multi-Platform" s="YouTube, Facebook, custom RTMP." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Streaming packages</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PACKAGES.map((p) => (
            <div key={p.name} className="rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.best}</p>
              <div className="mt-4 text-[color:var(--accent)] font-bold">{p.from}</div>
              <ul className="mt-4 space-y-1.5 text-sm text-foreground">
                {p.inc.map((i) => <li key={i}>• {i}</li>)}
              </ul>
              <a href="#book" className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">Book now</a>
            </div>
          ))}
        </div>
      </section>

      <section id="book" className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-secondary p-8 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Book a live stream</h2>
          <p className="mt-2 text-sm text-muted-foreground">Share your event details and we'll respond with a quote and availability.</p>
          <QuoteForm defaultService="Live Streaming" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 text-center">
        <Link to="/cctv" className="text-sm font-semibold text-foreground hover:underline">Need security cameras too? See our CCTV services →</Link>
      </div>
    </div>
  );
}

function Eq({ Icon, t, s }: { Icon: React.ComponentType<{ className?: string }>; t: string; s: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background"><Icon className="h-5 w-5" /></span>
      <h3 className="mt-4 text-base font-semibold">{t}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{s}</p>
    </div>
  );
}