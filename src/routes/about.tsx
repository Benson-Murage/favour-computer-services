import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Target, Eye, MapPin, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Favour Computer Services Nairobi" },
      { name: "description", content: "Favour Computer Services is a trusted Nairobi-based technology company providing computers, electronics, CCTV solutions and live streaming services." },
      { property: "og:title", content: "About Favour Computer Services" },
      { property: "og:description", content: "Trusted Nairobi technology partner for computers, CCTV and live streaming." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-5xl px-4 py-20 text-background md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur">
            About us
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            Trusted technology, <span className="text-[color:var(--accent)]">built around you.</span>
          </h1>
          <p className="mt-5 max-w-3xl text-base text-background/75 md:text-lg">
            Favour Computer Services is a Nairobi-based technology company dedicated to providing quality
            computers, electronics, CCTV solutions and professional technology services to individuals,
            businesses, schools and organizations across Kenya.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card Icon={Award} title="Our Story" body="Started in the heart of Nairobi, Favour Computer Services has grown into a one-stop shop for genuine devices, professional CCTV installation, and reliable live streaming for events of every size." />
          <Card Icon={Target} title="Our Mission" body="To provide reliable technology products and services that empower customers through innovation, quality and exceptional support." />
          <Card Icon={Eye} title="Our Vision" body="To become one of Kenya's most trusted technology solution providers." />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 rounded-3xl border border-border bg-secondary p-8 md:grid-cols-3 md:p-10">
          <Info Icon={MapPin} t="Visit our shop" s="F&F Building, Shop U13, next to Odeon Cinema, Nairobi" />
          <Info Icon={Phone} t="Call or WhatsApp" s="0726 548 592" href="tel:+254726548592" />
          <Info Icon={Mail} t="Email us" s="bensonmurage254@gmail.com" href="mailto:bensonmurage254@gmail.com" />
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="inline-flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background">Shop products</Link>
          <Link to="/contact" className="inline-flex h-11 items-center rounded-full border border-border bg-background px-5 text-sm font-semibold">Contact us</Link>
        </div>
      </section>
    </div>
  );
}

function Card({ Icon, title, body }: { Icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-foreground text-background"><Icon className="h-5 w-5" /></span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
function Info({ Icon, t, s, href }: { Icon: React.ComponentType<{ className?: string }>; t: string; s: string; href?: string }) {
  const inner = (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-background"><Icon className="h-4 w-4" /></span>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t}</div>
        <div className="text-sm font-semibold text-foreground">{s}</div>
      </div>
    </div>
  );
  return href ? <a href={href} className="block">{inner}</a> : <div>{inner}</div>;
}