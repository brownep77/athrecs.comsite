import { createHash, randomUUID } from 'node:crypto';
import type { Sql } from '../db';
import { canonicalDistance, classify, normal, validateMeta, type Meta, type Row, type Athlete, type Existing, type ReviewRow } from './core.ts';
import type { SourceCheck } from './source.server.ts';
export type Actor={userId:string;staffEmail:string};
export type Batch={meta:Meta;rows:Row[];sourceHash:string;fileHash:string;fileName:string};
export type Decision={key:string;athleteId?:number;evidenceNote?:string};
export type Verify=(rows:Row[],meta:Meta)=>Promise<SourceCheck>;
export const CHUNK_SIZE=100;
const PREVIEW='results.upload.preview',COMMIT='results.upload.commit';
const round=(n:number|null)=>n===null?null:Math.round(n/1000);
function requireActor(actor:Actor){if(!actor.userId||!actor.staffEmail)throw Error('Staff identity is required.');}
export function sourceApproved(meta:Meta):boolean{
  if(new URL(meta.sourceUrl).origin!=='https://totalracetiming.co.uk')return false;
  try{
    const v=JSON.parse(process.env.ATHRECS_RESULT_SOURCE_APPROVALS_JSON??'{}').total_race_timing_results;
    return typeof v==='string'?Boolean(v.trim()):Boolean(v&&typeof v.permissionReference==='string'&&v.permissionReference.trim());
  }catch{return false;}
}
function requireApproval(meta:Meta){if(!sourceApproved(meta))throw Error('Participant import is awaiting the existing Total Race Timing source approval. This screen cannot override that approval.');}
async function readBatch(sql:Sql,id:string,actor:Actor):Promise<Batch>{
  requireActor(actor);if(!/^[0-9a-f-]{36}$/i.test(id))throw Error('Invalid upload reference.');
  const found=await sql<{after_value:Batch}>`select after_value from network_audit_log where action=${PREVIEW} and entity_id=${id} and actor_user_id=${actor.userId} and created_at>now()-interval '7 days' order by created_at desc limit 1`;
  if(!found[0])throw Error('This upload is unavailable or older than seven days. Upload the file again.');return found[0].after_value;
}
async function snapshot(sql:Sql,meta:Meta){
  const seeded=await sql`select key from app_meta where key='seed_version' limit 1`;
  if(!seeded.length)throw Error('The normal catalogue setup must finish before athlete imports.');
  const all=await sql<{id:number;slug:string;name:string}>`select id,slug,name from events order by id limit 50001`;
  if(all.length>50000)throw Error('Event catalogue needs indexed lookup before this upload can be reviewed.');
  const events=all.filter(e=>normal(e.name)===normal(meta.eventName)||normal(e.slug)===normal(meta.eventName));
  if(events.length>1)throw Error('Multiple existing races match. Resolve the race duplicate before this import.');
  const event=events[0];
  const dated=event?await sql<{id:number;distance_code:string}>`select id,distance_code from editions where event_id=${event.id} and event_date=${meta.date}::date`:[];
  const editions=dated.filter(e=>{try{return canonicalDistance(e.distance_code)===canonicalDistance(meta.distance);}catch{return false;}});
  if(editions.length>1)throw Error('Multiple race editions need review.');
  const athletes=await sql<Athlete>`select a.id,a.display_name as name,a.slug,a.gender,c.name as club,coalesce(a.profile_visibility,'private') as visibility,exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed from athletes a left join clubs c on c.id=a.club_id order by a.id limit 50001`;
  if(athletes.length>50000)throw Error('Athlete catalogue exceeds the bounded review limit; no new identities have been assumed.');
  const existing=await sql<Existing>`select r.*,a.display_name as name from results r join athletes a on a.id=r.athlete_id where r.edition_id=${editions[0]?.id??-1} or split_part(coalesce(r.source_url,''),'#',1)=${meta.sourceUrl.split('#')[0]} order by r.id limit 50001`;
  if(existing.length>50000)throw Error('Existing results exceed the bounded review limit.');
  return {event,edition:editions[0],athletes,existing};
}
function summarize(rows:ReviewRow[]){return {new:rows.filter(r=>r.status==='new').length,review:rows.filter(r=>r.status==='review').length,duplicate:rows.filter(r=>r.status==='duplicate').length,blocked:rows.filter(r=>r.status==='blocked').length};}
export async function getUpload(sql:Sql,actor:Actor,id:string){
  const batch=await readBatch(sql,id,actor),live=await snapshot(sql,batch.meta),rows=classify(batch.rows,live.athletes,live.existing,batch.meta.sourceUrl);
  return {id,meta:batch.meta,fileName:batch.fileName,rows,counts:summarize(rows),sourceApproved:sourceApproved(batch.meta)};
}
export async function stageUpload(sql:Sql,actor:Actor,batch:Batch){
  requireActor(actor);validateMeta(batch.meta);const id=randomUUID();
  // This is a private audit/workspace record, not an athlete/result insertion.
  const live=await snapshot(sql,batch.meta),rows=classify(batch.rows,live.athletes,live.existing,batch.meta.sourceUrl);
  await sql`insert into network_audit_log(actor_user_id,actor_email,action,entity_type,entity_id,after_value,note) values(${actor.userId},${actor.staffEmail},${PREVIEW},'result_upload',${id},${JSON.stringify(batch)}::jsonb,'Saved Excel/CSV preview. No athlete or result records created; identity review is separate from source comparison.')`;
  return {id,meta:batch.meta,fileName:batch.fileName,rows,counts:summarize(rows),sourceApproved:sourceApproved(batch.meta)};
}
function distanceKm(s:string){if(s.toLowerCase()==='half')return 21.0975;if(s.toLowerCase()==='marathon')return 42.195;return parseFloat(s)*(s.toLowerCase().endsWith('mi')?1.609344:1);}
/** A bounded, atomic chunk. The UI may send several chunks under one explicit confirmation. */
export async function commitUpload(sql:Sql,actor:Actor,id:string,decisions:Decision[],confirmed:boolean,verify:Verify){
  requireActor(actor);
  if(confirmed!==true||!Array.isArray(decisions)||!decisions.length||decisions.length>CHUNK_SIZE||new Set(decisions.map(d=>d.key)).size!==decisions.length)throw Error('Confirm a non-empty selection of at most 100 distinct rows.');
  const batch=await readBatch(sql,id,actor);requireApproval(batch.meta);
  const selectedKeys=new Set(decisions.map(d=>d.key));
  const selectedRows=batch.rows.filter(r=>selectedKeys.has(r.key));
  if(selectedRows.length!==decisions.length)throw Error('Selection includes a row outside this upload.');
  const checked=await verify(selectedRows,batch.meta);
  if(checked.hash!==batch.sourceHash)throw Error('The source changed since preview. Refresh the upload before importing.');
  const valid=new Map(checked.rows.map(r=>[r.key,r]));
  for(const d of decisions)if(!valid.has(d.key))throw Error('Selection includes a row outside this upload.');
  return sql.transaction(async tx=>{
    await tx.query("SET LOCAL lock_timeout='3s'");await tx.query("SET LOCAL statement_timeout='20s'");
    // Short bulk writes use one transaction and bounded table locks, also protecting
    // against a different existing importer creating an identity during this check.
    await tx.query('LOCK TABLE events, editions, athletes, athlete_account_links, results IN SHARE ROW EXCLUSIVE MODE');
    await tx`select pg_advisory_xact_lock(hashtext(${`athrecs-upload:${batch.meta.sourceUrl}`}))`;
    const live=await snapshot(tx,batch.meta),review=classify(checked.rows,live.athletes,live.existing,batch.meta.sourceUrl);
    const allowed:Array<{row:Row;athleteId?:number;decision:Decision}>=[],held:Array<{key:string;reason:string}>=[];let skipped=0;
    const targets=new Set<number>();
    for(const decision of decisions){
      const item=review.find(r=>r.row.key===decision.key)!;
      if(item.status==='duplicate'){skipped++;continue;}
      if(item.status==='blocked'){held.push({key:decision.key,reason:item.reason});continue;}
      if(item.status==='new'&&decision.athleteId===undefined){allowed.push({row:item.row,decision});continue;}
      const athlete=item.candidates.find(a=>a.id===decision.athleteId);
      if(!athlete||athlete.managed||athlete.visibility!=='public'||!decision.evidenceNote||decision.evidenceNote.trim().length<15||decision.evidenceNote.length>1000){held.push({key:decision.key,reason:'Existing identity needs an explicit evidence note and an eligible public, unmanaged target.'});continue;}
      if(targets.has(athlete.id)||live.existing.some(r=>r.athlete_id===athlete.id)){held.push({key:decision.key,reason:'This athlete already has a relevant result, or was selected twice. Existing result retained.'});continue;}
      targets.add(athlete.id);allowed.push({row:item.row,athleteId:athlete.id,decision});
    }
    if(!allowed.length)return{inserted:0,newProfiles:0,linkedProfiles:0,skipped,held};
    let event=live.event;
    if(!event){
      const slug=batch.meta.eventName.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const [created]=await tx<{id:number;slug:string;name:string}>`insert into events(slug,name,sport,country,county,city,surface) values(${slug},${batch.meta.eventName},'Running','','','','') returning id,slug,name`;event=created;
    }
    await tx`insert into event_distances(event_id,distance_code) values(${event.id},${batch.meta.distance}) on conflict do nothing`;
    let edition:{id:number}|undefined=live.edition;
    if(!edition){const [created]=await tx<{id:number}>`insert into editions(event_id,event_date,distance_code,distance_km,status,source_url) values(${event.id},${batch.meta.date}::date,${batch.meta.distance},${distanceKm(batch.meta.distance)},'Finished',${batch.meta.sourceUrl}) returning id`;edition=created;}
    const newRows=allowed.filter(r=>r.athleteId===undefined).map(({row})=>({key:row.key,slug:`${normal(row.name).slice(0,45)}-trt-${createHash('sha256').update(row.key).digest('hex').slice(0,16)}`,name:row.name,given:row.given||null,family:row.family||null,gender:row.gender,club:row.club}));
    const insertedAthletes=newRows.length?await tx<{id:number;slug:string}>`insert into athletes(slug,display_name,given_name,family_name,gender,source_club_name,city,county,country,bio,profile_visibility) select x.slug,x.name,x.given,x.family,x.gender,x.club,'','','','','private' from jsonb_to_recordset(${JSON.stringify(newRows)}::jsonb) as x(slug text,name text,given text,family text,gender text,club text) returning id,slug`:[];
    const newId=new Map(newRows.map(r=>[r.key,insertedAthletes.find(a=>a.slug===r.slug)!.id]));
    const athleteIds=allowed.map(x=>x.athleteId??newId.get(x.row.key)!);
    await tx`insert into athlete_identifiers(athlete_id) select unnest(${athleteIds}::integer[]) on conflict do nothing`;
    const runId=randomUUID();
    await tx`insert into result_ingestion_runs(id,sport,source_name,source_url,acquisition_method,file_name,file_sha256,status,requested_by_user_id,requested_by_email,rows_detected,notes) values(${runId},'Running','Total Race Timing',${batch.meta.sourceUrl},'upload',${batch.fileName},${batch.fileHash},'processing',${actor.userId},${actor.staffEmail},${decisions.length},${`Reviewed Excel/CSV upload ${id}; this is a bounded selection, not a claim of full archive coverage.`})`;
    const resultRows=allowed.map(({row,athleteId,decision})=>({athlete:athleteId??newId.get(row.key),bib:row.bib,finish:round(row.finishMs),chip:round(row.chipMs),gun:round(row.gunMs),place:row.place,genderPlace:row.genderPlace,category:row.category,categoryPlace:row.categoryPlace,details:{upload:{batchId:id,sourceRowKey:row.key,sourceHash:batch.sourceHash,fileHash:batch.fileHash,fileName:batch.fileName,name:row.name,gender:row.gender,club:row.club,rawTime:row.rawTime,chipMs:row.chipMs,gunMs:row.gunMs,finishMs:row.finishMs,basis:batch.meta.basis,timingBasisMethod:'staff_confirmation',rounding:'nearest whole second in legacy numeric columns; exact milliseconds retained here',newProfile:athleteId===undefined,identityMethod:athleteId===undefined?'staff_batch_approved_new_profile':'staff_explicit_link',identityEvidence:decision.evidenceNote??'Staff approved selected no-candidate rows after reviewing the batch.',reviewedBy:actor.userId,reviewedAt:new Date().toISOString()}}}));
    const saved=await tx<{id:number;athlete_id:number}>`insert into results(edition_id,athlete_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,bib,overall_place,gender_place,category,category_place,result_source,source_url,result_visibility,result_details,ingestion_run_id) select ${edition.id},x.athlete,'finished',x.finish,x.chip,x.gun,x.bib,x.place,x."genderPlace",x.category,x."categoryPlace",'Total Race Timing; staff-reviewed upload',${batch.meta.sourceUrl},'private',x.details,${runId} from jsonb_to_recordset(${JSON.stringify(resultRows)}::jsonb) as x(athlete int,finish int,chip int,gun int,bib text,place int,"genderPlace" int,category text,"categoryPlace" int,details jsonb) returning id,athlete_id`;
    await tx`insert into result_source_references(result_id,source_url,source_name) select unnest(${saved.map(r=>r.id)}::integer[]),${batch.meta.sourceUrl},'Total Race Timing' on conflict do nothing`;
    await tx`update result_ingestion_runs set status=${held.length?'completed_with_errors':'completed'},rows_imported=${saved.length},rows_updated=0,rows_skipped=${held.length+skipped},edition_count=1,error_count=${held.length},error_summary=${held.length?'Some rows remain held; inspect the saved upload.':null},finished_at=now(),updated_at=now() where id=${runId}`;
    await tx`insert into result_ingestion_editions(ingestion_run_id,event_id,edition_id,sport,event_name,event_slug,event_date,distance_code,source_url,status,rows_detected,rows_imported,rows_updated,rows_skipped,error_count,error_summary,finished_at,updated_at) values(${runId},${event.id},${edition.id},'Running',${batch.meta.eventName},${event.slug},${batch.meta.date}::date,${batch.meta.distance},${batch.meta.sourceUrl},'partial',${decisions.length},${saved.length},0,${held.length+skipped},${held.length},'Bounded reviewed upload: full race coverage has not been asserted.',now(),now())`;
    const summary={inserted:saved.length,newProfiles:insertedAthletes.length,linkedProfiles:allowed.length-insertedAthletes.length,skipped,held};
    await tx`insert into network_audit_log(actor_user_id,actor_email,action,entity_type,entity_id,after_value,note) values(${actor.userId},${actor.staffEmail},${COMMIT},'result_upload',${id},${JSON.stringify({summary,results:saved,keys:allowed.map(a=>a.row.key)})}::jsonb,'Staff confirmed this bounded selection. New records are private. No existing profiles, memberships, result values or visibility were overwritten.')`;
    return summary;
  });
}
