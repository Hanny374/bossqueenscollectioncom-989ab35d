CREATE POLICY "Users can update own review photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'review-photos' AND (storage.foldername(name))[1] = auth.uid()::text);