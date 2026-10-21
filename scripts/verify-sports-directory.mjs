import assert from "node:assert/strict";
import { SPORTS_ORGANISATIONS } from "../src/data/sports-organisations.ts";
import { SPORT_PAGES } from "../src/lib/athrecs/sport-pages.ts";
import {
  filterSportsOrganisations,
  getSportsOrganisation,
  parseDirectorySearch,
} from "../src/lib/athrecs/sports-directory.ts";

const slugs = new Set();
const validSports = new Set(SPORT_PAGES.map((sport) => sport.slug));
for (const body of SPORTS_ORGANISATIONS) {
  assert(!slugs.has(body.slug), `Duplicate organisation: ${body.slug}`);
  slugs.add(body.slug);
  assert.match(body.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert(body.name && body.summary && body.jurisdiction && body.territories.length);
  assert.match(body.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert(body.sources.length, `Missing references: ${body.name}`);
  for (const value of [body.website, ...body.sources]) {
    const url = new URL(value);
    assert.equal(url.protocol, "https:");
    assert(!url.username && !url.password);
  }
  for (const sport of body.sports)
    assert(validSports.has(sport), `${body.name}: unknown sport ${sport}`);
  assert(body.sports.length || body.type === "funding");
}
for (const body of SPORTS_ORGANISATIONS) {
  for (const related of body.related ?? [])
    assert(slugs.has(related), `Missing relationship: ${related}`);
}
for (const sport of SPORT_PAGES) {
  assert(
    filterSportsOrganisations({ sport: sport.slug }).some(
      (body) => body.type !== "funding" && body.type !== "olympic",
    ),
    `Missing coverage: ${sport.label}`,
  );
}
const names = (search) => filterSportsOrganisations(search).map((body) => body.slug);
assert(names({ country: "England", sport: "triathlon" }).includes("british-triathlon"));
assert(names({ country: "England", sport: "duathlon" }).includes("triathlon-england"));
assert(names({ country: "Scotland", sport: "swimming" }).includes("scottish-swimming"));
for (const [sport, body] of [
  ["triathlon", "triathlon-ireland"],
  ["duathlon", "triathlon-ireland"],
  ["bmx", "cycling-ireland"],
  ["swimming", "swim-ireland"],
]) {
  assert(names({ country: "Northern Ireland", sport, type: "national" }).includes(body));
}
assert(
  !names({ country: "Northern Ireland", sport: "triathlon", type: "national" }).includes(
    "british-triathlon",
  ),
);
assert(
  !names({ country: "Northern Ireland", sport: "swimming", type: "national" }).includes(
    "aquatics-gb",
  ),
);
assert.deepEqual(names({ q: "Team GB", type: "olympic" }), ["british-olympic-association"]);
assert.deepEqual(names({ sport: "parkrun", type: "organiser" }), ["parkrun"]);
assert.deepEqual(names({ sport: "parkrun", type: "national" }), []);
assert(!names({ sport: "duathlon", type: "olympic" }).length);
assert(!names({ q: "not-a-real-organisation" }).length);
assert.equal(getSportsOrganisation("unknown-body"), undefined);
assert.deepEqual(
  parseDirectorySearch({ q: ["a"], country: "Atlantis", sport: "unknown", type: "constructor" }),
  { q: undefined, country: undefined, sport: undefined, type: undefined },
);
assert.equal(parseDirectorySearch({ q: "  cycling  " }).q, "cycling");
assert.equal(parseDirectorySearch({ q: "x".repeat(300) }).q.length, 120);
console.log(
  `Sports directory passed: ${SPORTS_ORGANISATIONS.length} distinct organisations, ${SPORT_PAGES.length} sports, valid official references and relationships, territory-aware filters.`,
);
