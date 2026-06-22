import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Download, Printer, Upload, FileText, Clock, MapPin, CheckCircle2, XCircle } from "lucide-react";
import { getMyOrder } from "@/lib/orders.functions";
import { submitPaymentProof, getProofSignedUrl } from "@/lib/payments.functions";
import { Btn, Field, Input, StatusPill } from "@/components/admin/ui";
import { formatPrice } from "@/lib/format";
import { useBusinessSettings } from "@/lib/use-business-settings";
import { downloadReceiptPdf, printReceiptPdf, type ReceiptOrder } from "@/lib/receipt";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/account/orders/$id")({
  head: () => ({ meta: [{ title: "Order — Favour Computer Services" }] }),
  component: OrderDetail,
});

type Data = Awaited<ReturnType<typeof getMyOrder>>;

function OrderDetail() {
  const { id } = Route.useParams();
  const fetchOrder = useServerFn(getMyOrder);
  const submitProof = useServerFn(submitPaymentProof);
  const signFn = useServerFn(getProofSignedUrl);
  const settings = useBusinessSettings();
  const { user } = useAuth();
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState(false);
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const reload = () => fetchOrder({ data: { id } }).then(setData).catch((e) => toast.error((e as Error).message));
  useEffect(() => { void reload(); /* eslint-disable-line */ }, [id]);

  if (!data) return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  const { order, payments, notifications } = data;
  const items = (Array.isArray(order.items) ? order.items : []) as Array<{ name: string; qty: number; price: number }>;

  const receipt: ReceiptOrder = {
    id: order.id, invoice_number: order.invoice_number, created_at: order.created_at,
    customer_name: order.customer_name, customer_email: order.customer_email, customer_phone: order.customer_phone,
    fulfillment: order.fulfillment, delivery_address: order.delivery_address, total: Number(order.total),
    subtotal: Number(order.subtotal), status: order.status ?? "pending", payment_status: order.payment_status ?? undefined,
    reservation_number: order.reservation_number, pickup_code: order.pickup_code, items,
  };
  const biz = {
    name: settings?.business_name ?? "Favour Computer Services",
    address: settings?.address ?? "F&F Building, Shop U13, Next to Odeon Cinema, Nairobi",
    phone: settings?.phone ?? "0726 548 592",
    email: settings?.email ?? "bensonmurage254@gmail.com",
    till_number: settings?.till_number, paybill_number: settings?.paybill_number, account_number: settings?.account_number,
  };

  const upload = async (file: File, amount: number, method: string, reference: string) => {
    if (!user) return;
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase();
    const path = `${user.id}/${order.id}/${Date.now()}.${ext}`;
    setBusy(true);
    try {
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      await submitProof({ data: { order_id: order.id, amount, method, reference, proof_path: path, proof_mime: file.type } });
      toast.success("Payment proof submitted — awaiting verification");
      await reload();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const viewProof = async (path: string) => {
    if (proofUrls[path]) { window.open(proofUrls[path], "_blank"); return; }
    const { url } = await signFn({ data: { path } });
    setProofUrls((m) => ({ ...m, [path]: url }));
    window.open(url, "_blank");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/account/orders" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground">← My Orders</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.invoice_number ?? `#${order.id.slice(0,8).toUpperCase()}`}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Placed {new Date(order.created_at).toLocaleString("en-KE")}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={() => printReceiptPdf(receipt, biz)}><Printer className="mr-1 h-3.5 w-3.5" />Print</Btn>
          <Btn variant="secondary" onClick={() => downloadReceiptPdf(receipt, biz, "invoice")}><FileText className="mr-1 h-3.5 w-3.5" />Invoice</Btn>
          <Btn onClick={() => downloadReceiptPdf(receipt, biz, "receipt")}><Download className="mr-1 h-3.5 w-3.5" />Receipt</Btn>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <StatusPill tone={order.payment_status === "paid" ? "success" : order.payment_status === "awaiting_verification" ? "warn" : "danger"}>
          Payment: {(order.payment_status ?? "unpaid").replace(/_/g," ")}
        </StatusPill>
        <StatusPill tone="info">Status: {order.status ?? "pending"}</StatusPill>
        <StatusPill tone="default">Fulfillment: {order.fulfillment}</StatusPill>
        {order.reservation_number && <StatusPill tone="info">Reservation: {order.reservation_number}</StatusPill>}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-base font-bold">Items</h2>
          <ul className="mt-3 divide-y divide-border text-sm">
            {items.map((it, i) => (
              <li key={i} className="flex justify-between py-2">
                <span>{it.name} <span className="text-xs text-muted-foreground">× {it.qty}</span></span>
                <span className="font-semibold">{formatPrice(it.price * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 h-px bg-border" />
          <div className="mt-3 flex justify-between text-base font-bold"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>

          <h2 className="mt-8 text-base font-bold">Timeline</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 text-muted-foreground" /><span>{new Date(order.created_at).toLocaleString("en-KE")} — Order placed</span></li>
            {notifications.map((n, i) => (
              <li key={i} className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 text-muted-foreground" /><span>{new Date(n.created_at).toLocaleString("en-KE")} — {n.subject}</span></li>
            ))}
          </ul>
        </section>

        <aside className="space-y-4">
          {order.fulfillment === "pickup" && (
            <div className="rounded-2xl border border-border bg-card p-5 text-sm">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-[color:var(--accent)]" /><div>
                <div className="font-semibold">Pickup at our shop</div>
                <div className="text-muted-foreground">{settings?.pickup_location ?? "F&F Building, Shop U13, Nairobi"}</div>
                {order.reservation_number && <div className="mt-2">Reservation: <span className="font-mono font-bold">{order.reservation_number}</span></div>}
                {order.pickup_code && <div>Pickup code: <span className="font-mono font-bold">{order.pickup_code}</span></div>}
              </div></div>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold">Pay & upload proof</h3>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {settings?.till_number && <div>M-Pesa Till: <span className="font-mono font-semibold text-foreground">{settings.till_number}</span></div>}
              {settings?.paybill_number && <div>M-Pesa Paybill: <span className="font-mono font-semibold text-foreground">{settings.paybill_number}</span>{settings.account_number ? ` · Account ${settings.account_number}` : ""}</div>}
              {settings?.payment_instructions && <p className="mt-1">{settings.payment_instructions}</p>}
            </div>

            <form className="mt-4 space-y-2" onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const file = fileRef.current?.files?.[0];
              if (!file) { toast.error("Choose a proof file"); return; }
              await upload(file, Number(fd.get("amount") ?? 0), String(fd.get("method") ?? "M-Pesa"), String(fd.get("reference") ?? ""));
              (e.currentTarget as HTMLFormElement).reset();
              if (fileRef.current) fileRef.current.value = "";
            }}>
              <Field label="Amount (KES)"><Input name="amount" type="number" min={0} step={1} defaultValue={Number(order.total)} required /></Field>
              <Field label="Method"><Input name="method" defaultValue="M-Pesa" /></Field>
              <Field label="Reference / Transaction code"><Input name="reference" placeholder="e.g. SLM7XYZ12" /></Field>
              <Field label="Proof (JPG, PNG, WEBP or PDF)">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required
                  className="block w-full text-xs file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:px-3 file:py-2 file:text-xs file:font-semibold file:text-background" />
              </Field>
              <Btn type="submit" disabled={busy} className="w-full !h-10"><Upload className="mr-1 h-3.5 w-3.5" />{busy ? "Uploading…" : "Submit proof"}</Btn>
            </form>
          </div>

          {payments.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold">Payment history</h3>
              <ul className="mt-3 space-y-3 text-sm">
                {payments.map((p) => (
                  <li key={p.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>{new Date(p.created_at).toLocaleString("en-KE")}</span>
                      {p.status === "approved" ? <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Approved</span>
                        : p.status === "rejected" ? <span className="inline-flex items-center gap-1 font-semibold text-rose-600"><XCircle className="h-3.5 w-3.5" />Rejected</span>
                        : <span className="font-semibold text-amber-600">Pending</span>}
                    </div>
                    <div className="mt-1">{formatPrice(Number(p.amount))} · {p.method || "M-Pesa"}{p.reference ? ` · ${p.reference}` : ""}</div>
                    {p.admin_notes && <div className="mt-1 text-xs text-muted-foreground">Note: {p.admin_notes}</div>}
                    {p.proof_path && <button type="button" onClick={() => viewProof(p.proof_path!)} className="mt-2 text-xs font-semibold underline">View uploaded proof</button>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}