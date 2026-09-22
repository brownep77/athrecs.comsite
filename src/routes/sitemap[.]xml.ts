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
        const pages = await athleteSitemapPageCount(await getSql());
        return sitemapResponse(
          sitemapXml(
            [
              `${SITE_URL}/sitemaps/pages.xml`,
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
