import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  HISTORICAL_RESULT_SOURCES,
  historicalResultSource,
} from "../src/lib/athrecs/historical-result-sources.ts";

const berlin = historicalResultSource("mika_timing_berlin_results");
assert.ok(berlin, "Berlin result source must be registered");
assert.equal(berlin.officialArchiveUrl, "https://berlin.r.mikatiming.com/2026/");
assert.equal(berlin.participantRowsRequireApproval, true);
const rights = JSON.parse(await readFile(
  new URL("../docs/source-registry/mika-berlin-rights-review.json", import.meta.url),
  "utf8",
));
assert.equal(rights.sourceKey, berlin.key);
assert.equal(rights.sourceUrl, berlin.officialArchiveUrl);
assert.equal(rights.participantReuseApproved, false);
assert.equal(rights.automatedIngestionEnabled, false);
assert.equal(rights.publicationApproved, false);
assert.equal(rights.permissionReference, null);
assert.deepEqual(berlin.coverageYears, [2026], "Do not invent historical coverage");
assert.equal(new URL(berlin.officialArchiveUrl).protocol, "https:");
assert.equal(new URL(berlin.officialArchiveUrl).username, "");
assert.equal(new URL(berlin.officialArchiveUrl).password, "");

const expectedExistingSources = [
  {
    key: "total_race_timing_results",
    displayName: "Total Race Timing historical results",
    officialArchiveUrl: "https://totalracetiming.co.uk/result",
    coverageYears: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
    participantRowsRequireApproval: true,
  },
  {
    key: "run_norwich_results",
    displayName: "Run Norwich official historical results",
    officialArchiveUrl: "https://www.runnorwich.co.uk/event-info/results/",
    coverageYears: [2015, 2016, 2017, 2018, 2019, 2022, 2023, 2024, 2025],
    participantRowsRequireApproval: true,
  },
];
for (const expected of expectedExistingSources) {
  assert.deepEqual(historicalResultSource(expected.key), expected);
}
assert.equal(historicalResultSource("mika_timing_unapproved_host"), undefined);
assert.equal(historicalResultSource("https://berlin.r.mikatiming.com/2026/"), undefined);
assert.equal(
  new Set(HISTORICAL_RESULT_SOURCES.map((source) => source.key)).size,
  HISTORICAL_RESULT_SOURCES.length,
  "Source keys must be unique",
);
assert.ok(HISTORICAL_RESULT_SOURCES.every((source) => source.participantRowsRequireApproval));

console.log("Berlin source registration assertions passed; this does not authorise ingestion or certify integration checks.");
