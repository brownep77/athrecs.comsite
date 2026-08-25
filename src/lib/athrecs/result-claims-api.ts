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

function verificationMethod(value: unknown): ResultClaimVerificationMethod {
  if (
    value === "bib" ||
    value === "official_email" ||
    value === "club_confirmation" ||
    value === "other"
  ) {
    return value;
  }
  throw new Error("Choose how ATHRECS can verify this claim");
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

export const getClaimableResult = createServerFn({ method: "GET" })
  .validator((input: { resultId: number }) => ({
    resultId: positiveInteger(input?.resultId, "Result"),
  }))
  .handler(async ({ data }) => {
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
        result.source_url
      from results result
      join athletes athlete on athlete.id = result.athlete_id
      join editions edition on edition.id = result.edition_id
      join events event on event.id = edition.event_id
      where result.id = ${data.resultId}
      limit 1
    `;
    const row = rows[0];
    if (!row) return null;
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
      verificationMethod: ResultClaimVerificationMethod;
      evidenceText?: string;
      evidenceUrl?: string;
      declarationAccepted: boolean;
    }) => ({
      resultId: positiveInteger(input?.resultId, "Result"),
      verificationMethod: verificationMethod(input?.verificationMethod),
      evidenceText: shortText(input?.evidenceText, 1000, "Verification detail"),
      evidenceUrl: optionalHttpsUrl(input?.evidenceUrl),
      declarationAccepted: input?.declarationAccepted === true,
    }),
  )
  .handler(async ({ data, context }) => {
    if (!data.declarationAccepted) throw new Error("Confirm that this is your result");

    const sql = await ready();
    const outcome = await sql.transaction(async (tx) => {
      const users = await tx<{ email: string }>`
        select "email" as email from "user" where "id" = ${context.userId} limit 1
      `;
      const claimantEmail = users[0]?.email?.trim().toLowerCase();
      if (!claimantEmail) throw new Error("Your signed-in account has no email address");

      const results = await tx<{
        result_id: number;
        athlete_id: number;
        athlete_name: string;
        event_name: string;
        event_date: string;
        distance_code: string;
      }>`
        select
          result.id as result_id,
          result.athlete_id,
          athlete.display_name as athlete_name,
          event.name as event_name,
          edition.event_date::text as event_date,
          edition.distance_code
        from results result
        join athletes athlete on athlete.id = result.athlete_id
        join editions edition on edition.id = result.edition_id
        join events event on event.id = edition.event_id
        where result.id = ${data.resultId}
        limit 1
      `;
      const result = results[0];
      if (!result) throw new Error("Result not found");

      // Serialize all ownership decisions for the same athlete profile so two
      // simultaneous first claims cannot both be approved automatically.
      await tx`select id from athletes where id = ${result.athlete_id} for update`;

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
          autoApproved: false,
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
      if (existing[0]?.status === "approved") {
        return {
          status: "approved" as const,
          alreadyOwned: true,
          claimId: existing[0].id,
          autoApproved: false,
          email: null,
        };
      }
      if (existing[0]?.status === "pending") {
        throw new Error("You already have an active claim for this result");
      }

      const competingClaims = await tx<{ count: number }>`
        select count(distinct claimant_user_id)::int as count
        from result_claims
        where athlete_id = ${result.athlete_id}
          and claimant_user_id <> ${context.userId}
          and status in ('pending', 'needs_info', 'approved')
      `;
      const competingClaimCount = competingClaims[0]?.count ?? 0;
      const previouslyReviewed =
        Boolean(existing[0]?.reviewed_by_user_id) ||
        existing[0]?.status === "needs_info" ||
        existing[0]?.status === "rejected";
      const requiresReview = Boolean(owner) || competingClaimCount > 0 || previouslyReviewed;
      const conflictReason = owner
        ? "This athlete profile is already linked to another account. Staff identity checks are required."
        : competingClaimCount > 0
          ? "Another account has claimed this athlete profile. Staff review is required before ownership changes."
          : previouslyReviewed
            ? "This claim was previously reviewed by ATHRECS staff. A new submission requires another staff review."
            : null;
      const nextStatus: ResultClaimStatus = requiresReview ? "pending" : "approved";

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
            declaration_accepted = true,
            conflict_reason = ${conflictReason},
            staff_note = case when ${previouslyReviewed} then staff_note else null end,
            reviewed_by_user_id = null,
            reviewed_by_email = null,
            reviewed_at = case when ${requiresReview} then null else now() end,
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
            verification_method, evidence_text, evidence_url,
            declaration_accepted, conflict_reason, reviewed_at
          ) values (
            ${result.result_id}, ${result.athlete_id}, ${context.userId}, ${claimantEmail},
            ${nextStatus}, ${data.verificationMethod}, ${data.evidenceText}, ${data.evidenceUrl},
            true, ${conflictReason}, case when ${requiresReview} then null else now() end
          )
          returning id
        `;
        claimId = inserted[0].id;
      }

      let finalStatus = nextStatus;
      if (!requiresReview) {
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
          returning athlete_id
        `;
        if (!linked[0]) {
          finalStatus = "pending";
          await tx`
            update result_claims
            set
              status = 'pending',
              conflict_reason = 'This athlete profile became linked to another account while the claim was being submitted. Staff review is required.',
              reviewed_at = null,
              updated_at = now()
            where id = ${claimId}
          `;
        }
      }

      const autoApproved = finalStatus === "approved";
      return {
        status: finalStatus,
        alreadyOwned: false,
        claimId,
        autoApproved,
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

    if (outcome.autoApproved) {
      await syncAthleteAccountAfterClaim(context.userId);
    }
    if (outcome.email) {
      if (outcome.autoApproved) {
        await notifyResultClaimReviewed({
          ...outcome.email,
          status: "approved",
          staffNote: null,
        });
      } else {
        await notifyResultClaimSubmitted(outcome.email);
      }
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
      const claimRefs = await tx<{ athlete_id: number }>`
        select athlete_id
        from result_claims
        where id = ${data.claimId}
        limit 1
      `;
      if (!claimRefs[0]) throw new Error("Claim not found");

      await tx`select id from athletes where id = ${claimRefs[0].athlete_id} for update`;

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
      const claimRefs = await tx<{ athlete_id: number }>`
        select athlete_id
        from result_claims
        where id = ${data.claimId}
        limit 1
      `;
      if (!claimRefs[0]) throw new Error("Claim not found");

      await tx`select id from athletes where id = ${claimRefs[0].athlete_id} for update`;

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
