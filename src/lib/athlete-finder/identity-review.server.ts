import type { Sql } from "../db";
import {
  identityCandidateQuery,
  identityCandidateReasons,
  identityNormal,
  identityReviewSchema,
  stringNames,
  type IdentityClub,
  type IdentityCandidate,
  type IdentityReview,
  type IdentityReviewInput,
} from "./identity-review.ts";

const LIMIT = 200;
// These expressions match the existing finder name index and the alias index migration.
const vector = (value: string) =>
  `to_tsvector('simple',regexp_replace(normalize(left(${value},2000),NFKC),'[^[:alnum:]]+',' ','g'))`;
export const identityCandidatesSql = `select a.id,a.display_name as name,a.slug,
  a.profile_visibility as visibility,a.source_club_name as "sourceClub",
  a.source_second_club_name as "secondClub",a.club_id as "clubId",a.second_club_id as "secondClubId",
  a.profile_details->'aliases' as aliases,a.profile_details->'clubHistory' as "clubHistory",
  exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as managed
  from athletes a where a.profile_details#>>'{nameReview,mode}' is distinct from 'merged_source_entry' and (
    ${vector("coalesce(a.display_name,'')")} @@ to_tsquery('simple',$1)
    or ${vector("coalesce(a.profile_details->'aliases','[]'::jsonb)::text")} @@ to_tsquery('simple',$1))
  order by a.id limit ${LIMIT + 1}`;

/** Staff-only, bounded read-only review. Never assigns identities or changes a result. */
export async function reviewAthleteIdentities(
  sql: Sql,
  input: IdentityReviewInput,
): Promise<IdentityReview> {
  const data = identityReviewSchema.parse(input),
    names = [data.name, ...data.aliases];
  const query = identityCandidateQuery(names);
  if (!query)
    return {
      candidates: [],
      truncated: false,
      message: "Enter a given name or initial and a surname to check possible profiles.",
    };
  return sql.transaction(async (tx) => {
    await tx.query("set transaction read only");
    await tx.query("set local statement_timeout = '7000ms'");
    await tx.query("set local lock_timeout = '1000ms'");
    const profiles = await tx.query<{
      id: number;
      name: string;
      slug: string;
      visibility: string;
      managed: boolean;
      sourceClub: string | null;
      secondClub: string | null;
      clubId: number | null;
      secondClubId: number | null;
      aliases: unknown;
      clubHistory: unknown;
    }>(identityCandidatesSql, [query]);
    const shortlisted = profiles
      .slice(0, LIMIT)
      .map((p) => ({
        ...p,
        aliases: stringNames(p.aliases),
        reasons: identityCandidateReasons(names, { name: p.name, aliases: stringNames(p.aliases) }),
      }))
      .filter((p) => p.reasons.length);
    const ids = shortlisted.map((p) => p.id);
    const clubs = ids.length
      ? await tx.query<{
          athleteId: number;
          name: string;
          relationship: string;
        }>(
          `select ac.athlete_id as "athleteId",coalesce(c.name,ac.source_name) as name,ac.relationship
      from athlete_clubs ac left join clubs c on c.id=ac.club_id where ac.athlete_id=any($1::integer[])
      union all select a.id,c.name,'profile' from athletes a join clubs c
        on c.id=a.club_id or c.id=a.second_club_id where a.id=any($1::integer[])`,
          [ids],
        )
      : [];
    const candidates: IdentityCandidate[] = shortlisted.map((p) => {
      const recorded: IdentityClub[] = [];
      const add = (name: unknown, relationship: IdentityClub["relationship"]) => {
        if (typeof name !== "string" || !name.trim() || name.length > 200) return;
        if (!recorded.some((c) => identityNormal(c.name) === identityNormal(name)))
          recorded.push({ name, relationship });
      };
      add(p.sourceClub, "profile");
      add(p.secondClub, "profile");
      for (const c of clubs.filter((c) => c.athleteId === p.id))
        add(c.name, c.relationship === "historical" ? "historical" : "recorded");
      if (Array.isArray(p.clubHistory))
        for (const c of p.clubHistory.slice(0, 30))
          if (c && typeof c === "object") add(c.name, "historical");
      const matching = data.club
        ? recorded.find((c) => identityNormal(c.name) === identityNormal(data.club))
        : null;
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        visibility: p.visibility,
        managed: p.managed,
        aliases: p.aliases,
        clubs: recorded,
        reasons: p.reasons,
        clubMatch: matching
          ? `${matching.relationship === "historical" ? "Historical" : "Recorded"} club matches: ${matching.name}`
          : null,
        weak: p.reasons.every((r) => r === "Same first initial only" || r === "Initial-only name"),
      };
    });
    candidates.sort(
      (a, b) =>
        Number(a.weak) - Number(b.weak) ||
        Number(Boolean(b.clubMatch)) - Number(Boolean(a.clubMatch)) ||
        a.id - b.id,
    );
    return {
      candidates,
      truncated: profiles.length > LIMIT,
      message:
        profiles.length > LIMIT
          ? "Only the first 200 indexed candidates were checked. This is not a complete duplicate review; use more distinctive racing names."
          : null,
    };
  });
}
