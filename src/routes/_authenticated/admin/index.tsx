import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/admin-shell";
import { listAdminProducts } from "@/lib/admin-crud.functions";
import { listQuotes, listBookings } from "@/lib/quotes.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const lp = useServerFn(listAdminProducts);
  const lq = useServerFn(listQuotes);
  const lb = useServerFn(listBookings);

  const products = useQuery({ queryKey: ["adm", "products"], queryFn: () => lp({}) });
  const quotes = useQuery({ queryKey: ["adm", "quotes"], queryFn: () => lq({}) });
  const bookings = useQuery({ queryKey: ["adm", "bookings"], queryFn: () => lb({}) });

  const prods = products.data ?? [];
  const qs = quotes.data ?? [];
  const bs = bookings.data ?? [];
  const lowStock = prods.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3).length;
  const outOfStock = prods.filter((p) => (p.stock ?? 0) === 0).length;
  const newQuotes = qs.filter((q) => q.status === "new").length;
  const newBookings = bs.filter((b) => b.status === "new").length;

  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total products" value={prods.length} />
        <Stat label="Out of stock" value={outOfStock} tone={outOfStock ? "warn" : "ok"} />
        <Stat label="Low stock" value={lowStock} tone={lowStock ? "warn" : "ok"} />
        <Stat label="Open quotes" value={newQuotes} tone={newQuotes ? "warn" : "ok"} />
        <Stat label="New bookings" value={newBookings} tone={newBookings ? "warn" : "ok"} />
        <Stat label="Total quotes" value={qs.length} />
        <Stat label="Total bookings" value={bs.length} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Latest quote requests">
          <ul className="divide-y divide-border">
            {qs.slice(0, 6).map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <div className="font-semibold">
                    {q.name} <span className="text-xs text-muted-foreground">· {q.source}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {q.email} · {q.phone}
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase">
                  {q.status}
                </span>
              </li>
            ))}
            {qs.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">No quotes yet.</li>
            )}
          </ul>
        </Panel>
        <Panel title="Latest bookings">
          <ul className="divide-y divide-border">
            {bs.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <div>
                  <div className="font-semibold">
                    {b.name}{" "}
                    <span className="text-xs text-muted-foreground">
                      · {b.event_type || "Event"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {b.event_date ?? "TBD"} · {b.event_location}
                  </div>
                </div>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold uppercase">
                  {b.status}
                </span>
              </li>
            ))}
            {bs.length === 0 && (
              <li className="py-2 text-sm text-muted-foreground">No bookings yet.</li>
            )}
          </ul>
        </Panel>
      </div>
    </AdminShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-2xl font-bold ${tone === "warn" ? "text-[color:var(--destructive)]" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}
