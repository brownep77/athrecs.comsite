import { COUNTRY_CONTINENTS } from "../../data/country-continents.ts";
import { countryFlag } from "./country-flags.ts";

export type EditorialKind = "race-reports" | "news";

export const EDITORIAL_LEVELS = [
  { value: "world", label: "World" },
  { value: "continent", label: "Continent" },
  { value: "national", label: "National" },
  { value: "local", label: "Local" },
] as const;

export type EditorialLevel = (typeof EDITORIAL_LEVELS)[number]["value"];

export const EDITORIAL_CONTINENTS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Antarctica",
] as const;

export type EditorialContinent = (typeof EDITORIAL_CONTINENTS)[number];

export const EDITORIAL_PRIORITY_COUNTRIES = [
  "United Kingdom",
  "Ireland",
  "United States",
  "New Zealand",
  "Australia",
  "Canada",
] as const;

export type EditorialLocation = {
  country: string;
  area?: string;
  county?: string;
};

export type EditorialSearch = {
  sport?: string;
  level?: EditorialLevel;
  continent?: string;
  country?: string;
  area?: string;
  county?: string;
};

export type EditorialArticle = {
  slug: string;
  kind: EditorialKind;
  // Also list a news report in Race Reports while retaining its canonical news URL.
  listInRaceReports?: boolean;
  date: string;
  displayDate: string;
  title: string;
  standfirst: string;
  body: string[];
  sports: string[];
  // Each location is a complete hierarchy. Multi-location reports can have several.
  locations: EditorialLocation[];
  // World coverage is an editorial choice, never inferred from an overseas venue.
  // Other levels can share one canonical article in the appropriate geographic feeds.
  coverageLevels?: EditorialLevel[];
  coverageContinents?: EditorialContinent[];
  links?: { label: string; url: string }[];
  // All named athletes, including those awaiting a staff profile/link review.
  // Review notes and candidate identity evidence belong in server-only data.
  athleteNames?: string[];
  athleteLinks?: Record<string, string>;
  seoTitle?: string;
  description?: string;
  author?: string;
  publishedAt?: string;
  modifiedAt?: string;
  image?: { src: string; alt: string; caption: string; width: number; height: number };
  sections?: {
    id: string;
    heading: string;
    paragraphs: string[];
    table?: { caption: string; headings: string[]; rows: string[][] };
    sources?: { label: string; url: string }[];
  }[];
  faqs?: { question: string; answer: string }[];
  callToAction?: { heading: string; text: string; label: string; url: string };
};

export function parseEditorialSearch(raw: Record<string, unknown>): EditorialSearch {
  const result: EditorialSearch = {};
  for (const key of ["sport", "continent", "country", "area", "county"] as const) {
    if (typeof raw[key] === "string" && raw[key].trim()) {
      result[key] = raw[key].trim().slice(0, 100);
    }
  }
  if (typeof raw.level === "string" && raw.level.trim()) {
    // Preserve unknown values for restrictive filtering instead of silently
    // turning a misspelled/deprecated level into the unfiltered news feed.
    result.level = raw.level.trim().slice(0, 100) as EditorialLevel;
  }
  return result;
}

export function editorialCountryContinent(country: string): EditorialContinent | undefined {
  const code = countryFlag(country).code.split("-")[0];
  const continent = COUNTRY_CONTINENTS[code];
  return EDITORIAL_CONTINENTS.find((item) => item === continent);
}

export function editorialContinents(
  article: Pick<EditorialArticle, "locations" | "coverageContinents">,
): EditorialContinent[] {
  const covered = new Set<string>([
    ...(article.coverageContinents ?? []),
    ...article.locations.flatMap((location) => {
      const continent = editorialCountryContinent(location.country);
      return continent ? [continent] : [];
    }),
  ]);
  return EDITORIAL_CONTINENTS.filter((continent) => covered.has(continent));
}

export function editorialLevels(
  article: Pick<EditorialArticle, "locations" | "coverageLevels" | "coverageContinents">,
): EditorialLevel[] {
  if (article.coverageLevels) {
    return EDITORIAL_LEVELS.map((level) => level.value).filter((level) =>
      article.coverageLevels?.includes(level),
    );
  }
  // Geography groups stories for browsing. It does not make a local event a
  // continental championship, or establish the nationality of any athlete.
  return [
    ...(editorialContinents(article).length ? ["continent" as const] : []),
    ...(article.locations.some((location) => Boolean(location.country.trim()))
      ? ["national" as const]
      : []),
    ...(article.locations.some((location) => Boolean(location.area || location.county))
      ? ["local" as const]
      : []),
  ];
}

