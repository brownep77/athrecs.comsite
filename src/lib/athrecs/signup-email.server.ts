import { dbSource, getSql, type Sql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { authEmailConfigured } from "@/lib/auth/email.server";
import { formatAthleteId } from "./athlete-id";

type Signup = {
  id: string;
  name: string;
  email: string;
  athlete_number: string | null;
  created_at: string | Date;
  verified: boolean;
};
type Payload = { from: string; to: string[]; subject: string; text: string; html: string };

export function signupEmailReadiness() {
  const recipient = process.env.ATHRECS_SIGNUP_EMAIL_TO?.trim() ?? "";
  return {
    production: process.env.VERCEL_ENV === "production" && !IS_RUNRECS_SITE,
    persistent: dbSource === "neon",
    emailConfigured: authEmailConfigured(),
    recipientConfigured: /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(recipient),
    retriesConfigured: Boolean(process.env.CRON_SECRET?.trim()),
  };
}

export function signupEmailsEnabled(): boolean {
  return Object.values(signupEmailReadiness()).every(Boolean);
}

const escape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function signupDetails(row: Signup): string[] {
  return [
    row.name.trim() || "Not supplied",
    row.email,
    row.athlete_number ? formatAthleteId(row.athlete_number) : "Not yet assigned",
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      dateStyle: "medium",
      timeStyle: "long",
    }).format(new Date(row.created_at)),
    row.verified ? "Verified" : "Not yet verified",
  ];
}

export function signupEmailPayload(rows: Signup[], subject: string, introduction: string): Payload {
  const headings = [
    "Name",
    "Email address",
    "Athlete record number",
    "Signup date",
    "Email status",
  ];
  const data = rows.map(signupDetails);
  const text = [
    introduction,
    ...data.map((row) => row.map((value, i) => `${headings[i]}: ${value}`).join("\n")),
    "Private administrator notification. Dates use Europe/London (GMT/BST).",
  ].join("\n\n");
  const html = `<!doctype html><html lang="en"><body style="font-family:Arial,sans-serif;color:#17212b">
    <h1>${escape(subject)}</h1><p>${escape(introduction)}</p>
    ${
      rows.length
        ? `<table cellpadding="10" cellspacing="0" style="border-collapse:collapse;text-align:left">
      <thead><tr>${headings.map((heading) => `<th style="border-bottom:2px solid #0891b2">${heading}</th>`).join("")}</tr></thead>
      <tbody>${data.map((row) => `<tr>${row.map((value) => `<td style="border-bottom:1px solid #ddd">${escape(value)}</td>`).join("")}</tr>`).join("")}</tbody></table>`
        : ""
    }
    <p>Private administrator notification. Dates use Europe/London (GMT/BST).</p></body></html>`;
  return {
    from:
      process.env.ATHRECS_SIGNUP_EMAIL_FROM?.trim() ||
      "ATHRECS Notifications <notifications@athrecs.com>",
    to: [process.env.ATHRECS_SIGNUP_EMAIL_TO!.trim()],
    subject,
    text,
    html,
  };
}

async function queueImmediate(sql: Sql, userIds?: string[]) {
  await sql.transaction(async (tx) => {
    const rows = await tx<Signup>`
      select u.id, u.name, u.email, u."createdAt" as created_at, u."emailVerified" as verified,
        identifier.number::text as athlete_number
      from signup_email_events event join "user" u on u.id = event.user_id
      left join athlete_identifiers identifier on identifier.user_id = u.id
      where event.prepared_at is null
        and (${userIds ?? null}::text[] is null or event.user_id = any(${userIds ?? null}::text[]))
      order by event.created_at limit 20 for update of event skip locked
    `;
    for (const row of rows) {
      const payload = signupEmailPayload(
        [row],
        "ATHRECS — new user signed up",
        "A new account has been created on AthRecs.",
      );
      await tx`insert into signup_email_deliveries(event_key, user_id, payload)
        values (${`signup:${row.id}`}, ${row.id}, ${JSON.stringify(payload)}::jsonb)
        on conflict do nothing`;
      await tx`update signup_email_events set prepared_at = now() where user_id = ${row.id}`;
    }
  });
}

