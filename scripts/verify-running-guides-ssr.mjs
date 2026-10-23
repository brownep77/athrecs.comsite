import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
import * as cheerio from "cheerio";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") &&
        context.parentURL?.startsWith(pathToFileURL(`${root}/src/`).href))
    ) {
      let target = specifier.startsWith("@/")
        ? path.join(root, "src", specifier.slice(2))
        : fileURLToPath(new URL(specifier, context.parentURL));
      if (!path.extname(target))
        target = fs.existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, "index.ts");
      return nextResolve(pathToFileURL(target).href, context);
    }
    return nextResolve(specifier, context);
  },
});
const { ROAD_MARATHONS: FULL_MARATHONS } = await import("../src/data/road-marathons/index.ts");
const { MARATHON_COUNTRIES: FULL_COUNTRIES } =
  await import("../src/data/road-marathons/countries.ts");
const { ROAD_HALF_MARATHONS } = await import("../src/data/road-half-marathons/index.ts");
const { HALF_MARATHON_COUNTRIES } = await import("../src/data/road-half-marathons/countries.ts");
const ROAD_MARATHONS = [...FULL_MARATHONS, ...ROAD_HALF_MARATHONS];
const MARATHON_COUNTRIES = [...FULL_COUNTRIES, ...HALF_MARATHON_COUNTRIES];
const { ROAD_ULTRAS, ULTRA_GUIDE_PATH, ultraPath } =
  await import("../src/lib/running/road-ultras.ts");
const { SUPERHALFS_PATH } = await import("../src/data/superhalfs.ts");
const { raceGroupDefinitions } = await import("../src/data/race-collections.ts");
const { COUNTRY_SITES } = await import("../src/lib/athrecs/country-sites.ts");
const siteUrl = "https://www.athrecs.com";
const guideHubPath = "/running/guides";
// Derive coverage from the published source catalogues, independently of the
// directory builder, so omitting a catalogue from the page cannot hide a gap.
const countryGuidePaths = [
  ...MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
  ULTRA_GUIDE_PATH,
];
const raceGuidePaths = [
  ...ROAD_MARATHONS.map((race) => `/running/races/${race.slug}`),
  ...ROAD_ULTRAS.map((race) => ultraPath(race.slug)),
];
const seriesGuidePaths = [
  SUPERHALFS_PATH,
  ...raceGroupDefinitions.map((group) => `/running/race-series#${group.code}`),
];
const countryPortalPaths = COUNTRY_SITES.map((country) => `/en/${country.slug}`);
const base = process.env.RUNNING_VERIFY_BASE ?? "http://127.0.0.1:8097";
const toolPaths = ["/running/events", "/running/calendar", "/running/race-series"];
const paths = [
  "/running",
  guideHubPath,
  "/running/road",
  "/running/trail",
  "/running/fell",
  "/running/cross-country",
  SUPERHALFS_PATH,
  ULTRA_GUIDE_PATH,
  ...ROAD_ULTRAS.map((race) => ultraPath(race.slug)),
  ...MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
  ...ROAD_MARATHONS.map((race) => `/running/races/${race.slug}`),
];
const titles = new Set();
const descriptions = new Set();

