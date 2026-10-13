import { requireClaimIdentity } from "./claim-identity.server";
import { matchingNames, type MatchingSettings } from "./result-matching-settings";
import { deliverProfileResultReceipts } from "./profile-result-receipts.server";
import { profileResultReviewInput, type ProfileResultReviewInput } from "./profile-result-review";
import {
  loadProfileResultReview,
  publicReview,
  saveProfileResultReview,
} from "./profile-result-review.server";
import { privateClaimMiddleware } from "./claim-invitations-api";
import { invitationToken } from "./claim-invitation";
import { validateInvitation, assertInvitationWrites } from "./claim-invitations.server";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql } from "@/lib/db";
import { syncAthleteAccountAfterClaim } from "./athlete-account-api";
import {
  notifyResultClaimReviewed,
  notifyResultClaimSubmitted,
  notifyResultClaimWithdrawn,
} from "./result-claim-email.server";
import { resultIdentityEvidence, scorePotentialResultNameMatch } from "./result-match";
import { sourceIdentityFromUrl } from "./profile-connections";
import { ensureAthrecsSeeded } from "./seed.server";
import { queueClaimConflict, deliverClaimConflictAlerts } from "./result-claim-alerts.server";

export type ResultClaimStatus = "pending" | "needs_info" | "approved" | "rejected" | "withdrawn";
export type ClaimConfirmationMethod = "unrecorded" | "athlete" | "staff";

export type ResultClaimVerificationMethod =
  "bib" | "official_email" | "club_confirmation" | "other";

export type ClaimableResult = {
  resultId: number;
  athleteId: number;
  athleteSlug: string;
  athleteName: string;
  eventName: string;
  eventSlug: string;
  sport: string;
  eventDate: string;
  distanceCode: string;
  finishTimeSeconds: number | null;
  overallPlace: number | null;
  bib: string | null;
  category: string | null;
  sourceUrl: string | null;
  clubName?: string | null;
  ageAtRace?: string | null;
  chipTimeSeconds?: number | null;
  gunTimeSeconds?: number | null;
  genderPlace?: number | null;
  categoryPlace?: number | null;
};

export type ResultClaimListItem = ClaimableResult & {
  claimId: number;
  claimantEmail: string;
  status: ResultClaimStatus;
  confirmationMethod: ClaimConfirmationMethod;
  confirmedAt: string | null;
  claimantRole: "athlete" | "guardian";
  verificationMethod: ResultClaimVerificationMethod;
  evidenceText: string;
  evidenceUrl: string | null;
  evidenceUrl2: string | null;
  evidenceUrl3: string | null;
  conflictReason: string | null;
  staffNote: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  existingOwnerEmail?: string | null;
  competingClaimCount?: number;
};

type ClaimRow = {
  claim_id: number;
  claimant_email: string;
  claim_status: ResultClaimStatus;
  confirmation_method: ClaimConfirmationMethod;
  confirmed_at: string | null;
  claimant_role: "athlete" | "guardian";
  verification_method: ResultClaimVerificationMethod;
  evidence_text: string;
  evidence_url: string | null;
  evidence_url_2: string | null;
  evidence_url_3: string | null;
  conflict_reason: string | null;
  staff_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  result_id: number;
  athlete_id: number;
  athlete_slug: string;
  athlete_name: string;
  event_name: string;
  event_slug: string;
  event_sport: string;
  event_date: string;
  distance_code: string;
  finish_time_seconds: number | null;
  overall_place: number | null;
  bib: string | null;
  category: string | null;
  source_url: string | null;
  age_at_race: string | null;
  chip_time_seconds: number | null;
  gun_time_seconds: number | null;
  gender_place: number | null;
  category_place: number | null;
  club_name: string | null;
  existing_owner_email?: string | null;
  competing_claim_count?: number;
};

type ClaimEmailRow = {
  claim_id: number;
  result_id: number;
  claimant_email: string;
  athlete_name: string;
  event_name: string;
  event_date: string;
  distance_code: string;
};

async function ready() {
  await ensureAthrecsSeeded();
  return getSql();
}

// Every ownership operation locks the athlete before any claim or owner row.
// Locking a whole joined claim first can deadlock with another review that
// holds the athlete and is closing the remaining competing claims.
async function lockClaimAthlete(
  sql: Awaited<ReturnType<typeof getSql>>,
  claimId: number,
  claimantUserId?: string,
): Promise<number | null> {
  const rows = await sql<{ id: number }>`
    select athlete.id from athletes athlete
    join result_claims claim on claim.athlete_id = athlete.id
    where claim.id = ${claimId}
      and (${claimantUserId ?? null}::text is null
        or claim.claimant_user_id = ${claimantUserId ?? null})
    for update of athlete
  `;
  return rows[0]?.id ?? null;
}

