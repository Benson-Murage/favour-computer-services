import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
import QRCode from "qrcode";
import { getMyOrder } from "@/lib/orders.functions";
import { adminGetOrder } from "@/lib/admin-crud.functions";
import { lookupProductSpecs } from "@/lib/verify.functions";
import { useBusinessSettings } from "@/lib/use-business-settings";
import { downloadReceiptPdf, printReceiptPdf, type ReceiptOrder } from "@/lib/receipt";
import { formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { Btn } from "@/components/admin/ui";
import logoAsset from "@/assets/fcs-logo.png.asset.json";

export const Route = createFileRoute("/receipts/$id")({
  head: () => ({ meta: [{ title: "Receipt — Favour Computer Services" }] }),
  component: ReceiptPreview,
});

type OrderShape = {
  id: string;
  invoice_number: string | null;
  verification_code?: string | null;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  fulfillment: string | null;
  delivery_address?: string | null;
  total: number | string;
  subtotal: number | string;
  status: string | null;
  payment_status: string | null;
  reservation_number: string | null;
  pickup_code: string | null;
  items: unknown;
};

type ProductSpec = {
  id: string;
  name: string;
  processor: string;
  ram: string;
  storage: string;
  warranty: string;
  condition: string;
};

function ReceiptPreview() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const getMine = useServerFn(getMyOrder);
  const getAdmin = useServerFn(adminGetOrder);
  const lookupSpecs = useServerFn(lookupProductSpecs);
  const settings = useBusinessSettings();
  const [order, setOrder] = useState<OrderShape | null>(null);
  const [payments, setPayments] = useState<
    Array<{
      status: string;
      amount: number;
      method: string | null;
      reference: string | null;
      created_at: string;
    }>
  >([]);
  const [kind, setKind] = useState<"receipt" | "invoice">("receipt");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [specs, setSpecs] = useState<Record<string, ProductSpec>>({});

  const load = useCallback(
    async (silent = false) => {
      try {
        const d = await getMine({ data: { id } });
        setOrder(d.order as unknown as OrderShape);
        setPayments(d.payments as never);
      } catch {
        try {
          const d = await getAdmin({ data: { id } });
          setOrder(d.order as unknown as OrderShape);
          setPayments(d.payments as never);
        } catch (e) {
          if (!silent) {
            toast.error((e as Error).message);
            nav({ to: "/" });
          }
        }
      }
    },
    [id, getMine, getAdmin, nav],
  );

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(true), 15000);
    const onFocus = () => void load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  const verificationCode = order?.verification_code ?? null;
  const verifyUrl = verificationCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/receipt/${verificationCode}`
    : "";

  useEffect(() => {
    if (!verifyUrl) {
      setQrDataUrl(null);
      return;
    }
    QRCode.toDataURL(verifyUrl, { margin: 1, width: 240, errorCorrectionLevel: "M" })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
  }, [verifyUrl]);

  // Load product spec lookup for line items
  useEffect(() => {
    if (!order) return;
    const ids = Array.isArray(order.items)
      ? (order.items as Array<{ product_id?: string }>)
          .map((i) => i?.product_id)
          .filter((v): v is string => typeof v === "string" && v.length === 36)
      : [];
    const unique = Array.from(new Set(ids));
    if (!unique.length) return;
    lookupSpecs({ data: { ids: unique } })
      .then((r) => {
        const map: Record<string, ProductSpec> = {};
        r.products.forEach((p) => {
          map[p.id] = p;
        });
        setSpecs(map);
      })
      .catch(() => {
        /* silent */
      });
  }, [order, lookupSpecs]);

  if (!order) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading receipt…</div>;
  }

  const items = (Array.isArray(order.items) ? order.items : []) as Array<{
    name: string;
    qty: number;
    price: number;
    product_id?: string;
  }>;
  const total = Number(order.total);
  const subtotal = Number(order.subtotal);
  const receipt: ReceiptOrder = {
    id: order.id,
    invoice_number: order.invoice_number,
    created_at: order.created_at,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    fulfillment: order.fulfillment,
    delivery_address: order.delivery_address ?? null,
    total,
    subtotal,
    status: order.status ?? "pending",
    payment_status: order.payment_status ?? undefined,
    reservation_number: order.reservation_number,
    pickup_code: order.pickup_code,
    items,
    verification_code: order.verification_code ?? undefined,
    verify_url: verifyUrl || undefined,
    qr_data_url: qrDataUrl ?? undefined,
    product_specs: specs,
  };
  const biz = {
    name: settings?.company_name ?? "Favour Computer Services",
    address: settings?.address ?? "F&F Building, Shop U13, Next to Odeon Cinema, Nairobi",
    phone: settings?.phone ?? "0726 548 592",
    email: settings?.email ?? "bensonmurage254@gmail.com",
    till_number: settings?.till_number,
    paybill_number: settings?.paybill_number,
    account_number: settings?.account_number,
    signature_url: settings?.signature_url ?? null,
    stamp_url: settings?.stamp_url ?? null,
    signatory_name: settings?.signatory_name ?? null,
    signatory_title: settings?.signatory_title ?? null,
    website_url: settings?.website_url ?? null,
    bank_name: settings?.bank_name ?? null,
    bank_account: settings?.bank_account ?? null,
  };
  const paid = order.payment_status === "paid";
  const rejected = order.payment_status === "refunded";
  const receiptNo = `RCP-${order.id.slice(0, 8).toUpperCase()}`;

  const copyLink = async () => {
    if (!verifyUrl) return;
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Verification link copied");
    } catch {
      toast.error("Copy failed");
    }
  };
  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `receipt-qr-${verificationCode ?? order.id.slice(0, 8)}.png`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to={user ? "/account/orders" : "/"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex overflow-hidden rounded-full border border-border bg-card text-xs font-semibold">
            <button
              onClick={() => setKind("receipt")}
              className={`px-4 py-2 transition ${kind === "receipt" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Receipt
            </button>
            <button
              onClick={() => setKind("invoice")}
              className={`px-4 py-2 transition ${kind === "invoice" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              Invoice
            </button>
          </div>
          {verificationCode && (
            <>
              <Btn variant="secondary" onClick={copyLink}>
                <Copy className="mr-1 h-3.5 w-3.5" />
                Copy Link
              </Btn>
              <Link
                to="/verify/receipt/$code"
                params={{ code: verificationCode }}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Verify
              </Link>
            </>
          )}
          <Btn variant="secondary" onClick={() => window.print()}>
            <Printer className="mr-1 h-3.5 w-3.5" />
            Print
          </Btn>
          <Btn
            variant="secondary"
            onClick={() => {
              void printReceiptPdf(receipt, biz, kind);
            }}
          >
            <FileText className="mr-1 h-3.5 w-3.5" />
            Open PDF
          </Btn>
          <Btn
            onClick={() => {
              void downloadReceiptPdf(receipt, biz, kind);
            }}
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            Download PDF
          </Btn>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card [box-shadow:var(--shadow-elevated)] print:rounded-none print:border-0 print:shadow-none">
        <div className="border-b border-border bg-gradient-to-br from-secondary/60 to-transparent p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={logoAsset.url} alt="FCS" className="h-16 w-16 object-contain" />
              <div>
                <div className="text-lg font-bold tracking-tight">{biz.name}</div>
                <div className="text-xs text-muted-foreground">{biz.address}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Tel: {biz.phone} · {biz.email}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
                {kind}
              </div>
              <div className="mt-1 font-mono text-lg font-bold">
                {kind === "invoice"
                  ? (order.invoice_number ?? `INV-${order.id.slice(0, 8).toUpperCase()}`)
                  : receiptNo}
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Date: {new Date(order.created_at).toLocaleDateString("en-KE")}
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold uppercase">
                {paid ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Paid
                  </>
                ) : rejected ? (
                  <>
                    <XCircle className="h-3 w-3 text-rose-500" /> Refunded
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 text-amber-500" />{" "}
                    {(order.payment_status ?? "unpaid").replace(/_/g, " ")}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 border-b border-border p-8 sm:grid-cols-2">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Billed to
            </div>
            <div className="mt-2 text-sm font-semibold">{order.customer_name}</div>
            <div className="text-sm text-muted-foreground">{order.customer_email}</div>
            <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
            {order.delivery_address && (
              <div className="mt-2 text-sm text-muted-foreground">{order.delivery_address}</div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Order details
            </div>
            <div className="mt-2 grid gap-1 text-sm">
              <div>
                <span className="text-muted-foreground">Order:</span>{" "}
                <span className="font-mono font-semibold">
                  #{order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Fulfillment:</span> {order.fulfillment}
              </div>
              {order.reservation_number && (
                <div>
                  <span className="text-muted-foreground">Reservation:</span>{" "}
                  <span className="font-mono font-semibold">{order.reservation_number}</span>
                </div>
              )}
              {order.pickup_code && (
                <div>
                  <span className="text-muted-foreground">Pickup code:</span>{" "}
                  <span className="font-mono font-semibold">{order.pickup_code}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3">Item</th>
                <th className="pb-3 text-right">Qty</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="py-3">
                    <div className="font-medium">{it.name}</div>
                    {it.product_id && specs[it.product_id] && (
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {[
                          specs[it.product_id].processor,
                          specs[it.product_id].ram && `${specs[it.product_id].ram} RAM`,
                          specs[it.product_id].storage,
                          specs[it.product_id].condition,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                    {it.product_id && specs[it.product_id] && (
                      <div className="mt-0.5 text-[10px] text-muted-foreground/80">
                        {specs[it.product_id].warranty &&
                        !/none|no\s*war/i.test(specs[it.product_id].warranty)
                          ? `Warranty: ${specs[it.product_id].warranty}`
                          : "No manufacturer warranty"}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-right">{it.qty}</td>
                  <td className="py-3 text-right font-mono">{formatPrice(it.price)}</td>
                  <td className="py-3 text-right font-mono font-semibold">
                    {formatPrice(it.price * it.qty)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>
              <div className="my-2 h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="font-mono">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          {(biz.till_number || biz.paybill_number) && (
            <div className="mt-8 rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Payment
              </div>
              <div className="mt-2 grid gap-1 text-sm">
                {biz.till_number && (
                  <div>
                    M-Pesa Till: <span className="font-mono font-bold">{biz.till_number}</span>
                  </div>
                )}
                {biz.paybill_number && (
                  <div>
                    M-Pesa Paybill:{" "}
                    <span className="font-mono font-bold">{biz.paybill_number}</span>
                    {biz.account_number ? ` · Account ${biz.account_number}` : ""}
                  </div>
                )}
              </div>
              {payments.length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  Latest payment: {formatPrice(Number(payments[0].amount))} via{" "}
                  {payments[0].method || "M-Pesa"}
                  {payments[0].reference ? ` · ${payments[0].reference}` : ""}
                  {" — "}
                  <span className="font-semibold">{payments[0].status}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex h-16 items-end border-b border-border">
                {biz.signature_url && (
                  <img
                    src={biz.signature_url}
                    alt="Signature"
                    className="max-h-14 object-contain"
                  />
                )}
              </div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Authorized Signature
              </div>
              {biz.signatory_name && (
                <div className="text-sm font-semibold">{biz.signatory_name}</div>
              )}
              {biz.signatory_title && (
                <div className="text-xs text-muted-foreground">{biz.signatory_title}</div>
              )}
            </div>
            <div>
              <div className="grid h-16 place-items-center rounded-lg border border-dashed border-border">
                {biz.stamp_url ? (
                  <img src={biz.stamp_url} alt="Stamp" className="max-h-14 object-contain" />
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Company Stamp
                  </span>
                )}
              </div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Official Seal
              </div>
            </div>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            Date Issued:{" "}
            <span className="font-semibold text-foreground">
              {new Date().toLocaleDateString("en-KE")}
            </span>
          </div>

          {verificationCode && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-secondary/40 p-5">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Verify this receipt
                </div>
                <div className="mt-1 font-mono text-lg font-bold">{verificationCode}</div>
                <div className="mt-1 break-all text-xs text-muted-foreground">{verifyUrl}</div>
                <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                  <button
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy Link
                  </button>
                  <a
                    href={verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open
                  </a>
                  {qrDataUrl && (
                    <button
                      onClick={downloadQr}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-secondary"
                    >
                      <Download className="h-3.5 w-3.5" />
                      QR
                    </button>
                  )}
                </div>
              </div>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Verification QR"
                  className="h-32 w-32 rounded-lg border border-border bg-white p-2"
                />
              )}
            </div>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Thank you for choosing {biz.name}.
          </p>
          <p className="mt-1 text-center text-[10px] text-muted-foreground/70">
            This is a computer-generated document and does not require a physical signature.
          </p>
        </div>
      </div>
    </div>
  );
}
