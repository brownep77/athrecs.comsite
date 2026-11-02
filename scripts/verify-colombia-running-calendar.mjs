import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "vite";

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
});
try {
  const { colombiaRaceSeries: series, colombiaRaceEditions: editions } =
    await vite.ssrLoadModule("/src/data/colombia-races.ts");
  const catalogue = await vite.ssrLoadModule("/src/data/catalogue.ts");
  const { FIXTURE_DETAILS } = await vite.ssrLoadModule("/src/data/fixture-details.ts");
  const { catalogueCalendarRace } = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-calendar.ts");
  const { buildCalendarEvent, calendarIcs } = await vite.ssrLoadModule("/src/lib/athrecs/event-calendar.ts");
  const { racePageMetadata } = await vite.ssrLoadModule("/src/lib/athrecs/race-page-metadata.ts");
  const { calendarTimeZoneForPlace, timeZoneForPlace } = await vite.ssrLoadModule("/src/lib/athrecs/timezone.ts");
  const key = (edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  assert.equal(series.length, 18);
  assert.equal(editions.length, 52);
  assert.equal(editions.filter((edition) => edition.startTime).length, 33);
  assert.equal(new Set(editions.map(key)).size, editions.length);
  assert.equal(calendarTimeZoneForPlace({ country: "Colombia" }), "America/Bogota");
  assert.equal(timeZoneForPlace({ country: "Colombia" }), "America/Bogota");

  for (const event of series) {
    assert.equal(event.country, "Colombia");
    assert(event.county && event.city, `${event.slug}: department and city required`);
    const merged = catalogue.seriesList.find((row) => row.slug === event.slug);
    for (const field of ["name", "country", "county", "city", "website", "description"])
      assert.equal(merged[field], event[field], `${event.slug}: merged ${field} changed`);
  }
  for (const edition of editions) {
    assert(edition.date >= "2026-11-01" && edition.date <= "2027-07-25");
    assert(edition.distanceKm > 0);
    assert.equal(edition.publishAllDistances, true);
    const merged = catalogue.editions.filter((row) => key(row) === key(edition));
    assert.equal(merged.length, 1, `Exactly one merged fixture required: ${key(edition)}`);
    assert.equal(merged[0].distanceKm, edition.distanceKm);
    assert.equal(merged[0].startTime ?? null, edition.startTime ?? null);
    const detail = FIXTURE_DETAILS[`${edition.seriesSlug}|${edition.date}`];
    assert.equal(detail.timeZone, "America/Bogota");
    assert.equal(detail.starts[edition.distance].time, edition.startTime ?? null);
    assert.match(detail.starts[edition.distance].sourceUrl || detail.sourceUrl, /^https:\/\//);
    assert.equal(detail.checkedAt, "2026-10-28");
  }

  const dbEdition = (edition, id = 1) => ({
    id, event_date: edition.date, distance_code: edition.distance,
    distance_km: edition.distanceKm, status: edition.status,
    start_time: edition.startTime ?? null, end_date: edition.endDate ?? null,
  });
  const find = (slug, distance) => {
    const row = editions.find((edition) => edition.seriesSlug === slug && edition.distance === distance);
    assert(row, `Expected reviewed distance: ${slug} ${distance}`);
    return row;
  };
  const eventFor = (edition) => series.find((event) => event.slug === edition.seriesSlug);
  const calendar = (edition) => buildCalendarEvent(
    catalogueCalendarRace(eventFor(edition), dbEdition(edition), "https://www.athrecs.com"),
  );
  const cucuta = find("media-maraton-de-cucuta", "21K");
  assert.equal(calendar(cucuta).startUtc, "2026-11-15T10:30:00Z");
  assert.match(calendarIcs(calendar(cucuta)), /DTSTART:20261115T103000Z/);
  const cucutaMetadata = racePageMetadata(eventFor(cucuta), editions.filter((row) => row.seriesSlug === cucuta.seriesSlug).map(dbEdition));
  assert.equal(cucutaMetadata.startTime, "05:30");
  assert.equal(cucutaMetadata.utcOffset, "-05:00");

  const bogota = find("media-maraton-de-bogota-2026-ad1d6f7a", "Half");
  assert.equal(bogota.date, "2027-07-25");
  assert.equal(bogota.distanceKm, 21.097);
  const bogotaMetadata = racePageMetadata(eventFor(bogota), editions.filter((row) => row.seriesSlug === bogota.seriesSlug).map(dbEdition));
  assert.equal(bogotaMetadata.startTime, "08:30", "Event schema uses the explicitly reviewed first wave");
  assert.equal(bogotaMetadata.utcOffset, "-05:00");
  assert.equal(calendar(bogota).startUtc, null, "An individual runner's wave is not guessed");
  assert.match(calendar(bogota).description, /wave/i);

  const desert = find("the-desert-marathon-colombia", "100K");
  assert.equal(desert.date, "2027-05-28");
  assert.equal(desert.endDate, "2027-05-30");
  const desertIcs = calendarIcs(calendar(desert));
  assert.match(desertIcs, /DTSTART;VALUE=DATE:20270528/);
  assert.match(desertIcs, /DTEND;VALUE=DATE:20270531/);
  assert.doesNotMatch(desertIcs, /DTSTART:.*T000000/);

  const columbia = find("columbia-trail-challenge", "11K");
  assert.equal(columbia.distanceKm, 11);
  assert.equal(editions.filter((row) => row.seriesSlug === columbia.seriesSlug).length, 1,
    "Conflicting 21.3/23.3 km long course must stay withheld");
  for (const edition of editions.filter((row) => !row.startTime)) {
    assert.equal(calendar(edition).startUtc, null, `No invented clock for ${key(edition)}`);
  }
  for (const edition of editions.filter((row) => row.seriesSlug === "maraton-de-cali")) {
    assert(edition.entryOptions.every((option) => option.status === "unknown"));
  }
  const audit = JSON.parse(await readFile(new URL("../docs/colombia-running-calendar/review-2026-10-28.json", import.meta.url), "utf8"));
  assert.equal(audit.seriesCount, series.length);
  assert.equal(audit.distanceEditions, editions.length);
  console.log("Colombia calendar checks passed: 18 identities, 52 merged distances, 33 starts, UTC−5, wave labels, unknown clocks, three-stage dates and held conflicting distance.");
} finally {
  await vite.close();
}
