import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage, Thumb, type Field } from "@/components/admin/crud-page";
import { uploadImage, removeImage, useImageUrl, validateImage } from "@/lib/admin-media";
import { formatRupiah } from "@/lib/site-content";

export const Route = createFileRoute("/admin/armada")({ component: ArmadaAdmin });

type Partner = { id: string; name: string; business_name: string | null; status: string };

export const partnerLabel = (p?: { name: string; business_name: string | null } | null) =>
  p ? p.business_name || p.name : "-";

const statusLabels: Record<string, string> = { available: "Tersedia", maintenance: "Perawatan", unavailable: "Tidak tersedia" };

function buildFields(partners: Partner[]): Field[] {
  const isPartner = (v: any) => v.source_type === "partner";
  return [
    { name: "name", label: "Nama kendaraan", type: "text", required: true, placeholder: "Toyota Innova Reborn" },
    { name: "slug", label: "Slug", type: "slug", required: true, slugFrom: "name", help: "Otomatis dari nama; huruf kecil & tanda hubung." },
    { name: "source_type", label: "Sumber Armada", type: "select", options: [
      { value: "own", label: "Milik ARJUNA TRANS.ID" },
      { value: "partner", label: "Partner" },
    ] },
    { name: "partner_id", label: "Partner", type: "select", required: true, showIf: isPartner, options: [
      { value: "", label: "— Pilih partner —" },
      ...partners.map((p) => ({ value: p.id, label: partnerLabel(p) + (p.status === "active" ? "" : " (Tidak Aktif)") })),
    ], help: partners.some((p) => p.status === "active") ? "Hanya partner aktif yang bisa dipilih." : "Belum ada partner aktif. Tambahkan di menu Partner." },
    { name: "image_url", label: "Foto utama", type: "image", folder: "vehicles" },
    { name: "price_per_day", label: "Harga mulai (Rp / hari)", type: "number", placeholder: "Kosongkan = Harga via WhatsApp" },
    { name: "partner_cost", label: "Biaya partner (Rp / hari) — internal", type: "number", virtual: true, showIf: isPartner, placeholder: "Opsional", help: "Hanya terlihat oleh admin. Margin = harga − biaya partner." },
    { name: "capacity", label: "Kapasitas penumpang", type: "text", placeholder: "7 penumpang" },
    { name: "transmission", label: "Transmisi", type: "text", placeholder: "Automatic" },
    { name: "year", label: "Tahun kendaraan", type: "number", placeholder: "2022" },
    { name: "vehicle_status", label: "Kondisi kendaraan", type: "select", options: Object.entries(statusLabels).map(([value, label]) => ({ value, label })) },
    { name: "with_driver", label: "Dengan driver", type: "switch" },
    { name: "self_drive", label: "Lepas kunci", type: "switch" },
    { name: "description", label: "Deskripsi", type: "textarea" },
  ];
}

function marginOf(r: any) {
  if (r.source_type !== "partner" || r.partner_cost == null || r.price_per_day == null) return null;
  return r.price_per_day - r.partner_cost;
}

