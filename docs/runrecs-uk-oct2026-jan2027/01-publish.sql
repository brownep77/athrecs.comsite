-- Append only after validation. Existing event fields, editions and entries are preserved.
-- This transaction uses the catalogue revision lock and the same full snapshots as
-- catalogue-publishing.server.ts, allowing normal catalogue rollback tooling.
DO $publish$
DECLARE b catalogue_import_batches%ROWTYPE; previous_revision bigint; rev bigint; x jsonb; event_id_value int; edition_id_value int; before_value jsonb; after_value jsonb; summary_value jsonb;
BEGIN
 SELECT current_revision_id INTO previous_revision FROM catalogue_publish_state WHERE id=1 FOR UPDATE;
 SELECT * INTO STRICT b FROM catalogue_import_batches WHERE id='5cfc80bc-0c04-579a-89da-f498ea635157' FOR UPDATE;
 IF b.status<>'ready' OR b.payload_hash<>'650c1cc70769f36683d8b04b93f15619fd15330c070359acbaca896f1aa47785' OR b.validation_summary->>'invalidRows'<>'0' THEN RAISE EXCEPTION 'Only this validated ready batch may publish'; END IF;
 PERFORM e.id FROM events e JOIN jsonb_array_elements(b.payload->'events') candidate ON e.slug=candidate->>'slug' FOR UPDATE OF e;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'events') e JOIN slug_redirects r ON r.entity_type='event' AND r.old_slug=e->>'slug') THEN RAISE EXCEPTION 'Alias changed after validation'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(b.payload->'editions') d JOIN events e ON e.slug=d->>'eventSlug' JOIN editions ed ON ed.event_id=e.id AND ed.event_date=(d->>'date')::date AND (ed.distance_code=d->>'distance' OR abs(ed.distance_km-(d->>'distanceKm')::double precision)<0.025)) THEN RAISE EXCEPTION 'Edition appeared after validation'; END IF;
 UPDATE catalogue_import_batches SET status='publishing' WHERE id=b.id;
 INSERT INTO catalogue_revisions(batch_id,previous_revision_id,published_by) VALUES(b.id,previous_revision,'paultwbrowne@gmail.com') RETURNING id INTO rev;
 FOR x IN SELECT value FROM jsonb_array_elements(b.payload->'events') LOOP
  before_value:=null;
  SELECT jsonb_build_object('record',to_jsonb(e),'distances',coalesce((SELECT jsonb_agg(distance_code ORDER BY distance_code) FROM event_distances WHERE event_id=e.id),'[]'::jsonb)) INTO before_value FROM events e WHERE e.slug=x->>'slug';
  SELECT id INTO event_id_value FROM events WHERE slug=x->>'slug';
  IF event_id_value IS NULL THEN
   INSERT INTO events(slug,name,sport,country,county,city,area,surface,summary,description,organiser,website,featured,source_url)
   VALUES(x->>'slug',x->>'name',x->>'sport',x->>'country',coalesce(x->>'county',''),coalesce(x->>'city',''),coalesce(x->>'area',''),coalesce(x->>'surface','Road'),coalesce(x->>'summary',''),coalesce(x->>'description',''),coalesce(x->>'organiser',''),coalesce(x->>'website',''),false,x->>'website') RETURNING id INTO event_id_value;
  END IF;
  INSERT INTO event_distances(event_id,distance_code) SELECT event_id_value,value FROM jsonb_array_elements_text(x->'distances') ON CONFLICT DO NOTHING;
  SELECT jsonb_build_object('record',to_jsonb(e),'distances',coalesce((SELECT jsonb_agg(distance_code ORDER BY distance_code) FROM event_distances WHERE event_id=e.id),'[]'::jsonb)) INTO after_value FROM events e WHERE e.id=event_id_value;
  INSERT INTO catalogue_change_log(revision_id,entity_type,entity_key,operation,before_json,after_json) VALUES(rev,'event',x->>'slug',CASE WHEN before_value IS NULL THEN 'insert' ELSE 'update' END,before_value,after_value);
 END LOOP;
 FOR x IN SELECT value FROM jsonb_array_elements(b.payload->'editions') LOOP
  SELECT id INTO STRICT event_id_value FROM events WHERE slug=x->>'eventSlug';
  INSERT INTO editions(event_id,event_date,distance_code,distance_km,status,entry_url,source_url,start_time,notes)
  VALUES(event_id_value,(x->>'date')::date,x->>'distance',(x->>'distanceKm')::double precision,x->>'status',null,x->>'source',x->>'startTime',x->>'notes') RETURNING id INTO edition_id_value;
  SELECT jsonb_build_object('record',to_jsonb(ed),'entryOptions','[]'::jsonb) INTO after_value FROM editions ed WHERE ed.id=edition_id_value;
  INSERT INTO catalogue_change_log(revision_id,entity_type,entity_key,operation,before_json,after_json) VALUES(rev,'edition',concat_ws('|',x->>'eventSlug',x->>'date',x->>'distance'),'insert',null,after_value);
 END LOOP;
 summary_value:=jsonb_build_object('eventsUpserted',75,'newEvents',54,'editionsUpserted',90,'entryOptionsUpserted',0,'revisionId',rev);
 UPDATE catalogue_revisions SET summary=summary_value WHERE id=rev;
 UPDATE catalogue_import_batches SET status='published',published_at=now(),publish_summary=summary_value,error=null WHERE id=b.id;
 UPDATE catalogue_publish_state SET current_revision_id=rev,updated_at=now() WHERE id=1;
END $publish$;

