import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Modal, Select, StatusPill, Textarea, Input } from "@/components/admin/ui";
import { listBookings, updateBooking } from "@/lib/quotes.functions";

export const Route = createFileRoute("/_authenticated/admin/bookings")({ component: BookingsPage });

type B = { id: string; status: string; name: string; email: string; phone: string; event_type: string | null; event_date: string | null; event_location: string | null; package: string | null; requirements: string | null; created_at: string; internal_notes: string | null };
const STATUSES = ["new","contacted","quoted","confirmed","completed","cancelled"] as const;
function tone(s: string) { return s==="new"?"warn":s==="confirmed"||s==="completed"?"success":s==="cancelled"?"danger":"info"; }

function BookingsPage() {
  const qc = useQueryClient();
  const lb = useServerFn(listBookings);
  const upd = useServerFn(updateBooking);
  const { data } = useQuery({ queryKey: ["adm","bookings"], queryFn: () => lb({}) });
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<B | null>(null);
  const rows = useMemo(() => ((data ?? []) as B[]).filter((b) => (status==="all"||b.status===status) && (!search||`${b.name}${b.email}${b.phone}`.toLowerCase().includes(search.toLowerCase()))), [data, status, search]);
  return (
    <AdminShell title="Live Streaming Bookings">
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={status} onChange={(e)=>setStatus(e.target.value)} className="max-w-[180px]">
          <option value="all">Status: all</option>
          {STATUSES.map((s)=><option key={s} value={s}>{s}</option>)}
        </Select>
        <Input placeholder="Search" value={search} onChange={(e)=>setSearch(e.target.value)} className="max-w-xs" />
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">When</th><th className="p-3">Event</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((b) => (
              <tr key={b.id}>
                <td className="p-3 text-xs">{b.event_date ?? "TBD"}<div className="text-[10px] text-muted-foreground">Submitted {new Date(b.created_at).toLocaleDateString()}</div></td>
                <td className="p-3"><div className="font-semibold">{b.event_type || "Event"}</div><div className="text-xs text-muted-foreground">{b.event_location}</div></td>
                <td className="p-3"><div className="font-semibold">{b.name}</div><div className="text-xs text-muted-foreground">{b.email} · {b.phone}</div></td>
                <td className="p-3"><StatusPill tone={tone(b.status) as never}>{b.status}</StatusPill></td>
                <td className="p-3 text-right"><Btn variant="ghost" onClick={()=>setOpen(b)}>Open</Btn></td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No bookings.</td></tr>}
          </tbody>
        </table>
      </Card>
      <Modal open={!!open} onClose={()=>setOpen(null)} title={open ? `Booking · ${open.name}` : ""}>
        {open && (
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[10px] font-bold uppercase text-muted-foreground">Email</div>{open.email}</div>
              <div><div className="text-[10px] font-bold uppercase text-muted-foreground">Phone</div>{open.phone}</div>
              <div><div className="text-[10px] font-bold uppercase text-muted-foreground">Event</div>{open.event_type}</div>
              <div><div className="text-[10px] font-bold uppercase text-muted-foreground">Date</div>{open.event_date}</div>
              <div className="col-span-2"><div className="text-[10px] font-bold uppercase text-muted-foreground">Location</div>{open.event_location}</div>
              <div className="col-span-2"><div className="text-[10px] font-bold uppercase text-muted-foreground">Package</div>{open.package}</div>
            </div>
            {open.requirements && <div><div className="text-xs font-bold uppercase text-muted-foreground">Requirements</div><p className="mt-1 whitespace-pre-wrap text-sm">{open.requirements}</p></div>}
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Status</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <Btn key={s} variant={open.status===s?"primary":"secondary"} onClick={async ()=>{ await upd({ data: { id: open.id, status: s } }); setOpen({ ...open, status: s }); qc.invalidateQueries({ queryKey: ["adm","bookings"] }); toast.success("Updated"); }}>{s}</Btn>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-muted-foreground">Internal notes</div>
              <Textarea rows={4} defaultValue={open.internal_notes ?? ""} onBlur={async (e)=>{ await upd({ data: { id: open.id, internal_notes: e.target.value } }); toast.success("Note saved"); }} />
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}