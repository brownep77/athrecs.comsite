import assert from "node:assert/strict";
import {
  editorialLocationOptions, editorialPath, filterEditorialArticles, parseEditorialSearch,
} from "../src/lib/athrecs/editorial.ts";

const article = (slug, kind, date, locations, sports = ["road-running"]) => ({
  slug, kind, date, locations, sports, title: slug, displayDate: date, standfirst: "", body: [],
});
const stories = [
  article("two-locations", "race-reports", "2026-09-01", [
    { country: "England", area: "East of England", county: "Norfolk" },
    { country: "England", area: "London", county: "Greater London" },
  ]),
  article("announcement", "news", "2026-09-02", [{ country: "Ireland", area: "Leinster", county: "Dublin" }]),
  article("later", "race-reports", "2026-09-03", [{ country: "England" }], ["trail-running"]),
];
const find = (kind, filters) => filterEditorialArticles(stories, kind, filters).map((story) => story.slug);
assert.deepEqual(find("race-reports", {}), ["later", "two-locations"]);
assert.deepEqual(find("news", {}), ["announcement"]);
assert.deepEqual(find("race-reports", { sport: "road-running", country: "England", area: "East of England", county: "Norfolk" }), ["two-locations"]);
assert.deepEqual(find("race-reports", { country: "England", area: "London", county: "Norfolk" }), [], "Must match one complete location, not mix two locations");
assert.deepEqual(find("race-reports", { sport: "trail-running", county: "Norfolk" }), []);
assert.deepEqual(find("race-reports", { country: "Unlisted country" }), [], "Unknown filters must not widen the search");
assert.deepEqual(editorialLocationOptions(stories, { country: "England", area: "East of England" }).counties, ["Norfolk"]);
assert.deepEqual(editorialLocationOptions(stories, { country: "Ireland" }).areas, ["Leinster"]);
assert.deepEqual(editorialLocationOptions(stories, {}).counties, []);
assert.deepEqual(parseEditorialSearch({ country: " England ", area: [], county: "", sport: 1 }), { country: "England" });
assert.equal(parseEditorialSearch({ country: "x".repeat(200) }).country.length, 100);
assert.equal(editorialPath(stories[0]), "/race-reports/two-locations");
assert.equal(editorialPath(stories[1]), "/news/announcement");
console.log("Editorial types, sport/location filtering, multi-location isolation and newest-first order verified.");
