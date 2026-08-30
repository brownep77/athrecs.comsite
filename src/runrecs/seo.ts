/** RunRecs SEO helpers. The public catalogue is running and parkrun only. */

export const SITE_URL = "https://www.runrecs.com";
export const SITE_NAME = "RunRecs.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/athrecs-logo.png`;

export const DEFAULT_DESCRIPTION =
  "Find road, trail, fell and ultra running races, parkruns, results, athletes and clubs on RunRecs.com.";

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function siteGraphMeta(opts?: {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
  type?: string;
}) {
  const title = opts?.title ?? `${SITE_NAME} — Running races, results and athletes`;
  const description = opts?.description ?? DEFAULT_DESCRIPTION;
  const url = opts?.url ?? SITE_URL;
  const image = opts?.image ?? DEFAULT_OG_IMAGE;
  const type = opts?.type ?? "website";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow, max-image-preview:large" },
    { property: "og:type", content: type },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    { property: "og:locale", content: "en_GB" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/races?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE,
    },
  };
}

export function sportsEventJsonLd(input: {
  name: string;
  slug: string;
  description?: string;
  city?: string | null;
  country?: string | null;
  startDate?: string | null;
  startTime?: string | null;
  sport?: string | null;
  website?: string | null;
}) {
  const url = absoluteUrl(`/races/${input.slug}`);
  const start =
    input.startDate && input.startTime
      ? `${input.startDate}T${input.startTime}`
      : input.startDate ?? undefined;

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: input.name,
    description:
      input.description ??
      `${input.name} running-event details on RunRecs — date, local start, venue and distances. Confirm entry on the official site.`,
    url,
    image: DEFAULT_OG_IMAGE,
    startDate: start,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: [input.city, input.country].filter(Boolean).join(", ") || input.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: input.city || undefined,
        addressCountry: input.country || undefined,
      },
    },
    sport: input.sport || "Running",
    organizer: input.website
      ? { "@type": "Organization", url: input.website }
      : undefined,
  };
}

export function raceFaqJsonLd(input: {
  name: string;
  slug: string;
  city?: string | null;
  nextDate?: string | null;
  startTime?: string | null;
  distances?: string[];
}) {
  const url = absoluteUrl(`/races/${input.slug}`);
  const when = input.nextDate
    ? input.startTime
      ? `${input.nextDate} at ${input.startTime} local time`
      : input.nextDate
    : "See the RunRecs event page for the next listed date";
  const where = input.city ? input.city : "See the RunRecs venue section";
  const distance =
    input.distances && input.distances.length
      ? input.distances.join(", ")
      : "See the official race distances on RunRecs";

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${input.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The next listed date for ${input.name} on RunRecs is ${when}. Always confirm on the official race website.`,
        },
      },
      {
        "@type": "Question",
        name: `Where is ${input.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${input.name} is listed at ${where}. Full travel notes are on ${url}.`,
        },
      },
      {
        "@type": "Question",
        name: `What distance is ${input.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Distances listed for ${input.name}: ${distance}.`,
        },
      },
    ],
  };
}
