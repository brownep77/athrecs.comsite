import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/athrecs/seo";
import { SPORT_PAGES } from "@/lib/athrecs/sport-pages";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/sitemaps/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { sitemapXml, sitemapResponse, athleteSitemapSlugs } =
          await import("@/lib/athrecs/athlete-sitemap.server");
        if (params.file === "pages.xml") {
          return sitemapResponse(
            sitemapXml(
              [
                "/",
                "/races",
                "/calendar",
                "/race-series",
                "/athletes",
                "/find-events",
                "/clubs",
                "/privacy",
                ...(!IS_RUNRECS_SITE ? SPORT_PAGES.map((sport) => `/sports/${sport.slug}`) : []),
              ].map((path) => `${SITE_URL}${path}`),
            ),
          );
        }
        const match = /^athletes-([1-9]\d{0,5})\.xml$/.exec(params.file);
        if (!match) return new Response("Sitemap not found", { status: 404 });
        const { getSql } = await import("@/lib/db");
        const { ensureAthrecsSeeded } = await import("@/lib/athrecs/seed.server");
        await ensureAthrecsSeeded();
        const slugs = await athleteSitemapSlugs(await getSql(), Number(match[1]));
        if (!slugs.length) return new Response("Sitemap not found", { status: 404 });
        return sitemapResponse(
          sitemapXml(slugs.map((slug) => `${SITE_URL}/athletes/${encodeURIComponent(slug)}`)),
        );
      },
    },
  },
});