function verifyGuideHub($) {
  // Inspect raw SSR anchors. Native details are intentionally allowed: their
  // links remain present and usable without JavaScript, even when collapsed.
  const crawlableLinks = new Set(
    $("main a[href]")
      .toArray()
      .filter(
        (element) =>
          $(element).text().trim() &&
          !$(element).closest("[hidden], [aria-hidden=true], template").length &&
          !($(element).attr("rel") ?? "").split(/\s+/).includes("nofollow"),
      )
      .map((element) => new URL($(element).attr("href"), siteUrl).href),
  );
  for (const [kind, expectedPaths] of [
    ["country guide", countryGuidePaths],
    ["individual race guide", raceGuidePaths],
    ["race series", seriesGuidePaths],
    ["country portal", countryPortalPaths],
  ]) {
    for (const destination of expectedPaths)
      assert(
        crawlableLinks.has(`${siteUrl}${destination}`),
        `${guideHubPath}: missing readable, followable SSR link to ${kind} ${destination}`,
      );
  }

  const schemaNodes = [];
  function collectSchemaNodes(value) {
    if (Array.isArray(value)) value.forEach(collectSchemaNodes);
    else if (value && typeof value === "object") {
      schemaNodes.push(value);
      Object.values(value).forEach(collectSchemaNodes);
    }
  }
  $('script[type="application/ld+json"]')
    .toArray()
    .forEach((element) => collectSchemaNodes(JSON.parse($(element).html())));
  const hasType = (node, type) => [node["@type"]].flat().includes(type);
  assert(
    schemaNodes.some(
      (node) => hasType(node, "CollectionPage") && node.url === `${siteUrl}${guideHubPath}`,
    ),
    `${guideHubPath}: canonical CollectionPage markup missing`,
  );
  const itemLists = schemaNodes.filter((node) => hasType(node, "ItemList"));
  assert(itemLists.length, `${guideHubPath}: guide list markup missing`);
  for (const list of itemLists) {
    assert(list.itemListElement?.length, `${guideHubPath}: empty structured guide list`);
    for (const entry of list.itemListElement) {
      const item = entry.item ?? entry;
      const destination = typeof item === "string" ? item : (item.url ?? item["@id"]);
      assert(
        typeof destination === "string" && crawlableLinks.has(new URL(destination, siteUrl).href),
        `${guideHubPath}: structured guide destination is missing from readable SSR links: ${destination}`,
      );
    }
  }
  assert(
    schemaNodes.some((node) => {
      if (!hasType(node, "BreadcrumbList")) return false;
      const lastItem = node.itemListElement?.at(-1)?.item;
      const destination =
        typeof lastItem === "string" ? lastItem : (lastItem?.["@id"] ?? lastItem?.url);
      return destination === `${siteUrl}${guideHubPath}`;
    }),
    `${guideHubPath}: breadcrumb must identify the canonical guide directory`,
  );
}