function positiveInteger(value: unknown, label: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${label} is invalid`);
  return parsed;
}

function resultIdentifier(value: unknown): number {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id === 0 || Math.abs(id) > 2147483647)
    throw new Error("Result is invalid");
  return id;
}

function optionalHttpsUrl(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new Error("Evidence link must be a valid HTTPS URL");
  }
  if (url.protocol !== "https:") throw new Error("Evidence link must use HTTPS");
  if (url.username || url.password) throw new Error("Evidence link cannot contain credentials");
  return url.toString();
}

function shortText(value: unknown, max: number, label: string): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (text.length > max) throw new Error(`${label} must be ${max} characters or fewer`);
  return text;
}

function reviewAction(value: unknown): "approve" | "reject" | "needs_info" {
  if (value === "approve" || value === "reject" || value === "needs_info") return value;
  throw new Error("Review action is invalid");
}

function mapClaim(row: ClaimRow): ResultClaimListItem {
  return {
    claimId: row.claim_id,
    resultId: row.result_id,
    athleteId: row.athlete_id,
    athleteSlug: row.athlete_slug,
    athleteName: row.athlete_name,
    eventName: row.event_name,
    eventSlug: row.event_slug,
    sport: row.event_sport,
    eventDate: row.event_date,
    distanceCode: row.distance_code,
    finishTimeSeconds: row.finish_time_seconds,
    overallPlace: row.overall_place,
    bib: row.bib,
    category: row.category,
    sourceUrl: row.source_url,
    clubName: row.club_name,
    ageAtRace: row.age_at_race,
    chipTimeSeconds: row.chip_time_seconds,
    gunTimeSeconds: row.gun_time_seconds,
    genderPlace: row.gender_place,
    categoryPlace: row.category_place,
    claimantEmail: row.claimant_email,
    status: row.claim_status,
    confirmationMethod: row.confirmation_method,
    confirmedAt: row.confirmed_at,
    claimantRole: row.claimant_role,
    verificationMethod: row.verification_method,
    evidenceText: row.evidence_text,
    evidenceUrl: row.evidence_url,
    evidenceUrl2: row.evidence_url_2,
    evidenceUrl3: row.evidence_url_3,
    conflictReason: row.conflict_reason,
    staffNote: row.staff_note,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    existingOwnerEmail: row.existing_owner_email,
    competingClaimCount: row.competing_claim_count,
  };
}

const CLAIM_SELECT = `
  select
    claim.id as claim_id,
    claim.claimant_email,
    claim.status as claim_status,
    claim.confirmation_method,
    claim.confirmed_at::text as confirmed_at,
    claim.claimant_role,
    claim.verification_method,
    claim.evidence_text,
    claim.evidence_url,
    claim.evidence_url_2,
    claim.evidence_url_3,
    claim.conflict_reason,
    claim.staff_note,
    claim.submitted_at::text as submitted_at,
    claim.reviewed_at::text as reviewed_at,
    result.id as result_id,
    athlete.id as athlete_id,
    athlete.slug as athlete_slug,
    athlete.display_name as athlete_name,
    result.event_name as event_name,
    result.event_slug as event_slug,
    result.event_sport as event_sport,
    result.event_date as event_date,
    result.distance_code,
    result.finish_time_seconds,
    result.overall_place,
    result.bib,
    result.category,
    result.source_url, result.club_name, result.age_at_race,
    result.chip_time_seconds, result.gun_time_seconds, result.gender_place, result.category_place
  from result_claims claim
  join athlete_claimable_results result on result.id = claim.claim_key
  join athletes athlete on athlete.id = claim.athlete_id
`;

type ClaimCandidateIdentity = {
  resultId: number;
  athleteId: number;
  athleteName: string;
  city: string | null;
  region: string | null;
  country: string | null;
  clubName: string | null;
};

async function canAccessClaimCandidate(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  candidate: ClaimCandidateIdentity,
): Promise<boolean> {
  const [testAccess] = await sql<{
    allowed: boolean;
  }>`select athrecs_test_access(${userId},${candidate.athleteId}) as allowed`;
  if (!testAccess?.allowed) return false;
  const accessRows = await sql<{ allowed: boolean }>`
    select (
      exists (
        select 1 from athlete_account_links account_link
        where account_link.athlete_id = ${candidate.athleteId}
          and account_link.user_id = ${userId}
          and account_link.status = 'active'
      )
      or exists (
        select 1 from result_claims claim
        where claim.claim_key = ${candidate.resultId}
          and claim.claimant_user_id = ${userId}
      )
    ) as allowed
  `;
  if (accessRows[0]?.allowed) return true;

  const [identities, linkedNames] = await Promise.all([
    sql<{
      auth_name: string;
      full_name: string | null;
      display_name: string | null;
      previous_names: string[] | null;
      matching_settings: MatchingSettings | null;
      power_of_10_url: string | null;
      world_athletics_url: string | null;
      parkrun_id: string | null;
      athletics_urn: string | null;
      city: string | null;
      region: string | null;
      country: string | null;
      club_or_team: string | null;
    }>`
      select
        account_user."name" as auth_name,
        profile.full_name,
        profile.display_name,
        profile.previous_names,
        settings.settings as matching_settings,
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
      where account_user."id" = ${userId}
      limit 1
    `,
    sql<{ athlete_name: string }>`
      select athlete.display_name as athlete_name
      from athlete_account_links account_link
      join athletes athlete on athlete.id = account_link.athlete_id
      where account_link.user_id = ${userId}
        and account_link.status = 'active'
    `,
  ]);

  const identity = identities[0];
  if (!identity) return false;
  // Use the same source-identity evidence as the suggestion list. A result
  // still requires an explicit claim, and competing owners still require review.
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
  if (sourceKeys.length) {
    const sourceMatches = await sql<{ allowed: boolean }>`
      select exists (
        select 1 from athlete_source_identities source_identity
        where source_identity.athlete_id = ${candidate.athleteId}
          and (source_identity.provider || ':' || source_identity.external_id) = any(${sourceKeys}::text[])
      ) as allowed
    `;
    if (sourceMatches[0]?.allowed) return true;
  }
  const names = matchingNames(
    identity.full_name,
    identity.previous_names ?? [],
    identity.matching_settings,
    [identity.display_name, identity.auth_name, ...linkedNames.map((row) => row.athlete_name)],
  );
  return Boolean(
    scorePotentialResultNameMatch(
      names,
      candidate.athleteName,
      {
        city: identity.city,
        region: identity.region,
        country: identity.country,
        clubOrTeam: identity.club_or_team,
      },
      {
        city: candidate.city,
        region: candidate.region,
        country: candidate.country,
        clubName: candidate.clubName,
      },
    ),
  );
}

export const getClaimableResult = createServerFn({ method: "GET" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .validator((input: { resultId: number; invitation?: string; includeReview?: boolean }) => ({
    resultId: resultIdentifier(input?.resultId),
    includeReview: input?.includeReview === true,
    invitation: invitationToken.optional().parse(input?.invitation),
  }))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const rows = await sql<{
      synthetic_test: boolean;
      result_id: number;
      athlete_id: number;
      athlete_slug: string;
      athlete_name: string;
      event_name: string;
      event_slug: string;
      event_sport: string;
      event_date: string;
      distance_code: string;
      finish_time_seconds: number | null;
      overall_place: number | null;
      bib: string | null;
      category: string | null;
      source_url: string | null;
      age_at_race: string | null;
      chip_time_seconds: number | null;
      gun_time_seconds: number | null;
      gender_place: number | null;
      category_place: number | null;
      athlete_city: string | null;
      athlete_region: string | null;
      athlete_country: string | null;
      club_name: string | null;
    }>`
      select
        result.result_details->>'syntheticTest'='true' as synthetic_test,
        result.id as result_id,
        athlete.id as athlete_id,
        athlete.slug as athlete_slug,
        athlete.display_name as athlete_name,
        result.event_name as event_name,
        result.event_slug as event_slug,
        result.event_sport as event_sport,
        result.event_date as event_date,
        result.distance_code,
        result.finish_time_seconds,
        result.overall_place,
        result.bib,
        result.category,
        result.source_url, result.age_at_race,
        result.chip_time_seconds, result.gun_time_seconds, result.gender_place, result.category_place,
        athlete.city as athlete_city,
        athlete.county as athlete_region,
        athlete.country as athlete_country,
        result.club_name as club_name
      from athlete_claimable_results result
      join athletes athlete on athlete.id = result.athlete_id
      left join clubs club on club.id = athlete.club_id
      where result.id = ${data.resultId} and result.available
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const allowed = data.invitation
      ? Boolean(
          await validateInvitation(
            sql,
            data.invitation,
            context.userId,
            row.result_id,
            row.athlete_id,
          ),
        )
      : await canAccessClaimCandidate(sql, context.userId, {
          resultId: row.result_id,
          athleteId: row.athlete_id,
          athleteName: row.athlete_name,
          city: row.athlete_city,
          region: row.athlete_region,
          country: row.athlete_country,
          clubName: row.club_name,
        });
    if (!allowed) return null;
    const [account] = await sql<{
      verified: boolean;
    }>`select "emailVerified" as verified from "user" where id=${context.userId}`;
    if (!account?.verified) return null;
    return {
      syntheticTest: row.synthetic_test === true,
      review: data.includeReview
        ? publicReview(await loadProfileResultReview(sql, context.userId, row.athlete_id))
        : null,
      resultId: row.result_id,
      athleteId: row.athlete_id,
      athleteSlug: row.athlete_slug,
      athleteName: row.athlete_name,
      eventName: row.event_name,
      eventSlug: row.event_slug,
      sport: row.event_sport,
      eventDate: row.event_date,
      distanceCode: row.distance_code,
      finishTimeSeconds: row.finish_time_seconds,
      overallPlace: row.overall_place,
      bib: row.bib,
      category: row.category,
      sourceUrl: null,
      clubName: row.club_name,
      ageAtRace: row.age_at_race,
      chipTimeSeconds: row.chip_time_seconds,
      gunTimeSeconds: row.gun_time_seconds,
      genderPlace: row.gender_place,
      categoryPlace: row.category_place,
    };
  });

