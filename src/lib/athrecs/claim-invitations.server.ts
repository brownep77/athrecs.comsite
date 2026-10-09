import { createHash, randomBytes, randomUUID } from "node:crypto";
import { dbSource, type Sql } from "@/lib/db";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { authEmailConfigured, sendAthrecsAuthEmail } from "@/lib/auth/email.server";
import {
  buildPotentialMatchSearchPatterns,
  scorePotentialResultNameMatch,
  uniquePotentialMatchNames,
} from "./result-match";
import { sourceIdentityFromUrl } from "./profile-connections";
import {
  CLAIM_INVITATION_FROM,
  claimInvitationMessage,
  newAthleteInvitationMessage,
  externalInvitationInput,
  type ExternalInvitationInput,
  type InvitationSummary,
} from "./claim-invitation";

type Email = Parameters<typeof sendAthrecsAuthEmail>[0];
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");
export function assertInvitationWrites() {
  if (IS_RUNRECS_SITE || (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"))
    throw new Error("Use the live ATHRECS dashboard to create or change invitations.");
  if (process.env.VERCEL_ENV === "production" && dbSource !== "neon")
    throw new Error("The live database is unavailable. No invitation was changed.");
}
export function invitationEmailAvailable() {
  return (
    !IS_RUNRECS_SITE &&
    process.env.VERCEL_ENV === "production" &&
    dbSource === "neon" &&
    authEmailConfigured()
  );
}
export const INVITATION_STATUS_SQL = `case
  when i.revoked_at is not null then 'revoked'
  when i.declined_at is not null then 'declined'
  when exists(select 1 from athlete_account_links l where l.athlete_id=i.athlete_id and l.user_id=i.user_id and l.status='active') then 'approved'
  when i.claim_id is not null then coalesce((select c.status from result_claims c where c.id=i.claim_id),'withdrawn')
  when i.expires_at<=now() then 'expired'
  when i.email_sent_at is not null then 'invited'
  when i.delivery_needs_review or i.first_attempt_at<now()-interval '23 hours' then 'held'
  when i.reserved_until>now() then 'sending'
  when i.delivery_error then 'failed'
  else 'prepared' end`;
export async function invitationHistory(sql: Sql, userId: string) {
  return sql.query<InvitationSummary>(
    `select i.id,a.display_name as "athleteName",${INVITATION_STATUS_SQL} as status,i.created_at::text as "createdAt",i.expires_at::text as "expiresAt",i.email_sent_at::text as "sentAt" from athlete_claim_invitations i join athletes a on a.id=i.athlete_id where i.user_id=$1 order by i.created_at desc limit 10`,
    [userId],
  );
}
export async function findInvitationMatches(
  sql: Sql,
  userId: string,
  q: string,
  athleteId?: number,
) {
  const [u] = await sql<{
    name: string;
    full_name: string;
    display_name: string;
    previous_names: string[];
    city: string;
    region: string;
    country: string;
    club_or_team: string;
    power_of_10_url: string;
    world_athletics_url: string;
    parkrun_id: string;
    athletics_urn: string;
  }>`select u.name,p.full_name,p.display_name,p.previous_names,p.city,p.region,p.country,p.club_or_team,p.power_of_10_url,p.world_athletics_url,p.parkrun_id,p.athletics_urn from "user" u left join athlete_private_profiles p on p.user_id=u.id where u.id=${userId}`;
  if (!u) throw new Error("Account not found.");
  const names = uniquePotentialMatchNames([
    u.name,
    u.full_name,
    u.display_name,
    ...(u.previous_names ?? []),
  ]);
  const keys = [u.power_of_10_url, u.world_athletics_url]
    .map(sourceIdentityFromUrl)
    .filter((x) => x !== null)
    .map((x) => `${x.provider}:${x.externalId}`);
  if (u.parkrun_id && /^A?\d+$/i.test(u.parkrun_id.trim()))
    keys.push(`parkrun:${u.parkrun_id.trim().replace(/^a/i, "")}`);
  if (u.athletics_urn?.trim()) keys.push(`athleticsurn:${u.athletics_urn.trim().toLowerCase()}`);
  const patterns = buildPotentialMatchSearchPatterns(names).rawPatterns;
  const term = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const candidates = await sql<{
    id: number;
    name: string;
    slug: string;
    city: string;
    region: string;
    country: string;
    clubName: string;
    resultCount: number;
    owner: boolean;
    hasClaim: boolean;
    sourceMatch: boolean;
    recentResults: { race: string; date: string; distance: string }[];
  }>`
    select a.id,a.display_name as name,a.slug,a.city,a.county as region,a.country,coalesce(c.name,a.source_club_name) as "clubName",
      (select count(*)::int from results r where r.athlete_id=a.id) as "resultCount",
      exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as owner,
      exists(select 1 from result_claims r where r.athlete_id=a.id and r.claimant_user_id=${userId} and r.status<>'withdrawn') as "hasClaim",
      exists(select 1 from athlete_source_identities s where s.athlete_id=a.id and s.provider||':'||s.external_id=any(${keys}::text[])) as "sourceMatch",
      coalesce((select jsonb_agg(recent) from (select e.name as race,ed.event_date::text as date,ed.distance_code as distance from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id where r.athlete_id=a.id order by ed.event_date desc,r.id limit 3) recent),'[]'::jsonb) as "recentResults"
    from athletes a left join clubs c on c.id=a.club_id
    where a.id=${athleteId ?? null}::int or (${athleteId ?? null}::int is null and ((${q}<>'' and (a.display_name ilike ${term} or a.slug=${q})) or (${q}='' and (a.display_name ilike any(${patterns}::text[]) or exists(select 1 from athlete_source_identities s where s.athlete_id=a.id and s.provider||':'||s.external_id=any(${keys}::text[]))))))
    order by "sourceMatch" desc,a.display_name,a.id limit 80`;
  const scored = candidates
    .map((a) => {
      const match = scorePotentialResultNameMatch(
        names,
        a.name,
        { city: u.city, region: u.region, country: u.country, clubOrTeam: u.club_or_team },
        a,
      );
      return {
        ...a,
        score: a.sourceMatch ? 200 : (match?.score ?? 0),
        reasons: a.sourceMatch
          ? ["Linked source identifier matches the account"]
          : (match?.reasons ?? ["Manual search result — check identity"]),
        blocked: a.owner
          ? "Already linked to an account"
          : a.hasClaim
            ? "Existing claim — use Review claims"
            : !a.resultCount
              ? "Add a checked result before inviting"
              : null,
      };
    })
    .filter((a) => athleteId || q || a.score > 0)
    .sort((a, b) => b.score - a.score || a.id - b.id);
  return {
    candidates: scored.slice(0, 12),
    moreMatches: scored.length > 12 || candidates.length === 80,
    hasSavedName: names.length > 0,
    history: await invitationHistory(sql, userId),
    emailAvailable: invitationEmailAvailable(),
  };
}

export async function createInvitation(
  sql: Sql,
  actor: string,
  input: { userId: string; athleteId: number; matchNote: string },
) {
  assertInvitationWrites();
  return sql.transaction(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtext('athrecs-claim-invitation-create'))`;
    // Serialise recipient creation and lock athlete in the same order as ownership reviews.
    const [u] = await tx<{
      email: string;
    }>`select email from "user" where id=${input.userId} for update`;
    if (!u) throw new Error("Account not found.");
    const [a] = await tx<{
      name: string;
    }>`select display_name as name from athletes where id=${input.athleteId} for update`;
    if (!a) throw new Error("Athlete profile not found.");
    const [blocked] = await tx<{
      owner: boolean;
      claim: boolean;
    }>`select exists(select 1 from athlete_account_links where athlete_id=${input.athleteId} and status='active') as owner,exists(select 1 from result_claims where athlete_id=${input.athleteId} and claimant_user_id=${input.userId} and status<>'withdrawn') as claim`;
    if (blocked.owner)
      throw new Error("This profile is already linked. Review its ownership before inviting.");
    if (blocked.claim)
      throw new Error("This account already has a claim for this profile. Use Review claims.");
    const [prior] = await tx<{
      id: string;
      claim_url: string;
      athlete_id: number;
      recipient_email: string;
    }>`select id,claim_url,athlete_id,recipient_email from athlete_claim_invitations where (user_id=${input.userId} or (invitation_kind='email' and user_id is null and recipient_email=${u.email.trim().toLowerCase()})) and revoked_at is null and declined_at is null and claim_id is null and expires_at>now() order by created_at desc limit 1 for update`;
    if (prior) {
      if (
        prior.athlete_id !== input.athleteId ||
        prior.recipient_email !== u.email.trim().toLowerCase()
      )
        throw new Error(
          "Revoke the existing invitation before choosing a different profile or email.",
        );
      return { id: prior.id, url: prior.claim_url, reused: true };
    }
    const [limits] = await tx<{
      recipient: number;
      staff: number;
    }>`select (select count(*)::int from athlete_claim_invitations where (user_id=${input.userId} or recipient_email=${u.email.trim().toLowerCase()}) and created_at>now()-interval '1 day') as recipient,(select count(*)::int from athlete_claim_invitations where created_by=${actor} and created_at>now()-interval '1 day') as staff`;
    if (limits.recipient >= 5 || limits.staff >= 100)
      throw new Error("Invitation limit reached. Try again tomorrow.");
    const [r] = await tx<{
      id: number;
    }>`select r.id from results r join editions e on e.id=r.edition_id where r.athlete_id=${input.athleteId} and lower(r.status) not in ('dns','dnf','dsq','dq') and coalesce(r.result_details->>'profileExcluded','false')<>'true' order by e.event_date desc,r.id limit 1`;
    if (!r) throw new Error("This profile needs an eligible stored result before inviting.");
    const id = randomUUID(),
      token = randomBytes(32).toString("hex");
    const url = `https://www.athrecs.com/claim-results?resultId=${r.id}&invitation=${token}`;
    const email: Email = {
      to: u.email.trim().toLowerCase(),
      subject: "Is this your ATHRECS athlete profile?",
      heading: `Is this your profile, ${a.name}?`,
      message: claimInvitationMessage(a.name),
      actionLabel: "Check and claim my profile",
      actionUrl: url,
    };
    await tx`insert into athlete_claim_invitations(id,user_id,recipient_email,athlete_id,result_id,token_hash,claim_url,match_note,created_by,email_payload) values(${id},${input.userId},${email.to},${input.athleteId},${r.id},${hashToken(token)},${url},${input.matchNote},${actor},${JSON.stringify(email)}::jsonb)`;
    return { id, url, reused: false };
  });
}

