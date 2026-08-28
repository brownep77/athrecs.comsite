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
import { scorePotentialResultNameMatch, uniquePotentialMatchNames } from "./result-match";
import { ensureAthrecsSeeded } from "./seed.server";

export type ResultClaimStatus = "pending" | "needs_info" | "approved" | "rejected" | "withdrawn";

export type ResultClaimVerificationMethod =
  "bib" | "official_email" | "club_confirmation" | "other";

export type ClaimableResult = {
  resultId: number;
  athleteId: number;
  athleteSlug: string;
  athleteName: string;
  eventName: string;
  eventSlug: string;
  eventDate: string;
  distanceCode: string;
  finishTimeSeconds: number | null;
  overallPlace: number | null;
  bib: string | null;
  category: string | null;
  sourceUrl: string | null;
};

export type ResultClaimListItem = ClaimableResult & {
  claimId: number;
  claimantEmail: string;
  status: ResultClaimStatus;
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
  event_date: string;
  distance_code: string;
  finish_time_seconds: number | null;
  overall_place: number | null;
  bib: string | null;
  category: string | null;
  source_url: string | null;
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

function positiveInteger(value: unknown, label: string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${label} is invalid`);
  return parsed;
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
    eventDate: row.event_date,
    distanceCode: row.distance_code,
    finishTimeSeconds: row.finish_time_seconds,
    overallPlace: row.overall_place,
    bib: row.bib,
    category: row.category,
    sourceUrl: row.source_url,
    claimantEmail: row.claimant_email,
    status: row.claim_status,
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
    event.name as event_name,
    event.slug as event_slug,
    edition.event_date::text as event_date,
    edition.distance_code,
    result.finish_time_seconds,
    result.overall_place,
    result.bib,
    result.category,
    result.source_url
  from result_claims claim
  join results result on result.id = claim.result_id
  join athletes athlete on athlete.id = claim.athlete_id
  join editions edition on edition.id = result.edition_id
  join events event on event.id = edition.event_id
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
        where claim.result_id = ${candidate.resultId}
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
      city: string | null;
      region: string | null;
      country: string | null;
      club_or_team: string | null;
    }>`
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
  const names = uniquePotentialMatchNames([
    identity.full_name,
    identity.display_name,
    identity.auth_name,
    ...linkedNames.map((row) => row.athlete_name),
  ]);
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
  .middleware([authMiddleware])
  .validator((input: { resultId: number }) => ({
    resultId: positiveInteger(input?.resultId, "Result"),
  }))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const rows = await sql<{
      result_id: number;
      athlete_id: number;
      athlete_slug: string;
      athlete_name: string;
      event_name: string;
      event_slug: string;
      event_date: string;
      distance_code: string;
      finish_time_seconds: number | null;
      overall_place: number | null;
      bib: string | null;
      category: string | null;
      source_url: string | null;
      athlete_city: string | null;
      athlete_region: string | null;
      athlete_country: string | null;
      club_name: string | null;
    }>`
      select
        result.id as result_id,
        athlete.id as athlete_id,
        athlete.slug as athlete_slug,
        athlete.display_name as athlete_name,
        event.name as event_name,
        event.slug as event_slug,
        edition.event_date::text as event_date,
        edition.distance_code,
        result.finish_time_seconds,
        result.overall_place,
        result.bib,
        result.category,
        result.source_url,
        athlete.city as athlete_city,
        athlete.county as athlete_region,
        athlete.country as athlete_country,
        club.name as club_name
      from results result
      join athletes athlete on athlete.id = result.athlete_id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      left join clubs club on club.id = athlete.club_id
      where result.id = ${data.resultId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const allowed = await canAccessClaimCandidate(sql, context.userId, {
      resultId: row.result_id,
      athleteId: row.athlete_id,
      athleteName: row.athlete_name,
      city: row.athlete_city,
      region: row.athlete_region,
      country: row.athlete_country,
      clubName: row.club_name,
    });
    if (!allowed) return null;
    return {
      resultId: row.result_id,
      athleteId: row.athlete_id,
      athleteSlug: row.athlete_slug,
      athleteName: row.athlete_name,
      eventName: row.event_name,
      eventSlug: row.event_slug,
      eventDate: row.event_date,
      distanceCode: row.distance_code,
      finishTimeSeconds: row.finish_time_seconds,
      overallPlace: row.overall_place,
      bib: row.bib,
      category: row.category,
      sourceUrl: row.source_url,
    } satisfies ClaimableResult;
  });

export const submitResultClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      resultId: number;
      evidenceUrl?: string;
      evidenceUrl2?: string;
      evidenceUrl3?: string;
      declarationAccepted: boolean;
    }) => ({
      resultId: positiveInteger(input?.resultId, "Result"),
      verificationMethod: "other" as ResultClaimVerificationMethod,
      evidenceText: "",
      evidenceUrl: optionalHttpsUrl(input?.evidenceUrl),
      evidenceUrl2: optionalHttpsUrl(input?.evidenceUrl2),
      evidenceUrl3: optionalHttpsUrl(input?.evidenceUrl3),
      declarationAccepted: input?.declarationAccepted === true,
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.declarationAccepted) throw new Error("Confirm that this is your result");

    const sql = await ready();
    const outcome = await sql.transaction(async (tx) => {
      const users = await tx<{ email: string }>`
        select "email" as email from "user" where "id" = ${context.userId} limit 1`;
      const claimantEmail = users[0]?.email?.trim().toLowerCase();
      if (!claimantEmail) throw new Error("Your signed-in account has no email address");

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
          event.name as event_name,
          edition.event_date::text as event_date,
          edition.distance_code,
          athlete.city as athlete_city,
          athlete.county as athlete_region,
          athlete.country as athlete_country,
          club.name as club_name
        from results result
        join athletes athlete on athlete.id = result.athlete_id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        left join clubs club on club.id = athlete.club_id
        where result.id = ${data.resultId}
        limit 1
      `;
      const result = results[0];
      if (!result) throw new Error("Result not found");
      const allowed = await canAccessClaimCandidate(tx, context.userId, {
        resultId: result.result_id,
        athleteId: result.athlete_id,
        athleteName: result.athlete_name,
        city: result.athlete_city,
        region: result.athlete_region,
        country: result.athlete_country,
        clubName: result.club_name,
      });
      if (!allowed) throw new Error("Result not available to this account");

      // Serialise every ownership decision for this athlete so two simultaneous
      // first claims cannot both be approved.
      await tx`
        select id from athletes
        where id = ${result.athlete_id}
        for update
      `;

      const owners = await tx<{ user_id: string; user_email: string }>`
        select user_id, user_email
        from athlete_account_links
        where athlete_id = ${result.athlete_id} and status = 'active'
        limit 1
      `;
      const owner = owners[0];
      if (owner?.user_id === context.userId) {
        return {
          status: "approved" as const,
          alreadyOwned: true,
          claimId: null,
          claimantUserId: context.userId,
          email: null,
        };
      }

      const existing = await tx<{
        id: number;
        status: ResultClaimStatus;
        reviewed_by_user_id: string | null;
      }>`
        select id, status, reviewed_by_user_id
        from result_claims
        where result_id = ${result.result_id} and claimant_user_id = ${context.userId}
        limit 1
        for update
      `;

      const competing = await tx<{ other_claim_count: number }>`
        select count(distinct claimant_user_id)::int as other_claim_count
        from result_claims
        where athlete_id = ${result.athlete_id}
          and claimant_user_id <> ${context.userId}
          and status in ('pending', 'needs_info', 'approved')
      `;
      const otherClaimCount = competing[0]?.other_claim_count ?? 0;
      const previouslyReviewed =
        Boolean(existing[0]?.reviewed_by_user_id) ||
        existing[0]?.status === "needs_info" ||
        existing[0]?.status === "rejected";
      const requiresReview = Boolean(owner) || otherClaimCount > 0 || previouslyReviewed;
      const conflictReason = owner
        ? "This athlete profile is already linked to another account. Staff identity checks are required."
        : otherClaimCount > 0
          ? "Another account has claimed this athlete profile. Staff identity checks are required."
          : previouslyReviewed
            ? "This claim was previously reviewed by ATHRECS staff. A new submission requires another staff review."
            : null;
      const nextStatus: ResultClaimStatus = requiresReview ? "pending" : "approved";
      const automaticNote =
        nextStatus === "approved" ? "Automatically approved as the first uncontested claim." : null;

      let claimId: number;
      if (existing[0]) {
        const updated = await tx<{ id: number }>`
          update result_claims
          set
            athlete_id = ${result.athlete_id},
            claimant_email = ${claimantEmail},
            status = ${nextStatus},
            verification_method = ${data.verificationMethod},
            evidence_text = ${data.evidenceText},
            evidence_url = ${data.evidenceUrl},
            evidence_url_2 = ${data.evidenceUrl2},
            evidence_url_3 = ${data.evidenceUrl3},
            declaration_accepted = true,
            conflict_reason = ${conflictReason},
            staff_note = case when ${previouslyReviewed} then staff_note else ${automaticNote} end,
            reviewed_by_user_id = null,
            reviewed_by_email = null,
            reviewed_at = case when ${nextStatus} = 'approved' then now() else null end,
            submitted_at = now(),
            updated_at = now()
          where id = ${existing[0].id}
          returning id
        `;
        claimId = updated[0].id;
      } else {
        const inserted = await tx<{ id: number }>`
          insert into result_claims (
            result_id, athlete_id, claimant_user_id, claimant_email, status,
            verification_method, evidence_text, evidence_url, evidence_url_2, evidence_url_3,
            declaration_accepted, conflict_reason, staff_note, reviewed_at
          ) values (
            ${result.result_id}, ${result.athlete_id}, ${context.userId}, ${claimantEmail},
            ${nextStatus}, ${data.verificationMethod}, ${data.evidenceText},
            ${data.evidenceUrl}, ${data.evidenceUrl2}, ${data.evidenceUrl3},
            true, ${conflictReason}, ${automaticNote},
            case when ${nextStatus} = 'approved' then now() else null end
          )
          returning id
        `;
        claimId = inserted[0].id;
      }

      if (nextStatus === "approved") {
        const linked = await tx<{ athlete_id: number }>`
          insert into athlete_account_links (
            athlete_id, user_id, user_email, source_claim_id, status, linked_at, updated_at
          ) values (
            ${result.athlete_id}, ${context.userId}, ${claimantEmail},
            ${claimId}, 'active', now(), now()
          )
          on conflict (athlete_id) do update set
            user_id = excluded.user_id,
            user_email = excluded.user_email,
            source_claim_id = excluded.source_claim_id,
            status = 'active',
            linked_at = now(),
            updated_at = now()
          where athlete_account_links.status = 'revoked'
             or athlete_account_links.user_id = excluded.user_id
          returning athlete_id
        `;

        // This is a last-resort concurrency guard. The athlete row lock above
        // normally makes it unreachable, but an existing active owner must
        // never be overwritten if another code path creates one concurrently.
        if (!linked[0]) {
          const concurrentConflict =
            "This athlete profile was linked to another account while your claim was being processed. Staff identity checks are required.";
          await tx`
            update result_claims
            set
              status = 'pending',
              conflict_reason = ${concurrentConflict},
              staff_note = null,
              reviewed_at = null,
              updated_at = now()
            where id = ${claimId}
          `;
          return {
            status: "pending" as const,
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
        }
      }

      return {
        status: nextStatus,
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

    if (outcome.status === "approved" && !outcome.alreadyOwned) {
      await syncAthleteAccountAfterClaim(outcome.claimantUserId);
      if (outcome.email) {
        await notifyResultClaimReviewed({
          ...outcome.email,
          status: "approved",
          staffNote: null,
        });
      }
    } else if (outcome.status === "pending" && outcome.email) {
      await notifyResultClaimSubmitted(outcome.email);
    }

    return {
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
      const rows = await tx<ClaimEmailRow>`
        select
          claim.id as claim_id,
          claim.result_id,
          claim.claimant_email,
          athlete.display_name as athlete_name,
          event.name as event_name,
          edition.event_date::text as event_date,
          edition.distance_code
        from result_claims claim
        join results result on result.id = claim.result_id
        join athletes athlete on athlete.id = claim.athlete_id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        where claim.id = ${data.claimId}
          and claim.claimant_user_id = ${context.userId}
          and claim.status in ('pending', 'needs_info')
        limit 1
        for update
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
  .validator((input: { status?: ResultClaimStatus | "all" } | undefined) => ({
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
           select count(*)::int
           from result_claims competing
           where competing.result_id = claim.result_id
             and competing.id <> claim.id
             and competing.status in ('pending', 'needs_info', 'approved')
         ) as competing_claim_count
       from (${CLAIM_SELECT}) claim_data
       join result_claims claim on claim.id = claim_data.claim_id
       left join athlete_account_links owner
         on owner.athlete_id = claim_data.athlete_id and owner.status = 'active'
       where ($1::text = 'all' or claim.status = $1)
       order by
         case claim.status when 'pending' then 0 when 'needs_info' then 1 else 2 end,
         claim.submitted_at desc`,
      [data.status],
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
    if (data.action !== "approve" && !data.staffNote) {
      throw new Error("Add a staff note explaining the decision");
    }

    const sql = await ready();
    const result = await sql.transaction(async (tx) => {
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
          claim.result_id,
          claim.athlete_id,
          claim.claimant_user_id,
          claim.claimant_email,
          athlete.display_name as athlete_name,
          event.name as event_name,
          edition.event_date::text as event_date,
          edition.distance_code
        from result_claims claim
        join results result on result.id = claim.result_id
        join athletes athlete on athlete.id = claim.athlete_id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        where claim.id = ${data.claimId}
        limit 1
        for update
      `;
      const claim = claims[0];
      if (!claim) throw new Error("Claim not found");
      if (claim.status !== "pending" && claim.status !== "needs_info") {
        throw new Error("Only a pending claim can be reviewed");
      }

      if (data.action === "approve") {
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
            athlete_id, user_id, user_email, source_claim_id, status, linked_at, updated_at
          ) values (
            ${claim.athlete_id}, ${claim.claimant_user_id}, ${claim.claimant_email},
            ${claim.id}, 'active', now(), now()
          )
          on conflict (athlete_id) do update set
            user_id = excluded.user_id,
            user_email = excluded.user_email,
            source_claim_id = excluded.source_claim_id,
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
          set
            status = 'rejected',
            conflict_reason = 'Another verified account was approved for this athlete profile.',
            staff_note = coalesce(staff_note, 'Automatically closed after an ownership approval.'),
            reviewed_by_user_id = ${context.userId},
            reviewed_by_email = ${context.staffEmail},
            reviewed_at = now(),
            updated_at = now()
          where athlete_id = ${claim.athlete_id}
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
          claim.result_id,
          claim.athlete_id,
          claim.claimant_user_id,
          claim.claimant_email,
          athlete.display_name as athlete_name,
          event.name as event_name,
          edition.event_date::text as event_date,
          edition.distance_code
        from result_claims claim
        join results result on result.id = claim.result_id
        join athletes athlete on athlete.id = claim.athlete_id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        where claim.id = ${data.claimId}
        limit 1
        for update
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
        where id = ${claim.id}
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
