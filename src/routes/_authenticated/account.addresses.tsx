import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Plus, Star, StarOff, Trash2, MapPin, Pencil } from "lucide-react";
import { Btn, Card, Input } from "@/components/admin/ui";
import {
  listMyAddresses,
  upsertMyAddress,
  deleteMyAddress,
  setDefaultAddress,
} from "@/lib/account.functions";
import {
  LocationPicker,
  StaticMapPreview,
  type PickedLocation,
} from "@/components/location-picker";

export const Route = createFileRoute("/_authenticated/account/addresses")({
  head: () => ({ meta: [{ title: "My Addresses — Favour Computer Services" }] }),
  component: Addresses,
});

type Address = {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
};
type Draft = Partial<Address> & { line1: string };

const empty: Draft = { line1: "", label: "Home", country: "Kenya" };

function Addresses() {
  const list = useServerFn(listMyAddresses);
  const upsert = useServerFn(upsertMyAddress);
  const del = useServerFn(deleteMyAddress);
  const setDef = useServerFn(setDefaultAddress);
  const [rows, setRows] = useState<Address[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    list({})
      .then((d) => setRows(d as Address[]))
      .catch((e) => toast.error((e as Error).message));
  }, [list]);
  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!draft) return;
    if (!draft.line1?.trim()) return toast.error("Street address is required");
    setSaving(true);
    try {
      await upsert({ data: draft as never });
      toast.success("Address saved");
      setDraft(null);
      load();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await del({ data: { id } });
      toast.success("Address deleted");
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await setDef({ data: { id } });
      load();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        to="/account"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to account
      </Link>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Addresses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage shipping addresses for faster checkout.
          </p>
        </div>
        {!draft && (
          <Btn onClick={() => setDraft({ ...empty })}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add address
          </Btn>
        )}
      </div>

      {draft && (
        <Card className="mt-6">
          <h2 className="text-base font-semibold">{draft.id ? "Edit address" : "New address"}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Label">
              <Input
                value={draft.label ?? ""}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Home, Office…"
              />
            </Field>
            <Field label="Recipient name">
              <Input
                value={draft.recipient_name ?? ""}
                onChange={(e) => setDraft({ ...draft, recipient_name: e.target.value })}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={draft.phone ?? ""}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </Field>
            <Field label="Country">
              <Input
                value={draft.country ?? ""}
                onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              />
            </Field>
            <Field label="Street address *" className="sm:col-span-2">
              <Input
                value={draft.line1}
                onChange={(e) => setDraft({ ...draft, line1: e.target.value })}
              />
            </Field>
            <Field label="Apt / suite" className="sm:col-span-2">
              <Input
                value={draft.line2 ?? ""}
                onChange={(e) => setDraft({ ...draft, line2: e.target.value })}
              />
            </Field>
            <Field label="City">
              <Input
                value={draft.city ?? ""}
                onChange={(e) => setDraft({ ...draft, city: e.target.value })}
              />
            </Field>
            <Field label="Region / county">
              <Input
                value={draft.region ?? ""}
                onChange={(e) => setDraft({ ...draft, region: e.target.value })}
              />
            </Field>
            <Field label="Postal code">
              <Input
                value={draft.postal_code ?? ""}
                onChange={(e) => setDraft({ ...draft, postal_code: e.target.value })}
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!draft.is_default}
                onChange={(e) => setDraft({ ...draft, is_default: e.target.checked })}
              />
              Set as default
            </label>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Pin location on map</div>
                <p className="text-xs text-muted-foreground">
                  Use your current location or tap the map. This helps our team find you for
                  delivery.
                </p>
              </div>
              {draft.latitude != null && draft.longitude != null && (
                <Btn
                  variant="ghost"
                  onClick={() => setDraft({ ...draft, latitude: null, longitude: null })}
                >
                  Clear pin
                </Btn>
              )}
            </div>
            <LocationPicker
              value={
                draft.latitude != null && draft.longitude != null
                  ? { lat: draft.latitude, lng: draft.longitude, address: draft.line1 || "" }
                  : null
              }
              onChange={(loc: PickedLocation | null) => {
                if (!loc) return setDraft({ ...draft, latitude: null, longitude: null });
                setDraft({
                  ...draft,
                  latitude: loc.lat,
                  longitude: loc.lng,
                  // Only auto-fill the street when the user hasn't typed one yet.
                  line1: draft.line1?.trim() ? draft.line1 : loc.address,
                });
              }}
              height={300}
            />
          </div>

          <div className="mt-4 flex gap-2">
            <Btn onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save address"}
            </Btn>
            <Btn variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Btn>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-3">
        {rows.length === 0 && !draft ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No saved addresses yet. Add one to speed up checkout.
          </div>
        ) : (
          rows.map((a) => (
            <Card key={a.id} className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{a.label || "Address"}</span>
                  {a.is_default && (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  {a.recipient_name || ""}
                  {a.phone ? ` · ${a.phone}` : ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                </div>
                <div className="text-sm text-muted-foreground">
                  {[a.city, a.region, a.postal_code].filter(Boolean).join(", ")}
                  {a.country ? ` · ${a.country}` : ""}
                </div>
                {a.latitude != null && a.longitude != null && (
                  <div className="mt-3 max-w-md">
                    <StaticMapPreview lat={a.latitude} lng={a.longitude} height={160} />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {a.is_default ? (
                  <Btn variant="ghost" disabled>
                    <StarOff className="mr-1 h-3.5 w-3.5" />
                    Default
                  </Btn>
                ) : (
                  <Btn variant="secondary" onClick={() => makeDefault(a.id)}>
                    <Star className="mr-1 h-3.5 w-3.5" />
                    Make default
                  </Btn>
                )}
                <Btn variant="secondary" onClick={() => setDraft(a)}>
                  <Pencil className="mr-1 h-3.5 w-3.5" />
                  Edit
                </Btn>
                <Btn variant="danger" onClick={() => remove(a.id)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" />
                  Delete
                </Btn>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`grid gap-1 text-xs font-medium text-muted-foreground ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
