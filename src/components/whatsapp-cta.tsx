import { MessageCircle } from "lucide-react";
import { business } from "@/data/business";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function WhatsAppFloating() {
  return (
    <>
      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Hubungi via WhatsApp"
        className="fixed right-4 bottom-20 z-40 inline-flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-card transition-transform hover:scale-105 md:bottom-6"
      >
        <MessageCircle className="size-6" aria-hidden="true" />
      </a>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur md:hidden">
        <a
          href={buildWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-base font-semibold text-brand-foreground"
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          WhatsApp {business.name}
        </a>
      </div>
      <div className="h-20 md:hidden" aria-hidden="true" />
    </>
  );
}
