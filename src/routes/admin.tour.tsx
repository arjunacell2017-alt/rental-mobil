import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, Thumb } from "@/components/admin/crud-page";
import { formatRupiah } from "@/lib/site-content";

export const Route = createFileRoute("/admin/tour")({ component: TourAdmin });

function TourAdmin() {
  return (
    <CrudPage
      table="tour_packages"
      title="Paket Tour"
      description="Kelola paket wisata yang tampil di website."
      singular="Paket Tour"
      searchKeys={["name", "destination"]}
      defaults={{ name: "", slug: "", destination: "", duration: "", price_from: "", image_url: null, description: "", highlight: "" }}
      fields={[
        { name: "name", label: "Nama paket", type: "text", required: true },
        { name: "slug", label: "Slug", type: "slug", required: true, slugFrom: "name" },
        { name: "destination", label: "Destinasi", type: "text" },
        { name: "duration", label: "Durasi", type: "text", placeholder: "1–2 hari" },
        { name: "price_from", label: "Harga mulai (Rp)", type: "number", placeholder: "Kosongkan = Harga via WhatsApp" },
        { name: "image_url", label: "Foto", type: "image", folder: "tours" },
        { name: "highlight", label: "Highlight", type: "textarea" },
        { name: "description", label: "Deskripsi", type: "textarea" },
      ]}
      columns={[
        { label: "Foto", render: (r) => <Thumb path={r.image_url} /> },
        { label: "Nama", render: (r) => <div><p className="font-semibold text-primary">{r.name}</p><p className="text-xs text-muted-foreground">{r.duration}</p></div> },
        { label: "Harga", className: "hidden sm:table-cell", render: (r) => (r.price_from ? formatRupiah(r.price_from) : <span className="text-muted-foreground">Via WhatsApp</span>) },
      ]}
    />
  );
}
