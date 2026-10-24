import assert from "node:assert/strict";
import {
  notifyPublicPages,
  collectInventory,
  publicUrl,
  assertRobotsAllowed,
  validateState,
  origin,
} from "./submit-public-page-indexnow.mjs";
const endpoint = "https://api.indexnow.org/indexnow";
const sitemap = `${origin}/sitemaps/pages.xml`;
const page = `${origin}/about-us`;
const other = `${origin}/running/guides`;
const key = "synthetic-search-key";
const keyFile = `${key}.txt`;
const xml = (urls, index = false) =>
  `<${index ? "sitemapindex" : "urlset"} xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<${index ? "sitemap" : "url"}><loc>${url}</loc></${index ? "sitemap" : "url"}>`).join("")}</${index ? "sitemapindex" : "urlset"}>`;
const html = (url, robots = "index, follow", extra = "") =>
  `<html><head><meta name="robots" content="${robots}"><link rel="canonical" href="${url}">${extra}</head><body><h1>Public content</h1></body></html>`;
const response = (body, type = "text/html", status = 200, headers = {}) =>
  new Response(body, { status, headers: { "content-type": type, ...headers } });
function fixture(overrides = {}) {
  const calls = [];
  const saves = [];
  const routes = {
    [`${origin}/sitemap.xml`]: () => response(xml([sitemap], true), "application/xml"),
    [sitemap]: () => response(xml([page, page, other]), "application/xml"),
    [`${origin}/robots.txt`]: () => response("User-agent: *\nAllow: /", "text/plain"),
    [`${origin}/${keyFile}`]: () => response(key, "text/plain"),
    [page]: () => response(html(page)),
    [other]: () => response(html(other)),
    [endpoint]: () => response("", "text/plain", 200),
    ...overrides,
  };
  const fetchImpl = async (url, options = {}) => {
    calls.push({ url, ...options });
    assert.equal(options.redirect, "error");
    assert(!new Headers(options.headers).has("authorization"));
    assert(!new Headers(options.headers).has("cookie"));
    assert(routes[url], `Unexpected URL ${url}`);
    return routes[url](options);
  };
  return {
    fetchImpl,
    calls,
    saves,
    posts: () => calls.filter((c) => c.method === "POST"),
    save: async (state) => saves.push(structuredClone(state)),
    key,
    keyFile,
    log: () => {},
  };
}
let checks = 0;
const dry = fixture();
const dryResult = await notifyPublicPages(dry);
assert.equal(dryResult.inventory, 2);
assert.equal(dryResult.checked, 2);
assert.equal(dry.posts().length, 0);
assert.equal(dry.saves.length, 0);
checks++;
const happy = fixture();
const sent = await notifyPublicPages({ ...happy, checkOnly: false });
assert.equal(sent.submitted, 2);
assert.equal(happy.posts().length, 1);
assert.equal(happy.saves.length, 1);
assert.equal(JSON.parse(happy.posts()[0].body).urlList.length, 2);
checks++;
const repeated = fixture();
assert.equal(
  (await notifyPublicPages({ ...repeated, checkOnly: false, state: happy.saves[0] })).submitted,
  0,
);
assert.equal(repeated.posts().length, 0);
checks++;
const old = structuredClone(happy.saves[0]);
for (const r of Object.values(old.accepted)) r.at = "2020-01-01T00:00:00Z";
const aged = fixture();
assert.equal((await notifyPublicPages({ ...aged, checkOnly: false, state: old })).submitted, 2);
checks++;
const changed = fixture({
  [sitemap]: () =>
    response(
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${page}</loc><lastmod>2026-10-24</lastmod></url></urlset>`,
      "application/xml",
    ),
});
assert.equal(
  (await notifyPublicPages({ ...changed, checkOnly: false, state: happy.saves[0] })).submitted,
  1,
);
checks++;
for (const blocked of [
  () => response(html(page, "noindex,follow")),
  () => response(html(page, "index,follow", '<meta name="Googlebot" content="noindex">')),
  () => response(html(page), "text/html", 200, { "x-robots-tag": "noindex" }),
  () => response(html(other)),
  () => response(html(page), "text/html", 404),
  () => response("login", "text/html", 302),
  () => response("{}", "application/json"),
  () => response("<html><head></head></html>"),
]) {
  const f = fixture({ [page]: blocked });
  const r = await notifyPublicPages({ ...f, checkOnly: false });
  assert.equal(r.held.length, 1);
  assert.equal(r.submitted, 1);
  assert.deepEqual(JSON.parse(f.posts()[0].body).urlList, [other]);
  assert(!f.saves[0].accepted[page]);
  checks++;
}
const robots = fixture({
  [`${origin}/robots.txt`]: () => response("User-agent: *\nDisallow: /about-us", "text/plain"),
});
assert.equal((await notifyPublicPages({ ...robots, checkOnly: false })).held.length, 1);
checks++;
assertRobotsAllowed("User-agent: *\nDisallow: /running\nAllow: /running/guides$", [other]);
assert.throws(() => assertRobotsAllowed("User-agent: Bingbot\nDisallow: /", [page]));
assert.throws(() => assertRobotsAllowed("<html>login</html>", [page]));
checks++;
for (const url of [
  "https://evil.example/page",
  `${origin}/api/private`,
  `${origin}/admin`,
  `${origin}/brands/manage`,
  `${origin}/%61dmin`,
  `${origin}/%2561dmin`,
  `${origin}/a?token=bad`,
  `${origin}/a#b`,
  `${origin}/a/../b`,
  `${origin}/a%2fb%3fc`,
]) {
  assert.throws(() => publicUrl(url));
  checks++;
}
for (const badXml of [
  xml(["https://evil.example/a"]),
  xml([`${origin}/athletes/private`]),
  xml([`${origin}/api/private`]),
  "<!DOCTYPE urlset><urlset/>",
  '<urlset xmlns="wrong"/>',
]) {
  const f = fixture({ [sitemap]: () => response(badXml, "application/xml") });
  await assert.rejects(() => notifyPublicPages({ ...f, checkOnly: false }));
  assert.equal(f.posts().length, 0);
  checks++;
}
for (const status of [403, 422, 429, 500]) {
  const f = fixture({ [endpoint]: () => response("", "text/plain", status) });
  await assert.rejects(() => notifyPublicPages({ ...f, checkOnly: false }), /IndexNow returned/);
  assert.equal(f.saves.length, 0);
  checks++;
}
const ownership = fixture({ [`${origin}/${keyFile}`]: () => response("wrong-key", "text/plain") });
await assert.rejects(() => notifyPublicPages({ ...ownership, checkOnly: false }), /Ownership/);
assert.equal(ownership.posts().length, 0);
checks++;
let reads = 0;
const revoked = fixture({
  [sitemap]: () => response(xml(++reads === 1 ? [page] : []), "application/xml"),
});
await assert.rejects(
  () => notifyPublicPages({ ...revoked, checkOnly: false }),
  /removed from live sitemap/,
);
assert.equal(revoked.posts().length, 0);
checks++;
let pageReads = 0;
const privateLater = fixture({
  [page]: () => response(html(page, ++pageReads === 1 ? "index,follow" : "noindex")),
});
await assert.rejects(
  () => notifyPublicPages({ ...privateLater, checkOnly: false }),
  /Indexing blocked/,
);
assert.equal(privateLater.posts().length, 0);
checks++;
const partial = fixture();
assert.equal((await notifyPublicPages({ ...partial, checkOnly: false, maxUrls: 1 })).submitted, 1);
const resume = fixture();
assert.equal(
  (await notifyPublicPages({ ...resume, checkOnly: false, state: partial.saves[0] })).submitted,
  1,
);
assert.deepEqual(JSON.parse(resume.posts()[0].body).urlList, [other]);
checks++;
let posts = 0;
const laterFailure = fixture({
  [endpoint]: () => response("", "text/plain", ++posts === 1 ? 200 : 500),
});
await assert.rejects(() => notifyPublicPages({ ...laterFailure, checkOnly: false, batchSize: 1 }));
assert.equal(laterFailure.saves.length, 1);
assert.equal(Object.keys(laterFailure.saves[0].accepted).length, 1);
checks++;
const athleteOnly = fixture({
  [`${origin}/sitemap.xml`]: () =>
    response(xml([`${origin}/sitemaps/athletes-1.xml`], true), "application/xml"),
});
assert.equal((await collectInventory(athleteOnly.fetchImpl)).entries.length, 0);
assert(!athleteOnly.calls.some((c) => c.url.endsWith("/athletes-1.xml")));
checks++;
const family = fixture({
  [`${origin}/sitemap.xml`]: () =>
    response(xml([`${origin}/sitemaps/clubs-1.xml`], true), "application/xml"),
  [`${origin}/sitemaps/clubs-1.xml`]: () => response(xml([page]), "application/xml"),
});
await assert.rejects(() => collectInventory(family.fetchImpl), /family mismatch/);
checks++;
assert.throws(() => validateState({ version: 2, accepted: {} }));
assert.throws(() =>
  validateState({ version: 1, accepted: { [page]: { at: "bad", lastmod: null, status: 200 } } }),
);
assert.throws(() =>
  validateState({
    version: 1,
    accepted: { [page]: { at: new Date().toISOString(), lastmod: null, status: 500 } },
  }),
);
checks++;
console.log(
  `PASS: ${checks} public-page notification safeguards; synthetic responses only, no live submissions.`,
);
const rootUrl = `${origin}/`;
const root = fixture({
  [sitemap]: () => response(xml([rootUrl]), "application/xml"),
  [rootUrl]: () => response(html(origin)),
});
assert.equal((await notifyPublicPages({ ...root, checkOnly: false })).submitted, 1);
const budget = fixture({
  [endpoint]: async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return response("", "text/plain", 200);
  },
});
const paused = await notifyPublicPages({
  ...budget,
  checkOnly: false,
  batchSize: 1,
  maxDurationMs: 1,
});
assert.equal(paused.paused, true);
assert.equal(paused.submitted, 1);
assert.equal(budget.saves.length, 1);
console.log("PASS: homepage URL equivalence and bounded-run checkpoint safeguards.");
