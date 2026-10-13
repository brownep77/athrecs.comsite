import { createHash, randomUUID } from "node:crypto";
import type { Sql } from "../db";
import {
  ATHLETE_INBOX,
  decryptInboxPassword,
  encryptInboxPassword,
  inboxEncryptionReady,
} from "./athlete-inbox-crypto.server";
import {
  openPrivateInbox,
  type InboxSession,
  type InboxEnvelope,
} from "./athlete-inbox-imap.server";

type Opener = (password: string) => Promise<InboxSession>;
type InboxTarget = { userId: string | null; athleteId: number | null };

export function safeReceivedText(value: string) {
  return value
    .replace(
      /((?:sign[ -]?in|one[ -]?time|verification|security)\s+code[^\d\n]{0,30}\s*)\d{6}\b/gi,
      "$1[code omitted]",
    )
    .replace(/^(?:>\s*)*\d{6}\s*$/gm, "[code omitted]")
    .replace(/https?:\/\/[^\s<>]+/g, (url) =>
      /[?&](?:token|code|signature|password|secret|invitation)=/i.test(url)
        ? "[private link omitted]"
        : url,
    )
    .slice(0, 20000);
}

/** Names and unverified accounts never establish ownership of a conversation. */
export async function matchInboxSender(
  sql: Sql,
  sender: string,
): Promise<InboxTarget | "ambiguous" | null> {
  const rows = await sql<InboxTarget>`
    with candidates as (
      select id as user_id,null::integer as athlete_id from "user"
        where lower(trim(email))=${sender} and "emailVerified"=true
      union
      select case when u."emailVerified"=true and lower(trim(u.email))=${sender} then m.user_id end,m.athlete_id
        from athlete_messages m left join "user" u on u.id=m.user_id
        where lower(m.contact)=${sender} and m.source='site' and m.channel='email' and m.status='accepted'
          and (m.athlete_id is not null or (u."emailVerified"=true and lower(trim(u.email))=${sender}))
      union
      select case when u."emailVerified"=true and lower(trim(u.email))=${sender} then i.user_id end,i.athlete_id
        from athlete_claim_invitations i left join "user" u on u.id=i.user_id
        where lower(trim(i.recipient_email))=${sender} and i.email_sent_at is not null
    ), resolved as (
      select coalesce(c.user_id,l.user_id) as user_id,
        case when coalesce(c.user_id,l.user_id) is null then c.athlete_id end as athlete_id
      from candidates c left join athlete_account_links l on l.athlete_id=c.athlete_id and l.status='active'
    ) select distinct user_id as "userId",athlete_id as "athleteId" from resolved
      where user_id is not null or athlete_id is not null`;
  return rows.length === 1 ? rows[0] : rows.length ? "ambiguous" : null;
}

export async function inboxStatus(sql: Sql) {
  const [row] = await sql<{
    lastSyncedAt: string | null;
    lastError: string | null;
    imported: number;
    ambiguous: number;
  }>`
    select last_synced_at::text as "lastSyncedAt",last_error as "lastError",
      imported_count as imported,ambiguous_count as ambiguous from athlete_inbox_connection where mailbox=${ATHLETE_INBOX}`;
  return {
    mailbox: ATHLETE_INBOX,
    ready: inboxEncryptionReady(),
    connected: Boolean(row),
    lastSyncedAt: row?.lastSyncedAt ?? null,
    lastError: row?.lastError ?? null,
    imported: row?.imported ?? 0,
    ambiguous: row?.ambiguous ?? 0,
  };
}

export async function connectAthleteInbox(
  sql: Sql,
  input: { password: string; includeRecent: boolean },
  userId: string,
  open: Opener = openPrivateInbox,
) {
  // Validate encryption before attempting a connection; never save plaintext.
  const encrypted = encryptInboxPassword(input.password);
  const client = await open(input.password);
  try {
    const cursor = input.includeRecent ? await client.recentStart() : client.uidNext - 1;
    await sql`insert into athlete_inbox_connection(mailbox,password_ciphertext,uid_validity,last_uid,connected_by)
      values(${ATHLETE_INBOX},${encrypted},${client.uidValidity},${cursor},${userId})
      on conflict(mailbox) do update set password_ciphertext=excluded.password_ciphertext,
        uid_validity=excluded.uid_validity,last_uid=excluded.last_uid,connected_by=excluded.connected_by,
        connected_at=now(),last_error=null,lease_token=null,lease_until=null`;
  } finally {
    await client.close();
  }
  return { connected: true };
}

