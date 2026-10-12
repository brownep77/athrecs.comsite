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
    {
      name: "robots",
      content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    },
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

function calendarDate(value: string | null | undefined): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
}

function httpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

/** Only these stored statuses establish Google's supported ticket availability. */
function offerAvailability(status: string): string | undefined {
  switch (status) {
    case "open":
    case "closing_soon":
      return "https://schema.org/InStock";
    case "sold_out":
      return "https://schema.org/SoldOut";
    default:
      // A ballot, waiting list, closed entry or unknown status is not a preorder
      // and does not independently establish that an event has sold out.
      return undefined;
  }
}

/** Archive and undated race pages are not upcoming event listings. */
export function sportsEventJsonLd(
  input: {
    name: string;
    slug: string;
    description?: string;
    city?: string | null;
    country?: string | null;
    startDate?: string | null;
    startTime?: string | null;
    sport?: string | null;
    website?: string | null;
    organiser?: string | null;
    endDate?: string | null;
    entryOptions?: {
      is_verified: boolean;
      entry_type: string;
      entry_url: string;
      price_amount: number | string | null;
      price_currency: string | null;
      status: string;
      opens_at?: string | null;
      closes_at?: string | null;
      source_url?: string | null;
    }[];
  },
  now = new Date(),
) {
  const url = absoluteUrl(`/races/${input.slug}`);
  const description =
    input.description ??
    `${input.name} race details on ATHRECS — date, local start, venue and distances. Confirm entry on the official site.`;
  const date = input.startDate;
  const parsedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date) : null;
  const hasDate =
    parsedDate &&
    Number.isFinite(parsedDate.getTime()) &&
    parsedDate.toISOString().slice(0, 10) === date;

  // Google requires startDate for every SportsEvent. Do not invent a date or
  // reuse a past edition when the page has no dated upcoming edition.
  if (!hasDate) {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: input.name,
      description,
      url,
      inLanguage: "en-GB",
    };
  }

  const start =
    input.startDate && input.startTime
      ? `${input.startDate}T${input.startTime}`
      : (input.startDate ?? undefined);
  // Match todayIso() and visible entry deadlines: the site's calendar day is
  // Europe/London, including daylight saving, rather than the server's UTC day.
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  return {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: input.name,
    description,
    url,
    image: DEFAULT_OG_IMAGE,
    startDate: start,
    endDate:
      input.endDate &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.endDate) &&
      input.endDate >= date! &&
      !Number.isNaN(Date.parse(input.endDate)) &&
      new Date(input.endDate).toISOString().slice(0, 10) === input.endDate
        ? input.endDate
        : undefined,
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
    organizer:
      input.organiser?.trim() && !/^(unknown|tbc|n\/a)$/i.test(input.organiser.trim())
        ? { "@type": "Organization", name: input.organiser.trim(), url: input.website || undefined }
        : undefined,
    offers: input.entryOptions?.flatMap((option) => {
      if (
        option.is_verified !== true ||
        option.entry_type !== "official" ||
        !httpsUrl(option.entry_url) ||
        option.price_amount == null ||
        String(option.price_amount).trim() === "" ||
        !Number.isFinite(Number(option.price_amount)) ||
        Number(option.price_amount) < 0 ||
        !/^[A-Z]{3}$/.test(option.price_currency ?? "")
      )
        return [];

      const closes = calendarDate(option.closes_at);
      const opens = calendarDate(option.opens_at);
      // opens_at is an evidence-backed DATE in storage. Keep that precision;
      // never substitute checked_at, created_at, the race date or midnight.
      const validFrom =
        option.source_url &&
        httpsUrl(option.source_url) &&
        opens &&
        opens <= date! &&
        (!closes || opens <= closes)
          ? opens
          : undefined;
      const notYetOnSale = Boolean(validFrom && validFrom > today);

      // Waiting-list/ballot applications and expired sales are not purchasable
      // event tickets. Preserve them in the visible entry information. Explicit
      // sold-out tickets remain supported; closed future sales need a real date.
      if (
        ["ballot", "waitlist"].includes(option.status) ||
        (option.status === "closed" && !notYetOnSale) ||
        (closes && closes < today && option.status !== "sold_out")
      )
        return [];

      return [
        {
          "@type": "Offer",
          url: option.entry_url,
          price: Number(option.price_amount),
          priceCurrency: option.price_currency,
          availability: notYetOnSale ? undefined : offerAvailability(option.status),
          validFrom,
        },
      ];
    }),
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
