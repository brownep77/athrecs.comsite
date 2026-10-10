import type { Sql } from "../db";

export type MemberArchiveMatch = {
  id: number;
  revision: number;
  name: string;
  event: string;
  date: string;
  distance: string;
  status: string;
  seconds: number | null;
  requested: boolean;
};
/** No client-supplied name or free search. Return only a bounded view matching this account's saved names. */
export async function memberArchiveMatches(
  sql: Sql,
  userId: string,
): Promise<MemberArchiveMatch[]> {
  return sql<MemberArchiveMatch>`
    with names as (
      select lower(btrim(u.name)) as name from "user" u where u.id=${userId}
      union select lower(btrim(p.full_name)) from athlete_private_profiles p where p.user_id=${userId}
      union select lower(btrim(p.display_name)) from athlete_private_profiles p where p.user_id=${userId}
      union select lower(btrim(unnest(p.previous_names))) from athlete_private_profiles p where p.user_id=${userId}
      union select lower(btrim(a.display_name)) from athletes a join athlete_account_links l on l.athlete_id=a.id where l.user_id=${userId} and l.status='active'
    )
    select a.id,a.revision,a.payload->>'name' as name,e.name as event,ed.event_date::text as date,ed.distance_code as distance,
      a.payload->>'status' as status,(a.payload->>'finishSeconds')::double precision as seconds,
      exists(select 1 from result_archive_match_requests r where r.entry_id=a.id and r.user_id=${userId}) as requested
    from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id
    where a.canonical_result_id is null and a.review_state='unmatched'
      and lower(a.payload->>'name') in (select name from names where length(name)>2)
    order by ed.event_date desc,a.id desc limit 50`;
}
export async function requestArchiveMatch(
  sql: Sql,
  userId: string,
  input: { entryId: number; revision: number; note: string },
) {
  return sql.transaction(async (tx) => {
    const [user] = await tx<{
      verified: boolean;
    }>`select "emailVerified" as verified from "user" where id=${userId} for update`;
    if (!user?.verified) throw new Error("Verify your email before requesting an identity review");
    const matches = await memberArchiveMatches(tx, userId);
    const match = matches.find((m) => m.id === input.entryId && m.revision === input.revision);
    if (!match)
      throw new Error("This suggestion has changed or is no longer available to your account");
    const [{ n }] = await tx<{
      n: number;
    }>`select count(*)::int as n from result_archive_match_requests where user_id=${userId} and created_at>now()-interval '1 day'`;
    if (n >= 30 && !match.requested)
      throw new Error("You can request up to 30 archive reviews per day");
    await tx`insert into result_archive_match_requests(entry_id,user_id,revision,note) values(${input.entryId},${userId},${input.revision},${input.note}) on conflict do nothing`;
    return { requested: true };
  });
}
export async function staffArchiveRequests(sql: Sql) {
  return sql<{
    entryId: number;
    revision: number;
    name: string;
    note: string;
    event: string;
    created: string;
    athleteIds: number[];
  }>`
    select r.entry_id as "entryId",r.revision,u.name,r.note,e.name as event,r.created_at::text as created,
      array(select l.athlete_id from athlete_account_links l where l.user_id=r.user_id and l.status='active') as "athleteIds"
    from result_archive_match_requests r join "user" u on u.id=r.user_id join result_archive_entries a on a.id=r.entry_id
    join result_archive_datasets d on d.id=a.dataset_id join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id
    where a.canonical_result_id is null order by r.created_at,r.entry_id limit 100`;
}
