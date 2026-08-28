import assert from "node:assert/strict";

const {
  belgiumEliteYouthCompetitionConfigs: configs,
  belgiumEliteYouthCompetitionSeries: series,
  belgiumEliteYouthCompetitionEditions: editions,
} = await import("../src/data/belgium-elite-youth-competitions.ts");

const EXPECTED_CONFIGS = 100;
const EXPECTED_EDITIONS = 100;
const EXPECTED_AUDIENCE_COUNTS = {
  professional: 29,
  elite: 8,
  youth: 34,
  "mixed-elite-youth": 29,
};
const EXPECTED_CYCLING = 97;
const EXPECTED_CYCLOCROSS = 58;
const CHECKED_AT = "2026-08-28";
const CX_CALENDAR_SOURCE =
  "https://www.belgiancycling.be/app/uploads/2026/08/CYCLO-CROSSKALENDER-2026-2027-260804-1.pdf";

assert.equal(configs.length, EXPECTED_CONFIGS, "Belgium elite/youth config count changed");
assert.equal(series.length, EXPECTED_CONFIGS, "Belgium elite/youth series count changed");
assert.equal(editions.length, EXPECTED_EDITIONS, "Belgium elite/youth edition count changed");

function assertUnique(values, label) {
  assert.equal(new Set(values).size, values.length, `${label} contains duplicates`);
}

