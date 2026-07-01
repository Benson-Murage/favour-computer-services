import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, Select, StatusPill } from "@/components/admin/ui";
import { confirmAction } from "@/components/admin/confirm";
import { listOrders, updateOrderStatus } from "@/lib/admin-crud.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/orders")({ component: OrdersPage });
const STATUSES = ["pending","paid","ready","picked_up","delivered","cancelled"] as const;

type Order = { id: string; created_at: string; customer_name: string; customer_email: string; customer_phone: string; fulfillment: string; total: number; status: typeof STATUSES[number]; reservation_number: string | null; pickup_code: string | null; items: Array<{ name: string; qty: number; price: number }> };

function OrdersPage() {
  const qc = useQueryClient();
  const lo = useServerFn(listOrders);
  const upd = useServerFn(updateOrderStatus);
  const { data } = useQuery({ queryKey: ["adm","orders"], queryFn: () => lo({}) });
  return (
    <AdminShell title="Orders">
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Method</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((data ?? []) as unknown as Order[]).map((o) => (
              <tr key={o.id}>
                <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                <td className="p-3"><div className="font-semibold">{o.customer_name}</div><div className="text-xs text-muted-foreground">{o.customer_phone}</div></td>
                <td className="p-3 text-xs">{o.fulfillment}{o.reservation_number ? <div className="text-[10px] text-muted-foreground">{o.reservation_number}</div> : null}</td>
                <td className="p-3">{formatPrice(Number(o.total))}</td>
                <td className="p-3"><StatusPill tone={o.status==="cancelled"?"danger":o.status==="delivered"||o.status==="picked_up"?"success":"info"}>{o.status}</StatusPill></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                  <Link to="/receipts/$id" params={{ id: o.id }} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold hover:bg-secondary">Receipt</Link>
                  <Select value={o.status} onChange={async (e)=>{
                    const next = e.target.value as typeof STATUSES[number];
                    const labels: Record<string,string> = { paid: "PAID", ready: "READY FOR PICKUP", picked_up: "PICKED UP", delivered: "DELIVERED", cancelled: "CANCELLED", pending: "PENDING" };
                    const ok = await confirmAction({
                      title: `Mark order as ${labels[next] ?? next.toUpperCase()}?`,
                      message: `${o.customer_name} · ${formatPrice(Number(o.total))}`,
                      confirmLabel: "Update status",
                      tone: next === "cancelled" ? "danger" : "primary",
                    });
                    if (!ok) { e.target.value = o.status; return; }
                    await upd({ data: { id: o.id, status: next } });
                    toast.success(`Order ${labels[next]?.toLowerCase() ?? next}`);
                    qc.invalidateQueries({ queryKey: ["adm","orders"] });
                  }}>
                    {STATUSES.map((s)=><option key={s} value={s}>{s}</option>)}
                  </Select>
                  </div>
                </td>
              </tr>
            ))}
            {(!data || data.length===0) && <tr><td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">No orders yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}

export const PickupsRoute = null;