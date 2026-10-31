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
  const { ResultTiming, HistoricalTiming } = await server.ssrLoadModule(
    "/src/components/athletes/ResultTiming.tsx",
  );
  const { withoutProfileEvidence } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-evidence.ts",
  );
  const { ReportedRaceResultRows } = await server.ssrLoadModule(
    "/src/components/athletes/ReportedRaceResultRows.tsx",
  );
  const { buildPublicAthletePreview } = await server.ssrLoadModule(
    "/src/lib/athrecs/public-athlete-preview.ts",
  );
  const { reportedResultSortDate } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-result-presentation.ts",
  );
  const nonRaceRecords = ["challenge", "expedition", "relay", "support", "attempt", "effort"].map(
    (entryKind) => ({
      id: `synthetic-${entryKind}`,
      event: `Synthetic ${entryKind}`,
      distance: "5K",
      location: "",
      reportedDate: "2025",
      reportedTime: "17:06",
      reportedPlace: "1st",
      entryKind,
      sport: "Hiking",
      summary: "Team duration; individual completion is not established.",
      uncertainty: "Private research sentinel",
      sources: [{ label: "Private source", url: "https://example.org/private-research" }],
    }),
  );
  const unknownDateRecord = {
    ...nonRaceRecords[0],
    id: "synthetic-unknown-date",
    entryKind: "effort",
    event: "Synthetic parkrun watch reading",
    reportedTime: "17:06 (watch time)",
    reportedDate: "",
    summary: "Film released in 2026; event date is not established.",
  };
  assert.equal(reportedResultSortDate(unknownDateRecord), "", "A film date is not a result date");
  const publicAccounts = withoutProfileEvidence([...nonRaceRecords, unknownDateRecord]);
  const accountsMarkup = renderToStaticMarkup(
    createElement(
      "table",
      null,
      createElement(
        "tbody",
        null,
        createElement(ReportedRaceResultRows, {
          records: publicAccounts,
          bestIds: new Set(),
          hasActions: false,
        }),
      ),
    ),
  );
  const accounts = load(accountsMarkup);
  assert.equal(accounts("tbody tr").length, 7);
  assert.equal(accounts("[data-result-qualification]").length, 7);
  assert.equal(
    accounts("[data-profile-award]").length,
    0,
    "Non-race accounts never imply race medals",
  );
  assert.equal(accounts('[data-label="Sport"]').first().text(), "Hiking");
  assert.equal(accounts('[data-label="Category"]').eq(2).text(), "Team relay");
  assert.equal(accounts('[data-label="Category"]').eq(4).text(), "Unfinished attempt");
  assert.equal(accounts('[data-label="Race date"]').last().text(), "Date not recorded");
  assert.equal(
    accounts("#reported-result-synthetic-unknown-date [data-result-timing]").length,
    0,
    "A watch reading is not labelled as a published parkrun finish time",
  );
  assert(accounts.text().includes("Team duration; individual completion is not established."));
  assert(!accountsMarkup.includes("Private research sentinel"));
  assert(!accountsMarkup.includes("example.org"));
  assert(!JSON.stringify(publicAccounts).includes("private-research"));
  const accountInput = {
    slug: "synthetic-challenges",
    displayName: "Synthetic",
    athleteNumber: "1",
    searchIndexable: true,
    results: [],
    histories: [],
    allowResultPagination: true,
  };
  const baselineAccounts = buildPublicAthletePreview(accountInput);
  const accountPages = [1, 2].map((resultPage) =>
    buildPublicAthletePreview({
      ...accountInput,
      reportedRecords: publicAccounts,
      resultPage,
    }),
  );
  assert.equal(accountPages[0].totalResults, 7);
  assert.equal(accountPages[0].resultPages, 2);
  assert.deepEqual(
    accountPages.map((page) => page.reportedRecords.length),
    [5, 2],
  );
  assert.equal(
    new Set(accountPages.flatMap((page) => page.reportedRecords.map((row) => row.id))).size,
    7,
  );
  assert.equal(accountPages[1].reportedRecords.at(-1).id, "synthetic-unknown-date");
  assert.deepEqual(accountPages[0].personalBests, baselineAccounts.personalBests);
  assert.deepEqual(accountPages[0].achievements, baselineAccounts.achievements);
  const { historyPerformanceSchema } = await server.ssrLoadModule(
    "/src/lib/athrecs/source-performance-history.ts",
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
  const { HistoricalResultRow } = await server.ssrLoadModule(
    "/src/components/athletes/HistoricalResultRow.tsx",
  );
  const { historyResultSurface, isCompletedHistoryResult, profileAchievementResults } =
    await server.ssrLoadModule("/src/lib/athrecs/profile-history-results.ts");
  const { buildProfileAchievements } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-achievements.ts",
  );
  const { selectProfilePersonalBests } = await server.ssrLoadModule(
    "/src/lib/athrecs/reported-personal-bests.ts",
  );
  const surfaceBase = {
    ...historyResults[0].performance,
    discipline: "10K",
    meeting: "Synthetic 10K",
    performance: "46:55",
    timing: { basis: "unknown" },
    verificationStatus: "unverified",
  };
  for (const [sport, changes, expected] of [
    ["Running", {}, "Unknown"],
    ["Running", { discipline: "Marathon" }, "Unknown"],
    ["Running", { discipline: "Half Marathon" }, "Unknown"],
    ["Running", { providerName: "World Athletics" }, "Unknown"],
    ["Running", { providerName: "DUV Ultra Marathon Statistics" }, "Unknown"],
    ["Running", { providerName: "Road timing", venue: "Trail Road" }, "Unknown"],
    ["Parkrun", { discipline: "5K parkrun" }, "Unknown"],
    ["Running", { discipline: "10 Kilometres Road" }, "Road"],
    ["Running", { labels: [" Road "] }, "Road"],
    ["Running", { discipline: "10K Trail" }, "Trail"],
    ["Running", { labels: ["Trail running"] }, "Trail"],
    ["Running", { labels: ["Cross country"] }, "Cross Country"],
    ["Running", { discipline: "10K Multi-terrain" }, "Multi-terrain"],
    ["Running", { labels: ["Fell"] }, "Fell"],
    ["Running", { labels: ["Mountain running"] }, "Mountain"],
    ["Running", { labels: ["Road", "Trail"] }, "Unknown"],
    ["Running", { labels: ["Not a road race"] }, "Unknown"],
    ["Running", { discipline: "Off-road 10K" }, "Unknown"],
    ["Running", { discipline: "Trail 10K off-road" }, "Trail"],
    ["Athletics", { discipline: "1500m" }, "Track"],
    ["Athletics", { discipline: "Long Jump" }, "Field"],
    ["Athletics", { discipline: "Decathlon" }, "Combined events"],
    ["Swimming", { discipline: "100m swimming" }, ""],
    ["Triathlon", { discipline: "Triathlon" }, ""],
    ["Unclassified", { discipline: "Wave A" }, ""],
  ]) {
    const row = historyPerformanceSchema.parse({ ...surfaceBase, ...changes });
    const before = JSON.stringify(row);
    assert.equal(historyResultSurface(row, sport), expected);
    const safe = withoutProfileEvidence(row);
    assert.equal(
      historyResultSurface(safe, sport),
      expected,
      "Public projection retains surface evidence",
    );
    const markup = load(
      `<table><tbody>${renderToStaticMarkup(
        createElement(HistoricalResultRow, {
          result: { key: "synthetic-surface", sport, performance: safe },
          hasActions: false,
        }),
      )}</tbody></table>`,
    );
    const cell = markup('[data-label="Distance / discipline"]');
    const label = cell.find("span.block").text();
    assert.equal(label, expected === "Unknown" ? "Surface not recorded" : expected);
    assert.match(markup('[data-label="Performance"]').text(), /46:55.*Unverified/);
    assert.equal(JSON.stringify(row), before, "Presentation never rewrites stored observations");
  }
  const surfaceHistory = (row) => [
    {
      provider: "Synthetic provider",
      externalId: "surface-test",
      sourceUrl: "https://example.test/results",
      capturedAt: "2026-10-14",
      complete: false,
      yearsExpected: [],
      yearsCaptured: [2020],
      performances: [row],
    },
  ];
  assert.equal(profileAchievementResults([], surfaceHistory(surfaceBase))[0].surface, "Unknown");
  assert.equal(
    profileAchievementResults([], surfaceHistory({ ...surfaceBase, labels: ["Road"] }))[0].surface,
    "Road",
  );
  const publicQualifications = [
    "Non-competitive event",
    "Manually timed",
    "Distance not established",
    "Preliminary results",
    "Provisional results",
    "Seconds disputed; minute precision",
  ];
  const privateQualificationLabels = [
    "Unknown result qualification",
    "Source: Private qualification provider",
    "https://example.test/private-qualification-source",
    "Private qualification review notes",
    "Not manually timed",
    "Non-competitive event: private detail",
    "<b>Provisional results</b>",
    "Seconds disputed; minute precision: private detail",
  ];
  for (const [labels, expected] of [
    [
      [
        ...publicQualifications,
        ...publicQualifications,
        " manually TIMED ",
        ...privateQualificationLabels,
      ],
      publicQualifications,
    ],
    [privateQualificationLabels, []],
    [[], []],
  ]) {
    const row = historyPerformanceSchema.parse({
      ...surfaceBase,
      meeting: "Synthetic qualified event",
      discipline: "Running Challenge",
      place: "",
      labels,
      providerName: "Private qualification provider",
      sourceUrls: ["https://example.test/private-qualification-source"],
      notes: "Private qualification review notes",
    });
    const before = JSON.stringify(row);
    for (const performance of [row, withoutProfileEvidence(row)]) {
      const html = renderToStaticMarkup(
        createElement("table", null,
          createElement("tbody", null,
            createElement(HistoricalResultRow, {
              result: { key: "synthetic:qualifications", sport: "Running", performance },
              hasActions: false,
            }),
          ),
        ),
      );
      const rendered = load(html);
      const qualification = rendered("[data-result-qualifications]");
      assert.equal(qualification.length, expected.length ? 1 : 0);
      assert.equal(
        qualification.text(),
        expected.join(" · "),
        "Only safe qualifications appear, with canonical wording and no duplicates",
      );
      for (const hidden of [
        ...privateQualificationLabels,
        "Private qualification provider",
      ])
        assert(!html.includes(hidden), `Private or unknown label remains hidden: ${hidden}`);
      assert.equal(rendered(".result-evidence").length, 0, "Evidence stays staff-only");
      assert.equal(rendered('[data-label="Source"]').length, 0);
      assert.equal(rendered('[data-label="Performance"]').contents().first().text(), "46:55");
    }
    assert.equal(JSON.stringify(row), before, "Qualification display never rewrites results");
  }
  const fixedDurationBase = historyPerformanceSchema.parse({
    ...surfaceBase,
    discipline: "6 Hours Running",
    performance: "31.5 miles",
    place: "9",
    meeting: "Synthetic fixed-duration event",
  });
  for (const [discipline, performance] of [
    ["6 Hours Running", "31.5 miles"],
    ["12 Hours Running", "80.25 km"],
    ["24 Hours Running", "110 mi"],
    ["48 Hours Running", "250 km"],
  ]) {
    const row = { ...fixedDurationBase, discipline, performance };
    assert.equal(isCompletedHistoryResult(row), true, `${discipline}: accepted distance finish`);
    assert.equal(hasHistoryFinish(row), true, `${discipline}: accepted finish decoration`);
    assert.equal(hasFinishMark(performance), false, "A distance alone is not a timed finish mark");
    const projected = profileAchievementResults([], surfaceHistory(row));
    assert.equal(projected[0].sport, "Running");
    assert.equal(projected[0].distanceCode, discipline);
    assert.equal(projected[0].distanceKm, 0, "Covered distance does not become the race distance");
    assert.equal(projected[0].finishTimeSeconds, null);
    assert.equal(projected[0].chipTimeSeconds, null);
    assert.equal(projected[0].gunTimeSeconds, null);
    const achievements = buildProfileAchievements(projected);
    assert.equal(achievements.finishes.length, 1);
    assert.equal(achievements.marathons.length, 0);
    assert.equal(achievements.ultras.length, 0);
    assert.equal(selectProfilePersonalBests([], [], surfaceHistory(row)).length, 0);
    const rendered = load(`<table><tbody>${renderToStaticMarkup(
      createElement(HistoricalResultRow, {
        result: {
          key: "synthetic-duration",
          sport: "Running",
          performance: withoutProfileEvidence(row),
        },
        hasActions: false,
      }),
    )}</tbody></table>`);
    assert.equal(rendered('[data-profile-award="finisher"]').length, 1);
    assert.equal(rendered("[data-result-timing]").length, 0);
    assert(rendered('[data-label="Performance"]').text().includes(performance));
  }
  for (const changes of [
    { performance: "0 km" },
    { performance: "-1 miles" },
    { performance: "Infinity km" },
    { performance: "31.5 laps" },
    { performance: "31.5 miles+" },
    { performance: "31.5 miles DNF" },
    { performance: "DNF" },
    { performance: "DNS" },
    { performance: "DQ" },
    { discipline: "Marathon" },
    { discipline: "100 Miles" },
    { discipline: "Running" },
    { discipline: "6 laps Running" },
    { discipline: "16 Hours Running" },
    { discipline: "72 Hours Running" },
    { date: "2199-01-01" },
    { date: "2020-02-30" },
    { profileExcluded: true },
    { syntheticTest: true },
    {
      disqualification: {
        reason: "other",
        decisionDate: "2020-06-02",
        sourceUrl: "",
        note: "Synthetic DQ",
      },
    },
  ]) {
    const row = { ...fixedDurationBase, ...changes };
    assert.equal(isCompletedHistoryResult(row), false, JSON.stringify(changes));
    assert.equal(hasHistoryFinish(row), false, JSON.stringify(changes));
    assert.equal(selectProfilePersonalBests([], [], surfaceHistory(row)).length, 0);
  }
  assert.equal(hasHistoryFinish({ ...fixedDurationBase, labels: ["Intermediate split"] }), false);
  assert.equal(
    buildProfileAchievements(profileAchievementResults([], surfaceHistory({
      ...fixedDurationBase,
      notes: "Conflicting source results remain unresolved",
    }))).finishes.length,
    0,
    "Conflicting distance results remain excluded from completion achievements",
  );
  const triathlonPerformance = historyPerformanceSchema.parse({
    ...historyResults[4].performance,
    discipline: "Full-distance triathlon",
    meeting: "Synthetic triathlon",
    performance: "12:00:00",
    place: "",
    bib: "123",
    triathlonSplits: { swim: "01:00:00", bike: "06:00:00", run: "04:45:00" },
    sourceUrls: ["https://example.test/private-triathlon-evidence"],
    notes: "Private split research notes",
  });
  const triathlonRows = withoutProfileEvidence([
    {
      key: "synthetic-triathlon",
      sport: "Triathlon",
      performance: triathlonPerformance,
    },
  ]);
  assert.equal(historyPerformanceSchema.parse({ ...triathlonPerformance, bib: 123 }).bib, "123");
  assert.equal(
    historyPerformanceSchema.parse({ ...triathlonPerformance, bib: null }).bib,
    undefined,
  );
  const triathlonHtml = renderToStaticMarkup(
    createElement(CompactResults, {
      results: [],
      historyResults: triathlonRows,
    }),
  );
  const triathlonDom = load(triathlonHtml);
  assert.equal(triathlonDom("tbody tr").length, 1, "Race legs remain part of one triathlon result");
  for (const text of ["01:00:00", "06:00:00", "04:45:00", "Bib 123", "Run leg:"])
    assert(triathlonDom.text().includes(text), `Public result includes ${text}`);
  for (const hidden of ["private-triathlon-evidence", "Private split research", ">Track<"])
    assert(!triathlonHtml.includes(hidden), hidden);
  assert.equal(
    historyPerformanceSchema.safeParse({
      ...triathlonPerformance,
      triathlonSplits: { ...triathlonPerformance.triathlonSplits, swim: "01:99:00" },
    }).success,
    false,
    "Invalid split times are not accepted",
  );
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
  const timingText = (changes) =>
    load(
      renderToStaticMarkup(
        createElement(ResultTiming, {
          result: { ...recorded, ...changes },
        }),
      ),
    ).text();
  assert.equal(timingText({}), "Timing unknown");
  assert.equal(timingText({ chipTimeSeconds: 72, gunTimeSeconds: 75 }), "Chip time · Gun 1:15");
  assert.equal(timingText({ chipTimeSeconds: 70, gunTimeSeconds: 72 }), "Gun time · Chip 1:10");
  assert.equal(timingText({ chipTimeSeconds: 72, gunTimeSeconds: 72 }), "Chip / gun time");
  assert.equal(
    timingText({ chipTimeSeconds: 70, gunTimeSeconds: 75 }),
    "Timing unknown · Chip 1:10 · Gun 1:15",
  );
  assert.equal(timingText({ finishTimeSeconds: null }), "");
  const historicalTimingText = (performance, discipline, timing) =>
    load(
      renderToStaticMarkup(createElement(HistoricalTiming, { performance, discipline, timing })),
    ).text();
  assert.equal(historicalTimingText("2:30:00(2:32:00)", "Half Marathon"), "Timing unknown");
  assert.equal(historicalTimingText("61:18a", "Half Marathon"), "Timing unknown");
  assert.equal(historicalTimingText("3:57.18", "1500 Metres"), "Timing unknown");
  assert.equal(
    historicalTimingText("3h 44m", "Marathon"),
    "Time recorded to minutes · Timing unknown",
  );
  for (const performance of ["0h00m", "3h60m", "3h 44m DNF"])
    assert.equal(historicalTimingText(performance, "Marathon"), "");
  const minutePrecisionRow = historyPerformanceSchema.parse({
    ...historyResults[4].performance,
    discipline: "Marathon",
    performance: "3h 44m",
    place: "",
    timing: { basis: "unknown" },
  });
  const minuteMarkup = load(
    renderToStaticMarkup(
      createElement("table", null,
        createElement("tbody", null,
          createElement(HistoricalResultRow, {
            result: { key: "synthetic:minute-precision", sport: "Running", performance: minutePrecisionRow },
            hasActions: false,
          }),
        ),
      ),
    ),
  );
  assert.equal(minuteMarkup('[data-label="Performance"]').contents().first().text(), "3h 44m");
  assert.equal(minuteMarkup('[data-result-timing]').text(), "Time recorded to minutes · Timing unknown");
  assert.equal(minuteMarkup('[data-profile-award="finisher"]').length, 1);
  assert(!minuteMarkup('[data-label="Performance"]').text().includes("3:44:00"));
  for (const [performance, discipline] of [
    ["DNF", "5000 Metres"],
    ["7.90", "LJ"],
    ["18.2", "Shot Put"],
    ["20.10", "Weight Throw"],
    ["8100", "Decathlon"],
    ["210.5", "24 Hours"],
  ])
    assert.equal(historicalTimingText(performance, discipline), "");
  const sourceWithTiming = historyPerformanceSchema.parse({
    ...historyResults[4].performance,
    performance: "1:02.34",
    timing: { basis: "chip", chip: "1:02.34", gun: "1:05.67" },
    notes: "Private source-row audit",
    sourceUrls: ["https://example.org/private-evidence"],
  });
  const publicTimingRow = withoutProfileEvidence(sourceWithTiming);
  assert.deepEqual(publicTimingRow.timing, sourceWithTiming.timing);
  assert.equal(publicTimingRow.notes, "");
  assert.deepEqual(publicTimingRow.sourceUrls, []);
  assert.equal(
    historicalTimingText(
      publicTimingRow.performance,
      publicTimingRow.discipline,
      publicTimingRow.timing,
    ),
    "Chip time · Gun 1:05.67",
  );
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
  assert.equal(
    $("[data-result-timing]").length,
    11,
    "Public timelines show timing for timed finishes only",
  );
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
  $("tbody [data-profile-award=finisher]").each((_, medal) => {
    assert.equal(
      $(medal).find("span:not(.sr-only)").text(),
      "Finisher",
      "Every completion medal has a visible label, including historical and reported rows",
    );
  });
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
  const { getEditorialAthleteCareer } = await server.ssrLoadModule(
    "/src/data/freddy-richardson.ts",
  );
  const career = load(
    renderToStaticMarkup(
      createElement(AthleteCareerHighlights, {
        career: getEditorialAthleteCareer("paul-william-evans"),
      }),
    ),
  );
  assert.equal(career('[data-profile-award="trophy"]').length, 1);
  assert.equal(career('[data-profile-award="silver"]').length, 1);
  assert.equal(career('[data-profile-award="bronze"]').length, 1);
  assert.equal(
    career('[data-profile-award="participation"]').length,
    1,
    "Olympic participation must not be presented as an Olympic medal",
  );
  assert.equal(career('[data-award-tier="olympic"][data-profile-award="participation"]').length, 1);
  const { profileEditorial } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-editorial.server.ts",
  );
  const { ResultEvidence } = await server.ssrLoadModule(
    "/src/components/athletes/ResultEvidence.tsx",
  );
  const { buildProfileTimeline } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-timeline.ts",
  );
  const { buildCompetitionHonours } = await server.ssrLoadModule(
    "/src/lib/athrecs/competition-honours.ts",
  );
  const { eligiblePerformance } = await server.ssrLoadModule("/src/lib/athrecs/profile-records.ts");
  const evidenceUrl = "https://evidence.example/private-result";
  const fixtureResult = {
    resultId: 999,
    editionId: 999,
    eventName: "Olympic Games",
    eventSlug: "olympic-games",
    sport: "Athletics",
    surface: "Track",
    country: "France",
    eventDate: "2024-08-01",
    distanceCode: "10000 Metres",
    distanceKm: 10,
    status: "finished",
    finishTimeSeconds: 1680,
    chipTimeSeconds: null,
    gunTimeSeconds: null,
    overallPlace: null,
    category: null,
    resultSource: "World Athletics",
    sourceUrls: [evidenceUrl],
    details: { verificationStatus: "source_verified", note: "Private review sentinel" },
  };
  const fixturePerformance = {
    year: 2024,
    date: "2024-08-01",
    sourceDate: "original date sentinel",
    ageGroup: "",
    discipline: "10000 Metres",
    performance: "28:00.00",
    wind: "",
    place: "1",
    venue: "Paris, FRA",
    meeting: "Olympic final alternative source title",
    sourceUrls: [evidenceUrl],
    labels: ["Round: F"],
    providerName: "World Athletics",
    verificationStatus: "source_verified",
    notes: "Private disagreement sentinel",
  };
  const fixtureHistory = {
    provider: "World Athletics",
    externalId: "private-athlete-id",
    sourceUrl: evidenceUrl,
    capturedAt: "2026-01-01",
    complete: false,
    yearsExpected: [],
    yearsCaptured: [],
    performances: [fixturePerformance],
  };
  const fixture = {
    results: [fixtureResult],
    histories: [fixtureHistory],
    editorial: profileEditorial("paul-william-evans"),
    nationalitySource: { value: "GBR", provider: "Example", sourceUrl: evidenceUrl },
  };
  const original = JSON.stringify(fixture);
  const safe = withoutProfileEvidence(fixture);
  assert.equal(JSON.stringify(fixture), original, "Redaction never mutates stored/staff evidence");
  for (const secret of [
    evidenceUrl,
    "Private review sentinel",
    "Private disagreement sentinel",
    "private-athlete-id",
    "worldathletics.org",
    "World Athletics",
    "paulevanscoaching.com",
  ])
    assert(!JSON.stringify(safe).includes(secret), `Do not serialize ${secret}`);
  const bridge = {
    results: [],
    histories: [
      {
        ...fixtureHistory,
        performances: [
          fixturePerformance,
          { ...fixturePerformance, sourceUrls: ["https://evidence.example/bridge"] },
          {
            ...fixturePerformance,
            meeting: "Another source title",
            sourceUrls: ["https://evidence.example/bridge"],
          },
        ],
      },
    ],
  };
  const privateBridge = withoutProfileEvidence(bridge);
  assert.equal(
    buildProfileTimeline(privateBridge.results, privateBridge.histories).count,
    buildProfileTimeline(bridge.results, bridge.histories).count,
    "Transitive duplicate matches retain all opaque source keys",
  );
  const { profilePersonalBestSummary } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-personal-best-summary.ts",
  );
  const { buildProfileAchievementSummary } = await server.ssrLoadModule(
    "/src/lib/athrecs/profile-achievement-summary.ts",
  );
  const privateSourceKeys = ["private-synthetic-locator:A", "private-synthetic-locator:B"];
  const withSourceIdentity = (row, urls, keys, keysFirst) => {
    const identity = keysFirst
      ? { sourceKeys: keys, sourceUrls: urls }
      : { sourceUrls: urls, sourceKeys: keys };
    return Object.fromEntries([
      ...Object.entries(row).filter(([key]) => !["sourceUrls", "sourceKeys"].includes(key)),
      ...Object.entries(identity),
    ]);
  };
  const publicSummary = (input) => ({
    count: buildProfileTimeline(input.results, input.histories).count,
    personalBests: profilePersonalBestSummary(input.results, input.histories),
    achievements: buildProfileAchievementSummary(
      input.results,
      input.histories,
      new Date("2025-01-01T00:00:00Z"),
      "M",
    ),
  });
  for (const keysFirst of [false, true]) {
    for (const urls of [[evidenceUrl], []]) {
      for (const [resultKeys, historyKeys, expectedCount] of [
        [[privateSourceKeys[0]], [privateSourceKeys[0]], 1],
        [[privateSourceKeys[0]], [privateSourceKeys[1]], 2],
        [[], [], 2],
      ]) {
        const input = {
          results: [withSourceIdentity(fixtureResult, urls, resultKeys, keysFirst)],
          histories: [
            {
              ...fixtureHistory,
              performances: [withSourceIdentity(fixturePerformance, urls, historyKeys, keysFirst)],
            },
          ],
        };
        const original = JSON.stringify(input);
        const expected = publicSummary(input);
        assert.equal(expected.count, expectedCount, "Explicit source keys control matching");
        const projected = withoutProfileEvidence(input);
        for (const output of [projected, withoutProfileEvidence(projected)]) {
          const serialized = JSON.stringify(output);
          for (const secret of [evidenceUrl, ...privateSourceKeys])
            assert(!serialized.includes(secret), "Raw source locators must never serialize");
          for (const row of [output.results[0], output.histories[0].performances[0]]) {
            assert.deepEqual(row.sourceUrls, []);
            assert(row.sourceKeys.every((key) => /^record-\d+$/.test(key)));
          }
          assert.deepEqual(
            publicSummary(output),
            expected,
            "Source-key privacy preserves matching, PBs and achievements on repeated projection",
          );
        }
        assert.equal(JSON.stringify(input), original, "Stored source keys remain unchanged");
      }
    }
  }
  const keysWithoutUrls = withoutProfileEvidence({ sourceKeys: privateSourceKeys });
  assert(keysWithoutUrls.sourceKeys.every((key) => /^record-\d+$/.test(key)));
  assert(!JSON.stringify(keysWithoutUrls).includes("private-synthetic-locator"));
  const decisions = {
    results: [],
    histories: [
      {
        ...fixtureHistory,
        performances: [
          {
            ...fixturePerformance,
            disqualification: {
              reason: "other",
              decisionDate: "2024-08-02",
              sourceUrl: evidenceUrl,
              note: "Original decision",
            },
          },
          {
            ...fixturePerformance,
            disqualification: {
              reason: "other",
              decisionDate: "2024-08-02",
              sourceUrl: evidenceUrl,
              note: "Conflicting decision",
            },
          },
        ],
      },
    ],
  };
  const privateDecisions = withoutProfileEvidence(decisions);
  assert.equal(
    buildProfileTimeline(privateDecisions.results, privateDecisions.histories).count,
    buildProfileTimeline(decisions.results, decisions.histories).count,
    "Different decisions cannot collapse after redaction",
  );
  assert.equal(safe.nationalitySource, null);
  assert.equal(safe.results[0].details.verificationStatus, "source_verified");
  const originalTimeline = buildProfileTimeline(fixture.results, fixture.histories);
  const safeTimeline = buildProfileTimeline(safe.results, safe.histories);
  assert.equal(
    safeTimeline.count,
    originalTimeline.count,
    "Source-key matching preserves deduplication",
  );
  assert.equal(
    safeTimeline.results[0].displayOverallPlace,
    originalTimeline.results[0].displayOverallPlace,
  );
  const honourSummary = (input) =>
    buildCompetitionHonours(input.results, input.histories, "M").map(
      ({ id, title, kind, tier, evidence }) => ({ id, title, kind, tier, count: evidence.length }),
    );
  assert.deepEqual(
    honourSummary(safe),
    honourSummary(fixture),
    "Evidence privacy does not change championship awards",
  );
  const excluded = { ...fixtureResult, details: { note: "Not legal; private source details" } };
  assert.equal(
    eligiblePerformance(withoutProfileEvidence(excluded)),
    eligiblePerformance(excluded),
  );
  for (const slug of ["neil-featherby", "paul-william-evans", "mo-farah", "david-goggins"]) {
    const editorial = profileEditorial(slug);
    const projected = withoutProfileEvidence(editorial);
    assert.equal(
      selectProfilePersonalBests([], projected.reportedHistory?.personalBests ?? []).length,
      selectProfilePersonalBests([], editorial.reportedHistory?.personalBests ?? []).length,
      `${slug} PB eligibility retained`,
    );
  }
  assert.equal(
    renderToStaticMarkup(
      createElement(ResultEvidence, { urls: [evidenceUrl], notes: "Private review sentinel" }),
    ),
    "",
  );
  const staffEvidence = renderToStaticMarkup(
    createElement(ResultEvidence, {
      urls: [evidenceUrl],
      notes: "Private review sentinel",
      showEvidence: true,
    }),
  );
  assert(staffEvidence.includes(evidenceUrl) && staffEvidence.includes("Private review sentinel"));
  assert.equal(career("summary").filter((_, node) => career(node).text() === "Sources").length, 0);
  const staffCareer = renderToStaticMarkup(
    createElement(AthleteCareerHighlights, {
      career: getEditorialAthleteCareer("paul-william-evans"),
      showEvidence: true,
    }),
  );
  assert(staffCareer.includes("worldathletics.org"));
  const { ProfileAward, ClassificationAwards } = await server.ssrLoadModule(
    "/src/components/athletes/ProfileAward.tsx",
  );
  const olympic = renderToStaticMarkup(
    createElement(ProfileAward, { kind: "gold", tier: "olympic" }),
  );
  const world = renderToStaticMarkup(createElement(ProfileAward, { kind: "gold", tier: "world" }));
  assert(olympic.includes('viewBox="0 0 36 40"') && world.includes('viewBox="0 0 36 40"'));
  assert.notEqual(olympic, world, "Olympic and World Championship medals have distinct artwork");
  assert.match(
    renderToStaticMarkup(createElement(ProfileAward, { kind: "trophy", tier: "major" })),
    /lucide-crown/,
  );
  assert.match(
    renderToStaticMarkup(createElement(ProfileAward, { kind: "trophy", tier: "national" })),
    /lucide-shield/,
  );
  const { historyAwards } = await server.ssrLoadModule("/src/lib/athrecs/competition-awards.ts");
  const classification = renderToStaticMarkup(
    createElement(ClassificationAwards, {
      awards: historyAwards({
        ...historyResults[4].performance,
        ageGroup: "M50",
        places: { overall: 8, gender: 5, category: 1 },
      }),
    }),
  );
  assert.match(classification, /data-award-scope="category"/);
  assert.match(classification, /M50/);
  console.log(
    "Unified results verified: distinct podium and finisher medals, career trophies and participation badges, explicit verification, non-finish exclusions and venue flags.",
  );
} finally {
  await server.close();
}
