export const LAYOUT_PREVIEW_ROBOTS = "noindex, nofollow, noarchive";
export const LAYOUT_PREVIEW_MESSAGE =
  "This is a read-only layout preview. Account, staff and publishing actions are unavailable.";

/** Public navigation and GET server functions work; operational endpoints never run. */
export function layoutPreviewRequestStatus(method: string, pathname: string): 403 | 405 | null {
  // This exact endpoint only renders an .ics file from a bounded request body;
  // it has no account, database, provider or other persistent side effects.
  if (method.toUpperCase() === "POST" && pathname === "/api/event-calendar") return null;
  if (method.toUpperCase() !== "GET" && method.toUpperCase() !== "HEAD") return 405;

  let path: string;
  try {
    path = decodeURIComponent(pathname)
      .replaceAll("\\", "/")
      .replace(/\/{2,}/g, "/")
      .toLowerCase();
  } catch {
    return 403;
  }

  if (/^\/(?:api|admin|auth)(?:\/|$)/.test(path)) return 403;
  if (
    /^\/(?:athlete-account|my-athlete-profile|claim-results|review-results|my-race-calendar|test-account|login|sign-in|register)(?:\/|$)/.test(
      path,
    ) ||
    /^\/brands\/(?:manage|register)(?:\/|$)/.test(path) ||
    /^\/clubs\/(?:account|register)(?:\/|$)/.test(path)
  ) {
    return 403;
  }
  return null;
}

export function layoutPreviewHeaders(): Record<string, string> {
  return {
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": LAYOUT_PREVIEW_ROBOTS,
    "X-AthRecs-Layout-Preview": "1",
  };
}

export function layoutPreviewBlockedResponse(method: string, status: 403 | 405): Response {
  return new Response(method.toUpperCase() === "HEAD" ? null : LAYOUT_PREVIEW_MESSAGE, {
    status,
    headers: {
      ...layoutPreviewHeaders(),
      "Content-Type": "text/plain; charset=utf-8",
      ...(status === 405 ? { Allow: "GET, HEAD" } : {}),
    },
  });
}
