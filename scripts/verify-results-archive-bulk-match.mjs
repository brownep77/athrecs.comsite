// Bulk archive matching against the real migrations and SQL. Synthetic people only.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { z } from "zod";
import { Pool, types } from "pg";
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
    database: "athrecs_bulk_archive_test",
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

function sqlFor(connection) {
  const query = async (text, args = []) => (await connection.query(text, args)).rows;
  const sql = async (parts, ...values) => {
    let s = parts[0];
    values.forEach((_, i) => (s += `$${i + 1}${parts[i + 1]}`));
    return query(s, values);
  };
  sql.query = query;
  sql.transaction = (work) => db.transaction((tx) => work(sqlFor(tx)));
  return sql;
}
const sql = sqlFor(db);
const core = load("src/lib/results-archive/core.ts", { zod: { z } });
const service = load("src/lib/results-archive/service.server.ts", {
  "node:crypto": crypto,
  "./core": core,
});
const bulk = load("src/lib/results-archive/bulk-match.server.ts", {
  "./core": core,
  "node:crypto": crypto,
});
const actor = { userId: "bulk-staff-synthetic", staffEmail: "staff@example.test" };

for (const f of readdirSync("migrations")
  .filter((n) => n.endsWith(".sql"))
  .sort())
  await db.exec(readFileSync(`migrations/${f}`, "utf8"));
await sql`insert into "user"(id,name,email,"emailVerified") values(${actor.userId},'Synthetic Staff',${actor.staffEmail},true)`;
const [event] =
  await sql`insert into events(slug,name,sport,country,county,city,surface,summary) values('synthetic-city-marathon','Synthetic City Marathon','Running','GB','','','Road','Synthetic') returning id`;
const [edition] =
  await sql`insert into editions(event_id,event_date,distance_code,distance_km,status) values(${event.id},'2025-04-27','Marathon',42.195,'Finished') returning id`;
const [club] =
  await sql`insert into clubs(slug,name) values('synthetic-harriers','Synthetic Harriers') returning id`;
async function athlete(name, extra = {}) {
  const [a] =
    await sql`insert into athletes(slug,display_name,gender,club_id,source_club_name,country,profile_visibility)
    values(${crypto.randomUUID()},${name},${extra.gender ?? "U"},${extra.clubId ?? null},${extra.sourceClub ?? null},${extra.country ?? ""},'public') returning id`;
  if (extra.bib)
    await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,years_expected,years_captured,performances)
      values(${a.id},'Synthetic history',${crypto.randomUUID()},'https://example.test/history',now(),'{2025}','{2025}',${JSON.stringify([{ year: 2025, date: "2025-04-27", discipline: "Marathon", bib: extra.bib, meeting: extra.meeting ?? "Synthetic City Marathon", performance: new Date((10800 + Number(extra.bib)) * 1000).toISOString().slice(11, 19), notes: `Result; bib ${extra.bib}. Time copied.` }])}::jsonb)`;
  if (extra.nationality)
    await sql`update athletes set profile_details=jsonb_build_object('nationality',${extra.nationality}::text) where id=${a.id}`;
  return Number(a.id);
}
const bridged = await athlete("Ada Bridge", { bib: "101", gender: "F" });
const clubbed = await athlete("Ben Club", { clubId: club.id, gender: "M" });
const national = await athlete("Cara Country", { nationality: "Ireland" });
await athlete("Dan Twice");
await athlete("Dan Twice");
const managed = await athlete("Eve Managed", { bib: "105" });
await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(${managed},${actor.userId},${actor.staffEmail},'active')`;
const existing = await athlete("Finn Existing", { bib: "106" });
await sql`insert into results(edition_id,athlete_id,status,finish_time_seconds,result_visibility) values(${edition.id},${existing},'finished',10000,'private')`;
const noAgreement = await athlete("Gus Nomatch", { country: "France" });
await athlete("Hal Gender", { bib: "108", gender: "F" });
// A duplicate profile also holding the same bib/result must hold the row.
await athlete("Ivy Double", { bib: "109" });
await athlete("Ivy Double", { bib: "109" });

