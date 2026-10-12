import { createHash, randomUUID } from "node:crypto";
import type { Sql } from "@/lib/db";
import { sendAthrecsAuthEmail } from "@/lib/auth/email.server";
import { assertInvitationWrites, invitationEmailAvailable } from "./claim-invitations.server";
import { CLAIM_INVITATION_FROM, CLAIM_INVITATION_REPLY_TO } from "./claim-invitation";
import { INVITATION_WELCOME_MESSAGE, INVITATION_CODE_INSTRUCTIONS } from "./invitation-welcome";

/** An explicit fresh-code send, separate from replaying a frozen invitation email. */
export async function sendWelcomeInvitationEmail(sql: Sql, id: string) {
  assertInvitationWrites();
  if (!invitationEmailAvailable()) throw new Error("Invitation email is not configured.");
  const attempt = randomUUID();
  const reservation = await sql.transaction(async (tx) => {
    const [i] = await tx<{
      recipient_email: string;
      claim_url: string;
      claim_key: number;
      token_hash: string;
      reserved: boolean;
      recent: boolean;
      limited: boolean;
      active: boolean;
    }>`select i.recipient_email,i.claim_url,i.claim_key,i.token_hash,
      i.reserved_until>now() as reserved,
      i.welcome_attempted_at>now()-interval '1 minute' as recent,
      ((i.welcome_attempted_at at time zone 'Europe/London')::date=(now() at time zone 'Europe/London')::date and i.welcome_attempts_today>=5) as limited,
      (i.revoked_at is null and i.declined_at is null and i.claim_id is null
        and i.expires_at>now() and i.recipient_email is not null
        and (lower(trim(u.email))=i.recipient_email or (i.user_id is null and i.invitation_kind='email'))
        and not exists(select 1 from athlete_account_links l where l.athlete_id=i.athlete_id and l.status='active')
        and not exists(select 1 from result_claims c where c.claim_key=i.claim_key
          and c.claimant_user_id=i.user_id and c.status<>'withdrawn')) as active
      from athlete_claim_invitations i left join "user" u on u.id=i.user_id
      where i.id=${id} for update of i`;
    if (!i || !i.active)
      throw new Error("This invitation is no longer active. Refresh the account.");
    if (i.reserved) return { status: "sending" as const };
    if (i.recent) return { status: "recent" as const };
    if (i.limited) return { status: "limited" as const };
    const url = new URL(i.claim_url);
    if (
      url.origin !== "https://www.athrecs.com" ||
      url.pathname !== "/claim-results" ||
      url.username !== "" ||
      url.password !== "" ||
      url.hash !== "" ||
      url.searchParams.size !== 2 ||
      Number(url.searchParams.get("resultId")) !== i.claim_key ||
      createHash("sha256")
        .update(url.searchParams.get("invitation") ?? "")
        .digest("hex") !== i.token_hash ||
      !/^[a-f0-9]{64}$/.test(url.searchParams.get("invitation") ?? "")
    )
      throw new Error("The private invitation link is invalid.");
    await tx`update athlete_claim_invitations set
      welcome_attempt_id=${attempt},
      welcome_attempts_today=case when (welcome_attempted_at at time zone 'Europe/London')::date=(now() at time zone 'Europe/London')::date
        then welcome_attempts_today+1 else 1 end,
      welcome_attempted_at=now(),reserved_until=now()+interval '2 minutes'
      where id=${id}`;
    return { status: "ready" as const, email: i.recipient_email, url: i.claim_url };
  });
  if (reservation.status !== "ready") return { status: reservation.status };
  try {
    const { auth } = await import("@/lib/auth/server");
    // Better Auth generates the code and stores its hash, expiry and attempt limit.
    // The code is passed directly to delivery, never returned to staff or saved here.
    const context = await auth.$context;
    await context.internalAdapter.deleteVerificationByIdentifier(
      `sign-in-otp-${reservation.email}`,
    );
    const code = await auth.api.createVerificationOTP({
      body: { email: reservation.email, type: "sign-in" },
    });
    await sendAthrecsAuthEmail(
      {
        to: reservation.email,
        subject: "Welcome to AthRecs — your sign-in code and profile invitation",
        heading: "Welcome to AthRecs",
        message: `${INVITATION_WELCOME_MESSAGE}\n\n${INVITATION_CODE_INSTRUCTIONS}`,
        code,
        actionLabel: "Sign in and claim my profile",
        actionUrl: reservation.url,
      },
      {
        from: CLAIM_INVITATION_FROM,
        replyTo: CLAIM_INVITATION_REPLY_TO,
        apiKey: process.env.ATHRECS_INVITATION_RESEND_API_KEY,
        idempotencyKey: `invitation-welcome/${id}/${attempt}`,
      },
    );
    await sql`update athlete_claim_invitations set email_sent_at=coalesce(email_sent_at,now()),
      reserved_until=null,delivery_error=false where id=${id} and welcome_attempt_id=${attempt}`;
    return { status: "sent" as const };
  } catch {
    await sql`update athlete_claim_invitations set reserved_until=null,delivery_error=true
      where id=${id} and welcome_attempt_id=${attempt}`;
    return { status: "failed" as const };
  }
}
