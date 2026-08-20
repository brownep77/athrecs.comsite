import { gunzipSync } from "node:zlib";
import { getSql, type Sql } from "@/lib/db";
import { normalizeEventName } from "./dedupe";
import { slugify } from "./import.server";

type SnapshotDistance = {
  code: string;
  km: number;
  surface: string;
  sourceUrl: string;
};

type SnapshotPayload = {
  raceId: string;
  editionId: string;
  name: string;
  slug: string;
  description: string;
  sport: string;
  country: string;
  county: string;
  stateProvince: string;
  city: string;
  venue: string;
  surface: string;
  organiser: string;
  website: string;
  date: string;
  startTime: string;
  status: string;
  editionStatus: string;
  entryStatus: string;
  entryUrl: string;
  sourceId: string;
  sourceUrl: string;
  sourceRowHash: string;
  confidence: string;
  qualityScore: number;
  distances: SnapshotDistance[];
  issues: Array<{
    field: string;
    issueType: string;
    priority: string;
    sourceUrl: string;
  }>;
};

type SnapshotCandidate = {
  id: string;
  sourceRaceId: string;
  sourceEditionId: string;
  sourceId: string;
  sourceUrl: string;
  sourceRowHash: string;
  fingerprint: string;
  eventName: string;
  eventSlug: string;
  eventDate: string;
  reviewItemCount: number;
  highIssueCount: number;
  blockReasons: string[];
  payload: SnapshotPayload;
};

type WorkbookSnapshot = {
  snapshotId: string;
  snapshotCreatedAt: string;
  workbookRunId: string;
  sourceCount: number;
  raceCount: number;
  editionCount: number;
  courseCount: number;
  reviewItemCount: number;
  workbookStatus: string;
  candidates: SnapshotCandidate[];
};

type CatalogueEvent = {
  id: number;
  slug: string;
  name: string;
  country: string;
  city: string;
};

type CatalogueEdition = {
  event_id: number;
  event_date: string;
  distance_code: string;
};

type ClassifiedCandidate = SnapshotCandidate & {
  status: "blocked" | "duplicate" | "eligible";
  publishEligible: boolean;
  catalogueEventId: number | null;
};

type CandidateStatusRow = {
  status: string;
  count: number;
};

let snapshotCache: WorkbookSnapshot | undefined;

async function getSnapshot(): Promise<WorkbookSnapshot> {
  if (snapshotCache) return snapshotCache;
  const { SCRAPER_WORKBOOK_SNAPSHOT_GZIP_BASE64 } =
    await import("./scraper-workbook-snapshot.server.generated");
  const json = gunzipSync(Buffer.from(SCRAPER_WORKBOOK_SNAPSHOT_GZIP_BASE64, "base64")).toString(
    "utf8",
  );
  snapshotCache = JSON.parse(json) as WorkbookSnapshot;
  if (snapshotCache.candidates.length !== snapshotCache.editionCount) {
    throw new Error(
      `Workbook snapshot is incomplete: expected ${snapshotCache.editionCount} editions, got ${snapshotCache.candidates.length}`,
    );
  }
  return snapshotCache;
}

function comparableCountry(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (
    ["united kingdom", "england", "scotland", "wales", "northern ireland", "uk", "gb"].includes(
      normalized,
    )
  ) {
    return "united-kingdom";
  }
  return normalized.replace(/[^a-z0-9]+/g, "");
}

function comparableCity(value: string): string {
  return value
    .toLowerCase()
    .replace(/,?\s*(?:gb|uk|ireland)$/i, "")
    .replace(/[^a-z0-9]+/g, "");
}

function sameCountry(a: string, b: string): boolean {
  return comparableCountry(a) === comparableCountry(b);
}

function sameCity(a: string, b: string): boolean {
  const left = comparableCity(a);
  const right = comparableCity(b);
  return !left || !right || left === right;
}

function distanceKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function addReason(reasons: string[], reason: string): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function chooseCatalogueEvent(
  candidate: SnapshotCandidate,
  bySlug: Map<string, CatalogueEvent>,
  byName: Map<string, CatalogueEvent[]>,
  byNameDate: Map<string, Set<number>>,
  eventsById: Map<number, CatalogueEvent>,
): { eventId: number | null; reason?: string } {
  const normalizedName = normalizeEventName(candidate.eventName);
  const slugMatch = bySlug.get(candidate.eventSlug);
  if (slugMatch) {
    if (
      normalizeEventName(slugMatch.name) !== normalizedName ||
      !sameCountry(slugMatch.country, candidate.payload.country)
    ) {
      return { eventId: null, reason: "possible_duplicate_slug_conflict" };
    }
    return { eventId: slugMatch.id };
  }

  const dateMatches = [
    ...(byNameDate.get(`${normalizedName}|${candidate.eventDate}`) ?? new Set<number>()),
  ]
    .map((id) => eventsById.get(id))
    .filter((event): event is CatalogueEvent => Boolean(event))
    .filter((event) => sameCountry(event.country, candidate.payload.country));
  if (dateMatches.length === 1) return { eventId: dateMatches[0].id };
  if (dateMatches.length > 1) {
    return { eventId: null, reason: "possible_duplicate_multiple_catalogue_events" };
  }

  const nameMatches = (byName.get(normalizedName) ?? []).filter(
    (event) =>
      sameCountry(event.country, candidate.payload.country) &&
      sameCity(event.city, candidate.payload.city),
  );
  if (nameMatches.length === 1) return { eventId: nameMatches[0].id };
  if (nameMatches.length > 1) {
    return { eventId: null, reason: "possible_duplicate_multiple_catalogue_events" };
  }
  return { eventId: null };
}

async function classifyCandidates(
  sql: Sql,
  candidates: SnapshotCandidate[],
): Promise<ClassifiedCandidate[]> {
  const [events, editions] = await Promise.all([
    sql<CatalogueEvent>`select id, slug, name, country, city from events`,
    sql<CatalogueEdition>`
      select event_id, event_date::text as event_date, distance_code from editions
    `,
  ]);
  const eventsById = new Map(events.map((event) => [event.id, event]));
  const bySlug = new Map(events.map((event) => [event.slug, event]));
  const byName = new Map<string, CatalogueEvent[]>();
  for (const event of events) {
    const key = normalizeEventName(event.name);
    byName.set(key, [...(byName.get(key) ?? []), event]);
  }
  const byNameDate = new Map<string, Set<number>>();
  const editionKeys = new Set<string>();
  for (const edition of editions) {
    editionKeys.add(
      `${edition.event_id}|${edition.event_date}|${distanceKey(edition.distance_code)}`,
    );
    const event = eventsById.get(edition.event_id);
    if (!event) continue;
    const key = `${normalizeEventName(event.name)}|${edition.event_date}`;
    const ids = byNameDate.get(key) ?? new Set<number>();
    ids.add(event.id);
    byNameDate.set(key, ids);
  }

  const seenFingerprints = new Set<string>();
  return candidates.map((candidate) => {
    const blockReasons = [...candidate.blockReasons];
    const match = chooseCatalogueEvent(candidate, bySlug, byName, byNameDate, eventsById);
    if (match.reason) addReason(blockReasons, match.reason);
    const hasBlockingReason = blockReasons.length > 0;

    let exactDuplicate = false;
    if (match.eventId != null && candidate.payload.distances.length > 0) {
      exactDuplicate = candidate.payload.distances.every((distance) =>
        editionKeys.has(`${match.eventId}|${candidate.eventDate}|${distanceKey(distance.code)}`),
      );
    }

    const workbookDuplicate = seenFingerprints.has(candidate.fingerprint);
    seenFingerprints.add(candidate.fingerprint);
    if (exactDuplicate) addReason(blockReasons, "exact_duplicate_in_catalogue");
    if (workbookDuplicate) addReason(blockReasons, "exact_duplicate_in_workbook");

    const status = hasBlockingReason
      ? "blocked"
      : exactDuplicate || workbookDuplicate
        ? "duplicate"
        : "eligible";
    return {
      ...candidate,
      blockReasons,
      catalogueEventId: match.eventId,
      status,
      publishEligible: status === "eligible",
    };
  });
}

