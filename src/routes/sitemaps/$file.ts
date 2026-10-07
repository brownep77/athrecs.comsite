import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/athrecs/seo";
import { PUBLIC_PAGES } from "@/lib/athrecs/public-pages";
import { COUNTRY_SITES, SITE_LANGUAGES } from "@/lib/athrecs/country-sites";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/sitemaps/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { sitemapXml, sitemapResponse } =
          await import("@/lib/athrecs/athlete-sitemap.server");
        if (params.file === "pages.xml") {
          const runningPaths: string[] = [];
          const modified = new Map<string, string>();
          if (!IS_RUNRECS_SITE) {
            const { MARATHON_COUNTRIES } = await import("@/data/road-marathons/countries");
            const { ROAD_MARATHONS } = await import("@/data/road-marathons");
            const { HALF_MARATHON_COUNTRIES } =
              await import("@/data/road-half-marathons/countries");
            const { ROAD_HALF_MARATHONS } = await import("@/data/road-half-marathons");
            const { roadGuideModifiedAt } = await import("@/lib/running/guide-modified");
            const { ROAD_ULTRAS, ULTRA_CHECKED, ULTRA_GUIDE_PATH, ultraPath } =
              await import("@/lib/running/road-ultras");
            for (const [countries, races] of [
              [MARATHON_COUNTRIES, ROAD_MARATHONS],
              [HALF_MARATHON_COUNTRIES, ROAD_HALF_MARATHONS],
            ] as const) {
              for (const country of countries)
                modified.set(
                  `/running/${country.guide}`,
                  roadGuideModifiedAt(
                    races
                      .filter((race) => race.country === country.id)
                      .map((race) => race.checkedAt),
                  ),
                );
              for (const race of races)
                modified.set(`/running/races/${race.slug}`, roadGuideModifiedAt([race.checkedAt]));
            }
            modified.set(ULTRA_GUIDE_PATH, ULTRA_CHECKED);
            for (const race of ROAD_ULTRAS) modified.set(ultraPath(race.slug), ULTRA_CHECKED);
            runningPaths.push(
              "/running",
              ...HALF_MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
              ...ROAD_HALF_MARATHONS.map((race) => `/running/races/${race.slug}`),
              ...MARATHON_COUNTRIES.map((country) => `/running/${country.guide}`),
              ...ROAD_MARATHONS.map((race) => `/running/races/${race.slug}`),
            );
          }
          return sitemapResponse(
            sitemapXml(
              (IS_RUNRECS_SITE
                ? ["/", "/races", "/calendar", "/race-series", "/clubs", "/privacy"]
                : [
                    ...PUBLIC_PAGES.filter((page) => page.path !== "/athletes").map(
                      (page) => page.path,
                    ),
                    ...runningPaths,
                  ]
              )
                .filter((path, index, paths) => paths.indexOf(path) === index)
                .map((path) => ({ url: `${SITE_URL}${path}`, lastmod: modified.get(path) })),
            ),
          );
        }
        if (!IS_RUNRECS_SITE && params.file === "countries.xml") {
          const { getSql } = await import("@/lib/db");
          const { ensureAthrecsSeeded } = await import("@/lib/athrecs/seed.server");
          const { populatedRunningCountries } = await import("@/lib/athrecs/country-sitemap.server");
          await ensureAthrecsSeeded();
          const populated = await populatedRunningCountries(await getSql(), COUNTRY_SITES.map((site) => site.country));
          return sitemapResponse(
            sitemapXml(
              COUNTRY_SITES.flatMap((site) =>
                SITE_LANGUAGES.flatMap((language) => [
                  `${SITE_URL}/${language}/${site.slug}`,
                  ...(populated.has(site.country) ? [`${SITE_URL}/${language}/${site.slug}/races`] : []),
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
        // Previously indexed profile URLs are now member-only.
        return new Response("Sitemap not found", {
          status: 404,
          headers: { "Cache-Control": "no-store" },
        });
      },
    },
  },
});
