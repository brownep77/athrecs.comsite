#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  IRONMAN_703_CALENDAR_CHECKED_AT,
  IRONMAN_703_CALENDAR_SOURCE,
  ironman703CalendarStats,
  ironman703Editions,
  ironman703Series,
} from "../src/data/ironman-703-calendar.ts";

assert.equal(IRONMAN_703_CALENDAR_CHECKED_AT, "2026-08-27");
assert.match(IRONMAN_703_CALENDAR_SOURCE, /^https:\/\/www\.ironman\.com\/races\?/);
assert.equal(ironman703Series.length, 66, "Expected 66 exact-dated IRONMAN 70.3 races");
assert.equal(ironman703Editions.length, ironman703Series.length);
assert.equal(ironman703CalendarStats.races, ironman703Series.length);
assert.equal(ironman703CalendarStats.countries, 35);
assert.equal(ironman703CalendarStats.firstDate, "2026-08-30");
assert.equal(ironman703CalendarStats.lastDate, "2027-07-18");

const seriesSlugs = new Set();
const seriesNames = new Set();
const editionKeys = new Set();
let previousDate = "";

for (let index = 0; index < ironman703Series.length; index += 1) {
  const series = ironman703Series[index];
  const edition = ironman703Editions[index];

  assert(!seriesSlugs.has(series.slug), `Duplicate IRONMAN series slug: ${series.slug}`);
  assert(!seriesNames.has(series.name), `Duplicate IRONMAN series name: ${series.name}`);
  seriesSlugs.add(series.slug);
  seriesNames.add(series.name);

  assert.equal(series.sport, "Triathlon");
  assert.deepEqual(series.distances, ["70.3"]);
  assert.equal(series.organiser, "The IRONMAN Group");
  assert.match(series.website, /^https:\/\/www\.ironman\.com\/races\/im703-/);
  assert.equal(series.source_url, series.website);
  assert(series.country && series.city && series.county, `${series.slug} needs full location data`);

  assert.equal(edition.seriesSlug, series.slug);
  assert.match(edition.date, /^20\d{2}-\d{2}-\d{2}$/);
  assert(edition.date >= "2026-08-28", `${series.slug} is not upcoming`);
  assert(edition.date <= "2027-08-27", `${series.slug} exceeds the 12-month window`);
  assert(edition.date >= previousDate, "IRONMAN editions must stay date-sorted");
  previousDate = edition.date;
  assert.equal(edition.distance, "70.3");
  assert.equal(edition.distanceKm, 113);
  assert.notEqual(edition.status, "TBC", `${series.slug} has a confirmed date and cannot be TBC`);
  assert.equal(edition.source, series.website);
  assert.equal(edition.entryOptions?.length, 1);
  const entry = edition.entryOptions?.[0];
  assert(entry, `${series.slug} needs an official entry option`);
  assert.equal(entry.entryType, "official");
  assert.equal(entry.providerCode, "ironman");
  assert.equal(entry.entryUrl, series.website);
  assert.equal(entry.checkedAt, IRONMAN_703_CALENDAR_CHECKED_AT);
  assert.equal(entry.isPrimary, true);

  const editionKey = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert(!editionKeys.has(editionKey), `Duplicate IRONMAN edition: ${editionKey}`);
  editionKeys.add(editionKey);
}

const catalogue = await readFile("src/data/catalogue.ts", "utf8");
assert(
  catalogue.includes(
    'import { ironman703Editions, ironman703Series } from "./ironman-703-calendar";',
  ),
  "Catalogue must import the IRONMAN 70.3 source",
);
assert(
  catalogue.indexOf("...(ironman703Series as Series[])") <
    catalogue.indexOf("...(multiSportSeries as Series[])") &&
    catalogue.indexOf("...(ironman703Series as Series[])") >= 0,
  "Official IRONMAN series must precede the generic multisport feed",
);
assert(
  catalogue.indexOf("...(ironman703Editions as Edition[])") <
    catalogue.indexOf("...(multiSportEditions as Edition[])") &&
    catalogue.indexOf("...(ironman703Editions as Edition[])") >= 0,
  "Official IRONMAN editions must precede the generic multisport feed",
);

process.stdout.write(
  `IRONMAN 70.3 verification passed: ${ironman703Series.length} races across ${ironman703CalendarStats.countries} countries.\n`,
);
