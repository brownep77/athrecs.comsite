import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const fields = [
  "id",
  "slug",
  "name",
  "sport",
  "country",
  "county",
  "city",
  "area",
  "surface",
  "summary",
  "description",
  "organiser",
  "website",
];
const project = (row) => Object.fromEntries(fields.map((field) => [field, row[field] ?? null]));
const hash = (payload) => createHash("sha256").update(JSON.stringify(payload)).digest("hex");
export function countyBatches(data) {
  const batches = [];
  for (let index = 0; index < data.events.length; index += 60) {
    const events = data.events.slice(index, index + 60);
    const slugs = new Set(events.map((event) => event.slug));
    batches.push({
      sourceKey: `athrecs:county-expansion:2026-10-21:${batches.length + 1}`,
      sourceUrl: "https://www.athrecs.com/races/places/europe/united-kingdom",
      events,
      editions: data.editions.filter((edition) => slugs.has(edition.eventSlug)),
    });
  }
  return batches;
}

/** Reviewed public fixtures only. No athlete or result records are changed. */
export async function publishCountyExpansion(sql, publishing, data, baseline) {
  assert.equal(data.events.length, 76);
  assert.equal(data.editions.length, 167);
  const results = [];
  for (const batch of countyBatches(data)) {
    assert(batch.events.length <= 60 && batch.editions.length <= 200);
    results.push(
      await sql.transaction(async (tx) => {
        await tx.query("set local lock_timeout='15s'");
        await tx.query("select id from catalogue_publish_state where id=1 for update");
        await tx.query(
          "lock table events, editions, catalogue_import_batches in share row exclusive mode",
        );
        const payloadHash = hash({ events: batch.events, editions: batch.editions });
        const prior = await tx.query(
          "select payload_hash,status,publish_summary from catalogue_import_batches where source_key=$1",
          [batch.sourceKey],
        );
        if (prior.length) {
          assert.equal(prior.length, 1, "Source key has multiple batches");
          assert.equal(
            prior[0].payload_hash,
            payloadHash,
            "Reviewed payload changed after staging",
          );
          assert.equal(prior[0].status, "published", "Existing batch needs review");
          return { alreadyPublished: true, ...prior[0].publish_summary };
        }
        const slugs = batch.events.map((event) => event.slug);
        const before = await tx.query(
          `select ${fields.join(",")} from events where slug=any($1::text[]) order by slug for update`,
          [slugs],
        );
        const expected = baseline.events
          .filter((event) => slugs.includes(event.slug))
          .map(project)
          .sort((a, b) => a.slug.localeCompare(b.slug));
        assert.deepEqual(
          before.map(project),
          expected,
          "County event baseline changed; review before publishing",
        );
        const aliases = await tx.query(
          "select old_slug from slug_redirects where entity_type='event' and old_slug=any($1::text[])",
          [slugs],
        );
        assert.equal(aliases.length, 0, "A reviewed slug became an alias");
        const pending = await tx.query(
          `select b.id from catalogue_import_batches b
        where b.status not in ('published','rolled_back') and exists (
          select 1 from jsonb_array_elements(coalesce(b.payload->'events','[]'::jsonb)||coalesce(b.payload->'editions','[]'::jsonb)) x
          where coalesce(x->>'slug',x->>'eventSlug')=any($1::text[]))`,
          [slugs],
        );
        assert.equal(pending.length, 0, "Overlapping pending batch needs review");
        const overlaps = await tx.query(
          `select e.slug,d.event_date,d.distance_code from editions d join events e on e.id=d.event_id
        join jsonb_to_recordset($1::jsonb) r("eventSlug" text,date text,distance text)
        on e.slug=r."eventSlug" and d.event_date=r.date::date and d.distance_code=r.distance`,
          [JSON.stringify(batch.editions)],
        );
        assert.equal(overlaps.length, 0, "An intended new edition already exists");
        const duplicateNames = await tx.query(
          `select e.slug from events e
        join jsonb_to_recordset($1::jsonb) r(slug text,name text,sport text)
        on e.sport=r.sport and e.slug<>r.slug and
          regexp_replace(lower(e.name),'[^a-z0-9]','','g')=regexp_replace(lower(r.name),'[^a-z0-9]','','g')`,
          [JSON.stringify(batch.events)],
        );
        assert.equal(duplicateNames.length, 0, "New matching identity needs review");
        const actor = "athrecs-county-review@athrecs.com";
        const staged = await publishing.stageCatalogueBatch(batch, actor, tx);
        const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
        assert.equal(validation.status, "ready", JSON.stringify(validation));
        const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx, {
          reviewedEventMetadata: expected.map((event) => ({ slug: event.slug, expected: event })),
        });
        const audit = await tx.query(
          "select entity_type,operation from catalogue_change_log where revision_id=$1",
          [result.revisionId],
        );
        assert.equal(
          audit.filter(
            (change) => change.entity_type === "edition" && change.operation === "insert",
          ).length,
          batch.editions.length,
        );
        assert.equal(
          audit.filter((change) => change.entity_type === "event" && change.operation === "insert")
            .length,
          batch.events.length - before.length,
        );
        return result;
      }),
    );
  }
  return results;
}
