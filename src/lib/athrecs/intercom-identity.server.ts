import { createHmac } from "node:crypto";
import type { Sql } from "../db";

export type IntercomIdentity =
  { status: "disabled" } | { status: "ready"; userId: string; jwt: string; expiresAt: number };

type IntercomEnvironment = {
  INTERCOM_SECRET_KEY?: string;
  VITE_INTERCOM_APP_ID?: string;
  VITE_SITE_BRAND?: string;
};

type AccountContext = {
  user_id: string;
  name: string;
  email: string;
  created_at: number;
  linked_profile_count: number;
  linked_profile_id: string | null;
  linked_profile_slug: string | null;
  pending_claim_count: number;
  linked_result_count: number;
};

const TOKEN_LIFETIME_SECONDS = 60 * 60;

/** An absent signing key leaves the existing visitor Messenger available. */
export function intercomIdentityConfigured(env: IntercomEnvironment = process.env): boolean {
  return (
    Boolean(env.INTERCOM_SECRET_KEY?.trim()) &&
    /^[a-z0-9]{6,12}$/.test(env.VITE_INTERCOM_APP_ID?.trim() ?? "") &&
    env.VITE_SITE_BRAND?.trim().toLowerCase() !== "runrecs"
  );
}

/**
 * Called only with the account id resolved by the authenticated server function.
 * Reads one account-scoped snapshot; no public-page id or name match is accepted.
 * The SQL surface is injected so isolation can be exercised with synthetic data.
 */
export async function loadIntercomIdentity(
  sql: Sql,
  userId: string,
  env: IntercomEnvironment = process.env,
  now = Math.floor(Date.now() / 1000),
): Promise<IntercomIdentity> {
  if (!intercomIdentityConfigured(env) || !userId || userId === "dev-user") {
    return { status: "disabled" };
  }

  const [account] = await sql<AccountContext>`
    with linked as materialized (
      select a.id, a.slug
      from athlete_account_links l
      join athletes a on a.id = l.athlete_id
      where l.user_id = ${userId} and l.status = 'active'
    )
    select u.id as user_id, u.name, u.email,
      floor(extract(epoch from u."createdAt"))::integer as created_at,
      (select count(*)::integer from linked) as linked_profile_count,
      (select max(id)::text from linked) as linked_profile_id,
      (select max(slug) from linked) as linked_profile_slug,
      (select count(*)::integer from result_claims c
        where c.claimant_user_id = u.id and c.status in ('pending', 'needs_info'))
        as pending_claim_count,
      (select count(*)::integer
        from linked l join athlete_claimable_results r on r.athlete_id = l.id
        where (r.id > 0 or r.available)
          and lower(r.status) not in ('dns', 'did not start')) as linked_result_count
    from "user" u
    where u.id = ${userId}
  `;

  if (!account || account.user_id !== userId) {
    throw new Error("Signed-in account is unavailable");
  }

  const profileCount = Number(account.linked_profile_count);
  const pendingClaims = Number(account.pending_claim_count);
  const singleProfile = profileCount === 1;
  const expiresAt = now + TOKEN_LIFETIME_SECONDS;
  const payload = {
    user_id: account.user_id,
    name: account.name,
    email: account.email,
    created_at: Number(account.created_at),
    iat: now,
    exp: expiresAt,
    // Intercom expects custom attributes at the JWT's top level. These values
    // are routing/support context, never proof of source/result verification.
    athrecs_linked_profile_count: profileCount,
    athrecs_profile_status: singleProfile
      ? "linked"
      : profileCount > 1
        ? "multiple_linked"
        : pendingClaims > 0
          ? "claim_pending"
          : "no_linked_profile",
    // The site's result-ownership requests create account links on approval.
    // This counts pending/needs-info requests, not pending race submissions.
    athrecs_pending_claim_count: pendingClaims,
    // Same definition as the registration summary: linked canonical/available
    // source records excluding DNS. It is not a verified finish or PB count.
    athrecs_linked_result_count: Number(account.linked_result_count),
    // There is no primary-profile designation. Clear prior single-profile
    // values if the account now owns multiple profiles or its link was revoked.
    athrecs_profile_id: singleProfile ? (account.linked_profile_id ?? "") : "",
    athrecs_profile_url:
      singleProfile && account.linked_profile_slug
        ? `https://www.athrecs.com/athletes/${encodeURIComponent(account.linked_profile_slug)}`
        : "",
  };

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const unsigned = `${header}.${body}`;
  const signature = createHmac("sha256", env.INTERCOM_SECRET_KEY!.trim())
    .update(unsigned)
    .digest("base64url");

  return {
    status: "ready",
    userId: account.user_id,
    jwt: `${unsigned}.${signature}`,
    expiresAt,
  };
}
