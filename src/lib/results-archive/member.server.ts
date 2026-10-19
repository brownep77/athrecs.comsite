import {
  matchingNames,
  selectedMatchingNames,
  distanceSearchAliases,
  type MatchingSettings,
  type ResultSearchFilters,
} from "../athrecs/result-matching-settings";
import {
  buildPotentialMatchSearchPatterns,
  normalizePersonName,
  scorePotentialResultNameMatch,
} from "../athrecs/result-match";
import type { Sql } from "../db";

export type MemberArchiveMatch = {
  id: number;
  revision: number;
  name: string;
  event: string;
  date: string;
  distance: string;
  sport?: string;
  status: string;
  seconds: number | null;
  club: string | null;
  bib: string | null;
  category: string | null;
  requested: boolean;
  reasons?: string[];
};
/** Manual filters narrow the account's saved names; they never expose an unrestricted participant directory. */
export async function memberArchiveMatches(
  sql: Sql,
  userId: string,
  filters?: Partial<ResultSearchFilters>,
  entryIds?: number[],
): Promise<MemberArchiveMatch[]> {
  const [identity] = await sql<{
    name: string;
    full_name: string;
    previous_names: string[];
    settings: MatchingSettings;
    city: string;
    club: string;
    dateOfBirth: string;
    nationality: string;
  }>`
    select u.name,p.full_name,p.previous_names,s.settings,p.city,p.club_or_team as club,p.date_of_birth::text as "dateOfBirth",p.nationality
    from "user" u left join athlete_private_profiles p on p.user_id=u.id left join athlete_result_matching_settings s on s.user_id=u.id where u.id=${userId}`;
  if (!identity) return [];
  const linked = await sql<{
    name: string;
  }>`select a.display_name as name from athletes a join athlete_account_links l on l.athlete_id=a.id where l.user_id=${userId} and l.status='active'`;
  const saved = matchingNames(
    identity.full_name,
    identity.previous_names ?? [],
    identity.settings,
    [identity.name, ...linked.map((x) => x.name)],
  );
  const names = selectedMatchingNames(saved, filters?.name ?? "");
  const { rawPatterns, normalizedPatterns } = buildPotentialMatchSearchPatterns(names);
  const distances = distanceSearchAliases(filters?.distance ?? "");
  const rows = await sql<MemberArchiveMatch & { nationality: string; age: string }>`
    select a.id,a.revision,a.payload->>'name' as name,e.name as event,ed.event_date::text as date,ed.distance_code as distance,e.sport,
      a.payload->>'status' as status,(a.payload->>'finishSeconds')::double precision as seconds,
      a.payload->>'club' as club,a.payload->>'bib' as bib,a.payload->>'category' as category,
      coalesce(nullif(a.payload->>'country',''),a.payload->>'nationality') as nationality,a.payload->>'age' as age,
      exists(select 1 from result_archive_match_requests r where r.entry_id=a.id and r.user_id=${userId}) as requested
    from result_archive_entries a join result_archive_datasets d on d.id=a.dataset_id join editions ed on ed.id=d.edition_id join events e on e.id=ed.event_id
    cross join lateral (select trim(regexp_replace(regexp_replace(translate(lower(normalize(a.payload->>'name', NFKD)), ${"’'`"}, ''), ${"[\u0300-\u036f]"}, '', 'g'), '[^[:alnum:]]+', ' ', 'g')) as name) search_name
    where a.canonical_result_id is null and a.review_state='unmatched'
      and (lower(a.payload->>'name') like any(${rawPatterns}::text[]) or search_name.name like any(${normalizedPatterns}::text[]))
      and (${filters?.year ?? ""}='' or left(ed.event_date::text,4)=${filters?.year ?? ""})
      and (${distances.length}=0 or regexp_replace(lower(ed.distance_code),'[^a-z0-9.]','','g')=any(${distances}::text[]))
      and (${!entryIds} or a.id=any(${entryIds ?? []}::integer[]))
    order by (search_name.name=any(${names.map(normalizePersonName)}::text[])) desc,ed.event_date desc,a.id desc limit 200`;
  return rows
    .flatMap((row) => {
      const match = scorePotentialResultNameMatch(
        names,
        row.name,
        {
          city: identity.city,
          clubOrTeam: identity.club,
          dateOfBirth: identity.dateOfBirth,
          nationality: identity.nationality,
        },
        {
          clubName: row.club,
          eventDate: row.date,
          category: row.category,
          ageAtRace: row.age,
          nationality: row.nationality,
        },
      );
      if (!match) return [];
      const { nationality: _nationality, age: _age, ...result } = row;
      return [{ ...result, reasons: match.reasons, score: match.score }];
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 50)
    .map(({ score: _score, ...row }) => row);
}
export async function requestArchiveMatch(
  sql: Sql,
  userId: string,
  input: { entryId: number; revision: number; note: string },
) {
  await requestArchiveMatches(sql, userId, { entries: [input], note: input.note });
  return { requested: true };
}

export async function requestArchiveMatches(
  sql: Sql,
  userId: string,
  input: { entries: { entryId: number; revision: number }[]; note: string },
) {
  if (!input.entries.length || input.entries.length > 30)
    throw new Error("Select between 1 and 30 results per review request");
  if (new Set(input.entries.map((entry) => entry.entryId)).size !== input.entries.length)
    throw new Error("Each result can only be selected once");
  if (input.note.trim().length < 12 || input.note.length > 2000)
    throw new Error("Add a short supporting note for the selected results");
  return sql.transaction(async (tx) => {
    const [user] = await tx<{
      verified: boolean;
    }>`select "emailVerified" as verified from "user" where id=${userId} for update`;
    if (!user?.verified) throw new Error("Verify your email before requesting an identity review");
    // Keep the source revisions stable until the complete selection is saved.
    await tx`select id from result_archive_entries
      where id=any(${input.entries.map((entry) => entry.entryId)}::integer[])
      order by id for share`;
    const matches = await memberArchiveMatches(
      tx,
      userId,
      undefined,
      input.entries.map((entry) => entry.entryId),
    );
    const selected = input.entries.map((entry) => {
      const match = matches.find((m) => m.id === entry.entryId && m.revision === entry.revision);
      if (!match)
        throw new Error(
          "A suggestion has changed or is no longer available to your account. Reload and review your selection.",
        );
      return match;
    });
    const [{ n }] = await tx<{
      n: number;
    }>`select count(*)::int as n from result_archive_match_requests where user_id=${userId} and created_at>now()-interval '1 day'`;
    if (n + selected.filter((match) => !match.requested).length > 30)
      throw new Error("You can request up to 30 archive reviews per day");
    const saved = await tx`insert into result_archive_match_requests(entry_id,user_id,revision,note)
      select entry_id,${userId},revision,${input.note.trim()}
      from jsonb_to_recordset(${JSON.stringify(input.entries.map((entry) => ({ entry_id: entry.entryId, revision: entry.revision })))}::jsonb)
        as selection(entry_id integer,revision integer)
      on conflict do nothing returning entry_id`;
    return { requested: selected.length, created: saved.length };
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
