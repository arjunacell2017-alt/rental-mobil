import { useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ImageInput } from "./image-input";
import { uploadImage, removeImage, useImageUrl } from "@/lib/admin-media";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "switch" | "image" | "select" | "slug";
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  slugFrom?: string;
  folder?: string;
  /** Only render/save this field when the predicate returns true. */
  showIf?: (values: Row) => boolean;
  /** Not a column of the table; handled by afterSave. */
  virtual?: boolean;
};

export type Column = { label: string; render: (row: Row) => ReactNode; className?: string };

function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function Thumb({ path }: { path: string | null }) {
  const url = useImageUrl(path);
  return (
    <div className="size-12 overflow-hidden rounded-lg bg-muted">
      {url && <img src={url} alt="" className="size-full object-cover" />}
    </div>
  );
}

export function CrudPage({
  table,
  title,
  description,
  singular,
  fields,
  columns,
  searchKeys,
  defaults,
  sortable = true,
  hasActive = true,
  extraEdit,
  selectQuery = "*",
  extraFilters,
  rowFilter,
  beforeSave,
  afterSave,
  mapRow,
}: {
  table: string;
  title: string;
  description?: string;
  singular: string;
  fields: Field[];
  columns: Column[];
  searchKeys: string[];
  defaults: Record<string, any>;
  sortable?: boolean;
  hasActive?: boolean;
  extraEdit?: (row: Row) => ReactNode;
  selectQuery?: string;
  extraFilters?: ReactNode;
  rowFilter?: (row: Row) => boolean;
  beforeSave?: (payload: Row, values: Row) => void;
  afterSave?: (id: string, values: Row) => Promise<void>;
  mapRow?: (row: Row) => Row;
}) {
  const qc = useQueryClient();
  const db = supabase.from(table as any) as any;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<any>(null);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [deleting, setDeleting] = useState<Row | null>(null);

  const list = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await db.select(selectQuery).order("sort_order", { ascending: true }).order("created_at");
      if (error) throw error;
      return (mapRow ? (data as Row[]).map(mapRow) : data) as Row[];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", table] });
    qc.invalidateQueries({ queryKey: ["site-content"] });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list.data ?? []).filter((r) => {
      if (hasActive && status === "active" && !r.is_active) return false;
      if (hasActive && status === "inactive" && r.is_active) return false;
      if (rowFilter && !rowFilter(r)) return false;
      if (!q) return true;
      return searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q));
    });
  }, [list.data, search, status, searchKeys, hasActive, rowFilter]);

  const save = useMutation({
    mutationFn: async (values: any) => {
      const payload: any = {};
      for (const f of fields) {
        if (f.virtual || (f.showIf && !f.showIf(values))) continue;
        let v = values[f.name];
        if (f.type === "number") v = v === "" || v == null ? null : Number(v);
        if (f.type === "text" || f.type === "textarea" || f.type === "slug") v = (v ?? "").toString().trim();
        if (f.required && (v === "" || v == null)) throw new Error(`${f.label} wajib diisi`);
        if (f.type === "image") {
          const file = files[f.name];
          if (file) {
            v = await uploadImage(file, f.folder ?? table);
            if (values.id && editing && (editing as Row)[f.name] && (editing as Row)[f.name] !== v) {
              await removeImage((editing as Row)[f.name]);
            }
          }
        }
        payload[f.name] = v;
      }
      if (hasActive) payload.is_active = !!values.is_active;
      beforeSave?.(payload, values);
      if (values.id) {
        const { error } = await db.update(payload).eq("id", values.id);
        if (error) throw error;
        await afterSave?.(values.id, values);
      } else {
        if (sortable) {
          payload.sort_order = Math.max(0, ...(list.data ?? []).map((r) => r.sort_order ?? 0)) + 1;
        }
        const { data: created, error } = await db.insert(payload).select("id").single();
        if (error) throw error;
        await afterSave?.(created.id, values);
      }
    },
    onSuccess: () => {
      toast.success(`${singular} berhasil disimpan`);
      setEditing(null);
      setFiles({});
      refresh();
    },
    onError: (e: any) =>
      toast.error(e?.code === "23505" ? "Slug sudah dipakai, gunakan slug lain." : e?.message ?? "Gagal menyimpan"),
  });

  const toggle = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await db.update({ is_active: !row.is_active }).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status diperbarui"); refresh(); },
    onError: () => toast.error("Gagal mengubah status"),
  });

  const move = useMutation({
    mutationFn: async ({ row, dir }: { row: Row; dir: -1 | 1 }) => {
      const all = list.data ?? [];
      const i = all.findIndex((r) => r.id === row.id);
      const other = all[i + dir];
      if (!other) return;
      const a = row.sort_order ?? i, b = other.sort_order ?? i + dir;
      const r1 = await db.update({ sort_order: a === b ? b + dir : b }).eq("id", row.id);
      const r2 = await db.update({ sort_order: a }).eq("id", other.id);
      if (r1.error || r2.error) throw r1.error ?? r2.error;
    },
    onSuccess: refresh,
    onError: () => toast.error("Gagal mengubah urutan"),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await db.delete().eq("id", row.id);
      if (error) throw error;
      for (const f of fields) if (f.type === "image") await removeImage(row[f.name]);
    },
    onSuccess: () => { toast.success(`${singular} dihapus`); setDeleting(null); refresh(); },
    onError: (e: any) =>
      toast.error(e?.code === "23503" ? "Tidak bisa dihapus karena masih terhubung dengan data lain. Nonaktifkan saja." : "Gagal menghapus"),
  });

  const set = (name: string, value: any) =>
    setEditing((prev: any) => {
      if (!prev) return prev;
      const next = { ...prev, [name]: value };
      for (const f of fields) {
        if (f.type === "slug" && f.slugFrom === name && !prev.id && (!prev[f.name] || prev[f.name] === slugify(prev[name] ?? ""))) {
          next[f.name] = slugify(value);
        }
      }
      return next;
    });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-primary">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <Button onClick={() => { setFiles({}); setEditing({ ...defaults, is_active: true }); }}>
          <Plus className="size-4" /> Tambah {singular}
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Cari..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {hasActive && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
        )}
        {extraFilters}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        {list.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Memuat data...
          </div>
        ) : list.isError ? (
          <div className="p-12 text-center text-sm text-destructive">
            Data gagal dimuat.{" "}
            <button className="underline" onClick={() => list.refetch()}>Coba lagi</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {list.data?.length ? "Tidak ada data yang cocok." : `Belum ada ${singular.toLowerCase()}. Klik "Tambah ${singular}" untuk mulai.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  {columns.map((c) => <th key={c.label} className={`px-4 py-3 font-medium ${c.className ?? ""}`}>{c.label}</th>)}
                  {hasActive && <th className="px-4 py-3 font-medium">Aktif</th>}
                  <th className="px-4 py-3 text-right font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, idx) => (
                  <tr key={row.id} className="border-t border-border align-middle">
                    {columns.map((c) => <td key={c.label} className={`px-4 py-3 ${c.className ?? ""}`}>{c.render(row)}</td>)}
                    {hasActive && (
                      <td className="px-4 py-3">
                        <Switch checked={!!row.is_active} onCheckedChange={() => toggle.mutate(row)} aria-label="Aktif" />
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {sortable && !search && status === "all" && (
                          <>
                            <Button size="icon" variant="ghost" disabled={idx === 0} onClick={() => move.mutate({ row, dir: -1 })} aria-label="Naikkan"><ArrowUp className="size-4" /></Button>
                            <Button size="icon" variant="ghost" disabled={idx === filtered.length - 1} onClick={() => move.mutate({ row, dir: 1 })} aria-label="Turunkan"><ArrowDown className="size-4" /></Button>
                          </>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => { setFiles({}); setEditing(row); }} aria-label="Edit"><Pencil className="size-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleting(row)} aria-label="Hapus"><Trash2 className="size-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && !save.isPending && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? `Edit ${singular}` : `Tambah ${singular}`}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              id="crud-form"
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
            >
              {fields.filter((f) => !f.showIf || f.showIf(editing)).map((f) => {
                const full = f.type === "textarea" || f.type === "image";
                return (
                  <div key={f.name} className={full ? "sm:col-span-2" : ""}>
                    {f.type === "switch" ? (
                      <label className="flex items-center gap-3 pt-6 text-sm font-medium">
                        <Switch checked={!!editing[f.name]} onCheckedChange={(v) => set(f.name, v)} />
                        {f.label}
                      </label>
                    ) : (
                      <>
                        <Label className="mb-1.5 block">{f.label}{f.required && " *"}</Label>
                        {f.type === "textarea" ? (
                          <Textarea rows={4} value={editing[f.name] ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.name, e.target.value)} />
                        ) : f.type === "image" ? (
                          <ImageInput
                            value={editing[f.name] ?? null}
                            file={files[f.name] ?? null}
                            onFile={(file) => setFiles((p) => ({ ...p, [f.name]: file }))}
                            onClear={() => set(f.name, null)}
                          />
                        ) : f.type === "select" ? (
                          <select
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={editing[f.name] ?? ""}
                            onChange={(e) => set(f.name, e.target.value)}
                          >
                            {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                          </select>
                        ) : (
                          <Input
                            type={f.type === "number" ? "number" : "text"}
                            min={f.type === "number" ? 0 : undefined}
                            value={editing[f.name] ?? ""}
                            placeholder={f.placeholder}
                            onChange={(e) => set(f.name, f.type === "slug" ? slugify(e.target.value) : e.target.value)}
                          />
                        )}
                      </>
                    )}
                    {f.help && <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>}
                  </div>
                );
              })}
              {hasActive && (
                <label className="flex items-center gap-3 text-sm font-medium sm:col-span-2">
                  <Switch checked={!!editing.is_active} onCheckedChange={(v) => set("is_active", v)} />
                  Tampilkan di website (aktif)
                </label>
              )}
            </form>
          )}
          {editing?.id && extraEdit?.(editing as Row)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={save.isPending}>Batal</Button>
            <Button type="submit" form="crud-form" disabled={save.isPending}>
              {save.isPending && <Loader2 className="size-4 animate-spin" />} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {singular.toLowerCase()} ini?</AlertDialogTitle>
            <AlertDialogDescription>Data yang dihapus tidak bisa dikembalikan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); deleting && remove.mutate(deleting); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {remove.isPending && <Loader2 className="size-4 animate-spin" />} Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
