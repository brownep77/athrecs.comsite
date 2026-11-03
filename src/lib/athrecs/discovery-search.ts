import { getSportPage, parseSportFixtureSearch, type SportFixtureSearch } from "./sport-pages.ts";
import type { SportFixture } from "./sport-fixtures.server";

export type DiscoverySearch = SportFixtureSearch & { sport?: string };

export function parseDiscoverySearch(raw: Record<string, unknown>): DiscoverySearch {
  return {
    ...parseSportFixtureSearch({ ...raw, page: undefined }),
    sport: getSportPage(raw.sport)?.slug,
  };
}

/** Fixture filters stay scoped to their sport; athlete names search all public sports. */
export function discoveryFixtureHref(search: DiscoverySearch): string {
  const params = new URLSearchParams();
  for (const key of ["q", "country", "month", "distance"] as const) {
    if (search[key]) params.set(key, search[key]);
  }
  const pathname = search.sport ? `/sports/${search.sport}` : "/";
  return `${pathname}${params.size ? `?${params}` : ""}#fixtures`;
}

const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Suggest only recorded places from the returned, published fixture matches. */
export function discoveryPlaceMatches(fixtures: SportFixture[], search: DiscoverySearch) {
  const query = fold(search.q ?? "");
  if (!query) return [];
  const matches = new Map<string, { name: string; country: string | null; href: string }>();
  for (const fixture of fixtures) {
    for (const name of [
      fixture.city,
      fixture.town,
      fixture.county,
      fixture.state,
      fixture.region,
      fixture.country,
    ]) {
      if (!name?.trim() || !fold(name).includes(query)) continue;
      const key = `${fold(name)}|${fold(fixture.country ?? "")}`;
      matches.set(key, {
        name,
        country: fixture.country,
        href: discoveryFixtureHref({ ...search, q: name }),
      });
    }
  }
  return [...matches.values()].slice(0, 8);
}
