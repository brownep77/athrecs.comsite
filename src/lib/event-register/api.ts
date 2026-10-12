import { createServerFn } from "@tanstack/react-start";
import { staffMiddleware } from "../auth/staff-middleware";
import { registerFilters, eventInput, historyInput, contactInput } from "./core";

export const getEventRegister = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => registerFilters.parse(input))
  .handler(async ({ data }) => {
    const { listRegister } = await import("./service.server");
    return listRegister(data);
  });
export const getEventRegisterDetail = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => eventInput.parse(input))
  .handler(async ({ data }) => {
    const { getRegisterEvent } = await import("./service.server");
    return getRegisterEvent(data);
  });
export const saveEventHistory = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => historyInput.parse(input))
  .handler(async ({ data, context }) => {
    const { saveHistory } = await import("./service.server");
    return saveHistory(data, context.userId);
  });
export const addEventContact = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => contactInput.parse(input))
  .handler(async ({ data, context }) => {
    const { saveContact } = await import("./service.server");
    return saveContact(data, context.userId);
  });
