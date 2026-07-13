import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Textarea } from "@/components/admin/ui";
import { getBusinessSettings, updateBusinessSettings } from "@/lib/settings.functions";
import { ImagePreview, uploadToBucket } from "@/components/admin/image-input";
import { useState as useLocalState } from "react";
import { Upload, X } from "lucide-react";

function ImageUploader({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useLocalState(false);
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-3">
        {value ? (
          <ImagePreview url={value} className="h-24 w-40" />
        ) : (
          <div className="grid h-24 w-40 place-items-center rounded-lg border border-dashed border-border text-[10px] text-muted-foreground">
            No image
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary ${busy ? "pointer-events-none opacity-60" : ""}`}
          >
            <Upload className="h-3.5 w-3.5" />
            {busy ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  setBusy(true);
                  const url = await uploadToBucket("business-assets", file);
                  onChange(url);
                  toast.success(`${label} uploaded`);
                } catch (err) {
                  toast.error((err as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

const TABS = [
  { id: "company", label: "Company" },
  { id: "documents", label: "Documents" },
  { id: "payment", label: "Payment" },
  { id: "social", label: "Social Media" },
  { id: "email", label: "Email" },
  { id: "homepage", label: "Homepage" },
  { id: "about", label: "About Page" },
  { id: "contact", label: "Contact Page" },
] as const;

function SettingsPage() {
  const get = useServerFn(getBusinessSettings);
  const upd = useServerFn(updateBusinessSettings);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adm", "settings"], queryFn: () => get({}) });
  const [form, setForm] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("company");

  useEffect(() => {
    if (data) {
      setForm(
        Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v == null ? "" : String(v)])),
      );
    }
  }, [data]);
  const f = (k: string) => form[k] ?? "";
  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const save = async () => {
    try {
      const payload: Record<string, string> = {};
      [
        "company_name",
        "tagline",
        "business_description",
        "address",
        "email",
        "phone",
        "whatsapp",
        "pickup_location",
        "google_maps_url",
        "website_url",
        "till_number",
        "paybill_number",
        "account_number",
        "payment_instructions",
        "bank_name",
        "bank_account",
        "signature_url",
        "stamp_url",
        "signatory_name",
        "signatory_title",
        "facebook_url",
        "instagram_url",
        "tiktok_url",
        "twitter_url",
        "linkedin_url",
        "youtube_url",
        "whatsapp_url",
        "sender_name",
        "sender_email",
        "hero_title",
        "hero_subtitle",
        "hero_cta_primary_label",
        "hero_cta_primary_url",
        "hero_cta_secondary_label",
        "hero_cta_secondary_url",
        "about_story",
        "about_mission",
        "about_vision",
        "contact_hours",
      ].forEach((k) => {
        payload[k] = f(k);
      });
      await upd({ data: payload as never });
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["adm", "settings"] });
      qc.invalidateQueries({ queryKey: ["public", "settings"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell title="Business Settings">
      <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "company" && (
        <Card>
          <h3 className="text-base font-bold">Company Information</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Updates the site footer, contact page, and metadata.
          </p>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Company Name">
                <Input
                  value={f("company_name")}
                  onChange={(e) => set("company_name", e.target.value)}
                />
              </Field>
              <Field label="Tagline">
                <Input
                  value={f("tagline")}
                  onChange={(e) => set("tagline", e.target.value)}
                  placeholder="e.g. Your trusted technology partner"
                />
              </Field>
            </div>
            <Field label="Business Description">
              <Textarea
                rows={4}
                value={f("business_description")}
                onChange={(e) => set("business_description", e.target.value)}
              />
            </Field>
            <Field label="Address">
              <Textarea
                rows={2}
                value={f("address")}
                onChange={(e) => set("address", e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Email">
                <Input value={f("email")} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={f("phone")} onChange={(e) => set("phone", e.target.value)} />
              </Field>
              <Field label="WhatsApp Number">
                <Input value={f("whatsapp")} onChange={(e) => set("whatsapp", e.target.value)} />
              </Field>
            </div>
            <Field label="Pickup Location">
              <Textarea
                rows={2}
                value={f("pickup_location")}
                onChange={(e) => set("pickup_location", e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Google Maps URL">
                <Input
                  value={f("google_maps_url")}
                  onChange={(e) => set("google_maps_url", e.target.value)}
                  placeholder="https://maps.google.com/…"
                />
              </Field>
              <Field label="Website URL">
                <Input
                  value={f("website_url")}
                  onChange={(e) => set("website_url", e.target.value)}
                  placeholder="https://favourcomputers.co.ke"
                />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {tab === "documents" && (
        <Card>
          <h3 className="text-base font-bold">Receipt & Invoice Branding</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Signature and stamp images appear on all downloadable receipts, invoices, and printed
            documents. Recommended: transparent PNG, 400×160 for signature, 300×300 for stamp.
          </p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <ImageUploader
              label="Authorized Signature"
              value={f("signature_url")}
              onChange={(v) => set("signature_url", v)}
            />
            <ImageUploader
              label="Company Stamp"
              value={f("stamp_url")}
              onChange={(v) => set("stamp_url", v)}
            />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Signatory Name">
              <Input
                value={f("signatory_name")}
                onChange={(e) => set("signatory_name", e.target.value)}
                placeholder="Benson Murage"
              />
            </Field>
            <Field label="Signatory Job Title">
              <Input
                value={f("signatory_title")}
                onChange={(e) => set("signatory_title", e.target.value)}
                placeholder="Managing Director"
              />
            </Field>
          </div>
        </Card>
      )}

      {tab === "payment" && (
        <Card>
          <h3 className="text-base font-bold">M-Pesa Payment Settings</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Reflected instantly on checkout, payment, order, and receipt pages.
          </p>
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Till Number">
                <Input
                  value={f("till_number")}
                  onChange={(e) => set("till_number", e.target.value)}
                />
              </Field>
              <Field label="Paybill Number">
                <Input
                  value={f("paybill_number")}
                  onChange={(e) => set("paybill_number", e.target.value)}
                />
              </Field>
              <Field label="Account Number">
                <Input
                  value={f("account_number")}
                  onChange={(e) => set("account_number", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Payment Instructions">
              <Textarea
                rows={5}
                value={f("payment_instructions")}
                onChange={(e) => set("payment_instructions", e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Bank Name">
                <Input
                  value={f("bank_name")}
                  onChange={(e) => set("bank_name", e.target.value)}
                  placeholder="e.g. Equity Bank"
                />
              </Field>
              <Field label="Bank Account Number">
                <Input
                  value={f("bank_account")}
                  onChange={(e) => set("bank_account", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {tab === "social" && (
        <Card>
          <h3 className="text-base font-bold">Social Media Links</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Used in the footer, contact page, and shareable links. Leave blank to hide an icon.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Facebook URL">
              <Input
                value={f("facebook_url")}
                onChange={(e) => set("facebook_url", e.target.value)}
                placeholder="https://facebook.com/…"
              />
            </Field>
            <Field label="Instagram URL">
              <Input
                value={f("instagram_url")}
                onChange={(e) => set("instagram_url", e.target.value)}
                placeholder="https://instagram.com/…"
              />
            </Field>
            <Field label="TikTok URL">
              <Input
                value={f("tiktok_url")}
                onChange={(e) => set("tiktok_url", e.target.value)}
                placeholder="https://tiktok.com/@…"
              />
            </Field>
            <Field label="X (Twitter) URL">
              <Input
                value={f("twitter_url")}
                onChange={(e) => set("twitter_url", e.target.value)}
                placeholder="https://x.com/…"
              />
            </Field>
            <Field label="LinkedIn URL">
              <Input
                value={f("linkedin_url")}
                onChange={(e) => set("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/company/…"
              />
            </Field>
            <Field label="YouTube URL">
              <Input
                value={f("youtube_url")}
                onChange={(e) => set("youtube_url", e.target.value)}
                placeholder="https://youtube.com/@…"
              />
            </Field>
            <Field label="WhatsApp Chat URL">
              <Input
                value={f("whatsapp_url")}
                onChange={(e) => set("whatsapp_url", e.target.value)}
                placeholder="https://wa.me/254…"
              />
            </Field>
          </div>
        </Card>
      )}

      {tab === "email" && (
        <Card>
          <h3 className="text-base font-bold">Email Configuration</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Sender Name">
              <Input
                value={f("sender_name")}
                onChange={(e) => set("sender_name", e.target.value)}
                placeholder="Favour Computer Services"
              />
            </Field>
            <Field label="Sender Email">
              <Input
                value={f("sender_email")}
                onChange={(e) => set("sender_email", e.target.value)}
                placeholder="bensonmurage254@gmail.com"
              />
            </Field>
          </div>
          <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/40 dark:bg-amber-900/20 dark:text-amber-200">
            <p className="font-semibold">Heads-up about Gmail SMTP</p>
            <p className="mt-1">
              Direct Gmail SMTP (port 465/587 with an app password) cannot run on this serverless
              runtime. All form submissions are still captured in the database and queued in the
              Email Center. To activate real delivery, either: (1) set up a verified sender domain
              through a transactional email provider, or (2) connect a Gmail account through an
              OAuth-based mail integration. Until then, the Email Center shows pending entries you
              can review and resend once delivery is wired.
            </p>
          </div>
        </Card>
      )}

      {tab === "homepage" && (
        <Card>
          <h3 className="text-base font-bold">Homepage Hero</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Override the homepage hero text and call-to-action buttons. Leave blank to keep
            defaults.
          </p>
          <div className="mt-4 grid gap-3">
            <Field label="Hero Title">
              <Input value={f("hero_title")} onChange={(e) => set("hero_title", e.target.value)} />
            </Field>
            <Field label="Hero Subtitle">
              <Textarea
                rows={3}
                value={f("hero_subtitle")}
                onChange={(e) => set("hero_subtitle", e.target.value)}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Primary Button Label">
                <Input
                  value={f("hero_cta_primary_label")}
                  onChange={(e) => set("hero_cta_primary_label", e.target.value)}
                  placeholder="Shop Products"
                />
              </Field>
              <Field label="Primary Button URL">
                <Input
                  value={f("hero_cta_primary_url")}
                  onChange={(e) => set("hero_cta_primary_url", e.target.value)}
                  placeholder="/shop"
                />
              </Field>
              <Field label="Secondary Button Label">
                <Input
                  value={f("hero_cta_secondary_label")}
                  onChange={(e) => set("hero_cta_secondary_label", e.target.value)}
                  placeholder="Get a Quote"
                />
              </Field>
              <Field label="Secondary Button URL">
                <Input
                  value={f("hero_cta_secondary_url")}
                  onChange={(e) => set("hero_cta_secondary_url", e.target.value)}
                  placeholder="/contact"
                />
              </Field>
            </div>
          </div>
        </Card>
      )}

      {tab === "about" && (
        <Card>
          <h3 className="text-base font-bold">About Page Content</h3>
          <div className="mt-4 grid gap-3">
            <Field label="Company Story">
              <Textarea
                rows={5}
                value={f("about_story")}
                onChange={(e) => set("about_story", e.target.value)}
              />
            </Field>
            <Field label="Mission">
              <Textarea
                rows={3}
                value={f("about_mission")}
                onChange={(e) => set("about_mission", e.target.value)}
              />
            </Field>
            <Field label="Vision">
              <Textarea
                rows={3}
                value={f("about_vision")}
                onChange={(e) => set("about_vision", e.target.value)}
              />
            </Field>
          </div>
        </Card>
      )}

      {tab === "contact" && (
        <Card>
          <h3 className="text-base font-bold">Contact Page</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Address, phone, email come from the Company tab. Set opening hours below.
          </p>
          <div className="mt-4 grid gap-3">
            <Field label="Opening Hours">
              <Textarea
                rows={4}
                value={f("contact_hours")}
                onChange={(e) => set("contact_hours", e.target.value)}
                placeholder={"Mon - Sat: 8:00 AM - 7:00 PM\nSun: 10:00 AM - 4:00 PM"}
              />
            </Field>
          </div>
        </Card>
      )}

      <div className="mt-6">
        <Btn onClick={save}>Save changes</Btn>
      </div>
    </AdminShell>
  );
}
