import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  combineProfileResults,
  eligiblePerformance,
  findPersonalBests,
  performanceGroup,
} from "../src/lib/athrecs/profile-records.ts";
import {
  sourceIdentityFromUrl,
  validateProfileConnection,
} from "../src/lib/athrecs/profile-connections.ts";
import { formatAthleteId, parseAthleteId } from "../src/lib/athrecs/athlete-id.ts";

assert.equal(formatAthleteId("123"), "ATH-000123");
assert.equal(formatAthleteId("1234567"), "ATH-1234567");
assert.equal(formatAthleteId("9223372036854775807"), "ATH-9223372036854775807");
assert.equal(parseAthleteId(" ath-000123 "), "123");
assert.equal(parseAthleteId("ATH-9223372036854775807"), "9223372036854775807");
for (const invalid of [
  "ATH-000000",
  "123",
  "ATH-1.1",
  "ATH-1%",
  "ATH--1",
  "ATH-12345678901234567890",
])
  assert.equal(parseAthleteId(invalid), null);

const result = {
  resultId: 1,
  editionId: 1,
  athleteName: "Alex Runner",
  eventName: "City 10K",
  eventSlug: "city-10k",
  sport: "Running",
  surface: "Road",
  country: "United Kingdom",
  eventDate: "2026-06-01",
  distanceCode: "10K",
  distanceKm: 10,
  status: "finished",
  finishTimeSeconds: 2700,
  chipTimeSeconds: 2700,
  gunTimeSeconds: 2704,
  overallPlace: 100,
  category: "M40",
  sourceUrls: ["https://timer.example/result/1"],
};
const combined = combineProfileResults([
  result,
  {
    ...result,
    resultId: 2,
    athleteName: "Alex Previous",
    sourceUrls: ["https://organiser.example/result/1"],
  },
]);
assert.equal(combined.length, 1);
assert.deepEqual(combined[0].sourceResultIds, [1, 2]);
assert.equal(combined[0].sourceUrls.length, 2);
assert.equal(combined[0].conflicting, false);
assert.equal(result.sourceUrls.length, 1, "Combining must not mutate source records");
const conflicting = combineProfileResults([
  result,
  { ...result, resultId: 3, finishTimeSeconds: 2600 },
]);
assert.equal(conflicting.length, 2);
assert.ok(conflicting.every((item) => item.conflicting));
assert.equal(findPersonalBests(conflicting).length, 0, "Conflicting sources cannot establish a PB");
assert.equal(eligiblePerformance({ ...result, status: "dnf" }), false);
assert.equal(eligiblePerformance({ ...result, finishTimeSeconds: 0 }), false);
assert.equal(eligiblePerformance({ ...result, distanceCode: "Ultra" }), false);
assert.equal(eligiblePerformance({ ...result, surface: "Cross country" }), false);
assert.notEqual(performanceGroup(result), performanceGroup({ ...result, surface: "Track" }));
assert.notEqual(performanceGroup(result), performanceGroup({ ...result, sport: "Cycling" }));
assert.notEqual(performanceGroup(result), performanceGroup({ ...result, finishTimeSeconds: 2704 }));
for (const [distanceCode, exact, rounded] of [
  ["Marathon", 42.195, 42.2],
  ["Half", 21.0975, 21.1],
  ["10mi", 16.09344, 16.1],
  ["20mi", 32.18688, 32.19],
  ["20mi", 32.18688, 32.2],
]) {
  const precise = { ...result, distanceCode, distanceKm: exact };
  assert.equal(
    performanceGroup(precise),
    performanceGroup({ ...precise, distanceKm: rounded }),
    "Conventional rounding of a standard distance must not create a second PB",
  );
  assert.notEqual(
    performanceGroup(precise),
    performanceGroup({ ...precise, distanceKm: exact - 0.2 }),
    "A materially shorter race must remain separate",
  );
}
assert.equal(
  findPersonalBests([
    result,
    { ...result, resultId: 4, editionId: 2, finishTimeSeconds: 2690, chipTimeSeconds: 2690 },
  ])[0].resultId,
  4,
);

