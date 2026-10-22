import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { parseAnzProfile, parseAnzEvent, assembleAnzCapture } from "../src/lib/anz/parse.server.ts";
import { anzSource, anzTime, anzProgress, publicAnzMedals } from "../src/lib/anz/core.ts";
import { anzTarget, saveAnzCapture } from "../src/lib/anz/store.server.ts";
import { profilePersonalBestSummary } from "../src/lib/athrecs/profile-personal-best-summary.ts";
import { profileAchievementResults } from "../src/lib/athrecs/profile-history-results.ts";
import { withoutProfileEvidence } from "../src/lib/athrecs/profile-evidence.ts";
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

// Exercise the real parser-to-profile path: a verified road result must beat a
// slower, explicitly labelled pacing result without merging with track 10000m.
function eventRows(name, performance, note = "", meeting = "Synthetic competition") {
  const eventIdentity = identity.replace('value="9">3000m', `value="9">${name}`);
  const eventProfile = parseAnzProfile(eventIdentity, url);
  return parseAnzEvent(
    eventIdentity +
      `<h2>${name} - All Years</h2>` +
      table(headers, [["10 Mar 2025", meeting, "2", performance, "1", "", "Example town", note]]),
    eventProfile,
    eventProfile.events[0],
  );
}
const roadRows = eventRows("10km", "35:12", "PB");
const halfRows = eventRows("Half Marathon", "1:17:01", "PB");
const trackRows = eventRows("10000m", "36:08.42", "PB");
const pbHistory = (performances) => [{ ...capture.history, performances }];
const pacer = {
  ...roadRows[0],
  date: "2024-03-10",
  year: 2024,
  performance: "44:00",
  meeting: "Synthetic pacing appearance",
  labels: ["Road", "Pacer"],
};
const importedBests = profilePersonalBestSummary(
  [],
  pbHistory([...roadRows, ...halfRows, ...trackRows, pacer]),
);
assert.equal(importedBests.find((best) => best.distance === "10K")?.mark, "35:12");
assert.equal(importedBests.find((best) => best.distance === "Half")?.mark, "1:17:01");
assert.equal(importedBests.find((best) => best.distance === "10000m")?.mark, "36:08.42");
assert.equal(importedBests.length, 3);
assert(importedBests.every((best) => best.verified));
assert.deepEqual(
  profilePersonalBestSummary(
    [],
    withoutProfileEvidence(pbHistory([...roadRows, ...halfRows, ...trackRows, pacer])),
  ),
  importedBests,
);
assert(!JSON.stringify(importedBests).includes("anzrankings"));
for (const discipline of ["3km", "5km", "10km", "Half Marathon", "Marathon", "1 Mile (Road)"])
  assert(eventRows(discipline, "35:12")[0].labels.includes("Road"), discipline);
for (const discipline of ["10000m", "Mile", "10km XC", "10km Trail", "10km Relay Leg", "Unknown"])
  assert(!eventRows(discipline, "35:12")[0].labels.includes("Road"), discipline);
const unknownRoad = { ...roadRows[0], providerName: "Synthetic generic source", labels: [] };
assert.equal(profileAchievementResults([], pbHistory([unknownRoad]))[0].surface, "Unknown");
assert.equal(profilePersonalBestSummary([], pbHistory([unknownRoad])).length, 0);
for (const note of ["Short course", "Assisted", "DH", "PB DH"]) {
  const qualified = pbHistory(eventRows("10km", "30:00", note));
  assert.equal(profilePersonalBestSummary([], qualified).length, 0, note);
  assert.equal(anzProgress(qualified).length, 0, note);
}
for (const patch of [
  { profileExcluded: true },
  { performance: "DNF" },
  { date: "2099-01-01" },
  { labels: [...roadRows[0].labels, "Trail"] },
])
  assert.equal(profilePersonalBestSummary([], pbHistory([{ ...roadRows[0], ...patch }])).length, 0);
const pendingRoad = profilePersonalBestSummary(
  [],
  pbHistory([{ ...roadRows[0], verificationStatus: "unverified" }]),
);
assert.equal(pendingRoad[0].mark, "35:12");
assert.equal(pendingRoad[0].verified, false);

assert.equal(anzProgress([capture.history])[0].best.performance, "10:01.23");
assert.equal(
  anzTime({ ...rows[0], verificationStatus: "unverified" }),
  601.23,
  "Recorded performances contribute to PBs before verification",
);
for (const patch of [
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
// Refresh a legacy road history without surface labels; saved source facts and
// publication remain intact while the new labels reach the PB selector.
const refreshedCapture = {
  ...capture,
  history: { ...capture.history, performances: [...rows, ...roadRows, ...halfRows] },
};
const legacy = refreshedCapture.history.performances.map((row) => ({
  ...row,
  labels: row.labels.filter((label) => label !== "Road"),
}));
legacy[0].profileExcluded = true;
await sql`update athlete_source_histories set performances=${JSON.stringify(legacy)}::jsonb`;
target = await anzTarget(sql, 1, refreshedCapture);
await saveAnzCapture(sql, 1, refreshedCapture, target.version, {
  note: "Source surface correction",
});
const refreshed = (await sql`select performances,published_at from athlete_source_histories`)[0];
assert(refreshed.published_at);
assert(refreshed.performances[0].profileExcluded);
assert.deepEqual(
  refreshed.performances.map((row) => row.performance),
  legacy.map((row) => row.performance),
);
const refreshedBests = profilePersonalBestSummary([], pbHistory(refreshed.performances));
assert.equal(refreshedBests.find((best) => best.distance === "10K")?.mark, "35:12");
assert.equal(refreshedBests.find((best) => best.distance === "Half")?.mark, "1:17:01");
const refreshAudit = (
  await sql`select before_value from network_audit_log where note='Source surface correction'`
)[0];
assert.deepEqual(refreshAudit.before_value.history.performances, legacy);
target = await anzTarget(sql, 1, refreshedCapture);
failAudit = true;
await assert.rejects(
  () => saveAnzCapture(sql, 1, refreshedCapture, target.version, { note: "rollback" }),
  /audit failure/,
);
failAudit = false;
assert.equal((await anzTarget(sql, 1, refreshedCapture)).version, target.version);
await sql`insert into athletes values(2,'Another Athlete','another-athlete','private',${url},'{}')`;
await assert.rejects(() => anzTarget(sql, 1, capture), /duplicate/);
await sql`delete from athletes where id=2`;
await sql`update athletes set display_name='李明' where id=1`;
await assert.rejects(() => anzTarget(sql, 1, { ...capture, name: "王芳" }), /name/);
await sql`update athletes set display_name='Avery Example' where id=1`;
await sql`insert into athlete_account_links values(1,'active')`;
await assert.rejects(() => anzTarget(sql, 1, capture), /owner/);
await db.close();
console.log(
  "ANZ parser, source evidence, PB eligibility, privacy, refresh, stale preview and transaction rollback tests passed.",
);
