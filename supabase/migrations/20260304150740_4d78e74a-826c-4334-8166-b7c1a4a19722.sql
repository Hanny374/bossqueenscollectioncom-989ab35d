-- Drop and recreate with correct 384 dimensions for gte-small model
DROP FUNCTION IF EXISTS public.search_products;
DROP INDEX IF EXISTS product_embeddings_embedding_idx;

ALTER TABLE public.product_embeddings 
  ALTER COLUMN embedding TYPE extensions.vector(384);

CREATE INDEX product_embeddings_embedding_idx 
  ON public.product_embeddings 
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 10);

CREATE OR REPLACE FUNCTION public.search_products(
  query_embedding extensions.vector(384),
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
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM public.product_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
