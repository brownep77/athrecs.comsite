#!/usr/bin/env node
import assert from "node:assert/strict";
import { createServer } from "vite";

delete process.env.DATABASE_URL;

const vite = await createServer({
  appType: "custom",
  server: { middlewareMode: true },
  logLevel: "error",
});

try {
  const { ensureAthrecsSeeded } = await vite.ssrLoadModule("/src/lib/athrecs/seed.server.ts");
  const {
    getFixtureReviewQueue,
    releaseFixtureReviewCandidates,
    stageScraperWorkbookSnapshot,
    publishEligibleScraperWorkbookBatch,
  } = await vite.ssrLoadModule("/src/lib/athrecs/scraper-workbook-import.server.ts");

  await ensureAthrecsSeeded();
  const staged = await stageScraperWorkbookSnapshot();
  assert.equal(staged.counts.staged, 5315, "Every workbook edition must be staged");
  assert.equal(
    staged.counts.eligible +
      staged.counts.blocked +
      staged.counts.duplicates +
      staged.counts.published,
    5315,
    "Every staged edition must have exactly one classification",
  );
  assert(staged.counts.eligible <= 74, "Catalogue dedupe cannot increase the 74-row quality gate");

  const reviewQueue = await getFixtureReviewQueue({ reviewStatus: "releasable", limit: 1 });
  assert(reviewQueue, "The staged batch must have a review queue");
  assert(reviewQueue.rows.length === 1, "The safe historical review queue must be populated");
  assert.equal(
    reviewQueue.counts.releasable + reviewQueue.counts.pending,
    staged.counts.blocked,
    "Every blocked candidate must have an explicit review disposition",
  );
  const reviewed = await releaseFixtureReviewCandidates({
    batchId: staged.batchId,
    candidateIds: [reviewQueue.rows[0].id],
    reviewerUserId: "fixture-review-verifier",
    note: "Automated review workflow verification",
  });
  assert.equal(reviewed.approved, 1);
  assert.equal(reviewed.publication?.publishedCandidates, 1);
  assert.equal(
    reviewed.publication?.counts.eligible,
    staged.counts.eligible,
    "A selected release must not publish unrelated eligible candidates",
  );
  const queueAfterReview = await getFixtureReviewQueue({ reviewStatus: "releasable", limit: 1 });
  assert.equal(queueAfterReview.counts.approved, 1, "The approved state must remain auditable");
  assert.equal(queueAfterReview.counts.actions, 2, "Approval and release actions must be logged");

  const first = await publishEligibleScraperWorkbookBatch(staged.batchId);
  assert.equal(first.publishedCandidates, staged.counts.eligible);
  assert.equal(first.counts.eligible, 0);
  assert.equal(first.counts.staged, 5315);

  const stagedAgain = await stageScraperWorkbookSnapshot();
  const queueAfterRestage = await getFixtureReviewQueue({ reviewStatus: "releasable", limit: 1 });
  assert.equal(
    queueAfterRestage.counts.approved,
    1,
    "Refreshing the staged snapshot must preserve completed review decisions",
  );
  const second = await publishEligibleScraperWorkbookBatch(stagedAgain.batchId);
  assert.equal(second.publishedEvents, 0, "A repeated upload must not create events");
  assert.equal(second.publishedEditions, 0, "A repeated upload must not create editions");
  assert.equal(second.publishedCandidates, 0, "A repeated upload must publish no candidates");

  process.stdout.write(
    JSON.stringify(
      {
        snapshot_id: staged.snapshotId,
        source_editions_staged: staged.counts.staged,
        eligible_after_catalogue_dedupe: staged.counts.eligible,
        first_run_events_added: first.publishedEvents,
        first_run_edition_distances_added: first.publishedEditions,
        reviewed_candidates_released: reviewed.approved,
        reviewed_events_added: reviewed.publication?.publishedEvents ?? 0,
        reviewed_edition_distances_added: reviewed.publication?.publishedEditions ?? 0,
        held_for_review: first.counts.blocked,
        duplicate_candidates: first.counts.duplicates,
        repeat_run_events_added: second.publishedEvents,
        repeat_run_editions_added: second.publishedEditions,
      },
      null,
      2,
    ) + "\n",
  );
} finally {
  await vite.close();
}
