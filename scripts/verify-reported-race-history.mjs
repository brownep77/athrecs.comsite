import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { getReportedRaceHistory } = await server.ssrLoadModule(
    "/src/lib/athrecs/reported-race-history.ts",
  );
  const { UnverifiedRaceHistory } = await server.ssrLoadModule(
    "/src/components/athletes/UnverifiedRaceHistory.tsx",
  );
  const neil = getReportedRaceHistory("neil-featherby");
  assert.equal(neil.records.length, 28);
  assert.equal(new Set(neil.records.map((row) => row.id)).size, 28);
  assert.equal(neil.records.filter((row) => row.id.startsWith("great-race-")).length, 14);
  assert(neil.records.every((row) => row.uncertainty && row.sources.length));
  assert(
    neil.records.every((row) =>
      row.sources.every((source) => new URL(source.url).protocol === "https:"),
    ),
  );
  assert.match(neil.records.find((row) => row.id === "grandmas-1990").reportedDate, /unresolved/);
  assert.equal(neil.records.find((row) => row.id === "berlin-1986").reportedTime, "2:17:35");
  assert.equal(neil.records.find((row) => row.id === "berlin-1986").reportedPlace, "22nd");
  assert.match(neil.records.find((row) => row.id === "norfolk-wins").reportedPlace, /Four wins/);

  const { CompactResults } = await server.ssrLoadModule(
    "/src/components/athletes/CompactResultsTable.tsx",
  );
  const { PersonalBestStrip } = await server.ssrLoadModule(
    "/src/components/athletes/ProfileAchievements.tsx",
  );
  const { selectProfilePersonalBests } = await server.ssrLoadModule(
    "/src/lib/athrecs/reported-personal-bests.ts",
  );
  assert.equal(neil.includeInResults, true);
  assert.equal(
    renderToStaticMarkup(createElement(UnverifiedRaceHistory, { slug: "neil-featherby" })),
    "",
  );
  const html = renderToStaticMarkup(
    createElement(CompactResults, {
      results: [],
      reportedHistory: neil,
      showEvidence: true,
    }),
  );
  assert.equal((html.match(/id="reported-result-/g) ?? []).length, 28);
  assert.equal((html.match(/>Not verified by chip time</g) ?? []).length, 28);
  assert.match(html, /Organiser archive/);
  assert.match(html, /Stage/);
  assert.match(html, /Grouped race record/);
  assert(!html.includes("excluded from verified finish totals"));
  assert(!html.includes("1 January"));
  assert(!html.includes("Invalid Date"));
  assert(!html.includes("UltraSignup"));
  assert(!html.includes("No results in this selection"));
  const pbHtml = renderToStaticMarkup(
    createElement(PersonalBestStrip, {
      results: [],
      reportedBests: neil.personalBests,
      showEvidence: true,
    }),
  );
  const publicRows = renderToStaticMarkup(
    createElement(CompactResults, { results: [], reportedHistory: neil }),
  );
  assert.equal((publicRows.match(/id="reported-result-/g) ?? []).length, 28);
  assert(!publicRows.includes("Not verified by chip time"));
  assert.equal((publicRows.match(/>Reported</g) ?? []).length, 28);
  assert(!publicRows.includes('data-label="Source"'));
  assert(!publicRows.includes("Organiser archive"));
  assert(html.includes('data-label="Source"'), "Staff retain the source field");
  const { SourcePerformanceHistory } = await server.ssrLoadModule(
    "/src/components/athletes/SourcePerformanceHistory.tsx",
  );
  const histories = [
    {
      provider: "powerof10",
      externalId: "fixture",
      sourceUrl: "https://example.test/profile",
      complete: true,
      yearsCaptured: [2025],
      yearsExpected: [2025],
      performances: [
        {
          date: "2025-06-01",
          year: 2025,
          discipline: "Long Jump",
          performance: "4.04",
          wind: "2.5",
          place: "3",
          meeting: "Fixture meeting",
          venue: "Fixture venue",
          ageGroup: "Senior",
          labels: ["Wind assisted"],
          sourceUrls: ["https://example.test/performance"],
        },
      ],
    },
  ];
  for (const showEvidence of [false, true]) {
    const markup = renderToStaticMarkup(
      createElement(SourcePerformanceHistory, { histories, showEvidence }),
    );
    assert(markup.includes("4.04"));
    assert(markup.includes("Fixture meeting"));
    assert.equal(markup.includes('data-label="Source"'), showEvidence);
    assert.equal(markup.includes("https://example.test/performance"), showEvidence);
    assert.equal(markup.includes("Next source results"), showEvidence);
  }
  const { countryFlag } = await server.ssrLoadModule("/src/lib/athrecs/country-flags.ts");
  for (const [values, code] of [
    [["GB", "UK", "British", "GBR"], "GB"],
    [["IE", "Ireland", "Irish", "IRL"], "IE"],
    [["England", "English", "GB-ENG"], "GB-ENG"],
    [["Scotland", "Scottish", "GB-SCT"], "GB-SCT"],
    [["Wales", "Welsh", "GB-WLS"], "GB-WLS"],
    [["Kenya", "Kenyan", "KE"], "KE"],
  ])
    for (const value of values) assert.equal(countryFlag(value).code, code);
  assert.equal(countryFlag("Unspecified nationality").code, "");
  assert.match(pbHtml, /29:28/);
  assert.match(pbHtml, /49:47/);
  assert.match(pbHtml, /1:07:37/);
  assert.match(pbHtml, /2:17:35/);
  assert.equal((pbHtml.match(/>PB\*</g) ?? []).length, 4);
  assert.equal((pbHtml.match(/>Not verified by chip time</g) ?? []).length, 4);
  assert.equal(
    neil.personalBests.filter((best) => best.recordId?.startsWith("great-race-")).length,
    0,
  );

  // Synthetic cases protect the shared PB calculation: one fastest result per
  // category, stable timing provenance, no opt-in for other athletes.
  const result = {
    resultId: 1,
    editionId: 1,
    eventName: "Example race",
    eventSlug: "example",
    sport: "Running",
    surface: "Road",
    country: "GB",
    eventDate: "2024-05-01",
    distanceCode: "Half",
    distanceKm: 21.1,
    status: "finished",
    finishTimeSeconds: 4000,
    chipTimeSeconds: 4000,
    gunTimeSeconds: 4020,
    overallPlace: null,
    category: null,
    sourceUrls: ["https://example.com/results"],
  };
  const reported = {
    id: "example-report",
    sport: "Running",
    surface: "Road",
    distanceCode: "Half",
    distanceKm: 21.0975,
    finishTimeSeconds: 3900,
    event: "Example reported race",
    date: "Year unknown",
    note: "Reported time",
    sources: [{ label: "Example source", url: "https://example.com/reported" }],
  };
  assert.equal(selectProfilePersonalBests([result]).length, 1);
  assert.equal(selectProfilePersonalBests([result])[0].kind, "recorded");
  const fasterReported = selectProfilePersonalBests([result], [reported]);
  assert.equal(fasterReported.length, 1);
  assert.equal(fasterReported[0].kind, "reported");
  assert.equal(
    selectProfilePersonalBests([result], [{ ...reported, finishTimeSeconds: 4100 }])[0].kind,
    "recorded",
  );
  assert.equal(
    selectProfilePersonalBests([result], [{ ...reported, finishTimeSeconds: 4000 }])[0].kind,
    "recorded",
  );
  assert.equal(selectProfilePersonalBests([], [{ ...reported, sources: [] }]).length, 0);
  assert.equal(selectProfilePersonalBests([], [{ ...reported, finishTimeSeconds: NaN }]).length, 0);
  assert.equal(result.chipTimeSeconds, 4000);
  assert.equal(getReportedRaceHistory("unrelated-athlete"), null);
  assert.equal(
    renderToStaticMarkup(createElement(UnverifiedRaceHistory, { slug: "unrelated-athlete" })),
    "",
  );
  const goggins = getReportedRaceHistory("david-goggins");
  assert.equal(goggins.records.length, 7);
  assert.match(goggins.description, /UltraSignup/);
  const murakami = getReportedRaceHistory("haruki-murakami");
  assert.equal(murakami.records.length, 9);
  assert.equal(new Set(murakami.records.map((row) => row.id)).size, 9);
  const murakamiHtml = renderToStaticMarkup(
    createElement(UnverifiedRaceHistory, { slug: "haruki-murakami", showEvidence: true }),
  );
  assert.equal((murakamiHtml.match(/<article/g) ?? []).length, 9);
  assert.match(murakamiHtml, /\* Unverified/);
  assert.match(murakamiHtml, /exact date unknown/);
  assert.match(murakamiHtml, /not counted as an additional finish/);
  assert.match(murakamiHtml, /Reported withdrawal during swim/);
  assert.match(murakamiHtml, /Triathlon · no standalone running result/);
  assert(!murakamiHtml.includes("UltraSignup"));
  assert(!murakamiHtml.includes("1 January"));
  console.log(
    "Reported history: Neil 28, Murakami 9 and Goggins 7 entries render with isolated policies; opted-in PBs retain timing caveats.",
  );
} finally {
  await server.close();
}
