import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard, type ProductCardData } from "@/components/product-card";

const search = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  condition: z.string().optional(), // "refurb" or specific
  sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
}).partial();

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Shop — Voltline" },
      { name: "description", content: "Browse new and refurbished laptops, phones, components, and more." },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

function Shop() {
  const sp = Route.useSearch();
  const [openFilters, setOpenFilters] = useState(false);

  const meta = useQuery({
    queryKey: ["shop-meta"],
    queryFn: async () => {
      const [c, b] = await Promise.all([
        supabase.from("categories").select("slug,name"),
        supabase.from("brands").select("slug,name"),
      ]);
      return { categories: c.data ?? [], brands: b.data ?? [] };
    },
  });

  const products = useQuery({
    queryKey: ["shop", sp],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("id,slug,name,price,compare_at_price,image_url,rating,review_count,condition,category:categories!inner(slug),brand:brands!inner(slug,name)");

      if (sp.category) q = q.eq("category.slug", sp.category);
      if (sp.brand) q = q.eq("brand.slug", sp.brand);
      if (sp.condition === "refurb") q = q.neq("condition", "new");
      else if (sp.condition) q = q.eq("condition", sp.condition as never);
      if (sp.q) q = q.ilike("name", `%${sp.q}%`);

      switch (sp.sort) {
        case "price_asc": q = q.order("price", { ascending: true }); break;
        case "price_desc": q = q.order("price", { ascending: false }); break;
        case "rating": q = q.order("rating", { ascending: false }); break;
        default: q = q.order("created_at", { ascending: false });
      }
      const { data } = await q.limit(60);
      return (data ?? []) as unknown as ProductCardData[];
    },
  });

  const title = useMemo(() => {
    if (sp.condition === "refurb") return "Refurbished";
    if (sp.category) return meta.data?.categories.find((c) => c.slug === sp.category)?.name ?? "Shop";
    if (sp.q) return `Results for "${sp.q}"`;
    return "All products";
  }, [sp, meta.data]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <header className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Catalog</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.data?.length ?? 0} products
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenFilters((v) => !v)}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
          <SortSelect />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className={`${openFilters ? "block" : "hidden"} lg:block`}>
          <FiltersPanel meta={meta.data} />
        </aside>

        <div>
          {products.isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : products.data && products.data.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {products.data.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-sm text-muted-foreground">No products match your filters.</p>
              <Link to="/shop" search={{}} className="mt-4 inline-block text-sm font-semibold underline">
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortSelect() {
  const nav = Route.useNavigate();
  const sp = Route.useSearch();
  return (
    <select
      value={sp.sort ?? "newest"}
      onChange={(e) => nav({ search: { ...sp, sort: e.target.value as never } })}
      className="h-10 rounded-full border border-border bg-card px-4 text-sm font-medium outline-none"
    >
      <option value="newest">Newest</option>
      <option value="price_asc">Price: Low to high</option>
      <option value="price_desc">Price: High to low</option>
      <option value="rating">Highest rated</option>
    </select>
  );
}

function FiltersPanel({ meta }: { meta?: { categories: { slug: string; name: string }[]; brands: { slug: string; name: string }[] } }) {
  const sp = Route.useSearch();
  const nav = Route.useNavigate();

  const set = (k: string, v: string | undefined) => nav({ search: { ...sp, [k]: v } });
  const active = sp.category || sp.brand || sp.condition || sp.q;

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
      {active && (
        <Link
          to="/shop"
          search={{}}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3" /> Clear all
        </Link>
      )}
      <FilterGroup title="Condition">
        {[
          { v: undefined, l: "All" },
          { v: "new", l: "New" },
          { v: "refurb", l: "All refurbished" },
          { v: "certified_refurbished", l: "Certified Refurbished" },
          { v: "refurbished_a", l: "Grade A" },
          { v: "refurbished_b", l: "Grade B" },
          { v: "open_box", l: "Open Box" },
        ].map((o) => (
          <FilterOption key={o.l} active={sp.condition === o.v} onClick={() => set("condition", o.v)}>{o.l}</FilterOption>
        ))}
      </FilterGroup>
      <FilterGroup title="Category">
        <FilterOption active={!sp.category} onClick={() => set("category", undefined)}>All</FilterOption>
        {meta?.categories.map((c) => (
          <FilterOption key={c.slug} active={sp.category === c.slug} onClick={() => set("category", c.slug)}>{c.name}</FilterOption>
        ))}
      </FilterGroup>
      <FilterGroup title="Brand">
        <FilterOption active={!sp.brand} onClick={() => set("brand", undefined)}>All</FilterOption>
        {meta?.brands.map((b) => (
          <FilterOption key={b.slug} active={sp.brand === b.slug} onClick={() => set("brand", b.slug)}>{b.name}</FilterOption>
        ))}
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}
function FilterOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-2 py-1.5 text-left text-sm transition ${active ? "bg-foreground text-background font-semibold" : "hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}