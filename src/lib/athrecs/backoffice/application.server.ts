import type { Sql } from "@/lib/db";
import {
  json,
  type ApplicationSummary,
  type ApprovedItem,
  type SubmissionRecord,
} from "./application-common.server";
import { applyEventCreate } from "./application-event-create.server";
import { applyEventEdit } from "./application-event-edit.server";
import { applyResultItem } from "./application-result.server";
import { applyAthleteEdit } from "./application-athlete-profile.server";
import {
  applyAthleteClaim,
  applyAthleteResultClaim,
  applyOrganisationClaim,
} from "./application-athlete-claims.server";

export type { ApplicationSummary } from "./application-common.server";

async function markItemApplied(
  sql: Sql,
  itemId: string,
  targetId: string,
): Promise<void> {
  await sql`
    update submission_items
    set status = 'applied', target_id = ${targetId}, applied_at = now(), updated_at = now()
    where id = ${itemId}
  `;
}

export async function applyApprovedSubmission(
  sql: Sql,
  submissionId: string,
  reviewerUserId: string,
): Promise<ApplicationSummary> {
  const submissionRows = await sql<SubmissionRecord>`
    select id, submission_type, entity_type, entity_id, organisation_id,
           athlete_id, event_id, edition_id, competition_id, source_url,
           status, applied_at
    from data_submissions
    where id = ${submissionId}
    limit 1
  `;
  const submission = submissionRows[0];
  if (!submission) throw new Error("Submission not found");
  if (submission.status === "applied" || submission.applied_at) {
    return {
      submissionId,
      submissionType: submission.submission_type,
      status: "already_applied",
      appliedItemCount: 0,
      skippedItemCount: 0,
      entityIds: [],
    };
  }
  if (![
    "approved",
    "partially_approved",
    "application_failed",
  ].includes(submission.status)) {
    throw new Error("Submission must be manually approved before it can be applied");
  }

  const items = await sql<ApprovedItem>`
    select id, row_number, target_id, normalized_data, status, applied_at
    from submission_items
    where submission_id = ${submissionId}
      and status in ('approved', 'applied')
    order by row_number
  `;
  const pendingItems = items.filter((item) => !item.applied_at && item.status !== "applied");
  const entityIds: string[] = [];

  try {
    for (const item of pendingItems) {
      let targetId: string;
      if (submission.submission_type === "event_create") {
        targetId = await applyEventCreate(sql, submission, item, reviewerUserId);
      } else if (submission.submission_type === "event_edit") {
        targetId = await applyEventEdit(sql, submission, item, reviewerUserId);
      } else if (
        submission.submission_type === "results_upload" ||
        submission.submission_type === "athlete_result_add"
      ) {
        targetId = await applyResultItem(sql, submission, item, reviewerUserId);
      } else if (submission.submission_type === "athlete_result_claim") {
        targetId = await applyAthleteResultClaim(sql, submission, reviewerUserId);
      } else if (submission.submission_type === "athlete_edit") {
        targetId = await applyAthleteEdit(sql, submission, item, reviewerUserId);
      } else if (submission.submission_type === "athlete_claim") {
        targetId = await applyAthleteClaim(sql, submission, reviewerUserId);
      } else if (submission.submission_type === "organisation_claim") {
        targetId = await applyOrganisationClaim(sql, submission, reviewerUserId);
      } else {
        throw new Error(`Unsupported submission type: ${submission.submission_type}`);
      }
      await markItemApplied(sql, item.id, targetId);
      entityIds.push(targetId);
    }

    const remaining = await sql<{ n: number }>`
      select count(*)::int as n
      from submission_items
      where submission_id = ${submissionId}
        and status = 'approved'
        and applied_at is null
    `;
    const rejected = await sql<{ n: number }>`
      select count(*)::int as n
      from submission_items
      where submission_id = ${submissionId}
        and status in ('rejected', 'rejected_by_reviewer')
    `;
    const finalStatus = rejected[0]?.n ? "partially_applied" : "applied";
    if ((remaining[0]?.n ?? 0) === 0) {
      await sql`
        update data_submissions
        set status = ${finalStatus}, applied_at = now(),
            summary = summary || ${json({
              applicationStatus: finalStatus,
              appliedItemCount: pendingItems.length,
              appliedEntityIds: entityIds,
            })}::jsonb,
            updated_at = now()
        where id = ${submissionId}
      `;
    }
    await sql`
      insert into data_audit_log (
        actor_user_id, organisation_id, action, entity_type, entity_id,
        submission_id, after_data, reason
      ) values (
        ${reviewerUserId}, ${submission.organisation_id}, 'submission.applied',
        ${submission.entity_type}, ${submission.entity_id ?? submission.id},
        ${submission.id}, ${json({ finalStatus, entityIds })}::jsonb,
        'Applied after Athrecs manual approval'
      )
    `;
    return {
      submissionId,
      submissionType: submission.submission_type,
      status: finalStatus,
      appliedItemCount: pendingItems.length,
      skippedItemCount: items.length - pendingItems.length,
      entityIds,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sql`
      update data_submissions
      set status = 'application_failed',
          summary = summary || ${json({ applicationStatus: "failed", applicationError: message })}::jsonb,
          updated_at = now()
      where id = ${submissionId}
    `;
    throw error;
  }
}
