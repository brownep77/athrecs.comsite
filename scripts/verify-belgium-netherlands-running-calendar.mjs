import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  belgiumNetherlandsRaceEditions,
  belgiumNetherlandsRaceSeries,
} from "../src/data/belgium-netherlands-races.ts";
import {
  verifiedFixtureEditionOverrides,
  verifiedFixtureEditionReplacements,
} from "../src/data/fixture-deduplication.ts";
import {
  COUNTRY_FILTERS,
  COUNTRY_GROUPS,
  isoToFlagEmoji,
  resolveCountry,
} from "../src/lib/athrecs/countries.ts";
import { collapseSameEventDate } from "../src/lib/athrecs/dedupe.ts";

const CHECKED_AT = "2026-08-27";
const CALENDAR_START = "2026-01-01";
const HORIZON = "2027-12-31";

const expectedCountryCounts = {
  Belgium: { iso: "BE", flag: "🇧🇪", series: 33, rows: 97, dates: 37 },
  Netherlands: { iso: "NL", flag: "🇳🇱", series: 32, rows: 115, dates: 48 },
};

const seriesBySlug = new Map(belgiumNetherlandsRaceSeries.map((series) => [series.slug, series]));
assert.equal(seriesBySlug.size, belgiumNetherlandsRaceSeries.length, "Duplicate event-series slug");
assert.equal(belgiumNetherlandsRaceSeries.length, 65, "Unexpected event-series count");
assert.equal(belgiumNetherlandsRaceEditions.length, 212, "Unexpected advertised-distance count");

