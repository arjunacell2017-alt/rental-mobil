import { MessageCircle, Users, Settings2, Clock, Sparkles } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { priceLabel, type FleetItem } from "@/data/fleet";
import { tourMessage, tourPriceLabel, type Tour } from "@/data/tours";

export function FleetCard({ item }: { item: FleetItem }) {
  const message = `Halo ARJUNA TRANS.ID, saya ingin menanyakan ketersediaan ${item.name}. Mohon informasi harga dan ketentuannya.`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card">
      <div className="aspect-[4/3] overflow-hidden bg-surface">
        <img
          src={item.image}
          alt={`${item.name} untuk rental mobil di Purbalingga`}
          loading="lazy"
          width={1008}
          height={704}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-primary">{item.name}</h3>
        {item.note && (
          <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
        )}
        <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Kapasitas</dt>
            <dd>{item.capacity}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Settings2 className="size-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Transmisi</dt>
            <dd>{item.transmission}</dd>
          </div>
        </dl>
        <div className="mt-4 flex flex-wrap gap-2">
          {item.options.map((opt) => (
            <span
              key={opt}
              className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
            >
              {opt}
            </span>
          ))}
        </div>
        <p className="mt-5 text-sm font-semibold text-primary">{priceLabel(item)}</p>
        <a
          href={buildWhatsAppUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-all hover:brightness-95"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Tanya Ketersediaan
        </a>
      </div>
    </article>
  );
}

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card">
      <div className="aspect-[4/3] overflow-hidden bg-surface">
        <img
          src={tour.image}
          alt={`Paket tour ${tour.name} bersama ARJUNA TRANS.ID`}
          loading="lazy"
          width={1008}
          height={704}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-primary">{tour.name}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" aria-hidden="true" />
          {tour.duration}
        </p>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {tour.highlight}
        </p>
        <p className="mt-5 text-sm font-semibold text-primary">
          {tourPriceLabel(tour)}
        </p>
        <a
          href={buildWhatsAppUrl(tourMessage(tour.name))}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition-all hover:brightness-95"
        >
          <MessageCircle className="size-4" aria-hidden="true" />
          Tanya Paket
        </a>
      </div>
    </article>
  );
}
