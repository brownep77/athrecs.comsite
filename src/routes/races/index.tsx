import { directoryStructuredData } from "@/lib/athrecs/directory-structured-data";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { MAX_RACE_DIRECTORY_PAGE, filtersFromSearch, parseFixtureDirectorySearch, searchFromFilters, type RaceSearchParams } from "@/components/races/fixture-directory-search";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { RaceCard } from "@/components/races/RaceCard";
import {
  countActiveSearchFilters,
  EventSearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

const PAGE_SIZE = 40;
export const Route = createFileRoute("/races/")({
  validateSearch: (search: Record<string, unknown>) => parseFixtureDirectorySearch(search),
  loaderDeps: ({ search }): RaceSearchParams => search,
  loader: async ({ deps }) => {
    const filters = filtersFromSearch(deps);
    const api = searchToApi(filters);
    const page = deps.page ?? 1;
    const events = await listEvents({
      data: {
        ...api,
        sport: api.sport as Sport | undefined,
        upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
        limit: PAGE_SIZE + 1,
        offset: (page - 1) * PAGE_SIZE,
      },
    });
    const filtered = Object.entries(deps).some(([key, value]) => key !== "page" && Boolean(value));
    if (!IS_RUNRECS_SITE && !filtered && page > 1 && !events.length) throw notFound();
    return events;
  },
  head: ({ loaderData, match }) => {
    if (IS_RUNRECS_SITE) return { links: [{ rel: "canonical", href: `${SITE_URL}/races` }] };
    const page = match.search.page ?? 1;
    const url = `${SITE_URL}/races${page > 1 ? `?page=${page}` : ""}`;
    const filtered = Object.entries(match.search).some(([key, value]) => key !== "page" && Boolean(value));
    const noindex = filtered || !loaderData?.length;
    return {
      meta: siteGraphMeta({ title: `Race fixtures and athletics events${page > 1 ? ` — Page ${page}` : ""} | ATHRECS`, description: "Find track and field fixtures or choose a sport to browse running races, triathlons, cycling and swimming events by date, distance and location.", url }).map((tag) => noindex && "name" in tag && tag.name === "robots" ? { name: "robots", content: "noindex, follow" } : tag),
      links: [{ rel: "canonical", href: url }],
      scripts: filtered ? [] : directoryStructuredData(url, "Race fixtures and athletics events",
        (loaderData ?? []).slice(0, PAGE_SIZE).map((race) => ({ name: race.name, path: `/races/${encodeURIComponent(race.slug)}` }))),
    };
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

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">{IS_RUNRECS_SITE ? "Events" : "Race fixtures and athletics events"}</h1>
          <p className="max-w-2xl text-sm text-muted">
            Search events by country, area or region, distance, surface, city or date. Every
            selection remains shareable in the page address.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!IS_RUNRECS_SITE ? <a href="/races/places" className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg hover:border-border-strong">Browse by location</a> : null}
          {filters.sport === "Running" ? (
            <Link
              to={IS_RUNRECS_SITE ? "/race-series" : "/running/race-series"}
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
              {page > 1 ? (
                <Link from={Route.fullPath} to="." rel="prev" aria-label="Previous page"
                  search={{ ...routeSearch, page: page > 2 ? page - 1 : undefined }}
                  className="inline-flex min-h-10 items-center rounded-lg border border-border bg-surface px-4 text-sm font-medium text-fg">
                  Previous
                </Link>
              ) : <span />}
              <span className="text-sm text-subtle">Page {page}</span>
              {hasNextPage && page < MAX_RACE_DIRECTORY_PAGE ? (
                <Link from={Route.fullPath} to="." rel="next" aria-label="Next page"
                  search={{ ...routeSearch, page: page + 1 }}
                  className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg">
                  Next
                </Link>
              ) : <span />}
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}
