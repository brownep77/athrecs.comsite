// Offline checks for the parallel source importer: no network is used.
import assert from "node:assert/strict";
import {
  OUTPUT_HEADERS,
  distancesFrom,
  enabledSources,
  extractEvents,
  extractLinks,
  parseCsv,
  parseRobots,
  runAll,
  toCsv,
} from "./source-importer/lib.mjs";

const registry = parseCsv(
  [
    "source_id,start_url,source_type,enabled,allowed_domains,race_link_include_regex,race_link_exclude_regex,max_pages,rate_limit_seconds,timing_scope,country_focus",
    "good,https://races.example.org/list,directory,1,races.example.org,/race/\\d+$,/results/,2,0,Timing provider calendar,United Kingdom",
    "off,https://off.example.org/,directory,0,off.example.org,,,1,0,Timing provider calendar,United Kingdom",
  ].join("\n"),
);
assert.equal(enabledSources(registry).length, 1);
assert.equal(
  enabledSources([...registry, { ...registry[0], source_id: "x_results_archive", enabled: "1" }]).length,
  1,
  "result and archive sources are excluded",
);
assert.throws(() => enabledSources(registry, ["off"]), /disabled/);
assert.throws(() => enabledSources(registry, ["nope"]), /not in the registry/);

const robots = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/open\nCrawl-delay: 3");
assert.equal(robots.allows("/race/1"), true);
assert.equal(robots.allows("/private/x"), false);
assert.equal(robots.allows("/private/open/x"), true);
assert.equal(robots.delay, 3);
assert.equal(parseRobots("User-agent: *\nDisallow: /").allows("/race/1"), false);

assert.deepEqual(
  distancesFrom("Leeds Half Marathon 13.1 miles, 10K and 5k").map((d) => `${d.distance}${d.unit}`),
  ["13.1mi", "10km", "5km"],
);
assert.deepEqual(distancesFrom("City Marathon").map((d) => d.distance), [42.195]);
assert.deepEqual(distancesFrom("A fun day out"), []);

const ld = (o) => `<html><script type="application/ld+json">${JSON.stringify(o)}</script></html>`;
const event = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "Sample Town 10K",
  startDate: "2026-11-15T10:00:00",
  location: { "@type": "Place", address: { addressLocality: "Sampletown", addressCountry: "GB" } },
  offers: { "@type": "Offer", name: "10K entry", availability: "https://schema.org/InStock" },
};
assert.equal(extractEvents(ld({ "@graph": [event] }))[0].city, "Sampletown");
const listing = `<a href="/race/12">a</a><a href="/race/13">b</a><a href="/results/12">r</a><a href="https://other.example.com/race/9">x</a><a href="/athletes/5">p</a>`;
assert.deepEqual(extractLinks(listing, "https://races.example.org/list", registry[0]), [
  "https://races.example.org/race/12",
  "https://races.example.org/race/13",
]);

const requested = [];
const pages = {
  "https://races.example.org/robots.txt": "User-agent: *\nDisallow: /race/13",
  "https://races.example.org/list": listing,
  "https://races.example.org/race/12": ld(event),
  "https://races.example.org/race/13": ld({ ...event, name: "Blocked 5K" }),
};
const fetchImpl = async (url) => {
  requested.push(url);
  const body = pages[url];
  return body === undefined
    ? { ok: false, status: 404, headers: new Headers(), text: async () => "" }
    : { ok: true, status: 200, headers: new Headers({ "content-type": "text/html" }), text: async () => body };
};
const { results, rows } = await runAll(registry.slice(0, 2).filter((r) => r.enabled === "1"), {
  fetchImpl,
  sleep: async () => {},
  options: { today: "2026-10-26", from: "2026-10-26", to: "2026-12-31" },
});
assert.equal(rows.length, 1);
assert.equal(rows[0].name, "Sample Town 10K");
assert.equal(rows[0].country, "United Kingdom");
assert.equal(rows[0].date, "2026-11-15");
assert.equal(rows[0].distance, 10);
assert.equal(rows[0].sourceKind, "timing-provider");
assert.equal(rows[0].entryStatus, "Open");
assert.equal(rows[0].sourceUrl, "https://races.example.org/race/12");
assert(!requested.some((u) => u.includes("/race/13")), "robots.txt disallow is honoured");
assert(!requested.some((u) => u.includes("/results/") || u.includes("/athletes/") || u.includes("other.example.com")));
assert(!requested.some((u) => u.includes("off.example.org")), "disabled sources are never fetched");
assert(results[0].log.some((l) => l.includes("robots.txt")));
const csv = toCsv(OUTPUT_HEADERS, rows);
assert(csv.startsWith("name,country,city,region,date,distance,unit,surface,startTime,sourceUrl,entryUrl,sourceKind,evidence"));
assert.equal(parseCsv(csv)[0].evidence.length > 20, true);
console.log("Source importer checks passed");
