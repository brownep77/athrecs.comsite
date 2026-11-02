import { INVITATION_STATUS_SQL } from "./claim-invitations.server";
import type { InvitationSummary } from "./claim-invitation";
import type { Sql } from "@/lib/db";
import type { RegistrationFilters } from "./registration-filters";
import { loadRegistrationStats } from "./registration-stats.server";
import type { StaffContact } from "./athlete-contact";
import type { ProfileConnection } from "./profile-connections";
import { parseAthleteId } from "./athlete-id";

export type RegisteredAthlete = {
  invitation: InvitationSummary | null;
  contact: StaffContact;
  profileConnections: ProfileConnection[];
  marketingConsent: boolean;
  userId: string;
  athleteNumber: string | null;
  name: string;
  email: string;
  emailVerified: boolean;
  signedUpAt: string;
  profileSavedAt: string | null;
  club: string | null;
  location: string;
  signInCount: number;
  lastSignInAt: string | null;
  selectedSports: string[];
  resultSports: string[];
  linkedProfiles: number;
  linkedResults: number;
  racesClaimed: number;
  approved: number;
  pending: number;
  needsInfo: number;
  rejected: number;
  withdrawn: number;
  welcomeStatus?: string;
  resultsConfirmed?: boolean;
};

export async function loadRegistrations(
  sql: Sql,
  filters: RegistrationFilters,
  onlyUserId?: string,
) {
  const pageSize = 25;
  const term = `%${filters.q.replace(/[\\%_]/g, "\\$&")}%`;
  const number = parseAthleteId(filters.q);
  // Static SQL fragments only; all user-supplied values remain parameters.
  const from = `from "user" u
    left join athlete_identifiers i on i.user_id=u."id"
    left join athlete_private_profiles p on p.user_id=u."id"
    left join athlete_login_activity activity on activity.user_id=u."id"`;
  const where = `where ($1='' or u."name" ilike $2 or u."email" ilike $2
      or p.full_name ilike $2 or p.club_or_team ilike $2 or i.number::text=$3)
    and ($4='all'
      or ($4='unverified' and not u."emailVerified")
      or ($4='unfinished' and p.user_id is null)
      or ($4='pending' and exists (select 1 from result_claims c
        where c.claimant_user_id=u."id" and c.status in ('pending','needs_info'))))
    and ($5='' or u."createdAt">=(nullif($5,'')::date::timestamp at time zone 'Europe/London'))
    and ($6='' or u."createdAt"<((nullif($6,'')::date + interval '1 day') at time zone 'Europe/London'))
    and ($7::text is null or u."id"=$7)`;
  const parameters = [
    filters.q,
    term,
    number,
    filters.status,
    filters.joinedFrom,
    filters.joinedTo,
    onlyUserId ?? null,
  ];
  const order = {
    newest: 'u."createdAt" desc, u."id"',
    oldest: 'u."createdAt" asc, u."id"',
    logins: 'coalesce(activity.sign_in_count,0) desc, u."createdAt" desc, u."id"',
    recent: 'activity.last_sign_in_at desc nulls last, u."createdAt" desc, u."id"',
  }[filters.sort];

  // A repeatable read gives the totals and page the same snapshot.
  return sql.transaction(async (tx) => {
    await tx.query("set transaction isolation level repeatable read, read only");
    const [summary] = await tx<{
      total: number;
      today: number;
      thisMonth: number;
      unverified: number;
      unfinished: number;
      pending: number;
      needsInfo: number;
      recentSignups: number;
      trackingSince: string;
    }>`select count(*)::int as total,
      count(*) filter (where u."createdAt">=(date_trunc('day',now() at time zone 'Europe/London') at time zone 'Europe/London') and u."createdAt"<=now())::int as today,
      count(*) filter (where u."createdAt">=(date_trunc('month',now() at time zone 'Europe/London') at time zone 'Europe/London') and u."createdAt"<=now())::int as "thisMonth",
      count(*) filter (where not u."emailVerified")::int as unverified,
      count(*) filter (where p.user_id is null)::int as unfinished,
      count(*) filter (where u."createdAt">=now()-interval '7 days')::int as "recentSignups",
      (select count(*)::int from result_claims where status='pending') as pending,
      (select count(*)::int from result_claims where status='needs_info') as "needsInfo",
      (select started_at::text from athlete_login_tracking where singleton) as "trackingSince"
      from "user" u left join athlete_private_profiles p on p.user_id=u."id"`;
    const [count] = await tx.query<{ total: number }>(
      `select count(*)::int as total ${from} ${where}`,
      parameters,
    );
    const total = count.total;
    const page = Math.min(filters.page, Math.max(1, Math.ceil(total / pageSize)));
    const accounts = await tx.query<RegisteredAthlete>(
      `with selected as materialized (
        select u."id" ${from} ${where} order by ${order} limit $8 offset $9
      ) select
        (select jsonb_build_object('id',i.id,'athleteName',a.display_name,'status',${INVITATION_STATUS_SQL},'createdAt',i.created_at::text,'expiresAt',i.expires_at::text,'sentAt',i.email_sent_at::text) from athlete_claim_invitations i join athletes a on a.id=i.athlete_id where i.user_id=u.id order by i.created_at desc limit 1) as invitation,
      jsonb_build_object('phone',contact.phone,'telegramUsername',contact.telegram_username,
        'socialLinks',coalesce(contact.social_links,'[]'::jsonb),'sourceNote',coalesce(contact.source_note,'')) as contact,
      coalesce((select jsonb_agg(jsonb_build_object('platform',pc.platform,'url',pc.url,'sharePublicly',pc.share_publicly) order by pc.platform)
        from athlete_profile_connections pc where pc.user_id=u."id"),'[]'::jsonb) as "profileConnections",
      exists(select 1 from athlete_account_consents consent where consent.user_id=u."id" and consent.purpose='marketing' and consent.status='granted') as "marketingConsent",
      u."id" as "userId", i.number::text as "athleteNumber",
      coalesce(nullif(p.full_name,''),nullif(u."name",''),'Name not supplied') as name,
      u."email" as email, u."emailVerified" as "emailVerified",
      (select case when w.sent_at is not null then 'Welcome sent'
        when w.skipped_reason='invitation_welcome_sent' then 'Welcomed by invitation'
        when w.needs_review or w.skipped_reason='email_changed' then 'Welcome needs review'
        when not u."emailVerified" then 'Welcome awaiting email verification'
        else 'Welcome queued' end from signup_welcome_deliveries w where w.user_id=u.id) as "welcomeStatus",
      exists(select 1 from athlete_profile_result_confirmations c where c.user_id=u.id) as "resultsConfirmed",
      u."createdAt"::text as "signedUpAt", p.updated_at::text as "profileSavedAt",
      p.club_or_team as club,
      concat_ws(', ',
        coalesce(nullif(concat_ws(', ',nullif(trim(p.city),''),nullif(trim(p.region),''),nullif(trim(p.postcode),'')),''),nullif(u."signupLocation",'')),
        coalesce(nullif(trim(p.country),''),nullif(u."signupCountry",''))) as location,
      coalesce(activity.sign_in_count,0)::int as "signInCount",
      activity.last_sign_in_at::text as "lastSignInAt",
      array(select sport_code from athlete_sport_profiles sp where sp.user_id=u."id"
        order by is_primary desc,sport_code) as "selectedSports",
      records.sports as "resultSports", records.total as "linkedResults",
      (select count(*)::int from athlete_account_links l where l.user_id=u."id" and l.status='active') as "linkedProfiles",
      claims.races as "racesClaimed", claims.approved, claims.pending,
      claims.needs_info as "needsInfo", claims.rejected, claims.withdrawn
      ${from}
      join selected on selected."id"=u."id"
      left join athlete_staff_contacts contact on contact.user_id=u."id"
      cross join lateral (select
        count(distinct case when r.edition_id > 0 then r.edition_id::text else concat(r.event_name,'|',r.event_date,'|',r.distance_code) end) filter (where c.status not in ('rejected','withdrawn'))::int as races,
        count(*) filter (where c.status='approved')::int as approved,
        count(*) filter (where c.status='pending')::int as pending,
        count(*) filter (where c.status='needs_info')::int as needs_info,
        count(*) filter (where c.status='rejected')::int as rejected,
        count(*) filter (where c.status='withdrawn')::int as withdrawn
        from result_claims c join athlete_claimable_results r on r.id=c.claim_key where c.claimant_user_id=u."id") claims
      cross join lateral (select count(*)::int as total,
        coalesce(array_agg(distinct r.event_sport order by r.event_sport),array[]::text[]) as sports
        from athlete_account_links l join athlete_claimable_results r on r.athlete_id=l.athlete_id
        where l.user_id=u."id" and l.status='active' and (r.id > 0 or r.available)
          and lower(r.status) not in ('dns','did not start')) records
      order by ${order}`,
      [...parameters, pageSize, (page - 1) * pageSize],
    );
    const stats = await loadRegistrationStats(tx, filters.month);
    const funnel = await loadSignupFunnel(tx);
    return { accounts, total, page, pageSize, summary, stats, funnel };
  });
}

export async function loadSignupFunnel(sql: Sql) {
  const [funnel] = await sql<{
    signedUp: number;
    verified: number;
    welcomed: number;
    claimed: number;
    confirmed: number;
    submitted: number;
  }>`
    select count(*)::int as "signedUp",
      count(*) filter(where u."emailVerified")::int as verified,
      count(*) filter(where w.sent_at is not null or w.skipped_reason='invitation_welcome_sent')::int as welcomed,
      count(*) filter(where exists(select 1 from athlete_account_links l where l.user_id=u.id and l.status='active'))::int as claimed,
      count(*) filter(where exists(select 1 from athlete_profile_result_confirmations c where c.user_id=u.id))::int as confirmed,
      count(*) filter(where exists(select 1 from athlete_result_proposals p where p.submitted_by=u.id)
        or exists(select 1 from athlete_profile_result_confirmations c where c.user_id=u.id and c.added_count>0))::int as submitted
    from signup_welcome_deliveries w join "user" u on u.id=w.user_id where not athrecs_is_test_user(u.id)`;
  return funnel;
}
