import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "@/lib/auth/staff-middleware";
import { messageFilters, messageInput, staffEmailInput } from "./athlete-messages";

export const sendStaffAthleteEmail = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => staffEmailInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const { sendAthleteCorrespondence } = await import("./athlete-messages.server");
    return sendAthleteCorrespondence(await getSql(), data, context.userId);
  });

export const getStaffAthleteMessages = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => messageFilters.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("@/lib/db");
    const { loadAthleteMessages } = await import("./athlete-messages.server");
    return loadAthleteMessages(await getSql(), data);
  });

export const saveStaffAthleteMessage = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => messageInput.parse(input))
  .handler(async ({ data, context }) => {
    const { getSql } = await import("@/lib/db");
    const { recordAthleteMessage } = await import("./athlete-messages.server");
    return recordAthleteMessage(await getSql(), data, context.userId);
  });
