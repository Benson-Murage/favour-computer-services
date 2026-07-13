import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { ConditionBadge } from "./condition-badge";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  compare_at_price: number | string | null;
  image_url: string | null;
  rating: number | string | null;
  review_count: number | null;
  condition: string;
  brand?: { name: string } | null;
};

export function ProductCard({ p }: { p: ProductCardData }) {
  const price = Number(p.price);
  const compare = p.compare_at_price ? Number(p.compare_at_price) : null;
  const off = compare && compare > price ? Math.round(((compare - price) / compare) * 100) : null;

  return (
    <Link
      to="/products/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:[box-shadow:var(--shadow-elevated)]"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {p.image_url && (
          <img
            src={p.image_url}
            alt={p.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <ConditionBadge condition={p.condition} />
          {off && (
            <span className="inline-flex w-fit items-center rounded-full bg-destructive px-2.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
              −{off}%
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {p.brand && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {p.brand.name}
          </p>
        )}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {p.name}
        </h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              {formatPrice(price)}
            </div>
            {compare && compare > price && (
              <div className="text-xs text-muted-foreground line-through">
                {formatPrice(compare)}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-[color:var(--warning)] text-[color:var(--warning)]" />
            <span className="font-medium text-foreground">{Number(p.rating ?? 0).toFixed(1)}</span>
            <span>({p.review_count ?? 0})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
