import { createHash, randomUUID } from "node:crypto";
import { dbSource, getSql, type Sql } from "@/lib/db";
import {
  applyImportBundle,
  slugify,
  type ImportBundle,
  type ImportEditionInput,
  type ImportEventInput,
} from "./import.server";

const SPORTS = new Set([
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
]);

const EDITION_STATUSES = new Set(["Open", "ClosingSoon", "Closed", "Finished", "TBC"]);
const ENTRY_TYPES = new Set(["official", "third_party", "charity", "tour_operator"]);
const ENTRY_STATUSES = new Set([
  "open",
  "closing_soon",
  "ballot",
  "waitlist",
  "sold_out",
  "closed",
  "unknown",
]);

export type CatalogueBatchInput = {
  sourceKey: string;
  sourceUrl?: string;
  events?: ImportEventInput[];
  editions?: ImportEditionInput[];
};

type StoredBatchRow = {
  id: string;
  source_key: string;
  source_url: string | null;
  payload_hash: string;
  payload: ImportBundle | string;
  status: string;
  submitted_by: string;
  submitted_at: string;
  validated_at: string | null;
  published_at: string | null;
  validation_summary: Record<string, unknown> | string | null;
  publish_summary: Record<string, unknown> | string | null;
  error: string | null;
};

type EventSnapshot = {
  record: Record<string, unknown>;
  distances: string[];
};

type EditionSnapshot = {
  record: Record<string, unknown>;
  entryOptions: Record<string, unknown>[];
};

type ChangeRow = {
  id: number;
  entity_type: "event" | "edition";
  entity_key: string;
  operation: "insert" | "update";
  before_json: EventSnapshot | EditionSnapshot | string | null;
  after_json: EventSnapshot | EditionSnapshot | string;
};

function jsonValue<T>(value: unknown): T | null {
  if (value == null) return null;
  return typeof value === "string" ? (JSON.parse(value) as T) : (value as T);
}

function bundleFromRow(row: StoredBatchRow): ImportBundle {
  const parsed = jsonValue<ImportBundle>(row.payload);
  return {
    events: parsed?.events ?? [],
    editions: parsed?.editions ?? [],
  };
}

