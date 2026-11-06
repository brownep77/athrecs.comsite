import { createHash } from "node:crypto";
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { parseFinContinuation } from "./fin-onboarding.ts";

const privateResponse = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("Cache-Control", "private, no-store");
  setResponseHeader("Vary", "Cookie, Authorization");
  setResponseHeader("Referrer-Policy", "no-referrer");
  setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  return next();
});

const unavailable = {
  status: "unavailable",
  message: "Public result search is not available on this site yet. You can still set up your profile.",
  outcomes: {
    suggestionsFound: false,
    draftSaved: false,
    claimSubmitted: false,
    profilePublished: false,
    signupCounted: false,
  },
};

async function readyAccount(userId: string): Promise<boolean> {
  const { authConfigured, DEV_USER_ID } = await import("@/lib/auth/verify.server");
  const { finConnectorConfigured } = await import("./fin-actions.server.ts");
  return Boolean(authConfigured && userId && userId !== DEV_USER_ID && finConnectorConfigured());
}

function accountRequestId(input: {
  continuation: string;
  eventName?: string;
  year?: number;
  refine?: string;
}): string {
  const digest = createHash("sha256")
    .update(`${input.continuation}|${input.eventName ?? ""}|${input.year ?? ""}|${input.refine ?? ""}`)
    .digest("hex")
    .slice(0, 40);
  return `account-${digest}`;
}

const startInput = z
  .object({
    continuation: z.string().refine((value) => Boolean(parseFinContinuation(value))),
    eventName: z.string().trim().min(2).max(200).optional(),
    year: z
      .number()
      .int()
      .min(1800)
      .refine((value) => value <= new Date().getUTCFullYear())
      .optional(),
    refine: z.string().regex(/^[a-z0-9]{8,32}$/).optional(),
  })
  .strict();

export const startMyFinResearch = createServerFn({ method: "POST" })
  .middleware([privateResponse, authMiddleware])
  .validator((input: unknown) => startInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!(await readyAccount(context.userId))) return unavailable;
    const { getSql } = await import("@/lib/db");
    const { FinResearchError, issueFinResearchToken, startFinResultResearch } = await import(
      "./fin-research.server.ts"
    );
    try {
      const sql = await getSql();
      const issued = await issueFinResearchToken(sql, context.userId, data.continuation);
      const started = await startFinResultResearch(
        sql,
        { kind: "account", userId: context.userId },
        {
          requestId: accountRequestId(data),
          eventName: data.eventName,
          year: data.year,
          refresh: data.refine,
        },
      );
      return {
        ...started.body,
        researchCode: issued.token,
        researchCodeExpiresAt: issued.expiresAt,
      };
    } catch (error) {
      if (error instanceof FinResearchError)
        return { status: error.code, message: error.message, ...unavailable.outcomes && { outcomes: unavailable.outcomes } };
      throw error;
    }
  });

export const getMyFinResearch = createServerFn({ method: "POST" })
  .middleware([privateResponse, authMiddleware])
  .validator((input: { jobId: string }) => z.object({ jobId: z.string().uuid() }).strict().parse(input))
  .handler(async ({ data, context }) => {
    if (!(await readyAccount(context.userId))) return unavailable;
    const { getSql } = await import("@/lib/db");
    const { FinResearchError, readFinResultResearch } = await import("./fin-research.server.ts");
    try {
      return (
        await readFinResultResearch(await getSql(), { kind: "account", userId: context.userId }, data.jobId)
      ).body;
    } catch (error) {
      if (error instanceof FinResearchError) return { status: error.code, message: error.message };
      throw error;
    }
  });

export const reviewMyFinResearch = createServerFn({ method: "POST" })
  .middleware([privateResponse, authMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        jobId: z.string().uuid(),
        decisions: z
          .array(
            z.object({
              candidateId: z.string().uuid(),
              decision: z.enum(["selected", "rejected", "uncertain"]),
            }).strict(),
          )
          .min(1)
          .max(8),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await readyAccount(context.userId))) return unavailable;
    const { getSql } = await import("@/lib/db");
    const { FinResearchError, reviewFinResultResearch } = await import("./fin-research.server.ts");
    try {
      return (
        await reviewFinResultResearch(
          await getSql(),
          { kind: "account", userId: context.userId },
          data.jobId,
          data.decisions,
        )
      ).body;
    } catch (error) {
      if (error instanceof FinResearchError) return { status: error.code, message: error.message };
      throw error;
    }
  });

const draftInput = z
  .object({
    jobId: z.string().uuid(),
    fullName: z.string().trim().min(2).max(120),
    currentClub: z.string().trim().max(160).optional(),
    candidateIds: z.array(z.string().uuid()).max(8),
    privacyAcknowledged: z.literal(true),
  })
  .strict();

export const saveMyFinResearchDraft = createServerFn({ method: "POST" })
  .middleware([privateResponse, authMiddleware])
  .validator((input: unknown) => draftInput.parse(input))
  .handler(async ({ data, context }) => {
    if (!(await readyAccount(context.userId))) return unavailable;
    const { getSql } = await import("@/lib/db");
    const { FinResearchError, saveFinResearchDraft } = await import("./fin-research.server.ts");
    try {
      return (await saveFinResearchDraft(await getSql(), { kind: "account", userId: context.userId }, data)).body;
    } catch (error) {
      if (error instanceof FinResearchError) return { status: error.code, message: error.message };
      throw error;
    }
  });

export const supplyMyFinResultLink = createServerFn({ method: "POST" })
  .middleware([privateResponse, authMiddleware])
  .validator((input: unknown) =>
    z.object({ jobId: z.string().uuid(), sourceUrl: z.string().trim().min(8).max(2048) }).strict().parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!(await readyAccount(context.userId))) return unavailable;
    const { getSql } = await import("@/lib/db");
    const { FinResearchError, fetchPublicSourcePage, supplyFinResultLink } = await import(
      "./fin-research.server.ts"
    );
    try {
      return (
        await supplyFinResultLink(
          await getSql(),
          { kind: "account", userId: context.userId },
          data.jobId,
          data.sourceUrl,
          fetchPublicSourcePage,
        )
      ).body;
    } catch (error) {
      if (error instanceof FinResearchError) return { status: error.code, message: error.message };
      throw error;
    }
  });

export const continueMyFinProfile = createServerFn({ method: "POST" })
  .middleware([privateResponse, authMiddleware])
  .validator((input: unknown) =>
    z.object({ continuation: z.string().refine((value) => Boolean(parseFinContinuation(value))) }).strict().parse(input),
  )
  .handler(async ({ context }) => {
    if (!(await readyAccount(context.userId))) return unavailable;
    const { getSql } = await import("@/lib/db");
    const { FinResearchError, continueFinProfileSetup } = await import("./fin-research.server.ts");
    try {
      return (await continueFinProfileSetup(await getSql(), { kind: "account", userId: context.userId })).body;
    } catch (error) {
      if (error instanceof FinResearchError) return { status: error.code, message: error.message };
      throw error;
    }
  });

export const listStaffFinResearchJobs = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    const { getSql } = await import("@/lib/db");
    const { listStaffFinResearch } = await import("./fin-research.server.ts");
    return listStaffFinResearch(await getSql());
  });
