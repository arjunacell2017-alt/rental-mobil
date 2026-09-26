import { createFileRoute } from "@tanstack/react-router";
import { CrudPage, Thumb } from "@/components/admin/crud-page";

export const Route = createFileRoute("/admin/testimonial")({ component: TestimonialAdmin });

function TestimonialAdmin() {
  return (
    <CrudPage
      table="testimonials"
      title="Testimonial"
      description="Masukkan hanya review asli dari pelanggan. Bagian testimoni di website otomatis muncul jika ada minimal satu yang aktif."
      singular="Testimonial"
      searchKeys={["name", "city", "review"]}
      defaults={{ name: "", city: "", rating: "5", review: "", avatar_url: null }}
      fields={[
        { name: "name", label: "Nama", type: "text", required: true },
        { name: "city", label: "Kota", type: "text" },
        { name: "rating", label: "Rating", type: "select", options: ["5", "4", "3", "2", "1"].map((v) => ({ value: v, label: `${v} bintang` })) },
        { name: "avatar_url", label: "Foto/avatar (opsional)", type: "image", folder: "testimonials" },
        { name: "review", label: "Isi review", type: "textarea", required: true },
      ]}
      columns={[
        { label: "Foto", render: (r) => <Thumb path={r.avatar_url} /> },
        { label: "Nama", render: (r) => <div><p className="font-semibold text-primary">{r.name}</p><p className="text-xs text-muted-foreground">{r.city} · {"★".repeat(r.rating)}</p></div> },
        { label: "Review", className: "hidden md:table-cell", render: (r) => <p className="line-clamp-2 text-muted-foreground">{r.review}</p> },
      ]}
    />
  );
}