// This checks eligibility for self-confirmation, not proof of identity. Run
// under the athlete lock; client-supplied names, status or URLs cannot skip it.
async function selfConfirmationReviewReason(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  athleteId: number,
  athleteName: string,
  claimantRole: "athlete" | "guardian",
): Promise<string | null> {
  const [identity] = await sql<{
    name: string;
    full_name: string | null;
    display_name: string | null;
    previous_names: string[] | null;
    matching_settings: MatchingSettings | null;
    date_of_birth: string | null;
    child_review: boolean;
    protected_profile: boolean;
    revoked: boolean;
    guardian_claim: boolean;
    dob_mismatch: boolean;
  }>`
    select account_user.name, profile.full_name, profile.display_name, profile.previous_names,
      settings.settings as matching_settings, profile.date_of_birth::text as date_of_birth,
      (
        athlete.date_of_birth > current_date - interval '18 years'
        or profile.date_of_birth > current_date - interval '18 years'
        or exists (
          select 1 from athlete_claimable_results r
          where r.athlete_id = athlete.id and r.available
            and r.event_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
            and r.event_date >= to_char(current_date - interval '18 months', 'YYYY-MM-DD')
            and upper(regexp_replace(coalesce(r.category, ''), '[^A-Za-z0-9]', '', 'g'))
              ~ '^(J[MWF]|JU|[MWF]?U[0-9]|UNDER[0-9]|JUNIOR|JUVENILE)'
        )
        or exists (
          select 1 from athlete_source_histories h
          cross join lateral jsonb_array_elements(h.performances) p
          where h.athlete_id = athlete.id
            and coalesce(p->>'year', '') ~ '^[0-9]{4}$'
            and coalesce(p->>'year', '') >= to_char(current_date - interval '2 years', 'YYYY')
            and upper(regexp_replace(coalesce(p->>'ageGroup', ''), '[^A-Za-z0-9]', '', 'g'))
              ~ '^(J[MWF]|JU|[MWF]?U[0-9]|UNDER[0-9]|JUNIOR|JUVENILE)'
        )
      ) as child_review,
      athlete.profile_type = 'Public figure' as protected_profile,
      exists (select 1 from athlete_account_links link
        where link.athlete_id = athlete.id and link.status = 'revoked') as revoked,
      exists (select 1 from result_claims claim where claim.athlete_id = athlete.id
        and claim.claimant_user_id = ${userId} and claim.claimant_role = 'guardian') as guardian_claim,
      (athlete.date_of_birth is not null and profile.date_of_birth is not null
        and athlete.date_of_birth <> profile.date_of_birth) as dob_mismatch
    from "user" account_user
    cross join athletes athlete
    left join athlete_private_profiles profile on profile.user_id = account_user.id
    left join athlete_result_matching_settings settings on settings.user_id=account_user.id
    where account_user.id = ${userId} and athlete.id = ${athleteId}
  `;
  if (claimantRole === "guardian" || identity?.child_review || identity?.guardian_claim)
    return "Child or guardian claim: staff must confirm the responsible adult's authority and consent privately before linking this profile. Do not post a child's ID or personal documents in public links.";
  if (identity?.revoked)
    return "This profile has a revoked ownership link. Staff must review before it can be linked again.";
  if (identity?.protected_profile)
    return "This public-figure profile requires a staff ownership check.";
  if (identity?.dob_mismatch)
    return "Account and athlete details differ. Staff must resolve the discrepancy before linking this profile.";
  const raceAges = await sql<{ event_date: string; category: string; age_at_race: string }>`
    select event_date,category,age_at_race from athlete_claimable_results
    where athlete_id=${athleteId} and available`;
  if (
    raceAges.some(
      (race) =>
        resultIdentityEvidence(
          { dateOfBirth: identity?.date_of_birth },
          { eventDate: race.event_date, category: race.category, ageAtRace: race.age_at_race },
        ).conflict,
    )
  )
    return "Saved birth date and a recorded race age/category differ. Staff must check the source and organiser's age rules before linking this profile.";
  const nameMatch =
    identity &&
    scorePotentialResultNameMatch(
      matchingNames(identity.full_name, identity.previous_names ?? [], identity.matching_settings, [
        identity.name,
        identity.display_name,
      ]),
      athleteName,
      {},
      {},
    );
  if (!nameMatch || nameMatch.confidence === "possible")
    return "The account and athlete names need clarification. Staff must check the connection before linking this profile.";
  return null;
}

