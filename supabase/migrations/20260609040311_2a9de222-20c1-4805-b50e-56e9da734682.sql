
ALTER TABLE public.reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'native';
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS source_id text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS reviewer_name text;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS review_date timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS reviews_source_uidx ON public.reviews(source, source_id) WHERE source_id IS NOT NULL;
