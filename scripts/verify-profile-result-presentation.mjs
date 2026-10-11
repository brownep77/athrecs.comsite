import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import {
  hasFinishMark,
  hasHistoryFinish,
  resultVerification,
} from "../src/lib/athrecs/profile-result-presentation.ts";

for (const mark of [
  "DNF",
  "DNS",
  "DQ",
  "DSQ",
  "NM",
  "NH",
  "withdrawn",
  "1:01.2+",
  "Time not found",
])
  assert.equal(hasFinishMark(mark), false, `No completion for ${mark}`);
for (const mark of ["3:57.18", "61:18a", "2:18:34(2:18:35)", "9.67w", "Finished"])
  assert.equal(hasFinishMark(mark), true, `Completion for ${mark}`);
assert.equal(resultVerification(undefined, "A provider with a link").verified, false);
assert.equal(resultVerification("unverified", "World Athletics").verified, false);
assert.equal(resultVerification("source_verified").verified, true);
assert.equal(resultVerification("source_verified", null, true).verified, false);

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { CompactResults } = await server.ssrLoadModule(
    "/src/components/athletes/CompactResultsTable.tsx",
  );
  const historyResults = Array.from({ length: 12 }, (_, index) => ({
    key: `synthetic:${index}`,
    sport: "Athletics",
    performance: {
      date: `${2024 - index}-06-01`,
      year: 2024 - index,
      sourceDate: "",
      ageGroup: "",
      discipline: "1500 Metres",
      performance: index < 3 ? ["DNF", "DNS", "DQ"][index] : "3:57.18",
      wind: "",
      place: index < 3 ? "" : "4",
      venue: "Synthetic venue, GBR",
      meeting: `Synthetic meeting ${index}`,
      sourceUrls: [],
      labels: [],
      providerName: index === 3 ? "World Athletics" : "Synthetic provider",
      verificationStatus: index === 4 ? "source_verified" : index === 3 ? undefined : "unverified",
    },
  }));
  assert.equal(hasHistoryFinish({ ...historyResults[4].performance, date: "2199-01-01" }), false);
  assert.equal(
    hasHistoryFinish({ ...historyResults[4].performance, labels: ["Intermediate split"] }),
    false,
  );
  const recorded = {
    resultId: 1,
    editionId: 1,
    eventName: "Synthetic recorded event",
    eventSlug: "synthetic-event",
    sport: "Swimming",
    surface: "Pool",
    country: "France",
    eventDate: "2020-08-01",
    distanceCode: "100m",
    distanceKm: 0.1,
    status: "finished",
    finishTimeSeconds: 72,
    chipTimeSeconds: null,
    gunTimeSeconds: null,
    overallPlace: 8,
    category: null,
    sourceUrls: [],
    details: { verificationStatus: "source_verified" },
  };
  const report = {
    id: "synthetic-reported",
    event: "Synthetic reported event",
    distance: "Marathon",
    location: "Synthetic venue, Portugal",
    reportedDate: "4 August 2019",
    reportedTime: "3:20:00",
    reportedPlace: "Unknown",
    uncertainty: "Exact placing unverified",
    sources: [],
  };
  const $ = load(
    renderToStaticMarkup(
      createElement(CompactResults, {
        results: [recorded],
        historyResults,
        reportedHistory: {
          title: "Reported",
          countLabel: "entries",
          description: "",
          records: [report],
        },
      }),
    ),
  );
  assert.equal($("table").length, 1, "All result types share one table");
  assert.equal($("tbody tr").length, 14, "Every row is rendered, including rows beyond eight");
  assert.equal($("tbody tr").closest("details").length, 0, "Results are not hidden in a dropdown");
  assert(!$.text().includes("Show all"));
  const rows = $("tbody tr")
    .toArray()
    .map((row) => $(row).text());
  for (const index of [0, 1, 2]) assert(!rows[index].includes("Completed event"));
  assert.equal(rows.filter((row) => row.includes("Completed event")).length, 11);
  assert.equal(rows.filter((row) => row.includes("Verified")).length, 3);
  assert.equal(rows.filter((row) => row.includes("Unverified")).length, 11);
  assert.equal($("[data-country-code=GB]").length, 12);
  assert.equal($("[data-country-code=FR]").length, 1);
  assert.equal($("[data-country-code=PT]").length, 1);
  assert(
    rows[4].includes("Synthetic recorded event"),
    "Recorded rows interleave with source history",
  );
  assert(
    rows[6].includes("Synthetic reported event"),
    "Reported rows interleave by their explicit date",
  );
  console.log(
    "Unified results verified: one visible chronological table, explicit verification, completion-only medals, non-finish exclusions and venue flags.",
  );
} finally {
  await server.close();
}
