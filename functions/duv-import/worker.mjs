import { gzipSync,gunzipSync } from 'node:zlib';
import { randomUUID } from 'node:crypto';
import { PROVIDER,parseEvent,combinePages,sha,eventId } from './parser.mjs';
import { Directory,eventDirectory,nameKey } from './identity.mjs';
import { profileVisibility } from './publication.mjs';
import { markRollbackConfirmed,retryDeadlockedProfileChunk } from './deadlock-retry.mjs';
const JOB='duv-2026-20261010';
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const json=x=>JSON.stringify(x);
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
let cache=null;

async function directory(client){
 const version=(await client.query('SELECT version::text FROM result_archive_identity_clock WHERE singleton')).rows[0].version;
 if(cache?.version===version)return cache;
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 try{
  const v=(await client.query('SELECT version::text FROM result_archive_identity_clock WHERE singleton')).rows[0].version;
  const athletes=(await client.query(`SELECT id,slug,display_name,given_name,family_name,gender,race_entry_name,parent_athlete_id,source_url,profile_visibility,
   extract(year from date_of_birth)::int AS birth_year,
   jsonb_build_object('aliases',profile_details->'aliases','nameAliases',profile_details->'nameAliases','previous_names',profile_details->'previous_names',
    'research_name_variants',profile_details->'research_name_variants','canonicalName',profile_details->'canonicalName','sourceName',profile_details->'sourceName','requestedName',profile_details->'requestedName',
    'duvSourceObservation',profile_details->'duvSourceObservation','sourceIdentities',profile_details->'sourceIdentities') AS profile_details
   FROM athletes`)).rows;
  const accounts=(await client.query(`SELECT u.name,p.full_name,p.display_name,p.previous_names FROM "user" u LEFT JOIN athlete_private_profiles p ON p.user_id=u.id`)).rows;
  const histories=(await client.query(`SELECT athlete_id,provider,external_id,source_url FROM athlete_source_histories WHERE provider ILIKE '%duv%' OR source_url LIKE '%statistik.d-u-v.org/getresultperson%'`)).rows;
  await client.query('COMMIT');cache=new Directory(athletes,accounts,histories,v);return cache;
 }catch(e){await client.query('ROLLBACK');throw e;}
}
async function requestSource(client,url,owner,deadline){
 if(!/^https:\/\/statistik\.d-u-v\.org\/getresultevent\.php\?event=\d+(?:&page=\d+)?$/.test(url))throw Error('unapproved_fetch_url');
 const result=await client.query(`UPDATE result_archive_import_jobs SET next_request_at=greatest(now(),next_request_at)+interval '21 seconds',updated_at=now()
  WHERE id=$1 AND status='running' AND lease_owner=$2 AND lease_until>now() AND expires_at>now()
  RETURNING extract(epoch from (next_request_at-interval '21 seconds'-now()))*1000 AS wait_ms`,[JOB,owner]);
 if(!result.rows.length)throw Error('lease_or_authorization_lost');
 const ms=Math.max(0,Number(result.rows[0].wait_ms));
 if(Date.now()+ms+15000>deadline)return null;
 if(ms)await wait(ms);
 const res=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(45000),headers:{'User-Agent':'AthRecsPrivateResultsCollector/2.0 (+https://www.athrecs.com)','Accept-Language':'en'}});
 const raw=Buffer.from(await res.arrayBuffer());
 if([401,403,429].includes(res.status)){
  await client.query(`UPDATE result_archive_import_jobs SET status='blocked',last_error=$2,updated_at=now() WHERE id=$1`,[JOB,'source_access_or_rate_limit_'+res.status]);
  throw Error('source_access_or_rate_limit_'+res.status);
 }
 if(!res.ok)throw Error('source_http_'+res.status);
 if(raw.length>64*1024*1024)throw Error('source_response_too_large');
 return {raw,capturedAt:new Date().toISOString(),htmlSha256:sha(raw)};
}
async function document(client,item,url,raw,capturedAt){
 let payload;
 try{payload=parseEvent(raw,item.inventory,capturedAt,2026,url);}catch(e){
  await client.query(`INSERT INTO result_archive_import_documents(job_id,source_key,source_url,status,source_html_gzip,html_sha256,captured_at,error)
   VALUES($1,$2,$3,'held',$4,$5,$6,$7) ON CONFLICT(job_id,source_key,source_url) DO UPDATE SET status='held',source_html_gzip=excluded.source_html_gzip,html_sha256=excluded.html_sha256,captured_at=excluded.captured_at,error=excluded.error`,
   [JOB,item.source_key,url,gzipSync(raw),sha(raw),capturedAt,e.message]);throw e;
 }
 await client.query(`INSERT INTO result_archive_import_documents(job_id,source_key,source_url,status,source_html_gzip,html_sha256,captured_at,payload)
  VALUES($1,$2,$3,'captured',$4,$5,$6,$7::jsonb) ON CONFLICT(job_id,source_key,source_url) DO UPDATE SET status='captured',source_html_gzip=excluded.source_html_gzip,html_sha256=excluded.html_sha256,captured_at=excluded.captured_at,payload=excluded.payload,error=NULL`,
  [JOB,item.source_key,url,gzipSync(raw),sha(raw),capturedAt,json(payload)]);
 for(const link of payload.pagination.pageLinks){
  if(!/^https:\/\/statistik\.d-u-v\.org\/getresultevent\.php\?event=\d+&page=[1-9]\d*$/.test(link)||new URL(link).searchParams.get('event')!==eventId(item.source_url))throw Error('unapproved_source_pagination');
  if(new URL(link).searchParams.get('page')==='1')continue;
  await client.query(`INSERT INTO result_archive_import_documents(job_id,source_key,source_url) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,[JOB,item.source_key,link]);
 }
 return payload;
}
async function captureEvent(client,item,job,owner,deadline){
 if(item.capture_id){return (await client.query('SELECT payload FROM result_archive_source_captures WHERE id=$1',[item.capture_id])).rows[0].payload;}
 const existing=(await client.query(`SELECT c.id,c.row_count FROM result_archive_source_captures c JOIN result_archive_capture_approvals a ON a.id=c.approval_id
  WHERE c.provider=$1 AND c.source_key=$2 AND c.source_check='compared' AND c.payload->>'publication'='staff_only' AND a.revoked_at IS NULL ORDER BY c.captured_at DESC LIMIT 1`,[PROVIDER,item.source_key])).rows[0];
 if(existing){
  await client.query(`UPDATE result_archive_import_queue SET status='imported',capture_id=$3,rows_total=$4,row_cursor=$4,receipt=$5::jsonb,updated_at=now() WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key,existing.id,existing.row_count,json({previouslyImported:true,sourceRows:existing.row_count})]);return 'existing';
 }
 let docs=(await client.query('SELECT source_url,status,source_html_gzip,html_sha256,captured_at FROM result_archive_import_documents WHERE job_id=$1 AND source_key=$2',[JOB,item.source_key])).rows;
 // Only explicitly requeued events reach this path. Recompare saved originals
 // after a reviewed parser update without requesting the provider again.
 for(const d of docs.filter(d=>d.status==='held'&&d.source_html_gzip)){
  const raw=gunzipSync(d.source_html_gzip);
  if(sha(raw)!==d.html_sha256)throw Error('stored_document_hash_conflict');
  await document(client,item,d.source_url,raw,new Date(d.captured_at).toISOString());
 }
 if(!docs.some(d=>d.source_url===item.source_url)){
  let fetched=item.source_html_gzip?{raw:gunzipSync(item.source_html_gzip),capturedAt:new Date(item.captured_at).toISOString()}:await requestSource(client,item.source_url,owner,deadline);
  if(!fetched)return null;
  await client.query(`UPDATE result_archive_import_queue SET source_html_gzip=$3,html_sha256=$4,captured_at=$5,attempts=attempts+1,updated_at=now() WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key,gzipSync(fetched.raw),sha(fetched.raw),fetched.capturedAt]);
  await document(client,item,item.source_url,fetched.raw,fetched.capturedAt);
 }
 while(Date.now()<deadline-15000){
  const next=(await client.query(`SELECT source_url FROM result_archive_import_documents WHERE job_id=$1 AND source_key=$2 AND status='pending' ORDER BY source_url LIMIT 1`,[JOB,item.source_key])).rows[0];
  if(!next)break;
  const fetched=await requestSource(client,next.source_url,owner,deadline);if(!fetched)return null;
  await document(client,item,next.source_url,fetched.raw,fetched.capturedAt);
 }
 docs=(await client.query('SELECT status,payload,source_html_gzip,source_url FROM result_archive_import_documents WHERE job_id=$1 AND source_key=$2',[JOB,item.source_key])).rows;
 if(docs.some(d=>d.status==='pending'))return null;
 if(docs.some(d=>d.status!=='captured'))throw Error('held_source_document');
 const payload=combinePages(docs.map(d=>d.payload));
 const raw=docs.find(d=>d.source_url===item.source_url).source_html_gzip;
 const hash=sha(json(payload));
 await client.query('BEGIN');
 try{
  const valid=await client.query(`SELECT j.id FROM result_archive_import_jobs j JOIN result_archive_capture_approvals a ON a.id=j.approval_id WHERE j.id=$1 AND j.status='running' AND j.lease_owner=$2 AND j.lease_until>now() AND a.revoked_at IS NULL AND a.scope='staff_only' FOR UPDATE OF j`,[JOB,owner]);
  if(!valid.rows.length)throw Error('approval_or_lease_lost');
  const result=await client.query(`INSERT INTO result_archive_source_captures(run_id,approval_id,provider,source_key,source_url,payload_hash,html_sha256,source_html_gzip,payload,row_count,source_check,audit,captured_at)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,'compared',$11::jsonb,$12) ON CONFLICT(provider,source_key,payload_hash) DO NOTHING RETURNING id`,
   [job.run_id,job.approval_id,PROVIDER,item.source_key,item.source_url,hash,payload.htmlSha256,raw,json(payload),payload.rows.length,json(payload.audit),payload.capturedAt]);
  const cid=result.rows[0]?.id??(await client.query('SELECT id FROM result_archive_source_captures WHERE provider=$1 AND source_key=$2 AND payload_hash=$3',[PROVIDER,item.source_key,hash])).rows[0].id;
  await client.query(`UPDATE result_archive_import_queue SET capture_id=$3,rows_total=$4,updated_at=now() WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key,cid,payload.rows.length]);
  await client.query('COMMIT');item.capture_id=cid;item.rows_total=payload.rows.length;return payload;
 }catch(e){await client.query('ROLLBACK');throw e;}
}
function history(row,capture,captureId){return {year:2026,date:row.date,endDate:row.endDate,sourceDate:row.date,ageGroup:row.category,discipline:row.distanceLabel,performance:row.performanceDisplay,wind:'',place:row.original.Rank,venue:'',meeting:capture.index.name,sourceUrls:[row.sourcePageUrl+'#Resultlist',row.sourceAthleteUrl],labels:['Private archive','Identity unreviewed'],providerName:PROVIDER,verificationStatus:'unverified',notes:'Attributed DUV source evidence; identity not independently verified. Source birth year, nationality and race club are observations, not a confirmed date of birth, residence or current club.',performanceMeasurement:row.performance,places:row.places,
 archiveReference:{captureId:String(captureId),sourceKey:capture.sourceKey,tableKey:row.tableKey,sourceRow:row.sourceRow,sourcePageUrl:row.sourcePageUrl,sourceAthleteId:row.sourceAthleteId,htmlSha256:row.sourceDocumentHash,status:row.status,original:row.original,originalLinks:row.originalLinks,originalResultUrls:capture.provenance.originalResultUrls}};}
