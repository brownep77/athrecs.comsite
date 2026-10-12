import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { notifyAthleteSearch, runAthleteSearchBatches } from "./submit-athlete-indexnow.mjs";
import { ATHLETE_SEARCH_ORIGIN as origin } from "./lib/athlete-search-readiness.mjs";

const profile = `${origin}/athletes/search-test`;
const other = `${origin}/athletes/second-test`;
const shard = `${origin}/sitemaps/athletes-1.xml`;
const keyFile = "synthetic-key.txt";
const key = "synthetic-key";
const xml = (urls, index = false) => {
  const root = index ? "sitemapindex" : "urlset";
  const entry = index ? "sitemap" : "url";
  return `<${root} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<${entry}><loc>${url}</loc></${entry}>`).join("")}</${root}>`;
};
const html = (url = profile, robots = "Follow, INDEX", extra = "") =>
  `<html><head><meta content='${robots}' name='ROBOTS'><link href='${url}' rel='canonical'>${extra}</head><body>Approved synthetic public profile</body></html>`;
const response = (body, type = "application/xml", status = 200, headers = {}) =>
  new Response(body, { status, headers: { "content-type": type, ...headers } });

function fixture(overrides = {}) {
  const calls = [];
  const routes = {
    [`${origin}/sitemap.xml`]: () => response(xml([shard], true)),
    [shard]: () => response(xml([profile, profile])),
    [profile]: () => response(html(), "text/html"),
    [other]: () => response(html(other), "text/html"),
    [`${origin}/${keyFile}`]: () => response(key, "text/plain"),
    ...overrides,
  };
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, ...options });
    assert(!options.headers?.authorization && !options.headers?.cookie, "No authenticated reads");
    if (url === "https://api.indexnow.org/indexnow")
      return routes[url]?.() ?? response("", "text/plain", 202);
    assert.equal(
      options.redirect,
      "error",
      "Do not follow redirects into login/preview/other hosts",
    );
    assert(routes[url], `Unexpected fetch ${url}`);
    return routes[url]();
  };
  return { fetchImpl, calls, posts: () => calls.filter((call) => call.method === "POST") };
}

const empty = fixture({
  [`${origin}/sitemap.xml`]: () => response(xml([`${origin}/sitemaps/pages.xml`], true)),
});
const skipped = await notifyAthleteSearch({ ...empty });
assert.equal(skipped.ready, false);
assert.equal(skipped.submitted, 0);
assert.equal(
  empty.calls.length,
  1,
  "No hard-coded athlete probe or ownership request when no candidates exist",
);
assert.equal(empty.posts().length, 0);
const emptyShard = fixture({ [shard]: () => response(xml([])) });
assert.equal((await notifyAthleteSearch(emptyShard)).ready, false);

const dry = fixture();
assert.equal((await notifyAthleteSearch({ ...dry, checkOnly: true })).ready, true);
assert.equal(dry.posts().length, 0);
assert(!dry.calls.some((call) => call.url.endsWith(keyFile)));
let timeoutReads = 0;
const recoveredSitemap = fixture({
  [`${origin}/sitemap.xml`]: () => {
    if (++timeoutReads === 1) throw new DOMException("Slow sitemap", "TimeoutError");
    return response(xml([shard], true));
  },
});
assert.equal((await notifyAthleteSearch({ ...recoveredSitemap, checkOnly: true })).ready, true);
assert.equal(timeoutReads, 2, "One bounded retry recovers a timed-out sitemap");
assert.equal(recoveredSitemap.posts().length, 0);
const unavailableSitemap = fixture({
  [shard]: () => {
    throw new DOMException("Slow shard", "TimeoutError");
  },
});
await assert.rejects(
  () => notifyAthleteSearch({ ...unavailableSitemap, keyFile, key }),
  (error) => error.name === "TimeoutError" && error.message.includes(shard),
);
assert.equal(unavailableSitemap.calls.filter((call) => call.url === shard).length, 2);
assert.equal(
  unavailableSitemap.posts().length,
  0,
  "A persistent timeout still prevents submission",
);
const slowProfile = fixture({
  [profile]: () => {
    throw new DOMException("Slow profile", "TimeoutError");
  },
});
await assert.rejects(() => notifyAthleteSearch({ ...slowProfile, keyFile, key }), /search-test/);
assert.equal(slowProfile.calls.filter((call) => call.url === profile).length, 1);
assert.equal(slowProfile.posts().length, 0);
const good = fixture();
const sent = await notifyAthleteSearch({ ...good, keyFile, key });
assert.equal(sent.submitted, 1);
assert.equal(good.posts().length, 1);
assert.deepEqual(JSON.parse(good.posts()[0].body).urlList, [profile]);
assert.equal(
  good.calls.filter((call) => call.url === profile).length,
  2,
  "Recheck at submission time",
);

const blocked = [
  [
    "unavailable sitemap",
    { [`${origin}/sitemap.xml`]: () => response("Unavailable", "text/plain", 503) },
  ],
  [
    "timeout",
    {
      [`${origin}/sitemap.xml`]: () => {
        throw new Error("timeout");
      },
    },
  ],
  [
    "HTML login instead of sitemap",
    { [`${origin}/sitemap.xml`]: () => response("<html>Sign in</html>", "text/html") },
  ],
  ["malformed sitemap", { [`${origin}/sitemap.xml`]: () => response("not a sitemap") }],
  ["empty index", { [`${origin}/sitemap.xml`]: () => response(xml([], true)) }],
  [
    "foreign sitemap",
    {
      [`${origin}/sitemap.xml`]: () =>
        response(xml(["https://example.test/sitemaps/athletes-1.xml"], true)),
    },
  ],
  ["missing advertised shard", { [shard]: () => response("Missing", "text/plain", 404) }],
  ["foreign profile", { [shard]: () => response(xml(["https://example.test/athletes/test"])) }],
  ["non-profile URL", { [shard]: () => response(xml([`${origin}/admin/athletes`])) }],
  ["noncanonical query", { [shard]: () => response(xml([`${profile}?preview=true`])) }],
  [
    "HTTP noindex overrides permissive HTML",
    {
      [profile]: () =>
        response(html(), "text/html", 200, { "X-Robots-Tag": "noindex, nofollow, noarchive" }),
    },
  ],
  ["meta noindex", { [profile]: () => response(html(profile, "noindex, follow"), "text/html") }],
  [
    "conflicting metadata",
    {
      [profile]: () =>
        response(
          html(profile, "index, follow", '<meta name="robots" content="noindex">'),
          "text/html",
        ),
    },
  ],
  [
    "crawler-specific restriction",
    {
      [profile]: () =>
        response(
          html(profile, "index, follow", '<meta name="bingbot" content="none">'),
          "text/html",
        ),
    },
  ],
  [
    "missing explicit indexing permission",
    { [profile]: () => response(html(profile, ""), "text/html") },
  ],
  ["canonical mismatch", { [profile]: () => response(html(other), "text/html") }],
  ["private or unpublished", { [profile]: () => response("Denied", "text/html", 403) }],
  ["server error", { [profile]: () => response("Unavailable", "text/html", 500) }],
  [
    "sign-in redirect",
    { [profile]: () => response("", "text/html", 302, { Location: "/sign-in" }) },
  ],
  ["ownership mismatch", { [`${origin}/${keyFile}`]: () => response("wrong-key", "text/plain") }],
  [
    "late invalid profile prevents partial submission",
    {
      [shard]: () => response(xml([profile, other])),
      [other]: () => response(html(other, "noindex"), "text/html"),
    },
  ],
];
for (const [label, overrides] of blocked) {
  const test = fixture(overrides);
  await assert.rejects(() => notifyAthleteSearch({ ...test, keyFile, key }), undefined, label);
  assert.equal(test.posts().length, 0, `${label}: no URLs submitted`);
}
let reads = 0;
const withdrawn = fixture({ [shard]: () => response(xml(++reads === 1 ? [profile] : [])) });
await assert.rejects(
  () => notifyAthleteSearch({ ...withdrawn, keyFile, key }),
  /changed during validation/,
);
assert.equal(withdrawn.posts().length, 0);
const catalogue = Array.from({ length: 37 }, (_, i) => `${origin}/athletes/synthetic-${i}`);
let active = 0;
let peak = 0;
let checked = 0;
const paginated = fixture({
  [shard]: () => response(xml(catalogue)),
  ...Object.fromEntries(
    catalogue.map((url) => [
      url,
      async () => {
        active++;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
        checked++;
        return response(html(url), "text/html");
      },
    ]),
  ),
});
assert.equal(
  (await notifyAthleteSearch({ ...paginated, keyFile, key })).submitted,
  catalogue.length,
);
assert.equal(checked, catalogue.length * 2, "Every URL is checked and revalidated");
assert(peak > 1 && peak <= 12, "Validation concurrency is bounded");
assert.deepEqual(JSON.parse(paginated.posts()[0].body).urlList, catalogue);

const temporary = await mkdtemp(join(tmpdir(), "athrecs-search-checkpoint-"));
try {
  const stateFile = join(temporary, "cursor.json");
  const secondShard = `${origin}/sitemaps/athletes-2.xml`;
  const urls = catalogue.slice(0, 7);
  const batchFixture = (overrides = {}) =>
    fixture({
      [`${origin}/sitemap.xml`]: () => response(xml([shard, secondShard], true)),
      [shard]: () => response(xml(urls.slice(0, 4))),
      [secondShard]: () => response(xml(urls.slice(4))),
      ...Object.fromEntries(urls.map((url) => [url, () => response(html(url), "text/html")])),
      ...overrides,
    });
  const options = { key, keyFile, stateFile, batchSize: 2 };
  const first = batchFixture();
  assert.equal((await runAthleteSearchBatches({ ...first, ...options })).submitted, 2);
  assert.deepEqual(JSON.parse(first.posts()[0].body).urlList, urls.slice(0, 2));
  assert(
    !first.calls.some((call) => call.url === secondShard),
    "Do not fetch unselected sitemap shards",
  );
  const checkpoint = await readFile(stateFile, "utf8");
  assert.equal(JSON.parse(checkpoint).afterUrl, urls[1]);

  const preview = batchFixture();
  const checked = await runAthleteSearchBatches({
    ...preview,
    ...options,
    checkOnly: true,
    maxBatches: 10,
  });
  assert.equal(checked.checked, 2);
  assert.equal(checked.batches, 1, "Read-only probes stay bounded");
  assert.equal(preview.posts().length, 0);
  assert.equal(
    await readFile(stateFile, "utf8"),
    checkpoint,
    "Read-only checks cannot advance state",
  );

  const failed = batchFixture({
    "https://api.indexnow.org/indexnow": () => response("Retry", "text/plain", 429),
  });
  await assert.rejects(() => runAthleteSearchBatches({ ...failed, ...options }), /HTTP 429/);
  assert.equal(
    await readFile(stateFile, "utf8"),
    checkpoint,
    "Rejected receipts do not advance state",
  );

  const privateNow = batchFixture({
    [urls[2]]: () => response(html(urls[2], "noindex"), "text/html"),
  });
  await assert.rejects(
    () => runAthleteSearchBatches({ ...privateNow, ...options }),
    /Indexing blocked/,
  );
  assert.equal(privateNow.posts().length, 0);
  assert.equal(
    await readFile(stateFile, "utf8"),
    checkpoint,
    "A restored cursor never grants publication permission",
  );

  const resumed = batchFixture();
  const rest = await runAthleteSearchBatches({ ...resumed, ...options, maxBatches: 10 });
  assert.equal(rest.submitted, 5);
  assert.equal(rest.cycleComplete, true);
  assert.deepEqual(
    resumed.posts().flatMap((call) => JSON.parse(call.body).urlList),
    urls.slice(2),
  );
  const nextPass = JSON.parse(await readFile(stateFile, "utf8"));
  assert.equal(nextPass.cycle, 2);
  assert.equal(nextPass.sitemap, shard);
  assert.equal(
    nextPass.afterUrl,
    null,
    "A completed pass stops instead of repeatedly notifying the first batch",
  );

  await writeFile(stateFile, checkpoint);
  const changed = batchFixture({ [shard]: () => response(xml([urls[0], ...urls.slice(2, 4)])) });
  await runAthleteSearchBatches({ ...changed, ...options });
  assert.deepEqual(
    JSON.parse(changed.posts()[0].body).urlList,
    [urls[0], urls[2]],
    "A removed anchor safely replays the shard",
  );

  await rm(stateFile);
  let receipts = 0;
  const interrupted = batchFixture({
    "https://api.indexnow.org/indexnow": () =>
      response("", "text/plain", ++receipts === 1 ? 202 : 503),
  });
  await assert.rejects(
    () => runAthleteSearchBatches({ ...interrupted, ...options, maxBatches: 10 }),
    /HTTP 503/,
  );
  assert.equal(
    await readFile(stateFile, "utf8"),
    checkpoint,
    "Earlier accepted progress survives a later failure",
  );

  const timed = batchFixture();
  const paused = await runAthleteSearchBatches({
    ...options,
    maxDurationMs: 5,
    fetchImpl: async (url, settings) => {
      await new Promise((resolve) => setTimeout(resolve, 15));
      settings.signal.throwIfAborted();
      return timed.fetchImpl(url, settings);
    },
  });
  assert.equal(paused.paused, true);
  assert.equal(paused.submitted, 0);
  assert.equal(
    await readFile(stateFile, "utf8"),
    checkpoint,
    "A time budget pause preserves the last accepted batch",
  );
  assert.equal(timed.posts().length, 0);

  await writeFile(
    stateFile,
    JSON.stringify({ ...nextPass, sitemap: "https://example.test/private.xml" }),
  );
  const corrupt = batchFixture();
  await assert.rejects(
    () => runAthleteSearchBatches({ ...corrupt, ...options }),
    /production AthRecs origin/,
  );
  assert.equal(corrupt.calls.length, 0, "Invalid checkpoints fail before network access");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
console.log(
  `Athlete search notification passed: ${blocked.length} fail-closed cases, withdrawal, deduplication, bounded shards, resumable batches, failed-receipt recovery and read-only checkpoints.`,
);