export async function queueSignupDigest(sql: Sql, now = new Date()) {
  // Calendar boundaries in Postgres include 23-hour and 25-hour DST days.
  await sql.transaction(async (tx) => {
    const days = await tx<{ day: string }>`
      select (last_queued_date + 1)::text as day from signup_email_schedule
      where last_queued_date + 1 <=
        (${now.toISOString()}::timestamptz at time zone 'Europe/London' - interval '8 hours')::date - 1
      for update skip locked
    `;
    if (!days.length) return;
    const day = days[0].day;
    const rows = await tx<Signup>`
      select u.id, u.name, u.email, u."createdAt" as created_at, u."emailVerified" as verified,
        identifier.number::text as athlete_number
      from "user" u left join athlete_identifiers identifier on identifier.user_id = u.id
      where u."createdAt" >= (${day}::date::timestamp at time zone 'Europe/London')
        and u."createdAt" < ((${day}::date + 1)::timestamp at time zone 'Europe/London')
      order by u."createdAt", u.id
    `;
    const parts = Math.max(1, Math.ceil(rows.length / 200));
    for (let page = 0; page < parts; page++) {
      const suffix = parts > 1 ? ` — part ${page + 1}/${parts}` : "";
      const subject = `ATHRECS — daily signups — ${day} — ${rows.length} new user${rows.length === 1 ? "" : "s"}${suffix}`;
      const intro = `${rows.length} new user${rows.length === 1 ? "" : "s"} signed up on ${day} (UK calendar day).${rows.length ? "" : " No new signups today."}${suffix}`;
      const payload = signupEmailPayload(rows.slice(page * 200, (page + 1) * 200), subject, intro);
      await tx`insert into signup_email_deliveries(event_key, payload)
        values (${`digest:${day}:${page + 1}`}, ${JSON.stringify(payload)}::jsonb) on conflict do nothing`;
    }
    await tx`update signup_email_schedule set last_queued_date = ${day}::date where id`;
  });
}

export async function deliverSignupEmails(
  sql: Sql,
  includeDigest = false,
  now = new Date(),
  userIds?: string[],
) {
  if (!signupEmailsEnabled()) return { sent: 0, failed: 0, paused: true };
  await queueImmediate(sql, userIds);
  if (includeDigest) await queueSignupDigest(sql, now);
  let sent = 0;
  let failed = 0;
  for (let i = 0; i < (includeDigest ? 20 : 1); i++) {
    // Commit the reservation before the network request. Frozen payloads and
    // stable keys cover an interrupted response within Resend's 24h window.
    const row = await sql.transaction(async (tx) => {
      const [delivery] = await tx<{ id: number; payload: Payload; expired: boolean }>`
        select id, payload, first_attempt_at < now() - interval '23 hours' as expired
        from signup_email_deliveries where sent_at is null and not needs_review
          and next_attempt_at <= now()
          and (${userIds ?? null}::text[] is null or user_id = any(${userIds ?? null}::text[]))
        order by next_attempt_at, id limit 1 for update skip locked
      `;
      if (!delivery) return null;
      if (delivery.expired) {
        await tx`update signup_email_deliveries set needs_review = true,
          last_error = 'Check provider receipt before retrying outside the safe window.' where id = ${delivery.id}`;
        return "expired" as const;
      }
      await tx`update signup_email_deliveries set attempts = attempts + 1,
        first_attempt_at = coalesce(first_attempt_at, now()), next_attempt_at = now() + interval '10 minutes'
        where id = ${delivery.id}`;
      return delivery;
    });
    if (!row) break;
    if (row === "expired") {
      failed++;
      continue;
    }
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `athrecs-signup-email-${row.id}`,
        },
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify(row.payload),
      });
      if (!response.ok) throw new Error("Email delivery failed");
      await sql`update signup_email_deliveries set sent_at = coalesce(sent_at, now()), last_error = null where id = ${row.id}`;
      sent++;
    } catch {
      await sql`update signup_email_deliveries set last_error = 'Email delivery unconfirmed; retry queued.' where id = ${row.id} and sent_at is null`;
      failed++;
    }
  }
  return { sent, failed, paused: false };
}

/** After auth commits, attempt immediate delivery without failing the signup. */
export async function flushSignupEmailsAfterAuth(userIds: string[]) {
  if (!signupEmailsEnabled()) return;
  try {
    await deliverSignupEmails(await getSql(), false, new Date(), userIds);
  } catch {
    console.error("[signup-email] Immediate delivery deferred to the scheduled worker");
  }
}
