// Usage: node scripts/verify-tlm-followup-plan.mjs PRIVATE_WORK_DIRECTORY
// Public schemas must strip archive evidence; participant data stays outside Git.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sourceHistorySchema } from '../src/lib/athrecs/source-performance-history.ts';

const folder=process.argv[2];
assert.ok(folder,'A private work directory is required');
const plan=JSON.parse(await readFile(resolve(folder,'plan.private.json'),'utf8'));
const captures=JSON.parse(await readFile(resolve(folder,'captures.private.json'),'utf8'));
const rows=new Map(captures.flatMap(c=>c.payload.rows.map(r=>[r.sourceKey,r])));
assert.equal(rows.size,41691);
const seen=new Set();let count=0;
for(const p of plan.profiles){
  const parsed=sourceHistorySchema.parse({provider:'The Last Mile Racing',externalId:p.externalId,
    sourceUrl:p.sourceUrl,capturedAt:p.capturedAt,complete:false,yearsExpected:[],yearsCaptured:p.years,performances:p.performances});
  assert.equal(p.nation,'');
  assert.equal(p.details.athlete_verified,false);
  assert.equal(p.details.archiveCreation.profileIdentityVerified,false);
  assert.equal(p.details.archiveCreation.resultCount,p.performances.length);
  assert.ok(p.performances.length >= (process.argv.includes('--allow-single-observation') ? 1 : 2));
  for(let i=0;i<p.performances.length;i++){
    const v=p.performances[i],key=v.archiveReference.sourceRow,r=rows.get(key);
    assert.ok(r);assert.ok(!seen.has(key),'A source result must occur only once');seen.add(key);
    assert.deepEqual(v.sourceKeys,[key]);assert.deepEqual(v.sourceUrls,[r.sourceUrl]);
    assert.equal(v.year,Number(r.date.slice(0,4)));assert.equal(v.date,r.date);
    assert.equal(v.meeting,r.eventName);assert.equal(v.discipline,r.distanceCode);
    assert.equal(v.performance,r.finishTime);assert.equal(v.ageGroup,r.category||'');
    assert.equal(v.place,String(r.overallPosition||''));
    assert.deepEqual(v.places,{overall:r.overallPosition,gender:r.genderPosition,category:r.categoryPosition});
    assert.equal(v.timing.basis,r.timeBasis==='unspecified'?'unknown':r.timeBasis);
    assert.equal(v.timing.chip??null,r.chipTime);assert.equal(v.timing.gun??null,r.gunTime);
    assert.equal(v.archiveReference.bib,r.bib);assert.equal(v.archiveReference.sourceSha256,r.sourceSha256);
    assert.equal(v.verificationStatus,'unverified');
    assert.deepEqual(v.labels,['Identity unconfirmed']);
    assert.ok(!('archiveReference' in parsed.performances[i]));
    assert.ok(!('ageAtRace' in parsed.performances[i]));
    assert.ok(!('residenceCityOriginal' in parsed.performances[i]));
    count++;
  }
}
assert.equal(count,plan.summary.eligibleResultRecords);
const result={planHash:plan.planHash,profiles:plan.profiles.length,performances:count,schemaValidated:true,sourceFieldComparison:true};
await writeFile(resolve(folder,'schema-validation.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result));
