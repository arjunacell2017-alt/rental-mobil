import { createFileRoute } from "@tanstack/react-router";
import { Section, ServicesGrid, AreaSection, BigCta } from "@/components/sections";

const title = "Layanan Sewa Mobil & Driver Purbalingga — ARJUNA TRANS.ID";
const description =
  "Layanan ARJUNA TRANS.ID: rental mobil harian, rental dengan driver, lepas kunci, airport & station transfer, serta tour & travel di Purbalingga dan sekitarnya.";

export const Route = createFileRoute("/layanan")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LayananPage,
});

function LayananPage() {
  return (
    <>
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
      <BigCta />
    </>
  );
}
