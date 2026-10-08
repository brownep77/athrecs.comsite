import type { Sql } from "../db";

/** Only profiles with publicly visible performances can enter homepage discovery.
 * Keep the same owner-sharing and hidden-result boundaries as the directory.
 * This selects existing published records; it does not verify or publish them.
 */
export async function homeProfileSlugs(sql: Sql, sport: string | null) {
  return sql<{ slug: string }>`
    select a.slug
    from athletes a
    join results r on r.athlete_id=a.id
    join editions ed on ed.id=r.edition_id
    join events e on e.id=ed.event_id
    where (a.profile_type='Public figure' or (a.profile_visibility='public'
      and not exists (select 1 from athlete_account_links l
        join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and s.enabled=false)))
      and (a.profile_type='Public figure' or r.result_visibility in ('public','public_figure'))
      and ed.event_date <= current_date
      and (${sport}::text is null or e.sport=${sport})
      and not exists (select 1 from athlete_profile_hidden_results hidden
        join athlete_account_links l on l.user_id=hidden.user_id and l.status='active'
        where l.athlete_id=a.id and hidden.result_id=r.id)
      and not exists (select 1 from athlete_account_links l
        join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and s.share_results=false)
    group by a.id, a.slug
    order by max(ed.event_date) desc, a.id
    limit 8
  `;
}
