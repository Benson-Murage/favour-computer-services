import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, XCircle, Search, ArrowLeft, Printer } from "lucide-react";
import { verifyReceipt } from "@/lib/verify.functions";
import { useBusinessSettings } from "@/lib/use-business-settings";
import { formatPrice } from "@/lib/format";
import { Btn, Input } from "@/components/admin/ui";
import logoAsset from "@/assets/fcs-logo.png.asset.json";

export const Route = createFileRoute("/verify/receipt/$code")({
  head: () => ({
    meta: [
      { title: "Verify Receipt — Favour Computer Services" },
      {
        name: "description",
        content:
          "Verify the authenticity of a Favour Computer Services receipt using its verification code.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyPage,
});

type Verification = {
  valid: boolean;
  invoice_number?: string | null;
  verification_code?: string;
  issued_at?: string;
  customer_name?: string;
  customer_email?: string;
  status?: string;
  payment_status?: string;
  fulfillment?: string;
  total?: number;
  items?: Array<{ name?: string; qty?: number; price?: number }>;
};

function VerifyPage() {
  const { code } = Route.useParams();
  const nav = useNavigate();
  const verify = useServerFn(verifyReceipt);
  const settings = useBusinessSettings();
  const [result, setResult] = useState<Verification | null>(null);
  const [loading, setLoading] = useState(true);
  const [manual, setManual] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    verify({ data: { code } })
      .then((r) => {
        if (!cancelled) setResult(JSON.parse(r.json) as Verification);
      })
      .catch(() => {
        if (!cancelled) setResult({ valid: false });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [code, verify]);

  const biz = {
    name: settings?.company_name ?? "Favour Computer Services",
    address: settings?.address ?? "F&F Building, Shop U13, Next to Odeon Cinema, Nairobi",
    phone: settings?.phone ?? "0726 548 592",
    email: settings?.email ?? "bensonmurage254@gmail.com",
  };

  const items = Array.isArray(result?.items) ? result!.items! : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 print:py-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Home
        </Link>
        <Btn variant="secondary" onClick={() => window.print()}>
          <Printer className="mr-1 h-3.5 w-3.5" />
          Print
        </Btn>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card [box-shadow:var(--shadow-elevated)] print:rounded-none print:border-0 print:shadow-none">
        <div className="border-b border-border bg-gradient-to-br from-secondary/60 to-transparent p-6">
          <div className="flex items-center gap-4">
            <img src={logoAsset.url} alt={biz.name} className="h-14 w-14 object-contain" />
            <div>
              <div className="text-lg font-bold tracking-tight">{biz.name}</div>
              <div className="text-xs text-muted-foreground">Receipt Verification</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Verifying receipt…</div>
        ) : result?.valid ? (
          <div className="p-6">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-100">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-semibold">This receipt has been verified as authentic.</div>
                <div className="text-xs opacity-80">
                  Verified on {new Date().toLocaleString("en-KE")}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Row
                label="Verification Code"
                value={<span className="font-mono font-bold">{result.verification_code}</span>}
              />
              <Row
                label="Receipt Number"
                value={<span className="font-mono">{result.invoice_number ?? "—"}</span>}
              />
              <Row
                label="Date Issued"
                value={result.issued_at ? new Date(result.issued_at).toLocaleString("en-KE") : "—"}
              />
              <Row label="Fulfillment" value={result.fulfillment ?? "—"} />
              <Row label="Customer" value={result.customer_name ?? "—"} />
              <Row label="Email" value={result.customer_email ?? "—"} />
              <Row
                label="Order Status"
                value={
                  <span className="capitalize">{(result.status ?? "").replace(/_/g, " ")}</span>
                }
              />
              <Row
                label="Payment Status"
                value={
                  <span className="capitalize">
                    {(result.payment_status ?? "").replace(/_/g, " ")}
                  </span>
                }
              />
            </div>

            {items.length > 0 && (
              <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Purchased items
                </div>
                <ul className="mt-3 divide-y divide-border">
                  {items.map((it, i) => (
                    <li key={i} className="flex items-center justify-between py-2 text-sm">
                      <span>
                        {it.name} <span className="text-muted-foreground">× {it.qty}</span>
                      </span>
                      <span className="font-mono">
                        {formatPrice(Number(it.price ?? 0) * Number(it.qty ?? 0))}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-bold">
                  <span>Total</span>
                  <span className="font-mono">{formatPrice(Number(result.total ?? 0))}</span>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-xs text-muted-foreground">
              For queries contact {biz.phone} · {biz.email}
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 dark:border-rose-800/40 dark:bg-rose-900/20 dark:text-rose-100">
              <XCircle className="h-6 w-6 flex-shrink-0" />
              <div>
                <div className="font-semibold">
                  This receipt is invalid or could not be verified.
                </div>
                <div className="text-xs opacity-80">
                  Please double-check the verification code and try again.
                </div>
              </div>
            </div>

            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                const c = manual.trim().toUpperCase();
                if (c) nav({ to: "/verify/receipt/$code", params: { code: c } });
              }}
            >
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Enter Verification Code
              </label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="FCS-2026-XXXXXX"
                  className="font-mono uppercase"
                />
                <Btn type="submit">
                  <Search className="mr-1 h-3.5 w-3.5" />
                  Verify
                </Btn>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