function isHttpUrl(value: string | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isIsoDate(value: string | undefined): boolean {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function eventSlug(event: ImportEventInput): string {
  return slugify(event.slug || event.name);
}

function editionSlug(edition: ImportEditionInput): string {
  return slugify(edition.eventSlug || edition.eventName || "");
}

function editionKey(edition: ImportEditionInput): string {
  return `${editionSlug(edition)}|${edition.date}|${edition.distance}`;
}

async function loadBatch(sql: Sql, batchId: string, lock = false): Promise<StoredBatchRow> {
  const rows = await sql.query<StoredBatchRow>(
    `select
       id,
       source_key,
       source_url,
       payload_hash,
       payload,
       status,
       submitted_by,
       submitted_at::text as submitted_at,
       validated_at::text as validated_at,
       published_at::text as published_at,
       validation_summary,
       publish_summary,
       error
     from catalogue_import_batches
     where id = $1
     limit 1${lock ? " for update" : ""}`,
    [batchId],
  );
  if (!rows[0]) throw new Error("Catalogue batch not found");
  return rows[0];
}

async function eventExists(sql: Sql, slug: string): Promise<boolean> {
  const rows = await sql<{ exists: boolean }>`
    select exists(select 1 from events where slug = ${slug}) as exists
  `;
  return rows[0]?.exists === true;
}

async function historicSlugExists(sql: Sql, slug: string): Promise<boolean> {
  const rows = await sql<{ exists: boolean }>`
    select exists(
      select 1
      from slug_redirects
      where entity_type = 'event' and old_slug = ${slug}
    ) as exists
  `;
  return rows[0]?.exists === true;
}

function eventErrors(event: ImportEventInput): string[] {
  const errors: string[] = [];
  if (!event.name?.trim()) errors.push("Event name is required");
  if (!eventSlug(event)) errors.push("A permanent slug could not be generated");
  if (!SPORTS.has(event.sport?.trim()))
    errors.push(`Unsupported sport: ${event.sport || "<blank>"}`);
  if (event.website && !isHttpUrl(event.website)) errors.push("Website must be an http(s) URL");
  if (!event.country?.trim()) errors.push("Country is required");
  return errors;
}

function editionErrors(edition: ImportEditionInput): string[] {
  const errors: string[] = [];
  if (!editionSlug(edition)) errors.push("Edition needs eventSlug or eventName");
  if (!isIsoDate(edition.date)) errors.push("Edition date must be a real YYYY-MM-DD date");
  if (!edition.distance?.trim()) errors.push("Edition distance is required");
  if (edition.status && !EDITION_STATUSES.has(edition.status)) {
    errors.push(`Unsupported edition status: ${edition.status}`);
  }
  if (edition.entryUrl && !isHttpUrl(edition.entryUrl)) {
    errors.push("Edition entryUrl must be an http(s) URL");
  }
  const primaryCount = (edition.entryOptions ?? []).filter((option) => option.isPrimary).length;
  if (primaryCount > 1) errors.push("An edition can have only one primary entry option");
  const providerCodes = new Set<string>();
  for (const [index, option] of (edition.entryOptions ?? []).entries()) {
    const label = `Entry option ${index + 1}`;
    if (!option.providerName?.trim()) errors.push(`${label} needs providerName`);
    const providerCode = slugify(option.providerCode || option.providerName || "");
    if (!providerCode) {
      errors.push(`${label} needs a usable provider code`);
    } else if (providerCodes.has(providerCode)) {
      errors.push(`${label} duplicates provider code: ${providerCode}`);
    } else {
      providerCodes.add(providerCode);
    }
    if (!isHttpUrl(option.entryUrl)) errors.push(`${label} entryUrl must be an http(s) URL`);
    if (option.sourceUrl && !isHttpUrl(option.sourceUrl)) {
      errors.push(`${label} sourceUrl must be an http(s) URL`);
    }
    if (option.entryType && !ENTRY_TYPES.has(option.entryType)) {
      errors.push(`${label} has an unsupported entryType`);
    }
    if (option.status && !ENTRY_STATUSES.has(option.status)) {
      errors.push(`${label} has an unsupported status`);
    }
  }
  return errors;
}

async function snapshotEvent(sql: Sql, slug: string): Promise<EventSnapshot | null> {
  const rows = await sql<{ event_json: string }>`
    select row_to_json(event)::text as event_json
    from events event
    where event.slug = ${slug}
    limit 1
  `;
  if (!rows[0]) return null;
  const distances = await sql<{ distance_code: string }>`
    select distance_code
    from event_distances
    where event_id = (
      select id from events where slug = ${slug} limit 1
    )
    order by distance_code
  `;
  return {
    record: JSON.parse(rows[0].event_json) as Record<string, unknown>,
    distances: distances.map((row) => row.distance_code),
  };
}

async function snapshotEdition(
  sql: Sql,
  slug: string,
  date: string,
  distance: string,
): Promise<EditionSnapshot | null> {
  const rows = await sql<{ edition_json: string }>`
    select row_to_json(edition)::text as edition_json
    from editions edition
    join events event on event.id = edition.event_id
    where event.slug = ${slug}
      and edition.event_date = ${date}::date
      and edition.distance_code = ${distance}
    limit 1
  `;
  if (!rows[0]) return null;
  const record = JSON.parse(rows[0].edition_json) as Record<string, unknown>;
  const options = await sql<{ option_json: string }>`
    select row_to_json(option)::text as option_json
    from edition_entry_options option
    where option.edition_id = ${Number(record.id)}
    order by option.is_primary, option.provider_code
  `;
  return {
    record,
    entryOptions: options.map((row) => JSON.parse(row.option_json) as Record<string, unknown>),
  };
}

async function insertChange(
  sql: Sql,
  revisionId: number,
  entityType: "event" | "edition",
  entityKey: string,
  before: EventSnapshot | EditionSnapshot | null,
  after: EventSnapshot | EditionSnapshot,
): Promise<void> {
  await sql.query(
    `insert into catalogue_change_log (
       revision_id,
       entity_type,
       entity_key,
       operation,
       before_json,
       after_json
     ) values ($1, $2, $3, $4, $5::jsonb, $6::jsonb)`,
    [
      revisionId,
      entityType,
      entityKey,
      before ? "update" : "insert",
      before ? JSON.stringify(before) : null,
      JSON.stringify(after),
    ],
  );
}

function assertSnapshotUnchanged<T>(current: T | null, expected: T, entityKey: string): void {
  if (current == null || JSON.stringify(current) !== JSON.stringify(expected)) {
    throw new Error(
      `Revision cannot be rolled back because ${entityKey} changed after publication`,
    );
  }
}

async function lockCurrentEventSnapshot(
  sql: Sql,
  eventId: number,
  entityKey: string,
): Promise<EventSnapshot | null> {
  await sql`select id from events where id = ${eventId} for update`;
  await sql`select event_id from event_distances where event_id = ${eventId} for update`;
  return snapshotEvent(sql, entityKey);
}

async function lockCurrentEditionSnapshot(
  sql: Sql,
  editionId: number,
  entityKey: string,
): Promise<EditionSnapshot | null> {
  await sql`select id from editions where id = ${editionId} for update`;
  await sql`
    select id
    from edition_entry_options
    where edition_id = ${editionId}
    for update
  `;
  const firstSeparator = entityKey.indexOf("|");
  const secondSeparator = entityKey.indexOf("|", firstSeparator + 1);
  if (firstSeparator < 1 || secondSeparator < 0) {
    throw new Error(`Invalid edition revision key: ${entityKey}`);
  }
  return snapshotEdition(
    sql,
    entityKey.slice(0, firstSeparator),
    entityKey.slice(firstSeparator + 1, secondSeparator),
    entityKey.slice(secondSeparator + 1),
  );
}

export async function stageCatalogueBatch(
  input: CatalogueBatchInput,
  submittedBy: string,
): Promise<{ batchId: string; reused: boolean }> {
  const sourceKey = input.sourceKey?.trim();
  if (!sourceKey) throw new Error("sourceKey is required");
  if (input.sourceUrl && !isHttpUrl(input.sourceUrl)) {
    throw new Error("sourceUrl must be an http(s) URL");
  }

  const payload: ImportBundle = {
    events: input.events ?? [],
    editions: input.editions ?? [],
  };
  if (!payload.events?.length && !payload.editions?.length) {
    throw new Error("The batch must contain at least one event or edition");
  }

  const payloadText = JSON.stringify(payload);
  const payloadHash = createHash("sha256").update(payloadText).digest("hex");
  const sql = await getSql();
  const existing = await sql<{ id: string }>`
    select id
    from catalogue_import_batches
    where source_key = ${sourceKey}
      and payload_hash = ${payloadHash}
      and status <> 'rolled_back'
    order by submitted_at desc
    limit 1
  `;
  if (existing[0]) return { batchId: existing[0].id, reused: true };

  const batchId = randomUUID();
  await sql.transaction(async (tx) => {
    await tx.query(
      `insert into catalogue_import_batches (
         id,
         source_key,
         source_url,
         payload_hash,
         payload,
         submitted_by
       ) values ($1, $2, $3, $4, $5::jsonb, $6)`,
      [batchId, sourceKey, input.sourceUrl?.trim() || null, payloadHash, payloadText, submittedBy],
    );

    for (const [index, event] of (payload.events ?? []).entries()) {
      await tx.query(
        `insert into catalogue_staged_rows (
           batch_id, row_type, row_number, natural_key, payload
         ) values ($1, 'event', $2, $3, $4::jsonb)`,
        [
          batchId,
          index + 1,
          eventSlug(event) || `invalid-event-${index + 1}`,
          JSON.stringify(event),
        ],
      );
    }
    for (const [index, edition] of (payload.editions ?? []).entries()) {
      await tx.query(
        `insert into catalogue_staged_rows (
           batch_id, row_type, row_number, natural_key, payload
         ) values ($1, 'edition', $2, $3, $4::jsonb)`,
        [
          batchId,
          index + 1,
          editionKey(edition) || `invalid-edition-${index + 1}`,
          JSON.stringify(edition),
        ],
      );
    }
  });

  return { batchId, reused: false };
}

export async function validateCatalogueBatch(batchId: string) {
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const batch = await loadBatch(tx, batchId, true);
    if (batch.status === "published" || batch.status === "rolled_back") {
      throw new Error(`A ${batch.status} batch cannot be validated again`);
    }
    await tx`
      update catalogue_import_batches
      set status = 'validating', error = null
      where id = ${batchId}
    `;

    const payload = bundleFromRow(batch);
    const eventCounts = new Map<string, number>();
    const editionCounts = new Map<string, number>();
    for (const event of payload.events ?? []) {
      const slug = eventSlug(event);
      eventCounts.set(slug, (eventCounts.get(slug) ?? 0) + 1);
    }
    for (const edition of payload.editions ?? []) {
      const key = editionKey(edition);
      editionCounts.set(key, (editionCounts.get(key) ?? 0) + 1);
    }

    const eventSlugSet = new Set((payload.events ?? []).map(eventSlug));
    const allErrors: string[] = [];
    let invalidRows = 0;

    for (const [index, event] of (payload.events ?? []).entries()) {
      const slug = eventSlug(event);
      const errors = eventErrors(event);
      if ((eventCounts.get(slug) ?? 0) > 1) errors.push(`Duplicate event slug in batch: ${slug}`);
      if (slug && (await historicSlugExists(tx, slug))) {
        errors.push(`Slug is reserved by a permanent historic URL: ${slug}`);
      }
      if (errors.length) {
        invalidRows += 1;
        allErrors.push(...errors.map((error) => `Event ${index + 1}: ${error}`));
      }
      await tx.query(
        `update catalogue_staged_rows
         set validation_errors = $3::jsonb
         where batch_id = $1 and row_type = 'event' and row_number = $2`,
        [batchId, index + 1, JSON.stringify(errors)],
      );
    }

    for (const [index, edition] of (payload.editions ?? []).entries()) {
      const slug = editionSlug(edition);
      const key = editionKey(edition);
      const errors = editionErrors(edition);
      if ((editionCounts.get(key) ?? 0) > 1) {
        errors.push(`Duplicate edition in batch: ${key}`);
      }
      if (slug && !eventSlugSet.has(slug) && !(await eventExists(tx, slug))) {
        errors.push(`Referenced event does not exist: ${slug}`);
      }
      if (errors.length) {
        invalidRows += 1;
        allErrors.push(...errors.map((error) => `Edition ${index + 1}: ${error}`));
      }
      await tx.query(
        `update catalogue_staged_rows
         set validation_errors = $3::jsonb
         where batch_id = $1 and row_type = 'edition' and row_number = $2`,
        [batchId, index + 1, JSON.stringify(errors)],
      );
    }

    const summary = {
      events: payload.events?.length ?? 0,
      editions: payload.editions?.length ?? 0,
      invalidRows,
      errors: allErrors.slice(0, 100),
    };
    await tx.query(
      `update catalogue_import_batches
       set status = $2,
           validated_at = now(),
           validation_summary = $3::jsonb,
           error = $4
       where id = $1`,
      [
        batchId,
        invalidRows ? "invalid" : "ready",
        JSON.stringify(summary),
        invalidRows ? `${invalidRows} staged row(s) need review` : null,
      ],
    );
    return { batchId, status: invalidRows ? "invalid" : "ready", ...summary };
  });
}

