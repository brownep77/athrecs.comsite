// Notify only the published running-guide registry. Dry-run is the default.
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { appendFile, readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import path from "node:path";
import { setTimeout as pause } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { load } from "cheerio";
import {
  ATHLETE_SEARCH_ORIGIN as origin,
  assertAthleteSearchReady,
} from "./lib/athlete-search-readiness.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const endpoint = "https://api.indexnow.org/indexnow";
const hubUrl = `${origin}/running/guides`;
const sitemapUrl = `${origin}/sitemaps/pages.xml`;
const maximumUrls = 300;

function publicUrl(value, fragments = false) {
  const url = new URL(value);
  assert.equal(url.origin, origin, "Only production AthRecs URLs are allowed");
  assert(!url.username && !url.password && !url.search, "Unexpected URL attributes");
  assert(fragments || !url.hash, "Submit canonical pages, not fragments");
  assert.equal(url.href, value, "Use the exact canonical URL");
  return url;
}

function validateScope(scope) {
  assert.equal(scope.hubUrl, hubUrl, "Unexpected guide hub");
  assert(scope.urls.length > 0 && scope.urls.length <= maximumUrls, "Invalid guide batch size");
  assert.equal(new Set(scope.urls).size, scope.urls.length, "Duplicate canonical guide URL");
  assert(scope.urls.includes(hubUrl), "The guide hub must be included");
  for (const value of scope.urls) {
    const pathname = publicUrl(value).pathname;
    assert(
      /^\/running\/(?:guides|superhalfs|race-series|road|trail|fell|cross-country|uk-road-ultramarathons)$/.test(
        pathname,
      ) ||
        /^\/running\/[a-z0-9-]+-marathons$/.test(pathname) ||
        /^\/running\/(?:races|ultramarathons)\/[a-z0-9-]+$/.test(pathname) ||
        /^\/running\/series\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname) ||
        ["/running", "/site-map"].includes(pathname),
      "URL is outside the running-guide notification scope",
    );
  }
  assert(scope.hubLinks.length > 0, "Expected guide links are required");
  for (const value of scope.hubLinks) {
    const url = publicUrl(value, true);
    url.hash = "";
    assert(scope.urls.includes(url.href), "Hub link is outside the canonical guide batch");
  }
}

export async function runningGuideSearchScope() {
  // Same Node 24 source-import pattern used by the existing guide verifier.
  const hooks = registerHooks({
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
          target = existsSync(`${target}.ts`) ? `${target}.ts` : path.join(target, "index.ts");
        return nextResolve(pathToFileURL(target).href, context);
      }
      return nextResolve(specifier, context);
    },
  });
  try {
    const [
      full,
      halves,
      fullCountries,
      halfCountries,
      ultras,
      series,
      superhalfs,
      hub,
      editorialSeries,
    ] = await Promise.all([
      import("../src/data/road-marathons/index.ts"),
      import("../src/data/road-half-marathons/index.ts"),
      import("../src/data/road-marathons/countries.ts"),
      import("../src/data/road-half-marathons/countries.ts"),
      import("../src/lib/running/road-ultras.ts"),
      import("../src/data/race-collections.ts"),
      import("../src/data/superhalfs.ts"),
      import("../src/lib/running/guide-directory.ts"),
      import("../src/data/running-series-guides.ts"),
    ]);
    assert.equal(`${origin}${hub.RUNNING_GUIDES_PATH}`, hubUrl);
    const countryPaths = [
      ...fullCountries.MARATHON_COUNTRIES,
      ...halfCountries.HALF_MARATHON_COUNTRIES,
    ].map((country) => `/running/${country.guide}`);
    countryPaths.push(ultras.ULTRA_GUIDE_PATH);
    const racePaths = [...full.ROAD_MARATHONS, ...halves.ROAD_HALF_MARATHONS].map(
      (race) => `/running/races/${race.slug}`,
    );
    racePaths.push(...ultras.ROAD_ULTRAS.map((race) => ultras.ultraPath(race.slug)));
    assert(countryPaths.length > 0 && racePaths.length > 0, "Empty guide registry");
    const editorialSeriesPaths = editorialSeries.RUNNING_SERIES_GUIDES.map(
      (guide) => `/running/series/${guide.slug}`,
    );
    assert(editorialSeriesPaths.length >= 8, "The eight new series guides must be present");
    assert.equal(
      new Set(editorialSeriesPaths).size,
      editorialSeriesPaths.length,
      "Duplicate series guide URL",
    );
    const hubLinks = [
      ...countryPaths,
      ...racePaths,
      superhalfs.SUPERHALFS_PATH,
      ...editorialSeriesPaths,
      ...series.raceGroupDefinitions.map((group) => `/running/race-series#${group.code}`),
    ].map((pathname) => `${origin}${pathname}`);
    const canonicalLinks = hubLinks.map((value) => {
      const url = publicUrl(value, true);
      url.hash = "";
      return url.href;
    });
    const scope = {
      hubUrl,
      hubLinks,
      urls: [
        ...new Set([
          hubUrl,
          ...canonicalLinks,
          ...[
            "/running",
            "/running/road",
            "/running/trail",
            "/running/fell",
            "/running/cross-country",
            "/site-map",
          ].map((pathname) => `${origin}${pathname}`),
        ]),
      ].sort(),
      countryGuides: countryPaths.length,
      raceGuides: racePaths.length,
      seriesGuides: editorialSeriesPaths.length,
    };
    validateScope(scope);
    return scope;
  } finally {
    hooks.deregister();
  }
}

