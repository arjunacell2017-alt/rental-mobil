import { createFileRoute } from "@tanstack/react-router";
import { fleet } from "@/data/fleet";
import { FleetCard } from "@/components/cards";
import { Section, BigCta } from "@/components/sections";

const title = "Armada Rental Mobil Purbalingga — ARJUNA TRANS.ID";
const description =
  "Pilihan armada rental mobil ARJUNA TRANS.ID: Avanza, Innova, Innova Reborn, Fortuner, dan Hiace. Tersedia dengan driver maupun lepas kunci.";

export const Route = createFileRoute("/armada")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ArmadaPage,
});

function ArmadaPage() {
  return (
    <>
      <Section
        title="Pilihan Armada untuk Setiap Perjalanan"
        subtitle="Temukan kendaraan yang sesuai untuk perjalanan pribadi, keluarga, bisnis, maupun rombongan. Harga dan ketersediaan dapat ditanyakan langsung melalui WhatsApp."
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fleet.map((item) => (
            <FleetCard key={item.slug} item={item} />
          ))}
        </div>
      </Section>
      <BigCta />
    </>
  );
}