export async function publishCatalogueBatch(batchId: string, publishedBy: string) {
  if (dbSource !== "neon") {
    throw new Error("Persistent Neon Postgres is required before publishing a catalogue batch");
  }
  const sql = await getSql();
  try {
    return await sql.transaction(async (tx) => {
      const stateRows = await tx<{ current_revision_id: number | null }>`
        select current_revision_id
        from catalogue_publish_state
        where id = 1
        for update
      `;
      const previousRevisionId = stateRows[0]?.current_revision_id ?? null;
      const batch = await loadBatch(tx, batchId, true);
      if (batch.status !== "ready") {
        throw new Error("Only a validated, ready batch can be published");
      }
      const payload = bundleFromRow(batch);
      await tx`
        update catalogue_import_batches
        set status = 'publishing', error = null
        where id = ${batchId}
      `;

      const eventSlugs = [...new Set((payload.events ?? []).map(eventSlug).filter(Boolean))];
      const editionInputs = [
        ...new Map(
          (payload.editions ?? []).map((edition) => [editionKey(edition), edition]),
        ).values(),
      ];

      const suppliedEventSlugs = new Set(eventSlugs);
      for (const slug of eventSlugs) {
        await tx`select id from events where slug = ${slug} for update`;
      }
      for (const edition of editionInputs) {
        const slug = editionSlug(edition);
        if (!suppliedEventSlugs.has(slug)) {
          const referencedEvents = await tx<{ id: number }>`
            select id from events where slug = ${slug} for update
          `;
          if (!referencedEvents[0]) {
            throw new Error(`Referenced event disappeared after validation: ${slug}`);
          }
        }
        const existingEditions = await tx<{ id: number }>`
          select edition.id
          from editions edition
          join events event on event.id = edition.event_id
          where event.slug = ${slug}
            and edition.event_date = ${edition.date}::date
            and edition.distance_code = ${edition.distance}
          for update of edition
        `;
        if (existingEditions[0]) {
          await tx`
            select id
            from edition_entry_options
            where edition_id = ${existingEditions[0].id}
            for update
          `;
        }
      }

      const beforeEvents = new Map<string, EventSnapshot | null>();
      for (const slug of eventSlugs) beforeEvents.set(slug, await snapshotEvent(tx, slug));

      const beforeEditions = new Map<string, EditionSnapshot | null>();
      for (const edition of editionInputs) {
        beforeEditions.set(
          editionKey(edition),
          await snapshotEdition(tx, editionSlug(edition), edition.date, edition.distance),
        );
      }

      const revisionRows = await tx<{ id: number }>`
        insert into catalogue_revisions (
          batch_id,
          previous_revision_id,
          published_by
        ) values (
          ${batchId},
          ${previousRevisionId},
          ${publishedBy}
        )
        returning id
      `;
      const revisionId = revisionRows[0]?.id;
      if (!revisionId) throw new Error("Could not create catalogue revision");

      const result = await applyImportBundle(payload, {
        sqlOverride: tx,
        preserveExistingEvents: true,
        preserveExistingPrimaryEntry: true,
      });
      if (result.errors.length) {
        throw new Error(`Catalogue publication failed: ${result.errors.join("; ")}`);
      }

      for (const slug of eventSlugs) {
        const after = await snapshotEvent(tx, slug);
        if (!after) throw new Error(`Published event is missing: ${slug}`);
        await insertChange(tx, revisionId, "event", slug, beforeEvents.get(slug) ?? null, after);
      }

      for (const edition of editionInputs) {
        const key = editionKey(edition);
        const after = await snapshotEdition(
          tx,
          editionSlug(edition),
          edition.date,
          edition.distance,
        );
        if (!after) throw new Error(`Published edition is missing: ${key}`);
        await insertChange(tx, revisionId, "edition", key, beforeEditions.get(key) ?? null, after);
      }

      const summary = {
        eventsUpserted: result.eventsUpserted,
        editionsUpserted: result.editionsUpserted,
        entryOptionsUpserted: result.entryOptionsUpserted,
        revisionId,
      };

      await tx.query(
        `update catalogue_revisions
         set summary = $2::jsonb
         where id = $1`,
        [revisionId, JSON.stringify(summary)],
      );
      await tx.query(
        `update catalogue_import_batches
         set status = 'published',
             published_at = now(),
             publish_summary = $2::jsonb,
             error = null
         where id = $1`,
        [batchId, JSON.stringify(summary)],
      );
      await tx`
        update catalogue_publish_state
        set current_revision_id = ${revisionId}, updated_at = now()
        where id = 1
      `;

      return { batchId, ...summary };
    });
  } catch (error) {
    await sql`
      update catalogue_import_batches
      set status = case when status = 'published' then status else 'failed' end,
          error = ${error instanceof Error ? error.message : String(error)}
      where id = ${batchId}
    `;
    throw error;
  }
}

