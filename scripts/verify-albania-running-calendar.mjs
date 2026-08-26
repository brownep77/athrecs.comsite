import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { albaniaRaceEditions, albaniaRaceSeries } from "../src/data/albania-races.ts";
import { collapseSameEventDate } from "../src/lib/athrecs/dedupe.ts";

const CHECKED_AT = "2026-08-26";
const HORIZON = "2027-12-31";

const expected = [
  ["ultra-4-albania-mountain-race", "2026-09-05", ["100K"]],
  ["ultra-4-albania-mountain-race", "2026-09-06", ["25K", "50K"]],
  ["globallimits-peaks-of-the-balkans", "2026-09-11", ["200K"]],
  ["the-peaks-ultra-albania", "2026-09-26", ["42K", "62K"]],
  ["skampa-half-marathon-elbasan", "2026-10-04", ["10K", "5K", "Half"]],
  ["shkodra-mini-marathon", "2026-10-04", ["10K", "2.5K", "5K"]],
  ["race-for-the-cure-tirana", "2026-10-10", ["5K"]],
  ["vjosa-wild-river-ultra-trail", "2026-10-25", ["100K", "11K", "26K", "44K", "67K"]],
  ["tirana-marathon", "2026-10-25", ["10K", "2.3K", "Half", "Marathon"]],
  ["berat-green-half-marathon", "2027-04-04", ["10K", "Half"]],
  ["enkelana-night-half-marathon", "2027-07-24", ["11.5K", "Half"]],
  ["migrant-trail-race-fushe-arrez", "2027-08-07", ["40K", "60K"]],
  ["ultra-4-albania-mountain-race", "2027-09-04", ["100K"]],
  ["ultra-4-albania-mountain-race", "2027-09-05", ["25K", "50K"]],
];

function key(seriesSlug, date) {
  return `${seriesSlug}|${date}`;
}

function groupedDistances(editions) {
  const groups = new Map();
  for (const edition of editions) {
    const groupKey = key(edition.seriesSlug, edition.date);
    const distances = groups.get(groupKey) ?? [];
    distances.push(edition.distance);
    groups.set(groupKey, distances);
  }
  return new Map(
    [...groups].map(([groupKey, distances]) => [
      groupKey,
      distances.sort((a, b) => a.localeCompare(b)),
    ]),
  );
}

assert.equal(albaniaRaceSeries.length, 11, "Unexpected Albania event-series count");
assert.equal(albaniaRaceEditions.length, 31, "Unexpected Albania advertised-distance count");

const seriesBySlug = new Map(albaniaRaceSeries.map((series) => [series.slug, series]));
assert.equal(seriesBySlug.size, albaniaRaceSeries.length, "Duplicate Albania event slug");
for (const series of albaniaRaceSeries) {
  assert.equal(series.country, "Albania", `${series.slug} must be assigned to Albania`);
  assert.match(series.website, /^https:\/\//, `${series.slug} must have an HTTPS organiser page`);
}

const editionKeys = new Set();
for (const edition of albaniaRaceEditions) {
  const editionKey = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(editionKey), `Duplicate Albania edition distance: ${editionKey}`);
  editionKeys.add(editionKey);
  assert(seriesBySlug.has(edition.seriesSlug), `Unknown Albania series: ${edition.seriesSlug}`);
  assert(
    edition.date >= CHECKED_AT,
    `Past Albania fixture slipped into the active calendar: ${editionKey}`,
  );
  assert(edition.date <= HORIZON, `Albania fixture exceeds the requested horizon: ${editionKey}`);
  assert.match(edition.source, /^https:\/\//, `Missing public source for ${editionKey}`);
  assert.equal(
    edition.publishAllDistances,
    true,
    `Albania advertised distance is not marked for same-day publication: ${editionKey}`,
  );
  assert(
    seriesBySlug.get(edition.seriesSlug).distances.includes(edition.distance),
    `Series distance list omits ${editionKey}`,
  );
  if (edition.status === "TBC") {
    assert(
      !edition.entryUrl,
      `TBC fixture must not expose an unconfirmed entry link: ${editionKey}`,
    );
    continue;
  }
  assert.equal(edition.status, "Open", `Confirmed fixture is not open: ${editionKey}`);
  assert.match(edition.entryUrl ?? "", /^https:\/\//, `Missing entry link for ${editionKey}`);
  assert.equal(
    edition.entryOptions?.length,
    1,
    `Expected one verified entry option for ${editionKey}`,
  );
  assert.equal(
    edition.entryOptions?.[0]?.checkedAt,
    CHECKED_AT,
    `Stale entry check for ${editionKey}`,
  );
  assert.equal(
    edition.entryOptions?.[0]?.isVerified,
    true,
    `Unverified entry option for ${editionKey}`,
  );
}

const expectedGroups = new Map(
  expected.map(([slug, date, distances]) => [key(slug, date), distances]),
);
const actualGroups = groupedDistances(albaniaRaceEditions);
assert.deepEqual(actualGroups, expectedGroups, "Albania race-date distance matrix changed");

assert(
  !albaniaRaceEditions.some(
    (edition) =>
      edition.seriesSlug === "vjosa-wild-river-ultra-trail" && edition.date === "2026-10-24",
  ),
  "The superseded Vjosa 24 October date remains",
);
assert(
  albaniaRaceEditions.some(
    (edition) =>
      edition.seriesSlug === "vjosa-wild-river-ultra-trail" &&
      edition.date === "2026-10-25" &&
      edition.distance === "26K",
  ),
  "The official Vjosa 26 km route is missing",
);

const catalogueSource = await readFile(
  new URL("../src/data/catalogue.ts", import.meta.url),
  "utf8",
);
assert(
  catalogueSource.includes("const key = edition.publishAllDistances"),
  "Catalogue edition merging is not distance-aware",
);

const calendarCards = collapseSameEventDate(
  albaniaRaceEditions.map((edition, index) => ({
    id: index,
    event_slug: edition.seriesSlug,
    event_name: seriesBySlug.get(edition.seriesSlug).name,
    event_date: edition.date,
    distance_code: edition.distance,
  })),
);
assert.equal(
  calendarCards.length,
  expected.length,
  "Same-day distances did not collapse to one event card",
);
for (const [slug, date, distances] of expected) {
  const card = calendarCards.find(
    (candidate) => candidate.event_slug === slug && candidate.event_date === date,
  );
  assert(card, `Missing collapsed calendar card: ${key(slug, date)}`);
  assert.deepEqual(
    card.distance_code
      .split("·")
      .map((distance) => distance.trim())
      .sort((a, b) => a.localeCompare(b)),
    distances,
    `Calendar badges omit a distance for ${key(slug, date)}`,
  );
}

process.stdout.write(
  JSON.stringify(
    {
      checked_at: CHECKED_AT,
      horizon: HORIZON,
      series: albaniaRaceSeries.length,
      race_dates: expected.length,
      advertised_distance_rows: albaniaRaceEditions.length,
      confirmed_rows: albaniaRaceEditions.filter((edition) => edition.status !== "TBC").length,
      provisional_rows: albaniaRaceEditions.filter((edition) => edition.status === "TBC").length,
      stale_vjosa_dates: 0,
      missing_catalogue_distances: 0,
    },
    null,
    2,
  ) + "\n",
);
