import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSql, dbSource, type Sql } from "../db";
import { IS_RUNRECS_SITE } from "../site-scope";
import { normal, distanceValue, timeSeconds, resultIssues, profileSchema, type ProfileFields, type DraftResult, type CandidateResult, type Batch } from "./core";

type Actor = { userId: string; staff: boolean };
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");
const slug = (text: string) => text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g, "").slice(0,140);
async function ready() {
  if (IS_RUNRECS_SITE) throw new Error("Use AthRecs for athlete profile changes.");
  if (dbSource !== "neon") throw new Error("The live database is unavailable. Nothing has been saved.");
  return getSql();
}
async function user(sql: Sql, actor: Actor) {
  const [row] = await sql<{ id: string; email: string; verified: boolean }>`select id,email,"emailVerified" as verified from "user" where id=${actor.userId}`;
  if (!row?.verified) throw new Error("Sign in with a verified email address before using this workspace.");
  return row;
}
async function audit(sql: Sql, actor: Actor, action: string, id: string, before: unknown, after: unknown, note: string) {
  await sql`insert into network_audit_log(actor_user_id,action,entity_type,entity_id,before_value,after_value,note)
    values(${actor.userId},${action},'athlete_workspace',${id},${JSON.stringify(before)}::jsonb,${JSON.stringify(after)}::jsonb,${note})`;
}
async function owners(sql: Sql, athleteId: number) {
  return sql<{ user_id: string; email: string }>`select l.user_id,u.email from athlete_account_links l join "user" u on u.id=l.user_id where l.athlete_id=${athleteId} and l.status='active'`;
}
async function mayEdit(sql: Sql, actor: Actor, athleteId: number) {
  const links = await owners(sql, athleteId);
  if (links.some(l => l.user_id === actor.userId)) return;
  if (actor.staff && !links.length) return;
  throw new Error("This is an account-managed profile. Its owner must make or approve this change; ownership is not changed by a review link.");
}
async function profile(sql: Sql, athleteId: number, lock = false) {
  const rows = await sql.query<ProfileFields & { id: number; slug: string; profile_visibility: string }>(`
    select id,slug,profile_visibility,display_name,coalesce(given_name,'') as given_name,coalesce(family_name,'') as family_name,
      gender,coalesce(source_club_name,(select name from clubs where id=athletes.club_id),'') as source_club_name,
      coalesce(city,'') as city,county,country,bio from athletes where id=$1 ${lock ? 'for update' : ''}`, [athleteId]);
  if (!rows[0]) throw new Error("Athlete not found.");
  return rows[0];
}
export async function searchAthletes(query: string, actor: Actor) {
  const sql=await ready(); await user(sql,actor);
  if(!actor.staff) throw new Error("Staff access required.");
  return sql<{id:number;name:string;club:string;visibility:string;slug:string}>`select a.id,a.display_name as name,coalesce(c.name,a.source_club_name,'') as club,a.profile_visibility as visibility,a.slug from athletes a left join clubs c on c.id=a.club_id where a.display_name ilike ${'%'+query+'%'} order by a.display_name,a.id limit 40`;
}
export async function workspace(athleteId: number | null, actor: Actor) {
  const sql=await ready(); const account=await user(sql,actor);
  const linked=await sql<{id:number;name:string}>`select a.id,a.display_name as name from athletes a join athlete_account_links l on l.athlete_id=a.id where l.user_id=${actor.userId} and l.status='active' order by a.display_name,a.id`;
  if(athleteId && !actor.staff && !linked.some(p=>p.id===athleteId)) throw new Error("Choose one of your linked athlete profiles.");
  const p=athleteId ? await profile(sql,athleteId) : null;
  const links=athleteId ? await owners(sql,athleteId) : [];
  const results=athleteId ? await sql<{id:number;race:string;date:string;distance:string;time:string;excluded:boolean}>`
    select r.id,e.name as race,ed.event_date::text as date,ed.distance_code as distance,
      coalesce(r.result_details->'timing'->>'finishText',r.finish_time_seconds::text,'') as time,
      coalesce((r.result_details->>'profileExcluded')::boolean,false) as excluded
    from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
    where r.athlete_id=${athleteId} order by ed.event_date desc,r.id desc limit 5000` : [];
  const batches=await sql<{id:string;athlete_id:number|null;revision:number;updated_at:string;entries:CandidateResult[]}>`
    select id::text,athlete_id,revision,updated_at::text,entries from athlete_result_proposals
    where (${actor.staff} or submitted_by=${actor.userId}) and (${athleteId}::integer is null or athlete_id=${athleteId}) order by updated_at desc limit 100`;
  return {profile:p,profileVersion:p?hash(p):null,editable:Boolean(p && (links.some(l=>l.user_id===actor.userId)||(actor.staff&&!links.length))),linked,results,batches,email:account.email};
}
export async function editProfile(data: {athleteId:number;version:string;fields:ProfileFields;reason:string}, actor:Actor) {
  const sql=await ready();await user(sql,actor);
  const fields=profileSchema.parse(data.fields);
  return sql.transaction(async tx=>{
    const previous=await profile(tx,data.athleteId,true);await mayEdit(tx,actor,data.athleteId);
    if(hash(previous)!==data.version)throw new Error("The profile changed. Reload it before saving; nothing was overwritten.");
    const clubs=await tx<{id:number}>`select id from clubs where lower(name)=lower(${fields.source_club_name})`;
    await tx`update athletes set display_name=${fields.display_name},given_name=${fields.given_name||null},family_name=${fields.family_name||null},gender=${fields.gender},source_club_name=${fields.source_club_name},club_id=${clubs.length===1?clubs[0].id:null},city=${fields.city},county=${fields.county},country=${fields.country},bio=${fields.bio} where id=${data.athleteId}`;
    await audit(tx,actor,'athlete.profile_edited',String(data.athleteId),previous,fields,data.reason);
    return {saved:true};
  });
}
export async function excludeResult(data:{athleteId:number;resultId:number;excluded:boolean;reason:string},actor:Actor) {
  const sql=await ready();await user(sql,actor);
  return sql.transaction(async tx=>{
    await profile(tx,data.athleteId,true);await mayEdit(tx,actor,data.athleteId);
    const [r]=await tx<{result_details:Record<string,unknown>}>`select result_details from results where id=${data.resultId} and athlete_id=${data.athleteId} for update`;
    if(!r)throw new Error("That result is not attached to this athlete.");
    await tx`update results set result_details=jsonb_set(result_details,'{profileExcluded}',${JSON.stringify(data.excluded)}::jsonb,true) where id=${data.resultId} and athlete_id=${data.athleteId}`;
    await audit(tx,actor,data.excluded?'athlete.result_removed_from_profile':'athlete.result_restored',String(data.resultId),{profileExcluded:r.result_details.profileExcluded??false},{profileExcluded:data.excluded,athleteId:data.athleteId},data.reason);
    return {saved:true};
  });
}
export async function saveBatch(data:{id:string;athleteId:number|null;sourceUrl:string;text:string;rows:DraftResult[];declaration:true},actor:Actor) {
  const sql=await ready();await user(sql,actor);
  if(data.athleteId){await profile(sql,data.athleteId);if(!actor.staff)await mayEdit(sql,actor,data.athleteId);}
  const inputHash=hash({target:data.athleteId,source:data.sourceUrl,text:data.text,rows:data.rows});
  return sql.transaction(async tx=>{
    await tx`select id from "user" where id=${actor.userId} for update`;
    const prior=await tx<{id:string;input_hash:string}>`select id::text,input_hash from athlete_result_proposals where submitted_by=${actor.userId} and (id=${data.id}::uuid or (athlete_id is not distinct from ${data.athleteId}::integer and input_hash=${inputHash}))`;
    if(prior.length){if(prior.some(p=>p.input_hash!==inputHash))throw new Error("This draft request has changed. Start a new draft.");return {id:prior[0].id,reused:true};}
    const [count]=await tx<{n:number}>`select count(*)::integer as n from athlete_result_proposals where submitted_by=${actor.userId} and created_at>now()-interval '1 hour'`;
    if(count.n>=20)throw new Error("Twenty batches were submitted this hour. Please try later.");
    const seen=new Set<string>();
    const entries:CandidateResult[]=data.rows.map(row=>{
      const key=hash([normal(row.race),row.date,normal(row.distance),row.time,row.timingBasis,row.bib]);const duplicate=seen.has(key);seen.add(key);
      return {...row,state:duplicate?'duplicate':'pending',...(duplicate?{decisionNote:'Repeated row in this pasted batch; not added twice.'}:{}),...(!actor.staff?{response:'yes' as const,responseBy:actor.userId,responseAt:new Date().toISOString(),responseNote:'Account holder declared these are their own results.'}:{})};
    });
    await tx`insert into athlete_result_proposals(id,athlete_id,submitted_by,source_url,original_text,input_hash,entries) values(${data.id}::uuid,${data.athleteId},${actor.userId},${data.sourceUrl},${data.text},${inputHash},${JSON.stringify(entries)}::jsonb)`;
    await audit(tx,actor,'athlete.results_proposed',data.id,null,{athleteId:data.athleteId,rows:entries.length,sourceUrl:data.sourceUrl},'Pasted facts are proposals, not verified performances. Publication requires a separate staff review.');
    return {id:data.id,reused:false};
  });
}
async function batch(sql:Sql,id:string,actor:Actor,lock=false):Promise<Batch> {
  const rows=await sql.query<Batch>(`select *,id::text,updated_at::text from athlete_result_proposals where id=$1::uuid ${lock?'for update':''}`,[id]);
  const b=rows[0];if(!b||(!actor.staff&&b.submitted_by!==actor.userId))throw new Error("This result draft is not available to your account.");return b;
}
export async function getBatch(id:string,actor:Actor){const sql=await ready();await user(sql,actor);return batch(sql,id,actor);}
export async function issueInvitation(data:{batchId:string;revision:number;email:string},actor:Actor) {
  if(!actor.staff)throw new Error("Staff access required.");
  const sql=await ready();await user(sql,actor);
  return sql.transaction(async tx=>{
    const b=await batch(tx,data.batchId,actor,true);
    if(b.revision!==data.revision)throw new Error("The draft changed. Reload before making a review link.");
    if(!b.athlete_id)throw new Error("Choose the intended athlete before creating their confirmation link.");
    const linked=await owners(tx,b.athlete_id);
    if(linked.length&&!linked.some(l=>l.email.toLowerCase()===data.email.toLowerCase()))throw new Error("Use the linked owner's verified email for this managed profile.");
    if(!b.entries.some(r=>r.state==='pending'))throw new Error("There are no pending races to send.");
    await tx`select id from "user" where id=${actor.userId} for update`;
    const [count]=await tx<{n:number}>`select count(*)::integer as n from athlete_result_review_invitations where created_by=${actor.userId} and created_at>now()-interval '1 hour'`;
    if(count.n>=30)throw new Error("Too many review links created this hour.");
    await tx`update athlete_result_review_invitations set revoked_at=now() where batch_id=${b.id}::uuid and revoked_at is null and responded_at is null`;
    const token=randomBytes(32).toString('hex'),id=randomUUID();
    await tx`insert into athlete_result_review_invitations(id,batch_id,token_hash,recipient_email,issued_revision,created_by,expires_at) values(${id}::uuid,${b.id}::uuid,${tokenHash(token)},${data.email.toLowerCase()},${b.revision},${actor.userId},now()+interval '7 days')`;
    await audit(tx,actor,'athlete.review_link_created',id,null,{batchId:b.id,expiresInDays:7},'A recipient-bound review link was created, not emailed. It grants no profile ownership.');
    return {id,url:`https://www.athrecs.com/review-results#${token}`,expiresInDays:7};
  });
}
export async function revokeInvitation(id:string,actor:Actor){if(!actor.staff)throw new Error("Staff access required.");const sql=await ready();await user(sql,actor);await sql`update athlete_result_review_invitations set revoked_at=now() where id=${id}::uuid`;return {revoked:true};}
async function invited(sql:Sql,token:string,actor:Actor,lock=false){
  const account=await user(sql,actor);
  const [invite]=await sql.query<{id:string;batch_id:string;recipient_email:string;issued_revision:number}>(`select id::text,batch_id::text,recipient_email,issued_revision from athlete_result_review_invitations where token_hash=$1 and revoked_at is null and responded_at is null and expires_at>now() ${lock?'for update':''}`,[tokenHash(token)]);
  if(!invite||invite.recipient_email!==account.email.toLowerCase())throw new Error("This review link is unavailable, expired or belongs to another verified email address. Use the email to which the link was addressed.");
  return invite;
}
export async function reviewInvitation(token:string,actor:Actor){
  const sql=await ready();const i=await invited(sql,token,actor);
  const [b]=await sql<Batch>`select *,id::text,updated_at::text from athlete_result_proposals where id=${i.batch_id}::uuid`;
  if(!b||b.revision!==i.issued_revision)throw new Error("This draft changed. Ask the sender for a new review link.");
  const p=b.athlete_id?await profile(sql,b.athlete_id):null;
  return {athleteName:p?.display_name??'Your results',rows:b.entries.filter(r=>r.state==='pending').map(r=>({index:r.index,race:r.race,date:r.date,distance:r.distance,time:r.time,timingBasis:r.timingBasis,sourceUrl:r.sourceUrl,bib:r.bib,place:r.place}))};
}
export async function respondInvitation(data:{token:string;responses:{index:number;response:'yes'|'no'|'unsure';note:string}[];declaration:true},actor:Actor){
  const sql=await ready();await user(sql,actor);
  return sql.transaction(async tx=>{
    // Lock batch before invitation, matching the staff issue/approval lock order.
    const pre=await invited(tx,data.token,actor);
    const [b]=await tx<Batch>`select *,id::text,updated_at::text from athlete_result_proposals where id=${pre.batch_id}::uuid for update`;
    const i=await invited(tx,data.token,actor,true);
    if(!b||b.revision!==i.issued_revision)throw new Error("This draft changed. Request a new review link.");
    const pending=b.entries.filter(r=>r.state==='pending');
    if(data.responses.length!==pending.length||new Set(data.responses.map(r=>r.index)).size!==pending.length||data.responses.some(r=>!pending.some(p=>p.index===r.index)))throw new Error("Respond to each listed race once.");
    const stamp=new Date().toISOString();const entries=b.entries.map(r=>{const response=data.responses.find(v=>v.index===r.index);return response?{...r,response:response.response,responseNote:response.note,responseBy:actor.userId,responseAt:stamp}:r;});
    await tx`update athlete_result_proposals set entries=${JSON.stringify(entries)}::jsonb,revision=revision+1,updated_at=now() where id=${b.id}::uuid`;
    await tx`update athlete_result_review_invitations set responded_at=now() where id=${i.id}::uuid`;
    await audit(tx,actor,'athlete.review_response',b.id,null,{responses:data.responses},'Identity responses only. No results were published, removed or transferred and no account ownership was granted.');
    return {recorded:true};
  });
}
