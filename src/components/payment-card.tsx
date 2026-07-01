import { useState } from "react";
import { Copy, Check, Smartphone, Building2, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type Props = {
  tillNumber?: string | null;
  paybillNumber?: string | null;
  accountNumber?: string | null;
  instructions?: string | null;
  amount?: number;
  compact?: boolean;
};

function copy(v: string, label: string, setter: (s: string | null) => void) {
  navigator.clipboard.writeText(v).then(
    () => {
      setter(label);
      toast.success(`${label} copied`);
      setTimeout(() => setter(null), 1500);
    },
    () => toast.error("Couldn't copy"),
  );
}

export function PaymentCard({ tillNumber, paybillNumber, accountNumber, instructions, amount, compact }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  if (!tillNumber && !paybillNumber) return null;

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-emerald-500/10 via-card to-card p-6 [box-shadow:var(--shadow-elevated)] ${compact ? "" : ""}`}>
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[color:var(--accent)]/20 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-500">
            <Smartphone className="h-5 w-5" strokeWidth={2.4} />
          </span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-500">Lipa na M-Pesa</div>
            <div className="text-lg font-bold tracking-tight">Pay for your order</div>
          </div>
        </div>
        {typeof amount === "number" && amount > 0 && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2 text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Amount due</div>
            <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
              KES {amount.toLocaleString("en-KE")}
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
        {tillNumber && (
          <PayLine
            icon={<Smartphone className="h-4 w-4" />}
            label="Till Number (Buy Goods)"
            value={tillNumber}
            copied={copied === "Till"}
            onCopy={() => copy(tillNumber, "Till", setCopied)}
          />
        )}
        {paybillNumber && (
          <PayLine
            icon={<Building2 className="h-4 w-4" />}
            label="Paybill"
            value={paybillNumber}
            copied={copied === "Paybill"}
            onCopy={() => copy(paybillNumber, "Paybill", setCopied)}
          />
        )}
        {paybillNumber && accountNumber && (
          <PayLine
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Account Number"
            value={accountNumber}
            copied={copied === "Account"}
            onCopy={() => copy(accountNumber, "Account", setCopied)}
          />
        )}
      </div>

      {!compact && (
        <div className="relative mt-5 rounded-2xl border border-border bg-background/50 p-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> How to pay via M-Pesa
          </div>
          <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            {[
              "Open M-Pesa on your phone.",
              tillNumber ? "Select Lipa na M-Pesa → Buy Goods and Services." : "Select Lipa na M-Pesa → Pay Bill.",
              tillNumber ? `Enter Till Number ${tillNumber}.` : `Enter Business No. ${paybillNumber}${accountNumber ? ` and Account ${accountNumber}` : ""}.`,
              typeof amount === "number" && amount > 0 ? `Enter amount KES ${amount.toLocaleString("en-KE")} and confirm.` : "Enter the amount and confirm.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          {instructions && (
            <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">{instructions}</p>
          )}
        </div>
      )}
    </div>
  );
}

function PayLine({ icon, label, value, copied, onCopy }: { icon: React.ReactNode; label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4 text-left transition hover:border-emerald-500/50 hover:bg-background"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          {icon} {label}
        </div>
        <div className="mt-1 truncate font-mono text-2xl font-bold tracking-tight">{value}</div>
      </div>
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition ${copied ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-secondary text-muted-foreground group-hover:text-foreground"}`}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </span>
    </button>
  );
}