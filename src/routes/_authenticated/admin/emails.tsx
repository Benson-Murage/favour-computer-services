import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, StatusPill } from "@/components/admin/ui";
import { adminListEmails, adminRetryEmail } from "@/lib/emails.functions";

export const Route = createFileRoute("/_authenticated/admin/emails")({ component: EmailCenter });

type Row = Awaited<ReturnType<typeof adminListEmails>>[number];

function EmailCenter() {
  const qc = useQueryClient();
  const list = useServerFn(adminListEmails);
  const retry = useServerFn(adminRetryEmail);
  const { data } = useQuery({ queryKey: ["adm", "emails"], queryFn: () => list({}) });
  const rows = (data ?? []) as Row[];

  return (
    <AdminShell title="Email Center">
      <div className="mb-4 text-xs text-muted-foreground">
        Every form submission, order, and payment update is logged here. Once a sender domain is
        verified, pending entries are dispatched automatically.
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Sent</th>
              <th className="p-3">Recipient</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Template</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-3 text-xs">{new Date(r.created_at).toLocaleString("en-KE")}</td>
                <td className="p-3">{r.recipient}</td>
                <td className="p-3">{r.subject}</td>
                <td className="p-3 text-xs text-muted-foreground">{r.template ?? "—"}</td>
                <td className="p-3">
                  <StatusPill
                    tone={
                      r.status === "sent" ? "success" : r.status === "failed" ? "danger" : "warn"
                    }
                  >
                    {r.status}
                  </StatusPill>
                </td>
                <td className="p-3 text-right">
                  {r.status !== "sent" && (
                    <Btn
                      variant="secondary"
                      onClick={async () => {
                        await retry({ data: { id: r.id } });
                        toast.success("Re-queued");
                        qc.invalidateQueries({ queryKey: ["adm", "emails"] });
                      }}
                    >
                      Resend
                    </Btn>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">
                  No emails logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
