
create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "Users read own roles" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

-- admin_profiles
create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.admin_profiles to authenticated;
grant all on public.admin_profiles to service_role;
alter table public.admin_profiles enable row level security;
create policy "Admins manage admin profiles" on public.admin_profiles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_admin_profiles_updated before update on public.admin_profiles for each row execute function public.set_updated_at();

-- vehicles
create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  price_per_day integer,
  capacity text not null default '',
  transmission text not null default '',
  year integer,
  with_driver boolean not null default true,
  self_drive boolean not null default false,
  description text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.vehicles to anon;
grant select, insert, update, delete on public.vehicles to authenticated;
grant all on public.vehicles to service_role;
alter table public.vehicles enable row level security;
create policy "Public read active vehicles" on public.vehicles for select to anon, authenticated using (is_active = true);
create policy "Admins manage vehicles" on public.vehicles for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_vehicles_updated before update on public.vehicles for each row execute function public.set_updated_at();

-- vehicle_images
create table public.vehicle_images (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.vehicle_images(vehicle_id);
grant select on public.vehicle_images to anon;
grant select, insert, update, delete on public.vehicle_images to authenticated;
grant all on public.vehicle_images to service_role;
alter table public.vehicle_images enable row level security;
create policy "Public read images of active vehicles" on public.vehicle_images for select to anon, authenticated
  using (exists (select 1 from public.vehicles v where v.id = vehicle_id and v.is_active = true));
create policy "Admins manage vehicle images" on public.vehicle_images for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_vehicle_images_updated before update on public.vehicle_images for each row execute function public.set_updated_at();

-- tour_packages
create table public.tour_packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  destination text not null default '',
  duration text not null default '',
  price_from integer,
  image_url text,
  description text not null default '',
  highlight text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.tour_packages to anon;
grant select, insert, update, delete on public.tour_packages to authenticated;
grant all on public.tour_packages to service_role;
alter table public.tour_packages enable row level security;
create policy "Public read active tours" on public.tour_packages for select to anon, authenticated using (is_active = true);
create policy "Admins manage tours" on public.tour_packages for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_tours_updated before update on public.tour_packages for each row execute function public.set_updated_at();

-- services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  icon text not null default 'Car',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.services to anon;
grant select, insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "Public read active services" on public.services for select to anon, authenticated using (is_active = true);
create policy "Admins manage services" on public.services for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_services_updated before update on public.services for each row execute function public.set_updated_at();

-- faqs
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy "Public read active faqs" on public.faqs for select to anon, authenticated using (is_active = true);
create policy "Admins manage faqs" on public.faqs for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_faqs_updated before update on public.faqs for each row execute function public.set_updated_at();

-- testimonials
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default '',
  avatar_url text,
  rating integer not null default 5 check (rating between 1 and 5),
  review text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.testimonials to anon;
grant select, insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;
create policy "Public read active testimonials" on public.testimonials for select to anon, authenticated using (is_active = true);
create policy "Admins manage testimonials" on public.testimonials for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_testimonials_updated before update on public.testimonials for each row execute function public.set_updated_at();

-- business_settings (single row)
create table public.business_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique,
  name text not null default 'ARJUNA TRANS.ID',
  tagline text not null default 'Rental Mobil & Tour Travel',
  whatsapp_number text not null default '6285104714711',
  whatsapp_display text not null default '085104714711',
  instagram_handle text not null default '@arjunatrans.id',
  instagram_url text not null default 'https://instagram.com/arjunatrans.id',
  address_line1 text not null default '',
  address_line2 text not null default '',
  areas text[] not null default '{}',
  operating_hours text not null default '',
  description text not null default '',
  logo_url text,
  default_whatsapp_message text not null default 'Halo ARJUNA TRANS.ID, saya ingin bertanya mengenai rental mobil.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.business_settings to anon;
grant select, insert, update, delete on public.business_settings to authenticated;
grant all on public.business_settings to service_role;
alter table public.business_settings enable row level security;
create policy "Public read settings" on public.business_settings for select to anon, authenticated using (true);
create policy "Admins manage settings" on public.business_settings for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create trigger trg_settings_updated before update on public.business_settings for each row execute function public.set_updated_at();

-- first admin
create or replace function public.admin_exists()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where role = 'admin') $$;
grant execute on function public.admin_exists() to anon, authenticated;

create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then return false; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (uid, 'admin');
  insert into public.admin_profiles (id, email)
    select uid, email from auth.users where id = uid
    on conflict (id) do nothing;
  return true;
end $$;
revoke execute on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;

-- seed
insert into public.business_settings (name, tagline, whatsapp_number, whatsapp_display, instagram_handle, instagram_url, address_line1, address_line2, areas, description)
values ('ARJUNA TRANS.ID', 'Rental Mobil & Tour Travel', '6285104714711', '085104714711', '@arjunatrans.id', 'https://instagram.com/arjunatrans.id',
  'BEJI RT 01 RW 01 BOJONGSARI', 'PURBALINGGA, JAWA TENGAH 53362',
  array['Purbalingga','Banyumas','Cilacap','Banjarnegara'],
  'ARJUNA TRANS.ID hadir untuk membantu kebutuhan transportasi perjalanan Anda dengan layanan rental mobil yang praktis, nyaman, dan mudah diakses.');

