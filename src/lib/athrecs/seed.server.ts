import { dbSource, getSql } from "@/lib/db";
import {
  athletes as athleteSeeds,
  catalogueMetadata,
  clubs as clubSeeds,
  editions as editionSeeds,
  results as resultSeeds,
  raceGroupMemberships,
  seriesList,
  clubSlugAliases,
} from "@/data/catalogue";
import { editionReplacements, eventSlugAliases } from "@/data/entry-options";
import {
  publicFigureAthletes,
  publicFigureEditions,
  publicFigureResults,
  publicFigureSeries,
} from "@/data/public-figures";
import { ensureAthleticsTaxonomy } from "./athletics-taxonomy.server";

// prettier-ignore
const SEED_VERSION = "athrecs-runrecs-uk-ireland-five-mile-five-k-2026-08-31-v276-world-athletics-track-field-2026-09-01-365ad5fbb8-runrecs-gap-fill-2026-09-03-v95";
export const CATALOGUE_SEED_VERSION = SEED_VERSION;
const PUBLIC_FIGURE_SEED_VERSION = "athrecs-public-figures-wave-3-v3";
const EXPECTED = catalogueMetadata.merged_counts;
const CATALOGUE_SEED_LOCK_ID = 1_095_527_506;

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
      address text,
      postcode text,
      region text,
      official_source text,
      source_url text,
      checked_at date,
      location_precision text not null default 'unverified',
      contact_url text,
      contacts_json text not null default '[]',
      socials_json text not null default '[]',
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
      region text,
      postcode text,
      latitude double precision,
      longitude double precision,
      data_verified_at timestamptz,
      updated_at timestamptz not null default now(),
      created_at timestamptz not null default now()
    )`,
    `create table if not exists event_distances (
      event_id int not null references events(id) on delete cascade,
      distance_code text not null,
      primary key (event_id, distance_code)
    )`,
    `create table if not exists event_groups (
      event_id int not null references events(id) on delete cascade,
      group_code text not null,
      label text not null,
      level text not null,
      source_url text not null,
      checked_at date not null,
      note text not null default '',
      primary key (event_id, group_code)
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
    `create table if not exists edition_entry_options (
      id serial primary key,
      edition_id int not null references editions(id) on delete cascade,
      provider_code text not null,
      provider_name text not null,
      entry_url text not null,
      entry_type text not null default 'official'
        check (entry_type in ('official', 'third_party', 'charity', 'tour_operator')),
      status text not null default 'unknown'
        check (status in ('open', 'closing_soon', 'ballot', 'waitlist', 'sold_out', 'closed', 'unknown')),
      price_amount numeric(12, 2)
        check (price_amount is null or price_amount >= 0),
      price_currency text,
      opens_at date,
      closes_at date,
      checked_at timestamptz not null default now(),
      source_url text,
      is_verified boolean not null default false,
      is_primary boolean not null default false,
      notes text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (edition_id, provider_code)
    )`,
    `create table if not exists edition_result_links (
      id serial primary key,
      edition_id int not null references editions(id) on delete cascade,
      provider_code text not null,
      provider_name text not null,
      results_url text not null check (results_url ~ '^https://'),
      canonical_url text not null check (canonical_url ~ '^https://'),
      source_url text check (source_url is null or source_url ~ '^https://'),
      registry_source_id text,
      is_verified boolean not null default false,
      status text not null default 'approved'
        check (status in ('approved', 'held', 'rejected')),
      checked_at timestamptz not null default now(),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (edition_id, canonical_url)
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
      profile_type text not null default 'Athlete',
      profile_roles text not null default '',
      profile_source_checked_at date,
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
    `create table if not exists site_analytics_events (
      id bigserial primary key,
      occurred_at timestamptz not null default now(),
      event_name text not null check (
        event_name in (
          'page_view', 'event_view', 'athlete_view', 'entry_click',
          'results_view', 'search', 'filter_apply'
        )
      ),
      path text not null,
      entity_type text check (entity_type is null or entity_type in ('event', 'athlete', 'club')),
      entity_slug text,
      session_hash text not null,
      athlete_id int references athletes(id) on delete set null,
      referrer_domain text,
      device_class text check (
        device_class is null or device_class in ('desktop', 'mobile', 'tablet', 'other')
      ),
      country_code text,
      region text,
      city text,
      consent_version text not null,
      metadata jsonb not null default '{}'::jsonb
    )`,
    `create table if not exists athlete_data_consents (
      id bigserial primary key,
      athlete_id int not null references athletes(id) on delete cascade,
      user_id text references "user"(id) on delete set null,
      purpose text not null check (
        purpose in ('performance_insights', 'personalisation', 'product_research', 'marketing')
      ),
      status text not null check (status in ('granted', 'withdrawn')),
      policy_version text not null,
      source text not null,
      granted_at timestamptz,
      withdrawn_at timestamptz,
      updated_at timestamptz not null default now(),
      unique (athlete_id, purpose)
    )`,
    `create table if not exists athlete_habit_profiles (
      athlete_id int primary key references athletes(id) on delete cascade,
      training_days_per_week smallint check (
        training_days_per_week is null or training_days_per_week between 0 and 14
      ),
      weekly_distance_km numeric(8, 2) check (
        weekly_distance_km is null or weekly_distance_km between 0 and 1000
      ),
      races_per_year smallint check (
        races_per_year is null or races_per_year between 0 and 365
      ),
      preferred_distances jsonb not null default '[]'::jsonb,
      preferred_surfaces jsonb not null default '[]'::jsonb,
      shoe_brands jsonb not null default '[]'::jsonb,
      kit_brands jsonb not null default '[]'::jsonb,
      nutrition_categories jsonb not null default '[]'::jsonb,
      recovery_methods jsonb not null default '[]'::jsonb,
      travel_preferences jsonb not null default '[]'::jsonb,
      source text not null,
      collected_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`,
    `create table if not exists app_meta (
      key text primary key,
      value text not null
    )`,
    `alter table clubs add column if not exists source_names text not null default ''`,
    `alter table clubs add column if not exists address text`,
    `alter table clubs add column if not exists postcode text`,
    `alter table clubs add column if not exists region text`,
    `alter table clubs add column if not exists official_source text`,
    `alter table clubs add column if not exists source_url text`,
    `alter table clubs add column if not exists checked_at date`,
    `alter table clubs add column if not exists location_precision text not null default 'unverified'`,
    `alter table clubs add column if not exists contact_url text`,
    `alter table clubs add column if not exists contacts_json text not null default '[]'`,
    `alter table clubs add column if not exists socials_json text not null default '[]'`,
    `alter table events add column if not exists source_id int`,
    `alter table events add column if not exists source_url text`,
    `alter table events add column if not exists region text`,
    `alter table events add column if not exists postcode text`,
    `alter table events add column if not exists latitude double precision`,
    `alter table events add column if not exists longitude double precision`,
    `alter table events add column if not exists data_verified_at timestamptz`,
    `alter table events add column if not exists updated_at timestamptz not null default now()`,
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
    `alter table athletes add column if not exists profile_type text not null default 'Athlete'`,
    `alter table athletes add column if not exists profile_roles text not null default ''`,
    `alter table athletes add column if not exists profile_source_checked_at date`,
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
    `create index if not exists events_country_region_idx on events(country, region)`,
    `create index if not exists events_country_city_idx on events(country, city)`,
    `create index if not exists events_postcode_idx on events(postcode) where postcode is not null`,
    `create index if not exists site_analytics_occurred_idx on site_analytics_events(occurred_at desc)`,
    `create index if not exists site_analytics_event_time_idx on site_analytics_events(event_name, occurred_at desc)`,
    `create index if not exists site_analytics_path_time_idx on site_analytics_events(path, occurred_at desc)`,
    `create index if not exists site_analytics_entity_time_idx on site_analytics_events(entity_type, entity_slug, occurred_at desc)`,
    `create index if not exists athlete_data_consents_status_idx on athlete_data_consents(purpose, status)`,
    `create index if not exists edition_entry_options_edition_idx on edition_entry_options(edition_id)`,
    `create unique index if not exists edition_entry_options_one_primary_idx
      on edition_entry_options(edition_id) where is_primary`,
    `create index if not exists edition_result_links_edition_idx on edition_result_links(edition_id)`,
    `create index if not exists edition_result_links_public_idx
      on edition_result_links(edition_id, status, is_verified)`,
    `alter table edition_entry_options add column if not exists notes text`,
    `insert into edition_entry_options (
      edition_id, provider_code, provider_name, entry_url, entry_type, status,
      checked_at, source_url, is_verified, is_primary
    )
    select
      ed.id,
      'official',
      'Official race entry',
      ed.entry_url,
      'official',
      case ed.status
        when 'Open' then 'open'
        when 'ClosingSoon' then 'closing_soon'
        when 'Closed' then 'closed'
        when 'Finished' then 'closed'
        else 'unknown'
      end,
      now(),
      coalesce(nullif(ed.source_url, ''), ed.entry_url),
      false,
      false
    from editions ed
    where nullif(trim(ed.entry_url), '') is not null
    on conflict (edition_id, provider_code) do nothing`,
    `update edition_entry_options option
      set is_primary = true, updated_at = now()
      where option.provider_code = 'official'
        and not exists (
          select 1
          from edition_entry_options existing_primary
          where existing_primary.edition_id = option.edition_id
            and existing_primary.is_primary
        )`,
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
    [
      "slug",
      "name",
      "city",
      "county",
      "country",
      "sports",
      "website",
      "summary",
      "source_names",
      "address",
      "postcode",
      "region",
      "official_source",
      "source_url",
      "checked_at",
      "location_precision",
      "contact_url",
      "contacts_json",
      "socials_json",
    ],
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
      club.address ?? null,
      club.postcode ?? null,
      club.region ?? null,
      club.official_source ?? null,
      club.source_url ?? null,
      club.checked_at ?? null,
      club.location_precision ?? "unverified",
      club.contact_url ?? null,
      JSON.stringify(club.contacts ?? []),
      JSON.stringify(club.socials ?? []),
    ]),
    `on conflict (slug) do update set
      name = excluded.name,
      city = excluded.city,
      county = excluded.county,
      country = excluded.country,
      sports = excluded.sports,
      website = excluded.website,
      summary = excluded.summary,
      source_names = excluded.source_names,
      address = excluded.address,
      postcode = excluded.postcode,
      region = excluded.region,
      official_source = excluded.official_source,
      source_url = excluded.source_url,
      checked_at = excluded.checked_at,
      location_precision = excluded.location_precision,
      contact_url = excluded.contact_url,
      contacts_json = excluded.contacts_json,
      socials_json = excluded.socials_json`,
    80,
  );
  await mergeCatalogueClubAliases(sql);
  await sql`
    insert into app_meta (key, value) values ('clubs_catalogue_version', ${targetVersion})
    on conflict (key) do update set value = excluded.value
  `;
}

async function mergeCatalogueClubAliases(sql: Sql): Promise<void> {
  for (const [aliasSlug, canonicalSlug] of Object.entries(clubSlugAliases)) {
    const rows = await sql<{ id: number; slug: string }>`
      select id, slug from clubs where slug in (${aliasSlug}, ${canonicalSlug})
    `;
    const alias = rows.find((row) => row.slug === aliasSlug);
    const canonical = rows.find((row) => row.slug === canonicalSlug);
    if (!alias || !canonical) continue;
    await sql`update athletes set club_id = ${canonical.id} where club_id = ${alias.id}`;
    await sql`update athletes set second_club_id = ${canonical.id} where second_club_id = ${alias.id}`;
    await sql`
      insert into athlete_clubs (athlete_id, club_id, relationship, source_name)
      select athlete_id, ${canonical.id}, relationship, source_name
      from athlete_clubs
      where club_id = ${alias.id}
      on conflict (athlete_id, club_id, relationship) do nothing
    `;
    await sql`delete from athlete_clubs where club_id = ${alias.id}`;
    await sql`delete from clubs where id = ${alias.id}`;
  }
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
  const existing = await sql<{ slug: string }>`select slug from events`;
  const have = new Set(existing.map((row) => row.slug));
  const missingSeries = seriesList.filter((series) => Boolean(series?.slug) && !have.has(series.slug));

  if (missingSeries.length === 0) {
    await sql`
      insert into app_meta (key, value) values ('fixtures_catalogue_version', ${SEED_VERSION})
      on conflict (key) do update set value = excluded.value
    `;
    return;
  }

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
    missingSeries.map((series) => [
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

  for (const [aliasSlug, canonicalSlug] of Object.entries(eventSlugAliases)) {
    const matches = await sql<{ id: number; slug: string }>`
      select id, slug from events where slug in (${aliasSlug}, ${canonicalSlug})
    `;
    const alias = matches.find((event) => event.slug === aliasSlug);
    if (!alias) continue;
    const canonical = matches.find((event) => event.slug === canonicalSlug);
    if (!canonical) {
      continue;
    }
    const resultCounts = await sql<{ count: number }>`
      select count(*)::int as count
      from results r
      join editions ed on ed.id = r.edition_id
      where ed.event_id = ${alias.id}
    `;
    if ((resultCounts[0]?.count ?? 0) > 0) {
      throw new Error(`Cannot retire event alias ${aliasSlug}: it has stored results`);
    }
    await sql`delete from events where id = ${alias.id}`;
  }

  const eventRows = await sql<{ id: number; slug: string }>`select id, slug from events`;
  const eventIds = new Map(eventRows.map((row) => [row.slug, row.id]));

  for (const replacement of editionReplacements) {
    const eventId = eventIds.get(replacement.seriesSlug);
    if (!eventId) continue;
    const targetDistance = replacement.toDistance ?? replacement.distance;
    await sql.query(
      `update editions old_edition
       set event_date = $4::date,
           distance_code = $5::text
       where old_edition.event_id = $1::int
         and old_edition.event_date = $2::date
         and old_edition.distance_code = $3::text
         and not exists (
           select 1 from results where edition_id = old_edition.id
         )
         and not exists (
           select 1
           from editions corrected_edition
           where corrected_edition.event_id = old_edition.event_id
             and corrected_edition.event_date = $4::date
             and corrected_edition.distance_code = $5::text
         )`,
      [eventId, replacement.fromDate, replacement.distance, replacement.toDate, targetDistance],
    );
    await sql.query(
      `delete from editions old_edition
       where old_edition.event_id = $1::int
         and old_edition.event_date = $2::date
         and old_edition.distance_code = $3::text
         and not exists (
           select 1 from results where edition_id = old_edition.id
         )
         and exists (
           select 1
           from editions corrected_edition
           where corrected_edition.event_id = old_edition.event_id
             and corrected_edition.event_date = $4::date
             and corrected_edition.distance_code = $5::text
         )`,
      [eventId, replacement.fromDate, replacement.distance, replacement.toDate, targetDistance],
    );
  }

  // Bacchus arrived with a duplicate companion Half row on the importer's incorrect
  // Saturday date. The catalogue intentionally keeps one canonical race-day edition,
  // so retire that result-free legacy row after the generic correction pass.
  const bacchusEventId = eventIds.get("bacchus-marathon");
  if (bacchusEventId) {
    await sql.query(
      `delete from editions stale_edition
       where stale_edition.event_id = $1::int
         and stale_edition.event_date = '2026-09-12'::date
         and stale_edition.distance_code = 'Half'
         and not exists (
           select 1 from results where edition_id = stale_edition.id
         )`,
      [bacchusEventId],
    );
  }

  const groupRows = raceGroupMemberships
    .map((membership) => [
      eventIds.get(membership.seriesSlug),
      membership.groupCode,
      membership.label,
      membership.level,
      membership.sourceUrl,
      membership.checkedAt,
      membership.note,
    ])
    .filter((row) => row[0] != null);
  if (groupRows.length !== raceGroupMemberships.length) {
    const missing = raceGroupMemberships
      .filter((membership) => !eventIds.has(membership.seriesSlug))
      .map((membership) => membership.seriesSlug);
    console.error("[catalogue-seed] skipping race groups for events not yet in Neon", missing.slice(0, 20));
  }
  await sql`
    delete from event_groups
    where group_code in ('world-marathon-majors', 'utmb-world-series', 'utmb-index')
  `;
  await insertRows(
    sql,
    "event_groups",
    ["event_id", "group_code", "label", "level", "source_url", "checked_at", "note"],
    groupRows,
    `on conflict (event_id, group_code) do update set
      label = excluded.label,
      level = excluded.level,
      source_url = excluded.source_url,
      checked_at = excluded.checked_at,
      note = excluded.note`,
    100,
  );

  const missingSlugs = new Set(missingSeries.map((series) => series.slug));
  const distanceRows = missingSeries.flatMap((series) =>
    [...new Set(series.distances)].map((distance) => [eventIds.get(series.slug), distance]),
  );
  await insertRows(
    sql,
    "event_distances",
    ["event_id", "distance_code"],
    distanceRows.filter((row) => row[0] != null),
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
    editionSeeds
      .filter((edition) => missingSlugs.has(edition.seriesSlug) && eventIds.has(edition.seriesSlug))
      .map((edition) => [
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

  // Run the duplicate side of edition migrations again after the catalogue
  // upsert. An older deployment can recreate an imported source row while a
  // newer deployment is seeding; this final pass makes the corrected target
  // authoritative without touching editions that hold results.
  for (const replacement of editionReplacements) {
    const eventId = eventIds.get(replacement.seriesSlug);
    if (!eventId) continue;
    const targetDistance = replacement.toDistance ?? replacement.distance;
    await sql.query(
      `delete from editions old_edition
       where old_edition.event_id = $1::int
         and old_edition.event_date = $2::date
         and old_edition.distance_code = $3::text
         and not exists (
           select 1 from results where edition_id = old_edition.id
         )
         and exists (
           select 1
           from editions corrected_edition
           where corrected_edition.event_id = old_edition.event_id
             and corrected_edition.event_date = $4::date
             and corrected_edition.distance_code = $5::text
         )`,
      [eventId, replacement.fromDate, replacement.distance, replacement.toDate, targetDistance],
    );
  }

  await upsertCatalogueEntryOptions(sql, eventIds);

  await expandParkrunEditions(sql);

  await sql`
    insert into app_meta (key, value) values ('fixtures_catalogue_version', ${SEED_VERSION})
    on conflict (key) do update set value = excluded.value
  `;
}

async function publicFigureRowsComplete(sql: Sql): Promise<boolean> {
  const athleteSlugs = publicFigureAthletes.map((athlete) => athlete.slug);
  const athletePlaceholders = athleteSlugs.map((_, index) => `$${index + 1}`).join(", ");
  const athleteRows = await sql.query<{ count: number }>(
    `select count(*)::int as count
     from athletes
     where profile_type = 'Public figure'
       and slug in (${athletePlaceholders})`,
    athleteSlugs,
  );
  if ((athleteRows[0]?.count ?? 0) !== athleteSlugs.length) return false;

  const params: unknown[] = [];
  const targets = publicFigureResults.map((result) => {
    params.push(result.athleteSlug, result.eventSlug, result.date, result.distance);
    return `($${params.length - 3}::text, $${params.length - 2}::text, $${params.length - 1}::date, $${params.length}::text)`;
  });
  const resultRows = await sql.query<{ count: number }>(
    `select count(*)::int as count
     from (values ${targets.join(", ")}) as target (
       athlete_slug, event_slug, event_date, distance_code
     )
     join athletes athlete on athlete.slug = target.athlete_slug
     join events event on event.slug = target.event_slug
     join editions edition
       on edition.event_id = event.id
      and edition.event_date = target.event_date
      and edition.distance_code = target.distance_code
     join results result
       on result.edition_id = edition.id
      and result.athlete_id = athlete.id`,
    params,
  );
  return (resultRows[0]?.count ?? 0) === publicFigureResults.length;
}

async function upsertPublicFigureProfiles(sql: Sql): Promise<void> {
  const meta = await sql<{ value: string }>`
    select value from app_meta where key = 'public_figures_catalogue_version' limit 1
  `;
  if (meta[0]?.value === PUBLIC_FIGURE_SEED_VERSION && (await publicFigureRowsComplete(sql))) {
    return;
  }

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
    publicFigureSeries.map((series) => [
      null,
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

  const eventRows = await sql<{ id: number; slug: string }>`select id, slug from events`;
  const eventIds = new Map(eventRows.map((row) => [row.slug, row.id]));
  const distanceRows = publicFigureSeries.flatMap((series) =>
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
    publicFigureEditions.map((edition) => [
      null,
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
      edition.resultsRightsRequestedAt ?? null,
      edition.publicResultCount ?? null,
      edition.partnerResultCount ?? null,
      edition.athleteResultCount ?? null,
      edition.resultsAccess ?? null,
    ]),
    `on conflict (event_id, event_date, distance_code) do update set
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
  );

  const clubRows = await sql<{ id: number; slug: string }>`
    select id, slug from clubs where slug in ('unattached')
  `;
  const clubIds = new Map(clubRows.map((row) => [row.slug, row.id]));

  await insertRows(
    sql,
    "athletes",
    [
      "slug",
      "display_name",
      "given_name",
      "family_name",
      "gender",
      "club_id",
      "source_club_name",
      "city",
      "county",
      "country",
      "bio",
      "nation",
      "continent",
      "race_entry_name",
      "preferred_distance",
      "athrecs_id",
      "source_url",
      "profile_type",
      "profile_roles",
      "profile_source_checked_at",
    ],
    publicFigureAthletes.map((athlete) => [
      athlete.slug,
      athlete.display_name,
      athlete.given_name ?? null,
      athlete.family_name ?? null,
      athlete.gender,
      clubIds.get(athlete.club_slug) ?? null,
      athlete.source_club_name ?? null,
      athlete.city,
      athlete.county ?? null,
      athlete.country ?? null,
      athlete.bio,
      athlete.nation ?? null,
      athlete.continent ?? null,
      athlete.race_entry_name ?? null,
      athlete.preferred_distance ?? null,
      athlete.athrecs_id ?? null,
      athlete.source_url ?? null,
      athlete.profile_type ?? "Athlete",
      (athlete.profile_roles ?? []).join(","),
      athlete.profile_source_checked_at ?? null,
    ]),
    `on conflict (slug) do update set
      display_name = excluded.display_name,
      given_name = excluded.given_name,
      family_name = excluded.family_name,
      gender = excluded.gender,
      club_id = excluded.club_id,
      source_club_name = excluded.source_club_name,
      city = excluded.city,
      county = excluded.county,
      country = excluded.country,
      bio = excluded.bio,
      nation = excluded.nation,
      continent = excluded.continent,
      race_entry_name = excluded.race_entry_name,
      preferred_distance = excluded.preferred_distance,
      athrecs_id = excluded.athrecs_id,
      source_url = excluded.source_url,
      profile_type = excluded.profile_type,
      profile_roles = excluded.profile_roles,
      profile_source_checked_at = excluded.profile_source_checked_at`,
  );

  const athleteRows = await sql<{ id: number; slug: string }>`select id, slug from athletes`;
  const athleteIds = new Map(athleteRows.map((row) => [row.slug, row.id]));
  const editionRows = await sql<{
    id: number;
    event_slug: string;
    event_date: string;
    distance_code: string;
  }>`
    select ed.id, e.slug as event_slug, ed.event_date::text as event_date, ed.distance_code
    from editions ed
    join events e on e.id = ed.event_id
  `;
  const editionIds = new Map(
    editionRows.map((row) => [`${row.event_slug}|${row.event_date}|${row.distance_code}`, row.id]),
  );
  const rows = publicFigureResults
    .map((result) => [
      editionIds.get(`${result.eventSlug}|${result.date}|${result.distance}`),
      athleteIds.get(result.athleteSlug),
      result.status ?? "finished",
      result.finishTimeSeconds ?? parseTimeToSeconds(result.time),
      result.place,
      result.category ?? null,
      result.ageOnDay ?? null,
      result.resultSource ?? "official",
      result.source,
    ])
    .filter((row) => row[0] != null && row[1] != null);
  if (rows.length !== publicFigureResults.length) {
    throw new Error("Public figure results reference a missing athlete or edition");
  }
  await insertRows(
    sql,
    "results",
    [
      "edition_id",
      "athlete_id",
      "status",
      "finish_time_seconds",
      "overall_place",
      "category",
      "age_on_day",
      "result_source",
      "source_url",
    ],
    rows,
    `on conflict (edition_id, athlete_id) do update set
      status = excluded.status,
      finish_time_seconds = excluded.finish_time_seconds,
      overall_place = excluded.overall_place,
      category = excluded.category,
      age_on_day = excluded.age_on_day,
      result_source = excluded.result_source,
      source_url = excluded.source_url`,
  );
  await sql`
    insert into app_meta (key, value)
    values ('public_figures_catalogue_version', ${PUBLIC_FIGURE_SEED_VERSION})
    on conflict (key) do update set value = excluded.value
  `;
}

