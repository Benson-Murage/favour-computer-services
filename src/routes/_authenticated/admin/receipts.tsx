import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { FileText, Printer, Download, ExternalLink, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Input, Select, StatusPill } from "@/components/admin/ui";
import { listOrders, adminGetOrder } from "@/lib/admin-crud.functions";
import { getProofSignedUrl, adminListPayments } from "@/lib/payments.functions";
import { downloadReceiptPdf, printReceiptPdf, type ReceiptOrder } from "@/lib/receipt";
import { useBusinessSettings } from "@/lib/use-business-settings";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/receipts")({
  component: ReceiptsAdmin,
});

type OrderRow = Awaited<ReturnType<typeof listOrders>>[number];

function ReceiptsAdmin() {
  const lo = useServerFn(listOrders);
  const getOne = useServerFn(adminGetOrder);
  const lp = useServerFn(adminListPayments);
  const sign = useServerFn(getProofSignedUrl);
  const settings = useBusinessSettings();
  const { data } = useQuery({
    queryKey: ["adm", "orders"],
    queryFn: () => lo({}),
    refetchInterval: 20000,
  });
  const { data: payments } = useQuery({ queryKey: ["adm", "payments"], queryFn: () => lp({}) });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ((data ?? []) as OrderRow[]).filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!term) return true;
      return (
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_email?.toLowerCase().includes(term) ||
        o.customer_phone?.toLowerCase().includes(term) ||
        o.id.toLowerCase().includes(term) ||
        (o.invoice_number ?? "").toLowerCase().includes(term)
      );
    });
  }, [data, q, status]);

  const paymentsByOrder = useMemo(() => {
    const map = new Map<string, Awaited<ReturnType<typeof adminListPayments>>[number]>();
    (payments ?? []).forEach((p) => {
      if (!map.has(p.order_id)) map.set(p.order_id, p);
    });
    return map;
  }, [payments]);

  const biz = {
    name: settings?.company_name ?? "Favour Computer Services",
    address: settings?.address ?? "F&F Building, Shop U13, Next to Odeon Cinema, Nairobi",
    phone: settings?.phone ?? "0726 548 592",
    email: settings?.email ?? "bensonmurage254@gmail.com",
    till_number: settings?.till_number,
    paybill_number: settings?.paybill_number,
    account_number: settings?.account_number,
  };

  const toReceipt = (
    o: OrderRow,
    items: Array<{ name: string; qty: number; price: number }>,
  ): ReceiptOrder => ({
    id: o.id,
    invoice_number: o.invoice_number,
    created_at: o.created_at,
    customer_name: o.customer_name,
    customer_email: o.customer_email,
    customer_phone: o.customer_phone,
    fulfillment: o.fulfillment,
    delivery_address: o.delivery_address ?? null,
    total: Number(o.total),
    subtotal: Number(o.subtotal),
    status: o.status ?? "pending",
    payment_status: o.payment_status ?? undefined,
    reservation_number: o.reservation_number,
    pickup_code: o.pickup_code,
    items,
  });

  const fetchItems = async (id: string) => {
    const r = await getOne({ data: { id } });
    return Array.isArray(r.order.items)
      ? (r.order.items as Array<{ name: string; qty: number; price: number }>)
      : [];
  };

  const onDownload = async (o: OrderRow, kind: "receipt" | "invoice") => {
    try {
      const items = await fetchItems(o.id);
      await downloadReceiptPdf(toReceipt(o, items), biz, kind);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const onPrint = async (o: OrderRow) => {
    try {
      const items = await fetchItems(o.id);
      await printReceiptPdf(toReceipt(o, items), biz, "receipt");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };
  const onProof = async (orderId: string) => {
    const p = paymentsByOrder.get(orderId);
    if (!p?.proof_path) {
      toast.error("No payment proof uploaded");
      return;
    }
    try {
      const { url } = await sign({ data: { path: p.proof_path } });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="Receipts">
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by customer, email, phone, order #, invoice…"
              className="pl-9"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="ready">Ready</option>
            <option value="picked_up">Picked up</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <div className="text-xs text-muted-foreground">
            {rows.length} order{rows.length === 1 ? "" : "s"}
          </div>
        </div>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Total</th>
              <th className="p-3">Payment</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((o) => {
              const proof = paymentsByOrder.get(o.id);
              return (
                <tr key={o.id}>
                  <td className="p-3 text-xs">{new Date(o.created_at).toLocaleString("en-KE")}</td>
                  <td className="p-3">
                    <div className="font-mono text-xs font-semibold">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </div>
                    {o.invoice_number && (
                      <div className="text-[10px] text-muted-foreground">{o.invoice_number}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-semibold">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{o.customer_email}</div>
                  </td>
                  <td className="p-3 font-mono">{formatPrice(Number(o.total))}</td>
                  <td className="p-3">
                    <StatusPill
                      tone={
                        o.payment_status === "paid"
                          ? "success"
                          : o.payment_status === "refunded"
                            ? "danger"
                            : "warn"
                      }
                    >
                      {o.payment_status ?? "unpaid"}
                    </StatusPill>
                  </td>
                  <td className="p-3">
                    <StatusPill
                      tone={
                        o.status === "cancelled"
                          ? "danger"
                          : o.status === "delivered" || o.status === "picked_up"
                            ? "success"
                            : "info"
                      }
                    >
                      {o.status}
                    </StatusPill>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Link
                        to="/receipts/$id"
                        params={{ id: o.id }}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold hover:bg-secondary"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <FileText className="h-3 w-3" /> View
                      </Link>
                      <Btn variant="secondary" onClick={() => onPrint(o)}>
                        <Printer className="mr-1 h-3 w-3" />
                        Print
                      </Btn>
                      <Btn variant="secondary" onClick={() => onDownload(o, "receipt")}>
                        <Download className="mr-1 h-3 w-3" />
                        Receipt
                      </Btn>
                      <Btn variant="secondary" onClick={() => onDownload(o, "invoice")}>
                        <Download className="mr-1 h-3 w-3" />
                        Invoice
                      </Btn>
                      {proof?.proof_path && (
                        <Btn variant="secondary" onClick={() => onProof(o.id)}>
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Proof
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
