DROP POLICY IF EXISTS payment_proofs_select ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_insert ON storage.objects;
DROP POLICY IF EXISTS payment_proofs_admin_manage ON storage.objects;

CREATE POLICY payment_proofs_select ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs' AND (owner = auth.uid() OR public.has_role(auth.uid(),'admin')));

CREATE POLICY payment_proofs_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-proofs' AND owner = auth.uid());

CREATE POLICY payment_proofs_admin_manage ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(),'admin'))
  WITH CHECK (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(),'admin'));
