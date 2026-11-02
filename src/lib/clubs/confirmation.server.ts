import { createHash, randomBytes } from "node:crypto";
import type { Sql } from "../db.ts";
import {
  clubConfirmationSchema,
  type ClubConfirmation,
  type ClubReviewApplication,
} from "./registration.ts";

const digest = (token: string) => createHash("sha256").update(token).digest("hex");

export async function notifyClubRepresentatives(
  tx: Sql,
  id: string,
  revision: number,
  clubId: number | null,
) {
  if (!clubId) return;
  await tx`insert into club_access_notices (application_id, revision, club_id, recipient_id)
    select ${id}, ${revision}, r.club_id, r.user_id from club_representatives r
    where r.club_id=${clubId} and r.status='active'
    on conflict do nothing`;
}

type OfficerMail = {
  to: string;
  subject: string;
  heading: string;
  message: string;
  actionLabel: string;
  actionUrl: string;
};
export async function startClubConfirmation(
  sql: Sql,
  staffId: string,
  input: ClubConfirmation,
  send: (mail: OfficerMail) => Promise<void>,
) {
  const data = clubConfirmationSchema.parse(input);
  const token = randomBytes(32).toString("base64url");
  const mail = await sql.transaction(async (tx) => {
    const [app] =
      await tx<ClubReviewApplication>`select * from club_registration_applications where id=${data.id} for update`;
    if (
      !app ||
      app.status !== "pending" ||
      app.revision !== data.revision ||
      staffId === app.user_id
    )
      throw new Error("An independent reviewer must open the current pending application.");
    if (app.club_id && app.club_id !== data.targetClubId)
      throw new Error("Select the applicant's directory club.");
    let clubName = [app.details.clubName, app.details.city, app.details.country]
      .filter(Boolean)
      .join(", ");
    if (data.targetClubId) {
      const [club] = await tx<{
        name: string;
        city: string;
        country: string;
      }>`select name,city,country from clubs where id=${data.targetClubId} for update`;
      if (!club) throw new Error("Directory club not found.");
      clubName = [club.name, club.city, club.country].filter(Boolean).join(", ");
    }
    if (data.contact.toLowerCase() === app.submitted_email?.trim().toLowerCase())
      throw new Error("Use an independent officer contact distinct from the applicant's email.");
    const [prior] = await tx<{
      status: string;
      recent: boolean;
    }>`select status, updated_at > now()-interval '1 minute' as recent from club_officer_confirmations where application_id=${app.id} and revision=${app.revision}`;
    if (prior?.status === "disputed" || prior?.status === "confirmed")
      throw new Error(
        "This response has already been recorded. Request a revised application if necessary.",
      );
    if (prior?.status === "pending" && prior.recent)
      throw new Error("Please wait a minute before replacing the outstanding request.");
    await tx`insert into club_officer_confirmations
      (application_id,revision,target_club_id,method,status,source_url,contact,reply_note,staff_id,token_digest,expires_at)
      values (${app.id},${app.revision},${data.targetClubId},${data.method},${data.method === "manual" ? "confirmed" : "pending"},${data.sourceUrl},${data.contact},${data.replyNote},${staffId},${data.method === "email" ? digest(token) : null},now()+interval '48 hours')
      on conflict(application_id, revision) do update set target_club_id=excluded.target_club_id, method=excluded.method,status=excluded.status,source_url=excluded.source_url,contact=excluded.contact,reply_note=excluded.reply_note,staff_id=excluded.staff_id,token_digest=excluded.token_digest,expires_at=excluded.expires_at,updated_at=now()`;
    await notifyClubRepresentatives(tx, app.id, app.revision, data.targetClubId);
    await tx`insert into club_registration_audit(application_id,actor_user_id,action,detail)
      values (${app.id},${staffId},${data.method === "manual" ? "officer_reply_recorded" : "officer_confirmation_requested"},${JSON.stringify(data)}::jsonb)`;
    if (data.method === "manual") return null;
    const person = app.details.representativeName;
    return {
      to: data.contact,
      subject: "Please verify a club representative for AthRecs",
      heading: "Does your club authorise this representative?",
      message: `Club: ${clubName}\nApplicant: ${person} (${app.submitted_email})\nRole: ${app.details.representativeRole}\n\nPlease confirm only if your club authorises this specific person and account to manage its public AthRecs profile. If the request is unexpected, select Report this request. Opening the link records no decision. It expires in 48 hours.`,
      actionLabel: "Review club request",
      actionUrl: `https://www.athrecs.com/api/club-confirmation#${token}`,
    };
  });
  if (mail) {
    try {
      await send(mail);
    } catch {
      await sql`update club_officer_confirmations set status='failed',token_digest=null where token_digest=${digest(token)} and status='pending'`;
      throw new Error("Delivery could not be confirmed. Check the official address and retry.");
    }
  }
  return { saved: true };
}

export async function answerClubConfirmation(
  sql: Sql,
  token: string,
  answer: "confirmed" | "disputed",
) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token) || !["confirmed", "disputed"].includes(answer))
    return false;
  return sql.transaction(async (tx) => {
    // Take the application lock first, as staff decisions, updates and withdrawals do.
    const [app] = await tx<{
      id: string;
      revision: number;
    }>`select a.id,a.revision from club_registration_applications a
      join club_officer_confirmations c on c.application_id=a.id and c.revision=a.revision
      where c.token_digest=${digest(token)} and a.status='pending' for update of a`;
    if (!app) return false;
    const [changed] =
      await tx`update club_officer_confirmations set status=${answer},token_digest=null,updated_at=now()
      where application_id=${app.id} and revision=${app.revision} and status='pending'
        and token_digest=${digest(token)} and expires_at>now() returning application_id`;
    if (!changed) return false;
    await tx`insert into club_registration_audit(application_id,action,detail) values
      (${app.id},${"officer_" + answer},${JSON.stringify({ revision: app.revision })}::jsonb)`;
    return true;
  });
}
