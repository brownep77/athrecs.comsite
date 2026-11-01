// Bulk archive matching against the real migrations and SQL. Synthetic people only.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
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
const db = new PGlite();
await db.waitReady;
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
const bulk = load("src/lib/results-archive/bulk-match.server.ts", { "./core": core });
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
const [club] = await sql`insert into clubs(slug,name) values('synthetic-harriers','Synthetic Harriers') returning id`;
async function athlete(name, extra = {}) {
  const [a] = await sql`insert into athletes(slug,display_name,gender,club_id,source_club_name,country,profile_visibility)
    values(${crypto.randomUUID()},${name},${extra.gender ?? "U"},${extra.clubId ?? null},${extra.sourceClub ?? null},${extra.country ?? ""},'public') returning id`;
  if (extra.bib)
    await sql`insert into athlete_source_histories(athlete_id,provider,external_id,source_url,captured_at,years_expected,years_captured,performances)
      values(${a.id},'Synthetic history',${crypto.randomUUID()},'https://example.test/history',now(),'{2025}','{2025}',${JSON.stringify([{ year: 2025, meeting: "Synthetic City Marathon", notes: `Result; bib ${extra.bib}. Time copied.` }])}::jsonb)`;
  return Number(a.id);
}
const bridged = await athlete("Ada Bridge", { bib: "101", gender: "F" });
const clubbed = await athlete("Ben Club", { clubId: club.id, gender: "M" });
const national = await athlete("Cara Country", { country: "Ireland" });
await athlete("Dan Twice");
await athlete("Dan Twice");
const managed = await athlete("Eve Managed", { bib: "105" });
await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status) values(${managed},${actor.userId},${actor.staffEmail},'active')`;
const existing = await athlete("Finn Existing", { bib: "106" });
await sql`insert into results(edition_id,athlete_id,status,finish_time_seconds,result_visibility) values(${edition.id},${existing},'finished',10000,'private')`;
const noAgreement = await athlete("Gus Nomatch", { country: "France" });
const genderClash = await athlete("Hal Gender", { bib: "108", gender: "F" });
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
    original: {},
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

const preview = await bulk.bulkMatchArchiveDataset(sql, { datasetId: dataset.id, apply: false }, actor);
assert.equal(preview.scanned, 12);
assert.equal(preview.next, null);
assert.deepEqual(preview.wouldLink, { bridge: 1, name_club: 1, name_country: 1 });
assert.deepEqual(preview.linked, { bridge: 0, name_club: 0, name_country: 0 });
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
assert.equal((await sql`select count(*)::int n from results where edition_id=${edition.id}`)[0].n, 1, "Preview writes nothing");

const applied = await bulk.bulkMatchArchiveDataset(sql, { datasetId: dataset.id, apply: true }, actor);
assert.deepEqual(applied.linked, { bridge: 1, name_club: 1, name_country: 1 });
const results = await sql`select athlete_id, result_visibility, bib, finish_time_seconds, result_details->'verification'->>'method' as method from results where edition_id=${edition.id} order by athlete_id`;
assert.deepEqual(
  results.filter((r) => r.athlete_id !== existing).map((r) => [Number(r.athlete_id), r.result_visibility, r.method]),
  [
    [bridged, "private", "bulk_archive_match:bridge"],
    [clubbed, "private", "bulk_archive_match:name_club"],
    [national, "private", "bulk_archive_match:name_country"],
  ],
);
assert.equal((await sql`select count(*)::int n from results where athlete_id=${noAgreement} or athlete_id=${genderClash} or athlete_id=${managed}`)[0].n, 0);
const linkedEntries = await sql`select count(*)::int n from result_archive_entries where dataset_id=${dataset.id} and review_state='linked' and canonical_result_id is not null`;
assert.equal(linkedEntries[0].n, 3);
const decisions = await sql`select count(*)::int n from result_archive_decisions where action='link'`;
assert.equal(decisions[0].n, 3, "Every bulk link is audited");
assert.equal((await sql`select count(*)::int n from result_source_references`)[0].n >= 3, true);

const again = await bulk.bulkMatchArchiveDataset(sql, { datasetId: dataset.id, apply: true }, actor);
assert.deepEqual(again.linked, { bridge: 0, name_club: 0, name_country: 0 }, "Re-running is safe");
assert.equal(again.scanned, 9);

// Paging stops cleanly with small chunks.
let after = 0,
  pages = 0;
for (;;) {
  const r = await bulk.bulkMatchArchiveDataset(sql, { datasetId: dataset.id, apply: false, after, limit: 2 }, actor);
  pages++;
  if (r.next === null) break;
  after = r.next;
}
assert.equal(pages, 5);

assert.equal(bulk.countryName("GBR"), "united kingdom");
assert.equal(bulk.countryName("Great Britain"), "united kingdom");
assert.equal(bulk.clubKey("Unattached"), "");
assert.equal(bulk.clubKey("The Synthetic Harriers"), bulk.clubKey("Synthetic Harriers"));
console.log("Bulk archive matching: synthetic tiers, guards, audit and idempotence verified.");
await db.close();
