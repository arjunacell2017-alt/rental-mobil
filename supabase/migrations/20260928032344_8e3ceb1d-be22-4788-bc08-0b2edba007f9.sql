CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  business_name text,
  phone text NOT NULL DEFAULT '',
  whatsapp text,
  address text,
  city text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage partners" ON public.partners FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_partners_updated BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.vehicles
  ADD COLUMN source_type text NOT NULL DEFAULT 'own' CHECK (source_type IN ('own','partner')),
  ADD COLUMN partner_id uuid REFERENCES public.partners(id) ON DELETE RESTRICT,
  ADD COLUMN vehicle_status text NOT NULL DEFAULT 'available' CHECK (vehicle_status IN ('available','maintenance','unavailable'));
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_source_partner_chk CHECK (
  (source_type = 'own' AND partner_id IS NULL) OR (source_type = 'partner' AND partner_id IS NOT NULL));
CREATE INDEX idx_vehicles_partner ON public.vehicles(partner_id);

-- Hide internal sourcing columns from anonymous visitors
REVOKE SELECT ON public.vehicles FROM anon;
GRANT SELECT (id, name, slug, image_url, price_per_day, capacity, transmission, year, with_driver, self_drive, description, is_active, sort_order, vehicle_status, created_at, updated_at) ON public.vehicles TO anon;

-- Internal cost data, admin only
CREATE TABLE public.vehicle_internal (
  vehicle_id uuid PRIMARY KEY REFERENCES public.vehicles(id) ON DELETE CASCADE,
  partner_cost integer CHECK (partner_cost IS NULL OR partner_cost >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicle_internal TO authenticated;
GRANT ALL ON public.vehicle_internal TO service_role;
ALTER TABLE public.vehicle_internal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage vehicle internal" ON public.vehicle_internal FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_vehicle_internal_updated BEFORE UPDATE ON public.vehicle_internal FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();