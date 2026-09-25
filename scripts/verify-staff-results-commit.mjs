import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import * as cheerio from "cheerio";
import * as audit from "./lib/result-evidence-audit.mjs";
const require = createRequire(import.meta.url), ts = require("typescript");
function loadTs(path, deps = {}) {
  const module = {exports:{}};
  const compiled = ts.transpileModule(readFileSync(path,"utf8"),{fileName:path,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  new Function("require","module","exports",compiled.outputText)(name=>{
    if (!(name in deps)) throw new Error(`Unexpected dependency: ${name}`);
    return deps[name];
  },module,module.exports);
  return module.exports;
}
const core = loadTs("src/lib/staff-results-upload/core.ts");
const db = new PGlite(); await db.waitReady;
let queryCount = 0, injectFailure = false;
function sqlFor(connection) {
  const query = async(text,values=[])=>{
    queryCount++;
    if (injectFailure && /insert\s+into\s+results\(/i.test(text)) throw new Error("Synthetic result-write failure");
    // PGlite has no parallel backend sessions. Verify the production lock call,
    // while all record changes and constraints run in its actual transactions.
    if (/^select pg_advisory_xact_lock/.test(text.trim())) { assert.equal(values.length,1); return []; }
    return (await connection.query(text,values)).rows;
  };
  const sql = async(strings,...values)=>{
    let text=strings[0]; values.forEach((_,i)=>text+=`$${i+1}${strings[i+1]}`);
    return query(text,values);
  };
  sql.query=query;
  sql.transaction=work=>db.transaction(transaction=>work(sqlFor(transaction)));
  return sql;
}
const sql=sqlFor(db), connection={getSql:async()=>sql,dbSource:"neon"}, scope={IS_RUNRECS_SITE:false};
const headers=["Position","Forename","Surname","Gender","Gender Pos","Category","Cat Pos","Club","Tag","Time"];
let rows=[
  ["1","Riley","FreshSynthetic","M","1","MO","1","Example Synthetic Club","101","00:35:09.0"],
  ["2","Chris","MatchSynthetic","M","2","MO","2","Example Synthetic Club","102","00:35:50.1"],
  ["3","Private","PersonSynthetic","F","1","FO","1","","103","00:36:31.5"],
  ["4","Already","HereSynthetic","M","3","MO","3","","104","00:37:02.9"],
];
const csv=table=>table.map(row=>row.map(c=>'"'+String(c).replaceAll('"','""')+'"').join(',')).join('\r\n');
let eventName="Synthetic Confirmed 10K";
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const source={fetchSource:async()=>`<h2>${eventName}</h2><h3>10k</h3><p>Start: 20/09/2026 10:00</p><table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${escape(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`};
const service=loadTs("src/lib/staff-results-upload/service.server.ts",{"node:crypto":crypto,cheerio,"../db":connection,"../site-scope":scope,"../club-scanner/provider.server":source,"../../../scripts/lib/result-evidence-audit.mjs":audit,"./core":core,exceljs:require("exceljs")});
const commit=loadTs("src/lib/staff-results-upload/commit.server.ts",{"node:crypto":crypto,"../db":connection,"./core":core,"./service.server":service});
const actor={userId:"synthetic-import-staff",staffEmail:"synthetic-staff@example.test"};
const input=()=>({filename:"synthetic.csv",content:csv([headers,...rows]),eventName,date:"2026-09-20",distance:"10K",distanceKm:10,sourceUrl:"https://totalracetiming.co.uk/raceresults/1",timingBasis:"chip"});
const decision=(index,mode="new",athleteId)=>({index,mode,...(athleteId?{athleteId}:{}),identityNote:"Synthetic staff reviewed source identity evidence for this selected entry."});
const request=(upload,review,decisions)=>({upload,reviewHash:review.reviewHash,requestId:crypto.randomUUID(),decisions,rightsConfirmed:true,identitiesConfirmed:true,confirmation:"IMPORT SELECTED RESULTS"});
async function snapshot(){
  const state={};
  for(const table of ["athletes","results","events","editions","result_ingestion_runs","result_ingestion_editions","network_audit_log"])
    state[table]=(await db.query(`select coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text),'[]'::jsonb) as rows from ${table} t`)).rows[0].rows;
  return JSON.stringify(state);
}
try {
  // Real checked-in schema, in isolated memory. No connection string or live data.
  for(const name of readdirSync("migrations").filter(name=>name.endsWith('.sql')).sort()){
    try{await db.exec(readFileSync(`migrations/${name}`,"utf8"));}
    catch(error){throw new Error(`Isolated schema migration ${name}: ${error.message}`);}
  }
  await db.query('insert into "user"("id","name","email","emailVerified","createdAt","updatedAt") values($1,$2,$3,true,now(),now())',[actor.userId,"Synthetic Staff",actor.staffEmail]);
  const [club]=await sql`insert into clubs(slug,name,city,county,country,sports,summary) values('example-synthetic-club','Example Synthetic Club','','','','Running','') returning id`;
  const [matching]=await sql`insert into athletes(slug,display_name,club_id,profile_visibility) values('chris-match-synthetic','Chris MatchSynthetic',${club.id},'public') returning id`;
  const [privateAthlete]=await sql`insert into athletes(slug,display_name,profile_visibility) values('private-person-synthetic','Private PersonSynthetic','private') returning id`;
  const [priorAthlete]=await sql`insert into athletes(slug,display_name,profile_visibility) values('already-here-synthetic','Already HereSynthetic','public') returning id`;
  const [event]=await sql`insert into events(slug,name,sport,country,county,city,surface,summary) values('synthetic-confirmed-10k','Synthetic Confirmed 10K','Running','','','','Trail','') returning id`;
  const [edition]=await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-09-20','10K',10,'Finished') returning id`;
  await sql`insert into results(athlete_id,edition_id,bib,source_url,finish_time_seconds,chip_time_seconds,overall_place,gender_place,category_place,category,result_visibility) values(${priorAthlete.id},${edition.id},'104','https://totalracetiming.co.uk/raceresults/1',2223,2223,4,3,3,'MO','public')`;
  const upload=input(),review=await service.previewUpload(upload);
  assert.deepEqual(review.rows.map(r=>r.state),['new','review','review','duplicate']);
  const req=request(upload,review,[decision(1),decision(2,"link",matching.id)]),before=await snapshot();
  await assert.rejects(()=>commit.commitUpload({...req,rightsConfirmed:false},actor),/Confirm publication/);
  await assert.rejects(()=>commit.commitUpload({...req,identitiesConfirmed:false},actor),/Confirm publication/);
  await assert.rejects(()=>commit.commitUpload({...req,confirmation:""},actor),/Confirm publication/);
  await assert.rejects(()=>commit.commitUpload(req,{userId:"",staffEmail:""}),/authenticated staff/);
  await assert.rejects(()=>commit.commitUpload({...req,decisions:[decision(2)]},actor),/possible existing athlete/);
  await assert.rejects(()=>commit.commitUpload({...req,decisions:[decision(3,"link",privateAthlete.id)]},actor),/Protected profiles/);
  await assert.rejects(()=>commit.commitUpload({...req,decisions:[decision(4)]},actor),/already imported/);
  await assert.rejects(()=>commit.commitUpload({...req,reviewHash:'0'.repeat(64)},actor),/changed/);
  assert.equal(await snapshot(),before,"Rejected requests must not mutate any data");
  rows[0][9]="00:35:09.1";
  await assert.rejects(()=>commit.commitUpload(req,actor),/changed/);rows[0][9]="00:35:09.0";
  injectFailure=true;
  await assert.rejects(()=>commit.commitUpload(req,actor),/Synthetic result-write failure/);injectFailure=false;
  assert.equal(await snapshot(),before,"A late result failure rolls back profiles, event changes, ledger and audit");
  queryCount=0;
  const saved=await commit.commitUpload(req,actor);
  assert.equal(saved.createdProfiles,1);assert.equal(saved.linkedProfiles,1);assert.equal(saved.importedResults,2);assert.equal(saved.heldRows,2);
  assert(queryCount<40,"Small batches use a bounded number of set-based statements");
  const inserted=await sql`select r.*,a.date_of_birth,a.country,a.bio from results r join athletes a on a.id=r.athlete_id where r.ingestion_run_id=${saved.runId} order by r.overall_place`;
  assert.equal(inserted[1].chip_time_seconds,2150);
  assert.equal(inserted[1].result_details.timing.chipSeconds,2150.1);
  assert.equal(inserted[1].result_details.timing.chipText,"00:35:50.1");
  assert.equal(inserted[1].gun_time_seconds,null);assert.equal(inserted[1].result_details.timing.gunSeconds,null);
  assert.equal(inserted[0].date_of_birth,null);assert.equal(inserted[0].country,"");assert.equal(inserted[0].bio,"");
  assert(inserted.every(r=>r.result_visibility==='public'));
  assert.equal((await sql`select profile_visibility from athletes where id=${privateAthlete.id}`)[0].profile_visibility,'private');
  const after=await snapshot(),replayed=await commit.commitUpload(req,actor);
  assert.equal(replayed.replay,true);assert.equal(replayed.runId,saved.runId);assert.equal(await snapshot(),after);
  await assert.rejects(()=>commit.commitUpload({...req,decisions:[decision(1)]},actor),/already in use/);
  assert.deepEqual((await service.previewUpload(upload)).rows.map(r=>r.state),['duplicate','duplicate','review','duplicate']);
  // A new race plus a full synthetic 430-runner batch; no actual participant file.
  eventName="Synthetic Bulk 10K";
  rows=Array.from({length:430},(_,i)=>[String(i+1),`Test${i}`,`UniqueSynthetic${i}`,'M',String(i+1),'MO',String(i+1),'',String(1000+i),`00:45:${String(i%60).padStart(2,'0')}.1`]);
  const bulkInput=input(),bulkReview=await service.previewUpload(bulkInput);
  assert.equal(bulkReview.summary.new,430);
  queryCount=0;
  const bulk=await commit.commitUpload(request(bulkInput,bulkReview,rows.map((_,i)=>decision(i+1))),actor);
  assert.equal(bulk.createdProfiles,430);assert.equal(bulk.importedResults,430);assert.equal(bulk.linkedProfiles,0);
  assert(queryCount<40,"430 entries must not cause per-runner SQL request loops");
  assert.equal((await service.previewUpload(bulkInput)).summary.duplicate,430);
  assert.equal((await sql`select count(*)::integer as n from results where edition_id=${bulk.editionId} and result_visibility='public'`)[0].n,430);
  const api=readFileSync("src/lib/staff-results-upload/api.ts","utf8");
  assert.match(api,/importCheckedRaceUpload[\s\S]*?middleware\(\[staffMiddleware\]\)/);
  assert.match(api,/rightsConfirmed: z.literal\(true\)/);assert.match(api,/identitiesConfirmed: z.literal\(true\)/);
  assert.doesNotMatch(readFileSync("scripts/publish-after-build.mjs","utf8"),/staff-results-upload|commitUpload/);
  console.log("PASS: migrated-schema confirmed import, explicit review, protected profiles, atomic rollback, replay safety, exact chip precision, new race creation and a 430-row set-based batch. All data synthetic; no live database used.");
} finally {await db.close();}
