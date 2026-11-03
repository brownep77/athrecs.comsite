import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith("/ReviewedEventImage.tsx"))
      return {
        format: "module",
        shortCircuit: true,
        source: ts.transpileModule(fs.readFileSync(fileURLToPath(url), "utf8"), {
          compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
        }).outputText,
      };
    return nextLoad(url, context);
  },
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

const { REVIEWED_EVENT_IMAGES, eventImageJsonLd } =
  await import("../src/lib/athrecs/event-images.ts");
const { sportsEventJsonLd } = await import("../src/lib/athrecs/seo.ts");
const runrecs = await import("../src/runrecs/seo.ts");
const { roadRaceHead } = await import("../src/lib/running/road-marathon-seo.ts");
const { roadUltraHead } = await import("../src/lib/running/road-ultra-seo.ts");
const { ROAD_MARATHONS } = await import("../src/data/road-marathons/index.ts");
const { ROAD_ULTRAS } = await import("../src/lib/running/road-ultras.ts");
const seen = new Set();
for (const image of REVIEWED_EVENT_IMAGES) {
  for (const url of [image.url, image.sourceUrl]) {
    assert.equal(new URL(url).protocol, "https:");
    assert.equal(new URL(url).username + new URL(url).password, "");
  }
  assert(image.width >= 720 && image.width * image.height >= 50000);
  assert(image.alt && image.caption && /^\d{4}-\d{2}-\d{2}$/.test(image.checkedAt));
  for (const date of image.dates) {
    const key = `${image.slug}|${date}`;
    assert(!seen.has(key), key);
    seen.add(key);
    assert.equal(new Date(date).toISOString().slice(0, 10), date);
    for (const build of [sportsEventJsonLd, runrecs.sportsEventJsonLd]) {
      const result = build({ name: "Example race", slug: image.slug, startDate: date });
      assert.equal(result.image, image.url);
      assert.equal(build({ name: "Example archive", slug: image.slug })["@type"], "WebPage");
      assert(!("image" in build({ name: "Example archive", slug: image.slug })));
    }
    assert.deepEqual(eventImageJsonLd(image.slug, "2099-01-01"), {});
  }
}
for (const build of [sportsEventJsonLd, runrecs.sportsEventJsonLd]) {
  const event = build({
    name: "No reviewed image",
    slug: "example-no-image",
    startDate: "2027-04-25",
  });
  assert.equal(event["@type"], "SportsEvent");
  assert(!("image" in event), "Never substitute a publisher logo");
}
let reviewedGuideEvents = 0;
for (const [races, head, now] of [
  [ROAD_MARATHONS, (race, date) => roadRaceHead(race, date), "2026-11-03T12:00:00Z"],
  [ROAD_ULTRAS, (race, date) => roadUltraHead(date, race), "2026-11-03"],
]) {
  for (const race of races) {
    const result = head(race, now);
    const graph = JSON.parse(result.scripts[0].children)["@graph"];
    for (const event of graph.filter((item) => item["@type"] === "SportsEvent")) {
      const expected = eventImageJsonLd(race.slug, event.startDate).image;
      assert.equal(event.image, expected, race.slug);
      if (expected) reviewedGuideEvents++;
    }
    assert(result.links.some((link) => link.rel === "canonical"));
  }
}
assert(reviewedGuideEvents > 0, "Reviewed image reaches actual guide schema");
console.log(
  `Event-image checks passed: ${seen.size} reviewed editions; fixture and both guide builders; no invented fallback or cross-edition reuse.`,
);

const { ReviewedEventImage } = await import("../src/components/races/ReviewedEventImage.tsx");
for (const image of REVIEWED_EVENT_IMAGES) {
  const html = renderToStaticMarkup(
    createElement(ReviewedEventImage, { slug: image.slug, date: image.dates[0] }),
  );
  assert(html.includes(image.url.replaceAll("&", "&amp;")));
  assert(html.includes("<figcaption") && html.includes(image.sourceUrl));
}
assert.equal(
  renderToStaticMarkup(
    createElement(ReviewedEventImage, { slug: "example-no-image", date: "2027-04-25" }),
  ),
  "",
);
assert.equal(
  renderToStaticMarkup(createElement(ReviewedEventImage, { slug: "london-marathon" })),
  "",
);
console.log("Rendered image, caption, attribution and absent-image/undated behaviour passed.");