export const submitResultClaim = createServerFn({ method: "POST" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .validator(
    (input: {
      resultId: number;
      invitation?: string;
      evidenceUrl?: string;
      evidenceUrl2?: string;
      evidenceUrl3?: string;
      declarationAccepted: boolean;
      claimantRole?: "athlete" | "guardian";
      review?: ProfileResultReviewInput;
    }) => ({
      resultId: resultIdentifier(input?.resultId),
      invitation: invitationToken.optional().parse(input?.invitation),
      verificationMethod: "other" as ResultClaimVerificationMethod,
      evidenceText: "",
      evidenceUrl: optionalHttpsUrl(input?.evidenceUrl),
      evidenceUrl2: optionalHttpsUrl(input?.evidenceUrl2),
      evidenceUrl3: optionalHttpsUrl(input?.evidenceUrl3),
      declarationAccepted: input?.declarationAccepted === true,
      claimantRole:
        input?.claimantRole === "guardian" ? ("guardian" as const) : ("athlete" as const),
      review:
        input?.review === undefined ? undefined : profileResultReviewInput.parse(input.review),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.declarationAccepted) throw new Error("Confirm that this is your result");
    if (data.invitation) assertInvitationWrites();

    const sql = await ready();
    const outcome = await sql.transaction(async (tx) => {
      const users = await tx<{ email: string; email_verified: boolean }>`
        select "email" as email, "emailVerified" as email_verified
        from "user" where "id" = ${context.userId} limit 1`;
      const claimantEmail = users[0]?.email?.trim().toLowerCase();
      if (!claimantEmail) throw new Error("Your signed-in account has no email address");
      if (!users[0].email_verified)
        throw new Error("Verify your email before claiming athlete results");

      await requireClaimIdentity(tx, context.userId);

      const results = await tx<{
        result_id: number;
        athlete_id: number;
        athlete_name: string;
        event_name: string;
        event_date: string;
        distance_code: string;
        athlete_city: string | null;
        athlete_region: string | null;
        athlete_country: string | null;
        club_name: string | null;
      }>`
        select
          result.id as result_id,
          result.athlete_id,
          athlete.display_name as athlete_name,
          result.event_name as event_name,
          result.event_date as event_date,
          result.distance_code,
          athlete.city as athlete_city,
          athlete.county as athlete_region,
          athlete.country as athlete_country,
          result.club_name as club_name
        from athlete_claimable_results result
        join athletes athlete on athlete.id = result.athlete_id
        left join clubs club on club.id = athlete.club_id
        where result.id = ${data.resultId} and result.available
        limit 1
      `;
      const result = results[0];
      if (!result) throw new Error("Result not found");
      // Keep athlete-before-invitation lock order consistent with staff review.
      await tx`select id from athletes where id=${result.athlete_id} for update`;
      const invitation = data.invitation
        ? await validateInvitation(
            tx,
            data.invitation,
            context.userId,
            result.result_id,
            result.athlete_id,
            true,
          )
        : null;
      if (invitation?.claim_id && !data.review) {
        const [claim] = await tx<{
          status: ResultClaimStatus;
        }>`select status from result_claims where id=${invitation.claim_id} and claimant_user_id=${context.userId}`;
        if (!claim) throw new Error("This invitation has already been used. Check your claims.");
        return {
          status: claim.status,
          alreadyOwned: false,
          claimId: invitation.claim_id,
          claimantUserId: context.userId,
          email: null,
          isConflict: false,
          summary: null,
        };
      }
      const allowed =
        invitation ||
        (await canAccessClaimCandidate(tx, context.userId, {
          resultId: result.result_id,
          athleteId: result.athlete_id,
          athleteName: result.athlete_name,
          city: result.athlete_city,
          region: result.athlete_region,
          country: result.athlete_country,
          clubName: result.club_name,
        }));
      if (!allowed) throw new Error("Result not available to this account");

      // Serialise submissions for this athlete so simultaneous claims retain
      // consistent conflict detection and one claim per account/result.
      await tx`
        select id from athletes
        where id = ${result.athlete_id}
        for update
      `;

      const owners = await tx<{
        user_id: string;
        user_email: string;
        source_claim_id: number | null;
      }>`
        select user_id, user_email, source_claim_id
        from athlete_account_links
        where athlete_id = ${result.athlete_id} and status = 'active'
        limit 1
      `;
      const owner = owners[0];
      const summary = data.review
        ? await saveProfileResultReview(
            tx,
            context.userId,
            result.athlete_id,
            data.review,
            data.claimantRole,
          )
        : null;
      if (summary && !summary.reused)
        await tx`update athlete_profile_result_confirmations
        set email_payload=jsonb_set(email_payload,'{resultId}',to_jsonb(${result.result_id}::integer)) where id=${summary.id}::uuid`;
      const summaryEmail = {
        resultId: result.result_id,
        claimantEmail,
        athleteName: result.athlete_name,
      };
      if (owner?.user_id === context.userId) {
        if (summary && !summary.reused)
          await tx`update athlete_profile_result_confirmations set claim_id=${owner.source_claim_id} where id=${summary.id}::uuid`;
        return {
          status: "approved" as const,
          alreadyOwned: true,
          summary: summary ? { ...summary, ...summaryEmail } : null,
          claimId: owner.source_claim_id,
          claimantUserId: context.userId,
          email: null,
          isConflict: false,
        };
      }

      const existing = await tx<{
        id: number;
        status: ResultClaimStatus;
        reviewed_by_user_id: string | null;
      }>`
        select id, status, reviewed_by_user_id
        from result_claims
        where (claim_key = ${result.result_id} or (${Boolean(data.review)} and athlete_id=${result.athlete_id} and status in ('pending','needs_info')))
          and claimant_user_id = ${context.userId}
        order by (claim_key=${result.result_id}) desc,id
        limit 1
        for update
      `;

      if (summary?.reused) {
        const [saved] = await tx<{
          status: ResultClaimStatus;
        }>`select status from result_claims where id=${summary.claimId} and claimant_user_id=${context.userId}`;
        return {
          status: saved?.status ?? existing[0]?.status ?? ("pending" as const),
          alreadyOwned: false,
          claimId: summary.claimId,
          claimantUserId: context.userId,
          email: null,
          isConflict: false,
          summary: { ...summary, ...summaryEmail },
        };
      }
      const competing = await tx<{ other_claim_count: number }>`
        select count(distinct claimant_user_id)::int as other_claim_count
        from result_claims
        where athlete_id = ${result.athlete_id}
          and claimant_user_id <> ${context.userId}
          and status in ('pending', 'needs_info', 'approved')
      `;
      const otherClaimCount = competing[0]?.other_claim_count ?? 0;
      // Staff identity decisions apply to the athlete, not just one finish row.
      // A withdrawn/resubmitted claim must not let the same account regain a
      // revoked identity by choosing another result. Retain the email marker
      // even if the original reviewer's account has since been deleted.
      const reviewedIdentity = await tx<{ reviewed: boolean }>`
        select exists (
          select 1 from result_claims
          where athlete_id = ${result.athlete_id}
            and claimant_user_id = ${context.userId}
            and (reviewed_by_user_id is not null or reviewed_by_email is not null
              or status in ('needs_info', 'rejected'))
        ) as reviewed
      `;
      const previouslyReviewed =
        Boolean(existing[0]?.reviewed_by_user_id) ||
        existing[0]?.status === "needs_info" ||
        existing[0]?.status === "rejected" ||
        Boolean(reviewedIdentity[0]?.reviewed);
      const reviewReason = await selfConfirmationReviewReason(
        tx,
        context.userId,
        result.athlete_id,
        result.athlete_name,
        data.claimantRole,
      );
      const conflictReason = owner
        ? "This athlete profile is already linked to another account. Staff identity checks are required."
        : otherClaimCount > 0
          ? "Another account has claimed this athlete profile. Staff identity checks are required."
          : previouslyReviewed
            ? "This claim was previously reviewed by ATHRECS staff. A new submission requires another staff review."
            : reviewReason;
      // Completion records the athlete's declaration. It never verifies a
      // performance, upgrades source evidence, or implies a photo/ID check.
      const nextStatus = conflictReason ? ("pending" as const) : ("approved" as const);

      let claimId: number;
      if (existing[0]) {
        const updated = await tx<{ id: number }>`
          update result_claims
          set
            athlete_id = ${result.athlete_id},
            claimant_email = ${claimantEmail},
            status = ${nextStatus},
            claimant_role = case when claimant_role = 'guardian' then 'guardian' else ${data.claimantRole} end,
            confirmation_method = case when ${nextStatus === "approved"} then 'athlete' else confirmation_method end,
            confirmed_at = case when ${nextStatus === "approved"} then now() else confirmed_at end,
            evidence_text = case when ${Boolean(invitation)} then concat_ws(E'\n', nullif(evidence_text, ''),
              ${invitation ? `Staff invitation suggestion (not identity verification): ${invitation.match_note}` : null}::text)
              else evidence_text end,
            evidence_url = coalesce(${data.evidenceUrl}, evidence_url),
            evidence_url_2 = coalesce(${data.evidenceUrl2}, evidence_url_2),
            evidence_url_3 = coalesce(${data.evidenceUrl3}, evidence_url_3),
            declaration_accepted = true,
            conflict_reason = ${conflictReason},
            staff_note = case when ${previouslyReviewed} then staff_note else null end,
            reviewed_by_user_id = case when ${previouslyReviewed} then reviewed_by_user_id else null end,
            reviewed_by_email = case when ${previouslyReviewed} then reviewed_by_email else null end,
            reviewed_at = case when ${previouslyReviewed} then reviewed_at else null end,
            submitted_at = now(),
            updated_at = now()
          where id = ${existing[0].id}
          returning id
        `;
        claimId = updated[0].id;
      } else {
        const inserted = await tx<{ id: number }>`
          insert into result_claims (
            result_id, source_result_id, source_evidence, athlete_id, claimant_user_id, claimant_email, status,
            verification_method, evidence_text, evidence_url, evidence_url_2, evidence_url_3,
            declaration_accepted, conflict_reason, staff_note, reviewed_at,
            claimant_role, confirmation_method, confirmed_at
          ) values (
            ${result.result_id > 0 ? result.result_id : null}, ${result.result_id < 0 ? -result.result_id : null}, (select performance from source_history_claim_results where id=${result.result_id < 0 ? -result.result_id : null}), ${result.athlete_id}, ${context.userId}, ${claimantEmail},
            ${nextStatus}, ${data.verificationMethod}, ${invitation ? `Staff invitation suggestion (not identity verification): ${invitation.match_note}` : data.evidenceText},
            ${data.evidenceUrl}, ${data.evidenceUrl2}, ${data.evidenceUrl3},
            true, ${conflictReason}, null, null,
            ${data.claimantRole}, ${nextStatus === "approved" ? "athlete" : "unrecorded"},
            case when ${nextStatus === "approved"} then now() else null end
          )
          returning id
        `;
        claimId = inserted[0].id;
      }

      if (nextStatus === "approved") {
        await tx`
          insert into athlete_account_links (
            athlete_id, user_id, user_email, source_claim_id, confirmation_method
          ) values (
            ${result.athlete_id}, ${context.userId}, ${claimantEmail}, ${claimId}, 'athlete'
          )
        `;
        // One confirmation links the existing profile and completes its other
        // unreviewed submissions from this account. Never create an athlete.
        await tx`
          update result_claims set status = 'approved', confirmation_method = 'athlete',
            confirmed_at = now(), conflict_reason = null, updated_at = now()
          where athlete_id = ${result.athlete_id} and claimant_user_id = ${context.userId}
            and status = 'pending' and reviewed_by_user_id is null
            and reviewed_by_email is null and claimant_role = 'athlete'
        `;
      }

      if (summary)
        await tx`update athlete_profile_result_confirmations set claim_id=${claimId},
          email_payload=jsonb_set(email_payload,'{status}',to_jsonb(${nextStatus}::text))
          where id=${summary.id}::uuid`;
      if (invitation)
        await tx`update athlete_claim_invitations set claim_id=${claimId},user_id=coalesce(user_id,${context.userId}) where id=${invitation.id}`;
      const isConflict = Boolean(owner) || otherClaimCount > 0;
      if (isConflict) await queueClaimConflict(tx, claimId);
      return {
        status: nextStatus,
        summary: summary ? { ...summary, ...summaryEmail } : null,
        isConflict,
        alreadyOwned: false,
        claimId,
        claimantUserId: context.userId,
        email: {
          claimId,
          resultId: result.result_id,
          claimantEmail,
          athleteName: result.athlete_name,
          eventName: result.event_name,
          eventDate: result.event_date,
          distanceCode: result.distance_code,
        },
      };
    });

    if (outcome.summary) {
      try {
        await deliverProfileResultReceipts(sql, outcome.summary.id);
      } catch {
        console.error("[claim-email] summary receipt deferred to worker");
      }
    }
    if (outcome.status === "pending" && outcome.email && !outcome.summary) {
      // The durable outbox owns staff conflict emails. Keep the athlete receipt
      // separate and avoid sending a second generic staff notification.
      if (outcome.isConflict) {
        try {
          await deliverClaimConflictAlerts(sql, outcome.claimId);
        } catch {
          console.error("[claim-alerts] immediate delivery deferred to the worker");
        }
      }
      await notifyResultClaimSubmitted(outcome.email, { notifyStaff: !outcome.isConflict });
    }
    if (outcome.status === "approved" && !outcome.alreadyOwned) {
      await syncAthleteAccountAfterClaim(outcome.claimantUserId);
      if (outcome.email && !outcome.summary)
        await notifyResultClaimSubmitted(outcome.email, {
          notifyStaff: false,
          selfConfirmed: true,
        });
    }

    if (
      outcome.status === "pending" &&
      outcome.summary &&
      !outcome.summary.reused &&
      outcome.email
    ) {
      if (outcome.isConflict) {
        try {
          await deliverClaimConflictAlerts(sql, outcome.claimId);
        } catch {
          console.error("[claim-alerts] immediate delivery deferred to the worker");
        }
      } else {
        await notifyResultClaimSubmitted(outcome.email, { notifyAthlete: false });
      }
    }
    return {
      confirmation: outcome.summary
        ? {
            included: outcome.summary.included,
            excluded: outcome.summary.excluded,
            added: outcome.summary.added,
            reused: outcome.summary.reused,
          }
        : null,
      status: outcome.status,
      alreadyOwned: outcome.alreadyOwned,
      claimId: outcome.claimId,
    };
  });

export const listMyResultClaims = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await ready();
    const rows = await sql.query<ClaimRow>(
      `${CLAIM_SELECT}
       where claim.claimant_user_id = $1
       order by claim.submitted_at desc`,
      [context.userId],
    );
    return rows.map(mapClaim);
  });

