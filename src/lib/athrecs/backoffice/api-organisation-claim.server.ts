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

export const submitOrganisationClaim = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => organisationClaimSubmissionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const sql = await ready();
    let organisationId = data.organisationId ?? null;
    let createdOrganisation = false;
    let organisation: {
      id: number;
      slug: string;
      name: string;
      verification_status: string;
      active: boolean;
    } | null = null;

    if (organisationId) {
      const rows = await sql<typeof organisation>`
        select id, slug, name, verification_status, active
        from organisations
        where id = ${organisationId}
        limit 1
      `;
      organisation = rows[0] ?? null;
      if (!organisation) throw new Error("Organisation not found");
    } else {
      const proposedName = data.proposedName?.trim();
      if (!proposedName) throw new Error("Organisation name is required");
      const proposedSlug = slugify(proposedName);
      const duplicate = await sql<{ id: number; name: string }>`
        select id, name
        from organisations
        where slug = ${proposedSlug} or lower(name) = lower(${proposedName})
        limit 1
      `;
      if (duplicate[0]) {
        throw new Error(
          `An organisation named ${duplicate[0].name} already exists; claim that record instead`,
        );
      }
      const inserted = await sql<{
        id: number;
        slug: string;
        name: string;
        verification_status: string;
        active: boolean;
      }>`
        insert into organisations (
          slug, name, organisation_type, legal_name, registration_number,
          country, region, city, website, public_email,
          verification_status, verification_evidence, active
        ) values (
          ${proposedSlug}, ${proposedName}, ${data.organisationType},
          ${data.legalName ?? null}, ${data.registrationNumber ?? null},
          ${data.country}, ${data.region}, ${data.city}, ${data.website ?? null},
          ${data.publicEmail ?? null}, 'pending', ${json(data.evidence)}::jsonb, false
        )
        returning id, slug, name, verification_status, active
      `;
      organisation = inserted[0];
      organisationId = organisation.id;
      createdOrganisation = true;
    }

    const existing = await sql<{ id: string }>`
      select id
      from organisation_claims
      where organisation_id = ${organisationId}
        and user_id = ${context.userId}
        and status in ('submitted', 'under_review', 'needs_information', 'approved')
      limit 1
    `;
    if (existing[0]) {
      throw new Error("You already have an active claim for this organisation");
    }

    const claimId = makeId("orgclaim");
    const submissionId = makeId("submission");
    const itemId = makeId("item");
    const evidenceStrong = data.evidence.some((item) => Boolean(item.url || item.reference));
    const checks: AutomatedCheckDraft[] = [
      {
        id: makeId("check"),
        checkType: "claim_evidence",
        status: evidenceStrong ? "pass" : "warning",
        severity: evidenceStrong ? "info" : "high",
        score: evidenceStrong ? 100 : 50,
        message: evidenceStrong
          ? "Organisation claim includes independently reviewable evidence"
          : "Evidence was supplied but has no URL or external reference",
        evidence: { evidenceCount: data.evidence.length },
      },
      {
        id: makeId("check"),
        checkType: "organisation_identity",
        status: data.registrationNumber || data.website ? "pass" : "warning",
        severity: data.registrationNumber || data.website ? "info" : "medium",
        score: data.registrationNumber || data.website ? 100 : 60,
        message:
          data.registrationNumber || data.website
            ? "Registration or official website details are available for review"
            : "No registration number or official website was supplied",
      },
    ];
    const verificationStatus = automatedVerificationStatus(checks);

    const item: SubmissionItemDraft = {
      id: itemId,
      rowNumber: 1,
      entityType: "organisation_claim",
      entityKey: organisation.slug,
      proposedAction: "update",
      targetTable: "organisation_claims",
      targetId: claimId,
      rawData: data,
      currentData: organisation,
      normalizedData: {
        claimId,
        organisationId,
        relationship: data.relationship,
        evidence: data.evidence,
      },
      status: verificationStatus === "automated_pass" ? "validated" : "warning",
      errors: [],
      warnings: checks
        .filter((check) => check.status === "warning")
        .map((check) => check.message),
    };

    let claimCreated = false;
    let submissionCreated = false;
    try {
      await sql`
        insert into organisation_claims (
          id, organisation_id, proposed_name, user_id, relationship,
          evidence, status
        ) values (
          ${claimId}, ${organisationId}, ${data.proposedName ?? organisation.name},
          ${context.userId}, ${data.relationship}, ${json(data.evidence)}::jsonb,
          'submitted'
        )
      `;
      claimCreated = true;
      await insertSubmission(sql, {
        id: submissionId,
        submissionType: "organisation_claim",
        entityType: "organisation_claim",
        entityId: claimId,
        userId: context.userId,
        organisationId,
        sourceType: "organiser_claim",
        sourceUrl: data.website ?? null,
        verificationStatus,
        riskLevel: "restricted",
        rowCount: 1,
        acceptedCount: 1,
        warningCount: checkWarningCount(checks),
        rejectedCount: 0,
        automatedScore: averageCheckScore(checks),
        summary: {
          note: data.note,
          organisationName: organisation.name,
          relationship: data.relationship,
          evidence: data.evidence,
          nextStep: "Athrecs manual organisation verification",
        },
      });
      submissionCreated = true;
      await insertSubmissionItems(sql, submissionId, [item]);
      await insertVerificationChecks(sql, submissionId, checks);
      await insertAudit(sql, {
        actorUserId: context.userId,
        organisationId,
        action: "organisation.claim_submitted",
        entityType: "organisation_claim",
        entityId: claimId,
        submissionId,
        afterData: item.normalizedData,
        reason: data.note,
      });
    } catch (error) {
      if (submissionCreated) await markSubmissionFailed(sql, submissionId, error);
      if (claimCreated) {
        await sql`
          update organisation_claims set status = 'failed' where id = ${claimId}
        `;
      }
      if (createdOrganisation) {
        // A proposed organisation is only a staging record at this point. Remove
        // it on a failed submission so the claimant can retry the same name.
        await sql`
          delete from organisations
          where id = ${organisationId}
            and active = false
            and not exists (
              select 1 from organisation_members om
              where om.organisation_id = organisations.id
            )
            and not exists (
              select 1 from event_organisations eo
              where eo.organisation_id = organisations.id
            )
        `;
      }
      throw error;
    }

    return {
      claimId,
      organisationId,
      submissionId,
      status: "submitted",
      verificationStatus,
    };
  });

