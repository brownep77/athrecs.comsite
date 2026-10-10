import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { staffMiddleware } from "../auth/staff-middleware";
import { getSql, dbSource } from "../db";
import { positiveId } from "./core";
import { memberArchiveMatches, requestArchiveMatch, staffArchiveRequests } from "./member.server";

export const getMyArchiveMatches = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("Cache-Control", "private, no-store");
    return memberArchiveMatches(await getSql(), context.userId);
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
