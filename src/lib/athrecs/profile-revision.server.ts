import type { Sql } from "@/lib/db";

/** Hash in Postgres: unchanged profiles transfer one digest, not their whole race history.
 * Includes deletions, source-history edits, eligibility, verification, visibility and date rollover.
 * Only the authenticated account's linked data contributes; no certificate bytes are read.
 */
export async function linkedProfileRevision(sql: Sql, userId: string): Promise<string> {
  const [row] = await sql<{ revision: string }>`
    with linked as (
      select a.id, a.gender from athlete_account_links l join athletes a on a.id = l.athlete_id
      where l.user_id = ${userId} and l.status = 'active'
    ), rows as (
      select r.*, l.gender as athlete_gender from linked l join athlete_claimable_results r on r.athlete_id = l.id
      where r.id > 0 or r.available
    ), hidden as (
      select result_id from athlete_profile_hidden_results where user_id = ${userId}
      union all select -source_result_id from athlete_profile_hidden_source_results where user_id = ${userId}
    )
    select md5(jsonb_build_object(
      'date', current_date,
      'linked', (select jsonb_agg(to_jsonb(l) order by l.id) from linked l),
      'results', (select jsonb_agg(to_jsonb(r) order by r.id) from rows r),
      'hidden', (select jsonb_agg(result_id order by result_id) from hidden)
    )::text) as revision
  `;
  return row.revision;
}
