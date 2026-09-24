# Admin Dashboard ARJUNA TRANS.ID

Mengubah konten website menjadi bisa dikelola dari dashboard admin, tanpa mengubah tampilan publik.

## Yang akan dibuat

- **Lovable Cloud** diaktifkan: database, login admin, dan penyimpanan foto.
- **Login admin** di `/admin/login` (email + password). Tidak ada pendaftaran publik.
- **Akun admin pertama**: halaman `/admin/setup` yang hanya bisa dipakai sekali, selama belum ada admin. Setelah admin pertama dibuat, halaman ini otomatis terkunci.
- **Dashboard** `/admin` dengan sidebar: Dashboard, Armada, Paket Tour, Layanan, FAQ, Testimonial, Pengaturan, Logout. Ringkasan: jumlah armada aktif, paket tour, FAQ, status website.
- **Kelola Armada** `/admin/armada`: tambah, edit, hapus, aktif/nonaktif; foto utama + foto tambahan dengan preview; harga, kapasitas, transmisi, tahun, dengan driver / lepas kunci, deskripsi.
- **Kelola Paket Tour** `/admin/tour`, **Layanan** `/admin/layanan` (dengan urutan & pilihan ikon), **FAQ** `/admin/faq` (dengan urutan), **Testimonial** `/admin/testimonial` (nama, kota, foto, rating, review).
- **Pengaturan** `/admin/settings`: nama bisnis, WhatsApp, Instagram, alamat, area layanan, jam operasional, deskripsi, logo.
- Setiap halaman: tabel, pencarian, filter status, konfirmasi hapus, notifikasi, tampilan loading/kosong/error, tetap nyaman di ponsel.

## Website publik

- Semua halaman (Beranda, Armada, Paket Tour, Layanan, FAQ, Kontak, footer, tombol WhatsApp) membaca data dari database; hanya data aktif yang tampil.
- Desain, URL, dan tata letak tetap sama. Harga kosong tetap tampil "Harga via WhatsApp".
- Data yang ada sekarang (5 armada, 6 tour, 5 layanan, 10 FAQ, info bisnis) dipindahkan ke database sebagai data awal. Testimoni contoh **tidak** dipindahkan — bagian testimoni disembunyikan sampai ada review asli.

## Keamanan

- Pengunjung hanya bisa membaca data aktif; tidak bisa mengubah atau menghapus.
- Hanya akun dengan peran admin yang bisa masuk dashboard dan mengubah data — dicek di server, bukan di browser.
- Tidak ada password tersimpan di kode website.

## Detail teknis

- Tabel: `vehicles`, `vehicle_images` (FK ke vehicles), `tour_packages`, `services`, `faqs`, `testimonials`, `business_settings` (satu baris), `admin_profiles`, plus `user_roles` + enum `app_role` + fungsi `has_role()` (peran disimpan terpisah). Semua PK UUID, `created_at`/`updated_at` dengan trigger, kolom `is_active` dan `sort_order` bila relevan.
- RLS: `anon`/`authenticated` SELECT hanya `is_active = true`; admin ALL via `has_role(auth.uid(),'admin')`. GRANT eksplisit per tabel.
- Setup admin pertama: fungsi security definer `claim_first_admin()` yang memberi peran admin hanya jika belum ada admin sama sekali. Setelah itu signup dinonaktifkan di pengaturan auth.
- Storage: bucket publik `media` (armada/, tour/, testimonial/, logo/); tulis/hapus hanya admin. Validasi JPG/PNG/WEBP maks 5MB, gambar dikompres & diperkecil di browser (canvas, ~1600px, WebP) sebelum upload.
- Seed data awal lewat migration (INSERT). Foto armada/tour yang ada diunggah sebagai URL awal.
- Route admin di bawah layout `/admin` yang dilindungi (ssr: false, redirect ke `/admin/login`, cek peran admin). Pembacaan publik lewat server function dengan query TanStack (`ensureQueryData` + `useSuspenseQuery`) sehingga SEO tetap terjaga; head() dinamis dari `business_settings`.
- `src/data/*` statis diganti hook/query; `buildWhatsAppUrl()` memakai nomor dari pengaturan.
- Toast via sonner; form dengan react-hook-form + zod.

## Setelah selesai

Saya akan menunjukkan struktur database dan langkah membuat akun admin pertama.
