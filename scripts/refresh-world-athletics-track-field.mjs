#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  worldAthleticsEditions as existingEditions,
  worldAthleticsSeries as existingSeries,
} from "../src/data/world-athletics.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = join(ROOT, "src/data/world-athletics.ts");
const SEED_PATH = join(ROOT, "src/lib/athrecs/seed.server.ts");
const CALENDAR_URL = "https://worldathletics.org/competition/calendar-results";
const PAGE_SIZE = 100;
const USER_AGENT =
  "ATHRECS fixture metadata refresh/1.0 (+https://www.athrecs.com; official public calendar only)";

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function defaultEndDate() {
  const year = new Date().getUTCFullYear() + 1;
  return `${year}-12-31`;
}

function assertIsoDate(value, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${label} must use YYYY-MM-DD`);
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 62)
    .replace(/-+$/g, "");
}

function nextData(html) {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error("World Athletics page did not contain __NEXT_DATA__");
  const parsed = JSON.parse(match[1]);
  const events = parsed?.props?.pageProps?.initialEvents;
  if (!events || !Array.isArray(events.results)) {
    throw new Error("World Athletics calendar payload changed shape");
  }
  return events;
}

async function fetchPage(startDate, endDate, offset, attempt = 1) {
  const url = new URL(CALENDAR_URL);
  url.searchParams.set("startDate", startDate);
  url.searchParams.set("endDate", endDate);
  url.searchParams.set("disciplineId", "5");
  url.searchParams.set("hideCompetitionsWithNoResults", "false");
  url.searchParams.set("limit", String(PAGE_SIZE));
  url.searchParams.set("offset", String(offset));

  try {
    const response = await fetch(url, {
      headers: { accept: "text/html", "user-agent": USER_AGENT },
      signal: AbortSignal.timeout(60_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const events = nextData(await response.text());
    if (events.parameters?.offset !== offset) {
      throw new Error(`calendar returned offset ${events.parameters?.offset}, expected ${offset}`);
    }
    return events;
  } catch (error) {
    if (attempt >= 3) throw error;
    await new Promise((resolve) => setTimeout(resolve, attempt * 1_500));
    return fetchPage(startDate, endDate, offset, attempt + 1);
  }
}

async function fetchCalendar(startDate, endDate) {
  const first = await fetchPage(startDate, endDate, 0);
  const offsets = [];
  for (let offset = PAGE_SIZE; offset < first.hits; offset += PAGE_SIZE) {
    offsets.push(offset);
  }

  const pages = [first];
  for (let index = 0; index < offsets.length; index += 3) {
    const batch = offsets.slice(index, index + 3);
    pages.push(
      ...(await Promise.all(batch.map((offset) => fetchPage(startDate, endDate, offset)))),
    );
  }

  const byId = new Map();
  for (const event of pages.flatMap((page) => page.results)) {
    if (!String(event.disciplines ?? "").includes("Track and Field")) continue;
    byId.set(event.id, event);
  }
  if (byId.size < Math.min(first.hits, 100)) {
    throw new Error(`World Athletics refresh returned only ${byId.size} unique track meetings`);
  }
  return [...byId.values()];
}

function countryCodeFromVenue(venue) {
  return String(venue ?? "").match(/\(([A-Z]{3})\)\s*$/)?.[1] ?? "";
}

function countryMapFromExisting() {
  const countries = new Map();
  for (const series of existingSeries) {
    const code = countryCodeFromVenue(series.area);
    if (code && series.country && !countries.has(code)) countries.set(code, series.country);
  }
  countries.set("GBR", "United Kingdom");
  countries.set("UND", "International");
  return countries;
}

function cleanVenue(venue) {
  return String(venue ?? "Venue TBC")
    .replace(/\s*\([A-Z]{3}\)\s*$/, "")
    .trim();
}

function competitionLabel(event) {
  return event.competitionGroup || event.competitionSubgroup || event.rankingCategory || "";
}

function isFeatured(event) {
  const text = `${event.name} ${competitionLabel(event)}`;
  return /diamond league|world athletics championships|olympic games|world athletics ultimate/i.test(
    text,
  );
}

function normalizeEvent(event, countries) {
  const venue = cleanVenue(event.venue);
  const code = countryCodeFromVenue(event.venue);
  const country = countries.get(code) || code || "International";
  const label = competitionLabel(event);
  const officialUrl = `${CALENDAR_URL}/results/${event.id}`;
  const dateRange = event.dateRange || `${event.startDate}–${event.endDate}`;
  const category = label || `ranking category ${event.rankingCategory || "not stated"}`;
  const slug = `wa-${slugify(event.name)}-${event.id}`;

  return {
    series: {
      slug,
      name: event.name,
      sport: "Athletics",
      country,
      county: venue,
      city: venue,
      area: event.venue || venue,
      surface: "Track",
      distances: ["Track & field"],
      summary: `${event.name} — ${venue}, ${country}. World Athletics calendar (${category}).`,
      description: `${event.name} at ${event.venue || venue}. ${event.disciplines}. ${dateRange}. Listed on the World Athletics global calendar; check the official page for the meeting timetable and entry arrangements.`,
      organiser: "World Athletics / national federation",
      website: officialUrl,
      featured: isFeatured(event),
      source_url: officialUrl,
    },
    editions: datesBetween(event.startDate, event.endDate).map((date, index) => ({
      seriesSlug: slug,
      date,
      distance: "Track & field",
      distanceKm: 0,
      status: date < isoToday() ? "Finished" : "TBC",
      source: officialUrl,
      notes: index === 0 ? dateRange : `Competition day ${index + 1} · ${dateRange}`,
    })),
  };
}

function datesBetween(start, end) {
  assertIsoDate(start, "World Athletics startDate");
  assertIsoDate(end, "World Athletics endDate");
  const dates = [];
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (dates.length > 31) throw new Error(`Competition date range is unexpectedly long: ${start}`);
  }
  return dates;
}

function mergeCalendar(refreshed, startDate, endDate) {
  const existingBySlug = new Map(existingSeries.map((series) => [series.slug, series]));
  const retainedEditions = existingEditions.filter((edition) => {
    const series = existingBySlug.get(edition.seriesSlug);
    return series?.surface !== "Track" || edition.date < startDate || edition.date > endDate;
  });

  const seriesBySlug = new Map();
  for (const edition of retainedEditions) {
    const series = existingBySlug.get(edition.seriesSlug);
    if (series) seriesBySlug.set(series.slug, series);
  }
  const editionsByKey = new Map(
    retainedEditions.map((edition) => [
      `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
      edition,
    ]),
  );

  for (const item of refreshed) {
    seriesBySlug.set(item.series.slug, item.series);
    for (const edition of item.editions) {
      editionsByKey.set(`${edition.seriesSlug}|${edition.date}|${edition.distance}`, edition);
    }
  }

  const editions = [...editionsByKey.values()].sort(
    (a, b) => b.date.localeCompare(a.date) || a.seriesSlug.localeCompare(b.seriesSlug),
  );
  const firstDate = new Map();
  for (const edition of editions) {
    if (!firstDate.has(edition.seriesSlug)) firstDate.set(edition.seriesSlug, edition.date);
  }
  const series = [...seriesBySlug.values()].sort(
    (a, b) =>
      String(firstDate.get(b.slug) || "").localeCompare(String(firstDate.get(a.slug) || "")) ||
      a.name.localeCompare(b.name),
  );
  return { series, editions };
}

