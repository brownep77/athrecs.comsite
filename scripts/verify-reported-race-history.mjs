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

  const html = renderToStaticMarkup(
    createElement(UnverifiedRaceHistory, { slug: "neil-featherby" }),
  );
  assert.equal((html.match(/<article/g) ?? []).length, 28);
  assert.match(html, /Historical race entries \(28\)/);
  assert.match(html, /Athlete-reported/);
  assert.match(html, /Organiser archive/);
  assert.match(html, /excluded from verified finish totals/);
  assert(!html.includes("UltraSignup"));
  assert(!html.includes("1 January"));
  assert(!html.includes("David Goggins"));
  assert.equal(getReportedRaceHistory("unrelated-athlete"), null);
  assert.equal(
    renderToStaticMarkup(createElement(UnverifiedRaceHistory, { slug: "unrelated-athlete" })),
    "",
  );
  const goggins = getReportedRaceHistory("david-goggins");
  assert.equal(goggins.records.length, 7);
  assert.match(goggins.description, /UltraSignup/);
  console.log(
    "Reported history: 28 sourced Neil entries render; labels, isolation and existing Goggins records verified.",
  );
} finally {
  await server.close();
}
