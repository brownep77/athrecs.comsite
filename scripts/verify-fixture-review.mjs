import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import {
  HISTORICAL_METADATA_POLICY,
  evaluateHistoricalFixtureReview,
} from "../src/lib/athrecs/fixture-review-policy.ts";

const today = "2026-08-20";
const safeHistorical = {
  eventName: "Example Historic 10K",
  eventDate: "2025-05-04",
  sport: "Running",
  country: "England",
  sourceUrl: "https://racebest.com/results/example",
  distances: [{ code: "10K", km: 10 }],
  issues: [
    { field: "official_website_url", issueType: "missing", priority: "high" },
    { field: "city", issueType: "missing", priority: "high" },
  ],
  blockReasons: ["open_high_priority_review_item"],
};

const releasable = evaluateHistoricalFixtureReview(safeHistorical, today);
assert.equal(releasable.status, "releasable");
assert.equal(releasable.policyCode, HISTORICAL_METADATA_POLICY);
assert.deepEqual(releasable.remainingBlockReasons, []);
assert.deepEqual(releasable.warnings, ["official_website_url: missing", "city: missing"]);

assert.deepEqual(
  evaluateHistoricalFixtureReview({ ...safeHistorical, eventDate: "2026-09-01" }, today)
    .remainingBlockReasons,
  ["not_historical_edition"],
  "future fixtures must not enter the historical metadata release path",
);

assert.ok(
  evaluateHistoricalFixtureReview(
    {
      ...safeHistorical,
      distances: [],
      blockReasons: ["open_high_priority_review_item", "missing_distance"],
    },
    today,
  ).remainingBlockReasons.includes("missing_distance"),
  "missing distances remain blocking",
);

assert.ok(
  evaluateHistoricalFixtureReview(
    {
      ...safeHistorical,
      issues: [{ field: "surface", issueType: "conflict", priority: "high" }],
    },
    today,
  ).remainingBlockReasons.includes("critical_review_issue:surface"),
  "identity-changing issue fields remain blocking",
);

assert.ok(
  evaluateHistoricalFixtureReview(
    { ...safeHistorical, blockReasons: ["open_high_priority_review_item", "source_disabled"] },
    today,
  ).remainingBlockReasons.includes("source_disabled"),
  "disabled sources remain blocking",
);

assert.ok(
  evaluateHistoricalFixtureReview(
    {
      ...safeHistorical,
      issues: [{ field: "new_unclassified_field", issueType: "missing", priority: "high" }],
    },
    today,
  ).remainingBlockReasons.includes("critical_review_issue:new_unclassified_field"),
  "unknown high-priority issue fields must fail closed",
);

const pg = new PGlite();
await pg.waitReady;
await pg.exec("create table events (id serial primary key)");
await pg.exec(
  await readFile(
    new URL("../migrations/0008_fixture_workbook_staging.sql", import.meta.url),
    "utf8",
  ),
);
await pg.exec(
  await readFile(new URL("../migrations/0010_fixture_review_release.sql", import.meta.url), "utf8"),
);
await pg.query(
  `insert into fixture_import_batches
    (id, snapshot_id, snapshot_created_at, source_record_count)
   values ($1, $2, now(), 1)`,
  ["batch-test", "snapshot-test"],
);
await pg.query(
  `insert into fixture_candidates (
    id, batch_id, source_race_id, source_edition_id, source_id, source_url,
    source_row_hash, fingerprint, event_name, event_slug, event_date, payload,
    status, block_reasons, review_status, review_policy, review_warnings,
    reviewed_by, review_note
  ) values (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, '{}'::jsonb,
    'eligible', '[]'::jsonb, 'approved', $12, $13::jsonb, $14, $15
  )`,
  [
    "candidate-test",
    "batch-test",
    "race-test",
    "edition-test",
    "racebest_results",
    "https://racebest.com/results/example",
    "row-hash",
    "fingerprint",
    "Example Historic 10K",
    "example-historic-10k",
    "2025-05-04",
    HISTORICAL_METADATA_POLICY,
    JSON.stringify(releasable.warnings),
    "reviewer-test",
    "Reviewed historical metadata",
  ],
);
await pg.query(
  `insert into fixture_review_actions (
    candidate_id, batch_id, action, policy_code, previous_status,
    previous_block_reasons, remaining_block_reasons, warnings,
    reviewer_user_id, note
  ) values ($1, $2, 'approved', $3, 'releasable', $4::jsonb, '[]'::jsonb, $5::jsonb, $6, $7)`,
  [
    "candidate-test",
    "batch-test",
    HISTORICAL_METADATA_POLICY,
    JSON.stringify(["open_high_priority_review_item"]),
    JSON.stringify(releasable.warnings),
    "reviewer-test",
    "Reviewed historical metadata",
  ],
);

const stored = await pg.query(
  `select candidate.review_status, candidate.reviewed_by, action.action, action.reviewer_user_id
   from fixture_candidates candidate
   join fixture_review_actions action on action.candidate_id = candidate.id`,
);
assert.deepEqual(stored.rows, [
  {
    review_status: "approved",
    reviewed_by: "reviewer-test",
    action: "approved",
    reviewer_user_id: "reviewer-test",
  },
]);
await assert.rejects(() =>
  pg.query(
    `insert into fixture_review_actions
      (candidate_id, batch_id, action, previous_status, reviewer_user_id)
     values ($1, $2, 'unsafe_action', 'pending', $3)`,
    ["candidate-test", "batch-test", "reviewer-test"],
  ),
);

console.log("Fixture review policy, migration and audit checks passed.");
