import { createMiddleware, createStart } from "@tanstack/react-start";

const memberProfileResponses = createMiddleware().server(async ({ pathname, next }) => {
  const result = await next();
  if (pathname === "/athletes" || pathname.startsWith("/athletes/")) {
    const headers = new Headers(result.response.headers);
    headers.set("Cache-Control", "private, no-store");
    headers.set("Vary", "Cookie, Authorization");
    headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
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
