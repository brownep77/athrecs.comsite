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
import { placingAward, careerAward } from "../src/lib/athrecs/profile-awards.ts";

for (const [place, award] of [
  [1, "gold"],
  ["1st", "gold"],
  ["1=", "gold"],
  ["1/1/1", "gold"],
  [2, "silver"],
  ["2nd", "silver"],
  ["2=", "silver"],
  ["2//1", "silver"],
  [3, "bronze"],
  ["3rd", "bronze"],
  ["3=", "bronze"],
  [4, "finisher"],
  ["22/1", "finisher"],
  ["/1", "finisher"],
  ["1B", "finisher"],
  ["1st M40", "finisher"],
  ["?m", "finisher"],
  ["1?", "finisher"],
  ["1st–3rd", "finisher"],
  ["", "finisher"],
  [null, "finisher"],
  [0, "finisher"],
])
  assert.equal(placingAward(place), award, `Award for explicit placing ${place}`);
assert.equal(careerAward({ title: "Race winner", outcomes: ["1st · 2:30:00"] }), "trophy");
assert.equal(careerAward({ title: "Race", outcomes: ["2nd · 2:31:00"] }), "silver");
assert.equal(careerAward({ title: "Race", outcomes: ["3rd · 2:32:00"] }), "bronze");
assert.equal(
  careerAward({ title: "Competed in 2 Olympic Games", outcomes: ["10,000m"] }),
  "participation",
);
assert.equal(careerAward({ title: "First marathon", outcomes: ["Completed"] }), "milestone");

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
for (const mark of ["3:57.18", "61:18a", "2:18:34(2:18:35)", "9.67w", "27:59.8h", "Finished"])
  assert.equal(hasFinishMark(mark), true, `Completion for ${mark}`);
assert.equal(
  hasFinishMark("NT", "17"),
  true,
  "A recorded placing establishes a finish even without a time",
);
assert.equal(hasFinishMark("NT"), false, "No time or placing does not establish a finish");
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
      place: index < 3 ? "1" : index === 3 ? "1=" : index === 4 ? "2" : index === 5 ? "3" : "4",
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
    overallPlace: 1,
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
    reportedPlace: "2nd",
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
  assert.equal(
    $("tbody [data-profile-award=gold]").length,
    2,
    "Recorded and tied historical wins receive gold",
  );
  assert.equal(
    $("tbody [data-profile-award=silver]").length,
    2,
    "Historical and reported second places receive silver",
  );
  assert.equal($("tbody [data-profile-award=bronze]").length, 1);
  assert.equal($("tbody [data-profile-award=finisher]").length, 6);
  assert.equal($("[aria-label='Result medal key']").length, 1);
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
  const { ResultMedal } = await server.ssrLoadModule("/src/components/athletes/ProfileAward.tsx");
  const mergedPlaceIcon = renderToStaticMarkup(
    createElement(ResultMedal, {
      result: { ...recorded, overallPlace: null, displayOverallPlace: "1" },
    }),
  );
  assert(
    mergedPlaceIcon.includes('data-profile-award="gold"'),
    "A matched official source placing decorates a merged result",
  );
  for (const status of ["DNF", "DNS", "DQ", "DSQ"]) {
    assert.equal(
      renderToStaticMarkup(createElement(ResultMedal, { result: { ...recorded, status } })),
      "",
    );
  }
  for (const changes of [
    { overallPlace: null, genderPlace: 1, categoryPlace: 1 },
    { conflicting: true },
  ]) {
    const icon = renderToStaticMarkup(
      createElement(ResultMedal, { result: { ...recorded, ...changes } }),
    );
    assert(
      icon.includes('data-profile-award="finisher"'),
      "Unknown or disputed overall place cannot receive a podium medal",
    );
  }
  const { HistoricalResultRow } = await server.ssrLoadModule(
    "/src/components/athletes/HistoricalResultRow.tsx",
  );
  const categoryOnly = {
    ...historyResults[3],
    performance: {
      ...historyResults[3].performance,
      places: { overall: null, gender: 1, category: 1 },
    },
  };
  assert(
    renderToStaticMarkup(
      createElement(HistoricalResultRow, { result: categoryOnly, hasActions: false }),
    ).includes('data-profile-award="finisher"'),
  );
  const { AthleteCareerHighlights } = await server.ssrLoadModule(
    "/src/components/athletes/AthleteCareerHighlights.tsx",
  );
  const career = load(
    renderToStaticMarkup(createElement(AthleteCareerHighlights, { slug: "paul-william-evans" })),
  );
  assert.equal(career('[data-profile-award="trophy"]').length, 1);
  assert.equal(career('[data-profile-award="silver"]').length, 1);
  assert.equal(career('[data-profile-award="bronze"]').length, 1);
  assert.equal(
    career('[data-profile-award="participation"]').length,
    1,
    "Olympic participation must not be presented as an Olympic medal",
  );
  console.log(
    "Unified results verified: distinct podium and finisher medals, career trophies and participation badges, explicit verification, non-finish exclusions and venue flags.",
  );
} finally {
  await server.close();
}
