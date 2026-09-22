import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
import { scopeSchema, reviewSchema, filterSchema } from "./core";
const ids = z.object({ ids: z.array(z.string().uuid()).min(1).max(10) });
export const getClubScans = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => filterSchema.parse(v))
  .handler(async ({ data }) => (await import("./service.server")).dashboard(data));
export const startClubScan = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => scopeSchema.parse(v))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).createRun(data, context.staffEmail),
  );
export const stepClubScan = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data }) => (await import("./service.server")).runNext(data.id));
export const controlClubScan = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) =>
    z
      .object({ id: z.string().uuid(), action: z.enum(["pause", "resume", "retry", "cancel"]) })
      .parse(v),
  )
  .handler(async ({ data }) => (await import("./service.server")).control(data.id, data.action));
export const reviewClubResults = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => reviewSchema.parse(v))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).review(data, context.staffEmail),
  );
export const publishClubResults = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => ids.parse(v))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).publish(data.ids, context.staffEmail),
  );
export const recheckClubResults = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => ids.parse(v))
  .handler(async ({ data, context }) =>
    (await import("./service.server")).recheck(data.ids, context.staffEmail),
  );
export const findClubAthletes = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => z.object({ q: z.string().min(2).max(120) }).parse(v))
  .handler(async ({ data }) => (await import("./service.server")).searchAthletes(data.q));
export const getClubReviewHistory = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data }) => (await import("./service.server")).reviewHistory(data.id));
