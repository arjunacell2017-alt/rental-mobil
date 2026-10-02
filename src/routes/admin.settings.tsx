import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageInput } from "@/components/admin/image-input";
import { uploadImage, removeImage } from "@/lib/admin-media";
import heroDefault from "@/assets/hero-car.jpg";

export const Route = createFileRoute("/admin/settings")({ component: SettingsAdmin });

type Form = {
  id?: string; name: string; tagline: string; whatsapp_number: string; whatsapp_display: string;
  instagram_handle: string; instagram_url: string; address_line1: string; address_line2: string;
  areas: string; operating_hours: string; description: string; logo_url: string | null; hero_image_url: string | null; default_whatsapp_message: string;
};

function toWaNumber(v: string) {
  const d = v.replace(/\D/g, "");
  return d.startsWith("0") ? "62" + d.slice(1) : d;
}

function SettingsAdmin() {
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const [form, setForm] = useState<Form | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [hero, setHero] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (q.data) setForm({ ...q.data, areas: q.data.areas.join("\n") });
  }, [q.data]);

  const set = (k: keyof Form, v: any) => setForm((p) => (p ? { ...p, [k]: v } : p));

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || !form.whatsapp_display.trim()) return void toast.error("Nama bisnis dan WhatsApp wajib diisi");
    setSaving(true);
    try {
      let logo_url = form.logo_url;
      if (logo) {
        logo_url = await uploadImage(logo, "logo");
        if (q.data?.logo_url) await removeImage(q.data.logo_url);
      }
      let hero_image_url = form.hero_image_url;
      if (hero) {
        hero_image_url = await uploadImage(hero, "hero");
        if (q.data?.hero_image_url) await removeImage(q.data.hero_image_url);
      } else if (!hero_image_url && q.data?.hero_image_url) {
        await removeImage(q.data.hero_image_url);
      }
      const payload = {
        name: form.name.trim(), tagline: form.tagline.trim(),
        whatsapp_display: form.whatsapp_display.trim(), whatsapp_number: toWaNumber(form.whatsapp_display),
        instagram_handle: form.instagram_handle.trim(), instagram_url: form.instagram_url.trim(),
        address_line1: form.address_line1.trim(), address_line2: form.address_line2.trim(),
        areas: form.areas.split("\n").map((a) => a.trim()).filter(Boolean),
        operating_hours: form.operating_hours.trim(), description: form.description.trim(),
        default_whatsapp_message: form.default_whatsapp_message.trim(), logo_url, hero_image_url,
      };
      const { error } = form.id
        ? await supabase.from("business_settings").update(payload).eq("id", form.id)
        : await supabase.from("business_settings").insert(payload);
      if (error) throw error;
      setLogo(null);
      toast.success(hero ? "Foto hero berhasil diperbarui." : "Pengaturan disimpan");
      setHero(null);
      qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  if (q.isLoading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Memuat...</div>;
  if (q.isError) return <p className="text-sm text-destructive">Pengaturan gagal dimuat.</p>;
  if (!form) return null;

  const text = (k: keyof Form, label: string, help?: string) => (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      <Input value={(form[k] as string) ?? ""} onChange={(e) => set(k, e.target.value)} />
      {help && <p className="mt-1 text-xs text-muted-foreground">{help}</p>}
    </div>
  );

  return (
    <form onSubmit={save}>
      <h1 className="font-display text-2xl font-extrabold text-primary">Pengaturan Bisnis</h1>
      <p className="mt-1 text-sm text-muted-foreground">Perubahan langsung terlihat di website.</p>
      <div className="mt-6 grid gap-5 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2">
        {text("name", "Nama bisnis")}
        {text("tagline", "Tagline")}
        {text("whatsapp_display", "Nomor WhatsApp", "Contoh: 085104714711")}
        {text("instagram_handle", "Instagram", "Contoh: @arjunatrans.id")}
        {text("instagram_url", "Instagram URL")}
        {text("operating_hours", "Jam operasional", "Contoh: Setiap hari, 06.00–22.00")}
        {text("address_line1", "Alamat (baris 1)")}
        {text("address_line2", "Alamat (baris 2)")}
        <div>
          <Label className="mb-1.5 block">Area layanan</Label>
          <Textarea rows={4} value={form.areas} onChange={(e) => set("areas", e.target.value)} />
          <p className="mt-1 text-xs text-muted-foreground">Satu area per baris.</p>
        </div>
        <div>
          <Label className="mb-1.5 block">Pesan WhatsApp default</Label>
          <Textarea rows={4} value={form.default_whatsapp_message} onChange={(e) => set("default_whatsapp_message", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Deskripsi bisnis</Label>
          <Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Foto Hero Beranda</Label>
          <ImageInput value={form.hero_image_url} file={hero} onFile={setHero} onClear={() => set("hero_image_url", null)} fallback={heroDefault} />
          <p className="mt-1 text-xs text-muted-foreground">Foto besar di halaman Beranda. Kosongkan untuk memakai foto bawaan.</p>
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Logo</Label>
          <ImageInput value={form.logo_url} file={logo} onFile={setLogo} onClear={() => set("logo_url", null)} />
        </div>
      </div>
      <Button type="submit" className="mt-6" disabled={saving}>
        {saving && <Loader2 className="size-4 animate-spin" />} Simpan Pengaturan
      </Button>
    </form>
  );
}
