import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Label, Modal, Select, Textarea, StatusPill } from "@/components/admin/ui";
import { listAdminProducts, saveProduct, setProductArchived, deleteProduct, listCategoriesAdmin, listBrandsAdmin } from "@/lib/admin-crud.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/products")({ component: ProductsPage });

type AnyProduct = Record<string, unknown> & { id: string; name: string; slug: string };

function ProductsPage() {
  const qc = useQueryClient();
  const lp = useServerFn(listAdminProducts);
  const lc = useServerFn(listCategoriesAdmin);
  const lb = useServerFn(listBrandsAdmin);
  const save = useServerFn(saveProduct);
  const arch = useServerFn(setProductArchived);
  const del = useServerFn(deleteProduct);

  const products = useQuery({ queryKey: ["adm","products"], queryFn: () => lp({}) });
  const cats = useQuery({ queryKey: ["adm","cats"], queryFn: () => lc({}) });
  const brands = useQuery({ queryKey: ["adm","brands"], queryFn: () => lb({}) });

  const [q, setQ] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const filtered = useMemo(() => {
    const list = (products.data ?? []) as AnyProduct[];
    return list.filter((p) => {
      if (!showArchived && p.archived_at) return false;
      if (showArchived && !p.archived_at) return false;
      if (q && !String(p.name).toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [products.data, q, showArchived]);

  const [edit, setEdit] = useState<AnyProduct | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <AdminShell title="Products">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input placeholder="Search products…" value={q} onChange={(e)=>setQ(e.target.value)} className="max-w-xs" />
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={showArchived} onChange={(e)=>setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <div className="ml-auto"><Btn onClick={()=>{ setEdit(null); setCreating(true); }}>+ Add product</Btn></div>
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Flags</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => {
              const ap = p as Record<string, unknown>;
              return (
              <tr key={p.id} className="hover:bg-secondary/40">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {(ap.image_url as string | null) && <img src={ap.image_url as string} alt="" className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.slug} · {String(ap.condition)}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">{formatPrice(Number(ap.price))}</td>
                <td className="p-3">
                  {(ap.stock as number) === 0 ? <StatusPill tone="danger">Out</StatusPill>
                    : (ap.stock as number) <= 3 ? <StatusPill tone="warn">Low · {String(ap.stock)}</StatusPill>
                    : <span>{String(ap.stock)}</span>}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {ap.is_featured && <StatusPill tone="info">Featured</StatusPill>}
                    {ap.is_new_arrival && <StatusPill tone="info">New</StatusPill>}
                    {ap.is_best_seller && <StatusPill tone="success">Best</StatusPill>}
                    {ap.is_on_offer && <StatusPill tone="warn">Offer</StatusPill>}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Btn variant="ghost" onClick={()=>{ setCreating(false); setEdit(p); }}>Edit</Btn>
                    <Btn variant="secondary" onClick={async ()=>{ await arch({ data: { id: p.id, archived: !ap.archived_at } }); toast.success(ap.archived_at ? "Restored" : "Archived"); qc.invalidateQueries({ queryKey: ["adm","products"] }); }}>
                      {ap.archived_at ? "Restore" : "Archive"}
                    </Btn>
                    <Btn variant="danger" onClick={async ()=>{ if(confirm("Delete permanently?")) { await del({ data: { id: p.id } }); toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["adm","products"] }); } }}>Delete</Btn>
                  </div>
                </td>
              </tr>
            )})}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-sm text-muted-foreground">No products.</td></tr>}
          </tbody>
        </table>
      </Card>

      <Modal
        open={creating || !!edit}
        onClose={() => { setEdit(null); setCreating(false); }}
        title={edit ? `Edit · ${edit.name}` : "New product"}
      >
        <ProductForm
          initial={edit}
          categories={(cats.data ?? []) as Array<{ id: string; name: string }>}
          brands={(brands.data ?? []) as Array<{ id: string; name: string }>}
          onSave={async (payload) => {
            try {
              await save({ data: payload });
              toast.success("Saved");
              setEdit(null); setCreating(false);
              qc.invalidateQueries({ queryKey: ["adm","products"] });
            } catch (e) { toast.error((e as Error).message); }
          }}
        />
      </Modal>
    </AdminShell>
  );
}

