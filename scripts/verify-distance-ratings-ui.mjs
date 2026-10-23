import assert from "node:assert/strict";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { load } from "cheerio";
import { createServer } from "vite";
import react from "@vitejs/plugin-react";

const server = await createServer({
  configFile: false,
  plugins: [react()],
  resolve: { alias: { "@": path.resolve("src") } },
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});
try {
  const { DistanceRatings } = await server.ssrLoadModule(
    "/src/components/athletes/DistanceRatings.tsx",
  );
  const race = (id, overrides = {}) => ({
    resultId: id,
    editionId: id,
    eventName: `Synthetic race ${id}`,
    eventSlug: `synthetic-${id}`,
    sport: "Running",
    surface: "Road",
    country: "United Kingdom",
    eventDate: "2025-06-01",
    distanceCode: "5K",
    distanceKm: 5,
    status: "finished",
    finishTimeSeconds: 1200,
    chipTimeSeconds: 1200,
    gunTimeSeconds: null,
    overallPlace: null,
    category: null,
    resultGender: "M",
    sourceUrls: ["https://example.test/PRIVATE-RESULT-EVIDENCE"],
    resultSource: "PRIVATE-PROVIDER",
    details: { note: "PRIVATE-REVIEW-NOTE" },
    ...overrides,
  });
  assert.equal(renderToStaticMarkup(createElement(DistanceRatings, { results: [] })), "");
  const html = renderToStaticMarkup(
    createElement(DistanceRatings, {
      results: [
        race(1),
        race(1, { resultId: 2 }),
        race(3, { distanceCode: "10K", distanceKm: 10, finishTimeSeconds: 2400 }),
      ],
    }),
  );
  const $ = load(html);
  assert.match($("section").attr("aria-label"), /Distance ratings/);
  assert.match($("article").first().text(), /35 points/);
  assert.match($("article").first().text(), /2 completed events/);
  assert.match($("article").first().text(), /15 km raced/);
  assert.equal($("select option[value='2025']").length, 1);
  assert.equal(
    $("caption")
      .filter((_, element) => $(element).text() === "Performance rating by distance")
      .parent()
      .find("tbody tr").length,
    2,
  );
  assert.match(html, /Awaiting verification/);
  for (const privateValue of ["PRIVATE-RESULT-EVIDENCE", "PRIVATE-PROVIDER", "PRIVATE-REVIEW-NOTE"])
    assert(!html.includes(privateValue), `Never render athlete evidence: ${privateValue}`);
  const unknown = renderToStaticMarkup(
    createElement(DistanceRatings, {
      results: [race(9, { resultGender: null })],
    }),
  );
  assert.match(unknown, /15 points/);
  assert.match(unknown, /supplied men/);
  assert(!unknown.includes("Performance rating by distance"), "No inferred racing category");
  const trail = renderToStaticMarkup(
    createElement(DistanceRatings, {
      results: [
        race(10, {
          surface: "Trail",
          distanceCode: "50K",
          distanceKm: 50,
          finishTimeSeconds: 18000,
        }),
      ],
    }),
  );
  assert.match(trail, /75.61 points/);
  assert.match(trail, /15.61 ultra bonus/);
  assert.match(trail, /Ultra participation bonuses/);
  assert.match(trail, /Trail/);
  assert.match(trail, /Distance-only estimate/);
  assert(!trail.includes("PRIVATE-"));
  console.log(
    "Distance ratings UI: totals, distance groups, historical season, pending verification and evidence privacy passed.",
  );
} finally {
  await server.close();
}
