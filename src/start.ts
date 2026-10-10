import { createMiddleware, createStart } from "@tanstack/react-start";
import {
  ATHLETE_INDEXING_HEADER,
  INDEXABLE_ATHLETE_ROBOTS,
  PRIVATE_ATHLETE_ROBOTS,
} from "./lib/athrecs/athlete-search-policy";

const memberProfileResponses = createMiddleware().server(async ({ pathname, next }) => {
  const result = await next();
  if (
    pathname === "/athletes" ||
    pathname.startsWith("/athletes/") ||
    pathname === "/claim-results"
  ) {
    const headers = new Headers(result.response.headers);
    const indexable =
      /^\/athletes\/[^/]+$/.test(pathname) &&
      result.response.status === 200 &&
      headers.get(ATHLETE_INDEXING_HEADER) === "1";
    headers.delete(ATHLETE_INDEXING_HEADER);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Cookie, Authorization");
    const robots = indexable ? INDEXABLE_ATHLETE_ROBOTS : PRIVATE_ATHLETE_ROBOTS;
    headers.set("X-Robots-Tag", robots);
    // Server-function response headers are also held in the request context.
    // Keep that final header aligned with the rendered page decision, including
    // failures; otherwise the earlier RPC noindex overrides an approved page.
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("X-Robots-Tag", robots);
    if (pathname === "/claim-results") headers.set("Referrer-Policy", "no-referrer");
    return new Response(result.response.body, {
      status: result.response.status,
      statusText: result.response.statusText,
      headers,
    });
  }
  return result;
});

export const startInstance = createStart(() => ({
  requestMiddleware: [memberProfileResponses],
}));
