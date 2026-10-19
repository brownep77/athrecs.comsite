import assert from "node:assert/strict";
import { mergeWorldAthleticsRefresh } from "./lib/world-athletics-refresh.mjs";

const series = (id, slug, name = slug) => ({
  slug,
  name,
  website: `https://worldathletics.org/competition/calendar-results/results/${id}`,
});
const edition = (slug, date) => ({ seriesSlug: slug, date, distance: "Track & field" });
const original = [series(1, "stable"), series(2, "absent")];
const dates = [edition("stable", "2027-06-18"), edition("absent", "2027-05-01")];
const refresh = [
  { series: series(1, "renamed", "New name"), editions: [edition("renamed", "2027-06-25")] },
  { series: series(3, "new"), editions: [edition("new", "2027-07-01")] },
];
const merged = mergeWorldAthleticsRefresh(original, dates, refresh);
assert.deepEqual(merged.series.slice(0, 2), original, "Retain existing and missing identities");
assert.deepEqual(merged.editions.slice(0, 2), dates, "Never silently replace live dates");
assert.equal(merged.added.length, 1);
assert.equal(merged.review.length, 1);
assert.equal(merged.review[0].proposed.series.slug, "stable");
assert.equal(merged.review[0].proposed.editions[0].seriesSlug, "stable");
assert.equal(merged.review[0].proposed.editions[0].date, "2027-06-25");
const repeated = mergeWorldAthleticsRefresh(merged.series, merged.editions, refresh);
assert.deepEqual(repeated.series, merged.series);
assert.deepEqual(repeated.editions, merged.editions);
assert.equal(repeated.added.length, 0);
assert.throws(
  () => mergeWorldAthleticsRefresh(original, dates, [refresh[0], refresh[0]]),
  /Duplicate refreshed/,
);
assert.throws(
  () =>
    mergeWorldAthleticsRefresh(original, dates, [{ series: series(9, "stable"), editions: [] }]),
  /Slug collision/,
);
const duplicate = mergeWorldAthleticsRefresh([...original, series(1, "legacy-alias")], dates, [
  refresh[0],
]);
assert.equal(duplicate.duplicates.length, 1);
assert.equal(duplicate.added.length, 0);
assert.equal(duplicate.review.length, 1);
const nameCollision = mergeWorldAthleticsRefresh(original, dates, [
  {
    series: series(10, "another-source-id", "stable"),
    editions: [edition("another-source-id", "2027-09-01")],
  },
]);
assert.equal(nameCollision.added.length, 0);
assert.equal(nameCollision.nameReview.length, 1);
assert.equal(nameCollision.nameReview[0].proposed.editions[0].date, "2027-09-01");
console.log(
  "PASS: stable source identities, missing-record preservation, reviewed corrections, duplicate rejection and repeat safety",
);
