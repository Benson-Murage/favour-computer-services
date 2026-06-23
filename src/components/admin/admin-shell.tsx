import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, Tags, Building2, Boxes, MessageSquare, CalendarCheck2, Store, Megaphone, Settings, ScrollText, ShoppingCart, Wallet, Mail, Newspaper, Users } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type NavEntry = { to: string; label: string; Icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavEntry[] = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Products", Icon: Package },
  { to: "/admin/categories", label: "Categories", Icon: Tags },
  { to: "/admin/brands", label: "Brands", Icon: Building2 },
  { to: "/admin/inventory", label: "Inventory", Icon: Boxes },
  { to: "/admin/orders", label: "Orders", Icon: ShoppingCart },
  { to: "/admin/payments", label: "Payments", Icon: Wallet },
  { to: "/admin/pickups", label: "Pickups", Icon: Store },
  { to: "/admin/quotes", label: "Quotes", Icon: MessageSquare },
  { to: "/admin/bookings", label: "Bookings", Icon: CalendarCheck2 },
  { to: "/admin/services", label: "Service Packages", Icon: Store },
  { to: "/admin/promotions", label: "Promotions", Icon: Megaphone },
  { to: "/admin/newsletter", label: "Newsletter", Icon: Newspaper },
  { to: "/admin/emails", label: "Email Center", Icon: Mail },
  { to: "/admin/users", label: "Users", Icon: Users },
  { to: "/admin/settings", label: "Business Settings", Icon: Settings },
  { to: "/admin/audit", label: "Audit Log", Icon: ScrollText },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-border bg-card p-3 lg:sticky lg:top-24">
        <div className="px-3 pb-3 pt-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Admin</div>
          <div className="text-sm font-bold">Favour Computer</div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <n.Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}