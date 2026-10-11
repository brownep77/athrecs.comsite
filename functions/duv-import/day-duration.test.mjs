import test from 'node:test';
import assert from 'node:assert/strict';
import {dayDuration} from './day-duration.mjs';
import {Directory,eventDirectory} from './identity.mjs';
test('day-form finish times retain source text and fractional precision',()=>{
 const display='2d 04:09:11.120 h',m=dayDuration(display,'200mi');
 assert.equal(m.finishTimeSeconds,'187751.120');assert.equal(m.value,'187751.120');assert.equal(m.display,display);
 assert.equal(m.achievedDistanceMetres,null);assert.equal(m.eventDurationSeconds,null);
 assert.equal(dayDuration('4d 00:00:00 h','328km').value,'345600');
});
test('invalid components and timed-distance races cannot become finish times',()=>{
 for(const s of ['2d 24:00:00 h','2d 00:60:00 h','2d 00:00:60 h'])assert.throws(()=>dayDuration(s,'100mi'),/invalid_day_duration_component/);
 for(const d of ['24h','6d','','unknown','100km extra'])assert.equal(dayDuration('2d 00:00:00 h',d),null);
 for(const s of ['0d 01:00:00 h','2 days 01:00:00','2d 1:00:00 h','-2d 00:00:00 h','2d 00:00:00 h extra'])assert.equal(dayDuration(s,'100mi'),null);
});
test('reviewed duration does not bypass duplicate, youth or identity checks',()=>{
 const r={name:'Alice Example',givenName:'Alice',familyName:'Example',sourceAthleteId:'900001',sourceAthleteUrl:'https://statistik.d-u-v.org/getresultperson.php?runner=900001',gender:'F',date:'2026-08-01',sourceBirthYear:1980,category:'W45',status:'finished',performance:dayDuration('2d 00:00:00 h','100mi')};
 assert.equal(new Directory().decide(r,eventDirectory([r])).status,'created');
 for(const dir of [new Directory([{id:1,display_name:r.name}]),new Directory([],[{name:r.name}]),new Directory([{id:1,display_name:r.name,source_url:r.sourceAthleteUrl,gender:'M'}])])assert.equal(dir.decide(r,eventDirectory([r])).status,'held');
 const youth={...r,sourceBirthYear:2010};assert.equal(new Directory().decide(youth,eventDirectory([youth])).status,'held');
 const d=new Directory([{id:-1,display_name:r.name,gender:'F',source_url:r.sourceAthleteUrl}]);assert.deepEqual(d.decide(r,eventDirectory([r])),{status:'linked',athleteId:-1,reasons:[]});
});