async function readPublicText(url, fetchImpl, contentType) {
  publicUrl(url);
  const response = await fetchImpl(url, {
    redirect: "error",
    headers: { "Cache-Control": "no-cache" },
  });
  assert.equal(response.status, 200, `HTTP ${response.status} for ${url}`);
  assert(
    !response.redirected && (!response.url || response.url === url),
    `Unexpected redirect: ${url}`,
  );
  assert.match(
    response.headers.get("content-type") ?? "",
    contentType,
    `Unexpected content type: ${url}`,
  );
  const text = await response.text();
  assert(text.length <= 10_000_000, "Public response exceeds the size limit");
  return text;
}

function assertSitemapCoverage(xml, urls) {
  assert(!/<!DOCTYPE|<!ENTITY/i.test(xml), "Unsafe sitemap document declaration");
  const $ = load(xml, { xmlMode: true });
  const document = $.root().children();
  assert.equal(document.length, 1, "Expected one sitemap root");
  assert.equal(document[0].name, "urlset", "Expected a public page sitemap");
  assert.equal(document.attr("xmlns"), "http://www.sitemaps.org/schemas/sitemap/0.9");
  const members = new Set(
    document
      .children()
      .toArray()
      .map((entry) => {
        assert.equal(entry.name, "url", "Invalid sitemap entry");
        const loc = $(entry).children("loc");
        assert.equal(loc.length, 1, "Each sitemap entry needs one location");
        assert.equal(loc.children().length, 0, "Sitemap location must be text");
        const value = loc.text().trim();
        publicUrl(value);
        return value;
      }),
  );
  for (const url of urls)
    assert(members.has(url), `Guide is absent from the live page sitemap: ${url}`);
}

function assertRobotsAllowed(text, urls) {
  assert(!/<(?:html|!doctype)/i.test(text), "Expected a robots.txt document");
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
      assert(value.startsWith("/"), "Unexpected robots path rule");
      const anchored = value.endsWith("$");
      const pattern = (anchored ? value.slice(0, -1) : value)
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*");
      group.rules.push({
        allow: name === "allow",
        length: value.replace(/[*$]/g, "").length,
        match: new RegExp(`^${pattern}${anchored ? "$" : ""}`),
      });
    }
  }
  assert(groups.length > 0, "No robots user-agent policy found");
  // Check wildcard policy and every explicitly named crawler; fail closed.
  for (const agent of new Set(["*", ...groups.flatMap((entry) => entry.agents)])) {
    const applicable = groups.filter((entry) => entry.agents.includes(agent));
    const rules = applicable.flatMap((entry) => entry.rules);
    for (const url of urls) {
      const matching = rules.filter((rule) => rule.match.test(new URL(url).pathname));
      const longest = Math.max(-1, ...matching.map((rule) => rule.length));
      assert(
        !matching.length || matching.some((rule) => rule.length === longest && rule.allow),
        `robots.txt blocks a guide for ${agent}: ${url}`,
      );
    }
  }
}

