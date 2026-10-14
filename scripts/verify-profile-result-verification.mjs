import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import {
  requestVerification,
  reviewVerification,
  memberRequests,
  staffRequests,
  verificationVersion,
} from "../src/lib/athrecs/result-verification.server.ts";
import { verificationRequestInput } from "../src/lib/athrecs/result-verification.ts";

const db = new PGlite();
const sqlFor = (c) => {
  const sql = async (strings, ...values) =>
    (
      await c.query(
        strings.reduce((s, p, i) => s + (i ? `$${i}` : "") + p, ""),
        values,
      )
    ).rows;
  sql.query = async (text, params = []) => (await c.query(text, params)).rows;
  sql.transaction = (fn) => c.transaction((tx) => fn(sqlFor(tx)));
  return sql;
};
const sql = sqlFor(db),
  staff = { userId: "staff", staff: true };
const base = { note: "", evidenceUrl: "" };
const makeRequest = (key) => requestVerification(sql, { ...base, key }, "owner");
const review = (row, action = "approve", extra = {}) =>
  reviewVerification(
    sql,
    {
      id: row.id,
      revision: row.revision,
      action,
      sourceUrl: "https://example.test/official-results",
      locator: "Bib 42, row 3",
      identityEvidence: "Bib and club matched to the organiser's source row.",
      staffNote: "PRIVATE STAFF EVIDENCE: inspected source fields and identity.",
      memberMessage:
        action === "approve" ? "Your result has been verified." : "Please provide your bib number.",
      sourceChecked: true,
      ...extra,
    },
    staff,
  );