assertUnique(configs.map((config) => config.slug), "Belgium elite/youth slugs");
assertUnique(
  series.map((item) => item.name.toLowerCase().replace(/[^a-z0-9]+/g, "")),
  "Belgium elite/youth names",
);
assertUnique(
  editions.map((edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`),
  "Belgium elite/youth edition keys",
);

const configBySlug = new Map(configs.map((config) => [config.slug, config]));
const editionBySlug = new Map(editions.map((edition) => [edition.seriesSlug, edition]));
const audienceCounts = Object.fromEntries(
  Object.keys(EXPECTED_AUDIENCE_COUNTS).map((audience) => [
    audience,
    configs.filter((config) => config.audience === audience).length,
  ]),
);
assert.deepEqual(
  audienceCounts,
  EXPECTED_AUDIENCE_COUNTS,
  "Belgium elite/youth audience distribution changed",
);
assert.equal(
  configs.filter((config) => config.sport === "Cycling").length,
  EXPECTED_CYCLING,
  "Belgium elite/youth cycling count changed",
);
assert.equal(
  configs.filter((config) => /cyclo-cross/i.test(config.discipline)).length,
  EXPECTED_CYCLOCROSS,
  "Belgium elite/youth cyclo-cross count changed",
);
assert.equal(
  configs.filter((config) => config.sourceUrl === CX_CALENDAR_SOURCE).length,
  48,
  "Official Belgian Cycling 2026-27 cyclo-cross calendar coverage changed",
);

for (const config of configs) {
  assert(config.website.startsWith("https://"), `Non-HTTPS website: ${config.slug}`);
  assert(config.sourceUrl.startsWith("https://"), `Non-HTTPS source: ${config.slug}`);
  assert(config.classes.length > 0, `Missing eligible classes: ${config.slug}`);
  assert(config.occurrences.length > 0, `Missing occurrence: ${config.slug}`);
  assert(
    ["professional", "elite", "youth", "mixed-elite-youth"].includes(config.audience),
    `Invalid audience: ${config.slug}`,
  );
  assert(
    [
      "team-invitation",
      "federation-selection",
      "licensed-competition-registration",
      "licensed-youth-registration",
    ].includes(config.entryMode),
    `Invalid entry mode: ${config.slug}`,
  );

  for (const occurrence of config.occurrences) {
    assert(
      /^202[67]-\d{2}-\d{2}$/.test(occurrence.date),
      `Out-of-scope or invalid date: ${config.slug} ${occurrence.date}`,
    );
    assert(
      !Number.isNaN(Date.parse(`${occurrence.date}T00:00:00Z`)),
      `Invalid date: ${config.slug}`,
    );
    if (occurrence.endDate) {
      assert(
        occurrence.endDate >= occurrence.date,
        `End date precedes start date: ${config.slug}`,
      );
    }
    assert.equal(
      occurrence.entryUrl,
      undefined,
      `Restricted competition exposes a misleading public-entry URL: ${config.slug}`,
    );
  }
}

for (const item of series) {
  assert.equal(item.country, "Belgium", `Wrong country: ${item.slug}`);
  assert.equal(item.distances.length, 1, `Unexpected distance list: ${item.slug}`);
  assert.equal(item.distances[0], "Other", `Unexpected distance code: ${item.slug}`);
  assert(item.description.includes("Eligible classes:"), `Missing category disclosure: ${item.slug}`);
}

for (const edition of editions) {
  const config = configBySlug.get(edition.seriesSlug);
  assert(config, `Edition has no config: ${edition.seriesSlug}`);
  assert.equal(
    edition.entryUrl,
    undefined,
    `Restricted edition exposes a public entry URL: ${edition.seriesSlug}`,
  );
  assert(
    /not a public-entry race|federation licence|licensed competition categories|published youth\/development age classes/.test(
      edition.notes ?? "",
    ),
    `Edition restriction note is missing: ${edition.seriesSlug}`,
  );
}

const expectedWorldTour = new Map([
  ["be-uci-omloop-nieuwsblad-men", "2027-02-27"],
  ["be-uci-omloop-nieuwsblad-women", "2027-02-27"],
  ["be-uci-tour-of-bruges-men", "2027-03-24"],
  ["be-uci-tour-of-bruges-women", "2027-03-25"],
  ["be-uci-e3-saxo-classic-men", "2027-03-26"],
  ["be-uci-in-flanders-fields-men", "2027-03-28"],
  ["be-uci-in-flanders-fields-women", "2027-03-28"],
  ["be-uci-dwars-door-vlaanderen-men", "2027-03-31"],
  ["be-uci-dwars-door-vlaanderen-women", "2027-03-31"],
  ["be-uci-ronde-van-vlaanderen-men", "2027-04-04"],
  ["be-uci-ronde-van-vlaanderen-women", "2027-04-04"],
  ["be-uci-fleche-wallonne-men", "2027-04-21"],
  ["be-uci-fleche-wallonne-women", "2027-04-21"],
  ["be-uci-liege-bastogne-liege-men", "2027-04-25"],
  ["be-uci-liege-bastogne-liege-women", "2027-04-25"],
  ["be-uci-renewi-tour-men", "2027-08-18"],
]);
for (const [slug, date] of expectedWorldTour) {
  assert.equal(editionBySlug.get(slug)?.date, date, `WorldTour date regressed: ${slug}`);
  assert.equal(
    configBySlug.get(slug)?.entryMode,
    "team-invitation",
    `WorldTour entry mode changed: ${slug}`,
  );
}

const expectedCyclocrossWorldCup = new Map([
  ["be-uci-cx-world-cup-antwerp", "2026-12-19"],
  ["be-uci-cx-world-cup-koksijde", "2026-12-20"],
  ["be-uci-cx-world-cup-gavere", "2026-12-26"],
  ["be-uci-cx-world-cup-namur", "2026-12-27"],
  ["be-uci-cx-world-cup-zonhoven", "2027-01-03"],
  ["be-uci-cx-world-cup-hamme", "2027-01-23"],
]);
for (const [slug, date] of expectedCyclocrossWorldCup) {
  assert.equal(
    editionBySlug.get(slug)?.date,
    date,
    `Cyclo-cross World Cup date regressed: ${slug}`,
  );
}

const expectedInternationalCyclocross = new Map([
  ["be-cx-dendermonde-uci-c2", "2026-10-11"],
  ["be-cx-ardooie-uci-c2", "2026-10-15"],
  ["be-cx-meulebeke-uci-c2", "2026-10-17"],
  ["be-cx-superprestige-overijse", "2026-10-25"],
  ["be-cx-koppenbergcross-melden-oudenaarde", "2026-11-01"],
  ["be-cx-superprestige-middelkerke", "2026-11-05"],
  ["be-cx-superprestige-niel", "2026-11-11"],
  ["be-cx-superprestige-merksplas", "2026-11-14"],
  ["be-cx-hamme-zogge-bollekescross", "2026-11-15"],
  ["be-cx-lokeren-uci-c2", "2026-11-21"],
  ["be-cx-beringen-x2o", "2026-11-22"],
  ["be-cx-superprestige-ruddervoorde", "2026-12-06"],
  ["be-cx-mol-uci-c2", "2026-12-17"],
  ["be-cx-hofstade-x2o", "2026-12-22"],
  ["be-cx-azencross-loenhout", "2026-12-23"],
  ["be-cx-superprestige-heusden-zolder", "2026-12-25"],
  ["be-cx-superprestige-diegem", "2026-12-30"],
  ["be-cx-gp-sven-nys-baal", "2027-01-01"],
  ["be-cx-superprestige-gullegem", "2027-01-02"],
  ["be-cx-otegem-uci-c2", "2027-01-11"],
  ["be-cx-maldegem-uci-c2", "2027-02-03"],
  ["be-cx-krawatencross-lille", "2027-02-07"],
  ["be-cx-waaslandcross-sint-niklaas", "2027-02-13"],
  ["be-cx-brussels-x2o", "2027-02-14"],
  ["be-cx-internationale-sluitingsprijs-oostmalle", "2027-02-21"],
]);
for (const [slug, date] of expectedInternationalCyclocross) {
  assert.equal(
    editionBySlug.get(slug)?.date,
    date,
    `International cyclo-cross date regressed: ${slug}`,
  );
}

const expectedYouthCyclocross = new Map([
  ["be-youth-cx-baal-october", "2026-10-03"],
  ["be-youth-cx-diksmuide", "2026-10-04"],
  ["be-youth-cx-patattencross-nossegem", "2026-10-10"],
  ["be-youth-cx-kontich", "2026-10-11"],
  ["be-youth-cx-hoboken", "2026-10-17"],
  ["be-youth-cx-eversel", "2026-10-18"],
  ["be-youth-cx-herenthout", "2026-10-24"],
  ["be-youth-cx-beernem-october", "2026-10-25"],
  ["be-youth-cx-eeklo", "2026-11-01"],
  ["be-youth-cx-haacht", "2026-11-01"],
  ["be-youth-cx-denderhoutem", "2026-11-07"],
  ["be-youth-cx-jabbeke", "2026-11-08"],
  ["be-youth-cx-maldegem-november", "2026-11-11"],
  ["be-youth-cx-houthalen-helchteren", "2026-11-14"],
  ["be-youth-cx-ravestein-parkcross-hever", "2026-11-22"],
  ["be-youth-cx-meulebeke-november", "2026-11-29"],
  ["be-youth-cx-pelt", "2026-12-20"],
  ["be-youth-cx-genk", "2026-12-26"],
  ["be-youth-cx-huldenberg", "2026-12-27"],
  ["be-youth-cx-hamme-december", "2026-12-30"],
  ["be-youth-cx-bekkevoort", "2027-01-16"],
  ["be-youth-cx-meer-hoogstraten", "2027-01-23"],
  ["be-youth-cx-hoenderdaal-hoeilaart", "2027-02-06"],
  ["be-youth-cx-leopoldsburg", "2027-02-13"],
]);
for (const [slug, date] of expectedYouthCyclocross) {
  assert.equal(
    editionBySlug.get(slug)?.date,
    date,
    `Youth cyclo-cross date regressed: ${slug}`,
  );
  assert.equal(configBySlug.get(slug)?.audience, "youth", `Youth classification changed: ${slug}`);
}

assert.equal(
  editionBySlug.get("be-cx-world-championships-ostend")?.date,
  "2027-01-29",
  "Ostend World Championships missing",
);
assert.equal(
  configBySlug.get("be-cx-world-championships-ostend")?.occurrences[0]?.endDate,
  "2027-01-31",
  "Ostend World Championships end date missing",
);

for (const [slug, date] of [
  ["be-youth-road-time-trial-championships", "2026-05-01"],
  ["be-junior-road-championships", "2026-05-31"],
  ["be-u17-road-championships", "2026-08-09"],
  ["be-u15-road-championships", "2026-08-23"],
  ["be-youth-road-topcompetition-jemeppe-sur-meuse", "2026-09-27"],
  ["be-youth-road-topcompetition-affligem", "2026-10-11"],
  ["be-youth-triathlon-zwevegem", "2026-05-10"],
  ["be-youth-duathlon-ocquier", "2026-10-11"],
  ["be-uec-bmx-racing-championships-heusden-zolder-2027", "2027-07-09"],
  ["be-uec-track-junior-u23-championships-heusden-zolder-2027", "2027-07-13"],
]) {
  assert.equal(editionBySlug.get(slug)?.date, date, `Youth/development date regressed: ${slug}`);
}

console.log(
  `Belgium elite/professional and youth competition calendar verified: ${series.length} series / ${editions.length} editions; ${EXPECTED_CYCLOCROSS} cyclo-cross fixtures; checked ${CHECKED_AT}.`,
);
