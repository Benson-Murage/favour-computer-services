import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Btn, Field, Input, Select, Textarea } from "@/components/admin/ui";
import { submitBooking } from "@/lib/quotes.functions";

const schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  event_type: z.string().trim().min(2),
  event_date: z.string().optional(),
  event_location: z.string().trim().min(2),
  package: z.string(),
  requirements: z.string().optional().default(""),
});

export function LiveStreamBookingForm({ packages }: { packages: Array<{ name: string }> }) {
  const submit = useServerFn(submitBooking);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      event_type: String(fd.get("event_type") ?? ""),
      event_date: String(fd.get("event_date") ?? ""),
      event_location: String(fd.get("event_location") ?? ""),
      package: String(fd.get("package") ?? ""),
      requirements: String(fd.get("requirements") ?? ""),
    };
    const p = schema.safeParse(data);
    if (!p.success) {
      toast.error(p.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setBusy(true);
    try {
      await submit({ data: p.data });
      setSent(true);
      toast.success("Booking received!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 text-3xl">
          ✓
        </div>
        <h3 className="mt-3 text-lg font-bold">Booking received</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          We'll confirm availability and follow up within 1 business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <Input name="name" required />
        </Field>
        <Field label="Phone">
          <Input name="phone" required />
        </Field>
      </div>
      <Field label="Email">
        <Input name="email" type="email" required />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Event type">
          <Input name="event_type" placeholder="Wedding, conference, church service…" required />
        </Field>
        <Field label="Event date">
          <Input name="event_date" type="date" required />
        </Field>
      </div>
      <Field label="Event location">
        <Input name="event_location" required />
      </Field>
      <Field label="Package">
        <Select name="package" defaultValue={packages[0]?.name ?? ""} required>
          {packages.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Additional requirements">
        <Textarea name="requirements" rows={4} />
      </Field>
      <div>
        <Btn type="submit" disabled={busy}>
          {busy ? "Sending…" : "Submit booking"}
        </Btn>
      </div>
    </form>
  );
}
