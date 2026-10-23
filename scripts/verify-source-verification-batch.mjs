import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  applySourceVerificationPlan,
  sourceVerificationPlanHash,
  validateSourceVerificationPlan,
} from "./lib/source-verification-batch.mjs";

const db = new PGlite();
const statements = [];
const adapter = (client) => ({
  query: async (text, values = []) => {
    statements.push(text);
    return (await client.query(text, values)).rows;
  },
  transaction: (work) => client.transaction((tx) => work(adapter(tx))),
});
const sql = adapter(db),
  clone = (value) => structuredClone(value);
const first = {
  meeting: "Synthetic organiser race",
  date: "2020-01-01",
  discipline: "5K",
  performance: "20:00",
  place: "10",
  verificationStatus: "unverified",
  archiveReference: { sourceRow: "bib:42" },
  sourceUrls: ["https://example.test/results"],
  labels: [],
};
const second = {
  ...first,
  performance: "21:00",
  place: "15",
  archiveReference: { sourceRow: "bib:43" },
};
const third = {
  ...first,
  performance: "22:00",
  place: "20",
  archiveReference: { sourceRow: "bib:44" },
};
const evidence = {
  sourceUrl: "https://example.test/results",
  sourceKind: "official_timer",
  authorityEvidence: "The organiser's official results page links directly to this timing report.",
  locator: "Bib 42, timing report row 10",
  captureKind: "retained_capture",
  capturedAt: "2020-01-02T10:00:00Z",
  checkedAt: "2020-01-03T10:00:00Z",
  captureReference: "synthetic-capture:original-report",
  captureGuard: {
    id: "1",
    provider: "Synthetic Timer",
    sourceKey: "synthetic-race",
    payloadHash: "a".repeat(64),
    sourceSha256: "b".repeat(64),
  },
  identityEvidence:
    "The source athlete identifier, full name, club and bib match this source profile.",
  sourceChecked: true,
  fieldsCompared: {
    athleteIdentity: true,
    race: true,
    editionDate: true,
    distance: true,
    finishStatus: true,
    timing: true,
    placings: true,
  },
  sourceRow: { Bib: "42", Name: "Synthetic Athlete", Time: "20:00", Position: "10" },
  note: "Every supplied field was compared with the retained original report; no timing basis inferred.",
};
const historyTarget = {
  kind: "history",
  athleteId: 1,
  provider: "Run Norwich official results",
  externalId: "synthetic-2020",
};
const plan = {
  schemaVersion: 1,
  batchId: "synthetic-source-verification",
  reviewedAt: "2020-01-03T11:00:00Z",
  actor: {
    kind: "automation",
    name: "Synthetic test automation",
    purpose: "Exercise source verification transaction safety.",
  },
  entries: [],
};
try {
  await db.exec(`
    create table "user"(id text primary key);
    insert into "user" values('owner'),('other');
    create table athletes(id integer primary key, profile_visibility text,display_name text,gender text,parent_athlete_id integer,source_url text,profile_details jsonb);
    insert into athletes values(1,'private','Synthetic Athlete','F',null,'https://example.test/profile','{}'),(2,'public','Another Synthetic Athlete','M',null,'https://example.test/other','{}');
    create table athlete_account_links(athlete_id integer,user_id text,status text,primary key(athlete_id,user_id));
    create table editions(id integer primary key,event_date date);
    insert into editions values(10,'2020-01-01');
    create table results(id integer primary key,athlete_id integer,edition_id integer,
      status text,finish_time_seconds integer,result_source text,source_url text,
      result_visibility text,result_details jsonb);
    insert into results values(1,1,10,'finished',1200,'Synthetic Timer','https://example.test/results','private','{"verificationStatus":"unverified","profileExcluded":true}');
    insert into results values(2,2,10,'finished',1300,'Synthetic Timer','https://example.test/results','public','{}');
    create table athlete_source_histories(athlete_id integer,provider text,external_id text,source_url text,performances jsonb,published_at timestamptz,unique(athlete_id,provider,external_id));
    create table athlete_profile_history_choices(user_id text,athlete_id integer,provider text,external_id text,performance_hash text,excluded boolean,confirmed_at timestamptz default now(),primary key(user_id,athlete_id,provider,external_id,performance_hash));
    create table source_history_claim_results(id serial primary key,athlete_id integer,provider text,external_id text,source_key text,source_url text,performance jsonb,available boolean,updated_at timestamptz default now(),unique(provider,external_id,source_key));
    create table athlete_result_verification_requests(id text primary key,athlete_id integer,result_key text,status text,revision integer,staff_evidence jsonb,member_message text,reviewed_by text,reviewed_at timestamptz,updated_at timestamptz);
    create table network_audit_log(id serial primary key,actor_user_id text references "user",action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb,note text,created_at timestamptz default now());
    create table result_archive_identity_clock(singleton boolean primary key,version bigint);
    insert into result_archive_identity_clock values(true,1);
    create table result_archive_capture_approvals(id text primary key,provider text,scope text,revoked_at timestamptz);
    insert into result_archive_capture_approvals values('synthetic','Synthetic Timer','staff_only',null);
    create table result_archive_source_captures(id bigint primary key,approval_id text,provider text,source_key text,payload_hash text,html_sha256 text,source_check text,captured_at timestamptz);
    insert into result_archive_source_captures values(1,'synthetic','Synthetic Timer','synthetic-race',repeat('a',64),repeat('b',64),'compared','2020-01-02T10:00:00Z');
  `);
  const archiveMigration = await readFile(
    new URL("../migrations/20261009_results_archive_foundation.sql", import.meta.url),
    "utf8",
  );
  await db.exec(
    archiveMigration.slice(
      archiveMigration.indexOf("create table result_change_history"),
      archiveMigration.indexOf("comment on table result_archive_entries"),
    ),
  );
  const claimMigration = await readFile(
    new URL("../migrations/20261011_source_history_claims.sql", import.meta.url),
    "utf8",
  );
  await db.exec(
    claimMigration.slice(
      claimMigration.indexOf("create function sync_run_norwich_claim_results"),
      claimMigration.indexOf("-- The same authenticated claim API"),
    ),
  );
  await sql.query(
    "insert into athlete_source_histories values(1,$1,$2,'https://example.test/results',$3::jsonb,now())",
    [historyTarget.provider, historyTarget.externalId, JSON.stringify([first, second, third])],
  );
  await sql.query(
    "update source_history_claim_results set available=false where source_key='bib:42'",
  );
  for (const [user, excluded] of [
    ["owner", true],
    ["other", false],
  ])
    await sql.query(
      "insert into athlete_profile_history_choices values($1,1,$2,$3,md5($4::jsonb::text),$5,'2020-01-01')",
      [user, historyTarget.provider, historyTarget.externalId, JSON.stringify(first), excluded],
    );
  const [canonical] = await sql.query("select to_jsonb(r) as value from results r where id=1");
  plan.entries = [
    { target: { kind: "result", resultId: 1, athleteId: 1 }, before: canonical.value, evidence },
    {
      target: historyTarget,
      before: [first, second, third],
      reviews: [
        { index: 0, evidence },
        {
          index: 2,
          evidence: {
            ...evidence,
            locator: "Bib 44, timing report row 20",
            sourceRow: { Bib: "44", Time: "22:00", Position: "20" },
          },
        },
      ],
    },
  ];
  const [mirror] = await sql.query(
    "select id from source_history_claim_results where source_key='bib:42'",
  );
  await sql.query(
    "insert into athlete_result_verification_requests(id,athlete_id,result_key,status,revision) values('canonical',1,'r:1','pending',1),('source',1,$1,'needs_info',2),('unrelated',2,'r:2','pending',1)",
    [`r:${-mirror.id}`],
  );

  const state = async () => {
    const names = [
      "results",
      "athletes",
      "athlete_account_links",
      "athlete_source_histories",
      "athlete_profile_history_choices",
      "source_history_claim_results",
      "athlete_result_verification_requests",
      "network_audit_log",
      "result_change_history",
    ];
    const result = {};
    for (const name of names)
      result[name] = await sql.query(
        `select to_jsonb(t) as value from ${name} t order by to_jsonb(t)::text`,
      );
    return result;
  };
  const initial = await state();
  const dry = await applySourceVerificationPlan(sql, plan);
  assert.equal(dry.applied, false);
  assert.equal(dry.dryRun, true);
  assert.equal(dry.recordCount, 3);
  assert.equal(dry.historyPerformanceCount, 2);
  assert.equal(dry.canonicalResultCount, 1);
  assert.equal(
    dry.excludedCanonicalResultCount,
    1,
    "Excluded canonical mirrors are counted separately, not as independent displayed performances.",
  );
  assert.deepEqual(
    await state(),
    initial,
    "Dry-run rolls back data, requests, choices, audits and actual source triggers.",
  );
  for (const details of [
    { sourceIdentityReview: { status: "held" } },
    { sourceQualificationReview: { reason: "Missing independent identity evidence" } },
    { conflicts: ["Different source athlete"] },
  ]) {
    await sql.query("update athletes set profile_details=$1::jsonb where id=1", [
      JSON.stringify(details),
    ]);
    await assert.rejects(
      () => applySourceVerificationPlan(sql, plan, { dryRun: false }),
      /source identity/,
    );
    await sql.query("update athletes set profile_details='{}' where id=1");
  }
  const guard = {
    displayName: "Synthetic Athlete",
    gender: "F",
    parentAthleteId: null,
    sourceUrl: "https://example.test/profile",
    profileDetails: {},
    activeAccountLinks: [],
  };
  const guarded = {
    ...plan,
    entries: plan.entries.map((entry) => ({ ...entry, profileGuard: guard })),
  };
  assert.equal((await applySourceVerificationPlan(sql, guarded)).dryRun, true);
  for (const statement of [
    "update athletes set display_name='Changed Identity' where id=1",
    "update athletes set parent_athlete_id=2 where id=1",
    "insert into athlete_account_links values(1,'exact-text-user-id','active')",
  ]) {
    await sql.query(statement);
    await assert.rejects(
      () => applySourceVerificationPlan(sql, guarded, { dryRun: false }),
      /identity\/profile or active account links/,
    );
    await sql.query(
      "update athletes set display_name='Synthetic Athlete',parent_athlete_id=null where id=1",
    );
    await sql.query("delete from athlete_account_links where athlete_id=1");
  }
  assert.deepEqual(
    await state(),
    initial,
    "Current profile holds and reviewed identity/link changes prevent all mutations.",
  );
  await sql.query(
    "insert into athlete_account_links values(1,'0007','active'),(1,'revoked-owner','revoked')",
  );
  const exactLinkGuarded = clone(guarded);
  for (const entry of exactLinkGuarded.entries)
    entry.profileGuard.activeAccountLinks = [{ user_id: "0007", status: "active" }];
  assert.equal(
    (await applySourceVerificationPlan(sql, exactLinkGuarded)).dryRun,
    true,
    "An exact text user ID is preserved, and revoked links are not counted as active.",
  );
  await sql.query("update athlete_account_links set status='active' where user_id='revoked-owner'");
  await assert.rejects(
    () => applySourceVerificationPlan(sql, exactLinkGuarded),
    /identity\/profile or active account links/,
  );
  await sql.query("delete from athlete_account_links where athlete_id=1");
  assert.deepEqual(await state(), initial);

  const stale = clone(plan);
  stale.entries[1].before[1].performance = "21:01";
  await assert.rejects(() => applySourceVerificationPlan(sql, stale, { dryRun: false }), /Stale/);
  assert.deepEqual(
    await state(),
    initial,
    "A change to even an untargeted history row invalidates the entire plan.",
  );
  const wrongAthlete = clone(plan);
  wrongAthlete.entries[1].target.athleteId = 2;
  await assert.rejects(
    () => applySourceVerificationPlan(sql, wrongAthlete, { dryRun: false }),
    /Stale/,
  );
  assert.deepEqual(await state(), initial);
  const wrongCapture = clone(plan);
  wrongCapture.entries[0].evidence.captureGuard.payloadHash = "c".repeat(64);
  await assert.rejects(
    () => applySourceVerificationPlan(sql, wrongCapture, { dryRun: false }),
    /Retained capture/,
  );
  assert.deepEqual(await state(), initial);
  // PostgreSQL stores microseconds. A JS Date silently truncates the last three
  // digits, so exact text is required when the retained capture has that precision.
  const microsecondCapture = "2020-01-02T10:00:00.123456Z";
  await sql.query(
    "update result_archive_source_captures set captured_at=$1::timestamptz where id=1",
    [microsecondCapture],
  );
  const exactCapturePlan = clone(plan);
  for (const entry of exactCapturePlan.entries) {
    const reviews = entry.target.kind === "result" ? [entry] : entry.reviews;
    for (const review of reviews) review.evidence.capturedAt = microsecondCapture;
  }
  assert.equal((await applySourceVerificationPlan(sql, exactCapturePlan)).dryRun, true);
  const roundedCapturePlan = clone(exactCapturePlan);
  roundedCapturePlan.entries[0].evidence.capturedAt = new Date(microsecondCapture).toISOString();
  await assert.rejects(
    () => applySourceVerificationPlan(sql, roundedCapturePlan, { dryRun: false }),
    /Retained capture/,
  );
  await sql.query(
    "update result_archive_source_captures set captured_at=$1::timestamptz where id=1",
    [evidence.capturedAt],
  );
  assert.deepEqual(
    await state(),
    initial,
    "An imprecise retained-capture timestamp cannot commit any result changes.",
  );
  await sql.query("update result_archive_capture_approvals set revoked_at=now()");
  await assert.rejects(
    () => applySourceVerificationPlan(sql, plan, { dryRun: false }),
    /Retained capture/,
  );
  await sql.query("update result_archive_capture_approvals set revoked_at=null");
  await sql.query(
    "insert into result_archive_source_captures select 2,approval_id,provider,source_key,payload_hash,html_sha256,'held','2020-01-02T11:00:00Z' from result_archive_source_captures where id=1",
  );
  await assert.rejects(
    () => applySourceVerificationPlan(sql, plan, { dryRun: false }),
    /Retained capture/,
  );
  await sql.query("delete from result_archive_source_captures where id=2");
  assert.deepEqual(
    await state(),
    initial,
    "A newer held capture also blocks verification against an obsolete capture.",
  );
  for (const mutate of [
    (p) => {
      p.entries[0].evidence.sourceChecked = false;
    },
    (p) => {
      p.entries[0].evidence.fieldsCompared.placings = false;
    },
    (p) => {
      delete p.entries[0].evidence.captureReference;
    },
    (p) => {
      p.entries[0].evidence.sourceRow = {};
    },
    (p) => {
      p.entries.push(clone(p.entries[0]));
    },
    (p) => {
      p.entries[1].reviews.push(clone(p.entries[1].reviews[0]));
    },
    (p) => {
      p.entries[1].before[0].syntheticTest = true;
    },
    (p) => {
      p.entries[1].before[0].notes = "Conflicting source details";
    },
    (p) => {
      p.entries[0].before.result_details.staffVerification = { decision: "Reopened by staff" };
    },
    (p) => {
      p.entries[1].before[0].sourceIdentityReview = { status: "held" };
    },
    (p) => {
      p.entries[1].before[0].sourceQualificationReview = { reason: "Unknown distance" };
    },
    (p) => {
      p.entries[1].before[0].sourceQualificationReview = { resolved: true, activeHold: true };
    },
    (p) => {
      p.entries[1].before[0].conflicting = true;
    },
    (p) => {
      p.entries[1].before[0].holdReasons = ["Unresolved source mark"];
    },
    (p) => {
      p.entries[1].before[0].sourceStatus = "DNF";
    },
    (p) => {
      p.entries[0].before.status = "DQ";
    },
    (p) => {
      p.entries[1].before[0].date = "2099-01-01";
    },
    (p) => {
      p.entries[1].before[0].year = 2099;
    },
    (p) => {
      delete p.entries[0].evidence.captureGuard;
      p.entries[0].evidence.captureReference = "db-capture:1";
    },
  ]) {
    const invalid = clone(plan);
    mutate(invalid);
    assert.throws(() => validateSourceVerificationPlan(invalid));
  }
  await sql.query("update editions set event_date='2099-01-01' where id=10");
  await assert.rejects(
    () => applySourceVerificationPlan(sql, plan, { dryRun: false }),
    /Future result/,
  );
  await sql.query("update editions set event_date='2020-01-01' where id=10");
  assert.deepEqual(
    await state(),
    initial,
    "Future canonical editions also stop and roll back history changes.",
  );
  await sql.query(
    "update athlete_result_verification_requests set status='rejected',staff_evidence='{" +
      '"note":"Identity rejected by staff"' +
      "}' where id='source'",
  );
  const rejectedState = await state();
  await assert.rejects(() => applySourceVerificationPlan(sql, plan, { dryRun: false }), /Rejected/);
  assert.deepEqual(
    await state(),
    rejectedState,
    "An existing rejected decision cannot be overwritten by an automatic source check.",
  );
  await sql.query(
    "update athlete_result_verification_requests set status='needs_info',staff_evidence=null where id='source'",
  );

  const receipt = await applySourceVerificationPlan(sql, plan, { dryRun: false });
  assert.equal(receipt.applied, true);
  assert.equal(receipt.requestCount, 2);
  assert.equal(receipt.mirrorCount, 2);
  const [afterHistory] = await sql.query(
    "select performances,published_at from athlete_source_histories",
  );
  assert.deepEqual(
    afterHistory.performances.map((p) => p.performance),
    ["20:00", "21:00", "22:00"],
    "Original marks and order survive.",
  );
  assert.deepEqual(afterHistory.performances[1], second, "Untargeted history rows are unchanged.");
  for (const index of [0, 2]) {
    assert.equal(afterHistory.performances[index].verificationStatus, "source_verified");
    assert.deepEqual(
      {
        ...afterHistory.performances[index],
        verificationStatus: "unverified",
        staffVerification: undefined,
      },
      { ...plan.entries[1].before[index], staffVerification: undefined },
    );
  }
  const [afterResult] = await sql.query("select to_jsonb(r) as value from results r where id=1");
  assert.deepEqual(
    { ...afterResult.value, result_details: canonical.value.result_details },
    canonical.value,
  );
  assert.equal(afterResult.value.result_details.profileExcluded, true);
  const choices = await sql.query(
    "select user_id,excluded,confirmed_at::text as confirmed_at from athlete_profile_history_choices where performance_hash=md5($1::jsonb::text) order by user_id",
    [JSON.stringify(afterHistory.performances[0])],
  );
  assert.deepEqual(
    choices.map((r) => [r.user_id, r.excluded]),
    [
      ["other", false],
      ["owner", true],
    ],
    "Both include and exclude choices follow the real PostgreSQL JSONB MD5.",
  );
  assert(choices.every((row) => row.confirmed_at.startsWith("2020-01-01")));
  const mirrors = await sql.query(
    "select source_key,performance,available from source_history_claim_results order by source_key",
  );
  assert.equal(
    mirrors[0].available,
    false,
    "Verification does not republish an unavailable claim after the source trigger recomputes it.",
  );
  assert.deepEqual(
    mirrors.map((r) => r.performance),
    afterHistory.performances,
  );
  const requests = await sql.query(
    "select id,status,reviewed_by,staff_evidence from athlete_result_verification_requests order by id",
  );
  assert.deepEqual(
    requests.map((r) => [r.id, r.status]),
    [
      ["canonical", "approved"],
      ["source", "approved"],
      ["unrelated", "pending"],
    ],
  );
  assert(
    requests.every((r) => r.reviewed_by === null),
    "Automation does not impersonate a human staff user.",
  );
  const changeLog = await sql.query("select * from result_change_history");
  assert.equal(changeLog.length, 1);
  assert.equal(changeLog[0].actor_id, "automation:Synthetic test automation");
  assert.match(changeLog[0].note, /synthetic-source-verification/);
  const audits = await sql.query("select * from network_audit_log");
  assert.equal(audits.length, 3);
  assert(audits.every((a) => a.actor_user_id === null));
  const appliedState = await state();
  const retry = await applySourceVerificationPlan(sql, plan, { dryRun: false });
  assert.equal(retry.alreadyApplied, true);
  assert.equal(retry.applied, false);
  assert.deepEqual(await state(), appliedState, "An identical retry makes no writes.");
  const altered = clone(plan);
  altered.entries[0].evidence.note += " Altered review.";
  await assert.rejects(
    () => applySourceVerificationPlan(sql, altered, { dryRun: false }),
    /different reviewed plan/,
  );
  assert.equal(
    sourceVerificationPlanHash(plan),
    sourceVerificationPlanHash(JSON.parse(JSON.stringify(plan))),
  );
  const manyRows = Array.from({ length: 100 }, (_, index) => ({
    ...first,
    archiveReference: { sourceRow: `synthetic:${index}` },
  }));
  await sql.query(
    "insert into athlete_source_histories values(2,'Synthetic Timer','many-unclaimed','https://example.test/results',$1::jsonb,now())",
    [JSON.stringify(manyRows)],
  );
  const noChoicesPlan = {
    ...plan,
    batchId: "synthetic-no-choice-performance",
    entries: [
      {
        target: {
          kind: "history",
          athleteId: 2,
          provider: "Synthetic Timer",
          externalId: "many-unclaimed",
        },
        before: manyRows,
        reviews: manyRows.map((row, index) => ({ index, evidence })),
      },
    ],
  };
  statements.length = 0;
  const manyReceipt = await applySourceVerificationPlan(sql, noChoicesPlan);
  assert.equal(manyReceipt.recordCount, 100);
  assert(
    statements.length < 25,
    "A hundred unclaimed rows must not make hundreds of empty database calls.",
  );
  assert.equal(
    statements.filter((text) => text.includes("athlete_result_verification_requests")).length,
    0,
  );
  assert.equal(
    statements.filter((text) => text.includes("athlete_profile_history_choices")).length,
    1,
  );
  await sql.query("update results set finish_time_seconds=1201 where id=1");
  await assert.rejects(
    () => applySourceVerificationPlan(sql, plan, { dryRun: false }),
    /changed since this batch/,
  );
  console.log(
    "PASS: atomic source verification, real trigger dry-run rollback, complete-history stale guards, evidence requirements, rejected/manual-decision protection, original fields/order/visibility, JSONB choice hashes, claim mirrors, inbox decisions, automation audit and idempotent retries.",
  );
} finally {
  await db.close();
}
