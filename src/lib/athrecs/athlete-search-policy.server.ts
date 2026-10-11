import type { Sql } from "../db";

// Recognize the existing publication paths, not just the newer history editor.
// A public flag or public-figure label alone is never a publication approval.
export const approvedPublicAthleteSql = `a.profile_visibility = 'public'
  and exists (select 1 from athlete_resolved_ids identifier where identifier.athlete_id = a.id)
  and (exists (
    select 1 from athlete_source_histories h
    join network_audit_log approval
      on approval.entity_id = h.provider || ':' || h.external_id
      and approval.action = 'athlete.history_admin_published'
      and approval.after_value->>'athleteId' = a.id::text
    where h.athlete_id = a.id and h.published_at is not null
  ) or exists (
    select 1 from network_audit_log approval
    where approval.action = 'athlete.bulk_publish'
      and approval.entity_id = a.id::text
      and approval.after_value->>'profile_visibility' = 'public'
  ) or exists (
    select 1 from athlete_account_links l
    join athlete_public_shares s on s.user_id = l.user_id
    where l.athlete_id = a.id and l.status = 'active'
      and s.enabled = true and s.share_results = true
  ))
  and not exists (
    select 1 from athlete_account_links l
    join athlete_public_shares s on s.user_id = l.user_id
    where l.athlete_id = a.id and l.status = 'active'
      and (s.enabled = false or s.share_results = false)
  )`;

// Keep sitemap membership and page robots decisions on this same predicate.
export const indexableApprovedAthleteSql = `${approvedPublicAthleteSql}
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
