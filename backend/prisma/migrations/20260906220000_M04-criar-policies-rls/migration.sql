-- The Fastify API uses the direct PostgreSQL connection and keeps enforcing
-- ownership in the application layer. These grants and policies protect the
-- Supabase Data API when it is called with anon/authenticated JWT roles.

BEGIN;

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_snapshots ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE
  public.users,
  public.character_templates,
  public.characters,
  public.character_stats,
  public.character_resources,
  public.character_items,
  public.character_actions,
  public.character_effects,
  public.character_links,
  public.character_notes,
  public.character_snapshots
FROM anon, authenticated;

GRANT SELECT ON TABLE public.character_templates TO anon, authenticated;
GRANT SELECT ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.characters,
  public.character_stats,
  public.character_resources,
  public.character_items,
  public.character_actions,
  public.character_effects,
  public.character_links,
  public.character_notes,
  public.character_snapshots
TO authenticated;

DROP POLICY IF EXISTS character_templates_select_official ON public.character_templates;
CREATE POLICY character_templates_select_official
ON public.character_templates
FOR SELECT
TO anon, authenticated
USING (is_official = true);

DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own
ON public.users
FOR SELECT
TO authenticated
USING (auth_provider_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS characters_select_own ON public.characters;
CREATE POLICY characters_select_own
ON public.characters
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users AS owner
    WHERE owner.id = characters.user_id
      AND owner.auth_provider_id = (SELECT auth.uid())::text
  )
);

DROP POLICY IF EXISTS characters_insert_own ON public.characters;
CREATE POLICY characters_insert_own
ON public.characters
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users AS owner
    WHERE owner.id = characters.user_id
      AND owner.auth_provider_id = (SELECT auth.uid())::text
  )
);

DROP POLICY IF EXISTS characters_update_own ON public.characters;
CREATE POLICY characters_update_own
ON public.characters
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users AS owner
    WHERE owner.id = characters.user_id
      AND owner.auth_provider_id = (SELECT auth.uid())::text
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.users AS owner
    WHERE owner.id = characters.user_id
      AND owner.auth_provider_id = (SELECT auth.uid())::text
  )
);

DROP POLICY IF EXISTS characters_delete_own ON public.characters;
CREATE POLICY characters_delete_own
ON public.characters
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.users AS owner
    WHERE owner.id = characters.user_id
      AND owner.auth_provider_id = (SELECT auth.uid())::text
  )
);

DO $policies$
DECLARE
  child_table text;
BEGIN
  FOREACH child_table IN ARRAY ARRAY[
    'character_stats',
    'character_resources',
    'character_items',
    'character_actions',
    'character_effects',
    'character_links',
    'character_notes',
    'character_snapshots'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', child_table || '_select_own', child_table);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING '
      || '(EXISTS (SELECT 1 FROM public.characters AS character '
      || 'JOIN public.users AS owner ON owner.id = character.user_id '
      || 'WHERE character.id = %I.character_id '
      || 'AND owner.auth_provider_id = (SELECT auth.uid())::text))',
      child_table || '_select_own', child_table, child_table
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', child_table || '_insert_own', child_table);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK '
      || '(EXISTS (SELECT 1 FROM public.characters AS character '
      || 'JOIN public.users AS owner ON owner.id = character.user_id '
      || 'WHERE character.id = %I.character_id '
      || 'AND owner.auth_provider_id = (SELECT auth.uid())::text))',
      child_table || '_insert_own', child_table, child_table
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', child_table || '_update_own', child_table);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING '
      || '(EXISTS (SELECT 1 FROM public.characters AS character '
      || 'JOIN public.users AS owner ON owner.id = character.user_id '
      || 'WHERE character.id = %I.character_id '
      || 'AND owner.auth_provider_id = (SELECT auth.uid())::text)) '
      || 'WITH CHECK '
      || '(EXISTS (SELECT 1 FROM public.characters AS character '
      || 'JOIN public.users AS owner ON owner.id = character.user_id '
      || 'WHERE character.id = %I.character_id '
      || 'AND owner.auth_provider_id = (SELECT auth.uid())::text))',
      child_table || '_update_own', child_table, child_table, child_table
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', child_table || '_delete_own', child_table);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING '
      || '(EXISTS (SELECT 1 FROM public.characters AS character '
      || 'JOIN public.users AS owner ON owner.id = character.user_id '
      || 'WHERE character.id = %I.character_id '
      || 'AND owner.auth_provider_id = (SELECT auth.uid())::text))',
      child_table || '_delete_own', child_table, child_table
    );
  END LOOP;
END
$policies$;

COMMIT;
