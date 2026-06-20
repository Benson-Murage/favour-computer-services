import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { submitQuote } from "@/lib/quotes.functions";

const SERVICES = [
  "Product Inquiry",
  "Laptop Purchase",
  "Desktop Purchase",
  "CCTV Installation",
  "Live Streaming",
  "Technical Support",
  "General Inquiry",
];

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  service: z.string().min(1, "Please choose a service"),
  message: z.string().trim().min(5, "Tell us a bit more").max(1500),
});

export function QuoteForm({ defaultService }: { defaultService?: string }) {
  const [service, setService] = useState(defaultService ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = useServerFn(submitQuote);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      service: String(fd.get("service") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    try {
      const source = /cctv/i.test(parsed.data.service) ? "cctv"
        : /stream/i.test(parsed.data.service) ? "livestream"
        : /product/i.test(parsed.data.service) ? "product" : "contact";
      await submit({ data: {
        source, name: parsed.data.name, email: parsed.data.email, phone: parsed.data.phone,
        service_type: parsed.data.service, message: parsed.data.message,
        package: "", location: "",
      } });
      setSent(true);
      toast.success("Message received — we'll respond within 1 business day.");
      (e.target as HTMLFormElement).reset();
      setService("");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="mt-6 rounded-2xl border border-border bg-emerald-500/10 p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/20 text-emerald-700 text-2xl">✓</div>
        <h3 className="mt-3 text-lg font-bold">Message received</h3>
        <p className="mt-1 text-sm text-muted-foreground">Our team will reach out within 1 business day.</p>
        <button onClick={()=>setSent(false)} className="mt-4 text-xs font-semibold underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" placeholder="Your name" />
        <Field label="Email address" name="email" type="email" placeholder="you@email.com" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone number" name="phone" type="tel" placeholder="07XX XXX XXX" />
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Service required</span>
          <select
            name="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
          >
            <option value="">Select a service…</option>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message</span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Tell us about your project, devices, or event…"
          className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-11 items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
        <a href="https://wa.me/254726548592" target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-accent-foreground">
          Or WhatsApp us
        </a>
        <span className="text-xs text-muted-foreground">We respond within 1 business day.</span>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", placeholder }: { label: string; name: string; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        required
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}