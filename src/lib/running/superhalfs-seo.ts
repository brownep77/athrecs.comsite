import {
  SUPERHALFS_CHECKED_AT,
  SUPERHALFS_DESCRIPTION,
  SUPERHALFS_PATH,
  SUPERHALFS_RACES,
  SUPERHALFS_TITLE,
} from "@/data/superhalfs";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

export function superhalfsHead() {
  const url = `${SITE_URL}${SUPERHALFS_PATH}`;
  const graph = [
    {
      "@type": "CollectionPage",
      "@id": url,
      url,
      name: SUPERHALFS_TITLE,
      description: SUPERHALFS_DESCRIPTION,
      inLanguage: "en-GB",
      dateModified: SUPERHALFS_CHECKED_AT,
      lastReviewed: SUPERHALFS_CHECKED_AT,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      author: { "@type": "Organization", name: "AthRecs", url: SITE_URL },
      mainEntity: { "@id": `${url}#races` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#races`,
      name: "The six SuperHalfs half marathons",
      numberOfItems: SUPERHALFS_RACES.length,
      itemListElement: SUPERHALFS_RACES.map((race, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "WebPageElement",
          "@id": `${url}#${race.id}`,
          name: race.name,
          url: `${url}#${race.id}`,
          description: race.course,
          isPartOf: { "@id": url },
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Home", path: "/" },
        { name: "Running", path: "/running" },
        { name: "Race series", path: "/running/race-series" },
        { name: "SuperHalfs", path: SUPERHALFS_PATH },
      ].map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${SITE_URL}${item.path}`,
      })),
    },
  ];
  return {
    meta: siteGraphMeta({
      title: SUPERHALFS_TITLE,
      description: SUPERHALFS_DESCRIPTION,
      url,
    }),
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      },
    ],
  };
}
