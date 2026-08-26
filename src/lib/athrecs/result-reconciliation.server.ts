import { randomUUID } from "node:crypto";
import {
  athletes as athleteSeeds,
  editions as editionSeeds,
  results as resultSeeds,
  seriesList,
} from "@/data/catalogue";
import type { AthleteSeed, Edition, ResultSeed } from "@/data/types";
import { dbSource, getSql, type Sql } from "@/lib/db";

export type ResultReconciliationEntity = "club" | "event" | "edition" | "athlete" | "result";

export type ResultReconciliationConflict = {
  entity: ResultReconciliationEntity;
  key: string;
  reason: string;
  blocksRestore: boolean;
};

export type ResultReconciliationEventGap = {
  eventSlug: string;
  eventName: string;
  sport: string;
  targetResults: number;
  presentResults: number;
  recoverableResults: number;
  blockedResults: number;
};

export type ResultReconciliationReport = {
  generatedAt: string;
  persistent: boolean;
  baseline: {
    events: number;
    editions: number;
    athletes: number;
    results: number;
  };
  database: {
    clubs: number;
    events: number;
    editions: number;
    athletes: number;
    results: number;
  };
  present: {
    athletes: number;
    results: number;
  };
  missing: {
    athletes: number;
    results: number;
  };
  recoverable: {
    athletes: number;
    results: number;
  };
  blocked: {
    athletes: number;
    results: number;
  };
  dependencies: {
    missingClubs: number;
    missingEvents: number;
    missingEditions: number;
  };
  conflicts: {
    count: number;
    samples: ResultReconciliationConflict[];
  };
  eventGaps: ResultReconciliationEventGap[];
  complete: boolean;
};

export type ResultReconciliationPublishResult = {
  runId: string | null;
  noOp: boolean;
  inserted: {
    athletes: number;
    results: number;
  };
  before: ResultReconciliationReport;
  after: ResultReconciliationReport;
};

type TargetState = "present" | "recoverable" | "blocked";

type ClubRow = { id: number; slug: string };
type EventRow = {
  id: number;
  slug: string;
  name: string;
  sport: string;
  source_id: number | null;
};
type EditionRow = {
  id: number;
  event_id: number;
  event_slug: string;
  event_name: string;
  sport: string;
  event_date: string;
  distance_code: string;
  source_id: number | null;
};
type AthleteRow = {
  id: number;
  slug: string;
  display_name: string;
  gender: string;
  source_id: number | null;
  athrecs_id: string | null;
  profile_type: string;
};
type ResultRow = {
  id: number;
  source_id: number | null;
  edition_id: number;
  athlete_id: number;
  event_slug: string;
  event_date: string;
  distance_code: string;
  athlete_slug: string;
};

type Snapshot = {
  counts: ResultReconciliationReport["database"];
  clubs: ClubRow[];
  events: EventRow[];
  editions: EditionRow[];
  athletes: AthleteRow[];
  results: ResultRow[];
};

type Inspection = {
  report: ResultReconciliationReport;
  snapshot: Snapshot;
  athleteStates: Map<string, TargetState>;
  resultStates: Map<string, TargetState>;
  conflicts: ResultReconciliationConflict[];
};

const resultKey = (result: Pick<ResultSeed, "eventSlug" | "date" | "distance" | "athleteSlug">) =>
  `${result.eventSlug}|${result.date}|${result.distance}|${result.athleteSlug}`;
const targetEditionKey = (result: Pick<ResultSeed, "eventSlug" | "date" | "distance">) =>
  `${result.eventSlug}|${result.date}|${result.distance}`;