function candidateRecord(candidate: ClassifiedCandidate, batchId: string) {
  return {
    id: candidate.id,
    batch_id: batchId,
    source_race_id: candidate.sourceRaceId,
    source_edition_id: candidate.sourceEditionId,
    source_id: candidate.sourceId,
    source_url: candidate.sourceUrl,
    source_row_hash: candidate.sourceRowHash,
    fingerprint: candidate.fingerprint,
    event_name: candidate.eventName,
    event_slug: candidate.eventSlug,
    event_date: candidate.eventDate,
    payload: candidate.payload,
    review_item_count: candidate.reviewItemCount,
    high_issue_count: candidate.highIssueCount,
    publish_eligible: candidate.publishEligible,
    status: candidate.status,
    block_reasons: candidate.blockReasons,
    catalogue_event_id: candidate.catalogueEventId,
  };
}

async function insertCandidateChunk(
  sql: Sql,
  batchId: string,
  candidates: ClassifiedCandidate[],
): Promise<void> {
  const records = candidates.map((candidate) => candidateRecord(candidate, batchId));
  await sql.query(
    `insert into fixture_candidates (
      id, batch_id, source_race_id, source_edition_id, source_id, source_url,
      source_row_hash, fingerprint, event_name, event_slug, event_date, payload,
      review_item_count, high_issue_count, publish_eligible, status,
      block_reasons, catalogue_event_id
    )
    select
      x.id, x.batch_id, x.source_race_id, x.source_edition_id, x.source_id,
      x.source_url, x.source_row_hash, x.fingerprint, x.event_name,
      x.event_slug, x.event_date, x.payload, x.review_item_count,
      x.high_issue_count, x.publish_eligible, x.status, x.block_reasons,
      x.catalogue_event_id
    from jsonb_to_recordset($1::jsonb) as x(
      id text, batch_id text, source_race_id text, source_edition_id text,
      source_id text, source_url text, source_row_hash text, fingerprint text,
      event_name text, event_slug text, event_date text, payload jsonb,
      review_item_count int, high_issue_count int, publish_eligible boolean,
      status text, block_reasons jsonb, catalogue_event_id int
    )
    on conflict (batch_id, source_edition_id) do update set
      source_race_id = excluded.source_race_id,
      source_id = excluded.source_id,
      source_url = excluded.source_url,
      source_row_hash = excluded.source_row_hash,
      fingerprint = excluded.fingerprint,
      event_name = excluded.event_name,
      event_slug = excluded.event_slug,
      event_date = excluded.event_date,
      payload = excluded.payload,
      review_item_count = excluded.review_item_count,
      high_issue_count = excluded.high_issue_count,
      publish_eligible = case
        when fixture_candidates.status = 'published' then false
        else excluded.publish_eligible
      end,
      status = case
        when fixture_candidates.status = 'published' then 'published'
        else excluded.status
      end,
      block_reasons = case
        when fixture_candidates.status = 'published' then fixture_candidates.block_reasons
        else excluded.block_reasons
      end,
      catalogue_event_id = coalesce(
        fixture_candidates.catalogue_event_id,
        excluded.catalogue_event_id
      )`,
    [JSON.stringify(records)],
  );
}

async function statusCounts(sql: Sql, batchId: string) {
  const rows = await sql<CandidateStatusRow>`
    select status, count(*)::int as count
    from fixture_candidates
    where batch_id = ${batchId}
    group by status
  `;
  const counts = Object.fromEntries(rows.map((row) => [row.status, row.count]));
  return {
    staged: rows.reduce((total, row) => total + row.count, 0),
    eligible: counts.eligible ?? 0,
    blocked: counts.blocked ?? 0,
    duplicates: counts.duplicate ?? 0,
    published: counts.published ?? 0,
    failed: counts.failed ?? 0,
  };
}

export async function stageScraperWorkbookSnapshot() {
  const sql = await getSql();
  const snapshot = await getSnapshot();
  const batchId = `scraper-workbook:${snapshot.snapshotId}`;
  const classified = await classifyCandidates(sql, snapshot.candidates);

  await sql.transaction(async (tx) => {
    await tx`
      insert into fixture_import_batches (
        id, snapshot_id, snapshot_created_at, source_record_count, status
      ) values (
        ${batchId}, ${snapshot.snapshotId}, ${snapshot.snapshotCreatedAt}::timestamptz,
        ${snapshot.editionCount}, 'staging'
      )
      on conflict (id) do update set
        snapshot_created_at = excluded.snapshot_created_at,
        source_record_count = excluded.source_record_count,
        status = 'staging'
    `;
    for (let index = 0; index < classified.length; index += 300) {
      await insertCandidateChunk(tx, batchId, classified.slice(index, index + 300));
    }
    const counts = await statusCounts(tx, batchId);
    await tx`
      update fixture_import_batches set
        staged_count = ${counts.staged},
        eligible_count = ${counts.eligible},
        blocked_count = ${counts.blocked},
        duplicate_count = ${counts.duplicates},
        status = 'staged',
        staged_at = now()
      where id = ${batchId}
    `;
  });

  return {
    batchId,
    snapshotId: snapshot.snapshotId,
    snapshotCreatedAt: snapshot.snapshotCreatedAt,
    workbookStatus: snapshot.workbookStatus,
    sourceCount: snapshot.sourceCount,
    raceCount: snapshot.raceCount,
    editionCount: snapshot.editionCount,
    courseCount: snapshot.courseCount,
    reviewItemCount: snapshot.reviewItemCount,
    counts: await statusCounts(sql, batchId),
  };
}

