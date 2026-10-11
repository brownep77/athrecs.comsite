import assert from "node:assert/strict";
import { athleteSearchContent } from "../src/lib/athrecs/athlete-search-content.ts";
import { sportsEventJsonLd } from "../src/lib/athrecs/seo.ts";

const now = new Date("2026-10-11T12:00:00Z");
const athlete = { slug: "alex-example", display_name: "Alex Example", club: "Example AC", nationality: "British" };
const result = { resultId: 1, editionId: 1, eventName: "Example 10K", eventSlug: "example-10k", sport: "Running",
  surface: "Road", country: "France", eventDate: "2026-09-01", distanceCode: "10K", distanceKm: 10,
  status: "finished", finishTimeSeconds: 2401, chipTimeSeconds: 2401, gunTimeSeconds: null,
  overallPlace: 10, category: null, sourceUrls: ["https://example.org/result"],
  details: { verificationStatus: "source_verified" } };
const content = athleteSearchContent({ athlete, profileResults: [result], sourceHistories: [] }, now);
assert.match(content.bio, /Alex Example is a runner/);
assert.match(content.bio, /40 minutes and 1 second/);
assert.match(content.bio, /Example 10K on 1 September 2026/);
assert.match(content.bio, /nationality is British/);
assert(!content.bio.includes("France"), "Race geography must not become nationality or residence");
assert.equal(content.jsonLd.mainEntity.description, content.bio);
assert.equal(content.jsonLd.mainEntity["@type"], "Person");
assert.equal(content.jsonLd.mainEntity.memberOf.name, "Example AC");
assert(content.description.length <= 175);
for (const override of [
  { details: { verificationStatus: "unverified" } }, { details: {} },
  { details: { verificationStatus: "source_verified", profileExcluded: true } },
  { status: "DNF" }, { status: "DQ" }, { conflicting: true },
  { eventDate: "2027-01-01" }, { eventDate: "2026-02-30" }, { finishTimeSeconds: 0 },
]) {
  const value = athleteSearchContent({ athlete, profileResults: [{ ...result, ...override }], sourceHistories: [] }, now);
  assert(!value.bio.includes("40 minutes"), JSON.stringify(override));
}
const history = { provider: "Example Timing", performances: [{ date: "2026-10-01", year: 2026,
  meeting: "Example Half", discipline: "Half Marathon", performance: "1:30:20", venue: "Test City",
  place: "10", labels: [], sourceUrls: ["https://example.org/history"], verificationStatus: "source_verified" }] };
assert.match(athleteSearchContent({ athlete, profileResults: [], sourceHistories: [history] }, now).bio, /Example Half on 1 October 2026/);
const minimal = athleteSearchContent({ athlete: { slug: "new-athlete", display_name: "New Athlete" }, profileResults: [], sourceHistories: [] }, now);
assert.equal(minimal.bio, "New Athlete is an athlete with a public profile on ATHRECS.");
assert(!("memberOf" in minimal.jsonLd.mainEntity));
const event = sportsEventJsonLd({ name: "Example Race", slug: "example-race", startDate: "2027-01-01", organiser: "Example Club",
  entryOptions: [{ is_verified: true, entry_type: "official", entry_url: "https://example.org/entry", price_amount: 25, price_currency: "GBP", status: "open" },
    { is_verified: false, entry_type: "official", entry_url: "https://example.org/bad", price_amount: 0, price_currency: "GBP", status: "open" }] });
assert.equal(event.organizer.name, "Example Club");
assert.equal(event.offers.length, 1);
assert.equal(event.offers[0].price, 25);
assert.equal(event.endDate, undefined, "Never fabricate an end date to silence a warning");
console.log("PASS: factual public biographies, matching Person data, spoken times, accepted-result gating, privacy-safe omissions and evidenced event offers.");
