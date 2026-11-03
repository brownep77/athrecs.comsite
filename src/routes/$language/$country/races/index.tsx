import { directoryStructuredData } from "@/lib/athrecs/directory-structured-data";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { SPORTS as PUBLIC_SPORTS } from "@/lib/athrecs/filters";
import {
  SITE_LANGUAGES,
  copyForLanguage,
  countrySiteFromSlug,
  displayCountryForLanguage,
  isSiteLanguage,
  translateCountryText,
} from "@/lib/athrecs/country-sites";
import { RaceCard } from "@/components/races/RaceCard";
import {
  countActiveSearchFilters,
  EMPTY_SEARCH,
  EventSearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

const SPORTS = new Set<Sport>(PUBLIC_SPORTS.filter((sport): sport is Sport => sport !== "All"));

const PAGE_SIZE = 40;
const MAX_PAGE = 250;

type CountryRaceSearch = {
  q?: string;
  sport?: Sport;
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

function optionalPage(value: unknown): number | undefined {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed) || parsed <= 1) return undefined;
  return Math.min(parsed, MAX_PAGE);
}

function filtersFromSearch(search: CountryRaceSearch, country: string): EventSearchValues {
  return {
    ...EMPTY_SEARCH,
    q: search.q ?? "",
    sport: search.sport ?? "Running",
    country,
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

function searchFromFilters(filters: EventSearchValues): CountryRaceSearch {
  const api = searchToApi(filters);
  return {
    q: api.q,
    sport: filters.sport === "Running" ? undefined : (filters.sport as Sport),
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

export const Route = createFileRoute("/$language/$country/races/")({
  validateSearch: (search: Record<string, unknown>): CountryRaceSearch => {
    const sport = optionalText(search.sport);
    return {
      q: optionalText(search.q),
      sport: sport && SPORTS.has(sport as Sport) ? (sport as Sport) : undefined,
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
      page: optionalPage(search.page),
    };
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const site = countrySiteFromSlug(params.country);
    if (!site || !isSiteLanguage(params.language)) throw notFound();
    const filters = filtersFromSearch(deps, site.country);
    const api = searchToApi(filters);
    const races = await listEvents({
      data: {
        ...api,
        country: site.country,
        sport: filters.sport as Sport,
        upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
        limit: PAGE_SIZE + 1,
        offset: ((deps.page ?? 1) - 1) * PAGE_SIZE,
      },
    });
    const filtered = Object.entries(deps).some(([key, value]) => key !== "page" && Boolean(value));
    if (!filtered && (deps.page ?? 1) > 1 && !races.length) throw notFound();
    return { site, language: params.language, races };
  },
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const { site, language } = loaderData;
    const copy = copyForLanguage(language);
    const country = displayCountryForLanguage(site, language);
    const page = match.search.page ?? 1;
    const url = `${SITE_URL}/${language}/${site.slug}/races${page > 1 ? `?page=${page}` : ""}`;
    const filtered = Object.entries(match.search).some(
      ([key, value]) => key !== "page" && Boolean(value),
    );
    const title = translateCountryText(
      !match.search.sport || match.search.sport === "Running" ? copy.runningCalendar : copy.racesIn,
      country,
    );
    return {
      meta: siteGraphMeta({
        title: `${title}${page > 1 ? ` — ${page}` : ""} | ATHRECS`,
        description: `${title}. ${copy.racesIntro}`,
        url,
        indexable: !filtered && loaderData.races.length > 0,
      }),
      links: [
        { rel: "canonical", href: url },
        ...(!filtered && page === 1 && loaderData.races.length
          ? [
              ...SITE_LANGUAGES.map((locale) => ({
                rel: "alternate",
                hrefLang: locale,
                href: `${SITE_URL}/${locale}/${site.slug}/races`,
              })),
              {
                rel: "alternate",
                hrefLang: "x-default",
                href: `${SITE_URL}/en/${site.slug}/races`,
              },
            ]
          : []),
      ],
      scripts: filtered
        ? []
        : directoryStructuredData(
            url,
            title,
            loaderData.races.slice(0, PAGE_SIZE).map((race) => ({
              name: race.name,
              path: IS_RUNRECS_SITE
                ? `/${language}/${site.slug}/races/${encodeURIComponent(race.slug)}`
                : `/races/${encodeURIComponent(race.slug)}`,
            })),
            language,
          ),
    };
  },
  component: CountryRacesPage,
});

function CountryRacesPage() {
  const { site, language, races } = Route.useLoaderData();
  const routeSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = copyForLanguage(language);
  const country = displayCountryForLanguage(site, language);
  const filters = filtersFromSearch(routeSearch, site.country);
  const activeFilterCount = countActiveSearchFilters(filters, { ignoreCountry: true });
  const page = routeSearch.page ?? 1;
  const visibleRaces = races.slice(0, PAGE_SIZE);
  const nextRace =
    page === 1 && !Object.values(routeSearch).some(Boolean) ? visibleRaces[0] : undefined;
  const hasNextPage = races.length > PAGE_SIZE;
  const firstEventNumber = visibleRaces.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastEventNumber = (page - 1) * PAGE_SIZE + visibleRaces.length;

  const updateFilters = (next: EventSearchValues) => {
    const fixed = { ...next, country: site.country };
    void navigate({
      to: "/$language/$country/races",
      params: { language, country: site.slug },
      search: searchFromFilters(fixed),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <Link
        to="/$language/$country"
        params={{ language, country: site.slug }}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        {translateCountryText(copy.backToCountry, country)}
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            {site.flag} {country}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            {translateCountryText(
              filters.sport === "Running" ? copy.runningCalendar : copy.racesIn,
              country,
            )}
          </h1>
          <p className="max-w-2xl text-sm text-muted">{copy.racesIntro}</p>
          {nextRace?.next_date && (
            <p className="text-sm">
              <strong>{copy.nextListedRace}</strong>
              {" · "}
              <a
                className="text-accent underline"
                href={`/races/${encodeURIComponent(nextRace.slug)}`}
              >
                {nextRace.name}
              </a>
              {" · "}
              <time dateTime={nextRace.next_date}>
                {new Intl.DateTimeFormat(language, { dateStyle: "long", timeZone: "UTC" }).format(
                  new Date(nextRace.next_date + "T12:00:00Z"),
                )}
              </time>
              {nextRace.city ? ` · ${nextRace.city}` : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg lg:hidden"
        >
          {mobileOpen
            ? "Hide filters"
            : activeFilterCount
              ? `Filters (${activeFilterCount})`
              : "Show filters"}
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(280px,330px)_1fr] lg:items-start">
        <div
          className={
            mobileOpen
              ? "block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
              : "hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
          }
        >
          <EventSearch
            value={filters}
            defaultSport="Running"
            onChange={updateFilters}
            fixedCountry={site.country}
            fixedCountryLabel={country}
            onDone={() => setMobileOpen(false)}
            variant="sidebar"
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-subtle" aria-live="polite">
              {visibleRaces.length ? `${firstEventNumber}–${lastEventNumber}` : "0"}{" "}
              {copy.events.toLowerCase()}
              {filters.sport !== "All" ? ` · ${filters.sport}` : ""}
            </p>
            {page > 1 || hasNextPage ? (
              <p className="text-xs font-medium text-muted">{page}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            {visibleRaces.length ? (
              visibleRaces.map((race) => (
                <RaceCard
                  key={race.id}
                  race={race}
                  localized={IS_RUNRECS_SITE ? { language, country: site.slug } : undefined}
                />
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
                {copy.noRaces}
              </p>
            )}
          </div>

          {page > 1 || hasNextPage ? (
            <nav
              aria-label="Event pages"
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-card"
            >
              {page > 1 ? (
                <Link
                  from={Route.fullPath}
                  to="."
                  rel="prev"
                  aria-label="Previous page"
                  search={{ ...routeSearch, page: page > 2 ? page - 1 : undefined }}
                  className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg"
                >
                  ←
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm text-subtle">{page}</span>
              {hasNextPage && page < MAX_PAGE ? (
                <Link
                  from={Route.fullPath}
                  to="."
                  rel="next"
                  aria-label="Next page"
                  search={{ ...routeSearch, page: page + 1 }}
                  className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg"
                >
                  →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
