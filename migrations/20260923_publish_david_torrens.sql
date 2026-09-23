-- Explicitly authorised profile publication, 23 September 2026.
-- The site owner sight-checked the individual result and approved manual
-- verification. This is not a claim that an automated fetch read the source.
-- The deployment migrator runs this entire file in one transaction.
DO $publication$
DECLARE
  target_athlete integer;
  target_event integer;
  target_edition integer;
  target_result integer;
  matches integer;
  before_profile jsonb;
  before_result jsonb;
  public_slug text;
  source_link constant text := 'https://results.eventchiptiming.com/myresults.aspx?CId=16202&RId=10399&EId=5&AId=253543';
  audit_note constant text := 'Paul Browne explicitly confirmed by sight and authorised publication on 2026-09-23: David Torrens, St Albans 10K, 2026-06-14, finished in 1:03:34 (3814 seconds). Timing basis and placings were not supplied. London, United Kingdom was supplied by Paul. Reepham 10K participation was reported without a date or time and is not added as a verified performance by this change.';
BEGIN
  -- This is a correction to an established catalogue, not a bootstrap seed.
  -- Inserting an athlete before the normal initial seed would make its
  -- non-empty-database safeguard skip the remainder of the initial catalogue.
  IF NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'seed_version') THEN
    RETURN;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('athrecs:publish:david-torrens:2026-06-14'));

  -- Repeat-safe even when exercised outside the deployment migration ledger.
  IF EXISTS (
    SELECT 1 FROM network_audit_log
    WHERE action = 'athlete.publish_david_torrens_20260923'
  ) THEN
    RETURN;
  END IF;

  SELECT count(*), min(id) INTO matches, target_athlete
  FROM athletes
  WHERE lower(regexp_replace(trim(display_name), '\s+', ' ', 'g')) = 'david torrens';
  IF matches > 1 THEN
    RAISE EXCEPTION 'David Torrens publication stopped: multiple athlete matches require staff review';
  END IF;

  IF target_athlete IS NOT NULL THEN
    SELECT to_jsonb(a) INTO before_profile FROM athletes a WHERE id = target_athlete FOR UPDATE;
    IF EXISTS (
      SELECT 1 FROM athlete_account_links
      WHERE athlete_id = target_athlete AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'David Torrens publication stopped: an active account controls this profile';
    END IF;
    IF nullif(trim(before_profile->>'city'), '') IS NOT NULL
       AND lower(trim(before_profile->>'city')) NOT IN ('london', 'london, united kingdom') THEN
      RAISE EXCEPTION 'David Torrens publication stopped: existing location requires identity review';
    END IF;
  ELSE
    INSERT INTO athletes
      (slug, display_name, given_name, family_name, gender, city, county, country, bio, profile_visibility)
    VALUES
      ('david-torrens', 'David Torrens', 'David', 'Torrens', 'U', 'London', '', 'United Kingdom',
       'David Torrens is a runner based in London, United Kingdom.', 'private')
    RETURNING id INTO target_athlete;
  END IF;

  -- Match the date AND the 10K distance, never the half-marathon race alone.
  SELECT count(*), min(ed.id) INTO matches, target_edition
  FROM editions ed JOIN events e ON e.id = ed.event_id
  WHERE ed.event_date = DATE '2026-06-14'
    AND ed.distance_code = '10K' AND ed.distance_km = 10
    AND e.sport IN ('Running', 'Athletics')
    AND lower(e.name) ~ 'st[ .-]*albans';
  IF matches > 1 THEN
    RAISE EXCEPTION 'David Torrens publication stopped: multiple St Albans 10K editions require review';
  END IF;

  IF target_edition IS NULL THEN
    SELECT count(*), min(id) INTO matches, target_event FROM events
    WHERE slug IN ('st-albans-10k', 'atw-st-albans-10k')
      OR lower(trim(name)) IN ('st albans 10k', 'atw st albans 10k');
    IF matches > 1 THEN
      RAISE EXCEPTION 'David Torrens publication stopped: duplicate St Albans 10K events require review';
    END IF;
    IF target_event IS NULL THEN
      INSERT INTO events (slug, name, sport, country, county, city, surface)
      VALUES ('st-albans-10k', 'St Albans 10K', 'Running', 'United Kingdom', '', 'St Albans', 'Road')
      RETURNING id INTO target_event;
    ELSIF EXISTS (SELECT 1 FROM events WHERE id = target_event AND sport NOT IN ('Running', 'Athletics')) THEN
      RAISE EXCEPTION 'David Torrens publication stopped: existing event has a conflicting sport';
    END IF;
    INSERT INTO event_distances (event_id, distance_code) VALUES (target_event, '10K') ON CONFLICT DO NOTHING;
    INSERT INTO editions (event_id, event_date, distance_code, distance_km, status, source_url)
    VALUES (target_event, DATE '2026-06-14', '10K', 10, 'Completed', source_link)
    RETURNING id INTO target_edition;
  END IF;

  SELECT to_jsonb(r), r.id INTO before_result, target_result
  FROM results r WHERE athlete_id = target_athlete AND edition_id = target_edition FOR UPDATE;
  IF target_result IS NOT NULL THEN
    IF lower(coalesce(before_result->>'status', '')) NOT IN ('finished', 'fin', '')
      OR coalesce(before_result->'result_details', '{}'::jsonb) ? 'disqualification'
      OR ((before_result->>'finish_time_seconds') IS NOT NULL
          AND (before_result->>'finish_time_seconds')::integer <> 3814) THEN
      RAISE EXCEPTION 'David Torrens publication stopped: existing result conflicts with the approved finish';
    END IF;
    UPDATE results SET finish_time_seconds = 3814, status = 'finished', result_visibility = 'public',
      source_url = coalesce(nullif(source_url, ''), source_link),
      result_source = CASE WHEN nullif(result_source, '') IS NULL
        THEN 'Event Chip Timing; manually verified by Paul Browne on 2026-09-23' ELSE result_source END,
      result_details = coalesce(result_details, '{}'::jsonb) || jsonb_build_object(
        'verification', jsonb_build_object('status', 'verified', 'method', 'staff_visual_confirmation',
          'verifiedBy', 'Paul Browne', 'verifiedOn', '2026-09-23', 'sourceUrl', source_link,
          'verifiedFields', jsonb_build_array('athlete', 'event', 'date', 'distance', 'finishStatus', 'finishTime'),
          'timingBasis', 'unspecified'))
    WHERE id = target_result;
  ELSE
    INSERT INTO results
      (edition_id, athlete_id, status, finish_time_seconds, result_visibility, source_url, result_source, result_details)
    VALUES
      (target_edition, target_athlete, 'finished', 3814, 'public', source_link,
       'Event Chip Timing; manually verified by Paul Browne on 2026-09-23',
       jsonb_build_object('verification', jsonb_build_object('status', 'verified',
         'method', 'staff_visual_confirmation', 'verifiedBy', 'Paul Browne', 'verifiedOn', '2026-09-23',
         'sourceUrl', source_link,
         'verifiedFields', jsonb_build_array('athlete', 'event', 'date', 'distance', 'finishStatus', 'finishTime'),
         'timingBasis', 'unspecified')))
    RETURNING id INTO target_result;
  END IF;

  INSERT INTO result_source_references (result_id, source_url, source_name)
  VALUES (target_result, source_link, 'Event Chip Timing') ON CONFLICT DO NOTHING;

  UPDATE athletes SET city = 'London', county = '', country = 'United Kingdom',
    profile_visibility = 'public',
    bio = CASE WHEN nullif(trim(bio), '') IS NULL
      THEN 'David Torrens is a runner based in London, United Kingdom.' ELSE bio END
  WHERE id = target_athlete;
  INSERT INTO athlete_identifiers (athlete_id) VALUES (target_athlete) ON CONFLICT DO NOTHING;

  -- Keep verification and before/after records in the staff audit, not the bio.
  INSERT INTO network_audit_log (action, entity_type, entity_id, before_value, after_value, note)
  SELECT 'athlete.publish_david_torrens_20260923', 'athlete', target_athlete::text,
    jsonb_build_object('profile', before_profile, 'result', before_result),
    jsonb_build_object('profile', to_jsonb(a), 'result', to_jsonb(r)), audit_note
  FROM athletes a JOIN results r ON r.athlete_id = a.id
  WHERE a.id = target_athlete AND r.id = target_result;

  SELECT slug INTO public_slug FROM athletes WHERE id = target_athlete;
  RAISE NOTICE 'Published athlete profile: /athletes/%; confirmed St Albans 10K result stored', public_slug;
END;
$publication$;
