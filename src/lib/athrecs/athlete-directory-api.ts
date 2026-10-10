import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { ensureAthrecsSeeded } from "./seed.server";
import type { AthleteDirectory } from "./athlete-directory";
import { parseAthleteId } from "./athlete-id";
import { readSourceNationality } from "./source-nationality";

const inputSchema = z.object({
  q: z.string().trim().max(120).optional(),
  country: z.string().trim().max(120).optional(),
  sport: z.string().trim().max(120).optional(),
  page: z.number().int().min(1).max(100000).optional(),
  pageSize: z.number().int().min(1).max(48).optional(),
  includeFacets: z.boolean().optional(),
});

// AthRecs discovery only. Private accounts and unlisted shared profiles are
// deliberately absent from the list, counts and filter choices.
export const getAthleteDirectory = createServerFn({ method: "GET" })
  .validator((input: z.input<typeof inputSchema> | undefined) => inputSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<AthleteDirectory> => {
    await ensureAthrecsSeeded();
    const sql = await getSql();
    const q = data.q || null;
    const athleteNumber = parseAthleteId(q);
    const country = data.country || null;
    const sport = data.sport || null;
    const pageSize = data.pageSize ?? 24;
    const requestedPage = data.page ?? 1;
    const includeFacets = data.includeFacets ?? true;
    // Aggregate visible results once for the directory, rather than running a
    // correlated result query for every athlete before pagination. Keep this
    // request-local so publication and result-hiding changes apply immediately.
    const [directory] = await sql<AthleteDirectory>`
      with public_athletes as materialized (
        select a.id, a.slug, a.display_name, a.city, a.profile_roles, a.profile_type,
          identifier.athlete_number::text as athlete_number,
          identifier.source_number::text as source_number,
          case
            when lower(trim(a.country)) in ('england', 'scotland', 'wales', 'northern ireland',
              'united kingdom', 'uk', 'gb', 'gbr', 'great britain') then 'United Kingdom'
            when lower(trim(a.country)) in ('ireland', 'republic of ireland', 'ie', 'irl') then 'Ireland'
            else trim(coalesce(a.country, ''))
          end as country,
          nullif(c.name, 'Unattached') as club
        from athletes a
        join athlete_resolved_ids identifier on identifier.athlete_id = a.id
        left join clubs c on c.id = a.club_id
        where a.profile_type = 'Public figure' or (a.profile_visibility = 'public' and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id where l.athlete_id=a.id and l.status='active' and s.enabled=false))
      ), result_summaries as materialized (
        select r.athlete_id, count(*)::int as result_count,
          coalesce(array_agg(distinct e.sport order by e.sport)
            filter (where nullif(trim(e.sport), '') is not null), array[]::text[]) as sports
        from results r
        join public_athletes a on a.id = r.athlete_id
        join editions ed on ed.id = r.edition_id
        join events e on e.id = ed.event_id
        where (a.profile_type = 'Public figure' or r.result_visibility in ('public', 'public_figure'))
          and not exists (select 1 from athlete_profile_hidden_results hidden join athlete_account_links l on l.user_id=hidden.user_id and l.status='active' where l.athlete_id=a.id and hidden.result_id=r.id)
          and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id where l.athlete_id=a.id and l.status='active' and s.share_results=false)
        group by r.athlete_id
      ), source_summaries as materialized (
        select h.athlete_id, count(*)::int as result_count,
          array_agg(distinct case
            when performance->>'discipline' ~* '(^|[^[:alnum:]_])triathlon([^[:alnum:]_]|$)' then 'Triathlon'
            when performance->>'discipline' ~* '(^|[^[:alnum:]_])duathlon([^[:alnum:]_]|$)' then 'Duathlon'
            when trim(performance->>'discipline') ~* '^(marathon|half( marathon)?|[0-9]+([.][0-9]+)?[[:space:]]*k(m)?|[0-9]+([.][0-9]+)?[[:space:]]*(mi|mile|miles))$'
            then 'Running' else 'Athletics' end) as sports
        from athlete_source_histories h join public_athletes a on a.id=h.athlete_id
        cross join lateral jsonb_array_elements(h.performances) performance
        where h.published_at is not null
          and (not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
            or exists (select 1 from network_audit_log approval
              where approval.action='athlete.history_admin_published'
                and approval.entity_id=h.provider||':'||h.external_id
                and approval.after_value->>'athleteId'=a.id::text))
          and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
            where l.athlete_id=a.id and l.status='active' and (s.enabled=false or s.share_results=false))
          and coalesce(performance->>'profileExcluded','false') <> 'true'
        group by h.athlete_id
      ), public_profiles as materialized (
        select a.id, a.slug, a.display_name, a.city, a.profile_roles,
          a.athlete_number, a.source_number, a.country, a.club,
          (coalesce(records.result_count, 0) + coalesce(source_records.result_count, 0))::int as result_count,
          array(select distinct sport from unnest(coalesce(records.sports, array[]::text[]) || coalesce(source_records.sports, array[]::text[])) sport order by sport) as sports
        from public_athletes a
        left join result_summaries records on records.athlete_id = a.id
        left join source_summaries source_records on source_records.athlete_id = a.id
      ), filtered as materialized (
        select * from public_profiles
        where (${q}::text is null or position(lower(${q}) in
          lower(concat_ws(' ', display_name, club, city, country, profile_roles))) > 0
          or athlete_number = ${athleteNumber} or source_number = ${athleteNumber})
          and (${country}::text is null or country = ${country})
          and (${sport}::text is null or ${sport} = any(sports))
      ), totals as (
        select count(*)::int as total,
          least(${requestedPage}, greatest(1, ceil(count(*)::numeric / ${pageSize})::int)) as page
        from filtered
      ), paged as (
        select id, slug, display_name, city, profile_roles, athlete_number,
          country, club, result_count, sports
        from filtered order by lower(display_name), id
        limit ${pageSize} offset (select (page - 1) * ${pageSize} from totals)
      )
      select coalesce((select jsonb_agg(paged order by lower(display_name), id) from paged), '[]'::jsonb) as athletes,
        total, page, ${pageSize}::int as "pageSize",
        (select count(*)::int from public_profiles) as "publicAthletes",
        (select coalesce(sum(result_count), 0)::int from public_profiles) as "publicResults",
        case when ${includeFacets}::boolean then
          array(select distinct country from public_profiles where country <> '' order by country)
          else array[]::text[] end as countries,
        case when ${includeFacets}::boolean then
          array(select distinct unnest(sports) as sport from public_profiles order by sport)
          else array[]::text[] end as sports
      from totals
    `;
    if (!directory.athletes.length) return directory;
    // Fetch only this page's evidence, and expose only the nationality value.
    // Full source metadata and account-owned details never enter the public list.
    const observations = await sql<{ id: number; profile_details: unknown }>`
      select a.id, a.profile_details from athletes a
      where a.id=any(${directory.athletes.map((athlete) => athlete.id)}::int[])
        and a.profile_visibility='public'
        and not exists (select 1 from athlete_account_links l where l.athlete_id=a.id)
    `;
    const nationalities = new Map(
      observations.map((row) => [row.id, readSourceNationality(row.profile_details)]),
    );
    return {
      ...directory,
      athletes: directory.athletes.map((athlete) => ({
        ...athlete,
        nationality: nationalities.get(athlete.id)?.value ?? null,
      })),
    };
  });
