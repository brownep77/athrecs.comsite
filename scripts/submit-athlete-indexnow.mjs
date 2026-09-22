// Run after deployment to notify participating search engines of public profiles.
// The sitemap, not staff data or a database export, is the submission source.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const origin = "https://www.athrecs.com";
const keyFile = (
  await readFile(new URL("./indexnow-key-file.txt", import.meta.url), "utf8")
).trim();
const key = (await readFile(new URL(`../public/${keyFile}`, import.meta.url), "utf8")).trim();
const keyLocation = `${origin}/${keyFile}`;
async function getText(url) {
  assert.equal(new URL(url).origin, origin);
  const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
  assert.equal(response.status, 200, `Unable to read ${url}`);
  return response.text();
}
function locations(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
    match[1].replaceAll("&amp;", "&"),
  );
}
assert.equal(
  (await getText(keyLocation)).trim(),
  key,
  "Deployed IndexNow ownership file must match",
);
const index = await getText(`${origin}/sitemap.xml`);
assert(index.includes("<sitemapindex"), "Deploy the live sitemap before submitting");
const urls = [];
for (const sitemap of locations(index).filter((url) =>
  /\/sitemaps\/athletes-\d+\.xml$/.test(url),
)) {
  urls.push(...locations(await getText(sitemap)));
}
const unique = [...new Set(urls)];
assert(unique.length > 0, "No public athlete URLs found");
assert(
  unique.every(
    (url) => new URL(url).origin === origin && new URL(url).pathname.startsWith("/athletes/"),
  ),
);
for (let offset = 0; offset < unique.length; offset += 10000) {
  const urlList = unique.slice(offset, offset + 10000);
  const response = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: new URL(origin).host, key, keyLocation, urlList }),
    signal: AbortSignal.timeout(60000),
  });
  assert(
    [200, 202].includes(response.status),
    `IndexNow returned HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`,
  );
  console.log(
    `IndexNow received ${urlList.length} public athlete URLs (HTTP ${response.status}${response.status === 202 ? "; ownership validation pending" : ""}).`,
  );
}
console.log(
  `Submitted ${unique.length} public athlete URLs. Receipt does not guarantee crawling or indexing.`,
);
