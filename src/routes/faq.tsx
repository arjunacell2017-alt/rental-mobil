import { createFileRoute } from "@tanstack/react-router";
import { Section, FaqAccordion, BigCta } from "@/components/sections";

const title = "FAQ Rental Mobil Purbalingga — ARJUNA TRANS.ID";
const description =
  "Pertanyaan umum seputar rental mobil dengan driver, lepas kunci, perjalanan luar kota, antar jemput bandara, dan cara booking di ARJUNA TRANS.ID.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <Section
        title="Pertanyaan yang Sering Diajukan"
        subtitle="Belum menemukan jawabannya? Silakan hubungi kami melalui WhatsApp."
      >
        <div className="max-w-3xl">
          <FaqAccordion />
        </div>
      </Section>
      <BigCta />
    </>
  );
}
