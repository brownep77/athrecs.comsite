import { randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";
import {
  safeEmailMessage,
  type MessageTarget,
  type messageInput,
  type messageFilters,
  type staffEmailInput,
} from "./athlete-messages";
import type { z } from "zod";

async function resolveTarget(sql: Sql, target: MessageTarget) {
  const [row] =
    "userId" in target
      ? await sql<{
          user_id: string;
          athlete_id: number | null;
          number: string;
        }>`select user_id,athlete_id,number::text from athlete_identifiers where user_id=${target.userId}`
      : await sql<{
          user_id: string | null;
          athlete_id: number | null;
          number: string;
        }>`select user_id,athlete_id,number::text from athlete_identifiers where number=${target.athleteNumber}::bigint`;
  if (!row) throw new Error("Athlete record not found.");
  // Only approved active account links join histories. Names and suggested matches do not.
  const linked = await sql<{ athlete_id: number; user_id: string | null }>`
    select a.athlete_id,l.user_id from athlete_resolved_ids a
    left join athlete_account_links l on l.athlete_id=a.athlete_id and l.status='active'
    where a.athlete_number=${row.number}::bigint or a.source_number=${row.number}::bigint`;
  const userId = row.user_id ?? linked.find((item) => item.user_id)?.user_id ?? null;
  const sources = userId
    ? await sql<{
        athlete_id: number;
      }>`select athlete_id from athlete_account_links where user_id=${userId} and status='active'`
    : linked;
  const [user] = userId
    ? await sql<{
        email: string;
      }>`select lower(trim(email)) as email from "user" where id=${userId} and "emailVerified"=true`
    : [];
  return {
    verifiedEmail: user?.email ?? null,
    userId,
    athleteId: row.athlete_id,
    athleteIds: [
      ...new Set([
        ...sources.map((item) => item.athlete_id),
        ...(row.athlete_id ? [row.athlete_id] : []),
      ]),
    ],
  };
}

export type AthleteMessage = {
  id: string;
  direction: "sent" | "received";
  channel: string;
  subject: string;
  body: string;
  contact: string;
  sender: string | null;
  status: string;
  source: string;
  occurredAt: string;
};

export async function loadAthleteMessages(sql: Sql, input: z.infer<typeof messageFilters>) {
  const target = await resolveTarget(sql, input.target);
  const rows = await sql<AthleteMessage & { total: number; sent: number; received: number }>`
    with history as (
      select m.id,m.direction,m.channel,m.subject,m.body,m.contact,m.sender,m.status,m.source,m.occurred_at
      from athlete_messages m where m.user_id=${target.userId} or m.athlete_id=any(${target.athleteIds}::int[])
        or (m.user_id is null and m.source='site' and m.contact=${target.verifiedEmail})
      union all
      select 'invitation/'||i.id,'sent','email',coalesce(i.email_payload->>'subject','Profile invitation'),
        E'Saved invitation text:\n\n'||coalesce(i.email_payload->>'heading','')||E'\n\n'||coalesce(i.email_payload->>'message','')||E'\n\nPrivate claim link omitted. This earlier send record does not retain the sender or subsequent welcome email contents.',
        i.recipient_email,null,'accepted','site',i.email_sent_at
      from athlete_claim_invitations i
      where (i.user_id=${target.userId} or i.athlete_id=any(${target.athleteIds}::int[])
        or (i.user_id is null and lower(trim(i.recipient_email))=${target.verifiedEmail}))
        and i.email_sent_at is not null and i.email_payload is not null
        and not exists(select 1 from athlete_messages m where m.status='accepted' and
          (m.source_key='profile-claim-invitation/'||i.id or (m.source_key like 'invitation-welcome/'||i.id||'/%'
            and m.replaces_invitation_record)))
    ), totals as (select count(*) filter(where direction='sent')::int as sent,
      count(*) filter(where direction='received')::int as received from history),
    filtered as (select * from history where ${input.direction}='all' or direction=${input.direction}),
    page as (select * from filtered order by occurred_at desc,id desc limit 20 offset ${(input.page - 1) * 20})
    select p.id,p.direction,p.channel,p.subject,p.body,p.contact,p.sender,p.status,p.source,
      p.occurred_at::text as "occurredAt",t.sent,t.received,(select count(*)::int from filtered) as total
    from totals t left join page p on true order by p.occurred_at desc,p.id desc`;
  return {
    recipientEmail: target.verifiedEmail,
    messages: rows
      .filter((row) => row.id)
      .map(({ total: _total, sent: _sent, received: _received, ...message }) => message),
    sent: rows[0]?.sent ?? 0,
    received: rows[0]?.received ?? 0,
    total: rows[0]?.total ?? 0,
    page: input.page,
    pageSize: 20,
  };
}

/** Staff-only correspondence, bound to the account's verified mailbox. */
export async function sendAthleteCorrespondence(
  sql: Sql,
  input: z.infer<typeof staffEmailInput>,
  staffId: string,
) {
  const target = await resolveTarget(sql, input.target);
  if (!target.verifiedEmail || target.verifiedEmail !== input.recipient)
    throw new Error("The verified recipient has changed or is unavailable. Refresh the account.");
  const apiKey =
    process.env.ATHRECS_INVITATION_RESEND_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("AthRecs email delivery is not configured.");
  const [synthetic] = await sql<{ test: boolean }>`select exists(
    select 1 from athrecs_test_athletes where athlete_id=any(${target.athleteIds}::int[])
  ) as test`;
  if (synthetic?.test && target.verifiedEmail !== "paul@athrecs.com")
    throw new Error("Test emails are restricted to the approved test address.");
  const sourceKey = `staff-correspondence/${input.entryId}`;
  const [reserved] = await sql<{ id: string }>`insert into athlete_messages
    (id,user_id,athlete_id,direction,channel,subject,body,contact,sender,status,source,source_key,recorded_by)
    values (${input.entryId},${target.userId},${target.athleteId},'sent','email',${input.subject},
      ${input.body},${target.verifiedEmail},'paul@athrecs.com','unknown','site',${sourceKey},${staffId})
    on conflict do nothing returning id`;
  if (!reserved) {
    const [previous] = await sql<{
      status: string;
      user_id: string;
      contact: string;
      subject: string;
      body: string;
    }>`
      select status,user_id,contact,subject,body from athlete_messages where source_key=${sourceKey}`;
    if (
      previous?.status === "accepted" &&
      previous.user_id === target.userId &&
      previous.contact === input.recipient &&
      previous.subject === input.subject &&
      previous.body === input.body
    )
      return { sent: true };
    throw new Error(
      "This send attempt is already recorded. Check its status before creating another email.",
    );
  }
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const html = input.body
    .split(/(https:\/\/[^\s<>]+)/g)
    .map((part, index) =>
      index % 2 ? `<a href="${escape(part)}">${escape(part)}</a>` : escape(part),
    )
    .join("")
    .replaceAll("\n", "<br>");
  let response: Response;
  try {
    response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": sourceKey,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        from: "Paul Browne <paul@athrecs.com>",
        reply_to: "paul@athrecs.com",
        to: [target.verifiedEmail],
        subject: input.subject,
        text: input.body,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6">${html}</div>`,
      }),
    });
  } catch {
    throw new Error(
      "Email acceptance could not be confirmed. The attempt is recorded; check delivery before resending.",
    );
  }
  if (!response.ok) {
    await sql`update athlete_messages set status='failed' where id=${input.entryId}`;
    throw new Error("The email provider rejected this message. The failed attempt is recorded.");
  }
  const receipt = await response.json().catch(() => null);
  await sql`update athlete_messages set status='accepted',provider_id=${typeof receipt?.id === "string" ? receipt.id : null},occurred_at=now() where id=${input.entryId}`;
  return { sent: true };
}

