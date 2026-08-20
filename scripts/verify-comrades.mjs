import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { COMRADES_CHECKED_AT, comradesEditions, comradesSeries } =
  await import("../src/data/comrades.ts");

assert.equal(COMRADES_CHECKED_AT, "2026-08-20");
assert.equal(comradesSeries.length, 1);
assert.equal(comradesEditions.length, 6);
const mergedEditions = comradesEditions;
assert.equal(mergedEditions.length, 6);

const expected = new Map([
  ["2022-08-28", 89.885],
  ["2023-06-11", 87.701],
  ["2024-06-09", 85.91],
  ["2025-06-08", 89.98],
  ["2026-06-14", 85.777],
  ["2027-06-13", 0],
]);

for (const edition of mergedEditions) {
  assert.equal(edition.distance, "Ultra");
  assert.equal(
    edition.distanceKm,
    expected.get(edition.date),
    `Unexpected distance: ${edition.date}`,
  );
  assert.match(edition.source, /^https:\/\//);
  if (edition.date < "2027-01-01") {
    assert.equal(edition.status, "Finished");
    assert.match(edition.resultsOfficialUrl ?? "", /^https:\/\/[^/]*comrades\.com\//);
    assert.equal(edition.resultsPermission, "external-link-only");
    assert.equal(edition.resultsAccess, "official-link");
  } else {
    assert.equal(edition.status, "TBC");
    assert.equal(edition.resultsOfficialUrl, undefined);
  }
}

assert.equal(new Set(mergedEditions.map((edition) => edition.date)).size, mergedEditions.length);

const registry = readFileSync(
  new URL("../docs/source-registry/fixture-result-sources.csv", import.meta.url),
  "utf8",
);
const catalogueSource = readFileSync(new URL("../src/data/catalogue.ts", import.meta.url), "utf8");
assert.match(catalogueSource, /import \{ comradesEditions, comradesSeries \} from "\.\/comrades"/);
assert.match(catalogueSource, /\.\.\.\(comradesSeries as Series\[\]\)/);
assert.match(catalogueSource, /\.\.\.\(comradesEditions as Edition\[\]\)/);
const comradesRegistryRow = registry.split(/\r?\n/).find((row) => row.startsWith("comrades,"));
const finishTimeRegistryRow = registry
  .split(/\r?\n/)
  .find((row) => row.startsWith("finishtime_za,"));
assert(comradesRegistryRow, "Comrades source registry row is missing");
assert(finishTimeRegistryRow, "FinishTime source registry row is missing");
assert.equal(comradesRegistryRow.split(",")[4], "0", "Comrades bulk crawling must remain held");
assert.equal(finishTimeRegistryRow.split(",")[4], "0", "FinishTime bulk results must remain held");

process.stdout.write(
  JSON.stringify(
    {
      checked_at: COMRADES_CHECKED_AT,
      canonical_series: 1,
      verified_editions: mergedEditions.length,
      official_result_links: mergedEditions.filter((edition) => edition.resultsOfficialUrl).length,
      future_fixture: "2027-06-13",
      bulk_result_rows_imported: 0,
      rights_held_sources: ["comrades", "finishtime_za"],
    },
    null,
    2,
  ) + "\n",
);
