import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { authMiddleware } from "@/lib/auth/middleware";
import { z } from "zod";
import {
  invitationSearch,
  invitationInput,
  invitationId,
  invitationToken,
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
export const findStaffClaimMatches = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => invitationSearch.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { findInvitationMatches } = await import("./claim-invitations.server");
    return findInvitationMatches(await getSql(), data.userId, data.q);
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
      await tx`update athlete_claim_invitations set declined_at=now() where id=${invite.id}`;
      return { declined: true };
    });
  });
