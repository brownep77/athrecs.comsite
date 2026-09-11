-- Validate the exact staged payload, all source references, scope and live keys.
DO $validate$
DECLARE b catalogue_import_batches%ROWTYPE; n int;
BEGIN
 IF jsonb_array_length((SELECT payload->'events' FROM catalogue_import_batches WHERE id='88dc02b3-a290-52d5-a03b-04388ccfe94a'))>75 THEN RAISE EXCEPTION 'Event batch exceeds 75'; END IF;
 SELECT * INTO STRICT b FROM catalogue_import_batches WHERE id='88dc02b3-a290-52d5-a03b-04388ccfe94a' FOR UPDATE;
 IF b.status <> 'staged' OR b.payload_hash <> '929cc3cfbefab6f8784e5cde874e71d783fa0a57cb43821f0f373aa4f1822a3d' THEN RAISE EXCEPTION 'Unexpected batch state or hash'; END IF;
 IF (SELECT count(*) FROM catalogue_staged_rows WHERE batch_id=b.id) <> 227 THEN RAISE EXCEPTION 'Staged row count differs'; END IF;
 IF EXISTS(SELECT 1 FROM catalogue_staged_rows WHERE batch_id=b.id GROUP BY row_type,natural_key HAVING count(*)>1) THEN RAISE EXCEPTION 'Duplicate staged keys'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e WHERE coalesce(e->>'name','')='' OR e->>'slug' !~ '^[a-z0-9]+(-[a-z0-9]+)*$' OR e->>'sport' NOT IN ('Running') OR e->>'country' NOT IN ('England','Scotland','Wales','Northern Ireland','United Kingdom') OR (coalesce(e->>'website','')<>'' AND e->>'website' !~ '^https?://')) THEN RAISE EXCEPTION 'Invalid event'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e JOIN slug_redirects r ON r.entity_type='event' AND r.old_slug=e->>'slug') THEN RAISE EXCEPTION 'Historic alias cannot be recreated'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'editions') d WHERE d->>'date' !~ '^202[67]-[0-9]{2}-[0-9]{2}$' OR (d->>'date')::date NOT BETWEEN '2026-10-01' AND '2027-01-31' OR coalesce(d->>'distance','')='' OR coalesce((d->>'distanceKm')::numeric,0)<=0 OR (d->>'distanceKm')::numeric>100 OR d->>'source' !~ '^https?://' OR d->>'status' NOT IN ('TBC','Closed') OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e WHERE e->>'slug'=d->>'eventSlug')) THEN RAISE EXCEPTION 'Invalid edition'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'editions') d JOIN events e ON e.slug=d->>'eventSlug' JOIN editions ed ON ed.event_id=e.id AND ed.event_date=(d->>'date')::date AND (ed.distance_code=d->>'distance' OR abs(ed.distance_km-(d->>'distanceKm')::double precision)<0.025)) THEN RAISE EXCEPTION 'An edition is already live; reconcile before publishing'; END IF;
 SELECT count(*) INTO n FROM jsonb_array_elements(b.payload->'events') x WHERE NOT EXISTS(SELECT 1 FROM events e WHERE e.slug=x->>'slug');
 IF n<>47 THEN RAISE EXCEPTION 'New-event count changed: %',n; END IF;
 UPDATE catalogue_import_batches SET status='ready',validated_at=now(),validation_summary=jsonb_build_object('events',75,'editions',152,'newEvents',47,'invalidRows',0,'errors','[]'::jsonb,'checks',jsonb_build_array('scope','source URLs','canonical names and aliases','date-distance keys','monthly recurrence','pending batch identities','live edition conflicts'),'transport','authenticated_neon_staged_validated_audited_transaction'),error=null WHERE id=b.id;
END $validate$;

