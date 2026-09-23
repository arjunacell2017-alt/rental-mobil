import { business } from "@/data/business";

export function buildWhatsAppUrl(message?: string) {
  const text = encodeURIComponent(message ?? business.defaultWhatsAppMessage);
  return `https://wa.me/${business.whatsappNumber}?text=${text}`;
}

export function bookingMessage(input: {
  nama: string;
  tanggal: string;
  durasi: string;
  kendaraan: string;
  layanan: string;
  tujuan: string;
  nomor: string;
}) {
  return [
    "Halo ARJUNA TRANS.ID, saya ingin menanyakan rental mobil.",
    "",
    `Nama: ${input.nama || "-"}`,
    `Nomor WhatsApp: ${input.nomor || "-"}`,
    `Tanggal: ${input.tanggal || "-"}`,
    `Durasi: ${input.durasi || "-"}`,
    `Kendaraan: ${input.kendaraan || "-"}`,
    `Dengan Driver/Lepas Kunci: ${input.layanan || "-"}`,
    `Tujuan: ${input.tujuan || "-"}`,
    "",
    "Mohon informasi ketersediaannya.",
  ].join("\n");
}
