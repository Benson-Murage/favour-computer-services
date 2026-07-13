import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { ConditionBadge } from "@/components/condition-badge";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Voltline" }] }),
  component: Cart,
});

function Cart() {
  const { items, setQty, remove, subtotal, count } = useCart();
  const total = subtotal;
  const nav = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <span className="inline-grid h-16 w-16 place-items-center rounded-full bg-secondary">
          <ShoppingBag className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start exploring deals and add something you love.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Shopping cart</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {count} item{count > 1 ? "s" : ""}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4 p-4">
              <Link
                to="/products/$slug"
                params={{ slug: i.slug }}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary"
              >
                {i.image_url && (
                  <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to="/products/$slug"
                      params={{ slug: i.slug }}
                      className="line-clamp-2 text-sm font-semibold hover:underline"
                    >
                      {i.name}
                    </Link>
                    <div className="mt-1">
                      <ConditionBadge condition={i.condition} />
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold">
                    {formatPrice(Number(i.price) * i.qty)}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-border">
                    <button
                      onClick={() => setQty(i.id, i.qty - 1)}
                      className="grid h-8 w-8 place-items-center"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{i.qty}</span>
                    <button
                      onClick={() => setQty(i.id, i.qty + 1)}
                      className="grid h-8 w-8 place-items-center"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(i.id)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]">
          <h2 className="text-lg font-bold">Order summary</h2>
          <Row k="Subtotal" v={formatPrice(subtotal)} />
          <Row k="Shipping" v="Calculated at checkout" />
          <div className="my-2 h-px bg-border" />
          <Row k="Total" v={formatPrice(total)} bold />
          <button
            onClick={() => nav({ to: "/checkout" })}
            className="mt-2 w-full rounded-full bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            Proceed to checkout
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Delivery or in-store pickup · Nairobi
          </p>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div
      className={`flex justify-between text-sm ${bold ? "text-base font-bold" : "text-foreground"}`}
    >
      <span className={bold ? "" : "text-muted-foreground"}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