export async function disconnectAthleteInbox(sql: Sql) {
  await sql`delete from athlete_inbox_connection where mailbox=${ATHLETE_INBOX}`;
  return { connected: false };
}

export async function syncAthleteInbox(sql: Sql, open: Opener = openPrivateInbox) {
  // Other sites share this repository; only the configured host may claim the worker lease.
  if (!inboxEncryptionReady()) return { imported: 0, skipped: "not-configured" };
  const lease = randomUUID();
  const [connection] = await sql<{
    password_ciphertext: string;
    uid_validity: string;
    last_uid: number;
  }>`
    update athlete_inbox_connection set lease_token=${lease},lease_until=now()+interval '90 seconds'
    where mailbox=${ATHLETE_INBOX} and (lease_until is null or lease_until<now())
    returning password_ciphertext,uid_validity,last_uid`;
  if (!connection) return { imported: 0, skipped: "not-connected-or-busy" };
  let client: InboxSession | undefined;
  let imported = 0;
  let ambiguous = 0;
  let cursor = Number(connection.last_uid);
  const started = Date.now();
  try {
    client = await open(decryptInboxPassword(connection.password_ciphertext));
    if (client.uidValidity !== connection.uid_validity) cursor = await client.recentStart();
    const messages = await client.headers(cursor);
    for (const message of messages) {
      if (Date.now() - started > 30000) break;
      const target = message.sender ? await matchInboxSender(sql, message.sender) : null;
      const body = target && target !== "ambiguous" ? await client.body(message) : null;
      const saved = await sql.transaction(async (tx) => {
        // Reconnect/disconnect revokes an in-flight sync before any write.
        const [active] =
          await tx`select mailbox from athlete_inbox_connection where mailbox=${ATHLETE_INBOX} and lease_token=${lease} for update`;
        if (!active) throw new Error("Inbox connection changed.");
        let count = 0;
        if (target && target !== "ambiguous" && body !== null) {
          const key = inboxMessageKey(message, client!.uidValidity);
          const rows = await tx`insert into athlete_messages
            (id,user_id,athlete_id,direction,channel,subject,body,contact,sender,status,source,source_key,provider_id,occurred_at)
            values(${randomUUID()},${target.userId},${target.athleteId},'received','email',
              ${safeReceivedText(message.subject).slice(0, 200)},${safeReceivedText(body)},${message.sender!},${message.sender!},
              'received','inbox',${key},${message.messageId || null},${message.receivedAt}::timestamptz)
            on conflict(source_key) do nothing returning id`;
          count = rows.length;
        }
        await tx`update athlete_inbox_connection set last_uid=${message.uid},uid_validity=${client!.uidValidity},
          imported_count=imported_count+${count},ambiguous_count=ambiguous_count+${target === "ambiguous" ? 1 : 0}
          where mailbox=${ATHLETE_INBOX} and lease_token=${lease}`;
        return count;
      });
      imported += saved;
      if (target === "ambiguous") ambiguous++;
      cursor = message.uid;
    }
    // A UID interval may contain only deleted mail. Move across the empty gap.
    if (!messages.length) cursor = client.uidNext - 1;
    await sql`update athlete_inbox_connection set last_uid=${cursor},uid_validity=${client.uidValidity},
      last_synced_at=now(),last_error=null where mailbox=${ATHLETE_INBOX} and lease_token=${lease}`;
    return { imported, ambiguous };
  } catch {
    await sql`update athlete_inbox_connection set last_error='Inbox could not sync. Reconnect the mailbox or try again.'
      where mailbox=${ATHLETE_INBOX} and lease_token=${lease}`;
    throw new Error("Inbox could not sync. Reconnect the mailbox or try again.");
  } finally {
    await client?.close();
    await sql`update athlete_inbox_connection set lease_token=null,lease_until=null where mailbox=${ATHLETE_INBOX} and lease_token=${lease}`;
  }
}

function inboxMessageKey(message: InboxEnvelope, validity: string) {
  const identity = message.messageId
    ? `${message.sender}/${message.messageId}`
    : `${validity}/${message.uid}`;
  return `inbox/${createHash("sha256").update(`${ATHLETE_INBOX}/${identity}`).digest("hex")}`;
}