const queue = async () => staffRequests(sql, { athleteIds: [1], status: "all", offset: 0 }, staff);
const caseFor = async (key) => (await queue()).find((r) => r.key === key);
try {
  await db.exec(`
    create table "user"(id text primary key,"emailVerified" boolean);
    insert into "user" values('owner',true),('staff',true),('stranger',true),('unverified',false);
    create table athletes(id integer primary key,display_name text);insert into athletes values(1,'Synthetic Runner'),(2,'Other Runner');
    create table athlete_account_links(athlete_id integer,user_id text,status text);
    insert into athlete_account_links values(1,'owner','active'),(2,'stranger','active');
    create table results(id integer primary key,athlete_id integer,event_name text,event_date text,distance_code text,finish_time_seconds integer,result_details jsonb,result_source text,source_url text,available boolean);
    insert into results select n,1,'Synthetic race '||n,'2020-01-01','5K',1200,'{"verificationStatus":"unverified"}','athlete','https://example.test/results',true from generate_series(1,30)n;
    insert into results values(40,2,'Other race','2020-01-01','5K',1200,'{}','athlete','',true);
    create table source_history_claim_results(id serial primary key,athlete_id integer,provider text,external_id text,source_key text,source_url text,performance jsonb,available boolean,updated_at timestamptz,unique(provider,external_id,source_key));
    create view athlete_claimable_results as select * from results union all
      select -id,athlete_id,performance->>'meeting',performance->>'date',performance->>'discipline',1200,performance,provider,source_url,available from source_history_claim_results;
    create table athlete_source_histories(athlete_id integer,provider text,external_id text,source_url text,performances jsonb,published_at timestamptz);
    create table athlete_profile_history_choices(user_id text,athlete_id integer,provider text,external_id text,performance_hash text,excluded boolean,unique(user_id,athlete_id,provider,external_id,performance_hash));
    create table network_audit_log(id serial,actor_user_id text,action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb,note text,created_at timestamptz default now());
  `);
  const migration = await readFile(
    new URL("../migrations/20261014_profile_result_verification.sql", import.meta.url),
    "utf8",
  );
  await db.exec(migration);
  await assert.rejects(
    () => requestVerification(sql, { ...base, key: "r:1" }, "stranger"),
    /not linked/,
  );
  await assert.rejects(
    () => requestVerification(sql, { ...base, key: "r:1" }, "unverified"),
    /verified email/,
  );
  await assert.rejects(() => makeRequest("r:40"), /not linked/);
  await assert.rejects(
    () =>
      staffRequests(
        sql,
        { athleteIds: [], status: "all", offset: 0 },
        { userId: "owner", staff: false },
      ),
    /Staff access/,
  );
  await assert.rejects(
    () => reviewVerification(sql, {}, { userId: "owner", staff: false }),
    /Staff access/,
  );
  assert.equal(
    verificationRequestInput.safeParse({ ...base, key: "r:1", evidenceUrl: "javascript:alert(1)" })
      .success,
    false,
  );
  assert.equal(
    verificationRequestInput.safeParse({ ...base, key: "r:1", verified: true }).success,
    false,
  );
  assert.equal(
    verificationVersion({ a: 1, b: { d: 2, c: 3 } }),
    verificationVersion({ b: { c: 3, d: 2 }, a: 1 }),
  );
  await makeRequest("r:1");
  await makeRequest("r:1");
  assert.equal((await queue()).length, 1, "Repeated clicks must create one case");
  assert.equal(
    (await sql`select result_details from results where id=1`)[0].result_details.verificationStatus,
    "unverified",
    "A request cannot self-verify",
  );
  await assert.rejects(
    async () => review(await caseFor("r:1"), "approve", { sourceChecked: false }),
    /Inspect the source/,
  );
  await assert.rejects(
    async () => review(await caseFor("r:1"), "approve", { identityEvidence: "" }),
    /Inspect the source/,
  );
  const first = await caseFor("r:1");
  await review(first, "needs_info");
  await assert.rejects(() => review(first), /changed/);
  await makeRequest("r:1");
  await review(await caseFor("r:1"));
  assert.equal(
    (await sql`select result_details from results where id=1`)[0].result_details.verificationStatus,
    "verified_by_administrator",
  );
  await assert.rejects(() => makeRequest("r:1"), /already verified/);
  const member = await memberRequests(sql, "owner");
  assert.deepEqual(Object.keys(member[0]).sort(), ["key", "message", "status"]);
  assert.doesNotMatch(
    JSON.stringify(member),
    /PRIVATE STAFF|https:|identityEvidence|snapshot|locator/,
  );
  assert.equal((await memberRequests(sql, "stranger")).length, 0);
  await makeRequest("r:2");
  await sql`update results set finish_time_seconds=1201 where id=2`;
  await assert.rejects(async () => review(await caseFor("r:2")), /source result changed/);
  assert.equal(
    (await sql`select result_details from results where id=2`)[0].result_details.verificationStatus,
    "unverified",
  );
  await review(await caseFor("r:2"), "needs_info");
  await makeRequest("r:2");
  await review(await caseFor("r:2"));
  await makeRequest("r:3");
  await review(await caseFor("r:3"), "reject");
  assert.equal(
    (await sql`select result_details from results where id=3`)[0].result_details.verificationStatus,
    "unverified",
  );
  await sql`update results set result_details='{"verificationStatus":"unverified","syntheticTest":true}' where id=4`;
  await assert.rejects(() => makeRequest("r:4"), /Fictional/);
  await sql`update results set result_details='{"profileExcluded":true}' where id=5`;
  await assert.rejects(() => makeRequest("r:5"), /Restore/);
  const externalId = randomUUID(),
    historyRow = {
      meeting: "Synthetic championship",
      date: "2020-01-02",
      discipline: "60m",
      performance: "8.04i",
      verificationStatus: "unverified",
      notes: "Private source research",
      sourceUrls: ["https://example.test/source"],
    };
  await sql`insert into athlete_source_histories values(1,'AthRecs additions',${externalId},'https://example.test/source',${JSON.stringify([historyRow])}::jsonb,now())`;
  const key = `h:1:${externalId}:0`;
  await assert.rejects(() => makeRequest(key), /Reload/);
  await assert.rejects(
    () => requestVerification(sql, { ...base, key, expectedVersion: "0".repeat(64) }, "owner"),
    /changed/,
  );
  await requestVerification(
    sql,
    { ...base, key, expectedVersion: verificationVersion(historyRow) },
    "owner",
  );
  await review(await caseFor(key));
  const updated = (
    await sql`select performances from athlete_source_histories where external_id=${externalId}`
  )[0].performances[0];
  assert.equal(updated.verificationStatus, "verified_by_administrator");
  assert.equal(updated.performance, "8.04i", "Retain exact source precision");
  assert.equal(updated.sourceUrls[0], historyRow.sourceUrls[0]);
  // Negative claim references must update the source history, so later syncs retain the review.
  const sourceRow = {
    meeting: "Synthetic source race",
    date: "2020-01-03",
    discipline: "10K",
    performance: "00:20:00",
    place: "3",
    verificationStatus: "unverified",
    archiveReference: { sourceRow: "bib:42" },
  };
  const sourceMigration = await readFile(
    new URL("../migrations/20261011_source_history_claims.sql", import.meta.url),
    "utf8",
  );
  await db.exec(
    sourceMigration.slice(
      sourceMigration.indexOf("create function sync_run_norwich_claim_results"),
      sourceMigration.indexOf("-- The same authenticated claim API"),
    ),
  );
  await sql`insert into athlete_source_histories values(1,'Run Norwich official results','test-source','https://example.test/source',${JSON.stringify([sourceRow])}::jsonb,now())`;

  await makeRequest("r:-1");
  await review(await caseFor("r:-1"));
  assert.equal(
    (
      await sql`select performances from athlete_source_histories where external_id='test-source'`
    )[0].performances[0].verificationStatus,
    "verified_by_administrator",
  );
  assert.equal(
    (await sql`select performance from source_history_claim_results where id=1`)[0].performance
      .verificationStatus,
    "verified_by_administrator",
    "Source claim sync retains verification",
  );
  await sql`update athlete_account_links set status='revoked' where user_id='owner'`;
  assert.equal((await memberRequests(sql, "owner")).length, 0, "Revoked owners lose access");
  await assert.rejects(() => makeRequest("r:6"), /not linked/);
  await sql`update athlete_account_links set status='active' where user_id='owner'`;
  for (let id = 6; id < 19; id++) await makeRequest(`r:${id}`);
  await assert.rejects(() => makeRequest("r:19"), /20 checks/);
  assert.ok(
    (await sql`select * from network_audit_log where action='staff.verification_reviewed'`)
      .length >= 6,
  );
  const api = await readFile(
    new URL("../src/lib/athrecs/result-verification-api.ts", import.meta.url),
    "utf8",
  );
  assert.equal((api.match(/middleware\(\[staffMiddleware\]\)/g) || []).length, 2);
  assert.equal((api.match(/middleware\(\[authMiddleware\]\)/g) || []).length, 2);
  console.log(
    "Profile result verification passed: ownership, staff access, privacy, deduplication, stale reviews, rejection, source history, precision, audit and rate limits.",
  );
} finally {
  await db.close();
}
