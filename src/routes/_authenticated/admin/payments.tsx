import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  Btn,
  Card,
  Field,
  Input,
  Modal,
  Select,
  StatusPill,
  Textarea,
} from "@/components/admin/ui";
import { confirmAction } from "@/components/admin/confirm";
import { adminListPayments, adminReviewPayment, getProofSignedUrl } from "@/lib/payments.functions";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: PaymentsAdmin,
});

type Pay = Awaited<ReturnType<typeof adminListPayments>>[number];

function PaymentsAdmin() {
  const qc = useQueryClient();
  const list = useServerFn(adminListPayments);
  const review = useServerFn(adminReviewPayment);
  const sign = useServerFn(getProofSignedUrl);
  const { data } = useQuery({ queryKey: ["adm", "payments"], queryFn: () => list({}) });
  const [open, setOpen] = useState<Pay | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    const all = (data ?? []) as Pay[];
    const term = q.trim().toLowerCase();
    const fromMs = from ? new Date(from).getTime() : null;
    const toMs = to ? new Date(to).getTime() + 24 * 60 * 60 * 1000 : null;
    return all.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      const t = new Date(p.created_at).getTime();
      if (fromMs !== null && t < fromMs) return false;
      if (toMs !== null && t > toMs) return false;
      if (!term) return true;
      const hay = [
        p.order?.customer_name,
        p.order?.customer_email,
        p.order?.invoice_number,
        p.reference,
        p.method,
        String(p.amount),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [data, q, status, from, to]);

  const showProof = async (p: Pay) => {
    setOpen(p);
    setNotes(p.admin_notes ?? "");
    setProofUrl(null);
    if (p.proof_path) {
      const { url } = await sign({ data: { path: p.proof_path } });
      setProofUrl(url);
    }
  };
  const act = async (action: "approve" | "reject") => {
    if (!open) return;
    const ok = await confirmAction({
      title: action === "approve" ? "Approve this payment?" : "Reject this payment?",
      message:
        action === "approve"
          ? "The order will be marked as paid and the customer will be notified."
          : "The customer will be notified to resubmit proof.",
      confirmLabel: action === "approve" ? "Approve & mark paid" : "Reject payment",
      tone: action === "reject" ? "danger" : "primary",
    });
    if (!ok) return;
    await review({ data: { id: open.id, action, notes } });
    toast.success(action === "approve" ? "Payment approved successfully" : "Payment rejected");
    setOpen(null);
    qc.invalidateQueries({ queryKey: ["adm", "payments"] });
  };

  return (
    <AdminShell title="Payments">
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Search">
            <Input
              placeholder="Name, email, order #, M-Pesa code…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Field>
          <Field label="From">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {rows.length} of {(data ?? []).length} payments
        </div>
      </Card>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Order</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method / Ref</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="p-3 text-xs">{new Date(p.created_at).toLocaleString("en-KE")}</td>
                <td className="p-3">
                  <div className="font-semibold">{p.order?.customer_name}</div>
                  <div className="text-xs text-muted-foreground">{p.order?.customer_email}</div>
                </td>
                <td className="p-3 font-mono text-xs">
                  {p.order?.invoice_number ?? p.order_id.slice(0, 8)}
                </td>
                <td className="p-3 font-semibold">{formatPrice(Number(p.amount))}</td>
                <td className="p-3 text-xs">
                  {p.method || "M-Pesa"}
                  {p.reference ? <div className="text-muted-foreground">{p.reference}</div> : null}
                </td>
                <td className="p-3">
                  <StatusPill
                    tone={
                      p.status === "approved"
                        ? "success"
                        : p.status === "rejected"
                          ? "danger"
                          : "warn"
                    }
                  >
                    {p.status}
                  </StatusPill>
                </td>
                <td className="p-3">
                  <Btn variant="secondary" onClick={() => showProof(p)}>
                    Review
                  </Btn>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  No payment proofs match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={`Review payment — ${open?.order?.invoice_number ?? ""}`}
      >
        {open && (
          <div className="space-y-3 text-sm">
            <div className="grid gap-2 sm:grid-cols-3 text-xs">
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-semibold">{formatPrice(Number(open.amount))}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Method</div>
                <div className="font-semibold">{open.method || "M-Pesa"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Reference</div>
                <div className="font-semibold">{open.reference || "—"}</div>
              </div>
            </div>
            {open.proof_path &&
              proofUrl &&
              (open.proof_mime?.startsWith("image/") ? (
                <img
                  src={proofUrl}
                  alt="Proof"
                  className="max-h-[420px] w-full rounded-xl border border-border object-contain"
                />
              ) : (
                <a
                  href={proofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background"
                >
                  Open proof file
                </a>
              ))}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes (sent to customer)
              </div>
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn variant="danger" onClick={() => act("reject")}>
                Reject
              </Btn>
              <Btn onClick={() => act("approve")}>Approve & mark paid</Btn>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