const dataset = await service.createArchiveDataset(
  sql,
  {
    editionId: edition.id,
    provider: "Synthetic Timing",
    sourceRaceKey: "synthetic-bulk",
    sourceUrl: "https://example.test/bulk",
    permissionNote: "Synthetic dataset permission for testing only",
    expectedRows: 12,
  },
  actor,
);
const row = (bib, name, club = "", country = "", gender = "") =>
  core.archiveRowSchema.parse({
    sourceKey: `k-${bib}`,
    name,
    bib,
    club,
    country,
    gender,
    status: "finished",
    finishSeconds: 10800 + Number(bib),
    original: country ? { Nationality: country } : {},
  });
await service.ingestArchiveBatch(
  sql,
  {
    datasetId: dataset.id,
    requestId: crypto.randomUUID(),
    rows: [
      row("101", "Ada Bridge", "", "", "Female"),
      row("102", "BEN CLUB", "Synthetic Harriers"),
      row("103", "Cara Country", "", "IRL"),
      row("104", "Dan Twice", "Synthetic Harriers"),
      row("105", "Eve Managed"),
      row("106", "Finn Existing"),
      row("107", "Gus Nomatch", "", "GBR"),
      row("108", "Hal Gender", "", "", "Male"),
      row("109", "Ivy Double"),
      row("110", "Jo Repeat", "Synthetic Harriers"),
      row("111", "Jo Repeat", "Synthetic Harriers"),
      row("112", "Nobody Known"),
    ],
  },
  actor,
);
await athlete("Jo Repeat", { clubId: club.id });

const run = (params = {}, who = actor) =>
  bulk.bulkMatchArchiveDataset(sql, { datasetId: dataset.id, apply: false, ...params }, who);
