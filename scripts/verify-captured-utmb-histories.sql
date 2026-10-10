-- Owner accepts UTMB-listed performances as a verification source, 10 Oct 2026.
-- No URL-only verification: require an exact match to retained compared evidence.
DO $utmb_verification$
DECLARE n integer;
BEGIN
 SET LOCAL lock_timeout='8s'; SET LOCAL statement_timeout='55s';
 PERFORM version FROM result_archive_identity_clock WHERE singleton FOR UPDATE;
 CREATE TEMP TABLE utmb_verification_candidates ON COMMIT DROP AS
 SELECT h.athlete_id,h.provider,h.external_id,h.performances AS previous,
  jsonb_agg(CASE WHEN source.id IS NOT NULL THEN
   p || jsonb_build_object('verificationStatus','source_verified',
    'verificationBasis',jsonb_build_object('type','owner_accepted_utmb_source',
     'approvedBy','Paul Browne','approvedAt','2026-10-10T20:57:30Z',
     'instruction','any result on utmb website can be verified',
     'sourceCaptureId',source.id,'sourceUrl',source.source_url,
     'htmlSha256',source.html_sha256,'identityVerified',false),
    'places',jsonb_build_object('overall',p#>'{archiveReference,original,rank}',
     'gender',p#>'{archiveReference,original,rankGender}','category',NULL))
   ELSE p END ORDER BY ordinal) AS next,
  count(*) FILTER(WHERE source.id IS NOT NULL)::int AS verified_count
 FROM athlete_source_histories h
 CROSS JOIN LATERAL jsonb_array_elements(h.performances) WITH ORDINALITY perf(p,ordinal)
 LEFT JOIN LATERAL (
  SELECT c.id,c.source_url,c.html_sha256 FROM result_archive_source_captures c
  CROSS JOIN LATERAL jsonb_array_elements(c.payload->'performances') r
  WHERE h.provider='utmb' AND p->>'verificationStatus'='unverified'
   AND c.provider='utmb' AND c.source_check='compared'
   AND c.payload->>'sourceAthleteId'=h.external_id
   AND c.source_url LIKE 'https://utmb.world/%' AND r=p
  ORDER BY c.captured_at DESC LIMIT 1
 ) source ON true
 WHERE h.provider='utmb'
 GROUP BY h.athlete_id,h.provider,h.external_id,h.performances
 HAVING count(source.id)>0;
 INSERT INTO network_audit_log(action,entity_type,entity_id,before_value,after_value,note)
 SELECT 'athlete.utmb_source_verified','athlete_source_history',provider||':'||external_id,
  jsonb_build_object('athleteId',athlete_id,'performances',previous),
  jsonb_build_object('athleteId',athlete_id,'performances',next,'resultsVerified',verified_count),
  'Paul Browne accepts UTMB-listed results as source-verified. Exact retained source comparison; identity and publication settings unchanged.'
 FROM utmb_verification_candidates;
 UPDATE athlete_source_histories h SET performances=c.next
 FROM utmb_verification_candidates c WHERE h.provider=c.provider AND h.external_id=c.external_id
  AND h.athlete_id=c.athlete_id AND h.performances=c.previous;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>(SELECT count(*) FROM utmb_verification_candidates) THEN RAISE EXCEPTION 'UTMB verification conflict'; END IF;
END $utmb_verification$;
