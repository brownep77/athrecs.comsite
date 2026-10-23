// Actual services and migrated disposable SQL; synthetic accounts and intercepted emails only.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { Pool, types } from "pg";
import * as matching from "../src/lib/athrecs/result-match.ts";
import * as settings from "../src/lib/athrecs/result-matching-settings.ts";
const require = createRequire(import.meta.url),
  ts = require("typescript");
function load(path, deps = {}) {
  const module = { exports: {} };
  new Function(
    "require",
    "module",
    "exports",
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
  )(
    (name) => {
      if (!(name in deps)) throw Error(`Unexpected dependency ${name}`);
      return deps[name];
    },
    module,
    module.exports,
  );
  return module.exports;
}
const postgres = process.env.ATHRECS_ARCHIVE_CLAIM_TEST_POSTGRES === "1";
let db;
if (postgres) {
  assert.equal(process.env.CI, "true");
  for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL"])
    assert.equal(process.env[key] ?? "", "", "Never use application credentials");
  types.setTypeParser(20, Number);
  const pool = new Pool({
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "athrecs_archive_claim_test",
    max: 8,
    options: "-c statement_timeout=15000 -c lock_timeout=5000",
  });
  assert.equal(
    (
      await pool.query(
        "select count(*)::int n from information_schema.tables where table_schema='public'",
      )
    ).rows[0].n,
    0,
  );
  db = {
    query: (...a) => pool.query(...a),
    exec: (s) => pool.query(s),
    close: () => pool.end(),
    transaction: async (work) => {
      const c = await pool.connect();
      try {
        await c.query("begin");
        const result = await work(c);
        await c.query("commit");
        return result;
      } catch (e) {
        await c.query("rollback");
        throw e;
      } finally {
        c.release();
      }
    },
  };
} else db = new PGlite();
await db.waitReady;
function sqlFor(connection) {
  const sql = async (parts, ...values) =>
    (await connection.query(parts.map((p, i) => (i ? `$${i}${p}` : p)).join(""), values)).rows;
  sql.query = async (text, values = []) => (await connection.query(text, values)).rows;
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db),
  sends = [];
