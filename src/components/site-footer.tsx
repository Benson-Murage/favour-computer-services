import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-background text-foreground">
              <Zap className="h-5 w-5" strokeWidth={2.5} />
            </span>
            <span className="text-lg font-bold tracking-tight">Voltline</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-background/60">
            Premium new and certified-refurbished electronics. Tested, trusted, and shipped fast.
          </p>
        </div>
        <FooterCol title="Shop" links={[
          { label: "Laptops", to: "/shop", search: { category: "laptops" } },
          { label: "Desktops", to: "/shop", search: { category: "desktops" } },
          { label: "Phones", to: "/shop", search: { category: "phones" } },
          { label: "Refurbished", to: "/shop", search: { condition: "refurb" } },
        ]} />
        <FooterCol title="Support" links={[
          { label: "Contact", to: "/" },
          { label: "Shipping & Returns", to: "/" },
          { label: "Warranty", to: "/" },
          { label: "FAQ", to: "/" },
        ]} />
        <div>
          <h4 className="text-sm font-semibold">Stay in the loop</h4>
          <p className="mt-3 text-sm text-background/60">Deals, drops, and refurbished restocks.</p>
          <form className="mt-4 flex gap-2">
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="h-10 flex-1 rounded-full border border-background/20 bg-background/10 px-4 text-sm text-background placeholder:text-background/50 outline-none focus:border-[color:var(--accent)]"
            />
            <button className="h-10 rounded-full bg-[color:var(--accent)] px-4 text-sm font-semibold text-accent-foreground transition hover:opacity-90">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-background/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-background/50 sm:flex-row">
          <span>© {new Date().getFullYear()} Voltline. All rights reserved.</span>
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