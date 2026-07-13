import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Modal, Select, StatusPill, Textarea, Input } from "@/components/admin/ui";
import { listQuotes, updateQuote } from "@/lib/quotes.functions";

export const Route = createFileRoute("/_authenticated/admin/quotes")({ component: QuotesPage });

type Q = {
  id: string;
  source: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  package: string | null;
  location: string | null;
  message: string | null;
  service_type: string | null;
  created_at: string;
  internal_notes: string | null;
};
const STATUSES = ["new", "contacted", "quoted", "converted", "cancelled"] as const;
const SOURCES = ["all", "cctv", "livestream", "product", "contact", "general"] as const;

function tone(s: string) {
  return s === "new"
    ? "warn"
    : s === "contacted"
      ? "info"
      : s === "quoted"
        ? "info"
        : s === "converted"
          ? "success"
          : "danger";
}

function QuotesPage() {
  const qc = useQueryClient();
  const lq = useServerFn(listQuotes);
  const upd = useServerFn(updateQuote);
  const { data } = useQuery({ queryKey: ["adm", "quotes"], queryFn: () => lq({}) });
  const [source, setSource] = useState<(typeof SOURCES)[number]>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<Q | null>(null);

  const rows = useMemo(() => {
    return ((data ?? []) as Q[]).filter((q) => {
      if (source !== "all" && q.source !== source) return false;
      if (status !== "all" && q.status !== status) return false;
      if (search && !`${q.name} ${q.email} ${q.phone}`.toLowerCase().includes(search.toLowerCase()))
        return false;
      return true;
    });
  }, [data, source, status, search]);

  return (
    <AdminShell title="Quote Requests">
      <div className="mb-4 flex flex-wrap gap-2">
        <Select
          value={source}
          onChange={(e) => setSource(e.target.value as (typeof SOURCES)[number])}
          className="max-w-[180px]"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              Source: {s}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="max-w-[180px]"
        >
          <option value="all">Status: all</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Search name/email/phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Source</th>
              <th className="p-3">Package</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((q) => (
              <tr key={q.id}>
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(q.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <div className="font-semibold">{q.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {q.email} · {q.phone}
                  </div>
                </td>
                <td className="p-3 text-xs uppercase">{q.source}</td>
                <td className="p-3 text-xs">{q.package ?? "—"}</td>
                <td className="p-3">
                  <StatusPill tone={tone(q.status) as never}>{q.status}</StatusPill>
                </td>
                <td className="p-3 text-right">
                  <Btn variant="ghost" onClick={() => setOpen(q)}>
                    Open
                  </Btn>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                  No quotes match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `Quote from ${open.name}` : ""}
      >
        {open && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info k="Email" v={open.email} />
              <Info k="Phone" v={open.phone} />
              <Info k="Source" v={open.source} />
              <Info k="Package" v={open.package ?? "—"} />
              <Info k="Service" v={open.service_type ?? "—"} />
              <Info k="Location" v={open.location ?? "—"} />
            </div>
            {open.message && (
              <div>
                <div className="text-xs font-bold uppercase text-muted-foreground">Message</div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{open.message}</p>
              </div>
            )}
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Status</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Btn
                    key={s}
                    variant={open.status === s ? "primary" : "secondary"}
                    onClick={async () => {
                      await upd({ data: { id: open.id, status: s } });
                      toast.success("Updated");
                      setOpen({ ...open, status: s });
                      qc.invalidateQueries({ queryKey: ["adm", "quotes"] });
                    }}
                  >
                    {s}
                  </Btn>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">
                Internal notes
              </div>
              <Textarea
                rows={4}
                defaultValue={open.internal_notes ?? ""}
                onBlur={async (e) => {
                  await upd({ data: { id: open.id, internal_notes: e.target.value } });
                  toast.success("Note saved");
                }}
              />
            </div>
            <div className="flex gap-2">
              <a
                href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: Your quote request${open.package ? ` — ${open.package}` : ""}`)}&body=${encodeURIComponent(`Hi ${open.name},\n\nThank you for contacting Favour Computer Services regarding your request.\n\n`)}`}
                onClick={() => {
                  toast.success("Opening your email client…");
                  void navigator.clipboard?.writeText(open.email).catch(() => {});
                }}
                className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-xs font-semibold text-background hover:opacity-90"
              >
                Email
              </a>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(open.email)
                    .then(() => toast.success("Email copied to clipboard"))
                    .catch(() => toast.error("Copy failed"));
                }}
                className="inline-flex h-9 items-center rounded-full border border-border bg-card px-4 text-xs font-semibold hover:bg-secondary"
              >
                Copy email
              </button>
              <a
                href={`https://wa.me/${open.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center rounded-full bg-[color:var(--accent)] px-4 text-xs font-semibold text-accent-foreground"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
function Info({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-muted-foreground">{k}</div>
      <div className="text-sm">{v}</div>
    </div>
  );
}
