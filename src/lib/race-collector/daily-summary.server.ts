/**
 * 08:00 and 18:00 (London) fixture and results summary for the owner
 * (owner instruction, 7 November 2026). One email per London date and slot.
 */
import { dbSource, type Sql } from "../db.ts";
import { isStaffNotificationRecipient } from "../auth/staff-notifications.server.ts";
import { londonDate } from "./autoingest.server.ts";

export const SUMMARY_SLOTS = [8, 18] as const;
const STAFF = "https://update.athrecs.com";

export type DayCounts = {
  fixturesAdded: number;
  fixturesAddedAutomatically: number;
  eventsTookPlace: number;
  resultsAdded: number;
  archiveResultsAdded: number;
};
export type SummaryCounts = {
  date: string;
  slot: number;
  today: DayCounts;
  yesterday: DayCounts | null;
  waiting: { duplicates: number; missing: number; researching: number; queued: number };
  awaitingResults: number;
};

function emailKey() {
  return (
    process.env.ATHRECS_INVITATION_RESEND_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim()
  );
}

export function summaryRecipient() {
  const to = process.env.FIXTURE_SUMMARY_TO?.trim() || "paul@athrecs.com";
  return isStaffNotificationRecipient(to) ? to : "paul@athrecs.com";
}

export function summaryReady() {
  return process.env.VERCEL_ENV === "production" && dbSource === "neon" && Boolean(emailKey());
}

/** Which slot is due now, if any: the London hour must be 08 or 18. */
export function dueSlot(at = new Date()): number | null {
  const hour = Number(
    at.toLocaleString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hour12: false }),
  );
  return (SUMMARY_SLOTS as readonly number[]).includes(hour) ? hour : null;
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function dayCounts(sql: Sql, day: string): Promise<DayCounts> {
  const londonDay = (column: string) => `(${column} at time zone 'Europe/London')::date = $1::date`;
  const one = async (query: string) => {
    try {
      return Number((await sql.query<{ n: number }>(query, [day]))[0]?.n ?? 0);
    } catch {
      return 0; // A table missing on a preview database must not stop the email.
    }
  };
  return {
    fixturesAdded: await one(
      `select count(*)::int n from editions where ${londonDay("stats_created_at")}`,
    ),
    fixturesAddedAutomatically: await one(
      `select count(*)::int n from fixture_autoingest_rows where status='published' and ${londonDay("published_at")}`,
    ),
    eventsTookPlace: await one(
      `select count(distinct event_id)::int n from editions where event_date=$1::date and coalesce(status,'')<>'Cancelled'`,
    ),
    resultsAdded: await one(
      `select count(*)::int n from results where ${londonDay("stats_created_at")}`,
    ),
    archiveResultsAdded: await one(
      `select count(*)::int n from result_archive_entries where ${londonDay("created_at")}`,
    ),
  };
}

export async function summaryCounts(sql: Sql, date: string, slot: number): Promise<SummaryCounts> {
  const [waiting] = await sql<{
    duplicates: number;
    missing: number;
    researching: number;
    queued: number;
  }>`
    select
      count(*) filter (where r.status='duplicate' and r.resolved_at is null
        and (c.id is null or (c.dismissed_at is null and c.kept_at is null and c.status<>'staged')))::int duplicates,
      count(*) filter (where r.status='missing' and r.resolved_at is null)::int missing,
      count(*) filter (where r.status='enrich')::int researching,
      count(*) filter (where r.status in ('queued','failed'))::int queued
    from fixture_autoingest_rows r
    left join race_collector_candidates c on c.id=r.candidate_id`;
  const [awaiting] = await sql<{
    n: number;
  }>`select count(*)::int n from fixture_results_queue where status='waiting'`;
  return {
    date,
    slot,
    today: await dayCounts(sql, date),
    yesterday: slot === 8 ? await dayCounts(sql, addDays(date, -1)) : null,
    waiting,
    awaitingResults: awaiting?.n ?? 0,
  };
}

