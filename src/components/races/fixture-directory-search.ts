import type { Sport } from "@/lib/athrecs/types";
import { SPORTS as PUBLIC_SPORTS } from "@/lib/athrecs/filters";
import { EMPTY_SEARCH, searchToApi, type EventSearchValues } from "./EventSearch";

export const MAX_RACE_DIRECTORY_PAGE = 250;

const SPORT_VALUES = new Set<Sport>(
  PUBLIC_SPORTS.filter((sport): sport is Sport => sport !== "All"),
);

export type RaceSearchParams = {
  q?: string;
  sport?: Sport;
  country?: string;
  county?: string;
  city?: string;
  postcode?: string;
  month?: string;
  dateFrom?: string;
  dateTo?: string;
  distance?: string;
  format?: string;
  surface?: string;
  group?: string;
  page?: number;
};

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function optionalPage(value: unknown, maxPage: number): number | undefined {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed) || parsed <= 1) return undefined;
  return Math.min(parsed, maxPage);
}

export function filtersFromSearch(search: RaceSearchParams): EventSearchValues {
  return {
    ...EMPTY_SEARCH,
    q: search.q ?? "",
    sport: search.sport ?? EMPTY_SEARCH.sport,
    country: search.country ?? "All",
    county: search.county ?? "",
    city: search.city ?? "",
    postcode: search.postcode ?? "",
    month: search.month ?? "",
    dateFrom: search.dateFrom ?? "",
    dateTo: search.dateTo ?? "",
    distance: search.distance ?? "All",
    format: search.format ?? "All",
    surface: search.surface ?? "All",
    group: search.group ?? "All",
  };
}

export function searchFromFilters(filters: EventSearchValues): RaceSearchParams {
  const api = searchToApi(filters);
  return {
    q: api.q,
    sport: api.sport as Sport | undefined,
    country: api.country,
    county: api.county,
    city: api.city,
    postcode: api.postcode,
    month: api.month,
    dateFrom: api.dateFrom,
    dateTo: api.dateTo,
    distance: api.distance,
    format: api.format,
    surface: api.surface,
    group: api.group,
  };
}

export function parseFixtureDirectorySearch(
  search: Record<string, unknown>,
  maxPage = MAX_RACE_DIRECTORY_PAGE,
): RaceSearchParams {
  const sport = optionalText(search.sport);
  return {
    q: optionalText(search.q),
    sport: sport && SPORT_VALUES.has(sport as Sport) ? (sport as Sport) : undefined,
    country: optionalText(search.country),
    county: optionalText(search.county),
    city: optionalText(search.city),
    postcode: optionalText(search.postcode),
    month: optionalText(search.month),
    dateFrom: optionalText(search.dateFrom),
    dateTo: optionalText(search.dateTo),
    distance: optionalText(search.distance),
    format: optionalText(search.format),
    surface: optionalText(search.surface),
    group: optionalText(search.group),
    page: optionalPage(search.page, maxPage),
  };
}
