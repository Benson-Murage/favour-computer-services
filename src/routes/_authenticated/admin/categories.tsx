import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { Btn, Card, Field, Input, Modal } from "@/components/admin/ui";
import { confirmAction } from "@/components/admin/confirm";
import { listCategoriesAdmin, saveCategory, deleteCategory } from "@/lib/admin-crud.functions";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesPage,
});

type Cat = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number | null;
};

function CategoriesPage() {
  const qc = useQueryClient();
  const lc = useServerFn(listCategoriesAdmin);
  const save = useServerFn(saveCategory);
  const del = useServerFn(deleteCategory);
  const { data } = useQuery({ queryKey: ["adm", "cats"], queryFn: () => lc({}) });
  const [edit, setEdit] = useState<Cat | null>(null);
  const [open, setOpen] = useState(false);
  return (
    <AdminShell title="Categories">
      <div className="mb-4">
        <Btn
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          + Add category
        </Btn>
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Sort</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {((data ?? []) as Cat[]).map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-semibold">{c.name}</td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3">{c.sort_order ?? 0}</td>
                <td className="p-3 text-right">
                  <Btn
                    variant="ghost"
                    onClick={() => {
                      setEdit(c);
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
                        title: "Delete category?",
                        message: `${c.name} — products in this category will be uncategorized.`,
                        confirmLabel: "Delete",
                        tone: "danger",
                      });
                      if (!ok) return;
                      await del({ data: { id: c.id } });
                      toast.success("Category deleted successfully");
                      qc.invalidateQueries({ queryKey: ["adm", "cats"] });
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
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? "Edit category" : "New category"}
      >
        <CatForm
          initial={edit}
          onSave={async (p) => {
            try {
              await save({ data: p as never });
              toast.success("Saved");
              setOpen(false);
              qc.invalidateQueries({ queryKey: ["adm", "cats"] });
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        />
      </Modal>
    </AdminShell>
  );
}
function CatForm({
  initial,
  onSave,
}: {
  initial: Cat | null;
  onSave: (p: {
    id?: string;
    name: string;
    slug: string;
    icon?: string;
    sort_order?: number;
  }) => void;
}) {
  const [name, setN] = useState(initial?.name ?? "");
  const [slug, setS] = useState(initial?.slug ?? "");
  const [sort, setSo] = useState(String(initial?.sort_order ?? 0));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial?.id, name, slug, sort_order: Number(sort) || 0 });
      }}
      className="grid gap-3"
    >
      <Field label="Name">
        <Input value={name} onChange={(e) => setN(e.target.value)} required />
      </Field>
      <Field label="Slug">
        <Input value={slug} onChange={(e) => setS(e.target.value)} required />
      </Field>
      <Field label="Sort order">
        <Input type="number" value={sort} onChange={(e) => setSo(e.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Btn type="submit">Save</Btn>
      </div>
    </form>
  );
}