async function restoreEntryOptions(
  sql: Sql,
  editionId: number,
  options: Record<string, unknown>[],
): Promise<void> {
  await sql`delete from edition_entry_options where edition_id = ${editionId}`;
  const ordered = [...options].sort(
    (left, right) => Number(Boolean(left.is_primary)) - Number(Boolean(right.is_primary)),
  );
  for (const option of ordered) {
    await sql.query(
      `insert into edition_entry_options (
         id,
         edition_id,
         provider_code,
         provider_name,
         entry_url,
         entry_type,
         status,
         price_amount,
         price_currency,
         opens_at,
         closes_at,
         checked_at,
         source_url,
         is_verified,
         is_primary,
         created_at,
         updated_at
       ) values (
         $1, $2, $3, $4, $5, $6, $7, $8, $9,
         $10::date, $11::date, $12::timestamptz, $13,
         $14, $15, $16::timestamptz, $17::timestamptz
       )`,
      [
        option.id,
        editionId,
        option.provider_code,
        option.provider_name,
        option.entry_url,
        option.entry_type,
        option.status,
        option.price_amount ?? null,
        option.price_currency ?? null,
        option.opens_at ?? null,
        option.closes_at ?? null,
        option.checked_at,
        option.source_url ?? null,
        option.is_verified ?? false,
        option.is_primary ?? false,
        option.created_at,
        option.updated_at,
      ],
    );
  }
}

