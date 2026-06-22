import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card } from "@/components/admin/ui";
import { adminListSubscribers, adminDeleteSubscriber } from "@/lib/newsletter.functions";

export const Route = createFileRoute("/_authenticated/admin/newsletter")({ component: NewsletterAdmin });

type Sub = Awaited<ReturnType<typeof adminListSubscribers>>[number];

function NewsletterAdmin() {
  const qc = useQueryClient();
  const list = useServerFn(adminListSubscribers);
  const del = useServerFn(adminDeleteSubscriber);
  const { data } = useQuery({ queryKey: ["adm","subs"], queryFn: () => list({}) });

  const exportCsv = () => {
    const rows = (data ?? []) as Sub[];
    const csv = ["email,name,source,created_at", ...rows.map((r) => `${r.email},${r.name ?? ""},${r.source ?? ""},${r.created_at}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `subscribers-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminShell title="Newsletter">
      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>{(data ?? []).length} subscriber{(data ?? []).length === 1 ? "" : "s"}</span>
        <Btn variant="secondary" onClick={exportCsv}>Export CSV</Btn>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Email</th><th className="p-3">Name</th><th className="p-3">Source</th><th className="p-3">Subscribed</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((data ?? []) as Sub[]).map((s) => (
              <tr key={s.id}>
                <td className="p-3 font-medium">{s.email}</td>
                <td className="p-3 text-muted-foreground">{s.name ?? "—"}</td>
                <td className="p-3 text-xs">{s.source ?? "—"}</td>
                <td className="p-3 text-xs">{new Date(s.created_at).toLocaleString("en-KE")}</td>
                <td className="p-3 text-right"><Btn variant="danger" onClick={async () => { await del({ data: { id: s.id } }); toast.success("Removed"); qc.invalidateQueries({ queryKey: ["adm","subs"] }); }}>Delete</Btn></td>
              </tr>
            ))}
            {((data ?? []).length === 0) && <tr><td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">No subscribers yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}