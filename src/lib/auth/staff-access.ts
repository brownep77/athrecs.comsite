import { createServerFn } from "@tanstack/react-start";
import { staffStatusMiddleware } from "./staff-middleware";

export const getStaffAccess = createServerFn({ method: "GET" })
  .middleware([staffStatusMiddleware])
  .handler(async ({ context }) => {
    const { getStaffAccessStatus } = await import("./staff.server");
    return getStaffAccessStatus(context.bearerToken);
  });
