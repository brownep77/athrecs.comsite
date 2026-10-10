import assert from "node:assert/strict";
import { notifyAthleteSearch } from "./submit-athlete-indexnow.mjs";
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
    if (url === "https://api.indexnow.org/indexnow") return response("", "text/plain", 202);
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
console.log(
  `Athlete search notification passed: deliberate no-submission, read-only checks, ${blocked.length} fail-closed cases, withdrawal, deduplication, and validated submission.`,
);
