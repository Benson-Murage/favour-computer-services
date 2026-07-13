import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Input, Select, StatusPill } from "@/components/admin/ui";
import { confirmAction } from "@/components/admin/confirm";
import {
  listUsers,
  setUserRole,
  setUserDisabled,
  sendPasswordReset,
  forceSignOut,
} from "@/lib/users.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({ component: UsersPage });

type Row = Awaited<ReturnType<typeof listUsers>>[number];

function UsersPage() {
  const qc = useQueryClient();
  const list = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);
  const setDis = useServerFn(setUserDisabled);
  const reset = useServerFn(sendPasswordReset);
  const signOut = useServerFn(forceSignOut);
  const { data, isLoading } = useQuery({ queryKey: ["adm", "users"], queryFn: () => list({}) });
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const arr = (data ?? []) as Row[];
    if (!q) return arr;
    const s = q.toLowerCase();
    return arr.filter(
      (u) => u.email.toLowerCase().includes(s) || (u.full_name ?? "").toLowerCase().includes(s),
    );
  }, [data, q]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["adm", "users"] });
  const wrap = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      invalidate();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="User Management">
      <p className="text-sm text-muted-foreground">
        Manage accounts, roles, and access — no database edits required. Super-admins can change
        Admin/Super Admin roles; admins can manage Staff and Customer roles.
      </p>
      <div className="mt-4 mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by email or name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} user{filtered.length === 1 ? "" : "s"}
        </span>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Last sign-in</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            )}
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/40">
                <td className="p-3">
                  <div className="font-semibold">{u.full_name || "—"}</div>
                  <div className="text-[11px] text-muted-foreground">{u.email}</div>
                </td>
                <td className="p-3">
                  <Select
                    value={u.role}
                    onChange={(e) =>
                      wrap(
                        () =>
                          setRole({ data: { user_id: u.id, role: e.target.value as Row["role"] } }),
                        "Role updated",
                      )
                    }
                  >
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </Select>
                </td>
                <td className="p-3">
                  {u.disabled ? (
                    <StatusPill tone="danger">Disabled</StatusPill>
                  ) : (
                    <StatusPill tone="success">Active</StatusPill>
                  )}
                </td>
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : "—"}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Btn
                      variant="ghost"
                      onClick={() =>
                        wrap(
                          () =>
                            reset({
                              data: {
                                email: u.email,
                                redirect_to:
                                  typeof window !== "undefined"
                                    ? `${window.location.origin}/reset-password`
                                    : undefined,
                              },
                            }),
                          "Reset link queued",
                        )
                      }
                    >
                      Reset password
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() =>
                        wrap(() => signOut({ data: { user_id: u.id } }), "User signed out")
                      }
                    >
                      Force sign-out
                    </Btn>
                    {u.disabled ? (
                      <Btn
                        variant="secondary"
                        onClick={async () => {
                          const ok = await confirmAction({
                            title: "Enable user?",
                            message: u.email,
                          });
                          if (!ok) return;
                          wrap(
                            () => setDis({ data: { user_id: u.id, disabled: false } }),
                            "User enabled successfully",
                          );
                        }}
                      >
                        Enable
                      </Btn>
                    ) : (
                      <Btn
                        variant="danger"
                        onClick={async () => {
                          const ok = await confirmAction({
                            title: "Disable this user?",
                            message: `${u.email} will be blocked from signing in.`,
                            confirmLabel: "Disable",
                            tone: "danger",
                          });
                          if (!ok) return;
                          wrap(
                            () => setDis({ data: { user_id: u.id, disabled: true } }),
                            "User disabled successfully",
                          );
                        }}
                      >
                        Disable
                      </Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No users.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}
