import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  LayoutDashboard, Car, Map, Sparkles, HelpCircle, MessageSquareQuote, Settings, LogOut, Handshake, Menu, X, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin — ARJUNA TRANS.ID" }, { name: "robots", content: "noindex" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/admin/login" });
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) throw redirect({ to: "/admin/login" });
    return { user: data.user };
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/armada", label: "Armada", icon: Car },
  { to: "/admin/partners", label: "Partner", icon: Handshake },
  { to: "/admin/tour", label: "Paket Tour", icon: Map },
  { to: "/admin/layanan", label: "Layanan", icon: Sparkles },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/testimonial", label: "Testimonial", icon: MessageSquareQuote },
  { to: "/admin/settings", label: "Pengaturan", icon: Settings },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function logout() {
    await qc.cancelQueries();
    qc.removeQueries({ queryKey: ["admin"] });
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <p className="mb-4 px-3 font-display text-lg font-extrabold text-primary">ARJUNA Admin</p>
      {nav.map((n) => (
        <Link
          key={n.to}
          to={n.to}
          activeOptions={{ exact: "exact" in n }}
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary"
          activeProps={{ className: "bg-secondary text-primary" }}
        >
          <n.icon className="size-4" /> {n.label}
        </Link>
      ))}
      <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-primary">
        <ExternalLink className="size-4" /> Lihat Website
      </a>
      <div className="mt-auto border-t border-border pt-4">
        <p className="truncate px-3 text-xs text-muted-foreground">{user.email}</p>
        <button onClick={logout} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10">
          <LogOut className="size-4" /> Logout
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 hidden w-60 border-r border-border bg-background lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <span className="font-display font-extrabold text-primary">ARJUNA Admin</span>
        <button onClick={() => setOpen(true)} aria-label="Buka menu" className="rounded-lg p-2 hover:bg-secondary"><Menu className="size-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-background shadow-card">
            <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="absolute top-4 right-3 rounded-lg p-1 hover:bg-secondary"><X className="size-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <main className="p-4 sm:p-6 lg:ml-60 lg:p-8">
        <div className="mx-auto max-w-6xl"><Outlet /></div>
      </main>
    </div>
  );
}
