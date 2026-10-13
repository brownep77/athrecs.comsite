import assert from "node:assert/strict";
import {
  publicAthleteNarrative,
  publicNationality,
} from "../src/lib/athrecs/public-athlete-narrative.ts";
import { publicAthleteSearchContent } from "../src/lib/athrecs/public-athlete-search-content.ts";
import { createServer } from "vite";
const server = await createServer({ server: { middlewareMode: true } });
let raceSearchContent;
try {
  ({ raceSearchContent } = await server.ssrLoadModule("/src/lib/athrecs/race-search-content.ts"));
} finally {
  await server.close();
}

const result = {
  eventName: "Example Road 10K",
  eventDate: "2025-09-01",
  distanceCode: "10K",
  sport: "Running",
  eventSlug: "example-road-10k",
  surface: "Road",
  country: "France",
  status: "finished",
  overallPlace: 1,
  genderPlace: null,
  categoryPlace: null,
  category: null,
  finishTimeSeconds: 2401,
  details: { verificationStatus: "source_verified" },
};
const profile = {
  displayName: "Alex Example",
  slug: "alex-example",
  biography: ["Alex Example is a runner."],
  sports: ["Running"],
  nationality: "NZL",
  club: "Example Harriers",
  clubSlug: "example-harriers",
  entries: [{ kind: "recorded", result }],
  careerSummary: {
    text: "Alex Example's published record includes performances from 2006 to 2025.",
    events: [{ name: "Earlier Marathon", year: "2006", verification: "Unverified record" }],
  },
};
const narrative = publicAthleteNarrative(profile).join(" ");
assert(narrative.startsWith(profile.biography[0]), "Preserve the athlete's biography");
assert.match(narrative, /nationality is New Zealand/);
assert.match(narrative, /Earlier Marathon \(2006; unverified record\)/);
assert.match(narrative, /Source-checked results include 1st overall over 10K at Example Road 10K/);
assert(!narrative.includes("France"), "Race geography is not athlete nationality");
assert.deepEqual(publicAthleteNarrative({ ...profile, biography: [] }), []);
for (const nationality of [null, "", "Unknown", "TBC", "International", "UND"])
  assert.equal(publicNationality(nationality), null);
for (const [value, name] of [
  ["ENG", "England"],
  ["SCO", "Scotland"],
  ["WAL", "Wales"],
  ["NIR", "Northern Ireland"],
])
  assert.equal(publicNationality(value), name);
const seo = publicAthleteSearchContent(profile);
assert.equal(seo.jsonLd.mainEntity.nationality.name, "New Zealand");
assert.equal(seo.jsonLd.mainEntity.memberOf.url, "https://www.athrecs.com/clubs/example-harriers");
assert(seo.jsonLd.mainEntity.description.includes(narrative));
for (const override of [
  { details: { verificationStatus: "unverified" } },
  { details: {} },
  { details: { verificationStatus: "source_verified", profileExcluded: true } },
  { status: "DNF" },
  { status: "DNS" },
  { status: "DQ" },
  { conflicting: true },
  { eventDate: "2199-01-01" },
  { eventDate: "2025-02-30" },
  { displayRound: "heat" },
  { eventName: "Example Relay" },
  { eventName: "World Championships", displayRound: undefined },
]) {
  const text = publicAthleteNarrative({
    ...profile,
    entries: [{ kind: "recorded", result: { ...result, ...override } }],
  }).join(" ");
  assert(!text.includes("1st"), JSON.stringify(override));
}
const category = publicAthleteNarrative({
  ...profile,
  entries: [
    {
      kind: "recorded",
      result: {
        ...result,
        overallPlace: 50,
        categoryPlace: 1,
        category: "M40",
      },
    },
  ],
}).join(" ");
assert.match(category, /1st in the M40 category/);
assert(!category.includes("1st overall"));
const history = {
  meeting: "Example Half",
  date: "2025-10-01",
  discipline: "Half Marathon",
  performance: "1:30:00",
  place: "1",
  labels: [],
  verificationStatus: "source_verified",
};
const historyBio = (row) =>
  publicAthleteNarrative({
    ...profile,
    entries: [{ kind: "history", result: { performance: row } }],
  }).join(" ");
assert(!historyBio(history).includes("1st"), "Ambiguous source place is not overall place");
assert.match(
  historyBio({ ...history, places: { overall: 1, gender: null, category: null } }),
  /1st overall/,
);
assert(
  !historyBio({ ...history, labels: ["Overall Position: 1", "Overall Position: 2"] }).includes(
    "1st",
  ),
);
assert(!historyBio({ ...history, places: { overall: 1 }, labels: ["Split"] }).includes("1st"));

const race = {
  event: {
    name: "Example Half",
    sport: "Running",
    city: "Norwich",
    county: "Norfolk",
    country: "ENG",
    surface: "Road",
    organiser: "Example AC",
  },
  distances: ["Half", "10K"],
  upcoming: [{ event_date: "2027-04-04", distance_code: "Half", status: "Open" }],
  past: [
    { event_date: "2025-04-06", distance_code: "Half", status: "Finished" },
    { event_date: "2025-04-06", distance_code: "10K", status: "Finished" },
  ],
};
const bio = raceSearchContent(race);
assert.match(bio.biography.join(" "), /Norwich, Norfolk, England/);
assert.match(bio.biography.join(" "), /half marathon, 10K/);
assert.match(bio.biography.join(" "), /next listed date is 4 April 2027/);
assert.match(bio.biography.join(" "), /editions from 2025/);
assert.match(bio.description, /Norwich, Norfolk, England/);
assert(bio.description.length <= 175);
assert(
  !raceSearchContent({ ...race, upcoming: [{ ...race.upcoming[0], status: "Cancelled" }] }).next,
);
assert(
  !raceSearchContent({ ...race, upcoming: [{ ...race.upcoming[0], event_date: "2027-02-30" }] })
    .next,
);
const empty = raceSearchContent({
  event: { name: "Undated Event", sport: "Athletics", country: "Unknown", surface: "Other" },
  distances: [],
  past: [],
  upcoming: [],
});
assert(!empty.biography.join(" ").includes("Unknown"));
assert.match(empty.biography.join(" "), /No future date/);
assert(!empty.biography.join(" ").includes("archive includes"));
assert(
  !raceSearchContent({ ...race, event: { ...race.event, organiser: "See official site" } })
    .biography.join(" ")
    .includes("listed organiser"),
);
assert.deepEqual(race.upcoming, [
  { event_date: "2027-04-04", distance_code: "Half", status: "Open" },
]);
console.log(
  "PASS: public biographies preserve editorial text, nationality provenance, verification/round/category boundaries, privacy and evidence-based race summaries.",
);