export const withdrawResultClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { claimId: number }) => ({
    claimId: positiveInteger(input?.claimId, "Claim"),
  }))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const outcome = await sql.transaction(async (tx) => {
      const lockedAthleteId = await lockClaimAthlete(tx, data.claimId, context.userId);
      const rows = await tx<ClaimEmailRow>`
        select
          claim.id as claim_id,
          claim.claim_key as result_id,
          claim.claimant_email,
          athlete.display_name as athlete_name,
          result.event_name as event_name,
          result.event_date as event_date,
          result.distance_code
        from result_claims claim
        join athlete_claimable_results result on result.id = claim.claim_key
        join athletes athlete on athlete.id = claim.athlete_id
        where claim.id = ${data.claimId}
          and claim.athlete_id = ${lockedAthleteId}
          and claim.claimant_user_id = ${context.userId}
          and claim.status in ('pending', 'needs_info')
        limit 1
        for update of claim
      `;
      const claim = rows[0];
      if (!claim) throw new Error("Only an active claim can be withdrawn");
      await tx`
        update result_claims
        set status = 'withdrawn', updated_at = now()
        where id = ${claim.claim_id}
      `;
      return claim;
    });
    await notifyResultClaimWithdrawn({
      claimId: outcome.claim_id,
      resultId: outcome.result_id,
      claimantEmail: outcome.claimant_email,
      athleteName: outcome.athlete_name,
      eventName: outcome.event_name,
      eventDate: outcome.event_date,
      distanceCode: outcome.distance_code,
    });
    return { withdrawn: true };
  });

