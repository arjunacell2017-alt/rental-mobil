import dieng from "@/assets/tour-dieng.jpg";
import jogja from "@/assets/tour-jogja.jpg";
import baturaden from "@/assets/tour-baturaden.jpg";
import cilacap from "@/assets/tour-cilacap.jpg";
import semarang from "@/assets/tour-semarang.jpg";
import bromo from "@/assets/tour-bromo.jpg";

export type Tour = {
  slug: string;
  name: string;
  image: string;
  duration: string;
  highlight: string;
  // Harga paket belum dikonfirmasi — tetap null sampai tersedia.
  priceFrom: number | null;
};

export const tours: Tour[] = [
  {
    slug: "dieng",
    name: "Dieng",
    image: dieng,
    duration: "1 hari / bisa disesuaikan",
    highlight: "Kawah, telaga warna, dan udara dataran tinggi.",
    priceFrom: null,
  },
  {
    slug: "yogyakarta",
    name: "Yogyakarta",
    image: jogja,
    duration: "1–2 hari",
    highlight: "Wisata kota, budaya, dan kuliner khas Jogja.",
    priceFrom: null,
  },
  {
    slug: "baturaden",
    name: "Baturaden",
    image: baturaden,
    duration: "1 hari",
    highlight: "Wisata alam dekat Purwokerto, cocok untuk keluarga.",
    priceFrom: null,
  },
  {
    slug: "cilacap",
    name: "Cilacap",
    image: cilacap,
    duration: "1 hari",
    highlight: "Pantai dan destinasi pesisir selatan.",
    priceFrom: null,
  },
  {
    slug: "semarang",
    name: "Semarang",
    image: semarang,
    duration: "1–2 hari",
    highlight: "Kota Lama, wisata kota, dan kuliner.",
    priceFrom: null,
  },
  {
    slug: "bromo",
    name: "Bromo",
    image: bromo,
    duration: "2–3 hari",
    highlight: "Perjalanan luar kota dengan pemandangan sunrise.",
    priceFrom: null,
  },
];

export function tourPriceLabel(tour: Tour) {
  return tour.priceFrom
    ? `Mulai dari Rp ${tour.priceFrom.toLocaleString("id-ID")}`
    : "Harga via WhatsApp";
}

export function tourMessage(name: string) {
  return `Halo ARJUNA TRANS.ID, saya tertarik dengan paket tour ${name}. Mohon informasi itinerary dan harganya.`;
}