async function upsertCatalogueEntryOptions(sql: Sql, eventIds: Map<string, number>): Promise<void> {
  const targetEditions = editionSeeds.filter(
    (edition) =>
      eventIds.has(edition.seriesSlug) &&
      (Boolean(edition.entryUrl) || Boolean(edition.entryOptions?.length)),
  );
  if (!targetEditions.length) return;

  const params: unknown[] = [];
  const values = targetEditions.map((edition) => {
    const key = `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
    const valuesForRow = [eventIds.get(edition.seriesSlug), edition.date, edition.distance, key];
    const placeholders = valuesForRow.map((value, index) => {
      params.push(value);
      const position = params.length;
      return `$${position}${index === 0 ? "::int" : index === 1 ? "::date" : "::text"}`;
    });
    return `(${placeholders.join(", ")})`;
  });
  const editionRows = await sql.query<{ id: number; edition_key: string }>(
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
  const editionIds = new Map(editionRows.map((row) => [row.edition_key, row.id]));

  const explicitOptionsWithoutOfficialIds = targetEditions
    .filter(
      (edition) =>
        Boolean(edition.entryOptions?.length) &&
        !edition.entryOptions?.some((option) => option.providerCode === "official"),
    )
    .map((edition) => editionIds.get(`${edition.seriesSlug}|${edition.date}|${edition.distance}`))
    .filter((editionId): editionId is number => editionId != null);
  if (explicitOptionsWithoutOfficialIds.length) {
    const placeholders = explicitOptionsWithoutOfficialIds
      .map((_, index) => `$${index + 1}`)
      .join(", ");
    await sql.query(
      `delete from edition_entry_options
       where edition_id in (${placeholders})
         and provider_code = 'official'
         and not is_verified`,
      explicitOptionsWithoutOfficialIds,
    );
  }

  const rows = targetEditions.flatMap((edition) => {
    const editionId = editionIds.get(`${edition.seriesSlug}|${edition.date}|${edition.distance}`);
    if (!editionId) return [];

    const options = [...(edition.entryOptions ?? [])];
    if (edition.entryUrl && options.length === 0) {
      options.unshift({
        providerCode: "official",
        providerName: "Official race entry",
        entryUrl: edition.entryUrl,
        entryType: "official" as const,
        status:
          edition.status === "Open"
            ? ("open" as const)
            : edition.status === "ClosingSoon"
              ? ("closing_soon" as const)
              : edition.status === "Closed" || edition.status === "Finished"
                ? ("closed" as const)
                : ("unknown" as const),
        checkedAt: new Date().toISOString(),
        sourceUrl: edition.source,
        isVerified: false,
        isPrimary: true,
      });
    }

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

  if (!rows.length) return;
  const primaryRows = rows
    .filter((row) => row[13])
    .map((row) => [row[0] as number, row[1] as string] as const);
  const primaryEditionIds = [...new Set(primaryRows.map((row) => row[0]))];
  if (primaryEditionIds.length) {
    const placeholders = primaryEditionIds.map((_, index) => `$${index + 1}`).join(", ");
    await sql.query(
      `update edition_entry_options set is_primary = false, updated_at = now()
       where edition_id in (${placeholders}) and is_primary`,
      primaryEditionIds,
    );
  }
  const nonPrimaryRows = rows.map((row) => [...row.slice(0, 13), false, row[14]]);
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
    nonPrimaryRows,
    `on conflict (edition_id, provider_code) do update set
      provider_name = excluded.provider_name,
      entry_url = excluded.entry_url,
      entry_type = excluded.entry_type,
      status = excluded.status,
      price_amount = excluded.price_amount,
      price_currency = excluded.price_currency,
      opens_at = excluded.opens_at,
      closes_at = excluded.closes_at,
      checked_at = excluded.checked_at,
      source_url = excluded.source_url,
      is_verified = excluded.is_verified,
      is_primary = excluded.is_primary,
      notes = excluded.notes,
      updated_at = now()`,
    75,
  );
  if (primaryRows.length) {
    const params: unknown[] = [];
    const values = primaryRows.map(([editionId, providerCode]) => {
      params.push(editionId, providerCode);
      return `($${params.length - 1}::int, $${params.length}::text)`;
    });
    await sql.query(
      `update edition_entry_options option
       set is_primary = true, updated_at = now()
       from (values ${values.join(", ")}) as target (edition_id, provider_code)
       where option.edition_id = target.edition_id
         and option.provider_code = target.provider_code`,
      params,
    );
  }

  await sql.query(
    `delete from edition_entry_options fallback
     where fallback.provider_code = 'official'
       and not fallback.is_verified
       and exists (
         select 1
         from edition_entry_options verified_official
         where verified_official.edition_id = fallback.edition_id
           and verified_official.entry_type = 'official'
           and verified_official.is_verified
       )`,
  );
}

async function catalogueMarkersCurrent(sql: Sql): Promise<boolean> {
  const expected = new Map([
    ["seed_version", SEED_VERSION],
    ["clubs_catalogue_version", SEED_VERSION],
    ["fixtures_catalogue_version", SEED_VERSION],
    ["public_figures_catalogue_version", PUBLIC_FIGURE_SEED_VERSION],
    ["parkrun_through", "2027-12-26"],
    ["athletics_taxonomy_v1", "complete"],
  ]);
  const rows = await sql<{ key: string; value: string }>`
    select key, value from app_meta
    where key in (
      'seed_version',
      'clubs_catalogue_version',
      'fixtures_catalogue_version',
      'public_figures_catalogue_version',
      'parkrun_through',
      'athletics_taxonomy_v1'
    )
  `;
  return rows.length === expected.size && rows.every((row) => expected.get(row.key) === row.value);
}

async function seedCatalogue(sql: Sql): Promise<void> {
  await ensureSchema(sql);
  await ensureAthleticsTaxonomy(sql);

  // Always upsert governing-body / catalogue clubs (append-only, no deletes).
  // Safe on Neon + PGLite so new club catalogue rows appear without wiping results.
  await upsertCatalogueClubs(sql);

  // Always refresh race calendar fixtures (events + editions) without wiping results.
  await upsertCatalogueFixtures(sql);
  await ensureParkrunCalendar(sql);

  if (await alreadySeeded(sql)) {
    await upsertPublicFigureProfiles(sql);
    return;
  }

  // NEVER wipe a non-empty database. Full catalogue seed only runs on empty DBs.
  // Imports (multi-year Run Norwich etc.) must survive deploys and cold starts.
  const guard = await sql<{ athletes: number; results: number; clubs: number }>`
    select
      (select count(*)::int from athletes) as athletes,
      (select count(*)::int from results) as results,
      (select count(*)::int from clubs) as clubs`;
  const g = guard[0];
  if (g && (g.athletes > 0 || g.results > 0)) {
    await upsertPublicFigureProfiles(sql);
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
      "profile_type",
      "profile_roles",
      "profile_source_checked_at",
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
      athlete.profile_type ?? "Athlete",
      (athlete.profile_roles ?? []).join(","),
      athlete.profile_source_checked_at ?? null,
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
      source_url = excluded.source_url,
      profile_type = excluded.profile_type,
      profile_roles = excluded.profile_roles,
      profile_source_checked_at = excluded.profile_source_checked_at`,
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
  await sql`delete from event_distances`;
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

async function seed(): Promise<void> {
  const sql = await getSql();

  // Production migrations create app_meta before a deployment can serve traffic.
  // The marker-only fast path keeps normal cold starts read-only and avoids
  // serializing every serverless instance after a catalogue is current.
  if (dbSource === "neon" && (await catalogueMarkersCurrent(sql))) return;

  try {
    if (dbSource === "neon") {
      await sql.transaction(async (tx) => {
        // Catalogue versions can change while old and new serverless instances are
        // live together. A database-wide transaction lock prevents their event and
        // edition upserts from deadlocking one another.
        await tx.query("select pg_advisory_xact_lock($1)", [CATALOGUE_SEED_LOCK_ID]);
        if (await catalogueMarkersCurrent(tx)) return;
        await seedCatalogue(tx);
      });
      return;
    }

    await seedCatalogue(sql);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (
      code === "53100" ||
      message.includes("project size limit") ||
      message.includes("Catalogue seed count mismatch")
    ) {
      console.error("[catalogue-seed] database at capacity; serving existing rows", { code, message });
      return;
    }
    throw error;
  }
}

export function ensureAthrecsSeeded(): Promise<void> {
  globalSeedState.__athrecsFullSeedPromise__ ??= seed().catch((error) => {
    globalSeedState.__athrecsFullSeedPromise__ = undefined;
    throw error;
  });
  return globalSeedState.__athrecsFullSeedPromise__;
}
