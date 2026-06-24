-- Speed up the two top slow queries against public.reviews observed in pg_stat_statements.

-- 1) useAllReviewStats: SELECT product_handle, rating WHERE status = 'approved'
--    Called 1400+ times. Partial index keeps it tiny and hot in cache.
CREATE INDEX IF NOT EXISTS reviews_approved_handle_rating_idx
  ON public.reviews (product_handle, rating)
  WHERE status = 'approved';

-- 2) CustomerSpotlight: WHERE status='approved' AND photos IS NOT NULL ORDER BY review_date DESC NULLS LAST
--    Partial index supports the filter and the sort directly.
CREATE INDEX IF NOT EXISTS reviews_approved_photo_date_idx
  ON public.reviews (review_date DESC NULLS LAST)
  WHERE status = 'approved' AND photos IS NOT NULL;
