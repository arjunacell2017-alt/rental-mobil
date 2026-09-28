import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import {
  Car, UserRound, KeyRound, Plane, Map, Bus, Briefcase, Heart, Clock, ShieldCheck,
  MapPin, Users, Star, Sparkles, type LucideIcon,
} from "lucide-react";
import { getSiteContent } from "@/lib/site.functions";
import { business as fallbackBusiness } from "@/data/business";
import avanza from "@/assets/fleet-avanza.jpg";
import innova from "@/assets/fleet-innova.jpg";
import fortuner from "@/assets/fleet-fortuner.jpg";
import hiace from "@/assets/fleet-hiace.jpg";
import dieng from "@/assets/tour-dieng.jpg";
import jogja from "@/assets/tour-jogja.jpg";
import baturaden from "@/assets/tour-baturaden.jpg";
import cilacap from "@/assets/tour-cilacap.jpg";
import semarang from "@/assets/tour-semarang.jpg";
import bromo from "@/assets/tour-bromo.jpg";

export type SiteContent = Awaited<ReturnType<typeof getSiteContent>>;
export type Vehicle = SiteContent["vehicles"][number];
export type TourPackage = SiteContent["tours"][number];

export const siteContentQuery = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => getSiteContent(),
  staleTime: 0,
  refetchOnWindowFocus: true,
});

export function useSiteContent() {
  return useSuspenseQuery(siteContentQuery).data;
}

export function useBusiness() {
  const s = useSiteContent().settings;
  if (!s) return fallbackBusiness;
  return {
    name: s.name,
    tagline: s.tagline,
    whatsappNumber: s.whatsapp_number,
    whatsappDisplay: s.whatsapp_display,
    instagramHandle: s.instagram_handle,
    instagramUrl: s.instagram_url,
    address: { line1: s.address_line1, line2: s.address_line2 },
    areas: s.areas,
    defaultWhatsAppMessage: s.default_whatsapp_message,
    operatingHours: s.operating_hours,
    description: s.description,
    logoUrl: s.logo_url,
  };
}

export function useWa() {
  const b = useBusiness();
  return useCallback(
    (message?: string) =>
      `https://wa.me/${b.whatsappNumber}?text=${encodeURIComponent(message ?? b.defaultWhatsAppMessage)}`,
    [b.whatsappNumber, b.defaultWhatsAppMessage],
  );
}

const fallbackImages: Record<string, string> = {
  "toyota-avanza": avanza,
  "toyota-innova": innova,
  "toyota-innova-reborn": innova,
  "toyota-fortuner": fortuner,
  "toyota-hiace": hiace,
  dieng, yogyakarta: jogja, baturaden, cilacap, semarang, bromo,
};

export function imageFor(item: { slug: string; image_url: string | null }) {
  return item.image_url ?? fallbackImages[item.slug] ?? avanza;
}

export const serviceIcons: Record<string, LucideIcon> = {
  Car, UserRound, KeyRound, Plane, Map, Bus, Briefcase, Heart, Clock, ShieldCheck, MapPin, Users, Star, Sparkles,
};

export function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString("id-ID")}`;
}