const env = { ...process.env };
try {
  for (const f of readdirSync("migrations")
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`migrations/${f}`, "utf8"));
  process.env.VERCEL_ENV = "production";
  process.env.ATHRECS_STAFF_EMAILS = "different-staff@example.test";
  const core = load("src/lib/results-archive/core.ts", { zod: require("zod") });
  const mail = {
    authEmailConfigured: () => true,
    sendAthrecsAuthEmail: async (email, options) => {
      assert.equal(email.to, "info@athrecs.com");
      const [linked] =
        await sql`select count(*)::int n from result_archive_entries where canonical_result_id is not null`;
      assert(linked.n > 0, "Notifications run after archive/profile transaction commits");
      sends.push({ email, options });
    },
  };
  const emails = load("src/lib/athrecs/result-claim-email.server.ts", {
    "@/lib/auth/email.server": mail,
  });
  const alerts = load("src/lib/athrecs/result-claim-alerts.server.ts", {
    "node:crypto": crypto,
    "@/lib/db": { dbSource: "neon" },
    "@/lib/site-scope": { IS_RUNRECS_SITE: false },
    "@/lib/auth/email.server": mail,
    "./result-claim-email.server": emails,
  });
  const claims = load("src/lib/results-archive/claim.server.ts", {
    "./core": core,
    "../athrecs/result-matching-settings": settings,
    "../athrecs/result-match": matching,
    "../athrecs/result-claim-alerts.server": alerts,
  });
  const member = load("src/lib/results-archive/member.server.ts", {
    "../athrecs/result-matching-settings": settings,
    "../athrecs/result-match": matching,
    "./claim.server": claims,
    "../athrecs/result-claim-alerts.server": alerts,
  });
  await sql`insert into "user"(id,name,email,"emailVerified") values('owner','Synthetic Runner','owner@example.test',true),('stranger','Synthetic Runner','stranger@example.test',true),('unverified','Synthetic Runner','unverified@example.test',false)`;
  await sql`insert into athletes(id,slug,display_name) values(1,'synthetic-runner','Synthetic Runner'),(2,'other-runner','Other Runner')`;
  await sql`insert into athlete_private_profiles(user_id,full_name,verified_email,previous_names,privacy_notice_version,privacy_acknowledged_at) values('owner','Synthetic Runner','owner@example.test',array['Synthetic Former'],'synthetic-test',now())`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(1,'owner','owner@example.test','active')`;
  await sql`insert into events(id,slug,name,sport) values(1,'synthetic-race','Synthetic Race','Running')`;
  await sql`insert into editions(id,event_id,event_date,distance_code) values(1,1,'2025-01-01','10K'),(2,1,'2025-02-01','10K'),(3,1,'2025-03-01','10K')`;
  const dataset = crypto.randomUUID();
  await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note) values(${dataset}::uuid,1,'Synthetic Timer','race','https://example.test/results','Synthetic test source permission')`;
  const payload = (name = "Synthetic Runner", extra = {}) => ({
    sourceKey: "row",
    name,
    status: "finished",
    finishSeconds: 2000.4,
    chipSeconds: 2000.4,
    bib: "42",
    ...extra,
  });
  const insert = async (data, edition = 1) => {
    const d = edition === 1 ? dataset : crypto.randomUUID();
    if (edition !== 1)
      await sql`insert into result_archive_datasets(id,edition_id,provider,source_race_key,source_url,permission_note) values(${d}::uuid,${edition},'Synthetic Timer',${d},'https://example.test/results','Synthetic test source permission')`;
    const [e] =
      await sql`insert into result_archive_entries(dataset_id,source_key,payload,payload_hash) values(${d}::uuid,${crypto.randomUUID()},${JSON.stringify(data)}::jsonb,repeat('a',64)) returning id`;
    return Number(e.id);
  };
  const entry = await insert(payload());
  const input = {
    entries: [{ entryId: entry, revision: 1 }],
    note: "I confirm this is my race result.",
    declarationAccepted: true,
  };
  const claimed = await member.requestArchiveMatches(sql, "owner", input);
  assert.equal(claimed.claimed, 1);
  assert.equal(claimed.added, 1);
  assert.equal(claimed.held.length, 0);
  const [result] = await sql`select * from results where athlete_id=1 and edition_id=1`;
  assert.equal(result.finish_time_seconds, 2000);
  assert.equal(result.result_details.timing.finishSeconds, 2000.4);
  assert.equal(result.result_details.verification.status, "unverified");
  assert.equal(result.result_visibility, "private");
  assert.equal(sends.length, 1);
  assert.match(sends[0].email.actionUrl, /claimId=/);
  const repeated = await member.requestArchiveMatches(sql, "owner", input);
  assert.equal(repeated.claimed, 1);
  assert.equal(repeated.added, 0);
  assert.equal(sends.length, 1);
  const concurrent = await Promise.all(
    Array.from({ length: 4 }, () => member.requestArchiveMatches(sql, "owner", input)),
  );
  assert(concurrent.every((r) => r.claimed === 1 && r.added === 0));
  assert.equal(sends.length, 1, "Concurrent replay never duplicates notifications or performances");
  const duplicate = await insert(payload("Synthetic Former"));
  const original = JSON.stringify((await sql`select * from results where id=${result.id}`)[0]);
  const dup = await member.requestArchiveMatches(sql, "owner", {
    ...input,
    entries: [{ entryId: duplicate, revision: 1 }],
  });
  assert.equal(dup.duplicates, 1);
  assert.equal(dup.added, 0);
  assert.equal(sends.length, 1);
  assert.equal(
    JSON.stringify((await sql`select * from results where id=${result.id}`)[0]),
    original,
    "Duplicate linking never rewrites existing performance or verification",
  );
  assert.equal((await sql`select count(*)::int n from results where athlete_id=1`)[0].n, 1);
  const unowned = await insert(payload(), 2);
  const held = await member.requestArchiveMatches(sql, "stranger", {
    ...input,
    entries: [{ entryId: unowned, revision: 1 }],
  });
  assert.equal(held.claimed, 0);
  assert.match(held.held[0].reason, /Claim your athlete profile first/);
  assert.equal(
    (await sql`select user_id from athlete_account_links where athlete_id=1`)[0].user_id,
    "owner",
  );
  await assert.rejects(
    () => member.requestArchiveMatches(sql, "unverified", input),
    /Verify your email/,
  );
  const conflict = await insert(
    payload("Synthetic Runner", { finishSeconds: 999, chipSeconds: 999 }),
  );
  const blocked = await member.requestArchiveMatches(sql, "owner", {
    ...input,
    entries: [{ entryId: conflict, revision: 1 }],
  });
  assert.equal(blocked.claimed, 0);
  assert.match(blocked.held[0].reason, /conflicts/);
  const flagged = await insert(
    payload("Synthetic Runner", { reviewFlags: ["Ambiguous timing columns"] }),
    3,
  );
  const flaggedResult = await member.requestArchiveMatches(sql, "owner", {
    ...input,
    entries: [{ entryId: flagged, revision: 1 }],
  });
  assert.equal(flaggedResult.claimed, 0);
  assert.match(flaggedResult.held[0].reason, /review flag/);
  const untouched = await claims.completeOwnArchiveRequests(sql, "stranger", [entry]);
  assert.equal(untouched.claimed, 0, "Another account cannot reuse an existing request");
  assert.equal(
    (await member.staffArchiveRequests(sql)).length,
    3,
    "Uncertain and unowned requests remain in the unified staff queue",
  );
  assert.equal((await sql`select count(*)::int n from result_archive_decisions`)[0].n, 2);
  console.log(
    "PASS: archive declaration → existing owned profile → preserved precision/private unverified result → completed claim → info@ notification. Duplicate linking, replay, alias, cross-account, unverified email and flagged/conflicting rows checked.",
  );
} finally {
  Object.keys(process.env)
    .filter((k) => !(k in env))
    .forEach((k) => delete process.env[k]);
  Object.assign(process.env, env);
  await db.close();
}
