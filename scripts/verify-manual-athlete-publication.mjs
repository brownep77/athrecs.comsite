import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Exercise the actual SQL in an isolated database with synthetic identities,
// source evidence and timing values; never connect to DATABASE_URL.
const original = await readFile(new URL('../migrations/20260923_publish_david_torrens.sql', import.meta.url), 'utf8');
const migration = original
  .replaceAll('David Torrens', 'Test Runner')
  .replaceAll('david torrens', 'test runner')
  .replaceAll('david-torrens', 'test-runner')
  .replaceAll('publish_david_torrens', 'publish_test_runner')
  .replaceAll("'David'", "'Test'")
  .replaceAll("'Torrens'", "'Runner'")
  .replaceAll('Paul Browne', 'Test Reviewer')
  .replaceAll('3814', '4200')
  .replaceAll('1:03:34', '1:10:00')
  .replaceAll('https://results.eventchiptiming.com/myresults.aspx?CId=16202&RId=10399&EId=5&AId=253543', 'https://example.test/result/123');
const schema = `
  create table app_meta (key text primary key, value text not null);
  insert into app_meta values ('seed_version', 'synthetic-established-catalogue');
  create table athletes (
    id serial primary key, slug text not null unique, display_name text not null,
    given_name text, family_name text, gender text default 'U', city text,
    county text default '', country text default '', bio text default '',
    profile_visibility text default 'private'
  );
  create table athlete_account_links (athlete_id integer references athletes(id), status text);
  create table athlete_identifiers (
    number bigint generated always as identity primary key,
    athlete_id integer unique references athletes(id)
  );
  create table events (
    id serial primary key, slug text unique, name text, sport text, country text,
    county text, city text, surface text
  );
  create table event_distances (
    event_id integer references events(id), distance_code text,
    primary key(event_id, distance_code)
  );
  create table editions (
    id serial primary key, event_id integer references events(id), event_date date,
    distance_code text, distance_km double precision,
    status text check(status in ('Open','ClosingSoon','Closed','Finished','TBC')),
    source_url text, unique(event_id, event_date, distance_code)
  );
  create table results (
    id serial primary key, edition_id integer references editions(id),
    athlete_id integer references athletes(id), status text, finish_time_seconds integer,
    chip_time_seconds integer, gun_time_seconds integer, overall_place integer,
    gender_place integer, category_place integer, result_visibility text,
    source_url text, result_source text, result_details jsonb default '{}',
    unique(edition_id, athlete_id)
  );
  create table result_source_references (
    result_id integer references results(id), source_url text, source_name text,
    primary key(result_id, source_url)
  );
  create table network_audit_log (
    id bigserial primary key, action text, entity_type text, entity_id text,
    before_value jsonb, after_value jsonb, note text
  );
`;
async function apply(db) {
  await db.exec('BEGIN');
  try {
    await db.exec(migration);
    await db.exec('COMMIT');
  } catch (error) {
    await db.exec('ROLLBACK');
    throw error;
  }
}
async function test(name, fixture, check) {
  const db = new PGlite();
  try {
    await db.exec(schema);
    if (fixture) await db.exec(fixture);
    await check(db);
    console.log(`PASS: ${name}`);
  } finally {
    await db.close();
  }
}
async function rows(db, query) { return (await db.query(query)).rows; }
const athlete = "insert into athletes(slug,display_name,city,bio) values ('existing-test-runner','Test Runner','London','Existing factual bio');";
const event = `
  insert into events(slug,name,sport,surface) values ('existing-st-albans','ATW St Albans Half Marathon','Running','Road');
  insert into editions(event_id,event_date,distance_code,distance_km) values (1,'2026-06-14','10K',10),(1,'2026-06-14','Half',21.0975);
`;
await test('unseeded databases remain empty for normal catalogue bootstrap', 'delete from app_meta;', async (db) => {
  await apply(db);
  for (const table of ['athletes','events','editions','results','network_audit_log']) {
    assert.equal((await rows(db, `select count(*)::int n from ${table}`))[0].n, 0);
  }
});
await test('new profile, exact 10K and manually verified time, unknown values remain empty', '', async (db) => {
  await apply(db);
  const [a] = await rows(db, 'select * from athletes');
  assert.equal(a.display_name, 'Test Runner');
  assert.equal(a.profile_visibility, 'public');
  assert.equal(a.gender, 'U');
  assert.equal(a.city, 'London');
  assert(!a.bio.includes('verified'));
  const [r] = await rows(db, 'select * from results');
  assert.equal(r.finish_time_seconds, 4200);
  assert.equal(r.result_visibility, 'public');
  for (const key of ['chip_time_seconds','gun_time_seconds','overall_place','gender_place','category_place']) assert.equal(r[key], null);
  assert.equal(r.result_details.verification.method, 'staff_visual_confirmation');
  assert.equal(r.result_details.verification.verifiedBy, 'Test Reviewer');
  assert.equal(r.result_details.verification.timingBasis, 'unspecified');
  const [ed] = await rows(db, 'select distance_code,distance_km,status from editions');
  assert.equal(ed.distance_code, '10K');
  assert.equal(ed.distance_km, 10);
  assert.equal(ed.status, 'Finished');
  await apply(db);
  for (const table of ['athletes','results','editions','network_audit_log','athlete_identifiers','result_source_references']) {
    assert.equal((await rows(db, `select count(*)::int n from ${table}`))[0].n, 1);
  }
});
await test('reuse IDs and slug; preserve other athlete privacy and half marathon', athlete + event +
  "insert into athletes(slug,display_name,city) values ('other-athlete','Other Athlete','Norwich');", async (db) => {
  await apply(db);
  const [a] = await rows(db, 'select * from athletes where id=1');
  assert.equal(a.slug, 'existing-test-runner');
  assert.equal(a.bio, 'Existing factual bio');
  assert.equal((await rows(db,'select profile_visibility from athletes where id=2'))[0].profile_visibility, 'private');
  assert.equal((await rows(db,'select edition_id from results'))[0].edition_id, 1);
  assert.equal((await rows(db,'select count(*)::int n from events'))[0].n, 1);
});
await test('same result is updated without losing separate original timing evidence', athlete + event +
  "insert into results(athlete_id,edition_id,status,finish_time_seconds,chip_time_seconds,gun_time_seconds,result_visibility) values (1,1,'finished',4200,4200,4208,'private');", async (db) => {
  await apply(db);
  const [r] = await rows(db,'select * from results');
  assert.equal(r.id, 1);
  assert.equal(r.chip_time_seconds, 4200);
  assert.equal(r.gun_time_seconds, 4208);
  assert.equal((await rows(db,'select before_value from network_audit_log'))[0].before_value.result.result_visibility, 'private');
});
for (const [name, fixture, expected] of [
  ['ambiguous names', athlete + "insert into athletes(slug,display_name) values ('second-test-runner','Test Runner');", /multiple athlete matches/],
  ['claimed profile', athlete + "insert into athlete_account_links values (1,'active');", /active account/],
  ['different location', athlete + "update athletes set city='Edinburgh';", /location/],
  ['conflicting finish', athlete + event + "insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility) values (1,1,'finished',4000,'private');", /existing result conflicts/],
  ['disqualified result', athlete + event + "insert into results(athlete_id,edition_id,status,finish_time_seconds,result_visibility) values (1,1,'DQ',4200,'private');", /existing result conflicts/],
  ['duplicate event editions', athlete + event + "insert into events(slug,name,sport) values ('second-event','St Albans 10K','Running'); insert into editions(event_id,event_date,distance_code,distance_km) values (2,'2026-06-14','10K',10);", /multiple St Albans 10K editions/]
]) {
  await test(`atomic stop for ${name}`, fixture, async (db) => {
    await assert.rejects(() => apply(db), expected);
    assert.equal((await rows(db,'select profile_visibility from athletes where id=1'))[0].profile_visibility, 'private');
    assert.equal((await rows(db,'select count(*)::int n from network_audit_log'))[0].n, 0);
  });
}
console.log('Manual athlete publication safety checks passed. No production database was accessed.');
