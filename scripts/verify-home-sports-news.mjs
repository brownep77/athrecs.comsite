import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import {
  homeRegionLabel,
  PRIORITY_HOME_SPORTS,
  selectBalancedHomeUpdates,
} from "../src/lib/athrecs/home-updates.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const update = (id, sport, county = "Norfolk") => ({
  id,
  kind: "fixture",
  sport,
  eventSlug: id,
  eventName: id,
  country: "England",
  county,
  city: "Norwich",
  eventDate: "2026-09-01",
  distance: "10K",
  status: "Open",
  providerName: null,
  publishedAt: "2026-08-20T12:00:00Z",
});

assert.deepEqual(PRIORITY_HOME_SPORTS, ["Running", "Athletics", "Triathlon", "Cycling"]);
assert.equal(homeRegionLabel(update("run", "Running")), "Norfolk, England");
assert.equal(homeRegionLabel({ country: "Ireland", county: "Ireland" }), "Ireland");

const feed = [
  update("run-1", "Running"),
  update("run-2", "Running"),
  update("athletics-1", "Athletics"),
  update("triathlon-1", "Triathlon"),
  update("cycling-1", "Cycling"),
  update("rowing-1", "Rowing"),
];
assert.deepEqual(
  selectBalancedHomeUpdates(feed, "All", "All", 5).map(({ id }) => id),
  ["run-1", "athletics-1", "triathlon-1", "cycling-1", "rowing-1"],
);
assert.deepEqual(
  selectBalancedHomeUpdates(feed, "Running", "Norfolk, England").map(({ id }) => id),
  ["run-1", "run-2"],
);

const homepage = await readFile(resolve(root, "src/routes/index.tsx"), "utf8");
const discovery = await readFile(
  resolve(root, "src/components/discovery/CompactDiscoveryPage.tsx"),
  "utf8",
);
const header = await readFile(
  resolve(root, "src/components/discovery/CompactDiscoveryHeader.tsx"),
  "utf8",
);
const navigation = await readFile(
  resolve(root, "src/components/discovery/discovery-navigation.ts"),
  "utf8",
);
assert.match(homepage, /getRunningFixtures\(\{\s*data:\s*deps\s*\}\)/);
assert.match(homepage, /parseSportFixtureSearch\(raw\)/);
assert.match(homepage, /<CompactDiscoveryPage\b/);
assert.match(discovery, /\/results\?category=all-running/);
assert.match(header, /QUICK_SPORTS\.map/);
for (const path of [
  "/sports/track-and-field",
  "/sports/triathlon",
  "/sports/road-cycling",
  "/sports/swimming",
  "/sports/duathlon",
  "/sports/parkrun",
  "/?distance=Ultra",
]) {
  assert(navigation.includes(`path: "${path}"`), `Missing sport shortcut ${path}`);
}
assert.doesNotMatch(homepage, /dangerouslySetInnerHTML/);
assert.doesNotMatch(discovery, /dangerouslySetInnerHTML/);
assert.doesNotMatch(header, /dangerouslySetInnerHTML/);

const api = await readFile(resolve(root, "src/lib/athrecs/api.ts"), "utf8");
const updatesStart = api.indexOf("export const getHomeSportUpdates");
assert.notEqual(updatesStart, -1);
const nextExport = api.indexOf("export const ", updatesStart + 20);
const updatesSource = api.slice(updatesStart, nextExport === -1 ? undefined : nextExport);
assert.match(updatesSource, /from edition_result_links/);
assert.match(updatesSource, /from events event/);
assert.doesNotMatch(updatesSource, /fetch\(|rss|newsapi/i);

// Execute the real feed query against a disposable catalogue. Future, held,
// unverified and alias result links must never become public results updates.
const query = updatesSource.match(/const rows = await sql<[\s\S]*?>`([\s\S]*?)`;/)?.[1];
assert.ok(query, "Feed query must be available for the database regression check");
const db = new PGlite();
try {
  await db.exec(`
    create table events (id int, slug text, name text, sport text, country text, county text, city text);
    create table editions (id int, event_id int, event_date date, distance_code text, distance_km numeric, status text);
    create table edition_result_links (id int, edition_id int, provider_name text, results_url text, checked_at timestamptz, is_verified boolean, status text);
    insert into events select id, 'event-' || id, 'Event ' || id, 'Running', 'England', 'Norfolk', 'Norwich' from generate_series(1, 7) id;
    insert into editions values
      (1, 1, '2026-11-02', '10K', 10, 'Open'),
      (2, 2, '2026-10-31', '10K', 10, 'Open'),
      (3, 3, '2026-11-01', 'Other', null, 'Open'),
      (4, 4, '2026-10-20', '10K', 10, 'Finished'),
      (5, 5, '2026-10-21', '10K', 10, 'Finished'),
      (6, 6, '2026-11-01', '10K', 10, 'Open'),
      (7, 7, '2026-10-22', '10K', 10, 'Finished');
    insert into edition_result_links values
      (1, 1, 'Synthetic Timer', 'https://example.org/future', '2026-10-30', true, 'approved'),
      (2, 4, 'Synthetic Timer', 'https://example.org/verified', '2026-10-29', true, 'approved'),
      (3, 4, 'Synthetic Timer', 'https://example.org/held', '2026-10-30', true, 'held'),
      (4, 5, 'Synthetic Timer', 'https://example.org/alias', '2026-10-30', true, 'approved'),
      (5, 7, 'Synthetic Timer', 'https://example.org/unverified', '2026-10-30', false, 'approved');
  `);
  const sql = async (parts, ...values) => {
    const statement = parts.reduce((text, part, i) => text + (i ? `$${i}` : "") + part, "");
    return (await db.query(statement, values)).rows;
  };
  const rows = await new Function(
    "sql",
    "today",
    "heldDistanceIds",
    "withheldFixtureDateKeys",
    "retainedFixtureAliasSlugs",
    "PLACEHOLDER",
    "RACE_FORMAT",
    `return sql\`${query}\`;`,
  )(sql, "2026-10-30", [3], ["event-6|2026-11-01"], ["event-5"], /other/i, /race/i);
  assert.deepEqual(
    rows.filter((row) => row.kind === "fixture").map((row) => row.event_slug),
    ["event-2", "event-1"],
    "Only publish eligible fixtures, earliest first",
  );
  const results = rows.filter((row) => row.kind === "results");
  assert.equal(results.length, 1, "Only a past approved, verified, non-alias result may appear");
  assert.equal(
    results[0].results_url,
    "https://example.org/verified",
    "Retain the original provider link",
  );
  assert.equal(results[0].provider_name, "Synthetic Timer");
} finally {
  await db.close();
}

console.log(
  "Compact Running homepage, sport/result shortcuts and copyright-safe regional updates verified",
);
