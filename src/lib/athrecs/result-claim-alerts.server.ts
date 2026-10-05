import { timingSafeEqual } from "node:crypto";
import { dbSource, type Sql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { authEmailConfigured, sendAthrecsAuthEmail } from "@/lib/auth/email.server";
import { staffRecipients } from "./result-claim-email.server";

type Email = Parameters<typeof sendAthrecsAuthEmail>[0];

export function claimAlertReadiness() {
  return {
    production: process.env.VERCEL_ENV === "production" && !IS_RUNRECS_SITE,
    persistent: dbSource === "neon",
    emailConfigured: authEmailConfigured(),
    recipientCount: staffRecipients().length,
    retriesConfigured: Boolean(process.env.CRON_SECRET?.trim()),
  };
}

export function authorizedClaimAlertWorker(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Called inside the ownership transaction. No matching-name suggestion creates an alert. */
export async function queueClaimConflict(sql: Sql, claimId?: number): Promise<void> {
  await sql`
    insert into result_claim_alerts (claim_id, summary)
    select claim.id, athlete.display_name || ' — ' || event.name || ', ' ||
      edition.event_date::text || ', ' || edition.distance_code
    from result_claims claim
    join athletes athlete on athlete.id = claim.athlete_id
    join results result on result.id = claim.result_id
    join editions edition on edition.id = result.edition_id
    join events event on event.id = edition.event_id
    where (${claimId ?? null}::bigint is null or claim.id = ${claimId ?? null})
      and claim.status in ('pending', 'needs_info')
      and not exists (select 1 from result_claim_alerts alert where alert.claim_id = claim.id)
      and (
        exists (select 1 from athlete_account_links owner
          where owner.athlete_id = claim.athlete_id and owner.status = 'active'
            and owner.user_id <> claim.claimant_user_id)
        or exists (select 1 from result_claims other_claim
          where other_claim.athlete_id = claim.athlete_id
            and other_claim.claimant_user_id <> claim.claimant_user_id
            and other_claim.status in ('pending', 'needs_info', 'approved'))
      )
    order by claim.submitted_at limit 100
    on conflict (claim_id) do nothing
  `;
}

/** Freeze recipients and content before the first send, so retry keys reuse identical payloads. */
async function prepareDeliveries(sql: Sql, claimId?: number) {
  const recipients = staffRecipients();
  if (!recipients.length) return;
  await sql.transaction(async (tx) => {
    const rows = await tx<{ claim_id: number; summary: string }>`
      select alert.claim_id, alert.summary from result_claim_alerts alert
      where (${claimId ?? null}::bigint is null or alert.claim_id = ${claimId ?? null})
        and not exists (select 1 from result_claim_alert_deliveries delivery
          where delivery.claim_id = alert.claim_id)
      order by alert.created_at limit 10 for update skip locked
    `;
    for (const row of rows) {
      const staffHost = process.env.ATHRECS_STAFF_HOST?.trim() || "update.athrecs.com";
      for (const to of recipients) {
        const payload: Email = {
          to,
          subject: `ATHRECS ownership conflict — claim #${row.claim_id}`,
          heading: "A result has competing profile claims",
          message: `More than one account has claimed this athlete identity: ${row.summary}. When flagged, the new claim was held for staff review and the existing owner was not replaced. Open claim #${row.claim_id} to compare the accounts, evidence and current decision.`,
          actionLabel: "Review the conflict",
          actionUrl: `https://${staffHost}/admin/result-claims?claimId=${row.claim_id}`,
        };
        await tx`insert into result_claim_alert_deliveries (claim_id, recipient, email_payload)
          values (${row.claim_id}, ${to}, ${JSON.stringify(payload)}::jsonb)
          on conflict (claim_id, recipient) do nothing`;
      }
    }
  });
}

export async function deliverClaimConflictAlerts(sql: Sql, claimId?: number) {
  const ready = claimAlertReadiness();
  if (!ready.production || !ready.persistent || !ready.emailConfigured || !ready.recipientCount)
    return { sent: 0, failed: 0, paused: true };
  // Pick up unresolved historical conflicts too, including a request interrupted
  // before immediate delivery. Do not alert merely because two names match.
  await queueClaimConflict(sql, claimId);
  await prepareDeliveries(sql, claimId);
  let sent = 0;
  let failed = 0;
  // Each transaction locks just one delivery. Overlapping workers skip it.
  // Bound the batch and HTTP timeout to the serverless execution budget.
  for (let i = 0; i < 3; i++) {
    const outcome = await sql.transaction(async (tx) => {
      const rows = await tx<{
        id: number;
        email_payload: Email;
        attempts: number;
        retry_expired: boolean;
      }>`
        select id, email_payload, attempts,
          coalesce(first_attempt_at, created_at) < now() - interval '23 hours' as retry_expired
        from result_claim_alert_deliveries
        where sent_at is null and not needs_review and next_attempt_at <= now()
          and (${claimId ?? null}::bigint is null or claim_id = ${claimId ?? null})
        order by next_attempt_at, id limit 1 for update skip locked
      `;
      const row = rows[0];
      if (!row) return "empty";
      // Resend keeps idempotency keys for 24h. Don't blindly retry an ambiguous
      // delivery after that window: retain it visibly for staff investigation.
      if (row.retry_expired) {
        await tx`update result_claim_alert_deliveries set needs_review = true,
          last_error = 'Delivery could not be confirmed within the safe retry window. Check the email provider.'
          where id = ${row.id}`;
        return "failed";
      }
      try {
        await sendAthrecsAuthEmail(row.email_payload, {
          idempotencyKey: `athrecs-claim-conflict-${row.id}`,
        });
        await tx`update result_claim_alert_deliveries set sent_at = now(),
          attempts = attempts + 1, first_attempt_at = coalesce(first_attempt_at, now()),
          last_error = null where id = ${row.id}`;
        return "sent";
      } catch {
        await tx`update result_claim_alert_deliveries set attempts = attempts + 1,
          first_attempt_at = coalesce(first_attempt_at, now()),
          next_attempt_at = now() + interval '10 minutes',
          last_error = 'Email delivery failed; a retry is queued.' where id = ${row.id}`;
        return "failed";
      }
    });
    if (outcome === "empty") break;
    if (outcome === "sent") sent++;
    else failed++;
  }
  return { sent, failed, paused: false };
}

export async function claimAlertSummary(sql: Sql) {
  const rows = await sql<{
    pending: number;
    sent: number;
    needs_review: number;
    awaiting_setup: number;
  }>`
    select
      (select count(*)::int from result_claim_alert_deliveries
        where sent_at is null and not needs_review) as pending,
      (select count(*)::int from result_claim_alert_deliveries where sent_at is not null) as sent,
      (select count(*)::int from result_claim_alert_deliveries where needs_review) as needs_review,
      (select count(*)::int from result_claim_alerts alert where not exists (
        select 1 from result_claim_alert_deliveries delivery where delivery.claim_id = alert.claim_id
      )) as awaiting_setup
  `;
  return { ...claimAlertReadiness(), ...rows[0] };
}