export const listStaffResultClaims = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { status?: ResultClaimStatus | "all"; claimant?: string } | undefined) => ({
    claimant: typeof input?.claimant === "string" ? input.claimant.trim().slice(0, 200) : "",
    status:
      input?.status === "pending" ||
      input?.status === "needs_info" ||
      input?.status === "approved" ||
      input?.status === "rejected" ||
      input?.status === "withdrawn"
        ? input.status
        : "all",
  }))
  .handler(async ({ data }) => {
    const sql = await ready();
    const rows = await sql.query<ClaimRow>(
      `select
         claim_data.*,
         owner.user_email as existing_owner_email,
         (
           select count(distinct competing.claimant_user_id)::int
           from result_claims competing
           where competing.athlete_id = claim.athlete_id
             and competing.claimant_user_id <> claim.claimant_user_id
             and competing.status in ('pending', 'needs_info', 'approved')
         ) as competing_claim_count
       from (${CLAIM_SELECT}) claim_data
       join result_claims claim on claim.id = claim_data.claim_id
       left join athlete_account_links owner
         on owner.athlete_id = claim_data.athlete_id and owner.status = 'active'
       where ($1::text = 'all' or claim.status = $1)
         and ($2::text = '' or claim.claimant_user_id = $2)
       order by
         case claim.status when 'pending' then 0 when 'needs_info' then 1 else 2 end,
         claim.submitted_at desc`,
      [data.status, data.claimant],
    );
    return rows.map(mapClaim);
  });

