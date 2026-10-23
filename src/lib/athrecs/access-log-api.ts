import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";

export const listAccessLog = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    z
      .object({
        q: z.string().trim().max(120).default(""),
        page: z.number().int().min(1).max(100000).default(1),
        days: z.union([z.literal(1), z.literal(7), z.literal(30), z.literal(90)]).default(7),
        outcome: z.enum(["all", "success", "failed", "error", "info"]).default("all"),
        device: z
          .enum(["", "Mobile phone", "Tablet", "Desktop / laptop", "Automated client", "Unknown"])
          .default(""),
        browser: z
          .enum(["", "Chrome", "Safari", "Edge", "Firefox", "Samsung Internet", "Opera", "Unknown"])
          .default(""),
        view: z.enum(["events", "sessions"]).default("events"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { loadAccessLog } = await import("./access-log.server");
    return loadAccessLog(await getSql(), data);
  });
