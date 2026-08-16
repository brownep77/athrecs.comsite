import { getSql } from "@/lib/db";
import {
  athletes as athleteSeeds,
  catalogueMetadata,
  clubs as clubSeeds,
  editions as editionSeeds,
  results as resultSeeds,
  seriesList,
} from "@/data/catalogue";
import { ensureAthleticsTaxonomy } from "./athletics-taxonomy.server";

const SEED_VERSION = "athrecs-athletics-taxonomy-v65";
const EXPECTED = catalogueMetadata.merged_counts;

type Sql = Awaited<ReturnType<typeof getSql>>;
type GlobalSeedState = typeof globalThis & {
  __athrecsFullSeedPromise__?: Promise<void>;
};

const globalSeedState = globalThis as GlobalSeedState;

function parseTimeToSeconds(raw: string): number {
  const parts = raw.trim().replace(",", ".").split(":").map(Number);
  if (parts.length === 3) {
    return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  }
  if (parts.length === 2) {
    return Math.round(parts[0] * 60 + parts[1]);
  }
  return Math.round(parts[0]);
}

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
  chunkSize = 100,
): Promise<void> {
  for (const batch of chunks(rows, chunkSize)) {
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

async function deleteRowsOutsideCatalogue(sql: Sql, table: string, slugs: string[]): Promise<void> {
  const placeholders = slugs.map((_, index) => `$${index + 1}`).join(", ");
  await sql.query(`delete from ${table} where slug not in (${placeholders})`, slugs);
}

async function ensureSchema(sql: Sql): Promise<void> {
  const statements = [
    `create table if not exists clubs (
      id serial primary key,
      slug text not null unique,
      name text not null,
      city text not null default '',
      county text not null default 'Norfolk',
      country text not null default 'England',
      sports text not null default '',
      website text,
      summary text not null default '',
      source_names text not null default '',
      created_at timestamptz not null default now()
    )`,
    `create table if not exists events (
      id serial primary key,
      source_id int,
      slug text not null unique,
      name text not null,
      sport text not null,
      country text not null default 'England',
      county text not null default 'Norfolk',
      city text not null default '',
      area text not null default '',
      surface text not null default 'Road',
      summary text not null default '',
      description text not null default '',
      organiser text not null default '',
      website text not null default '',
      featured boolean not null default false,
      source_url text,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists event_distances (
      event_id int not null references events(id) on delete cascade,
      distance_code text not null,
      primary key (event_id, distance_code)
    )`,
    `create table if not exists editions (
      id serial primary key,
      source_id int,
      event_id int not null references events(id) on delete cascade,
      event_date date not null,
      distance_code text not null,
      distance_km double precision not null default 0,
      status text not null default 'TBC',
      entry_url text,
      source_url text,
      start_time text,
      notes text,
      results_permission text,
      results_hosting text,
      results_official_url text,
      results_permission_note text,
      results_permission_at timestamptz,
      results_permission_by text,
      results_rights_requested_at timestamptz,
      public_result_count int,
      partner_result_count int,
      athlete_result_count int,
      results_access text,
      unique (event_id, event_date, distance_code)
    )`,
    `create table if not exists athletes (
      id serial primary key,
      source_id int,
      slug text not null unique,
      display_name text not null,
      given_name text,
      family_name text,
      gender text not null default 'U',
      club_id int references clubs(id) on delete set null,
      second_club_id int references clubs(id) on delete set null,
      source_club_name text,
      source_second_club_name text,
      city text,
      county text not null default 'Norfolk',
      country text not null default 'England',
      bio text not null default '',
      date_of_birth date,
      nation text,
      continent text,
      commonwealth boolean,
      race_entry_name text,
      default_category text,
      default_bib text,
      preferred_distance text,
      ea_number text,
      athrecs_id text,
      parent_athlete_id int references athletes(id) on delete set null,
      avatar_url text,
      source_url text,
      created_at timestamptz not null default now()
    )`,
    `create table if not exists athlete_clubs (
      athlete_id int not null references athletes(id) on delete cascade,
      club_id int not null references clubs(id) on delete cascade,
      relationship text not null,
      source_name text,
      primary key (athlete_id, club_id, relationship)
    )`,
    `create table if not exists results (
      id serial primary key,
      source_id int,
      edition_id int not null references editions(id) on delete cascade,
      athlete_id int not null references athletes(id) on delete cascade,
      status text not null default 'finished',
      finish_time_seconds int,
      chip_time_seconds int,
      gun_time_seconds int,
      bib text,
      overall_place int,
      gender_place int,
      category text,
      category_place int,
      age_on_day int,
      age_grade_pct double precision,
      open_rating int,
      age_grade_rating int,
      result_source text,
      source_url text,
      unique (edition_id, athlete_id)
    )`,
    `create table if not exists app_meta (
      key text primary key,
      value text not null
    )`,
    `alter table clubs add column if not exists source_names text not null default ''`,
    `alter table events add column if not exists source_id int`,
    `alter table events add column if not exists source_url text`,
    `alter table editions add column if not exists source_id int`,
    `alter table editions add column if not exists notes text`,
    `alter table editions add column if not exists results_permission text`,
    `alter table editions add column if not exists results_hosting text`,
    `alter table editions add column if not exists results_official_url text`,
    `alter table editions add column if not exists results_permission_note text`,
    `alter table editions add column if not exists results_permission_at timestamptz`,
    `alter table editions add column if not exists results_permission_by text`,
    `alter table editions add column if not exists results_rights_requested_at timestamptz`,
    `alter table editions add column if not exists public_result_count int`,
    `alter table editions add column if not exists partner_result_count int`,
    `alter table editions add column if not exists athlete_result_count int`,
    `alter table editions add column if not exists results_access text`,
    `alter table athletes add column if not exists source_id int`,
    `alter table athletes add column if not exists given_name text`,
    `alter table athletes add column if not exists family_name text`,
    `alter table athletes add column if not exists second_club_id int references clubs(id) on delete set null`,
    `alter table athletes add column if not exists source_club_name text`,
    `alter table athletes add column if not exists source_second_club_name text`,
    `alter table athletes add column if not exists date_of_birth date`,
    `alter table athletes add column if not exists nation text`,
    `alter table athletes add column if not exists continent text`,
    `alter table athletes add column if not exists commonwealth boolean`,
    `alter table athletes add column if not exists race_entry_name text`,
    `alter table athletes add column if not exists default_category text`,
    `alter table athletes add column if not exists default_bib text`,
    `alter table athletes add column if not exists preferred_distance text`,
    `alter table athletes add column if not exists ea_number text`,
    `alter table athletes add column if not exists athrecs_id text`,
    `alter table athletes add column if not exists parent_athlete_id int references athletes(id) on delete set null`,
    `alter table athletes add column if not exists avatar_url text`,
    `alter table athletes add column if not exists source_url text`,
    `alter table results add column if not exists source_id int`,
    `alter table results add column if not exists chip_time_seconds int`,
    `alter table results add column if not exists gun_time_seconds int`,
    `alter table results add column if not exists bib text`,
    `alter table results add column if not exists gender_place int`,
    `alter table results add column if not exists category_place int`,
    `alter table results add column if not exists age_on_day int`,
    `alter table results add column if not exists age_grade_pct double precision`,
    `alter table results add column if not exists open_rating int`,
    `alter table results add column if not exists age_grade_rating int`,
    `alter table results add column if not exists result_source text`,
    `alter table results add column if not exists source_url text`,
    `create unique index if not exists events_source_id_idx on events(source_id) where source_id is not null`,
    `create unique index if not exists editions_source_id_idx on editions(source_id) where source_id is not null`,
    `create unique index if not exists athletes_source_id_idx on athletes(source_id) where source_id is not null`,
    `create unique index if not exists athletes_athrecs_id_idx on athletes(athrecs_id) where athrecs_id is not null`,
    `create unique index if not exists results_source_id_idx on results(source_id) where source_id is not null`,
  ];
  for (const statement of statements) await sql.query(statement);
}

async function alreadySeeded(sql: Sql): Promise<boolean> {
  const [meta, counts, paul] = await Promise.all([
    sql<{ value: string }>`select value from app_meta where key = 'seed_version' limit 1`,
    sql<{
      clubs: number;
      athletes: number;
      race_series: number;
      editions: number;
      results: number;
    }>`select
      (select count(*)::int from clubs) as clubs,
      (select count(*)::int from athletes) as athletes,
      (select count(*)::int from events) as race_series,
      (select count(*)::int from editions) as editions,
      (select count(*)::int from results) as results`,
    sql<{ ok: boolean }>`select exists (
      select 1
      from athletes a
      left join clubs primary_club on primary_club.id = a.club_id
      left join clubs secondary_club on secondary_club.id = a.second_club_id
      where a.slug = 'paul-browne'
        and primary_club.slug = 'unattached'
        and secondary_club.id is null
        and a.date_of_birth = '1978-05-20'::date
        and not exists (
          select 1 from athlete_clubs ac
          join clubs c on c.id = ac.club_id
          where ac.athlete_id = a.id and lower(c.name) like '%norfolk gazelles%'
        )
        and exists (
          select 1 from results r
          join editions ed on ed.id = r.edition_id
          join events e on e.id = ed.event_id
          where r.athlete_id = a.id
            and e.slug = 'ostersund-marathon'
            and ed.event_date = '2007-07-21'::date
            and r.finish_time_seconds = 12589
        )
    ) as ok`,
  ]);
  const row = counts[0];
  // Soft floor: once catalogue baseline is met, never force a destructive reseed.
  // athletes/results grow via importResults. Do not require exact seed_version.
  // Paul Browne check is best-effort — if data volume is already large, skip wipe
  // even if the identity query fails (avoids Neon import wipes on edge cases).
  const countsOk = Boolean(
    (row?.clubs ?? 0) >= EXPECTED.clubs &&
    (row?.athletes ?? 0) >= EXPECTED.athletes &&
    (row?.race_series ?? 0) >= EXPECTED.race_series &&
    (row?.editions ?? 0) >= EXPECTED.editions &&
    (row?.results ?? 0) >= EXPECTED.results,
  );
  const largeImport =
    (row?.athletes ?? 0) >= EXPECTED.athletes + 100 ||
    (row?.results ?? 0) >= EXPECTED.results + 100 ||
    (row?.editions ?? 0) >= EXPECTED.editions + 20;
  const aboveFloor = countsOk && (Boolean(paul[0]?.ok) || largeImport);
  if (aboveFloor && meta[0]?.value !== SEED_VERSION) {
    await sql`
      insert into app_meta (key, value) values ('seed_version', ${SEED_VERSION})
      on conflict (key) do update set value = excluded.value
    `;
  }
  return aboveFloor;
}

async function upsertCatalogueClubs(sql: Sql): Promise<void> {
  const meta = await sql<{ value: string }>`
    select value from app_meta where key = 'clubs_catalogue_version' limit 1
  `;
  const count = await sql<{ n: number }>`select count(*)::int as n from clubs`;
  const targetVersion = SEED_VERSION;
  if (meta[0]?.value === targetVersion && (count[0]?.n ?? 0) >= EXPECTED.clubs) {
    return;
  }
  await insertRows(
    sql,
    "clubs",
    ["slug", "name", "city", "county", "country", "sports", "website", "summary", "source_names"],
    clubSeeds.map((club) => [
      club.slug,
      club.name,
      club.city,
      club.county ?? "Norfolk",
      club.country ?? "England",
      club.sports.join(","),
      club.website ?? null,
      club.summary,
      (club.source_names ?? []).join("|"),
    ]),
    `on conflict (slug) do update set
      name = excluded.name,
      city = excluded.city,
      county = excluded.county,
      country = excluded.country,
      sports = excluded.sports,
      website = excluded.website,
      summary = excluded.summary,
      source_names = excluded.source_names`,
    80,
  );
  await sql`
    insert into app_meta (key, value) values ('clubs_catalogue_version', ${targetVersion})
    on conflict (key) do update set value = excluded.value
  `;
}

async function ensureParkrunCalendar(sql: Sql): Promise<void> {
  const meta = await sql<{ value: string }>`
    select value from app_meta where key = 'parkrun_through' limit 1
  `;
  if (meta[0]?.value === "2027-12-26") return;
  await expandParkrunEditions(sql);
  await sql`
    insert into app_meta (key, value) values ('parkrun_through', '2027-12-26')
    on conflict (key) do update set value = excluded.value
  `;
}

async function expandParkrunEditions(sql: Sql): Promise<void> {
  // Weekly 5K Saturdays and junior 2K Sundays through the end of 2027.
  await sql`
    insert into editions (
      event_id, event_date, distance_code, distance_km, status,
      entry_url, source_url, start_time, notes
    )
    select
      e.id,
      d::date,
      '5K',
      5,
      'Open',
      e.website,
      e.website,
      case
        when e.country in (
          'Australia', 'New Zealand', 'South Africa', 'Namibia',
          'Eswatini', 'Singapore', 'Malaysia', 'Japan'
        ) then '08:00'
        else '09:00'
      end,
      'Weekly parkrun 5K — Saturday morning local time. Confirm cancellations on the parkrun event page.'
    from events e
    cross join generate_series(date '2026-08-15', date '2027-12-25', interval '7 days') as d
    where e.sport = 'Parkrun'
      and e.name not ilike '%junior%'
    on conflict (event_id, event_date, distance_code) do nothing
  `;
  await sql`
    insert into editions (
      event_id, event_date, distance_code, distance_km, status,
      entry_url, source_url, start_time, notes
    )
    select
      e.id,
      d::date,
      '2K',
      2,
      'Open',
      e.website,
      e.website,
      '09:00',
      'Weekly junior parkrun 2K — Sunday 09:00. Confirm cancellations on the parkrun event page.'
    from events e
    cross join generate_series(date '2026-08-16', date '2027-12-26', interval '7 days') as d
    where e.sport = 'Parkrun'
      and e.name ilike '%junior%'
    on conflict (event_id, event_date, distance_code) do nothing
  `;
}

async function upsertCatalogueFixtures(sql: Sql): Promise<void> {
  const meta = await sql<{ value: string }>`
    select value from app_meta where key = 'fixtures_catalogue_version' limit 1
  `;
  if (meta[0]?.value === SEED_VERSION) return;

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
    seriesList.map((series) => [
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
    `on conflict (slug) do update set
      source_id = excluded.source_id,
      name = excluded.name,
      sport = excluded.sport,
      country = excluded.country,
      county = excluded.county,
      city = excluded.city,
      area = excluded.area,
      surface = excluded.surface,
      summary = excluded.summary,
      description = excluded.description,
      organiser = excluded.organiser,
      website = excluded.website,
      featured = excluded.featured,
      source_url = excluded.source_url`,
    80,
  );

  const eventRows = await sql<{ id: number; slug: string }>`select id, slug from events`;
  const eventIds = new Map(eventRows.map((row) => [row.slug, row.id]));

  const distanceRows = seriesList.flatMap((series) =>
    [...new Set(series.distances)].map((distance) => [eventIds.get(series.slug), distance]),
  );
  await insertRows(
    sql,
    "event_distances",
    ["event_id", "distance_code"],
    distanceRows,
    "on conflict (event_id, distance_code) do nothing",
    100,
  );

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
    editionSeeds.map((edition) => [
      edition.source_id ?? null,
      eventIds.get(edition.seriesSlug),
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
      (edition as { resultsRightsRequestedAt?: string | null }).resultsRightsRequestedAt ?? null,
      edition.publicResultCount ?? null,
      edition.partnerResultCount ?? null,
      edition.athleteResultCount ?? null,
      edition.resultsAccess ?? null,
    ]),
    `on conflict (event_id, event_date, distance_code) do update set
      source_id = excluded.source_id,
      distance_km = excluded.distance_km,
      status = excluded.status,
      entry_url = excluded.entry_url,
      source_url = excluded.source_url,
      start_time = excluded.start_time,
      notes = excluded.notes,
      results_permission = excluded.results_permission,
      results_hosting = excluded.results_hosting,
      results_official_url = excluded.results_official_url,
      results_permission_note = excluded.results_permission_note,
      results_permission_at = excluded.results_permission_at,
      results_permission_by = excluded.results_permission_by,
      results_rights_requested_at = excluded.results_rights_requested_at,
      public_result_count = excluded.public_result_count,
      partner_result_count = excluded.partner_result_count,
      athlete_result_count = excluded.athlete_result_count,
      results_access = excluded.results_access`,
    75,
  );

  await expandParkrunEditions(sql);

  await sql`
    insert into app_meta (key, value) values ('fixtures_catalogue_version', ${SEED_VERSION})
    on conflict (key) do update set value = excluded.value
  `;
}

async function seed(): Promise<void> {
  const sql = await getSql();
  await ensureSchema(sql);
  await ensureAthleticsTaxonomy(sql);

  // Always upsert governing-body / catalogue clubs (append-only, no deletes).
  // Safe on Neon + PGLite so new club catalogue rows appear without wiping results.
  await upsertCatalogueClubs(sql);

  // Always refresh race calendar fixtures (events + editions) without wiping results.
  await upsertCatalogueFixtures(sql);
  await ensureParkrunCalendar(sql);

  if (await alreadySeeded(sql)) return;

  // NEVER wipe a non-empty database. Full catalogue seed only runs on empty DBs.
  // Imports (multi-year Run Norwich etc.) must survive deploys and cold starts.
  const guard = await sql<{ athletes: number; results: number; clubs: number }>`
    select
      (select count(*)::int from athletes) as athletes,
      (select count(*)::int from results) as results,
      (select count(*)::int from clubs) as clubs`;
  const g = guard[0];
  if (g && (g.athletes > 0 || g.results > 0)) {
    await sql`
      insert into app_meta (key, value) values ('seed_version', ${SEED_VERSION})
      on conflict (key) do update set value = excluded.value
    `;
    return;
  }

  // Empty DB only — full catalogue seed (clubs already upserted above).
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
    seriesList.map((series) => [
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
    `on conflict (slug) do update set
      source_id = excluded.source_id,
      name = excluded.name,
      sport = excluded.sport,
      country = excluded.country,
      county = excluded.county,
      city = excluded.city,
      area = excluded.area,
      surface = excluded.surface,
      summary = excluded.summary,
      description = excluded.description,
      organiser = excluded.organiser,
      website = excluded.website,
      featured = excluded.featured,
      source_url = excluded.source_url`,
  );

  const clubRows = await sql<{ id: number; slug: string }>`select id, slug from clubs`;
  const clubIds = new Map(clubRows.map((row) => [row.slug, row.id]));
  await insertRows(
    sql,
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
      "parent_athlete_id",
      "avatar_url",
      "source_url",
    ],
    athleteSeeds.map((athlete) => [
      athlete.source_id ?? null,
      athlete.slug,
      athlete.display_name,
      athlete.given_name ?? null,
      athlete.family_name ?? null,
      athlete.gender,
      clubIds.get(athlete.club_slug) ?? null,
      athlete.second_club_slug ? (clubIds.get(athlete.second_club_slug) ?? null) : null,
      athlete.source_club_name ?? null,
      athlete.source_second_club_name ?? null,
      athlete.city,
      athlete.county ?? "Norfolk",
      athlete.country ?? "England",
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
      null,
      athlete.avatar_url ?? null,
      athlete.source_url ?? null,
    ]),
    `on conflict (slug) do update set
      source_id = excluded.source_id,
      display_name = excluded.display_name,
      given_name = excluded.given_name,
      family_name = excluded.family_name,
      gender = excluded.gender,
      club_id = excluded.club_id,
      second_club_id = excluded.second_club_id,
      source_club_name = excluded.source_club_name,
      source_second_club_name = excluded.source_second_club_name,
      city = excluded.city,
      county = excluded.county,
      country = excluded.country,
      bio = excluded.bio,
      date_of_birth = excluded.date_of_birth,
      nation = excluded.nation,
      continent = excluded.continent,
      commonwealth = excluded.commonwealth,
      race_entry_name = excluded.race_entry_name,
      default_category = excluded.default_category,
      default_bib = excluded.default_bib,
      preferred_distance = excluded.preferred_distance,
      ea_number = excluded.ea_number,
      athrecs_id = excluded.athrecs_id,
      parent_athlete_id = excluded.parent_athlete_id,
      avatar_url = excluded.avatar_url,
      source_url = excluded.source_url`,
    50,
  );

  await deleteRowsOutsideCatalogue(
    sql,
    "athletes",
    athleteSeeds.map((athlete) => athlete.slug),
  );
  await deleteRowsOutsideCatalogue(
    sql,
    "events",
    seriesList.map((series) => series.slug),
  );
  await deleteRowsOutsideCatalogue(
    sql,
    "clubs",
    clubSeeds.map((club) => club.slug),
  );

  const [eventRows, athleteRows] = await Promise.all([
    sql<{ id: number; slug: string }>`select id, slug from events`,
    sql<{ id: number; slug: string }>`select id, slug from athletes`,
  ]);
  const eventIds = new Map(eventRows.map((row) => [row.slug, row.id]));
  const athleteIds = new Map(athleteRows.map((row) => [row.slug, row.id]));

  const parentLinks = athleteSeeds.filter((athlete) => athlete.parent_athlete_slug);
  for (const athlete of parentLinks) {
    await sql.query("update athletes set parent_athlete_id = $1 where id = $2", [
      athleteIds.get(athlete.parent_athlete_slug as string) ?? null,
      athleteIds.get(athlete.slug),
    ]);
  }

  const athleteClubRows: unknown[][] = [];
  for (const athlete of athleteSeeds) {
    const athleteId = athleteIds.get(athlete.slug);
    const primaryClubId = clubIds.get(athlete.club_slug);
    if (athleteId && primaryClubId) {
      athleteClubRows.push([athleteId, primaryClubId, "primary", athlete.source_club_name ?? null]);
    }
    const secondaryClubId = athlete.second_club_slug
      ? clubIds.get(athlete.second_club_slug)
      : undefined;
    if (athleteId && secondaryClubId && secondaryClubId !== primaryClubId) {
      athleteClubRows.push([
        athleteId,
        secondaryClubId,
        "secondary",
        athlete.source_second_club_name ?? null,
      ]);
    }
  }
  await insertRows(
    sql,
    "athlete_clubs",
    ["athlete_id", "club_id", "relationship", "source_name"],
    athleteClubRows,
    "on conflict (athlete_id, club_id, relationship) do update set source_name = excluded.source_name",
  );

  const distanceRows = seriesList.flatMap((series) =>
    [...new Set(series.distances)].map((distance) => [eventIds.get(series.slug), distance]),
  );
  await insertRows(
    sql,
    "event_distances",
    ["event_id", "distance_code"],
    distanceRows,
    "on conflict (event_id, distance_code) do nothing",
  );

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
    editionSeeds.map((edition) => [
      edition.source_id ?? null,
      eventIds.get(edition.seriesSlug),
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
      (edition as { resultsRightsRequestedAt?: string | null }).resultsRightsRequestedAt ?? null,
      edition.publicResultCount ?? null,
      edition.partnerResultCount ?? null,
      edition.athleteResultCount ?? null,
      edition.resultsAccess ?? null,
    ]),
    `on conflict (event_id, event_date, distance_code) do update set
      source_id = excluded.source_id,
      distance_km = excluded.distance_km,
      status = excluded.status,
      entry_url = excluded.entry_url,
      source_url = excluded.source_url,
      start_time = excluded.start_time,
      notes = excluded.notes,
      results_permission = excluded.results_permission,
      results_hosting = excluded.results_hosting,
      results_official_url = excluded.results_official_url,
      results_permission_note = excluded.results_permission_note,
      results_permission_at = excluded.results_permission_at,
      results_permission_by = excluded.results_permission_by,
      results_rights_requested_at = excluded.results_rights_requested_at,
      public_result_count = excluded.public_result_count,
      partner_result_count = excluded.partner_result_count,
      athlete_result_count = excluded.athlete_result_count,
      results_access = excluded.results_access`,
    75,
  );

  const editionRows = await sql<{
    id: number;
    event_slug: string;
    event_date: string;
    distance_code: string;
  }>`select ed.id, e.slug as event_slug, ed.event_date::text as event_date, ed.distance_code
      from editions ed join events e on e.id = ed.event_id`;
  const editionIds = new Map(
    editionRows.map((row) => [`${row.event_slug}|${row.event_date}|${row.distance_code}`, row.id]),
  );

  await insertRows(
    sql,
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
    ],
    resultSeeds
      .map((result) => [
        result.source_id ?? null,
        editionIds.get(`${result.eventSlug}|${result.date}|${result.distance}`),
        athleteIds.get(result.athleteSlug),
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
        result.resultSource ?? null,
        result.source,
      ])
      .filter((row) => row[1] != null && row[2] != null),
    `on conflict (edition_id, athlete_id) do update set
      source_id = excluded.source_id,
      status = excluded.status,
      finish_time_seconds = excluded.finish_time_seconds,
      chip_time_seconds = excluded.chip_time_seconds,
      gun_time_seconds = excluded.gun_time_seconds,
      bib = excluded.bib,
      overall_place = excluded.overall_place,
      gender_place = excluded.gender_place,
      category = excluded.category,
      category_place = excluded.category_place,
      age_on_day = excluded.age_on_day,
      age_grade_pct = excluded.age_grade_pct,
      open_rating = excluded.open_rating,
      age_grade_rating = excluded.age_grade_rating,
      result_source = excluded.result_source,
      source_url = excluded.source_url`,
    100,
  );

  const counts = await sql<{
    clubs: number;
    athletes: number;
    race_series: number;
    editions: number;
    results: number;
  }>`select
    (select count(*)::int from clubs) as clubs,
    (select count(*)::int from athletes) as athletes,
    (select count(*)::int from events) as race_series,
    (select count(*)::int from editions) as editions,
    (select count(*)::int from results) as results`;
  const row = counts[0];
  // Soft floor after seed: allow counts at or above the catalogue baseline.
  if (
    !row ||
    row.clubs < EXPECTED.clubs ||
    row.athletes < EXPECTED.athletes ||
    row.race_series < EXPECTED.race_series ||
    row.editions < EXPECTED.editions ||
    row.results < EXPECTED.results
  ) {
    throw new Error(`Catalogue seed count mismatch: ${JSON.stringify(row)}`);
  }

  await sql`
    insert into app_meta (key, value) values ('seed_version', ${SEED_VERSION})
    on conflict (key) do update set value = excluded.value
  `;
  if (!(await alreadySeeded(sql))) {
    throw new Error("Catalogue seed verification failed after writing the seed marker");
  }
}

export function ensureAthrecsSeeded(): Promise<void> {
  globalSeedState.__athrecsFullSeedPromise__ ??= seed().catch((error) => {
    globalSeedState.__athrecsFullSeedPromise__ = undefined;
    throw error;
  });
  return globalSeedState.__athrecsFullSeedPromise__;
}
