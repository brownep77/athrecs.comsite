/** Manually reviewed event imagery. Never substitute publisher branding or
 * infer reuse across editions. External assets stay on their original host. */
export type ReviewedEventImage = {
  slug: string;
  dates: readonly string[];
  url: string;
  sourceUrl: string;
  checkedAt: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

export const REVIEWED_EVENT_IMAGES: readonly ReviewedEventImage[] = [
  {
    slug: "gunma-marathon",
    dates: ["2026-11-03"],
    url: "https://g-marathon.com/wp-content/uploads/2026/03/ogp.jpg",
    sourceUrl: "https://www.g-marathon.com/about-guide/",
    checkedAt: "2026-11-03",
    width: 1200,
    height: 630,
    alt: "Official 36th Gunma Marathon artwork showing 3 November 2026 and the event mascot",
    caption:
      "Official Gunma Marathon artwork for 3 November 2026. Image hosted by the event website.",
  },
  {
    slug: "london-marathon",
    dates: ["2027-04-24"],
    url: "https://www.londonmarathonevents.co.uk/sites/default/files/styles/social_media_share/public/2026-06/DC1_2885.jpg?h=252f27fa&itok=r-WfwpzV",
    sourceUrl: "https://www.londonmarathonevents.co.uk/london-marathon",
    checkedAt: "2026-11-03",
    width: 1200,
    height: 630,
    alt: "London Marathon participants approaching the finish on The Mall",
    caption:
      "London Marathon event photograph used on the organiser’s current event page. Earlier race imagery; not a photograph of the upcoming edition. Image hosted by London Marathon Events.",
  },
];

export function reviewedEventImage(slug: string, date?: string | null) {
  if (!date) return undefined;
  return REVIEWED_EVENT_IMAGES.find((image) => image.slug === slug && image.dates.includes(date));
}

/** Shared by fixture, marathon/half-marathon guide and ultra guide JSON-LD. */
export function eventImageJsonLd(slug: string, date?: string | null) {
  const image = reviewedEventImage(slug, date);
  return image ? { image: image.url } : {};
}
