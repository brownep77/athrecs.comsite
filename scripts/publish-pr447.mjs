#!/usr/bin/env node
// Explicit, bounded manual publication. Never called by a build or seed.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createServer } from "vite";

const [mode, baselinePath, auditPath] = process.argv.slice(2);
if (
  !["snapshot", "rehearse", "publish"].includes(mode) ||
  !baselinePath ||
  (mode !== "snapshot" && !auditPath)
) {
  throw new Error(
    "Usage: DATABASE_URL=… node scripts/publish-pr447.mjs snapshot BASELINE | rehearse BASELINE AUDIT | publish BASELINE AUDIT",
  );
}
if (!process.env.DATABASE_URL?.trim()) throw new Error("Persistent DATABASE_URL required");
const batch = JSON.parse(
  readFileSync(new URL("../docs/catalogue-publishing/pr447/batch.json", import.meta.url)),
);
const actor = "pr447-authorized-publication";
const slugs = [...new Set(batch.editions.map((e) => e.eventSlug))];
const newSlugs = batch.events.map((e) => e.slug);
const existingIds = [3059477, 3059757, 3059837, 4376326];
const existingEditionIds = [71612019, 71612313, 71612397, 109231407, 109231408, 109232019];
const pattern = "(rugeley|walled.city|shakespeare|dundalk|central.lanc|dungarvan)";
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const write = (path, value) =>
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
const vite = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true },
});