export async function externalInvitationProfile(sql: Sql, athleteId: number) {
  const [profile] = await sql<{
    id: number;
    name: string;
    owner: boolean;
    resultCount: number;
    recentResults: { race: string; date: string; distance: string }[];
  }>`select a.id,a.display_name as name,
    exists(select 1 from athlete_account_links l where l.athlete_id=a.id and l.status='active') as owner,
    (select count(*)::int from results r where r.athlete_id=a.id and lower(r.status) not in ('dns','dnf','dsq','dq') and coalesce(r.result_details->>'profileExcluded','false')<>'true') as "resultCount",
    coalesce((select jsonb_agg(recent) from (select e.name as race,ed.event_date::text as date,ed.distance_code as distance from results r join editions ed on ed.id=r.edition_id join events e on e.id=ed.event_id where r.athlete_id=a.id order by ed.event_date desc,r.id limit 3) recent),'[]'::jsonb) as "recentResults"
    from athletes a where a.id=${athleteId}`;
  if (!profile) throw new Error("Athlete profile not found.");
  const history = await sql.query<InvitationSummary & { recipient: string; canEmail: boolean }>(
    `select i.id,a.display_name as "athleteName",${INVITATION_STATUS_SQL} as status,i.created_at::text as "createdAt",i.expires_at::text as "expiresAt",i.email_sent_at::text as "sentAt",coalesce(i.recipient_email,i.recipient_name,'Contact invitation') as recipient,(i.email_payload is not null) as "canEmail" from athlete_claim_invitations i join athletes a on a.id=i.athlete_id where i.athlete_id=$1 order by i.created_at desc limit 20`,
    [athleteId],
  );
  return { profile, history, emailAvailable: invitationEmailAvailable() };
}

