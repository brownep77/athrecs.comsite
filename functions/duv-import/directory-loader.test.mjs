import test from 'node:test';
import assert from 'node:assert/strict';
import { Directory,eventDirectory } from './identity.mjs';
import { loadDirectory } from './directory-loader.mjs';

function fixture(){
 const athletes=Array.from({length:5001},(_,i)=>({id:i-2,display_name:`Person${i} Surname${i}`,profile_details:{aliases:[`Alias${i} Surname${i}`]}}));
 const accounts=[{full_name:'Account Guard',previous_names:['Previous Account']}];
 const histories=[{athlete_id:3,provider:'DUV',external_id:'duv:runner-4321:event-1'}];
 const calls=[];
 const client={async query(sql,args){
  calls.push({sql,args});
  if(sql.startsWith('SELECT version'))return {rows:[{version:'987'}]};
  if(sql.includes('FROM athletes WHERE'))return {rows:athletes.filter(a=>args[0]===null||a.id>args[0]).slice(0,args[1])};
  if(sql.includes('FROM "user"'))return {rows:accounts};
  if(sql.includes('FROM athlete_source_histories'))return {rows:histories};
  return {rows:[]};
 }};
 return {athletes,accounts,histories,calls,client};
}
test('paged snapshot retains all profiles, aliases, accounts and stable source associations',async()=>{
 const f=fixture(),d=await loadDirectory(f.client),whole=new Directory(f.athletes,f.accounts,f.histories,'987');
 assert.equal(d.version,'987');assert.equal(d.athletes.size,5001);
 for(const name of ['Person0 Surname0','Alias0 Surname0','Alias4999 Surname4999','Alias5000 Surname5000','Account Guard','Previous Account'])assert.deepEqual(d.matches(name),whole.matches(name));
 const row={sourceAthleteId:'4321',name:'Person5 Surname5'};
 assert.deepEqual(d.decide(row,eventDirectory([row])),whole.decide(row,eventDirectory([row])));
 assert.equal(f.calls[0].sql,'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 assert.equal(f.calls.at(-1).sql,'COMMIT');
 assert.equal(f.calls.filter(c=>c.sql.includes('FROM athletes WHERE')).length,2);
});
test('deadline rolls back incomplete directory and returns no usable cache',async()=>{
 const f=fixture();let tick=0;
 const d=await loadDirectory(f.client,{deadline:20000,now:()=>tick++===0?0:20000});
 assert.equal(d,null);assert.equal(f.calls.at(-1).sql,'ROLLBACK');
 assert.equal(f.calls.filter(c=>c.sql==='COMMIT').length,0);
});
test('failed page cannot expose a partial directory',async()=>{
 const f=fixture(),original=f.client.query;let page=0;
 f.client.query=async(sql,args)=>{if(sql.includes('FROM athletes WHERE')&&++page===2)throw Error('page_failed');return original(sql,args);};
 await assert.rejects(loadDirectory(f.client),/page_failed/);
 assert.equal(f.calls.at(-1).sql,'ROLLBACK');
});
test('slow account or history read cannot return a directory after its deadline',async()=>{
 for(const queryPart of ['FROM "user"','FROM athlete_source_histories']){
  const f=fixture(),original=f.client.query;let current=0;
  f.client.query=async(sql,args)=>{const result=await original(sql,args);if(sql.includes(queryPart))current=20000;return result;};
  assert.equal(await loadDirectory(f.client,{deadline:20000,now:()=>current}),null);
  assert.equal(f.calls.at(-1).sql,'ROLLBACK');
  assert.equal(f.calls.filter(c=>c.sql==='COMMIT').length,0);
 }
});
