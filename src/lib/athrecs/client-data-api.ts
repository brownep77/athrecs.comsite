import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";

export const listClientData = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        q: z.string().trim().max(120).default(""),
        page: z.number().int().min(1).max(100000).default(1),
        sort: z.enum(["newest", "recent", "logins"]).default("newest"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { loadClientData } = await import("./client-data.server");
    return loadClientData(await getSql(), data);
  });

export const getClientLoginHistory = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        userId: z.string().trim().min(1).max(200),
        page: z.number().int().min(1).max(100000).default(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { loadClientLoginHistory } = await import("./client-data.server");
    return loadClientLoginHistory(await getSql(), data.userId, data.page);
  });
