import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
registerHooks({
  resolve(s, c, n) {
    if ((s.startsWith(".") && c.parentURL?.includes("/src/")) || s.startsWith("@/")) {
      let p = s.startsWith("@/")
        ? path.resolve("src", s.slice(2))
        : fileURLToPath(new URL(s, c.parentURL));
      if (!path.extname(p)) p = fs.existsSync(p + ".ts") ? p + ".ts" : path.join(p, "index.ts");
      return n(pathToFileURL(p).href, c);
    }
    return n(s, c);
  },
});
const { racePageMetadata, raceUtcOffset, raceEditionStart } =
  await import("../src/lib/athrecs/race-page-metadata.ts");
const { raceSearchContent, nextRaceEdition } =
  await import("../src/lib/athrecs/race-search-content.ts");
const { sportsEventJsonLd, publicOrganiserName } = await import("../src/lib/athrecs/seo.ts");
const { reviewedRacePage } = await import("../src/data/race-page-reviews.ts");
const { publicCatalogueContent } = await import("../src/lib/athrecs/public-catalogue-content.ts");
const { isReviewedFixturePlaceholder } = await import("../src/data/fixture-details.ts");
const { seriesList, editions } = await import("../src/data/catalogue.ts");
const event = {
  slug: "synthetic",
  name: "Example Half Marathon",
  sport: "Running",
  country: "England",
  city: "Norwich",
  county: "Norfolk",
  organiser: "Example AC",
};
const row = {
  event_date: "2027-04-04",
  distance_code: "Half",
  status: "Open",
  start_time: "09:30",
  entry_options: [],
};
const data = (changes = {}) => ({
  event,
  upcoming: [row],
  past: [],
  distances: ["Half"],
  ...changes,
});
assert.equal(
  raceSearchContent(data()).title,
  "Example Half Marathon 2027 | Date & Entry | AthRecs",
);
assert.equal(
  raceSearchContent(data({ event: { ...event, name: "Example 2027 Half" } })).title,
  "Example 2027 Half | Date & Entry | AthRecs",
);
assert.equal(
  raceSearchContent(data({ upcoming: [], past: [row] })).title,
  "Example Half Marathon | Results & History | AthRecs",
);
assert.equal(
  raceSearchContent(data({ upcoming: [] })).title,
  "Example Half Marathon | Race Details | AthRecs",
);
assert.match(raceSearchContent(data()).description, /Sunday, 4 April 2027/);
assert.equal(
  nextRaceEdition([
    { ...row, event_date: "2028-01-01" },
    { ...row, status: "Cancelled", event_date: "2026-01-01" },
    row,
  ]),
  row,
);
const pairs = [
  ["2027-01-10", "09:30", "Europe/London", "+00:00"],
  ["2027-07-10", "09:30", "Europe/London", "+01:00"],
  ["2026-10-25", "09:30", "Europe/Berlin", "+01:00"],
  ["2026-11-01", "09:00", "America/New_York", "-05:00"],
  ["2027-01-10", "09:00", "Australia/Adelaide", "+10:30"],
  ["2027-07-10", "09:00", "Asia/Kathmandu", "+05:45"],
  ["2026-10-25", "02:30", "Europe/Berlin", undefined],
  ["2027-03-28", "01:30", "Europe/London", undefined],
  ["2027-02-30", "09:00", "Europe/London", undefined],
  ["2027-01-01", "09:00", "Invalid/Zone", undefined],
];
for (const args of pairs)
  assert.equal(raceUtcOffset(...args.slice(0, 3)), args[3], JSON.stringify(args));
assert.equal(raceEditionStart(event, row), "09:30 BST");
assert.equal(raceEditionStart({ ...event, country: "Unknown" }, row), "09:30 local time");
assert.equal(racePageMetadata(event, [row]).utcOffset, "+01:00");
const ten = { ...row, distance_code: "10K", start_time: "08:30" };
assert.equal(racePageMetadata(event, [row, ten]).startTime, "08:30");
assert.equal(
  racePageMetadata(event, [row, { ...ten, start_time: null }]).startTime,
  null,
  "Incomplete programme must not advertise a guessed first start",
);
assert.equal(
  racePageMetadata(event, [{ ...row, start_label: "Waves from 09:30" }]).startTime,
  null,
);
assert.equal(
  racePageMetadata({ ...event, country: "United States", county: "" }, [row]).startTime,
  null,
);
assert.equal(racePageMetadata(event, []).startTime, null);
assert.equal(racePageMetadata(event, [{ ...row, status: "Cancelled" }]).next, undefined);
assert.equal(
  racePageMetadata({ ...event, slug: "marriotts-way-races" }, [
    { ...row, event_date: "2027-02-21", start_time: "10:30" },
  ]).startTime,
  "08:30",
);
assert.equal(
  racePageMetadata({ ...event, slug: "marriotts-way-races" }, [
    { ...row, event_date: "2028-02-21", start_time: "10:30" },
  ]).startTime,
  "10:30",
);
const transition = racePageMetadata(event, [
  { ...row, event_date: "2026-10-24", end_date: "2026-10-25", end_time: "12:00" },
]);
assert.equal(transition.utcOffset, "+01:00");
assert.equal(transition.endUtcOffset, "+00:00");
const holkham = { ...event, slug: "holkham-half-10k" };
const h = racePageMetadata(holkham, [{ ...row, event_date: "2027-05-16" }]);
assert.equal(h.venue.postalCode, "NR23 1AB");
assert.equal(h.organiser, "RunThrough");
assert.equal(
  racePageMetadata(holkham, [{ ...row, event_date: "2028-05-16" }]).venue.postalCode,
  undefined,
);
assert.equal(
  racePageMetadata(holkham, [{ ...row, event_date: "2027-05-16", distance_code: "5K" }]).venue
    .postalCode,
  undefined,
);
for (const name of [
  "See website / TRT",
  "TBC",
  "Other",
  "See official site",
  "Check organiser website",
  "https://example.test",
  "England Athletics licensed competition",
])
  assert.equal(publicOrganiserName(name), undefined, name);
