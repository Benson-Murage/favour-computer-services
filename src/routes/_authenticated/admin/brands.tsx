import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Modal } from "@/components/admin/ui";
import { ImagePreview, ImageUrlField } from "@/components/admin/image-input";
import { confirmAction } from "@/components/admin/confirm";
import { listBrandsAdmin, saveBrand, deleteBrand } from "@/lib/admin-crud.functions";

export const Route = createFileRoute("/_authenticated/admin/brands")({ component: BrandsPage });

type Brand = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  sort_order: number | null;
};

function BrandsPage() {
  const qc = useQueryClient();
  const lb = useServerFn(listBrandsAdmin);
  const save = useServerFn(saveBrand);
  const del = useServerFn(deleteBrand);
  const { data } = useQuery({ queryKey: ["adm", "brands"], queryFn: () => lb({}) });
  const [edit, setEdit] = useState<Brand | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <AdminShell title="Brands">
      <div className="mb-4">
        <Btn
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          + Add brand
        </Btn>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Logo</th>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((data ?? []) as Brand[]).map((b) => (
              <tr key={b.id}>
                <td className="p-3">
                  <ImagePreview url={b.logo_url ?? ""} className="h-8 w-8" />
                </td>
                <td className="p-3 font-semibold">{b.name}</td>
                <td className="p-3 text-muted-foreground">{b.slug}</td>
                <td className="p-3 text-right">
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setEdit(b);
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Btn>
                  <Btn
                    variant="danger"
                    className="ml-2"
                    onClick={async () => {
                      const ok = await confirmAction({
                        title: "Delete brand?",
                        message: `${b.name} — this cannot be undone.`,
                        confirmLabel: "Delete",
                        tone: "danger",
                      });
                      if (!ok) return;
                      await del({ data: { id: b.id } });
                      toast.success("Brand deleted successfully");
                      qc.invalidateQueries({ queryKey: ["adm", "brands"] });
                    }}
                  >
                    Delete
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title={edit ? "Edit brand" : "New brand"}>
        <BrandForm
          initial={edit}
          onSave={async (p) => {
            try {
              await save({ data: p as never });
              toast.success("Saved");
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["adm", "brands"] });
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      </Modal>
    </AdminShell>
  );
}
function BrandForm({
  initial,
  onSave,
}: {
  initial: Brand | null;
  onSave: (p: {
    id?: string;
    name: string;
    slug: string;
    logo_url?: string | null;
    sort_order?: number;
  }) => void;
}) {
  const [name, setN] = useState(initial?.name ?? "");
  const [slug, setS] = useState(initial?.slug ?? "");
  const [logo, setL] = useState(initial?.logo_url ?? "");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial?.id, name, slug, logo_url: logo || null });
      }}
      className="grid gap-3"
    >
      <Field label="Name">
        <Input value={name} onChange={(e) => setN(e.target.value)} required />
      </Field>
      <Field label="Slug">
        <Input value={slug} onChange={(e) => setS(e.target.value)} required />
      </Field>
      <ImageUrlField
        label="Logo"
        bucket="brand-logos"
        hint="Upload from computer or paste any logo URL (long URLs welcome)."
        value={logo}
        onChange={setL}
      />
      <div className="flex justify-end">
        <Btn type="submit">Save</Btn>
      </div>
    </form>
  );
}
