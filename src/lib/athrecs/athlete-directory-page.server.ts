import { profileSportEvidencePredicateSql } from "./profile-sport-evidence";
import type { Sql } from "../db";
import type { AthleteDirectory, AthleteDirectorySearch } from "./athlete-directory";
import {
  indexableApprovedAthleteSql,
  indexableApprovedAthleteSetSql,
} from "./athlete-search-policy.server.ts";
import { parseAthleteId } from "./athlete-id.ts";
import { countryNames } from "./country-flags.ts";
import { readSourceNationality } from "./source-nationality.ts";
import { withDiscoveryRead } from "./discovery-read.server.ts";

// Keep this expression aligned with public_athlete_search_folded_trgm.
const countrySql = `case
  when lower(trim(a.country)) in ('england','scotland','wales','northern ireland','united kingdom','uk','gb','gbr','great britain') then 'United Kingdom'
  when lower(trim(a.country)) in ('ireland','republic of ireland','ie','irl') then 'Ireland'
  else trim(coalesce(a.country,'')) end`;
const documentSql = `athlete_directory_search_fold(coalesce(a.display_name,'')||' '||coalesce(a.city,'')||' '||(${countrySql})||' '||coalesce(a.profile_roles,''))`;
const citySql = `case when not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
  where l.athlete_id=a.id and l.status='active' and s.share_location=false) then a.city end`;
const publicCountrySql = `case when exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
  where l.athlete_id=a.id and l.status='active' and s.share_location=false) then '' else (${countrySql}) end`;
const clubSql = `case when not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
  where l.athlete_id=a.id and l.status='active' and s.share_club=false) then nullif(c.name,'Unattached') end`;
const sourceSportSql = `athlete_source_sport_v5(h.provider,p->>'discipline',p->>'meeting')`;
// Claimed profiles use their existing owner-controlled sport/result paths.
const publicProfileSportsSql = `case when a.profile_visibility='public'
  and not exists(select 1 from athlete_account_links l where l.athlete_id=a.id)
  then athlete_profile_sports_v3(a.profile_details) else array[]::text[] end`;
const visibleSourcePerformanceSql = `coalesce(p->>'profileExcluded','false')<>'true'
  and not exists (select 1 from athlete_profile_history_choices choice
    join athlete_account_links owner_link on owner_link.user_id=choice.user_id
      and owner_link.athlete_id=h.athlete_id and owner_link.status='active'
    where choice.athlete_id=h.athlete_id and choice.provider=h.provider and choice.external_id=h.external_id
      and choice.performance_hash=md5(p::text) and choice.excluded)
  and not exists (select 1 from source_history_claim_results source_claim
    join athlete_profile_hidden_source_results hidden on hidden.source_result_id=source_claim.id
    join athlete_account_links owner_link on owner_link.user_id=hidden.user_id
      and owner_link.athlete_id=h.athlete_id and owner_link.status='active'
    where source_claim.provider=h.provider and source_claim.external_id=h.external_id
      and source_claim.source_key=p#>>'{archiveReference,sourceRow}')`;

