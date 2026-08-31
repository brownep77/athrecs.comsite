import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, MapPin } from "lucide-react";
import { listCalendarEditions } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import type { EntryStatus } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import {
  EMPTY_SEARCH,
  EventSearch,
  isEmptySearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

export const Route = createFileRoute("/calendar")({
  loader: () =>
    listCalendarEditions({
      data: { sport: "Athletics", upcomingOnly: true, limit: 40 },
    }),
  component: AthleticsCalendarPage,
});

type AthleticsCalendarEdition = {
  id: number;
  event_date: string;
  status: string;
  start_time: string | null;
  event_slug: string;
  event_name: string;
  sport: string;
  city: string;
  county: string;
  country: string;
  distance_code: string;
  surface: string;
};

function AthleticsCalendarPage() {
  // The generated route tree retains the base calendar loader shape during
  // standalone type-checking; Vite supplies the Athletics array loader.
  const initial = Route.useLoaderData() as unknown as AthleticsCalendarEdition[];
  const [filters, setFilters] = useState<EventSearchValues>(EMPTY_SEARCH);
  const [mobileOpen, setMobileOpen] = useState(false);
  const empty = isEmptySearch(filters);
  const { data = initial, isFetching } = useQuery<AthleticsCalendarEdition[]>({
    queryKey: ["athletics-calendar", filters],
    queryFn: async () =>
      (await listCalendarEditions({
        data: {
          ...searchToApi(filters),
          sport: "Athletics",
          upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
          limit: 60,
        },
      })) as AthleticsCalendarEdition[],
    initialData: empty ? initial : undefined,
    staleTime: 30_000,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-5 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Athletics only
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Athletics calendar
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Search track and field meetings, cross-country fixtures, road athletics and
            championships by place, date, surface or distance.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
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
            onChange={setFilters}
            onDone={() => setMobileOpen(false)}
            variant="sidebar"
          />
        </div>

        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-subtle" aria-live="polite">
              {isFetching
                ? "Loading athletics fixtures…"
                : `${data.length} athletics competition days shown`}
            </p>
            <Link
              to="/races"
              className="text-sm font-semibold text-accent no-underline hover:underline"
            >
              Event search →
            </Link>
          </div>

          <div className="grid gap-2">
            {data.length ? (
              data.map((edition) => <AthleticsCalendarCard key={edition.id} edition={edition} />)
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-12 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-subtle" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-fg">No athletics events match.</p>
                <p className="mt-1 text-xs text-muted">
                  Widen the date or location filters to see more fixtures.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function AthleticsCalendarCard({ edition }: { edition: AthleticsCalendarEdition }) {
  const status = effectiveStatus(edition.event_date, edition.status as EntryStatus);
  const location = [edition.city, edition.county, edition.country].filter(Boolean).join(", ");

  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center">
        <div>
          <time className="text-sm font-semibold text-accent" dateTime={edition.event_date}>
            {formatRaceDateShort(edition.event_date)}
          </time>
          <p className="mt-1 text-xs text-subtle">
            {edition.start_time ? formatStartTime(edition.start_time) : "Time TBC"}
          </p>
        </div>

        <div className="min-w-0">
          <Link
            to="/races/$slug"
            params={{ slug: edition.event_slug }}
            className="font-semibold text-fg no-underline hover:text-accent"
          >
            {edition.event_name}
          </Link>
          <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{location || "Venue TBC"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant="outline">{formatDistanceWithUnits(edition.distance_code)}</Badge>
          {edition.surface ? <Badge variant="secondary">{edition.surface}</Badge> : null}
          <Badge variant={status === "Open" ? "default" : "outline"}>{statusLabel(status)}</Badge>
        </div>
      </div>
    </article>
  );
}
