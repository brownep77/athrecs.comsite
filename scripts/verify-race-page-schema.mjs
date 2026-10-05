import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { racePageJsonLd } from "../src/lib/athrecs/seo.ts";

const race = {
  name: 'Example meeting "Autumn"',
  slug: "example-autumn-meeting",
  description: "Example meeting archive and race details.",
  city: "Example City",
  country: "Example Country",
  sport: "Athletics",
  website: "https://example.org/meeting",
};
const serialized = (input) => JSON.parse(JSON.stringify(racePageJsonLd(input)));

// Historical pages and undated listings must not emit incomplete event items.
// Invalid calendar dates must not become made-up race dates through JS rollover.
for (const startDate of [
  undefined,
  null,
  "",
  "TBC",
  "2026",
  "2026-2-3",
  "2026-02-29",
  "2026-04-31",
  "2026-13-01",
  "2026-00-01",
]) {
  const item = serialized({ ...race, startDate, startTime: "09:00" });
  assert.equal(item["@type"], "WebPage", String(startDate));
  assert.equal(item.name, race.name);
  assert.equal(item.description, race.description);
  assert.equal(item.url, `https://www.athrecs.com/races/${race.slug}`);
  for (const field of ["startDate", "eventStatus", "eventAttendanceMode", "organizer", "location"])
    assert.equal(field in item, false, `${String(startDate)}: unexpected event field ${field}`);
}

// Keep dated event listings eligible, without inventing an unknown start time.
const dateOnly = serialized({ ...race, startDate: "2026-10-10" });
assert.equal(dateOnly["@type"], "SportsEvent");
assert.equal(dateOnly.startDate, "2026-10-10");
assert.equal(dateOnly.eventStatus, "https://schema.org/EventScheduled");
assert.equal(dateOnly.location.address.addressLocality, race.city);
assert.equal(dateOnly.location.address.addressCountry, race.country);
assert.equal(serialized({ ...race, startDate: "2028-02-29" }).startDate, "2028-02-29");
assert.equal(
  serialized({ ...race, startDate: "2026-10-10", startTime: "09:30:00" }).startDate,
  "2026-10-10T09:30:00",
);

// The route must use the shared guard and the displayed upcoming edition.
const route = readFileSync(new URL("../src/routes/races/$slug.tsx", import.meta.url), "utf8");
assert.match(route, /racePageJsonLd\(\{/);
assert.match(route, /const next = upcoming\[0\]/);
assert.match(route, /startDate: next\?\.event_date/);
assert.match(route, /startTime: next\?\.start_time/);

console.log(
  "Race-page schema verified: archive/undated fallback, valid event dates and local start times.",
);
