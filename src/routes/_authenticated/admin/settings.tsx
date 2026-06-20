import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Textarea } from "@/components/admin/ui";
import { getBusinessSettings, updateBusinessSettings } from "@/lib/settings.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const get = useServerFn(getBusinessSettings);
  const upd = useServerFn(updateBusinessSettings);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["adm","settings"], queryFn: () => get({}) });
  const [form, setForm] = useState<Record<string, string>>({});
  useEffect(() => {
    if (data) {
      setForm(Object.fromEntries(Object.entries(data).map(([k,v]) => [k, v == null ? "" : String(v)])));
    }
  }, [data]);
  const f = (k: string) => form[k] ?? "";
  const set = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const save = async () => {
    try {
      await upd({ data: {
        company_name: f("company_name"),
        business_description: f("business_description"),
        address: f("address"),
        email: f("email"),
        phone: f("phone"),
        whatsapp: f("whatsapp"),
        till_number: f("till_number"),
        paybill_number: f("paybill_number"),
        account_number: f("account_number"),
        payment_instructions: f("payment_instructions"),
        pickup_location: f("pickup_location"),
      }});
      toast.success("Settings saved");
      qc.invalidateQueries({ queryKey: ["adm","settings"] });
      qc.invalidateQueries({ queryKey: ["public","settings"] });
    } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <AdminShell title="Business Settings">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-base font-bold">Company Information</h3>
          <div className="mt-4 grid gap-3">
            <Field label="Company Name"><Input value={f("company_name")} onChange={(e)=>set("company_name", e.target.value)} /></Field>
            <Field label="Description"><Textarea rows={4} value={f("business_description")} onChange={(e)=>set("business_description", e.target.value)} /></Field>
            <Field label="Address"><Textarea rows={2} value={f("address")} onChange={(e)=>set("address", e.target.value)} /></Field>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Email"><Input value={f("email")} onChange={(e)=>set("email", e.target.value)} /></Field>
              <Field label="Phone"><Input value={f("phone")} onChange={(e)=>set("phone", e.target.value)} /></Field>
              <Field label="WhatsApp"><Input value={f("whatsapp")} onChange={(e)=>set("whatsapp", e.target.value)} /></Field>
            </div>
            <Field label="Pickup Location"><Textarea rows={2} value={f("pickup_location")} onChange={(e)=>set("pickup_location", e.target.value)} /></Field>
          </div>
        </Card>
        <Card>
          <h3 className="text-base font-bold">M-Pesa Payment Settings</h3>
          <p className="mt-1 text-xs text-muted-foreground">These appear on checkout and order confirmation pages.</p>
          <div className="mt-4 grid gap-3">
            <Field label="Till Number"><Input value={f("till_number")} onChange={(e)=>set("till_number", e.target.value)} /></Field>
            <Field label="Paybill Number"><Input value={f("paybill_number")} onChange={(e)=>set("paybill_number", e.target.value)} /></Field>
            <Field label="Account Number"><Input value={f("account_number")} onChange={(e)=>set("account_number", e.target.value)} /></Field>
            <Field label="Payment Instructions"><Textarea rows={4} value={f("payment_instructions")} onChange={(e)=>set("payment_instructions", e.target.value)} /></Field>
          </div>
        </Card>
      </div>
      <div className="mt-6"><Btn onClick={save}>Save changes</Btn></div>
    </AdminShell>
  );
}