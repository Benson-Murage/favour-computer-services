import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Input, StatusPill } from "@/components/admin/ui";
import { adjustStock, inventoryHistory, listAdminProducts } from "@/lib/admin-crud.functions";

export const Route = createFileRoute("/_authenticated/admin/inventory")({ component: InventoryPage });

function InventoryPage() {
  const qc = useQueryClient();
  const lp = useServerFn(listAdminProducts);
  const ih = useServerFn(inventoryHistory);
  const adj = useServerFn(adjustStock);
  const products = useQuery({ queryKey: ["adm","products"], queryFn: () => lp({}) });
  const history = useQuery({ queryKey: ["adm","inv","hist"], queryFn: () => ih({}) });
  const [deltas, setDeltas] = useState<Record<string, string>>({});

  const handle = async (id: string, kind: "add"|"remove"|"set") => {
    const raw = Number(deltas[id] ?? 0);
    if (!raw) return;
    let delta = raw;
    if (kind === "remove") delta = -Math.abs(raw);
    if (kind === "set") {
      const p = (products.data ?? []).find((x) => x.id === id);
      delta = raw - Number(p?.stock ?? 0);
    }
    try {
      await adj({ data: { product_id: id, delta, reason: kind } });
      toast.success("Stock updated");
      setDeltas((s) => ({ ...s, [id]: "" }));
      qc.invalidateQueries({ queryKey: ["adm","products"] });
      qc.invalidateQueries({ queryKey: ["adm","inv","hist"] });
    } catch (e) { toast.error((e as Error).message); }
  };

  const prods = (products.data ?? []) as Array<{ id: string; name: string; slug: string; stock: number | null }>;
  const low = prods.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 3);
  const out = prods.filter((p) => (p.stock ?? 0) === 0);

  return (
    <AdminShell title="Inventory">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><div className="text-xs uppercase text-muted-foreground">Total SKUs</div><div className="mt-1 text-2xl font-bold">{prods.length}</div></Card>
        <Card><div className="text-xs uppercase text-muted-foreground">Low stock</div><div className="mt-1 text-2xl font-bold text-amber-600">{low.length}</div></Card>
        <Card><div className="text-xs uppercase text-muted-foreground">Out of stock</div><div className="mt-1 text-2xl font-bold text-rose-600">{out.length}</div></Card>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Product</th><th className="p-3">Current</th><th className="p-3">Change</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {prods.map((p) => (
              <tr key={p.id}>
                <td className="p-3 font-semibold">{p.name}</td>
                <td className="p-3">
                  {(p.stock ?? 0) === 0 ? <StatusPill tone="danger">Out</StatusPill>
                    : (p.stock ?? 0) <= 3 ? <StatusPill tone="warn">{p.stock}</StatusPill>
                    : <span>{p.stock}</span>}
                </td>
                <td className="p-3">
                  <Input type="number" placeholder="0" value={deltas[p.id] ?? ""} onChange={(e)=>setDeltas((s)=>({ ...s, [p.id]: e.target.value }))} className="w-28" />
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Btn variant="primary" onClick={()=>handle(p.id, "add")}>+ Add</Btn>
                    <Btn variant="secondary" onClick={()=>handle(p.id, "remove")}>− Remove</Btn>
                    <Btn variant="ghost" onClick={()=>handle(p.id, "set")}>Set total</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <h2 className="mt-8 text-lg font-bold">Movement history</h2>
      <Card className="mt-3 overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">When</th><th className="p-3">Product</th><th className="p-3">Δ</th><th className="p-3">Reason</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((history.data ?? []) as Array<{ id: string; created_at: string; delta: number; reason: string; products: { name: string } | null }>).map((m) => (
              <tr key={m.id}>
                <td className="p-3 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</td>
                <td className="p-3">{m.products?.name ?? "—"}</td>
                <td className={`p-3 font-semibold ${m.delta < 0 ? "text-rose-600" : "text-emerald-600"}`}>{m.delta > 0 ? "+" : ""}{m.delta}</td>
                <td className="p-3 text-xs">{m.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminShell>
  );
}