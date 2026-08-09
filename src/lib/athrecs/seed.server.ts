import { getSql } from "@/lib/db";
import {
  athletes as athleteSeeds,
  clubs as clubSeeds,
  editions as editionSeeds,
  results as resultSeeds,
  seriesList,
} from "@/data/catalogue";

const SEED_VERSION = "athrecs-trt-results-v18";

type Sql = Awaited<ReturnType<typeof getSql>>;

function parseTimeToSeconds(raw: string): number {
  const t = raw.trim().replace(",", ".");
  const parts = t.split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return Math.round(
      Number(h) * 3600 + Number(m) * 60 + Number(s),
    );
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return Math.round(Number(m) * 60 + Number(s));
  }
  return Math.round(Number(t));
}

async function ensureSchema(sql: Sql) {
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
      created_at timestamptz not null default now()
    )`,
    `create table if not exists events (
      id serial primary key,
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
      created_at timestamptz not null default now()
    )`,
    `create table if not exists event_distances (
      event_id int not null references events(id) on delete cascade,
      distance_code text not null,
      primary key (event_id, distance_code)
    )`,
    `create table if not exists editions (
      id serial primary key,
      event_id int not null references events(id) on delete cascade,
      event_date date not null,
      distance_code text not null,
      distance_km double precision not null default 0,
      status text not null default 'TBC',
      entry_url text,
      source_url text,
      start_time text,
      unique (event_id, event_date, distance_code)
    )`,
    `create table if not exists athletes (
      id serial primary key,
      slug text not null unique,
      display_name text not null,
      gender text not null default 'U',
      club_id int references clubs(id) on delete set null,
      city text,
      county text not null default 'Norfolk',
      country text not null default 'England',
      bio text not null default '',
      created_at timestamptz not null default now()
    )`,
    `create table if not exists results (
      id serial primary key,
      edition_id int not null references editions(id) on delete cascade,
      athlete_id int not null references athletes(id) on delete cascade,
      status text not null default 'finished',
      finish_time_seconds int,
      overall_place int,
      category text,
      unique (edition_id, athlete_id)
    )`,
    `create table if not exists app_meta (
      key text primary key,
      value text not null
    )`,
  ];
  for (const s of statements) {
    await sql.query(s);
  }
}

export async function ensureAthrecsSeeded(): Promise<void> {
  const sql = await getSql();
  await ensureSchema(sql);
  const meta = await sql<{ value: string }>`
    select value from app_meta where key = 'seed_version' limit 1
  `;
  const athleteCount = await sql<{ n: number }>`
    select count(*)::int as n from athletes
  `;
  // Reseed when version changes OR when the DB has fewer athletes than the catalogue
  // (guards against stuck partial seeds after emergency minimal restores).
  const dbAthletes = athleteCount[0]?.n ?? 0;
  if (
    meta[0]?.value === SEED_VERSION &&
    dbAthletes >= athleteSeeds.length
  ) {
    return;
  }

  for (const c of clubSeeds) {
    await sql`
      insert into clubs (slug, name, city, county, country, sports, website, summary)
      values (
        ${c.slug}, ${c.name}, ${c.city}, ${"Norfolk"}, ${"England"},
        ${c.sports.join(",")}, ${c.website ?? null}, ${c.summary}
      )
      on conflict (slug) do update set
        name = excluded.name,
        city = excluded.city,
        sports = excluded.sports,
        website = excluded.website,
        summary = excluded.summary
    `;
  }

  for (const s of seriesList) {
    const existing = await sql<{ id: number }>`
      select id from events where slug = ${s.slug} limit 1
    `;
    let eventId: number;
    if (existing[0]) {
      eventId = existing[0].id;
      await sql`
        update events set
          name = ${s.name}, sport = ${s.sport}, city = ${s.city}, area = ${s.area},
          surface = ${s.surface}, summary = ${s.summary}, description = ${s.description},
          organiser = ${s.organiser}, website = ${s.website},
          featured = ${s.featured ?? false}
        where id = ${eventId}
      `;
    } else {
      const ins = await sql<{ id: number }>`
        insert into events (
          slug, name, sport, country, county, city, area, surface,
          summary, description, organiser, website, featured
        ) values (
          ${s.slug}, ${s.name}, ${s.sport}, ${"England"}, ${"Norfolk"},
          ${s.city}, ${s.area}, ${s.surface}, ${s.summary}, ${s.description},
          ${s.organiser}, ${s.website}, ${s.featured ?? false}
        ) returning id
      `;
      eventId = ins[0].id;
    }
    for (const d of s.distances) {
      await sql`
        insert into event_distances (event_id, distance_code)
        values (${eventId}, ${d}) on conflict do nothing
      `;
    }
  }

  for (const ed of editionSeeds) {
    const ev = await sql<{ id: number }>`
      select id from events where slug = ${ed.seriesSlug} limit 1
    `;
    if (!ev[0]) continue;
    await sql`
      insert into editions (
        event_id, event_date, distance_code, distance_km, status,
        entry_url, source_url, start_time
      ) values (
        ${ev[0].id}, ${ed.date}::date, ${ed.distance}, ${ed.distanceKm},
        ${ed.status}, ${ed.entryUrl ?? null}, ${ed.source}, ${ed.startTime ?? null}
      )
      on conflict (event_id, event_date, distance_code) do update set
        distance_km = excluded.distance_km,
        status = excluded.status,
        entry_url = excluded.entry_url,
        source_url = excluded.source_url,
        start_time = excluded.start_time
    `;
  }

  for (const a of athleteSeeds) {
    const club = await sql<{ id: number; name: string }>`
      select id, name from clubs where slug = ${a.club_slug} limit 1
    `;
    await sql`
      insert into athletes (slug, display_name, gender, club_id, city, county, country, bio)
      values (
        ${a.slug}, ${a.display_name}, ${a.gender}, ${club[0]?.id ?? null},
        ${a.city}, ${"Norfolk"}, ${"England"}, ${a.bio}
      )
      on conflict (slug) do update set
        display_name = excluded.display_name,
        gender = excluded.gender,
        club_id = excluded.club_id,
        city = excluded.city,
        bio = excluded.bio
    `;
  }

  const keepSlugs = athleteSeeds.map((a) => a.slug);
  if (keepSlugs.length > 0) {
    const placeholders = keepSlugs.map((_, i) => `$${i + 1}`).join(", ");
    await sql.query(
      `delete from results where athlete_id in (
         select id from athletes where slug not in (${placeholders})
       )`,
      keepSlugs,
    );
    await sql.query(
      `delete from athletes where slug not in (${placeholders})`,
      keepSlugs,
    );
  }

  const editionKeys = new Set(
    resultSeeds.map((r) => `${r.eventSlug}|${r.date}|${r.distance}`),
  );
  for (const key of editionKeys) {
    const [eventSlug, date, distance] = key.split("|");
    const ed = await sql<{ id: number }>`
      select ed.id from editions ed
      join events e on e.id = ed.event_id
      where e.slug = ${eventSlug}
        and ed.event_date = ${date}::date
        and ed.distance_code = ${distance}
      limit 1
    `;
    if (ed[0]) {
      await sql`delete from results where edition_id = ${ed[0].id}`;
    }
  }

  for (const r of resultSeeds) {
    const ed = await sql<{ id: number }>`
      select ed.id from editions ed
      join events e on e.id = ed.event_id
      where e.slug = ${r.eventSlug}
        and ed.event_date = ${r.date}::date
        and ed.distance_code = ${r.distance}
      limit 1
    `;
    const ath = await sql<{ id: number }>`
      select id from athletes where slug = ${r.athleteSlug} limit 1
    `;
    if (!ed[0] || !ath[0]) continue;
    const secs = parseTimeToSeconds(r.time);
    await sql`
      insert into results (edition_id, athlete_id, status, finish_time_seconds, overall_place, category)
      values (${ed[0].id}, ${ath[0].id}, 'finished', ${secs}, ${r.place}, ${r.category})
      on conflict (edition_id, athlete_id) do update set
        finish_time_seconds = excluded.finish_time_seconds,
        overall_place = excluded.overall_place,
        category = excluded.category
    `;
  }

  await sql`
    insert into app_meta (key, value) values ('seed_version', ${SEED_VERSION})
    on conflict (key) do update set value = excluded.value
  `;
}
