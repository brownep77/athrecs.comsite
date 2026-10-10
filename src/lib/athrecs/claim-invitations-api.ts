import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";
import {
  invitationSearch,
  invitationInput,
  invitationId,
  invitationToken,
  externalInvitationInput,
} from "./claim-invitation";

export const privateClaimMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    setResponseHeader("Vary", "Cookie, Authorization");
    setResponseHeader("Referrer-Policy", "no-referrer");
    setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    return next();
  },
);

/** Only return resumable invitations addressed to this verified account. */
export const getMyOpenClaimInvitations = createServerFn({ method: "GET" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
    const { IS_RUNRECS_SITE } = await import("@/lib/site-scope");
    if (IS_RUNRECS_SITE || process.env.VERCEL_ENV === "preview") return [];
    const sql = await getSql();
    const rows = await sql<{ athleteName: string; resultId: number; claim_url: string }>`
      select a.display_name as "athleteName", i.result_id as "resultId", i.claim_url
      from athlete_claim_invitations i
      join athletes a on a.id=i.athlete_id
      join "user" u on u.id=${context.userId}
      where u."emailVerified"=true
        and (i.user_id=u.id or (i.user_id is null and i.invitation_kind='email'))
        and (i.recipient_email=lower(trim(u.email)) or (i.user_id=u.id and i.invitation_kind='contact'))
        and i.revoked_at is null and i.declined_at is null and i.claim_id is null
        and i.expires_at>now()
        and not exists (select 1 from result_claims c where c.result_id=i.result_id
          and c.claimant_user_id=u.id and c.status in ('pending','needs_info','approved'))
        and not exists (select 1 from athlete_account_links l where l.athlete_id=i.athlete_id
          and l.user_id=u.id and l.status='active')
      order by i.created_at desc limit 5
    `;
    return rows.flatMap((row) => {
      try {
        const url = new URL(row.claim_url);
        const token = invitationToken.safeParse(url.searchParams.get("invitation"));
        return url.protocol === "https:" &&
          url.hostname === "www.athrecs.com" &&
          url.pathname === "/claim-results" &&
          Number(url.searchParams.get("resultId")) === row.resultId &&
          token.success
          ? [{ athleteName: row.athleteName, resultId: row.resultId, token: token.data }]
          : [];
      } catch {
        return [];
      }
    });
  });

export const findStaffClaimMatches = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => invitationSearch.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { findInvitationMatches } = await import("./claim-invitations.server");
    return findInvitationMatches(await getSql(), data.userId, data.q, data.athleteId);
  });

export const findDirectoryInvitationAccounts = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        athleteNumber: z.string().regex(/^[1-9]\d{0,17}$/),
        q: z.string().trim().max(120).optional(),
        page: z.number().int().min(1).max(100000).default(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { loadRegistrations } = await import("./registrations.server");
    const { registrationFilters } = await import("./registration-filters");
    const sql = await getSql();
    const [account] = await sql<{
      userId: string;
    }>`select user_id as "userId" from athlete_identifiers where number=${data.athleteNumber}::bigint and user_id is not null`;
    const profiles = await sql<{
      id: number;
      name: string;
    }>`select a.id,a.display_name as name from athletes a join athlete_resolved_ids i on i.athlete_id=a.id where i.athlete_number=${data.athleteNumber}::bigint order by a.id`;
    if (!account && !profiles.length) throw new Error("Directory profile not found.");
    const registrations = await loadRegistrations(
      sql,
      registrationFilters.parse({
        q: account ? "" : (data.q ?? profiles[0].name),
        page: data.page,
      }),
      account?.userId,
    );
    return {
      accounts: registrations.accounts,
      total: registrations.total,
      page: registrations.page,
      pageSize: registrations.pageSize,
      registered: !!account,
      athleteId: account ? null : profiles[0].id,
    };
  });
export const createStaffClaimInvitation = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => invitationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const { createInvitation, assertInvitationWrites } = await import("./claim-invitations.server");
    assertInvitationWrites();
    return createInvitation(await getSql(), context.userId, data);
  });
export const getStaffInvitationProfile = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => z.object({ athleteId: z.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { externalInvitationProfile } = await import("./claim-invitations.server");
    return externalInvitationProfile(await getSql(), data.athleteId);
  });
export const createStaffExternalInvitation = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => externalInvitationInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const { createExternalInvitation, assertInvitationWrites } =
      await import("./claim-invitations.server");
    assertInvitationWrites();
    return createExternalInvitation(await getSql(), context.userId, data);
  });
export const getClaimInvitationIntro = createServerFn({ method: "GET" })
  .middleware([privateClaimMiddleware])
  .validator((input: unknown) =>
    z.object({ token: invitationToken, resultId: z.number().int().positive() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { invitationIntro } = await import("./claim-invitations.server");
    return invitationIntro(await getSql(), data.token, data.resultId);
  });
export const emailStaffClaimInvitation = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => invitationId.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { sendInvitationEmail, assertInvitationWrites } =
      await import("./claim-invitations.server");
    assertInvitationWrites();
    return sendInvitationEmail(await getSql(), data.id);
  });
export const revokeStaffClaimInvitation = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => invitationId.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { assertInvitationWrites } = await import("./claim-invitations.server");
    assertInvitationWrites();
    const sql = await getSql();
    const rows =
      await sql`update athlete_claim_invitations set revoked_at=now() where id=${data.id} and claim_id is null and revoked_at is null returning id`;
    if (!rows.length)
      throw new Error(
        "Invitation already closed or claimed. Review any submitted claim separately.",
      );
    return { revoked: true };
  });
export const declineClaimInvitation = createServerFn({ method: "POST" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .validator((input: unknown) =>
    z.object({ token: invitationToken, resultId: z.number().int().positive() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const { validateInvitation, assertInvitationWrites } =
      await import("./claim-invitations.server");
    assertInvitationWrites();
    const sql = await getSql();
    return sql.transaction(async (tx) => {
      const [result] = await tx<{
        athlete_id: number;
      }>`select athlete_id from results where id=${data.resultId}`;
      if (!result) throw new Error("Invitation unavailable.");
      await tx`select id from athletes where id=${result.athlete_id} for update`;
      const invite = await validateInvitation(
        tx,
        data.token,
        context.userId,
        data.resultId,
        result.athlete_id,
        true,
      );
      if (invite.claim_id)
        throw new Error(
          "A claim has already been submitted. Withdraw it from your claims if needed.",
        );
      await tx`update athlete_claim_invitations set declined_at=now(),user_id=coalesce(user_id,${context.userId}) where id=${invite.id}`;
      return { declined: true };
    });
  });
