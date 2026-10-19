import { SITE_URL, siteGraphMeta } from "./seo";
import type { RacePlacePageData } from "./race-places";
import { racePlaceCopy } from "./race-places-copy";

export function racePlaceUrl(data: RacePlacePageData, page = data.page, archive = data.archive) {
  const query = new URLSearchParams();
  if (archive) query.set("view", "archive");
  if (page > 1) query.set("page", String(page));
  return `${data.place.path}${query.size ? `?${query}` : ""}`;
}

export function racePlaceHead(data: RacePlacePageData) {
  const { title, description, intro } = racePlaceCopy(data);
  const parent = data.ancestors.at(-2);
  const url = `${SITE_URL}${racePlaceUrl(data)}`;
  const items = data.races.length ? data.races : data.archivePreview;
  return {
    meta: siteGraphMeta({ title, description, url }).map((tag) =>
      (!data.total || data.archive) && "name" in tag && tag.name === "robots"
        ? { name: "robots", content: "noindex, follow" }
        : tag,
    ),
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": url,
              url,
              name: title,
              description,
              inLanguage: "en-GB",
              abstract: intro
                .map((paragraph) =>
                  paragraph.map((part) => (typeof part === "string" ? part : part.text)).join(""),
                )
                .join(" "),
              isPartOf: { "@id": `${SITE_URL}/#website` },
              publisher: {
                "@type": "Organization",
                "@id": `${SITE_URL}/#organization`,
                name: "AthRecs",
                url: SITE_URL,
              },
              about: {
                "@type": "Place",
                name: data.place.name,
                url: `${SITE_URL}${data.place.path}`,
                ...(parent
                  ? {
                      containedInPlace: {
                        "@type": "Place",
                        name: parent.name,
                        url: `${SITE_URL}${parent.path}`,
                      },
                    }
                  : {}),
              },
              mainEntity: { "@id": `${url}#races` },
            },
            {
              "@type": "ItemList",
              "@id": `${url}#races`,
              numberOfItems: items.length,
              itemListElement: items.map((race, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: race.name,
                url: `${SITE_URL}/races/${encodeURIComponent(race.slug)}`,
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { name: "AthRecs", path: "/" },
                ...data.ancestors.map((place) => ({ name: place.name, path: place.path })),
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
