import { dbSource, getSql, type Sql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const RECIPIENTS = ["paul@athrecs.com", "paultwbrowne@gmail.com"];
const SIGNUPS_URL = "https://update.athrecs.com/admin/athlete-accounts";
type SignupEmail = { from: string; to: string[]; subject: string; text: string; html: string };
type Delivery = {
  id: number;
  recipient: string;
  signup_name: string;
  signup_email: string;
  signup_at: string;
  email_verified: boolean;
  email_payload: SignupEmail | null;
  retry_expired: boolean;
};

function emailKey() {
  return (
    process.env.ATHRECS_INVITATION_RESEND_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim()
  );
}

export function signupAlertsReady() {
  return (
    process.env.VERCEL_ENV === "production" &&
    !IS_RUNRECS_SITE &&
    dbSource === "neon" &&
    Boolean(emailKey())
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emailFor(row: Delivery): SignupEmail {
  const joined = new Date(row.signup_at).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
  const name = row.signup_name.replace(/\s+/g, " ").trim().slice(0, 200) || "Not supplied";
  const text = `Someone has just signed up to AthRecs.\n\nName: ${name}\nEmail: ${row.signup_email}\nSigned up: ${joined}\nEmail verification: ${row.email_verified ? "Verified" : "Pending"}\n\nView signups: ${SIGNUPS_URL}`;
  return {
    from: "paul@athrecs.com",
    to: [row.recipient],
    subject:
      row.signup_email.toLowerCase() === "paul@athrecs.com"
        ? "[FICTIONAL TEST] New AthRecs signup"
        : "New AthRecs signup",
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:560px"><img src="https://www.athrecs.com/athrecs-logo.png" alt="AthRecs.com" width="252" /><h1 style="font-size:24px">New AthRecs signup</h1><p style="white-space:pre-line;line-height:1.6">${escapeHtml(text)}</p><a href="${SIGNUPS_URL}">View signed-up athletes</a></div>`,
  };
}

export async function sendSignupEmail(email: SignupEmail, idempotencyKey: string) {
  const key = emailKey();
  if (!key) throw new Error("Signup notification email is not configured");
  if (
    email.from !== "paul@athrecs.com" ||
    email.to.length !== 1 ||
    !RECIPIENTS.includes(email.to[0])
  )
    throw new Error("Invalid signup notification recipient");
  // Internal staff notifications must not be recorded as correspondence with an athlete.
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    signal: AbortSignal.timeout(8000),
    body: JSON.stringify(email),
  });
  if (!response.ok) throw new Error(`Signup notification provider returned ${response.status}`);
  const receipt = await response.json();
  if (typeof receipt.id !== "string") throw new Error("Signup notification receipt was missing");
  return receipt.id;
}

/** The transaction reserves each recipient independently before any email is sent. */
export async function deliverSignupAlerts(sql: Sql, userId?: string, send = sendSignupEmail) {
  const rows = await sql.transaction(async (tx) => {
    const pending = await tx<Delivery>`select *,signup_at::text,
      first_attempt_at < now()-interval '23 hours' as retry_expired
      from signup_alert_deliveries
      where sent_at is null and not needs_review and next_attempt_at<=now()
        and (${userId ?? null}::text is null or user_id=${userId ?? null})
      order by next_attempt_at,id limit 2 for update skip locked`;
    const ready: Array<Delivery & { email_payload: SignupEmail }> = [];
    for (const row of pending) {
      if (row.retry_expired) {
        await tx`update signup_alert_deliveries set needs_review=true,
          last_error='Delivery was not confirmed within the safe retry window. Check the email provider.' where id=${row.id}`;
        continue;
      }
      const payload = row.email_payload ?? emailFor(row);
      await tx`update signup_alert_deliveries set email_payload=${JSON.stringify(payload)}::jsonb,
        attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),
        next_attempt_at=now()+interval '1 minute' where id=${row.id}`;
      ready.push({ ...row, email_payload: payload });
    }
    return ready;
  });
  const outcomes = await Promise.all(
    rows.map(async (row) => {
      try {
        const providerId = await send(row.email_payload, `athrecs-signup-alert-${row.id}`);
        await sql`update signup_alert_deliveries set sent_at=coalesce(sent_at,now()),provider_id=${providerId},last_error=null where id=${row.id}`;
        return true;
      } catch {
        await sql`update signup_alert_deliveries set last_error='Email delivery could not be confirmed; a retry is queued.' where id=${row.id} and sent_at is null`;
        return false;
      }
    }),
  );
  return { sent: outcomes.filter(Boolean).length, failed: outcomes.filter((v) => !v).length };
}

/** Better Auth calls this after account creation commits, for all signup methods. */
export async function notifyNewSignup(userId: string) {
  if (!signupAlertsReady()) return;
  try {
    await deliverSignupAlerts(await getSql(), userId);
  } catch {
    // A mail outage must not fail signup; the committed outbox is retried by cron.
    console.error("[signup-alerts] Immediate delivery failed; alerts remain queued.");
  }
}
