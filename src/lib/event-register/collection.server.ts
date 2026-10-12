import { getSql, type Sql } from "../db";
import { collectionFilters, registerCountryValues } from "./core";

export type CollectionRow = {
  record_key: string;
  origin: string;
  provider: string;
  source_url: string;
  source_host: string;
  event_name: string;
  programme: string;
  sport: string;
  country: string;
  location: string;
  surface: string;
  organiser: string;
  edition_year: number | null;
  event_date: string | null;
  distance_km: number | null;
  record_status: string;
  result_observations: number;
  catalogue_event_id: number | null;
  catalogue_edition_id: number | null;
  captured_at: string | null;
};
export type SourceRow = {
  source_key: string;
  name: string;
  url: string;
  host: string;
  country: string;
  source_type: string;
  sports: string;
  collection_status: string;
  rights_status: string;
  checked_on: string;
  pending_urls: number;
  records: number;
  catalogue_records: number;
  result_records: number;
  provenance_count: number;
};
export function collectionQuery(input: unknown) {
  const f = collectionFilters.parse(input);
  const pattern = f.q ? `%${f.q.replace(/[\\%_]/g, "\\$&")}%` : null;
  const params = [
    pattern,
    f.provider || null,
    f.host || null,
    registerCountryValues(f.country),
    f.year,
    f.origin,
    f.gap,
  ];
  const cte = `with filtered as materialized (
    select r.* from event_register_source_records r where
    ($1::text is null or concat_ws(' ',r.event_name,r.programme,r.provider,r.location,r.organiser) ilike $1)
    and ($2::text is null or r.provider=$2) and ($3::text is null or r.source_host=$3)
    and ($4::text[] is null or lower(trim(r.country))=any($4::text[]))
    and ($5::int is null or r.edition_year=$5)
    and ($6='all' or ($6='collected' and r.origin<>'catalogue') or r.origin=$6)
    and ($7='all' or ($7='unlinked' and r.catalogue_event_id is null)
      or ($7='year-only' and r.event_date is null and r.edition_year is not null)
      or ($7='results' and r.result_observations>0))
  )`;
  return { f, cte, params };
}
export async function listCollection(input: unknown, connection?: Sql) {
  const { f, cte, params } = collectionQuery(input);
  const sql = connection ?? (await getSql());
  const [inventory, providers] = await Promise.all([
    sql.query<{
      sources: number;
      hosts: number;
      pending_urls: number;
      records: number;
      collected: number;
      indexed_at: string | null;
    }>(`select
      (select count(*)::int from event_register_sources) sources,
      (select count(distinct host)::int from event_register_sources) hosts,
      (select coalesce(sum(jsonb_array_length(cursors)),0)::int from event_register_sources) pending_urls,
      count(*)::int records,count(*) filter(where origin<>'catalogue')::int collected,max(updated_at)::text indexed_at
      from event_register_source_records`),
    sql.query<{ provider: string }>(
      `select distinct provider from event_register_source_records order by provider`,
    ),
  ]);
  if (f.view === "sources") {
    const sourceCte = `with coverage as (
      select source_host,count(*)::int records,
      count(*) filter(where origin='catalogue')::int catalogue_records,
      count(*) filter(where result_observations>0)::int result_records
      from event_register_source_records group by source_host
    ), filtered as materialized (
      select s.source_key,s.name,s.url,s.host,s.country,s.source_type,s.sports,s.collection_status,s.rights_status,s.checked_on,
      jsonb_array_length(s.cursors) pending_urls,jsonb_array_length(s.provenance) provenance_count,
      coalesce(c.records,0) records,coalesce(c.catalogue_records,0) catalogue_records,coalesce(c.result_records,0) result_records
      from event_register_sources s left join coverage c on c.source_host=s.host
      where ($1::text is null or concat_ws(' ',s.name,s.host,s.url,s.country,s.sports,s.collection_status) ilike $1)
      and ($2::text is null or s.host=$2)
      and ($3::text[] is null or lower(trim(s.country))=any($3::text[]))
      and ($4<>'no-records' or coalesce(c.records,0)=0)
    )`;
    const sourceParams = [params[0], f.host || null, params[3], f.gap];
    const [rows, total] = await Promise.all([
      sql.query<SourceRow>(
        `${sourceCte} select * from filtered order by name,source_key limit 50 offset $5`,
        [...sourceParams, f.page * 50],
      ),
      sql.query<{ total: number }>(
        `${sourceCte} select count(*)::int total from filtered`,
        sourceParams,
      ),
    ]);
    return {
      view: "sources" as const,
      sources: rows,
      rows: [] as CollectionRow[],
      total: total[0].total,
      summary: null,
      inventory: inventory[0],
      providers: providers.map((x) => x.provider),
      page: f.page,
    };
  }
  const [rows, summary] = await Promise.all([
    sql.query<CollectionRow>(
      `${cte} select record_key,origin,provider,source_url,source_host,event_name,programme,sport,country,location,surface,organiser,
      edition_year,event_date::text,distance_km,record_status,result_observations,catalogue_event_id,catalogue_edition_id,captured_at::text
      from filtered order by edition_year desc nulls last,event_date desc nulls last,event_name,record_key limit 50 offset $8`,
      [...params, f.page * 50],
    ),
    sql.query<{
      total: number;
      event_names: number;
      year_only: number;
      linked: number;
      results: number;
    }>(
      `${cte} select count(*)::int total,
      count(distinct event_key)::int event_names,count(*) filter(where event_date is null and edition_year is not null)::int year_only,
      count(*) filter(where catalogue_event_id is not null)::int linked,count(*) filter(where result_observations>0)::int results from filtered`,
      params,
    ),
  ]);
  return {
    view: "records" as const,
    rows,
    sources: [] as SourceRow[],
    total: summary[0].total,
    summary: summary[0],
    inventory: inventory[0],
    providers: providers.map((x) => x.provider),
    page: f.page,
  };
}
