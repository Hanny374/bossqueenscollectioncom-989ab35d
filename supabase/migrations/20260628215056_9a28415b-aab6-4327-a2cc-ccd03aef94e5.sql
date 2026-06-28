
CREATE TABLE public.club_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.club_messages TO authenticated;
GRANT ALL ON public.club_messages TO service_role;

ALTER TABLE public.club_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated members can read club messages"
  ON public.club_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can post as themselves"
  ON public.club_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can delete their own messages"
  ON public.club_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX club_messages_created_at_idx ON public.club_messages (created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE public.club_messages;
