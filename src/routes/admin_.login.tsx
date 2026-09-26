import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin_/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Login Admin — ARJUNA TRANS.ID" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAdmin, setNoAdmin] = useState(false);

  useEffect(() => {
    supabase.rpc("admin_exists").then(({ data }) => setNoAdmin(data === false));
    // Already signed in as non-admin? Show message.
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
      if (isAdmin) navigate({ to: "/admin", replace: true });
      else setError("Akun ini tidak memiliki akses admin.");
    });
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      setLoading(false);
      return setError(error?.message === "Email not confirmed" ? "Email belum dikonfirmasi. Cek kotak masuk email Anda." : "Email atau password salah.");
    }
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    if (!isAdmin) {
      await supabase.auth.signOut();
      setLoading(false);
      return setError("Akun ini tidak memiliki akses admin.");
    }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border border-border bg-card p-8 shadow-card">
        <h1 className="font-display text-2xl font-extrabold text-primary">Login Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">ARJUNA TRANS.ID</p>
        <div className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email" className="mb-1.5 block">Email</Label>
            <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password" className="mb-1.5 block">Password</Label>
            <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />} Masuk
          </Button>
        </div>
        {noAdmin && (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum ada admin?{" "}
            <Link to="/admin/setup" className="font-semibold text-primary underline">Buat akun admin pertama</Link>
          </p>
        )}
        <p className="mt-4 text-center text-xs"><a href="/" className="text-muted-foreground hover:text-primary">← Kembali ke website</a></p>
      </form>
    </div>
  );
}