async function rollbackEdition(sql: Sql, change: ChangeRow): Promise<void> {
  const after = jsonValue<EditionSnapshot>(change.after_json);
  if (!after) throw new Error(`Missing after snapshot for ${change.entity_key}`);
  const editionId = Number(after.record.id);
  const current = await lockCurrentEditionSnapshot(sql, editionId, change.entity_key);
  assertSnapshotUnchanged(current, after, change.entity_key);

  if (change.operation === "insert") {
    const dependencies = await sql<{ results: number; result_links: number }>`
      select
        (select count(*)::int from results where edition_id = ${editionId}) as results,
        (select count(*)::int from edition_result_links where edition_id = ${editionId}) as result_links
    `;
    if ((dependencies[0]?.results ?? 0) > 0 || (dependencies[0]?.result_links ?? 0) > 0) {
      throw new Error(
        `Revision cannot be rolled back because ${change.entity_key} has results added after publication`,
      );
    }
    await sql`delete from editions where id = ${editionId}`;
    return;
  }

  const before = jsonValue<EditionSnapshot>(change.before_json);
  if (!before) throw new Error(`Missing before snapshot for ${change.entity_key}`);
  const record = before.record;
  await sql.query(
    `update editions
     set distance_km = $2,
         status = $3,
         entry_url = $4,
         source_url = $5,
         start_time = $6
     where id = $1`,
    [
      Number(record.id),
      record.distance_km,
      record.status,
      record.entry_url ?? null,
      record.source_url ?? null,
      record.start_time ?? null,
    ],
  );
  await restoreEntryOptions(sql, Number(record.id), before.entryOptions);
}

