import { createFileRoute } from "@tanstack/react-router";
import { getVerifiedOfficialEntryUrl } from "@/lib/athrecs/official-entry.server";

function redirectResponse(location: string): Response {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      "Cache-Control": "no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

// The generated TanStack route registry is refreshed during Vite builds.
// Cast this newly added server route until the generated file is committed,
// so standalone `tsc --noEmit` checks do not reject the valid route path.
export const Route = createFileRoute("/api/events/$slug/official-entry" as any)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const officialEntryUrl = await getVerifiedOfficialEntryUrl(params.slug);
          if (officialEntryUrl) return redirectResponse(officialEntryUrl);
        } catch (error) {
          console.error("Unable to resolve verified official entry URL", {
            eventSlug: params.slug,
            error,
          });
        }

        const fallback = new URL(`/races/${encodeURIComponent(params.slug)}`, request.url);
        fallback.hash = "entry-options-heading";
        return redirectResponse(fallback.toString());
      },
    },
  },
});
