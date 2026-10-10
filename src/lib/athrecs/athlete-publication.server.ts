import type { Sql } from "../db";
import { sourceHistorySchema } from "./source-performance-history.ts";

/** Count the same published rows a public profile can display, including unverified ones. */
export async function countPublishedSourceResults(sql: Sql, athleteIds: readonly number[]) {
  if (!athleteIds.length) return new Map<number, number>();
  const rows = await sql<{ athlete_id: number; result_count: number }>`
    select h.athlete_id, count(*)::int as result_count
    from athlete_source_histories h join athletes a on a.id=h.athlete_id
    cross join lateral jsonb_array_elements(h.performances) performance
    where h.athlete_id=any(${[...athleteIds]}::int[]) and h.published_at is not null
      and (a.profile_visibility='public' or a.profile_type='Public figure')
      and (not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
        or exists (select 1 from network_audit_log approval
          where approval.action='athlete.history_admin_published'
            and approval.entity_id=h.provider||':'||h.external_id
            and approval.after_value->>'athleteId'=a.id::text))
      and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and (s.enabled=false or s.share_results=false))
      and coalesce(performance->>'profileExcluded','false') <> 'true'
    group by h.athlete_id
  `;
  return new Map(rows.map((row) => [row.athlete_id, row.result_count]));
}

export async function loadPublishedSourceHistories(sql: Sql, athleteId: number) {
  const histories = await sql`
    select h.provider, h.external_id as "externalId", h.source_url as "sourceUrl",
      h.captured_at::text as "capturedAt", h.complete,
      h.years_expected as "yearsExpected", h.years_captured as "yearsCaptured", h.performances
    from athlete_source_histories h join athletes a on a.id=h.athlete_id
    where h.athlete_id=${athleteId} and h.published_at is not null
      and (a.profile_visibility='public' or a.profile_type='Public figure')
      and (not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
        or exists (select 1 from network_audit_log approval
          where approval.action='athlete.history_admin_published'
            and approval.entity_id=h.provider||':'||h.external_id
            and approval.after_value->>'athleteId'=a.id::text))
      and not exists (select 1 from athlete_account_links l join athlete_public_shares s on s.user_id=l.user_id
        where l.athlete_id=a.id and l.status='active' and (s.enabled=false or s.share_results=false))
    order by h.provider, h.external_id
  `;
  return histories.map((history) => {
    const parsed = sourceHistorySchema.parse(history);
    return {...parsed, performances: parsed.performances.filter(row => !row.profileExcluded)};
  });
}

/** Publish an explicit snapshot of source profiles; account sharing remains owner-managed. */
export async function publishAthleteProfiles(
  sql: Sql,
  athleteNumbers: string[],
  actor: { userId: string; staffEmail: string },
) {
  const numbers = [...new Set(athleteNumbers)];
  return sql.transaction(async (tx) => {
    const published = await tx<{ id: number; number: string }>`
      with candidates as materialized (
        select a.id, i.number::text as number, a.profile_visibility
        from athletes a join athlete_identifiers i on i.athlete_id=a.id
        where i.number=any(${numbers}::bigint[])
          and coalesce(a.profile_visibility,'private') <> 'public'
          and a.profile_type <> 'Public figure'
          and not exists (select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active')
        order by a.id for update of a
      ), updated as (
        update athletes a set profile_visibility='public'
        from candidates c where a.id=c.id
        returning a.id, c.number, c.profile_visibility as previous_visibility
      ), audit as (
        insert into network_audit_log
          (actor_user_id, actor_email, action, entity_type, entity_id, before_value, after_value, note)
        select ${actor.userId}, ${actor.staffEmail}, 'athlete.bulk_publish', 'athlete', id::text,
          jsonb_build_object('profile_visibility',previous_visibility),
          jsonb_build_object('profile_visibility','public'),
          'Staff published the selected source profile, imported race results and captured source histories.'
        from updated
      )
      select id, number from updated
    `;
    const results = published.length
      ? await tx<{ id: number }>`
          update results set result_visibility='public'
          where athlete_id=any(${published.map((row) => row.id)}::integer[])
            and result_visibility='private'
          returning id
        `
      : [];
    if (published.length) {
      await tx`update athlete_source_histories set published_at=now()
        where athlete_id=any(${published.map((row) => row.id)}::integer[]) and published_at is null`;
    }
    return {
      published: published.length,
      resultsPublished: results.length,
      skipped: numbers.length - published.length,
    };
  });
}
