import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";

export type FieldType = "text" | "textarea" | "number" | "boolean" | "image" | "select" | "url";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  imageFolder?: string;
  default?: any;
  placeholder?: string;
  hideInTable?: boolean;
}

export interface ResourceConfig {
  table: string;
  title: string;
  fields: Field[];
  orderBy?: { column: string; ascending?: boolean };
  primaryKey?: string;
  selectColumns?: string;
}

export function ResourceManager({ config }: { config: ResourceConfig }) {
  const qc = useQueryClient();
  const pk = config.primaryKey ?? "id";
  const orderBy = config.orderBy ?? { column: "sort_order", ascending: true };

  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", config.table],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(config.table as any)
        .select(config.selectColumns ?? "*")
        .order(orderBy.column, { ascending: orderBy.ascending ?? true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (record: any) => {
      const cleaned: any = {};
      for (const f of config.fields) {
        let v = record[f.key];
        if (f.type === "number") v = v === "" || v == null ? null : Number(v);
        if (f.type === "boolean") v = !!v;
        cleaned[f.key] = v ?? null;
      }
      if (record[pk]) cleaned[pk] = record[pk];
      const { error } = record[pk]
        ? await supabase.from(config.table as any).update(cleaned).eq(pk, record[pk])
        : await supabase.from(config.table as any).insert(cleaned);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
      toast.success("Saved");
      setEditing(null);
      setCreating(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Save failed"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(config.table as any).delete().eq(pk, id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
      toast.success("Deleted");
    },
    onError: (e: any) => toast.error(e.message ?? "Delete failed"),
  });

  const tableFields = config.fields.filter((f) => !f.hideInTable).slice(0, 4);

  function startCreate() {
    const empty: any = {};
    for (const f of config.fields) empty[f.key] = f.default ?? (f.type === "boolean" ? true : "");
    setEditing(empty);
    setCreating(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black">{config.title}</h2>
        <button
          onClick={startCreate}
          className="rounded-full gradient-pink px-5 py-2 text-sm font-bold text-white shadow-soft"
        >+ New</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              {tableFields.map((f) => (
                <th key={f.key} className="px-4 py-3 font-semibold">{f.label}</th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={tableFields.length + 1} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={tableFields.length + 1} className="px-4 py-8 text-center text-muted-foreground">No items yet.</td></tr>
            ) : rows.map((r: any) => (
              <tr key={r[pk]} className="border-t">
                {tableFields.map((f) => (
                  <td key={f.key} className="px-4 py-3 align-middle max-w-xs truncate">
                    {f.type === "image" && r[f.key] ? (
                      <img src={r[f.key]} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : f.type === "boolean" ? (
                      r[f.key] ? "✓" : "—"
                    ) : (
                      String(r[f.key] ?? "—").slice(0, 80)
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => { setEditing(r); setCreating(false); }}
                    className="text-xs font-semibold text-pink hover:underline mr-3"
                  >Edit</button>
                  <button
                    onClick={() => { if (confirm("Delete this item?")) remove.mutate(r[pk]); }}
                    className="text-xs font-semibold text-destructive hover:underline"
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditDrawer
          fields={config.fields}
          record={editing}
          onChange={setEditing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSave={() => save.mutate(editing)}
          saving={save.isPending}
          isNew={creating}
        />
      )}
    </div>
  );
}

function EditDrawer({
  fields, record, onChange, onClose, onSave, saving, isNew,
}: {
  fields: Field[]; record: any; onChange: (r: any) => void;
  onClose: () => void; onSave: () => void; saving: boolean; isNew: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="w-full max-w-lg bg-white overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
          <h3 className="font-display text-xl font-black">{isNew ? "Create" : "Edit"}</h3>
          <button onClick={onClose} className="text-2xl text-muted-foreground">×</button>
        </div>
        <div className="space-y-4 p-6">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {f.label}{f.required && " *"}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  value={record[f.key] ?? ""}
                  onChange={(e) => onChange({ ...record, [f.key]: e.target.value })}
                  rows={5}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              ) : f.type === "boolean" ? (
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!record[f.key]}
                    onChange={(e) => onChange({ ...record, [f.key]: e.target.checked })}
                  />
                  <span className="text-sm">{f.placeholder ?? "Enabled"}</span>
                </label>
              ) : f.type === "image" ? (
                <ImageUpload
                  value={record[f.key]}
                  onChange={(url) => onChange({ ...record, [f.key]: url })}
                  folder={f.imageFolder}
                />
              ) : f.type === "select" ? (
                <select
                  value={record[f.key] ?? ""}
                  onChange={(e) => onChange({ ...record, [f.key]: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === "number" ? (
                <input
                  type="number"
                  value={record[f.key] ?? ""}
                  onChange={(e) => onChange({ ...record, [f.key]: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              ) : (
                <input
                  type={f.type === "url" ? "url" : "text"}
                  value={record[f.key] ?? ""}
                  onChange={(e) => onChange({ ...record, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              )}
            </div>
          ))}
        </div>
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">
          <button onClick={onClose} className="rounded-full px-5 py-2 text-sm font-semibold">Cancel</button>
          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-full gradient-pink px-6 py-2 text-sm font-bold text-white shadow-soft disabled:opacity-50"
          >{saving ? "Saving…" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
