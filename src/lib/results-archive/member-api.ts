import { resultSearchSchema, type ResultSearchFilters } from "../athrecs/result-matching-settings";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql, dbSource } from "../db";
import { positiveId } from "./core";
import {
  memberArchiveMatches,
  requestArchiveMatch,
  requestArchiveMatches,
  staffArchiveRequests,
} from "./member.server";

export const getMyArchiveMatches = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input?: Partial<ResultSearchFilters>) => resultSearchSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    return memberArchiveMatches(await getSql(), context.userId, data);
  });
export const requestMyArchiveMatch = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { entryId: number; revision: number; note: string }) =>
    z
      .object({
        entryId: positiveId,
        revision: positiveId,
        note: z.string().trim().min(12).max(2000),
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (dbSource !== "neon")
      throw new Error("Persistent storage is required before requesting a review");
    if (process.env.VERCEL_ENV === "preview")
      throw new Error("Archive review requests are disabled in deployment previews");
    return requestArchiveMatch(await getSql(), context.userId, data);
  });
export const getStaffArchiveRequests = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => staffArchiveRequests(await getSql()));

export const requestMyArchiveMatches = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      entries: { entryId: number; revision: number }[];
      note: string;
      declarationAccepted?: boolean;
    }) =>
      z
        .object({
          entries: z
            .array(z.object({ entryId: positiveId, revision: positiveId }).strict())
            .min(1)
            .max(30)
            .refine(
              (entries) => new Set(entries.map((entry) => entry.entryId)).size === entries.length,
              "Select each result once",
            ),
          note: z.string().trim().min(12).max(2000),
          declarationAccepted: z.boolean().optional(),
        })
        .strict()
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (dbSource !== "neon")
      throw new Error("Persistent storage is required before requesting a review");
    if (process.env.VERCEL_ENV === "preview")
      throw new Error("Archive review requests are disabled in deployment previews");
    return requestArchiveMatches(await getSql(), context.userId, data);
  });

export const processStaffArchiveClaims = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { userId: string; entryIds: number[] }) =>
    z
      .object({ userId: z.string().min(1).max(200), entryIds: z.array(positiveId).min(1).max(30) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (dbSource !== "neon" || process.env.VERCEL_ENV === "preview")
      throw new Error("Use the production staff claims queue");
    const sql = await getSql();
    const { completeOwnArchiveRequests } = await import("./claim.server");
    const result = await sql.transaction((tx) =>
      completeOwnArchiveRequests(tx, data.userId, data.entryIds),
    );
    try {
      const { deliverClaimAlerts } = await import("../athrecs/result-claim-alerts.server");
      for (const id of result.claimIds) await deliverClaimAlerts(sql, id);
    } catch {
      console.error("[claim-alerts] archive completion emails remain queued");
    }
    return result;
  });
