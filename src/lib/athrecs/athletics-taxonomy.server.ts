import type { Sql } from "@/lib/db";

const MIGRATION_KEY = "athletics_taxonomy_v1";

type EventRow = {
  id: number;
  source_id: number | null;
  slug: string;
  name: string;
  sport: string;
  country: string;
  city: string;
  area: string;
  edition_count: number;
  result_count: number;
};

type EditionRow = {
  id: number;
  source_id: number | null;
  event_date: string;
  distance_code: string;
};

function identityPart(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function eventNamePart(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(the|tcs|bmw|aj\s*bell|edp|mainova|acea|zurich)\b/gi, " ")
    .replace(/[^a-z0-9]+/g, "");
}

function duplicateKey(event: EventRow): string {
  const place = identityPart(event.city || event.area);
  if (!place) return `unique:${event.id}`;
  return [
    eventNamePart(event.name),
    identityPart(event.country),
    place,
  ].join("|");
}

function isFeedSlug(slug: string): boolean {
  return /^(?:wa|wt|mrd|rb|runabc)-/.test(slug);
}

function chooseCanonical(events: EventRow[]): EventRow {
  return [...events].sort((a, b) => {
    if (isFeedSlug(a.slug) !== isFeedSlug(b.slug)) return isFeedSlug(a.slug) ? 1 : -1;
    if ((a.sport === "Athletics") !== (b.sport === "Athletics")) {
      return a.sport === "Athletics" ? -1 : 1;
    }
    if (a.result_count !== b.result_count) return b.result_count - a.result_count;
    if (a.edition_count !== b.edition_count) return b.edition_count - a.edition_count;
    if (Boolean(a.source_id) !== Boolean(b.source_id)) return a.source_id ? -1 : 1;
    if (a.slug.length !== b.slug.length) return a.slug.length - b.slug.length;
    return a.id - b.id;
  })[0];
}

async function mergeResults(
  sql: Sql,
  canonicalEditionId: number,
  duplicateEditionId: number,
): Promise<void> {
  const sourceIds = await sql<{ target_id: number; source_id: number }>`
    select target.id as target_id, source.source_id
    from results source
    join results target
      on target.edition_id = ${canonicalEditionId}
     and target.athlete_id = source.athlete_id
    where source.edition_id = ${duplicateEditionId}
      and target.source_id is null
      and source.source_id is not null
  `;

  await sql`
    update results target set
      finish_time_seconds = coalesce(target.finish_time_seconds, source.finish_time_seconds),
      chip_time_seconds = coalesce(target.chip_time_seconds, source.chip_time_seconds),
      gun_time_seconds = coalesce(target.gun_time_seconds, source.gun_time_seconds),
      bib = coalesce(nullif(target.bib, ''), source.bib),
      overall_place = coalesce(target.overall_place, source.overall_place),
      gender_place = coalesce(target.gender_place, source.gender_place),
      category = coalesce(nullif(target.category, ''), source.category),
      category_place = coalesce(target.category_place, source.category_place),
      age_on_day = coalesce(target.age_on_day, source.age_on_day),
      age_grade_pct = coalesce(target.age_grade_pct, source.age_grade_pct),
      open_rating = coalesce(target.open_rating, source.open_rating),
      age_grade_rating = coalesce(target.age_grade_rating, source.age_grade_rating),
      result_source = coalesce(nullif(target.result_source, ''), source.result_source),
      source_url = coalesce(nullif(target.source_url, ''), source.source_url)
    from results source
    where target.edition_id = ${canonicalEditionId}
      and source.edition_id = ${duplicateEditionId}
      and target.athlete_id = source.athlete_id
  `;

  await sql`
    delete from results source
    using results target
    where source.edition_id = ${duplicateEditionId}
      and target.edition_id = ${canonicalEditionId}
      and target.athlete_id = source.athlete_id
  `;

  for (const row of sourceIds) {
    await sql`
      update results set source_id = ${row.source_id}
      where id = ${row.target_id} and source_id is null
    `;
  }

  await sql`
    update results set edition_id = ${canonicalEditionId}
    where edition_id = ${duplicateEditionId}
  `;
}

