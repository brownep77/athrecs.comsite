import type { Sql } from "@/lib/db";
import { makeId } from "./verification";
import {
  asArray,
  asObject,
  booleanValue,
  json,
  numberValue,
  resolveDiscipline,
  resolveSport,
  text,
  type ApprovedItem,
  type SubmissionRecord,
} from "./application-common.server";

export async function applyAthleteResultClaim(
  sql: Sql,
  submission: SubmissionRecord,
  reviewerUserId: string,
): Promise<string> {
  const claimId = submission.entity_id;
  if (!claimId) throw new Error("Result claim is missing its claim id");
  const rows = await sql<{
    athlete_id: number;
    result_model: string;
    result_id: string;
    relationship: string;
  }>`
    select athlete_id, result_model, result_id, relationship
    from result_identity_claims
    where id = ${claimId}
    limit 1
  `;
  const claim = rows[0];
  if (!claim) throw new Error("Result claim no longer exists");

  if (claim.result_model === "generic") {
    if (claim.relationship === "contributor") {
      await sql`
        insert into result_contributions (
          result_id, athlete_id, contribution_role, participation_status, stats
        ) values (
          ${claim.result_id}, ${claim.athlete_id}, 'participant', 'participated',
          ${json({ source: "athlete_claim", claimId })}::jsonb
        )
        on conflict (result_id, athlete_id, contribution_role) do update set
          participation_status = 'participated',
          stats = result_contributions.stats || excluded.stats
      `;
      const updated = await sql<{ id: string }>`
        update competition_results
        set verification_status = 'athrecs_verified', verification_confidence = 100,
            verified_at = now(), verified_by_user_id = ${reviewerUserId},
            published_at = coalesce(published_at, now()), updated_at = now()
        where id = ${claim.result_id}
        returning id
      `;
      if (!updated[0]?.id) throw new Error("Claimed result no longer exists");
    } else {
      const updated = await sql<{ id: string }>`
        update competition_results
        set athlete_id = ${claim.athlete_id},
            verification_status = 'athrecs_verified', verification_confidence = 100,
            verified_at = now(), verified_by_user_id = ${reviewerUserId},
            published_at = coalesce(published_at, now()), updated_at = now()
        where id = ${claim.result_id}
        returning id
      `;
      if (!updated[0]?.id) throw new Error("Claimed result no longer exists");
    }
  } else if (claim.result_model === "legacy") {
    if (!/^\d+$/.test(claim.result_id)) throw new Error("Legacy result id is invalid");
    const updated = await sql<{ id: number }>`
      update results
      set athlete_id = ${claim.athlete_id}, verification_status = 'athrecs_verified',
          verification_confidence = 100, verified_at = now(),
          verified_by_user_id = ${reviewerUserId},
          source_submission_id = ${submission.id}, updated_at = now()
      where id = ${Number(claim.result_id)}
      returning id
    `;
    if (!updated[0]?.id) throw new Error("Claimed legacy result no longer exists");
  } else {
    throw new Error(`Unsupported result model: ${claim.result_model}`);
  }

  await sql`
    update result_identity_claims
    set status = 'approved', verification_level = 'athrecs_verified',
        reviewed_by_user_id = ${reviewerUserId},
        reviewed_at = coalesce(reviewed_at, now()), updated_at = now()
    where id = ${claimId}
  `;
  return claim.result_id;
}

export async function applyAthleteClaim(
  sql: Sql,
  submission: SubmissionRecord,
  reviewerUserId: string,
): Promise<string> {
  const claimId = submission.entity_id;
  if (!claimId) throw new Error("Athlete claim is missing its claim id");
  const rows = await sql<{
    athlete_id: number;
    user_id: string;
    relationship: string;
    permissions: Record<string, unknown>;
  }>`
    select athlete_id, user_id, relationship, permissions
    from athlete_claims
    where id = ${claimId}
    limit 1
  `;
  const claim = rows[0];
  if (!claim) throw new Error("Athlete claim no longer exists");
  await sql`
    update athlete_claims
    set status = 'approved', verification_level = 'relationship_verified',
        reviewed_by_user_id = ${reviewerUserId},
        reviewed_at = coalesce(reviewed_at, now())
    where id = ${claimId}
  `;
  await sql`
    update athletes
    set verification_status = case
          when verification_status in ('verified', 'identity_verified', 'athrecs_verified')
            then verification_status
          else 'profile_claimed'
        end,
        last_verified_at = now(), verified_by_user_id = ${reviewerUserId},
        updated_at = now()
    where id = ${claim.athlete_id}
  `;
  await sql`
    insert into athlete_verifications (
      id, athlete_id, verification_type, status, source, evidence,
      confidence, verified_at, verified_by_user_id
    ) values (
      ${makeId("verification")}, ${claim.athlete_id}, 'profile_claim', 'verified',
      'athrecs_manual_review',
      ${json({ claimId, relationship: claim.relationship, permissions: claim.permissions })}::jsonb,
      100, now(), ${reviewerUserId}
    )
  `;
  return String(claim.athlete_id);
}

export async function applyOrganisationClaim(
  sql: Sql,
  submission: SubmissionRecord,
  reviewerUserId: string,
): Promise<string> {
  const claimId = submission.entity_id;
  if (!claimId) throw new Error("Organisation claim is missing its claim id");
  const rows = await sql<{ organisation_id: number | null; user_id: string }>`
    select organisation_id, user_id
    from organisation_claims
    where id = ${claimId}
    limit 1
  `;
  const claim = rows[0];
  if (!claim?.organisation_id) throw new Error("Organisation claim is incomplete");
  await sql`
    update organisation_claims
    set status = 'approved', reviewed_by_user_id = ${reviewerUserId},
        reviewed_at = coalesce(reviewed_at, now())
    where id = ${claimId}
  `;
  await sql`
    update organisations
    set verification_status = 'verified', active = true,
        verified_at = coalesce(verified_at, now()),
        verified_by_user_id = ${reviewerUserId}, updated_at = now()
    where id = ${claim.organisation_id}
  `;
  await sql`
    insert into organisation_members (
      organisation_id, user_id, role, status, accepted_at
    ) values (
      ${claim.organisation_id}, ${claim.user_id}, 'owner', 'active', now()
    )
    on conflict (organisation_id, user_id) do update set
      role = 'owner', status = 'active', accepted_at = now(), updated_at = now()
  `;
  return String(claim.organisation_id);
}
