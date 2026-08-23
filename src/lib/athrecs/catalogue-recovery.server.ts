import { editions as editionSeeds, raceGroupMemberships, seriesList } from "@/data/catalogue";
import type { Edition, EntryOptionSeed, Series } from "@/data/types";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { CATALOGUE_SEED_VERSION } from "./seed.server";

const RECOVERY_VERSION = `athrecs-catalogue-recovery-${CATALOGUE_SEED_VERSION}-v1`;
const PROGRESS_KEY = "catalogue_recovery_progress";
const COMPLETE_KEY = "catalogue_recovery_version";
const LOCK_KEY = "catalogue_recovery_lock";

const EVENT_BATCH_SIZE = 500;
const EDITION_BATCH_SIZE = 500;
const PARKRUN_BATCH_SIZE = 100;
const SQL_INSERT_BATCH_SIZE = 100;

const PARKRUN_5K_START = "2026-08-15";
const PARKRUN_5K_END = "2027-12-25";
const PARKRUN_2K_START = "2026-08-16";
const PARKRUN_2K_END = "2027-12-26";

type RecoveryPhase = "events" | "editions" | "parkrun" | "groups" | "complete";

type RecoveryProgress = {
  version: string;
  phase: RecoveryPhase;
  cursor: number;
  batchesCompleted: number;
};

export type CatalogueRecoveryStatus = {
  backend: typeof dbSource;
  recoveryVersion: string;
  complete: boolean;
  phase: RecoveryPhase;
  cursor: number;
  batchesCompleted: number;
  progressPercent: number;
  current: {
    events: number;
    editions: number;
    entryOptions: number;
    groups: number;
  };
  target: {
    events: number;
    explicitEditions: number;
    parkrunEditions: number;
    editions: number;
    entryOptions: number;
    groups: number;
  };
};

type CatalogueEntryOption = EntryOptionSeed & {
  providerCode: string;
  providerName: string;
  entryUrl: string;
};

type EditionWithEntryOptions = Edition & {
  entryOptions?: CatalogueEntryOption[];
};

type EventIdRow = { id: number; slug: string };

function chunks<T>(rows: T[], size: number): T[][] {
  const output: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    output.push(rows.slice(index, index + size));
  }
  return output;
}

async function insertRows(
  sql: Sql,
  table: string,
  columns: string[],
  rows: unknown[][],
  conflictClause: string,
): Promise<void> {
  for (const batch of chunks(rows, SQL_INSERT_BATCH_SIZE)) {
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
    await sql.query(
      `insert into ${table} (${columns.join(", ")}) values ${values} ${conflictClause}`,
      params,
    );
  }
}

function weeklyOccurrences(start: string, end: string): number {
  const startMs = Date.parse(`${start}T00:00:00Z`);
  const endMs = Date.parse(`${end}T00:00:00Z`);
  return Math.floor((endMs - startMs) / (7 * 24 * 60 * 60 * 1000)) + 1;
}

function isJuniorParkrun(series: Series): boolean {
  return series.sport === "Parkrun" && /junior/i.test(series.name);
}

const parkrunSeries = seriesList.filter((series) => series.sport === "Parkrun");
const seriesBySlug = new Map(seriesList.map((series) => [series.slug, series]));
const adultParkrunCount = parkrunSeries.filter((series) => !isJuniorParkrun(series)).length;
const juniorParkrunCount = parkrunSeries.length - adultParkrunCount;
const targetParkrunEditions =
  adultParkrunCount * weeklyOccurrences(PARKRUN_5K_START, PARKRUN_5K_END) +
  juniorParkrunCount * weeklyOccurrences(PARKRUN_2K_START, PARKRUN_2K_END);

function isGeneratedParkrunEdition(edition: Edition): boolean {
  const series = seriesBySlug.get(edition.seriesSlug);
  if (!series || series.sport !== "Parkrun") return false;
  const junior = isJuniorParkrun(series);
  const start = junior ? PARKRUN_2K_START : PARKRUN_5K_START;
  const end = junior ? PARKRUN_2K_END : PARKRUN_5K_END;
  const expectedDay = junior ? 0 : 6;
  const expectedDistance = junior ? "2K" : "5K";
  return (
    edition.distance === expectedDistance &&
    edition.date >= start &&
    edition.date <= end &&
    new Date(`${edition.date}T00:00:00Z`).getUTCDay() === expectedDay
  );
}

