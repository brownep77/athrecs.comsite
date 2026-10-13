import { getSql, type Sql } from "@/lib/db";
import { sendAthrecsAuthEmail } from "./email.server";
import { signupAlertsReady } from "./signup-alerts.server";
import { invitationWelcomeMessage } from "@/lib/athrecs/invitation-welcome";

type WelcomeEmail = Parameters<typeof sendAthrecsAuthEmail>[0];

export async function deliverSignupWelcomes(
  sql: Sql,
  userId?: string,
  send = sendAthrecsAuthEmail,
) {
  const ready = await sql.transaction(async (tx) => {
    const rows = await tx<{
      user_id: string;
      email: string;
      name: string;
      recipient: string | null;
      email_payload: WelcomeEmail | null;
      retry_expired: boolean;
      already_welcomed: boolean;
    }>`select w.user_id,u.email,coalesce(nullif(p.full_name,''),u.name) as name,w.recipient,w.email_payload,
      w.first_attempt_at<now()-interval '23 hours' as retry_expired,
      (exists(select 1 from athlete_messages m where lower(m.contact)=lower(u.email)
          and m.status='accepted' and m.source_key like 'invitation-welcome/%')
       or exists(select 1 from athlete_claim_invitations i where lower(i.recipient_email)=lower(u.email)
          and i.welcome_attempt_id is not null and i.email_sent_at is not null
          and i.reserved_until is null and not i.delivery_error)) as already_welcomed
      from signup_welcome_deliveries w join "user" u on u.id=w.user_id
      left join athlete_private_profiles p on p.user_id=u.id
      where w.sent_at is null and w.skipped_reason is null and not w.needs_review
        and w.next_attempt_at<=now() and u."emailVerified"=true
        and (${userId ?? null}::text is null or w.user_id=${userId ?? null})
      order by w.next_attempt_at,w.user_id limit 1 for update of w skip locked`;
    const jobs: Array<{ userId: string; email: WelcomeEmail }> = [];
    for (const row of rows) {
      if (row.recipient && row.recipient.toLowerCase() !== row.email.toLowerCase()) {
        await tx`update signup_welcome_deliveries set skipped_reason='email_changed' where user_id=${row.user_id}`;
      } else if (!row.email_payload && row.already_welcomed) {
        await tx`update signup_welcome_deliveries set skipped_reason='invitation_welcome_sent' where user_id=${row.user_id}`;
      } else if (row.retry_expired) {
        await tx`update signup_welcome_deliveries set needs_review=true,
          last_error='Welcome delivery was not confirmed within the safe retry window.' where user_id=${row.user_id}`;
      } else {
        const email: WelcomeEmail = row.email_payload ?? {
          to: row.email,
          subject: "Welcome to AthRecs",
          heading: "Welcome to AthRecs",
          message: invitationWelcomeMessage(row.name),
          actionLabel: "Claim my athlete profile",
          actionUrl: "https://www.athrecs.com/athlete-account?section=potential",
        };
        await tx`update signup_welcome_deliveries set recipient=${email.to},email_payload=${JSON.stringify(email)}::jsonb,
          attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),next_attempt_at=now()+interval '1 minute'
          where user_id=${row.user_id}`;
        jobs.push({ userId: row.user_id, email });
      }
    }
    return jobs;
  });
  let sent = 0;
  let failed = 0;
  for (const job of ready) {
    try {
      await send(job.email, {
        from: "paul@athrecs.com",
        replyTo: "paul@athrecs.com",
        apiKey: process.env.ATHRECS_INVITATION_RESEND_API_KEY,
        idempotencyKey: `signup-welcome/${job.userId}`,
      });
      await sql`update signup_welcome_deliveries set sent_at=coalesce(sent_at,now()),last_error=null where user_id=${job.userId}`;
      sent++;
    } catch {
      await sql`update signup_welcome_deliveries set last_error='Welcome delivery could not be confirmed; a retry is queued.' where user_id=${job.userId} and sent_at is null`;
      failed++;
    }
  }
  return { sent, failed };
}

export async function welcomeNewSignup(userId: string) {
  if (!signupAlertsReady()) return;
  try {
    await deliverSignupWelcomes(await getSql(), userId);
  } catch {
    console.error("[signup-welcome] Welcome remains queued for retry.");
  }
}
