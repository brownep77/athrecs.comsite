import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { getSql, type Sql } from "@/lib/db";
import {
  MEMBER_ONBOARDING_VERSION,
  memberNamesMatch,
  onboardingSchema,
  type MemberOnboarding,
  type MemberRole,
} from "./member-onboarding";

async function privateResponse() {
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("Cache-Control", "private, no-store");
  setResponseHeader("Vary", "Cookie, Authorization");
  setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
}

type OnboardingRow = {
  first_name: string;
  last_name: string;
  roles: MemberRole[];
  organisation: string;
};

type CompletionRow = {
  email_verified: boolean;
  full_name: string | null;
  country: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  postcode: string | null;
  privacy_acknowledged: boolean;
  primary_sport: boolean;
};

async function completionFields(
  sql: Sql,
  userId: string,
  data: MemberOnboarding,
): Promise<string[]> {
  const rows = await sql<CompletionRow>`
    select account_user."emailVerified" as email_verified,
      profile.full_name, profile.country, profile.date_of_birth::text as date_of_birth,
      profile.nationality, profile.postcode,
      (profile.privacy_acknowledged_at is not null) as privacy_acknowledged,
      exists(select 1 from athlete_sport_profiles sport
        where sport.user_id = account_user.id and sport.is_primary = true) as primary_sport
    from "user" account_user
    left join athlete_private_profiles profile on profile.user_id = account_user.id
    where account_user.id = ${userId}
    limit 1
  `;
  const row = rows[0];
  if (!row?.email_verified) return ["a verified email address"];
  const missing: string[] = [];
  if (!row.full_name || !memberNamesMatch(data.firstName, data.lastName, row.full_name)) {
    missing.push("your saved first and last name");
  }
  if (!row.country?.trim()) missing.push("country");
  if (!row.privacy_acknowledged) missing.push("privacy acknowledgement");
  if (data.roles.includes("athlete")) {
    if (!row.date_of_birth) missing.push("date of birth");
    if (!row.nationality?.trim()) missing.push("nationality");
    if (!row.postcode?.trim()) missing.push("postcode or area code");
    if (!row.primary_sport) missing.push("a primary sport");
  }
  return missing;
}

/** Null means onboarding has not completed with the member's CURRENT profile. */
export const getMyOnboarding = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<MemberOnboarding | null> => {
    await privateResponse();
    const sql = await getSql();
    const rows = await sql<OnboardingRow>`
      select first_name, last_name, roles, organisation from member_onboarding
      where user_id = ${context.userId} limit 1
    `;
    const row = rows[0];
    if (!row) return null;
    const parsed = onboardingSchema.safeParse({
      firstName: row.first_name,
      lastName: row.last_name,
      roles: row.roles,
      organisation: row.organisation,
    });
    if (!parsed.success || (await completionFields(sql, context.userId, parsed.data)).length)
      return null;
    return parsed.data;
  });

/** Store only private self-description; this cannot grant staff or club privileges. */
export const completeMyOnboarding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: MemberOnboarding) => onboardingSchema.parse(input))
  .handler(async ({ data, context }): Promise<MemberOnboarding> => {
    await privateResponse();
    const sql = await getSql();
    await sql.transaction(async (tx) => {
      // The same per-user lock used by profile saves keeps completion checks and
      // the metadata write together when another tab saves concurrently.
      const users = await tx<{
        id: string;
      }>`select id from "user" where id = ${context.userId} for update`;
      if (!users.length) throw new Error("Your signed-in account could not be found");
      const missing = await completionFields(tx, context.userId, data);
      if (missing.length)
        throw new Error(`Complete ${missing.join(", ")} before finishing your profile`);
      await tx`
        insert into member_onboarding (
          user_id, first_name, last_name, roles, organisation, policy_version
        ) values (
          ${context.userId}, ${data.firstName}, ${data.lastName}, ${data.roles},
          ${data.organisation}, ${MEMBER_ONBOARDING_VERSION}
        )
        on conflict (user_id) do update set
          first_name = excluded.first_name,
          last_name = excluded.last_name,
          roles = excluded.roles,
          organisation = excluded.organisation,
          policy_version = excluded.policy_version,
          updated_at = clock_timestamp()
        where member_onboarding.first_name is distinct from excluded.first_name
          or member_onboarding.last_name is distinct from excluded.last_name
          or member_onboarding.roles is distinct from excluded.roles
          or member_onboarding.organisation is distinct from excluded.organisation
          or member_onboarding.policy_version is distinct from excluded.policy_version
      `;
    });
    return data;
  });

export type StaffMemberRole = OnboardingRow & { user_id: string; email: string };

export const listStaffMemberRoles = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async (): Promise<StaffMemberRole[]> => {
    await privateResponse();
    const sql = await getSql();
    return sql<StaffMemberRole>`
      select onboarding.user_id, onboarding.first_name, onboarding.last_name,
        lower(account_user.email) as email, onboarding.roles, onboarding.organisation
      from member_onboarding onboarding
      join "user" account_user on account_user.id = onboarding.user_id
      order by onboarding.updated_at desc, onboarding.user_id
      limit 200
    `;
  });
