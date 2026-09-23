import avanza from "@/assets/fleet-avanza.jpg";
import innova from "@/assets/fleet-innova.jpg";
import fortuner from "@/assets/fleet-fortuner.jpg";
import hiace from "@/assets/fleet-hiace.jpg";

export type FleetItem = {
  slug: string;
  name: string;
  image: string;
  capacity: string;
  transmission: string;
  options: string[];
  // Harga belum dikonfirmasi pemilik bisnis — biarkan null sampai tersedia.
  pricePerDay: number | null;
  note?: string;
};

export const fleet: FleetItem[] = [
  {
    slug: "toyota-avanza",
    name: "Toyota Avanza",
    image: avanza,
    capacity: "6–7 penumpang",
    transmission: "Manual / Matic",
    options: ["Dengan Driver", "Lepas Kunci"],
    pricePerDay: null,
    note: "Pilihan ekonomis untuk keluarga kecil.",
  },
  {
    slug: "toyota-innova",
    name: "Toyota Innova",
    image: innova,
    capacity: "6–7 penumpang",
    transmission: "Manual / Matic",
    options: ["Dengan Driver", "Lepas Kunci"],
    pricePerDay: null,
    note: "Nyaman untuk perjalanan jarak jauh.",
  },
  {
    slug: "toyota-innova-reborn",
    name: "Toyota Innova Reborn",
    image: innova,
    capacity: "6–7 penumpang",
    transmission: "Matic",
    options: ["Dengan Driver", "Lepas Kunci"],
    pricePerDay: null,
    note: "Kabin lebih senyap dan lega.",
  },
  {
    slug: "toyota-fortuner",
    name: "Toyota Fortuner",
    image: fortuner,
    capacity: "6–7 penumpang",
    transmission: "Matic",
    options: ["Dengan Driver"],
    pricePerDay: null,
    note: "Cocok untuk kebutuhan bisnis dan acara resmi.",
  },
  {
    slug: "toyota-hiace",
    name: "Toyota Hiace",
    image: hiace,
    capacity: "14–15 penumpang",
    transmission: "Manual",
    options: ["Dengan Driver"],
    pricePerDay: null,
    note: "Pilihan utama untuk rombongan.",
  },
];

export function priceLabel(item: FleetItem) {
  return item.pricePerDay
    ? `Mulai dari Rp ${item.pricePerDay.toLocaleString("id-ID")}/hari`
    : "Harga via WhatsApp";
}
