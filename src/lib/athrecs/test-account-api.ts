import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "../auth/middleware";
import { privateClaimMiddleware } from "./claim-invitations-api";

export const getMyTestHub = createServerFn({ method: "GET" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("../db");
    const { loadTestHub } = await import("./test-account.server");
    return loadTestHub(await getSql(), context.userId);
  });

export const registerForTestRace = createServerFn({ method: "POST" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .validator((input: unknown) =>
    z
      .object({ eventId: z.number().int().min(1).max(10), registered: z.boolean() })
      .strict()
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { getSql, dbSource } = await import("../db");
    const { IS_RUNRECS_SITE } = await import("../site-scope");
    if (IS_RUNRECS_SITE || process.env.VERCEL_ENV === "preview")
      throw new Error("Use the AthRecs production test hub.");
    const { saveTestRegistration, deliverTestRegistrationReceipts } =
      await import("./test-account.server");
    if (process.env.VERCEL_ENV === "production" && dbSource !== "neon")
      throw new Error("Persistent test storage is not configured.");
    const sql = await getSql();
    const saved = await saveTestRegistration(sql, context.userId, data.eventId, data.registered);
    const delivery =
      process.env.VERCEL_ENV === "production" && dbSource === "neon"
        ? await deliverTestRegistrationReceipts(sql, context.userId)
        : { sent: 0 };
    return { ...saved, ...delivery };
  });

export const retryTestConfirmationEmails = createServerFn({ method: "POST" })
  .middleware([privateClaimMiddleware, authMiddleware])
  .handler(async ({ context }) => {
    const { getSql, dbSource } = await import("../db");
    const { IS_RUNRECS_SITE } = await import("../site-scope");
    if (IS_RUNRECS_SITE || process.env.VERCEL_ENV !== "production" || dbSource !== "neon")
      throw new Error("Email delivery is available in the AthRecs production test hub.");
    const { deliverTestRegistrationReceipts } = await import("./test-account.server");
    return deliverTestRegistrationReceipts(await getSql(), context.userId);
  });