async function rollbackEvent(sql: Sql, change: ChangeRow): Promise<void> {
  const after = jsonValue<EventSnapshot>(change.after_json);
  if (!after) throw new Error(`Missing after snapshot for ${change.entity_key}`);
  const eventId = Number(after.record.id);
  const current = await lockCurrentEventSnapshot(sql, eventId, change.entity_key);
  assertSnapshotUnchanged(current, after, change.entity_key);

  if (change.operation === "insert") {
    const dependencies = await sql<{ editions: number; groups: number }>`
      select
        (select count(*)::int from editions where event_id = ${eventId}) as editions,
        (select count(*)::int from event_groups where event_id = ${eventId}) as groups
    `;
    if ((dependencies[0]?.editions ?? 0) > 0 || (dependencies[0]?.groups ?? 0) > 0) {
      throw new Error(
        `Revision cannot be rolled back because ${change.entity_key} has later dependent data`,
      );
    }
    await sql`delete from events where id = ${eventId}`;
    return;
  }

  const before = jsonValue<EventSnapshot>(change.before_json);
  if (!before) throw new Error(`Missing before snapshot for ${change.entity_key}`);
  const record = before.record;
  await sql.query(
    `update events
     set name = $2,
         sport = $3,
         country = $4,
         county = $5,
         city = $6,
         area = $7,
         surface = $8,
         summary = $9,
         description = $10,
         organiser = $11,
         website = $12,
         featured = $13
     where id = $1`,
    [
      Number(record.id),
      record.name,
      record.sport,
      record.country,
      record.county,
      record.city,
      record.area,
      record.surface,
      record.summary,
      record.description,
      record.organiser,
      record.website,
      record.featured,
    ],
  );
  await sql`delete from event_distances where event_id = ${Number(record.id)}`;
  for (const distance of before.distances) {
    await sql`
      insert into event_distances (event_id, distance_code)
      values (${Number(record.id)}, ${distance})
      on conflict do nothing
    `;
  }
}

