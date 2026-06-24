import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, StatusPill } from "@/components/admin/ui";
import { confirmAction } from "@/components/admin/confirm";
import { listOrders, updateOrderStatus } from "@/lib/admin-crud.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/pickups")({ component: PickupsPage });

type Order = { id: string; created_at: string; customer_name: string; customer_email: string; customer_phone: string; fulfillment: string; total: number; status: "pending"|"paid"|"ready"|"picked_up"|"delivered"|"cancelled"; reservation_number: string | null; pickup_code: string | null };

function PickupsPage() {
  const qc = useQueryClient();
  const lo = useServerFn(listOrders);
  const upd = useServerFn(updateOrderStatus);
  const { data } = useQuery({ queryKey: ["adm","orders"], queryFn: () => lo({}) });
  const rows = ((data ?? []) as Order[]).filter((o) => o.fulfillment === "pickup");
  const change = async (o: Order, status: Order["status"]) => {
    const titles: Record<string,string> = {
      ready: "Mark as READY for pickup?",
      picked_up: "Mark as PICKED UP?",
      cancelled: "Cancel this order?",
    };
    const successes: Record<string,string> = {
      ready: "Order marked as ready for pickup",
      picked_up: "Order marked as picked up",
      cancelled: "Order cancelled",
    };
    const ok = await confirmAction({
      title: titles[status] ?? `Set status to ${status}?`,
      message: `${o.customer_name} · ${o.reservation_number ?? o.id.slice(0,8)}`,
      confirmLabel: status === "cancelled" ? "Cancel order" : "Confirm",
      tone: status === "cancelled" ? "danger" : "primary",
    });
    if (!ok) return;
    await upd({ data: { id: o.id, status } });
    toast.success(successes[status] ?? "Status updated");
    qc.invalidateQueries({ queryKey: ["adm","orders"] });
  };
  return (
    <AdminShell title="Store Pickups">
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Reservation</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="p-3"><div className="font-mono font-semibold">{o.reservation_number}</div><div className="text-[10px] text-muted-foreground">Code · {o.pickup_code}</div></td>
                <td className="p-3"><div className="font-semibold">{o.customer_name}</div><div className="text-xs text-muted-foreground">{o.customer_phone}</div></td>
                <td className="p-3">{formatPrice(Number(o.total))}</td>
                <td className="p-3"><StatusPill tone={o.status==="cancelled"?"danger":o.status==="picked_up"?"success":"info"}>{o.status}</StatusPill></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Btn variant="primary" onClick={()=>change(o, "ready")}>Mark Ready</Btn>
                    <Btn variant="secondary" onClick={()=>change(o, "picked_up")}>Picked up</Btn>
                    <Btn variant="danger" onClick={()=>change(o, "cancelled")}>Cancel</Btn>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No pickup reservations.</td></tr>}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}