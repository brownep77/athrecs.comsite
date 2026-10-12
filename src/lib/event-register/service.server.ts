import { getSql, type Sql } from "../db";
import { retainedFixtureAliasSlugs } from "../../data/fixture-deduplication";
import {
  registerFilters,
  registerCountryValues,
  registerCountryOptions,
  eventInput,
  historyInput,
  contactInput,
} from "./core";

type ScalarRow = Record<string, string | number | boolean | null>;
type EditionRow = Record<
  string,
  | string
  | number
  | boolean
  | null
  | { provider: string; source_url: string; expected_rows: number | null; stored_rows: number }[]
  | { provider: string; url: string; status: string; checked_at: string }[]
> & {
  datasets: {
    provider: string;
    source_url: string;
    expected_rows: number | null;
    stored_rows: number;
  }[];
  result_links: { provider: string; url: string; status: string; checked_at: string }[];
};

export type RegisterRow = {
  id: number;
  name: string;
  slug: string;
  sport: string;
  country: string;
  county: string;
  city: string;
  surface: string;
  organiser: string;
  website: string;
  source_url: string | null;
  summary: string;
  edition_count: number;
  known_years: number[];
  earliest_date: string | null;
  latest_date: string | null;
  result_editions: number;
  linked_results: number;
  archive_editions: number;
  results_link_editions: number;
  contact_count: number;
  lifecycle: string;
  first_year: number | null;
  final_year: number | null;
  priority: string;
  next_check: string | null;
  publications: string | null;
};
export type RegisterSummary = {
  events: number;
  editions: number;
  parkruns: number;
  countries: number;
  result_editions: number;
  linked_results: number;
  archive_editions: number;
  no_contacts: number;
  no_organiser: number;
  history_missing: number;
};

// The view owns sport inclusion. Permanent aliases remain visible through their
// canonical event rather than becoming a second row in this staff register.
export function registerQuery(
  input: unknown,
  aliases: readonly string[] = retainedFixtureAliasSlugs,
) {
  const f = registerFilters.parse(input);
  const params = [
    aliases,
    f.q ? `%${f.q.replace(/[\\%_]/g, "\\$&")}%` : null,
    f.sport === "All" ? null : f.sport,
    registerCountryValues(f.country),
    f.surface || null,
    f.year,
    f.gap,
  ];
  const cte = `with selected_events as materialized (
    select e.* from running_register_events e
    where not(e.slug = any($1::text[]))
      and ($2::text is null or concat_ws(' ',e.name,e.organiser,e.city,e.county,e.slug) ilike $2)
      and ($3::text is null or e.sport=$3)
      and ($4::text[] is null or lower(trim(e.country))=any($4::text[]))
      and ($5::text is null or e.surface=$5)
  ), result_counts as (
    select edition_id,count(*)::int n from results group by edition_id
  ), archive_counts as (
    select d.edition_id,count(*)::int n from result_archive_datasets d
    where exists(select 1 from result_archive_entries a where a.dataset_id=d.id)
    group by d.edition_id
  ), edition_stats as (
    select ed.event_id,count(*)::int edition_count,
      array_agg(distinct extract(year from ed.event_date)::int order by extract(year from ed.event_date)::int) known_years,
      min(ed.event_date)::text earliest_date,max(ed.event_date)::text latest_date,
      count(*) filter(where coalesce(r.n,0)>0)::int result_editions,
      coalesce(sum(r.n),0)::int linked_results,
      count(*) filter(where coalesce(a.n,0)>0)::int archive_editions,
      count(*) filter(where nullif(ed.results_official_url,'') is not null or exists(
        select 1 from edition_result_links l where l.edition_id=ed.id and l.status<>'rejected'
      ) or exists(select 1 from result_archive_datasets d where d.edition_id=ed.id))::int results_link_editions
    from running_register_editions ed join selected_events e on e.id=ed.event_id
    left join result_counts r on r.edition_id=ed.id left join archive_counts a on a.edition_id=ed.id
    where $6::int is null or extract(year from ed.event_date)=$6
    group by ed.event_id
  ), contact_counts as (select event_id,count(*)::int n from event_register_contacts group by event_id),
  observations as (select distinct on(event_id) * from event_register_history order by event_id,id desc),
  publication as (
    select p.event_id,string_agg(b.code || ': ' || p.publication_status, ', ' order by b.code) publications
    from event_publications p join brands b on b.id=p.brand_id group by p.event_id
  ), records as (
    select e.id,e.name,e.slug,e.sport,e.country,e.county,e.city,e.surface,e.organiser,e.website,e.source_url,e.summary,
      coalesce(s.edition_count,0) edition_count,coalesce(s.known_years,'{}'::int[]) known_years,
      s.earliest_date,s.latest_date,coalesce(s.result_editions,0) result_editions,
      coalesce(s.linked_results,0) linked_results,coalesce(s.archive_editions,0) archive_editions,
      coalesce(s.results_link_editions,0) results_link_editions,coalesce(c.n,0) contact_count,
      coalesce(h.lifecycle,'unknown') lifecycle,h.first_year,h.final_year,
      coalesce(h.priority,'normal') priority,h.next_check::text,p.publications
    from selected_events e left join edition_stats s on s.event_id=e.id
    left join contact_counts c on c.event_id=e.id left join observations h on h.event_id=e.id
    left join publication p on p.event_id=e.id
    where ($6::int is null or s.edition_count>0)
  ), filtered as (
    select * from records where $7='all'
      or ($7='no-editions' and edition_count=0)
      or ($7='no-results' and edition_count>0 and result_editions=0 and archive_editions=0)
      or ($7='results-found' and (result_editions>0 or archive_editions>0 or results_link_editions>0))
      or ($7='no-contacts' and contact_count=0)
      or ($7='no-organiser' and trim(organiser)='')
      or ($7='history' and (first_year is null or lifecycle='unknown'))
  )`;
  return { f, params, cte };
}

