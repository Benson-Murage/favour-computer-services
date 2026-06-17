import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Search, ShoppingBag, User, Zap, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Shop", to: "/shop", search: {} as Record<string, string> },
  { label: "Laptops", to: "/shop", search: { category: "laptops" } },
  { label: "Desktops", to: "/shop", search: { category: "desktops" } },
  { label: "Phones", to: "/shop", search: { category: "phones" } },
  { label: "Components", to: "/shop", search: { category: "storage" } },
  { label: "Accessories", to: "/shop", search: { category: "accessories" } },
  { label: "Refurbished", to: "/shop", search: { condition: "refurb" } },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-transparent transition-all",
        scrolled ? "border-border bg-background/85 backdrop-blur-xl" : "bg-background",
      )}
    >
      <div className="border-b border-border/60 bg-foreground text-background">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center gap-2 px-4 text-[11px] font-medium tracking-wide">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
          Free 2-day shipping on orders over $99 · Certified refurbished with 1-year warranty
        </div>
      </div>

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background">
            <Zap className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-tight">Voltline</span>
        </Link>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            nav({ to: "/shop", search: { q } });
          }}
          className="ml-4 hidden flex-1 md:flex"
        >
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search laptops, phones, components…"
              className="h-10 w-full rounded-full border border-border bg-secondary pl-10 pr-4 text-sm outline-none ring-ring/30 transition focus:bg-background focus:ring-2"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1">
          <Link
            to="/wishlist"
            className="hidden h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary md:grid"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            to="/account"
            className="hidden h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary md:grid"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[color:var(--accent)] px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-foreground transition hover:bg-secondary md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <div className="hidden border-t border-border/60 md:block">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-4 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              search={n.search}
              className="rounded-full px-3 py-1.5 font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="flex flex-col p-4">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={n.search}
                className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                {n.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border" />
            <Link to="/wishlist" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">
              Wishlist
            </Link>
            <Link to="/account" className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-secondary">
              Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}