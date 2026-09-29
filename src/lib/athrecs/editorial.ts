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
