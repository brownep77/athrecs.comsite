import { absoluteUrl, SITE_URL } from "./seo.ts";

/** Describe the items rendered in this public directory page, in their displayed order. */
export function directoryStructuredData(
  url: string,
  name: string,
  items: { name: string; path: string }[],
  language = "en-GB",
) {
  if (!items.length) return [];
  return [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": url + "#webpage",
        url,
        name,
        inLanguage: language,
        isPartOf: { "@id": SITE_URL + "/#website" },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: absoluteUrl(item.path),
          })),
        },
      }).replace(/</g, "\\u003c"),
    },
  ];
}