export async function createExternalInvitation(
  sql: Sql,
  actor: string,
  value: ExternalInvitationInput,
) {
  assertInvitationWrites();
  const input = externalInvitationInput.parse(value);
  const emailAddress = input.email || null;
  const contact = {
    phone: input.phone || null,
    telegramUsername: input.telegramUsername || null,
    socialLinks: input.socialLinks,
    sourceNote: input.sourceNote,
  };
  const recipientKey = hashToken(
    emailAddress
      ? `email:${emailAddress}`
      : contact.phone
        ? `phone:${contact.phone}`
        : contact.telegramUsername
          ? `telegram:${contact.telegramUsername.toLowerCase()}`
          : `social:${input.socialLinks[0].platform}:${input.socialLinks[0].url}`,
  );
  return sql.transaction(async (tx) => {
    // One low-volume staff operation lock keeps cross-account and pre-signup retries repeat-safe.
    await tx`select pg_advisory_xact_lock(hashtext('athrecs-claim-invitation-create'))`;
    const [user] = emailAddress
      ? await tx<{
          id: string;
        }>`select id from "user" where lower(trim(email))=${emailAddress} for update`
      : [];
    const [athlete] = await tx<{
      name: string;
    }>`select display_name as name from athletes where id=${input.athleteId} for update`;
    if (!athlete) throw new Error("Athlete profile not found.");
    const [blocked] = await tx<{
      owner: boolean;
      claim: boolean;
    }>`select exists(select 1 from athlete_account_links where athlete_id=${input.athleteId} and status='active') as owner,exists(select 1 from result_claims where athlete_id=${input.athleteId} and claimant_user_id=${user?.id ?? null} and status<>'withdrawn') as claim`;
    if (blocked.owner)
      throw new Error("This profile is already linked. Review its ownership before inviting.");
    if (blocked.claim)
      throw new Error("This account already has a claim for this profile. Use Review claims.");
    const [prior] = await tx<{
      id: string;
      claim_url: string;
      athlete_id: number;
      recipient_email: string | null;
      recipient_contact: typeof contact | null;
      recipient_name: string | null;
    }>`select id,claim_url,athlete_id,recipient_email,recipient_contact,recipient_name from athlete_claim_invitations where (recipient_key=${recipientKey} or (${emailAddress}::text is not null and recipient_email=${emailAddress})) and revoked_at is null and declined_at is null and claim_id is null and expires_at>now() order by created_at desc limit 1 for update`;
    if (prior) {
      if (prior.athlete_id !== input.athleteId)
        throw new Error(
          "Revoke the existing invitation before choosing a different profile for this contact.",
        );
      return {
        id: prior.id,
        url: prior.claim_url,
        reused: true,
        recipient: prior.recipient_email ?? prior.recipient_name ?? input.recipientName,
        emailBound: !!prior.recipient_email,
        contact: prior.recipient_contact ?? contact,
      };
    }
    const [limits] = await tx<{
      recipient: number;
      staff: number;
    }>`select (select count(*)::int from athlete_claim_invitations where (recipient_key=${recipientKey} or (${emailAddress}::text is not null and recipient_email=${emailAddress})) and created_at>now()-interval '1 day') as recipient,(select count(*)::int from athlete_claim_invitations where created_by=${actor} and created_at>now()-interval '1 day') as staff`;
    if (limits.recipient >= 5 || limits.staff >= 100)
      throw new Error("Invitation limit reached. Try again tomorrow.");
    const [result] = await tx<{
      id: number;
    }>`select r.id from results r join editions e on e.id=r.edition_id where r.athlete_id=${input.athleteId} and lower(r.status) not in ('dns','dnf','dsq','dq') and coalesce(r.result_details->>'profileExcluded','false')<>'true' order by e.event_date desc,r.id limit 1`;
    if (!result) throw new Error("This profile needs an eligible stored result before inviting.");
    const id = randomUUID(),
      token = randomBytes(32).toString("hex");
    const url = `https://www.athrecs.com/claim-results?resultId=${result.id}&invitation=${token}`;
    const email: Email | null = emailAddress
      ? {
          to: emailAddress,
          subject: `You're invited to claim your ATHRECS profile`,
          heading: `Claim your athlete profile, ${input.recipientName}`,
          message: newAthleteInvitationMessage(athlete.name, true),
          actionLabel: "Sign up and claim my profile",
          actionUrl: url,
        }
      : null;
    const note = `${input.matchNote}\nInvited contact: ${input.recipientName}. Contact source: ${input.sourceNote}. Contact: ${emailAddress ?? [contact.phone, contact.telegramUsername, ...contact.socialLinks.map((link) => link.url)].filter(Boolean).join(", ")}.${emailAddress ? " Verify the recipient’s athlete identity independently." : " Contact-only invitation: the link does not verify control of the phone or social account. Confirm the claimant with the recorded contact before approval."}`;
    await tx`insert into athlete_claim_invitations(id,user_id,recipient_email,athlete_id,result_id,token_hash,claim_url,match_note,created_by,email_payload,invitation_kind,recipient_name,recipient_contact,recipient_key) values(${id},${user?.id ?? null},${emailAddress},${input.athleteId},${result.id},${hashToken(token)},${url},${note},${actor},${email ? JSON.stringify(email) : null}::jsonb,${emailAddress ? "email" : "contact"},${input.recipientName},${JSON.stringify(contact)}::jsonb,${recipientKey})`;
    return {
      id,
      url,
      reused: false,
      recipient: emailAddress ?? input.recipientName,
      emailBound: !!emailAddress,
      contact,
    };
  });
}

