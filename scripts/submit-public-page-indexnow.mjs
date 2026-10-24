// Public sitemap membership and anonymous responses are the authority, never staff data.
import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, rename, appendFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import { assertAthleteSearchReady as assertPublicPageReady } from "./lib/athlete-search-readiness.mjs";

export const origin = "https://www.athrecs.com";
const endpoint = "https://api.indexnow.org/indexnow";
const namespace = "http://www.sitemaps.org/schemas/sitemap/0.9";
const privatePath =
  /^\/(?:admin|api|athlete-account|my-athlete-profile|claim-results|athlete-results|review-results|account|login|logout|auth)(?:\/|$)|^\/brands\/(?:manage|register)(?:\/|$)/i;
const sitemapPattern =
  /^\/sitemaps\/(?:pages|countries|race-places|(?:races|clubs|results)-[1-9]\d*)\.xml$/;
const day = 24 * 60 * 60 * 1000;

export function publicUrl(value) {
  const url = new URL(value);
  assert.equal(url.origin, origin, "Only production AthRecs URLs are allowed");
  assert(!url.username && !url.password && !url.search && !url.hash, "Unexpected URL attributes");
  assert.equal(url.href, value, "Use exact canonical URLs");
  const path = decodeURIComponent(url.pathname);
  assert(
    !/%(?:2f|5c|25|3f|23)/i.test(url.pathname) &&
      !path.includes("//") &&
      !/[\\%?#]/.test(path) &&
      !privatePath.test(path),
    "Private or ambiguous path",
  );
  return url;
}

async function getText(url, fetchImpl, type) {
  publicUrl(url);
  const r = await fetchImpl(url, { redirect: "error", signal: AbortSignal.timeout(90000) });
  assert.equal(r.status, 200, `HTTP ${r.status}: ${url}`);
  assert(!r.redirected && (!r.url || r.url === url), `Redirected response: ${url}`);
  assert.match(r.headers.get("content-type") ?? "", type, `Content type: ${url}`);
  const text = await r.text();
  assert(text.length <= 10_000_000, "Response too large");
  return text;
}

export function sitemapEntries(text, index = false) {
  assert(!/<!DOCTYPE|<!ENTITY/i.test(text), "Unsafe sitemap declarations");
  const $ = load(text, { xmlMode: true });
  const root = $.root().children();
  assert.equal(root.length, 1, "Expected one sitemap root");
  assert.equal(root[0].name, index ? "sitemapindex" : "urlset");
  assert.equal(root.attr("xmlns"), namespace);
  assert(root.children().length <= 50000, "Oversized sitemap");
  return root
    .children()
    .toArray()
    .map((node) => {
      assert.equal(node.name, index ? "sitemap" : "url");
      const loc = $(node).children("loc");
      assert.equal(loc.length, 1, "Expected one location");
      assert.equal(loc.children().length, 0, "Location must be text");
      const url = loc.text().trim();
      publicUrl(url);
      const lastmod = $(node).children("lastmod").text().trim() || null;
      assert(!lastmod || /^\d{4}-\d\d-\d\d(?:T[^\s]+)?$/.test(lastmod), "Invalid lastmod");
      return { url, lastmod };
    });
}

function assertFamily(entry, sitemap) {
  const path = decodeURIComponent(publicUrl(entry.url).pathname);
  assert(!/^\/athletes\//.test(path), "Athlete profiles use their existing dedicated worker");
  const family = new URL(sitemap).pathname.split("/").at(-1);
  const numbered = /^(races|clubs|results)-/.exec(family);
  if (numbered) assert(new RegExp(`^/${numbered[1]}/[^/]+$`).test(path), "Sitemap family mismatch");
  if (family === "race-places.xml")
    assert(/^\/races\/places(?:\/[^/]+)*$/.test(path), "Unexpected place URL");
  if (family === "countries.xml")
    assert(/^\/[a-z]{2,3}\/[^/]+(?:\/races)?$/.test(path), "Unexpected country URL");
}

export async function collectInventory(fetchImpl = fetch) {
  const index = sitemapEntries(await getText(`${origin}/sitemap.xml`, fetchImpl, /\bxml\b/i), true);
  assert(index.length, "Empty sitemap index");
  const sitemaps = [...new Set(index.map((e) => e.url))].filter((url) => {
    const path = new URL(url).pathname;
    if (/^\/sitemaps\/athletes-[1-9]\d*\.xml$/.test(path)) return false;
    assert(sitemapPattern.test(path), "Unexpected sitemap family");
    return true;
  });
  const groups = [];
  for (const sitemap of sitemaps) {
    const entries = sitemapEntries(await getText(sitemap, fetchImpl, /\bxml\b/i));
    for (const entry of entries) assertFamily(entry, sitemap);
    groups.push({ sitemap, entries });
  }
  // Interleave families so a large race/place catalogue cannot delay every club/result.
  const unique = new Map();
  const max = Math.max(0, ...groups.map((g) => g.entries.length));
  for (let offset = 0; offset < max; offset += 50) {
    for (const group of groups) {
      for (const entry of group.entries.slice(offset, offset + 50)) {
        if (!unique.has(entry.url)) unique.set(entry.url, { ...entry, sitemap: group.sitemap });
      }
    }
  }
  return {
    entries: [...unique.values()],
    counts: groups.map((g) => ({ sitemap: g.sitemap, count: g.entries.length })),
  };
}

export function assertRobotsAllowed(text, urls) {
  assert(!/<(?:html|!doctype)/i.test(text), "Expected robots.txt");
  const groups = [];
  let group;
  for (const line of text.split(/\r?\n/)) {
    const match = line
      .replace(/#.*/, "")
      .trim()
      .match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    const name = match[1].trim().toLowerCase();
    const value = match[2].trim();
    if (name === "user-agent") {
      if (!group || group.hasRules) {
        group = { agents: [], rules: [], hasRules: false };
        groups.push(group);
      }
      assert(value, "Empty robots user agent");
      group.agents.push(value.toLowerCase());
    } else if (group && ["allow", "disallow"].includes(name)) {
      group.hasRules = true;
      if (!value) continue;
      assert(value.startsWith("/"), "Unexpected robots path");
      const end = value.endsWith("$");
      const pattern = (end ? value.slice(0, -1) : value)
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
      group.rules.push({
        allow: name === "allow",
        length: value.replace(/[*$]/g, "").length,
        match: new RegExp(`^${pattern}${end ? "$" : ""}`),
      });
    }
  }
  assert(groups.length, "No robots user-agent policy");
  for (const agent of new Set(["*", ...groups.flatMap((g) => g.agents)])) {
    const rules = groups.filter((g) => g.agents.includes(agent)).flatMap((g) => g.rules);
    for (const url of urls) {
      const matches = rules.filter((r) => r.match.test(new URL(url).pathname));
      const longest = Math.max(-1, ...matches.map((r) => r.length));
      assert(
        !matches.length || matches.some((r) => r.length === longest && r.allow),
        `robots.txt blocks ${agent}: ${url}`,
      );
    }
  }
}

export function validateState(state) {
  assert.equal(state.version, 1, "Unknown public-search checkpoint");
  assert(state.accepted && typeof state.accepted === "object" && !Array.isArray(state.accepted));
  for (const [url, receipt] of Object.entries(state.accepted)) {
    publicUrl(url);
    assert(
      !/^\/athletes\//.test(decodeURIComponent(new URL(url).pathname)),
      "Wrong checkpoint scope",
    );
    assert(Number.isFinite(Date.parse(receipt.at)), "Invalid receipt time");
    assert(
      receipt.lastmod === null || typeof receipt.lastmod === "string",
      "Invalid receipt version",
    );
    assert([200, 202].includes(receipt.status), "Unaccepted receipt");
  }
}

export async function notifyPublicPages({
  fetchImpl = fetch,
  checkOnly = true,
  state = { version: 1, accepted: {} },
  maxUrls = 500,
  batchSize = 250,
  keyFile,
  key,
  now = Date.now(),
  maxDurationMs = 20 * 60 * 1000,
  save = async () => {},
  log = console.log,
} = {}) {
  validateState(state);
  assert(Number.isFinite(maxDurationMs) && maxDurationMs > 0, "Invalid time budget");
  const startedAt = Date.now();
  assert(Number.isSafeInteger(maxUrls) && maxUrls > 0 && maxUrls <= 5000, "Invalid URL limit");
  assert(
    Number.isSafeInteger(batchSize) && batchSize > 0 && batchSize <= 500,
    "Invalid batch size",
  );
  const nextState = structuredClone(state);
  const boundedFetch = (url, options = {}) => {
    const method = options.method ?? "GET";
    assert(
      method === "GET" || (method === "POST" && url === endpoint),
      "Unexpected network mutation",
    );
    if (method === "GET") publicUrl(url);
    const headers = new Headers(options.headers);
    assert(!headers.has("authorization") && !headers.has("cookie"), "Only anonymous reads");
    return fetchImpl(url, { ...options, redirect: "error" });
  };
  const inventory = await collectInventory(boundedFetch);
  const pending = inventory.entries.filter((e) => {
    const receipt = state.accepted[e.url];
    return !receipt || receipt.lastmod !== e.lastmod || now - Date.parse(receipt.at) >= 7 * day;
  });
  const candidates = pending.slice(0, maxUrls);
  const result = {
    inventory: inventory.entries.length,
    counts: inventory.counts,
    checked: 0,
    submitted: 0,
    pending: pending.length,
    held: [],
    receipts: [],
    paused: false,
  };
  log(
    `${result.inventory} distinct non-athlete public URLs; ${pending.length} new, changed or due for review.`,
  );
  if (!candidates.length) return result;
  for (let offset = 0; offset < candidates.length; offset += batchSize) {
    if (offset > 0 && Date.now() - startedAt >= maxDurationMs) {
      result.paused = true;
      log("Time budget reached; accepted progress is saved for the next run.");
      break;
    }
    const batch = candidates.slice(offset, offset + batchSize);
    const robots = await getText(`${origin}/robots.txt`, boundedFetch, /\btext\/plain\b/i);
    const eligible = [];
    let cursor = 0;
    await Promise.all(
      Array.from({ length: Math.min(4, batch.length) }, async () => {
        while (cursor < batch.length) {
          const entry = batch[cursor++];
          try {
            assertRobotsAllowed(robots, [entry.url]);
            await assertPublicPageReady(entry.url, boundedFetch);
            eligible.push(entry);
          } catch (error) {
            result.held.push({ url: entry.url, reason: error.message });
          }
          result.checked++;
        }
      }),
    );
    // Held pages remain pending. They are never submitted or given an accepted checkpoint.
    if (!checkOnly && eligible.length) {
      assert(
        typeof keyFile === "string" && /^[a-zA-Z0-9-]+\.txt$/.test(keyFile),
        "Invalid ownership filename",
      );
      assert(typeof key === "string" && /^[a-zA-Z0-9-]{8,128}$/.test(key), "Invalid ownership key");
      const keyLocation = `${origin}/${keyFile}`;
      assert.equal(
        (await getText(keyLocation, boundedFetch, /\btext\/plain\b/i)).trim(),
        key,
        "Ownership verification failed",
      );
      // Re-read current membership and page permissions immediately before submission.
      const membership = new Map();
      const currentIndex = sitemapEntries(
        await getText(`${origin}/sitemap.xml`, boundedFetch, /\bxml\b/i),
        true,
      ).map((e) => e.url);
      for (const sitemap of new Set(eligible.map((e) => e.sitemap))) {
        assert(currentIndex.includes(sitemap), "Sitemap removed during validation");
        membership.set(
          sitemap,
          new Set(
            sitemapEntries(await getText(sitemap, boundedFetch, /\bxml\b/i)).map((e) => e.url),
          ),
        );
      }
      const currentRobots = await getText(`${origin}/robots.txt`, boundedFetch, /\btext\/plain\b/i);
      assertRobotsAllowed(
        currentRobots,
        eligible.map((e) => e.url),
      );
      let recheck = 0;
      await Promise.all(
        Array.from({ length: Math.min(4, eligible.length) }, async () => {
          while (recheck < eligible.length) {
            const entry = eligible[recheck++];
            assert(membership.get(entry.sitemap).has(entry.url), "Page removed from live sitemap");
            await assertPublicPageReady(entry.url, boundedFetch);
          }
        }),
      );
      const response = await boundedFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(origin).host,
          key,
          keyLocation,
          urlList: eligible.map((e) => e.url),
        }),
        signal: AbortSignal.timeout(60000),
      });
      assert(
        !response.redirected && (!response.url || response.url === endpoint),
        "Unexpected receipt destination",
      );
      assert([200, 202].includes(response.status), `IndexNow returned HTTP ${response.status}`);
      for (const entry of eligible)
        nextState.accepted[entry.url] = {
          at: new Date(now).toISOString(),
          lastmod: entry.lastmod,
          status: response.status,
        };
      await save(nextState);
      result.submitted += eligible.length;
      result.receipts.push({ count: eligible.length, status: response.status });
      log(`IndexNow received ${eligible.length} public URLs (HTTP ${response.status}).`);
    }
    log(
      `Checked ${result.checked}/${candidates.length}; submitted ${result.submitted}; held ${result.held.length}.`,
    );
  }
  result.pending -= result.submitted;
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    assert(
      args.every(
        (a) =>
          ["--submit", "--check"].includes(a) ||
          /^--(?:max-urls|state-file|report-file)=.+$/.test(a),
      ),
      "Unsupported option",
    );
    assert(!(args.includes("--submit") && args.includes("--check")), "Choose check or submit");
    const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
    const stateFile = value("state-file");
    let state;
    if (stateFile) {
      try {
        state = JSON.parse(await readFile(stateFile, "utf8"));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    const keyFile = (
      await readFile(new URL("./indexnow-key-file.txt", import.meta.url), "utf8")
    ).trim();
    const key = (await readFile(new URL(`../public/${keyFile}`, import.meta.url), "utf8")).trim();
    const deadline = AbortSignal.timeout(25 * 60 * 1000);
    const result = await notifyPublicPages({
      state,
      keyFile,
      key,
      checkOnly: !args.includes("--submit"),
      maxUrls: Number(value("max-urls") ?? 500),
      fetchImpl: (url, options = {}) =>
        fetch(url, {
          ...options,
          signal: AbortSignal.any([deadline, ...(options.signal ? [options.signal] : [])]),
        }),
      save: async (checkpoint) => {
        if (!stateFile) return;
        await mkdir(dirname(stateFile), { recursive: true });
        await writeFile(`${stateFile}.tmp`, `${JSON.stringify(checkpoint)}\n`);
        await rename(`${stateFile}.tmp`, stateFile);
      },
    });
    const message = `${result.checked} public URLs checked; ${result.submitted} submitted; ${result.held.length} held; ${result.pending} remain due. Receipt does not guarantee crawling or indexing.`;
    console.log(message);
    for (const held of result.held.slice(0, 20)) console.log(`HELD ${held.url}: ${held.reason}`);
    if (value("report-file")) {
      await mkdir(dirname(value("report-file")), { recursive: true });
      await writeFile(value("report-file"), `${JSON.stringify(result, null, 2)}\n`);
    }
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `${message}\n\nExisting athlete-profile and running-guide notification jobs remain active.\n`,
      );
    if (result.held.length)
      console.log("Held URLs need review; their publication settings were not changed.");
  } catch (error) {
    console.error(`Public-page notification stopped: ${error.message}`);
    process.exitCode = 1;
  }
}
