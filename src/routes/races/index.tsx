import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { SPORTS as PUBLIC_SPORTS } from "@/lib/athrecs/filters";
import { SITE_URL } from "@/lib/athrecs/seo";
import { RaceCard } from "@/components/races/RaceCard";
import {
  countActiveSearchFilters,
  EMPTY_SEARCH,
  EventSearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

const PAGE_SIZE = 40;
const MAX_PAGE = 250;

const SPORT_VALUES = new Set<Sport>(
  PUBLIC_SPORTS.filter((sport): sport is Sport => sport !== "All"),
);

type RaceSearchParams = {
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

function optionalPage(value: unknown): number | undefined {
  const parsed =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isInteger(parsed) || parsed <= 1) return undefined;
  return Math.min(parsed, MAX_PAGE);
}

function filtersFromSearch(search: RaceSearchParams): EventSearchValues {
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

function searchFromFilters(filters: EventSearchValues): RaceSearchParams {
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

export const Route = createFileRoute("/races/")({
  validateSearch: (search: Record<string, unknown>): RaceSearchParams => {
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
      page: optionalPage(search.page),
    };
  },
  head: () => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/races` }],
  }),
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => {
    const filters = filtersFromSearch(deps);
    const api = searchToApi(filters);
    const page = deps.page ?? 1;
    return listEvents({
      data: {
        ...api,
        sport: api.sport as Sport | undefined,
        upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
        limit: PAGE_SIZE + 1,
        offset: (page - 1) * PAGE_SIZE,
      },
    });
  },
  component: EventsPage,
});

function EventsPage() {
  const data = Route.useLoaderData();
  const routeSearch = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [mobileOpen, setMobileOpen] = useState(false);

  const filters = filtersFromSearch(routeSearch);
  const activeFilterCount = countActiveSearchFilters(filters);
  const page = routeSearch.page ?? 1;
  const visibleEvents = data.slice(0, PAGE_SIZE);
  const hasNextPage = data.length > PAGE_SIZE;
  const firstEventNumber = visibleEvents.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastEventNumber = (page - 1) * PAGE_SIZE + visibleEvents.length;

  const updateFilters = (next: EventSearchValues) => {
    void navigate({
      to: "/races",
      search: searchFromFilters(next),
      replace: true,
      resetScroll: false,
    });
  };

  const changePage = (nextPage: number) => {
    const safePage = Math.min(Math.max(nextPage, 1), MAX_PAGE);
    void navigate({
      to: "/races",
      search: {
        ...routeSearch,
        page: safePage > 1 ? safePage : undefined,
      },
      resetScroll: true,
    });
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">Events</h1>
          <p className="max-w-2xl text-sm text-muted">
            Search athletics meetings and championships by surface, distance, country, region,
            city or date. Every selection remains shareable in the page address.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.sport === "Running" ? (
            <Link
              to="/race-series"
              className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg no-underline hover:border-border-strong"
            >
              Running series
            </Link>
          ) : null}
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
        </div>
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
            onChange={updateFilters}
            onDone={() => setMobileOpen(false)}
            variant="sidebar"
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-subtle" aria-live="polite">
              {visibleEvents.length
                ? `Events ${firstEventNumber}–${lastEventNumber}`
                : "0 events shown"}
              {filters.sport !== "All" ? ` · ${filters.sport}` : ""}
            </p>
            {page > 1 || hasNextPage ? (
              <p className="text-xs font-medium text-muted">Page {page}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            {visibleEvents.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                No events match those filters. Try clearing a filter or widening the location or
                date range.
              </p>
            ) : (
              visibleEvents.map((race) => <RaceCard key={race.id} race={race} />)
            )}
          </div>

          {page > 1 || hasNextPage ? (
            <nav
              aria-label="Event pages"
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-card"
            >
              <button
                type="button"
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-subtle">Page {page}</span>
              <button
                type="button"
                onClick={() => changePage(page + 1)}
                disabled={!hasNextPage || page >= MAX_PAGE}
                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
