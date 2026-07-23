DROP POLICY IF EXISTS Public_read_business_assets ON storage.objects;
DROP POLICY IF EXISTS Admins_write_business_assets ON storage.objects;
DROP POLICY IF EXISTS Admins_update_business_assets ON storage.objects;
DROP POLICY IF EXISTS Admins_delete_business_assets ON storage.objects;

CREATE POLICY Public_read_business_assets ON storage.objects FOR SELECT
  USING (bucket_id = 'business-assets');

CREATE POLICY Admins_write_business_assets ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY Admins_update_business_assets ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY Admins_delete_business_assets ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-assets' AND public.has_role(auth.uid(), 'admin'));
