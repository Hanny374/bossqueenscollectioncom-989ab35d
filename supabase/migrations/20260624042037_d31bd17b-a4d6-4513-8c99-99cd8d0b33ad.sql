-- Minimal storage.objects policies for the private 'ebooks' bucket.
-- The bucket is brokered server-side by the ebook-download edge function via the
-- service role (which bypasses RLS). These policies add admin-only direct access
-- for management purposes; no anon or general authenticated access is granted.

CREATE POLICY "Admins can read ebook files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can upload ebook files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update ebook files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete ebook files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin')
);
