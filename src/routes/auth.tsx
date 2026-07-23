import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import logoAsset from "@/assets/fcs-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Favour Computer Services" }] }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (user) nav({ to: "/account" });
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let error: { message: string } | null = null;
    if (mode === "signin") {
      const res = await supabase.auth.signInWithPassword({ email, password });
      error = res.error;
    } else {
      const res = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      error = res.error;
    }
    setLoading(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Check your email to confirm your account.");
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-md place-items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border bg-card p-8 [box-shadow:var(--shadow-elevated)]">
        <div className="flex flex-col items-center gap-3">
          <img
            src={logoAsset}
            alt="Favour Computer Services"
            className="h-16 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to your Favour Computer Services account"
              : "Join Favour Computer Services in seconds"}
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none ring-ring/30 focus:ring-2"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none ring-ring/30 focus:ring-2"
          />
          <button
            disabled={loading}
            className="h-11 w-full rounded-full bg-foreground text-sm font-semibold text-background transition hover:opacity/90 disabled:opacity-50"
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
