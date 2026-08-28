import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  netherlandsFullCalendarAudit,
  netherlandsFullRaceEditions,
  netherlandsFullRaceSeries,
} from "../src/data/netherlands-full-running-calendar.ts";
import {
  COUNTRY_FILTERS,
  COUNTRY_GROUPS,
  isoToFlagEmoji,
  resolveCountry,
} from "../src/lib/athrecs/countries.ts";

const CHECKED_AT = "2026-08-27";
const CALENDAR_START = "2026-01-01";
const HORIZON = "2027-12-31";

assert.deepEqual(
  netherlandsFullCalendarAudit,
  {
    checkedAt: CHECKED_AT,
    calendarStart: CALENDAR_START,
    horizon: HORIZON,
    sourceEntries: 1147,
    publishableSeries: 165,
    publishableRaceDates: 171,
    publishableDistanceRows: 619,
    sourceUrl: "https://www.hardlopen.nl/evenementen/",
  },
  "The Netherlands audit metadata changed without review",
);

const seriesBySlug = new Map(netherlandsFullRaceSeries.map((series) => [series.slug, series]));
assert.equal(seriesBySlug.size, 165, "Duplicate or missing Netherlands series");
assert.equal(netherlandsFullRaceEditions.length, 619, "Netherlands distance-row count changed");
assert.equal(
  new Set(netherlandsFullRaceEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`))
    .size,
  171,
  "Netherlands race-date count changed",
);

const editionKeys = new Set();
for (const edition of netherlandsFullRaceEditions) {
  const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(key), `Duplicate Netherlands distance row: ${key}`);
  editionKeys.add(key);
  assert(seriesBySlug.has(edition.seriesSlug), `Unknown Netherlands series: ${key}`);
  assert(edition.date >= CALENDAR_START && edition.date <= HORIZON, `Date outside audit: ${key}`);
  assert(edition.distanceKm > 0 && edition.distanceKm <= 180, `Invalid distance units: ${key}`);
  assert.match(edition.source, /^https:\/\//, `Missing evidence URL: ${key}`);
  assert.equal(
    edition.publishAllDistances,
    true,
    `Distance is not independently published: ${key}`,
  );
  assert(
    seriesBySlug.get(edition.seriesSlug).distances.includes(edition.distance),
    `Series omits advertised distance: ${key}`,
  );
  if (edition.date < CHECKED_AT) {
    assert.equal(edition.status, "Finished", `Historical fixture is not finished: ${key}`);
    assert(!edition.entryUrl, `Historical fixture exposes an entry link: ${key}`);
  } else if (edition.status === "Open") {
    assert.match(edition.entryUrl ?? "", /^https:\/\//, `Open fixture has no entry link: ${key}`);
    assert.equal(edition.entryOptions?.[0]?.checkedAt, CHECKED_AT, `Stale entry check: ${key}`);
    assert.equal(edition.entryOptions?.[0]?.isVerified, true, `Unverified entry: ${key}`);
  } else {
    assert(["Closed", "TBC"].includes(edition.status), `Invalid future status: ${key}`);
    assert(!edition.entryUrl, `Unavailable fixture exposes an entry link: ${key}`);
  }
}

for (const series of netherlandsFullRaceSeries) {
  assert.equal(series.country, "Netherlands", `Wrong country: ${series.slug}`);
  assert(series.city && series.city !== "Netherlands", `Unresolved Dutch city: ${series.slug}`);
  assert.match(series.source_url ?? "", /^https:\/\//, `Missing series source: ${series.slug}`);
  assert(
    !new URL(series.source_url).hostname.endsWith("hardlopen.nl"),
    `Restricted calendar page was used as publication evidence: ${series.slug}`,
  );
  assert(
    !/(afgelast|geannuleerd|marathonblokken|testloop|snelwandelen|ekiden)/i.test(series.name),
    `Excluded non-race listing was published: ${series.name}`,
  );
}

const resolved = resolveCountry({ country: "Netherlands" });
assert.equal(resolved.iso, "NL", "The Netherlands resolves to the wrong ISO code");
assert.equal(isoToFlagEmoji(resolved.iso), "🇳🇱", "The Netherlands flag is incorrect");
assert(COUNTRY_FILTERS.includes("Netherlands"), "The Netherlands is absent from country filters");
assert(
  COUNTRY_GROUPS.some((group) => group.options.includes("Netherlands")),
  "The Netherlands is absent from the country selector",
);

function distances(slug, date) {
  return netherlandsFullRaceEditions
    .filter((edition) => edition.seriesSlug === slug && edition.date === date)
    .map((edition) => edition.distance)
    .sort();
}

assert.deepEqual(
  distances("amsterdam-marathon", "2026-10-17"),
  ["1.6K", "1K", "3.5K", "6.5K", "7.5K"],
  "Amsterdam Saturday programme is incomplete",
);
assert.deepEqual(
  distances("amsterdam-marathon", "2026-10-18"),
  ["1K", "Half", "Marathon"],
  "Amsterdam Sunday programme is incomplete",
);
assert.deepEqual(
  distances("egmond-half-marathon", "2027-01-10"),
  ["1K", "2K", "10.5K", "Half"].sort(),
  "Egmond's advertised programme is incomplete",
);

assert.equal(
  netherlandsFullRaceEditions.filter((edition) => edition.distance === "5K").length,
  99,
  "5K coverage changed",
);
assert.equal(
  netherlandsFullRaceEditions.filter((edition) => edition.distance === "10K").length,
  108,
  "10K coverage changed",
);
assert.equal(
  netherlandsFullRaceEditions.filter((edition) => edition.distance === "Half").length,
  34,
  "Half-marathon coverage changed",
);
assert.equal(
  netherlandsFullRaceEditions.filter((edition) => edition.distance === "Marathon").length,
  20,
  "Marathon coverage changed",
);

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(
  catalogueSource.includes("netherlandsFullRaceSeries"),
  "Netherlands series are not wired in",
);
assert(
  catalogueSource.includes("netherlandsFullRaceEditions"),
  "Netherlands editions are not wired in",
);
const seedSource = await readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-uk-ireland-half-ten-mile-scan-v272"'),
  "The persistent catalogue seed version was not advanced",
);

console.log(
  `Verified ${netherlandsFullRaceSeries.length} Dutch series, 171 race dates and ${netherlandsFullRaceEditions.length} advertised distances.`,
);
