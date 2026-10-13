import {
  matchingNames,
  selectedMatchingNames,
  resultSearchSchema,
  distanceSearchAliases,
  type MatchingSettings,
  type ResultSearchFilters,
} from "./result-matching-settings";
import { resultIdentityEvidence } from "./result-match";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import {
  buildPotentialMatchSearchPatterns,
  scorePotentialResultNameMatch,
  type PotentialResultMatchConfidence,
} from "./result-match";
import { ensureAthrecsSeeded } from "./seed.server";
import { sourceIdentityFromUrl } from "./profile-connections";

export type PotentialResultClaimStatus =
  "pending" | "needs_info" | "approved" | "rejected" | "withdrawn";

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
  sport: string;
  eventDate: string;
  distanceCode: string;
  finishTimeSeconds: number | null;
  overallPlace: number | null;
  bib: string | null;
  category: string | null;
  ageAtRace?: string | null;
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
  previous_names: string[] | null;
  matching_settings: MatchingSettings | null;
  date_of_birth: string | null;
  nationality: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  club_or_team: string | null;
  power_of_10_url: string | null;
  world_athletics_url: string | null;
  parkrun_id: string | null;
  athletics_urn: string | null;
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
  event_sport: string;
  event_date: string;
  distance_code: string;
  finish_time_seconds: number | null;
  overall_place: number | null;
  bib: string | null;
  category: string | null;
  age_at_race: string | null;
  nationality: string | null;
  claim_status: PotentialResultClaimStatus | null;
  owner_user_id: string | null;
  source_identifier_matches: boolean;
};

const MAX_CANDIDATE_ROWS = 1000;
const MAX_RETURNED_MATCHES = 200;

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

