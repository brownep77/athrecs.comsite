import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  buildPotentialMatchSearchPatterns,
  scorePotentialResultNameMatch,
  uniquePotentialMatchNames,
  type PotentialResultMatchConfidence,
} from "./result-match";
import { ensureAthrecsSeeded } from "./seed.server";

export type PotentialResultClaimStatus =
  | "pending"
  | "needs_info"
  | "approved"
  | "rejected"
  | "withdrawn";

export type PotentialResultMatch = {
  resultId: number;
  athleteId: number;
  athleteName: string;
  athleteSlug: string;
  athleteCity: string;
  athleteRegion: string;
  athleteCountry: string;
  clubName: string;
  eventName: string;
  eventSlug: string;
  eventDate: string;
  distanceCode: string;
  finishTimeSeconds: number | null;
  overallPlace: number | null;
  bib: string | null;
  category: string | null;
  confidence: PotentialResultMatchConfidence;
  score: number;
  reasons: string[];
  matchedAccountName: string;
  claimStatus: PotentialResultClaimStatus | null;
  ownedByAnotherAccount: boolean;
};

export type PotentialResultMatchesResponse = {
  searchedNames: string[];
  matches: PotentialResultMatch[];
  totalMatches: number;
  truncated: boolean;
};

type IdentityRow = {
  auth_name: string;
  full_name: string | null;
  display_name: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  club_or_team: string | null;
};

type CandidateRow = {
  result_id: number;
  athlete_id: number;
  athlete_name: string;
  athlete_slug: string;
  athlete_city: string | null;
  athlete_region: string | null;
  athlete_country: string | null;
  club_name: string | null;
  event_name: string;
  event_slug: string;
  event_date: string;
  distance_code: string;
  finish_time_seconds: number | null;
  overall_place: number | null;
  bib: string | null;
  category: string | null;
  claim_status: PotentialResultClaimStatus | null;
  owner_user_id: string | null;
};

const MAX_CANDIDATE_ROWS = 1000;
const MAX_RETURNED_MATCHES = 200;

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

export const listMyPotentialResultMatches = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<PotentialResultMatchesResponse> => {
    const sql = await ready();
    const [identities, linkedNames] = await Promise.all([
      sql<IdentityRow>`
        select
          account_user."name" as auth_name,
          profile.full_name,
          profile.display_name,
          profile.city,
          profile.region,
          profile.country,
          profile.club_or_team
        from "user" account_user
        left join athlete_private_profiles profile on profile.user_id = account_user."id"
        where account_user."id" = ${context.userId}
        limit 1
      `,
      sql<{ athlete_name: string }>`
        select athlete.display_name as athlete_name
        from athlete_account_links account_link
        join athletes athlete on athlete.id = account_link.athlete_id
        where account_link.user_id = ${context.userId}
          and account_link.status = 'active'
      `,
    ]);

    const identity = identities[0];
    if (!identity) {
      return { searchedNames: [], matches: [], totalMatches: 0, truncated: false };
    }

    const searchedNames = uniquePotentialMatchNames([
      identity.full_name,
      identity.display_name,
      identity.auth_name,
      ...linkedNames.map((row) => row.athlete_name),
    ]);
    const { normalizedPatterns, rawPatterns } = buildPotentialMatchSearchPatterns(searchedNames);
    if (!searchedNames.length || (!normalizedPatterns.length && !rawPatterns.length)) {
      return { searchedNames, matches: [], totalMatches: 0, truncated: false };
    }

    const rows = await sql<CandidateRow>`
      select
        result.id as result_id,
        athlete.id as athlete_id,
        athlete.display_name as athlete_name,
        athlete.slug as athlete_slug,
        athlete.city as athlete_city,
        athlete.county as athlete_region,
        athlete.country as athlete_country,
        club.name as club_name,
        event.name as event_name,
        event.slug as event_slug,
        edition.event_date::text as event_date,
        edition.distance_code,
        result.finish_time_seconds,
        result.overall_place,
        result.bib,
        result.category,
        my_claim.status as claim_status,
        owner.user_id as owner_user_id
      from results result
      join athletes athlete on athlete.id = result.athlete_id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      left join clubs club on club.id = athlete.club_id
      left join result_claims my_claim
        on my_claim.result_id = result.id
       and my_claim.claimant_user_id = ${context.userId}
      left join athlete_account_links owner
        on owner.athlete_id = athlete.id
       and owner.status = 'active'
      where result.status = 'finished'
        and coalesce(owner.user_id, '') <> ${context.userId}
        and (
          trim(regexp_replace(lower(athlete.display_name), '[^a-z0-9]+', ' ', 'g'))
            like any(${normalizedPatterns}::text[])
          or lower(athlete.display_name) like any(${rawPatterns}::text[])
        )
      order by edition.event_date desc, result.id desc
      limit ${MAX_CANDIDATE_ROWS}
    `;

    const accountContext = {
      city: identity.city,
      region: identity.region,
      country: identity.country,
      clubOrTeam: identity.club_or_team,
    };

    const matches = rows
      .map((row): PotentialResultMatch | null => {
        const match = scorePotentialResultNameMatch(
          searchedNames,
          row.athlete_name,
          accountContext,
          {
            city: row.athlete_city,
            region: row.athlete_region,
            country: row.athlete_country,
            clubName: row.club_name,
          },
        );
        if (!match) return null;
        return {
          resultId: row.result_id,
          athleteId: row.athlete_id,
          athleteName: row.athlete_name,
          athleteSlug: row.athlete_slug,
          athleteCity: row.athlete_city ?? "",
          athleteRegion: row.athlete_region ?? "",
          athleteCountry: row.athlete_country ?? "",
          clubName: row.club_name ?? "",
          eventName: row.event_name,
          eventSlug: row.event_slug,
          eventDate: row.event_date,
          distanceCode: row.distance_code,
          finishTimeSeconds: row.finish_time_seconds,
          overallPlace: row.overall_place,
          bib: row.bib,
          category: row.category,
          confidence: match.confidence,
          score: match.score,
          reasons: match.reasons,
          matchedAccountName: match.matchedName,
          claimStatus: row.claim_status,
          ownedByAnotherAccount: Boolean(
            row.owner_user_id && row.owner_user_id !== context.userId,
          ),
        };
      })
      .filter((match): match is PotentialResultMatch => Boolean(match))
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        if (right.eventDate !== left.eventDate) {
          return right.eventDate.localeCompare(left.eventDate);
        }
        return right.resultId - left.resultId;
      });

    return {
      searchedNames,
      matches: matches.slice(0, MAX_RETURNED_MATCHES),
      totalMatches: matches.length,
      truncated:
        rows.length === MAX_CANDIDATE_ROWS || matches.length > MAX_RETURNED_MATCHES,
    };
  });
