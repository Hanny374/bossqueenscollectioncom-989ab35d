
CREATE TABLE public.business_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  business_stage TEXT NOT NULL,
  business_type TEXT,
  monthly_budget TEXT,
  target_customers TEXT,
  goals TEXT,
  timeline TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.business_inquiries TO anon, authenticated;
GRANT ALL ON public.business_inquiries TO service_role;

ALTER TABLE public.business_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a business inquiry"
ON public.business_inquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can read all business inquiries"
ON public.business_inquiries
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
