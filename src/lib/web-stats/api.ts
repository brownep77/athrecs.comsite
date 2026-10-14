import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { staffMiddleware } from "../auth/staff-middleware";
import { GOOGLE_SEARCH_SCOPE, reportInput, type ReportState, type SearchReport } from "./core";

export const getVercelStats = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => reportInput.parse(input))
  .handler(async ({ data }) => {
    const { getSql } = await import("../db");
    const { readVercelReport } = await import("./service.server");
    return readVercelReport(await getSql(), data);
  });

export const connectVercelStats = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .validator((input: unknown) =>
    z
      .object({ token: z.string().trim().min(15).max(1000) })
      .strict()
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { getSql } = await import("../db");
    const { saveVercelConnection } = await import("./service.server");
    return saveVercelConnection(await getSql(), data.token, context.userId);
  });

export const getGoogleSearchStats = createServerFn({ method: "GET" })
  .middleware([staffMiddleware])
  .validator((input: unknown) => reportInput.parse(input))
  .handler(async ({ data, context }): Promise<ReportState<SearchReport>> => {
    const { auth } = await import("../auth/server");
    const { readGoogleReport } = await import("./service.server");
    try {
      // Never accept a user ID from the browser or return the provider token.
      const token = await auth.api.getAccessToken({
        body: { providerId: "google", userId: context.userId },
      });
      if (
        !token.accessToken ||
        !token.scopes.some((scope) =>
          [GOOGLE_SEARCH_SCOPE, "https://www.googleapis.com/auth/webmasters"].includes(scope),
        )
      ) {
        return {
          status: "connect",
          message:
            "Allow read-only Search Console access for your staff Google account to show clicks, impressions and search queries here.",
        };
      }
      return readGoogleReport(token.accessToken, data);
    } catch {
      return {
        status: "connect",
        message: "Connect your staff Google account to read AthRecs Search Console reports.",
      };
    }
  });

export const connectGoogleSearchStats = createServerFn({ method: "POST" })
  .middleware([staffMiddleware])
  .handler(async () => {
    const { auth } = await import("../auth/server");
    const { getRequest } = await import("@tanstack/react-start/server");
    const result = await auth.api.linkSocialAccount({
      headers: getRequest().headers,
      body: {
        provider: "google",
        scopes: [GOOGLE_SEARCH_SCOPE],
        callbackURL: "/admin/collection-stats?section=website",
        errorCallbackURL: "/admin/collection-stats?section=website",
        disableRedirect: true,
      },
    });
    // Request fresh consent and offline access only for this staff reporting flow.
    const url = new URL(result.url);
    if (url.origin !== "https://accounts.google.com")
      throw new Error("Google connection is unavailable.");
    url.searchParams.set("prompt", "consent select_account");
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("include_granted_scopes", "true");
    return { url: url.toString() };
  });
