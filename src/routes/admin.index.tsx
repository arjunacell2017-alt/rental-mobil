import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, Map, HelpCircle, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [v, t, f] = await Promise.all([
        supabase.from("vehicles").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("tour_packages").select("id", { count: "exact", head: true }),
        supabase.from("faqs").select("id", { count: "exact", head: true }),
      ]);
      if (v.error || t.error || f.error) throw new Error("gagal");
      return { vehicles: v.count ?? 0, tours: t.count ?? 0, faqs: f.count ?? 0 };
    },
  });

  const cards = [
    { label: "Armada aktif", value: stats.data?.vehicles, icon: Car, to: "/admin/armada" as const },
    { label: "Paket tour", value: stats.data?.tours, icon: Map, to: "/admin/tour" as const },
    { label: "FAQ", value: stats.data?.faqs, icon: HelpCircle, to: "/admin/faq" as const },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Ringkasan konten website Anda.</p>
      {stats.isError && <p className="mt-4 text-sm text-destructive">Data gagal dimuat.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card">
            <c.icon className="size-5 text-brand" />
            <p className="mt-3 text-3xl font-extrabold text-primary">
              {stats.isLoading ? <Loader2 className="size-6 animate-spin text-muted-foreground" /> : c.value}
            </p>
            <p className="text-sm text-muted-foreground">{c.label}</p>
          </Link>
        ))}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <Globe className="size-5 text-brand" />
          <p className="mt-3 text-lg font-extrabold text-primary">{stats.isError ? "Bermasalah" : "Online"}</p>
          <p className="text-sm text-muted-foreground">Status website</p>
          <a href="/" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary underline">Buka website</a>
        </div>
      </div>
    </div>
  );
}
