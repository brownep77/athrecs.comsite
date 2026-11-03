import { notifyClubRepresentatives } from "./confirmation.server.ts";
import { randomUUID } from "node:crypto";
import type { Sql } from "../db.ts";
import {
  CLUB_NOTICE_VERSION,
  clubSaveSchema,
  clubContentSchema,
  type ClubContent,
  clubReviewSchema,
  registrationKey,
  type ClubApplication,
  type ClubReviewApplication,
  type ClubSave,
  type ClubReview,
} from "./registration.ts";

const columns = `a.id, a.club_id, c.name as club_name, c.slug as club_slug, a.details,
  a.status, a.revision, a.review_message, a.updated_at::text, a.submitted_at::text`;
const editable = new Set(["draft", "pending", "needs_changes"]);
async function account(sql: Sql, userId: string) {
  const [user] = await sql<{ email: string; verified: boolean }>`
    select email, "emailVerified" as verified from "user" where id = ${userId}`;
  if (!user) throw new Error("Sign in to register your club.");
  return user;
}
async function audit(sql: Sql, appId: string, userId: string, action: string, detail: object) {
  await sql`insert into club_registration_audit (application_id, actor_user_id, action, detail)
    values (${appId}, ${userId}, ${action}, ${JSON.stringify(detail)}::jsonb)`;
}
async function ownApplication(sql: Sql, userId: string, id: string) {
  const [row] = await sql.query<ClubApplication>(
    `select ${columns}
    from club_registration_applications a left join clubs c on c.id = a.club_id
    where a.id = $1 and a.user_id = $2`,
    [id, userId],
  );
  if (!row) throw new Error("Application not found for this account.");
  return row;
}
export async function myClubApplications(sql: Sql, userId: string) {
  const user = await account(sql, userId);
  const applications = await sql.query<ClubApplication>(
    `select ${columns}
    from club_registration_applications a left join clubs c on c.id = a.club_id
    where a.user_id = $1 order by a.updated_at desc`,
    [userId],
  );
  const notices = await sql<{
    id: string;
    revision: number;
    club_id: number;
    club_name: string;
    applicant: string;
    role: string;
    status: string;
    disputed: boolean;
  }>`
    select distinct a.id, n.revision, c.id as club_id,c.name as club_name,
      a.details->>'representativeName' as applicant,a.details->>'representativeRole' as role,
      a.status, n.disputed_at is not null as disputed
    from club_access_notices n join club_registration_applications a on a.id=n.application_id
    left join club_officer_confirmations cf on cf.application_id=a.id and cf.revision=n.revision
    join clubs c on c.id=n.club_id and c.id=coalesce(a.club_id, cf.target_club_id)
    join club_representatives r on r.club_id=c.id and r.user_id=n.recipient_id
    join club_registration_applications owner on owner.id=r.application_id
    join "user" u on u.id=r.user_id and u."emailVerified" and u.email=owner.submitted_email
    where n.recipient_id=${userId} and r.status='active' and owner.status='approved' and
      ((a.status='pending' and a.revision=n.revision) or (a.status='approved' and a.revision=n.revision+1))
    order by c.name,a.id`;
  return { email: user.email, emailVerified: user.verified, applications, notices };
}

