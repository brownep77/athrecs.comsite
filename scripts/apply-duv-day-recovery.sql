-- The private JSON plan is bound through transaction-local set_config.
-- Render only the checked numeric revision at __REVISION__.
-- Validate on an isolated branch first. No provider requests.
DO $duv_day_recovery$
DECLARE plan jsonb := current_setting('athrecs.duv_day_plan')::jsonb; job result_archive_import_jobs%ROWTYPE;
revision text; capdata jsonb; t jsonb; actual result_archive_source_captures%ROWTYPE;
source_rows jsonb:='{}'; ids jsonb:='{}'; n int; already int; created int; affected int;
BEGIN
 SET LOCAL lock_timeout='2s'; SET LOCAL statement_timeout='45s';
 SELECT version::text INTO revision FROM result_archive_identity_clock WHERE singleton FOR UPDATE;
 IF revision IS DISTINCT FROM '__REVISION__' THEN RAISE EXCEPTION 'day_recovery_identity_revision_changed'; END IF;
 SELECT * INTO STRICT job FROM result_archive_import_jobs WHERE id=plan->>'jobId' FOR UPDATE NOWAIT;
 IF job.status IS DISTINCT FROM 'paused' OR job.expires_at<=now() OR (job.lease_until IS NOT NULL AND job.lease_until>now())
 OR job.approval_id IS DISTINCT FROM plan->>'approvalId' OR job.configuration->'profilePublication' IS DISTINCT FROM plan->'profilePublication'
 OR job.configuration#>>'{profilePublication,visibility}' IS DISTINCT FROM 'public'
 OR job.configuration#>>'{profilePublication,scope}' IS DISTINCT FROM 'duv_created_unclaimed_profiles'
 OR nullif(job.configuration#>>'{profilePublication,revokedAt}','') IS NOT NULL
 THEN RAISE EXCEPTION 'day_recovery_job_or_publication_approval'; END IF;
 PERFORM id FROM result_archive_capture_approvals WHERE id=job.approval_id AND provider='DUV Ultra Marathon Statistics' AND scope='staff_only' AND revoked_at IS NULL FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'day_recovery_capture_approval'; END IF;
 n:=jsonb_array_length(plan->'items');
 IF n<1 OR n>500 THEN RAISE EXCEPTION 'day_recovery_batch_size'; END IF;
 SELECT count(*) INTO already FROM network_audit_log a JOIN jsonb_array_elements(plan->'items') x ON a.after_value->>'reviewId'=x->>'reviewId' WHERE a.action='duv.held_day_recovered';
 IF already=n THEN
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(plan->'items') x LEFT JOIN result_archive_import_matches m ON m.job_id=job.id AND m.source_key=x#>>'{match,source_key}' AND m.source_row=(x#>>'{match,source_row}')::int
   LEFT JOIN athlete_source_histories h ON h.provider='DUV Ultra Marathon Statistics' AND h.external_id=x->>'externalId'
   WHERE m.status IS DISTINCT FROM x#>>'{decision,status}' OR NOT(m.reasons @> jsonb_build_array(jsonb_build_object('reviewId',x->>'reviewId')))
   OR (m.status<>'held' AND (h.athlete_id IS DISTINCT FROM m.athlete_id OR h.performances IS DISTINCT FROM x->'performances' OR h.published_at IS NOT NULL OR h.complete IS DISTINCT FROM false)))
  THEN RAISE EXCEPTION 'day_recovery_replay_conflict'; END IF;
  RETURN;
 ELSIF already<>0 THEN RAISE EXCEPTION 'day_recovery_partial_prior_apply'; END IF;
 IF revision IS DISTINCT FROM plan->>'revision' THEN RAISE EXCEPTION 'day_recovery_plan_revision_changed'; END IF;
 FOR capdata IN SELECT value FROM jsonb_array_elements(plan->'captures') LOOP
  SELECT cc.* INTO STRICT actual FROM result_archive_import_queue q JOIN result_archive_source_captures cc ON cc.id=q.capture_id
  WHERE q.job_id=job.id AND q.source_key=capdata->>'source_key' AND q.status='imported' AND q.row_cursor=q.rows_total AND q.rows_total=(capdata->>'row_count')::int FOR SHARE OF cc FOR UPDATE OF q;
  IF actual.id IS DISTINCT FROM (capdata->>'capture_id')::bigint OR actual.payload_hash IS DISTINCT FROM capdata->>'payload_hash'
   OR actual.html_sha256 IS DISTINCT FROM capdata->>'html_sha256' OR actual.captured_at IS DISTINCT FROM (capdata->>'captured_at')::timestamptz
   OR actual.source_url IS DISTINCT FROM capdata->>'source_url' OR actual.provider IS DISTINCT FROM 'DUV Ultra Marathon Statistics'
   OR actual.source_check IS DISTINCT FROM 'compared' OR actual.payload->>'publication' IS DISTINCT FROM 'staff_only'
  THEN RAISE EXCEPTION 'day_recovery_original_capture_changed'; END IF;
  PERFORM id FROM result_archive_capture_approvals WHERE id=actual.approval_id AND scope='staff_only' AND provider='DUV Ultra Marathon Statistics' AND revoked_at IS NULL FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'day_recovery_original_approval'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(capdata->'documents') d LEFT JOIN result_archive_import_documents dd ON dd.job_id=job.id AND dd.source_key=actual.source_key AND dd.source_url=d->>'source_url'
   WHERE dd.status IS DISTINCT FROM 'captured' OR dd.html_sha256 IS DISTINCT FROM d->>'html_sha256' OR dd.captured_at IS DISTINCT FROM (d->>'captured_at')::timestamptz)
  THEN RAISE EXCEPTION 'day_recovery_document_changed'; END IF;
  source_rows:=source_rows||jsonb_build_object(actual.source_key,actual.payload->'rows');
 END LOOP;
 FOR t IN SELECT value FROM jsonb_array_elements(plan->'items') LOOP
  IF source_rows->(t#>>'{match,source_key}')->((t#>>'{match,source_row}')::int-1) IS DISTINCT FROM t->'original'
   OR t#>>'{original,sourceAthleteId}' IS DISTINCT FROM t#>>'{match,source_athlete_id}'
   OR t#>>'{original,status}' IS DISTINCT FROM 'finished' OR t#>>'{original,performance,kind}' IS DISTINCT FROM 'unparsed'
   OR t#>>'{performances,0,performance}' IS DISTINCT FROM t#>>'{original,performanceDisplay}'
   OR t#>'{performances,0,archiveReference,original}' IS DISTINCT FROM t#>'{original,original}'
   OR t#>>'{performances,0,verificationStatus}' IS DISTINCT FROM 'unverified'
   OR t#>>'{performances,0,performanceMeasurement,kind}' IS DISTINCT FROM 'time'
  THEN RAISE EXCEPTION 'day_recovery_row_or_provenance_changed'; END IF;
  PERFORM source_row FROM result_archive_import_matches WHERE job_id=job.id AND source_key=t#>>'{match,source_key}' AND source_row=(t#>>'{match,source_row}')::int AND source_athlete_id=t#>>'{original,sourceAthleteId}' AND status='held' AND athlete_id IS NULL AND reasons='["performance_requires_review"]'::jsonb FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'day_recovery_original_hold_changed'; END IF;
 END LOOP;
 WITH incoming AS (SELECT x->'profile' p,x->>'target' target FROM jsonb_array_elements(plan->'items') x WHERE x#>>'{decision,status}'='created'), added AS (
  INSERT INTO athletes(slug,display_name,given_name,family_name,gender,source_club_name,city,county,country,bio,source_url,profile_type,profile_visibility,profile_roles,profile_details,profile_source_checked_at)
  SELECT p->>'slug',p->>'displayName',p->>'givenName',p->>'familyName',p->>'gender',p->>'sourceClubName',NULL,'','','',p->>'sourceUrl','Athlete',p->>'profileVisibility','',p->'details',now() FROM incoming
  RETURNING id,slug
 ) SELECT coalesce(jsonb_object_agg(i.target,a.id),'{}'::jsonb),count(*) INTO ids,created FROM added a JOIN incoming i ON i.p->>'slug'=a.slug;
 IF created<>(SELECT count(*) FROM jsonb_array_elements(plan->'items') x WHERE x#>>'{decision,status}'='created') THEN RAISE EXCEPTION 'day_recovery_profile_count'; END IF;
 FOR t IN SELECT value FROM jsonb_array_elements(plan->'items') LOOP
  IF t#>>'{decision,status}'='linked' AND (t->>'target')::int>0 THEN ids:=ids||jsonb_build_object(t->>'target',(t->>'target')::int); END IF;
  IF t#>>'{decision,status}'<>'held' AND ids->>(t->>'target') IS NULL THEN RAISE EXCEPTION 'day_recovery_missing_target'; END IF;
 END LOOP;
 WITH incoming AS (SELECT x FROM jsonb_array_elements(plan->'items') x WHERE x#>>'{decision,status}'<>'held')
 INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
 SELECT (ids->>(x->>'target'))::int,'DUV Ultra Marathon Statistics',x->>'externalId',x#>>'{original,sourceAthleteUrl}',(c->>'captured_at')::timestamptz,false,ARRAY[]::int[],ARRAY[2026],x->'performances',NULL
 FROM incoming JOIN jsonb_array_elements(plan->'captures') c ON c->>'source_key'=x#>>'{match,source_key}' ON CONFLICT(provider,external_id) DO NOTHING;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(plan->'items') x LEFT JOIN athlete_source_histories h ON h.provider='DUV Ultra Marathon Statistics' AND h.external_id=x->>'externalId' WHERE x#>>'{decision,status}'<>'held' AND
  (h.athlete_id IS DISTINCT FROM (ids->>(x->>'target'))::int OR h.performances IS DISTINCT FROM x->'performances' OR h.source_url IS DISTINCT FROM x#>>'{original,sourceAthleteUrl}' OR h.published_at IS NOT NULL OR h.complete IS DISTINCT FROM false OR h.years_expected IS DISTINCT FROM ARRAY[]::int[] OR h.years_captured IS DISTINCT FROM ARRAY[2026]))
 THEN RAISE EXCEPTION 'day_recovery_history_guard'; END IF;
 IF EXISTS(SELECT 1 FROM athletes a JOIN jsonb_array_elements(plan->'items') x ON a.id=(ids->>(x->>'target'))::int WHERE x#>>'{decision,status}'='created' AND
  (a.profile_visibility IS DISTINCT FROM 'public' OR a.profile_details IS DISTINCT FROM x#>'{profile,details}' OR a.date_of_birth IS NOT NULL OR a.club_id IS NOT NULL OR a.parent_athlete_id IS NOT NULL OR EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)))
 THEN RAISE EXCEPTION 'day_recovery_new_profile_guard'; END IF;
 UPDATE result_archive_import_matches m SET status=x#>>'{decision,status}',athlete_id=CASE WHEN x#>>'{decision,status}'='held' THEN NULL ELSE (ids->>(x->>'target'))::int END,
 reasons=m.reasons||jsonb_build_array(jsonb_build_object('reviewId',x->>'reviewId','resolution','reviewed_day_duration_then_fresh_full_directory_screen','decision',x->'decision','identityIndependentlyVerified',false))
 FROM jsonb_array_elements(plan->'items') x WHERE m.job_id=job.id AND m.source_key=x#>>'{match,source_key}' AND m.source_row=(x#>>'{match,source_row}')::int AND m.status='held';
 GET DIAGNOSTICS affected=ROW_COUNT;IF affected<>n THEN RAISE EXCEPTION 'day_recovery_receipt_count'; END IF;
 INSERT INTO network_audit_log(action,entity_type,entity_id,before_value,after_value,note)
 SELECT 'duv.held_day_recovered','athlete_source_history',x->>'externalId',jsonb_build_object('match',x->'match','measurement',x#>'{original,performance}'),jsonb_build_object('reviewId',x->>'reviewId','athleteId',CASE WHEN x#>>'{decision,status}'='held' THEN NULL ELSE (ids->>(x->>'target'))::int END,'status',x#>>'{decision,status}','sourceKey',x#>>'{match,source_key}','sourceRow',x#>'{match,source_row}','identityRevision',revision,'sourceAudit',plan->'audit','sourceDocumentHash',x#>>'{original,sourceDocumentHash}','privateHistory',true,'identityVerified',false,'decision',x->'decision'),
 'Owner-authorized continuation: day-form duration independently compared and converted; full directory, aliases, accounts and DUV IDs screened. Original source and prior hold retained. Identity unverified.'
 FROM jsonb_array_elements(plan->'items') x;
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'create_public_archive_profile','athlete',a.id::text,(a.profile_details->'archiveCreation')||jsonb_build_object('profileVisibility',a.profile_visibility,'publicationApproval',a.profile_details->'profilePublication'),
 'Owner-authorized DUV recovery: unclaimed public profile; result history private and unverified.'
 FROM athletes a JOIN jsonb_array_elements(plan->'items') x ON a.id=(ids->>(x->>'target'))::int WHERE x#>>'{decision,status}'='created';
 INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
 SELECT 'athlete.profile_admin_published','athlete',a.id::text,jsonb_build_object('athleteId',a.id,'profile_visibility','public','profilePublication',a.profile_details->'profilePublication'),
 'Owner-authorized public DUV profile; source results remain unpublished and identity unverified.'
 FROM athletes a JOIN jsonb_array_elements(plan->'items') x ON a.id=(ids->>(x->>'target'))::int WHERE x#>>'{decision,status}'='created';
 UPDATE result_archive_import_queue q SET receipt=(SELECT jsonb_build_object('createdProfiles',count(*) FILTER(WHERE status='created'),'linkedResults',count(*) FILTER(WHERE status='linked'),'heldRows',count(*) FILTER(WHERE status='held'),'processedRows',count(*)) FROM result_archive_import_matches m WHERE m.job_id=q.job_id AND m.source_key=q.source_key)
 WHERE q.job_id=job.id AND q.source_key IN(SELECT c->>'source_key' FROM jsonb_array_elements(plan->'captures') c);
END $duv_day_recovery$;
