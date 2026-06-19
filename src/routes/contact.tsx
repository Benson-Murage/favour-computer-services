import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Favour Computer Services Nairobi" },
      { name: "description", content: "Contact Favour Computer Services in Nairobi. F&F Building, Shop U13 next to Odeon Cinema. Phone 0726 548 592, email bensonmurage254@gmail.com." },
      { property: "og:title", content: "Contact Favour Computer Services" },
      { property: "og:description", content: "Visit our Nairobi shop, call, WhatsApp or email us." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <div className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</span>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">We'd love to hear from you.</h1>
        <p className="mt-3 text-muted-foreground">
          Questions about a device, CCTV installation, or live streaming for your event? Reach out and our
          team will respond within one business day.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <aside className="space-y-4">
          <Box Icon={MapPin} t="Visit us" lines={["Favour Computer Services", "F&F Building, Shop U13", "Next to Odeon Cinema, Nairobi"]} />
          <Box Icon={Phone} t="Call or SMS" lines={["0726 548 592"]} href="tel:+254726548592" />
          <Box Icon={MessageCircle} t="WhatsApp" lines={["wa.me/254726548592"]} href="https://wa.me/254726548592" />
          <Box Icon={Mail} t="Email" lines={["bensonmurage254@gmail.com"]} href="mailto:bensonmurage254@gmail.com" />
          <Box Icon={Clock} t="Hours" lines={["Mon – Sat · 8:30 AM – 6:30 PM", "Sun · Closed"]} />
        </aside>

        <div className="rounded-3xl border border-border bg-secondary p-6 md:p-10">
          <h2 className="text-xl font-bold tracking-tight">Send us a message</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fill in the form and we'll get back to you.</p>
          <QuoteForm />
        </div>
      </div>
    </div>
  );
}

function Box({ Icon, t, lines, href }: { Icon: React.ComponentType<{ className?: string }>; t: string; lines: string[]; href?: string }) {
  const inner = (
    <div className="rounded-2xl border border-border bg-card p-5 transition hover:[box-shadow:var(--shadow-card)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background"><Icon className="h-4 w-4" /></span>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t}</div>
          {lines.map((l) => <div key={l} className="text-sm font-semibold text-foreground">{l}</div>)}
        </div>
      </div>
    </div>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block">{inner}</a> : inner;
}