export async function saveClubApplication(sql: Sql, userId: string, input: ClubSave) {
  const data = clubSaveSchema.parse(input);
  return sql.transaction(async (tx) => {
    // Serialize account submissions, including simultaneous first submissions.
    await tx`select id from "user" where id = ${userId} for update`;
    const user = await account(tx, userId);
    if (data.submit && !user.verified)
      throw new Error("Verify your account email before submitting.");
    if (data.submit) {
      const [minor] = await tx<{ under_age: boolean }>`select
        date_of_birth > (current_date - interval '18 years')::date as under_age
        from athlete_private_profiles where user_id = ${userId}`;
      if (minor?.under_age)
        throw new Error("An adult club representative must submit this application.");
    }
    if (data.clubId) {
      const [club] = await tx`select id from clubs where id = ${data.clubId}`;
      if (!club) throw new Error("Choose an existing club from the directory.");
    }
    const key = registrationKey(data.clubId, data.details);
    // Hold the same row lock as review/withdrawal before reading its revision.
    // Otherwise an in-flight draft save could overwrite a staff approval.
    if (data.id)
      await tx`select id from club_registration_applications
      where id = ${data.id} and user_id = ${userId} for update`;
    const existing = data.id ? await ownApplication(tx, userId, data.id) : null;
    const status = data.submit ? "pending" : "draft";
    if (existing) {
      if (!editable.has(existing.status))
        throw new Error("This application is closed. Contact AthRecs to change your authority.");
      if (existing.status === "pending") {
        const [dispute] =
          await tx`select 1 from club_officer_confirmations where application_id=${existing.id} and revision=${existing.revision} and status='disputed'
          union all select 1 from club_access_notices where application_id=${existing.id} and revision=${existing.revision} and disputed_at is not null`;
        if (dispute) throw new Error("This request is under staff review.");
      }
      if (existing.club_id !== data.clubId)
        throw new Error("The selected club cannot change. Start a separate application.");
      if (existing.revision !== data.revision)
        throw new Error("This application changed. Reload it before saving.");
    } else {
      const [duplicate] = await tx<{ id: string }>`select id from club_registration_applications
        where user_id = ${userId} and request_key = ${key}`;
      if (duplicate)
        throw new Error(
          "You already have an application for this club. Open it in My club registrations.",
        );
      const [limit] = await tx<{ count: number }>`select count(*)::int as count
        from club_registration_applications where user_id = ${userId} and status in ('draft','pending','needs_changes')`;
      if (limit.count >= 10)
        throw new Error("You have ten open applications. Complete or withdraw one first.");
      const [daily] = await tx<{ count: number }>`select count(*)::int as count
        from club_registration_applications where user_id = ${userId} and created_at > now() - interval '24 hours'`;
      if (daily.count >= 20)
        throw new Error("The daily application limit has been reached. Please try again tomorrow.");
    }
    const id = existing?.id ?? randomUUID();
    const details = JSON.stringify(data.details);
    if (existing) {
      await tx`update club_registration_applications set details = ${details}::jsonb,
        request_key = ${key}, status = ${status}, revision = revision + 1,
        submitted_email = ${data.submit ? user.email : null},
        notice_version = ${data.submit ? CLUB_NOTICE_VERSION : null},
        submitted_at = case when ${data.submit} then now() else null end,
        reviewed_at = null, updated_at = now() where id = ${id} and user_id = ${userId}`;
    } else {
      await tx`insert into club_registration_applications
        (id, user_id, club_id, request_key, details, status, submitted_email, notice_version, submitted_at)
        values (${id}, ${userId}, ${data.clubId}, ${key}, ${details}::jsonb, ${status},
          ${data.submit ? user.email : null}, ${data.submit ? CLUB_NOTICE_VERSION : null},
          case when ${data.submit} then now() else null end)`;
    }
    if (data.submit)
      await notifyClubRepresentatives(tx, id, (existing?.revision ?? 0) + 1, data.clubId);
    await audit(tx, id, userId, data.submit ? "submitted" : "draft_saved", {
      revision: (existing?.revision ?? 0) + 1,
      details: data.details,
      noticeVersion: data.submit ? CLUB_NOTICE_VERSION : null,
    });
    return ownApplication(tx, userId, id);
  });
}

export async function withdrawClubApplication(
  sql: Sql,
  userId: string,
  id: string,
  revision: number,
) {
  return sql.transaction(async (tx) => {
    await tx`select id from club_registration_applications where id = ${id} and user_id = ${userId} for update`;
    const current = await ownApplication(tx, userId, id);
    if (current.revision !== revision)
      throw new Error("This application changed. Reload before withdrawing.");
    if (!editable.has(current.status))
      throw new Error(
        "Only open applications can be withdrawn. Contact AthRecs to remove approved access.",
      );
    await tx`update club_registration_applications set status = 'withdrawn', revision = revision + 1,
      updated_at = now() where id = ${id} and user_id = ${userId}`;
    await audit(tx, id, userId, "withdrawn", {});
    return { withdrawn: true };
  });
}

