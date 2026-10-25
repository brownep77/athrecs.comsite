import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { load } from "cheerio";
import { racePageReviewFor, reviewedRacePage } from "../src/data/race-page-reviews.ts";
import { sportsEventJsonLd } from "../src/lib/athrecs/seo.ts";
import { catalogueCalendarRace } from "../src/lib/athrecs/catalogue-calendar.ts";
import { buildCalendarEvent, calendarUtc } from "../src/lib/athrecs/event-calendar.ts";
import { checkedFixtureStartLabel } from "../src/data/fixture-details.ts";

const slug = "wa-32-hella-hamburg-half-marathon-7238156";
const date = "2026-10-25";
const review = racePageReviewFor(slug, date);
const edition = {
  id: 1,
  event_date: date,
  distance_code: "Half",
  distance_km: 21.0975,
  status: "TBC",
  start_time: null,
  start_label: checkedFixtureStartLabel(slug, date, "Half"),
  source_url: null,
  entry_options: [],
  entry_url: null,
  result_count: 0,
};
const original = {
  event: {
    id: 1,
    slug,
    name: "32. hella Hamburg Half Marathon",
    sport: "Athletics",
    city: "Hamburg",
    country: "Germany",
    county: "",
    surface: "Road",
    organiser: "Steven Richter",
    website: "https://www.hamburg-halbmarathon.com",
    description: "Legacy summary",
  },
  distances: ["Half"],
  groups: [],
  related: [],
  past: [],
  upcoming: [edition],
};
const data = reviewedRacePage(original);
assert.equal(original.event.organiser, "Steven Richter", "Do not mutate stored values");
assert.equal(original.upcoming.length, 1);
assert.equal(data.event.organiser, review.organiser);
assert.equal(
  data.event.sport,
  "Running",
  "The verified half marathon uses the running-race layout even when imported as generic Athletics",
);
assert.equal(
  data.upcoming,
  original.upcoming,
  "Preserve the programme supplied by the reviewed fixture API",
);
assert.equal(data.upcoming[0].id, 1, "Keep edition identity for calendars/results");
assert.equal(
  reviewedRacePage({ ...original, event: { ...original.event, slug: "other-event" } }).event
    .organiser,
  "Steven Richter",
);
for (const later of ["2025-10-25", "2027-10-25", undefined])
  assert.equal(racePageReviewFor(slug, later), undefined);
assert.equal(
  reviewedRacePage({ ...original, upcoming: [{ ...edition, status: "Cancelled" }] }).event
    .organiser,
  "Steven Richter",
);
assert.equal(
  reviewedRacePage({
    ...original,
    upcoming: [edition, { ...edition, id: 2, result_count: 1 }],
  }).upcoming.length,
  2,
  "Do not hide a row with results",
);
assert.equal(
  reviewedRacePage({ ...original, upcoming: [edition, { ...edition, distance_code: "10K" }] })
    .upcoming.length,
  2,
  "Do not hide another distance",
);
const schema = sportsEventJsonLd({
  ...data.event,
  startDate: date,
  startTime: "09:30",
  utcOffset: review.utcOffset,
  venue: review.venue,
});
assert.equal(schema.startDate, "2026-10-25T09:30+01:00");
for (const utcOffset of ["invalid", "+25:00", "+01:99", "-14:01"]) {
  assert.equal(
    sportsEventJsonLd({ ...data.event, startDate: date, startTime: "09:30", utcOffset }).startDate,
    "2026-10-25T09:30",
  );
}
assert.equal(
  sportsEventJsonLd({ ...data.event, startDate: date, utcOffset: review.utcOffset }).startDate,
  date,
  "An offset must not invent an unknown start time",
);
assert.equal(schema.organizer.name, review.organiser);
assert.equal(schema.organizer.url, review.website);
assert.equal(schema.location.address.streetAddress, "Reeperbahn / Glacischaussee");
assert.equal(schema.location.address.addressCountry, "DE");
assert.equal(schema.location.address.postalCode, undefined, "Never invent a postcode");
assert.equal(
  sportsEventJsonLd({ ...data.event, startDate: "2027-10-25", startTime: "10:00" }).startDate,
  "2027-10-25T10:00",
);
assert.equal(sportsEventJsonLd({ ...data.event })["@type"], "WebPage");
const calendar = buildCalendarEvent(
  catalogueCalendarRace(data.event, data.upcoming[0], "https://www.athrecs.com"),
);
assert.equal(
  calendarUtc(date, "09:30", "Europe/Berlin"),
  "2026-10-25T08:30:00Z",
  "CET agrees with the IANA calendar conversion on clock-change day",
);
assert.equal(
  calendar.startUtc,
  null,
  "Keep the existing date-only calendar reminder for assigned waves",
);
assert.match(calendar.description, /Wave A starts at 09:30/);
assert.match(calendar.location, /Reeperbahn/);
const server = await createServer({ server: { middlewareMode: true } });
try {
  const { raceSearchContent } = await server.ssrLoadModule(
    "/src/lib/athrecs/race-search-content.ts",
  );
  const search = raceSearchContent(data);
  assert.equal(search.title, review.title);
  assert(search.description.length <= 175);
  assert.match(search.biography.join(" "), /BMS Die Laufgesellschaft/);
  assert.notEqual(
    raceSearchContent({ ...data, upcoming: [], past: [edition] }).title,
    review.title,
    "Do not promote a past race as upcoming",
  );
  const { RacePracticalInformation } = await server.ssrLoadModule(
    "/src/components/races/RacePracticalInformation.tsx",
  );
  const $ = load(renderToStaticMarkup(createElement(RacePracticalInformation, { data })));
  assert.equal($("#race-schedule li").length, 1);
  assert.match($("#race-schedule").text(), /First wave 09:30 CET/);
  assert.doesNotMatch($("#race-schedule").text(), /CEST|Date TBC|Previous start time/);
  assert.match($("#race-location").text(), /Race start.*Reeperbahn/s);
  assert.match($("#race-location").text(), /Race headquarters.*Hamburg Messe/s);
  assert.match($("#race-about-heading").parent().text(), /BMS Die Laufgesellschaft/);
  console.log(
    "PASS: Hamburg example title, visible facts, structured data, CET offset, assigned-wave calendar and year/cancellation boundaries.",
  );
} finally {
  await server.close();
}
