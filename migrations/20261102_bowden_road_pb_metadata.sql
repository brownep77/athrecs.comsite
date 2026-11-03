-- Restore road PB classification for four existing, source-matched performances.
-- These are metadata corrections, not new results or verification upgrades.
-- The migration runner applies this file transactionally; exact preimages and
-- supporting URLs are retained only in the private network audit.
-- Reviewed 2026-11-02:
-- https://philybowden.com/pages/about
-- https://worldathletics.org/competitions/world-athletics-label-road-races/calendar-results/7207732/result
-- https://worldathletics.org/competitions/world-athletics-label-road-races/calendar-results/7207753/result
-- https://worldathletics.org/competition/calendar-results/results/7207753?eventId=10229541
-- https://www.ukresults.net/2022/sauconybpr.html
-- https://www.ukresults.net/2022cal.html
-- https://run-northwest.niftyentries.com/Results/Trafford-10K-2024/2718/1
DO $road_pb_metadata$
DECLARE
  history_record record;
  source_row record;
  before_row jsonb;
  after_row jsonb;
  corrected_performances jsonb;
  evidence_urls jsonb;
  corrected_meeting text;
  history_changed boolean;
BEGIN
  FOR history_record IN
    SELECT h.*
    FROM athlete_source_histories h
    JOIN athletes a ON a.id = h.athlete_id
    WHERE a.slug = 'philippa-bowden-wa-14586863'
      AND a.display_name = 'Philippa Bowden'
    ORDER BY h.provider, h.external_id
    FOR UPDATE OF h
  LOOP
    corrected_performances := history_record.performances;
    history_changed := false;

    FOR source_row IN
      SELECT performance, ordinal
      FROM jsonb_array_elements(history_record.performances)
        WITH ORDINALITY AS source_rows(performance, ordinal)
    LOOP
      before_row := source_row.performance;
      evidence_urls := NULL;
      corrected_meeting := NULL;

      -- A name, distance or city alone never establishes a road result. Match
      -- this athlete's edition, exact mark, discipline, venue and stored title.
      IF before_row->>'date' = '2024-09-29'
        AND lower(btrim(before_row->>'discipline')) = 'marathon'
        AND before_row->>'performance' IN ('2:25:47', '02:25:47')
        AND lower(btrim(before_row->>'venue')) IN ('berlin (ger)', 'berlin')
        AND before_row->>'meeting' IN ('World Athletics all-time toplist', 'Berlin Marathon')
      THEN
        corrected_meeting := 'Berlin Marathon';
        evidence_urls := '["https://philybowden.com/pages/about", "https://worldathletics.org/competitions/world-athletics-label-road-races/calendar-results/7207732/result"]'::jsonb;
      ELSIF before_row->>'date' = '2024-04-07'
        AND lower(btrim(before_row->>'discipline')) IN ('half marathon', 'half')
        AND before_row->>'performance' IN ('1:12:15', '01:12:15')
        AND lower(btrim(before_row->>'venue')) IN ('berlin (ger)', 'berlin')
        AND before_row->>'meeting' IN ('World Athletics all-time toplist', 'Berlin Half Marathon')
      THEN
        corrected_meeting := 'Berlin Half Marathon';
        evidence_urls := '["https://philybowden.com/pages/about", "https://worldathletics.org/competitions/world-athletics-label-road-races/calendar-results/7207753/result", "https://worldathletics.org/competition/calendar-results/results/7207753?eventId=10229541"]'::jsonb;
      ELSIF before_row->>'date' = '2022-07-02'
        AND lower(regexp_replace(before_row->>'discipline', '\s', '', 'g')) IN ('5k', '5km')
        AND before_row->>'performance' IN ('15:44', '00:15:44')
        AND lower(btrim(before_row->>'venue')) = 'leicester'
        AND before_row->>'meeting' IN ('Leicester — 5km', 'Saucony X Podium 5K (B race)')
      THEN
        corrected_meeting := 'Saucony X Podium 5K (B race)';
        evidence_urls := '["https://www.ukresults.net/2022/sauconybpr.html", "https://www.ukresults.net/2022cal.html"]'::jsonb;
      ELSIF before_row->>'date' = '2024-03-03'
        AND lower(regexp_replace(before_row->>'discipline', '\s', '', 'g')) IN ('10k', '10km')
        AND before_row->>'performance' IN ('32:32', '00:32:32')
        AND lower(btrim(before_row->>'venue')) = 'partington'
        AND before_row->>'meeting' IN ('Partington — 10km', 'Trafford 10K')
        AND before_row#>>'{timing,basis}' = 'chip'
        AND (before_row#>>'{timing,chip}' IS NULL
          OR before_row#>>'{timing,chip}' IN ('32:32', '00:32:32'))
        AND before_row#>>'{timing,gun}' IN ('32:35', '00:32:35')
      THEN
        corrected_meeting := 'Trafford 10K';
        evidence_urls := '["https://run-northwest.niftyentries.com/Results/Trafford-10K-2024/2718/1"]'::jsonb;
      END IF;

      IF evidence_urls IS NULL OR jsonb_typeof(before_row->'labels') IS DISTINCT FROM 'array' THEN
        CONTINUE;
      END IF;

      -- A conflicting surface requires separate review; never erase its label
      -- or silently make trail, mixed terrain or track records road-eligible.
      IF EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(before_row->'labels') AS label(value)
        WHERE lower(btrim(label.value)) ~ '^(trail( running)?|cross[ -]country|xc|fell( running)?|mountain( running)?|multi[ -]terrain( running)?|mixed|track|off[ -]?road|non[ -]?road|not( an?)? road)$'
      ) THEN
        CONTINUE;
      END IF;

      after_row := before_row;
      IF NOT EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(before_row->'labels') AS label(value)
        WHERE lower(btrim(label.value)) IN ('road', 'road running')
      ) THEN
        after_row := jsonb_set(after_row, '{labels}', (before_row->'labels') || '["Road"]'::jsonb);
      END IF;
      after_row := jsonb_set(after_row, '{meeting}', to_jsonb(corrected_meeting));
      IF after_row = before_row THEN
        CONTINUE;
      END IF;

      -- Preserve snapshot-scoped include/exclude choices after the metadata
      -- hash changes. Keep the original choice and its original confirmation.
      PERFORM 1 FROM athlete_profile_history_choices choice
        WHERE choice.athlete_id = history_record.athlete_id
          AND choice.provider = history_record.provider
          AND choice.external_id = history_record.external_id
          AND choice.performance_hash IN (md5(before_row::text), md5(after_row::text))
        FOR UPDATE;
      IF EXISTS (
        SELECT 1
        FROM athlete_profile_history_choices old_choice
        JOIN athlete_profile_history_choices new_choice
          USING (user_id, athlete_id, provider, external_id)
        WHERE old_choice.athlete_id = history_record.athlete_id
          AND old_choice.provider = history_record.provider
          AND old_choice.external_id = history_record.external_id
          AND old_choice.performance_hash = md5(before_row::text)
          AND new_choice.performance_hash = md5(after_row::text)
          AND old_choice.excluded <> new_choice.excluded
      ) THEN
        RAISE EXCEPTION 'Conflicting profile choices during road metadata correction; no changes applied.';
      END IF;
      INSERT INTO athlete_profile_history_choices
        (user_id, athlete_id, provider, external_id, performance_hash, excluded, confirmed_at)
      SELECT user_id, athlete_id, provider, external_id, md5(after_row::text), excluded, confirmed_at
      FROM athlete_profile_history_choices
      WHERE athlete_id = history_record.athlete_id
        AND provider = history_record.provider
        AND external_id = history_record.external_id
        AND performance_hash = md5(before_row::text)
      ON CONFLICT (user_id, athlete_id, provider, external_id, performance_hash) DO NOTHING;

      INSERT INTO network_audit_log
        (action, entity_type, entity_id, before_value, after_value, note)
      VALUES (
        'athlete.history_road_surface_corrected',
        'athlete_source_history',
        history_record.athlete_id::text || ':' || history_record.provider || ':' || history_record.external_id || ':' || (source_row.ordinal - 1)::text,
        jsonb_build_object('athleteId', history_record.athlete_id, 'performance', before_row),
        jsonb_build_object('athleteId', history_record.athlete_id, 'performance', after_row,
          'sourceUrls', evidence_urls, 'reviewedAt', '2026-11-02',
          'migration', '20261102_bowden_road_pb_metadata.sql'),
        'Corrected the road classification and event title of an existing source-matched performance. Original timing, verification, exclusions, publication and ownership are unchanged.'
      );
      corrected_performances := jsonb_set(corrected_performances,
        ARRAY[(source_row.ordinal - 1)::text], after_row, false);
      history_changed := true;
    END LOOP;

    IF history_changed THEN
      UPDATE athlete_source_histories
      SET performances = corrected_performances
      WHERE athlete_id = history_record.athlete_id
        AND provider = history_record.provider
        AND external_id = history_record.external_id;
    END IF;
  END LOOP;
END
$road_pb_metadata$;
