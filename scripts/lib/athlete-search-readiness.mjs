import assert from "node:assert/strict";
import { load } from "cheerio";

export const ATHLETE_SEARCH_ORIGIN = "https://www.athrecs.com";
const blockedRobots = /\b(noindex|nofollow|none)\b/i;

function siteUrl(value) {
  const url = new URL(value);
  assert.equal(url.origin, ATHLETE_SEARCH_ORIGIN, "Only the production AthRecs origin is allowed");
  assert(!url.username && !url.password && !url.search && !url.hash, "Unexpected URL attributes");
  assert.equal(url.href, value, "Use the exact canonical URL");
  return url;
}

async function getText(url, fetchImpl, contentType) {
  siteUrl(url);
  const response = await fetchImpl(url, {
    redirect: "error",
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200, `HTTP ${response.status} for ${url}`);
  assert(!response.redirected, `Redirected response for ${url}`);
  assert(!response.url || response.url === url, `Unexpected response URL for ${url}`);
  assert.match(response.headers.get("content-type") ?? "", contentType, `Content type for ${url}`);
  const text = await response.text();
  assert(text.length <= 10_000_000, `Response too large for ${url}`);
  return { response, text };
}

function locations(xml, root, entry) {
  assert(
    !/<!DOCTYPE|<!ENTITY/i.test(xml),
    "Sitemaps must not contain document/entity declarations",
  );
  const $ = load(xml, { xmlMode: true });
  const document = $.root().children();
  assert.equal(document.length, 1, "Expected one sitemap root");
  assert.equal(document[0].name, root, `Expected ${root}`);
  assert.equal(document.attr("xmlns"), "http://www.sitemaps.org/schemas/sitemap/0.9");
  const entries = document.children();
  assert(
    entries.toArray().every((node) => node.name === entry),
    "Invalid sitemap entries",
  );
  return entries.toArray().map((node) => {
    const loc = $(node).children("loc");
    assert.equal(loc.length, 1, "Each sitemap entry needs one location");
    assert.equal(loc.children().length, 0, "Location must be text");
    const value = loc.text().trim();
    siteUrl(value);
    return value;
  });
}

export async function collectAthleteSearchUrls(fetchImpl = fetch) {
  const { text } = await getText(`${ATHLETE_SEARCH_ORIGIN}/sitemap.xml`, fetchImpl, /\bxml\b/i);
  const sitemaps = locations(text, "sitemapindex", "sitemap");
  assert(sitemaps.length > 0, "Empty sitemap index; release readiness is unknown");
  const athleteSitemaps = sitemaps.filter((url) => {
    const path = siteUrl(url).pathname;
    if (!path.includes("athletes")) return false;
    assert.match(path, /^\/sitemaps\/athletes-[1-9]\d*\.xml$/, "Unexpected athlete sitemap path");
    return true;
  });
  const urls = new Set();
  for (const sitemap of new Set(athleteSitemaps)) {
    const { text } = await getText(sitemap, fetchImpl, /\bxml\b/i);
    for (const url of locations(text, "urlset", "url")) {
      assert.match(siteUrl(url).pathname, /^\/athletes\/[^/]+$/, "Unexpected athlete profile URL");
      urls.add(url);
    }
  }
  return [...urls];
}

export async function assertAthleteSearchReady(url, fetchImpl = fetch) {
  const { response, text } = await getText(url, fetchImpl, /\btext\/html\b/i);
  assert(
    !blockedRobots.test(response.headers.get("x-robots-tag") ?? ""),
    `Indexing blocked by HTTP robots header: ${url}`,
  );
  const $ = load(text);
  const robotTags = $("head meta[name]")
    .toArray()
    .filter((tag) => /^(robots|googlebot(?:-news)?|bingbot)$/i.test($(tag).attr("name")));
  assert(
    robotTags.every((tag) => !blockedRobots.test($(tag).attr("content") ?? "")),
    `Indexing blocked by robots metadata: ${url}`,
  );
  const robots = robotTags
    .filter((tag) => /^robots$/i.test($(tag).attr("name")))
    .flatMap((tag) => ($(tag).attr("content") ?? "").toLowerCase().split(/[\s,]+/));
  assert(
    robots.includes("index") && robots.includes("follow"),
    `Explicit index/follow permission missing: ${url}`,
  );
  const canonical = $("head link[rel]")
    .toArray()
    .filter((tag) => ($(tag).attr("rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"));
  assert.equal(canonical.length, 1, `Expected one canonical link: ${url}`);
  assert.equal($(canonical[0]).attr("href"), url, `Canonical mismatch: ${url}`);
}

export async function checkAthleteSearchReadiness(fetchImpl = fetch) {
  const urls = await collectAthleteSearchUrls(fetchImpl);
  // No publication is inferred from database visibility, a named athlete, or a
  // UI element. The live sitemap remains the only source of candidate URLs.
  for (const url of urls) await assertAthleteSearchReady(url, fetchImpl);
  return {
    ready: urls.length > 0,
    urls,
    reason: urls.length
      ? `${urls.length} live sitemap athlete URLs passed anonymous indexing checks.`
      : "No eligible athlete URLs in the live sitemap. Submission skipped; publication/indexing policy is unchanged.",
  };
}