const n = (v: number) => v.toLocaleString("en-GB");
function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function summaryEmail(c: SummaryCounts, to: string) {
  const when = c.slot === 8 ? "morning" : "evening";
  const block = (label: string, d: DayCounts) => [
    `${label}`,
    `  Fixtures added: ${n(d.fixturesAdded)} (${n(d.fixturesAddedAutomatically)} automatically)`,
    `  Events that took place: ${n(d.eventsTookPlace)}`,
    `  Results brought in: ${n(d.resultsAdded)} on profiles, ${n(d.archiveResultsAdded)} in the results archive`,
  ];
  const needs = c.waiting.duplicates + c.waiting.missing;
  const lines = [
    `AthRecs ${when} summary, ${c.date}`,
    "",
    ...block(c.slot === 8 ? "Today so far" : "Today", c.today),
    ...(c.yesterday ? ["", ...block("Yesterday (full day)", c.yesterday)] : []),
    "",
    needs
      ? `Waiting for you: ${n(needs)} (${n(c.waiting.duplicates)} possible duplicates, ${n(c.waiting.missing)} with missing details)`
      : "Waiting for you: nothing",
    `Still being checked automatically: ${n(c.waiting.researching + c.waiting.queued)}`,
    `Races finished and waiting for results: ${n(c.awaitingResults)}`,
    "",
    `Review: ${STAFF}/admin/fixture-autoingest`,
  ];
  const text = lines.join("\n");
  return {
    from: "paul@athrecs.com",
    to: [to],
    subject: `AthRecs ${when} summary: ${n(c.today.fixturesAdded)} fixtures added${needs ? `, ${n(needs)} for you` : ""}`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:560px"><img src="https://www.athrecs.com/athrecs-logo.png" alt="AthRecs.com" width="252" /><pre style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(text)}</pre><a href="${STAFF}/admin/fixture-autoingest">Open the fixture intake page</a></div>`,
  };
}

type Email = ReturnType<typeof summaryEmail>;

export async function sendSummaryEmail(email: Email, idempotencyKey: string) {
  const key = emailKey();
  if (!key) throw new Error("Summary email is not configured");
  if (email.to.length !== 1 || !isStaffNotificationRecipient(email.to[0]))
    throw new Error("Invalid summary recipient");
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
  if (!response.ok) throw new Error(`Summary email provider returned ${response.status}`);
  const receipt = await response.json();
  if (typeof receipt.id !== "string") throw new Error("Summary email receipt was missing");
  return receipt.id as string;
}

/** Sends the due slot once. Safe to call every hour or more often. */
export async function deliverDailySummary(
  sql: Sql,
  at = new Date(),
  send: (email: Email, key: string) => Promise<string> = sendSummaryEmail,
) {
  const slot = dueSlot(at);
  if (slot === null) return { skipped: "Not a summary hour in London" };
  const date = londonDate(at);
  const slotKey = `${date}:${String(slot).padStart(2, "0")}`;
  const [existing] = await sql<{ sent_at: string | null; payload: Email }>`
    select sent_at::text,payload from fixture_summary_deliveries where slot_key=${slotKey}`;
  if (existing?.sent_at) return { skipped: "Already sent", slotKey };
  const to = summaryRecipient();
  const email = existing?.payload ?? summaryEmail(await summaryCounts(sql, date, slot), to);
  await sql`insert into fixture_summary_deliveries(slot_key,recipient,payload)
    values(${slotKey},${to},${JSON.stringify(email)}::jsonb) on conflict(slot_key) do nothing`;
  try {
    const id = await send(email, `athrecs-fixture-summary-${slotKey}`);
    await sql`update fixture_summary_deliveries set sent_at=now(),provider_id=${id},last_error=null where slot_key=${slotKey}`;
    return { sent: true, slotKey };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await sql`update fixture_summary_deliveries set last_error=${message.slice(0, 300)} where slot_key=${slotKey}`;
    return { sent: false, slotKey, error: message };
  }
}
