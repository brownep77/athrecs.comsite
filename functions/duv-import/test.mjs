import test from 'node:test';import assert from 'node:assert/strict';
import {parseEvent,combinePages,dates,measurement} from './parser.mjs';
import {Directory,eventDirectory} from './identity.mjs';
import {profileVisibility} from './publication.mjs';
const url='https://statistik.d-u-v.org/getresultevent.php?event=900001';
const headings=['Rank','Performance','Surname, first name','Club','Nat.','YOB','M/F','Rank M/F','Cat','Cat. Rank'];
function fixture({start=1,count=1,total=1,reorder=false,name='Example, Alice',runner='900001',performance='45.123 km',edition='',distance='6h'}={}){
 const cells=[String(start),performance,`<a href="getresultperson.php?runner=${runner}">${name}</a>`,'Example AC','GBR','1980','F',String(start),'W45',String(start)];
 const order=headings.map((_,i)=>i);if(reorder)order.reverse();
 const meta=[['Date','04.10.2026'],['Event',edition+'Synthetic race (GBR)'],['Distance',distance+' road race'],['Finishers',`${total} (0 M, ${total} F)`]];
 return Buffer.from('<table>'+meta.map(([k,v])=>`<tr><td><b>${k}:</b></td><td>${v}</td></tr>`).join('')+'</table>'+ (total>count?`${start} to ${start+count-1} of ${total} search results`:'')+
 '<table id="Resultlist"><thead><tr>'+order.map(i=>'<th>'+headings[i]+'</th>').join('')+'</tr></thead><tbody><tr>'+order.map(i=>'<td>'+cells[i]+'</td>').join('')+'</tr></tbody></table>');
}
const inv={sourceUrl:url,index:{Date:'04.10.2026',Event:'Synthetic race (GBR)',Distance:'6h',Finishers:'1'}};
const parse=(raw,inventory=inv,page=url)=>parseEvent(raw,inventory,'2026-10-10T08:00:00Z',2026,page);
test('timed performance preserves exact distance, never finish time',()=>{const r=parse(fixture()).rows[0];assert.equal(r.performance.achievedDistanceMetres,'45123.000');assert.equal(r.performance.finishTimeSeconds,null);assert.equal(r.original.Performance,'45.123 km');});
test('all columns follow headings, even when reordered',()=>{const a=parse(fixture()).rows[0],b=parse(fixture({reorder:true})).rows[0];assert.notEqual(a.sourceDocumentHash,b.sourceDocumentHash);const {sourceDocumentHash:ah,...av}=a,{sourceDocumentHash:bh,...bv}=b;assert.deepEqual(av,bv);});
test('explicit edition prefix is retained without index rejection',()=>assert.equal(parse(fixture({edition:'99th '})).index.name,'99th Synthetic race (GBR)'));
test('international detail prefixes preserve the full original title',()=>{for(const edition of ['2^ ','9 ','12 ','14 . ','9a ','2ème ']){const p=parse(fixture({edition}));assert.equal(p.index.name,edition+'Synthetic race (GBR)');assert.equal(p.audit.metadataComparisons.eventName,'detail_numeric_prefix');}});
test('different titles, conflicting editions and changed dates remain held',()=>{
 assert.throws(()=>parse(fixture({edition:'2^ '}),{...inv,index:{...inv.index,Event:'1^ Synthetic race (GBR)'}}),/index_metadata_changed/);
 assert.throws(()=>parse(fixture(),{...inv,index:{...inv.index,Event:'Different race (GBR)'}}),/index_metadata_changed/);
 assert.throws(()=>parse(fixture(),{...inv,index:{...inv.index,Date:'03.10.2026'}}),/index_metadata_changed/);
 assert.throws(()=>parse(fixture({edition:'2ème '}),{...inv,index:{...inv.index,Event:'1ème Synthetic race (GBR)'}}),/index_metadata_changed/);
});
test('German index stage label compares exact distance and stage count',()=>{
 const i={...inv,index:{...inv.index,Distance:'92km/2Etappen'}};
 const p=parse(fixture({distance:'92km/2stages',performance:'12:13:14 h'}),i);
 assert.equal(p.rows[0].distanceLabel,'92km/2Etappen');assert.equal(p.eventMetadata.Distance,'92km/2stages road race');
 assert.equal(p.audit.metadataComparisons.distance,'Etappen_to_stages');
 for(const distance of ['93km/2stages','92km/3stages'])assert.throws(()=>parse(fixture({distance,performance:'12:13:14 h'}),i),/index_distance_changed/);
 assert.throws(()=>parse(fixture(),{...inv,index:{...inv.index,Distance:''}}),/index_distance_changed/);
});
test('unknown headings fail closed',()=>assert.throws(()=>parse(Buffer.from(fixture().toString().replace('<th>Rank</th>','<th>Unknown</th>'))),/unmapped/));
test('bad time in timed race fails closed',()=>assert.throws(()=>parse(fixture({performance:'06:00:00 h'})),/time_in_timed/));
test('source pagination cannot be treated as complete',()=>{const p=parse(fixture({total:2}),{...inv,index:{...inv.index,Finishers:'2'}});assert.throws(()=>combinePages([p]),/not_complete/);});
test('all pages combine with original row locators and raw document hashes',()=>{const i={...inv,index:{...inv.index,Finishers:'2'}};const a=parse(fixture({total:2}),i),b=parse(fixture({start:2,total:2,runner:'900002',name:'Sample, Beatrice'}),i,url+'&page=2');const c=combinePages([b,a]);assert.equal(c.rows.length,2);assert.equal(c.rows[1].sourceRow,2);assert.equal(c.audit.comparedPages,2);assert.equal(c.coverage.duvPageComplete,true);});
test('duplicate source athlete across pages fails closed',()=>{const i={...inv,index:{...inv.index,Finishers:'2'}};assert.throws(()=>combinePages([parse(fixture({total:2}),i),parse(fixture({start:2,total:2}),i,url+'&page=2')]),/duplicate_runner/);});
function withExtraCategory(category='X'){
 const base=fixture().toString(),row=/<tbody>(<tr>.*?<\/tr>)<\/tbody>/.exec(base)[1];
 const extra=row.replace('runner=900001','runner=900002').replace('Example, Alice','Sample, Casey').replace('<td>F</td>',`<td>${category}</td>`);
 return Buffer.from(base.replace('</tbody>',extra+'</tbody>'));
}
test('complete explicit X rows outside the M/F subtotal retain all evidence',()=>{
 const p=parse(withExtraCategory()),c=combinePages([p]);
 assert.equal(c.rows.length,2);assert.equal(c.rows[1].gender,'X');assert.equal(c.rows[1].original['M/F'],'X');
 assert.equal(c.eventMetadata.Finishers,'1 (0 M, 1 F)');assert.equal(c.index.raw.Finishers,'1');
 assert.deepEqual(c.audit.metadataComparisons.finisherCount,{method:'listed_MF_plus_explicit_X',listedTotal:1,displayedRows:2,explicitX:1});
 assert.equal(c.coverage.duvPageComplete,true);assert.equal(c.audit.identityVerified,false);
});
test('count discrepancies without exact explicit X evidence remain held',()=>{
 for(const category of ['','?','M','F'])assert.throws(()=>parse(withExtraCategory(category)),/partial_page_without_range/);
 assert.throws(()=>parse(Buffer.from(withExtraCategory().toString().replace('<td>F</td>','<td>M</td>'))),/partial_page_without_range/);
 assert.throws(()=>parse(withExtraCategory(),{...inv,index:{...inv.index,Finishers:'2'}}),/index_finisher_count_changed/);
});
test('X subtotal exception never admits pagination or duplicate source identities',()=>{
 const raw=withExtraCategory().toString();
 assert.throws(()=>parse(Buffer.from(raw+`<a href="${url}&page=2">Next</a>`)),/partial_page_without_range/);
 assert.throws(()=>parse(Buffer.from(raw+'1 to 2 of 2 search results')),/source_page_range_mismatch/);
 assert.throws(()=>parse(Buffer.from(raw.replace('runner=900002','runner=900001'))),/repeated_source_runner/);
});
test('known X source identity cannot silently link a changed category',()=>{
 const r=parse(withExtraCategory()).rows[1];const d=new Directory([{id:42,display_name:r.name,gender:'X',source_url:r.sourceAthleteUrl}]);
 assert.equal(d.decide(r,eventDirectory([r])).status,'linked');
 assert.equal(d.decide({...r,gender:'F'},eventDirectory([r])).status,'held');
});
test('same source ID on another event links to existing athlete',()=>{const r=parse(fixture()).rows[0];const d=new Directory([{id:42,display_name:r.name,given_name:r.givenName,family_name:r.familyName,gender:'F',source_url:r.sourceAthleteUrl}]);assert.equal(d.decide(r,eventDirectory([r])).athleteId,42);});
test('source ID with conflicting identity details stays held',()=>{const r=parse(fixture()).rows[0];const d=new Directory([{id:42,display_name:r.name,gender:'M',source_url:r.sourceAthleteUrl}]);assert.equal(d.decide(r,eventDirectory([r])).status,'held');});
test('names, aliases and account names prevent duplicate creation',()=>{const r=parse(fixture()).rows[0];for(const d of [new Directory([{id:42,display_name:r.name}]),new Directory([{id:42,display_name:'Different Name',profile_details:{aliases:[r.name]}}]),new Directory([],[{full_name:r.name}])])assert.equal(d.decide(r,eventDirectory([r])).status,'held');});
test('a repeated profile added in-memory prevents recreation',()=>{const r=parse(fixture()).rows[0],d=new Directory();assert.equal(d.decide(r,eventDirectory([r])).status,'created');d.addAthlete({id:3,display_name:r.name,gender:r.gender,source_url:r.sourceAthleteUrl});assert.equal(d.decide(r,eventDirectory([r])).status,'linked');});
test('ambiguous multiple source ID associations are held',()=>{const r=parse(fixture()).rows[0];const d=new Directory([1,2].map(id=>({id,display_name:r.name,source_url:r.sourceAthleteUrl})));assert.equal(d.decide(r,eventDirectory([r])).status,'held');});
test('multi-day dates and fractional times keep source precision',()=>{assert.deepEqual(dates('23.-24.05.2026'),{start:'2026-05-23',end:'2026-05-24'});assert.equal(measurement('4:16:26.12 h','45.6km').finishTimeSeconds,'15386.12');assert.throws(()=>dates('31.02.2026'),/invalid/);});
test('public source profiles require a separate explicit scoped approval',()=>{
 const p={visibility:'public',scope:'duv_created_unclaimed_profiles',approvalId:'synthetic-approval',approvedBy:'Test owner',approvedAt:'2026-10-10T10:06:37Z',instruction:'Publish imported source profiles'};
 assert.equal(profileVisibility({configuration:{}}),'private');
 assert.equal(profileVisibility({configuration:{profilePublication:p}}),'public');
 assert.equal(profileVisibility({configuration:{profilePublication:{...p,revokedAt:'2026-10-10T11:00:00Z'}}}),'private');
 for(const key of ['scope','approvedAt','instruction','approvalId','approvedBy'])assert.throws(()=>profileVisibility({configuration:{profilePublication:{...p,[key]:''}}}),/publication_approval/);
});