export async function rollbackCatalogueRevision(revisionId: number, rolledBackBy: string) {
  if (dbSource !== "neon") {
    throw new Error(
      "Persistent Neon Postgres is required before rolling back a catalogue revision",
    );
  }
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const stateRows = await tx<{ current_revision_id: number | null }>`
      select current_revision_id
      from catalogue_publish_state
      where id = 1
      for update
    `;
    if (stateRows[0]?.current_revision_id !== revisionId) {
      throw new Error("Only the latest published catalogue revision can be rolled back");
    }

    const revisions = await tx<{
      batch_id: string;
      previous_revision_id: number | null;
      status: string;
    }>`
      select batch_id, previous_revision_id, status
      from catalogue_revisions
      where id = ${revisionId}
      for update
    `;
    const revision = revisions[0];
    if (!revision || revision.status !== "published") {
      throw new Error("Published catalogue revision not found");
    }

    const changes = await tx<ChangeRow>`
      select id, entity_type, entity_key, operation, before_json, after_json
      from catalogue_change_log
      where revision_id = ${revisionId}
      order by id desc
    `;
    for (const change of changes.filter((row) => row.entity_type === "edition")) {
      await rollbackEdition(tx, change);
    }
    for (const change of changes.filter((row) => row.entity_type === "event")) {
      await rollbackEvent(tx, change);
    }

    await tx`
      update catalogue_revisions
      set status = 'rolled_back',
          rolled_back_by = ${rolledBackBy},
          rolled_back_at = now()
      where id = ${revisionId}
    `;
    await tx`
      update catalogue_import_batches
      set status = 'rolled_back'
      where id = ${revision.batch_id}
    `;
    await tx`
      update catalogue_publish_state
      set current_revision_id = ${revision.previous_revision_id},
          updated_at = now()
      where id = 1
    `;
    return { revisionId, batchId: revision.batch_id, status: "rolled_back" as const };
  });
}

export async function getCataloguePublishingDashboard() {
  const sql = await getSql();
  const batches = await sql<StoredBatchRow>`
    select
      id,
      source_key,
      source_url,
      payload_hash,
      payload,
      status,
      submitted_by,
      submitted_at::text as submitted_at,
      validated_at::text as validated_at,
      published_at::text as published_at,
      validation_summary,
      publish_summary,
      error
    from catalogue_import_batches
    order by submitted_at desc
    limit 25
  `;
  const revisions = await sql<{
    id: number;
    batch_id: string;
    previous_revision_id: number | null;
    status: string;
    summary: Record<string, unknown> | string;
    published_by: string;
    published_at: string;
    rolled_back_by: string | null;
    rolled_back_at: string | null;
  }>`
    select
      id,
      batch_id,
      previous_revision_id,
      status,
      summary,
      published_by,
      published_at::text as published_at,
      rolled_back_by,
      rolled_back_at::text as rolled_back_at
    from catalogue_revisions
    order by id desc
    limit 25
  `;
  const state = await sql<{ current_revision_id: number | null }>`
    select current_revision_id from catalogue_publish_state where id = 1
  `;
  return {
    backend: dbSource,
    persistent: dbSource === "neon",
    currentRevisionId: state[0]?.current_revision_id ?? null,
    batches: batches.map((row) => ({
      id: row.id,
      sourceKey: row.source_key,
      sourceUrl: row.source_url,
      payloadHash: row.payload_hash,
      status: row.status,
      submittedBy: row.submitted_by,
      submittedAt: row.submitted_at,
      validatedAt: row.validated_at,
      publishedAt: row.published_at,
      validationSummary: jsonValue<Record<string, unknown>>(row.validation_summary),
      publishSummary: jsonValue<Record<string, unknown>>(row.publish_summary),
      error: row.error,
      counts: {
        events: bundleFromRow(row).events?.length ?? 0,
        editions: bundleFromRow(row).editions?.length ?? 0,
      },
    })),
    revisions: revisions.map((row) => ({
      id: row.id,
      batchId: row.batch_id,
      previousRevisionId: row.previous_revision_id,
      status: row.status,
      summary: jsonValue<Record<string, unknown>>(row.summary) ?? {},
      publishedBy: row.published_by,
      publishedAt: row.published_at,
      rolledBackBy: row.rolled_back_by,
      rolledBackAt: row.rolled_back_at,
    })),
  };
}
