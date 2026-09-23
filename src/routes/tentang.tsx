import { createFileRoute } from "@tanstack/react-router";
import { business } from "@/data/business";
import { Section, AdvantagesGrid, TestimonialsGrid, BigCta } from "@/components/sections";

const title = "Tentang ARJUNA TRANS.ID — Rental Mobil Purbalingga";
const description =
  "ARJUNA TRANS.ID adalah layanan rental mobil dan tour travel di Purbalingga, Jawa Tengah, yang melayani perjalanan pribadi, keluarga, bisnis, wisata, dan rombongan.";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TentangPage,
});

function TentangPage() {
  return (
    <>
      <Section title="Partner Perjalanan Anda">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 text-base text-muted-foreground">
            <p>
              {business.name} hadir untuk membantu kebutuhan transportasi
              perjalanan Anda dengan layanan rental mobil yang praktis, nyaman,
              dan mudah diakses.
            </p>
            <p>
              Kami melayani kebutuhan perjalanan pribadi, keluarga, bisnis,
              wisata, maupun rombongan dari Purbalingga dan berbagai daerah di
              sekitarnya.
            </p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-base font-bold text-primary">Alamat</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {business.address.line1}
              <br />
              {business.address.line2}
            </p>
            <h2 className="mt-6 font-display text-base font-bold text-primary">
              Area Layanan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {business.areas.join(", ")}
            </p>
          </div>
        </div>
      </Section>
      <Section muted title="Kenapa Memilih ARJUNA TRANS.ID?">
        <AdvantagesGrid />
      </Section>
      <Section title="Cerita Pelanggan">
        <TestimonialsGrid />
      </Section>
      <BigCta />
    </>
  );
}