export const listMyPotentialResultMatches = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input?: Partial<ResultSearchFilters>) => resultSearchSchema.parse(input))
  .handler(async ({ context, data }): Promise<PotentialResultMatchesResponse> => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    const sql = await ready();
    const [identities, linkedNames] = await Promise.all([
      sql<IdentityRow>`
        select
          account_user."name" as auth_name,
          profile.full_name,
          profile.display_name,
          profile.previous_names,
          settings.settings as matching_settings, profile.date_of_birth::text as date_of_birth, profile.nationality,
          profile.power_of_10_url,
          profile.world_athletics_url,
          profile.parkrun_id,
          profile.athletics_urn,
          profile.city,
          profile.region,
          profile.country,
          profile.club_or_team
        from "user" account_user
        left join athlete_private_profiles profile on profile.user_id = account_user."id"
        left join athlete_result_matching_settings settings on settings.user_id=account_user."id"
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

    const savedNames = matchingNames(
      identity.full_name,
      identity.previous_names ?? [],
      identity.matching_settings,
      [identity.display_name, identity.auth_name, ...linkedNames.map((row) => row.athlete_name)],
    );
    const searchedNames = selectedMatchingNames(savedNames, data.name);
    const distances = distanceSearchAliases(data.distance);
    const { normalizedPatterns, rawPatterns } = buildPotentialMatchSearchPatterns(searchedNames);
    const sourceKeys = [
      identity.power_of_10_url,
      identity.world_athletics_url,
      ...(identity.matching_settings?.sourceUrls ?? []),
    ]
      .map(sourceIdentityFromUrl)
      .filter((value) => value !== null)
      .map((value) => `${value.provider}:${value.externalId}`);
    if (identity.parkrun_id && /^A?\d+$/i.test(identity.parkrun_id.trim()))
      sourceKeys.push(`parkrun:${identity.parkrun_id.trim().replace(/^a/i, "")}`);
    if (identity.athletics_urn?.trim())
      sourceKeys.push(`athleticsurn:${identity.athletics_urn.trim().toLowerCase()}`);
    if (
      !sourceKeys.length &&
      (!searchedNames.length || (!normalizedPatterns.length && !rawPatterns.length))
    ) {
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
        result.club_name as club_name,
        result.event_name as event_name,
        result.event_slug as event_slug,
        result.event_sport as event_sport,
        result.event_date as event_date,
        result.distance_code,
        result.finish_time_seconds,
        result.overall_place,
        result.bib,
        result.category, result.age_at_race,
        athlete.profile_details->>'nationality' as nationality,
        my_claim.status as claim_status,
        owner.user_id as owner_user_id,
        exists (
          select 1 from athlete_source_identities source_identity
          where source_identity.athlete_id = athlete.id
            and (source_identity.provider || ':' || source_identity.external_id) = any(${sourceKeys}::text[])
        ) as source_identifier_matches
      from athlete_claimable_results result
      join athletes athlete on athlete.id = result.athlete_id
      left join clubs club on club.id = athlete.club_id
      left join result_claims my_claim
        on my_claim.claim_key = result.id
       and my_claim.claimant_user_id = ${context.userId}
      left join athlete_account_links owner
        on owner.athlete_id = athlete.id
       and owner.status = 'active'
      where result.available
        and (${data.year}='' or left(result.event_date,4)=${data.year})
        and (${distances.length}=0 or regexp_replace(lower(result.distance_code),'[^a-z0-9.]','','g')=any(${distances}::text[]))
        and coalesce(owner.user_id, '') <> ${context.userId}
        and not exists (
          select 1 from athlete_match_dismissals dismissal
          where dismissal.user_id = ${context.userId} and dismissal.athlete_id = athlete.id
        )
        and (
          trim(regexp_replace(lower(athlete.display_name), '[^a-z0-9]+', ' ', 'g'))
            like any(${normalizedPatterns}::text[])
          or lower(athlete.display_name) like any(${rawPatterns}::text[])
          or exists (
            select 1 from athlete_source_identities source_identity
            where source_identity.athlete_id = athlete.id
              and (source_identity.provider || ':' || source_identity.external_id) = any(${sourceKeys}::text[])
          )
        )
      order by source_identifier_matches desc, result.event_date desc, result.id desc
      limit ${MAX_CANDIDATE_ROWS}
    `;

    const accountContext = {
      city: identity.city,
      region: identity.region,
      country: identity.country,
      clubOrTeam: identity.club_or_team,
      dateOfBirth: identity.date_of_birth,
      nationality: identity.nationality,
    };

    const matches = rows
      .map((row): PotentialResultMatch | null => {
        const candidateContext = {
          city: row.athlete_city,
          region: row.athlete_region,
          country: row.athlete_country,
          clubName: row.club_name,
          eventDate: row.event_date,
          ageAtRace: row.age_at_race,
          category: row.category,
          nationality: row.nationality,
        };
        const evidence = resultIdentityEvidence(accountContext, candidateContext);
        const match = row.source_identifier_matches
          ? {
              score: 100 + evidence.boost,
              confidence: evidence.conflict ? ("possible" as const) : ("strong" as const),
              matchedName: row.athlete_name,
              reasons: [
                "Matches a source athlete identifier saved in your account",
                ...evidence.reasons,
              ],
            }
          : scorePotentialResultNameMatch(
              searchedNames,
              row.athlete_name,
              accountContext,
              candidateContext,
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
          sport: row.event_sport,
          eventDate: row.event_date,
          distanceCode: row.distance_code,
          finishTimeSeconds: row.finish_time_seconds,
          overallPlace: row.overall_place,
          bib: row.bib,
          category: row.category,
          ageAtRace: row.age_at_race,
          confidence: match.confidence,
          score: match.score,
          reasons: match.reasons,
          matchedAccountName: match.matchedName,
          claimStatus: row.claim_status,
          ownedByAnotherAccount: Boolean(row.owner_user_id && row.owner_user_id !== context.userId),
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
      truncated: rows.length === MAX_CANDIDATE_ROWS || matches.length > MAX_RETURNED_MATCHES,
    };
  });
