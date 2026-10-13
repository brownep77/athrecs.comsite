import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "@/lib/auth/staff-middleware";

export const getAthleteInboxStatus = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { getSql } = await import("@/lib/db");
    const { inboxStatus } = await import("./athlete-inbox.server");
    return inboxStatus(await getSql());
  });
export const connectStaffAthleteInbox = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    z
      .object({ password: z.string().min(1).max(500), includeRecent: z.boolean() })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const { connectAthleteInbox } = await import("./athlete-inbox.server");
    return connectAthleteInbox(await getSql(), data, context.userId);
  });
export const syncStaffAthleteInbox = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { getSql } = await import("@/lib/db");
    const { syncAthleteInbox } = await import("./athlete-inbox.server");
    return syncAthleteInbox(await getSql());
  });
export const disconnectStaffAthleteInbox = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { getSql } = await import("@/lib/db");
    const { disconnectAthleteInbox } = await import("./athlete-inbox.server");
    return disconnectAthleteInbox(await getSql());
  });