async function assertPublishedHub(scope, fetchImpl, expectedRelease) {
  let html;
  await assertAthleteSearchReady(scope.hubUrl, async (url, settings) => {
    const response = await fetchImpl(url, settings);
    html = await response.clone().text();
    return response;
  });
  const $ = load(html);
  if (expectedRelease) {
    const marker = $('head meta[name="athrecs-release"]');
    assert.equal(marker.length, 1, "Published hub has no unique release marker");
    assert.equal(
      marker.attr("content"),
      expectedRelease,
      "The expected guide release is not deployed",
    );
  }
  const links = new Set(
    $("main a[href]")
      .toArray()
      .filter(
        (element) =>
          $(element).text().trim() &&
          !$(element).closest("[hidden], [aria-hidden=true], template").length &&
          !($(element).attr("rel") ?? "").toLowerCase().split(/\s+/).includes("nofollow"),
      )
      .map((element) => new URL($(element).attr("href"), origin).href),
  );
  for (const url of scope.hubLinks)
    assert(links.has(url), `Published hub is missing a crawlable guide link: ${url}`);
}

async function waitForHub(
  scope,
  fetchImpl,
  { waitMs, expectedRelease, log, sleep = pause, now = Date.now },
) {
  assert(
    Number.isSafeInteger(waitMs) && waitMs >= 0 && waitMs <= 720000,
    "Invalid publication wait",
  );
  const end = now() + waitMs;
  let attempt = 0;
  for (;;) {
    try {
      await assertPublishedHub(scope, fetchImpl, expectedRelease);
      return;
    } catch (error) {
      if (now() >= end)
        throw new Error(`Published guide hub is not ready; no URLs submitted. ${error.message}`);
      attempt++;
      if (attempt === 1 || attempt % 3 === 0)
        log(`Waiting for the complete published guide hub (attempt ${attempt}).`);
      await sleep(Math.min(20000 * attempt, 60000, end - now()));
    }
  }
}

async function validatePublishedGuides(scope, fetchImpl) {
  assertSitemapCoverage(await readPublicText(sitemapUrl, fetchImpl, /\bxml\b/i), scope.urls);
  assertRobotsAllowed(
    await readPublicText(`${origin}/robots.txt`, fetchImpl, /\btext\/plain\b/i),
    scope.urls,
  );
  let next = 0;
  let failure;
  await Promise.all(
    Array.from({ length: Math.min(12, scope.urls.length) }, async () => {
      while (!failure && next < scope.urls.length) {
        try {
          await assertAthleteSearchReady(scope.urls[next++], fetchImpl);
        } catch (error) {
          failure ??= error;
        }
      }
    }),
  );
  if (failure) throw failure;
}

