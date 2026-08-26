import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  franceSpainPortugalRaceEditions,
  franceSpainPortugalRaceSeries,
} from "../src/data/france-spain-portugal-races.ts";
import { isoToFlagEmoji, resolveCountry } from "../src/lib/athrecs/countries.ts";
import { collapseSameEventDate } from "../src/lib/athrecs/dedupe.ts";

const CHECKED_AT = "2026-08-26";
const CALENDAR_START = "2026-01-01";
const HORIZON = "2027-12-31";

const expectedCountryCounts = {
  France: { iso: "FR", flag: "🇫🇷", series: 17, rows: 45, dates: 23 },
  Spain: { iso: "ES", flag: "🇪🇸", series: 55, rows: 65, dates: 55 },
  Portugal: { iso: "PT", flag: "🇵🇹", series: 43, rows: 53, dates: 46 },
};

const seriesBySlug = new Map(franceSpainPortugalRaceSeries.map((series) => [series.slug, series]));
assert.equal(
  seriesBySlug.size,
  franceSpainPortugalRaceSeries.length,
  "Duplicate event-series slug",
);
assert.equal(franceSpainPortugalRaceSeries.length, 115, "Unexpected event-series count");
assert.equal(franceSpainPortugalRaceEditions.length, 163, "Unexpected advertised-distance count");

const editionKeys = new Set();
for (const edition of franceSpainPortugalRaceEditions) {
  const editionKey = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(editionKey), `Duplicate distance row: ${editionKey}`);
  editionKeys.add(editionKey);
  assert(seriesBySlug.has(edition.seriesSlug), `Unknown series: ${edition.seriesSlug}`);
  assert(edition.date >= CALENDAR_START, `Fixture predates requested calendar: ${editionKey}`);
  assert(edition.date <= HORIZON, `Fixture exceeds requested horizon: ${editionKey}`);
  assert.match(edition.source, /^https:\/\//, `Missing public source: ${editionKey}`);
  assert.equal(edition.publishAllDistances, true, `Distance is not publishable: ${editionKey}`);
  assert(
    seriesBySlug.get(edition.seriesSlug).distances.includes(edition.distance),
    `Series omits advertised distance: ${editionKey}`,
  );
  if (edition.date < CHECKED_AT) {
    assert.equal(edition.status, "Finished", `Past fixture is not finished: ${editionKey}`);
    assert(!edition.entryUrl, `Past fixture exposes an entry link: ${editionKey}`);
  } else {
    if (edition.status === "TBC") {
      assert(!edition.entryUrl, `TBC fixture exposes an unverified entry link: ${editionKey}`);
      continue;
    }
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
  const countrySeries = franceSpainPortugalRaceSeries.filter(
    (series) => series.country === country,
  );
  const slugs = new Set(countrySeries.map((series) => series.slug));
  const countryEditions = franceSpainPortugalRaceEditions.filter((edition) =>
    slugs.has(edition.seriesSlug),
  );
  const dates = new Set(countryEditions.map((edition) => `${edition.seriesSlug}|${edition.date}`));
  assert.equal(slugs.size, expected.series, `${country} series count changed`);
  assert.equal(countryEditions.length, expected.rows, `${country} distance count changed`);
  assert.equal(dates.size, expected.dates, `${country} race-date count changed`);
  const resolved = resolveCountry({ country });
  assert.equal(resolved.iso, expected.iso, `${country} resolved to the wrong ISO code`);
  assert.equal(isoToFlagEmoji(resolved.iso), expected.flag, `${country} flag is incorrect`);
}

assert(
  !franceSpainPortugalRaceEditions.some((edition) =>
    edition.source.includes("athle.fr/base/calendrier"),
  ),
  "The FFA no-copy calendar must not be used as a published fixture source",
);
assert(
  !franceSpainPortugalRaceEditions.some(
    (edition) => edition.date.startsWith("2027-") && edition.source.includes("atletismorfea.es"),
  ),
  "An unadvertised Spanish 2027 recurrence was added",
);

const requiredDistanceGroups = [
  ["run-in-lyon", "2026-10-04", ["10K", "Half", "Marathon"]],
  ["marathon-de-bordeaux", "2026-11-08", ["10K", "Half", "Marathon"]],
  ["annecy-lake-marathon", "2026-04-19", ["10K", "5K", "Half", "Marathon"]],
  ["euro-marathon-metz", "2026-10-11", ["10K", "Half", "Marathon"]],
  ["marathon-cote-damour", "2026-11-08", ["Half", "Marathon"]],
  ["murcia-marathon", "2026-02-01", ["10K", "Half", "Marathon"]],
  ["barakaldo-10k-5k", "2026-03-01", ["10K", "5K"]],
  ["spain-50k-100k-road-championships", "2026-03-21", ["100K", "50K"]],
  ["funchal-marathon", "2027-01-31", ["8K", "Half"]],
  ["cascais-half-marathon", "2027-02-07", ["10K", "5K"]],
  ["lisbon-half-marathon", "2027-03-07", ["10K"]],
];
for (const [slug, date, distances] of requiredDistanceGroups) {
  const actual = franceSpainPortugalRaceEditions
    .filter((edition) => edition.seriesSlug === slug && edition.date === date)
    .map((edition) => edition.distance)
    .sort();
  assert.deepEqual(actual, [...distances].sort(), `Distance group changed: ${slug}|${date}`);
}

const cards = collapseSameEventDate(
  franceSpainPortugalRaceEditions.map((edition, index) => ({
    id: index,
    event_slug: edition.seriesSlug,
    event_name: seriesBySlug.get(edition.seriesSlug).name,
    event_date: edition.date,
    distance_code: edition.distance,
  })),
);
assert.equal(cards.length, 124, "Editions do not collapse to one card per race date");

const registry = await readFile(
  new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url),
  "utf8",
);
assert.match(
  registry,
  /^ffa,[^\n]*,0,[^\n]*Do not copy,[^\n]*forbids copying/m,
  "The FFA source restriction is not documented",
);
const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(catalogueSource.includes("franceSpainPortugalRaceSeries"), "Series are not published");
assert(catalogueSource.includes("franceSpainPortugalRaceEditions"), "Editions are not published");

process.stdout.write(
  JSON.stringify(
    {
      checked_at: CHECKED_AT,
      calendar_start: CALENDAR_START,
      horizon: HORIZON,
      series: franceSpainPortugalRaceSeries.length,
      race_dates: cards.length,
      advertised_distance_rows: franceSpainPortugalRaceEditions.length,
      completed_rows: franceSpainPortugalRaceEditions.filter(
        (edition) => edition.status === "Finished",
      ).length,
      future_rows: franceSpainPortugalRaceEditions.filter(
        (edition) => edition.status !== "Finished",
      ).length,
      provisional_entry_status_rows: franceSpainPortugalRaceEditions.filter(
        (edition) => edition.status === "TBC",
      ).length,
      countries: expectedCountryCounts,
      copied_ffa_rows: 0,
      invented_spain_2027_recurrences: 0,
    },
    null,
    2,
  ) + "\n",
);