function sourceText(calendar, startDate, endDate) {
  return `/**
 * World Athletics official competition calendar.
 *
 * Track-and-field meetings from ${startDate} through ${endDate} were refreshed from the
 * public World Athletics global calendar. Non-track athletics rows and confirmed later
 * championships are retained from the previous verified snapshot.
 * Generated by scripts/refresh-world-athletics-track-field.mjs; do not edit by hand.
 */
export const worldAthleticsSeries = [
${calendar.series.map((series) => JSON.stringify(series)).join(",\n")}
];

export const worldAthleticsEditions = [
${calendar.editions.map((edition) => JSON.stringify(edition)).join(",\n")}
];
`;
}

async function bumpSeedVersion(hash) {
  const source = await readFile(SEED_PATH, "utf8");
  const currentVersion = source.match(/const SEED_VERSION = "(athrecs-[^"]+)";/)?.[1];
  if (!currentVersion) throw new Error("Could not read the catalogue seed version");
  const baseVersion = currentVersion.replace(
    /-world-athletics-track-field-\d{4}-\d{2}-\d{2}-[a-f0-9]{10}$/,
    "",
  );
  const version = `${baseVersion}-world-athletics-track-field-${isoToday()}-${hash.slice(0, 10)}`;
  const updated = source.replace(
    /const SEED_VERSION = "athrecs-[^"]+";/,
    `const SEED_VERSION = "${version}";`,
  );
  if (updated === source) throw new Error("Could not update the catalogue seed version");
  await writeFile(SEED_PATH, updated);
  return version;
}

async function main() {
  const startDate = argument("--start") || isoToday();
  const endDate = argument("--end") || defaultEndDate();
  const checkOnly = process.argv.includes("--check");
  assertIsoDate(startDate, "--start");
  assertIsoDate(endDate, "--end");
  if (startDate > endDate) throw new Error("--start must not be after --end");

  const raw = await fetchCalendar(startDate, endDate);
  const countries = countryMapFromExisting();
  const refreshed = raw.map((event) => normalizeEvent(event, countries));
  const calendar = mergeCalendar(refreshed, startDate, endDate);
  const output = sourceText(calendar, startDate, endDate);
  const current = await readFile(OUTPUT_PATH, "utf8");
  const changed = current !== output;
  const hash = createHash("sha256").update(output).digest("hex");

  if (checkOnly) {
    console.log(
      JSON.stringify(
        {
          changed,
          officialTrackMeetings: raw.length,
          catalogueSeries: calendar.series.length,
          catalogueEditions: calendar.editions.length,
          startDate,
          endDate,
          hash,
        },
        null,
        2,
      ),
    );
    process.exitCode = changed ? 2 : 0;
    return;
  }

  if (changed) {
    await writeFile(OUTPUT_PATH, output);
    const seedVersion = await bumpSeedVersion(hash);
    console.log(`Refreshed ${raw.length} World Athletics track meetings (${seedVersion}).`);
  } else {
    console.log(`World Athletics track calendar is current (${raw.length} meetings).`);
  }
}

main().catch((error) => {
  console.error("[world-athletics-refresh]", error?.stack || error);
  process.exit(1);
});