export async function listRegister(input: unknown, connection?: Sql) {
  const sql = connection ?? (await getSql());
  const { f, params, cte } = registerQuery(input);
  const [rows, summaries, facets] = await Promise.all([
    sql.query<RegisterRow>(
      `${cte} select * from filtered order by lower(name),id limit 50 offset $8`,
      [...params, f.page * 50],
    ),
    sql.query<RegisterSummary>(
      `${cte} select count(*)::int events,coalesce(sum(edition_count),0)::int editions,
      count(*) filter(where sport='Parkrun')::int parkruns,count(distinct nullif(country,''))::int countries,
      coalesce(sum(result_editions),0)::int result_editions,coalesce(sum(linked_results),0)::int linked_results,
      coalesce(sum(archive_editions),0)::int archive_editions,count(*) filter(where contact_count=0)::int no_contacts,
      count(*) filter(where trim(organiser)='')::int no_organiser,
      count(*) filter(where first_year is null or lifecycle='unknown')::int history_missing from filtered`,
      params,
    ),
    sql.query<{ countries: string[]; surfaces: string[] }>(
      `select array_agg(distinct country order by country) countries,
      array_agg(distinct surface order by surface) surfaces from running_register_events where not(slug=any($1::text[]))`,
      [retainedFixtureAliasSlugs],
    ),
  ]);
  return {
    rows,
    summary: summaries[0],
    facets: {
      countries: registerCountryOptions(facets[0]?.countries ?? []),
      surfaces: facets[0]?.surfaces ?? [],
    },
    page: f.page,
    checkedAt: new Date().toISOString(),
  };
}

