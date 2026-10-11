import test from 'node:test';
import assert from 'node:assert/strict';
import {CompactSet,Directory,eventDirectory} from './identity.mjs';

const url=id=>'https://statistik.d-u-v.org/getresultperson.php?runner='+id;
const athlete=(id,name,sourceId,overrides={})=>({id,display_name:name,given_name:name.split(' ')[0],family_name:name.split(' ').slice(1).join(' '),source_url:sourceId?url(sourceId):null,gender:'M',birth_year:1980,parent_athlete_id:null,profile_details:{aliases:[name,name],duvSourceObservation:{birthYear:1980}},...overrides});
const fixture=()=>({
 athletes:[
  athlete(1,'Jane Smith','101',{gender:'F'}),
  athlete(2,'John Smith','102',{profile_details:{aliases:['Jonathan Smyth','Mr John Smith'],duvSourceObservation:{birthYear:1980}}}),
  athlete(3,'Sarah Jones','103',{gender:'F',parent_athlete_id:1}),
  athlete(4,'Alice Brown','104',{gender:'F',birth_year:null,profile_details:{duvSourceObservation:{birthYear:1990}}}),
  athlete(5,'Steven Hart',null,{race_entry_name:'Steve Hart',profile_details:{aliases:[{name:'Stephen Heart'}],previous_names:['Steve Heart']}}),
  athlete(6,'Élise Martin',null,{gender:'F',profile_details:{nameAliases:['Elise-Marie Martin'],canonicalName:'Elise Martin',sourceName:'Martin Elise',requestedName:'E Martin',research_name_variants:[{value:'Elise M Martin'}]}}),
  athlete(7,'Carlos Ruiz',null,{profile_details:{sourceIdentities:[{sourceUrl:url('107')}],aliases:['Carlos Ruiz']}}),
  athlete(8,'Thomas White',null),
  athlete(9,'Bob Mackay',null,{name_details:{aliases:['Robert McKay']},profile_details:{duvSourceObservation:{birthYear:1975}}}),
  athlete(10,'Leah Cole','999',{gender:'F'}),athlete(11,'Lena Cole','999',{gender:'F'}),
  athlete(13,'Frank Davis','113',{profile_details:{duvSourceObservation:{birthYear:0}}}),
  athlete(14,'Alan Woods','114',{profile_details:{duvSourceObservation:{birthYear:'1980'}}}),
  athlete(15,'Harry Stone','115',{profile_details:{duvSourceObservation:null}}),
 ],
 accounts:[{name:'Graham Evans',full_name:'Graham S Evans',display_name:'G Evans',previous_names:['Graeme Evans']},{name:'Barbara Long',previous_names:[{alias:'Barb Long'}]}],
 histories:[{athlete_id:8,provider:'DUV Ultra Marathon Statistics',external_id:'duv:runner-108:event-123',source_url:'https://example.test/source'},
  {athlete_id:9,provider:'DUV',external_id:'109',source_url:''},
  {athlete_id:9999,provider:'DUV',external_id:'110',source_url:''}],
});
const row=(name,sourceId,overrides={})=>({name,sourceAthleteId:sourceId,givenName:name.split(' ')[0],familyName:name.split(' ').slice(1).join(' '),gender:'M',sourceBirthYear:1980,date:'2026-09-19',category:'M40',status:'finished',performance:{kind:'time'},...overrides});
const linked=id=>({status:'linked',athleteId:id,reasons:[]});
const held=(reason,possibleIds)=>({status:'held',reasons:[reason],...(possibleIds?{possibleIds}:{})});

test('compact index sets preserve native Set membership, size and ordered iteration',()=>{
 const object={},otherObject={},symbol=Symbol('key'),otherSymbol=Symbol('key');
 const inputs=['alpha','alpha','beta','gamma','beta',NaN,NaN,undefined,null,-0,0,false,'',object,object,otherObject,symbol,symbol,otherSymbol];
 const compact=new CompactSet(),native=new Set();
 for(const value of inputs){
  assert.equal(compact.add(value),compact);
  native.add(value);
  assert.equal(compact.size,native.size);
  assert.deepEqual([...compact],[...native]);
  for(const probe of [...inputs,'absent',{},Symbol('key')])assert.equal(compact.has(probe),native.has(probe));
 }
 assert.equal(new CompactSet().size,0);
 for(const value of [NaN,undefined,null,-0,0,false,'',object,symbol]){
  const single=new CompactSet([value]),standard=new Set([value]);
  assert.equal(single.size,1);
  assert.equal(single.has(value),true);
  assert.deepEqual([...single],[...standard]);
 }
 const values=function*(){yield 'first';yield 'second';yield 'first';};
 assert.deepEqual([...new CompactSet(values())],[...new Set(values())]);
});

