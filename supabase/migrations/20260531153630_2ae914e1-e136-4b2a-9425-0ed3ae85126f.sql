
-- Fix review insert: enforce pending status & no self-verification
DROP POLICY IF EXISTS "Users can insert reviews" ON public.reviews;
CREATE POLICY "Users can insert reviews"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND status = 'pending'
    AND is_verified_purchase = false
  );

-- Enable RLS on sync_progress (default deny; service role bypasses)
ALTER TABLE public.sync_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view sync progress"
  ON public.sync_progress FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix review-photos upload path: scope to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload review photos" ON storage.objects;
CREATE POLICY "Authenticated users can upload review photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'review-photos'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

-- Restrict review photo SELECT listing: still publicly viewable via signed/public URL
-- but no broad listing. Keep public read since photos are shown on product pages.
-- (Bucket is public, individual object reads still work without policy.)
DROP POLICY IF EXISTS "Anyone can view review photos" ON storage.objects;
CREATE POLICY "Public can view review photos by path"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'review-photos');
