import { createFileRoute, Link } from "@tanstack/react-router";
import { CrudPage, type Field } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/partners/")({ component: PartnersAdmin });

const fields: Field[] = [
  { name: "name", label: "Nama partner", type: "text", required: true, placeholder: "Budi" },
  { name: "business_name", label: "Nama usaha", type: "text", placeholder: "Budi Rental" },
  { name: "phone", label: "Telepon", type: "text", placeholder: "08123456789" },
  { name: "whatsapp", label: "WhatsApp", type: "text", placeholder: "08123456789" },
  { name: "city", label: "Kota / area", type: "text", placeholder: "Purbalingga" },
  { name: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Aktif" },
    { value: "inactive", label: "Tidak Aktif" },
  ] },
  { name: "address", label: "Alamat", type: "textarea" },
  { name: "notes", label: "Catatan internal", type: "textarea", placeholder: "Menyediakan Avanza dan Innova." },
];

function PartnersAdmin() {
  return (
    <CrudPage
      table="partners"
      title="Partner"
      description="Data internal pemilik kendaraan partner. Tidak tampil di website."
      singular="Partner"
      fields={fields}
      sortable={false}
      hasActive={false}
      selectQuery="*, vehicles(id)"
      searchKeys={["name", "business_name", "city", "whatsapp", "phone"]}
      defaults={{ name: "", business_name: "", phone: "", whatsapp: "", city: "", address: "", notes: "", status: "active" }}
      columns={[
        { label: "Partner", render: (r) => (
          <Link to="/admin/partners/$id" params={{ id: r.id }} className="block">
            <p className="font-semibold text-primary underline-offset-2 hover:underline">{r.business_name || r.name}</p>
            {r.business_name && <p className="text-xs text-muted-foreground">{r.name}</p>}
          </Link>
        ) },
        { label: "Kontak", className: "hidden sm:table-cell", render: (r) => r.whatsapp || r.phone || "-" },
        { label: "Kota", className: "hidden md:table-cell", render: (r) => r.city || "-" },
        { label: "Armada", render: (r) => r.vehicles?.length ?? 0 },
        { label: "Status", render: (r) => r.status === "active"
          ? <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Aktif</span>
          : <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">Tidak Aktif</span> },
      ]}
    />
  );
}
