CREATE OR REPLACE FUNCTION public.get_loox_reviews(p_handle text, p_limit integer DEFAULT 40)
RETURNS TABLE (
  id uuid,
  reviewer_name text,
  rating integer,
  title text,
  body text,
  photos text[],
  review_date timestamptz,
  created_at timestamptz,
  is_verified_purchase boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_handle text;
BEGIN
  -- Exact match first
  SELECT r.product_handle INTO v_handle
  FROM public.reviews r
  WHERE r.product_handle = p_handle
    AND r.source = 'loox' AND r.status = 'approved' AND r.rating = 5
  LIMIT 1;

  -- Fallback: closest reviewed handle by trigram similarity
  IF v_handle IS NULL THEN
    SELECT r.product_handle INTO v_handle
    FROM public.reviews r
    WHERE r.source = 'loox' AND r.status = 'approved' AND r.rating = 5
    GROUP BY r.product_handle
    ORDER BY extensions.similarity(r.product_handle, p_handle) DESC
    LIMIT 1;
  END IF;

  IF v_handle IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT r.id, r.reviewer_name, r.rating, r.title, r.body, r.photos,
         r.review_date, r.created_at, r.is_verified_purchase
  FROM public.reviews r
  WHERE r.product_handle = v_handle
    AND r.source = 'loox' AND r.status = 'approved' AND r.rating = 5
  ORDER BY r.review_date DESC NULLS LAST
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_loox_reviews(text, integer) TO anon, authenticated, service_role;