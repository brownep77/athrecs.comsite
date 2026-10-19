import { SITE_URL, siteGraphMeta } from "./seo";
import type { RacePlacePageData } from "./race-places";

export function racePlaceUrl(data: RacePlacePageData, page = data.page, archive = data.archive) {
  const query = new URLSearchParams();
  if (archive) query.set("view", "archive");
  if (page > 1) query.set("page", String(page));
  return `${data.place.path}${query.size ? `?${query}` : ""}`;
}

export function racePlaceHead(data: RacePlacePageData) {
  const location =
    data.ancestors
      .slice(1)
      .filter((place) => place.kind !== "continent" || data.place.kind === "continent")
      .reverse()
      .map((place) => place.name)
      .join(", ") || "the world";
  const title = `${data.featuredCount ? "Major races & race calendar" : "Races & race calendar"} in ${location}${data.archive ? " — past editions & dates TBC" : ""}${data.page > 1 ? ` — page ${data.page}` : ""} | ATHRECS`;
  const description = `${data.page > 1 ? `Page ${data.page}. ` : ""}Explore ${data.total} listed events in ${location}: ${data.upcomingCount} with upcoming dates. Compare race highlights, locations and disciplines, with links to entry details and past editions.`;
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
