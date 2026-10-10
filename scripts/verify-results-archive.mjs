// Actual archive services and SQL. Synthetic people only; never uses application credentials.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { Pool, types } from "pg";
import { z } from "zod";
const require = createRequire(import.meta.url),
  ts = require("typescript");
function load(path, deps = {}) {
  const m = { exports: {} };
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  new Function("require", "module", "exports", code)(
    (name) => {
      if (!(name in deps)) throw Error(`Unexpected dependency ${name}`);
      return deps[name];
    },
    m,
    m.exports,
  );
  return m.exports;
}
const postgres = process.env.ATHRECS_ARCHIVE_TEST_POSTGRES === "1";
let db;
if (postgres) {
  assert.equal(process.env.CI, "true");
  for (const key of ["DATABASE_URL", "DATABASE_URL_UNPOOLED", "POSTGRES_URL"])
    assert.equal(process.env[key] ?? "", "", "Never use application credentials");
  types.setTypeParser(20, Number);
  types.setTypeParser(1082, (v) => v);
  const pool = new Pool({
    host: "127.0.0.1",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "athrecs_archive_test",
    max: 10,
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
      const client = await pool.connect();
      try {
        await client.query("begin");
        const result = await work(client);
        await client.query("commit");
        return result;
      } catch (e) {
        await client.query("rollback");
        throw e;
      } finally {
        client.release();
      }
    },
  };
} else {
  db = new PGlite();
  await db.waitReady;
}
let failRevision = false;
function sqlFor(connection) {
  const query = async (text, args = []) => {
    if (failRevision && /insert into result_archive_revisions/.test(text))
      throw Error("Synthetic revision write failure");
    return (await connection.query(text, args)).rows;
  };
  const sql = async (parts, ...values) => {
    let s = parts[0];
    values.forEach((_, i) => (s += `$${i + 1}${parts[i + 1]}`));
    return query(s, values);
  };
  sql.query = query;
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db),
  core = load("src/lib/results-archive/core.ts", { zod: { z } });
const service = load("src/lib/results-archive/service.server.ts", {
  "node:crypto": crypto,
  "./core": core,
});
const member = load("src/lib/results-archive/member.server.ts");
const actor = { userId: "archive-staff-synthetic", staffEmail: "staff@example.test" };
const note = "Synthetic source row, race edition and independent athlete identity reviewed.";
const row = (sourceKey, name, seconds = 2000.25) =>
  core.archiveRowSchema.parse({
    sourceKey,
    name,
    bib: sourceKey,
    status: "finished",
    finishSeconds: seconds,
    chipSeconds: seconds,
    gunSeconds: seconds + 2,
    overallPlace: 1,
    genderPlace: 1,
    categoryPlace: 1,
    original: {
      Name: name,
      "Chip Time": "00:33:20.25",
      "Internal contact": "synthetic@example.test",
    },
  });
