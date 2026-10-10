import type { Sql } from "../db";

// This is a subset of the existing anonymous, administrator-approved history
// projection. A public database flag alone never authorizes anonymous indexing.
// Keep sitemap membership and page robots decisions on this same predicate.
export const indexableApprovedAthleteSql = `a.profile_visibility = 'public'
  and exists (select 1 from athlete_resolved_ids identifier where identifier.athlete_id = a.id)
  and exists (
    select 1 from athlete_source_histories h
    join network_audit_log approval
      on approval.entity_id = h.provider || ':' || h.external_id
      and approval.action = 'athlete.history_admin_published'
      and approval.after_value->>'athleteId' = a.id::text
    where h.athlete_id = a.id and h.published_at is not null
  )
  and not exists (
    select 1 from athlete_account_links l
    left join athlete_public_shares s on s.user_id = l.user_id
    where l.athlete_id = a.id and l.status = 'active'
      and (s.enabled is distinct from true or s.share_results is distinct from true
        or s.search_indexable is distinct from true)
  )`;

export async function isApprovedAthleteIndexable(sql: Sql, athleteId: number): Promise<boolean> {
  const [row] = await sql.query<{ indexable: boolean }>(
    `select exists (select 1 from athletes a
      where a.id = $1 and ${indexableApprovedAthleteSql}) as indexable`,
    [athleteId],
  );
  return row?.indexable === true;
}
