import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
import {
  publicCatalogueContent,
  publicCatalogueText,
} from "../src/lib/athrecs/public-catalogue-content.ts";
import { retainedFixtureAliases } from "../src/data/fixture-deduplication.ts";
import { fixtureDateIsWithheld } from "../src/data/fixture-date-reviews.ts";

const original = {
  event: {
    id: 1,
    slug: "example-race",
    name: "Example 10",
    organiser: "See runABC / organiser",
    summary: "A ten-mile road race. Listed on runABC (Midlands).",
    description: "Read the RunABC page. Entries are closed.",
    website: "https://runabc.co.uk/example",
  },
  upcoming: [
    {
      id: 2,
      event_date: "2027-05-02",
      distance_code: "10mi",
      start_time: "11:00",
      status: "Closed",
      source_url: "https://RUNABC.co.uk/example",
      entry_url: "https://runabc.co.uk/example",
      entry_options: [
        {
          id: 3,
          provider_code: "directory",
          provider_name: "RunABC",
          entry_url: "https://runabc.co.uk/example",
        },
        {
          id: 4,
          provider_code: "official",
          provider_name: "Example Club",
          entry_url: "https://example.org/enter",
          notes: "Linked from runABC. Sold out.",
          status: "sold_out",
        },
      ],
      result_links: [
        { results_url: "https://runabc.co.uk/example", provider_name: "runABC" },
        { results_url: "https://example.org/results", provider_name: "Example Timing" },
      ],
    },
  ],
};
const snapshot = structuredClone(original);
const shown = publicCatalogueContent(original);
assert.deepEqual(original, snapshot, "publication must not mutate stored evidence");
assert.doesNotMatch(JSON.stringify(shown), /run\s*abc/i);
assert.equal(shown.event.summary, "A ten-mile road race.");
assert.equal(shown.event.description, "Entries are closed.");
assert.equal(shown.upcoming.length, 1, "a withheld entry URL must not remove the race/date");
assert.equal(shown.upcoming[0].entry_url, "");
assert.equal(shown.upcoming[0].status, "Closed");
assert.equal(shown.upcoming[0].start_time, "11:00");
assert.deepEqual(
  shown.upcoming[0].entry_options.map((x) => x.id),
  [4],
);
assert.equal(shown.upcoming[0].entry_options[0].notes, "Sold out.");
assert.equal(shown.upcoming[0].result_links[0].provider_name, "Example Timing");
assert.equal(publicCatalogueText("https://www.runabc.com/example"), "");
assert.equal(publicCatalogueText("Contact the organiser."), "Contact the organiser.");
assert.deepEqual(publicCatalogueContent(shown), shown);

assert.equal(retainedFixtureAliases["green-thumb-fenland-10"], "ea-runevents-fenland-10-wisbech");
assert.equal(retainedFixtureAliases["lingwood-santa-dash"], "santa-dash-lingwood");
for (const [date, month] of [
  ["2027-01-17", "january"],
  ["2027-05-02", "may"],
  ["2027-10-17", "october"],
  ["2027-12-12", "december"],
]) {
  assert.ok(fixtureDateIsWithheld("run-heaton-park-half-marathon-march-2027", date));
  assert.ok(!fixtureDateIsWithheld(`runthrough-heaton-park-${month}-2027`, date));
}
assert.ok(!fixtureDateIsWithheld("run-heaton-park-half-marathon-march-2027", "2027-03-28"));

const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { seriesList, editions } = await vite.ssrLoadModule("/src/data/catalogue.ts");
  const publicSeed = publicCatalogueContent({ events: seriesList, editions });
  assert.doesNotMatch(JSON.stringify(publicSeed), /run\s*abc/i);
  assert.equal(publicSeed.events.length, seriesList.length);
  assert.equal(publicSeed.editions.length, editions.length);
  const { raceLink } = await vite.ssrLoadModule("/src/lib/athrecs/race-information.ts");
  const { eventSourceOf } = await vite.ssrLoadModule("/src/lib/athrecs/race-briefing.ts");
  for (const website of ["", "https://example.org/organiser"]) {
    const source = eventSourceOf({ slug: "synthetic-readable-meeting-abcd1234", sport: "Athletics", website,
      sourceUrl: "https://worldathletics.org/competition/calendar-results" });
    assert.equal(source.kind, "world-athletics", "A readable URL retains its stored provider attribution");
    assert.equal(source.url, "https://worldathletics.org/competition/calendar-results");
  }
  const { resultCredit } = await vite.ssrLoadModule("/src/lib/athrecs/result-credit.ts");
  assert.equal(raceLink("https://runabc.co.uk/example"), null);
  assert.equal(raceLink("https://example.org/enter"), "https://example.org/enter");
  assert.equal(resultCredit("https://runabc.co.uk/example", "runABC"), null);
  assert.doesNotMatch(
    JSON.stringify(
      eventSourceOf({
        slug: "example",
        sport: "Running",
        website: "https://runabc.co.uk/example",
        organiser: "See runABC / organiser",
      }),
    ),
    /run\s*abc/i,
  );
  console.log(
    `Public source policy checked against ${seriesList.length} seed events and ${editions.length} editions; all identities/editions retained.`,
  );
} finally {
  await vite.close();
}

for (const path of [
  "athrecs/api.ts",
  "running/catalogue.server.ts",
  "athrecs/race-places.server.ts",
  "athrecs/sport-fixtures.server.ts",
  "athrecs/public-results-api.ts",
])
  assert.match(
    readFileSync(new URL(`../src/lib/${path}`, import.meta.url), "utf8"),
    /publicCatalogueContent/,
  );
assert.doesNotMatch(
  readFileSync(new URL("../src/routes/races/$slug.tsx", import.meta.url), "utf8"),
  /runabc/i,
);
console.log(
  "Public catalogue references, safe entry/results links and six reviewed duplicate occurrences: PASS",
);