const cases=[
 ['stable female identity',row('Jane Smith','101',{gender:'F'}),linked(1)],
 ['source identity gender mismatch',row('Jane Smith','101'),held('source_id_identity_details_differ',['1'])],
 ['stable male identity',row('John Smith','102'),linked(2)],
 ['source identity birth-year mismatch',row('John Smith','102',{sourceBirthYear:1981}),held('source_id_identity_details_differ',['2'])],
 ['source identity registered alias',row('Jonathan Smyth','102'),linked(2)],
 ['source identity different name',row('Different Name','102'),held('source_id_identity_details_differ',['2'])],
 ['merged profile identity',row('Sarah Jones','103',{gender:'F'}),held('source_id_identity_details_differ',['3'])],
 ['observed birth year without canonical year',row('Alice Brown','104',{gender:'F',sourceBirthYear:1990}),linked(4)],
 ['observed birth-year mismatch',row('Alice Brown','104',{gender:'F',sourceBirthYear:1991}),held('source_id_identity_details_differ',['4'])],
 ['source identity from profile details',row('Carlos Ruiz','107'),linked(7)],
 ['source identity from event history',row('Thomas White','108'),linked(8)],
 ['source identity from legacy history',row('Bob Mackay','109',{sourceBirthYear:1975}),linked(9)],
 ['history refers to missing profile',row('Unknown Athlete','110'),held('source_id_identity_details_differ',['9999'])],
 ['duplicated stable source identity',row('Leah Cole','999',{gender:'F'}),held('duv_id_linked_to_multiple_profiles',['10','11'])],
 ['zero observed year preserves canonical fallback',row('Frank Davis','113'),linked(13)],
 ['string observed year preserves strict mismatch',row('Alan Woods','114'),held('source_id_identity_details_differ',['14'])],
 ['null source observation preserves canonical fallback',row('Harry Stone','115'),linked(15)],
 ['race-entry name conservatively holds',row('Steve Hart','200'),held('possible_existing_name_or_alias',['5'])],
 ['name-details alias conservatively holds',row('Robert McKay','201'),held('possible_existing_name_or_alias',['9'])],
 ['accent-normalized name conservatively holds',row('Élise Martin','202',{gender:'F'}),held('possible_existing_name_or_alias',['6'])],
 ['reordered source name conservatively holds',row('Martin Elise','203',{gender:'F'}),held('possible_existing_name_or_alias',['6'])],
 ['account name conservatively holds',row('Graham Evans','204'),held('possible_existing_name_or_alias',['account:0'])],
 ['account previous name conservatively holds',row('Graeme Evans','205'),held('possible_existing_name_or_alias',['account:0'])],
 ['object account alias conservatively holds',row('Barbara Long','206',{gender:'F'}),held('possible_existing_name_or_alias',['account:1'])],
 ['unambiguous adult finished performance',row('Carlos Mendoza','207'),{status:'created',reasons:[]}],
 ['possible youth birth year',row('Carlos Mendoza','207',{sourceBirthYear:2010}),held('possible_youth_profile')],
 ['possible youth category',row('Carlos Mendoza','207',{category:'MU20'}),held('possible_youth_profile')],
 ['unfinished performance',row('Carlos Mendoza','207',{status:'dnf'}),held('performance_requires_review')],
 ['unparsed performance',row('Carlos Mendoza','207',{performance:{kind:'unparsed'}}),held('performance_requires_review')],
 ['initial-only given name',row('J Mendoza','208'),held('name_requires_review')],
 ['parenthesized name',row('Carlos (CJ) Mendoza','209'),held('name_requires_review')],
 ['event nickname collision first row',row('Alexander Li','501'),held('possible_source_name_variant_in_event',['502']),[row('Alexander Li','501'),row('Alex Li','502')]],
 ['event nickname collision second row',row('Alex Li','502'),held('possible_source_name_variant_in_event',['501']),[row('Alexander Li','501'),row('Alex Li','502')]],
];
assert.equal(cases.length,33);
for(const [label,candidate,expected,eventRows] of cases)test(label,()=>{
 const {athletes,accounts,histories}=fixture();
 const directory=new Directory(athletes,accounts,histories,'123');
 assert.deepEqual(directory.decide(candidate,eventDirectory(eventRows??[candidate])),expected);
});

test('batched loading preserves all seven ordered indexes and explicit alias/account/history memberships',()=>{
 const {athletes,accounts,histories}=fixture();
 const whole=new Directory(athletes,accounts,histories,'123');
 const batched=new Directory([],[],[],'123');
 for(const page of [athletes.slice(0,4),athletes.slice(4,8),athletes.slice(8)])for(const value of page)batched.addAthlete(value);
 batched.addAccounts(accounts);batched.addHistories(histories);
 assert.equal(batched.version,'123');
 for(const key of ['names','exact','compact','tokens','surnames','deletions','sourceIds']){
  const entries=directory=>[...directory[key]].map(([k,v])=>[k,[...v]]);
  assert.deepEqual(entries(batched),entries(whole),`${key} must retain key and member insertion order`);
 }
 assert.deepEqual([...batched.names.get('2')],['john smith','jonathan smyth']);
 assert.deepEqual([...batched.names.get('5')],['steven hart','steve hart','stephen heart','steve heart']);
 assert.deepEqual([...batched.names.get('6')],['elise martin','elise marie martin','elise m martin','martin elise','e martin']);
 assert.deepEqual([...batched.names.get('account:0')],['graham evans','graham s evans','g evans','graeme evans']);
 assert.deepEqual([...batched.exact.get('robert mckay')],['9']);
 assert.deepEqual([...batched.compact.get('jonathansmyth')],['2']);
 assert.deepEqual([...batched.tokens.get('elise martin')],['6']);
 assert.deepEqual([...batched.surnames.get('smith')],['1','2']);
 assert.deepEqual([...batched.deletions.get('smit')],['smith']);
 assert.deepEqual([...batched.sourceIds].map(([k,v])=>[k,[...v]]),[
  ['101',['1']],['102',['2']],['103',['3']],['104',['4']],['107',['7']],['999',['10','11']],
  ['113',['13']],['114',['14']],['115',['15']],['108',['8']],['109',['9']],['110',['9999']],
 ]);
 // Exercise later committed additions after batched loading, including a
 // nickname alias, without bypassing the conservative candidate screen.
 batched.addAthlete(athlete(16,'David Green','116',{profile_details:{aliases:['Dave Green']}}));
 assert.deepEqual(batched.decide(row('Dave Green','116'),eventDirectory([row('Dave Green','116')])),linked(16));
 assert.deepEqual(batched.decide(row('D Green','600'),eventDirectory([row('D Green','600')])),held('possible_existing_name_or_alias',['16']));
});