export async function notifyRunningGuideSearch({
  scope,
  checkOnly = true,
  waitMs = 0,
  expectedRelease,
  fetchImpl = fetch,
  keyFile,
  key,
  log = console.log,
  sleep,
  now,
} = {}) {
  validateScope(scope);
  assert(
    expectedRelease === undefined || /^[a-f0-9]{40}$/.test(expectedRelease),
    "Invalid expected release",
  );
  const deadline = AbortSignal.timeout(24 * 60 * 1000);
  const boundedFetch = (url, settings = {}) => {
    const method = settings.method ?? "GET";
    assert(
      method === "GET" || (method === "POST" && url === endpoint),
      "Unexpected network mutation",
    );
    if (method === "GET") publicUrl(url);
    const headers = new Headers(settings.headers);
    assert(
      !headers.has("authorization") && !headers.has("cookie"),
      "Only anonymous public reads are allowed",
    );
    return fetchImpl(url, {
      ...settings,
      redirect: "error",
      signal: AbortSignal.any([
        deadline,
        AbortSignal.timeout(30000),
        ...(settings.signal ? [settings.signal] : []),
      ]),
    });
  };
  await waitForHub(scope, boundedFetch, { waitMs, expectedRelease, log, sleep, now });
  await validatePublishedGuides(scope, boundedFetch);
  if (checkOnly) return { checked: scope.urls.length, submitted: 0, status: null };
  assert(
    typeof keyFile === "string" && /^[a-zA-Z0-9-]+\.txt$/.test(keyFile),
    "Invalid ownership filename",
  );
  assert(typeof key === "string" && /^[a-zA-Z0-9-]{8,128}$/.test(key), "Invalid ownership key");
  const keyLocation = `${origin}/${keyFile}`;
  try {
    const ownership = await boundedFetch(keyLocation);
    assert(
      ownership.status === 200 &&
        !ownership.redirected &&
        (!ownership.url || ownership.url === keyLocation),
    );
    assert((await ownership.text()).trim() === key);
  } catch {
    throw new Error("Deployed IndexNow ownership verification failed; no URLs submitted.");
  }
  // Revalidate publication, membership and permissions immediately before POST.
  await assertPublishedHub(scope, boundedFetch, expectedRelease);
  await validatePublishedGuides(scope, boundedFetch);
  const response = await boundedFetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(origin).host, key, keyLocation, urlList: scope.urls }),
  });
  assert(
    !response.redirected && (!response.url || response.url === endpoint),
    "Unexpected IndexNow response destination",
  );
  assert(
    [200, 202].includes(response.status),
    `IndexNow returned HTTP ${response.status}; receipt is not confirmed`,
  );
  return { checked: scope.urls.length, submitted: scope.urls.length, status: response.status };
}