assert.equal(publicOrganiserName("Example Running Club"), "Example Running Club");

// Screen every catalogue page, including archives. This is structural coverage,
// not a claim that every source or missing real-world fact has been rechecked.
const today = "2026-10-25",
  bySlug = new Map();
for (const e of editions) {
  if (isReviewedFixturePlaceholder(e.seriesSlug, e.date, e.distance)) continue;
  const rows = bySlug.get(e.seriesSlug) || [];
  rows.push({
    event_date: e.date,
    distance_code: e.distance,
    status: e.status,
    start_time: e.startTime ?? null,
    entry_options: [],
  });
  bySlug.set(e.seriesSlug, rows);
}
const report = {
  checkedOn: today,
  pages: 0,
  editions: editions.length,
  upcomingPages: 0,
  archiveOrUndatedPages: 0,
  timedMetadataPages: 0,
  dateOnlyMetadataPages: 0,
  preciseGuideVenues: 0,
  organiserNames: 0,
  missingOrganiserNames: 0,
  longTitles: 0,
};
const missing = [];
for (const raw of seriesList) {
  const event = publicCatalogueContent(raw),
    rows = bySlug.get(event.slug) || [];
  const model = reviewedRacePage({
    event,
    distances: event.distances ?? [],
    upcoming: rows.filter((r) => r.event_date >= today),
    past: rows.filter((r) => r.event_date < today),
  });
  const content = raceSearchContent(model),
    metadata = racePageMetadata(model.event, model.upcoming),
    next = metadata.next;
  const schema = sportsEventJsonLd({
    ...model.event,
    description: content.biography.join(" "),
    region: event.county,
    startDate: next?.event_date,
    startTime: metadata.startTime,
    utcOffset: metadata.utcOffset,
    venue: metadata.venue,
    organiser: metadata.organiser ?? model.event.organiser,
    website: metadata.organiserWebsite,
  });
  assert(content.title.trim(), event.slug);
  assert(content.description.length <= 175, event.slug);
  assert(!/run\s*abc/i.test(JSON.stringify({ content, schema })), event.slug);
  assert(!/NaN|undefined/.test(JSON.stringify(schema)), event.slug);
  assert.equal(schema["@type"], next ? "SportsEvent" : "WebPage", event.slug);
  if (next) {
    report.upcomingPages++;
    if (metadata.startTime) {
      report.timedMetadataPages++;
      assert.match(schema.startDate, /T\d{2}:\d{2}(?::\d{2})?[+-]\d{2}:\d{2}$/);
    } else {
      report.dateOnlyMetadataPages++;
      assert.equal(schema.startDate, next.event_date);
    }
    if (metadata.venue?.postalCode || metadata.venue?.streetAddress) report.preciseGuideVenues++;
    if (schema.organizer) report.organiserNames++;
    else report.missingOrganiserNames++;
    if (!metadata.startTime || !schema.organizer)
      missing.push({
        slug: event.slug,
        date: next.event_date,
        missingStartOrZone: !metadata.startTime,
        missingOrganiser: !schema.organizer,
      });
  } else report.archiveOrUndatedPages++;
  if (content.title.length > 80) report.longTitles++;
  report.pages++;
}
fs.mkdirSync("artifacts", { recursive: true });
fs.writeFileSync(
  "artifacts/race-page-rollout-audit.json",
  JSON.stringify({ report, needsSourceReview: missing }, null, 2) + "\n",
);
console.log(
  "PASS: title, programme, venue, organiser, date scope and time-zone checks; full catalogue structural audit.",
);
console.log(JSON.stringify(report, null, 2));
