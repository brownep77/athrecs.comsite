import type { Sql } from "../db";
import { claimAlertReadiness } from "./result-claim-alerts.server";
import { notifyProfileResultsConfirmed } from "./result-claim-email.server";

/** Durable, bounded retries use the same frozen payload and provider key. */
export async function deliverProfileResultReceipts(sql: Sql, id?: string) {
  const ready = claimAlertReadiness();
  if (!ready.production || !ready.persistent || !ready.emailConfigured)
    return { sent: 0, paused: true };
  let sent = 0;
  for (let i = 0; i < 3; i++) {
    const row = await sql.transaction(async (tx) => {
      const [next] = await tx<{
        id: string;
        email_payload: Parameters<typeof notifyProfileResultsConfirmed>[0];
        expired: boolean;
      }>`
        select id::text,email_payload,email_first_attempt_at < now()-interval '23 hours' as expired
        from athlete_profile_result_confirmations where email_payload is not null and email_sent_at is null
          and not email_needs_review and email_next_attempt_at<=now() and (${id ?? null}::uuid is null or id=${id ?? null}::uuid)
        order by created_at,id limit 1 for update skip locked`;
      if (!next) return null;
      if (next.expired) {
        await tx`update athlete_profile_result_confirmations set email_needs_review=true where id=${next.id}::uuid`;
        return null;
      }
      await tx`update athlete_profile_result_confirmations set email_first_attempt_at=coalesce(email_first_attempt_at,now()),
        email_next_attempt_at=now()+interval '10 minutes' where id=${next.id}::uuid`;
      return next;
    });
    if (!row) break;
    try {
      await notifyProfileResultsConfirmed(row.email_payload);
      await sql`update athlete_profile_result_confirmations set email_sent_at=now() where id=${row.id}::uuid`;
      sent++;
    } catch {
      console.error("[claim-email] summary receipt queued for retry");
    }
  }
  return { sent, paused: false };
}
