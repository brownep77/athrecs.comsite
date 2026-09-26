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
const base = process.env.RUNNING_VERIFY_BASE ?? "http://127.0.0.1:8097";
const paths = [
  "/running",
  ...MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
  ...ROAD_MARATHONS.map((race) => `/running/races/${race.slug}`),
];
let cursor = 0;
async function worker() {
  while (cursor < paths.length) {
    const route = paths[cursor++];
    const response = await fetch(`${base}${route}`);
    assert.equal(response.status, 200, route);
    const $ = cheerio.load(await response.text());
    assert.equal($("h1").length, 1, route);
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
    $("main a[href]").each((i, element) => {
      const href = $(element).attr("href");
      if (href.startsWith("/running"))
        assert(paths.includes(href.split("#")[0]), `${route} has broken internal link ${href}`);
      else if (href.startsWith("/")) $(element).attr("href", `https://www.athrecs.com${href}`);
      if (href.startsWith("http"))
        $(element).attr("target", "_blank").attr("rel", "noopener noreferrer");
    });
    const race = ROAD_MARATHONS.find((item) => route === `/running/races/${item.slug}`);
    if (race) {
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
for (const route of paths)
  assert(xml.includes(`https://www.athrecs.com${route}`), `Missing sitemap entry: ${route}`);
for (const route of ["/running/unknown-country", "/running/races/not-a-real-marathon"])
  assert.equal((await fetch(`${base}${route}`)).status, 404, route);
console.log(
  `Passed SSR: ${paths.length} routes, distance labels, metadata, JSON-LD, results links, internal links, sitemap and 404s.`,
);
