import type { Sql } from "../db";
import type { DirectoryAthlete } from "./athlete-directory";
import { indexableApprovedAthleteSql } from "./athlete-search-policy.server.ts";
import { countPublishedSourceResults } from "./athlete-publication.server.ts";

/** Bound homepage work before reading results or expanding source histories. */
export async function readFeaturedAthletes(sql: Sql): Promise<DirectoryAthlete[]> {
  const rows = await sql.query<DirectoryAthlete>(`
    with featured as materialized (
      select a.id, a.slug, a.display_name, a.profile_roles,
        null::text as city, ''::text as country,
        identifier.athlete_number::text as athlete_number,
        case when not exists (select 1 from athlete_account_links l
          join athlete_public_shares s on s.user_id=l.user_id
          where l.athlete_id=a.id and l.status='active' and s.share_club=false)
          then nullif(c.name, 'Unattached') end as club
      from athletes a
      join athlete_resolved_ids identifier on identifier.athlete_id=a.id
      left join clubs c on c.id=a.club_id
      where ${indexableApprovedAthleteSql}
      order by a.id limit 6
    )
    select a.*, count(r.id)::int as result_count,
      coalesce(array_agg(distinct e.sport) filter (where e.sport is not null), array[]::text[]) as sports
    from featured a
    left join results r on r.athlete_id=a.id and r.result_visibility in ('public','public_figure')
      and not exists (select 1 from athlete_profile_hidden_results h
        join athlete_account_links l on l.user_id=h.user_id and l.status='active'
        where l.athlete_id=a.id and h.result_id=r.id)
    left join editions ed on ed.id=r.edition_id
    left join events e on e.id=ed.event_id
    group by a.id, a.slug, a.display_name, a.profile_roles, a.city, a.country, a.athlete_number, a.club
    order by a.id
  `);
  const historyCounts = await countPublishedSourceResults(
    sql,
    rows.map((row) => row.id),
  );
  return rows.map((row) => ({
    ...row,
    result_count: row.result_count + (historyCounts.get(row.id) ?? 0),
  }));
}
