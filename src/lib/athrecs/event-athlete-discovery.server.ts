import type { Sql } from "../db";
import { indexableApprovedAthleteSql } from "./athlete-search-policy.server";

/** Small, immediately privacy-aware links from a race to approved public profiles. */
export async function readEventAthleteLinks(sql: Sql, eventSlug: string) {
  return sql.query<{ slug: string; name: string }>(
    `
    select distinct a.slug, a.display_name as name
    from events e join editions ed on ed.event_id=e.id
    join results r on r.edition_id=ed.id join athletes a on a.id=r.athlete_id
    where e.slug=$1 and ed.event_date <= current_date
      and r.result_visibility in ('public','public_figure')
      and coalesce(r.result_details->>'profileExcluded','false') <> 'true'
      and ${indexableApprovedAthleteSql}
      and not exists (select 1 from athlete_profile_hidden_results h
        join athlete_account_links l on l.user_id=h.user_id and l.status='active'
        where l.athlete_id=a.id and h.result_id=r.id)
    order by name, a.slug limit 12
  `,
    [eventSlug],
  );
}
