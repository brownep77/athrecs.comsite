import type { Sql } from "../db";
import { withDiscoveryRead } from "./discovery-read.server";
import {
  profileEvidenceSportNames,
  profileSportEvidencePredicateSql,
} from "./profile-sport-evidence";
import { sourceHistorySportNames } from "./source-history-sport";

export type StaffDirectoryFilters = {
  q: string;
  sport: string;
  visibility: "" | "Public" | "Private";
  page: number;
};

// Only small identity/search fields take part in the catalogue scan. Results,
// biographies, private account details and source lists are loaded after LIMIT.
function directoryCtes(filters: StaffDirectoryFilters) {
  return `with
    accounts as materialized (
      select i.number, p.user_id,
        coalesce(nullif(p.display_name,''),p.full_name,u."name",'Athlete') as name,
        coalesce(p.country,'') as country, coalesce(p.city,'') as city,
        coalesce(p.club_or_team,'') as club, coalesce(s.enabled,false) as public
      from athlete_private_profiles p join "user" u on u.id=p.user_id
      join athlete_identifiers i on i.user_id=p.user_id
      left join athlete_public_shares s on s.user_id=p.user_id
    ),
    linked as materialized (
      select l.athlete_id, i.number from athlete_account_links l
      join athlete_identifiers i on i.user_id=l.user_id where l.status='active'
    ),
    linked_fallback as (
      select distinct on (l.number) l.number, a.display_name as name,
        coalesce(a.country,'') as country, coalesce(a.city,'') as city,
        coalesce(c.name,'') as club,
        (a.profile_visibility='public' or a.profile_type='Public figure') as public
      from linked l join athletes a on a.id=l.athlete_id
      left join clubs c on c.id=a.club_id
      where not exists(select 1 from accounts p where p.number=l.number)
      order by l.number,a.display_name,a.id
    ),
    profiles as materialized (
      select i.number,a.display_name as name,coalesce(a.country,'') as country,
        coalesce(a.city,'') as city,coalesce(c.name,'') as club,
        (a.profile_visibility='public' or a.profile_type='Public figure') as public,
        not (a.profile_visibility='public' or a.profile_type='Public figure') as can_publish
      from athletes a join athlete_identifiers i on i.athlete_id=a.id
      left join clubs c on c.id=a.club_id
      where not exists(select 1 from linked l where l.athlete_id=a.id)
      union all select number,name,country,city,club,public,false from accounts
      union all select number,name,country,city,club,public,false from linked_fallback
    ),
    sport_numbers as (
      ${
        filters.sport
          ? `
      select coalesce(l.number,i.number) as number
      from results r join editions ed on ed.id=r.edition_id
      join events e on e.id=ed.event_id
      join athlete_identifiers i on i.athlete_id=r.athlete_id
      left join linked l on l.athlete_id=r.athlete_id where e.sport=$2
      union
      select coalesce(l.number,i.number) from athlete_source_histories h
      join athlete_identifiers i on i.athlete_id=h.athlete_id
      left join linked l on l.athlete_id=h.athlete_id
      where athlete_history_sports_v4(h.provider,h.performances) @> array[$2]::text[]
      union
      select coalesce(l.number,i.number) from athletes a
      join athlete_identifiers i on i.athlete_id=a.id
      left join linked l on l.athlete_id=a.id
      where ${profileSportEvidencePredicateSql()}
        and athlete_profile_sports_v2(a.profile_details) @> array[$2]::text[]
      union
      select coalesce(l.number,i.number) from athlete_upcoming_events e
      join athlete_identifiers i on i.athlete_id=e.athlete_id
      left join linked l on l.athlete_id=e.athlete_id where e.sport=$2
      union
      select p.number from accounts p join athlete_sport_profiles s on s.user_id=p.user_id
      where s.sport_code=$2
      union
      select p.number from accounts p join athlete_upcoming_events e on e.user_id=p.user_id
      where e.sport=$2`
          : "select null::bigint as number where false"
      }
    ),
    filtered as materialized (
      select number,name,can_publish from profiles p
      where ($1::text='' or strpos(lower('ATH-' || lpad(number::text,greatest(6,length(number::text)),'0')
        || ' ' || name || ' ' || country || ' ' || city || ' ' || club),lower($1))>0)
        and ($2::text='' or number in (select number from sport_numbers))
        and ($3::text='' or public=($3='Public'))
    )`;
}

export async function loadStaffDirectoryPage(sql: Sql, filters: StaffDirectoryFilters) {
  return withDiscoveryRead(sql, async (tx) => {
    const [row] = await tx.query<{
      numbers: string[];
      total: number;
      totalStored: number;
      publishableTotal: number;
      page: number;
      pages: number;
    }>(
      `${directoryCtes(filters)},
      counts as (select count(*)::int as total,
        count(*) filter(where can_publish)::int as publishable from filtered),
      pagination as (select *, greatest(1,ceil(total/50.0)::int) as pages,
        least($4::int,greatest(1,ceil(total/50.0)::int)) as page from counts)
      select total,publishable as "publishableTotal",page,pages,
        (select count(*)::int from profiles) as "totalStored",
        array(select number::text from filtered order by name,filtered.number
          limit 50 offset (pagination.page-1)*50) as numbers from pagination`,
      [filters.q, filters.sport, filters.visibility, filters.page],
    );
    const sports = await tx.query<{ sport: string }>(`
      select distinct sport from (
        select e.sport from results r join editions ed on ed.id=r.edition_id
          join events e on e.id=ed.event_id
        union all select sport from athlete_upcoming_events where athlete_id is not null
          or user_id in (select user_id from athlete_private_profiles)
        union all select sport_code from athlete_sport_profiles
          where user_id in (select user_id from athlete_private_profiles)
        union all select sport from (values ${profileEvidenceSportNames.map((sport) => `('${sport}')`).join(",")}) candidate(sport)
          where exists (select 1 from athletes a
            where ${profileSportEvidencePredicateSql()}
        and athlete_profile_sports_v2(a.profile_details) @> array[candidate.sport]::text[])
        union all select sport from (values ${sourceHistorySportNames.map((sport) => `('${sport}')`).join(",")}) candidate(sport)
          where exists (select 1 from athlete_source_histories h
            where athlete_history_sports_v4(h.provider,h.performances) @> array[candidate.sport]::text[])
      ) sports where sport<>'' order by sport`);
    return { ...row, sports: sports.map((row) => row.sport) };
  });
}

/** Bulk selection needs identifiers, never full profiles or result aggregation. */
export async function selectStaffDirectoryNumbers(sql: Sql, filters: StaffDirectoryFilters) {
  return withDiscoveryRead(sql, async (tx) => {
    const rows = await tx.query<{ number: string }>(
      `${directoryCtes(filters)}
      select number::text from filtered where can_publish order by name,number`,
      [filters.q, filters.sport, filters.visibility],
    );
    return rows.map((row) => row.number);
  });
}
