import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  westernBalkansRaceEditions,
  westernBalkansRaceSeries,
} from "../src/data/western-balkans-races.ts";
import { isoToFlagEmoji, resolveCountry } from "../src/lib/athrecs/countries.ts";
import { collapseSameEventDate } from "../src/lib/athrecs/dedupe.ts";

const CHECKED_AT = "2026-08-26";
const CALENDAR_START = "2026-01-01";
const HORIZON = "2027-12-31";

const expectedCountryCounts = {
  Kosovo: { iso: "XK", flag: "🇽🇰", series: 7, rows: 20, dates: 7 },
  "North Macedonia": { iso: "MK", flag: "🇲🇰", series: 16, rows: 37, dates: 18 },
  Croatia: { iso: "HR", flag: "🇭🇷", series: 10, rows: 28, dates: 12 },
  "Bosnia and Herzegovina": { iso: "BA", flag: "🇧🇦", series: 4, rows: 15, dates: 6 },
  Serbia: { iso: "RS", flag: "🇷🇸", series: 12, rows: 31, dates: 13 },
  Montenegro: { iso: "ME", flag: "🇲🇪", series: 5, rows: 21, dates: 8 },
  Slovenia: { iso: "SI", flag: "🇸🇮", series: 5, rows: 18, dates: 7 },
};

