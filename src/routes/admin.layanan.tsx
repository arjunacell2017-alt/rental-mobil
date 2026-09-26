import { createFileRoute } from "@tanstack/react-router";
import { Car } from "lucide-react";
import { CrudPage } from "@/components/admin/crud-page";
import { serviceIcons } from "@/lib/site-content";

export const Route = createFileRoute("/admin/layanan")({ component: LayananAdmin });

function LayananAdmin() {
  return (
    <CrudPage
      table="services"
      title="Layanan"
      description="Atur layanan dan urutannya dengan tombol panah."
      singular="Layanan"
      searchKeys={["title", "description"]}
      defaults={{ title: "", description: "", icon: "Car" }}
      fields={[
        { name: "title", label: "Nama layanan", type: "text", required: true },
        { name: "icon", label: "Ikon", type: "select", options: Object.keys(serviceIcons).map((k) => ({ value: k, label: k })) },
        { name: "description", label: "Deskripsi", type: "textarea" },
      ]}
      columns={[
        { label: "Ikon", render: (r) => { const I = serviceIcons[r.icon] ?? Car; return <I className="size-5 text-primary" />; } },
        { label: "Layanan", render: (r) => <div><p className="font-semibold text-primary">{r.title}</p><p className="line-clamp-1 text-xs text-muted-foreground">{r.description}</p></div> },
      ]}
    />
  );
}
