import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { ensureAthrecsSeeded } from "./seed.server";
import { normalizeResultsSearch } from "./public-results-search";
import { todayIso } from "./format";

export type UnlinkedResult = {
  key: string;
  source_name: string;
  meeting: string;
  date: string;
  year: string;
  discipline: string;
  performance: string;
  status: string;
  verification_status: string | null;
  finish_time_seconds: number | null;
  provider: string | null;
  source_url: string | null;
};

/** Results-only publication is explicit, reversible and independent of identity verification.
 * Never project profile facts, internal candidate matches, notes or source-row JSON.
 * Account ownership and existing result/history publication gates always win.
 */
export const listUnlinkedResults = createServerFn({ method: "GET" })
  .validator(normalizeResultsSearch)
  .handler(async ({ data }) => {
    if (IS_RUNRECS_SITE) return { results: [] as UnlinkedResult[], hasMore: false };
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const query = data.q ? `%${data.q.replace(/[\\%_]/g, "\\$&")}%` : null;
    const today = todayIso();
    const rows = await sql<UnlinkedResult>`
      with held as materialized (
        select a.id, a.display_name from athletes a
        where a.profile_details#>>'{nameReview,mode}'='results_only'
          and a.profile_visibility='private' and a.parent_athlete_id is null
          and not exists (select 1 from athlete_account_links l where l.athlete_id=a.id)
      ), entries as (
        select 'r:'||r.id as key, a.display_name as source_name,
          e.name as meeting, ed.event_date::text as date,
          extract(year from ed.event_date)::int::text as year,
          ed.distance_code as discipline,
          left(coalesce(r.result_details->>'reportedPerformance',''),100) as performance,
          case when lower(r.status) in ('finished','fin') then r.finish_time_seconds else null end as finish_time_seconds, r.status,
          r.result_details->>'verificationStatus' as verification_status, r.result_source as provider, r.source_url
        from held a join results r on r.athlete_id=a.id
        join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
        where r.result_visibility in ('public','public_figure') and ed.event_date<=${today}::date
        union all
        select 'h:'||md5(h.provider||':'||h.external_id||':'||p.ordinal::text),
          a.display_name, left(p.value->>'meeting',300),
          case when p.value->>'date' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then p.value->>'date' else '' end,
          left(coalesce(p.value->>'year',''),4), left(p.value->>'discipline',100),
          left(p.value->>'performance',100), null::integer,
          coalesce(p.value#>>'{archiveReference,status}',''), p.value->>'verificationStatus',
          h.provider, coalesce(p.value#>>'{sourceUrls,0}',h.source_url)
        from held a join athlete_source_histories h on h.athlete_id=a.id
        cross join lateral jsonb_array_elements(h.performances) with ordinality p(value,ordinal)
        where h.published_at is not null
          and coalesce(p.value->>'profileExcluded','false')<>'true'
          and coalesce(p.value->>'date','')<=${today}
          and coalesce(p.value->>'year','')<=left(${today},4)
      )
      select key, source_name, meeting, date, year, discipline, performance,
        finish_time_seconds, status, verification_status, provider, source_url from entries
      where (${query}::text is null or source_name ilike ${query} or meeting ilike ${query})
        and (${data.year}='' or year=${data.year})
      order by year desc, date desc, meeting, source_name, key
      limit 101 offset ${(data.page - 1) * 100}
    `;
    return { results: rows.slice(0, 100), hasMore: rows.length > 100 };
  });
