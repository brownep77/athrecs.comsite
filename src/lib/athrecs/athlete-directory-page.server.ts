import type { Sql } from "../db";
import type { AthleteDirectory, AthleteDirectorySearch } from "./athlete-directory";
import { indexableApprovedAthleteSql } from "./athlete-search-policy.server.ts";
import { parseAthleteId } from "./athlete-id.ts";

/** Public alphabetical browsing: paginate identities before reading histories. */
export async function readAthleteDirectoryPage(
  sql: Sql,
  search: AthleteDirectorySearch,
): Promise<AthleteDirectory> {
  // Filtered searches remain noindex and preserve public directory discovery;
  // indexable A–Z pages contain only profiles eligible for search themselves.
  const eligible =
    search.q || search.country
      ? `(a.profile_type='Public figure' or a.profile_visibility='public') and not exists (
        select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and (s.enabled=false or s.share_results=false))`
      : indexableApprovedAthleteSql;
  const values = [
    search.q || null,
    parseAthleteId(search.q),
    search.country || null,
    search.letter || null,
    search.page ?? 1,
  ];
  const [directory] = await sql.query<AthleteDirectory>(
    `
    with public_athletes as materialized (
      select a.id, a.slug, a.display_name, a.profile_roles,
        i.athlete_number::text as athlete_number, i.source_number::text as source_number,
        case when not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
          where l.athlete_id=a.id and l.status='active' and s.share_location=false) then a.city end as city,
        case when exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
          where l.athlete_id=a.id and l.status='active' and s.share_location=false) then ''
          when lower(trim(a.country)) in ('england','scotland','wales','northern ireland','united kingdom','uk','gb','gbr','great britain') then 'United Kingdom'
          when lower(trim(a.country)) in ('ireland','republic of ireland','ie','irl') then 'Ireland'
          else trim(coalesce(a.country,'')) end as country,
        case when not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
          where l.athlete_id=a.id and l.status='active' and s.share_club=false) then nullif(c.name,'Unattached') end as club
      from athletes a join athlete_resolved_ids i on i.athlete_id=a.id
      left join clubs c on c.id=a.club_id
      where ${eligible}
    ), filtered as materialized (
      select * from public_athletes where
        ($1::text is null or position(lower($1) in lower(concat_ws(' ',display_name,club,city,country,profile_roles)))>0
          or athlete_number=$2 or source_number=$2)
        and ($3::text is null or country=$3)
        and ($4::text is null or upper(left(display_name,1))=$4)
    ), totals as (
      select count(*)::int as total, least($5::int,greatest(1,ceil(count(*)::numeric/24)::int)) as page from filtered
    ), paged as materialized (
      select * from filtered order by lower(display_name), id
      limit 24 offset (select (page-1)*24 from totals)
    ), records as (
      select r.athlete_id, count(*)::int as n, array_agg(distinct e.sport) as sports
      from paged a join results r on r.athlete_id=a.id
      join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
      where r.result_visibility in ('public','public_figure')
        and not exists (select 1 from athlete_profile_hidden_results h
          join athlete_account_links l on l.user_id=h.user_id and l.status='active'
          where l.athlete_id=a.id and h.result_id=r.id)
      group by r.athlete_id
    ), histories as (
      select h.athlete_id, count(*)::int as n,
        array_agg(distinct case
          when p->>'discipline' ~* '(^|[^[:alnum:]_])triathlon([^[:alnum:]_]|$)' then 'Triathlon'
          when p->>'discipline' ~* '(^|[^[:alnum:]_])duathlon([^[:alnum:]_]|$)' then 'Duathlon'
          when h.provider='DUV Ultra Marathon Statistics' or trim(p->>'discipline') ~* '^(marathon|half( marathon)?|[0-9]+([.][0-9]+)?[[:space:]]*k(m)?|[0-9]+([.][0-9]+)?[[:space:]]*(mi|mile|miles))$' then 'Running'
          else 'Athletics' end) as sports
      from paged a join athlete_source_histories h on h.athlete_id=a.id
      cross join lateral jsonb_array_elements(h.performances) p
      where h.published_at is not null and coalesce(p->>'profileExcluded','false')<>'true'
        and (not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
          or exists (select 1 from network_audit_log approval where approval.action='athlete.history_admin_published'
            and approval.entity_id=h.provider||':'||h.external_id and approval.after_value->>'athleteId'=a.id::text))
      group by h.athlete_id
    ), cards as (
      select a.id,a.slug,a.display_name,a.profile_roles,a.athlete_number,a.country,a.city,a.club,
        (coalesce(r.n,0)+coalesce(h.n,0))::int as result_count,
        array(select distinct sport from unnest(coalesce(r.sports,array[]::text[])||coalesce(h.sports,array[]::text[])) sport order by sport) as sports
      from paged a left join records r on r.athlete_id=a.id left join histories h on h.athlete_id=a.id
    ) select coalesce((select jsonb_agg(cards order by lower(display_name),id) from cards),'[]'::jsonb) as athletes,
      total,page,24 as "pageSize",(select count(*)::int from public_athletes) as "publicAthletes",
      null::int as "publicResults", array(select distinct country from public_athletes where country<>'' order by country) as countries,
      array[]::text[] as sports from totals
  `,
    values,
  );
  return directory;
}
