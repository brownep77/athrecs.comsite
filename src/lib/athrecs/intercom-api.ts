import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { IntercomIdentity } from "./intercom-identity.server";

export type { IntercomIdentity } from "./intercom-identity.server";

// This runs before auth so denied/failed requests cannot be cached either.
const intercomResponsePrivacy = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { setResponseHeader } = await import("@tanstack/react-start/server");
  setResponseHeader("Cache-Control", "private, no-store");
  setResponseHeader("Vary", "Cookie, Authorization");
  setResponseHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  return next();
});

/** No browser-supplied user id, profile id, email or custom attributes. */
export const getIntercomIdentity = createServerFn({ method: "GET" })
  .middleware([intercomResponsePrivacy, authMiddleware])
  .handler(async ({ context }): Promise<IntercomIdentity> => {
    const { authConfigured, DEV_USER_ID } = await import("@/lib/auth/verify.server");
    const { intercomIdentityConfigured, loadIntercomIdentity } =
      await import("./intercom-identity.server");
    // Never identify the shared local dev fallback as a real Intercom contact.
    if (!authConfigured || context.userId === DEV_USER_ID || !intercomIdentityConfigured()) {
      return { status: "disabled" };
    }
    const { getSql } = await import("@/lib/db");
    return loadIntercomIdentity(await getSql(), context.userId);
  });
