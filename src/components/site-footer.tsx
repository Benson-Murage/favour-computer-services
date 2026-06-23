import { Link } from "@tanstack/react-router";
import { Cpu, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Youtube, Twitter, MessageCircle } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { useBusinessSettings } from "@/lib/use-business-settings";

export function SiteFooter() {
  const s = useBusinessSettings();
  const name = s?.company_name || "Favour Computer Services";
  const desc = s?.business_description || s?.tagline || "Your trusted technology partner in Nairobi — computers, CCTV installation, and live streaming services.";
  const address = s?.address || "F&F Building, Shop U13\nNext to Odeon Cinema, Nairobi";
  const phone = s?.phone || "0726 548 592";
  const email = s?.email || "bensonmurage254@gmail.com";
  const wa = s?.whatsapp_url || (s?.whatsapp ? `https://wa.me/${s.whatsapp.replace(/\D/g, "")}` : "https://wa.me/254726548592");
  const socials = [
    { url: s?.facebook_url, Icon: Facebook, label: "Facebook" },
    { url: s?.instagram_url, Icon: Instagram, label: "Instagram" },
    { url: s?.tiktok_url, Icon: MessageCircle, label: "TikTok" },
    { url: s?.twitter_url, Icon: Twitter, label: "X" },
    { url: s?.linkedin_url, Icon: Linkedin, label: "LinkedIn" },
    { url: s?.youtube_url, Icon: Youtube, label: "YouTube" },
  ].filter((x) => x.url);
  return (
    <footer className="mt-20 border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-background text-foreground">
              <Cpu className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold tracking-tight">{name}</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-background/60">{desc}</p>
          <ul className="mt-5 space-y-2 text-sm text-background/70">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[color:var(--accent)]" /> <span className="whitespace-pre-line">{address}</span></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[color:var(--accent)]" /> <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-background">{phone}</a></li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[color:var(--accent)]" /> <a href={`mailto:${email}`} className="hover:text-background break-all">{email}</a></li>
          </ul>
          {socials.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socials.map(({ url, Icon, label }) => (
                <a key={label} href={url!} target="_blank" rel="noreferrer" aria-label={label}
                   className="grid h-9 w-9 place-items-center rounded-full border border-background/20 text-background/70 transition hover:bg-background/10 hover:text-background">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>
        <FooterCol title="Shop" links={[
          { label: "All Products", to: "/shop" },
          { label: "Laptops", to: "/shop", search: { category: "laptops" } },
          { label: "Desktops", to: "/shop", search: { category: "desktops" } },
          { label: "Phones", to: "/shop", search: { category: "phones" } },
          { label: "Accessories", to: "/shop", search: { category: "accessories" } },
          { label: "Refurbished", to: "/shop", search: { condition: "refurb" } },
        ]} />
        <FooterCol title="Services" links={[
          { label: "CCTV Installation", to: "/cctv" },
          { label: "Live Streaming", to: "/live-streaming" },
          { label: "About Us", to: "/about" },
          { label: "Contact", to: "/contact" },
        ]} />
        <div>
          <h4 className="text-sm font-semibold">Get a Quote</h4>
          <p className="mt-3 text-sm text-background/60">Talk to us about devices, CCTV, or streaming for your event.</p>
          <div className="mt-4 flex flex-col gap-2">
            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center rounded-full bg-[color:var(--accent)] px-4 text-sm font-semibold text-accent-foreground">
              Chat on WhatsApp
            </a>
            <Link to="/contact" className="inline-flex h-10 items-center justify-center rounded-full border border-background/30 px-4 text-sm font-semibold text-background hover:bg-background/10">
              Request a quote
            </Link>
          </div>
          <NewsletterForm source="footer" dark />
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-background/50 sm:flex-row">
          <span>© {new Date().getFullYear()} {name}. All rights reserved.</span>
          <span>Privacy · Terms · Accessibility</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; to: string; search?: Record<string, string> }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} search={l.search} className="text-background/60 transition hover:text-background">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}