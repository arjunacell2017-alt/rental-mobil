# ARJUNA TRANS.ID — Website Rental Mobil & Tour Travel

Website profesional, mobile-first, dengan semua tombol booking mengarah ke WhatsApp 6285104714711.

## Tampilan

- Warna: navy tua sebagai warna utama, putih sebagai latar, abu-abu muda untuk section pendukung, aksen hijau/turquoise khusus tombol WhatsApp.
- Huruf: Plus Jakarta Sans (judul) + Inter (teks).
- Sudut membulat 12–20px, bayangan lembut, animasi halus (fade in, hover), banyak ruang kosong.
- Foto kendaraan dan destinasi dibuat sebagai gambar pendukung yang bersih dan premium (bisa diganti kapan saja dengan foto asli Anda).

## Halaman

- **Beranda** — hero (headline, lokasi layanan, tombol "Booking via WhatsApp" + "Lihat Armada", 4 trust indicator), form Quick Booking, sorotan armada, 5 layanan, area layanan, sorotan paket tour, 6 alasan memilih, tentang kami, testimoni, ringkasan FAQ, CTA besar "Siap Berangkat?".
- **Armada** — semua kendaraan (Avanza, Innova, Innova Reborn, Fortuner, Hiace) lengkap: kapasitas, transmisi, pilihan layanan, "Mulai dari Rp —/hari" sebagai placeholder, tombol WhatsApp per mobil.
- **Paket Tour** — Dieng, Yogyakarta, Baturaden, Cilacap, Semarang, Bromo dengan durasi, highlight, harga placeholder, tombol "Tanya Paket" yang mengirim pesan berisi nama destinasi.
- **Layanan**, **Tentang Kami**, **FAQ** (10 pertanyaan, accordion), **Kontak** (WhatsApp, Instagram, alamat).

Navbar sticky dengan menu tersebut + tombol "Booking Sekarang"; di ponsel jadi hamburger. Footer berisi area layanan, layanan, kontak, alamat, dan © 2026.

## WhatsApp

- Tombol mengambang di kanan bawah + sticky bottom CTA di ponsel.
- Form Quick Booking (nama, nomor, tanggal, durasi, kendaraan, dengan driver / lepas kunci, tujuan) menyusun pesan otomatis lalu membuka WhatsApp. Tanpa login, tanpa pembayaran online.

## Konten & harga

Tidak ada harga, klaim, atau testimoni palsu. Harga dan testimoni memakai placeholder bertanda jelas sampai Anda kirim data aslinya. Semua data bisnis (kontak, armada, harga, layanan, tour, FAQ, testimoni) disimpan di satu tempat agar mudah diubah.

## Detail teknis

- TanStack Start + Tailwind; token warna/tipografi di `src/styles.css`, font via `<link>` di `__root.tsx`.
- Data bisnis di `src/data/` (business, fleet, services, tours, faq, testimonials); helper `buildWhatsAppUrl()` di `src/lib/whatsapp.ts`.
- Route terpisah: `/` (index ditulis ulang), `/armada`, `/layanan`, `/paket-tour`, `/tentang`, `/faq`, `/kontak`, masing-masing dengan `head()` sendiri (title, description, OG/Twitter) menyasar kata kunci lokal tanpa keyword stuffing.
- LocalBusiness JSON-LD di halaman beranda; HTML semantik, alt text, gambar lazy-load.
- Tanpa backend, tanpa library berat, tanpa peta interaktif.

## Yang dibutuhkan dari Anda nanti

Foto armada asli, daftar harga, jam operasional, syarat lepas kunci, dan link Instagram final (sementara memakai `instagram.com/arjunatrans.id`).