let cursor = 0;
async function worker() {
  while (cursor < paths.length) {
    const route = paths[cursor++];
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    const $ = cheerio.load(await response.text());
    assert.equal($("h1").length, 1, route);
    const title = $("title").text();
    const description = $('meta[name="description"]').attr("content");
    assert(title && !titles.has(title), `${route}: missing or duplicate title`);
    assert(
      description && !descriptions.has(description),
      `${route}: missing or duplicate description`,
    );
    titles.add(title);
    descriptions.add(description);
    assert.equal($("link[rel=canonical]").attr("href"), `https://www.athrecs.com${route}`, route);
    assert($("meta[name=robots]").attr("content").startsWith("index"), route);
    assert(
      !$("main th, main dt")
        .toArray()
        .some((element) => /Entry capacity/i.test($(element).text())),
      route,
    );
    for (const script of $('script[type="application/ld+json"]').toArray())
      JSON.parse($(script).html());
    if (route === guideHubPath) verifyGuideHub($);
    $("main a[href]").each((i, element) => {
      const href = $(element).attr("href");
      if (href.startsWith("/running"))
        assert(
          [...paths, ...toolPaths].includes(new URL(href, siteUrl).pathname),
          `${route} has broken internal link ${href}`,
        );
      else if (href.startsWith("/")) $(element).attr("href", `https://www.athrecs.com${href}`);
      if (href.startsWith("http"))
        $(element).attr("target", "_blank").attr("rel", "noopener noreferrer");
    });
    const race = ROAD_MARATHONS.find((item) => route === `/running/races/${item.slug}`);
    if (race) {
      const graph = $('script[type="application/ld+json"]')
        .toArray()
        .flatMap((element) => JSON.parse($(element).html())["@graph"] ?? []);
      const events = graph.filter((item) => item["@type"] === "SportsEvent");
      for (const event of events) {
        const fragment = new URL(event.url).hash;
        assert.equal($(fragment).length, 1, `${route}: event URL must identify a visible edition`);
        assert($(fragment).text().trim(), `${route}: event target must have readable content`);
        assert.equal(event.eventStatus, "https://schema.org/EventScheduled", route);
        assert(
          race.editions.some((edition) => edition.date === event.startDate),
          route,
        );
      }
      const faq = graph.find((item) => item["@type"] === "FAQPage");
      for (const question of faq.mainEntity) {
        const visible = $("#questions").text().replace(/\s+/g, " ");
        assert(visible.includes(question.name), `${route}: structured question missing from page`);
        assert(
          visible.includes(question.acceptedAnswer.text.replace(/\s+/g, " ")),
          `${route}: structured answer missing from page`,
        );
      }
      if (!race.editions.length)
        assert.equal(events.length, 0, `${route}: TBC must not create events`);
      assert($("#related-races").length, `${route}: related race links missing`);
      for (const id of ["dates", "entry", "course", "results", "media", "questions"])
        assert.equal($(`#${id}`).length, 1, `${route} missing ${id}`);
      for (const method of race.entryMethods)
        assert($("#entry").text().includes(method.name), route);
      assert.equal(
        $("#results h4").length,
        race.pastEditions.reduce((sum, edition) => sum + edition.categories.length, 0),
        route,
      );
      assert(
        $("#results a")
          .toArray()
          .some((element) => $(element).attr("href") === race.resultsUrl),
        route,
      );
    }
    const country = MARATHON_COUNTRIES.find((item) => route === `/running/${item.guide}`);
    if (country) {
      const countryRaces = (
        country.guide.includes("-half-") ? ROAD_HALF_MARATHONS : FULL_MARATHONS
      ).filter((item) => item.country === country.id);
      assert.equal(
        $("#by-region a").length,
        countryRaces.length,
        `${route}: every race must be in the region directory`,
      );
      assert($("#choose-a-race").text().length > 200, `${route}: planning advice missing`);
    }
    if (race?.distanceKm === 21.0975) {
      assert($("main").text().includes("21.0975"), route);
      assert($("main").text().includes("13.1 miles"), route);
      assert(!$("#course").text().includes("42.195 kilometres"), route);
      const crumbs = $('script[type="application/ld+json"]')
        .toArray()
        .flatMap((el) => JSON.parse($(el).html())["@graph"] ?? [])
        .find((item) => item["@type"] === "BreadcrumbList");
      assert(crumbs.itemListElement[2].item.endsWith(`/${race.country}-half-marathons`), route);
    }
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
const sitemap = await fetch(`${base}/sitemaps/pages.xml`);
assert.equal(sitemap.status, 200);
const xml = await sitemap.text();
const sitemapDoc = cheerio.load(xml, { xmlMode: true });
const locations = sitemapDoc("url > loc")
  .toArray()
  .map((element) => sitemapDoc(element).text());
assert.equal(new Set(locations).size, locations.length, "Duplicate sitemap URLs");
for (const route of paths) {
  assert(locations.includes(`https://www.athrecs.com${route}`), `Missing sitemap entry: ${route}`);
  if (route !== "/running") {
    const entry = sitemapDoc("url")
      .toArray()
      .find(
        (element) => sitemapDoc(element).find("loc").text() === `https://www.athrecs.com${route}`,
      );
    assert.match(sitemapDoc(entry).find("lastmod").text(), /^\d{4}-\d{2}-\d{2}$/, route);
  }
}
for (const route of ["/running/unknown-country", "/running/races/not-a-real-marathon"])
  assert.equal((await fetch(`${base}${route}`)).status, 404, route);
console.log(
  `Passed SSR: ${paths.length} routes; hub links to ${countryGuidePaths.length} country guides, ${raceGuidePaths.length} individual race guides, ${seriesGuidePaths.length} race series and ${countryPortalPaths.length} country portals; distance labels, metadata, JSON-LD, results links, internal links, sitemap and 404s.`,
);
