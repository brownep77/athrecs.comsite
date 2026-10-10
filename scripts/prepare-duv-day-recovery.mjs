import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {gunzipSync} from 'node:zlib';
import {Directory,eventDirectory} from '../functions/duv-import/identity.mjs';
import {parseEvent,combinePages,sha,PROVIDER,eventId} from '../functions/duv-import/parser.mjs';
import {dayDuration} from '../functions/duv-import/day-duration.mjs';
import {history,newProfile} from '../functions/duv-import/worker.mjs';
const root=process.argv[2];if(!root)throw Error('Private snapshot directory required');
const read=name=>JSON.parse(fs.readFileSync(path.join(root,name+'.json'),'utf8'));
const manifest=read('manifest'),job=read('job')[0],matches=read('matches'),dir=new Directory([],[],[],manifest.revision);
for(const f of fs.readdirSync(root).filter(f=>/^athletes-\d+\.json$/.test(f))){
 for(const a of JSON.parse(fs.readFileSync(path.join(root,f),'utf8'))){
  dir.addAthlete(a);
  dir.addHistories((a.profile_details?.sourceIdentities??[]).filter(s=>s.provider===PROVIDER&&/^\d+$/.test(s.externalId)).map(s=>({athlete_id:a.id,provider:PROVIDER,external_id:s.externalId,source_url:null})));
 }
}
assert.equal(dir.athletes.size,manifest.athletes);dir.addAccounts(read('accounts'));const histories=read('histories');dir.addHistories(histories);dir.addHistories(histories.map(h=>({...h,source_url:null})));
const captures=new Map();let sourceRows=0,sourceCells=0;
for(const key of [...new Set(matches.map(m=>m.source_key))]){
 const {capture:c,documents}=read('capture-'+key);
 const parts=documents.map(d=>{assert.equal(d.status,'captured');const raw=gunzipSync(Buffer.from(d.gzip_hex,'hex'));assert.equal(sha(raw),d.html_sha256);return parseEvent(raw,c.inventory,new Date(d.captured_at).toISOString(),2026,d.source_url);});
 const parsed=combinePages(parts);assert.deepEqual(parsed.rows,c.payload.rows);assert.equal(parsed.rows.length,c.row_count);assert.equal(parsed.htmlSha256,c.html_sha256);
 sourceRows+=parsed.rows.length;sourceCells+=parsed.audit.comparedCells;
 captures.set(key,{...c,documents:documents.map(({gzip_hex,...d})=>d),eventDirectory:eventDirectory(parsed.rows)});
}
const items=[];let virtualId=-1;
for(const match of matches){
 const c=captures.get(match.source_key),original=c.payload.rows[match.source_row-1];
 assert.equal(original.sourceRow,match.source_row);assert.equal(original.sourceAthleteId,match.source_athlete_id);assert.equal(original.performance.kind,'unparsed');assert.equal(original.status,'finished');
 const measurement=dayDuration(original.performanceDisplay,original.distanceLabel);assert.ok(measurement);
 const row={...original,performance:measurement},decision=dir.decide(row,c.eventDirectory);
 const reviewId='duv-day-recovery-v1:'+match.source_key+':'+match.source_row;
 let profile=null,target=decision.athleteId??null;
 if(decision.status==='created'){
  profile=newProfile(row,c.payload,job);target=virtualId--;
  dir.addAthlete({id:target,display_name:profile.displayName,given_name:profile.givenName,family_name:profile.familyName,gender:profile.gender,source_url:profile.sourceUrl,profile_details:profile.details});
 }
 const performance=history(row,c.payload,c.capture_id);
 performance.sourceFormatReview={reviewId,sourceFormat:'days HH:mm:ss h',conversion:'days*86400+hours*3600+minutes*60+seconds; original precision retained',originalParserMeasurement:original.performance,sourceCompared:true,identityIndependentlyVerified:false};
 items.push({reviewId,match,original,decision,target,profile,externalId:'duv:runner-'+row.sourceAthleteId+':event-'+eventId(c.source_url),performances:[performance]});
}
const plan={schemaVersion:1,jobId:job.id,approvalId:job.approval_id,revision:manifest.revision,branchId:manifest.branchId,profilePublication:job.configuration.profilePublication,captures:[...captures.values()].map(({payload,eventDirectory,...c})=>c),items,audit:{sourceRows,sourceCells,sourceDocuments:manifest.documents,athletesScreened:manifest.athletes,parsers:['parse5/cheerio','htmlparser2'],identityVerified:false}};
fs.writeFileSync(path.join(root,'plan.json'),JSON.stringify(plan));
console.log(JSON.stringify({revision:plan.revision,...plan.audit,decisions:items.reduce((a,x)=>(a[x.decision.status]=(a[x.decision.status]??0)+1,a),{})}));
