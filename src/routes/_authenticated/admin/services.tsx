import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Modal, Select, Textarea } from "@/components/admin/ui";
import { listPackagesAdmin, savePackage, deletePackage } from "@/lib/admin-crud.functions";

export const Route = createFileRoute("/_authenticated/admin/services")({ component: ServicesPage });

type Pkg = { id: string; kind: "cctv"|"livestream"; name: string; tagline: string|null; price_label: string|null; description: string|null; features: string[]|null; equipment: string[]|null; sort_order: number|null; active: boolean };

function ServicesPage() {
  const qc = useQueryClient();
  const lp = useServerFn(listPackagesAdmin);
  const save = useServerFn(savePackage);
  const del = useServerFn(deletePackage);
  const { data } = useQuery({ queryKey: ["adm","pkgs"], queryFn: () => lp({}) });
  const [edit, setEdit] = useState<Pkg | null>(null);
  const [open, setOpen] = useState(false);

  const list = (data ?? []) as Pkg[];
  const cctv = list.filter((p) => p.kind === "cctv");
  const live = list.filter((p) => p.kind === "livestream");

  return (
    <AdminShell title="Service Packages">
      <div className="mb-4 flex justify-end"><Btn onClick={()=>{ setEdit(null); setOpen(true); }}>+ Add package</Btn></div>
      <PkgTable title="CCTV Packages" pkgs={cctv} onEdit={(p)=>{setEdit(p); setOpen(true);}} onDelete={async(p)=>{ if(confirm("Delete?")){ await del({data:{id:p.id}}); toast.success("Deleted"); qc.invalidateQueries({queryKey:["adm","pkgs"]}); } }} />
      <div className="h-6" />
      <PkgTable title="Live Streaming Packages" pkgs={live} onEdit={(p)=>{setEdit(p); setOpen(true);}} onDelete={async(p)=>{ if(confirm("Delete?")){ await del({data:{id:p.id}}); toast.success("Deleted"); qc.invalidateQueries({queryKey:["adm","pkgs"]}); } }} />
      <Modal open={open} onClose={()=>setOpen(false)} title={edit ? `Edit · ${edit.name}` : "New package"}>
        <PkgForm initial={edit} onSave={async (p)=>{ try{ await save({ data: p }); toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["adm","pkgs"] }); } catch(e){ toast.error((e as Error).message); } }} />
      </Modal>
    </AdminShell>
  );
}

function PkgTable({ title, pkgs, onEdit, onDelete }: { title: string; pkgs: Pkg[]; onEdit: (p: Pkg)=>void; onDelete: (p: Pkg)=>void }) {
  return (
    <div>
      <h2 className="mb-2 text-base font-bold">{title}</h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Price</th><th className="p-3">Features</th><th className="p-3">Active</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pkgs.map((p) => (
              <tr key={p.id}>
                <td className="p-3"><div className="font-semibold">{p.name}</div><div className="text-xs text-muted-foreground">{p.tagline}</div></td>
                <td className="p-3 text-xs">{p.price_label}</td>
                <td className="p-3 text-xs">{(p.features ?? []).length} items</td>
                <td className="p-3 text-xs">{p.active ? "Yes" : "No"}</td>
                <td className="p-3 text-right">
                  <Btn variant="ghost" onClick={()=>onEdit(p)}>Edit</Btn>
                  <Btn variant="danger" className="ml-2" onClick={()=>onDelete(p)}>Delete</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function PkgForm({ initial, onSave }: { initial: Pkg | null; onSave: (p: { id?: string; kind: "cctv"|"livestream"; name: string; tagline?: string; price_label?: string; description?: string; features?: string[]; equipment?: string[]; sort_order?: number; active?: boolean }) => void }) {
  const [form, setForm] = useState({
    id: initial?.id,
    kind: (initial?.kind ?? "cctv") as "cctv"|"livestream",
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    price_label: initial?.price_label ?? "",
    description: initial?.description ?? "",
    features: (initial?.features ?? []).join("\n"),
    equipment: (initial?.equipment ?? []).join("\n"),
    sort_order: initial?.sort_order ?? 0,
    active: initial?.active ?? true,
  });
  const set = (k: keyof typeof form, v: unknown) => setForm((s) => ({ ...s, [k]: v as never }));
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSave({
      id: form.id, kind: form.kind, name: form.name, tagline: form.tagline,
      price_label: form.price_label, description: form.description,
      features: form.features.split("\n").map(s=>s.trim()).filter(Boolean),
      equipment: form.equipment.split("\n").map(s=>s.trim()).filter(Boolean),
      sort_order: Number(form.sort_order) || 0, active: form.active,
    }); }} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kind">
          <Select value={form.kind} onChange={(e)=>set("kind", e.target.value)}>
            <option value="cctv">CCTV</option><option value="livestream">Live Streaming</option>
          </Select>
        </Field>
        <Field label="Name"><Input value={form.name} onChange={(e)=>set("name", e.target.value)} required /></Field>
      </div>
      <Field label="Tagline"><Input value={form.tagline} onChange={(e)=>set("tagline", e.target.value)} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Price label"><Input value={form.price_label} onChange={(e)=>set("price_label", e.target.value)} placeholder="From KSh 35,000" /></Field>
        <Field label="Sort order"><Input type="number" value={String(form.sort_order)} onChange={(e)=>set("sort_order", e.target.value)} /></Field>
      </div>
      <Field label="Description"><Textarea rows={3} value={form.description} onChange={(e)=>set("description", e.target.value)} /></Field>
      <Field label="Features (one per line)"><Textarea rows={4} value={form.features} onChange={(e)=>set("features", e.target.value)} /></Field>
      <Field label="Equipment (one per line)"><Textarea rows={3} value={form.equipment} onChange={(e)=>set("equipment", e.target.value)} /></Field>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e)=>set("active", e.target.checked)} /> Active</label>
      <div className="flex justify-end"><Btn type="submit">Save</Btn></div>
    </form>
  );
}