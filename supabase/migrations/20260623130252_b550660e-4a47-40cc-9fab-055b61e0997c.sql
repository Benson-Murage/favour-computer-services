
-- is_super_admin helper
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role='super_admin')
$$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

-- Promote owner email to super_admin
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); uemail text;
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT email INTO uemail FROM auth.users WHERE id=uid;
  IF lower(coalesce(uemail,'')) <> 'bensonmurage254@gmail.com' THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'super_admin') ON CONFLICT DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;$$;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'super_admin'::app_role FROM auth.users u
WHERE lower(u.email)='bensonmurage254@gmail.com'
ON CONFLICT DO NOTHING;

-- User profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  disabled boolean NOT NULL DEFAULT false,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own profile" ON public.user_profiles;
CREATE POLICY "users read own profile" ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid()=user_id);
DROP POLICY IF EXISTS "admins read all profiles" ON public.user_profiles;
CREATE POLICY "admins read all profiles" ON public.user_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));
DROP POLICY IF EXISTS "users insert own profile" ON public.user_profiles;
CREATE POLICY "users insert own profile" ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "users update own profile" ON public.user_profiles;
CREATE POLICY "users update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
DROP POLICY IF EXISTS "admins update profiles" ON public.user_profiles;
CREATE POLICY "admins update profiles" ON public.user_profiles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS trg_up_updated ON public.user_profiles;
CREATE TRIGGER trg_up_updated BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + assign customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;$$;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.user_profiles (user_id, full_name)
SELECT id, raw_user_meta_data->>'full_name' FROM auth.users
ON CONFLICT DO NOTHING;

-- Update user_roles SELECT policy
DROP POLICY IF EXISTS "admins read all roles" ON public.user_roles;
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- Extend business_settings
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS facebook_url text,
  ADD COLUMN IF NOT EXISTS instagram_url text,
  ADD COLUMN IF NOT EXISTS tiktok_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_url text,
  ADD COLUMN IF NOT EXISTS sender_name text DEFAULT 'Favour Computer Services',
  ADD COLUMN IF NOT EXISTS sender_email text,
  ADD COLUMN IF NOT EXISTS hero_title text,
  ADD COLUMN IF NOT EXISTS hero_subtitle text,
  ADD COLUMN IF NOT EXISTS hero_cta_primary_label text,
  ADD COLUMN IF NOT EXISTS hero_cta_primary_url text,
  ADD COLUMN IF NOT EXISTS hero_cta_secondary_label text,
  ADD COLUMN IF NOT EXISTS hero_cta_secondary_url text,
  ADD COLUMN IF NOT EXISTS about_story text,
  ADD COLUMN IF NOT EXISTS about_mission text,
  ADD COLUMN IF NOT EXISTS about_vision text,
  ADD COLUMN IF NOT EXISTS contact_hours text;

DROP POLICY IF EXISTS "admins update settings" ON public.business_settings;
CREATE POLICY "admins update settings" ON public.business_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.is_super_admin(auth.uid()));

-- Product image URLs array
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
