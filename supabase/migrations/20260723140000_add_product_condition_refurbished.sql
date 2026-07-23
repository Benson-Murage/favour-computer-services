DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_condition')
      AND enumlabel = 'refurbished'
  ) THEN
    ALTER TYPE public.product_condition ADD VALUE 'refurbished';
  END IF;
END $$;
