import { useBusiness, useWa, useSiteContent } from "@/lib/site-content";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Check } from "lucide-react";
import heroCar from "@/assets/hero-car.jpg";
import { BookingForm } from "@/components/booking-form";
import { FleetCard, TourCard } from "@/components/cards";
import {
  Section,
  ServicesGrid,
  AreaSection,
  AdvantagesGrid,
  TestimonialsGrid,
  FaqAccordion,
  BigCta,
} from "@/components/sections";

const title = "Rental Mobil Purbalingga — ARJUNA TRANS.ID | Sewa Mobil & Tour";
const description =
  "Rental mobil dan sewa mobil dengan driver di Purbalingga, Banyumas, Cilacap, dan Banjarnegara. Lepas kunci, airport transfer, dan paket tour. Booking mudah via WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: Index,
});

const trust = [
  "Armada Terawat",
  "Driver Berpengalaman",
  "Booking Mudah",
  "Melayani Luar Kota",
];

const buildJsonLd = (business: ReturnType<typeof useBusiness>) => ({
  "@context": "https://schema.org",
  "@type": "AutoRental",
  name: business.name,
  description: description,
  telephone: "+" + business.whatsappNumber,
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.line1,
    addressLocality: "Purbalingga",
    addressRegion: "Jawa Tengah",
    postalCode: "53362",
    addressCountry: "ID",
  },
  areaServed: business.areas,
  sameAs: [business.instagramUrl],
});

function Index() {
  const business = useBusiness();
  const wa = useWa();
  const content = useSiteContent();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(business)) }}
      />

      <section className="bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2">
          <div className="fade-up">
            <p className="inline-flex rounded-full bg-brand-soft px-4 py-1.5 text-xs font-semibold tracking-wide text-primary uppercase">
              Rental Mobil & Tour Travel
            </p>
            <h1 className="mt-5 font-display text-3xl leading-tight font-extrabold text-primary sm:text-5xl">
              Rental Mobil Nyaman untuk Perjalanan Tanpa Ribet
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              {business.name} melayani rental mobil, sewa mobil dengan driver,
              perjalanan wisata, dan transportasi luar kota di Purbalingga dan
              sekitarnya.
            </p>
            <p className="mt-4 text-sm font-medium text-primary">
              {business.areas.join(" • ")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={wa()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-95"
              >
                <MessageCircle className="size-5" aria-hidden="true" />
                Booking via WhatsApp
              </a>
              <Link
                to="/armada"
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3.5 text-base font-semibold text-primary transition-colors hover:bg-secondary"
              >
                Lihat Armada
              </Link>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {trust.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2 text-sm font-medium text-primary"
                >
                  <Check className="size-4 text-brand" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-4xl bg-card shadow-card">
            <img
              src={heroCar}
              alt="Mobil rental ARJUNA TRANS.ID yang bersih dan siap jalan"
              width={1600}
              height={1104}
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <BookingForm />
        </div>
      </section>

      <Section
        muted
        title="Pilihan Armada untuk Setiap Perjalanan"
        subtitle="Temukan kendaraan yang sesuai untuk perjalanan pribadi, keluarga, bisnis, maupun rombongan."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.vehicles.slice(0, 3).map((item) => (
            <FleetCard key={item.slug} item={item} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/armada"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Lihat Semua Armada
          </Link>
        </div>
      </Section>

      <Section
        title="Layanan ARJUNA TRANS.ID"
        subtitle="Satu partner untuk berbagai kebutuhan perjalanan Anda."
      >
        <ServicesGrid />
      </Section>

      <Section
        muted
        title="Melayani Perjalanan di Purbalingga dan Sekitarnya"
        subtitle="Area layanan utama kami mencakup empat kabupaten berikut."
      >
        <AreaSection />
      </Section>

      <Section
        title="Jelajahi Destinasi Favorit Bersama ARJUNA TRANS.ID"
        subtitle="Perjalanan wisata untuk keluarga, pasangan, perusahaan, maupun rombongan."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {content.tours.slice(0, 3).map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/paket-tour"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Lihat Semua Paket Tour
          </Link>
        </div>
      </Section>

      <Section muted title="Kenapa Memilih ARJUNA TRANS.ID?">
        <AdvantagesGrid />
      </Section>

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
            <h3 className="font-display text-base font-bold text-primary">
              Alamat
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {business.address.line1}
              <br />
              {business.address.line2}
            </p>
            <h3 className="mt-6 font-display text-base font-bold text-primary">
              WhatsApp
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {business.whatsappDisplay}
            </p>
          </div>
        </div>
      </Section>

      {content.testimonials.length > 0 && (
      <Section muted title="Cerita Pelanggan">
        <TestimonialsGrid />
      </Section>
      )}

      <Section title="Pertanyaan yang Sering Diajukan">
        <FaqAccordion limit={5} />
        <div className="mt-8">
          <Link
            to="/faq"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-secondary"
          >
            Lihat Semua FAQ
          </Link>
        </div>
      </Section>

      <BigCta />
    </>
  );
}