function ProductForm({ initial, categories, brands, onSave }: {
  initial: AnyProduct | null;
  categories: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string }>;
  onSave: (payload: Record<string, unknown>) => void;
}) {
  const init = (initial ?? {}) as Record<string, unknown>;
  const [form, setForm] = useState<Record<string, unknown>>({
    id: init.id,
    name: init.name ?? "",
    slug: init.slug ?? "",
    description: init.description ?? "",
    price: init.price ?? 0,
    compare_at_price: init.compare_at_price ?? "",
    condition: init.condition ?? "new",
    category_id: init.category_id ?? "",
    brand_id: init.brand_id ?? "",
    image_url: init.image_url ?? "",
    stock: init.stock ?? 0,
    warranty: init.warranty ?? "",
    ram: init.ram ?? "",
    storage: init.storage ?? "",
    processor: init.processor ?? "",
    is_featured: init.is_featured ?? false,
    is_new_arrival: init.is_new_arrival ?? false,
    is_best_seller: init.is_best_seller ?? false,
    is_on_offer: init.is_on_offer ?? false,
    offer_percent: init.offer_percent ?? "",
    offer_price: init.offer_price ?? "",
    offer_starts_at: init.offer_starts_at ?? "",
    offer_ends_at: init.offer_ends_at ?? "",
  });
  const set = (k: string, v: unknown) => setForm((s) => ({ ...s, [k]: v }));
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      set("image_url", data.publicUrl);
      toast.success("Uploaded");
    } catch (e) { toast.error((e as Error).message); } finally { setUploading(false); }
  };

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); const payload = { ...form };
      ["compare_at_price","offer_percent","offer_price"].forEach(k => { if (payload[k]==="" || payload[k]==null) delete payload[k]; });
      ["category_id","brand_id","offer_starts_at","offer_ends_at"].forEach(k => { if (payload[k]==="" || payload[k]==null) payload[k] = null; });
      onSave(payload);
    }} className="grid gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name"><Input value={String(form.name)} onChange={(e)=>set("name", e.target.value)} required /></Field>
        <Field label="Slug"><Input value={String(form.slug)} onChange={(e)=>set("slug", e.target.value)} required /></Field>
      </div>
      <Field label="Description"><Textarea rows={3} value={String(form.description ?? "")} onChange={(e)=>set("description", e.target.value)} /></Field>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Price (KES)"><Input type="number" step="0.01" value={String(form.price)} onChange={(e)=>set("price", e.target.value)} /></Field>
        <Field label="Compare-at"><Input type="number" step="0.01" value={String(form.compare_at_price)} onChange={(e)=>set("compare_at_price", e.target.value)} /></Field>
        <Field label="Stock"><Input type="number" value={String(form.stock)} onChange={(e)=>set("stock", e.target.value)} /></Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Condition">
          <Select value={String(form.condition)} onChange={(e)=>set("condition", e.target.value)}>
            <option value="new">New</option><option value="refurbished">Refurbished</option>
          </Select>
        </Field>
        <Field label="Category">
          <Select value={String(form.category_id ?? "")} onChange={(e)=>set("category_id", e.target.value)}>
            <option value="">—</option>
            {categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>
        <Field label="Brand">
          <Select value={String(form.brand_id ?? "")} onChange={(e)=>set("brand_id", e.target.value)}>
            <option value="">—</option>
            {brands.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="RAM"><Input value={String(form.ram ?? "")} onChange={(e)=>set("ram", e.target.value)} /></Field>
        <Field label="Storage"><Input value={String(form.storage ?? "")} onChange={(e)=>set("storage", e.target.value)} /></Field>
        <Field label="Processor"><Input value={String(form.processor ?? "")} onChange={(e)=>set("processor", e.target.value)} /></Field>
      </div>
      <Field label="Warranty"><Input value={String(form.warranty ?? "")} onChange={(e)=>set("warranty", e.target.value)} placeholder="e.g. 1 year manufacturer warranty" /></Field>
      <div>
        <Label>Image</Label>
        <div className="mt-1 flex items-center gap-3">
          {String(form.image_url) && <img src={String(form.image_url)} alt="" className="h-16 w-16 rounded object-cover" />}
          <Input type="file" accept="image/*" onChange={(e)=>{ const f = e.target.files?.[0]; if (f) upload(f); }} disabled={uploading} />
          {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
        </div>
        <Input className="mt-2" placeholder="Or paste image URL" value={String(form.image_url ?? "")} onChange={(e)=>set("image_url", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["is_featured","is_new_arrival","is_best_seller","is_on_offer"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-xs">
            <input type="checkbox" checked={Boolean(form[k])} onChange={(e)=>set(k, e.target.checked)} />
            {k.replace("is_","").replace("_"," ")}
          </label>
        ))}
      </div>
      {Boolean(form.is_on_offer) && (
        <div className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-3 sm:grid-cols-4">
          <Field label="Offer %"><Input type="number" value={String(form.offer_percent ?? "")} onChange={(e)=>set("offer_percent", e.target.value)} /></Field>
          <Field label="Offer price"><Input type="number" value={String(form.offer_price ?? "")} onChange={(e)=>set("offer_price", e.target.value)} /></Field>
          <Field label="Starts"><Input type="datetime-local" value={String(form.offer_starts_at ?? "")} onChange={(e)=>set("offer_starts_at", e.target.value)} /></Field>
          <Field label="Ends"><Input type="datetime-local" value={String(form.offer_ends_at ?? "")} onChange={(e)=>set("offer_ends_at", e.target.value)} /></Field>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-2"><Btn type="submit">Save product</Btn></div>
    </form>
  );
}