try {
  const db = await vite.ssrLoadModule("/src/lib/db.ts");
  const publisher = await vite.ssrLoadModule("/src/lib/athrecs/catalogue-publishing.server.ts");
  const visibility = await vite.ssrLoadModule("/src/lib/athrecs/runrecs-publication.server.ts");
  const sql = await db.getSql();

  async function records(tx) {
    return {
      events: await tx.query(
        "select to_jsonb(e) record from events e where slug = any($1) order by id",
        [slugs],
      ),
      distances: await tx.query(
        "select x.* from event_distances x join events e on e.id=x.event_id where e.slug=any($1) order by event_id,distance_code",
        [slugs],
      ),
      editions: await tx.query(
        "select to_jsonb(d) record from editions d join events e on e.id=d.event_id where e.slug=any($1) order by d.id",
        [slugs],
      ),
      options: await tx.query(
        "select to_jsonb(o) record from edition_entry_options o join editions d on d.id=o.edition_id join events e on e.id=d.event_id where e.slug=any($1) order by o.id",
        [slugs],
      ),
    };
  }

  async function snapshot(tx) {
    const state = await tx`select current_revision_id from catalogue_publish_state where id=1`;
    return {
      payloadHash: hash(batch),
      revision: state[0].current_revision_id,
      records: await records(tx),
      identities: await tx.query(
        `select to_jsonb(e) record from events e where
        e.slug=any($1) or e.name ~* $2 or e.website ~* '(Rugeley-10|thederrymarathon|02RwczqsA1|central-lancs-new)'
        or exists (select 1 from editions d where d.event_id=e.id and
          (d.source_url ~* '(Rugeley-10|1641342294698774)' or
           (abs(d.distance_km-16.09344)<0.1 and
            ((e.city ~* 'rugeley|brereton' and d.event_date between date '2027-02-14'-31 and date '2027-02-14'+31)
             or (e.city ~* 'derry' and d.event_date between date '2027-03-13'-31 and date '2027-03-13'+31)))))
        order by e.id`,
        [slugs, pattern],
      ),
      redirects: await tx.query(
        "select to_jsonb(s) record from slug_redirects s where to_jsonb(s)::text ~* $1 order by to_jsonb(s)::text",
        [pattern],
      ),
      pending: await tx.query(
        "select id,source_key,status,payload from catalogue_import_batches where status in ('staged','validating','ready','publishing') and payload::text ~* $1 order by id",
        [pattern],
      ),
      candidates: await tx.query(
        "select id,event_slug,status,candidate from race_collector_candidates where status in ('review','staged') and candidate::text ~* $1 order by id",
        [pattern],
      ),
      counts: (
        await tx`select (select count(*) from events) events, (select count(*) from editions) editions, (select count(*) from results) results, (select count(*) from slug_redirects) redirects`
      )[0],
    };
  }

  async function verify(tx, before, result) {
    const after = await records(tx);
    assert.deepEqual(
      after.events.filter((e) => existingIds.includes(e.record.id)),
      before.records.events,
    );
    assert.deepEqual(
      after.editions.filter((e) => e.record.id === 71612313),
      before.records.editions.filter((e) => e.record.id === 71612313),
      "Dundalk 10K changed",
    );
    for (const id of existingEditionIds)
      assert(
        after.editions.some((e) => e.record.id === id),
        `Lost edition ${id}`,
      );
    for (const { record } of before.records.options)
      assert(
        after.options.some((o) => o.record.id === record.id),
        `Lost entry option ${record.id}`,
      );
    for (const input of batch.editions) {
      const event = after.events.find((e) => e.record.slug === input.eventSlug).record;
      const matches = after.editions.filter(
        (d) =>
          d.record.event_id === event.id &&
          d.record.event_date === input.date &&
          d.record.distance_code === input.distance,
      );
      assert.equal(matches.length, 1);
      const edition = matches[0].record;
      for (const [column, key] of Object.entries({
        status: "status",
        source_url: "source",
        start_time: "startTime",
        distance_km: "distanceKm",
        notes: "notes",
      }))
        assert.equal(edition[column], input[key]);
      if (input.entryUrl) {
        assert.equal(edition.entry_url, input.entryUrl);
        const primary = after.options.filter(
          (o) => o.record.edition_id === edition.id && o.record.is_primary,
        );
        assert.equal(primary.length, 1);
        assert.equal(primary[0].record.entry_url, input.entryUrl);
        assert.equal(Number(primary[0].record.price_amount), input.entryOptions[0].priceAmount);
      } else assert.equal(edition.entry_url, null);
    }
    const changes = await tx.query(
      "select entity_type,entity_key,operation,before_json,after_json from catalogue_change_log where revision_id=$1 order by entity_type,entity_key",
      [result.revisionId],
    );
    assert.equal(
      changes.filter((c) => c.entity_type === "event" && c.operation === "insert").length,
      2,
    );
    assert.equal(
      changes.filter((c) => c.entity_type === "edition" && c.operation === "insert").length,
      2,
    );
    assert.equal(
      changes.filter((c) => c.entity_type === "edition" && c.operation === "update").length,
      5,
    );
    const hiddenIds = await visibility.getRunrecsOnlyEditionIds(tx);
    for (const c of changes.filter((c) => c.entity_type === "edition" && c.operation === "insert"))
      assert(hiddenIds.includes(c.after_json.record.id));
    const counts = (await snapshot(tx)).counts;
    assert.equal(counts.events, before.counts.events + 2);
    assert.equal(counts.editions, before.counts.editions + 2);
    assert.equal(counts.results, before.counts.results);
    assert.equal(counts.redirects, before.counts.redirects);
    return {
      after,
      changes,
      counts,
      newEditionIds: changes
        .filter((c) => c.entity_type === "edition" && c.operation === "insert")
        .map((c) => c.after_json.record.id),
    };
  }

  if (mode === "snapshot") {
    const before = await sql.transaction(async (tx) => {
      await tx`set transaction isolation level repeatable read read only`;
      return snapshot(tx);
    });
    write(baselinePath, before);
    console.log(
      JSON.stringify({
        revision: before.revision,
        payloadHash: before.payloadHash,
        events: before.records.events.length,
        editions: before.records.editions.length,
        identities: before.identities.map((x) => ({ id: x.record.id, slug: x.record.slug })),
        pending: before.pending.map((x) => x.id),
        candidates: before.candidates.map((x) => ({ id: x.id, slug: x.event_slug })),
        counts: before.counts,
      }),
    );
  } else {
    const before = JSON.parse(readFileSync(baselinePath));
    assert.equal(before.payloadHash, hash(batch), "Reviewed payload changed");
    let audit;
    const rehearsalRollback = new Error("REHEARSAL_ROLLBACK");
    try {
      await sql.transaction(async (tx) => {
        await tx`set local lock_timeout='10s'`;
        await tx`select current_revision_id from catalogue_publish_state where id=1 for update`;
        // Protect against direct legacy importers as well as the revision-locked publisher.
        await tx`lock table events, editions, edition_entry_options, event_distances, slug_redirects, catalogue_import_batches, race_collector_candidates in share row exclusive mode`;
        const prior = await tx.query(
          "select payload_hash,status,publish_summary from catalogue_import_batches where source_key=$1 and status <> 'rolled_back'",
          [batch.sourceKey],
        );
        if (prior.length) {
          assert.equal(prior.length, 1);
          assert.equal(
            prior[0].payload_hash,
            hash({ events: batch.events, editions: batch.editions }),
          );
          assert.equal(prior[0].status, "published");
          audit = {
            mode,
            reused: true,
            result: prior[0].publish_summary,
            ...(await verify(tx, before, prior[0].publish_summary)),
          };
          return;
        }
        const current = await snapshot(tx);
        assert.deepEqual(
          current,
          before,
          "Database baseline changed; review and rehearse a fresh snapshot",
        );
        assert.deepEqual(
          before.records.events.map((x) => x.record.id),
          existingIds,
        );
        assert.deepEqual(
          before.records.editions.map((x) => x.record.id),
          existingEditionIds,
        );
        assert(!before.identities.some((x) => newSlugs.includes(x.record.slug)));
        const staged = await publisher.stageCatalogueBatch(batch, actor, tx);
        const validation = await publisher.validateCatalogueBatch(staged.batchId, tx);
        assert.equal(validation.status, "ready", JSON.stringify(validation));
        const result = await publisher.publishCatalogueBatch(staged.batchId, actor, tx);
        audit = { mode, reused: false, validation, result, ...(await verify(tx, before, result)) };
        if (mode === "rehearse") throw rehearsalRollback;
      });
    } catch (error) {
      if (error !== rehearsalRollback) throw error;
    }
    if (mode === "rehearse")
      assert.deepEqual(await snapshot(sql), before, "Rehearsal rollback changed live data");
    write(auditPath, audit);
    console.log(
      JSON.stringify({
        mode,
        reused: audit.reused,
        result: audit.result,
        counts: audit.counts,
        newEditionIds: audit.newEditionIds,
      }),
    );
  }
} finally {
  await vite.close();
}
