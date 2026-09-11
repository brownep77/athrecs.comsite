-- Guard only duplicate identities explicitly recorded by an audited maintenance run.
-- No race data is deleted by this schema migration. Existing slug reservations,
-- authentication and non-event slug behaviour remain intact.
CREATE INDEX IF NOT EXISTS catalogue_dedup_event_lookup
  ON public.network_audit_log ((before_value->>'slug'))
  WHERE action = 'catalogue_duplicate_event_merged';
CREATE INDEX IF NOT EXISTS catalogue_dedup_edition_lookup
  ON public.network_audit_log ((after_value->>'event_id'),
    (before_value->>'event_date'), (before_value->>'distance_code'))
  WHERE action = 'catalogue_duplicate_edition_merged';

CREATE OR REPLACE FUNCTION public.athrecs_preserve_entity_slug()
RETURNS trigger LANGUAGE plpgsql AS $function$
DECLARE
  kind text := TG_ARGV[0];
BEGIN
  IF NEW.slug IS NULL OR NEW.slug !~ '^[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'Invalid % slug: %', kind, coalesce(NEW.slug, '<null>');
  END IF;
  IF TG_OP = 'UPDATE' AND NEW.slug = OLD.slug THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    IF kind = 'event' THEN
      -- A legacy seed must not recreate a reviewed duplicate or crash a page.
      -- The canonical event and its permanent redirect must both still exist.
      IF EXISTS (
        SELECT 1 FROM public.network_audit_log a
        JOIN public.slug_redirects r ON r.entity_type = 'event'
          AND r.old_slug = a.before_value->>'slug'
          AND r.entity_id::text = a.after_value->>'event_id'
        JOIN public.events e ON e.id = r.entity_id AND e.slug = r.current_slug
        WHERE a.action = 'catalogue_duplicate_event_merged'
          AND a.before_value->>'slug' = NEW.slug
      ) THEN RETURN NULL; END IF;
      -- BEFORE INSERT also runs before ON CONFLICT. Permit an upsert of the
      -- existing canonical row, not reuse of a reserved old URL.
      IF NOT EXISTS (
        SELECT 1 FROM public.slug_redirects r
        WHERE r.entity_type = kind AND r.old_slug = NEW.slug
      ) AND EXISTS (SELECT 1 FROM public.events e WHERE e.slug = NEW.slug)
        AND NOT EXISTS (
          SELECT 1 FROM public.slug_redirects r
          WHERE r.entity_type = kind AND r.current_slug = NEW.slug
            AND NOT EXISTS (SELECT 1 FROM public.events e
              WHERE e.slug = NEW.slug AND e.id = r.entity_id)
        ) THEN RETURN NEW; END IF;
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.slug_redirects r WHERE r.entity_type = kind
        AND (r.old_slug = NEW.slug OR r.current_slug = NEW.slug)
    ) THEN
      RAISE EXCEPTION 'The % slug "%" is a permanent public URL and cannot be reused', kind, NEW.slug;
    END IF;
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.slug_redirects r WHERE r.entity_type = kind
      AND (r.old_slug = NEW.slug OR (r.current_slug = NEW.slug AND r.entity_id <> OLD.id))
  ) THEN
    RAISE EXCEPTION 'The % slug "%" is a permanent public URL and cannot be reused', kind, NEW.slug;
  END IF;
  UPDATE public.slug_redirects SET current_slug = NEW.slug, updated_at = now()
    WHERE entity_type = kind AND entity_id = OLD.id;
  INSERT INTO public.slug_redirects(entity_type, entity_id, old_slug, current_slug)
    VALUES (kind, OLD.id, OLD.slug, NEW.slug)
    ON CONFLICT(entity_type, old_slug) DO UPDATE SET
      entity_id = excluded.entity_id, current_slug = excluded.current_slug, updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.athrecs_skip_retired_catalogue_edition()
RETURNS trigger LANGUAGE plpgsql AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.network_audit_log a
    JOIN public.editions e ON e.id::text = a.after_value->>'edition_id'
      AND e.event_id = NEW.event_id AND e.event_date = NEW.event_date
      AND e.distance_code = a.after_value->>'distance_code'
    WHERE a.action = 'catalogue_duplicate_edition_merged'
      AND a.after_value->>'event_id' = NEW.event_id::text
      AND a.before_value->>'event_date' = NEW.event_date::text
      AND a.before_value->>'distance_code' = NEW.distance_code
      AND a.before_value->>'distance_code' <> a.after_value->>'distance_code'
      AND coalesce(a.before_value->>'source_url', '') = coalesce(NEW.source_url, '')
  ) THEN RETURN NULL; END IF;
  RETURN NEW;
END;
$function$;
CREATE OR REPLACE TRIGGER editions_skip_reviewed_duplicates
  BEFORE INSERT ON public.editions FOR EACH ROW
  WHEN (NEW.distance_code IN ('Other', '1mi'))
  EXECUTE FUNCTION public.athrecs_skip_retired_catalogue_edition();