async function mergeEdition(
  sql: Sql,
  canonicalEditionId: number,
  duplicate: EditionRow,
): Promise<void> {
  await mergeResults(sql, canonicalEditionId, duplicate.id);

  await sql`
    update editions target set
      distance_km = case
        when target.distance_km = 0 and source.distance_km > 0 then source.distance_km
        else target.distance_km
      end,
      status = case
        when target.status = 'TBC' and source.status <> 'TBC' then source.status
        else target.status
      end,
      entry_url = coalesce(nullif(target.entry_url, ''), source.entry_url),
      source_url = coalesce(nullif(target.source_url, ''), source.source_url),
      start_time = coalesce(nullif(target.start_time, ''), source.start_time),
      notes = coalesce(nullif(target.notes, ''), source.notes),
      results_permission = coalesce(nullif(target.results_permission, ''), source.results_permission),
      results_hosting = coalesce(nullif(target.results_hosting, ''), source.results_hosting),
      results_official_url = coalesce(nullif(target.results_official_url, ''), source.results_official_url),
      results_permission_note = coalesce(nullif(target.results_permission_note, ''), source.results_permission_note),
      results_permission_at = coalesce(target.results_permission_at, source.results_permission_at),
      results_permission_by = coalesce(nullif(target.results_permission_by, ''), source.results_permission_by),
      results_rights_requested_at = coalesce(target.results_rights_requested_at, source.results_rights_requested_at),
      public_result_count = greatest(coalesce(target.public_result_count, 0), coalesce(source.public_result_count, 0)),
      partner_result_count = greatest(coalesce(target.partner_result_count, 0), coalesce(source.partner_result_count, 0)),
      athlete_result_count = greatest(coalesce(target.athlete_result_count, 0), coalesce(source.athlete_result_count, 0)),
      results_access = coalesce(nullif(target.results_access, ''), source.results_access)
    from editions source
    where target.id = ${canonicalEditionId} and source.id = ${duplicate.id}
  `;

  await sql`delete from editions where id = ${duplicate.id}`;
  if (duplicate.source_id != null) {
    await sql`
      update editions set source_id = ${duplicate.source_id}
      where id = ${canonicalEditionId} and source_id is null
    `;
  }
}

async function mergeEvent(sql: Sql, canonical: EventRow, duplicate: EventRow): Promise<void> {
  await sql`
    update events target set
      county = coalesce(nullif(target.county, ''), nullif(source.county, ''), ''),
      city = coalesce(nullif(target.city, ''), nullif(source.city, ''), ''),
      area = coalesce(nullif(target.area, ''), nullif(source.area, ''), ''),
      surface = case
        when target.surface in ('', 'Other') and source.surface not in ('', 'Other') then source.surface
        else target.surface
      end,
      summary = coalesce(nullif(target.summary, ''), nullif(source.summary, ''), ''),
      description = coalesce(nullif(target.description, ''), nullif(source.description, ''), ''),
      organiser = coalesce(nullif(target.organiser, ''), nullif(source.organiser, ''), ''),
      website = coalesce(nullif(target.website, ''), nullif(source.website, ''), ''),
      featured = target.featured or source.featured,
      source_url = coalesce(nullif(target.source_url, ''), source.source_url)
    from events source
    where target.id = ${canonical.id} and source.id = ${duplicate.id}
  `;

  await sql`
    insert into event_distances (event_id, distance_code)
    select ${canonical.id}, distance_code from event_distances where event_id = ${duplicate.id}
    on conflict (event_id, distance_code) do nothing
  `;

  const editions = await sql<EditionRow>`
    select id, source_id, event_date::text as event_date, distance_code
    from editions where event_id = ${duplicate.id}
    order by event_date, distance_code
  `;
  for (const edition of editions) {
    const existing = await sql<{ id: number }>`
      select id from editions
      where event_id = ${canonical.id}
        and event_date = ${edition.event_date}
        and distance_code = ${edition.distance_code}
      limit 1
    `;
    if (existing[0]) {
      await mergeEdition(sql, existing[0].id, edition);
    } else {
      await sql`
        update editions set event_id = ${canonical.id} where id = ${edition.id}
      `;
    }
  }

  await sql`delete from events where id = ${duplicate.id}`;
  if (duplicate.source_id != null) {
    await sql`
      update events set source_id = ${duplicate.source_id}
      where id = ${canonical.id} and source_id is null
    `;
  }
}

