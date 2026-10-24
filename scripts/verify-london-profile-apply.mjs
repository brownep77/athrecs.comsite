/** Synthetic, in-memory verification of the exact Python applier SQL.
 * No source collections, credentials, remote requests or persistent databases.
 * Run: node scripts/verify-london-profile-apply.mjs
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = fileURLToPath(new URL("../", import.meta.url));
const fixture = JSON.parse(execFileSync("python3", ["-c", String.raw`
import collections, contextlib, copy, io, json, pathlib, stat, tempfile, threading, types
import importlib.util
root=pathlib.Path.cwd()
def load(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);return mod
a=load('synthetic_apply',root/'scripts/apply-london-profiles.py')
s=load('synthetic_snapshot',root/'scripts/snapshot-london-profiles.py')
f=load('synthetic_source',root/'scripts/verify-london-profile-plan.py')
existing=f.pace(2,'North, Cedar (GBR)','04:01:00','M')
edition={**f.EDITION,'id':71613035,'equivalentIds':[109240293,109241811]}
snapshot={'athletes':[{'id':7,'displayName':'Cedar North','aliases':[],'gender':'M','visibility':'private'}],
 'results':[{'id':77,'athleteId':7,'editionId':71613035,'finishSeconds':existing['finishSeconds'],
 'sourceUrls':[existing['sourceUrl']],'sourceKind':'canonical','gender':'M'}],
 'accounts':[{'id':'owner','names':['Cedar North'],'linkedAthleteIds':[7]}]}
plan=a.planner.build_plan([f.pace(),f.guide(),existing,f.guide(3,'Lionel WEST','05:12:00','Male','3')],snapshot,edition,a.BATCH,f.CREATED)
assert [plan['summary'][key] for key in ('new','linked','held')]==[1,1,1]
original=a.encoded(plan)
chosen,selected=a.select_groups(plan,True,1)
assert collections.Counter(g['disposition'] for g in chosen)=={'new':1,'linked':1}
assert len(selected)==4
many={'groups':[{'disposition':kind,'observationKeys':[kind+str(i)]} for kind,n in [('new',9),('linked',120),('held',70)] for i in range(n)]}
groups,keys=a.select_groups(many,True,3)
assert collections.Counter(g['disposition'] for g in groups)=={'new':3,'linked':100}
assert len(keys)==153
assert a.select_groups(many,False,0)[1] is None
with tempfile.TemporaryDirectory() as d:
    private=pathlib.Path(d);receipt=private/'receipt.json'
    a.dump(receipt,{'synthetic':'Marlow — test'})
    assert stat.S_IMODE(receipt.stat().st_mode)==0o600
    a.dump(receipt,{'synthetic':'replacement'})
    assert a.read_json(receipt)=={'synthetic':'replacement'}
    assert not list(private.glob('*.writing'))
    args=types.SimpleNamespace(connection=private/'connection.json',plan=private/'plan.json',snapshot=private/'snapshot',receipt=receipt,rehearsal_receipt=None)
    a.validate_private_paths(args)
    args.receipt=root/'unsafe-private-receipt.json'
    try:a.validate_private_paths(args);raise AssertionError('Repository receipt was accepted')
    except ValueError:pass
parts=list(a.capture_parts(plan,selected));setup=[];retention=[]
reordered={**plan,'observations':list(reversed(plan['observations']))}
assert parts==list(a.capture_parts(reordered,selected))
for part in parts:
    group_ids=[r['importDecision']['groupId'] for r in part['payload']['rows']]
    assert group_ids==sorted(group_ids)
a.setup(lambda q:setup.append(q),plan,parts)
def retain(q):
    retention.append(q);part=parts[len(retention)-1]
    return [[] for _ in q[:-1]]+[[{'id':len(retention),'payload_hash':part['payloadHash'],'html_sha256':part['rawSha256'],
      'row_count':part['rowCount'],'source_check':'compared','integrity_hash':'PENDING'}]]
strict_receipt={'planHash':a.digest(plan)}
with contextlib.redirect_stdout(io.StringIO()):
    evidence=a.retain_captures(retain,parts,strict_receipt,lambda:None,workers=1)
assert [c['source_key'] for c in strict_receipt['captures']]==[p['sourceKey'] for p in parts]
assert all(set(c)=={'id','provider','source_key','approval_id','payload_hash','html_sha256','row_count','source_check','integrity_hash'} for c in strict_receipt['captures'])

# Exercise concurrent completion and failure without a database or timing sleeps.
control_parts=[]
for i in range(6):
    part=copy.deepcopy(parts[0]);part['sourceKey']='synthetic-control-'+str(i)
    part['observationKeys']=['synthetic-observation-'+str(i)+'-'+str(j) for j in range(part['rowCount'])]
    control_parts.append(part)
def response(i,statements,valid=True):
    part=control_parts[i]
    return [[] for _ in statements[:-1]]+[[{'id':str(101+i),'payload_hash':part['payloadHash'],
      'html_sha256':part['rawSha256'] if valid else 'invalid','row_count':part['rowCount'],
      'source_check':'compared','integrity_hash':'a'*32}]]
main_thread=threading.get_ident();mutex=threading.Lock();barrier=threading.Barrier(4,timeout=5)
gates=[threading.Event() for _ in range(4)];gates[3].set()
active=0;peak=0;finished=[];saves=[]
def unordered_query(statements):
    global active,peak
    i=int(statements[-1][1][1].rsplit('-',1)[1])
    with mutex:active+=1;peak=max(peak,active)
    if i<4:
        barrier.wait();assert gates[i].wait(5)
    with mutex:finished.append(i);active-=1
    if 0<i<4:gates[i-1].set()
    return response(i,statements)
parallel_receipt={'planHash':a.digest(plan)}
def ordered_save():
    assert threading.get_ident()==main_thread
    keys=[c['source_key'] for c in parallel_receipt['captures']]
    assert keys==[p['sourceKey'] for p in control_parts[:len(keys)]]
    saves.append(len(keys))
with contextlib.redirect_stdout(io.StringIO()):
    parallel_evidence=a.retain_captures(unordered_query,control_parts,parallel_receipt,ordered_save)
assert peak==4 and active==0 and finished[0]==3
assert saves==[1,2,3,4,5,6] and parallel_receipt['captureWorkers']==4
assert [c['id'] for c in parallel_receipt['captures']]==[str(101+i) for i in range(6)]
assert all(parallel_evidence[key]['id']==str(101+i) for i,p in enumerate(control_parts) for key in p['observationKeys'])

barrier=threading.Barrier(4,timeout=5);release=threading.Event();started=[];finished=[];active=0
def failing_query(statements):
    global active
    i=int(statements[-1][1][1].rsplit('-',1)[1])
    with mutex:started.append(i);active+=1
    barrier.wait()
    if i!=0:assert release.wait(5)
    with mutex:finished.append(i);active-=1
    return response(i,statements,valid=i!=0)
failed_receipt={'planHash':a.digest(plan)};publication_reached=False
def save_failure():
    assert threading.get_ident()==main_thread
    release.set()
try:
    with contextlib.redirect_stdout(io.StringIO()):
        a.retain_captures(failing_query,control_parts,failed_receipt,save_failure)
    publication_reached=True
except ValueError as error:
    assert str(error)=='Retained capture differs from compared plan'
assert not publication_reached and active==0 and sorted(started)==[0,1,2,3] and sorted(finished)==[0,1,2,3]
assert failed_receipt['captures']==[] and failed_receipt['retainedCaptures']==0
for invalid_workers in (0,5):
    try:a.retain_captures(None,control_parts,{},lambda:None,workers=invalid_workers);raise AssertionError('Invalid worker count accepted')
    except ValueError:pass

new=[a.prepare_new(g,evidence,plan) for g in chosen if g['disposition']=='new']
linked=[{'groupId':g['groupId'],'athleteId':g['athleteId'],'resultIds':g['resultIds'],
 'existingMatches':g['existingMatches'],'sourceKeys':g['sourceKeys'],'sourceUrls':g['sourceUrls'],
 'captureIds':sorted({int(evidence[k]['id']) for k in g['observationKeys']})} for g in chosen if g['disposition']=='linked']
assert a.encoded(plan)==original
assert new[0]['history']['capturedAt']=='2026-09-01T18:31:57Z'
assert new[0]['history']['performances'][0]['timing']=={'basis':'unknown'}
assert new[0]['history']['performances'][0]['verificationStatus']=='unverified'
caps=list({c['id']:c for c in evidence.values()}.values())
guard=a.guard_statements(s.fingerprint_sql(),'PENDING',caps,s.FINGERPRINT_TABLES)
assert all(table in guard[2][0] for table in s.FINGERPRINT_TABLES)
print(json.dumps({'batch':a.BATCH,'instruction':a.INSTRUCTION,'planHash':a.digest(plan),
 'setup':setup,'retention':retention,'guard':guard,'new':new,'linked':linked,
 'insertNew':a.NEW_PROFILES,'verifyNew':a.VERIFY_NEW,'linkEvidence':a.LINK_EVIDENCE,
 'verifyLinked':a.VERIFY_LINKED,'fingerprint':s.fingerprint_sql(),'existingUrl':existing['sourceUrl']}))
`], { cwd: root, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 }));

const db = new PGlite();
const query = async (statements) => db.transaction(async (tx) => {
  const results = [];
  for (const [sql, params] of statements)
    results.push((await tx.query(sql, params)).rows);
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
    INSERT INTO athlete_private_profiles VALUES('owner','Cedar North','Synthetic private account','{}');
    INSERT INTO athlete_account_links VALUES(7,'owner','active');
    INSERT INTO athlete_public_shares VALUES('owner',false,false,false,false,false);
    INSERT INTO athlete_profile_history_choices VALUES('owner',7,'Synthetic existing','legacy','kept-private-hash',true);
    INSERT INTO source_history_claim_results VALUES(701,7,'Synthetic existing','legacy','kept-private-source-key');
    INSERT INTO athlete_profile_hidden_source_results VALUES('owner',701);
    INSERT INTO events VALUES(71,'London Marathon','london-marathon');
    INSERT INTO editions VALUES(71613035,71,'2025-04-27','marathon',42.195);
  `);
  for (const file of ["0035_athlete_source_histories.sql", "0036_source_history_publication.sql",
    "0030_athlete_identifiers.sql", "20261009_private_source_captures.sql"])
    await db.exec(readFileSync(new URL(`../migrations/${file}`, import.meta.url), "utf8"));
  await db.query(`INSERT INTO results VALUES(77,7,71613035,'finished',14460,14460,14466,'synthetic-bib',null,null,null,'18-39',$1,'Synthetic existing','private','{"verified":true}')`, [fixture.existingUrl]);
  await db.query(`INSERT INTO result_source_references VALUES(77,$1,'Synthetic existing')`, [fixture.existingUrl]);
  await db.exec(`INSERT INTO athlete_source_histories VALUES(7,'Synthetic existing','legacy','https://example.test/retained-history',
    '2025-04-28',false,ARRAY[2025],ARRAY[2025],
    '[{"year":2025,"date":"2025-04-27","meeting":"London Marathon","performance":"04:01:00","profileExcluded":true,"verificationStatus":"source_verified"}]',null)`);
  // Other same-provider histories must not make each verification scan the
  // entire provider population and then loop through its JSON input again.
  await db.exec(`INSERT INTO athlete_source_histories
    SELECT 7,'Pace Notes','synthetic-unrelated-'||n,'https://example.test/unrelated-history',
    '2024-01-01',false,ARRAY[2024],ARRAY[2024],'[]'::jsonb,null FROM generate_series(1,2000) n;
    ANALYZE athlete_source_histories;`);
  const originalFingerprint = await fp();
  const unchangedTables = ["results", "result_source_references", "athlete_account_links", "athlete_public_shares",
    "athlete_private_profiles", "athlete_profile_history_choices", "athlete_profile_hidden_source_results", "source_history_claim_results"];
  const originals = {};
  for (const table of unchangedTables) originals[table] = (await db.query(`SELECT to_jsonb(t) row FROM ${table} t`)).rows;
  const originalAthlete = (await db.query("SELECT to_jsonb(a) row FROM athletes a WHERE id=7")).rows;
  const originalHistory = (await db.query("SELECT to_jsonb(h) row FROM athlete_source_histories h WHERE athlete_id=7")).rows;

  for (const statements of fixture.setup) await query(statements);
  for (const statements of fixture.retention) {
    const result = await query(statements);
    assert.equal(result.at(-1).length, 1, "The exact retained payload, bytes and timestamp must match");
  }
  for (const statements of fixture.retention) await query(statements);
  assert.deepEqual((await db.query("SELECT count(*)::int captures,sum(row_count)::int observations FROM result_archive_source_captures")).rows[0], { captures: 2, observations: 4 });
  const captures = (await db.query("SELECT id,md5((to_jsonb(c)-'last_seen_at')::text) integrity_hash FROM result_archive_source_captures c")).rows;
  const hashes = new Map(captures.map((c) => [Number(c.id), c.integrity_hash]));
  fixture.guard[4][1][1] = originalFingerprint;
  const caps = JSON.parse(fixture.guard.at(-1)[1][0]);
  for (const cap of caps) cap.integrity_hash = hashes.get(Number(cap.id));
  fixture.guard.at(-1)[1][0] = JSON.stringify(caps);
  const args = (rows) => [JSON.stringify(rows), fixture.batch, fixture.planHash, fixture.instruction];
  const newBatch = () => [...fixture.guard,
    [fixture.insertNew, args(fixture.new)],
    ["INSERT INTO london_import_guard SELECT count(*)=jsonb_array_length($1::jsonb) FROM (" + fixture.verifyNew + ") verified", [JSON.stringify(fixture.new)]],
    [fixture.verifyNew, [JSON.stringify(fixture.new)]]];
  const linkedBatch = (rows = fixture.linked) => [...fixture.guard,
    [fixture.linkEvidence, args(rows)], [fixture.verifyLinked, args(rows)]];

  // Stored metadata hashes alone must not allow altered retained evidence.
  const cap = caps[0];
  const savedPayload = (await db.query("SELECT payload FROM result_archive_source_captures WHERE id=$1", [cap.id])).rows[0].payload;
  await db.query("UPDATE result_archive_source_captures SET payload=payload||'{\"changed\":true}'::jsonb WHERE id=$1", [cap.id]);
  await assert.rejects(() => query(newBatch()), /check constraint/);
  assert.equal((await db.query("SELECT count(*)::int n FROM athletes")).rows[0].n, 1);
  await db.query("UPDATE result_archive_source_captures SET payload=$2::jsonb,last_seen_at=now() WHERE id=$1", [cap.id, JSON.stringify(savedPayload)]);
  assert.equal((await query(fixture.retention[0])).at(-1).length, 1);

  const first = await query(newBatch());
  assert.deepEqual(first.at(-3)[0], { created: 1, histories: 1, audits: 1 });
  assert.equal(first.at(-1).length, 1);
  assert.ok(first.at(-1)[0].athlete_number, "Creation must retain the normal identifier trigger");
  const verificationPlan = (await db.query("EXPLAIN (FORMAT JSON) " + fixture.verifyNew, [JSON.stringify(fixture.new)])).rows[0]["QUERY PLAN"][0].Plan;
  const nodes = [];
  const visit = (node) => { nodes.push(node); for (const child of node.Plans ?? []) visit(child); };
  visit(verificationPlan);
  assert.ok(nodes.some((node) => node["Relation Name"] === "athlete_source_histories" &&
    node["Index Name"] === "athlete_source_histories_provider_external_id_key" &&
    /external_id/.test(node["Index Cond"] ?? "")), "Verification must use the exact external-ID index lookup with a larger same-provider population");
  assert.deepEqual((await query(newBatch())).at(-3)[0], { created: 0, histories: 0, audits: 0 });
  assert.equal((await query(linkedBatch())).at(-2)[0].linked, 1);
  assert.equal((await query(linkedBatch())).at(-2)[0].linked, 0);

  const wrongLink = structuredClone(fixture.linked);
  wrongLink[0].captureIds = [999999];
  await assert.rejects(() => query(linkedBatch(wrongLink)), /check constraint/);
  assert.equal((await db.query("SELECT count(*)::int n FROM network_audit_log")).rows[0].n, 2);

  const newId = first.at(-1)[0].id;
  const capturedAt = fixture.new[0].history.capturedAt;
  await db.query("UPDATE athlete_source_histories SET captured_at='2026-10-24' WHERE athlete_id=$1", [newId]);
  await assert.rejects(() => query(newBatch()), /check constraint/);
  await db.query("UPDATE athlete_source_histories SET captured_at=$2::timestamptz WHERE athlete_id=$1", [newId, capturedAt]);
  await db.exec("UPDATE athlete_profile_history_choices SET excluded=false");
  await assert.rejects(() => query(linkedBatch()), /check constraint/);
  await db.exec("UPDATE athlete_profile_history_choices SET excluded=true");
  await db.exec("UPDATE result_archive_capture_approvals SET revoked_at=now()");
  await assert.rejects(() => query(newBatch()), /check constraint/);
  await db.exec("UPDATE result_archive_capture_approvals SET revoked_at=null");

  assert.equal(await fp(), originalFingerprint);
  assert.deepEqual((await db.query("SELECT to_jsonb(a) row FROM athletes a WHERE id=7")).rows, originalAthlete);
  assert.deepEqual((await db.query("SELECT to_jsonb(h) row FROM athlete_source_histories h WHERE athlete_id=7")).rows, originalHistory);
  for (const table of unchangedTables)
    assert.deepEqual((await db.query(`SELECT to_jsonb(t) row FROM ${table} t`)).rows, originals[table], `${table} must be unchanged`);
  const history = (await db.query("SELECT captured_at,performances FROM athlete_source_histories WHERE athlete_id=$1", [newId])).rows[0];
  assert.equal(new Date(history.captured_at).toISOString(), "2026-09-01T18:31:57.000Z");
  assert.equal(history.performances[0].verificationStatus, "unverified");
  assert.deepEqual(history.performances[0].timing, { basis: "unknown" });
  assert.deepEqual(history.performances[0].places, { overall: null, gender: null, category: null });
  assert.equal((await db.query("SELECT count(*)::int n FROM results")).rows[0].n, 1);
  console.log("London profile apply verified: private captures, creation/replay, evidence-only reuse, complete lock scope, rollback, capture dates, integrity and existing privacy preserved (synthetic in-memory data only).");
} finally {
  await db.close();
}
