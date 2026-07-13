import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card } from "@/components/admin/ui";
import { listAuditLog } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/audit")({ component: AuditPage });

type Entry = {
  id: string;
  created_at: string;
  admin_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
};

function AuditPage() {
  const fn = useServerFn(listAuditLog);
  const { data } = useQuery({ queryKey: ["adm", "audit"], queryFn: () => fn({}) });
  return (
    <AdminShell title="Audit Log">
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">When</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Action</th>
              <th className="p-3">Entity</th>
              <th className="p-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((data ?? []) as Entry[]).map((e) => (
              <tr key={e.id}>
                <td className="p-3 text-xs">{new Date(e.created_at).toLocaleString()}</td>
                <td className="p-3 text-xs">{e.admin_email || "—"}</td>
                <td className="p-3 text-xs font-semibold">{e.action}</td>
                <td className="p-3 text-xs">
                  {e.entity}
                  {e.entity_id ? ` · ${e.entity_id.slice(0, 8)}` : ""}
                </td>
                <td className="p-3 text-[11px] text-muted-foreground">
                  <code>{e.details ? JSON.stringify(e.details).slice(0, 120) : ""}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
