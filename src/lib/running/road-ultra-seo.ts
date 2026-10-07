import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import {
  ROAD_ULTRAS,
  ULTRA_CHECKED,
  ULTRA_FAQS,
  ULTRA_GUIDE_PATH,
  ultraPath,
  upcomingEditions,
  type RoadUltra,
} from "./road-ultras";

export function roadUltraHead(today: string, race?: RoadUltra) {
  const url = `${SITE_URL}${race ? ultraPath(race.slug) : ULTRA_GUIDE_PATH}`;
  const title = race
    ? `${race.name}: course, dates & entry | AthRecs`
    : "UK road ultramarathons: races, dates & entry guides | AthRecs";
  const description = race
    ? `${race.distance}. ${race.surface}. Explore ${race.name}, with course information, published dates and official entry links.`
    : "Explore UK road ultramarathons, paved-path ultras and timed races. Compare 18 event guides, distances, surfaces and confirmed or provisional dates.";
  const graph: Record<string, unknown>[] = [
    {
      "@type": race ? "WebPage" : "CollectionPage",
      "@id": `${url}#page`,
      url,
      name: title,
      description,
      inLanguage: "en-GB",
      dateModified: ULTRA_CHECKED,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      ...(race ? {} : { mainEntity: { "@id": `${url}#races` } }),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: "Home", item: SITE_URL },
        { name: "Running guides", item: `${SITE_URL}/running` },
        { name: "UK road ultras", item: `${SITE_URL}${ULTRA_GUIDE_PATH}` },
        ...(race ? [{ name: race.name, item: url }] : []),
      ].map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item })),
    },
  ];
  if (race) {
    // Provisional, expired and unknown dates must not look like scheduled events to crawlers.
    graph.push(
      ...upcomingEditions(race, today)
        .filter((edition) => !edition.provisional)
        .map((edition) => ({
          "@type": "SportsEvent",
          "@id": `${url}#${edition.date}`,
          name: `${race.name}${edition.label ? ` — ${edition.label}` : ""}`,
          sport: "Running",
          description: race.summary,
          startDate: edition.date,
          ...(edition.endDate ? { endDate: edition.endDate } : {}),
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          location: { "@type": "Place", name: race.location, address: race.location },
          url: edition.url,
        })),
    );
  } else {
    graph.push(
      {
        "@type": "ItemList",
        "@id": `${url}#races`,
        numberOfItems: ROAD_ULTRAS.length,
        itemListElement: ROAD_ULTRAS.map((event, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: event.name,
          url: `${SITE_URL}${ultraPath(event.slug)}`,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: ULTRA_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    );
  }
  return {
    meta: siteGraphMeta({ title, description, url }),
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
