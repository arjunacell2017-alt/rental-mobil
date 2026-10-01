import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Thumb } from "@/components/admin/crud-page";
import { formatRupiah } from "@/lib/site-content";

export const Route = createFileRoute("/admin/partners/$id")({ component: PartnerDetail });

function PartnerDetail() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["admin", "partner-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*, vehicles(id, name, image_url, price_per_day, is_active, vehicle_internal(partner_cost))")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (q.isLoading) return <div className="flex items-center gap-2 p-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Memuat...</div>;
  if (q.isError) return <p className="p-12 text-sm text-destructive">Data gagal dimuat.</p>;
  const p = q.data;
  if (!p) return <p className="p-12 text-sm text-muted-foreground">Partner tidak ditemukan.</p>;

  const info: [string, string | null][] = [
    ["Nama partner", p.name], ["Nama usaha", p.business_name], ["Telepon", p.phone], ["WhatsApp", p.whatsapp],
    ["Kota", p.city], ["Alamat", p.address], ["Status", p.status === "active" ? "Aktif" : "Tidak Aktif"], ["Catatan", p.notes],
  ];
  const vehicles = (p.vehicles ?? []) as any[];

  return (
    <div>
      <Link to="/admin/partners" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Partner</Link>
      <h1 className="mt-2 font-display text-2xl font-extrabold text-primary">{p.business_name || p.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{p.city || "-"} · {vehicles.length} kendaraan</p>

      <dl className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        {info.map(([k, v]) => (
          <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-0.5 text-sm font-medium whitespace-pre-line">{v || "-"}</dd></div>
        ))}
      </dl>

      <h2 className="mt-8 font-display text-lg font-bold text-primary">Armada partner</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        {vehicles.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Belum ada kendaraan untuk partner ini.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
              <tr><th className="px-4 py-3">Foto</th><th className="px-4 py-3">Kendaraan</th><th className="px-4 py-3">Harga</th><th className="hidden px-4 py-3 sm:table-cell">Biaya partner</th><th className="hidden px-4 py-3 sm:table-cell">Margin</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const cost = v.vehicle_internal?.partner_cost ?? null;
                const margin = cost != null && v.price_per_day != null ? v.price_per_day - cost : null;
                return (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-4 py-3"><Thumb path={v.image_url} /></td>
                    <td className="px-4 py-3 font-semibold text-primary">{v.name}</td>
                    <td className="px-4 py-3">{v.price_per_day ? formatRupiah(v.price_per_day) : "-"}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">{cost != null ? formatRupiah(cost) : "-"}</td>
                    <td className="hidden px-4 py-3 sm:table-cell">{margin != null ? formatRupiah(margin) : "-"}</td>
                    <td className="px-4 py-3">{v.is_active ? "Aktif" : "Tidak Aktif"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
