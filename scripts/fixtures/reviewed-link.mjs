// Disposable service tests only: explicitly represents a previously completed,
// independent ownership review. Browser claim tests must use the real staff RPC.
import assert from "node:assert/strict";

export async function seedReviewedLink(
  sql,
  { athleteId, userId, email, reviewerId, reviewerEmail },
) {
  assert(email.endsWith("@example.test") && reviewerEmail.endsWith("@example.test"));
  assert.notEqual(userId, reviewerId);
  assert.notEqual(email.toLowerCase(), reviewerEmail.toLowerCase());
  const [source] =
    await sql`insert into source_history_claim_results(athlete_id,provider,external_id,source_key,source_url,performance)
    values(${athleteId},'Synthetic ownership-review fixture',${`${athleteId}:${userId}`},'reviewed-ownership',
      'https://example.test/synthetic-ownership-review','{}'::jsonb) returning id`;
  const [claim] =
    await sql`insert into result_claims(source_result_id,athlete_id,claimant_user_id,claimant_email,status,
    verification_method,declaration_accepted,confirmation_method,reviewed_at,reviewed_by_user_id,reviewed_by_email,staff_note)
    values(${source.id},${athleteId},${userId},${email},'approved','club_confirmation',true,'staff',now(),${reviewerId},${reviewerEmail},
      'Synthetic independent club-officer response checked against this account.') returning id`;
  await sql`insert into athlete_account_links(athlete_id,user_id,user_email,status,source_claim_id,confirmation_method)
    values(${athleteId},${userId},${email},'active',${claim.id},'staff')
    on conflict(athlete_id) do update set source_claim_id=excluded.source_claim_id,confirmation_method='staff'`;
  return claim.id;
}
