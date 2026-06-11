
-- Profiles: restrict reads to owner
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Deduplicate email_captures keeping earliest
DELETE FROM public.email_captures a
USING public.email_captures b
WHERE lower(a.email) = lower(b.email)
  AND a.created_at > b.created_at;

DELETE FROM public.email_captures a
USING public.email_captures b
WHERE lower(a.email) = lower(b.email)
  AND a.created_at = b.created_at
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS email_captures_email_unique
  ON public.email_captures (lower(email));

DROP POLICY IF EXISTS "Anyone can insert email captures" ON public.email_captures;
CREATE POLICY "Anyone can insert valid email captures" ON public.email_captures
  FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 320
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
