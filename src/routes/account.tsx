import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Heart, ShoppingBag, MapPin, Settings, ShieldCheck, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { checkIsAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "Account — Voltline" }] }),
  component: Account,
});

function Account() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const isAdminFn = useServerFn(checkIsAdmin);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (user)
      isAdminFn({})
        .then((r) => setIsAdmin(r.isAdmin))
        .catch(() => {});
  }, [user, isAdminFn]);

  if (loading)
    return <div className="py-20 text-center text-sm text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Sign in to your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access orders, addresses, and saved items.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-semibold text-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const signOut = async () => {
    await supabase.auth.signOut();
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Account
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Hi, {user.email?.split("@")[0]}
          </h1>
        </div>
        <button
          onClick={signOut}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Tile to="/account/orders" Icon={Receipt} t="My Orders" s="Receipts, invoices & status" />
        <Tile to="/wishlist" Icon={Heart} t="Wishlist" s="Saved products" />
        <Tile to="/cart" Icon={ShoppingBag} t="Cart" s="Items ready to checkout" />
        <Tile to="/account/addresses" Icon={MapPin} t="Addresses" s="Manage shipping addresses" />
        <Tile to="/account/settings" Icon={Settings} t="Settings" s="Name, phone & password" />
        {isAdmin && (
          <Tile
            to="/admin"
            Icon={ShieldCheck}
            t="Admin Dashboard"
            s="Manage shop, services & orders"
          />
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">Need a receipt or to upload a payment proof?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Open{" "}
          <Link to="/account/orders" className="font-semibold text-foreground underline">
            My Orders
          </Link>{" "}
          to view receipts, download invoices, and upload M-Pesa proof of payment.
        </p>
      </div>
    </div>
  );
}

function Tile({
  to,
  Icon,
  t,
  s,
}: {
  to: string;
  Icon: React.ComponentType<{ className?: string }>;
  t: string;
  s: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-card p-5 transition hover:[box-shadow:var(--shadow-card)]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary group-hover:bg-foreground group-hover:text-background">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 font-semibold">{t}</h3>
      <p className="text-xs text-muted-foreground">{s}</p>
    </Link>
  );
}