function newProfile(row,capture,job){
 const name=nameKey(row.name).replaceAll(' ','-');return {sourceAthleteId:row.sourceAthleteId,
  profileVisibility:profileVisibility(job),
  slug:((/^[a-z0-9-]+$/.test(name)?name:'duv-runner').slice(0,160))+'-duv-'+row.sourceAthleteId,displayName:row.name,givenName:row.givenName,familyName:row.familyName,gender:row.gender,sourceClubName:row.club,sourceUrl:row.sourceAthleteUrl,
  details:{archiveCreation:{batchId:JOB,candidateId:'DUV-'+row.sourceAthleteId,approvedBy:'Paul Browne',approvedAt:job.configuration.approvedAt,instruction:job.configuration.instruction,basis:'Stable source runner ID, independently compared row, conservative name/alias/account screening; provisional identity.',profileIdentityVerified:false,sourceRowsCompared:true,sourceKeys:[capture.sourceKey]},profilePublication:profileVisibility(job)==='public'?job.configuration.profilePublication:null,aliases:[row.name,row.sourceName],athlete_verified:false,identity_review_status:'provisional_source_profile',currentClubAssociationConfirmed:false,sourceIdentities:[{provider:PROVIDER,externalId:row.sourceAthleteId,sourceUrl:row.sourceAthleteUrl}],duvSourceObservation:{birthYear:row.sourceBirthYear,nationality:row.sourceNationality,clubDisplay:row.club,clubDisplayTruncated:row.clubDisplayTruncated,eventDate:row.date}}};
}
async function profileChunk(client,item,capture,job,owner){
 const dir=await directory(client),ed=eventDirectory(capture.rows);const chunk=capture.rows.slice(item.row_cursor,item.row_cursor+150);
 const decisions=chunk.map(row=>({row,...dir.decide(row,ed)}));
 const fresh=decisions.filter(x=>x.status==='created').map(x=>newProfile(x.row,capture,job));
 await client.query('BEGIN');
 try{
  await client.query("SET LOCAL lock_timeout='8s'");await client.query("SET LOCAL statement_timeout='50s'");
  const clock=(await client.query('SELECT version::text FROM result_archive_identity_clock WHERE singleton FOR UPDATE')).rows[0].version;
  if(clock!==dir.version){await client.query('ROLLBACK');cache=null;return false;}
  const valid=await client.query(`SELECT j.id FROM result_archive_import_jobs j JOIN result_archive_capture_approvals a ON a.id=j.approval_id WHERE j.id=$1 AND j.status='running' AND j.lease_owner=$2 AND j.lease_until>now() AND a.revoked_at IS NULL AND a.scope='staff_only'`,[JOB,owner]);
  if(!valid.rows.length)throw Error('approval_or_lease_lost');
  let created=[];
  if(fresh.length){
   created=(await client.query(`WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb))
    INSERT INTO athletes(slug,display_name,given_name,family_name,gender,source_club_name,city,county,country,bio,source_url,profile_type,profile_visibility,profile_roles,profile_details,profile_source_checked_at)
    SELECT p->>'slug',p->>'displayName',p->>'givenName',p->>'familyName',p->>'gender',p->>'sourceClubName',NULL,'','','',p->>'sourceUrl','Athlete',p->>'profileVisibility','',p->'details',now() FROM incoming
    RETURNING id,slug,display_name,given_name,family_name,gender,source_url,profile_details,profile_visibility,parent_athlete_id`,[json(fresh)])).rows;
   if(created.length!==fresh.length)throw Error('profile_insert_count_mismatch');
  }
  const createdById=new Map(created.map(a=>[a.profile_details.sourceIdentities[0].externalId,a]));
  const incoming=[];
  for(const d of decisions){
   if(d.status==='created')d.athleteId=createdById.get(d.row.sourceAthleteId).id;
   if(d.athleteId)incoming.push({athleteId:d.athleteId,externalId:'duv:runner-'+d.row.sourceAthleteId+':event-'+eventId(capture.sourceUrl),sourceUrl:d.row.sourceAthleteUrl,capturedAt:capture.capturedAt,performance:history(d.row,capture,item.capture_id)});
  }
  if(incoming.length){
   const existing=(await client.query(`SELECT h.athlete_id,h.external_id,h.performances FROM athlete_source_histories h WHERE h.provider=$1 AND h.external_id=ANY($2::text[])`,[PROVIDER,incoming.map(p=>p.externalId)])).rows;
   for(const e of existing){const v=incoming.find(x=>x.externalId===e.external_id);if(e.athlete_id!==v.athleteId||stable(e.performances)!==stable([v.performance]))throw Error('existing_source_history_conflict');}
   await client.query(`WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb))
    INSERT INTO athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,complete,years_expected,years_captured,performances,published_at)
    SELECT (p->>'athleteId')::int,$2,p->>'externalId',p->>'sourceUrl',(p->>'capturedAt')::timestamptz,false,ARRAY[]::int[],ARRAY[2026],jsonb_build_array(p->'performance'),NULL FROM incoming ON CONFLICT(provider,external_id) DO NOTHING`,[json(incoming),PROVIDER]);
   const checked=await client.query(`WITH incoming AS(SELECT value p FROM jsonb_array_elements($1::jsonb)) SELECT count(*)::int AS n FROM incoming JOIN athlete_source_histories h ON h.provider=$2 AND h.external_id=p->>'externalId' WHERE h.athlete_id=(p->>'athleteId')::int AND h.performances=jsonb_build_array(p->'performance') AND h.published_at IS NULL AND h.complete=false`,[json(incoming),PROVIDER]);
   if(checked.rows[0].n!==incoming.length)throw Error('history_verification_failed');
  }
  if(created.length){
   await client.query(`INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
    SELECT CASE WHEN profile_visibility='public' THEN 'create_public_archive_profile' ELSE 'create_private_archive_profile' END,'athlete',id::text,
     (profile_details->'archiveCreation')||jsonb_build_object('profileVisibility',profile_visibility,'publicationApproval',profile_details->'profilePublication'),
     'Owner-authorized DUV 2026 import: unclaimed, identity unverified; result histories remain unpublished.' FROM athletes WHERE id=ANY($1::int[])`,[created.map(a=>a.id)]);
   const check=await client.query(`SELECT count(*)::int AS n FROM athletes a WHERE id=ANY($1::int[]) AND profile_visibility=$2 AND date_of_birth IS NULL AND club_id IS NULL AND parent_athlete_id IS NULL AND NOT EXISTS(SELECT 1 FROM athlete_account_links l WHERE l.athlete_id=a.id)`,[created.map(a=>a.id),profileVisibility(job)]);
   if(check.rows[0].n!==created.length)throw Error('profile_privacy_verification_failed');
   if(profileVisibility(job)==='public')await client.query(`INSERT INTO network_audit_log(action,entity_type,entity_id,after_value,note)
    SELECT 'athlete.profile_admin_published','athlete',id::text,
     jsonb_build_object('athleteId',id,'profile_visibility','public','profilePublication',profile_details->'profilePublication'),
     'Owner-authorized public DUV source profile; source results remain unpublished and identity unverified.'
    FROM athletes WHERE id=ANY($1::int[])`,[created.map(a=>a.id)]);
  }
  const matches=decisions.map(d=>({sourceRow:d.row.sourceRow,sourceAthleteId:d.row.sourceAthleteId,athleteId:d.athleteId??null,status:d.status,reasons:[...d.reasons,...(d.possibleIds?[{possibleIds:d.possibleIds}]:[])]}));
  await client.query(`INSERT INTO result_archive_import_matches(job_id,source_key,source_row,source_athlete_id,athlete_id,status,reasons)
   SELECT $1,$2,(p->>'sourceRow')::int,p->>'sourceAthleteId',(p->>'athleteId')::int,p->>'status',p->'reasons' FROM jsonb_array_elements($3::jsonb) p
   ON CONFLICT(job_id,source_key,source_row) DO NOTHING`,[JOB,item.source_key,json(matches)]);
  const cursor=item.row_cursor+chunk.length,done=cursor===capture.rows.length;
  await client.query(`UPDATE result_archive_import_queue SET row_cursor=$3,status=$4,updated_at=now(),receipt=(
    SELECT jsonb_build_object('createdProfiles',count(*) FILTER(WHERE status='created'),'linkedResults',count(*) FILTER(WHERE status='linked'),'heldRows',count(*) FILTER(WHERE status='held'),'processedRows',count(*))
    FROM result_archive_import_matches WHERE job_id=$1 AND source_key=$2) WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key,cursor,done?'imported':'processing']);
  const newVersion=(await client.query('SELECT version::text FROM result_archive_identity_clock WHERE singleton')).rows[0].version;
  await client.query('COMMIT');
  for(const a of created)dir.addAthlete(a);dir.version=newVersion;item.row_cursor=cursor;item.status=done?'imported':'processing';return true;
 }catch(e){cache=null;await client.query('ROLLBACK');markRollbackConfirmed(e);throw e;}
}
export async function status(pool){
 const c=await pool.connect();try{
  const job=(await c.query(`SELECT id,year,status,inventory_count,expected_source_rows,last_error,updated_at FROM result_archive_import_jobs WHERE id=$1`,[JOB])).rows[0];
  if(!job)return {configured:false};
  const queues=(await c.query(`SELECT status,count(*)::int AS events,coalesce(sum(rows_total),0)::int AS rows FROM result_archive_import_queue WHERE job_id=$1 GROUP BY status`,[JOB])).rows;
  const profiles=(await c.query(`SELECT status,count(*)::int AS rows FROM result_archive_import_matches WHERE job_id=$1 GROUP BY status`,[JOB])).rows;
  return {job,queues,profiles};
 }finally{c.release();}
}
export async function run(pool,{maxMs=245000,maxEvents=20}={}){
 const client=await pool.connect(),owner=randomUUID(),deadline=Date.now()+Math.min(maxMs,250000);let acquired=false,processed=0;
 try{
  const job=(await client.query(`UPDATE result_archive_import_jobs j SET lease_owner=$2,lease_until=now()+interval '6 minutes',updated_at=now()
   WHERE id=$1 AND status='running' AND expires_at>now() AND (lease_until IS NULL OR lease_until<now())
   AND EXISTS(SELECT 1 FROM result_archive_capture_approvals a WHERE a.id=j.approval_id AND a.scope='staff_only' AND a.revoked_at IS NULL)
   RETURNING *`,[JOB,owner])).rows[0];
  if(!job)return {acquired:false};acquired=true;
  while(Date.now()<deadline-15000&&processed<maxEvents){
   const item=(await client.query(`SELECT * FROM result_archive_import_queue WHERE job_id=$1 AND status IN ('pending','processing','error') AND attempts<3
    ORDER BY CASE WHEN status='processing' THEN 0 ELSE 1 END,ordinal LIMIT 1`,[JOB])).rows[0];
   if(!item){
    const held=(await client.query(`SELECT ((SELECT count(*) FROM result_archive_import_queue WHERE job_id=$1 AND status!='imported')+(SELECT count(*) FROM result_archive_import_matches WHERE job_id=$1 AND status='held'))::int AS n`,[JOB])).rows[0].n;
    await client.query(`UPDATE result_archive_import_jobs SET status=$2,updated_at=now() WHERE id=$1 AND lease_owner=$3`,[JOB,held?'completed_with_holds':'completed',owner]);
    await client.query(`UPDATE result_archive_capture_runs SET status=$2,updated_at=now(),summary=(SELECT jsonb_build_object('events',count(*),'imported',count(*) FILTER(WHERE status='imported'),'held',count(*) FILTER(WHERE status!='imported'),'rows',sum(rows_total)) FROM result_archive_import_queue WHERE job_id=$3) WHERE id=$1`,[job.run_id,held?'partial':'completed',JOB]);break;
   }
   await client.query(`UPDATE result_archive_import_queue SET status='processing',updated_at=now() WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key]);
   try{
    const capture=await captureEvent(client,item,job,owner,deadline);
    if(capture===null)break;if(capture==='existing'){processed++;continue;}
    while(item.row_cursor<capture.rows.length&&Date.now()<deadline-12000){
     await retryDeadlockedProfileChunk(()=>profileChunk(client,item,capture,job,owner),{deadline,onRetry:({retry,delayMs})=>console.warn('duv_profile_deadlock_retry',json({sourceKey:item.source_key,cursor:item.row_cursor,attempt:retry,delayMs}))});
    }
    if(capture.rows.length===0)await client.query(`UPDATE result_archive_import_queue SET status='imported',row_cursor=0,rows_total=0 WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key]);
    if(item.row_cursor<capture.rows.length)break;processed++;
   }catch(e){
    const code=String(e.code??''),message=String(e.message??'unknown_error').slice(0,300);
    if(message.startsWith('source_access_or_rate_limit_'))break;
    // Never continue after a database or identity-write invariant failure.
    if(code||/verification|conflict|approval|lease|privacy|insert_count/.test(message)){
     await client.query(`UPDATE result_archive_import_jobs SET status='blocked',last_error=$2,updated_at=now() WHERE id=$1`,[JOB,'database_or_identity_guard: '+(code||message)]);break;
    }
    const retry=/source_http_5|timeout|fetch failed/i.test(message);
    await client.query(`UPDATE result_archive_import_queue SET status=$3,error=$4,attempts=attempts+1,updated_at=now() WHERE job_id=$1 AND source_key=$2`,[JOB,item.source_key,retry?'error':'held',message]);
    if(retry){await client.query(`UPDATE result_archive_import_jobs SET next_request_at=now()+interval '5 minutes' WHERE id=$1`,[JOB]);break;}
    processed++;
   }
  }
  return {acquired:true,processed};
 }finally{
  if(acquired)await client.query(`UPDATE result_archive_import_jobs SET lease_owner=NULL,lease_until=NULL,updated_at=now() WHERE id=$1 AND lease_owner=$2`,[JOB,owner]).catch(()=>{});
  client.release();
 }
}