async function normalizeClubSports(sql: Sql): Promise<number> {
  const clubs = await sql<{ id: number; sports: string }>`
    select id, sports from clubs where lower(sports) like '%track%field%'
  `;
  let changed = 0;
  for (const club of clubs) {
    const seen = new Set<string>();
    const sports: string[] = [];
    for (const raw of club.sports.split(",")) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const identity = identityPart(trimmed);
      const sport = identity === "trackandfield" || identity === "trackfield"
        ? "Athletics"
        : trimmed;
      const key = sport.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      sports.push(sport);
    }
    const normalized = sports.join(",");
    if (normalized === club.sports) continue;
    await sql`update clubs set sports = ${normalized} where id = ${club.id}`;
    changed += 1;
  }
  return changed;
}

/**
 * Merge the retired TrackAndField taxonomy into Athletics without losing child
 * editions or results. The app_meta row serializes concurrent cold starts and
 * makes the migration a one-time operation on persistent Neon databases.
 */
export async function ensureAthleticsTaxonomy(sql: Sql): Promise<void> {
  await sql.transaction(async (tx) => {
    await tx`
      insert into app_meta (key, value) values (${MIGRATION_KEY}, 'pending')
      on conflict (key) do nothing
    `;
    const marker = await tx<{ value: string }>`
      select value from app_meta where key = ${MIGRATION_KEY} for update
    `;
    if (marker[0]?.value === "complete") return;

    const events = await tx<EventRow>`
      select
        e.id,
        e.source_id,
        e.slug,
        e.name,
        e.sport,
        e.country,
        e.city,
        e.area,
        (select count(*)::int from editions ed where ed.event_id = e.id) as edition_count,
        (
          select count(*)::int
          from results r
          join editions ed on ed.id = r.edition_id
          where ed.event_id = e.id
        ) as result_count
      from events e
      where regexp_replace(lower(e.sport), '[^a-z]', '', 'g')
        in ('athletics', 'trackandfield', 'trackfield')
    `;

    const groups = new Map<string, EventRow[]>();
    for (const event of events) {
      const key = duplicateKey(event);
      groups.set(key, [...(groups.get(key) ?? []), event]);
    }

    let duplicateEvents = 0;
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      const canonical = chooseCanonical(group);
      for (const duplicate of group) {
        if (duplicate.id === canonical.id) continue;
        await mergeEvent(tx, canonical, duplicate);
        duplicateEvents += 1;
      }
    }

    const normalizedEvents = await tx<{ id: number }>`
      update events set sport = 'Athletics'
      where regexp_replace(lower(sport), '[^a-z]', '', 'g')
        in ('trackandfield', 'trackfield')
      returning id
    `;
    const normalizedClubs = await normalizeClubSports(tx);

    await tx`
      update app_meta set value = 'complete' where key = ${MIGRATION_KEY}
    `;
    console.info(
      `[athrecs] Athletics taxonomy: ${normalizedEvents.length} events normalized, ` +
        `${normalizedClubs} clubs normalized, ${duplicateEvents} duplicate events merged`,
    );
  });
}
