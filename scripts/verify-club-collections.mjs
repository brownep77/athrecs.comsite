import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  fixture,
  service,
  scope,
  sourceUrl,
  sourceHtml,
  sampleRows,
} from "./club-scanner-fixture.mjs";
import { collectionConfigSchema, collectionScope } from "../src/lib/club-scanner/collection.ts";
import {
  savePlan,
  enqueueDue,
  collectionDashboard,
  sharedSourceFetcher,
  collectionWorker,
  publishReviewed,
  setupPilot,
} from "../src/lib/club-scanner/collection.server.ts";

const f = await fixture();
try {
  await f.db.exec(
    "alter table clubs add column slug text;update clubs set slug='example-ac' where id=1;insert into clubs(id,name,source_names,slug) values(2,'Other AC','','other-ac');",
  );
  await f.db.exec(
    await readFile(
      new URL("../migrations/20261014_club_collection_plans.sql", import.meta.url),
      "utf8",
    ),
  );
  const config = collectionConfigSchema.parse({
    aliases: ["Example AC"],
    sports: ["Running"],
    historyFrom: "2025-01-01",
    intervalHours: 24,
    recentDays: 45,
    discover: true,
  });
  assert.throws(() => collectionConfigSchema.parse({ ...config, intervalHours: 0 }));
  assert.throws(() => collectionConfigSchema.parse({ ...config, historyFrom: "2025-02-30" }));
  assert.throws(() =>
    collectionConfigSchema.parse({ ...config, researchSources: ["http://localhost/private"] }),
  );
  assert.throws(() =>
    collectionConfigSchema.parse({
      ...config,
      researchSources: ["https://user:secret@example.org"],
    }),
  );
  assert.equal(collectionScope(1, config, true).dateFrom, "2025-01-01");
  assert.equal(
    collectionScope(1, config, false, new Date("2026-10-14T12:00:00Z")).dateFrom,
    "2026-08-30",
  );
  await savePlan({ clubId: 1, revision: 0, enabled: true, config }, "staff@example.test", f.sql);
  await savePlan(
    { clubId: 2, revision: 0, enabled: true, config: { ...config, aliases: ["Other AC"] } },
    "staff@example.test",
    f.sql,
  );
  await assert.rejects(
    savePlan({ clubId: 1, revision: 0, enabled: true, config }, "staff@example.test", f.sql),
    /changed/,
  );
  assert.equal((await enqueueDue(f.sql)).started, 2);
  assert.equal(
    (await enqueueDue(f.sql)).started,
    0,
    "Overlapping ticks do not duplicate active runs",
  );
  assert.equal((await f.sql`select count(*)::int n from club_scan_runs`)[0].n, 2);
  const plans = (await collectionDashboard(f.sql)).plans;
  const first = plans.find((p) => p.club_id === 1);
  await savePlan({ clubId: 1, revision: 1, enabled: false, config }, "staff@example.test", f.sql);
  assert.equal(
    (await f.sql`select status from club_scan_runs where id=${first.last_run_id}::uuid`)[0].status,
    "paused",
  );
  assert.equal(
    (await service.runNext(first.last_run_id, f.sql, f.fetcher)).processed,
    0,
    "Paused plan cannot scan",
  );
  await savePlan({ clubId: 1, revision: 2, enabled: true, config }, "staff@example.test", f.sql);
  assert.equal(
    (await f.sql`select status from club_scan_runs where id=${first.last_run_id}::uuid`)[0].status,
    "running",
  );
  let fetches = 0;
  const fetcher = async (url) => {
    fetches++;
    return f.fetcher(url);
  };
  const shared = sharedSourceFetcher(f.sql, fetcher);
  await shared(sourceUrl);
  await shared(sourceUrl);
  assert.equal(fetches, 1, "Clubs reuse one source retrieval");
  await f.sql`update club_collection_source_cache set expires_at=now()-interval '1 second' where url=${sourceUrl}`;
  await shared(sourceUrl);
  assert.equal(fetches, 2, "Expired sources are retrieved again");
  for (let i = 0; i < 5; i++) await collectionWorker(f.sql, fetcher);
  const done = (await collectionDashboard(f.sql)).plans.find((p) => p.club_id === 1);
  assert.equal(done.run_status, "complete");
  assert.ok(done.last_finished_at);
  assert.equal(done.review, 6);
  assert.equal(done.published, 0, "Collection never approves athlete identity itself");
  assert.equal((await f.sql`select count(*)::int n from athletes`)[0].n, 4);
  const candidate = (
    await f.sql`select * from club_scan_candidates where data->>'name'='Known Runner'`
  )[0];
  await service.review(
    {
      ids: [candidate.id],
      action: "suggested",
      reason: "Compared actual source row, club and athlete identity.",
      evidenceUrl: sourceUrl,
      sourcesReviewed: true,
    },
    "staff@example.test",
    f.sql,
  );
  const before = fetches;
  assert.equal((await publishReviewed(f.sql, fetcher)).published, 1);
  assert.ok(fetches > before, "Publication fetches fresh evidence instead of the scan cache");
  assert.equal((await publishReviewed(f.sql, fetcher)).published, 0);
  const history = (await f.sql`select performances from athlete_source_histories`)[0];
  assert.equal(history.performances[0].verificationStatus, "source_verified");
  assert.equal(history.performances[0].archiveReference.athleteAccountIdentityVerified, false);
  const fresh = (
    await f.sql`select * from club_scan_candidates where data->>'name'='Fresh Runner'`
  )[0];
  await service.review(
    {
      ids: [fresh.id],
      action: "suggested",
      reason: "Distinct athlete, source club and full identity compared.",
      evidenceUrl: sourceUrl,
      sourcesReviewed: true,
    },
    "staff@example.test",
    f.sql,
  );
  await savePlan({ clubId: 1, revision: 3, enabled: false, config }, "staff@example.test", f.sql);
  assert.equal((await publishReviewed(f.sql, fetcher)).published, 0, "Paused plans cannot publish");
  await savePlan({ clubId: 1, revision: 4, enabled: true, config }, "staff@example.test", f.sql);
  const changed = sampleRows.map((r) => r.slice());
  changed[0][11] = "00:40:00.0";
  assert.equal(
    (await publishReviewed(f.sql, async () => sourceHtml(changed))).held,
    1,
    "Changed source moves to review",
  );
  assert.equal(
    (await f.sql`select status from club_scan_candidates where id=${fresh.id}::uuid`)[0].status,
    "held",
  );
  assert.equal((await f.sql`select count(*)::int n from athletes`)[0].n, 4);
  assert.equal(
    (await setupPilot("staff@example.test", f.sql)).added,
    0,
    "Pilot does not invent missing clubs",
  );
  await f.sql`insert into athletes(slug,display_name,gender,club_id,profile_visibility) values('accent','Kñown Runner','M',2,'public'),('initial','K Runner','M',2,'public')`;
  const names = await service.athletes(f.sql, ["Known Runner"]);
  assert.equal(
    names.length,
    3,
    "Targeted lookup retains accent and initial ambiguity across clubs",
  );
  await f.sql`update club_collection_plans set next_check_at=now()-interval '1 hour' where club_id=1`;
  assert.equal((await enqueueDue(f.sql)).started, 1);
  const latest = (await collectionDashboard(f.sql)).plans.find((p) => p.club_id === 1);
  assert.notEqual(latest.last_run_id, first.last_run_id);
  assert.equal(
    (await f.sql`select scope from club_scan_runs where id=${latest.last_run_id}::uuid`)[0].scope
      .dateFrom,
    collectionScope(1, config, false).dateFrom,
    "Later scans use a rolling recent window",
  );
  const correctionRun = await service.createRun(scope, "staff@example.test", f.sql);
  const correctedRows = sampleRows.map((row) => row.slice());
  correctedRows[1][11] = "00:42:50.0";
  await service.runNext(correctionRun.id, f.sql, f.fetcher);
  await service.runNext(correctionRun.id, f.sql, async () => sourceHtml(correctedRows));
  assert.equal(
    (await f.sql`select status from club_scan_candidates where id=${candidate.id}::uuid`)[0].status,
    "held",
    "Changed published row is flagged for correction review",
  );
  assert.equal(
    (await f.sql`select performances from athlete_source_histories`)[0].performances[0].performance,
    "00:43:08.7",
    "Repeat scan never overwrites a published history",
  );
  assert.equal(
    (await collectionDashboard(f.sql)).plans.find((p) => p.club_id === 1).published,
    1,
    "Published count includes preserved histories awaiting correction",
  );
  console.log(
    "Club collections verified: durable schedules, pause/resume, revision guards, shared fetches, fresh publication evidence, changed-source holds, duplicate protection, targeted identity lookup and honest progress.",
  );
} finally {
  await f.close();
}