export const reviewResultClaim = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator(
    (input: {
      claimId: number;
      action: "approve" | "reject" | "needs_info";
      staffNote?: string;
    }) => ({
      claimId: positiveInteger(input?.claimId, "Claim"),
      action: reviewAction(input?.action),
      staffNote: shortText(input?.staffNote, 2000, "Staff note"),
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.staffNote) {
      throw new Error(
        data.action === "approve"
          ? "Record the independent identity evidence checked before approving ownership"
          : "Add a staff note explaining the decision",
      );
    }

    const sql = await ready();
    const result = await sql.transaction(async (tx) => {
      const lockedAthleteId = await lockClaimAthlete(tx, data.claimId);
      const claims = await tx<{
        id: number;
        status: ResultClaimStatus;
        result_id: number;
        athlete_id: number;
        claimant_user_id: string;
        claimant_email: string;
        athlete_name: string;
        event_name: string;
        event_date: string;
        distance_code: string;
      }>`
        select
          claim.id,
          claim.status,
          claim.claim_key as result_id,
          claim.athlete_id,
          claim.claimant_user_id,
          claim.claimant_email,
          athlete.display_name as athlete_name,
          result.event_name as event_name,
          result.event_date as event_date,
          result.distance_code
        from result_claims claim
        join athlete_claimable_results result on result.id = claim.claim_key
        join athletes athlete on athlete.id = claim.athlete_id
        where claim.id = ${data.claimId}
          and claim.athlete_id = ${lockedAthleteId}
        limit 1
        for update of claim
      `;
      const claim = claims[0];
      if (!claim) throw new Error("Claim not found");
      if (claim.status !== "pending" && claim.status !== "needs_info") {
        throw new Error("Only a pending claim can be reviewed");
      }

      if (data.action === "approve") {
        await requireClaimIdentity(tx, claim.claimant_user_id);
        const owners = await tx<{ user_id: string }>`
          select user_id
          from athlete_account_links
          where athlete_id = ${claim.athlete_id} and status = 'active'
          limit 1
          for update
        `;
        if (owners[0] && owners[0].user_id !== claim.claimant_user_id) {
          throw new Error("This athlete profile is already owned by another account");
        }

        await tx`
          insert into athlete_account_links (
            athlete_id, user_id, user_email, source_claim_id, status, linked_at, updated_at,
            confirmation_method
          ) values (
            ${claim.athlete_id}, ${claim.claimant_user_id}, ${claim.claimant_email},
            ${claim.id}, 'active', now(), now(), 'staff'
          )
          on conflict (athlete_id) do update set
            user_id = excluded.user_id,
            user_email = excluded.user_email,
            source_claim_id = excluded.source_claim_id,
            confirmation_method = 'staff',
            status = 'active',
            updated_at = now()
        `;
      }

      const nextStatus: ResultClaimStatus =
        data.action === "approve"
          ? "approved"
          : data.action === "needs_info"
            ? "needs_info"
            : "rejected";
      await tx`
        update result_claims
        set
          status = ${nextStatus},
          confirmation_method = case when ${nextStatus === "approved"} then 'staff' else confirmation_method end,
          confirmed_at = case when ${nextStatus === "approved"} then now() else confirmed_at end,
          conflict_reason = case when ${nextStatus === "approved"} then null else conflict_reason end,
          staff_note = ${data.staffNote || null},
          reviewed_by_user_id = ${context.userId},
          reviewed_by_email = ${context.staffEmail},
          reviewed_at = now(),
          updated_at = now()
        where id = ${claim.id}
      `;

      if (nextStatus === "approved") {
        await tx`
          update result_claims
          set status = 'approved', confirmation_method = 'staff', confirmed_at = now(),
            conflict_reason = null,
            staff_note = concat_ws(E'\n', staff_note,
              ${`Profile ownership approved with claim #${claim.id}: ${data.staffNote}`}::text),
            reviewed_by_user_id = ${context.userId},
            reviewed_by_email = ${context.staffEmail}, reviewed_at = now(), updated_at = now()
          where athlete_id = ${claim.athlete_id}
            and claimant_user_id = ${claim.claimant_user_id}
            and id <> ${claim.id} and status in ('pending', 'needs_info')
        `;
        await tx`
          update result_claims
          set
            status = 'rejected',
            conflict_reason = 'Another account was approved for this athlete profile after staff review.',
            staff_note = coalesce(staff_note, 'Automatically closed after an ownership approval.'),
            reviewed_by_user_id = ${context.userId},
            reviewed_by_email = ${context.staffEmail},
            reviewed_at = now(),
            updated_at = now()
          where athlete_id = ${claim.athlete_id}
            and claimant_user_id <> ${claim.claimant_user_id}
            and id <> ${claim.id}
            and status in ('pending', 'needs_info')
        `;
      }

      return {
        claimId: claim.id,
        status: nextStatus,
        claimantUserId: claim.claimant_user_id,
        email: {
          claimId: claim.id,
          resultId: claim.result_id,
          claimantEmail: claim.claimant_email,
          athleteName: claim.athlete_name,
          eventName: claim.event_name,
          eventDate: claim.event_date,
          distanceCode: claim.distance_code,
          status: nextStatus,
          staffNote: data.staffNote || null,
        },
      };
    });
    if (result.status === "approved") {
      await syncAthleteAccountAfterClaim(result.claimantUserId);
    }
    await notifyResultClaimReviewed(result.email);
    return { claimId: result.claimId, status: result.status };
  });

export const revokeAthleteOwnership = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { claimId: number; staffNote?: string }) => ({
    claimId: positiveInteger(input?.claimId, "Claim"),
    staffNote: shortText(input?.staffNote, 2000, "Staff note"),
  }))
  .handler(async ({ data, context }) => {
    if (!data.staffNote) throw new Error("Add a staff note explaining the revocation");

    const sql = await ready();
    const outcome = await sql.transaction(async (tx) => {
      const lockedAthleteId = await lockClaimAthlete(tx, data.claimId);
      const claims = await tx<{
        id: number;
        status: ResultClaimStatus;
        result_id: number;
        athlete_id: number;
        claimant_user_id: string;
        claimant_email: string;
        athlete_name: string;
        event_name: string;
        event_date: string;
        distance_code: string;
      }>`
        select
          claim.id,
          claim.status,
          claim.claim_key as result_id,
          claim.athlete_id,
          claim.claimant_user_id,
          claim.claimant_email,
          athlete.display_name as athlete_name,
          result.event_name as event_name,
          result.event_date as event_date,
          result.distance_code
        from result_claims claim
        join athlete_claimable_results result on result.id = claim.claim_key
        join athletes athlete on athlete.id = claim.athlete_id
        where claim.id = ${data.claimId}
          and claim.athlete_id = ${lockedAthleteId}
        limit 1
        for update of claim
      `;
      const claim = claims[0];
      if (!claim) throw new Error("Claim not found");
      if (claim.status !== "approved") {
        throw new Error("Only an approved claim can have ownership revoked");
      }

      const revoked = await tx<{ athlete_id: number }>`
        update athlete_account_links
        set status = 'revoked', updated_at = now()
        where athlete_id = ${claim.athlete_id}
          and user_id = ${claim.claimant_user_id}
          and status = 'active'
        returning athlete_id
      `;
      if (!revoked[0]) throw new Error("No active ownership link was found for this claim");

      await tx`
        update result_claims
        set
          status = 'rejected',
          staff_note = ${`Ownership revoked: ${data.staffNote}`},
          reviewed_by_user_id = ${context.userId},
          reviewed_by_email = ${context.staffEmail},
          reviewed_at = now(),
          updated_at = now()
        where athlete_id = ${claim.athlete_id}
          and claimant_user_id = ${claim.claimant_user_id}
          and status = 'approved'
      `;

      return {
        claimId: claim.id,
        status: "rejected" as const,
        ownershipRevoked: true,
        email: {
          claimId: claim.id,
          resultId: claim.result_id,
          claimantEmail: claim.claimant_email,
          athleteName: claim.athlete_name,
          eventName: claim.event_name,
          eventDate: claim.event_date,
          distanceCode: claim.distance_code,
          status: "revoked" as const,
          staffNote: data.staffNote,
        },
      };
    });
    await notifyResultClaimReviewed(outcome.email);
    return {
      claimId: outcome.claimId,
      status: outcome.status,
      ownershipRevoked: outcome.ownershipRevoked,
    };
  });
