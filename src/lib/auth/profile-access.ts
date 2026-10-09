import { createMiddleware, createServerFn } from "@tanstack/react-start";

// Only the boolean page-entry probe may treat a blocked request as signed out.
// Data reads keep throwing: no cross-site request may resolve a member session.
function createProfileSessionMiddleware(signedOutFallback = false) {
  return createMiddleware({ type: "function" })
    .client(async ({ next }) => {
      const { getBearerToken } = await import("./client");
      return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
    })
    .server(async ({ next, context }) => {
      const { setResponseHeader } = await import("@tanstack/react-start/server");
      const { assertSameSiteRequest, CrossSiteRequestError } = await import("./isolation.server");
      const { requireUserId, UnauthorizedError } = await import("./verify.server");
      setResponseHeader("Cache-Control", "private, no-store");
      setResponseHeader("Vary", "Cookie, Authorization");
      setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
      try {
        assertSameSiteRequest();
      } catch (error) {
        if (!signedOutFallback || !(error instanceof CrossSiteRequestError)) throw error;
        // Link previews and in-app readers can fetch HTML with cross-site metadata.
        // Render the normal sign-in shell without inspecting credentials or data.
        // In a real browser ProfileViewer retries after hydration on our own origin.
        return next({ context: { profileViewerId: null as string | null } });
      }
      let profileViewerId: string | null = null;
      try {
        profileViewerId = await requireUserId(context.bearerToken);
      } catch (error) {
        if (!(error instanceof UnauthorizedError)) throw error;
      }
      return next({ context: { profileViewerId } });
    });
}

// Apply response privacy headers before auth, including denied/error responses.
export const profileSessionMiddleware = createProfileSessionMiddleware();
const profileStatusMiddleware = createProfileSessionMiddleware(true);

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
  .middleware([profileStatusMiddleware])
  .handler(({ context }) => Boolean(context.profileViewerId));