export async function clubReviewQueue(sql: Sql, status: string, page: number) {
  const [count] = await sql<{ total: number }>`select count(*)::int as total
    from club_registration_applications where status = ${status}`;
  const applications = await sql.query<ClubReviewApplication>(
    `select ${columns}, a.user_id,
    a.submitted_email, cf.target_club_id as confirmation_club_id,
    case when exists(select 1 from club_access_notices n where n.application_id=a.id and n.revision=a.revision and n.disputed_at is not null)
      then 'disputed' when cf.status='pending' and cf.expires_at<=now() then 'expired' else cf.status end as confirmation_status,
    cf.method as confirmation_method, cf.source_url as confirmation_source, cf.contact as confirmation_contact, cf.reply_note as confirmation_note,
    (select count(*)::int from club_representatives r
      where r.club_id = a.club_id and r.status = 'active') as active_representatives
    from club_registration_applications a left join clubs c on c.id = a.club_id
    left join club_officer_confirmations cf on cf.application_id=a.id and cf.revision=a.revision
    where a.status = $1 order by a.updated_at, a.id limit 25 offset $2`,
    [status, (page - 1) * 25],
  );
  return { applications, total: count.total };
}

export async function reviewClubApplication(sql: Sql, reviewerId: string, input: ClubReview) {
  const data = clubReviewSchema.parse(input);
  return sql.transaction(async (tx) => {
    const [app] = await tx<ClubReviewApplication>`select * from club_registration_applications
      where id = ${data.id} for update`;
    if (!app) throw new Error("Application not found.");
    if (app.user_id === reviewerId)
      throw new Error("Another staff member must review your own application.");
    if (app.revision !== data.revision)
      throw new Error("This application changed. Reload before reviewing.");
    if (
      data.action === "revoked"
        ? app.status !== "approved"
        : !["pending", "needs_changes"].includes(app.status)
    )
      throw new Error("This decision is not available for the application's current status.");
    let clubId = app.club_id;
    if (data.action === "approved") {
      const user = await account(tx, app.user_id);
      if (!user.verified || user.email !== app.submitted_email)
        throw new Error("The applicant's verified email changed. Request a new submission.");
      const [minor] = await tx<{ under_age: boolean }>`select
        date_of_birth > (current_date - interval '18 years')::date as under_age
        from athlete_private_profiles where user_id = ${app.user_id}`;
      if (minor?.under_age)
        throw new Error("An adult club representative must submit this application.");
      clubSaveSchema.parse({ clubId, details: app.details, submit: true });
      if (clubId && (data.createListing || (data.resolvedClubId && data.resolvedClubId !== clubId)))
        throw new Error("Approve the selected directory club; do not move its application.");
      if (!clubId) {
        if (data.resolvedClubId) clubId = data.resolvedClubId;
        else if (data.createListing) {
          // Serialize missing-club creation; do not merge near-name clubs automatically.
          await tx`lock table clubs in share row exclusive mode`;
          const [duplicate] = await tx`select id from clubs where
            lower(regexp_replace(trim(name), '\\s+', ' ', 'g')) =
            lower(regexp_replace(trim(${app.details.clubName}), '\\s+', ' ', 'g'))
            and lower(trim(country)) = lower(trim(${app.details.country}))`;
          if (duplicate)
            throw new Error(
              "A club with this name and country is already listed. Select the correct existing listing.",
            );
          const slug = `${
            app.details.clubName
              .toLowerCase()
              .normalize("NFKD")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 80) || "club"
          }-${app.id.slice(0, 8)}`;
          const [created] = await tx<{ id: number }>`insert into clubs
            (slug, name, city, county, country, sports, website, summary)
            values (${slug}, ${app.details.clubName}, ${app.details.city}, ${app.details.county},
              ${app.details.country}, ${app.details.sports.join(",")}, ${app.details.website || null}, '') returning id`;
          clubId = created.id;
        } else
          throw new Error(
            "Select the existing club or explicitly approve a new directory listing.",
          );
      }
      const [club] = await tx`select id from clubs where id = ${clubId} for update`;
      if (!club) throw new Error("Directory club not found.");
      const [confirmation] = await tx`select 1 from club_officer_confirmations cf
        where cf.application_id=${app.id} and cf.revision=${app.revision} and cf.status='confirmed'
        and cf.target_club_id is not distinct from ${data.createListing ? null : clubId}::int
        and not exists(select 1 from club_access_notices n where n.application_id=cf.application_id and n.revision=cf.revision and n.disputed_at is not null)`;
      if (!confirmation)
        throw new Error(
          "Independent club confirmation is required for this application and listing. Resolve any disputed request first.",
        );
      await notifyClubRepresentatives(tx, app.id, app.revision, clubId);
      const [other] = await tx`select application_id from club_representatives
        where club_id = ${clubId} and user_id = ${app.user_id} and application_id <> ${app.id}`;
      if (other)
        throw new Error("This account already represents the club through another application.");
      await tx`insert into club_representatives (club_id, user_id, application_id, status)
        values (${clubId}, ${app.user_id}, ${app.id}, 'active')`;
    }
    if (data.action === "revoked")
      await tx`update club_representatives set status = 'revoked'
      where application_id = ${app.id}`;
    await tx`update club_registration_applications set status = ${data.action}, club_id = ${clubId},
      review_message = ${data.message}, revision = revision + 1, reviewed_at = now(), updated_at = now()
      where id = ${app.id}`;
    await audit(tx, app.id, reviewerId, data.action, {
      revision: app.revision,
      evidenceNote: data.evidenceNote,
      message: data.message,
      identityChecked: data.identityChecked,
      authorityChecked: data.authorityChecked,
      clubId,
    });
    return { saved: true };
  });
}

