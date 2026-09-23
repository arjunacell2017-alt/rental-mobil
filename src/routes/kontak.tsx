import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Instagram, MapPin } from "lucide-react";
import { business } from "@/data/business";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { BookingForm } from "@/components/booking-form";
import { Section } from "@/components/sections";

const title = "Kontak & Booking — ARJUNA TRANS.ID Purbalingga";
const description =
  "Hubungi ARJUNA TRANS.ID untuk rental mobil di Purbalingga, Banyumas, Cilacap, dan Banjarnegara. WhatsApp 085104714711 atau isi form booking cepat.";

export const Route = createFileRoute("/kontak")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: KontakPage,
});

function KontakPage() {
  return (
    <Section
      title="Hubungi ARJUNA TRANS.ID"
      subtitle="Konsultasi dan booking paling cepat melalui WhatsApp. Kami siap membantu kebutuhan perjalanan Anda."
    >
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card"
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-primary">
              <MessageCircle className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display font-bold text-primary">
                WhatsApp
              </span>
              <span className="block text-sm text-muted-foreground">
                {business.whatsappDisplay}
              </span>
            </span>
          </a>

          <a
            href={business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card"
          >
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Instagram className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display font-bold text-primary">
                Instagram
              </span>
              <span className="block text-sm text-muted-foreground">
                {business.instagramHandle}
              </span>
            </span>
          </a>

          <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display font-bold text-primary">
                Alamat
              </span>
              <span className="block text-sm text-muted-foreground">
                {business.address.line1}
                <br />
                {business.address.line2}
              </span>
            </span>
          </div>

          <div className="rounded-3xl bg-surface p-6">
            <h2 className="font-display text-base font-bold text-primary">
              Area Layanan
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {business.areas.join(", ")}. Perjalanan luar kota dapat
              dikonsultasikan melalui WhatsApp.
            </p>
          </div>
        </div>

        <BookingForm />
      </div>
    </Section>
  );
}