export async function verifyRunningGuideNotification() {
  const race = `${origin}/running/races/synthetic-race`;
  const country = `${origin}/running/uk-marathons`;
  const seriesGuide = `${origin}/running/series/synthetic-series`;
  const scope = {
    hubUrl,
    urls: [hubUrl, country, race, seriesGuide],
    hubLinks: [country, race, seriesGuide],
  };
  const keyFile = "synthetic-guide-key.txt";
  const key = "synthetic-guide-key";
  const expectedRelease = "a".repeat(40);
  const html = (url, robots = "index, follow") =>
    `<html><head><meta name="robots" content="${robots}"><meta name="athrecs-release" content="${expectedRelease}"><link rel="canonical" href="${url}"></head><body><main>${scope.hubLinks.map((link) => `<a href="${link}">Guide</a>`).join("")}</main></body></html>`;
  const xml = (urls) =>
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${url}</loc></url>`).join("")}</urlset>`;
  const response = (body, type = "text/html", status = 200, headers = {}) =>
    new Response(body, { status, headers: { "Content-Type": type, ...headers } });
  function fixture(overrides = {}) {
    const calls = [];
    const routes = {
      [sitemapUrl]: () => response(xml(scope.urls), "application/xml"),
      [`${origin}/robots.txt`]: () =>
        response("User-agent: *\nAllow: /\nDisallow: /admin", "text/plain"),
      [`${origin}/${keyFile}`]: () => response(key, "text/plain"),
      ...Object.fromEntries(scope.urls.map((url) => [url, () => response(html(url))])),
      [endpoint]: () => response("", "text/plain", 200),
      ...overrides,
    };
    return {
      calls,
      fetchImpl: async (url, settings) => {
        calls.push({ url, ...settings });
        assert.equal(settings.redirect, "error");
        const headers = new Headers(settings.headers);
        assert(!headers.has("authorization") && !headers.has("cookie"));
        assert(routes[url], "Unexpected network destination");
        return routes[url]();
      },
    };
  }
  let checks = 0;
  const run = (test, options = {}) =>
    notifyRunningGuideSearch({
      scope,
      keyFile,
      key,
      expectedRelease,
      log() {},
      ...test,
      ...options,
    });
  const dry = fixture();
  assert.equal((await run(dry)).submitted, 0);
  assert(!dry.calls.some((call) => call.method === "POST"));
  checks++;
  for (const status of [200, 202]) {
    const test = fixture({ [endpoint]: () => response("", "text/plain", status) });
    assert.deepEqual(await run(test, { checkOnly: false }), { checked: 4, submitted: 4, status });
    const posts = test.calls.filter((call) => call.method === "POST");
    assert.equal(posts.length, 1);
    assert.deepEqual(JSON.parse(posts[0].body), {
      host: "www.athrecs.com",
      key,
      keyLocation: `${origin}/${keyFile}`,
      urlList: scope.urls,
    });
    checks++;
  }
  const failures = [
    { [hubUrl]: () => response(html(hubUrl).replace(expectedRelease, "b".repeat(40))) },
    {
      [hubUrl]: () =>
        response(
          html(hubUrl).replace(`<meta name="athrecs-release" content="${expectedRelease}">`, ""),
        ),
    },
    { [race]: () => response(html(race, "noindex, follow")) },
    { [seriesGuide]: () => response(html(seriesGuide, "noindex, follow")) },
    { [race]: () => response(html(country)) },
    { [race]: () => response(html(race), "text/html", 200, { "X-Robots-Tag": "noindex" }) },
    { [race]: () => response("", "text/html", 302, { Location: "/join" }) },
    { [sitemapUrl]: () => response(xml([hubUrl, country, seriesGuide]), "application/xml") },
    { [`${origin}/robots.txt`]: () => response("User-agent: *\nDisallow: /running", "text/plain") },
    {
      [`${origin}/robots.txt`]: () =>
        response(
          "User-agent: *\nAllow: /\nUser-agent: Bingbot\nDisallow: /*synthetic-race$",
          "text/plain",
        ),
    },
    { [`${origin}/${keyFile}`]: () => response("wrong-ownership-key", "text/plain") },
    { [hubUrl]: () => response(html(hubUrl).replace(`<a href="${race}">Guide</a>`, "")) },
  ];
  for (const overrides of failures) {
    const test = fixture(overrides);
    await assert.rejects(run(test, { checkOnly: false }));
    assert(!test.calls.some((call) => call.method === "POST"));
    checks++;
  }
  const noMarker = fixture({
    [hubUrl]: () =>
      response(
        html(hubUrl).replace(`<meta name="athrecs-release" content="${expectedRelease}">`, ""),
      ),
  });
  assert.equal((await run(noMarker, { expectedRelease: undefined })).checked, 4);
  checks++;
  const allowed = fixture({
    [`${origin}/robots.txt`]: () =>
      response(
        "User-agent: *\nDisallow: /\nAllow: /running/\nUser-agent: Bingbot\nDisallow:",
        "text/plain",
      ),
  });
  assert.equal((await run(allowed)).checked, 4);
  checks++;
  let sitemapReads = 0;
  const changed = fixture({
    [sitemapUrl]: () =>
      response(xml(++sitemapReads === 1 ? scope.urls : [hubUrl]), "application/xml"),
  });
  await assert.rejects(run(changed, { checkOnly: false }));
  assert(!changed.calls.some((call) => call.method === "POST"));
  checks++;
  const rejected = fixture({ [endpoint]: () => response("", "text/plain", 429) });
  await assert.rejects(run(rejected, { checkOnly: false }), /HTTP 429/);
  assert.equal(rejected.calls.filter((call) => call.method === "POST").length, 1);
  checks++;
  for (const forbidden of [
    `${origin}/admin`,
    `${race}?private=1`,
    "https://example.org/running/guides",
  ]) {
    const test = fixture();
    await assert.rejects(run(test, { scope: { ...scope, urls: [...scope.urls, forbidden] } }));
    assert.equal(test.calls.length, 0);
    checks++;
  }
  let clock = 0;
  let hubReads = 0;
  const pending = fixture({
    [hubUrl]: () =>
      ++hubReads === 1 ? response("Pending", "text/html", 404) : response(html(hubUrl)),
  });
  assert.equal(
    (
      await run(pending, {
        waitMs: 1000,
        now: () => clock,
        sleep: async (ms) => {
          clock += ms;
        },
      })
    ).checked,
    4,
  );
  checks++;
  clock = 0;
  const unavailable = fixture({ [hubUrl]: () => response("Pending", "text/html", 404) });
  await assert.rejects(
    run(unavailable, {
      waitMs: 1000,
      now: () => clock,
      sleep: async (ms) => {
        clock += ms;
      },
    }),
    /not ready/,
  );
  assert(!unavailable.calls.some((call) => call.method === "POST"));
  checks++;
  return checks;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    assert(
      args.every(
        (arg) =>
          ["--check", "--submit", "--self-test"].includes(arg) ||
          /^--wait-for-hub=\d+$/.test(arg) ||
          /^--expected-release=[a-f0-9]{40}$/.test(arg),
      ),
      "Supported options: --check --submit --self-test --wait-for-hub=SECONDS --expected-release=SHA",
    );
    assert(!(args.includes("--check") && args.includes("--submit")), "Choose check or submit");
    if (args.includes("--self-test")) {
      assert.equal(args.length, 1, "Run self-tests separately from live operations");
      console.log(
        `PASS: ${await verifyRunningGuideNotification()} running-guide notification safeguard checks; no live requests.`,
      );
    } else {
      const scope = await runningGuideSearchScope();
      const checkOnly = !args.includes("--submit");
      const expectedRelease = args
        .find((arg) => arg.startsWith("--expected-release="))
        ?.split("=")[1];
      if (!checkOnly && process.env.CI) {
        assert(
          expectedRelease && expectedRelease === process.env.GITHUB_SHA,
          "CI submission requires the current GITHUB_SHA release marker",
        );
      }
      let keyFile, key;
      if (!checkOnly) {
        try {
          keyFile = (
            await readFile(path.join(root, "scripts/indexnow-key-file.txt"), "utf8")
          ).trim();
          assert(/^[a-zA-Z0-9-]+\.txt$/.test(keyFile));
          key = (await readFile(path.join(root, "public", keyFile), "utf8")).trim();
        } catch {
          throw new Error("The local IndexNow ownership files could not be read safely.");
        }
      }
      const waitMs =
        Number(args.find((arg) => arg.startsWith("--wait-for-hub="))?.split("=")[1] ?? 0) * 1000;
      console.log(
        `Checking ${scope.urls.length} canonical pages: hub, ${scope.countryGuides} country collections, ${scope.raceGuides} race guides, ${scope.seriesGuides} new series guides and updated discovery pages.`,
      );
      const result = await notifyRunningGuideSearch({
        scope,
        checkOnly,
        waitMs,
        expectedRelease,
        keyFile,
        key,
      });
      const message = checkOnly
        ? `${result.checked} public URLs passed. Read-only check; no URLs submitted.`
        : `IndexNow received ${result.submitted} public URLs (HTTP ${result.status}${result.status === 202 ? "; ownership validation pending" : ""}). Receipt does not guarantee crawling or indexing.`;
      console.log(message);
      if (process.env.GITHUB_STEP_SUMMARY)
        await appendFile(
          process.env.GITHUB_STEP_SUMMARY,
          `### Running-guide search notification\n\n${message}\n\nChecked at ${new Date().toISOString()}.\n`,
        );
      if (process.env.GITHUB_OUTPUT)
        await appendFile(
          process.env.GITHUB_OUTPUT,
          `count=${result.submitted}\nchecked=${result.checked}\nstatus=${result.status ?? "check-only"}\n`,
        );
    }
  } catch (error) {
    console.error(`Running-guide notification stopped: ${error.message}`);
    process.exitCode = 1;
  }
}
