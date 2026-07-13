import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Video, Mic, Camera, Wifi, Youtube, ArrowRight, MessageCircle, Check } from "lucide-react";
import { LiveStreamBookingForm } from "@/components/booking-form";
import { getPublicServicePackages } from "@/lib/services-public.functions";

export const Route = createFileRoute("/live-streaming")({
  head: () => ({
    meta: [
      { title: "Live Streaming Services Nairobi — Favour Computer Services" },
      {
        name: "description",
        content:
          "Multi-camera live streaming for churches, conferences, weddings and corporate events in Nairobi. YouTube, Facebook Live and custom platforms.",
      },
      { property: "og:title", content: "Live Streaming Services in Nairobi" },
      {
        property: "og:description",
        content: "Professional live streaming for events, churches and conferences across Kenya.",
      },
      { property: "og:url", content: "/live-streaming" },
    ],
    links: [{ rel: "canonical", href: "/live-streaming" }],
  }),
  component: StreamingPage,
});

const EVENTS = [
  "Church Services",
  "Conferences",
  "Weddings",
  "Corporate Events",
  "Concerts",
  "Product Launches",
];

function StreamingPage() {
  const fn = useServerFn(getPublicServicePackages);
  const { data } = useQuery({
    queryKey: ["pub", "pkg", "ls"],
    queryFn: () => fn({ data: "livestream" }),
  });
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
              <Video className="h-3.5 w-3.5" /> Live Streaming
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Broadcast your event in{" "}
              <span className="text-[color:var(--accent)]">crystal-clear quality.</span>
            </h1>
            <p className="mt-5 max-w-lg text-background/75 md:text-lg">
              Professional multi-camera live streaming for churches, conferences, weddings, concerts
              and corporate events — on YouTube, Facebook Live or any platform you choose.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#book"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-background px-6 text-sm font-semibold text-foreground"
              >
                Book streaming <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/254726548592"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--accent)] px-6 text-sm font-semibold text-accent-foreground"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Events we cover</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {EVENTS.map((e) => (
            <span
              key={e}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium"
            >
              {e}
            </span>
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
          {packages.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]"
            >
              <h3 className="text-lg font-semibold">{p.name}</h3>
              {p.tagline && <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>}
              {p.price_label && (
                <div className="mt-4 text-[color:var(--accent)] font-bold">{p.price_label}</div>
              )}
              {(p.features ?? []).length > 0 && (
                <ul className="mt-4 space-y-1.5 text-sm text-foreground">
                  {(p.features ?? []).map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />{" "}
                      {f}
                    </li>
                  ))}
                </ul>
              )}
              <a href="#book" className="mt-auto pt-5">
                <span className="inline-flex h-10 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  Book now
                </span>
              </a>
            </div>
          ))}
        </div>
      </section>

      <section id="book" className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-secondary p-8 md:p-10">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Book a live stream</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Share your event details and we'll respond with a quote and availability.
          </p>
          <div className="mt-6">
            <LiveStreamBookingForm packages={packages} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-16 text-center">
        <Link to="/cctv" className="text-sm font-semibold text-foreground hover:underline">
          Need security cameras too? See our CCTV services →
        </Link>
      </div>
    </div>
  );
}

function Eq({
  Icon,
  t,
  s,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  t: string;
  s: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-semibold">{t}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{s}</p>
    </div>
  );
}
