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
const { ROAD_MARATHONS } = await import("../src/data/road-marathons/index.ts");
const { MARATHON_COUNTRIES } = await import("../src/data/road-marathons/countries.ts");
const base = process.env.MARATHON_PREVIEW_BASE ?? "http://127.0.0.1:8095";
const output = process.argv[2];
assert(output, "Pass an output HTML path");
const paths = [
  "/running",
  ...MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
  ...ROAD_MARATHONS.map((race) => `/running/races/${race.slug}`),
];
const initialRoute = process.argv[3] ?? "/running";
assert(paths.includes(initialRoute), "Initial preview route must be a running guide");
const pages = {};
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
    pages[route] = { title: $("title").text(), html: $("main").html() };
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
const cssDir = path.join(root, ".vercel/output/static/assets");
const cssName = fs
  .readdirSync(cssDir)
  .find((file) => file.startsWith("styles-") && file.endsWith(".css"));
const css = fs.readFileSync(path.join(cssDir, cssName), "utf8");
const logo = fs.readFileSync(path.join(root, "public/athrecs-logo-header.png")).toString("base64");
const data = JSON.stringify(pages).replace(/</g, "\\u003c");
const html = `<!doctype html><html lang="en" class="athrecs-theme"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>AthRecs marathon guides preview</title><style>${css}</style><style>html{scroll-behavior:smooth}body{margin:0}.preview-banner{padding:10px 16px;background:#173d30;color:white;text-align:center;font:13px system-ui}.preview-top{max-width:1200px;margin:auto;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px}.preview-logo{width:165px;max-width:40vw;height:auto}.preview-main{max-width:1200px;margin:auto;padding:16px 24px 50px}@media(max-width:600px){.preview-main{padding:12px 16px 40px}}</style></head><body class="bg-bg text-fg antialiased"><div class="preview-banner">Review preview · 26 September 2026 · ${ROAD_MARATHONS.length} race pages · awaiting publication approval</div><header class="preview-top"><a href="/running" aria-label="AthRecs running guides"><img class="preview-logo" src="data:image/png;base64,${logo}" alt="AthRecs"></a><a href="/running" class="font-semibold text-accent">All country guides</a></header><main id="preview-app" class="preview-main">${pages[initialRoute].html}</main><script>const pages=${data};let current=${JSON.stringify(initialRoute)};function render(){let state;try{state=decodeURIComponent(location.hash.slice(1))}catch{state=${JSON.stringify(initialRoute)}}const parts=(state||${JSON.stringify(initialRoute)}).split('#');const route=pages[parts[0]]?parts[0]:${JSON.stringify(initialRoute)};current=route;document.getElementById('preview-app').innerHTML=pages[route].html;document.title=pages[route].title;requestAnimationFrame(()=>{const target=parts[1]&&document.getElementById(parts[1]);if(target)target.scrollIntoView();else window.scrollTo(0,0)})}document.addEventListener('click',event=>{const a=event.target.closest('a[href]');if(!a||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;const href=a.getAttribute('href');if(href.startsWith('#')){event.preventDefault();location.hash=encodeURIComponent(current+href);return}const url=new URL(href,'https://www.athrecs.com');if(url.origin==='https://www.athrecs.com'&&pages[url.pathname]){event.preventDefault();const next=encodeURIComponent(url.pathname+url.hash);if(location.hash.slice(1)===next)render();else location.hash=next}});window.addEventListener('hashchange',render);render();</script></body></html>`;
fs.writeFileSync(output, html);
console.log(
  `Passed SSR: ${paths.length} routes, internal links, metadata, results categories, official archives, sitemap and 404s. Wrote ${output} (${fs.statSync(output).size} bytes).`,
);
