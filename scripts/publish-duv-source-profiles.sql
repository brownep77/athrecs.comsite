-- Run in one transaction on an isolated branch first, then on production.
-- The caller must pause the job after its active lease finishes.
DO $guard$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM result_archive_import_jobs
   WHERE id='duv-2026-20261010' AND status='paused' AND lease_until IS NULL) THEN
  RAISE EXCEPTION 'Pause the DUV job after the worker lease finishes';
 END IF;
END $guard$;

SELECT version FROM result_archive_identity_clock WHERE singleton FOR UPDATE;

WITH policy AS (
 SELECT jsonb_build_object(
  'approvalId','paul-browne-duv-profile-publication-20261010',
  'visibility','public','scope','duv_created_unclaimed_profiles',
  'approvedBy','Paul Browne','approvedAt','2026-10-10T10:06:37Z',
  'instruction','can you do more please and make all athlete profiles public not private please.',
  'historiesPublished',false,'identityVerified',false) AS value
), candidates AS MATERIALIZED (
 SELECT a.id,a.profile_visibility,a.profile_details->'profilePublication' AS previous_publication
 FROM athletes a
 WHERE a.profile_details#>>'{archiveCreation,batchId}' IN
  ('duv-2026-20261010','duv-private-2026-event-136563')
 AND a.source_url LIKE 'https://statistik.d-u-v.org/getresultperson.php?runner=%'
 AND a.profile_visibility='private' AND a.parent_athlete_id IS NULL
 AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)
 ORDER BY a.id FOR UPDATE OF a
), published AS (
 UPDATE athletes a SET profile_visibility='public',
  profile_details=jsonb_set(a.profile_details,'{profilePublication}',policy.value)
 FROM candidates c CROSS JOIN policy WHERE a.id=c.id
 RETURNING a.id,c.profile_visibility,c.previous_publication,a.profile_details->'profilePublication' AS publication
), audited AS (
 INSERT INTO network_audit_log(action,entity_type,entity_id,before_value,after_value,note)
 SELECT 'athlete.profile_admin_published','athlete',id::text,
  jsonb_build_object('profile_visibility',profile_visibility,'profilePublication',previous_publication),
  jsonb_build_object('athleteId',id,'profile_visibility','public','profilePublication',publication),
  'Paul Browne authorized public DUV-created unclaimed profiles. Source histories remain unpublished and unverified.'
 FROM published RETURNING entity_id
), configured AS (
 UPDATE result_archive_import_jobs SET configuration=jsonb_set(configuration,'{profilePublication}',policy.value),updated_at=now()
 FROM policy WHERE id='duv-2026-20261010' RETURNING id
)
SELECT (SELECT count(*) FROM audited) AS profiles_published,
 (SELECT count(*) FROM configured) AS jobs_configured;
