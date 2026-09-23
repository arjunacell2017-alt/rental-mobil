import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, MessageCircle } from "lucide-react";
import { business } from "@/data/business";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const nav = [
  { to: "/", label: "Beranda" },
  { to: "/armada", label: "Armada" },
  { to: "/layanan", label: "Layanan" },
  { to: "/paket-tour", label: "Paket Tour" },
  { to: "/tentang", label: "Tentang Kami" },
  { to: "/faq", label: "FAQ" },
  { to: "/kontak", label: "Kontak" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to="/"
          className="font-display text-base font-extrabold tracking-tight text-primary sm:text-lg"
          onClick={() => setOpen(false)}
        >
          {business.name}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary bg-secondary" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-soft transition-all hover:brightness-95 sm:inline-flex"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            Booking Sekarang
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-primary transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <Menu className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3 sm:px-6">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                onClick={() => setOpen(false)}
                className="rounded-xl px-2 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-base font-semibold text-brand-foreground"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Booking Sekarang
            </a>
          </nav>
        </div>
      )}
      <span className="sr-only">
        <X aria-hidden="true" />
      </span>
    </header>
  );
}
