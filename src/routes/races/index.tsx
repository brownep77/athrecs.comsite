import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { RaceCard } from "@/components/races/RaceCard";
import {
  EMPTY_SEARCH,
  EventSearch,
  isEmptySearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

const PAGE_SIZE = 40;

const SPORT_VALUES = new Set<Sport>([
  "Running",
  "Athletics",
  "Parkrun",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
]);

type RaceSearchParams = {
  sport?: Sport;
  country?: string;
  distance?: string;
  format?: string;
  surface?: string;
};

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const Route = createFileRoute("/races/")({
  validateSearch: (search: Record<string, unknown>): RaceSearchParams => {
    const sport = optionalText(search.sport);
    return {
      sport: sport && SPORT_VALUES.has(sport as Sport) ? (sport as Sport) : undefined,
      country: optionalText(search.country),
      distance: optionalText(search.distance),
      format: optionalText(search.format),
      surface: optionalText(search.surface),
    };
  },
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    listEvents({
      data: {
        ...deps,
        upcomingOnly: true,
        limit: PAGE_SIZE + 1,
      },
    }),
  component: EventsPage,
});

function EventsPage() {
  const initial = Route.useLoaderData();
  const routeSearch = Route.useSearch();
  const initialFilters: EventSearchValues = {
    ...EMPTY_SEARCH,
    sport: routeSearch.sport ?? "All",
    country: routeSearch.country ?? "All",
    distance: routeSearch.distance ?? "All",
    format: routeSearch.format ?? "All",
    surface: routeSearch.surface ?? "All",
  };
  const [filters, setFilters] = useState<EventSearchValues>(() => initialFilters);
  const [page, setPage] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const empty = isEmptySearch(filters);
  const matchesInitial = JSON.stringify(filters) === JSON.stringify(initialFilters);

  const { data = initial, isFetching } = useQuery({
    queryKey: ["events", filters, page],
    queryFn: () =>
      listEvents({
        data: {
          ...searchToApi(filters),
          sport: (searchToApi(filters).sport as Sport | undefined) ?? undefined,
          upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
          limit: PAGE_SIZE + 1,
          offset: page * PAGE_SIZE,
        },
      }),
    initialData: matchesInitial && page === 0 ? initial : undefined,
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchOnMount: false,
  });
  const visibleEvents = data.slice(0, PAGE_SIZE);
  const hasNextPage = data.length > PAGE_SIZE;
  const firstEventNumber = visibleEvents.length ? page * PAGE_SIZE + 1 : 0;
  const lastEventNumber = page * PAGE_SIZE + visibleEvents.length;

  const updateFilters = (next: EventSearchValues) => {
    setFilters(next);
    setPage(0);
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">Events</h1>
          <p className="max-w-2xl text-sm text-muted">
            Search by country, county, city, postcode, month or date range. Use the sidebar filters
            for sport, distance and surface.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg lg:hidden"
        >
          {mobileOpen ? "Hide filters" : "Show filters"}
          {!empty ? (
            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] text-primary-fg">
              On
            </span>
          ) : null}
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
        {/* Sidebar — always visible on lg+, collapsible on mobile */}
        <div
          className={
            mobileOpen
              ? "block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
              : "hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
          }
        >
          <EventSearch value={filters} onChange={updateFilters} variant="sidebar" />
        </div>

        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-subtle">
              {visibleEvents.length
                ? `Events ${firstEventNumber}–${lastEventNumber}`
                : "0 events shown"}
              {isFetching ? " · Updating…" : ""}
            </p>
            {page > 0 || hasNextPage ? (
              <p className="text-xs font-medium text-muted">Page {page + 1}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            {visibleEvents.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                No events match those filters. Try clearing search or widening the date range.
              </p>
            ) : (
              visibleEvents.map((r) => <RaceCard key={r.id} race={r} />)
            )}
          </div>

          {page > 0 || hasNextPage ? (
            <nav
              aria-label="Event pages"
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-card"
            >
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(0, current - 1))}
                disabled={page === 0 || isFetching}
                className="inline-flex h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-subtle">Page {page + 1}</span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasNextPage || isFetching}
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
