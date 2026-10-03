import { useBusiness, useWa, useSiteContent } from "@/lib/site-content";
import { useState, type FormEvent } from "react";
import { MessageCircle } from "lucide-react";
import { bookingMessage } from "@/lib/whatsapp";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand focus:ring-2 focus:ring-brand/30";

export function BookingForm() {
  const business = useBusiness();
  const wa = useWa();
  const content = useSiteContent();
  const [form, setForm] = useState({
    nama: "",
    nomor: "",
    tanggal: "",
    durasi: "",
    kendaraan: "",
    layanan: "Dengan Driver",
    tujuan: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const url = wa(bookingMessage(form, business.name));
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      try { (window.top ?? window).location.href = url; } catch { window.location.href = url; }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8"
    >
      <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">
        Butuh Mobil untuk Perjalanan?
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Isi data singkat di bawah ini, lalu kirim langsung ke WhatsApp kami.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="nama" className="mb-1.5 block text-sm font-medium">
            Nama
          </label>
          <input
            id="nama"
            required
            className={inputClass}
            placeholder="Nama lengkap"
            value={form.nama}
            onChange={(e) => update("nama", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="nomor" className="mb-1.5 block text-sm font-medium">
            Nomor WhatsApp
          </label>
          <input
            id="nomor"
            required
            inputMode="tel"
            className={inputClass}
            placeholder="08xxxxxxxxxx"
            value={form.nomor}
            onChange={(e) => update("nomor", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tanggal" className="mb-1.5 block text-sm font-medium">
            Tanggal penggunaan
          </label>
          <input
            id="tanggal"
            type="date"
            className={inputClass}
            value={form.tanggal}
            onChange={(e) => update("tanggal", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="durasi" className="mb-1.5 block text-sm font-medium">
            Durasi
          </label>
          <input
            id="durasi"
            className={inputClass}
            placeholder="Contoh: 2 hari"
            value={form.durasi}
            onChange={(e) => update("durasi", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="kendaraan" className="mb-1.5 block text-sm font-medium">
            Pilihan kendaraan
          </label>
          <select
            id="kendaraan"
            className={inputClass}
            value={form.kendaraan}
            onChange={(e) => update("kendaraan", e.target.value)}
          >
            <option value="">Belum menentukan</option>
            {content.vehicles.map((f) => (
              <option key={f.slug} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="layanan" className="mb-1.5 block text-sm font-medium">
            Dengan Driver / Lepas Kunci
          </label>
          <select
            id="layanan"
            className={inputClass}
            value={form.layanan}
            onChange={(e) => update("layanan", e.target.value)}
          >
            <option value="Dengan Driver">Dengan Driver</option>
            <option value="Lepas Kunci">Lepas Kunci</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="tujuan" className="mb-1.5 block text-sm font-medium">
            Tujuan perjalanan
          </label>
          <input
            id="tujuan"
            className={inputClass}
            placeholder="Contoh: Purbalingga - Dieng"
            value={form.tujuan}
            onChange={(e) => update("tujuan", e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-95"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        Cek Ketersediaan via WhatsApp
      </button>
    </form>
  );
}