function ArmadaAdmin() {
  const qc = useQueryClient();
  const [source, setSource] = useState<"all" | "own" | "partner">("all");
  const [partnerFilter, setPartnerFilter] = useState("");
  const partners = useQuery({
    queryKey: ["admin", "partners"],
    queryFn: async () => {
      const { data, error } = await supabase.from("partners").select("id, name, business_name, status").order("name");
      if (error) throw error;
      return data as Partner[];
    },
  });
  const list = partners.data ?? [];

  const rowFilter = source === "all" ? undefined : (r: any) =>
    r.source_type === source && (source !== "partner" || !partnerFilter || r.partner_id === partnerFilter);

  return (
    <CrudPage
      table="vehicles"
      title="Armada"
      description="Kelola kendaraan milik sendiri dan partner. Info partner tidak tampil di website."
      singular="Armada"
      fields={buildFields(list)}
      selectQuery="*, partners(name, business_name), vehicle_internal(partner_cost)"
      mapRow={(r) => ({ ...r, partner_cost: r.vehicle_internal?.partner_cost ?? "" })}
      searchKeys={["name", "slug", "transmission"]}
      defaults={{ name: "", slug: "", capacity: "", transmission: "", description: "", with_driver: true, self_drive: false, price_per_day: "", year: "", image_url: null, source_type: "own", partner_id: "", partner_cost: "", vehicle_status: "available" }}
      rowFilter={rowFilter}
      extraFilters={
        <>
          <select value={source} onChange={(e) => { setSource(e.target.value as any); setPartnerFilter(""); }} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Sumber armada">
            <option value="all">Semua sumber</option>
            <option value="own">Milik Sendiri</option>
            <option value="partner">Partner</option>
          </select>
          {source === "partner" && (
            <select value={partnerFilter} onChange={(e) => setPartnerFilter(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Pilih partner">
              <option value="">Semua partner</option>
              {list.map((p) => <option key={p.id} value={p.id}>{partnerLabel(p)}</option>)}
            </select>
          )}
        </>
      }
      beforeSave={(payload, values) => validateSource(payload, values, list, qc)}
      afterSave={async (id, values) => {
        const cost = values.source_type === "partner" && values.partner_cost !== "" && values.partner_cost != null ? Number(values.partner_cost) : null;
        const { error } = await supabase.from("vehicle_internal").upsert({ vehicle_id: id, partner_cost: cost });
        if (error) throw error;
        qc.invalidateQueries({ queryKey: ["admin", "partner-detail"] });
      }}
      columns={[
        { label: "Foto", render: (r) => <Thumb path={r.image_url} /> },
        { label: "Kendaraan", render: (r) => <div><p className="font-semibold text-primary">{r.name}</p><p className="text-xs text-muted-foreground">{r.capacity} · {r.transmission}{r.vehicle_status !== "available" && ` · ${statusLabels[r.vehicle_status]}`}</p></div> },
        { label: "Sumber", render: (r) => r.source_type === "partner"
          ? <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">Partner</span>
          : <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Milik Sendiri</span> },
        { label: "Partner", className: "hidden md:table-cell", render: (r) => partnerLabel(r.partners) },
        { label: "Harga", className: "hidden sm:table-cell", render: (r) => (r.price_per_day ? `${formatRupiah(r.price_per_day)}/hari` : <span className="text-muted-foreground">Via WhatsApp</span>) },
        { label: "Margin", className: "hidden lg:table-cell", render: (r) => { const m = marginOf(r); return m == null ? "-" : formatRupiah(m); } },
      ]}
      extraEdit={(row) => <Gallery vehicleId={row.id} />}
    />
  );
}

function validateSource(payload: any, values: any, partners: Partner[], qc: QueryClient) {
  if (payload.source_type !== "partner") {
    payload.source_type = "own";
    payload.partner_id = null;
    return;
  }
  if (!payload.partner_id) throw new Error("Pilih partner untuk armada partner");
  const p = partners.find((x) => x.id === payload.partner_id);
  const rows = (qc.getQueryData(["admin", "vehicles"]) as any[] | undefined) ?? [];
  const original = values.id ? rows.find((r) => r.id === values.id)?.partner_id : null;
  if (p && p.status !== "active" && original !== p.id) throw new Error("Partner tidak aktif tidak bisa dipilih");
}

function GalleryThumb({ path, onDelete }: { path: string; onDelete: () => void }) {
  const url = useImageUrl(path);
  return (
    <div className="relative size-20 overflow-hidden rounded-lg bg-muted">
      {url && <img src={url} alt="" className="size-full object-cover" />}
      <button type="button" onClick={onDelete} className="absolute top-1 right-1 rounded-full bg-background/90 p-1" aria-label="Hapus foto">
        <Trash2 className="size-3 text-destructive" />
      </button>
    </div>
  );
}

function Gallery({ vehicleId }: { vehicleId: string }) {
  const qc = useQueryClient();
  const key = ["admin", "vehicle_images", vehicleId];
  const imgs = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicle_images").select("*").eq("vehicle_id", vehicleId).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const done = () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ["site-content"] }); };
  const add = useMutation({
    mutationFn: async (file: File) => {
      const path = await uploadImage(file, "vehicles");
      const { error } = await supabase.from("vehicle_images").insert({ vehicle_id: vehicleId, image_url: path, sort_order: (imgs.data?.length ?? 0) + 1 });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Foto ditambahkan"); done(); },
    onError: (e: any) => toast.error(e.message ?? "Gagal upload"),
  });
  const del = useMutation({
    mutationFn: async (img: { id: string; image_url: string }) => {
      const { error } = await supabase.from("vehicle_images").delete().eq("id", img.id);
      if (error) throw error;
      await removeImage(img.image_url);
    },
    onSuccess: () => { toast.success("Foto dihapus"); done(); },
    onError: () => toast.error("Gagal menghapus foto"),
  });

  return (
    <div className="border-t border-border pt-4">
      <p className="text-sm font-medium">Foto tambahan</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {imgs.data?.map((i) => <GalleryThumb key={i.id} path={i.image_url} onDelete={() => del.mutate(i)} />)}
        <label className="flex size-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground hover:bg-secondary">
          {add.isPending ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
            const f = e.target.files?.[0]; e.target.value = "";
            if (!f) return; const err = validateImage(f); if (err) return void toast.error(err);
            add.mutate(f);
          }} />
        </label>
      </div>
    </div>
  );
}
