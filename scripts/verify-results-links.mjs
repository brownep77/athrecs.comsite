import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  canonicalResultUrl,
  decideResultLinkSource,
  parseResultLinksCsv,
} from "../src/lib/athrecs/results-links-import.ts";

const parsed =
  parseResultLinksCsv(`event_slug,date,distance,provider_name,results_url,source_url,verified,checked_at
run-norwich,2025-09-07,10K,"Timer, Ltd",https://EXAMPLE.com/results/?utm_source=test&b=2&a=1#finish,https://example.com/event,true,2026-08-20T10:00:00Z`);

assert.equal(parsed.length, 1);
assert.equal(parsed[0].providerName, "Timer, Ltd");
assert.equal(parsed[0].issues.length, 0);
assert.equal(parsed[0].canonicalUrl, "https://example.com/results?a=1&b=2");
assert.equal(
  canonicalResultUrl("https://example.com/results/?b=2&utm_campaign=x&a=1#top"),
  parsed[0].canonicalUrl,
  "tracking, fragments, query order and a trailing slash must not defeat duplicate detection",
);

const sources = [
  {
    source_id: "runabc",
    source_name: "RunABC Race Listings",
    allowed_domains: "runabc.co.uk|www.runabc.co.uk",
    queue_status: "blocked",
    block_reason: "Rights review required",
  },
  {
    source_id: "racebest_results",
    source_name: "RaceBest Results Archive",
    allowed_domains: "racebest.com|www.racebest.com",
    queue_status: "queued",
    block_reason: null,
  },
];

assert.deepEqual(
  decideResultLinkSource(
    {
      resultsUrl: "https://runabc.co.uk/races/example",
      sourceUrl: null,
      verified: true,
    },
    sources,
  ),
  {
    allowed: false,
    sourceId: "runabc",
    sourceName: "RunABC Race Listings",
    reason: "Rights review required",
  },
);
assert.equal(
  decideResultLinkSource(
    {
      resultsUrl: "https://results.runabc.co.uk/races/example",
      sourceUrl: null,
      verified: true,
    },
    sources,
  ).allowed,
  false,
  "a subdomain must not bypass a blocked parent-domain policy",
);
assert.equal(
  decideResultLinkSource(
    {
      resultsUrl: "https://racebest.com/results/example",
      sourceUrl: null,
      verified: true,
    },
    sources,
  ).allowed,
  true,
);
assert.equal(
  decideResultLinkSource(
    {
      resultsUrl: "https://official-organiser.example/results",
      sourceUrl: "https://official-organiser.example/race",
      verified: true,
    },
    sources,
  ).sourceName,
  "Manually verified direct source",
);
assert.equal(
  decideResultLinkSource(
    {
      resultsUrl: "https://racebest.com/results/example",
      sourceUrl: null,
      verified: false,
    },
    sources,
  ).allowed,
  false,
);

const invalid = parseResultLinksCsv(`event_slug,date,distance,provider_name,results_url,verified
example,2026-02-30,10K,Example,http://example.com/results,maybe`)[0];
assert.ok(invalid.issues.some((issue) => issue.includes("real YYYY-MM-DD")));
assert.ok(invalid.issues.some((issue) => issue.includes("HTTPS")));
assert.ok(invalid.issues.some((issue) => issue.includes("verified")));

const pg = new PGlite();
await pg.waitReady;
await pg.exec("create table editions (id serial primary key)");
await pg.exec(
  await readFile(new URL("../migrations/0009_edition_result_links.sql", import.meta.url), "utf8"),
);
await pg.exec("insert into editions (id) values (1)");
await pg.query(
  `insert into edition_result_links
    (edition_id, provider_code, provider_name, results_url, canonical_url, registry_source_id, is_verified)
   values ($1, $2, $3, $4, $5, $6, true)`,
  [1, "example", "Example", parsed[0].resultsUrl, parsed[0].canonicalUrl, "manual-test"],
);
await assert.rejects(() =>
  pg.query(
    `insert into edition_result_links
      (edition_id, provider_code, provider_name, results_url, canonical_url, registry_source_id, is_verified)
     values ($1, $2, $3, $4, $5, $6, true)`,
    [1, "other", "Other", "https://example.com/alternate", parsed[0].canonicalUrl, null],
  ),
);

console.log("Results-link CSV, source policy and database duplicate checks passed.");
