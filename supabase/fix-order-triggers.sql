DROP TRIGGER IF EXISTS trg_orders_verification_code ON public.orders;

DROP FUNCTION IF EXISTS public.set_order_verification_code;
DROP FUNCTION IF EXISTS public.generate_verification_code;

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
  yr text := to_char(NOW(), 'YYYY');
BEGIN
  LOOP
    suffix := '';
    FOR i IN 1..6 LOOP
      suffix := suffix || SUBSTR(chars, 1 + FLOOR(RANDOM() * LENGTH(chars))::int, 1);
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

CREATE TRIGGER trg_orders_verification_code
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_verification_code();

CREATE UNIQUE INDEX IF NOT EXISTS orders_verification_code_key
  ON public.orders(verification_code);