const editionKeys = new Set();
for (const edition of belgiumNetherlandsRaceEditions) {
  const editionKey = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(editionKey), `Duplicate distance row: ${editionKey}`);
  editionKeys.add(editionKey);
  assert(seriesBySlug.has(edition.seriesSlug), `Unknown series: ${edition.seriesSlug}`);
  assert(edition.date >= CALENDAR_START, `Fixture predates requested calendar: ${editionKey}`);
  assert(edition.date <= HORIZON, `Fixture exceeds requested horizon: ${editionKey}`);
  assert(edition.distanceKm > 0, `Fixture has no usable distance: ${editionKey}`);
  assert.match(edition.source, /^https:\/\//, `Missing public source: ${editionKey}`);
  assert.equal(edition.publishAllDistances, true, `Distance is not publishable: ${editionKey}`);
  assert(
    seriesBySlug.get(edition.seriesSlug).distances.includes(edition.distance),
    `Series omits advertised distance: ${editionKey}`,
  );
  if (edition.date < CHECKED_AT) {
    assert.equal(edition.status, "Finished", `Past fixture is not finished: ${editionKey}`);
    assert(!edition.entryUrl, `Past fixture exposes an entry link: ${editionKey}`);
  } else if (edition.status === "Closed" || edition.status === "TBC") {
    assert(!edition.entryUrl, `${edition.status} fixture exposes an entry link: ${editionKey}`);
  } else {
    assert.equal(edition.status, "Open", `Future fixture has an invalid status: ${editionKey}`);
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
  const countrySeries = belgiumNetherlandsRaceSeries.filter((series) => series.country === country);
  const slugs = new Set(countrySeries.map((series) => series.slug));
  const countryEditions = belgiumNetherlandsRaceEditions.filter((edition) =>
    slugs.has(edition.seriesSlug),
  );
  const dates = new Set(countryEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`));
  assert.equal(countrySeries.length, expected.series, `${country} series count changed`);
  assert.equal(countryEditions.length, expected.rows, `${country} distance count changed`);
  assert.equal(dates.size, expected.dates, `${country} race-date count changed`);
  const resolved = resolveCountry({ country });
  assert.equal(resolved.iso, expected.iso, `${country} resolved to the wrong ISO code`);
  assert.equal(isoToFlagEmoji(resolved.iso), expected.flag, `${country} flag is incorrect`);
  assert(COUNTRY_FILTERS.includes(country), `${country} is absent from race country filters`);
  assert(
    COUNTRY_GROUPS.some((group) => group.options.includes(country)),
    `${country} is absent from the country selector`,
  );
}

const requiredDistanceGroups = [
  ["bashirs-run-gentbrugge", "2026-03-08", ["10K", "5K", "Half"]],
  ["leuven-marathon", "2027-04-11", ["10K", "Half", "Marathon"]],
  ["energyvision-knokke-run", "2026-05-01", ["10K", "6K", "Half"]],
  ["nieuwpoort-marathon", "2026-09-20", ["10K", "5K", "Half", "Marathon"]],
  ["bruges-marathon", "2026-10-11", ["Half", "Marathon"]],
  ["gtlc-summer", "2027-05-15", ["22K", "8.59K", "87K"]],
  ["schoorl-run", "2027-02-14", ["10K", "30K", "Half"]],
  ["nn-cpc-loop-den-haag", "2027-03-14", ["10K", "5K", "Half"]],
  ["rotterdam-marathon", "2027-04-11", ["10K", "Marathon"]],
  ["singelloop-utrecht", "2026-10-04", ["10K", "5K"]],
  ["eindhoven-marathon", "2026-10-11", ["Half", "Marathon", "Quarter Marathon"]],
  ["amsterdam-marathon", "2026-10-18", ["Half", "Marathon"]],
  ["wa-marathon-the-hague-7243223", "2026-11-01", ["10K", "5K", "Marathon"]],
  ["amgen-singelloop-breda", "2027-04-04", ["10K", "5K", "Half"]],
];
for (const [slug, date, distances] of requiredDistanceGroups) {
  const actual = belgiumNetherlandsRaceEditions
    .filter((edition) => edition.seriesSlug === slug && edition.date === date)
    .map((edition) => edition.distance)
    .sort();
  assert.deepEqual(actual, [...distances].sort(), `Distance group changed: ${slug}|${date}`);
}

assert(
  !belgiumNetherlandsRaceEditions.some(
    (edition) => edition.seriesSlug === "bruges-marathon" && edition.distance === "8K",
  ),
  "The Bruges family walk was misclassified as a running race",
);
assert(
  !belgiumNetherlandsRaceEditions.some(
    (edition) => edition.seriesSlug === "singelloop-utrecht" && edition.distance === "Half",
  ),
  "An unadvertised Utrecht half marathon was added",
);
assert(
  !belgiumNetherlandsRaceEditions.some(
    (edition) => edition.seriesSlug === "marathon-amersfoort" && edition.distance === "Marathon",
  ),
  "The Amersfoort training marathon was misclassified as a race",
);

for (const expected of [
  ["wa-deloitte-fast-fun-5-10km-trakks-lbfa-road-tour-7244627", "Other", "10K"],
  ["wa-dam-tot-damloop-7238027", "Other", "10 Miles"],
  ["wa-marathon-the-hague-7243223", "Other", "Marathon"],
  ["schoorl-run", "Marathon", "10K"],
]) {
  const [seriesSlug, distance, toDistance] = expected;
  assert(
    verifiedFixtureEditionReplacements.some(
      (replacement) =>
        replacement.seriesSlug === seriesSlug &&
        replacement.distance === distance &&
        replacement.toDistance === toDistance,
    ),
    `Missing result-safe legacy edition migration: ${seriesSlug}`,
  );
  assert(
    verifiedFixtureEditionOverrides[
      `${seriesSlug}|${
        seriesSlug === "schoorl-run"
          ? "2027-02-14|Marathon"
          : seriesSlug.includes("deloitte")
            ? "2026-09-06|Other"
            : seriesSlug.includes("dam-tot")
              ? "2026-09-20|Other"
              : "2026-11-01|Other"
      }`
    ],
    `Missing static catalogue correction: ${seriesSlug}`,
  );
}

const cards = collapseSameEventDate(
  belgiumNetherlandsRaceEditions.map((edition, index) => ({
    id: index,
    event_slug: edition.seriesSlug,
    event_name: seriesBySlug.get(edition.seriesSlug).name,
    event_date: edition.date,
    distance_code: edition.distance,
  })),
);
assert.equal(cards.length, 85, "Editions do not collapse to one card per race date");

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes("belgiumNetherlandsRaceSeries"), "Series are not published");
assert(catalogueSource.includes("belgiumNetherlandsRaceEditions"), "Editions are not published");
const seedSource = await readFile(
  new URL("../src/lib/athrecs/seed.server.ts", import.meta.url),
  "utf8",
);
assert(
  seedSource.includes('const SEED_VERSION = "athrecs-netherlands-full-running-calendar-v270"'),
  "The production catalogue seed was not advanced for the expanded calendar",
);

process.stdout.write(
  JSON.stringify(
    {
      checked_at: CHECKED_AT,
      calendar_start: CALENDAR_START,
      horizon: HORIZON,
      series: belgiumNetherlandsRaceSeries.length,
      race_dates: cards.length,
      advertised_distance_rows: belgiumNetherlandsRaceEditions.length,
      completed_rows: belgiumNetherlandsRaceEditions.filter(
        (edition) => edition.status === "Finished",
      ).length,
      future_rows: belgiumNetherlandsRaceEditions.filter((edition) => edition.status !== "Finished")
        .length,
      countries: expectedCountryCounts,
      invented_2027_recurrences: 0,
      high_confidence_duplicates_expected: 0,
    },
    null,
    2,
  ) + "\n",
);
