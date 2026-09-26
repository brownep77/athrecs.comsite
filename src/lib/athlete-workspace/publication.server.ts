import { createHash } from "node:crypto";
import { getSql, dbSource } from "../db";
import { IS_RUNRECS_SITE } from "../site-scope";
import { normal, distanceValue, timeSeconds, resultIssues, type Batch, type CandidateResult } from "./core";
export type ReviewRequest = { batchId:string; revision:number; athleteId:number; indexes:number[]; action:'publish'|'reject'; evidenceFor:string; evidenceAgainst:string; resolution:string; sourceChecked:boolean; identityChecked:boolean; rightsConfirmed:boolean; requestId:string };
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const slug=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,140);
export async function reviewBatch(data:ReviewRequest,actor:{userId:string;staff:boolean}) {
  if(!actor.staff||IS_RUNRECS_SITE)throw new Error('Use the AthRecs staff workspace.');
  if(dbSource!=='neon')throw new Error('The live database is unavailable. Nothing was saved.');
  const sql=await getSql();
  const fingerprint=digest(data);
  return sql.transaction(async tx=>{
    await tx.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
    await tx.query("SET LOCAL statement_timeout='25s'");
    const [account]=await tx<{id:string;verified:boolean}>`select id,"emailVerified" as verified from "user" where id=${actor.userId}`;
    if(!account?.verified)throw new Error('Verified staff account required.');
    // The recorded receipt precedes the revision check so identical retries are safe.
    const prior=await tx<{actor_user_id:string;after_value:{fingerprint:string;added:number;duplicates:number;resultIds:number[]}}> `select actor_user_id,after_value from network_audit_log where action='athlete.candidates_reviewed' and entity_id=${data.requestId}`;
    if(prior.length){if(prior.length!==1||prior[0].actor_user_id!==actor.userId||prior[0].after_value.fingerprint!==fingerprint)throw new Error('This request reference is already in use.');return {...prior[0].after_value,replay:true};}
    const [b]=await tx<Batch>`select *,id::text from athlete_result_proposals where id=${data.batchId}::uuid for update`;
    if(!b||b.revision!==data.revision)throw new Error('The candidate batch changed. Reload before reviewing it.');
    if(b.athlete_id!==null&&b.athlete_id!==data.athleteId)throw new Error('This draft was prepared for a different athlete.');
    if(new Set(data.indexes).size!==data.indexes.length)throw new Error('Select each proposal once.');
    const selected=data.indexes.map(index=>b.entries.find(row=>row.index===index));
    if(selected.some(row=>!row||row.state!=='pending'))throw new Error('Only pending proposals can be reviewed.');
    const rows=selected as CandidateResult[];
    if(data.evidenceAgainst.trim()&&!data.resolution.trim())throw new Error('Record how the conflicting evidence was resolved before publishing.');
    const [athlete]=await tx<{id:number;profile_visibility:string}>`select id,profile_visibility from athletes where id=${data.athleteId} for update`;
    if(!athlete)throw new Error('Athlete not found.');
    let added=0,duplicates=0;const resultIds:number[]=[];const changes=new Map<number,CandidateResult>();
    if(data.action==='reject') {
      for(const r of rows)changes.set(r.index,{...r,state:'rejected',decisionNote:data.evidenceAgainst||data.evidenceFor});
    } else {
      if(!data.sourceChecked||!data.identityChecked||!data.rightsConfirmed||data.evidenceFor.trim().length<12)throw new Error('Confirm the source, athlete identity and publication authority, and record the supporting evidence.');
      const linked=await tx<{user_id:string}>`select user_id from athlete_account_links where athlete_id=${data.athleteId} and status='active'`;
      for(const r of rows){
        const issues=resultIssues(r);if(issues.length)throw new Error(`Row ${r.index}: ${issues.join('; ')}`);
        if(r.response==='no')throw new Error(`Row ${r.index} was denied by the athlete. Hold it for investigation, not publication.`);
        if(linked.length&&!linked.some(l=>l.user_id===actor.userId)&&!(r.response==='yes'&&linked.some(l=>l.user_id===r.responseBy)))throw new Error('An account-managed profile requires confirmation from its linked owner. A link alone never transfers ownership.');
      }
      const names=[...new Set(rows.map(r=>normal(r.race)))], slugs=[...new Set(rows.map(r=>slug(r.race)))];
      let events=await tx<{id:number;name:string;slug:string;sport:string}>`select id,name,slug,sport from events where regexp_replace(lower(name),'[^a-z0-9]','','g')=any(${names}::text[]) or slug=any(${slugs}::text[])`;
      const missing:{name:string;slug:string}[]=[];
      for(const r of rows){const matches=events.filter(e=>normal(e.name)===normal(r.race)||e.slug===slug(r.race));if(matches.length>1||matches.some(e=>!['Running','Athletics'].includes(e.sport)))throw new Error(`Ambiguous race identity: ${r.race}. Resolve the race catalogue first.`);if(!matches.length&&!missing.some(m=>normal(m.name)===normal(r.race)))missing.push({name:r.race,slug:slug(r.race)});}
      if(missing.length){const made=await tx<{id:number;name:string;slug:string;sport:string}>`insert into events(slug,name,sport,country,county,city,surface,summary) select r.slug,r.name,'Running','','','','Unknown','' from jsonb_to_recordset(${JSON.stringify(missing)}::jsonb) as r(slug text,name text) returning id,name,slug,sport`;events=[...events,...made];}
      const planned=rows.map(r=>{const e=events.find(e=>normal(e.name)===normal(r.race)||e.slug===slug(r.race));if(!e)throw new Error('Race could not be resolved.');return {row:r,eventId:e.id,...distanceValue(r.distance)!};});
      const eventIds=[...new Set(planned.map(p=>p.eventId))],dates=[...new Set(rows.map(r=>r.date))];
      type Edition={id:number;event_id:number;event_date:string;distance_code:string;distance_km:number};
      let editions=await tx<Edition>`select id,event_id,event_date::text,distance_code,distance_km from editions where event_id=any(${eventIds}::integer[]) and event_date=any(${dates}::date[])`;
      const missingEditions:{event_id:number;date:string;code:string;km:number;url:string}[]=[];
      const matchEdition=(p:typeof planned[number],ed:Edition)=>ed.event_id===p.eventId&&ed.event_date===p.row.date&&(normal(ed.distance_code)===normal(p.code)||Math.abs(Number(ed.distance_km)-p.km)<0.0001);
      for(const p of planned){const matches=editions.filter(ed=>matchEdition(p,ed));if(matches.length>1||matches.some(ed=>Math.abs(Number(ed.distance_km)-p.km)>0.001))throw new Error(`Race edition/distance conflict: ${p.row.race}.`);if(!matches.length&&!missingEditions.some(e=>e.event_id===p.eventId&&e.date===p.row.date&&e.code===p.code))missingEditions.push({event_id:p.eventId,date:p.row.date,code:p.code,km:p.km,url:p.row.sourceUrl});}
      if(missingEditions.length){const made=await tx<Edition>`insert into editions(event_id,event_date,distance_code,distance_km,status,source_url) select r.event_id,r.date::date,r.code,r.km,'Finished',r.url from jsonb_to_recordset(${JSON.stringify(missingEditions)}::jsonb) as r(event_id integer,date text,code text,km double precision,url text) returning id,event_id,event_date::text,distance_code,distance_km`;editions=[...editions,...made];}
      const pairs=planned.map(p=>({event_id:p.eventId,code:p.code}));
      await tx`insert into event_distances(event_id,distance_code) select distinct r.event_id,r.code from jsonb_to_recordset(${JSON.stringify(pairs)}::jsonb) as r(event_id integer,code text) on conflict do nothing`;
      const editionIds=editions.map(e=>e.id);
      const existing=await tx<{id:number;edition_id:number;finish_time_seconds:number|null;chip_time_seconds:number|null;gun_time_seconds:number|null;result_details:Record<string,unknown>}>`select id,edition_id,finish_time_seconds,chip_time_seconds,gun_time_seconds,result_details from results where athlete_id=${data.athleteId} and edition_id=any(${editionIds}::integer[])`;
      const payload:{index:number;edition_id:number;finish:number;chip:number|null;gun:number|null;bib:string|null;place:number|null;url:string;details:unknown}[]=[];
      for(const p of planned){
        const edition=editions.find(ed=>matchEdition(p,ed));if(!edition)throw new Error('Race edition missing.');
        const seconds=timeSeconds(p.row.time)!;const previous=existing.filter(r=>r.edition_id===edition.id);
        if(previous.length){
          const prev=previous[0],timing=prev.result_details.timing as {finishSeconds?:number;chipSeconds?:number;gunSeconds?:number}|undefined;
          const recorded=p.row.timingBasis==='chip'?(timing?.chipSeconds??prev.chip_time_seconds):p.row.timingBasis==='gun'?(timing?.gunSeconds??prev.gun_time_seconds):(timing?.finishSeconds??prev.finish_time_seconds);
          if(previous.length!==1||recorded===null||recorded===undefined||Math.abs(recorded-seconds)>0.00001)throw new Error(`Row ${p.row.index} conflicts with an existing result. Nothing was overwritten.`);
          changes.set(p.row.index,{...p.row,state:'duplicate',resultId:prev.id,decisionNote:'Existing result retained; not added twice.'});duplicates++;continue;
        }
        if(payload.some(r=>r.edition_id===edition.id))throw new Error('Two proposals refer to the same athlete and race edition. Select one.');
        payload.push({index:p.row.index,edition_id:edition.id,finish:Math.round(seconds),chip:p.row.timingBasis==='chip'?Math.round(seconds):null,gun:p.row.timingBasis==='gun'?Math.round(seconds):null,bib:p.row.bib||null,place:p.row.place?Number(p.row.place):null,url:p.row.sourceUrl,details:{timing:{finishSeconds:seconds,chipSeconds:p.row.timingBasis==='chip'?seconds:null,gunSeconds:p.row.timingBasis==='gun'?seconds:null,finishText:p.row.time,chipText:p.row.timingBasis==='chip'?p.row.time:'',gunText:p.row.timingBasis==='gun'?p.row.time:''},verification:{status:'staff_reviewed',method:'manual_source_and_identity_review',checkedAt:new Date().toISOString()},proposal:{batchId:b.id,index:p.row.index}}});
      }
      await tx`insert into result_ingestion_runs(id,sport,source_name,source_url,acquisition_method,file_sha256,status,requested_by_user_id,rows_detected,rows_imported,rows_skipped,edition_count,notes,finished_at) values(${data.requestId},'Running','Staff-reviewed submissions',${b.source_url},'manual',${fingerprint},'completed',${actor.userId},${rows.length},${payload.length},${duplicates},${new Set(payload.map(p=>p.edition_id)).size},'Explicit staff source and identity review of pasted proposals. Exact timing retained; no name-based profile creation or transfer.',now())`;
      if(payload.length){const made=await tx<{id:number;edition_id:number}>`insert into results(athlete_id,edition_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,bib,overall_place,source_url,result_source,result_visibility,result_details,ingestion_run_id) select ${data.athleteId},r.edition_id,'finished',r.finish,r.chip,r.gun,r.bib,r.place,r.url,'Staff-reviewed submissions',${athlete.profile_visibility},r.details,${data.requestId} from jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) as r(edition_id integer,finish integer,chip integer,gun integer,bib text,place integer,url text,details jsonb) returning id,edition_id`;
        for(const p of payload){const saved=made.find(r=>r.edition_id===p.edition_id);if(!saved)throw new Error('Result insertion incomplete; rolled back.');resultIds.push(saved.id);changes.set(p.index,{...rows.find(r=>r.index===p.index)!,state:'approved',resultId:saved.id,decisionNote:'Added after explicit staff source and identity review.'});}
        await tx`insert into result_source_references(result_id,source_url,source_name) select id,source_url,'Staff-reviewed submissions' from results where ingestion_run_id=${data.requestId} on conflict do nothing`;added=made.length;
      }
    }
    const entries=b.entries.map(r=>changes.get(r.index)??r),outcome={fingerprint,added,duplicates,resultIds,reviewed:rows.length};
    await tx`update athlete_result_proposals set athlete_id=${data.athleteId},entries=${JSON.stringify(entries)}::jsonb,evidence_for=${data.evidenceFor},evidence_against=${data.evidenceAgainst},revision=revision+1,updated_at=now() where id=${b.id}::uuid`;
    await tx`update athlete_result_review_invitations set revoked_at=now() where batch_id=${b.id}::uuid and revoked_at is null and responded_at is null`;
    await tx`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note) values(${actor.userId},'athlete.candidates_reviewed','athlete_result_batch',${data.requestId},${JSON.stringify({batchId:b.id,revision:b.revision,selected:data.indexes,evidenceFor:data.evidenceFor,evidenceAgainst:data.evidenceAgainst,resolution:data.resolution,sourceChecked:data.sourceChecked,identityChecked:data.identityChecked,rightsConfirmed:data.rightsConfirmed})}::jsonb,${JSON.stringify(outcome)}::jsonb,${data.action})`;
    return {...outcome,replay:false};
  });
}