export async function invitationIntro(sql: Sql, token: string, resultId: number) {
  if (IS_RUNRECS_SITE || process.env.VERCEL_ENV === "preview")
    throw new Error("Open your invitation on www.athrecs.com.");
  // Token possession reveals only the selected display name and signup instructions, never contact details or race data.
  const [intro] = await sql<{
    name: string;
    emailBound: boolean;
  }>`select a.display_name as name,(i.recipient_email is not null) as "emailBound" from athlete_claim_invitations i join athletes a on a.id=i.athlete_id where i.token_hash=${hashToken(token)} and i.result_id=${resultId} and i.revoked_at is null and i.declined_at is null and i.expires_at>now()`;
  return intro ?? null;
}

/** Existing account links stay strictly bound. New email links require the verified mailbox.
 * Contact-only links are private capabilities: verification + staff review are still required.
 * Viewing never binds an account; only a locked submit/decline can consume the invitation. */
export async function validateInvitation(
  sql: Sql,
  token: string,
  userId: string,
  resultId: number,
  athleteId: number,
  lock = false,
) {
  if (IS_RUNRECS_SITE || process.env.VERCEL_ENV === "preview")
    throw new Error("Open your invitation on www.athrecs.com.");
  const rows = await sql.query<{ id: string; claim_id: number | null; match_note: string }>(
    `select i.id,i.claim_id,i.match_note from athlete_claim_invitations i join "user" u on u.id=$2 where i.token_hash=$1 and (i.user_id=$2 or (i.user_id is null and i.invitation_kind in ('email','contact'))) and i.result_id=$3 and i.athlete_id=$4 and (lower(trim(u.email))=i.recipient_email or i.invitation_kind='contact') and u."emailVerified"=true and i.revoked_at is null and i.declined_at is null and i.expires_at>now() ${lock ? "for update of i" : ""}`,
    [hashToken(token), userId, resultId, athleteId],
  );
  if (!rows[0])
    throw new Error(
      "This invitation is unavailable. Sign in with the verified email that received it, or ask ATHRECS for a fresh invitation.",
    );
  return rows[0];
}