const editionSeedKey = (edition: Pick<Edition, "seriesSlug" | "date" | "distance">) =>
  `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
const editionRowKey = (edition: Pick<EditionRow, "event_slug" | "event_date" | "distance_code">) =>
  `${edition.event_slug}|${edition.event_date}|${edition.distance_code}`;
const resultRowKey = (
  result: Pick<ResultRow, "event_slug" | "event_date" | "distance_code" | "athlete_slug">,
) => `${result.event_slug}|${result.event_date}|${result.distance_code}|${result.athlete_slug}`;

const resultSeedByKey = new Map<string, ResultSeed>(
  resultSeeds.map((result) => [resultKey(result), result]),
);
const athleteSeedBySlug = new Map<string, AthleteSeed>(
  athleteSeeds.map((athlete) => [athlete.slug, athlete]),
);
const editionSeedByKey = new Map<string, Edition>(
  editionSeeds.map((edition) => [editionSeedKey(edition), edition]),
);
const seriesSeedBySlug = new Map(seriesList.map((series) => [series.slug, series]));
const targetAthleteSlugs = new Set(resultSeeds.map((result) => result.athleteSlug));
const targetEditionKeys = new Set(resultSeeds.map(targetEditionKey));
const targetEventSlugs = new Set(resultSeeds.map((result) => result.eventSlug));

function normalizedIdentity(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function httpsUrl(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseTimeToSeconds(raw: string): number {
  const parts = raw.trim().replace(",", ".").split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;
  if (parts.length === 3) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  if (parts.length === 2) return Math.round(parts[0] * 60 + parts[1]);
  return Math.round(parts[0] ?? 0);
}

function compactError(conflicts: ResultReconciliationConflict[]): string | null {
  if (!conflicts.length) return null;
  return conflicts
    .slice(0, 20)
    .map((conflict) => `${conflict.entity} ${conflict.key}: ${conflict.reason}`)
    .join("; ")
    .slice(0, 2000);
}

async function loadSnapshot(sql: Sql): Promise<Snapshot> {
  const targetEvents = [...targetEventSlugs];
  const editionSourceIds = [...targetEditionKeys]
    .map((key) => editionSeedByKey.get(key)?.source_id)
    .filter((value): value is number => value != null);

  const [countRows, clubs, events, editions, athletes, results] = await Promise.all([
    sql<Snapshot["counts"]>`select
      (select count(*)::int from clubs) as clubs,
      (select count(*)::int from events) as events,
      (select count(*)::int from editions) as editions,
      (select count(*)::int from athletes) as athletes,
      (select count(*)::int from results) as results
    `,
    sql<ClubRow>`select id, slug from clubs`,
    sql<EventRow>`select id, slug, name, sport, source_id from events`,
    sql.query<EditionRow>(
      `select
         edition.id,
         edition.event_id,
         event.slug as event_slug,
         event.name as event_name,
         event.sport,
         edition.event_date::text as event_date,
         edition.distance_code,
         edition.source_id
       from editions edition
       join events event on event.id = edition.event_id
       where event.slug = any($1::text[])
          or edition.source_id = any($2::int[])`,
      [targetEvents, editionSourceIds],
    ),
    sql<AthleteRow>`
      select id, slug, display_name, gender, source_id, athrecs_id, profile_type
      from athletes
    `,
    sql<ResultRow>`select
      result.id,
      result.source_id,
      result.edition_id,
      result.athlete_id,
      event.slug as event_slug,
      edition.event_date::text as event_date,
      edition.distance_code,
      athlete.slug as athlete_slug
    from results result
    join editions edition on edition.id = result.edition_id
    join events event on event.id = edition.event_id
    join athletes athlete on athlete.id = result.athlete_id
    `,
  ]);

  return {
    counts: countRows[0] ?? { clubs: 0, events: 0, editions: 0, athletes: 0, results: 0 },
    clubs,
    events,
    editions,
    athletes,
    results,
  };
}

function inspectSnapshot(snapshot: Snapshot): Inspection {
  const conflicts: ResultReconciliationConflict[] = [];
  const addConflict = (
    entity: ResultReconciliationEntity,
    key: string,
    reason: string,
    blocksRestore = true,
  ) => conflicts.push({ entity, key, reason, blocksRestore });

  const clubsBySlug = new Map(snapshot.clubs.map((club) => [club.slug, club]));
  const eventsBySlug = new Map(snapshot.events.map((event) => [event.slug, event]));
  const editionsByKey = new Map<string, EditionRow>(
    snapshot.editions.map((edition) => [editionRowKey(edition), edition]),
  );
  const editionsBySourceId = new Map(
    snapshot.editions
      .filter((edition) => edition.source_id != null)
      .map((edition) => [edition.source_id as number, edition]),
  );
  const athletesBySlug = new Map(snapshot.athletes.map((athlete) => [athlete.slug, athlete]));
  const athletesBySourceId = new Map(
    snapshot.athletes
      .filter((athlete) => athlete.source_id != null)
      .map((athlete) => [athlete.source_id as number, athlete]),
  );
  const athletesByAthrecsId = new Map(
    snapshot.athletes
      .filter((athlete) => Boolean(athlete.athrecs_id))
      .map((athlete) => [athlete.athrecs_id as string, athlete]),
  );
  const resultsByKey = new Map<string, ResultRow>(
    snapshot.results.map((result) => [resultRowKey(result), result]),
  );
  const resultsBySourceId = new Map(
    snapshot.results
      .filter((result) => result.source_id != null)
      .map((result) => [result.source_id as number, result]),
  );

  const usableEvents = new Set<string>();
  let missingEvents = 0;
  for (const slug of targetEventSlugs) {
    const seed = seriesSeedBySlug.get(slug);
    const existing = eventsBySlug.get(slug);
    if (!seed || !existing) {
      missingEvents += 1;
      addConflict("event", slug, !seed ? "No retained event seed" : "Event is missing from Neon");
      continue;
    }
    const sourceConflict =
      seed.source_id != null && existing.source_id != null && existing.source_id !== seed.source_id;
    const identityConflict =
      normalizedIdentity(existing.name) !== normalizedIdentity(seed.name) || existing.sport !== seed.sport;
    if (sourceConflict || identityConflict) {
      addConflict(
        "event",
        slug,
        `Existing event differs (name ${existing.name}, sport ${existing.sport}, source_id ${existing.source_id ?? "none"})`,
      );
      continue;
    }
    usableEvents.add(slug);
  }

  const usableEditions = new Set<string>();
  let missingEditions = 0;
  for (const key of targetEditionKeys) {
    const seed = editionSeedByKey.get(key);
    if (!seed || !usableEvents.has(seed.seriesSlug)) {
      missingEditions += 1;
      addConflict("edition", key, !seed ? "No retained edition seed" : "Parent event is unavailable");
      continue;
    }
    const existing = editionsByKey.get(key);
    if (!existing) {
      const sourceMatch = seed.source_id == null ? undefined : editionsBySourceId.get(seed.source_id);
      missingEditions += 1;
      addConflict(
        "edition",
        key,
        sourceMatch
          ? `source_id ${seed.source_id} belongs to ${editionRowKey(sourceMatch)}`
          : "Edition is missing from Neon",
      );
      continue;
    }
    if (seed.source_id != null && existing.source_id != null && existing.source_id !== seed.source_id) {
      addConflict(
        "edition",
        key,
        `Edition has source_id ${existing.source_id}, expected ${seed.source_id}`,
      );
      continue;
    }
    usableEditions.add(key);
  }

  const missingClubSlugs = new Set<string>();
  const athleteStates = new Map<string, TargetState>();
  for (const slug of targetAthleteSlugs) {
    const seed = athleteSeedBySlug.get(slug);
    if (!seed) {
      athleteStates.set(slug, "blocked");
      addConflict("athlete", slug, "No retained athlete seed");
      continue;
    }
    if (!clubsBySlug.has(seed.club_slug)) {
      missingClubSlugs.add(seed.club_slug);
      athleteStates.set(slug, "blocked");
      addConflict("club", seed.club_slug, `Primary club required by ${slug} is missing from Neon`);
      continue;
    }
    const existing = athletesBySlug.get(slug);
    if (existing) {
      const sourceConflict =
        seed.source_id != null && existing.source_id != null && existing.source_id !== seed.source_id;
      const athrecsConflict =
        Boolean(seed.athrecs_id) &&
        Boolean(existing.athrecs_id) &&
        existing.athrecs_id !== seed.athrecs_id;
      const identityConflict =
        normalizedIdentity(existing.display_name) !== normalizedIdentity(seed.display_name) ||
        (existing.gender !== "U" && seed.gender !== "U" && existing.gender !== seed.gender);
      if (sourceConflict || athrecsConflict || identityConflict) {
        athleteStates.set(slug, "blocked");
        addConflict(
          "athlete",
          slug,
          `Existing identity differs (name ${existing.display_name}, gender ${existing.gender}, source_id ${existing.source_id ?? "none"}, ATHRECS ID ${existing.athrecs_id ?? "none"})`,
        );
      } else {
        athleteStates.set(slug, "present");
      }
      continue;
    }
    const sourceMatch = seed.source_id == null ? undefined : athletesBySourceId.get(seed.source_id);
    const athrecsMatch = seed.athrecs_id ? athletesByAthrecsId.get(seed.athrecs_id) : undefined;
    const identityMatch = sourceMatch ?? athrecsMatch;
    if (identityMatch) {
      athleteStates.set(slug, "blocked");
      addConflict("athlete", slug, `Stable identity belongs to ${identityMatch.slug}`);
    } else {
      athleteStates.set(slug, "recoverable");
    }
  }

  const resultStates = new Map<string, TargetState>();
  for (const [key, seed] of resultSeedByKey) {
    const existing = resultsByKey.get(key);
    if (existing) {
      resultStates.set(key, "present");
      if (seed.source_id != null && existing.source_id != null && existing.source_id !== seed.source_id) {
        addConflict(
          "result",
          key,
          `Existing result has source_id ${existing.source_id}, expected ${seed.source_id}`,
          false,
        );
      }
      continue;
    }
    const sourceMatch = seed.source_id == null ? undefined : resultsBySourceId.get(seed.source_id);
    if (sourceMatch) {
      resultStates.set(key, "blocked");
      addConflict("result", key, `source_id ${seed.source_id} belongs to ${resultRowKey(sourceMatch)}`);
      continue;
    }
    if (!usableEditions.has(targetEditionKey(seed))) {
      resultStates.set(key, "blocked");
      addConflict("result", key, "Target event edition is unavailable or conflicted");
      continue;
    }
    if (athleteStates.get(seed.athleteSlug) === "blocked") {
      resultStates.set(key, "blocked");
      addConflict("result", key, "Target athlete identity is unavailable or conflicted");
      continue;
    }
    resultStates.set(key, "recoverable");
  }

  const countState = (states: Map<string, TargetState>, state: TargetState) =>
    [...states.values()].filter((value) => value === state).length;
  const eventGaps = new Map<string, ResultReconciliationEventGap>();
  for (const seed of resultSeeds) {
    const state = resultStates.get(resultKey(seed));
    const series = seriesSeedBySlug.get(seed.eventSlug);
    const event = eventGaps.get(seed.eventSlug) ?? {
      eventSlug: seed.eventSlug,
      eventName: series?.name ?? seed.eventSlug,
      sport: series?.sport ?? "Running",
      targetResults: 0,
      presentResults: 0,
      recoverableResults: 0,
      blockedResults: 0,
    };
    event.targetResults += 1;
    if (state === "present") event.presentResults += 1;
    if (state === "recoverable") event.recoverableResults += 1;
    if (state === "blocked") event.blockedResults += 1;
    eventGaps.set(seed.eventSlug, event);
  }

  const presentAthletes = countState(athleteStates, "present");
  const presentResults = countState(resultStates, "present");
  const recoverableAthletes = countState(athleteStates, "recoverable");
  const recoverableResults = countState(resultStates, "recoverable");
  const blockedAthletes = countState(athleteStates, "blocked");
  const blockedResults = countState(resultStates, "blocked");
  const report: ResultReconciliationReport = {
    generatedAt: new Date().toISOString(),
    persistent: dbSource === "neon",
    baseline: {
      events: targetEventSlugs.size,
      editions: targetEditionKeys.size,
      athletes: targetAthleteSlugs.size,
      results: resultSeeds.length,
    },
    database: snapshot.counts,
    present: { athletes: presentAthletes, results: presentResults },
    missing: {
      athletes: recoverableAthletes + blockedAthletes,
      results: recoverableResults + blockedResults,
    },
    recoverable: { athletes: recoverableAthletes, results: recoverableResults },
    blocked: { athletes: blockedAthletes, results: blockedResults },
    dependencies: {
      missingClubs: missingClubSlugs.size,
      missingEvents,
      missingEditions,
    },
    conflicts: { count: conflicts.length, samples: conflicts.slice(0, 50) },
    eventGaps: [...eventGaps.values()]
      .filter((event) => event.recoverableResults > 0 || event.blockedResults > 0)
      .sort(
        (left, right) =>
          right.recoverableResults + right.blockedResults -
            (left.recoverableResults + left.blockedResults) ||
          left.eventName.localeCompare(right.eventName),
      )
      .slice(0, 100),
    complete: recoverableResults + blockedResults === 0,
  };

  return { report, snapshot, athleteStates, resultStates, conflicts };
}

async function inspect(sql: Sql): Promise<Inspection> {
  return inspectSnapshot(await loadSnapshot(sql));
}

async function insertRows<T extends Record<string, unknown>>(
  sql: Sql,
  table: string,
  columns: string[],
  rows: unknown[][],
  returning: string,
  chunkSize = 100,
): Promise<T[]> {
  const inserted: T[] = [];
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const batch = rows.slice(offset, offset + chunkSize);
    if (!batch.length) continue;
    const params: unknown[] = [];
    const values = batch
      .map((row) => {
        const placeholders = row.map((value) => {
          params.push(value);
          return `$${params.length}`;
        });
        return `(${placeholders.join(", ")})`;
      })
      .join(", ");
    inserted.push(
      ...(await sql.query<T>(
        `insert into ${table} (${columns.join(", ")}) values ${values} on conflict do nothing returning ${returning}`,
        params,
      )),
    );
  }
  return inserted;
}

function athleteInsertRow(
  athlete: AthleteSeed,
  clubId: number,
  secondClubId: number | null,
): unknown[] {
  const profileType = athlete.profile_type ?? "Athlete";
  return [
    athlete.source_id ?? null,
    athlete.slug,
    athlete.display_name,
    athlete.given_name ?? null,
    athlete.family_name ?? null,
    athlete.gender,
    clubId,
    secondClubId,
    athlete.source_club_name ?? null,
    athlete.source_second_club_name ?? null,
    athlete.city,
    athlete.county ?? "",
    athlete.country ?? "",
    athlete.bio,
    athlete.date_of_birth ?? null,
    athlete.nation ?? null,
    athlete.continent ?? null,
    athlete.commonwealth ?? null,
    athlete.race_entry_name ?? null,
    athlete.default_category ?? null,
    athlete.default_bib ?? null,
    athlete.preferred_distance ?? null,
    athlete.ea_number ?? null,
    athlete.athrecs_id ?? null,
    athlete.avatar_url ?? null,
    athlete.source_url ?? null,
    profileType,
    (athlete.profile_roles ?? []).join(","),
    athlete.profile_source_checked_at ?? null,
    profileType === "Public figure" ? "public" : "private",
  ];
}

function resultInsertRow(
  result: ResultSeed,
  editionId: number,
  athleteId: number,
  runId: string,
  profileType: string,
): unknown[] {
  return [
    result.source_id ?? null,
    editionId,
    athleteId,
    result.status ?? "finished",
    result.finishTimeSeconds ?? parseTimeToSeconds(result.time),
    result.chipTimeSeconds ?? null,
    result.gunTimeSeconds ?? null,
    result.bib ?? null,
    result.place,
    result.genderPlace ?? null,
    result.category ?? null,
    result.categoryPlace ?? null,
    result.ageOnDay ?? null,
    result.ageGradePct ?? null,
    result.openRating ?? null,
    result.ageGradeRating ?? null,
    result.resultSource ?? "catalogue reconciliation",
    result.source,
    profileType === "Public figure" ? "public_figure" : "private",
    runId,
  ];
}

export async function previewRecoverableResultReconciliation(): Promise<ResultReconciliationReport> {
  return (await inspect(await getSql())).report;
}

export async function publishRecoverableResultReconciliation(input: {
  requestedByUserId: string;
  requestedByEmail: string;
}): Promise<ResultReconciliationPublishResult> {
  if (dbSource !== "neon") {
    throw new Error("Reconciliation publishing requires the persistent Neon database");
  }
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const beforeInspection = await inspect(tx);
    const before = beforeInspection.report;
    if (before.recoverable.results === 0) {
      return {
        runId: null,
        noOp: true,
        inserted: { athletes: 0, results: 0 },
        before,
        after: before,
      };
    }

    const runId = randomUUID();
    await tx`
      insert into result_ingestion_runs (
        id, sport, source_name, acquisition_method, status,
        requested_by_user_id, requested_by_email, rows_detected, notes
      ) values (
        ${runId}, 'Multi-sport', 'ATHRECS recoverable catalogue reconciliation',
        'manual', 'processing', ${input.requestedByUserId}, ${input.requestedByEmail},
        ${resultSeeds.length},
        ${JSON.stringify({
          kind: "non_destructive_reconciliation",
          recoverableBefore: before.recoverable.results,
          blockedBefore: before.blocked.results,
        })}
      )
    `;

    const clubIdBySlug = new Map(
      beforeInspection.snapshot.clubs.map((club) => [club.slug, club.id]),
    );
    const missingAthletes: AthleteSeed[] = [];
    for (const [slug, state] of beforeInspection.athleteStates) {
      if (state !== "recoverable") continue;
      const athlete = athleteSeedBySlug.get(slug);
      if (athlete) missingAthletes.push(athlete);
    }
    const athleteRows = missingAthletes
      .map((athlete) => {
        const clubId = clubIdBySlug.get(athlete.club_slug);
        if (!clubId) return null;
        const secondClubId = athlete.second_club_slug
          ? (clubIdBySlug.get(athlete.second_club_slug) ?? null)
          : null;
        return athleteInsertRow(athlete, clubId, secondClubId);
      })
      .filter((row): row is unknown[] => Boolean(row));
    const insertedAthletes = await insertRows<{ id: number }>(
      tx,
      "athletes",
      [
        "source_id",
        "slug",
        "display_name",
        "given_name",
        "family_name",
        "gender",
        "club_id",
        "second_club_id",
        "source_club_name",
        "source_second_club_name",
        "city",
        "county",
        "country",
        "bio",
        "date_of_birth",
        "nation",
        "continent",
        "commonwealth",
        "race_entry_name",
        "default_category",
        "default_bib",
        "preferred_distance",
        "ea_number",
        "athrecs_id",
        "avatar_url",
        "source_url",
        "profile_type",
        "profile_roles",
        "profile_source_checked_at",
        "profile_visibility",
      ],
      athleteRows,
      "id",
      75,
    );

    const currentAthletes = await tx<AthleteRow>`
      select id, slug, display_name, gender, source_id, athrecs_id, profile_type
      from athletes
    `;
    const athleteBySlug = new Map(currentAthletes.map((athlete) => [athlete.slug, athlete]));
    const relationshipRows = missingAthletes.flatMap((athlete) => {
      const athleteId = athleteBySlug.get(athlete.slug)?.id;
      const primaryClubId = clubIdBySlug.get(athlete.club_slug);
      if (!athleteId || !primaryClubId) return [];
      const rows: unknown[][] = [
        [athleteId, primaryClubId, "primary", athlete.source_club_name ?? null],
      ];
      const secondaryClubId = athlete.second_club_slug
        ? clubIdBySlug.get(athlete.second_club_slug)
        : undefined;
      if (secondaryClubId && secondaryClubId !== primaryClubId) {
        rows.push([
          athleteId,
          secondaryClubId,
          "secondary",
          athlete.source_second_club_name ?? null,
        ]);
      }
      return rows;
    });
    await insertRows<{ athlete_id: number }>(
      tx,
      "athlete_clubs",
      ["athlete_id", "club_id", "relationship", "source_name"],
      relationshipRows,
      "athlete_id",
      100,
    );

    const editionByKey = new Map(
      beforeInspection.snapshot.editions.map((edition) => [editionRowKey(edition), edition]),
    );
    const recoverableResults: ResultSeed[] = [];
    for (const [key, state] of beforeInspection.resultStates) {
      if (state !== "recoverable") continue;
      const result = resultSeedByKey.get(key);
      if (result) recoverableResults.push(result);
    }
    const rows = recoverableResults
      .map((result) => {
        const edition = editionByKey.get(targetEditionKey(result));
        const athlete = athleteBySlug.get(result.athleteSlug);
        if (!edition || !athlete) return null;
        return resultInsertRow(result, edition.id, athlete.id, runId, athlete.profile_type);
      })
      .filter((row): row is unknown[] => Boolean(row));
    const insertedResults = await insertRows<{ id: number; edition_id: number }>(
      tx,
      "results",
      [
        "source_id",
        "edition_id",
        "athlete_id",
        "status",
        "finish_time_seconds",
        "chip_time_seconds",
        "gun_time_seconds",
        "bib",
        "overall_place",
        "gender_place",
        "category",
        "category_place",
        "age_on_day",
        "age_grade_pct",
        "open_rating",
        "age_grade_rating",
        "result_source",
        "source_url",
        "result_visibility",
        "ingestion_run_id",
      ],
      rows,
      "id, edition_id",
      100,
    );

    const afterInspection = await inspect(tx);
    const after = afterInspection.report;
    const insertedByEdition = new Map<number, number>();
    for (const result of insertedResults) {
      insertedByEdition.set(result.edition_id, (insertedByEdition.get(result.edition_id) ?? 0) + 1);
    }
    const targetsByEdition = new Map<string, ResultSeed[]>();
    for (const result of resultSeeds) {
      const key = targetEditionKey(result);
      targetsByEdition.set(key, [...(targetsByEdition.get(key) ?? []), result]);
    }
    const afterEditions = new Map(
      afterInspection.snapshot.editions.map((edition) => [editionRowKey(edition), edition]),
    );
    const coverageRows: unknown[][] = [];
    for (const [key, targets] of targetsByEdition) {
      const edition = afterEditions.get(key);
      const seed = editionSeedByKey.get(key);
      if (!edition || !seed) continue;
      const presentCount = targets.filter(
        (target) => afterInspection.resultStates.get(resultKey(target)) === "present",
      ).length;
      const blockedCount = targets.filter(
        (target) => afterInspection.resultStates.get(resultKey(target)) === "blocked",
      ).length;
      const insertedCount = insertedByEdition.get(edition.id) ?? 0;
      const coverageConflicts = afterInspection.conflicts.filter(
        (conflict) => conflict.key === key || conflict.key.startsWith(`${key}|`),
      );
      coverageRows.push([
        runId,
        edition.event_id,
        edition.id,
        edition.sport,
        edition.event_name,
        edition.event_slug,
        edition.event_date,
        edition.distance_code,
        httpsUrl(seed.source),
        presentCount === targets.length ? "complete" : presentCount > 0 ? "partial" : "failed",
        targets.length,
        insertedCount,
        0,
        targets.length - insertedCount,
        blockedCount,
        compactError(coverageConflicts),
        new Date().toISOString(),
        new Date().toISOString(),
      ]);
    }
    await insertRows<{ id: number }>(
      tx,
      "result_ingestion_editions",
      [
        "ingestion_run_id",
        "event_id",
        "edition_id",
        "sport",
        "event_name",
        "event_slug",
        "event_date",
        "distance_code",
        "source_url",
        "status",
        "rows_detected",
        "rows_imported",
        "rows_updated",
        "rows_skipped",
        "error_count",
        "error_summary",
        "finished_at",
        "updated_at",
      ],
      coverageRows,
      "id",
      75,
    );

    const inserted = {
      athletes: insertedAthletes.length,
      results: insertedResults.length,
    };
    const blockingConflicts = afterInspection.conflicts.filter((conflict) => conflict.blocksRestore);
    const runStatus =
      after.missing.results === 0 && blockingConflicts.length === 0
        ? "completed"
        : "completed_with_errors";
    await tx`
      update result_ingestion_runs set
        status = ${runStatus},
        rows_imported = ${inserted.results},
        rows_updated = 0,
        rows_skipped = ${resultSeeds.length - inserted.results},
        edition_count = ${coverageRows.length},
        error_count = ${blockingConflicts.length},
        error_summary = ${compactError(blockingConflicts)},
        notes = ${JSON.stringify({
          kind: "non_destructive_reconciliation",
          inserted,
          missingBefore: before.missing,
          missingAfter: after.missing,
        }).slice(0, 2000)},
        finished_at = now(),
        updated_at = now()
      where id = ${runId}
    `;

    return { runId, noOp: false, inserted, before, after };
  });
}
