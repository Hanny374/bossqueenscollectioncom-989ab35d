-- Fix: recreate search function using public schema cast for vector operations
DROP FUNCTION IF EXISTS public.search_products;

CREATE OR REPLACE FUNCTION public.search_products(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.3,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  shopify_handle text,
  title text,
  description text,
  product_type text,
  tags text[],
  price numeric,
  compare_at_price numeric,
  available_for_sale boolean,
  variants jsonb,
  options jsonb,
  similarity float
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT
    pe.id,
    pe.shopify_handle,
    pe.title,
    pe.description,
    pe.product_type,
    pe.tags,
    pe.price,
    pe.compare_at_price,
    pe.available_for_sale,
    pe.variants,
    pe.options,
    1 - (pe.embedding <=> query_embedding)::float AS similarity
  FROM public.product_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
$$;
