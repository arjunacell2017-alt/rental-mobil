import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin_/setup")({
  ssr: false,
  head: () => ({ meta: [{ title: "Setup Admin — ARJUNA TRANS.ID" }, { name: "robots", content: "noindex" }] }),
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "locked" | "signup" | "claim" | "sent">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: exists } = await supabase.rpc("admin_exists");
      if (exists) return setState("locked");
      const { data } = await supabase.auth.getUser();
      setState(data.user ? "claim" : "signup");
    })();
  }, []);

  async function signup(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/admin/setup` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setState(data.session ? "claim" : "sent");
  }

  async function claim() {
    setBusy(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setBusy(false);
    if (error || !data) {
      setError("Gagal: admin sudah ada atau sesi tidak valid.");
      return setState("locked");
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card">
        <h1 className="font-display text-2xl font-extrabold text-primary">Buat Admin Pertama</h1>
        {state === "loading" && <Loader2 className="mt-6 size-5 animate-spin text-muted-foreground" />}
        {state === "locked" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Admin sudah dibuat. Halaman ini terkunci.{" "}
            <Link to="/admin/login" className="font-semibold text-primary underline">Ke halaman login</Link>
          </p>
        )}
        {state === "sent" && (
          <p className="mt-4 text-sm text-muted-foreground">
            Kami mengirim link konfirmasi ke <b>{email}</b>. Klik link tersebut, lalu Anda akan kembali ke halaman ini untuk mengaktifkan akses admin.
          </p>
        )}
        {state === "claim" && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">Akun Anda siap. Klik tombol di bawah untuk menjadikannya admin.</p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={claim} disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Jadikan saya admin
            </Button>
          </div>
        )}
        {state === "signup" && (
          <form onSubmit={signup} className="mt-6 space-y-4">
            <p className="text-sm text-muted-foreground">Hanya bisa dipakai sekali, selama belum ada admin.</p>
            <div>
              <Label htmlFor="email" className="mb-1.5 block">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password" className="mb-1.5 block">Password (min. 8 karakter)</Label>
              <Input id="password" type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="size-4 animate-spin" />} Daftar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
