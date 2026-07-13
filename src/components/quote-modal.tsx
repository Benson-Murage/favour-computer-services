import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Btn, Field, Input, Modal, Textarea } from "@/components/admin/ui";
import { submitQuote } from "@/lib/quotes.functions";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  location: z.string().trim().optional().default(""),
  message: z.string().trim().optional().default(""),
});

export function QuoteModal({
  open,
  onClose,
  source,
  packageName,
  title,
  productId,
  showLocation = true,
}: {
  open: boolean;
  onClose: () => void;
  source: "cctv" | "livestream" | "product" | "contact" | "general";
  packageName?: string;
  title?: string;
  productId?: string;
  showLocation?: boolean;
}) {
  const submit = useServerFn(submitQuote);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      location: fd.get("location") ?? "",
      message: fd.get("message") ?? "",
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    setBusy(true);
    try {
      await submit({
        data: {
          source,
          name: parsed.data.name,
          email: parsed.data.email,
          phone: parsed.data.phone,
          package: packageName ?? "",
          location: parsed.data.location ?? "",
          message: parsed.data.message ?? "",
          product_id: productId,
          service_type: title ?? "",
        },
      });
      setSent(true);
      toast.success("Request received — we'll be in touch shortly.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose();
        setTimeout(() => setSent(false), 200);
      }}
      title={title ?? "Request a quote"}
    >
      {sent ? (
        <div className="grid place-items-center gap-3 py-8 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 text-3xl">
            ✓
          </div>
          <h3 className="text-lg font-bold">Thank you!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            We've received your request{packageName ? ` for the ${packageName} package` : ""}. Our
            team will reach out within 1 business day.
          </p>
          <Btn onClick={onClose}>Close</Btn>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-3">
          {packageName && (
            <div className="rounded-lg bg-secondary px-3 py-2 text-xs">
              <span className="font-semibold">Package:</span> {packageName}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="name" required placeholder="Your name" />
            </Field>
            <Field label="Phone">
              <Input name="phone" required placeholder="07XX XXX XXX" />
            </Field>
          </div>
          <Field label="Email">
            <Input name="email" type="email" required placeholder="you@email.com" />
          </Field>
          {showLocation && (
            <Field label="Installation / event location">
              <Input name="location" placeholder="Estate, building, town…" />
            </Field>
          )}
          <Field label="Additional notes">
            <Textarea name="message" rows={4} placeholder="Tell us more about your needs…" />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Btn type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send request"}
            </Btn>
          </div>
        </form>
      )}
    </Modal>
  );
}