type StagedRow = {
  id: string;
  source_race_id: string;
  payload: SnapshotPayload | string;
  catalogue_event_id: number | null;
};

function parsedPayload(value: SnapshotPayload | string): SnapshotPayload {
  return typeof value === "string" ? (JSON.parse(value) as SnapshotPayload) : value;
}

async function insertNewEvent(
  sql: Sql,
  payload: SnapshotPayload,
): Promise<{ id: number; created: boolean }> {
  const preferredSlug = slugify(payload.slug || payload.name);
  if (!preferredSlug) throw new Error(`Cannot create a slug for ${payload.name}`);
  const values = {
    summary: `${payload.name} — ${payload.city || payload.country}`,
    county: payload.county || payload.stateProvince,
  };
  const inserted = await sql<{ id: number }>`
    insert into events (
      slug, name, sport, country, county, city, area, surface, summary,
      description, organiser, website, featured
    ) values (
      ${preferredSlug}, ${payload.name}, ${payload.sport}, ${payload.country},
      ${values.county}, ${payload.city}, ${payload.venue}, ${payload.surface},
      ${values.summary}, ${""}, ${payload.organiser}, ${payload.website}, ${false}
    )
    on conflict (slug) do nothing
    returning id
  `;
  if (inserted[0]) return { id: inserted[0].id, created: true };

  const conflict = await sql<CatalogueEvent>`
    select id, slug, name, country, city from events where slug = ${preferredSlug} limit 1
  `;
  if (
    conflict[0] &&
    normalizeEventName(conflict[0].name) === normalizeEventName(payload.name) &&
    sameCountry(conflict[0].country, payload.country)
  ) {
    return { id: conflict[0].id, created: false };
  }

  const fallbackSlug = slugify(
    `${preferredSlug}-${payload.city || payload.country}-${payload.raceId.slice(-6)}`,
  );
  const fallback = await sql<{ id: number }>`
    insert into events (
      slug, name, sport, country, county, city, area, surface, summary,
      description, organiser, website, featured
    ) values (
      ${fallbackSlug}, ${payload.name}, ${payload.sport}, ${payload.country},
      ${values.county}, ${payload.city}, ${payload.venue}, ${payload.surface},
      ${values.summary}, ${""}, ${payload.organiser}, ${payload.website}, ${false}
    )
    on conflict (slug) do update set slug = excluded.slug
    returning id
  `;
  if (!fallback[0]) throw new Error(`Could not create event ${payload.name}`);
  return { id: fallback[0].id, created: true };
}

async function fillEmptyEventFields(sql: Sql, eventId: number, payload: SnapshotPayload) {
  await sql`
    update events set
      county = case when county = '' then ${payload.county || payload.stateProvince} else county end,
      city = case when city = '' then ${payload.city} else city end,
      area = case when area = '' then ${payload.venue} else area end,
      organiser = case when organiser = '' then ${payload.organiser} else organiser end,
      website = case when website = '' then ${payload.website} else website end
    where id = ${eventId}
  `;
}