/** Future club member tools must call this; directory presence never grants access. */
export async function requireClubRepresentative(sql: Sql, userId: string, clubId: number) {
  const [allowed] = await sql`select r.club_id from club_representatives r
    join club_registration_applications a on a.id = r.application_id
    join "user" u on u.id = r.user_id
    where r.user_id = ${userId} and r.club_id = ${clubId} and r.status = 'active'
      and a.status = 'approved' and u."emailVerified" and u.email = a.submitted_email`;
  if (!allowed) throw new Error("Verified club representative access is required.");
}

export async function disputeClubNotice(
  sql: Sql,
  userId: string,
  id: string,
  revision: number,
  clubId: number,
) {
  return sql.transaction(async (tx) => {
    const [app] =
      await tx`select id from club_registration_applications where id=${id} and status='pending' and revision=${revision} for update`;
    await requireClubRepresentative(tx, userId, clubId);
    if (!app) throw new Error("This request has already been reviewed.");
    const [notice] = await tx`update club_access_notices n set disputed_at=now()
      from club_registration_applications a left join club_officer_confirmations cf
        on cf.application_id=a.id and cf.revision=a.revision
      where a.id=${id} and n.application_id=a.id and n.revision=${revision} and n.recipient_id=${userId}
        and n.club_id=${clubId} and n.club_id=coalesce(a.club_id, cf.target_club_id)
        and n.disputed_at is null returning n.club_id`;
    if (!notice) throw new Error("This request is unavailable.");
    await audit(tx, id, userId, "representative_disputed", { revision, clubId });
    return { saved: true };
  });
}

export async function saveClubContent(sql: Sql, userId: string, input: ClubContent) {
  const d = clubContentSchema.parse(input);
  return sql.transaction(async (tx) => {
    // Serialise edits and revocation at the active appointment.
    const [appointment] = await tx<{ id: string }>`select a.id from club_registration_applications a
      join club_representatives r on r.application_id=a.id where r.club_id=${d.clubId} and r.user_id=${userId} for update of a`;
    await requireClubRepresentative(tx, userId, d.clubId);
    await tx`select id from clubs where id=${d.clubId} for update`;
    const [current] = await tx<{
      revision: number;
    }>`select revision from club_profile_updates where club_id=${d.clubId}`;
    if ((current?.revision ?? 0) !== d.revision)
      throw new Error(
        "The club profile has changed. Reopen the editor to load the latest version.",
      );
    await tx`insert into club_profile_updates(club_id,biography,training,contact_url,revision)
      values(${d.clubId},${d.biography},${d.training},${d.contactUrl},1) on conflict(club_id) do update
      set biography=excluded.biography,training=excluded.training,contact_url=excluded.contact_url,revision=club_profile_updates.revision+1`;
    await audit(tx, appointment.id, userId, "profile_updated", d);
    return { saved: true };
  });
}
