-- Security hardening:
-- - Ensure SECURITY DEFINER functions don't inherit a mutable search_path
-- - Move pg_trgm extension out of public schema (prevents public-schema hijacking)

-- 1) Pin safe search_path for flagged functions (if they exist).
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS identity_args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE (n.nspname = 'public' AND p.proname = 'refresh_listing_facets')
       OR (n.nspname = 'pgrst' AND p.proname = 'pre_config')
  LOOP
    IF r.schema_name = 'public' THEN
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = pg_catalog, public, pg_temp',
        r.schema_name,
        r.function_name,
        r.identity_args
      );
    ELSE
      EXECUTE format(
        'ALTER FUNCTION %I.%I(%s) SET search_path = pg_catalog, %I, pg_temp',
        r.schema_name,
        r.function_name,
        r.identity_args,
        r.schema_name
      );
    END IF;
  END LOOP;
END $$;

-- 2) Move pg_trgm into a dedicated schema (if installed).
CREATE SCHEMA IF NOT EXISTS extensions;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    EXECUTE 'ALTER EXTENSION pg_trgm SET SCHEMA extensions';
  END IF;
END $$;

