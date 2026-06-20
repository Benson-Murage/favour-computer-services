
-- ============== ROLES ==============
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'customer');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============== BUSINESS SETTINGS ==============
CREATE TABLE public.business_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  company_name text NOT NULL DEFAULT 'Favour Computer Services',
  business_description text DEFAULT '',
  address text DEFAULT 'F&F Building, Shop U13, Next to Odeon Cinema, Nairobi, Kenya',
  email text DEFAULT 'bensonmurage254@gmail.com',
  phone text DEFAULT '0726 548 592',
  whatsapp text DEFAULT '0726 548 592',
  till_number text DEFAULT '',
  paybill_number text DEFAULT '',
  account_number text DEFAULT '',
  payment_instructions text DEFAULT 'Pay via M-Pesa Till or Paybill above, then share the confirmation message via WhatsApp.',
  pickup_location text DEFAULT 'F&F Building, Shop U13, Next to Odeon Cinema, Nairobi',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.business_settings TO anon, authenticated;
GRANT ALL ON public.business_settings TO service_role;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.business_settings FOR SELECT USING (true);
CREATE POLICY "admins update settings" ON public.business_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert settings" ON public.business_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bs_updated BEFORE UPDATE ON public.business_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.business_settings (singleton) VALUES (true);

-- ============== PRODUCT EXTENSIONS ==============
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_on_offer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS offer_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS offer_ends_at timestamptz,
  ADD COLUMN IF NOT EXISTS offer_percent numeric,
  ADD COLUMN IF NOT EXISTS offer_price numeric,
  ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS warranty text DEFAULT '',
  ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
CREATE POLICY "admins insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== CATEGORIES & BRANDS ADMIN ==============
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE public.brands ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage brands" ON public.brands FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============== SERVICE PACKAGES ==============
CREATE TYPE public.service_kind AS ENUM ('cctv','livestream');
CREATE TABLE public.service_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind service_kind NOT NULL,
  name text NOT NULL,
  tagline text DEFAULT '',
  price numeric,
  price_label text DEFAULT '',
  description text DEFAULT '',
  features jsonb DEFAULT '[]'::jsonb,
  equipment jsonb DEFAULT '[]'::jsonb,
  sort_order int DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_packages TO anon, authenticated;
GRANT ALL ON public.service_packages TO authenticated;
GRANT ALL ON public.service_packages TO service_role;
ALTER TABLE public.service_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read active packages" ON public.service_packages FOR SELECT USING (true);
CREATE POLICY "admins manage packages" ON public.service_packages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_pkg_updated BEFORE UPDATE ON public.service_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.service_packages (kind, name, tagline, price_label, description, features, sort_order) VALUES
('cctv','Home','Smart surveillance for families','From KSh 35,000','4-camera HD CCTV system with mobile viewing and 7-day cloud storage.','["4x 2MP HD cameras","DVR with 1TB storage","Night vision","Mobile app access","Free installation in Nairobi"]'::jsonb,1),
('cctv','Small Business','Protect your storefront','From KSh 65,000','8-camera HD system with motion alerts and 30-day storage.','["8x 2MP HD cameras","NVR with 2TB storage","Motion alerts","Remote monitoring","Cable routing & installation"]'::jsonb,2),
('cctv','School','Safe campuses, every day','From KSh 120,000','16-camera multi-zone system with centralised monitoring room setup.','["16x 4MP cameras","Centralised NVR","Multi-zone coverage","Monitoring room setup","Staff training"]'::jsonb,3),
('cctv','Enterprise','Custom multi-site security','Custom quote','Tailored multi-branch CCTV with IP cameras, analytics and 24/7 monitoring.','["IP camera infrastructure","Multi-site recording","AI analytics","24/7 monitoring options","Annual service contract"]'::jsonb,4),
('livestream','Standard','Reliable single-camera streaming','From KSh 35,000','Single-camera live stream to one platform with full audio mix.','["1 HD camera operator","Streaming to YouTube or Facebook","Audio mix from sound system","4-hour coverage"]'::jsonb,1),
('livestream','Premium','Multi-camera production','From KSh 75,000','Multi-camera switched live production for weddings, conferences, churches.','["3 HD cameras + switcher","Streaming to multiple platforms","Live graphics & lower thirds","6-hour coverage","Recording copy provided"]'::jsonb,2),
('livestream','Enterprise','Custom large-event broadcast','Custom quote','Full broadcast crew, LED screens, multi-platform distribution.','["Custom camera rigs","Broadcast-grade switcher","LED screen support","Engineer on-site","Editing & archive deliverables"]'::jsonb,3);

-- ============== QUOTES (unified pipeline) ==============
CREATE TYPE public.quote_source AS ENUM ('cctv','livestream','product','contact','general');
CREATE TYPE public.quote_status AS ENUM ('new','contacted','quoted','converted','cancelled');

CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source quote_source NOT NULL DEFAULT 'general',
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  service_type text DEFAULT '',
  package text DEFAULT '',
  location text DEFAULT '',
  message text DEFAULT '',
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  status quote_status NOT NULL DEFAULT 'new',
  internal_notes text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.quotes TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submits quote" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read quotes" ON public.quotes FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update quotes" ON public.quotes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete quotes" ON public.quotes FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_quotes_updated BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== BOOKINGS (livestream events) ==============
CREATE TYPE public.booking_status AS ENUM ('new','contacted','quoted','confirmed','completed','cancelled');
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  event_type text DEFAULT '',
  event_date date,
  event_location text DEFAULT '',
  package text DEFAULT '',
  requirements text DEFAULT '',
  status booking_status NOT NULL DEFAULT 'new',
  internal_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone submits booking" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read bookings" ON public.bookings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update bookings" ON public.bookings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete bookings" ON public.bookings FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== ORDERS + PICKUP RESERVATIONS ==============
CREATE TYPE public.fulfillment_method AS ENUM ('delivery','pickup');
CREATE TYPE public.order_status AS ENUM ('pending','paid','ready','picked_up','delivered','cancelled');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  fulfillment fulfillment_method NOT NULL DEFAULT 'delivery',
  delivery_address text DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status order_status NOT NULL DEFAULT 'pending',
  reservation_number text,
  pickup_code text,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone create order" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "owner reads order" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== PROMOTIONS ==============
CREATE TABLE public.promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  percent_off numeric,
  price_override numeric,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.promotions TO anon, authenticated;
GRANT ALL ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read promos" ON public.promotions FOR SELECT USING (true);
CREATE POLICY "admins manage promos" ON public.promotions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_promos_updated BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============== INVENTORY MOVEMENTS ==============
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  delta int NOT NULL,
  reason text NOT NULL DEFAULT 'adjustment',
  reference_id uuid,
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.inventory_movements TO authenticated;
GRANT ALL ON public.inventory_movements TO service_role;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read inv" ON public.inventory_movements FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert inv" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============== AUDIT LOG ==============
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text DEFAULT '',
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text DEFAULT '',
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.admin_audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins write audit" ON public.admin_audit_log FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============== FIRST-ADMIN BOOTSTRAP RPC ==============
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  existing_count int;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT COUNT(*) INTO existing_count FROM public.user_roles WHERE role = 'admin';
  IF existing_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
