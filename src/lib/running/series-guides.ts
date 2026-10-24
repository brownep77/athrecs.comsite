import type { RunningSeriesGuide } from "@/data/running-series-guides";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

export const runningSeriesGuidePath = (slug: string) => `/running/series/${slug}`;

export type RunningSeriesSummary = Pick<
  RunningSeriesGuide,
  "slug" | "name" | "shortDescription" | "format" | "kind" | "checkedAt"
>;

export function runningSeriesGuideHead(guide: RunningSeriesGuide) {
  const url = `${SITE_URL}${runningSeriesGuidePath(guide.slug)}`;
  return {
    meta: siteGraphMeta({
      title: `${guide.name}: races, entry & runner guide | AthRecs`,
      description: guide.shortDescription,
      url,
    }),
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": `${url}#guide`,
              headline: `${guide.name}: entry and runner guide`,
              description: guide.shortDescription,
              url,
              mainEntityOfPage: url,
              inLanguage: "en-GB",
              dateModified: guide.checkedAt,
              articleSection: "Running race series",
              author: { "@type": "Organization", name: "AthRecs", url: SITE_URL },
              publisher: { "@type": "Organization", name: "AthRecs", url: SITE_URL },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                { name: "AthRecs", path: "/" },
                { name: "Running guides", path: "/running/guides" },
                { name: "Race series", path: "/running/race-series" },
                { name: guide.name, path: runningSeriesGuidePath(guide.slug) },
              ].map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.name,
                item: `${SITE_URL}${item.path}`,
              })),
            },
          ],
        }).replace(/</g, "\\u003c"),
      },
    ],
  };
}
