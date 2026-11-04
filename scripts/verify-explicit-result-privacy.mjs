import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { PGlite } from '@electric-sql/pglite';
import { publicResultVisibilitySql } from '../src/lib/athrecs/public-result-visibility.server.ts';

// Execute the actual member-profile query, including every interpolated condition.
const source = ts.createSourceFile('api.ts', readFileSync('src/lib/athrecs/api.ts','utf8'), ts.ScriptTarget.Latest, true);
let query;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source)==='resultsPromise' && ts.isTaggedTemplateExpression(node.initializer)) query=node.initializer.getText(source);
  ts.forEachChild(node,visit);
}
visit(source);
assert(query, 'Find actual profile results SQL');
const compiled=ts.transpileModule(`export const run=(sql,athlete,approvedPublicOnly)=>${query}`, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('exports','module',compiled)(module.exports,module);
const db=new PGlite();
try {
  await db.exec(`
    create table athletes(id int,profile_type text,profile_visibility text,parent_athlete_id int,profile_details jsonb);
    create table events(id int,name text,slug text,sport text,surface text,country text,city text);
    create table editions(id int,event_id int,event_date date,distance_code text,distance_km numeric);
    create table results(id int,athlete_id int,edition_id int,status text,result_details jsonb,chip_time_seconds int,gun_time_seconds int,overall_place int,gender_place int,category_place int,finish_time_seconds int,category text,result_source text,source_url text,result_visibility text);
    create table athlete_account_links(user_id text,athlete_id int,status text);
    create table athlete_public_shares(user_id text,enabled boolean,share_results boolean);
    create table athlete_profile_hidden_results(user_id text,result_id int);
    insert into athletes values(1,'Public figure','public',null,'{}');
    insert into events(id) values(1);
    insert into editions(id,event_id,event_date) values(1,1,'2026-01-01');
    insert into results(id,athlete_id,edition_id,result_visibility,finish_time_seconds) values(1,1,1,'public',7200),(2,1,1,'private',7300),(3,1,1,'public_figure',7400),(4,1,1,null,7500);
  `);
  const sql=async(strings,...values)=>{
    const query=strings.reduce((a,s,i)=>a+(i?'$'+i:'')+s,'');
    return (await db.query(query,values)).rows;
  };
  for(const approvedPublicOnly of [false,true]) {
    assert.deepEqual((await module.exports.run(sql,{id:1,profile_type:'Public figure'},approvedPublicOnly)).map(r=>r.id).sort(),[1,3]);
  }
  const visible=()=>db.query(`select r.id from results r join athletes a on a.id=r.athlete_id where ${publicResultVisibilitySql} order by r.id`);
  assert.deepEqual((await visible()).rows.map(r=>r.id),[1,3], 'Sitemaps and edition links exclude private and null visibility');
  await db.exec(`insert into athlete_account_links values('owner',1,'active'); insert into athlete_public_shares values('owner',true,true); insert into athlete_profile_hidden_results values('owner',1)`);
  assert.deepEqual((await visible()).rows.map(r=>r.id),[3]);
  await db.exec(`update athlete_public_shares set share_results=false`);
  assert.equal((await visible()).rows.length,0);
  console.log('Explicit privacy verified in actual member/public profile SQL and shared sitemap/edition-link predicate.');
} finally { await db.close(); }
