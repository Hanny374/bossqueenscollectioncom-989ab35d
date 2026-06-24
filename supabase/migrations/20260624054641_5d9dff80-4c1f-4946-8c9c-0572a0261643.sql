CREATE OR REPLACE FUNCTION public.get_loox_reviews(p_handle text, p_limit integer DEFAULT 40)
 RETURNS TABLE(id uuid, reviewer_name text, rating integer, title text, body text, photos text[], review_date timestamp with time zone, created_at timestamp with time zone, is_verified_purchase boolean)
 LANGUAGE plpgsql
 STABLE SECURITY INVOKER
 SET search_path TO 'public', 'extensions'
AS $function$
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
  SELECT DISTINCT ON (lower(regexp_replace(regexp_replace(trim(coalesce(r.body, '')), '[^[:alnum:]]+', ' ', 'g'), '\s+', ' ', 'g')))
         r.id,
         r.reviewer_name,
         r.rating,
         r.title,
         r.body,
         r.photos,
         r.review_date,
         r.created_at,
         r.is_verified_purchase
  FROM public.reviews r
  WHERE r.product_handle = v_handle
    AND r.source = 'loox' AND r.status = 'approved' AND r.rating = 5
  ORDER BY
    lower(regexp_replace(regexp_replace(trim(coalesce(r.body, '')), '[^[:alnum:]]+', ' ', 'g'), '\s+', ' ', 'g')),
    CASE WHEN r.photos IS NOT NULL AND cardinality(r.photos) > 0 THEN 0 ELSE 1 END,
    r.review_date DESC NULLS LAST,
    r.created_at DESC
  LIMIT p_limit;
END;
$function$;