import { createMiddleware, createStart } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  ATHLETE_INDEXING_HEADER,
  ATHLETE_UNAVAILABLE_HEADER,
  INDEXABLE_ATHLETE_ROBOTS,
  PRIVATE_ATHLETE_ROBOTS,
} from "./lib/athrecs/athlete-search-policy";

const memberProfileResponses = createMiddleware().server(async ({ pathname, next }) => {
  const result = await next();
  if (!result.response) return result;
  if (
    pathname === "/athletes" ||
    pathname.startsWith("/athletes/") ||
    pathname === "/claim-results"
  ) {
    const headers = new Headers(result.response.headers);
    const unavailable =
      /^\/athletes\/[^/]+$/.test(pathname) &&
      result.response.status === 200 &&
      headers.get(ATHLETE_UNAVAILABLE_HEADER) === "1";
    const status = unavailable ? 404 : result.response.status;
    const indexable =
      (/^\/athletes\/[^/]+$/.test(pathname) || /^\/athletes\/?$/.test(pathname)) &&
      status === 200 &&
      headers.get(ATHLETE_INDEXING_HEADER) === "1";
    headers.delete(ATHLETE_INDEXING_HEADER);
    headers.delete(ATHLETE_UNAVAILABLE_HEADER);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Cookie, Authorization");
    const robots = indexable
      ? INDEXABLE_ATHLETE_ROBOTS
      : /^\/athletes\/?$/.test(pathname) && result.response.status === 200
        ? "noindex, follow"
        : PRIVATE_ATHLETE_ROBOTS;
    headers.set("X-Robots-Tag", robots);
    // Server-function response headers are also held in the request context.
    // Keep that final header aligned with the rendered page decision, including
    // failures; otherwise the earlier RPC noindex overrides an approved page.
    const { setResponseHeader } = await import("@tanstack/react-start/server");
    setResponseHeader("X-Robots-Tag", robots);
    if (pathname === "/claim-results") headers.set("Referrer-Policy", "no-referrer");
    return new Response(result.response.body, {
      status,
      statusText: unavailable ? "Not Found" : result.response.statusText,
      headers,
    });
  }
  return result;
});

const diagnosticResponses = createMiddleware().server(async ({ pathname, handlerType, next }) => {
  if (pathname.startsWith("/api/auth/") || pathname === "/api/diagnostics") return next();
  const started = performance.now();
  let status = 500;
  try {
    const result = await next();
    // Plain URL requests to a server function can return a primitive/null
    // instead of a Response. Normal RPC transport serialises those values.
    // Reject the malformed GET without turning diagnostic capture into a crash.
    if (!result.response) {
      const request = getRequest();
      if (
        handlerType === "serverFn" &&
        request.method === "GET" &&
        request.headers.get("x-tsr-serverFn") !== "true"
      ) {
        status = 400;
        return new Response("Invalid data request", {
          status,
          headers: {
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex, nofollow, noarchive",
          },
        });
      }
      // Preserve the framework's failure for other missing-response cases.
      // In particular, never convert a failed normal RPC into a success.
      status = 500;
      return result;
    }
    status = result.response.status;
    return result;
  } catch (error) {
    const thrownStatus =
      error instanceof Response
        ? error.status
        : error && typeof error === "object" && "statusCode" in error
          ? error.statusCode
          : error && typeof error === "object" && "status" in error
            ? error.status
            : undefined;
    status =
      typeof thrownStatus === "number" && thrownStatus >= 300 && thrownStatus <= 599
        ? thrownStatus
        : 500;
    throw error;
  } finally {
    if (status >= 500) {
      try {
        const { recordServerFailure } = await import("./lib/auth/server-diagnostics.server");
        await recordServerFailure(getRequest(), status, performance.now() - started);
      } catch {
        console.warn("[server-diagnostics] Capture unavailable");
      }
    }
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [diagnosticResponses, memberProfileResponses],
}));