async function createDataset(editionId, provider = "Synthetic Timing", key = "synthetic-race") {
  return service.createArchiveDataset(
    sql,
    {
      editionId,
      provider,
      sourceRaceKey: key,
      sourceUrl: `https://example.test/${key}`,
      permissionNote: "Synthetic dataset permission for testing only",
      expectedRows: 2,
    },
    actor,
  );
}
async function upload(datasetId, rows, requestId = crypto.randomUUID()) {
  return service.ingestArchiveBatch(sql, { datasetId, rows, requestId }, actor);
}
async function detail(id, athleteId) {
  return service.archiveEntryDetail(sql, id, athleteId);
}
async function review(id, action = "link", athleteId, overrides = {}) {
  const d = await detail(id, athleteId);
  return service.reviewArchiveEntry(
    sql,
    {
      entryId: id,
      revision: d.entry.revision,
      action,
      athleteId,
      identityNote: note,
      sourceChecked: true,
      resultFingerprint: d.resultFingerprint,
      ...overrides,
    },
    actor,
  );
}
try {
  for (const filename of readdirSync("migrations")
    .filter((n) => n.endsWith(".sql"))
    .sort())
    await db.exec(readFileSync(`migrations/${filename}`, "utf8"));
  await sql`insert into "user"(id,name,email,"emailVerified") values(${actor.userId},'Synthetic Staff',${actor.staffEmail},true)`;
  const [event] =
    await sql`insert into events(slug,name,sport,country,county,city,surface,summary) values('synthetic-archive','Synthetic Archive Race','Running','GB','','','Road','Synthetic') returning id`;
  const [edition] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2026-10-01','10K',10,'Finished') returning id`;
  const dataset = await createDataset(edition.id);
  assert.equal((await createDataset(edition.id)).id, dataset.id, "Dataset creation is repeat-safe");
  await assert.rejects(
    () =>
      service.createArchiveDataset(
        sql,
        {
          editionId: edition.id,
          provider: "Synthetic Timing",
          sourceRaceKey: "synthetic-race",
          sourceUrl: "https://example.test/different",
          permissionNote: note,
        },
        actor,
      ),
    /different source details/,
  );
  const sourceRows = [row("10", "Riley Synthetic"), row("20", "Morgan Synthetic", 2100.1)];
  const requestId = crypto.randomUUID();
  assert.equal((await upload(dataset.id, sourceRows, requestId)).inserted, 2);
  assert.equal((await upload(dataset.id, sourceRows, requestId)).replay, true);
  assert.equal((await upload(dataset.id, sourceRows)).unchanged, 2);
  await assert.rejects(
    () => upload(dataset.id, [row("99", "Other Synthetic")], requestId),
    /Request ID/,
  );
  assert.equal(
    (await sql`select count(*)::int n from results`)[0].n,
    0,
    "Raw race collection creates neither profiles nor results",
  );
  assert.equal((await sql`select count(*)::int n from athletes`)[0].n, 0);
  let entries = (await service.listArchiveEntries(sql, { datasetId: dataset.id })).rows;
  assert.equal(entries.length, 2);
  assert.deepEqual(
    entries[0].payload.original,
    {},
    "List response excludes original private cells",
  );
  assert.equal(
    (await detail(entries[0].id)).entry.payload.original["Internal contact"],
    "synthetic@example.test",
  );
  await assert.rejects(
    () => upload(dataset.id, [row("x", "Duplicate Synthetic"), row("x", "Duplicate Synthetic")]),
    /Repeated source/,
  );
  failRevision = true;
  await assert.rejects(
    () => upload(dataset.id, [row("rollback", "Rollback Synthetic")]),
    /Synthetic revision/,
  );
  failRevision = false;
  assert.equal(
    (await sql`select count(*)::int n from result_archive_entries where source_key='rollback'`)[0]
      .n,
    0,
    "Entry and batch rollback together",
  );
  await assert.rejects(
    () => review(entries[0].id, "link", undefined, { sourceChecked: false }),
    /Inspect/,
  );
  await review(entries[0].id, "hold");
  await assert.rejects(() => review(entries[0].id), /Reopen/);
  await review(entries[0].id, "reopen");
  const linked = await review(entries[0].id);
  const [result] =
    await sql`select r.*,a.profile_visibility from results r join athletes a on a.id=r.athlete_id where r.id=${linked.resultId}`;
  assert.equal(result.result_visibility, "private");
  assert.equal(result.profile_visibility, "private");
  assert.equal(result.finish_time_seconds, 2000);
  assert.equal(result.result_details.timing.finishSeconds, 2000.25);
  assert.equal(
    (await sql`select count(*)::int n from athlete_account_links`)[0].n,
    0,
    "Matching never creates account ownership",
  );
  assert.equal((await service.searchCanonicalResults(sql, { q: "Riley" })).rows.length, 1);
  await review(entries[0].id);
  assert.equal(
    (await sql`select count(*)::int n from results`)[0].n,
    1,
    "Repeat review retains canonical identity",
  );
  // A changed source is a proposal, not permission to overwrite the saved performance.
  const stale = await detail(entries[0].id);
  assert.equal((await upload(dataset.id, [row("10", "Riley Synthetic", 1999.15)])).revised, 1);
  assert.equal(
    (await sql`select finish_time_seconds from results where id=${linked.resultId}`)[0]
      .finish_time_seconds,
    2000,
  );
  assert.equal((await service.listArchiveEntries(sql, { state: "changed" })).rows.length, 1);
  await assert.rejects(
    () =>
      service.reviewArchiveEntry(
        sql,
        {
          entryId: entries[0].id,
          revision: stale.entry.revision,
          action: "correct",
          identityNote: note,
          sourceChecked: true,
          resultFingerprint: stale.resultFingerprint,
        },
        actor,
      ),
    /source row changed/,
  );
  await assert.rejects(() => review(entries[0].id), /Performance conflicts/);
  await review(entries[0].id, "correct");
  const [history] =
    await sql`select * from result_change_history where result_id=${linked.resultId} order by id desc`;
  assert.equal(history.before_value.finish_time_seconds, 2000);
  assert.equal(history.after_value.finish_time_seconds, 1999);
  assert.equal(history.actor_id, actor.userId);
  assert.equal((await detail(entries[0].id)).revisions.length, 2);
  const beforeCanonicalEdit = await detail(entries[0].id);
  await sql`update results set overall_place=2 where id=${linked.resultId}`;
  await assert.rejects(
    () =>
      review(entries[0].id, "correct", undefined, {
        resultFingerprint: beforeCanonicalEdit.resultFingerprint,
      }),
    /existing result changed/,
  );
  await review(entries[0].id, "correct");
  // Seed catalogue refresh cannot undo an explicitly reviewed correction.
  const seed = readFileSync("src/lib/athrecs/seed.server.ts", "utf8");
  const clauses = [
    ...seed.matchAll(/`(on conflict \(edition_id, athlete_id\) do update set[\s\S]*?)`/g),
  ].map((m) => m[1]);
  assert.equal(clauses.length, 2);
  for (const clause of clauses)
    await sql.query(
      `insert into results(edition_id,athlete_id,status,finish_time_seconds) values($1,$2,'finished',9999) ${clause}`,
      [edition.id, result.athlete_id],
    );
  const importerClause = readFileSync("src/lib/athrecs/results-import.server.ts", "utf8").match(
    /on conflict \(edition_id, athlete_id\) do update set[\s\S]*?returning id/,
  )[0];
  await sql.query(
    `insert into results(edition_id,athlete_id,status,finish_time_seconds,source_url) values($1,$2,'finished',9999,'https://example.test/synthetic-race') ${importerClause}`,
    [edition.id, result.athlete_id],
  );
  assert.equal(
    (await sql`select finish_time_seconds from results where id=${linked.resultId}`)[0]
      .finish_time_seconds,
    1999,
  );
  // A second provider can corroborate one canonical result without copying it.
  const second = await createDataset(edition.id, "Other Synthetic Timing", "other-source");
  await upload(second.id, [row("10", "Riley Synthetic", 1999.15)]);
  const other = (await service.listArchiveEntries(sql, { datasetId: second.id })).rows[0];
  await assert.rejects(() => review(other.id), /Potential existing/);
  await review(other.id, "link", result.athlete_id);
  assert.equal((await sql`select count(*)::int n from results`)[0].n, 1);
  assert.equal(
    (
      await sql`select count(*)::int n from result_source_references where result_id=${linked.resultId}`
    )[0].n,
    2,
  );
  await upload(second.id, [row("10", "Riley Synthetic", 1999.2)]);
  await assert.rejects(() => review(other.id, "link", result.athlete_id), /Source precision/);
  await review(other.id, "correct", result.athlete_id);
  assert.equal(
    (await detail(entries[0].id)).entry.canonicalChanged,
    true,
    "Other supporting sources are flagged after a canonical correction without cross-dataset write locks",
  );
  assert(
    (await service.listArchiveEntries(sql, { state: "changed" })).rows.some(
      (r) => r.id === entries[0].id,
    ),
  );
  // New registration discovers archived rows collected before the account existed.
  await sql`insert into "user"(id,name,email,"emailVerified") values('archive-new','Morgan Synthetic','morgan@example.test',true),('archive-other','Unrelated Synthetic','other@example.test',true),('archive-unverified','Morgan Synthetic','unverified@example.test',false)`;
  const suggestions = await member.memberArchiveMatches(sql, "archive-new");
  assert.equal(suggestions.length, 1);
  assert.equal("original" in suggestions[0], false);
  assert.equal((await member.memberArchiveMatches(sql, "archive-other")).length, 0);
  await assert.rejects(
    () =>
      member.requestArchiveMatch(sql, "archive-other", {
        entryId: entries[1].id,
        revision: 1,
        note,
      }),
    /no longer available/,
  );
  await assert.rejects(
    () =>
      member.requestArchiveMatch(sql, "archive-unverified", {
        entryId: entries[1].id,
        revision: 1,
        note,
      }),
    /Verify your email/,
  );
  await member.requestArchiveMatch(sql, "archive-new", {
    entryId: entries[1].id,
    revision: 1,
    note,
  });
  await member.requestArchiveMatch(sql, "archive-new", {
    entryId: entries[1].id,
    revision: 1,
    note,
  });
  assert.equal((await member.staffArchiveRequests(sql)).length, 1);
  assert.equal((await sql`select count(*)::int n from athlete_account_links`)[0].n, 0);
  await review(entries[1].id);
  assert.equal((await member.staffArchiveRequests(sql)).length, 0);
  // Non-finishers and non-time/relay marks are retained, without fabricating finished times.
  await upload(dataset.id, [
    {
      ...row("dns", "DNS Synthetic", null),
      status: "DNS",
      gunSeconds: null,
      overallPlace: null,
      genderPlace: null,
      categoryPlace: null,
    },
    { ...row("relay", "Relay Synthetic"), team: "Synthetic team" },
  ]);
  const last = (await service.listArchiveEntries(sql, { q: "DNS Synthetic" })).rows[0];
  await review(last.id);
  const relay = (await service.listArchiveEntries(sql, { q: "Relay Synthetic" })).rows[0];
  await assert.rejects(() => review(relay.id), /Team or leg/);
  assert.equal((await service.archiveOverview(sql)).summary.sourceRows, 5);
  // Stable provider identities suggest the same athlete across different editions.
  const [edition2] =
    await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2025-10-01','10K',10,'Finished') returning id`;
  const stableDataset = await createDataset(edition2.id, "Synthetic Timing", "older-synthetic");
  await upload(stableDataset.id, [
    {
      ...row("stable", "Stable Synthetic"),
      sourceAthleteProvider: "synthetic-provider",
      sourceAthleteId: "runner-1",
    },
  ]);
  const stableEntry = (await service.listArchiveEntries(sql, { datasetId: stableDataset.id }))
    .rows[0];
  await review(stableEntry.id);
  await upload(dataset.id, [
    {
      ...row("stable2", "Stable Synthetic"),
      sourceAthleteProvider: "synthetic-provider",
      sourceAthleteId: "runner-1",
    },
  ]);
  const stable2 = (await service.listArchiveEntries(sql, { q: "Stable Synthetic" })).rows.find(
    (r) => r.id !== stableEntry.id,
  );
  assert.match(
    (await service.archiveCandidates(sql, stable2.id))[0].reason,
    /source athlete identifier/,
  );
  // Keyset pages never repeat or omit source rows.
  await upload(
    dataset.id,
    Array.from({ length: 120 }, (_, i) => row(`bulk-${i}`, `Bulk Synthetic ${i}`)),
  );
  let cursor,
    ids = [];
  do {
    const p = await service.listArchiveEntries(sql, { datasetId: dataset.id, after: cursor });
    ids.push(...p.rows.map((r) => r.id));
    cursor = p.next;
  } while (cursor);
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(ids.length, 125);
  // Parsing uses explicit headings, quoted names/newlines and fractional timing.
  const table = core.parseDelimited(
    'Bib,Name,Chip Time,Gun Time\r\n"1","Synthetic, Riley","00:33:20.25","00:33:22.25"\r\n',
  );
  const parsed = core.mapArchiveRows(table, core.suggestColumns(table.headers));
  assert.equal(parsed[0].finishSeconds, 2000.25);
  assert.equal(parsed[0].sourceKey, "bib:1");
  assert.throws(
    () =>
      core.mapArchiveRows(core.parseDelimited("Bib,Name,Chip Time\n,Riley,00:10:00"), {
        bib: "Bib",
        name: "Name",
        chipTime: "Chip Time",
      }),
    /missing/,
  );
  assert.throws(() => core.parseDelimited('Bib,Name\n1,"unterminated'), /unclosed/);
  assert.throws(() => core.parseDelimited("Bib,Bib\n1,2"), /distinct/);
  assert.throws(
    () =>
      core.mapArchiveRows(core.parseDelimited("Bib,Name,Chip Time\n1,Riley,00:90:00"), {
        bib: "Bib",
        name: "Name",
        chipTime: "Chip Time",
      }),
    /Invalid minutes/,
  );
  // Server functions require staff/auth middleware and validate input. Preview writes cannot reach the service.
  const server = {
    createServerFn: () => {
      let middleware = [],
        validate = (x) => x;
      const chain = {
        middleware(x) {
          middleware = x;
          return chain;
        },
        validator(x) {
          validate = x;
          return chain;
        },
        handler(fn) {
          const call = (data, context = {}) => fn({ data: validate(data), context });
          call.middleware = middleware;
          return call;
        },
      };
      return chain;
    },
  };
  const api = load("src/lib/results-archive/api.ts", {
    "@tanstack/react-start": server,
    zod: { z },
    "../auth/staff-middleware": { staffMiddleware: "staff" },
    "../db": { getSql: async () => sql, dbSource: "neon" },
    "./core": core,
    "./service.server": service,
  });
  for (const fn of Object.values(api)) assert.deepEqual(fn.middleware, ["staff"]);
  const memberApi = load("src/lib/results-archive/member-api.ts", {
    "@tanstack/react-start": server,
    zod: { z },
    "../auth/middleware": { authMiddleware: "authenticated" },
    "../auth/staff-middleware": { staffMiddleware: "staff" },
    "../db": { getSql: async () => sql, dbSource: "neon" },
    "./core": core,
    "./member.server": member,
  });
  assert.deepEqual(memberApi.requestMyArchiveMatch.middleware, ["authenticated"]);
  assert.deepEqual(memberApi.getStaffArchiveRequests.middleware, ["staff"]);
  process.env.VERCEL_ENV = "preview";
  await assert.rejects(
    () =>
      api.saveArchiveBatch(
        {
          requestId: crypto.randomUUID(),
          datasetId: dataset.id,
          rows: [row("preview", "Preview Synthetic")],
        },
        actor,
      ),
    /disabled in deployment previews/,
  );
  await assert.rejects(
    () =>
      memberApi.requestMyArchiveMatch(
        { entryId: entries[1].id, revision: 1, note },
        { userId: "archive-new" },
      ),
    /disabled in deployment previews/,
  );
  delete process.env.VERCEL_ENV;
  if (postgres) {
    const race = await createDataset(edition2.id, "Concurrent Synthetic", "concurrent");
    const req = crypto.randomUUID();
    const receipts = await Promise.all(
      Array.from({ length: 6 }, () =>
        upload(race.id, [row("parallel", "Concurrent Synthetic")], req),
      ),
    );
    assert.equal(receipts.filter((r) => !r.replay).length, 1);
    const id = (await service.listArchiveEntries(sql, { datasetId: race.id })).rows[0].id;
    const reviews = await Promise.allSettled(Array.from({ length: 4 }, () => review(id)));
    assert(reviews.some((r) => r.status === "fulfilled"));
    assert.equal(
      (
        await sql`select count(*)::int n from results r join athletes a on a.id=r.athlete_id where a.display_name='Concurrent Synthetic'`
      )[0].n,
      1,
    );
  }
  console.log(
    `Central results archive: ${postgres ? "PostgreSQL concurrency + " : ""}migration, real import/review SQL, retry, rollback, identity, precision, corrections, seed protection, account discovery, privacy and pagination passed.`,
  );
} finally {
  await db.close();
}
