import { getSql, type Sql } from "@/lib/db";
import { sendSignupEmail, signupAlertsReady } from "@/lib/auth/signup-alerts.server";

const REVIEW_URL = "https://update.athrecs.com/admin/event-register";
type AlertEmail = Parameters<typeof sendSignupEmail>[0];
type Delivery = {
  id: number;
  recipient: string;
  submission: {
    name: string;
    email: string;
    createdAt: string;
    raceName: string;
    racePath: string;
    suggestion: string;
    evidenceUrl: string;
    syntheticTest: boolean;
  };
  email_payload: AlertEmail | null;
  retry_expired: boolean;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailFor(row: Delivery): AlertEmail {
  const submission = row.submission;
  const submittedAt = new Date(submission.createdAt).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
  const name = submission.name.replace(/\s+/g, " ").trim() || "Not supplied";
  const raceName = submission.raceName.replace(/\s+/g, " ").trim();
  const text = `A fixture correction has been submitted to AthRecs and is awaiting review.\n\nRace: ${raceName}\nRace page: https://www.athrecs.com${submission.racePath}\nSubmitted: ${submittedAt}\nName: ${name}\nEmail: ${submission.email}\n\nSuggested correction:\n${submission.suggestion}\n\nSupporting link: ${submission.evidenceUrl || "Not supplied"}\n\nReview suggested race edits: ${REVIEW_URL}`;
  return {
    from: "paul@athrecs.com",
    to: [row.recipient],
    subject: `${submission.syntheticTest ? "[FICTIONAL TEST] " : ""}AthRecs fixture correction — ${raceName.slice(0, 150)}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:560px"><h1 style="font-size:24px">AthRecs fixture correction</h1><p style="white-space:pre-line;line-height:1.6">${escapeHtml(text)}</p><a href="${REVIEW_URL}">Review suggested race edits</a></div>`,
  };
}

/** Reserve each recipient independently and freeze the email before contacting the provider. */
export async function deliverRaceEditAlerts(
  sql: Sql,
  suggestionId?: number,
  send = sendSignupEmail,
) {
  const rows = await sql.transaction(async (tx) => {
    const pending = await tx<Delivery>`select *,
      first_attempt_at < now()-interval '23 hours' as retry_expired
      from race_edit_alert_deliveries
      where sent_at is null and not needs_review and next_attempt_at<=now()
        and (${suggestionId ?? null}::bigint is null or suggestion_id=${suggestionId ?? null})
      order by next_attempt_at,id limit 2 for update skip locked`;
    const ready: Array<Delivery & { email_payload: AlertEmail }> = [];
    for (const row of pending) {
      if (row.retry_expired) {
        await tx`update race_edit_alert_deliveries set needs_review=true,
          last_error='Delivery was not confirmed within the safe retry window. Check the email provider.' where id=${row.id}`;
        continue;
      }
      const payload = row.email_payload ?? emailFor(row);
      await tx`update race_edit_alert_deliveries set email_payload=${JSON.stringify(payload)}::jsonb,
        attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),
        next_attempt_at=now()+interval '1 minute' where id=${row.id}`;
      ready.push({ ...row, email_payload: payload });
    }
    return ready;
  });
  const outcomes = await Promise.all(
    rows.map(async (row) => {
      try {
        const providerId = await send(row.email_payload, `athrecs-race-edit-${row.id}`);
        await sql`update race_edit_alert_deliveries set sent_at=coalesce(sent_at,now()),
        provider_id=${providerId},last_error=null where id=${row.id}`;
        return true;
      } catch {
        await sql`update race_edit_alert_deliveries set last_error='Email delivery could not be confirmed; a retry is queued.' where id=${row.id} and sent_at is null`;
        return false;
      }
    }),
  );
  return { sent: outcomes.filter(Boolean).length, failed: outcomes.filter((v) => !v).length };
}

/** Call only after the suggestion transaction commits; the existing worker retries outages. */
export async function notifyRaceEdit(suggestionId: number) {
  if (!signupAlertsReady()) return;
  try {
    await deliverRaceEditAlerts(await getSql(), suggestionId);
  } catch {
    console.error("[race-edit-alerts] Immediate delivery failed; alerts remain queued.");
  }
}
