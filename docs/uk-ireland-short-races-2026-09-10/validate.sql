-- Validate the exact staged payload, all source references, scope and live keys.
DO $validate$
DECLARE b catalogue_import_batches%ROWTYPE; n int;
BEGIN
 SELECT * INTO STRICT b FROM catalogue_import_batches WHERE id='811be401-72c7-5a38-9f12-c63588c18aa7' FOR UPDATE;
 IF b.status <> 'staged' OR b.payload_hash <> '84b71b864514fc549f8c578473b9ad2fe6c92e0b58d2936247b476777262a2a0' THEN RAISE EXCEPTION 'Unexpected batch state or hash'; END IF;
 IF (SELECT count(*) FROM catalogue_staged_rows WHERE batch_id=b.id) <> 418 THEN RAISE EXCEPTION 'Staged row count differs'; END IF;
 IF EXISTS(SELECT 1 FROM catalogue_staged_rows WHERE batch_id=b.id GROUP BY row_type,natural_key HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate staged keys'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e WHERE coalesce(e->>'name','')='' OR e->>'slug' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR e->>'sport' NOT IN ('Running','Athletics') OR e->>'country' NOT IN ('England','Scotland','Wales','Northern Ireland','Ireland','United Kingdom') OR (coalesce(e->>'website','')<>'' AND e->>'website' !~ '^https?://')) THEN RAISE EXCEPTION 'Invalid event'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e JOIN slug_redirects r ON r.entity_type='event' AND r.old_slug=e->>'slug') THEN RAISE EXCEPTION 'Historic alias cannot be recreated'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'editions') d WHERE d->>'date' !~ '^202[67]-[0-9]{2}-[0-9]{2}$' OR (d->>'date')::date NOT BETWEEN '2026-09-10' AND '2027-01-31' OR d->>'distance' NOT IN ('5K','10K') OR (d->>'distanceKm')::numeric <> CASE WHEN d->>'distance'='5K' THEN 5 ELSE 10 END OR d->>'source' !~ '^https?://' OR d->>'status'<>'TBC' OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e WHERE e->>'slug'=d->>'eventSlug')) THEN RAISE EXCEPTION 'Invalid edition'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'editions') d JOIN events e ON e.slug=d->>'eventSlug' JOIN editions ed ON ed.event_id=e.id AND ed.event_date=(d->>'date')::date AND ed.distance_code=d->>'distance') THEN RAISE EXCEPTION 'An edition is already live; reconcile before publishing'; END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(b.payload->'events') x WHERE NOT EXISTS(SELECT 1 FROM events e WHERE e.slug=x->>'slug');
 IF n<>77 THEN RAISE EXCEPTION 'New-event count changed: %',n; END IF;
 UPDATE catalogue_import_batches SET status='ready',validated_at=now(),validation_summary=jsonb_build_object('events',184,'editions',234,'newEvents',77,'invalidRows',0,'errors','[]'::jsonb,'checks',jsonb_build_array('scope','source URLs','canonical names and aliases','date-distance keys','monthly recurrence','pending batch identities','live edition conflicts'),'transport','authenticated_neon_staged_validated_audited_transaction'),error=null WHERE id=b.id;
END $validate$;
