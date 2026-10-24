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
  // Large live sitemaps can exceed the profile timeout while checking publication.
  // Retry only a timed-out sitemap read, never a failed eligibility check or POST.
  const sitemap = new URL(url).pathname.endsWith(".xml");
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetchImpl(url, {
        redirect: "error",
        headers: { "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(sitemap ? 90000 : 30000),
      });
      assert.equal(response.status, 200, `HTTP ${response.status} for ${url}`);
      assert(!response.redirected, `Redirected response for ${url}`);
      assert(!response.url || response.url === url, `Unexpected response URL for ${url}`);
      assert.match(
        response.headers.get("content-type") ?? "",
        contentType,
        `Content type for ${url}`,
      );
      const text = await response.text();
      assert(text.length <= 10_000_000, `Response too large for ${url}`);
      return { response, text };
    } catch (error) {
      if (sitemap && attempt === 0 && error.name === "TimeoutError") continue;
      const failure = new Error(`Unable to validate ${url}: ${error.message}`, { cause: error });
      failure.name = error.name;
      throw failure;
    }
  }
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

async function athleteSitemaps(fetchImpl) {
  const { text } = await getText(`${ATHLETE_SEARCH_ORIGIN}/sitemap.xml`, fetchImpl, /\bxml\b/i);
  const sitemaps = locations(text, "sitemapindex", "sitemap");
  assert(sitemaps.length > 0, "Empty sitemap index; release readiness is unknown");
  const athleteSitemaps = sitemaps.filter((url) => {
    const path = siteUrl(url).pathname;
    if (!path.includes("athletes")) return false;
    assert.match(path, /^\/sitemaps\/athletes-[1-9]\d*\.xml$/, "Unexpected athlete sitemap path");
    return true;
  });
  return [...new Set(athleteSitemaps)].sort(
    (a, b) => Number(a.match(/athletes-(\d+)/)[1]) - Number(b.match(/athletes-(\d+)/)[1]),
  );
}

export function validateSearchCursor(cursor) {
  if (cursor == null) return;
  assert.equal(cursor.version, 1, "Unknown search checkpoint version");
  assert(Number.isSafeInteger(cursor.cycle) && cursor.cycle >= 1, "Invalid search cycle");
  assert.match(siteUrl(cursor.sitemap).pathname, /^\/sitemaps\/athletes-[1-9]\d*\.xml$/);
  if (cursor.afterUrl !== null)
    assert.match(siteUrl(cursor.afterUrl).pathname, /^\/athletes\/[^/]+$/);
}

/** Checkpoints choose a position, never authorize a URL or cache eligibility. */
export async function collectAthleteSearchBatch(
  fetchImpl = fetch,
  { cursor, batchSize = 500 } = {},
) {
  validateSearchCursor(cursor);
  assert(
    Number.isSafeInteger(batchSize) && batchSize >= 1 && batchSize <= 1000,
    "Invalid batch size",
  );
  const sitemaps = await athleteSitemaps(fetchImpl);
  if (!sitemaps.length) return { urls: [], nextCursor: null, cycleComplete: true };
  const index = Math.max(0, sitemaps.indexOf(cursor?.sitemap));
  const sitemap = sitemaps[index];
  const { text } = await getText(sitemap, fetchImpl, /\bxml\b/i);
  const urls = [...new Set(locations(text, "urlset", "url"))];
  for (const url of urls)
    assert.match(siteUrl(url).pathname, /^\/athletes\/[^/]+$/, "Unexpected athlete profile URL");
  // If publication changes remove the anchor, replay this shard rather than
  // trusting an offset that could silently skip newly eligible profiles.
  const offset = cursor?.sitemap === sitemap ? urls.indexOf(cursor.afterUrl) + 1 : 0;
  const batch = urls.slice(offset, offset + batchSize);
  const shardComplete = offset + batch.length >= urls.length;
  const cycleComplete = shardComplete && index === sitemaps.length - 1;
  const nextCursor = {
    version: 1,
    cycle: (cursor?.cycle ?? 1) + Number(cycleComplete),
    sitemap: shardComplete ? sitemaps[(index + 1) % sitemaps.length] : sitemap,
    afterUrl: shardComplete ? null : batch.at(-1),
  };
  return { urls: batch, sitemap, nextCursor, cycleComplete };
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
  const href = $(canonical[0]).attr("href");
  // An absolute origin URL and its serialized trailing-slash form are the same
  // homepage URL. Keep exact matching for every non-root path.
  const canonicalUrl = href === ATHLETE_SEARCH_ORIGIN ? `${href}/` : href;
  assert.equal(canonicalUrl, url, `Canonical mismatch: ${url}`);
}

export async function checkAthleteSearchReadiness(fetchImpl = fetch, options = {}) {
  const batch = await collectAthleteSearchBatch(fetchImpl, options);
  const { urls } = batch;
  // No publication is inferred from database visibility, a named athlete, or a
  // UI element. The live sitemap remains the only source of candidate URLs.
  // Bound production load. Every candidate in this batch must pass before any
  // submission; remaining shards are visited by subsequent checkpointed runs.
  let next = 0;
  let completed = 0;
  let failed;
  await Promise.all(
    Array.from({ length: Math.min(12, urls.length) }, async () => {
      while (!failed && next < urls.length) {
        const url = urls[next++];
        try {
          await assertAthleteSearchReady(url, fetchImpl);
          completed++;
          if (completed % 500 === 0)
            console.log(`Validated ${completed}/${urls.length} athlete URLs.`);
        } catch (error) {
          failed ??= error;
        }
      }
    }),
  );
  if (failed) throw failed;
  return {
    ...batch,
    ready: urls.length > 0,
    reason: urls.length
      ? `${urls.length} athlete URLs in this batch passed anonymous indexing checks.`
      : "No eligible URLs in this sitemap batch. No URLs submitted; publication/indexing policy is unchanged.",
  };
}