export async function recordAthleteMessage(
  sql: Sql,
  input: z.infer<typeof messageInput>,
  staffId: string,
) {
  const target = await resolveTarget(sql, input.target);
  await sql`insert into athlete_messages
    (id,user_id,athlete_id,direction,channel,subject,body,contact,status,source,occurred_at,recorded_by)
    values (${input.entryId},${target.userId},${target.athleteId},${input.direction},${input.channel},
      ${input.subject},${input.body},${input.contact},'recorded','manual',${input.occurredAt}::timestamptz,${staffId})
    on conflict (id) do nothing`;
  return { saved: true };
}

/** Best effort audit: a logging outage must not turn an accepted email into a retry. */
export async function recordSiteEmail(
  sql: Sql,
  email: { to: string; subject: string; heading: string; message: string; code?: string },
  options: {
    from: string;
    idempotencyKey?: string;
    status: "accepted" | "failed" | "unknown";
    providerId?: string;
  },
) {
  const recipient = email.to.trim().toLowerCase();
  const invitationId = options.idempotencyKey?.match(
    /^(?:profile-claim-invitation|invitation-welcome)\/([a-f0-9-]{36})(?:\/|$)/,
  )?.[1];
  const [invitation] = invitationId
    ? await sql<{
        user_id: string | null;
        athlete_id: number;
        email_sent_at: string | null;
      }>`select user_id,athlete_id,email_sent_at from athlete_claim_invitations where id=${invitationId} and lower(trim(recipient_email))=${recipient}`
    : [];
  const [user] = await sql<{
    id: string;
  }>`select id from "user" where lower(trim(email))=${recipient}`;
  const userId = invitation?.user_id ?? user?.id ?? null;
  if (!userId && !invitation) return;
  await sql`insert into athlete_messages
    (id,user_id,athlete_id,direction,channel,subject,body,contact,sender,status,source,source_key,provider_id,replaces_invitation_record)
    values (${randomUUID()},${userId},${invitation?.athlete_id ?? null},'sent','email',${email.subject},
      ${safeEmailMessage(email)},${recipient},${options.from},${options.status},'site',${options.idempotencyKey ?? null},${options.providerId ?? null},${!!invitation && !invitation.email_sent_at})
    on conflict (source_key) do update set status=case when athlete_messages.status='accepted' then 'accepted' else excluded.status end,
      provider_id=coalesce(athlete_messages.provider_id,excluded.provider_id),
      replaces_invitation_record=athlete_messages.replaces_invitation_record or excluded.replaces_invitation_record,
      occurred_at=case when athlete_messages.status<>'accepted' and excluded.status='accepted' then excluded.occurred_at else athlete_messages.occurred_at end`;
}
