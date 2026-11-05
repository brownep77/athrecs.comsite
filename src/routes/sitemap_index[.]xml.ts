import { createFileRoute } from "@tanstack/react-router";

// Older crawlers may request the legacy sitemap_index.xml convention.
// Redirect rather than rendering an indexable Not Found application shell.
export const Route = createFileRoute("/sitemap_index.xml")({
  server: {
    handlers: {
      GET: async ({ request }) =>
        new Response(null, {
          status: 301,
          headers: {
            Location: new URL("/sitemap.xml", request.url).toString(),
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
