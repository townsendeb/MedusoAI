-- Storage bucket for CSV customer imports (Slice 1.5)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imports',
  'imports',
  false,
  10485760,
  ARRAY['text/csv', 'application/vnd.ms-excel', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY imports_select_org ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'imports'
    AND (storage.foldername(name))[1] = public.current_organization_id()::text
  );

CREATE POLICY imports_insert_org ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'imports'
    AND (storage.foldername(name))[1] = public.current_organization_id()::text
  );

CREATE POLICY imports_delete_org ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'imports'
    AND (storage.foldername(name))[1] = public.current_organization_id()::text
  );
