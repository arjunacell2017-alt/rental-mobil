import { createFileRoute } from "@tanstack/react-router";
import { tours } from "@/data/tours";
import { TourCard } from "@/components/cards";
import { Section, BigCta } from "@/components/sections";

const title = "Paket Tour & Travel Purbalingga — ARJUNA TRANS.ID";
const description =
  "Paket tour Dieng, Yogyakarta, Baturaden, Cilacap, Semarang, dan Bromo bersama ARJUNA TRANS.ID. Itinerary dan harga dapat ditanyakan via WhatsApp.";

export const Route = createFileRoute("/paket-tour")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: TourPage,
});

function TourPage() {
  return (
    <>
      <Section
        title="Jelajahi Destinasi Favorit Bersama ARJUNA TRANS.ID"
        subtitle="Transportasi wisata untuk keluarga, pasangan, perusahaan, maupun rombongan. Itinerary dapat disesuaikan dengan kebutuhan Anda."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard key={tour.slug} tour={tour} />
          ))}
        </div>
      </Section>
      <BigCta />
    </>
  );
}
