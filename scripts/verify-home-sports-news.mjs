import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
assert.equal(
  homeRegionLabel({ country: "Ireland", county: "Ireland" }),
  "Ireland",
);

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
assert.match(homepage, /Every sport, counted/);
assert.match(homepage, /Sport news & regional updates/);
assert.match(homepage, /SPORTS\.map/);
assert.doesNotMatch(homepage, /dangerouslySetInnerHTML/);

const api = await readFile(resolve(root, "src/lib/athrecs/api.ts"), "utf8");
const updatesStart = api.indexOf("export const getHomeSportUpdates");
assert.notEqual(updatesStart, -1);
const nextExport = api.indexOf("export const ", updatesStart + 20);
const updatesSource = api.slice(updatesStart, nextExport === -1 ? undefined : nextExport);
assert.match(updatesSource, /from edition_result_links/);
assert.match(updatesSource, /from events event/);
assert.doesNotMatch(updatesSource, /fetch\(|rss|newsapi/i);

console.log("Homepage all-sport counts and copyright-safe regional updates verified");
