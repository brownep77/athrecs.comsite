-- Explicit owner approval, 10 October 2026. Test on a production clone first.
-- Only previously matched, compared DUV evidence on unclaimed public profiles.
DO $publication$
DECLARE approval jsonb := jsonb_build_object(
 'approvalId','paul-browne-duv-history-publication-20261010',
 'approvedBy','Paul Browne','approvedAt','2026-10-10T20:52:00Z',
 'instruction','can you make them all public please',
 'visibility','public','scope','duv_matched_unclaimed_public_profiles',
 'identityVerified',false);
 n integer; evidence_before text; evidence_after text;
BEGIN
 SET LOCAL lock_timeout='8s'; SET LOCAL statement_timeout='55s';
 PERFORM version FROM result_archive_identity_clock WHERE singleton FOR UPDATE;
 PERFORM id FROM result_archive_import_jobs WHERE id='duv-2026-20261010'
   AND status='paused' AND (lease_until IS NULL OR lease_until<now()) FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Pause importer and wait for its lease before publishing'; END IF;
 CREATE TEMP TABLE duv_publish_candidates ON COMMIT DROP AS
 SELECT h.provider,h.external_id,h.athlete_id,h.performances,h.source_url,h.published_at
 FROM athlete_source_histories h JOIN athletes a ON a.id=h.athlete_id
 WHERE h.provider='DUV Ultra Marathon Statistics' AND h.published_at IS NULL
   AND a.profile_visibility='public' AND a.parent_athlete_id IS NULL
   AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
   AND jsonb_array_length(h.performances)>0
   AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(h.performances) p
    WHERE p->>'verificationStatus' IS DISTINCT FROM 'unverified'
      OR p->>'profileExcluded'='true'
      OR p#>>'{archiveReference,sourceAthleteId}' IS DISTINCT FROM
         split_part(split_part(h.external_id,'runner-',2),':',1)
      OR NOT EXISTS (
       SELECT 1 FROM result_archive_source_captures c
       CROSS JOIN LATERAL jsonb_array_elements(c.payload->'rows') r
       WHERE c.provider=h.provider AND c.source_check='compared'
        AND c.source_key=p#>>'{archiveReference,sourceKey}'
        AND (c.id::text=p#>>'{archiveReference,captureId}' OR
          (p#>>'{archiveReference,captureId}' IS NULL AND c.html_sha256=p#>>'{archiveReference,htmlSha256}'))
        AND r->>'sourceAthleteId'=p#>>'{archiveReference,sourceAthleteId}'
        AND r->>'sourceRow'=p#>>'{archiveReference,sourceRow}'
        AND r->'original'=p#>'{archiveReference,original}'
      )
   );
 SELECT md5(string_agg(md5(performances::text||source_url),'' ORDER BY external_id))
 INTO evidence_before FROM duv_publish_candidates;
 WITH updated AS (
  UPDATE athlete_source_histories h SET published_at=now()
  FROM duv_publish_candidates c WHERE h.provider=c.provider AND h.external_id=c.external_id
    AND h.athlete_id=c.athlete_id AND h.performances=c.performances AND h.published_at IS NULL
  RETURNING h.*
 )
 INSERT INTO network_audit_log(action,entity_type,entity_id,before_value,after_value,note)
 SELECT 'athlete.history_admin_published','athlete_source_history',provider||':'||external_id,
  jsonb_build_object('publishedAt',NULL),
  jsonb_build_object('athleteId',athlete_id,'publishedAt',published_at,'approval',approval,'identityVerified',false),
  'Owner requested all imported results public. Matched DUV source evidence remains unverified; original values retained.'
 FROM updated;
 GET DIAGNOSTICS n=ROW_COUNT;
 IF n<>(SELECT count(*) FROM duv_publish_candidates) THEN RAISE EXCEPTION 'Publication count conflict'; END IF;
 SELECT md5(string_agg(md5(h.performances::text||h.source_url),'' ORDER BY h.external_id))
 INTO evidence_after FROM athlete_source_histories h JOIN duv_publish_candidates c USING(provider,external_id);
 IF evidence_before IS DISTINCT FROM evidence_after THEN RAISE EXCEPTION 'Source evidence changed'; END IF;
 UPDATE result_archive_import_jobs SET configuration=configuration||jsonb_build_object('historyPublication',approval),updated_at=now()
 WHERE id='duv-2026-20261010';
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 VALUES('duv.histories_publication_completed','result_archive_import_job','duv-2026-20261010',
  jsonb_build_object('approval',approval,'historiesPublished',n,'evidenceHash',evidence_after),
  'Publication only: compared originals, nationality observations, matching receipts and verification status unchanged.');
END $publication$;
