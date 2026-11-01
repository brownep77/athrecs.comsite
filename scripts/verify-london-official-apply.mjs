/** Synthetic, in-memory verification of the official-results London applier SQL.
 * No source collections, credentials, remote requests or persistent databases.
 * Run: node scripts/verify-london-official-apply.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = JSON.parse(execFileSync("python3", ["-c", String.raw`
import contextlib, hashlib, io, json, pathlib, tempfile, importlib.util
root=pathlib.Path.cwd()
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
a=load('synthetic_official_apply',root/'scripts/apply-london-official-profiles.py')
v=load('synthetic_official_rows',root/'scripts/verify-london-official-plan.py')
rows=[v.row('SYNTH0000000001','Aster','Quill','03:40:00',place=1,nat='NGA'),
      v.row('SYNTH0000000006','Cedar','North','04:01:00',place=2),
      v.row('SYNTH0000000007','Fenna','Rook','01:35:00',event='VLMW',label='Wheelchair',gender='W',nat='',place=1,half='')]
v.ROWS=rows
with tempfile.TemporaryDirectory() as d:
    folder=pathlib.Path(d);src=folder/'london_2025.json';src.write_text(json.dumps(rows))
    ctx=v.context(src);a.configure(ctx);obs=a.planner.load_sources(folder)
existing='https://results.tcslondonmarathon.com/2025/?content=detail&event=MAS&idp=SYNTH0000000006&lang=EN_CAP'
snapshot={'athletes':[{'id':7,'displayName':'Cedar North','aliases':[],'gender':'M','visibility':'private'}],
 'results':[{'id':77,'athleteId':7,'editionId':v.EDITION['id'],'finishSeconds':14460,'sourceUrls':[existing],'sourceKind':'canonical','gender':'M'}],
 'accounts':[{'id':'owner','names':['Cedar North'],'linkedAthleteIds':[7]}],
 'metadata':{'editionContextDigest':a.planner._hash(a.EDITION_CONTEXT),'batchId':a.BATCH}}
plan=a.planner.build_plan(obs,snapshot,v.EDITION,a.BATCH,v.CREATED)
a.configure_from_plan(plan)
assert [plan['summary'][k] for k in ('new','linked','held')]==[2,1,0],plan['summary']
chosen,_=a.select_groups(plan,False,0)
parts=list(a.capture_parts(plan));setup=[];retention=[]
a.setup(lambda q:setup.append(q),plan,parts)
def retain(q):
    retention.append(q);part=parts[len(retention)-1]
    return [[] for _ in q[:-1]]+[[{'id':len(retention),'payload_hash':part['payloadHash'],'html_sha256':part['rawSha256'],
      'row_count':part['rowCount'],'source_check':'compared','integrity_hash':'PENDING'}]]
with contextlib.redirect_stdout(io.StringIO()):
    evidence=a.retain_captures(retain,parts,{'planHash':a.digest(plan)},lambda:None,workers=1)
new=[a.prepare_new(g,evidence,plan) for g in chosen if g['disposition']=='new']
linked=[{'groupId':g['groupId'],'athleteId':g['athleteId'],'resultIds':g['resultIds'],
 'existingMatches':g['existingMatches'],'sourceKeys':g['sourceKeys'],'sourceUrls':g['sourceUrls'],
 'captureIds':sorted({int(evidence[k]['id']) for k in g['observationKeys']})} for g in chosen if g['disposition']=='linked']
caps=list({c['id']:c for c in evidence.values()}.values())
guard=a.guard_statements(a.snapshotter.fingerprint_sql(),'PENDING',caps,a.snapshotter.FINGERPRINT_TABLES)
print(json.dumps({'editionId':v.EDITION['id'],'date':v.DATE,'batch':a.BATCH,'instruction':a.INSTRUCTION,'planHash':a.digest(plan),
 'setup':setup,'retention':retention,'guard':guard,'new':new,'linked':linked,'existingUrl':existing,
 'insertNew':a.NEW_PROFILES,'verifyNew':a.VERIFY_NEW,'linkEvidence':a.LINK_EVIDENCE,'verifyLinked':a.VERIFY_LINKED,
 'fingerprint':a.snapshotter.fingerprint_sql()}))
`], { cwd: root, encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }));

const db = new PGlite();
const query = async (statements) => db.transaction(async (tx) => {
  const results = [];
  for (const [sql, params] of statements) results.push((await tx.query(sql, params)).rows);
  return results;
});
const fp = async () => (await db.query(fixture.fingerprint, [fixture.batch])).rows[0].fingerprint;
try {
  await db.exec(`
    CREATE TABLE athletes(id serial PRIMARY KEY,slug text UNIQUE,display_name text,given_name text,family_name text,
      race_entry_name text,gender text,city text,county text,country text,nation text,bio text,source_url text,
      profile_type text,profile_visibility text,profile_roles text,profile_details jsonb,
      profile_source_checked_at timestamptz,date_of_birth date,parent_athlete_id int,club_id int);
    CREATE TABLE "user"(id text PRIMARY KEY,name text);
    CREATE TABLE athlete_private_profiles(user_id text PRIMARY KEY,full_name text,display_name text,previous_names text[]);
    CREATE TABLE athlete_account_links(athlete_id int,user_id text,status text);
    CREATE TABLE athlete_public_shares(user_id text,enabled boolean,share_bio boolean,share_results boolean,share_club boolean,share_location boolean);
    CREATE TABLE athlete_profile_history_choices(user_id text,athlete_id int,provider text,external_id text,performance_hash text,excluded boolean);
    CREATE TABLE source_history_claim_results(id int,athlete_id int,provider text,external_id text,source_key text);
    CREATE TABLE athlete_profile_hidden_source_results(user_id text,source_result_id int);
    CREATE TABLE events(id int PRIMARY KEY,name text,slug text);
    CREATE TABLE editions(id int PRIMARY KEY,event_id int,event_date date,distance_code text,distance_km numeric);
    CREATE TABLE results(id int PRIMARY KEY,athlete_id int,edition_id int,status text,finish_time_seconds numeric,
      chip_time_seconds numeric,gun_time_seconds numeric,bib text,overall_place int,gender_place int,category_place int,
      category text,source_url text,result_source text,result_visibility text,result_details jsonb);
    CREATE TABLE result_source_references(result_id int,source_url text,source_name text);
    CREATE TABLE network_audit_log(id serial PRIMARY KEY,action text,entity_type text,entity_id text,after_value jsonb,note text);
    INSERT INTO athletes(id,slug,display_name,gender,profile_visibility,profile_details)
      VALUES(7,'cedar-north-synthetic','Cedar North','M','private','{"athlete_verified":true}');
    SELECT setval('athletes_id_seq',7);
    INSERT INTO "user" VALUES('owner','Cedar North');
    INSERT INTO athlete_account_links VALUES(7,'owner','active');
    INSERT INTO events VALUES(71,'London Marathon','london-marathon');
    INSERT INTO editions VALUES(${fixture.editionId},71,'${fixture.date}','marathon',42.195);
  `);
  for (const file of ["0035_athlete_source_histories.sql", "0036_source_history_publication.sql",
    "0030_athlete_identifiers.sql", "20261009_private_source_captures.sql"])
    await db.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  await db.query(`INSERT INTO results VALUES(77,7,${fixture.editionId},'finished',14460,14460,null,'1002',null,null,null,'18-39',$1,'Synthetic existing','private','{"verified":true}')`, [fixture.existingUrl]);
  const originalFingerprint = await fp();
  const originalAthlete = (await db.query("SELECT to_jsonb(a) row FROM athletes a WHERE id=7")).rows;
  const originalResults = (await db.query("SELECT to_jsonb(r) row FROM results r")).rows;

  for (const statements of fixture.setup) await query(statements);
  for (const statements of fixture.retention) assert.equal((await query(statements)).at(-1).length, 1);
  for (const statements of fixture.retention) await query(statements); // replay is a no-op
  assert.deepEqual((await db.query("SELECT count(*)::int captures,sum(row_count)::int observations FROM result_archive_source_captures")).rows[0], { captures: 1, observations: 3 });
  const captures = (await db.query("SELECT id,md5((to_jsonb(c)-'last_seen_at')::text) integrity_hash FROM result_archive_source_captures c")).rows;
  const hashes = new Map(captures.map((c) => [Number(c.id), c.integrity_hash]));
  fixture.guard[4][1][1] = originalFingerprint;
  const caps = JSON.parse(fixture.guard.at(-1)[1][0]);
  for (const cap of caps) cap.integrity_hash = hashes.get(Number(cap.id));
  fixture.guard.at(-1)[1][0] = JSON.stringify(caps);
  const args = (rows) => [JSON.stringify(rows), fixture.batch, fixture.planHash, fixture.instruction];
  const newBatch = () => [...fixture.guard, [fixture.insertNew, args(fixture.new)],
    ["INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM (" + fixture.verifyNew + ") verified", [JSON.stringify(fixture.new)]],
    [fixture.verifyNew, [JSON.stringify(fixture.new)]]];
  const linkedBatch = (rows = fixture.linked) => [...fixture.guard, [fixture.linkEvidence, args(rows)], [fixture.verifyLinked, args(rows)]];

  const first = await query(newBatch());
  assert.deepEqual(first.at(-3)[0], { created: 2, histories: 2, audits: 2 });
  assert.equal(first.at(-1).length, 2);
  assert.deepEqual((await query(newBatch())).at(-3)[0], { created: 0, histories: 0, audits: 0 }, "Replay must insert nothing");
  assert.equal((await query(linkedBatch())).at(-2)[0].linked, 1);
  assert.equal((await query(linkedBatch())).at(-2)[0].linked, 0);
  const wrong = structuredClone(fixture.linked); wrong[0].captureIds = [999];
  await assert.rejects(() => query(linkedBatch(wrong)), /check constraint/);

  const created = (await db.query("SELECT a.nation,a.profile_visibility,a.date_of_birth,a.profile_details,h.provider,h.performances FROM athletes a JOIN athlete_source_histories h ON h.athlete_id=a.id ORDER BY a.id")).rows;
  const runner = created.find((r) => r.nation === "NGA");
  assert.ok(runner, "Source-reported nationality is stored");
  assert.equal(runner.provider, "TCS London Marathon results");
  assert.equal(runner.date_of_birth, null);
  assert.equal(runner.profile_details.sourceNationalityObservation.value, "NGA");
  assert.equal(runner.performances[0].verificationStatus, "source_verified");
  assert.deepEqual(runner.performances[0].timing, { basis: "chip", chip: "03:40:00" });
  assert.deepEqual(runner.performances[0].places, { overall: 1, gender: 1, category: 1 });
  const wheel = created.find((r) => r.nation === null);
  assert.equal(wheel.performances[0].discipline, "Marathon (wheelchair)");

  assert.equal(await fp(), originalFingerprint, "Existing screened data is unchanged");
  assert.deepEqual((await db.query("SELECT to_jsonb(a) row FROM athletes a WHERE id=7")).rows, originalAthlete);
  assert.deepEqual((await db.query("SELECT to_jsonb(r) row FROM results r")).rows, originalResults);
  console.log("London official-results apply verified: private capture, profile creation with source nationality, replay idempotence, evidence-only reuse and existing data preserved (synthetic in-memory data only).");
} finally {
  await db.close();
}
