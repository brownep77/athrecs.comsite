import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/athrecs/seo";
import { PUBLIC_PAGES } from "@/lib/athrecs/public-pages";
import { COUNTRY_SITES, SITE_LANGUAGES } from "@/lib/athrecs/country-sites";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/sitemaps/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { sitemapXml, sitemapResponse, athleteSitemapSlugs } =
          await import("@/lib/athrecs/athlete-sitemap.server");
        if (params.file === "pages.xml") {
          const runningPaths: string[] = [];
          if (!IS_RUNRECS_SITE) {
            const { MARATHON_COUNTRIES } = await import("@/data/road-marathons/countries");
            const { ROAD_MARATHONS } = await import("@/data/road-marathons");
            runningPaths.push(
              "/running",
              ...MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
              ...ROAD_MARATHONS.map((race) => `/running/races/${race.slug}`),
            );
          }
          return sitemapResponse(
            sitemapXml(
              (IS_RUNRECS_SITE
                ? ["/", "/races", "/calendar", "/race-series", "/athletes", "/clubs", "/privacy"]
                : [...PUBLIC_PAGES.map((page) => page.path), ...runningPaths]
              ).map((path) => `${SITE_URL}${path}`),
            ),
          );
        }
        if (!IS_RUNRECS_SITE && params.file === "countries.xml") {
          return sitemapResponse(
            sitemapXml(
              COUNTRY_SITES.flatMap((site) =>
                SITE_LANGUAGES.flatMap((language) => [
                  `${SITE_URL}/${language}/${site.slug}`,
                  `${SITE_URL}/${language}/${site.slug}/races`,
                ]),
              ),
            ),
          );
        }
        const contentMatch = /^(races|clubs|results)-([1-9]\d{0,5})\.xml$/.exec(params.file);
        if (!IS_RUNRECS_SITE && contentMatch) {
          const { getSql } = await import("@/lib/db");
          const { ensureAthrecsSeeded } = await import("@/lib/athrecs/seed.server");
          const { contentSitemapPaths } = await import("@/lib/athrecs/content-sitemap.server");
          await ensureAthrecsSeeded();
          const paths = await contentSitemapPaths(
            await getSql(),
            contentMatch[1] as "races" | "clubs" | "results",
            Number(contentMatch[2]),
          );
          if (!paths.length) return new Response("Sitemap not found", { status: 404 });
          return sitemapResponse(sitemapXml(paths.map((path) => `${SITE_URL}${path}`)));
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