const explicitParkrunOverlapCount = editionSeeds.filter(isGeneratedParkrunEdition).length;

function optionsForEdition(edition: EditionWithEntryOptions): CatalogueEntryOption[] {
  if (edition.entryOptions?.length) return edition.entryOptions;
  if (!edition.entryUrl) return [];
  return [
    {
      providerCode: "official",
      providerName: "Official race entry",
      entryUrl: edition.entryUrl,
      entryType: "official",
      status:
        edition.status === "Open"
          ? "open"
          : edition.status === "ClosingSoon"
            ? "closing_soon"
            : edition.status === "Closed" || edition.status === "Finished"
              ? "closed"
              : "unknown",
      checkedAt: new Date(0).toISOString(),
      sourceUrl: edition.source,
      isVerified: false,
      isPrimary: true,
    },
  ];
}

const targetEntryOptionKeys = [
  ...new Map(
    (editionSeeds as EditionWithEntryOptions[]).flatMap((edition) =>
      optionsForEdition(edition).map((option) => {
        const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}|${option.providerCode}`;
        return [
          key,
          {
            seriesSlug: edition.seriesSlug,
            date: edition.date,
            distance: edition.distance,
            providerCode: option.providerCode,
          },
        ] as const;
      }),
    ),
  ).values(),
];

const TARGET = {
  events: seriesList.length,
  explicitEditions: editionSeeds.length,
  parkrunEditions: targetParkrunEditions,
  editions: editionSeeds.length + targetParkrunEditions - explicitParkrunOverlapCount,
  entryOptions: targetEntryOptionKeys.length,
  groups: raceGroupMemberships.length,
};

const DEFAULT_PROGRESS: RecoveryProgress = {
  version: RECOVERY_VERSION,
  phase: "events",
  cursor: 0,
  batchesCompleted: 0,
};

function parseProgress(raw: string | null | undefined): RecoveryProgress {
  if (!raw) return { ...DEFAULT_PROGRESS };
  try {
    const parsed = JSON.parse(raw) as Partial<RecoveryProgress>;
    if (
      parsed.version !== RECOVERY_VERSION ||
      !["events", "editions", "parkrun", "groups", "complete"].includes(parsed.phase ?? "")
    ) {
      return { ...DEFAULT_PROGRESS };
    }
    return {
      version: RECOVERY_VERSION,
      phase: parsed.phase as RecoveryPhase,
      cursor: Math.max(0, Math.floor(parsed.cursor ?? 0)),
      batchesCompleted: Math.max(0, Math.floor(parsed.batchesCompleted ?? 0)),
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

async function readMeta(sql: Sql, key: string): Promise<string | null> {
  const rows = await sql.query<{ value: string }>(
    "select value from app_meta where key = $1 limit 1",
    [key],
  );
  return rows[0]?.value ?? null;
}

async function writeMeta(sql: Sql, key: string, value: string): Promise<void> {
  await sql.query(
    `insert into app_meta (key, value) values ($1, $2)
     on conflict (key) do update set value = excluded.value`,
    [key, value],
  );
}

async function eventIdsForSlugs(sql: Sql, slugs: string[]): Promise<Map<string, number>> {
  if (!slugs.length) return new Map();
  const placeholders = slugs.map((_, index) => `$${index + 1}`).join(", ");
  const rows = await sql.query<EventIdRow>(
    `select id, slug from events where slug in (${placeholders})`,
    slugs,
  );
  return new Map(rows.map((row) => [row.slug, row.id]));
}

async function recoverEvents(sql: Sql, batch: Series[]): Promise<void> {
  await insertRows(
    sql,
    "events",
    [
      "source_id",
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
      "featured",
      "source_url",
    ],
    batch.map((series) => [
      series.source_id ?? null,
      series.slug,
      series.name,
      series.sport,
      series.country,
      series.county,
      series.city,
      series.area,
      series.surface,
      series.summary,
      series.description,
      series.organiser,
      series.website,
      series.featured ?? false,
      series.source_url ?? null,
    ]),
    "on conflict (slug) do nothing",
  );

  const eventIds = await eventIdsForSlugs(
    sql,
    batch.map((series) => series.slug),
  );
  const distanceRows = batch.flatMap((series) => {
    const eventId = eventIds.get(series.slug);
    if (!eventId) return [];
    return [...new Set(series.distances)].map((distance) => [eventId, distance]);
  });
  await insertRows(
    sql,
    "event_distances",
    ["event_id", "distance_code"],
    distanceRows,
    "on conflict (event_id, distance_code) do nothing",
  );
}

async function editionIdsForBatch(
  sql: Sql,
  editions: EditionWithEntryOptions[],
  eventIds: Map<string, number>,
): Promise<Map<string, number>> {
  const targets = editions
    .map((edition) => ({
      eventId: eventIds.get(edition.seriesSlug),
      date: edition.date,
      distance: edition.distance,
      key: `${edition.seriesSlug}|${edition.date}|${edition.distance}`,
    }))
    .filter((target): target is typeof target & { eventId: number } => target.eventId != null);
  if (!targets.length) return new Map();

  const params: unknown[] = [];
  const values = targets.map((target) => {
    params.push(target.eventId, target.date, target.distance, target.key);
    return `($${params.length - 3}::int, $${params.length - 2}::date, $${params.length - 1}::text, $${params.length}::text)`;
  });
  const rows = await sql.query<{ id: number; edition_key: string }>(
    `select ed.id, target.edition_key
     from (values ${values.join(", ")}) as target (
       event_id, event_date, distance_code, edition_key
     )
     join editions ed
       on ed.event_id = target.event_id
      and ed.event_date = target.event_date
      and ed.distance_code = target.distance_code`,
    params,
  );
  return new Map(rows.map((row) => [row.edition_key, row.id]));
}

async function recoverEntryOptions(
  sql: Sql,
  editions: EditionWithEntryOptions[],
  editionIds: Map<string, number>,
): Promise<void> {
  const rows = editions.flatMap((edition) => {
    const editionId = editionIds.get(`${edition.seriesSlug}|${edition.date}|${edition.distance}`);
    if (!editionId) return [];
    const options = optionsForEdition(edition);
    const explicitPrimary = options.findIndex((option) => option.isPrimary);
    const officialPrimary = options.findIndex((option) => option.entryType === "official");
    const primaryIndex = explicitPrimary >= 0 ? explicitPrimary : officialPrimary;
    return options.map((option, index) => [
      editionId,
      option.providerCode,
      option.providerName,
      option.entryUrl,
      option.entryType,
      option.status ?? "unknown",
      option.priceAmount ?? null,
      option.priceCurrency?.toUpperCase() ?? null,
      option.opensAt ?? null,
      option.closesAt ?? null,
      option.checkedAt,
      option.sourceUrl ?? option.entryUrl,
      option.isVerified ?? false,
      index === primaryIndex,
      option.notes ?? null,
    ]);
  });

  const proposedPrimaryEditionIds = [
    ...new Set(rows.filter((row) => row[13] === true).map((row) => Number(row[0]))),
  ];
  if (proposedPrimaryEditionIds.length) {
    const placeholders = proposedPrimaryEditionIds.map((_, index) => `$${index + 1}`).join(", ");
    const existingPrimaryRows = await sql.query<{ edition_id: number }>(
      `select edition_id
       from edition_entry_options
       where is_primary
         and edition_id in (${placeholders})`,
      proposedPrimaryEditionIds,
    );
    const editionsWithPrimary = new Set(existingPrimaryRows.map((row) => Number(row.edition_id)));
    for (const row of rows) {
      if (row[13] === true && editionsWithPrimary.has(Number(row[0]))) {
        row[13] = false;
      }
    }
  }

  await insertRows(
    sql,
    "edition_entry_options",
    [
      "edition_id",
      "provider_code",
      "provider_name",
      "entry_url",
      "entry_type",
      "status",
      "price_amount",
      "price_currency",
      "opens_at",
      "closes_at",
      "checked_at",
      "source_url",
      "is_verified",
      "is_primary",
      "notes",
    ],
    rows,
    "on conflict (edition_id, provider_code) do nothing",
  );
}

async function recoverEditions(sql: Sql, batch: EditionWithEntryOptions[]): Promise<void> {
  const eventIds = await eventIdsForSlugs(sql, [
    ...new Set(batch.map((edition) => edition.seriesSlug)),
  ]);
  const rows = batch
    .map((edition) => {
      const eventId = eventIds.get(edition.seriesSlug);
      if (!eventId) return null;
      return [
        edition.source_id ?? null,
        eventId,
        edition.date,
        edition.distance,
        edition.distanceKm,
        edition.status,
        edition.entryUrl ?? null,
        edition.source,
        edition.startTime ?? null,
        edition.notes ?? null,
        edition.resultsPermission ?? null,
        edition.resultsHosting ?? null,
        edition.resultsOfficialUrl ?? null,
        edition.resultsPermissionNote ?? null,
        edition.resultsPermissionAt ?? null,
        edition.resultsPermissionBy ?? null,
        edition.resultsRightsRequestedAt ?? null,
        edition.publicResultCount ?? null,
        edition.partnerResultCount ?? null,
        edition.athleteResultCount ?? null,
        edition.resultsAccess ?? null,
      ];
    })
    .filter((row): row is (string | number | null)[] => row != null);

  const proposedSourceIds = [
    ...new Set(
      rows
        .map((row) => row[0])
        .filter((sourceId): sourceId is number => typeof sourceId === "number"),
    ),
  ];
  const reservedSourceIds = new Set<number>();
  if (proposedSourceIds.length) {
    const placeholders = proposedSourceIds.map((_, index) => `$${index + 1}`).join(", ");
    const existingSourceRows = await sql.query<{ source_id: number }>(
      `select source_id
       from editions
       where source_id in (${placeholders})`,
      proposedSourceIds,
    );
    for (const row of existingSourceRows) reservedSourceIds.add(Number(row.source_id));
  }
  for (const row of rows) {
    const sourceId = row[0];
    if (typeof sourceId !== "number") continue;
    if (reservedSourceIds.has(sourceId)) {
      row[0] = null;
    } else {
      reservedSourceIds.add(sourceId);
    }
  }

  await insertRows(
    sql,
    "editions",
    [
      "source_id",
      "event_id",
      "event_date",
      "distance_code",
      "distance_km",
      "status",
      "entry_url",
      "source_url",
      "start_time",
      "notes",
      "results_permission",
      "results_hosting",
      "results_official_url",
      "results_permission_note",
      "results_permission_at",
      "results_permission_by",
      "results_rights_requested_at",
      "public_result_count",
      "partner_result_count",
      "athlete_result_count",
      "results_access",
    ],
    rows,
    "on conflict (event_id, event_date, distance_code) do nothing",
  );

  const editionIds = await editionIdsForBatch(sql, batch, eventIds);
  await recoverEntryOptions(sql, batch, editionIds);
}

async function insertParkrunCalendar(sql: Sql, eventIds: number[], junior: boolean): Promise<void> {
  if (!eventIds.length) return;
  const placeholders = eventIds.map((_, index) => `$${index + 1}`).join(", ");
  const startParam = eventIds.length + 1;
  const endParam = eventIds.length + 2;
  await sql.query(
    `insert into editions (
       event_id, event_date, distance_code, distance_km, status,
       entry_url, source_url, start_time, notes
     )
     select
       e.id,
       d::date,
       ${junior ? "'2K'" : "'5K'"},
       ${junior ? "2" : "5"},
       'Open',
       e.website,
       e.website,
       ${
         junior
           ? "'09:00'"
           : `case
                when e.country in (
                  'Australia', 'New Zealand', 'South Africa', 'Namibia',
                  'Eswatini', 'Singapore', 'Malaysia', 'Japan'
                ) then '08:00'
                else '09:00'
              end`
       },
       ${
         junior
           ? "'Weekly junior parkrun 2K — Sunday 09:00. Confirm cancellations on the parkrun event page.'"
           : "'Weekly parkrun 5K — Saturday morning local time. Confirm cancellations on the parkrun event page.'"
       }
     from events e
     cross join generate_series($${startParam}::date, $${endParam}::date, interval '7 days') as d
     where e.id in (${placeholders})
     on conflict (event_id, event_date, distance_code) do nothing`,
    [
      ...eventIds,
      junior ? PARKRUN_2K_START : PARKRUN_5K_START,
      junior ? PARKRUN_2K_END : PARKRUN_5K_END,
    ],
  );
}

async function recoverParkruns(sql: Sql, batch: Series[]): Promise<void> {
  const eventIds = await eventIdsForSlugs(
    sql,
    batch.map((series) => series.slug),
  );
  const adultIds = batch
    .filter((series) => !isJuniorParkrun(series))
    .map((series) => eventIds.get(series.slug))
    .filter((id): id is number => id != null);
  const juniorIds = batch
    .filter(isJuniorParkrun)
    .map((series) => eventIds.get(series.slug))
    .filter((id): id is number => id != null);
  await insertParkrunCalendar(sql, adultIds, false);
  await insertParkrunCalendar(sql, juniorIds, true);
}

async function recoverGroups(sql: Sql): Promise<void> {
  const eventIds = await eventIdsForSlugs(sql, [
    ...new Set(raceGroupMemberships.map((membership) => membership.seriesSlug)),
  ]);
  const rows = raceGroupMemberships
    .map((membership) => {
      const eventId = eventIds.get(membership.seriesSlug);
      if (!eventId) return null;
      return [
        eventId,
        membership.groupCode,
        membership.label,
        membership.level,
        membership.sourceUrl,
        membership.checkedAt,
        membership.note,
      ];
    })
    .filter((row): row is (string | number)[] => row != null);
  await insertRows(
    sql,
    "event_groups",
    ["event_id", "group_code", "label", "level", "source_url", "checked_at", "note"],
    rows,
    "on conflict (event_id, group_code) do nothing",
  );
}

async function getCounts(sql: Sql): Promise<CatalogueRecoveryStatus["current"]> {
  const rows = await sql.query<{
    events: number;
    editions: number;
    entry_options: number;
    groups: number;
  }>(`select
    (select count(*)::int from events) as events,
    (select count(*)::int from editions) as editions,
    (select count(*)::int from edition_entry_options) as entry_options,
    (select count(*)::int from event_groups) as groups`);
  const row = rows[0];
  return {
    events: row?.events ?? 0,
    editions: row?.editions ?? 0,
    entryOptions: row?.entry_options ?? 0,
    groups: row?.groups ?? 0,
  };
}

function progressPercent(progress: RecoveryProgress): number {
  const total = TARGET.events + TARGET.explicitEditions + TARGET.parkrunEditions + TARGET.groups;
  let completed = 0;
  if (progress.phase === "events") completed = progress.cursor;
  if (progress.phase === "editions") completed = TARGET.events + progress.cursor;
  if (progress.phase === "parkrun") {
    completed =
      TARGET.events +
      TARGET.explicitEditions +
      Math.min(progress.cursor, parkrunSeries.length) *
        weeklyOccurrences(PARKRUN_5K_START, PARKRUN_5K_END);
  }
  if (progress.phase === "groups") {
    completed = TARGET.events + TARGET.explicitEditions + TARGET.parkrunEditions;
  }
  if (progress.phase === "complete") completed = total;
  return Math.min(100, Math.round((completed / total) * 1000) / 10);
}

async function getStatusWithSql(sql: Sql): Promise<CatalogueRecoveryStatus> {
  const [progressRaw, completeVersion, current] = await Promise.all([
    readMeta(sql, PROGRESS_KEY),
    readMeta(sql, COMPLETE_KEY),
    getCounts(sql),
  ]);
  const progress = parseProgress(progressRaw);
  const countFloorMet = current.events >= TARGET.events && current.editions >= TARGET.editions;
  const complete = completeVersion === RECOVERY_VERSION && countFloorMet;
  return {
    backend: dbSource,
    recoveryVersion: RECOVERY_VERSION,
    complete,
    phase: complete ? "complete" : progress.phase,
    cursor: progress.cursor,
    batchesCompleted: progress.batchesCompleted,
    progressPercent: complete ? 100 : progressPercent(progress),
    current,
    target: TARGET,
  };
}

async function missingEventCount(sql: Sql): Promise<number> {
  let missing = 0;
  for (const batch of chunks(seriesList, 1000)) {
    const ids = await eventIdsForSlugs(
      sql,
      batch.map((series) => series.slug),
    );
    missing += batch.length - ids.size;
  }
  return missing;
}

async function missingExplicitEditionCount(sql: Sql): Promise<number> {
  let missing = 0;
  for (const batch of chunks(editionSeeds as EditionWithEntryOptions[], 500)) {
    const eventIds = await eventIdsForSlugs(sql, [
      ...new Set(batch.map((edition) => edition.seriesSlug)),
    ]);
    const ids = await editionIdsForBatch(sql, batch, eventIds);
    missing += batch.length - ids.size;
  }
  return missing;
}

async function recoveredParkrunEditionCount(sql: Sql): Promise<number> {
  const rows = await sql.query<{ count: number }>(
    `select count(*)::int as count
     from editions ed
     join events e on e.id = ed.event_id
     where e.sport = 'Parkrun'
       and (
         (
           e.name not ilike '%junior%'
           and ed.distance_code = '5K'
           and ed.event_date between $1::date and $2::date
           and extract(dow from ed.event_date) = 6
         )
         or
         (
           e.name ilike '%junior%'
           and ed.distance_code = '2K'
           and ed.event_date between $3::date and $4::date
           and extract(dow from ed.event_date) = 0
         )
       )`,
    [PARKRUN_5K_START, PARKRUN_5K_END, PARKRUN_2K_START, PARKRUN_2K_END],
  );
  return rows[0]?.count ?? 0;
}

async function missingGroupCount(sql: Sql): Promise<number> {
  if (!raceGroupMemberships.length) return 0;
  let missing = 0;
  for (const batch of chunks(raceGroupMemberships, 200)) {
    const params: unknown[] = [];
    const values = batch.map((membership) => {
      params.push(membership.seriesSlug, membership.groupCode);
      return `($${params.length - 1}::text, $${params.length}::text)`;
    });
    const rows = await sql.query<{ count: number }>(
      `select count(*)::int as count
       from (values ${values.join(", ")}) as target (event_slug, group_code)
       left join events e on e.slug = target.event_slug
       left join event_groups g on g.event_id = e.id and g.group_code = target.group_code
       where g.event_id is null`,
      params,
    );
    missing += rows[0]?.count ?? 0;
  }
  return missing;
}

async function missingEntryOptionCount(sql: Sql): Promise<number> {
  let missing = 0;
  for (const batch of chunks(targetEntryOptionKeys, 400)) {
    const params: unknown[] = [];
    const values = batch.map((target) => {
      params.push(target.seriesSlug, target.date, target.distance, target.providerCode);
      return `($${params.length - 3}::text, $${params.length - 2}::date, $${params.length - 1}::text, $${params.length}::text)`;
    });
    const rows = await sql.query<{ count: number }>(
      `select count(*)::int as count
       from (values ${values.join(", ")}) as target (
         event_slug, event_date, distance_code, provider_code
       )
       left join events e on e.slug = target.event_slug
       left join editions ed
         on ed.event_id = e.id
        and ed.event_date = target.event_date
        and ed.distance_code = target.distance_code
       left join edition_entry_options option
         on option.edition_id = ed.id
        and option.provider_code = target.provider_code
       where option.id is null`,
      params,
    );
    missing += rows[0]?.count ?? 0;
  }
  return missing;
}

async function verifyCompleteness(sql: Sql): Promise<{
  missingEvents: number;
  missingExplicitEditions: number;
  missingParkrunEditions: number;
  missingEntryOptions: number;
  missingGroups: number;
}> {
  const [missingEvents, missingExplicitEditions, parkrunCount, missingEntryOptions, missingGroups] =
    await Promise.all([
      missingEventCount(sql),
      missingExplicitEditionCount(sql),
      recoveredParkrunEditionCount(sql),
      missingEntryOptionCount(sql),
      missingGroupCount(sql),
    ]);
  return {
    missingEvents,
    missingExplicitEditions,
    missingParkrunEditions: Math.max(0, TARGET.parkrunEditions - parkrunCount),
    missingEntryOptions,
    missingGroups,
  };
}

export async function getCatalogueRecoveryVerification(): Promise<
  Awaited<ReturnType<typeof verifyCompleteness>>
> {
  const sql = await getSql();
  return verifyCompleteness(sql);
}

function retryProgress(
  verification: Awaited<ReturnType<typeof verifyCompleteness>>,
): RecoveryProgress {
  if (verification.missingEvents > 0) return { ...DEFAULT_PROGRESS };
  if (verification.missingExplicitEditions > 0) {
    return { ...DEFAULT_PROGRESS, phase: "editions" };
  }
  if (verification.missingEntryOptions > 0) {
    return { ...DEFAULT_PROGRESS, phase: "editions" };
  }
  if (verification.missingParkrunEditions > 0) {
    return { ...DEFAULT_PROGRESS, phase: "parkrun" };
  }
  return { ...DEFAULT_PROGRESS, phase: "groups" };
}

export async function getCatalogueRecoveryStatus(): Promise<CatalogueRecoveryStatus> {
  const sql = await getSql();
  return getStatusWithSql(sql);
}

export async function runCatalogueRecoveryBatch(): Promise<CatalogueRecoveryStatus> {
  if (dbSource !== "neon") {
    throw new Error("Catalogue recovery is only available on the persistent Neon database");
  }
  const sql = await getSql();
  return sql.transaction(async (tx) => {
    const lock = await tx.query<{ value: string }>(
      `insert into app_meta (key, value) values ($1, $2)
       on conflict (key) do nothing
       returning value`,
      [LOCK_KEY, RECOVERY_VERSION],
    );
    if (!lock.length) {
      throw new Error("Another catalogue recovery batch is already running");
    }

    const existingStatus = await getStatusWithSql(tx);
    if (existingStatus.complete) {
      await tx.query("delete from app_meta where key = $1", [LOCK_KEY]);
      return existingStatus;
    }

    let progress = parseProgress(await readMeta(tx, PROGRESS_KEY));
    if (progress.phase === "complete") progress = { ...DEFAULT_PROGRESS };

    if (progress.phase === "parkrun" && progress.cursor === 0) {
      if ((await missingExplicitEditionCount(tx)) > 0) {
        progress = { ...progress, phase: "editions", cursor: 0 };
      } else if ((await recoveredParkrunEditionCount(tx)) >= TARGET.parkrunEditions) {
        progress = { ...progress, phase: "groups", cursor: 0 };
      }
    }

    if (progress.phase === "events") {
      const batch = seriesList.slice(progress.cursor, progress.cursor + EVENT_BATCH_SIZE);
      await recoverEvents(tx, batch);
      const cursor = progress.cursor + batch.length;
      progress = {
        ...progress,
        phase: cursor >= seriesList.length ? "editions" : "events",
        cursor: cursor >= seriesList.length ? 0 : cursor,
        batchesCompleted: progress.batchesCompleted + 1,
      };
    } else if (progress.phase === "editions") {
      const batch = (editionSeeds as EditionWithEntryOptions[]).slice(
        progress.cursor,
        progress.cursor + EDITION_BATCH_SIZE,
      );
      await recoverEditions(tx, batch);
      const cursor = progress.cursor + batch.length;
      progress = {
        ...progress,
        phase: cursor >= editionSeeds.length ? "parkrun" : "editions",
        cursor: cursor >= editionSeeds.length ? 0 : cursor,
        batchesCompleted: progress.batchesCompleted + 1,
      };
    } else if (progress.phase === "parkrun") {
      const batch = parkrunSeries.slice(progress.cursor, progress.cursor + PARKRUN_BATCH_SIZE);
      await recoverParkruns(tx, batch);
      const cursor = progress.cursor + batch.length;
      progress = {
        ...progress,
        phase: cursor >= parkrunSeries.length ? "groups" : "parkrun",
        cursor: cursor >= parkrunSeries.length ? 0 : cursor,
        batchesCompleted: progress.batchesCompleted + 1,
      };
    } else if (progress.phase === "groups") {
      await recoverGroups(tx);
      const verification = await verifyCompleteness(tx);
      if (
        verification.missingEvents === 0 &&
        verification.missingExplicitEditions === 0 &&
        verification.missingParkrunEditions === 0 &&
        verification.missingEntryOptions === 0 &&
        verification.missingGroups === 0
      ) {
        progress = {
          ...progress,
          phase: "complete",
          cursor: 0,
          batchesCompleted: progress.batchesCompleted + 1,
        };
        await writeMeta(tx, COMPLETE_KEY, RECOVERY_VERSION);
        await writeMeta(tx, "fixtures_catalogue_version", CATALOGUE_SEED_VERSION);
      } else {
        progress = {
          ...retryProgress(verification),
          batchesCompleted: progress.batchesCompleted + 1,
        };
      }
    }

    await writeMeta(tx, PROGRESS_KEY, JSON.stringify(progress));
    await tx.query("delete from app_meta where key = $1", [LOCK_KEY]);
    return getStatusWithSql(tx);
  });
}
