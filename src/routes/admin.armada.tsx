import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CrudPage, Thumb, type Field } from "@/components/admin/crud-page";
import { uploadImage, removeImage, useImageUrl, validateImage } from "@/lib/admin-media";
import { formatRupiah } from "@/lib/site-content";

export const Route = createFileRoute("/admin/armada")({ component: ArmadaAdmin });

const fields: Field[] = [
  { name: "name", label: "Nama kendaraan", type: "text", required: true, placeholder: "Toyota Innova Reborn" },
  { name: "slug", label: "Slug", type: "slug", required: true, slugFrom: "name", help: "Otomatis dari nama; huruf kecil & tanda hubung." },
  { name: "image_url", label: "Foto utama", type: "image", folder: "vehicles" },
  { name: "price_per_day", label: "Harga mulai (Rp / hari)", type: "number", placeholder: "Kosongkan = Harga via WhatsApp" },
  { name: "capacity", label: "Kapasitas penumpang", type: "text", placeholder: "7 penumpang" },
  { name: "transmission", label: "Transmisi", type: "text", placeholder: "Automatic" },
  { name: "year", label: "Tahun kendaraan", type: "number", placeholder: "2022" },
  { name: "with_driver", label: "Dengan driver", type: "switch" },
  { name: "self_drive", label: "Lepas kunci", type: "switch" },
  { name: "description", label: "Deskripsi", type: "textarea" },
];

function ArmadaAdmin() {
  return (
    <CrudPage
      table="vehicles"
      title="Armada"
      description="Kelola kendaraan yang tampil di website."
      singular="Armada"
      fields={fields}
      searchKeys={["name", "slug", "transmission"]}
      defaults={{ name: "", slug: "", capacity: "", transmission: "", description: "", with_driver: true, self_drive: false, price_per_day: "", year: "", image_url: null }}
      columns={[
        { label: "Foto", render: (r) => <Thumb path={r.image_url} /> },
        { label: "Nama", render: (r) => <div><p className="font-semibold text-primary">{r.name}</p><p className="text-xs text-muted-foreground">{r.capacity} · {r.transmission}</p></div> },
        { label: "Harga", className: "hidden sm:table-cell", render: (r) => (r.price_per_day ? `${formatRupiah(r.price_per_day)}/hari` : <span className="text-muted-foreground">Via WhatsApp</span>) },
      ]}
      extraEdit={(row) => <Gallery vehicleId={row.id} />}
    />
  );
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
