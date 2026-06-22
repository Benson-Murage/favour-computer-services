
DROP POLICY IF EXISTS "owner reads order" ON public.orders;
CREATE POLICY "owner reads order" ON public.orders FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(),'admin')
    OR lower(customer_email) = lower(coalesce((auth.jwt() ->> 'email'),''))
  );
