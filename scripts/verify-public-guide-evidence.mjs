import assert from "node:assert/strict";
import { createServer } from "vite";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const cacheDir = await mkdtemp(path.join(tmpdir(), "athrecs-public-guides-"));
const vite = await createServer({
  configFile: false, cacheDir, appType: "custom",
  server: { middlewareMode: true, hmr: false }, optimizeDeps: { noDiscovery: true },
  resolve: { alias: { "@": path.resolve("src") } },
});
try {
  const load = (module) => vite.ssrLoadModule("/src/" + module);
  const { isResultDocument } = await load("lib/athrecs/result-document.ts");
  const { publicEditorialArticle } = await load("lib/athrecs/public-editorial-api.ts");
  const { editorialJsonLd } = await load("lib/athrecs/editorial.ts");
  const { EDITORIAL_ARTICLES } = await load("data/athrecs-editorial.ts");
  const bure = EDITORIAL_ARTICLES.find((article) => article.slug.includes("bure-valley"));
  const story = publicEditorialArticle(bure);
  const credit = story.links.find((link) => link.label.includes("Webscorer"));
  assert.equal(credit.url, "", "Credit the timer by name without exporting its URL");
  assert(story.links.some((link) => link.url.startsWith("/results/")));
  assert(story.links.some((link) => link.label.includes("race report") && link.url.startsWith("https://")));
  assert(!JSON.stringify(story).includes("webscorer.com"));
  assert(bure.links.some((link) => link.url.includes("webscorer.com")));
  const auckland = publicEditorialArticle(EDITORIAL_ARTICLES.find((article) => article.slug.includes("auckland-marathon-2026")));
  assert(!JSON.stringify([auckland, editorialJsonLd(auckland, "https://www.athrecs.com")]).includes("sportsplits.com"));
  assert.equal(isResultDocument("https://example.org/2026-Final-Results.pdf"), true);
  assert.equal(isResultDocument("https://example.org/account", "2026 league standings"), true);
  assert.equal(isResultDocument("https://worldathletics.org/competition/calendar-results/calendar"), false);
  assert.equal(isResultDocument("https://www.niftyentries.com/register"), false);
  assert.equal(isResultDocument("https://example.org/2026-course-map.pdf"), false);
  assert.equal(isResultDocument("/results/native", "Results"), false);

  const { publicOrganisation } = await load("lib/athrecs/public-directory-api.ts");
  const { SPORTS_ORGANISATIONS } = await load("data/sports-organisations.ts");
  const scottish = SPORTS_ORGANISATIONS.find((org) => org.slug === "scottish-swimming");
  assert(scottish.sources.some((url) => url.endsWith("2026-Scottish-Summer-Meet.pdf")));
  assert(publicOrganisation(scottish).sources.includes("https://www.scottishswimming.com/"));
  assert(!JSON.stringify(publicOrganisation(scottish)).includes(".pdf"));

  const { publicRoadRace } = await load("lib/running/public-road-guides.ts");
  const { ROAD_MARATHONS } = await load("data/road-marathons/index.ts");
  const { ROAD_HALF_MARATHONS } = await load("data/road-half-marathons/index.ts");
  for (const race of [...ROAD_MARATHONS, ...ROAD_HALF_MARATHONS]) {
    const publicRace = publicRoadRace(race);
    assert.equal(publicRace.resultsUrl, "");
    assert(publicRace.pastEditions.every((edition) => !edition.resultsUrl && edition.categories.every((category) => !category.sourceUrl)));
    assert(publicRace.sources.every((link) => !isResultDocument(link.url, link.label)));
    assert.deepEqual(publicRace.pastEditions.map((edition) => edition.summary), race.pastEditions.map((edition) => edition.summary));
  }

  const { publicChannelProfile } = await load("lib/athrecs/english-channel.ts");
  const evidence = "https://example.test/athlete/1";
  const resultsCard = { title: "Solo", lines: [{ text: "10h", url: evidence }] };
  const media = { title: "Interview", lines: [{ text: "Watch", url: "https://example.test/watch" }] };
  const swimmer = publicChannelProfile({
    crossings: [resultsCard], nativeCrossings: [resultsCard], otherEvents: [], nativeOtherEvents: [],
    sources: [resultsCard], media: [media], milestones: [],
  });
  assert(!JSON.stringify(swimmer).includes(evidence));
  assert.equal(swimmer.crossings[0].lines[0].text, "10h");
  assert.deepEqual(swimmer.media[0], media);
  console.log("Public editorial, road guide and swimmer data preserve results and credits without exporting source links.");
} finally {
  await vite.close();
  await rm(cacheDir, { recursive: true, force: true });
}
