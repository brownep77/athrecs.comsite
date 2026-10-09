import { SITE_URL, siteGraphMeta } from "../athrecs/seo";
import { FEATURED_ROAD_RACES, type FeaturedRoadRace } from "../../data/featured-road-races";
import { raceLocalDate, roadMarathonDate } from "./road-marathon-calendar";

export const featuredPreviewPath = (race: FeaturedRoadRace) => `/running/previews/${race.slug}`;
export const featuredCardPath = (race: FeaturedRoadRace) => `/featured-races/${race.slug}.png`;
export const featuredRaceBySlug = (slug: string) =>
  FEATURED_ROAD_RACES.find((race) => race.slug === slug);
export const featuredDate = (race: FeaturedRoadRace) => roadMarathonDate(race.date, race.endDate);
export const isUpcomingFeaturedRace = (race: FeaturedRoadRace, now: string | Date) =>
  (race.endDate ?? race.date) >= raceLocalDate(race.timezone, now);

export function featuredCaption(race: FeaturedRoadRace): string {
  return `${race.caption}\n\nFull preview: ${SITE_URL}${featuredPreviewPath(race)}`;
}

export function featuredRaceHead(race: FeaturedRoadRace) {
  const url = `${SITE_URL}${featuredPreviewPath(race)}`;
  return {
    meta: siteGraphMeta({
      title: `${race.name} ${race.date.slice(0, 4)} Preview: Date, Course & Athletes | ATHRECS`,
      description: race.summary,
      url,
      image: `${SITE_URL}${featuredCardPath(race)}`,
      type: "article",
    }),
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${race.name} ${race.date.slice(0, 4)} race preview`,
          description: race.summary,
          url,
          image: `${SITE_URL}${featuredCardPath(race)}`,
          datePublished: race.checkedAt,
          dateModified: race.checkedAt,
          publisher: { "@type": "Organization", name: "AthRecs", url: SITE_URL },
          about: {
            "@type": "SportsEvent",
            name: race.name,
            startDate: race.date,
            endDate: race.endDate ?? race.date,
            sport: "Road running",
            url: race.officialUrl,
            location: {
              "@type": "Place",
              name: race.city,
              address: { "@type": "PostalAddress", addressCountry: race.country },
            },
          },
        }),
      },
    ],
  };
}
