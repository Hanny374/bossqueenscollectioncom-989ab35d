
CREATE TABLE public.email_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT DEFAULT 'gate',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_captures_email ON public.email_captures (email);

ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert email captures"
ON public.email_captures
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "No public reads"
ON public.email_captures
FOR SELECT
TO authenticated
USING (false);
