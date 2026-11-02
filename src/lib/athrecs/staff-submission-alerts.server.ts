import { getSql, type Sql } from "@/lib/db";
import { sendSignupEmail, signupAlertsReady } from "@/lib/auth/signup-alerts.server";

type Email = Parameters<typeof sendSignupEmail>[0];
export type SubmissionValue =
  | string
  | number
  | boolean
  | null
  | SubmissionValue[]
  | { [label: string]: SubmissionValue };
export type StaffSubmissionField = { label: string; value: SubmissionValue };
export type StaffSubmissionKind =
  | "profile_correction"
  | "result_proposal"
  | "result_verification"
  | "club_application"
  | "partner_registration"
  | "partner_opportunity"
  | "partner_application"
  | "private_profile_save";

type Delivery = {
  id: number;
  recipient: string;
  event_kind: StaffSubmissionKind;
  event_key: string;
  created_at: string;
  review_path: string;
  submission: {
    name: string;
    email: string;
    syntheticTest: boolean;
    status: string;
    fields: StaffSubmissionField[];
  };
  email_payload: Email | null;
  retry_expired: boolean;
};

const titles: Record<StaffSubmissionKind, string> = {
  profile_correction: "Profile correction submitted",
  result_proposal: "Missing results submitted",
  result_verification: "Result verification requested",
  club_application: "Club application submitted",
  partner_registration: "Company registration submitted",
  partner_opportunity: "Partnership opportunity submitted",
  partner_application: "Partnership application submitted",
  private_profile_save: "Athlete account information saved",
};
const escapeHtml = (text: string) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function valueText(value: SubmissionValue): string {
  if (value === null || value === "") return "Not supplied";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (!value.length) return "None supplied";
    return value
      .map((item, index) =>
        typeof item === "object" && item !== null
          ? `${index + 1}. ${valueText(item)}`
          : valueText(item),
      )
      .join("\n");
  }
  if (typeof value === "object")
    return Object.entries(value)
      .map(([label, item]) => `${label}: ${valueText(item)}`)
      .join("\n");
  return String(value);
}

function emailFor(row: Delivery): Email {
  const title = titles[row.event_kind];
  const name = row.submission.name?.replace(/\s+/g, " ").trim() || "Not supplied";
  const reviewUrl = `https://update.athrecs.com${row.review_path}`;
  const submitted = new Date(row.created_at).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    timeZoneName: "short",
  });
  const fields = row.submission.fields
    .map(({ label, value }) => `${label}:\n${valueText(value)}`)
    .join("\n\n");
  const replyTo = /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(row.submission.email)
    ? row.submission.email
    : undefined;
  const text = `${title}\n\nName: ${name}\nEmail: ${row.submission.email}\nSubmitted: ${submitted}\nReference: ${row.event_kind}/${row.event_key}\nStatus at submission: ${row.submission.status}\n\n${fields}\n\nReview in the private staff area: ${reviewUrl}`;
  return {
    from: "paul@athrecs.com",
    to: [row.recipient],
    ...(replyTo ? { reply_to: replyTo } : {}),
    subject: `${row.submission.syntheticTest ? "[FICTIONAL TEST] " : ""}AthRecs ${title.toLowerCase()} — ${name.slice(0, 120)}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:640px"><h1 style="font-size:24px">${escapeHtml(title)}</h1><p style="white-space:pre-line;line-height:1.6">${escapeHtml(text)}</p><a href="${escapeHtml(reviewUrl)}">Review submitted information</a></div>`,
  };
}

/** Call inside the account-save transaction, after selecting explicit profile fields. */
export async function queuePrivateProfileSave(
  sql: Sql,
  userId: string,
  fields: StaffSubmissionField[],
  fingerprint: string,
): Promise<string> {
  if (!/^[a-f0-9]{32,64}$/.test(fingerprint) || !fields.length)
    throw new Error("Invalid profile notification snapshot");
  const [user] = await sql<{ id: string }>`select id from "user" where id=${userId} for update`;
  if (!user) throw new Error("Profile notification account is unavailable");
  const [latest] = await sql<{ event_key: string }>`select event_key
    from staff_submission_alert_deliveries
    where actor_user_id=${userId} and event_kind='private_profile_save'
    order by id desc limit 1`;
  // Compare only the immediately preceding snapshot. A real A → B → A change
  // needs a new notification even though A was submitted at an earlier time.
  if (latest?.event_key.endsWith(`:${fingerprint}`)) return latest.event_key;
  const [event] = await sql<{ event_key: string }>`select
    ${userId}::text||':'||gen_random_uuid()::text||':'||${fingerprint}::text as event_key`;
  await sql`select queue_staff_submission_alert('support','private_profile_save',
    ${event.event_key},${userId},
    ${JSON.stringify({ fields, status: "Saved by the athlete" })}::jsonb,
    '/admin/athlete-accounts?view=saved-details')`;
  return event.event_key;
}

/** Reserve and freeze each recipient independently before contacting the provider. */
export async function deliverStaffSubmissionAlerts(
  sql: Sql,
  eventKind?: StaffSubmissionKind,
  eventKey?: string,
  send = sendSignupEmail,
) {
  const rows = await sql.transaction(async (tx) => {
    const pending = await tx<Delivery>`select *,created_at::text,
      first_attempt_at < now()-interval '23 hours' as retry_expired
      from staff_submission_alert_deliveries
      where sent_at is null and not needs_review and next_attempt_at<=now()
        and (${eventKind ?? null}::text is null or event_kind=${eventKind ?? null})
        and (${eventKey ?? null}::text is null or event_key=${eventKey ?? null})
      order by next_attempt_at,id limit 6 for update skip locked`;
    const ready: Array<Delivery & { email_payload: Email }> = [];
    for (const row of pending) {
      if (row.retry_expired) {
        await tx`update staff_submission_alert_deliveries set needs_review=true,
          last_error='Delivery was not confirmed within the safe retry window. Check the email provider.' where id=${row.id}`;
        continue;
      }
      const payload = row.email_payload ?? emailFor(row);
      await tx`update staff_submission_alert_deliveries set email_payload=${JSON.stringify(payload)}::jsonb,
        attempts=attempts+1,first_attempt_at=coalesce(first_attempt_at,now()),
        next_attempt_at=now()+interval '1 minute' where id=${row.id}`;
      ready.push({ ...row, email_payload: payload });
    }
    return ready;
  });
  const outcomes = await Promise.all(
    rows.map(async (row) => {
      try {
        const providerId = await send(row.email_payload, `athrecs-submission-${row.id}`);
        await sql`update staff_submission_alert_deliveries set sent_at=coalesce(sent_at,now()),
          provider_id=${providerId},last_error=null where id=${row.id}`;
        return true;
      } catch {
        await sql`update staff_submission_alert_deliveries
          set last_error='Email delivery could not be confirmed; a retry is queued.'
          where id=${row.id} and sent_at is null`;
        return false;
      }
    }),
  );
  return { sent: outcomes.filter(Boolean).length, failed: outcomes.filter((sent) => !sent).length };
}

/** After commit, attempt delivery without turning an email outage into a failed save. */
export async function notifyStaffSubmission(eventKind?: StaffSubmissionKind, eventKey?: string) {
  if (!signupAlertsReady()) return;
  try {
    await deliverStaffSubmissionAlerts(await getSql(), eventKind, eventKey);
  } catch {
    console.error("[staff-submissions] Email delivery remains queued.");
  }
}