/** Read one page plus a look-ahead row, checking current permissions in SQL. */
export async function readAthleteDirectoryPage(
  sql: Sql,
  search: AthleteDirectorySearch & { pageSize?: number; includeFacets?: boolean },
): Promise<AthleteDirectory> {
  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? 24;
  const filteredSearch = Boolean(search.q || search.country || search.sport);
  // Filtered searches remain noindex and retain their existing audience.
  const eligible = filteredSearch
    ? `(a.profile_type='Public figure' or a.profile_visibility='public')
      and exists (select 1 from athlete_identifiers i where i.athlete_id=a.id)
      and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and (s.enabled=false or s.share_results=false))`
    : indexableApprovedAthleteSql;
  // A literal match of the full query must contain its longest word. This
  // index prefilter preserves substring/cross-field matching; the final match
  // below uses only currently visible fields, so hidden attributes cannot leak.
  // Count characters after the same canonical accent removal as the SQL fold;
  // a decomposed accent must not turn a one-letter term into a trigram search.
  const token = search.q
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/\s+/)
    .sort((a, b) => b.length - a.length)[0];
  const pattern = token && token.length >= 3 ? `%${token.replace(/[\\%_]/g, "\\$&")}%` : null;
  const parsedNumber = parseAthleteId(search.q);
  const athleteNumber =
    parsedNumber && BigInt(parsedNumber) <= 9223372036854775807n ? parsedNumber : null;
  // Small sports start from indexed members; common sports walk the ordered
  // athlete index and stop after one page. Never aggregate the whole catalogue.
  // Permissions are rechecked below, even for these candidate IDs.
  let sportCandidates: number[] | null = null;
  if (search.sport && !pattern) {
    const probeLimit = 4097;
    const probe = await sql.query<{ id: number }>(
      `select id from (
        (select r.athlete_id as id from events e join editions ed on ed.event_id=e.id
          join results r on r.edition_id=ed.id
          where e.sport=$1 and r.result_visibility in ('public','public_figure') limit $2)
        union all
        (select h.athlete_id as id from athlete_source_histories h
          where h.published_at is not null
            and athlete_history_sports_v5(h.provider,h.performances) @> array[$1]::text[] limit $2)
        union all
        (select a.id from athletes a where a.profile_visibility='public'
          and ${profileSportEvidencePredicateSql()}
          and athlete_profile_sports_v3(a.profile_details) @> array[$1]::text[]
          and not exists(select 1 from athlete_account_links l where l.athlete_id=a.id) limit $2)
      ) members limit $2`,
      [search.sport, probeLimit],
    );
    if (probe.length < probeLimit) sportCandidates = [...new Set(probe.map((row) => row.id))];
  }
  const values = [
    search.q || null,
    athleteNumber,
    search.country || null,
    search.letter || null,
    page,
    pattern,
    search.sport || null,
    sportCandidates,
    pageSize,
  ];
  const sourcePermission = `(not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
    or exists (select 1 from network_audit_log approval where approval.action='athlete.history_admin_published'
      and approval.entity_id=h.provider||':'||h.external_id and approval.after_value->>'athleteId'=a.id::text))`;
  const sportMatch = `(exists (
      select 1 from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id
      where r.athlete_id=a.id and e.sport=$7 and r.result_visibility in ('public','public_figure')
        and not exists (select 1 from athlete_profile_hidden_results hidden
          join athlete_account_links l on l.user_id=hidden.user_id and l.status='active'
          where l.athlete_id=a.id and hidden.result_id=r.id)
    ) or exists (
      select 1 from athlete_source_histories h where h.athlete_id=a.id and h.published_at is not null
        and athlete_history_sports_v5(h.provider,h.performances) @> array[$7]::text[]
        and ${sourcePermission}
        and exists (select 1 from jsonb_array_elements(h.performances) p
          where (${sourceSportSql})=$7 and ${visibleSourcePerformanceSql})
    ) or (${publicProfileSportsSql}) @> array[$7]::text[])`;
  const selectedJoin = `${pattern ? "join search_candidates selected on selected.id=a.id" : ""}
    ${sportCandidates !== null ? "join unnest($8::int[]) sport_member(id) on sport_member.id=a.id" : ""}`;
  const candidateCte = `search_candidates as materialized (
    select a.id from athletes a where $6::text is not null
      and (a.profile_visibility='public' or a.profile_type='Public figure')
      and ${documentSql} like athlete_directory_search_fold($6)
    union
    select a.id from athletes a join clubs c on c.id=a.club_id
      where $6::text is not null and athlete_directory_search_fold(c.name) like athlete_directory_search_fold($6)
        and (a.profile_visibility='public' or a.profile_type='Public figure')
    union
    select i.athlete_id from athlete_identifiers i where i.number=($2::text)::bigint and i.athlete_id is not null
    union
    select l.athlete_id from athlete_identifiers i join athlete_account_links l on l.user_id=i.user_id
      where i.number=($2::text)::bigint and l.status='active'
  )`;
  const matches = `($1::text is null or (
      (btrim(athlete_directory_search_fold($1))<>'' and position(athlete_directory_search_fold($1) in athlete_directory_search_fold(concat_ws(' ',a.display_name,${clubSql},${citySql},${publicCountrySql},a.profile_roles)))>0
        or ($2::text is not null and exists (select 1 from athlete_resolved_ids i where i.athlete_id=a.id
          and (i.athlete_number::text=$2 or i.source_number::text=$2))))))
    and ($3::text is null or ((${countrySql})=$3 and (${publicCountrySql})=$3))
    and ($4::text is null or upper(left(a.display_name,1))=$4)
    and ($7::text is null or ${sportMatch}) and ($8::int[] is null or a.id=any($8::int[]))`;
  const [directory] = await sql.query<
    Omit<AthleteDirectory, "athletes"> & {
      athletes: (AthleteDirectory["athletes"][number] & { source_details: unknown })[];
    }
  >(
    `
    with ${candidateCte}, candidates as materialized (
      select a.id,a.slug,a.display_name,a.profile_roles,
        ${citySql} as city,${publicCountrySql} as country,${clubSql} as club,
        (${publicProfileSportsSql}) as profile_sports
      from athletes a ${selectedJoin}
      left join clubs c on c.id=a.club_id
      where ${eligible} and ${matches}
      order by lower(a.display_name),a.id
      limit ($9::int+1) offset ($5::int-1)*$9::int
    ), paged as materialized (
      select a.*, i.athlete_number::text as athlete_number,
        case when source.profile_visibility='public'
          and not exists (select 1 from athlete_account_links l where l.athlete_id=a.id)
          then source.profile_details end as source_details
      from (select * from candidates order by lower(display_name),id limit $9::int) a
      join athlete_resolved_ids i on i.athlete_id=a.id
      join athletes source on source.id=a.id
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
        array_agg(distinct ${sourceSportSql}) as sports
      from paged a join athlete_source_histories h on h.athlete_id=a.id
      cross join lateral jsonb_array_elements(h.performances) p
      where h.published_at is not null and ${visibleSourcePerformanceSql}
        and (not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
          or exists (select 1 from network_audit_log approval where approval.action='athlete.history_admin_published'
            and approval.entity_id=h.provider||':'||h.external_id and approval.after_value->>'athleteId'=a.id::text))
      group by h.athlete_id
    ), cards as (
      select a.id,a.slug,a.display_name,a.profile_roles,a.athlete_number,a.country,a.city,a.club,a.source_details,
        (coalesce(r.n,0)+coalesce(h.n,0))::int as result_count,
        array(select distinct sport from unnest(coalesce(r.sports,array[]::text[])||coalesce(h.sports,array[]::text[])||a.profile_sports) sport where sport is not null order by sport) as sports
      from paged a left join records r on r.athlete_id=a.id left join histories h on h.athlete_id=a.id
    ) select coalesce((select jsonb_agg(cards order by lower(display_name),id) from cards),'[]'::jsonb) as athletes,
      case when (select count(*) from candidates)<($9::int+1)
        then (($5::int-1)*$9::int+(select count(*)::int from candidates)) else null end as total,
      $5::int as page,$9::int as "pageSize",null::int as "publicAthletes",null::int as "publicResults",
      (select count(*)>$9::int from candidates) as "hasMore",array[]::text[] as countries,array[]::text[] as sports
  `,
    values,
  );
  // Only an invalid/deleted page needs a full count to find its canonical last
  // page. Ordinary browsing and searching never wait for catalogue totals.
  if (!directory.athletes.length && page > 1) {
    const [row] = await withDiscoveryRead(sql, (read) =>
      read.query<{ total: number }>(
        `
      with ${candidateCte} select count(*)::int as total,$5::int as requested_page,$9::int as page_size
      from athletes a ${selectedJoin}
      left join clubs c on c.id=a.club_id
      where ${filteredSearch ? eligible : indexableApprovedAthleteSetSql} and ${matches}
    `,
        values,
      ),
    );
    const lastPage = Math.max(1, Math.ceil(row.total / pageSize));
    if (lastPage < page) return readAthleteDirectoryPage(sql, { ...search, page: lastPage });
  }
  // Country choices are a static vocabulary plus this page's visible values,
  // rather than a second catalogue scan or a cached list of private attributes.
  return {
    ...directory,
    // Only the validated value crosses the public API boundary; never evidence.
    athletes: directory.athletes.map(({ source_details, ...athlete }) => ({
      ...athlete,
      nationality: readSourceNationality(source_details)?.value ?? null,
    })),
    countries:
      search.includeFacets === false
        ? []
        : [
            ...new Set([
              ...Object.values(countryNames),
              ...directory.athletes.map((athlete) => athlete.country),
            ]),
          ]
            .filter(Boolean)
            .sort(),
  };
}