export async function publishEligibleScraperWorkbookBatch(batchId: string) {
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    await tx`
      update fixture_import_batches set status = 'publishing'
      where id = ${batchId}
    `;
    const candidates = await tx<StagedRow>`
      select id, source_race_id, payload, catalogue_event_id
      from fixture_candidates
      where batch_id = ${batchId} and status = 'eligible' and publish_eligible
      order by source_race_id, id
      for update
    `;

    const eventBySourceRace = new Map<string, number>();
    let publishedCandidates = 0;
    let publishedEvents = 0;
    let publishedEditions = 0;
    let duplicates = 0;

    for (const candidate of candidates) {
      const payload = parsedPayload(candidate.payload);
      let eventId = candidate.catalogue_event_id ?? eventBySourceRace.get(candidate.source_race_id);
      if (eventId == null) {
        const event = await insertNewEvent(tx, payload);
        eventId = event.id;
        if (event.created) publishedEvents += 1;
      } else {
        await fillEmptyEventFields(tx, eventId, payload);
      }
      eventBySourceRace.set(candidate.source_race_id, eventId);

      let candidateEditions = 0;
      for (const distance of payload.distances) {
        await tx`
          insert into event_distances (event_id, distance_code)
          values (${eventId}, ${distance.code})
          on conflict do nothing
        `;
        const edition = await tx<{ id: number }>`
          insert into editions (
            event_id, event_date, distance_code, distance_km, status,
            entry_url, source_url, start_time
          ) values (
            ${eventId}, ${payload.date}::date, ${distance.code}, ${distance.km},
            ${payload.status}, ${payload.entryUrl || null}, ${payload.sourceUrl},
            ${payload.startTime || null}
          )
          on conflict (event_id, event_date, distance_code) do nothing
          returning id
        `;
        if (edition[0]) {
          candidateEditions += 1;
          publishedEditions += 1;
        }
      }

      if (candidateEditions > 0) {
        publishedCandidates += 1;
        await tx`
          update fixture_candidates set
            status = 'published', publish_eligible = false,
            catalogue_event_id = ${eventId}, published_at = now()
          where id = ${candidate.id}
        `;
      } else {
        duplicates += 1;
        await tx`
          update fixture_candidates set
            status = 'duplicate', publish_eligible = false,
            catalogue_event_id = ${eventId},
            block_reasons = ${JSON.stringify(["exact_duplicate_in_catalogue"])}::jsonb
          where id = ${candidate.id}
        `;
      }
    }

    const counts = await statusCounts(tx, batchId);
    await tx`
      update fixture_import_batches set
        staged_count = ${counts.staged},
        eligible_count = ${counts.eligible},
        blocked_count = ${counts.blocked},
        duplicate_count = ${counts.duplicates},
        published_candidate_count = published_candidate_count + ${publishedCandidates},
        published_event_count = published_event_count + ${publishedEvents},
        published_edition_count = published_edition_count + ${publishedEditions},
        status = case when ${counts.blocked} > 0 then 'published_with_blocks' else 'published' end,
        published_at = now()
      where id = ${batchId}
    `;

    return {
      batchId,
      publishedCandidates,
      publishedEvents,
      publishedEditions,
      duplicatesFoundDuringPublish: duplicates,
      counts,
    };
  });
}

export async function uploadScraperWorkbookSnapshotNow() {
  const staged = await stageScraperWorkbookSnapshot();
  const publication = await publishEligibleScraperWorkbookBatch(staged.batchId);
  return { staged, publication };
}

export async function getScraperWorkbookImportDashboard() {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    snapshot_id: string;
    source_record_count: number;
    staged_count: number;
    eligible_count: number;
    blocked_count: number;
    duplicate_count: number;
    published_candidate_count: number;
    published_event_count: number;
    published_edition_count: number;
    status: string;
    staged_at: string | null;
    published_at: string | null;
  }>`
    select
      id, snapshot_id, source_record_count, staged_count, eligible_count,
      blocked_count, duplicate_count, published_candidate_count,
      published_event_count, published_edition_count, status,
      staged_at::text as staged_at, published_at::text as published_at
    from fixture_import_batches
    order by created_at desc
    limit 1
  `;
  const row = rows[0];
  return row
    ? {
        id: row.id,
        snapshotId: row.snapshot_id,
        sourceRecordCount: row.source_record_count,
        stagedCount: row.staged_count,
        eligibleCount: row.eligible_count,
        blockedCount: row.blocked_count,
        duplicateCount: row.duplicate_count,
        publishedCandidateCount: row.published_candidate_count,
        publishedEventCount: row.published_event_count,
        publishedEditionCount: row.published_edition_count,
        status: row.status,
        stagedAt: row.staged_at,
        publishedAt: row.published_at,
      }
    : null;
}
