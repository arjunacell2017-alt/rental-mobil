import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle, MapPin } from "lucide-react";
import { business } from "@/data/business";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-lg font-extrabold text-primary">
            {business.name}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{business.tagline}</p>
          <a
            href={business.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
          >
            <Instagram className="size-4" aria-hidden="true" />
            Follow Instagram
          </a>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-primary">Area Layanan</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {business.areas.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-primary">Layanan</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/layanan" className="hover:text-primary">
                Rental Mobil
              </Link>
            </li>
            <li>
              <Link to="/layanan" className="hover:text-primary">
                Rental + Driver
              </Link>
            </li>
            <li>
              <Link to="/layanan" className="hover:text-primary">
                Lepas Kunci
              </Link>
            </li>
            <li>
              <Link to="/layanan" className="hover:text-primary">
                Airport Transfer
              </Link>
            </li>
            <li>
              <Link to="/paket-tour" className="hover:text-primary">
                Tour &amp; Travel
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-primary">Kontak</h2>
          <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
            <li>
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-primary"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp: {business.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-primary"
              >
                <Instagram className="size-4" aria-hidden="true" />
                {business.instagramHandle}
              </a>
            </li>
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>
                {business.address.line1}
                <br />
                {business.address.line2}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          © 2026 {business.name}. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
