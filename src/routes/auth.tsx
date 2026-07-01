import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth";
import logoAsset from "@/assets/fcs-logo.png.asset.json";

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
    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await fn({
      email,
      password,
      ...(mode === "signup" ? { options: { emailRedirectTo: window.location.origin } } : {}),
    } as never);
    setLoading(false);
    if (error) toast.error(error.message);
    else if (mode === "signup") toast.success("Check your email to confirm your account.");
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(r.error.message);
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-md place-items-center px-4 py-12">
      <div className="w-full rounded-3xl border border-border bg-card p-8 [box-shadow:var(--shadow-elevated)]">
        <div className="flex flex-col items-center gap-3">
          <img src={logoAsset.url} alt="Favour Computer Services" className="h-16 w-auto object-contain" />
          <h1 className="text-2xl font-bold tracking-tight">{mode === "signin" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to your Favour Computer Services account" : "Join Favour Computer Services in seconds"}
          </p>
        </div>

        <button
          onClick={google}
          className="mt-6 flex h-11 w-full items-center justify-center gap-3 rounded-full border border-border bg-background text-sm font-semibold transition hover:bg-secondary"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.3C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8L6.1 32.6C9.4 39.6 16.1 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.5 5.3C41.9 35.9 44 30.4 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none ring-ring/30 focus:ring-2"
          />
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none ring-ring/30 focus:ring-2"
          />
          <button
            disabled={loading}
            className="h-11 w-full rounded-full bg-foreground text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-50"
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