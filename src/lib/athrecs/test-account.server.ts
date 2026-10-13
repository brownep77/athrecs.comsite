import { randomUUID } from "node:crypto";
import type { Sql } from "../db";
import { sendAthrecsAuthEmail } from "../auth/email.server";

/** Reserved fixtures never join the canonical event catalogue. */
export async function requireTestAccount(sql: Sql, userId: string) {
  const [account] = await sql<{ email: string; athleteId: number; name: string }>`
    select t.email,t.athlete_id as "athleteId",a.display_name as name
    from athrecs_test_athletes t join "user" u on lower(trim(u.email))=t.email
    join athletes a on a.id=t.athlete_id
    where u.id=${userId} and u."emailVerified"=true`;
  if (!account)
    throw new Error("Sign in with the approved, verified test email to use this private test hub.");
  return account;
}

export async function loadTestHub(sql: Sql, userId: string) {
  const account = await requireTestAccount(sql, userId);
  const races = await sql<{
    id: number;
    name: string;
    resultId: number;
    date: string;
    distance: string;
    performance: string;
    registered: boolean;
    claimed: boolean;
    emailSent: boolean;
  }>`select e.id,e.name,-s.id as "resultId",s.performance->>'date' as date,
    s.performance->>'discipline' as distance,s.performance->>'performance' as performance,
    coalesce(r.registered,false) as registered,
    exists(select 1 from athlete_account_links l where l.athlete_id=s.athlete_id and l.user_id=${userId} and l.status='active')
      and not exists(select 1 from athlete_profile_hidden_source_results h where h.user_id=${userId} and h.source_result_id=s.id) as claimed,
    exists(select 1 from athrecs_test_registration_receipts m where m.user_id=${userId} and m.event_id=e.id and m.version=r.version and m.sent_at is not null) as "emailSent"
    from athrecs_test_events e join source_history_claim_results s on s.id=e.source_result_id
    left join athrecs_test_registrations r on r.event_id=e.id and r.user_id=${userId}
    where s.athlete_id=${account.athleteId} order by e.id`;
  return { name: account.name, email: account.email, races };
}

/** Idempotent state changes: repeated registration never queues another receipt. */
export async function saveTestRegistration(
  sql: Sql,
  userId: string,
  eventId: number,
  registered: boolean,
) {
  await requireTestAccount(sql, userId);
  return sql.transaction(async (tx) => {
    await tx`select id from "user" where id=${userId} for update`;
    const [event] = await tx<{
      id: number;
    }>`select id from athrecs_test_events where id=${eventId}`;
    if (!event) throw new Error("Choose one of the ten fictional test races.");
    const [current] = await tx<{
      registered: boolean;
      version: number;
    }>`select registered,version from athrecs_test_registrations where user_id=${userId} and event_id=${eventId}`;
    if ((current?.registered ?? false) === registered) return { changed: false };
    const version = (current?.version ?? 0) + 1;
    await tx`insert into athrecs_test_registrations(user_id,event_id,registered,version)
      values(${userId},${eventId},${registered},${version}) on conflict(user_id,event_id)
      do update set registered=excluded.registered,version=excluded.version,updated_at=now()`;
    await tx`insert into athrecs_test_registration_receipts(id,user_id,event_id,version,registered)
      values(${randomUUID()}::uuid,${userId},${eventId},${version},${registered})`;
    return { changed: true };
  });
}

/** Same transactional transport, frozen inputs, provider deduplication and a retry lease. */
export async function deliverTestRegistrationReceipts(
  sql: Sql,
  userId: string,
  send = sendAthrecsAuthEmail,
) {
  const account = await requireTestAccount(sql, userId);
  let sent = 0;
  for (let i = 0; i < 10; i++) {
    const row = await sql.transaction(async (tx) => {
      const [pending] = await tx<{
        id: string;
        event_id: number;
        registered: boolean;
        expired: boolean;
      }>`
        select id::text,event_id,registered,first_attempt_at < now()-interval '23 hours' as expired
        from athrecs_test_registration_receipts where user_id=${userId} and sent_at is null
          and not needs_review and retry_after<=now() order by event_id,version limit 1 for update skip locked`;
      if (!pending) return null;
      if (pending.expired) {
        await tx`update athrecs_test_registration_receipts set needs_review=true where id=${pending.id}::uuid`;
        return null;
      }
      await tx`update athrecs_test_registration_receipts set first_attempt_at=coalesce(first_attempt_at,now()),retry_after=now()+interval '10 minutes' where id=${pending.id}::uuid`;
      return pending;
    });
    if (!row) break;
    try {
      await send(
        {
          to: account.email,
          testOnly: true,
          subject: `Test ${row.event_id}: practice registration ${row.registered ? "confirmed" : "cancelled"}`,
          heading: "Fictional race registration",
          message: `Test Test: your practice registration for Test ${row.event_id} is ${row.registered ? "confirmed" : "cancelled"}. This is invented test information. There is no real event, payment, race place or sporting achievement. Return to the private test hub to repeat the journey.`,
          actionLabel: "Open private test hub",
          actionUrl: "https://www.athrecs.com/test-account",
        },
        { idempotencyKey: `test-registration/${row.id}` },
      );
      await sql`update athrecs_test_registration_receipts set sent_at=now() where id=${row.id}::uuid`;
      sent++;
    } catch {
      // The committed practice registration survives a mail-provider outage.
      break;
    }
  }
  return { sent };
}
