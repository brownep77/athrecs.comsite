import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/lib/athrecs/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { getSql } = await import("@/lib/db");
        const { ensureAthrecsSeeded } = await import("@/lib/athrecs/seed.server");
        const { athleteSitemapPageCount, sitemapXml, sitemapResponse } =
          await import("@/lib/athrecs/athlete-sitemap.server");
        await ensureAthrecsSeeded();
        const sql = await getSql();
        const { contentSitemapPageCount } = await import("@/lib/athrecs/content-sitemap.server");
        const pages = await athleteSitemapPageCount(sql);
        const families: ("races" | "clubs" | "results")[] = IS_RUNRECS_SITE ? [] : ["races", "clubs", "results"];
        const counts = await Promise.all(
          families.map((kind) => contentSitemapPageCount(sql, kind)),
        );
        return sitemapResponse(
          sitemapXml(
            [
              `${SITE_URL}/sitemaps/pages.xml`,
              ...(!IS_RUNRECS_SITE ? [`${SITE_URL}/sitemaps/countries.xml`] : []),
              ...families.flatMap((kind, index) =>
                Array.from(
                  { length: counts[index] },
                  (_, i) => `${SITE_URL}/sitemaps/${kind}-${i + 1}.xml`,
                ),
              ),
              ...Array.from(
                { length: pages },
                (_, i) => `${SITE_URL}/sitemaps/athletes-${i + 1}.xml`,
              ),
            ],
            true,
          ),
        );
      },
    },
  },
});
