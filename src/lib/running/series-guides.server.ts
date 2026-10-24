import { RUNNING_SERIES_GUIDES } from "@/data/running-series-guides";
import { HALF_MARATHON_COUNTRIES } from "@/data/road-half-marathons/countries";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import type { RunningSeriesSummary } from "./series-guides";

/** Send only the listing fields to directory routes. Full prose stays on its guide. */
export function getRunningSeriesSummaries(): RunningSeriesSummary[] {
  return RUNNING_SERIES_GUIDES.map(({ slug, name, shortDescription, format, kind, checkedAt }) => ({
    slug,
    name,
    shortDescription,
    format,
    kind,
    checkedAt,
  }));
}

export function getRunningSeriesGuide(slug: string) {
  const guide = RUNNING_SERIES_GUIDES.find((item) => item.slug === slug);
  if (!guide) return null;
  const countries = [...MARATHON_COUNTRIES, ...HALF_MARATHON_COUNTRIES]
    .filter((country) => guide.relatedCountryIds.includes(country.id))
    .map((country) => ({
      name: `${country.name} ${country.guide.endsWith("-half-marathons") ? "half marathons" : "marathons"}`,
      countryName: country.name,
      path: `/running/${country.guide}`,
    }));
  const related = getRunningSeriesSummaries()
    .filter((item) => item.slug !== slug)
    .sort((a, b) => Number(b.kind === guide.kind) - Number(a.kind === guide.kind))
    .slice(0, 3);
  return { guide, countries, related };
}
