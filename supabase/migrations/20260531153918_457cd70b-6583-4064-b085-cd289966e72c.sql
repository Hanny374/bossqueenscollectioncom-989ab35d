
-- Remove public read access on the internal admin_notes column
REVOKE SELECT (admin_notes) ON public.reviews FROM anon, authenticated;
-- Admins still need to read admin_notes; re-grant to authenticated only via a
-- security-definer wrapper isn't needed because the existing
-- "Admins can view all reviews" policy is enforced at row level and admins
-- query through the service role / admin UI which reads all columns. Authenticated
-- users still need column SELECT to view their OWN reviews' standard fields,
-- but admin_notes is intentionally hidden from them as well.

-- Revoke EXECUTE on trigger-only function from public roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
