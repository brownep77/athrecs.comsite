// Per-source access outcomes and contact lookup for sites that refuse collection.
import assert from "node:assert/strict";
import { pickContactEmail, runAll } from "./source-importer/lib.mjs";

assert.equal(
  pickContactEmail(
    '<a href="mailto:events@race.example">x</a> info@race.example',
    "www.race.example",
  ),
  "info@race.example",
  "A general mailbox on the site's own domain is preferred",
);
assert.equal(pickContactEmail("someone@gmail.com logo@2x.png", "race.example"), "");

const sites = {
  "https://closed.example/robots.txt": "User-agent: *\nDisallow: /events\n",
  "https://closed.example/contact": '<p>Write to <a href="mailto:hello@closed.example">us</a></p>',
  "https://shut.example/robots.txt": "User-agent: *\nDisallow: /\n",
};
const visited = [];
const fetchImpl = async (url) => {
  visited.push(url);
  if (url.startsWith("https://down.example")) throw new Error("timeout");
  const body = sites[url];
  if (body === undefined) return new Response("", { status: 404 });
  return new Response(body, {
    status: 200,
    headers: { "content-type": url.endsWith("robots.txt") ? "text/plain" : "text/html" },
  });
};
const source = (id, url) => ({
  source_id: id,
  source_name: id,
  start_url: url,
  allowed_domains: new URL(url).hostname,
  max_pages: "1",
  rate_limit_seconds: "0",
  source_type: "directory",
});
const { results } = await runAll(
  [
    source("closed", "https://closed.example/events"),
    source("shut", "https://shut.example/calendar"),
    source("down", "https://down.example/events"),
  ],
  {
    fetchImpl,
    options: { today: "2026-11-07", from: "2026-11-07", to: "2027-03-01" },
    sleep: async () => {},
  },
);
const by = Object.fromEntries(results.map((r) => [r.source, r]));
assert.equal(by.closed.access, "prohibited");
assert.equal(by.closed.contactEmail, "hello@closed.example", "Contact read from an allowed page");
assert(!visited.includes("https://closed.example/events"), "A disallowed page is never fetched");
assert.equal(by.shut.access, "prohibited");
assert.equal(by.shut.contactEmail, "", "Nothing is read when the whole site is disallowed");
assert(!visited.some((u) => u.startsWith("https://shut.example/") && !u.endsWith("robots.txt")));
assert.equal(
  by.down.access,
  "unreachable",
  "A failed robots.txt fetch is not treated as a refusal",
);
console.log(
  "Source access checks passed: refusals need a published robots.txt; contacts come only from allowed pages.",
);

// Shards group sources by website, and a time budget leaves later sources "not-reached".
{
  const { shardOf, runAll: runAllShards } = await import("./source-importer/lib.mjs");
  const a = { source_id: "a", start_url: "https://www.example.org/races" };
  const b = { source_id: "b", start_url: "https://example.org/calendar" };
  if (shardOf(a, 4) !== shardOf(b, 4)) throw new Error("same website must share a shard");
  const late = await runAllShards([a, b], {
    concurrency: 1,
    deadline: 0,
    options: { today: "2026-11-07", from: "2026-11-07", to: "2027-01-01", maxEvents: 5 },
    fetchImpl: async () => {
      throw new Error("must not fetch after the deadline");
    },
  });
  if (late.results.some((r) => r.access !== "not-reached"))
    throw new Error("sources past the deadline should be not-reached");
  console.log("Source sharding and time budget checks passed.");
}
