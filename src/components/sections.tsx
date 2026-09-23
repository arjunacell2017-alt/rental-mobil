import { Link } from "@tanstack/react-router";
import { Check, MessageCircle, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { business, areaDetails } from "@/data/business";
import { services, advantages } from "@/data/services";
import { faqs } from "@/data/faq";
import { testimonials } from "@/data/testimonials";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Section({
  title,
  subtitle,
  children,
  muted = false,
  id,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  muted?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className={muted ? "bg-surface py-16 sm:py-24" : "py-16 sm:py-24"}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-extrabold text-primary sm:text-3xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-base text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export function ServicesGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <div
          key={s.title}
          className="rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card"
        >
          <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-primary">
            <s.icon className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-primary">
            {s.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

export function AreaSection() {
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {areaDetails.map((a) => (
          <div
            key={a.name}
            className="rounded-3xl border border-border bg-card p-6 shadow-soft"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold text-primary">
              {a.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Perjalanan luar kota juga dapat dikonsultasikan terlebih dahulu melalui
        WhatsApp.
      </p>
    </div>
  );
}

export function AdvantagesGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {advantages.map((a) => (
        <div key={a.title} className="rounded-3xl bg-card p-6 shadow-soft">
          <span className="inline-flex size-9 items-center justify-center rounded-full bg-brand-soft text-primary">
            <Check className="size-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-base font-bold text-primary">
            {a.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{a.description}</p>
        </div>
      ))}
    </div>
  );
}

export function TestimonialsGrid() {
  return (
    <div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <figure
            key={i}
            className="rounded-3xl border border-dashed border-border bg-card p-6"
          >
            <div className="text-sm text-brand" aria-label={`${t.rating} dari 5`}>
              {"★".repeat(t.rating)}
            </div>
            <blockquote className="mt-3 text-sm text-muted-foreground">
              {t.review}
            </blockquote>
            <figcaption className="mt-4 text-sm font-semibold text-primary">
              {t.name}
              <span className="block font-normal text-muted-foreground">
                {t.city}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Bagian ini masih berisi konten contoh dan akan diganti dengan review
        pelanggan asli.
      </p>
    </div>
  );
}

export function FaqAccordion({ limit }: { limit?: number }) {
  const items = limit ? faqs.slice(0, limit) : faqs;
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`item-${i}`}>
          <AccordionTrigger className="text-left font-display text-base font-semibold text-primary">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function BigCta() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-4xl bg-primary px-6 py-14 text-center shadow-card sm:px-12">
          <h2 className="font-display text-3xl font-extrabold text-primary-foreground sm:text-4xl">
            Siap Berangkat?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-primary-foreground/80">
            Konsultasikan kebutuhan perjalanan Anda bersama {business.name}.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-brand-foreground transition-all hover:brightness-95"
            >
              <MessageCircle className="size-5" aria-hidden="true" />
              Booking via WhatsApp
            </a>
            <Link
              to="/armada"
              className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/25 px-6 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
            >
              Lihat Armada
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
