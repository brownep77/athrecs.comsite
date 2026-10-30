export type EditorialKind = "race-reports" | "news";

export type EditorialLocation = {
  country: string;
  area?: string;
  county?: string;
};

export type EditorialSearch = {
  sport?: string;
  country?: string;
  area?: string;
  county?: string;
};

export type EditorialArticle = {
  slug: string;
  kind: EditorialKind;
  date: string;
  displayDate: string;
  title: string;
  standfirst: string;
  body: string[];
  sports: string[];
  // Each location is a complete hierarchy. Multi-location reports can have several.
  locations: EditorialLocation[];
  links?: { label: string; url: string }[];
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
  for (const key of ["sport", "country", "area", "county"] as const) {
    if (typeof raw[key] === "string" && raw[key].trim()) {
      result[key] = raw[key].trim().slice(0, 100);
    }
  }
  return result;
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
    matchesCountry(location.country, search.country) &&
    (!search.area || location.area === search.area) &&
    (!search.county || location.county === search.county)
  );
}

export function filterEditorialArticles(
  articles: readonly EditorialArticle[],
  kind: EditorialKind,
  search: EditorialSearch,
) {
  return articles
    .filter(
      (article) =>
        article.kind === kind &&
        (!search.sport || article.sports.includes(search.sport)) &&
        (!(search.country || search.area || search.county) ||
          article.locations.some((location) => matchesEditorialLocation(location, search))),
    )
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

export function editorialLocationOptions(
  articles: readonly EditorialArticle[],
  search: EditorialSearch,
) {
  const locations = articles.flatMap((article) => article.locations);
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
        articleSection: article.kind === "news" ? "Sports news" : "Race reports",
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
              (section) => section.sources?.map((source) => source.url) ?? [],
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
