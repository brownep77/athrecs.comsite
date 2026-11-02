-- READ ONLY. Run with psql -X -qAt -v as_of=YYYY-MM-DD -f this-file.sql.
-- Store the resulting JSON privately; do not commit production snapshots.
BEGIN READ ONLY;
WITH input AS (
  SELECT :'as_of'::date AS as_of
), histories AS (
  SELECT * FROM athlete_source_histories WHERE provider = 'World Triathlon'
), performances AS (
  SELECT h.athlete_id, h.external_id, p.value AS performance
  FROM histories h
  CROSS JOIN LATERAL jsonb_array_elements(h.performances) p
), source_keys AS (
  SELECT p.athlete_id, k.value AS source_key
  FROM performances p
  CROSS JOIN LATERAL jsonb_array_elements_text(
    coalesce(p.performance->'sourceKeys', '[]'::jsonb)
  ) k
  WHERE k.value LIKE 'world-triathlon:%'
), duplicate_keys AS (
  SELECT source_key, count(*) AS occurrences,
    count(DISTINCT athlete_id) AS athlete_count
  FROM source_keys GROUP BY source_key HAVING count(*) > 1
), source_events AS (
  SELECT * FROM events
  WHERE source_url ~* '^https?://([a-z0-9-]+[.])*triathlon[.]org(/|$)'
    OR website ~* '^https?://([a-z0-9-]+[.])*triathlon[.]org(/|$)'
), source_editions AS (
  SELECT d.* FROM editions d JOIN source_events e ON e.id = d.event_id
), approvals AS (
  SELECT approval_basis, scope, count(*)::integer AS n
  FROM result_archive_capture_approvals
  WHERE provider = 'World Triathlon' AND revoked_at IS NULL
  GROUP BY approval_basis, scope
)
SELECT jsonb_build_object(
  'scope', 'world-triathlon-linked-event-histories-v1',
  'as_of', input.as_of::text,
  'window_end', (input.as_of + interval '3 months')::date::text,
  'events', (SELECT count(*) FROM source_events),
  'edition_rows', (SELECT count(*) FROM source_editions),
  'upcoming_rows', (SELECT count(*) FROM source_editions WHERE event_date >= input.as_of),
  'next_three_months', (SELECT count(*) FROM source_editions
    WHERE event_date BETWEEN input.as_of AND (input.as_of + interval '3 months')::date),
  'next_three_months_blank_starts', (SELECT count(*) FROM source_editions
    WHERE event_date BETWEEN input.as_of AND (input.as_of + interval '3 months')::date
      AND nullif(trim(start_time), '') IS NULL),
  'future_other_distance', (SELECT count(*) FROM source_editions
    WHERE event_date >= input.as_of AND distance_code = 'Other'),
  'histories', (SELECT count(*) FROM histories),
  'athletes', (SELECT count(DISTINCT athlete_id) FROM histories),
  'performance_rows', (SELECT count(*) FROM performances),
  'published_histories', (SELECT count(*) FROM histories WHERE published_at IS NOT NULL),
  'complete_histories', (SELECT count(*) FROM histories WHERE complete),
  'keyed_rows', (SELECT count(*) FROM performances p WHERE EXISTS (
    SELECT 1 FROM jsonb_array_elements_text(coalesce(p.performance->'sourceKeys', '[]'::jsonb)) k
    WHERE k.value LIKE 'world-triathlon:%'
  )),
  'duplicate_key_groups', (SELECT count(*) FROM duplicate_keys),
  'cross_profile_duplicate_keys', (SELECT count(*) FROM duplicate_keys WHERE athlete_count > 1),
  'capture_approvals', (SELECT coalesce(jsonb_agg(a ORDER BY approval_basis, scope), '[]'::jsonb) FROM approvals a)
) AS snapshot FROM input;
COMMIT;
