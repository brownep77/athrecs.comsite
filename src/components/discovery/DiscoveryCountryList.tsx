import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Globe2, Search, X } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { countryFlag } from "@/lib/athrecs/country-flags";
import { filterCountryName, resolveCountry } from "@/lib/athrecs/countries";
import type { SportFixtureSearch, SportPage } from "@/lib/athrecs/sport-pages";
import { DISCOVERY_COUNTRIES } from "./discovery-navigation";

type Props = {
  sport?: SportPage;
  countries: string[];
  search: SportFixtureSearch;
};

const countryName = (value: string) => filterCountryName(resolveCountry({ country: value }));
const searchKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en")
    .trim();

/** Short country shortcuts plus the full list for this sport's fixture catalogue. */
export function DiscoveryCountryList({ sport, countries, search }: Props) {
  const selectedCountry = search.country ? countryName(search.country) : undefined;
  const featuredCountries = DISCOVERY_COUNTRIES.map((country) => country.name);
  const allCountries = [
    ...new Set([
      ...featuredCountries,
      ...countries.filter((country) => country.trim()).map(countryName),
      ...(selectedCountry ? [selectedCountry] : []),
    ]),
  ].sort((a, b) => a.localeCompare(b, "en"));
  const [expanded, setExpanded] = useState(
    Boolean(selectedCountry && !featuredCountries.includes(selectedCountry)),
  );
  const [query, setQuery] = useState("");
  const normalQuery = searchKey(query);
  const canonicalQuery = query.trim() ? searchKey(countryName(query)) : "";
  const matches = allCountries.filter(
    (country) => searchKey(country).includes(normalQuery) || searchKey(country) === canonicalQuery,
  );
  const sportLabel = sport?.sport === "Parkrun" ? "parkrun" : (sport?.label ?? "Running");

  function countryLink(country?: string) {
    const selected = selectedCountry === country;
    const props = {
      search: { ...search, country, page: undefined },
      hash: "fixtures",
      preload: false as const,
      activeOptions: { exact: true },
      className: `flex min-h-10 items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] no-underline transition-colors focus-visible:outline-2 focus-visible:outline-accent ${selected ? "bg-accent-soft font-semibold text-accent" : "text-muted hover:bg-accent-soft hover:text-accent"}`,
      "aria-current": selected ? ("true" as const) : undefined,
    };
    const content = (
      <>
        <span aria-hidden="true" className="shrink-0">
          {country && countryFlag(country).code ? (
            <CountryFlag country={country} />
          ) : (
            <Globe2 className="size-4" />
          )}
        </span>
        <span className="min-w-0 flex-1 break-words">{country ?? "All countries"}</span>
        {selected && <Check className="size-3.5 shrink-0" aria-hidden="true" />}
      </>
    );
    return sport ? (
      <Link to="/sports/$sport" params={{ sport: sport.slug }} {...props}>
        {content}
      </Link>
    ) : (
      <Link to="/" {...props}>
        {content}
      </Link>
    );
  }

  return (
    <nav aria-label={`Explore ${sportLabel.toLowerCase()} by country`}>
      <ul aria-label="Featured countries">
        {featuredCountries.map((country) => (
          <li key={country}>{countryLink(country)}</li>
        ))}
      </ul>
      <details
        open={expanded}
        onToggle={(event) => {
          setExpanded(event.currentTarget.open);
          if (!event.currentTarget.open) setQuery("");
        }}
        className="group/countries mt-2 border-t border-border pt-1"
      >
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[13px] font-semibold text-accent hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
          More countries
          <ChevronDown
            className="size-4 shrink-0 transition-transform group-open/countries:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="mt-1 rounded-md border border-border bg-[#f7f9fa] p-1.5">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-white px-2">
            <Search className="size-3.5 shrink-0 text-muted" aria-hidden="true" />
            <label htmlFor="discovery-country-search" className="sr-only">
              Search {sportLabel.toLowerCase()} countries
            </label>
            <input
              id="discovery-country-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search countries…"
              autoComplete="off"
              maxLength={120}
              className="h-10 min-w-0 flex-1 bg-transparent text-base text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent sm:text-xs"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear country search"
                onClick={() => setQuery("")}
                className="flex min-h-10 min-w-8 items-center justify-center rounded text-muted hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
          <p className="sr-only" role="status">
            {matches.length} {matches.length === 1 ? "country" : "countries"} found
          </p>
          <ul
            aria-label={`All ${sportLabel.toLowerCase()} countries`}
            className="mt-1 max-h-64 overflow-y-auto overscroll-contain"
          >
            <li>{countryLink()}</li>
            {matches.map((country) => (
              <li key={country}>{countryLink(country)}</li>
            ))}
          </ul>
          {matches.length === 0 && (
            <p className="px-2.5 py-3 text-xs leading-5 text-muted">
              No countries match “{query.trim()}”. Try another name.
            </p>
          )}
        </div>
      </details>
    </nav>
  );
}