export async function getRegisterEvent(input: unknown, connection?: Sql) {
  const { eventId, page, year } = eventInput.parse(input);
  const sql = connection ?? (await getSql());
  const events = await sql.query<ScalarRow>(
    `select * from running_register_events where id=$1 and not(slug=any($2::text[]))`,
    [eventId, retainedFixtureAliasSlugs],
  );
  if (!events[0]) throw new Error("Event is outside the running register");
  const [history, contacts, years, editions, totals] = await Promise.all([
    sql.query<ScalarRow>(
      `select id,first_year,first_date::text,final_year,final_date::text,lifecycle,source_url,checked_on::text,note,priority,next_check::text,created_at::text from event_register_history where event_id=$1 order by id desc`,
      [eventId],
    ),
    sql.query<ScalarRow>(
      `select id,organiser,contact_name,email,phone,contact_url,postal_address,period,from_year,to_year,source_url,checked_on::text,note from event_register_contacts where event_id=$1 order by id desc`,
      [eventId],
    ),
    sql.query<{ year: number; editions: number }>(
      `select extract(year from event_date)::int as year,count(*)::int editions from running_register_editions where event_id=$1 group by 1 order by 1 desc`,
      [eventId],
    ),
    sql.query<EditionRow>(
      `select ed.id,ed.event_date::text,ed.distance_code,ed.distance_km,ed.status,ed.start_time,ed.entry_url,ed.source_url,ed.results_official_url,
      (select count(*)::int from results r where r.edition_id=ed.id) linked_results,
      (select count(*)::int from results r where r.edition_id=ed.id and r.chip_time_seconds is not null) chip_times,
      (select count(*)::int from results r where r.edition_id=ed.id and r.gun_time_seconds is not null) gun_times,
      (select count(*)::int from results r where r.edition_id=ed.id and r.finish_time_seconds is not null and r.chip_time_seconds is null and r.gun_time_seconds is null) unspecified_times,
      (select coalesce(json_agg(json_build_object('provider',d.provider,'source_url',d.source_url,'expected_rows',d.expected_rows,
        'stored_rows',(select count(*)::int from result_archive_entries a where a.dataset_id=d.id))), '[]'::json)
        from result_archive_datasets d where d.edition_id=ed.id) datasets,
      (select coalesce(json_agg(json_build_object('provider',l.provider_name,'url',l.results_url,'status',l.status,'checked_at',l.checked_at::text)), '[]'::json)
        from edition_result_links l where l.edition_id=ed.id) result_links
      from running_register_editions ed where ed.event_id=$1 and ($2::int is null or extract(year from ed.event_date)=$2)
      order by ed.event_date desc,ed.distance_km,ed.id limit 50 offset $3`,
      [eventId, year, page * 50],
    ),
    sql.query<{ n: number }>(
      `select count(*)::int n from running_register_editions where event_id=$1 and ($2::int is null or extract(year from event_date)=$2)`,
      [eventId, year],
    ),
  ]);
  return { event: events[0], history, contacts, years, editions, total: totals[0].n, page };
}

async function lockEvent(sql: Sql, id: number) {
  const rows = await sql.query(
    `select e.id from events e where e.id=$1 and exists(select 1 from running_register_events v where v.id=e.id) and not(e.slug=any($2::text[])) for update`,
    [id, retainedFixtureAliasSlugs],
  );
  if (!rows.length) throw new Error("Event is outside the running register");
}
export async function saveHistory(input: unknown, actorId: string, connection?: Sql) {
  const d = historyInput.parse(input),
    sql = connection ?? (await getSql());
  return sql.transaction(async (tx) => {
    await lockEvent(tx, d.eventId);
    const old = await tx.query<{ id: number }>(
      `select id from event_register_history where event_id=$1 order by id desc limit 1`,
      [d.eventId],
    );
    if (Number(old[0]?.id ?? 0) !== d.expectedRevision)
      throw new Error("History changed. Refresh before saving.");
    await tx.query(
      `insert into event_register_history(event_id,first_year,first_date,final_year,final_date,lifecycle,source_url,checked_on,note,priority,next_check,actor_id)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        d.eventId,
        d.firstYear,
        d.firstDate,
        d.finalYear,
        d.finalDate,
        d.lifecycle,
        d.sourceUrl || null,
        d.checkedOn,
        d.note,
        d.priority,
        d.nextCheck,
        actorId,
      ],
    );
    return { saved: true };
  });
}
export async function saveContact(input: unknown, actorId: string, connection?: Sql) {
  const d = contactInput.parse(input),
    sql = connection ?? (await getSql());
  return sql.transaction(async (tx) => {
    await lockEvent(tx, d.eventId);
    await tx.query(
      `insert into event_register_contacts(event_id,organiser,contact_name,email,phone,contact_url,postal_address,period,from_year,to_year,source_url,checked_on,note,actor_id)
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
      [
        d.eventId,
        d.organiser,
        d.contactName,
        d.email,
        d.phone,
        d.contactUrl,
        d.postalAddress,
        d.period,
        d.fromYear,
        d.toYear,
        d.sourceUrl,
        d.checkedOn,
        d.note,
        actorId,
      ],
    );
    return { saved: true };
  });
}
