import assert from "node:assert/strict";
import { rolldown } from "rolldown";

const bundle = await rolldown({ input: "src/data/parkrun-fixtures-reviewed.ts" });
const { output } = await bundle.generate({ format: "esm" });
await bundle.close();
const {
  reviewedParkrunEditions: editions,
  reviewedParkrunSeries: series,
  reviewParkrunEdition,
} = await import(`data:text/javascript;base64,${Buffer.from(output[0].code).toString("base64")}`);
const get = (slug, date) => editions.find((row) => row.seriesSlug === slug && row.date === date);
assert.equal(series.length, 16, "Only the 16 independently matched missing venues are added");
assert.equal(get("pollok-parkrun", "2026-10-17").startTime, "09:30");
assert.equal(get("cambuslangpark-juniors-parkrun", "2026-10-11"), undefined);
assert.equal(get("cambuslangpark-juniors-parkrun", "2026-10-18").startTime, "09:30");
assert.equal(get("chesterfordresearchpark-parkrun", "2026-10-17").status, "Cancelled");
assert.equal(
  new Set(editions.map((row) => `${row.seriesSlug}|${row.date}|${row.distance}`)).size,
  editions.length,
);
assert.ok(editions.every((row) => row.date >= "2026-10-10" && row.date <= "2027-12-31"));
assert.equal(editions.filter((row) => ["2026-12-25", "2027-01-01"].includes(row.date)).length, 155);
assert.ok(
  editions
    .filter((row) => ["2026-12-25", "2027-01-01"].includes(row.date))
    .every((row) => row.source === "https://www.parkrun.org.uk/special-events/"),
);
const historical = {
  seriesSlug: "victoria-dock-parkrun",
  date: "2023-03-18",
  distance: "5K",
  distanceKm: 5,
  status: "Finished",
  source: "https://www.parkrun.org.uk/victoriadock/",
};
assert.equal(
  reviewParkrunEdition(historical),
  historical,
  "Historical result dependency remains untouched",
);
assert.equal(
  reviewParkrunEdition({ ...historical, date: "2026-10-17", status: "Open" }).status,
  "Cancelled",
);
const entry = {
  seriesSlug: "gorleston-cliffs-parkrun",
  date: "2026-10-17",
  distance: "5K",
  distanceKm: 5,
  status: "Open",
  source: "https://www.parkrun.org.uk/gorlestoncliffs/",
  entryUrl: "https://www.parkrun.org.uk/gorlestoncliffs/",
};
assert.equal(reviewParkrunEdition(entry).entryUrl, "https://www.parkrun.org.uk/gorleston/");
assert.equal(
  reviewParkrunEdition({ ...entry, entryUrl: "https://example.com/approved-registration" })
    .entryUrl,
  "https://example.com/approved-registration",
  "Distinct approved entry routes survive",
);
console.log(
  `Reviewed UK parkrun fixture seed verified: ${series.length} new venues, ${editions.length} scheduled occurrences.`,
);
