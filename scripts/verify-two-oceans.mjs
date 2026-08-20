import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { TWO_OCEANS_CHECKED_AT, TWO_OCEANS_RESULTS, twoOceansEditions, twoOceansSeries } =
  await import("../src/data/two-oceans.ts");

assert.equal(TWO_OCEANS_CHECKED_AT, "2026-08-20");
assert.equal(twoOceansSeries.length, 1);
assert.equal(twoOceansSeries[0].slug, "two-oceans-marathon");
assert.deepEqual(twoOceansSeries[0].distances, ["Ultra", "Half"]);
assert.equal(twoOceansEditions.length, 12);
assert.equal(
  new Set(twoOceansEditions.map((edition) => `${edition.date}|${edition.distance}`)).size,
  twoOceansEditions.length,
);

const expected = new Map([
  ["2022-04-16|Half", 21.0975],
  ["2022-04-17|Ultra", 56],
  ["2023-04-15|Ultra", 56],
  ["2023-04-16|Half", 21.0975],
  ["2024-04-13|Ultra", 56],
  ["2024-04-14|Half", 21.0975],
  ["2025-04-05|Ultra", 56],
  ["2025-04-06|Half", 21.0975],
  ["2026-04-11|Ultra", 56],
  ["2026-04-12|Half", 21.0975],
  ["2027-04-03|Half", 21.0975],
  ["2027-04-04|Ultra", 56],
]);

for (const edition of twoOceansEditions) {
  assert.equal(
    edition.distanceKm,
    expected.get(`${edition.date}|${edition.distance}`),
    `Unexpected Two Oceans fixture: ${edition.date}|${edition.distance}`,
  );
  assert.match(edition.source, /^https:\/\//);
  if (edition.date < "2027-01-01") {
    assert.equal(edition.status, "Finished");
    assert.equal(edition.resultsOfficialUrl, TWO_OCEANS_RESULTS);
    assert.equal(edition.resultsPermission, "external-link-only");
    assert.equal(edition.resultsAccess, "official-link");
  } else {
    assert.equal(edition.status, "Open");
    assert.match(edition.entryUrl ?? "", /^https:\/\/enter\.twooceansmarathon\.org\.za\//);
    assert.equal(edition.resultsOfficialUrl, undefined);
  }
}

const registry = readFileSync(
  new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url),
  "utf8",
);
const catalogueSource = readFileSync(new URL("../src/data/catalogue.ts", import.meta.url), "utf8");
assert.match(
  catalogueSource,
  /import \{ twoOceansEditions, twoOceansSeries \} from "\.\/two-oceans"/,
);
assert.match(catalogueSource, /\.\.\.\(twoOceansSeries as Series\[\]\)/);
assert.match(catalogueSource, /\.\.\.\(twoOceansEditions as Edition\[\]\)/);

const registryRow = registry.split(/\r?\n/).find((row) => row.startsWith("two_oceans,"));
assert(registryRow, "Two Oceans source registry row is missing");
assert.equal(registryRow.split(",")[4], "0", "Two Oceans bulk crawling must remain held");

process.stdout.write(
  JSON.stringify(
    {
      checked_at: TWO_OCEANS_CHECKED_AT,
      canonical_series: 1,
      verified_editions: twoOceansEditions.length,
      official_result_links: twoOceansEditions.filter((edition) => edition.resultsOfficialUrl)
        .length,
      future_fixtures: ["2027-04-03", "2027-04-04"],
      bulk_result_rows_imported: 0,
      rights_held_sources: ["two_oceans", "finishtime_za"],
    },
    null,
    2,
  ) + "\n",
);
