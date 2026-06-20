import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Modal, Select } from "@/components/admin/ui";
import { listPromotionsAdmin, savePromotion, deletePromotion, listAdminProducts } from "@/lib/admin-crud.functions";

export const Route = createFileRoute("/_authenticated/admin/promotions")({ component: PromotionsPage });

type Promo = { id: string; name: string; product_id: string | null; percent_off: number | null; price_override: number | null; starts_at: string; ends_at: string | null; active: boolean; products: { name: string } | null };

function PromotionsPage() {
  const qc = useQueryClient();
  const lp = useServerFn(listPromotionsAdmin);
  const lprod = useServerFn(listAdminProducts);
  const save = useServerFn(savePromotion);
  const del = useServerFn(deletePromotion);
  const { data } = useQuery({ queryKey: ["adm","promos"], queryFn: () => lp({}) });
  const products = useQuery({ queryKey: ["adm","products"], queryFn: () => lprod({}) });
  const [edit, setEdit] = useState<Promo | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <AdminShell title="Promotions">
      <div className="mb-4"><Btn onClick={()=>{ setEdit(null); setOpen(true); }}>+ New promotion</Btn></div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Product</th><th className="p-3">Discount</th><th className="p-3">Window</th><th className="p-3">Active</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((data ?? []) as Promo[]).map((p) => {
              const expired = p.ends_at && new Date(p.ends_at) < new Date();
              return (
                <tr key={p.id}>
                  <td className="p-3 font-semibold">{p.name}</td>
                  <td className="p-3">{p.products?.name ?? "—"}</td>
                  <td className="p-3 text-xs">{p.percent_off ? `${p.percent_off}% off` : p.price_override ? `KES ${p.price_override}` : "—"}</td>
                  <td className="p-3 text-xs">{new Date(p.starts_at).toLocaleDateString()} – {p.ends_at ? new Date(p.ends_at).toLocaleDateString() : "∞"}</td>
                  <td className="p-3 text-xs">{p.active && !expired ? "Active" : expired ? "Expired" : "Inactive"}</td>
                  <td className="p-3 text-right">
                    <Btn variant="ghost" onClick={()=>{ setEdit(p); setOpen(true); }}>Edit</Btn>
                    <Btn variant="danger" className="ml-2" onClick={async ()=>{ if(confirm("Delete?")){ await del({ data: { id: p.id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adm","promos"] }); } }}>Delete</Btn>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={()=>setOpen(false)} title={edit ? "Edit promotion" : "New promotion"}>
        <PromoForm initial={edit} products={(products.data ?? []) as Array<{ id: string; name: string }>}
          onSave={async (p) => { try{ await save({ data: p as never }); toast.success("Saved"); setOpen(false); qc.invalidateQueries({ queryKey: ["adm","promos"] }); } catch(e){ toast.error((e as Error).message); } }} />
      </Modal>
    </AdminShell>
  );
}

function PromoForm({ initial, products, onSave }: { initial: Promo | null; products: Array<{ id: string; name: string }>; onSave: (p: { id?: string; name: string; product_id?: string|null; percent_off?: number|null; price_override?: number|null; starts_at?: string|null; ends_at?: string|null; active?: boolean }) => void }) {
  const [form, setForm] = useState({
    id: initial?.id, name: initial?.name ?? "",
    product_id: initial?.product_id ?? "",
    percent_off: initial?.percent_off?.toString() ?? "",
    price_override: initial?.price_override?.toString() ?? "",
    starts_at: initial?.starts_at ? initial.starts_at.slice(0,16) : "",
    ends_at: initial?.ends_at ? initial.ends_at.slice(0,16) : "",
    active: initial?.active ?? true,
  });
  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSave({
      id: form.id, name: form.name,
      product_id: form.product_id || null,
      percent_off: form.percent_off ? Number(form.percent_off) : null,
      price_override: form.price_override ? Number(form.price_override) : null,
      starts_at: form.starts_at || null,
      ends_at: form.ends_at || null,
      active: form.active,
    }); }} className="grid gap-3">
      <Field label="Name"><Input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required /></Field>
      <Field label="Product">
        <Select value={form.product_id} onChange={(e)=>setForm({...form, product_id: e.target.value})}>
          <option value="">—</option>
          {products.map((p)=><option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Percent off"><Input type="number" value={form.percent_off} onChange={(e)=>setForm({...form, percent_off: e.target.value})} /></Field>
        <Field label="Or fixed price"><Input type="number" value={form.price_override} onChange={(e)=>setForm({...form, price_override: e.target.value})} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Starts"><Input type="datetime-local" value={form.starts_at} onChange={(e)=>setForm({...form, starts_at: e.target.value})} /></Field>
        <Field label="Ends"><Input type="datetime-local" value={form.ends_at} onChange={(e)=>setForm({...form, ends_at: e.target.value})} /></Field>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e)=>setForm({...form, active: e.target.checked})} /> Active</label>
      <div className="flex justify-end"><Btn type="submit">Save</Btn></div>
    </form>
  );
}