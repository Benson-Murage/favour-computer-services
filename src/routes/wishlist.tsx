import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { ConditionBadge } from "@/components/condition-badge";
import { useCart } from "@/lib/cart";

type Row = {
  product: {
    id: string; slug: string; name: string; price: string; image_url: string | null; condition: string;
  };
};

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Voltline" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { user, loading } = useAuth();
  const cart = useCart();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("wishlists")
      .select("product:products(id,slug,name,price,image_url,condition)")
      .eq("user_id", user.id)
      .then(({ data }) => setRows((data ?? []) as unknown as Row[]));
  }, [user]);

  if (loading) return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Save what you love</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to keep a wishlist across devices.</p>
        <Link to="/auth" className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background">
          Sign in
        </Link>
      </div>
    );
  }

  const remove = async (productId: string) => {
    await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
    setRows((r) => (r ?? []).filter((x) => x.product.id !== productId));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Your wishlist</h1>
      {rows && rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No saved items yet. <Link to="/shop" className="font-semibold text-foreground underline">Start shopping</Link>.</p>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(rows ?? []).map(({ product: p }) => (
            <li key={p.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
              <Link to="/products/$slug" params={{ slug: p.slug }} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary">
                {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link to="/products/$slug" params={{ slug: p.slug }} className="line-clamp-2 text-sm font-semibold hover:underline">{p.name}</Link>
                <div className="mt-1"><ConditionBadge condition={p.condition} /></div>
                <div className="mt-1 text-sm font-bold">{formatPrice(p.price)}</div>
                <div className="mt-auto flex gap-2 pt-2">
                  <button
                    onClick={() => cart.add({ id: p.id, slug: p.slug, name: p.name, price: Number(p.price), image_url: p.image_url, condition: p.condition })}
                    className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background"
                  >
                    Add to cart
                  </button>
                  <button onClick={() => remove(p.id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3 w-3" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}