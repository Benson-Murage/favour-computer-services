import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { subscribeNewsletter } from "@/lib/newsletter.functions";

export function NewsletterForm({
  source = "footer",
  dark = true,
}: {
  source?: string;
  dark?: boolean;
}) {
  const subscribe = useServerFn(subscribeNewsletter);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <form
      className="mt-5 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const email = String(fd.get("email") ?? "").trim();
        if (!email) return;
        setBusy(true);
        try {
          await subscribe({ data: { email, source, name: "" } });
          setDone(true);
          toast.success("Subscribed — thanks!");
          form.reset();
        } catch (err) {
          toast.error((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        name="email"
        type="email"
        required
        placeholder="you@email.com"
        className={
          dark
            ? "h-10 flex-1 rounded-full border border-background/20 bg-background/10 px-4 text-sm text-background placeholder:text-background/50 outline-none focus:border-[color:var(--accent)]"
            : "h-10 flex-1 rounded-full border border-border bg-background px-4 text-sm outline-none focus:border-foreground"
        }
      />
      <button
        disabled={busy}
        className={
          dark
            ? "h-10 rounded-full border border-background/30 px-4 text-sm font-semibold text-background transition hover:bg-background/10 disabled:opacity-50"
            : "h-10 rounded-full bg-foreground px-4 text-sm font-semibold text-background disabled:opacity-50"
        }
      >
        {busy ? "…" : done ? "✓" : "Join"}
      </button>
    </form>
  );
}