const halfMarathon = {
  ...result,
  distanceCode: "Half",
  distanceKm: 21.0975,
  chipTimeSeconds: null,
  gunTimeSeconds: null,
};
const slowerAthleticsHalf = {
  ...halfMarathon,
  resultId: 10,
  editionId: 10,
  eventName: "City Half Marathon",
  sport: "Athletics",
  finishTimeSeconds: 7500,
};
const chipHalf = {
  ...halfMarathon,
  resultId: 11,
  editionId: 11,
  eventName: "Coastal Half Marathon",
  distanceKm: 21.1,
  finishTimeSeconds: 6000,
  chipTimeSeconds: 6000,
};
const fastestHalf = {
  ...halfMarathon,
  resultId: 12,
  editionId: 12,
  eventName: "River Half Marathon",
  finishTimeSeconds: 5100,
  resultSource: "athlete",
};
for (const halves of [
  [slowerAthleticsHalf, chipHalf, fastestHalf],
  [fastestHalf, chipHalf, slowerAthleticsHalf],
]) {
  assert.deepEqual(
    findPersonalBests(combineProfileResults(halves)),
    combineProfileResults([fastestHalf]),
    "Road-running PBs must choose the fastest result across Athletics/Running and timing labels",
  );
}
assert.deepEqual(
  findPersonalBests([chipHalf, { ...slowerAthleticsHalf, finishTimeSeconds: 4800 }]).map(
    (item) => item.resultId,
  ),
  [slowerAthleticsHalf.resultId],
  "A faster Athletics road result must also be able to establish the running PB",
);
assert.notEqual(
  performanceGroup(chipHalf),
  performanceGroup(fastestHalf),
  "Progress must retain separate timing comparisons",
);
const marathon = { ...result, distanceCode: "Marathon", distanceKm: 42.195 };
assert.deepEqual(
  findPersonalBests([
    {
      ...marathon,
      resultId: 20,
      editionId: 20,
      finishTimeSeconds: 15000,
      chipTimeSeconds: null,
      gunTimeSeconds: null,
    },
    { ...marathon, resultId: 21, editionId: 21, finishTimeSeconds: 12600, chipTimeSeconds: 12600 },
    {
      ...marathon,
      resultId: 22,
      editionId: 22,
      finishTimeSeconds: 13500,
      chipTimeSeconds: null,
      gunTimeSeconds: 13500,
    },
  ]).map((item) => item.resultId),
  [21],
  "Chip, gun and unspecified timing must produce one fastest marathon",
);
assert.equal(
  findPersonalBests([
    result,
    { ...result, resultId: 30, sport: "Cycling" },
    { ...result, resultId: 31, sport: "Parkrun" },
    { ...result, resultId: 32, surface: "Track" },
    { ...result, resultId: 33, sport: "Athletics", surface: "Track" },
    { ...result, resultId: 34, distanceKm: 9.8 },
  ]).length,
  6,
  "PB summaries must keep other sports, track and materially different distances separate",
);
assert.deepEqual(
  findPersonalBests([
    chipHalf,
    { ...fastestHalf, conflicting: true },
    { ...fastestHalf, status: "dnf" },
    { ...fastestHalf, surface: "Trail" },
    { ...fastestHalf, surface: "Mixed" },
    { ...fastestHalf, surface: "Unknown" },
    { ...fastestHalf, finishTimeSeconds: 0 },
  ]),
  [chipHalf],
  "An invalid or non-comparable faster result must not replace the PB",
);

assert.deepEqual(
  sourceIdentityFromUrl("https://worldathletics.org/athletes/ireland/example-name-12345"),
  { provider: "worldathletics", externalId: "12345" },
);
assert.deepEqual(
  sourceIdentityFromUrl("https://thepowerof10.info/athletes/profile.aspx?athleteid=987"),
  { provider: "powerof10", externalId: "987" },
);
assert.equal(
  sourceIdentityFromUrl(
    "https://worldathletics.org.attacker.example/athletes/ireland/example-12345",
  ),
  null,
);
assert.equal(sourceIdentityFromUrl("javascript:alert(1)"), null);
assert.equal(
  validateProfileConnection({
    platform: "instagram",
    url: "https://www.instagram.com/runner/?tracking=1",
    sharePublicly: false,
  }).url,
  "https://www.instagram.com/runner/",
);
assert.throws(() =>
  validateProfileConnection({
    platform: "instagram",
    url: "https://instagram.com.attacker.example/runner/",
    sharePublicly: false,
  }),
);
assert.throws(() =>
  validateProfileConnection({
    platform: "linkedin",
    url: "javascript:alert(1)",
    sharePublicly: true,
  }),
);

const db = new PGlite();
await db.waitReady;
const migrationNames = (await readdir(new URL("../migrations/", import.meta.url)))
  .filter((name) => name.endsWith(".sql"))
  .sort();