/** Count the main prose, without tables, navigation, metadata or repeated FAQs. */
export function editorialWordCount(
  article: Pick<EditorialArticle, "standfirst" | "body" | "sections">,
): number {
  const prose = [
    article.standfirst,
    ...article.body,
    ...(article.sections?.flatMap((section) => section.paragraphs) ?? []),
  ].join(" ");
  return prose.match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

export function editorialReadingMinutes(
  article: Pick<EditorialArticle, "standfirst" | "body" | "sections">,
): number {
  return Math.max(1, Math.ceil(editorialWordCount(article) / 200));
}

function matchesCountry(country: string, filter?: string) {
  return (
    !filter ||
    country === filter ||
    (filter === "United Kingdom" &&
      ["England", "Scotland", "Wales", "Northern Ireland"].includes(country))
  );
}

export function matchesEditorialLocation(location: EditorialLocation, search: EditorialSearch) {
  return (
    (!search.continent || editorialCountryContinent(location.country) === search.continent) &&
    matchesCountry(location.country, search.country) &&
    (!search.area || location.area === search.area) &&
    (!search.county || location.county === search.county)
  );
}

export function filterEditorialArticles<T extends EditorialArticle>(
  articles: readonly T[],
  kind: EditorialKind,
  search: EditorialSearch,
) {
  return articles
    .filter(
      (article) =>
        (article.kind === kind || (kind === "race-reports" && article.listInRaceReports)) &&
        (!search.level || editorialLevels(article).includes(search.level)) &&
        (!search.sport || article.sports.includes(search.sport)) &&
        (search.country || search.area || search.county
          ? article.locations.some((location) => matchesEditorialLocation(location, search))
          : !search.continent ||
            editorialContinents(article).some((continent) => continent === search.continent)),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function editorialLocationOptions(
  articles: readonly EditorialArticle[],
  kind: EditorialKind,
  search: EditorialSearch,
) {
  const locations = filterEditorialArticles(articles, kind, {
    level: search.level,
    sport: search.sport,
  })
    .flatMap((article) => article.locations)
    .filter(
      (location) =>
        !search.continent || editorialCountryContinent(location.country) === search.continent,
    );
  const unique = (values: (string | undefined)[]) =>
    [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) =>
      a.localeCompare(b),
    );
  return {
    countries: unique(locations.map((location) => location.country)),
    areas: search.country
      ? unique(
          locations
            .filter((location) => matchesCountry(location.country, search.country))
            .map((location) => location.area),
        )
      : [],
    counties:
      search.country && search.area
        ? unique(
            locations
              .filter(
                (location) =>
                  matchesCountry(location.country, search.country) && location.area === search.area,
              )
              .map((location) => location.county),
          )
        : [],
  };
}

export function editorialPath(article: Pick<EditorialArticle, "kind" | "slug">) {
  return `/${article.kind}/${article.slug}`;
}

export function editorialJsonLd(article: EditorialArticle, origin: string) {
  const url = `${origin}${editorialPath(article)}`;
  const athleteSlugs = [...new Set(Object.values(article.athleteLinks ?? {}))];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: article.title,
        description: article.description ?? article.standfirst,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        datePublished: article.publishedAt ?? article.date,
        dateModified: article.modifiedAt ?? article.publishedAt ?? article.date,
        inLanguage: "en-GB",
        wordCount: editorialWordCount(article),
        timeRequired: `PT${editorialReadingMinutes(article)}M`,
        ...(athleteSlugs.length
          ? {
              mentions: athleteSlugs.map((slug) => ({
                "@id": `${origin}/athletes/${slug}#athlete`,
              })),
            }
          : {}),
        articleSection: [
          article.kind === "news" ? "Sports news" : "Race reports",
          ...EDITORIAL_LEVELS.filter((level) => editorialLevels(article).includes(level.value)).map(
            (level) => `${level.label} coverage`,
          ),
        ],
        ...(article.author
          ? { author: { "@type": "Organization", name: article.author, url: `${origin}/about-us` } }
          : {}),
        publisher: {
          "@type": "Organization",
          "@id": `${origin}/#organization`,
          name: "AthRecs",
          url: origin,
          logo: { "@type": "ImageObject", url: `${origin}/athrecs-logo.png` },
        },
        ...(article.image
          ? {
              image: [
                {
                  "@type": "ImageObject",
                  url: new URL(article.image.src, origin).href,
                  width: article.image.width,
                  height: article.image.height,
                  caption: article.image.caption,
                },
              ],
            }
          : {}),
        citation: [
          ...new Set(
            article.sections?.flatMap(
              (section) =>
                section.sources?.flatMap((source) => (source.url ? [source.url] : [])) ?? [],
            ) ?? [],
          ),
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "AthRecs", item: origin },
          {
            "@type": "ListItem",
            position: 2,
            name: article.kind === "news" ? "News" : "Race reports",
            item: `${origin}/${article.kind}`,
          },
          { "@type": "ListItem", position: 3, name: article.title, item: url },
        ],
      },
    ],
  };
}
