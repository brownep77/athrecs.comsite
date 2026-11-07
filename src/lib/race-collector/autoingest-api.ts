import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";

export const getIntakeDashboard = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .handler(async () => (await import("./autoingest.server")).intakeDashboard());

export const resolveIntake = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: { id: number; action: "resolve" | "retry" }) => {
    if (!input || !Number.isInteger(input.id) || !["resolve", "retry"].includes(input.action))
      throw new Error("Invalid request.");
    return input;
  })
  .handler(async ({ data, context }) => {
    const m = await import("./autoingest.server");
    return data.action === "resolve"
      ? m.resolveIntakeRow(data.id, context.staffEmail)
      : m.retryIntakeRow(data.id);
  });
