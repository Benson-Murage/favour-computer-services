import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, ShieldCheck, Truck, Wrench, Star, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ConditionBadge } from "@/components/condition-badge";
import { formatPrice, conditionLabel } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const productOpts = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, brand:brands(name,slug), category:categories(name,slug)")
        .eq("slug", slug)
        .maybeSingle();
      if (!data) throw notFound();
      const related = data.category_id
        ? await supabase
            .from("products")
            .select("id,slug,name,price,compare_at_price,image_url,rating,review_count,condition,brand:brands(name)")
            .eq("category_id", data.category_id)
            .neq("id", data.id)
            .limit(4)
        : { data: [] as ProductCardData[] };
      return { product: data, related: (related.data ?? []) as unknown as ProductCardData[] };
    },
  });

export const Route = createFileRoute("/products/$slug")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productOpts(params.slug)),
  head: ({ params }) => ({
    meta: [
      { title: `Product — Voltline` },
      { property: "og:title", content: `Product on Voltline` },
      { property: "og:url", content: `/products/${params.slug}` },
      { property: "og:type", content: "product" },
    ],
    links: [{ rel: "canonical", href: `/products/${params.slug}` }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-sm font-semibold underline">Back to shop</Link>
    </div>
  ),
  errorComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
    </div>
  ),
  component: PDP,
});

function PDP() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productOpts(slug));
  const p = data.product;
  const [qty, setQty] = useState(1);
  const cart = useCart();
  const { user } = useAuth();
  const [wished, setWished] = useState(false);

  const addToCart = () => {
    cart.add(
      { id: p.id, slug: p.slug, name: p.name, price: Number(p.price), image_url: p.image_url, condition: p.condition },
      qty,
    );
    toast.success("Added to cart", { description: `${qty} × ${p.name}` });
  };

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to save items.");
      return;
    }
    if (wished) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", p.id);
      setWished(false);
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: p.id });
      setWished(true);
      toast.success("Saved to wishlist");
    }
  };

  const compare = p.compare_at_price ? Number(p.compare_at_price) : null;
  const isRefurb = p.condition !== "new";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        {p.category && (
          <>
            <span className="mx-2">/</span>
            <Link to="/shop" search={{ category: p.category.slug }} className="hover:text-foreground">{p.category.name}</Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-3xl bg-secondary">
          {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {p.brand?.name}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{p.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <ConditionBadge condition={p.condition} />
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-[color:var(--warning)] text-[color:var(--warning)]" />
              <span className="font-semibold">{Number(p.rating ?? 0).toFixed(1)}</span>
              <span className="text-muted-foreground">({p.review_count ?? 0} reviews)</span>
            </div>
          </div>

          <div className="mt-6 flex items-end gap-3">
            <span className="text-4xl font-bold tracking-tight">{formatPrice(Number(p.price))}</span>
            {compare && compare > Number(p.price) && (
              <span className="pb-1 text-base text-muted-foreground line-through">{formatPrice(compare)}</span>
            )}
          </div>
          <p className="mt-2 text-sm text-[color:var(--success)]">
            {p.stock > 0 ? `In stock · Ready to ship` : "Out of stock"}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{p.description}</p>

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-11 w-11 place-items-center rounded-l-full hover:bg-secondary">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid h-11 w-11 place-items-center rounded-r-full hover:bg-secondary">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={addToCart}
              disabled={p.stock <= 0}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-40"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <button
              onClick={toggleWishlist}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card transition hover:bg-secondary"
              aria-label="Save"
            >
              <Heart className={`h-5 w-5 ${wished ? "fill-destructive text-destructive" : ""}`} />
            </button>
          </div>

          {isRefurb && (
            <div className="mt-6 rounded-2xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 p-5">
              <h3 className="flex items-center gap-2 text-sm font-bold">
                <Wrench className="h-4 w-4" /> {conditionLabel(p.condition)}
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {["41-point inspection passed", "Cosmetic Grade A — minimal signs of use", "Battery health verified above 85%", "Includes 1-year Voltline warranty"].map((l) => (
                  <li key={l} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-[color:var(--success)]" /> {l}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Perk Icon={Truck} t="Free 2-day shipping" />
            <Perk Icon={ShieldCheck} t={isRefurb ? "1-year warranty" : "Manufacturer warranty"} />
            <Perk Icon={Check} t="30-day returns" />
          </div>

          <div className="mt-8 rounded-2xl border border-border">
            <h3 className="border-b border-border px-5 py-3 text-sm font-semibold">Specifications</h3>
            <dl className="divide-y divide-border text-sm">
              {[
                ["Brand", p.brand?.name],
                ["Condition", conditionLabel(p.condition)],
                ["Processor", p.processor],
                ["Memory", p.ram],
                ["Storage", p.storage],
                ["SKU", p.id.slice(0, 8).toUpperCase()],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k as string} className="grid grid-cols-3 px-5 py-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="col-span-2 font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {data.related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {data.related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Perk({ Icon, t }: { Icon: React.ComponentType<{ className?: string }>; t: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-xs font-medium">
      <Icon className="h-4 w-4" /> {t}
    </div>
  );
}