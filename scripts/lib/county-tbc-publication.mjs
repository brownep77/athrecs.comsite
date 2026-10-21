import assert from "node:assert/strict";
import { createHash } from "node:crypto";

const fields = [
  "id",
  "event_id",
  "event_date",
  "distance_code",
  "distance_km",
  "status",
  "entry_url",
  "source_url",
  "start_time",
  "notes",
  "end_date",
  "end_time",
  "end_source_url",
  "end_checked_at",
];
const project = (row) => Object.fromEntries(fields.map((field) => [field, row[field] ?? null]));
const hash = (payload) => createHash("sha256").update(JSON.stringify(payload)).digest("hex");

export function reviewedCountyBatches(data, baseline) {
  assert.equal(data.reviewedEditionKeys.length, 139);
  assert.equal(new Set(data.reviewedEditionKeys).size, 139);
  const events = new Map(baseline.events.map((event) => [event.id, event]));
  const rows = new Map(
    baseline.editions.map((row) => [
      `${events.get(row.event_id).slug}|${row.event_date}|${row.distance_code}`,
      row,
    ]),
  );
  const editions = data.reviewedEditionKeys.map((key) => {
    const row = rows.get(key);
    assert(row, `Missing reviewed baseline: ${key}`);
    const slug = events.get(row.event_id).slug;
    const detail = data.details[`${slug}|${row.event_date}`];
    const start = detail.starts[row.distance_code];
    assert.equal(detail.checkedAt, data.checkedAt);
    return {
      eventSlug: slug,
      date: row.event_date,
      distance: row.distance_code,
      distanceKm: Number(row.distance_km),
      status: row.status,
      ...(start.time === null ? {} : { startTime: start.time }),
      source: start.sourceUrl ?? detail.sourceUrl,
      notes: [
        row.notes,
        `Rechecked ${data.checkedAt} against ${start.sourceUrl ?? detail.sourceUrl}. ${start.note ?? ""}`,
      ]
        .filter(Boolean)
        .join("\n"),
    };
  });
  const batches = [];
  for (let index = 0; index < editions.length; index += 30) {
    const slice = editions.slice(index, index + 30);
    batches.push({
      sourceKey: `${data.sourcePrefix}:${batches.length + 1}`,
      sourceUrl: "https://www.athrecs.com/races/places/europe/united-kingdom",
      editions: slice,
      expected: data.reviewedEditionKeys.slice(index, index + 30).map((key) => rows.get(key)),
    });
  }
  return batches;
}

/** Reviewed edition metadata only, with fresh baselines and the native before/after ledger. */
export async function publishCountyTbcReview(sql, publishing, data, baseline) {
  const results = [];
  for (const { expected, ...batch } of reviewedCountyBatches(data, baseline)) {
    results.push(
      await sql.transaction(async (tx) => {
        await tx.query("set local lock_timeout='15s'");
        await tx.query("select id from catalogue_publish_state where id=1 for update");
        await tx.query(
          "lock table events, editions, catalogue_import_batches in share row exclusive mode",
        );
        const payloadHash = hash({ events: [], editions: batch.editions });
        const prior = await tx.query(
          "select payload_hash,status,publish_summary from catalogue_import_batches where source_key=$1",
          [batch.sourceKey],
        );
        if (prior.length) {
          assert.equal(prior.length, 1);
          assert.equal(
            prior[0].payload_hash,
            payloadHash,
            "Reviewed payload changed after staging",
          );
          assert.equal(prior[0].status, "published", "Existing review batch needs attention");
          return { alreadyPublished: true, ...prior[0].publish_summary };
        }
        const pending = await tx.query(
          `select b.id from catalogue_import_batches b
        where b.status not in ('published','rolled_back') and exists (
          select 1 from jsonb_array_elements(coalesce(b.payload->'events','[]'::jsonb)||coalesce(b.payload->'editions','[]'::jsonb)) x
          where coalesce(x->>'slug',x->>'eventSlug')=any($1::text[]))`,
          [[...new Set(batch.editions.map((edition) => edition.eventSlug))]],
        );
        assert.equal(pending.length, 0, "Overlapping pending batch needs review");
        for (const [index, edition] of batch.editions.entries()) {
          const rows = await tx.query(
            `select d.*,d.event_date::text as event_date,d.end_date::text as end_date,d.end_checked_at::text as end_checked_at
          from editions d join events e on e.id=d.event_id
          where e.slug=$1 and d.event_date=$2::date and d.distance_code=$3 for update of d,e`,
            [edition.eventSlug, edition.date, edition.distance],
          );
          assert.equal(rows.length, 1, "Reviewed edition missing or ambiguous");
          assert.deepEqual(
            project(rows[0]),
            project(expected[index]),
            "Reviewed edition baseline changed",
          );
        }
        const actor = "athrecs-county-review@athrecs.com";
        const staged = await publishing.stageCatalogueBatch(batch, actor, tx);
        const validation = await publishing.validateCatalogueBatch(staged.batchId, tx);
        assert.equal(validation.status, "ready", JSON.stringify(validation));
        const result = await publishing.publishCatalogueBatch(staged.batchId, actor, tx);
        const audit = await tx.query(
          "select entity_type,operation from catalogue_change_log where revision_id=$1",
          [result.revisionId],
        );
        assert.equal(
          audit.filter((row) => row.entity_type === "edition" && row.operation === "update").length,
          batch.editions.length,
        );
        assert.equal(
          audit.filter((row) => row.entity_type === "edition" && row.operation === "insert").length,
          0,
        );
        return result;
      }),
    );
  }
  return results;
}
