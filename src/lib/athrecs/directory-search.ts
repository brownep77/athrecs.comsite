import { ORGANISATION_TYPES, type DirectorySport } from "../../data/sports-organisation-types.ts";
import { SPORT_PAGES } from "./sport-pages.ts";

export type DirectorySearch = {
  q?: string;
  country?: string;
  sport?: DirectorySport;
  type?: keyof typeof ORGANISATION_TYPES;
};

export function parsePublicDirectorySearch(raw: Record<string, unknown>, countries?: string[]): DirectorySearch {
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 120) || undefined : undefined,
    country:
      typeof raw.country === "string" && (!countries || countries.includes(raw.country))
        ? raw.country.slice(0, 100)
        : undefined,
    sport: SPORT_PAGES.find((sport) => sport.slug === raw.sport)?.slug,
    type:
      typeof raw.type === "string" && Object.hasOwn(ORGANISATION_TYPES, raw.type)
        ? (raw.type as DirectorySearch["type"])
        : undefined,
  };
}