for (const name of migrationNames) {
  // Simulate an upgrade with existing athletes, then verify automatic IDs for
  // subsequent inserts below.
  if (name !== "0030_athlete_identifiers.sql")
    await db.exec(await readFile(new URL(`../migrations/${name}`, import.meta.url), "utf8"));
}
await db.exec(`
  insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
  values ('profile-a', 'Alex Runner', 'a@example.test', true, now(), now()),
         ('profile-b', 'Blake Runner', 'b@example.test', true, now(), now());
  insert into athlete_private_profiles (user_id, verified_email, full_name, privacy_notice_version, privacy_acknowledged_at)
  values ('profile-a', 'a@example.test', 'Alex Runner', 'test', now());
  insert into athletes (id, slug, display_name, source_url)
  values (1, 'alex', 'Alex Runner', 'https://worldathletics.org/athletes/test/alex-12345'),
         (2, 'duplicate-a', 'Duplicate A', 'https://worldathletics.org/athletes/test/duplicate-99999'),
         (3, 'duplicate-b', 'Duplicate B', 'https://worldathletics.org/athletes/test/duplicate-99999');
`);
const migration = await readFile(
  new URL("../migrations/0029_unified_athlete_profiles.sql", import.meta.url),
  "utf8",
);
await db.exec(migration);
const identities = await db.query(
  "select provider, external_id, athlete_id from athlete_source_identities order by external_id",
);
assert.deepEqual(identities.rows, [
  { provider: "worldathletics", external_id: "12345", athlete_id: 1 },
]);
await assert.rejects(
  db.query(
    "insert into athlete_source_identities (provider, external_id, athlete_id) values ('worldathletics','12345',2)",
  ),
  /duplicate|unique/i,
);
const before = (
  await db.query(
    "select athlete_profile_id from athlete_private_profiles where user_id='profile-a'",
  )
).rows[0].athlete_profile_id;
await db.exec(
  "update athlete_private_profiles set full_name='Alex Previous' where user_id='profile-a'",
);
assert.equal(
  (
    await db.query(
      "select athlete_profile_id from athlete_private_profiles where user_id='profile-a'",
    )
  ).rows[0].athlete_profile_id,
  before,
);
await db.exec(`
  insert into athlete_profile_connections (user_id, platform, url) values ('profile-a','instagram','https://www.instagram.com/example/');
  insert into athlete_match_dismissals (user_id, athlete_id) values ('profile-a', 1);
`);
assert.equal(
  (await db.query("select * from athlete_profile_connections where share_publicly=true")).rows
    .length,
  0,
);
assert.equal(
  (await db.query("select * from athlete_profile_connections where user_id='profile-b'")).rows
    .length,
  0,
);
assert.equal(
  (await db.query("select * from athlete_match_dismissals where user_id='profile-b'")).rows.length,
  0,
);
await db.exec("delete from athlete_match_dismissals where user_id='profile-a' and athlete_id=1");
assert.equal(
  (await db.query("select * from athletes where id=1")).rows.length,
  1,
  "Dismissal changes cannot delete athlete records",
);
const identifierMigration = await readFile(
  new URL("../migrations/0030_athlete_identifiers.sql", import.meta.url),
  "utf8",
);
await db.exec(identifierMigration);
const identifiers = (
  await db.query(
    "select number::text, athlete_id, user_id from athlete_identifiers order by number",
  )
).rows;
assert.equal(identifiers.length, 5, "All existing athletes and accounts get an ID");
assert.equal(new Set(identifiers.map((row) => row.number)).size, 5);
await db.exec(identifierMigration);
assert.deepEqual(
  (
    await db.query(
      "select number::text, athlete_id, user_id from athlete_identifiers order by number",
    )
  ).rows,
  identifiers,
  "Reapplying the backfill must not renumber anyone",
);
const accountNumber = identifiers.find((row) => row.user_id === "profile-a").number;
const sourceNumber = identifiers.find((row) => row.athlete_id === 1).number;
await db.exec(`
  insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    values ('profile-c', 'New Runner', 'c@example.test', true, now(), now());
  insert into athletes (id, slug, display_name) values (4, 'alex-new', 'Alex Runner');
  insert into athlete_account_links (athlete_id, user_id, user_email)
    values (1, 'profile-a', 'a@example.test'), (2, 'profile-a', 'a@example.test'),
           (3, 'profile-b', 'b@example.test');
`);
assert.equal((await db.query("select count(*)::int as n from athlete_identifiers")).rows[0].n, 7);
assert.equal(
  (await db.query("select count(*)::int as n from athlete_private_profiles")).rows[0].n,
  1,
  "Assigning IDs cannot manufacture profile onboarding or privacy consent",
);
let resolved = (
  await db.query(
    "select athlete_id, athlete_number::text, source_number::text from athlete_resolved_ids order by athlete_id",
  )
).rows;
assert.equal(resolved[0].athlete_number, accountNumber);
assert.equal(resolved[1].athlete_number, accountNumber, "Approved aliases share the account ID");
assert.equal(resolved[0].source_number, sourceNumber, "Source reference is retained as an alias");
assert.notEqual(resolved[2].athlete_number, accountNumber, "Another account has its own ID");
assert.notEqual(
  resolved[3].athlete_number,
  accountNumber,
  "A name match is not proof of ownership",
);
await db.exec(`
  update athletes set display_name='Alex New Name' where id=1;
  insert into athletes (id, slug, display_name) values (1, 'alex', 'Alex New Name')
    on conflict (id) do update set display_name=excluded.display_name;
  update athlete_account_links set status='revoked' where athlete_id=1;
`);
resolved = (
  await db.query(
    "select athlete_id, athlete_number::text from athlete_resolved_ids order by athlete_id",
  )
).rows;
assert.equal(resolved[0].athlete_number, sourceNumber);
assert.equal(
  resolved[1].athlete_number,
  accountNumber,
  "Unlinking one source cannot change the account ID",
);
assert.deepEqual(
  (
    await db.query(
      "select number::text, athlete_id, user_id from athlete_identifiers where athlete_id in (1,2,3) or user_id in ('profile-a','profile-b') order by number",
    )
  ).rows,
  identifiers,
  "Names, imports and ownership changes cannot reassign permanent registry numbers",
);
await db.close();
console.log(
  "Unified profiles verified: complete fresh migrations, stable IDs, unique source mappings, private connections and dismissals, safe duplicates and comparable PBs.",
);
