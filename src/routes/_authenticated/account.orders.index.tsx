import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMyOrders } from "@/lib/orders.functions";
import { formatPrice } from "@/lib/format";
import { StatusPill } from "@/components/admin/ui";
import { ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/account/orders/")({
  head: () => ({ meta: [{ title: "My Orders — Favour Computer Services" }] }),
  component: MyOrders,
});

type OrderRow = Awaited<ReturnType<typeof listMyOrders>>[number];

function MyOrders() {
  const fn = useServerFn(listMyOrders);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fn({}).then((r) => { setRows(r as OrderRow[]); setLoading(false); }).catch(() => setLoading(false)); }, [fn]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Account</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">My Orders</h1>
        </div>
        <Link to="/shop" className="text-sm font-semibold underline">Continue shopping</Link>
      </div>

      {loading ? (
        <div className="mt-12 text-center text-sm text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No orders yet. Place your first order from the shop.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => {
                const items = (Array.isArray(o.items) ? o.items : []) as Array<{ name: string; qty: number }>;
                return (
                  <tr key={o.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{o.invoice_number ?? o.id.slice(0,8).toUpperCase()}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-KE")}</td>
                    <td className="px-4 py-3">{items.reduce((s,i)=>s+i.qty,0)} item{items.reduce((s,i)=>s+i.qty,0)===1?"":"s"}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(Number(o.total))}</td>
                    <td className="px-4 py-3"><PaymentBadge s={o.payment_status} /></td>
                    <td className="px-4 py-3"><StatusBadge s={o.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link to="/account/orders/$id" params={{ id: o.id }} className="text-xs font-semibold underline">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PaymentBadge({ s }: { s: string | null }) {
  const tone = s === "paid" ? "success" : s === "awaiting_verification" ? "warn" : s === "refunded" ? "info" : "danger";
  return <StatusPill tone={tone}>{(s ?? "unpaid").replace(/_/g," ")}</StatusPill>;
}
function StatusBadge({ s }: { s: string | null }) {
  const map: Record<string, "default"|"success"|"warn"|"danger"|"info"> = { pending:"warn", paid:"info", ready:"info", picked_up:"success", delivered:"success", cancelled:"danger" };
  return <StatusPill tone={map[s ?? ""] ?? "default"}>{s ?? "—"}</StatusPill>;
}