insert into public.vehicles (name, slug, capacity, transmission, with_driver, self_drive, description, sort_order) values
('Toyota Avanza','toyota-avanza','6–7 penumpang','Manual / Matic',true,true,'Pilihan ekonomis untuk keluarga kecil.',1),
('Toyota Innova','toyota-innova','6–7 penumpang','Manual / Matic',true,true,'Nyaman untuk perjalanan jarak jauh.',2),
('Toyota Innova Reborn','toyota-innova-reborn','6–7 penumpang','Matic',true,true,'Kabin lebih senyap dan lega.',3),
('Toyota Fortuner','toyota-fortuner','6–7 penumpang','Matic',true,false,'Cocok untuk kebutuhan bisnis dan acara resmi.',4),
('Toyota Hiace','toyota-hiace','14–15 penumpang','Manual',true,false,'Pilihan utama untuk rombongan.',5);

insert into public.tour_packages (name, slug, destination, duration, highlight, sort_order) values
('Dieng','dieng','Dieng, Wonosobo','1 hari / bisa disesuaikan','Kawah, telaga warna, dan udara dataran tinggi.',1),
('Yogyakarta','yogyakarta','Yogyakarta','1–2 hari','Wisata kota, budaya, dan kuliner khas Jogja.',2),
('Baturaden','baturaden','Baturaden, Banyumas','1 hari','Wisata alam dekat Purwokerto, cocok untuk keluarga.',3),
('Cilacap','cilacap','Cilacap','1 hari','Pantai dan destinasi pesisir selatan.',4),
('Semarang','semarang','Semarang','1–2 hari','Kota Lama, wisata kota, dan kuliner.',5),
('Bromo','bromo','Bromo, Jawa Timur','2–3 hari','Perjalanan luar kota dengan pemandangan sunrise.',6);

insert into public.services (title, description, icon, sort_order) values
('Rental Mobil Harian','Untuk kebutuhan perjalanan harian dan aktivitas pribadi.','Car',1),
('Rental Mobil + Driver','Nikmati perjalanan dengan lebih nyaman tanpa perlu menyetir sendiri.','UserRound',2),
('Rental Lepas Kunci','Pilihan praktis bagi pelanggan yang ingin berkendara sendiri, sesuai syarat dan ketentuan.','KeyRound',3),
('Airport & Station Transfer','Layanan antar jemput bandara dan stasiun.','Plane',4),
('Tour & Travel','Transportasi wisata untuk keluarga, pasangan, perusahaan, maupun rombongan.','Map',5);

insert into public.faqs (question, answer, sort_order) values
('Apakah tersedia rental mobil tanpa driver?','Ya, layanan lepas kunci tersedia dengan syarat dan ketentuan yang berlaku. Silakan hubungi ARJUNA TRANS.ID melalui WhatsApp untuk informasi terbaru mengenai persyaratannya.',1),
('Apakah tersedia rental mobil dengan driver?','Tersedia. Anda dapat memilih layanan dengan driver agar perjalanan lebih nyaman tanpa perlu menyetir sendiri.',2),
('Apakah bisa perjalanan luar kota?','Bisa. Perjalanan luar kota dapat dikonsultasikan terlebih dahulu melalui WhatsApp agar kami dapat menyesuaikan kendaraan dan jadwalnya.',3),
('Apakah melayani antar jemput bandara?','Ya, kami melayani antar jemput bandara dan stasiun. Silakan informasikan lokasi dan jadwalnya melalui WhatsApp.',4),
('Bagaimana cara booking?','Cukup hubungi kami melalui WhatsApp atau isi form pemesanan cepat di website ini, lalu kirim pesannya. Tim kami akan membalas dengan informasi ketersediaan.',5),
('Apakah bisa rental untuk rombongan?','Bisa. Tersedia kendaraan berkapasitas besar untuk rombongan keluarga, perusahaan, maupun komunitas.',6),
('Apakah bisa request kendaraan tertentu?','Bisa, selama kendaraan tersedia pada tanggal yang Anda inginkan. Silakan sampaikan pilihan kendaraan Anda saat menghubungi kami.',7),
('Bagaimana sistem pembayaran?','Silakan hubungi ARJUNA TRANS.ID melalui WhatsApp untuk informasi terbaru mengenai sistem pembayaran.',8),
('Apakah tersedia paket wisata?','Tersedia. Kami melayani perjalanan wisata ke berbagai destinasi. Itinerary dan harga dapat ditanyakan melalui WhatsApp.',9),
('Area mana saja yang dilayani ARJUNA TRANS.ID?','Purbalingga, Banyumas, Cilacap, dan Banjarnegara. Perjalanan ke luar area tersebut juga dapat dikonsultasikan melalui WhatsApp.',10);
