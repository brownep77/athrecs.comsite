import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { validateScope, type Scope } from "./core";
import { REVIEW_BATCH_LIMIT, validateReviewQuery, type ReviewQuery } from "./review";
const idInput = (input: { id: string }) => {
  if (!/^[0-9a-f-]{36}$/i.test(input?.id ?? "")) throw new Error("Invalid run");
  return input;
};
export const getCollector = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: { id?: string; review?: Partial<ReviewQuery> }) => ({
    ...(input?.id ? idInput({ id: input.id }) : {}),
    review: validateReviewQuery(input?.review),
  }))
  .handler(async ({ data }) => {
    const s = await import("./service.server");
    return s.dashboard(data.id, undefined, data.review);
  });
export const startCollector = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: Scope) => validateScope(input))
  .handler(async ({ data, context }) => {
    const s = await import("./service.server");
    return s.createRun(data, context.staffEmail);
  });
export const controlCollector = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { id: string; action: "pause" | "resume" | "retry" | "cancel" }) => {
    idInput(input);
    if (!["pause", "resume", "retry", "cancel"].includes(input.action))
      throw new Error("Invalid action");
    return input;
  })
  .handler(async ({ data }) => {
    const s = await import("./service.server");
    return s.controlRun(data.id, data.action);
  });
export const stageCollector = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { ids: string[]; sourcesReviewed: boolean }) => {
    if (
      input?.sourcesReviewed !== true ||
      !Array.isArray(input.ids) ||
      input.ids.length > REVIEW_BATCH_LIMIT
    )
      throw new Error("Review the primary programmes before staging.");
    input.ids.forEach((id) => idInput({ id }));
    return input;
  })
  .handler(async ({ data, context }) => {
    const s = await import("./service.server");
    return s.stageReviewed(data.ids, context.staffEmail);
  });
export const exportCollector = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator(idInput)
  .handler(async ({ data }) => {
    const s = await import("./service.server");
    return JSON.stringify(await s.exportRun(data.id));
  });
export const dismissCollectorDuplicates = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { id: string; action: "dismiss" | "restore"; ids?: string[] }) => {
    idInput(input);
    if (
      !["dismiss", "restore"].includes(input.action) ||
      (input.ids !== undefined &&
        (!Array.isArray(input.ids) || !input.ids.length || input.ids.length > 100))
    )
      throw new Error("Invalid duplicate selection.");
    input.ids?.forEach((id) => idInput({ id }));
    return input;
  })
  .handler(async ({ data, context }) => {
    const s = await import("./service.server");
    return s.dismissDuplicates(data.id, data.action, context.staffEmail, data.ids);
  });
