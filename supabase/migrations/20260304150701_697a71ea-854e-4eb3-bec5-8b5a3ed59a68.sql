-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Product embeddings table
CREATE TABLE public.product_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_handle text NOT NULL UNIQUE,
  shopify_id text,
  title text NOT NULL,
  description text,
  product_type text,
  tags text[],
  price numeric,
  compare_at_price numeric,
  available_for_sale boolean DEFAULT true,
  variants jsonb,
  options jsonb,
  embedding_text text NOT NULL,
  embedding extensions.vector(768),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast similarity search
CREATE INDEX product_embeddings_embedding_idx 
  ON public.product_embeddings 
  USING ivfflat (embedding extensions.vector_cosine_ops)
  WITH (lists = 10);

-- Index for handle lookups
CREATE INDEX product_embeddings_handle_idx ON public.product_embeddings (shopify_handle);

-- Similarity search function
CREATE OR REPLACE FUNCTION public.search_products(
  query_embedding extensions.vector(768),
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

-- RLS: public read access (products are public), no public writes
ALTER TABLE public.product_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product embeddings"
  ON public.product_embeddings
  FOR SELECT
  TO anon, authenticated
  USING (true);