const preview = await run();
assert.equal(preview.scanned, 12);
assert.deepEqual(
  preview.matches.map((m) => [m.athleteId, m.tier]),
  [
    [bridged, "bridge"],
    [clubbed, "name_club"],
    [national, "name_country"],
  ],
);
assert.deepEqual(preview.skipped, {
  several_candidates: 1,
  managed_account: 1,
  existing_result: 1,
  no_club_or_country_agreement: 1,
  gender_conflict: 1,
  several_bridges: 1,
  name_repeated_in_race: 2,
  no_candidate: 1,
});
assert.equal((await sql`select count(*)::int n from result_archive_private_matches`)[0].n, 0);
await assert.rejects(run({ apply: true }), /Preview/);
await assert.rejects(run({ limit: 501 }), /1–500/);
await assert.rejects(run({}, { userId: "", staffEmail: "" }), /staff/);
await assert.rejects(
  run({ apply: true, previewToken: preview.previewToken }, { ...actor, userId: "different" }),
  /Preview it again/,
);
await assert.rejects(
  run({ apply: true, limit: 1, previewToken: preview.previewToken }),
  /Preview it again/,
);
const input = { apply: true, previewToken: preview.previewToken };
await sql`update athletes set gender='X' where id=${bridged}`;
await assert.rejects(run(input), /Preview it again/);
await sql`update athletes set gender='F',profile_type='Public figure' where id=${bridged}`;
await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(${bridged},${actor.userId},${actor.staffEmail},'active')`;
await assert.rejects(run(input), /Preview it again/);
await sql`delete from athlete_account_links where athlete_id=${bridged}`;
const one = await run({ limit: 1 });
assert.equal(one.scanned, 1);
assert.equal(one.matches.length, 1);
const approveFirst = () => run({ apply: true, limit: 1, previewToken: one.previewToken });
const simultaneous = await Promise.allSettled([approveFirst(), approveFirst()]);
assert.equal(
  simultaneous.filter((s) => s.status === "fulfilled" && s.value.linked === 1).length,
  1,
);
assert.equal((await sql`select count(*)::int n from result_archive_private_matches`)[0].n, 1);
await assert.rejects(run(input), /Preview it again/);
// A fresh preview is required for the remaining rows.
const rest = await run({ after: one.next });
assert.equal(
  (await run({ apply: true, after: one.next, previewToken: rest.previewToken })).linked,
  2,
);
assert.deepEqual(
  (await sql`select athlete_id,tier from result_archive_private_matches order by athlete_id`).map(
    (r) => [r.athlete_id, r.tier],
  ),
  [
    [bridged, "bridge"],
    [clubbed, "name_club"],
    [national, "name_country"],
  ],
);
assert.equal(
  (
    await sql`select count(*)::int n from result_archive_decisions where action='link' and after_value ? 'privateAthleteId'`
  )[0].n,
  3,
);
assert.equal(
  (await sql`select count(*)::int n from results where edition_id=${edition.id}`)[0].n,
  1,
  "Even public figures cannot acquire a public/canonical performance via bulk matching",
);
assert.equal(
  (
    await sql`select count(*)::int n from result_archive_entries where review_state='held' and canonical_result_id is null`
  )[0].n,
  3,
);
assert.equal((await run()).matches.length, 0);
const held = (await service.listArchiveEntries(sql, { datasetId: dataset.id, state: "held" })).rows;
assert.deepEqual(
  held.map((r) => r.privateAthleteId),
  [bridged, clubbed, national],
);
await service.reviewArchiveEntry(
  sql,
  {
    entryId: held[0].id,
    revision: 1,
    action: "reopen",
    identityNote: "Release the private match for a new identity review.",
  },
  actor,
);
assert.equal(
  (
    await sql`select count(*)::int n from result_archive_private_matches where athlete_id=${bridged}`
  )[0].n,
  0,
);
assert.equal(
  (
    await sql`select before_value->>'privateAthleteId' as id from result_archive_decisions where action='reopen'`
  )[0].id,
  String(bridged),
);

const more = await service.createArchiveDataset(
  sql,
  {
    editionId: edition.id,
    provider: "Another synthetic source",
    sourceRaceKey: "second",
    sourceUrl: "https://example.test/other",
    permissionNote: "Synthetic test source permission",
    expectedRows: 10,
  },
  actor,
);
async function ingest(rows) {
  await service.ingestArchiveBatch(
    sql,
    { datasetId: more.id, requestId: crypto.randomUUID(), rows },
    actor,
  );
}
await athlete("Bib Other", { clubId: club.id });
await athlete("Residence Only", { country: "Ireland" });
await athlete("Unknown Country", { nationality: "Unknown" });
await athlete("Source Conflict", { clubId: club.id });
await athlete("Prefix Race", { bib: "202", meeting: "Synthetic City Marathon Relay" });
await athlete("Alias Owner", { clubId: club.id });
await sql`update athletes set profile_details='{"aliases":["Alias Owner"]}'::jsonb where id=${noAgreement}`;
await athlete("Another Gender", { clubId: club.id, gender: "X" });
await athlete("Generic Country", { nationality: "Ireland" });
await athlete("Flagged Legacy", { clubId: club.id });
await ingest([
  row("102", "Bib Other", "Synthetic Harriers"),
  row("204", "Residence Only", "", "IRL"),
  row("205", "Unknown Country", "", "Unknown"),
  {
    ...row("206", "Source Conflict", "Synthetic Harriers"),
    sourceAthleteId: "elsewhere",
    sourceAthleteProvider: "test",
  },
  row("202", "Prefix Race"),
  row("207", "Alias Owner", "Synthetic Harriers"),
  row("208", "Another Gender", "Synthetic Harriers", "", "F"),
  { ...row("209", "Generic Country", "", "IRL"), original: { Country: "IRL" } },
  row("210", "Flagged Legacy", "Synthetic Harriers"),
]);
await sql`update result_archive_entries set payload=payload||'{"reviewFlags":["Timing columns disputed"]}'::jsonb where dataset_id=${more.id} and source_key='k-210'`;
const guarded = await run({ datasetId: more.id });
assert.equal(guarded.matches.length, 0);
assert.deepEqual(guarded.skipped, {
  bib_conflict: 1,
  no_club_or_country_agreement: 4,
  identity_conflict: 1,
  several_candidates: 1,
  gender_conflict: 1,
  not_linkable: 1,
});
assert.equal(bulk.countryName("GBR"), "united kingdom");
assert.equal(bulk.clubKey("Unattached"), "");
console.log(
  "Bounded preview, stale and competing approvals, identity conflicts, private associations, audit and release verified.",
);
await db.close();
