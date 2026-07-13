import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Input, Select, StatusPill } from "@/components/admin/ui";
import { confirmAction } from "@/components/admin/confirm";
import { listOrders, updateOrderStatus } from "@/lib/admin-crud.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/pickups")({ component: PickupsPage });

type Order = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfillment: string;
  total: number;
  status: "pending" | "paid" | "ready" | "picked_up" | "delivered" | "cancelled";
  payment_status: "unpaid" | "awaiting_verification" | "paid" | "refunded" | null;
  reservation_number: string | null;
  pickup_code: string | null;
};

const STATUS_OPTIONS = ["all", "pending", "paid", "ready", "picked_up", "cancelled"] as const;
const PAYMENT_OPTIONS = ["all", "unpaid", "awaiting_verification", "paid", "refunded"] as const;

function PickupsPage() {
  const qc = useQueryClient();
  const lo = useServerFn(listOrders);
  const upd = useServerFn(updateOrderStatus);
  const { data } = useQuery({ queryKey: ["adm", "orders"], queryFn: () => lo({}) });
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [payment, setPayment] = useState<(typeof PAYMENT_OPTIONS)[number]>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");

  const rows = useMemo(() => {
    const list = ((data ?? []) as Order[]).filter((o) => o.fulfillment === "pickup");
    const filtered = list.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (payment !== "all" && (o.payment_status ?? "unpaid") !== payment) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay =
          `${o.customer_name} ${o.customer_email} ${o.customer_phone} ${o.reservation_number ?? ""} ${o.pickup_code ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const created = new Date(o.created_at).getTime();
      if (dateFrom && created < new Date(dateFrom).getTime()) return false;
      if (dateTo && created > new Date(dateTo).getTime() + 86400000) return false;
      return true;
    });
    filtered.sort((a, b) =>
      sort === "new"
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    return filtered;
  }, [data, status, payment, search, dateFrom, dateTo, sort]);
  const change = async (o: Order, status: Order["status"]) => {
    const titles: Record<string, string> = {
      ready: "Mark as READY for pickup?",
      picked_up: "Mark as PICKED UP?",
      cancelled: "Cancel this order?",
    };
    const successes: Record<string, string> = {
      ready: "Order marked as ready for pickup",
      picked_up: "Order marked as picked up",
      cancelled: "Order cancelled",
    };
    const ok = await confirmAction({
      title: titles[status] ?? `Set status to ${status}?`,
      message: `${o.customer_name} · ${o.reservation_number ?? o.id.slice(0, 8)}`,
      confirmLabel: status === "cancelled" ? "Cancel order" : "Confirm",
      tone: status === "cancelled" ? "danger" : "primary",
    });
    if (!ok) return;
    await upd({ data: { id: o.id, status } });
    toast.success(successes[status] ?? "Status updated");
    qc.invalidateQueries({ queryKey: ["adm", "orders"] });
  };
  return (
    <AdminShell title="Store Pickups">
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              Status: {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Select
          value={payment}
          onChange={(e) => setPayment(e.target.value as (typeof PAYMENT_OPTIONS)[number])}
        >
          {PAYMENT_OPTIONS.map((s) => (
            <option key={s} value={s}>
              Payment: {s.replace(/_/g, " ")}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Search customer / reservation"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        <Select value={sort} onChange={(e) => setSort(e.target.value as "new" | "old")}>
          <option value="new">Newest first</option>
          <option value="old">Oldest first</option>
        </Select>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Reservation</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="p-3">
                  <div className="font-mono font-semibold">{o.reservation_number}</div>
                  <div className="text-[10px] text-muted-foreground">Code · {o.pickup_code}</div>
                </td>
                <td className="p-3">
                  <div className="font-semibold">{o.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{o.customer_phone}</div>
                </td>
                <td className="p-3">{formatPrice(Number(o.total))}</td>
                <td className="p-3">
                  <StatusPill
                    tone={
                      o.status === "cancelled"
                        ? "danger"
                        : o.status === "picked_up"
                          ? "success"
                          : "info"
                    }
                  >
                    {o.status}
                  </StatusPill>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1 justify-end">
                    <Btn variant="primary" onClick={() => change(o, "ready")}>
                      Mark Ready
                    </Btn>
                    <Btn variant="secondary" onClick={() => change(o, "picked_up")}>
                      Picked up
                    </Btn>
                    <Btn variant="danger" onClick={() => change(o, "cancelled")}>
                      Cancel
                    </Btn>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">
                  No pickup reservations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
