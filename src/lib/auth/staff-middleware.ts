import { createMiddleware } from "@tanstack/react-start";

/**
 * Staff-only server-function middleware. It preserves preview bearer support,
 * rejects cross-origin calls, then enforces the staff host + Google allowlist.
 */
export const staffMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireStaffUser } = await import("./staff.server");
    assertSameSiteRequest();
    const staff = await requireStaffUser(context.bearerToken);
    return next({ context: { userId: staff.id, staffEmail: staff.email } });
  });

/** Pass only the preview bearer token through for the non-throwing login gate. */
export const staffStatusMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => next({ context: { bearerToken: context.bearerToken } }));
