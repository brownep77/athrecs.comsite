-- The 27 September 2026 London 10,000 card named Todd Lake of Wymondham AC.
-- That slug was already a different URL, so the import created
-- todd-lake-london-10000-2026. The existing profile is the same club, so
-- keep one public athlete and retire the extra profile.
DO $merge$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM app_meta WHERE key = 'seed_version') THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM athletes WHERE slug = 'todd-lake') THEN
    RETURN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM athletes WHERE slug = 'todd-lake-london-10000-2026') THEN
    RETURN;
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM athletes existing
    LEFT JOIN clubs club ON club.id = existing.club_id
    WHERE existing.slug = 'todd-lake'
      AND (
        club.name ILIKE 'Wymondham AC'
        OR existing.source_club_name ILIKE 'Wymondham AC'
      )
  ) THEN
    RETURN;
  END IF;

  INSERT INTO results (
    edition_id, athlete_id, status, finish_time_seconds, chip_time_seconds, gun_time_seconds,
    bib, overall_place, gender_place, category, category_place, result_source, source_url,
    result_visibility
  )
  SELECT
    duplicate_result.edition_id,
    existing.id,
    duplicate_result.status,
    duplicate_result.finish_time_seconds,
    duplicate_result.chip_time_seconds,
    duplicate_result.gun_time_seconds,
    duplicate_result.bib,
    duplicate_result.overall_place,
    duplicate_result.gender_place,
    duplicate_result.category,
    duplicate_result.category_place,
    duplicate_result.result_source,
    duplicate_result.source_url,
    'public'
  FROM results duplicate_result
  JOIN athletes duplicate ON duplicate.id = duplicate_result.athlete_id
  JOIN athletes existing ON existing.slug = 'todd-lake'
  JOIN editions edition ON edition.id = duplicate_result.edition_id
  WHERE duplicate.slug = 'todd-lake-london-10000-2026'
    AND edition.event_date = DATE '2026-09-27'
    AND edition.distance_code = '10K'
    AND duplicate_result.source_url = 'https://results.vitalitylondon10000.co.uk/2026/'
  ON CONFLICT (edition_id, athlete_id) DO NOTHING;

  DELETE FROM results duplicate_result
  USING athletes duplicate, editions edition, athletes existing
  WHERE duplicate_result.athlete_id = duplicate.id
    AND duplicate.slug = 'todd-lake-london-10000-2026'
    AND edition.id = duplicate_result.edition_id
    AND edition.event_date = DATE '2026-09-27'
    AND edition.distance_code = '10K'
    AND duplicate_result.source_url = 'https://results.vitalitylondon10000.co.uk/2026/'
    AND existing.slug = 'todd-lake'
    AND EXISTS (
      SELECT 1
      FROM results kept
      WHERE kept.athlete_id = existing.id
        AND kept.edition_id = duplicate_result.edition_id
        AND kept.source_url = duplicate_result.source_url
        AND kept.finish_time_seconds = duplicate_result.finish_time_seconds
    );

  UPDATE athletes
  SET profile_visibility = 'private'
  WHERE slug = 'todd-lake-london-10000-2026'
    AND EXISTS (
      SELECT 1
      FROM results kept
      JOIN athletes existing ON existing.id = kept.athlete_id
      JOIN editions edition ON edition.id = kept.edition_id
      WHERE existing.slug = 'todd-lake'
        AND edition.event_date = DATE '2026-09-27'
        AND edition.distance_code = '10K'
        AND kept.source_url = 'https://results.vitalitylondon10000.co.uk/2026/'
    );
END
$merge$;
