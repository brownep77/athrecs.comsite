import { createMiddleware, createServerFn } from "@tanstack/react-start";

// Apply to the response before resolving auth, including denied/error responses.
export const profileSessionMiddleware = createMiddleware({ type: "function" })
  .client(async ({ next }) => {
    const { getBearerToken } = await import("./client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    const { assertSameSiteRequest } = await import("./isolation.server");
    const { requireUserId, UnauthorizedError } = await import("./verify.server");
    setResponseHeader("Cache-Control", "private, no-store");
    setResponseHeader("Vary", "Cookie, Authorization");
    setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    assertSameSiteRequest();
    let profileViewerId: string | null = null;
    try {
      profileViewerId = await requireUserId(context.bearerToken);
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) throw error;
    }
    return next({ context: { profileViewerId } });
  });

export const profileReadMiddleware = createMiddleware({ type: "function" })
  .middleware([profileSessionMiddleware])
  .server(async ({ next, context }) => {
    if (!context.profileViewerId) {
      const { UnauthorizedError } = await import("./verify.server");
      throw new UnauthorizedError();
    }
    return next();
  });

// Loaders can show a sign-in screen without fetching any athlete data.
export const canViewAthleteProfiles = createServerFn({ method: "GET" })
  .middleware([profileSessionMiddleware])
  .handler(({ context }) => Boolean(context.profileViewerId));
