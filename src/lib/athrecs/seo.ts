/** Shared SEO helpers — titles, Open Graph, JSON-LD for traditional + voice search. */

export const SITE_URL = "https://www.athrecs.com";
export const SITE_NAME = "ATHRECS.com";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/athrecs-logo.png`;

export const DEFAULT_DESCRIPTION =
  "Your sporting life, in one profile. Find athletes and bring your results, personal bests, progress and social links together across every sport on ATHRECS.com.";

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
  const title = opts?.title ?? `${SITE_NAME} — Athlete profiles for every sport`;
  const description = opts?.description ?? DEFAULT_DESCRIPTION;
  const url = opts?.url ?? SITE_URL;
  const image = opts?.image ?? DEFAULT_OG_IMAGE;
  const type = opts?.type ?? "website";

  return [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
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
    "@id": `${SITE_URL}/#website`,
    inLanguage: "en-GB",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/athletes?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
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
      : (input.startDate ?? undefined);

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: input.name,
    description:
      input.description ??
      `${input.name} race details on ATHRECS — date, local start, venue and distances. Confirm entry on the official site.`,
    url,
    image: DEFAULT_OG_IMAGE,
    startDate: start,
    eventStatus: start ? "https://schema.org/EventScheduled" : undefined,
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
    sport: input.sport || "Athletics",
    organizer: input.website ? { "@type": "Organization", url: input.website } : undefined,
  };
}

/** FAQ blocks help voice assistants answer "when / where / how far" questions. */
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
    : "See the ATHRECS event page for the next listed date";
  const where = input.city ? input.city : "See the ATHRECS venue section";
  const distance =
    input.distances && input.distances.length
      ? input.distances.join(", ")
      : "See the official race distances on ATHRECS";

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `When is ${input.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The next listed date for ${input.name} on ATHRECS is ${when}. Always confirm on the official race website.`,
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
