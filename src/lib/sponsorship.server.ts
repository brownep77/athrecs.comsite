import type { Sql } from "./db.ts";
import {
  SPONSORSHIP_POLICY,
  type SponsorshipInput,
  type SponsorshipReview,
  type SponsorshipEnquiry,
} from "./sponsorship.ts";

const columns = `e.id, e.source, e.kind, e.contact_name, e.name, e.website, e.location,
  e.event_date::text, e.support, e.budget, e.reach, e.message, e.status, e.response,
  e.revision, e.created_at::text`;

export async function mySponsorshipEnquiries(sql: Sql, userId: string) {
  const [enquiries, users] = await Promise.all([
    sql.query<SponsorshipEnquiry>(
      `select ${columns} from sponsorship_enquiries e
      where e.user_id = $1
      order by case when e.status in ('pending', 'in_review') then 0 else 1 end, e.created_at desc limit 100`,
      [userId],
    ),
    sql<{ verified: boolean }>`select "emailVerified" as verified from "user" where id = ${userId}`,
  ]);
  return { enquiries, emailVerified: users[0]?.verified === true };
}

export async function createSponsorshipEnquiry(
  sql: Sql,
  userId: string,
  source: "athrecs" | "runrecs",
  data: SponsorshipInput,
) {
  return sql.transaction(async (tx) => {
    // Serialize per-user submissions, including concurrent retries and rate limits.
    const [user] = await tx<{ verified: boolean }>`select "emailVerified" as verified
      from "user" where id = ${userId} for update`;
    if (!user?.verified)
      throw new Error("A verified email is required. Google sign-in is available.");
    const [existing] = await tx<{ id: number }>`select id from sponsorship_enquiries
      where user_id = ${userId} and request_id = ${data.requestId}::uuid`;
    if (existing) return { id: Number(existing.id) };
    const [profile] = await tx<{ under_age: boolean }>`select
      date_of_birth > (current_date - interval '18 years')::date as under_age
      from athlete_private_profiles where user_id = ${userId}`;
    if (profile?.under_age)
      throw new Error("Sponsorship enquiries are currently for adults aged 18 and over.");
    const [counts] = await tx<{ open_count: string; recent_count: string }>`select
      count(*) filter (where status in ('pending', 'in_review')) as open_count,
      count(*) filter (where created_at > now() - interval '24 hours') as recent_count
      from sponsorship_enquiries where user_id = ${userId}`;
    if (Number(counts.open_count) >= 5 || Number(counts.recent_count) >= 10)
      throw new Error(
        "You can have up to five open enquiries and submit ten per day. Please use your existing enquiries or try later.",
      );
    if (data.kind === "race_organiser") {
      const [date] = await tx<{
        valid: boolean;
      }>`select ${data.eventDate}::date >= current_date as valid`;
      if (!date?.valid) throw new Error("Choose an upcoming race date.");
    }
    const [created] = await tx<{ id: number }>`insert into sponsorship_enquiries
      (user_id, request_id, source, kind, contact_name, name, website, location, event_date,
       support, budget, reach, message, policy_version)
      values (${userId}, ${data.requestId}::uuid, ${source}, ${data.kind}, ${data.contactName},
       ${data.name}, ${data.website}, ${data.location},
       ${data.kind === "race_organiser" ? data.eventDate : null}::date,
       ${data.support}, ${data.budget}, ${data.reach}, ${data.message}, ${SPONSORSHIP_POLICY}) returning id`;
    await tx`insert into sponsorship_enquiry_audit (enquiry_id, actor_user_id, action)
      values (${created.id}, ${userId}, 'submitted')`;
    return { id: Number(created.id) };
  });
}

export async function withdrawSponsorshipEnquiry(sql: Sql, userId: string, id: number) {
  return sql.transaction(async (tx) => {
    const [item] = await tx<{ id: number }>`update sponsorship_enquiries set
      status = 'withdrawn', revision = revision + 1, updated_at = now()
      where id = ${id} and user_id = ${userId} and status in ('pending', 'in_review') returning id`;
    if (!item) throw new Error("This enquiry is unavailable or already closed.");
    await tx`insert into sponsorship_enquiry_audit (enquiry_id, actor_user_id, action)
      values (${id}, ${userId}, 'withdrawn')`;
    return { ok: true };
  });
}

export async function sponsorshipReviewQueue(sql: Sql, status: string) {
  return sql.query<SponsorshipEnquiry & { email: string }>(
    `select ${columns}, u.email
    from sponsorship_enquiries e join "user" u on u.id = e.user_id
    where e.status = $1 order by e.created_at asc limit 100`,
    [status],
  );
}

export async function reviewSponsorshipEnquiry(sql: Sql, staffId: string, data: SponsorshipReview) {
  return sql.transaction(async (tx) => {
    const [item] = await tx<{ id: number }>`update sponsorship_enquiries set
      status = ${data.status}, response = ${data.response}, revision = revision + 1, updated_at = now()
      where id = ${data.id} and revision = ${data.revision} and status in ('pending', 'in_review') returning id`;
    if (!item) throw new Error("This enquiry changed or is closed. Refresh before reviewing.");
    await tx`insert into sponsorship_enquiry_audit (enquiry_id, actor_user_id, action)
      values (${data.id}, ${staffId}, ${data.status})`;
    return { ok: true };
  });
}
