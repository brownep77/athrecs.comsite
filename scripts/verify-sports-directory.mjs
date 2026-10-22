import assert from "node:assert/strict";
import { ORGANISATION_TYPES, SPORTS_ORGANISATIONS } from "../src/data/sports-organisations.ts";
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
  assert(Object.hasOwn(ORGANISATION_TYPES, body.type), `Unknown type: ${body.name}`);
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
  ["track-and-field", "athletics-ireland"],
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
assert.deepEqual(names({ country: "Japan", sport: "duathlon", type: "national" }), [
  "triathlon-japan",
]);
assert.deepEqual(names({ country: "Brazil", sport: "swimming", type: "national" }), [
  "brazilian-aquatics",
]);
assert.deepEqual(names({ q: "francaise natation" }), ["french-swimming"]);
assert.deepEqual(names({ q: "BDR" }), ["german-cycling"]);
assert.deepEqual(names({ q: "Swim Denmark" }), ["danish-swimming"]);
assert.deepEqual(names({ q: "Japan Triathlon Union" }), ["triathlon-japan"]);
assert.deepEqual(names({ q: "Welsh Triathlon", type: "home" }), ["welsh-triathlon"]);
assert.deepEqual(names({ q: "Welsh Cycling", type: "home" }), ["welsh-cycling"]);
assert.equal(getSportsOrganisation("welsh-triathlon").name, "Triathlon Cymru");
assert.equal(getSportsOrganisation("welsh-cycling").name, "Beicio Cymru");
assert.deepEqual(names({ q: "plywacki" }), ["polish-swimming"]);
assert.deepEqual(names({ q: "Norges Svommeforbund" }), ["norwegian-swimming"]);
assert.deepEqual(names({ q: "Kenya Swimming Federation" }), ["kenya-aquatics"]);
for (const country of [
  "Czechia",
  "Hungary",
  "Romania",
  "Greece",
  "Turkey",
  "Estonia",
  "Latvia",
  "Lithuania",
  "South Korea",
]) {
  for (const sport of ["track-and-field", "road-cycling", "swimming", "triathlon"]) {
    assert.equal(names({ country, type: "national", sport }).length, 1, `${country}: ${sport}`);
  }
}
assert.deepEqual(names({ q: "Czech Republic", sport: "triathlon" }), ["czech-triathlon"]);
assert.deepEqual(names({ q: "Turkiye", sport: "triathlon" }), ["turkish-triathlon"]);
assert.deepEqual(names({ q: "Republic of Korea", sport: "swimming" }), ["korean-swimming"]);
assert.deepEqual(names({ q: "Magyar Uszo Szovetseg" }), ["hungarian-swimming"]);
assert.deepEqual(names({ q: "Lithuanian Swimming Federation" }), ["ltu-aquatics"]);
assert.deepEqual(names({ country: "Mexico", sport: "swimming", type: "national" }), [
  "aquatics-mexico",
]);
assert.deepEqual(names({ country: "Mexico", sport: "bmx", type: "national" }), ["mexican-cycling"]);
assert.equal(getSportsOrganisation("mexican-cycling").website, "https://ucmex.org/");
assert.equal(getSportsOrganisation("aquatics-mexico").websiteKind, "member-directory");
assert.equal(getSportsOrganisation("czech-swimming").websiteKind, "member-directory");
for (const country of [
  "Chile",
  "Colombia",
  "Malaysia",
  "Thailand",
  "Philippines",
  "Indonesia",
  "Hong Kong",
]) {
  assert.equal(names({ country, type: "national" }).length, 4, `${country}: four national bodies`);
  for (const sport of ["track-and-field", "road-cycling", "swimming", "triathlon"]) {
    assert.equal(names({ country, type: "national", sport }).length, 1, `${country}: ${sport}`);
  }
}
// Argentina has a cycling umbrella and three separate discipline federations.
assert.equal(names({ country: "Argentina", type: "national" }).length, 7);
for (const [sport, specialist] of [
  ["road-cycling", "argentine-road-track-cycling"],
  ["track-cycling", "argentine-road-track-cycling"],
  ["mountain-biking", "argentine-mountain-biking"],
  ["bmx", "argentine-bmx"],
]) {
  assert.deepEqual(
    names({ country: "Argentina", sport, type: "national" }).sort(),
    ["ucra", specialist].sort(),
  );
}
assert.deepEqual(names({ q: "PRSI" }), ["akuatik-indonesia"]);
assert.deepEqual(names({ q: "Thailand Swimming Association" }), ["thailand-aquatics"]);
assert.deepEqual(names({ q: "PATAFA" }), ["philippine-athletics"]);
assert.equal(getSportsOrganisation("argentine-athletics").website, "https://cada-atletismo.com/");
assert.equal(
  getSportsOrganisation("philippine-athletics").website,
  "https://www.philippineathletics.org/",
);
assert.equal(getSportsOrganisation("colombian-athletics").websiteKind, "member-directory");
assert.deepEqual(names({ country: "Hong Kong", sport: "duathlon", type: "national" }), [
  "hong-kong-triathlon",
]);
assert.deepEqual(names({ country: "Thailand", sport: "duathlon", type: "national" }), []);
assert.deepEqual(names({ country: "Argentina", sport: "trail-running", type: "national" }), [
  "argentine-athletics",
]);
for (const country of [
  "Croatia",
  "Slovenia",
  "Slovakia",
  "Serbia",
  "Bulgaria",
  "Iceland",
  "Luxembourg",
  "Israel",
]) {
  assert.equal(names({ country, type: "national" }).length, 4, `${country}: four national bodies`);
  for (const sport of ["track-and-field", "road-cycling", "swimming", "triathlon"]) {
    assert.equal(names({ country, type: "national", sport }).length, 1, `${country}: ${sport}`);
  }
}
// Membership alone does not establish every cycling or multisport discipline.
for (const country of ["Croatia", "Serbia", "Iceland"]) {
  assert.equal(names({ country, type: "national", sport: "mountain-biking" }).length, 1);
  assert.deepEqual(names({ country, type: "national", sport: "track-cycling" }), []);
  assert.deepEqual(names({ country, type: "national", sport: "bmx" }), []);
}
for (const country of ["Slovenia", "Slovakia", "Bulgaria"]) {
  assert.equal(names({ country, type: "national", sport: "track-cycling" }).length, 1);
  assert.equal(names({ country, type: "national", sport: "bmx" }).length, 1);
}
for (const country of ["Luxembourg", "Israel"]) {
  assert.equal(names({ country, type: "national", sport: "track-cycling" }).length, 1);
  assert.deepEqual(names({ country, type: "national", sport: "bmx" }), []);
}
for (const country of ["Croatia", "Slovenia", "Slovakia", "Serbia", "Bulgaria", "Luxembourg"]) {
  assert.equal(names({ country, type: "national", sport: "duathlon" }).length, 1);
}
for (const country of ["Iceland", "Israel"]) {
  assert.deepEqual(names({ country, type: "national", sport: "duathlon" }), []);
}
assert.deepEqual(names({ q: "Slovenska plavecka federacia" }), ["slovak-swimming"]);
assert.deepEqual(names({ q: "Thrithrautarsamband Islands" }), ["icelandic-triathlon"]);
assert.deepEqual(names({ q: "Icelandic Cycling Association" }), ["icelandic-cycling"]);
assert.deepEqual(names({ q: "Croatia Swimming Association" }), ["croatian-swimming"]);
assert.deepEqual(names({ q: "Българска асоциация по триатлон" }), ["bulgarian-triathlon"]);
assert.equal(getSportsOrganisation("bulgarian-triathlon").website, "https://bat.triathlon.bg/");
assert.equal(getSportsOrganisation("hellenic-triathlon").website, "https://hellastriathlon.gr/en/");
assert.deepEqual(names({ country: "Romania", sport: "bmx", type: "national" }), []);
assert.deepEqual(names({ country: "Lithuania", sport: "duathlon", type: "national" }), []);
for (const country of ["Austria", "Finland", "Norway", "Poland", "India", "Singapore", "Bermuda"]) {
  assert.equal(names({ country, type: "national" }).length, 4, `${country}: four national bodies`);
  for (const sport of ["track-and-field", "road-cycling", "swimming", "triathlon"]) {
    assert.equal(names({ country, type: "national", sport }).length, 1, `${country}: ${sport}`);
  }
}
assert.equal(names({ country: "Kenya", type: "national" }).length, 3);
assert.deepEqual(names({ country: "India", sport: "duathlon" }), ["indian-triathlon"]);
assert.deepEqual(names({ country: "Bermuda", sport: "bmx" }), []);
assert.deepEqual(names({ country: "Bermuda", sport: "track-cycling" }), []);
assert(!names({ q: "Scottish Hill Runners", type: "national" }).length);
assert(names({ country: "Scotland", type: "specialist" }).includes("scottish-hill-runners"));
assert(names({ country: "Japan", sport: "parkrun" }).includes("parkrun"));
assert(names({ country: "Poland", sport: "parkrun" }).includes("parkrun"));
assert(!names({ country: "France", sport: "parkrun" }).includes("parkrun"));
assert.deepEqual(names({ q: "ITRA", type: "national" }), []);
assert(names({ q: "ITRA", type: "specialist" }).includes("itra"));
assert(names({ type: "continental", sport: "bmx" }).includes("uec"));
for (const country of ["Ireland", "Northern Ireland"]) {
  assert(names({ country, sport: "bmx", type: "regional" }).includes("cycling-ulster"));
  assert(names({ country, sport: "swimming", type: "regional" }).includes("swim-ulster"));
}
assert(!names({ country: "England", type: "regional" }).includes("cycling-ulster"));
assert.equal(parseDirectorySearch({ type: "specialist", country: "Brazil" }).type, "specialist");
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
