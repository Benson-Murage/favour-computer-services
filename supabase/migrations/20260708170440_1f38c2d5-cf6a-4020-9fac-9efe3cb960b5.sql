
ALTER TABLE public.business_settings
  ADD COLUMN IF NOT EXISTS signature_url text,
  ADD COLUMN IF NOT EXISTS stamp_url text,
  ADD COLUMN IF NOT EXISTS signatory_name text,
  ADD COLUMN IF NOT EXISTS signatory_title text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_account text,
  ADD COLUMN IF NOT EXISTS website_url text;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS verification_code text,
  ADD COLUMN IF NOT EXISTS verification_token uuid DEFAULT gen_random_uuid();

CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  suffix text := '';
  i int;
  code text;
  yr text := to_char(now(), 'YYYY');
BEGIN
  LOOP
    suffix := '';
    FOR i IN 1..6 LOOP
      suffix := suffix || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    code := 'FCS-' || yr || '-' || suffix;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.orders WHERE verification_code = code);
  END LOOP;
  RETURN code;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_verification_code()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.verification_code IS NULL THEN
    NEW.verification_code := public.generate_verification_code();
  END IF;
  IF NEW.verification_token IS NULL THEN
    NEW.verification_token := gen_random_uuid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_verification_code ON public.orders;
CREATE TRIGGER trg_orders_verification_code
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_verification_code();

UPDATE public.orders
SET verification_code = public.generate_verification_code()
WHERE verification_code IS NULL;

UPDATE public.orders
SET verification_token = gen_random_uuid()
WHERE verification_token IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_verification_code_key
  ON public.orders(verification_code);

CREATE OR REPLACE FUNCTION public.verify_receipt(_code text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  o record;
  masked_name text;
  masked_email text;
BEGIN
  SELECT id, invoice_number, verification_code, created_at, customer_name, customer_email,
         status, payment_status, fulfillment, total, items
    INTO o
    FROM public.orders
    WHERE verification_code = upper(trim(_code))
    LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false);
  END IF;

  masked_name := CASE
    WHEN o.customer_name IS NULL OR o.customer_name = '' THEN 'Customer'
    ELSE split_part(o.customer_name, ' ', 1) ||
         CASE WHEN position(' ' in o.customer_name) > 0
              THEN ' ' || upper(substr(split_part(o.customer_name, ' ', 2), 1, 1)) || '.'
              ELSE '' END
  END;

  masked_email := CASE
    WHEN o.customer_email IS NULL OR position('@' in o.customer_email) = 0 THEN ''
    ELSE substr(o.customer_email, 1, 2) || '***@' || split_part(o.customer_email, '@', 2)
  END;

  RETURN jsonb_build_object(
    'valid', true,
    'order_id', o.id,
    'invoice_number', o.invoice_number,
    'verification_code', o.verification_code,
    'issued_at', o.created_at,
    'customer_name', masked_name,
    'customer_email', masked_email,
    'status', o.status,
    'payment_status', o.payment_status,
    'fulfillment', o.fulfillment,
    'total', o.total,
    'items', o.items
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.verify_receipt(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Public read business assets" ON storage.objects;
CREATE POLICY "Public read business assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-assets');

DROP POLICY IF EXISTS "Admins write business assets" ON storage.objects;
CREATE POLICY "Admins write business assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'business-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins update business assets" ON storage.objects;
CREATE POLICY "Admins update business assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'business-assets' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete business assets" ON storage.objects;
CREATE POLICY "Admins delete business assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'business-assets' AND public.has_role(auth.uid(), 'admin'));
