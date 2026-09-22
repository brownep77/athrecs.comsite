import assert from "node:assert/strict";
import {
  fixture,
  service,
  sourceHtml,
  sampleRows,
  scope,
  sourceUrl,
  indexHtml,
} from "./club-scanner-fixture.mjs";
import { extract, discover, fetchSource } from "../src/lib/club-scanner/provider.server.ts";
import { scopeSchema } from "../src/lib/club-scanner/core.ts";
const source = extract(sourceHtml(), sourceUrl, scope);
assert.equal(source.rows.length, 6, "Exact club names exclude substrings");
assert.equal(source.rows[0].performance.performance, "00:42:08.7");
assert.equal(
  source.rows[1].performance.labels.find((l) => l.startsWith("Gender Pos:")),
  "Gender Pos: 1",
);
assert.equal(
  source.rows[1].performance.labels.find((l) => l.startsWith("Cat Pos:")),
  "Cat Pos: 1",
);
assert.ok(source.rows.every((r) => r.sourceIssues.length === 0));
assert.equal(discover(indexHtml, scope).length, 1);
assert.throws(() => scopeSchema.parse({ ...scope, dateFrom: "2025-02-30" }));
await assert.rejects(fetchSource("https://127.0.0.1/secret"), /manual source review/);
await assert.rejects(
  fetchSource("https://totalracetiming.co.uk@localhost/raceresults/1"),
  /manual source review/,
);
const missing = extract(sourceHtml(sampleRows, "unknown"), sourceUrl, scope).rows[0];
assert.equal(missing.performance.date, "");
assert.equal(missing.performance.year, 0);
assert.ok(missing.sourceIssues.length);
const sameName = extract(
  sourceHtml([...sampleRows, [...sampleRows[0].slice(0, 8), "999", ...sampleRows[0].slice(9)]]),
  sourceUrl,
  scope,
);
assert.ok(sameName.rows[0].sourceIssues.includes("multiple_matching_names_or_distances"));
const f = await fixture();
try {
  const { id } = await service.createRun(scope, "staff@example.test", f.sql);
  await service.runNext(id, f.sql, f.fetcher);
  await service.runNext(id, f.sql, f.fetcher);
  let data = await service.dashboard({ runId: id, status: "all", q: "", page: 1 }, f.sql);
  assert.equal(data.total, 6);
  assert.equal(data.runs[0].status, "complete");
  assert.equal(
    (await f.sql`select count(*)::int n from athletes`)[0].n,
    4,
    "Scanning creates no profiles",
  );
  assert.equal((await f.sql`select count(*)::int n from athlete_source_histories`)[0].n, 0);
  const named = (name) => data.candidates.find((c) => c.data.name === name);
  const fresh = named("Fresh Runner"),
    known = named("Known Runner");
  assert.equal(fresh.status, "proposed");
  assert.equal(known.status, "proposed");
  assert.equal(named("Alex Variant").status, "held");
  assert.equal(named("A Initial").status, "held");
  const approve = (ids, extra = {}) =>
    service.review(
      {
        ids,
        action: "suggested",
        reason: "Compared source bib, gender and dated club identity.",
        evidenceUrl: sourceUrl,
        sourcesReviewed: true,
        ...extra,
      },
      "staff@example.test",
      f.sql,
    );
  await assert.rejects(
    approve([named("Managed Runner").id], { action: "link", athleteId: 2 }),
    /separate owner/,
  );
  await assert.rejects(
    approve([named("Private Runner").id], { action: "link", athleteId: 3 }),
    /separate owner/,
  );
  await assert.rejects(approve([named("A Initial").id], { action: "create" }), /Initial-only/);
  await assert.rejects(approve([known.id], { sourcesReviewed: false }), /Confirm source/);
  await approve([fresh.id, known.id]);
  const altered = sampleRows.map((r) => r.slice());
  altered[0][11] = "00:40:00.0";
  await assert.rejects(
    service.publish([fresh.id], "staff@example.test", f.sql, async () => sourceHtml(altered)),
    /source changed/,
  );
  assert.equal((await f.sql`select count(*)::int n from athletes`)[0].n, 4);
  await f.db.exec(
    `create function reject_club_test() returns trigger language plpgsql as $$ begin raise exception 'publication rollback probe'; end $$; create trigger reject_club_test before insert on athlete_source_histories for each row execute function reject_club_test();`,
  );
  await assert.rejects(
    service.publish([fresh.id, known.id], "staff@example.test", f.sql, f.fetcher),
    /publication rollback probe/,
  );
  assert.equal(
    (await f.sql`select count(*)::int n from athletes`)[0].n,
    4,
    "Profile creation rolls back with a failed history write",
  );
  assert.equal((await f.sql`select count(*)::int n from athlete_source_histories`)[0].n, 0);
  await f.db.exec(
    "drop trigger reject_club_test on athlete_source_histories; drop function reject_club_test();",
  );
  const published = await service.publish(
    [fresh.id, known.id],
    "staff@example.test",
    f.sql,
    f.fetcher,
  );
  assert.deepEqual(published, { published: 2, newProfiles: 1, duplicates: 0, held: 0 });
  assert.equal(
    (await f.sql`select count(*)::int n from results`)[0].n,
    0,
    "Canonical results remain unchanged",
  );
  const history = (
    await f.sql`select * from athlete_source_histories where external_id=${fresh.source_key}`
  )[0];
  assert.equal(history.performances[0].performance, "00:42:08.7");
  assert.ok(history.published_at);
  assert.equal(history.complete, false);
  await assert.rejects(
    service.publish([fresh.id], "staff@example.test", f.sql, f.fetcher),
    /Only approved/,
  );
  const run2 = await service.createRun(scope, "staff@example.test", f.sql);
  await service.runNext(run2.id, f.sql, f.fetcher);
  await service.runNext(run2.id, f.sql, f.fetcher);
  const repeat = await service.dashboard({ runId: run2.id, status: "all", q: "", page: 1 }, f.sql);
  assert.equal(repeat.total, 6);
  assert.equal(
    repeat.candidates.find((c) => c.id === fresh.id).status,
    "published",
    "Rescans retain decisions and do not duplicate rows",
  );
  await service.review(
    {
      ids: [named("Alex Variant").id],
      action: "hold",
      reason: "Need direct evidence of shortened given name.",
    },
    "staff@example.test",
    f.sql,
  );
  assert.equal((await service.reviewHistory(named("Alex Variant").id, f.sql)).length, 1);
  await service.review(
    {
      ids: [named("Alex Variant").id],
      action: "dismiss",
      reason: "No adequate identity evidence in this source.",
    },
    "staff@example.test",
    f.sql,
  );
  await service.review(
    {
      ids: [named("Alex Variant").id],
      action: "reopen",
      reason: "Revisit after a new supporting source arrives.",
    },
    "staff@example.test",
    f.sql,
  );
  await approve([named("Alex Variant").id], { action: "link", athleteId: 4 });
  await f.sql`update athletes set profile_visibility='private' where id=4`;
  await assert.rejects(
    service.publish([named("Alex Variant").id], "staff@example.test", f.sql, f.fetcher),
    /visibility or identity changed/,
  );
  assert.equal((await f.sql`select count(*)::int n from athlete_source_histories`)[0].n, 2);
  const manual = await service.createRun(
    { ...scope, discover: false, urls: ["https://example.test/results.pdf"] },
    "staff@example.test",
    f.sql,
  );
  await service.runNext(manual.id, f.sql, f.fetcher);
  assert.equal(
    (await service.dashboard({ runId: manual.id, status: "all", q: "", page: 1 }, f.sql)).problems
      .length,
    1,
  );
  console.log(
    "Club scanner verified: source parsing, strict evidence audit, club scope, SSRF restrictions, identity review, privacy guards, atomic publication, changed sources, repeat scans and audit history.",
  );
} finally {
  await f.close();
}