export async function sendInvitationEmail(sql: Sql, id: string) {
  assertInvitationWrites();
  if (!invitationEmailAvailable())
    throw new Error(
      "Email invitations are available only on the live ATHRECS site with email delivery configured.",
    );
  const reserved = await sql.transaction(async (tx) => {
    const [i] = await tx<{
      email_payload: Email;
      email_sent_at: string | null;
      reserved: boolean;
      expiredRetry: boolean;
      active: boolean;
    }>`select i.email_payload,i.email_sent_at,i.reserved_until>now() as reserved,i.first_attempt_at<now()-interval '23 hours' as "expiredRetry",(i.revoked_at is null and i.declined_at is null and i.claim_id is null and i.expires_at>now() and i.email_payload is not null and i.recipient_email is not null and (lower(trim(u.email))=i.recipient_email or (i.user_id is null and i.invitation_kind='email')) and not exists(select 1 from athlete_account_links l where l.athlete_id=i.athlete_id and l.status='active')) as active from athlete_claim_invitations i left join "user" u on u.id=i.user_id where i.id=${id} for update of i`;
    if (!i) throw new Error("Invitation not found.");
    if (i.email_sent_at) return { status: "sent" as const };
    if (!i.active) throw new Error("This invitation is no longer active. Refresh the account.");
    if (i.expiredRetry) {
      await tx`update athlete_claim_invitations set delivery_needs_review=true where id=${id}`;
      return { status: "held" as const };
    }
    if (i.reserved) return { status: "sending" as const };
    await tx`update athlete_claim_invitations set first_attempt_at=coalesce(first_attempt_at,now()),reserved_until=now()+interval '2 minutes',delivery_error=false where id=${id}`;
    return { status: "ready" as const, payload: i.email_payload };
  });
  if (reserved.status !== "ready") return { status: reserved.status };
  try {
    await sendAthrecsAuthEmail(reserved.payload, {
      idempotencyKey: `profile-claim-invitation/${id}`,
      from: CLAIM_INVITATION_FROM,
      replyTo: "support@athrecs.com",
    });
    await sql`update athlete_claim_invitations set email_sent_at=now(),reserved_until=null,delivery_error=false where id=${id}`;
    return { status: "sent" as const };
  } catch {
    await sql`update athlete_claim_invitations set reserved_until=null,delivery_error=true where id=${id}`;
    return { status: "failed" as const };
  }
}
