import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { parseAnzProfile, parseAnzEvent, assembleAnzCapture } from "../src/lib/anz/parse.server.ts";
import { anzSource, anzTime, anzProgress, publicAnzMedals } from "../src/lib/anz/core.ts";
import { anzTarget, saveAnzCapture } from "../src/lib/anz/store.server.ts";
const url = "https://www.anzrankings.org.nz/site/profiles_con/athlete/42";
const identity = `<h2 class="h2-four">Avery <strong>EXAMPLE</strong></h2><div class="record"><strong>CLUB:</strong> Test Club<br><strong>COACH:</strong> Example Coach<br></div><form action="https://www.anzrankings.org.nz/site/profiles_con/athlete_data/42"><input name="athleteID" value="42"><input name="csrf_token" value="synthetic"><select name="eventID"><option value="9">3000m</option></select></form>`;
const table = (headers, rows) =>
  `<table><thead><tr>${headers.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((x) => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
const profile = parseAnzProfile(
  identity +
    '<h3 id="NZCM">NZ Championships Medals</h3>' +
    table(
      ["Year", "Event", "Age Group", "Performance", "Position"],
      [
        [
          "2025",
          "3000m",
          "Senior women",
          "10:01.23",
          '<img src="https://www.anzrankings.org.nz/img/icon_silver.png">',
        ],
      ],
    ),
  url,
);
assert.equal(profile.name, "Avery EXAMPLE");
assert.equal(profile.club, "Test Club");
assert.equal(profile.coach, "Example Coach");
assert.equal(profile.medals[0].medal, "silver");
assert.equal(profile.medals[0].date, undefined);
// Deliberately shuffled columns demonstrate header mapping and preservation of rank versus place.
const headers = ["Date", "Competition", "Place", "Perf", "Rank", "Wind", "Venue", "Note"];
const page =
  identity +
  "<h2>3000m - All Years</h2>" +
  table(headers, [
    ["10 Mar 2025", "Example meeting", "6mx", "10:01.23", "1", "", "Example town", "PB mx"],
    ["10 Mar 2024", "Older meeting", "4", "10:20.45", "2", "", "Example town", ""],
  ]);
const rows = parseAnzEvent(page, profile, profile.events[0]);
assert.equal(rows[0].place, "6mx");
assert.equal(rows[0].performance, "10:01.23");
assert.equal(rows[0].date, "2025-03-10");
assert.equal(rows[0].country, undefined);
assert.match(rows[0].notes, /source rank 1/);
assert.throws(
  () => parseAnzEvent(page.replace('value="42"', 'value="99"'), profile, profile.events[0]),
  /identity/,
);
assert.throws(
  () =>
    parseAnzEvent(page.replace("<th>Place</th>", "<th>Category</th>"), profile, profile.events[0]),
  /columns/,
);
assert.throws(
  () => parseAnzEvent(page.replace("10 Mar 2025", "31 Feb 2025"), profile, profile.events[0]),
  /date/,
);
assert.throws(
  () =>
    parseAnzEvent(page + '<div class="pagination"><a>Next</a></div>', profile, profile.events[0]),
  /paginated/,
);
for (const bad of [
  url.replace("www.anzrankings.org.nz", "www.anzrankings.org.nz.evil.test"),
  url.replace("https:", "http:"),
  url.replace("www.", "user@www."),
  url.replace(".nz/", ".nz:444/"),
])
  assert.throws(() => anzSource(bad));
const capture = assembleAnzCapture(profile, [rows], "2026-10-11T07:00:00Z");
assert.equal(anzProgress([capture.history])[0].best.performance, "10:01.23");
for (const patch of [
  { verificationStatus: "unverified" },
  { profileExcluded: true },
  { performance: "DNF" },
  { performance: "10:01.23i" },
  { wind: "+2.1" },
  { discipline: "Shot Put" },
  { labels: ["ANZ note: short course"] },
  { date: "2099-01-01" },
  { performance: "1:99" },
])
  assert.equal(anzTime({ ...rows[0], ...patch }), null);
assert.equal(
  anzProgress([
    {
      ...capture.history,
      performances: [
        { ...rows[0], discipline: "10000m" },
        { ...rows[0], discipline: "10km" },
      ],
    },
  ]).length,
  2,
);
assert.equal(
  publicAnzMedals(
    { anzImport: { verificationStatus: "source_verified", medals: profile.medals } },
    [capture.history],
  ).length,
  1,
);
assert.equal(
  publicAnzMedals(
    { anzImport: { verificationStatus: "source_verified", medals: profile.medals } },
    [],
  ).length,
  0,
);
assert.equal(
  publicAnzMedals(
    { anzImport: { verificationStatus: "source_verified", medals: profile.medals } },
    [{ ...capture.history, performances: rows.map((row) => ({ ...row, profileExcluded: true })) }],
  ).length,
  0,
);
const db = new PGlite();
await db.waitReady;
await db.exec(`create table athletes(id int primary key,display_name text,slug text,profile_visibility text,source_url text,profile_details jsonb);
create table athlete_account_links(athlete_id int,status text);
create table athlete_source_identities(provider text constraint athlete_source_identities_provider_check check(provider in ('worldathletics','powerof10','parkrun','athleticsurn')),external_id text,athlete_id int,source_url text,primary key(provider,external_id));
create table athlete_source_histories(athlete_id int,provider text,external_id text,source_url text,captured_at timestamptz,complete boolean,years_expected int[],years_captured int[],performances jsonb,published_at timestamptz,primary key(athlete_id,provider,external_id),unique(provider,external_id));
create table network_audit_log(actor_user_id text,actor_email text,action text,entity_type text,entity_id text,before_value jsonb,after_value jsonb,note text);`);
await db.exec(readFileSync("migrations/20261011_anz_source_identity.sql", "utf8"));
let failAudit = false;
function adapt(conn) {
  const query = async (text, values = []) => {
    if (/pg_advisory_xact_lock/.test(text)) return [];
    if (failAudit && /insert into network_audit_log/.test(text)) throw Error("audit failure");
    return (await conn.query(text, values)).rows;
  };
  const sql = async (strings, ...values) =>
    query(
      strings.reduce((s, v, i) => s + (i ? "$" + i : "") + v, ""),
      values,
    );
  sql.query = query;
  sql.transaction = (fn) => db.transaction((tx) => fn(adapt(tx)));
  return sql;
}
const sql = adapt(db);
await sql`insert into athletes values(1,'Avery Example','avery-example','private',${url},'{"coachProfileSlug":"example-coach","nationality":"Athlete supplied"}')`;
const before = await anzTarget(sql, 1, capture);
const receipt = await saveAnzCapture(sql, 1, capture, before.version, {
  note: "Synthetic authorised test",
});
assert.equal(receipt.performances, 2);
assert.equal(receipt.published, false);
assert.equal((await sql`select count(*)::int as n from network_audit_log`)[0].n, 1);
assert.equal(
  (await sql`select profile_details from athletes`)[0].profile_details.nationality,
  "Athlete supplied",
);
await assert.rejects(
  () => saveAnzCapture(sql, 1, capture, before.version, { note: "stale" }),
  /changed/,
);
const refresh = await anzTarget(sql, 1, capture);
await saveAnzCapture(sql, 1, capture, refresh.version, { note: "repeat" });
assert.equal(
  (await sql`select jsonb_array_length(performances) as n from athlete_source_histories`)[0].n,
  2,
);
await assert.rejects(() => anzTarget(sql, 1, { ...capture, name: "Another Person" }), /name/);
await assert.rejects(
  () =>
    anzTarget(sql, 1, { ...capture, history: { ...capture.history, performances: rows.slice(1) } }),
  /missing/,
);
await sql`update athlete_source_histories set performances=jsonb_set(performances,'{0,profileExcluded}','true'),published_at=now()`;
await sql`update athletes set profile_visibility='public'`;
let target = await anzTarget(sql, 1, capture);
const publicReceipt = await saveAnzCapture(sql, 1, capture, target.version, {
  note: "preserve exclusion",
});
assert.equal(publicReceipt.published, true);
assert.equal(
  (await sql`select performances from athlete_source_histories`)[0].performances[0].profileExcluded,
  true,
);
target = await anzTarget(sql, 1, capture);
failAudit = true;
await assert.rejects(
  () => saveAnzCapture(sql, 1, capture, target.version, { note: "rollback" }),
  /audit failure/,
);
failAudit = false;
assert.equal((await anzTarget(sql, 1, capture)).version, target.version);
await sql`insert into athlete_account_links values(1,'active')`;
await assert.rejects(() => anzTarget(sql, 1, capture), /owner/);
await db.close();
console.log(
  "ANZ parser, source evidence, PB eligibility, privacy, refresh, stale preview and transaction rollback tests passed.",
);
