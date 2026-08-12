import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { DEV_USER_ID } from "@/lib/auth/verify.server";
import { dbSource, getSql, type Sql } from "@/lib/db";
import { ensureAthrecsSeeded } from "../seed.server";
import {
  athleteClaimSubmissionSchema,
  athleteEditSubmissionSchema,
  athleteMissingResultSubmissionSchema,
  athleteResultClaimSubmissionSchema,
  eventCreateSubmissionSchema,
  eventEditSubmissionSchema,
  organisationClaimSubmissionSchema,
  resultsUploadSubmissionSchema,
  reviewSubmissionSchema,
  type EventCreateSubmission,
} from "./schemas";
import {
  ForbiddenError,
  canManageAthlete,
  canViewAthletePrivate,
  getOrganisationRole,
  hasPlatformRole,
  requireAthleteManager,
  requireAthletePrivateAccess,
  requireEventCapability,
  requireOrganisationCapability,
  requirePlatformRole,
} from "./permissions.server";
import { applyApprovedSubmission } from "./application.server";
import {
  makeId,
  slugify,
  verifyEventCreate,
  verifyEventEdit,
  verifyResultsRows,
  type AutomatedCheckDraft,
  type SubmissionItemDraft,
} from "./verification";
import {
  ready,
  json,
  averageCheckScore,
  automatedVerificationStatus,
  checkWarningCount,
  insertSubmission,
  insertSubmissionItems,
  insertVerificationChecks,
  markSubmissionFailed,
  insertAudit
} from "./api-common.server";

export const submitAthleteClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => athleteClaimSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    const athleteRows = await sql<{
      id: number;
      slug: string;
      display_name: string;
      verification_status: string;
    }>`
      select id, slug, display_name, verification_status
      from athletes
      where id = ${data.athleteId}
      limit 1
    `;
    const athlete = athleteRows[0];
    if (!athlete) throw new Error("Athlete not found");

    const existing = await sql<{ id: string }>`
      select id
      from athlete_claims
      where athlete_id = ${data.athleteId}
        and user_id = ${context.userId}
        and relationship = ${data.relationship}
        and status in (
          'submitted', 'under_review', 'needs_information',
          'approved_pending_application', 'approved', 'verified'
        )
      limit 1
    `;
    if (existing[0]) {
      throw new Error("You already have an active claim for this athlete and relationship");
    }

    const trustedRelationship = ["self", "parent", "guardian"].includes(
      data.relationship,
    );
    const permissions = {
      edit_profile: trustedRelationship ? true : Boolean(data.permissions.editProfile),
      private_data: trustedRelationship ? true : Boolean(data.permissions.privateData),
    };
    const evidenceStrong = data.evidence.some((item) => Boolean(item.url || item.reference));
    const checks: AutomatedCheckDraft[] = [
      {
        id: makeId("check"),
        checkType: "athlete_record",
        status: "pass",
        severity: "info",
        score: 100,
        message: "The claimed athlete profile exists",
        evidence: { athleteId: athlete.id, athleteSlug: athlete.slug },
      },
      {
        id: makeId("check"),
        checkType: "claim_evidence",
        status: evidenceStrong ? "pass" : "warning",
        severity: evidenceStrong ? "info" : "high",
        score: evidenceStrong ? 100 : 50,
        message: evidenceStrong
          ? "The claim includes evidence that can be independently reviewed"
          : "Evidence was supplied without a URL or external reference",
        evidence: { evidenceCount: data.evidence.length },
      },
      {
        id: makeId("check"),
        checkType: "delegated_permissions",
        status: permissions.edit_profile ? "pass" : "fail",
        severity: permissions.edit_profile ? "info" : "high",
        score: permissions.edit_profile ? 100 : 0,
        message: permissions.edit_profile
          ? "The requested relationship includes an explicit profile-management scope"
          : "The claim does not request a usable profile-management scope",
        evidence: { relationship: data.relationship, permissions },
      },
    ];
    const itemRejected = checks.some((check) => check.status === "fail");
    const verificationStatus = automatedVerificationStatus(checks, itemRejected ? 1 : 0);
    const claimId = makeId("athleteclaim");
    const submissionId = makeId("submission");

    const item: SubmissionItemDraft = {
      id: makeId("item"),
      rowNumber: 1,
      entityType: "athlete_claim",
      entityKey: athlete.slug,
      proposedAction: "update",
      targetTable: "athlete_claims",
      targetId: claimId,
      rawData: data,
      currentData: {
        athleteId: athlete.id,
        athleteSlug: athlete.slug,
        athleteName: athlete.display_name,
        verificationStatus: athlete.verification_status,
      },
      normalizedData: {
        claimId,
        athleteId: data.athleteId,
        relationship: data.relationship,
        permissions,
      },
      status: itemRejected
        ? "rejected"
        : verificationStatus === "automated_pass"
          ? "validated"
          : "warning",
      errors: checks.filter((check) => check.status === "fail").map((check) => check.message),
      warnings: checks
        .filter((check) => check.status === "warning")
        .map((check) => check.message),
    };

    let claimCreated = false;
    let submissionCreated = false;
    try {
      await sql`
        insert into athlete_claims (
          id, athlete_id, user_id, relationship, status, verification_level,
          permissions, evidence
        ) values (
          ${claimId}, ${data.athleteId}, ${context.userId}, ${data.relationship},
          'submitted', 'unverified', ${json(permissions)}::jsonb,
          ${json(data.evidence)}::jsonb
        )
      `;
      claimCreated = true;
      await insertSubmission(sql, {
        id: submissionId,
        submissionType: "athlete_claim",
        entityType: "athlete_claim",
        entityId: claimId,
        userId: context.userId,
        athleteId: data.athleteId,
        sourceType: "athlete_claim",
        sourceUrl: data.sourceUrl ?? null,
        verificationStatus,
        riskLevel: "restricted",
        rowCount: 1,
        acceptedCount: itemRejected ? 0 : 1,
        warningCount: checkWarningCount(checks),
        rejectedCount: itemRejected ? 1 : 0,
        automatedScore: averageCheckScore(checks),
        summary: {
          athleteId: data.athleteId,
          athleteName: athlete.display_name,
          relationship: data.relationship,
          permissions,
          evidence: data.evidence,
          note: data.note,
          nextStep: "Athrecs verifies the claimant's relationship before access is granted",
        },
      });
      submissionCreated = true;
      await insertSubmissionItems(sql, submissionId, [item]);
      await insertVerificationChecks(sql, submissionId, checks);
      await insertAudit(sql, {
        actorUserId: context.userId,
        action: "athlete.claim_submitted",
        entityType: "athlete_claim",
        entityId: claimId,
        submissionId,
        afterData: {
          athleteId: data.athleteId,
          relationship: data.relationship,
          permissions,
        },
        reason: data.note,
      });
    } catch (error) {
      if (submissionCreated) await markSubmissionFailed(sql, submissionId, error);
      if (claimCreated) {
        await sql`update athlete_claims set status = 'failed' where id = ${claimId}`;
      }
      throw error;
    }

    return {
      claimId,
      athleteId: data.athleteId,
      submissionId,
      status: "submitted",
      verificationStatus,
    };
  });

