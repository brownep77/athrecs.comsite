import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import {
  staffProfileVerification,
  saveStaffProfileVerification,
  staffVerificationResults,
  saveStaffResultVerification,
} from "../src/lib/athrecs/staff-athlete-verification.server.ts";
import { withoutProfileEvidence } from "../src/lib/athrecs/profile-evidence.ts";
import { buildProfileAchievementSummary } from "../src/lib/athrecs/profile-achievement-summary.ts";
import { sourceHistorySports } from "../src/lib/athrecs/profile-history-results.ts";
import { buildCompetitionHonours } from "../src/lib/athrecs/competition-honours.ts";
const db = new PGlite();
const sqlFor = (c) => {
  const sql = async (parts, ...values) =>
    (
      await c.query(
        parts.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
        values,
      )
    ).rows;
  sql.query = async (query, params = []) => (await c.query(query, params)).rows;
  sql.transaction = (fn) => c.transaction((tx) => fn(sqlFor(tx)));
  return sql;
};
const sql = sqlFor(db),
  actor = { userId: "staff", staff: true };
try {
  await db.exec(`
 create table "user"(id text primary key,"emailVerified" boolean);
 insert into "user" values('staff',true),('member',true),('incomplete',false);
 create table athletes(id integer primary key,display_name text,gender text,date_of_birth date,club_id integer,country text,profile_details jsonb,profile_visibility text);
 insert into athletes values(1,'Unclaimed Example','Female','2000-01-01',null,'GB','{}','private'),(2,'Claimed Example','Male','1990-01-01',null,'CA','{}','public');
 create table athlete_identifiers(number bigint primary key,athlete_id integer,user_id text);
 insert into athlete_identifiers values(1001,1,null),(1002,2,null),(2001,null,'member'),(2002,null,'incomplete');
 create table athlete_account_links(athlete_id integer,user_id text,status text);
 insert into athlete_account_links values(2,'member','active');
 create table athlete_private_profiles(user_id text,full_name text,display_name text,date_of_birth date,nationality text,country text,club_or_team text,profile_details jsonb);
 insert into athlete_private_profiles values('member','Claimed Example','','1990-01-01','CA','CA','','{}'),('incomplete','New Example','',null,'','GB','','{}');
 create table events(id integer primary key,name text);
 insert into events values(1,'Example road race');
 create table editions(id integer primary key,event_id integer,event_date date,distance_code text);
 insert into editions values(1,1,'2020-01-01','5K');
 create table results(id integer primary key,athlete_id integer,edition_id integer,finish_time_seconds integer,status text,result_source text,source_url text,result_details jsonb,result_visibility text);
 insert into results values(1,1,1,1200,'finished','Private Timer','https://example.test/results','{"verificationStatus":"unverified"}','private'),(2,2,1,1250,'finished','Private Timer','https://example.test/results','{}','public');
 create table result_source_references(result_id integer,source_url text);
 create table athlete_source_histories(athlete_id integer,provider text,external_id text,source_url text,performances jsonb,published_at timestamptz);
 create table athlete_profile_history_choices(user_id text,athlete_id integer,provider text,external_id text,performance_hash text,excluded boolean,unique(user_id,athlete_id,provider,external_id,performance_hash));
 create table athlete_result_verification_requests(athlete_id integer,result_key text,status text,revision integer,staff_evidence jsonb,member_message text,reviewed_by text,reviewed_at timestamptz,updated_at timestamptz);
 insert into athlete_result_verification_requests values(1,'r:1','pending',1,null,'',null,null,null);
 create table network_audit_log(id serial primary key,actor_user_id text,action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb,note text,created_at timestamptz default now());
 `);
  const row = {
    date: "2020-01-02",
    year: 2020,
    sourceDate: "2 Jan",
    discipline: "5K",
    performance: "19:00",
    meeting: "Example second race",
    venue: "GB",
    country: "GB",
    ageGroup: "",
    place: "1",
    wind: "",
    labels: ["Road"],
    sourceUrls: ["https://private-source.test/results"],
    verificationStatus: "unverified",
  };
  await sql`insert into athlete_source_histories values(1,'Any Timing Provider','not-a-uuid','https://private-source.test',${JSON.stringify([row])}::jsonb,null)`;
  for (const number of ["1001", "2001", "2002"])
    assert.equal((await staffProfileVerification(sql, number, actor)).verified, false);
  await assert.rejects(
    () => staffProfileVerification(sql, "1001", { userId: "member", staff: false }),
    /Staff access/,
  );
  await assert.rejects(
    () => staffVerificationResults(sql, "1001", 0, { userId: "member", staff: false }),
    /Staff access/,
  );
  await assert.rejects(
    () => saveStaffProfileVerification(sql, {}, { userId: "member", staff: false }),
    /Staff access/,
  );
  await assert.rejects(
    () => saveStaffResultVerification(sql, {}, { userId: "member", staff: false }),
    /Staff access/,
  );
  await assert.rejects(
    () => staffProfileVerification(sql, "1001", { userId: "incomplete", staff: true }),
    /verified staff/,
  );
  const initial = await staffProfileVerification(sql, "1001", actor);
  const profileSave = {
    athleteNumber: "1001",
    expectedVersion: initial.version,
    verified: true,
    note: "Name and profile details checked against the supplied identity.",
  };
  await saveStaffProfileVerification(sql, profileSave, actor);
  assert.equal((await staffProfileVerification(sql, "1001", actor)).verified, true);
  assert.equal(
    (await sql`select result_details from results where id=1`)[0].result_details.verificationStatus,
    "unverified",
    "Profile review does not verify results",
  );
  await assert.rejects(() => saveStaffProfileVerification(sql, profileSave, actor), /changed/);
  await sql`update athletes set display_name='Updated Example' where id=1`;
  assert.equal((await staffProfileVerification(sql, "1001", actor)).stale, true);
  assert.equal((await staffProfileVerification(sql, "1001", actor)).verified, false);
  for (const number of ["2001", "2002"]) {
    const current = await staffProfileVerification(sql, number, actor);
    await saveStaffProfileVerification(
      sql,
      { ...profileSave, athleteNumber: number, expectedVersion: current.version },
      actor,
    );
    assert.equal((await staffProfileVerification(sql, number, actor)).verified, true);
  }
  const results = await staffVerificationResults(sql, "1001", 0, actor);
  assert.equal(results.length, 2);
  assert(
    results.some(
      (r) =>
        r.provider === "Any Timing Provider" &&
        r.urls.includes("https://private-source.test/results"),
    ),
  );
  assert(
    results.every((r) => !r.published),
    "Private results remain accessible to staff",
  );
  assert.equal(
    (await staffVerificationResults(sql, "2001", 0, actor)).length,
    1,
    "Claimed account resolves its linked results",
  );
  const evidence = {
    athleteNumber: "1001",
    verified: true,
    sourceUrl: "https://example.test/checked",
    locator: "Bib 42, row 3",
    identityEvidence: "Full name, club and bib match the result source.",
    sourceChecked: true,
    note: "Compared all source fields and athlete identity.",
  };
  for (const result of results) {
    const data = { ...evidence, target: result.target, expectedVersion: result.version };
    await assert.rejects(() =>
      saveStaffResultVerification(sql, { ...data, sourceChecked: false }, actor),
    );
    await assert.rejects(
      () => saveStaffResultVerification(sql, { ...data, athleteNumber: "2001" }, actor),
      /does not belong/,
    );
    await saveStaffResultVerification(sql, data, actor);
    await assert.rejects(() => saveStaffResultVerification(sql, data, actor), /changed/);
  }
  assert((await staffVerificationResults(sql, "1001", 0, actor)).every((r) => r.verified));
  assert.equal(
    (await sql`select status from athlete_result_verification_requests where result_key='r:1'`)[0]
      .status,
    "approved",
  );
  const confirmed = await staffVerificationResults(sql, "1001", 0, actor);
  for (const result of confirmed)
    await saveStaffResultVerification(
      sql,
      {
        ...evidence,
        target: result.target,
        expectedVersion: result.version,
        verified: false,
        sourceChecked: false,
        sourceUrl: "",
        locator: "",
        identityEvidence: "",
        note: "Reopened for a further source comparison.",
      },
      actor,
    );
  assert((await staffVerificationResults(sql, "1001", 0, actor)).every((r) => !r.verified));
  assert.equal(
    (await sql`select status from athlete_result_verification_requests where result_key='r:1'`)[0]
      .status,
    "needs_info",
  );
  const changed = (await staffVerificationResults(sql, "2001", 0, actor))[0];
  await sql`update results set finish_time_seconds=1249 where id=2`;
  await assert.rejects(
    () =>
      saveStaffResultVerification(
        sql,
        {
          ...evidence,
          athleteNumber: "2001",
          target: changed.target,
          expectedVersion: changed.version,
        },
        actor,
      ),
    /changed/,
  );
  assert.equal((await sql`select count(*)::int as n from athlete_account_links`)[0].n, 1);
  assert.equal(
    (await sql`select profile_visibility from athletes where id=1`)[0].profile_visibility,
    "private",
  );
  assert.equal(
    (await sql`select result_visibility from results where id=1`)[0].result_visibility,
    "private",
  );
  assert.equal(
    (await sql`select published_at from athlete_source_histories`)[0].published_at,
    null,
  );
  assert.equal(
    (await sql`select count(*)::int as n from network_audit_log where actor_user_id='staff'`)[0].n,
    7,
  );
  const histories = [
    {
      provider: "Any Timing Provider",
      externalId: "123",
      sourceUrl: "https://private-source.test",
      capturedAt: "2026-01-01",
      complete: true,
      yearsExpected: [2020],
      yearsCaptured: [2020],
      performances: [
        {
          ...row,
          verificationStatus: "source_verified",
          providerName: "Any Timing Provider",
          staffVerification: { note: "PRIVATE REVIEW", sourceUrl: "https://private-source.test" },
        },
      ],
    },
  ];
  const safe = withoutProfileEvidence(histories);
  assert.doesNotMatch(JSON.stringify(safe), /Any Timing Provider|private-source|PRIVATE REVIEW/);
  assert.deepEqual(
    buildProfileAchievementSummary([], safe),
    buildProfileAchievementSummary([], histories),
  );
  assert.equal(buildCompetitionHonours([], safe)[0].evidence[0].verified, true);
  const providerOnly = [
    { ...histories[0], provider: "parkrun", performances: [{ ...row, discipline: "5K" }] },
  ];
  assert.deepEqual(
    sourceHistorySports(withoutProfileEvidence(providerOnly)),
    sourceHistorySports(providerOnly),
  );
  assert.deepEqual(withoutProfileEvidence(safe), safe, "Public sanitization remains idempotent");
  const imported = {
    ...histories[0],
    provider: "Abbott World Marathon Majors",
    performances: [
      {
        ...row,
        labels: [
          "World Marathon Majors source result",
          "Road",
          "Exact race date not supplied",
          "Round: Final",
          "World Marathon Major",
        ],
      },
    ],
  };
  const importedBefore = structuredClone(imported);
  const publicImport = withoutProfileEvidence(imported);
  assert.doesNotMatch(JSON.stringify(publicImport), /World Marathon Majors source result/);
  assert.deepEqual(publicImport.performances[0].labels, [
    "Road",
    "Exact race date not supplied",
    "Round: Final",
    "World Marathon Major",
  ]);
  assert.deepEqual(imported, importedBefore, "Stored import evidence is untouched");
  assert.deepEqual(withoutProfileEvidence(publicImport), publicImport);
  assert.deepEqual(
    buildProfileAchievementSummary([], [publicImport]),
    buildProfileAchievementSummary([], [imported]),
    "Removing import branding preserves earned achievements",
  );
  console.log(
    "PASS: staff-only profile/result checkboxes, claimed/unclaimed/account-only coverage, source evidence, undo, stale edits, audit trail, unchanged ownership/visibility and public source privacy.",
  );
} finally {
  await db.close();
}