const key = (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
const seriesBySlug = new Map(westernBalkansRaceSeries.map((series) => [series.slug, series]));

assert.equal(westernBalkansRaceSeries.length, 59, "Unexpected regional event-series count");
assert.equal(westernBalkansRaceEditions.length, 170, "Unexpected advertised-distance count");
assert.equal(seriesBySlug.size, westernBalkansRaceSeries.length, "Duplicate regional series slug");

const editionKeys = new Set();
for (const edition of westernBalkansRaceEditions) {
  const editionKey = key(edition);
  assert(!editionKeys.has(editionKey), `Duplicate regional distance row: ${editionKey}`);
  editionKeys.add(editionKey);
  assert(seriesBySlug.has(edition.seriesSlug), `Unknown regional series: ${edition.seriesSlug}`);
  assert(edition.date >= CALENDAR_START, `Fixture predates requested calendar: ${editionKey}`);
  assert(edition.date <= HORIZON, `Fixture exceeds requested horizon: ${editionKey}`);
  assert.match(edition.source, /^https:\/\//, `Missing public source: ${editionKey}`);
  assert.equal(
    edition.publishAllDistances,
    true,
    `Same-day distance not publishable: ${editionKey}`,
  );
  assert(
    seriesBySlug.get(edition.seriesSlug).distances.includes(edition.distance),
    `Series omits advertised distance: ${editionKey}`,
  );
  if (edition.date < CHECKED_AT) {
    assert.equal(edition.status, "Finished", `Past fixture is not finished: ${editionKey}`);
    assert(!edition.entryUrl, `Past fixture exposes an entry link: ${editionKey}`);
  } else {
    assert.equal(edition.status, "Open", `Confirmed future fixture is not open: ${editionKey}`);
    assert.match(
      edition.entryUrl ?? "",
      /^https:\/\//,
      `Future fixture has no entry URL: ${editionKey}`,
    );
    assert.equal(
      edition.entryOptions?.[0]?.checkedAt,
      CHECKED_AT,
      `Stale entry check: ${editionKey}`,
    );
    assert.equal(edition.entryOptions?.[0]?.isVerified, true, `Unverified entry: ${editionKey}`);
  }
}

for (const [country, expected] of Object.entries(expectedCountryCounts)) {
  const countrySeries = westernBalkansRaceSeries.filter((series) => series.country === country);
  const slugs = new Set(countrySeries.map((series) => series.slug));
  const countryEditions = westernBalkansRaceEditions.filter((edition) =>
    slugs.has(edition.seriesSlug),
  );
  const raceDates = new Set(
    countryEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`),
  );
  assert.equal(countrySeries.length, expected.series, `${country} series count changed`);
  assert.equal(countryEditions.length, expected.rows, `${country} distance-row count changed`);
  assert.equal(raceDates.size, expected.dates, `${country} race-date count changed`);
  const resolved = resolveCountry({ country });
  assert.equal(resolved.iso, expected.iso, `${country} resolved to the wrong ISO code`);
  assert.equal(resolved.name, country, `${country} label changed`);
  assert.equal(isoToFlagEmoji(resolved.iso), expected.flag, `${country} flag is incorrect`);
}

const requiredDistanceGroups = [
  ["prishtina-marathon", "2026-09-20", ["Marathon", "Half", "10K", "5K"]],
  ["skopje-marathon", "2026-10-04", ["Half", "5K"]],
  ["wa-34th-zagreb-marathon-7237778", "2026-10-11", ["Half", "10K"]],
  ["sarajevo-half-marathon", "2026-09-13", ["Half", "5K"]],
  ["novi-sad-marathon", "2026-10-11", ["25K", "10K", "5K"]],
  ["podgorica-millennium-run", "2026-11-08", ["Marathon", "Half", "10K", "5K"]],
  ["ljubljana-marathon", "2026-10-18", ["Half"]],
  ["european-running-championships-belgrade-2027", "2027-04-17", ["Half", "10K"]],
];

for (const [slug, date, distances] of requiredDistanceGroups) {
  const actual = westernBalkansRaceEditions
    .filter((edition) => edition.seriesSlug === slug && edition.date === date)
    .map((edition) => edition.distance)
    .sort();
  assert.deepEqual(actual, [...distances].sort(), `Distance group changed: ${slug}|${date}`);
}

const cards = collapseSameEventDate(
  westernBalkansRaceEditions.map((edition, index) => ({
    id: index,
    event_slug: edition.seriesSlug,
    event_name: seriesBySlug.get(edition.seriesSlug).name,
    event_date: edition.date,
    distance_code: edition.distance,
  })),
);
assert.equal(cards.length, 71, "Regional editions do not collapse to one card per race date");

const future2027 = westernBalkansRaceEditions.filter((edition) => edition.date.startsWith("2027-"));
assert.deepEqual(
  [...new Set(future2027.map((edition) => edition.seriesSlug))].sort(),
  [
    "european-running-championships-belgrade-2027",
    "halkeco-skopje-run",
    "mostar-run-weekend",
    "sri-chinmoy-marathon-skopje",
    "three-hearts-marathon",
  ],
  "An unconfirmed 2027 recurrence was added",
);

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
const duplicateSource = await readFile(
  new URL("../src/data/fixture-deduplication.ts", import.meta.url),
  "utf8",
);
const seedSource = await readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes("westernBalkansRaceSeries"), "Regional series are not published");
assert(
  catalogueSource.includes("westernBalkansRaceEditions"),
  "Regional editions are not published",
);
assert(
  duplicateSource.includes('"wa-prishtina-marathon-7242723": "prishtina-marathon"'),
  "Prishtina World Athletics duplicate is not retired",
);
assert(
  duplicateSource.includes('"wa-10k-belgrade-nike-run-7244711": "belgrade-nike-10k"'),
  "Belgrade World Athletics duplicate is not retired",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-netherlands-full-running-calendar-v270"'),
  "The persistent catalogue seed was not advanced",
);

process.stdout.write(
  JSON.stringify(
    {
      checked_at: CHECKED_AT,
      calendar_start: CALENDAR_START,
      horizon: HORIZON,
      series: westernBalkansRaceSeries.length,
      race_dates: cards.length,
      advertised_distance_rows: westernBalkansRaceEditions.length,
      completed_rows: westernBalkansRaceEditions.filter((edition) => edition.status === "Finished")
        .length,
      future_rows: westernBalkansRaceEditions.filter((edition) => edition.status !== "Finished")
        .length,
      countries: expectedCountryCounts,
      unconfirmed_2027_recurrences: 0,
      retired_world_athletics_duplicates: 3,
    },
    null,
    2,
  ) + "\n",
);
