// Partnership emails to fixture sources that refuse automated collection
// (owner request, 7 November 2026). Sent only when the site's own robots.txt
// disallows the listing, at most once per source and per address, from
// info@athrecs.com with replies to the same inbox. Sending is switched on by
// SOURCE_OUTREACH_ENABLED=true; otherwise calls report what would be sent.
import { getSql, type Sql } from "../db";

export const OUTREACH_FROM = "AthRecs <info@athrecs.com>";
export const OUTREACH_REPLY_TO = "info@athrecs.com";
const MAX_PER_CALL = 25;

export type OutreachTarget = {
  sourceId: string;
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  reason: string;
};

export function outreachEnabled(): boolean {
  return process.env.SOURCE_OUTREACH_ENABLED === "true";
}

export function outreachEmail(target: OutreachTarget) {
  const name = target.siteName.trim() || new URL(target.siteUrl).hostname;
  const text = [
    `Hello ${name} team,`,
    "",
    "I'm Paul Browne from AthRecs (athrecs.com), a free site that helps people find races near them, as runners and as spectators, and keeps a lasting record of athletes' results.",
    "",
    "We'd love to help more people hear about your events. Each listing would show the date, distance and place, and link straight back to your own website for details and entries, so interested runners and supporters come to you.",
    "",
    "Your website asks automated tools not to collect its pages, so we haven't. Would you be happy for us to list your races? If so, whatever is easiest for you works for us: a link we're welcome to use, a calendar feed, a spreadsheet, or simply a reply with your upcoming dates.",
    "",
    "If you'd rather not, just reply to say so and we won't contact you again.",
    "",
    "Best wishes,",
    "Paul Browne",
    "AthRecs · info@athrecs.com · https://www.athrecs.com",
  ].join("\n");
  const escape = (value: string) => value.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
  return {
    from: OUTREACH_FROM,
    to: [target.contactEmail],
    reply_to: OUTREACH_REPLY_TO,
    subject: `Sharing your races with more runners and spectators – AthRecs`,
    text,
    html: `<div style="font-family:Arial,sans-serif;color:#17212b;max-width:560px;line-height:1.6;white-space:pre-line">${escape(text)}</div>`,
  };
}

async function deliver(
  email: ReturnType<typeof outreachEmail>,
  key: string,
  idempotencyKey: string,
) {
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
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  const receipt = (await response.json()) as { id?: unknown };
  if (typeof receipt.id !== "string") throw new Error("Email receipt was missing");
  return receipt.id;
}

const validEmail = (value: string) => /^[^\s<>@,;]+@[^\s<>@,;]+\.[a-z]{2,}$/i.test(value);

export async function sendSourceOutreach(
  targets: OutreachTarget[],
  options: { sqlOverride?: Sql; send?: typeof deliver } = {},
) {
  const sql = options.sqlOverride ?? (await getSql());
  const send = options.send ?? deliver;
  const enabled = outreachEnabled();
  const key = process.env.RESEND_API_KEY?.trim() ?? "";
  const results: { sourceId: string; status: string; contactEmail: string }[] = [];
  for (const target of targets.slice(0, MAX_PER_CALL)) {
    const email = target.contactEmail.trim().toLowerCase();
    // Only an explicit refusal by the site's robots.txt qualifies.
    if (!/robots\.txt/i.test(target.reason)) {
      results.push({ sourceId: target.sourceId, status: "not_refused", contactEmail: email });
      continue;
    }
    const [existing] = await sql<{ status: string }>`
      select status from source_outreach where source_id=${target.sourceId}`;
    if (existing && existing.status !== "no_contact") {
      results.push({
        sourceId: target.sourceId,
        status: `already_${existing.status}`,
        contactEmail: email,
      });
      continue;
    }
    if (!validEmail(email)) {
      await sql`
        insert into source_outreach(source_id,site_name,site_url,status,detail)
        values(${target.sourceId},${target.siteName},${target.siteUrl},'no_contact','No public contact address on pages the site allows')
        on conflict (source_id) do update set updated_at=now()`;
      results.push({ sourceId: target.sourceId, status: "no_contact", contactEmail: "" });
      continue;
    }
    const [emailedBefore] = await sql<{ source_id: string }>`
      select source_id from source_outreach where lower(contact_email)=${email} and status='sent' limit 1`;
    if (emailedBefore) {
      results.push({
        sourceId: target.sourceId,
        status: "already_sent_to_address",
        contactEmail: email,
      });
      continue;
    }
    if (!enabled || !key) {
      results.push({ sourceId: target.sourceId, status: "would_send", contactEmail: email });
      continue;
    }
    try {
      const providerId = await send(
        outreachEmail({ ...target, contactEmail: email }),
        key,
        `source-outreach:${target.sourceId}`,
      );
      await sql`
        insert into source_outreach(source_id,site_name,site_url,contact_email,status,provider_id,sent_at)
        values(${target.sourceId},${target.siteName},${target.siteUrl},${email},'sent',${providerId},now())
        on conflict (source_id) do update set contact_email=excluded.contact_email,status='sent',
          provider_id=excluded.provider_id,sent_at=now(),updated_at=now()`;
      results.push({ sourceId: target.sourceId, status: "sent", contactEmail: email });
    } catch (error) {
      const detail = (error instanceof Error ? error.message : String(error)).slice(0, 200);
      await sql`
        insert into source_outreach(source_id,site_name,site_url,contact_email,status,detail)
        values(${target.sourceId},${target.siteName},${target.siteUrl},${email},'failed',${detail})
        on conflict (source_id) do update set status='failed',detail=excluded.detail,updated_at=now()`;
      results.push({ sourceId: target.sourceId, status: "failed", contactEmail: email });
    }
  }
  return { enabled: enabled && Boolean(key), results };
}
