import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Truck, Store, ShoppingBag, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { Btn, Field, Input, Textarea } from "@/components/admin/ui";
import { useBusinessSettings } from "@/lib/use-business-settings";
import { placeOrder } from "@/lib/orders.functions";
import { LocationPicker, type PickedLocation } from "@/components/location-picker";
import { PaymentCard } from "@/components/payment-card";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Favour Computer Services" },
      { name: "description", content: "Place your order — delivery or store pickup in Nairobi." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const settings = useBusinessSettings();
  const submit = useServerFn(placeOrder);
  const nav = useNavigate();
  const [method, setMethod] = useState<"delivery" | "pickup">("delivery");
  const [done, setDone] = useState<{
    id: string;
    reservation_number: string | null;
    pickup_code: string | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [pin, setPin] = useState<PickedLocation | null>(null);

  if (items.length === 0 && !done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 text-2xl font-bold">Your cart is empty</h1>
        <Link
          to="/shop"
          className="mt-4 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 text-center [box-shadow:var(--shadow-card)]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 text-3xl">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-bold">Order placed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reference:{" "}
            <span className="font-mono font-semibold">#{done.id.slice(0, 8).toUpperCase()}</span>
          </p>
          {done.reservation_number && (
            <div className="mx-auto mt-6 max-w-md rounded-2xl border border-border bg-secondary p-5 text-left">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                Pickup Reservation
              </div>
              <div className="mt-1 font-mono text-xl font-bold">{done.reservation_number}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Pickup code: <span className="font-mono font-semibold">{done.pickup_code}</span>
              </div>
              <div className="mt-3 flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--accent)]" />
                <span>
                  {settings?.pickup_location ??
                    "F&F Building, Shop U13, Next to Odeon Cinema, Nairobi"}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Bring this code when collecting your order.
              </p>
            </div>
          )}
          <div className="mt-6 text-left">
            <PaymentCard
              tillNumber={settings?.till_number}
              paybillNumber={settings?.paybill_number}
              accountNumber={settings?.account_number}
              instructions={settings?.payment_instructions}
              amount={subtotal}
            />
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => {
                clear();
                nav({ to: "/shop" });
              }}
              className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background"
            >
              Continue shopping
            </button>
            <Link
              to="/account/orders/$id"
              params={{ id: done.id }}
              className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-semibold"
            >
              View order & upload payment proof
            </Link>
            {settings?.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-accent-foreground"
              >
                WhatsApp confirmation
              </a>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Sign in with the email you used at checkout to access your order history and upload
            payment proof anytime.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (method === "delivery" && !pin) {
      toast.error("Please pin your delivery location on the map or use current location");
      return;
    }
    setBusy(true);
    try {
      const res = await submit({
        data: {
          customer_name: String(fd.get("name") ?? ""),
          customer_email: String(fd.get("email") ?? ""),
          customer_phone: String(fd.get("phone") ?? ""),
          fulfillment: method,
          delivery_address: method === "delivery" ? (pin?.address ?? "") : "",
          delivery_lat: method === "delivery" ? (pin?.lat ?? null) : null,
          delivery_lng: method === "delivery" ? (pin?.lng ?? null) : null,
          delivery_note: method === "delivery" ? String(fd.get("delivery_note") ?? "") : "",
          notes: String(fd.get("notes") ?? ""),
          items: items.map((i) => ({
            product_id: i.id,
            name: i.name,
            price: Number(i.price),
            qty: i.qty,
          })),
        },
      });
      clear();
      setDone(res);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">Fulfillment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMethod("delivery")}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left ${method === "delivery" ? "border-foreground bg-secondary" : "border-border"}`}
              >
                <Truck className="mt-0.5 h-5 w-5" />
                <div>
                  <div className="font-semibold">Delivery</div>
                  <div className="text-xs text-muted-foreground">
                    Within Nairobi & arranged countrywide
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMethod("pickup")}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left ${method === "pickup" ? "border-foreground bg-secondary" : "border-border"}`}
              >
                <Store className="mt-0.5 h-5 w-5" />
                <div>
                  <div className="font-semibold">Store Pickup</div>
                  <div className="text-xs text-muted-foreground">
                    {settings?.pickup_location ?? "F&F Building, Shop U13, Nairobi"}
                  </div>
                </div>
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-base font-bold">Your details</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input name="name" required />
              </Field>
              <Field label="Phone">
                <Input name="phone" required placeholder="07XX XXX XXX" />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Email">
                <Input name="email" type="email" required />
              </Field>
            </div>
            {method === "delivery" && (
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Delivery location
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tap <strong>Use current location</strong> or drop a pin on the map. We use the
                    pin to plan your delivery — no need to type your address.
                  </p>
                </div>
                <LocationPicker value={pin} onChange={setPin} height={300} />
                <Field label="Apartment / building / house description (optional)">
                  <Textarea
                    name="delivery_note"
                    rows={2}
                    placeholder="e.g. Kileleshwa, Apt 4B, gate opposite the shop"
                  />
                </Field>
              </div>
            )}
            <div className="mt-3">
              <Field label="Notes (optional)">
                <Textarea name="notes" rows={2} />
              </Field>
            </div>
          </section>

          <PaymentCard
            tillNumber={settings?.till_number}
            paybillNumber={settings?.paybill_number}
            accountNumber={settings?.account_number}
            instructions={settings?.payment_instructions}
            amount={subtotal}
          />

          <Btn type="submit" disabled={busy} className="!h-12 !px-8 !text-sm">
            {busy ? "Placing order…" : "Place order"}
          </Btn>
        </form>

        <aside className="h-fit space-y-4 rounded-2xl border border-border bg-card p-6 [box-shadow:var(--shadow-card)]">
          <h2 className="text-base font-bold">Summary</h2>
          <ul className="divide-y divide-border text-sm">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between py-2">
                <span>
                  {i.name} <span className="text-xs text-muted-foreground">× {i.qty}</span>
                </span>
                <span className="font-semibold">{formatPrice(Number(i.price) * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="my-2 h-px bg-border" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
