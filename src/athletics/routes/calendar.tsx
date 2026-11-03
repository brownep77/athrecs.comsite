import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { useState } from "react";
import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  filtersFromSearch,
  parseFixtureDirectorySearch,
  searchFromFilters,
} from "@/components/races/fixture-directory-search";
import { directoryStructuredData } from "@/lib/athrecs/directory-structured-data";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import {
  listAthleticsCalendarPage,
  type AthleticsCalendarItem,
  type AthleticsCalendarPage,
} from "../api";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import { DistanceBadge, SportBadge } from "@/components/races/EventBadges";
import { splitDistanceLabels } from "@/lib/athrecs/filters";
import { sportDisplayLabel } from "@/lib/athrecs/event-colours";
import type { EntryStatus } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import {
  EventSearch,
  isEmptySearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

const PAGE_SIZE = 40;
const MAX_CALENDAR_PAGE = 2501;

export const Route = createFileRoute("/calendar")({
  validateSearch: (search: Record<string, unknown>) =>
    parseFixtureDirectorySearch(search, MAX_CALENDAR_PAGE + 1),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const page = deps.page ?? 1;
    if (page > MAX_CALENDAR_PAGE) throw notFound();
    const filters = filtersFromSearch(deps);
    const data = await listAthleticsCalendarPage({
      data: {
        ...searchToApi(filters),
        upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      },
    });
    if (page > 1 && !data.items.length) throw notFound();
    return data;
  },
  head: ({ match, loaderData }) => {
    const data = loaderData as unknown as AthleticsCalendarPage | undefined;
    const page = match.search.page ?? 1;
    const filtered = !isEmptySearch(filtersFromSearch(match.search));
    const url = SITE_URL + "/calendar" + (!filtered && page > 1 ? `?page=${page}` : "");
    const title =
      "Athletics calendar | Track, field and cross-country fixtures" +
      (page > 1 ? ` · Page ${page}` : "");
    return {
      meta: siteGraphMeta({
        title,
        description:
          "Browse athletics fixtures by date, location and discipline. Find track and field meetings, cross-country championships and road athletics events.",
        url,
        indexable: !filtered && Boolean(data?.items.length),
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: filtered
        ? []
        : directoryStructuredData(
            url,
            "Athletics fixtures calendar",
            (data?.items ?? []).map((item) => ({
              name: item.event_name,
              path: "/races/" + encodeURIComponent(item.event_slug),
            })),
          ),
    };
  },
  component: AthleticsCalendarPage,
});

function AthleticsCalendarPage() {
  const data = Route.useLoaderData() as unknown as AthleticsCalendarPage;
  const search = Route.useSearch();
  const page = search.page ?? 1;
  const navigate = useNavigate({ from: Route.fullPath });
  const filters = filtersFromSearch(search);
  const [mobileOpen, setMobileOpen] = useState(false);
  const empty = isEmptySearch(filters);
  const sportLabel = sportDisplayLabel(filters.sport);
  const isFetching = useRouterState({ select: (state) => state.isLoading });
  const firstShown = data.total ? data.offset + 1 : 0;
  const lastShown = Math.min(data.offset + data.items.length, data.total);
  const hasPrevious = data.offset > 0;
  const hasNext = data.offset + data.items.length < data.total;

  const updateFilters = (next: EventSearchValues) => {
    void navigate({
      to: "/calendar",
      search: searchFromFilters(next),
      replace: true,
      resetScroll: false,
    });
  };

  return (
    <div className="space-y-5 pb-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Athletics, running, parkrun, cycling, swimming, triathlon and duathlon
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg">
            {sportLabel} calendar
          </h1>
          <p className="max-w-2xl text-sm text-muted">
            Search track and field meetings, cross-country fixtures, road athletics and
            championships by place, date, surface or distance. Select Running, parkrun, Triathlon or
            Cycling to explore those fixtures.
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

      <a
        href="/sports/track-and-field#diamond-league"
        className="block rounded-xl border border-accent/25 bg-accent-soft p-4 text-sm font-semibold text-accent no-underline hover:underline"
      >
        Diamond League 2027 · All 15 meetings and TV coverage by country →
      </a>

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

        <section className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-subtle" aria-live="polite">
              {isFetching
                ? `Loading ${sportLabel.toLowerCase()} fixtures…`
                : `Showing ${firstShown.toLocaleString()}–${lastShown.toLocaleString()} of ${data.total.toLocaleString()} ${sportLabel.toLowerCase()} competition days`}
            </p>
            <Link
              to="/races"
              className="text-sm font-semibold text-accent no-underline hover:underline"
            >
              Event search →
            </Link>
          </div>

          <div className="grid gap-2">
            {data.items.length ? (
              data.items.map((edition) => (
                <AthleticsCalendarCard
                  key={`${edition.id}-${edition.event_date}`}
                  edition={edition}
                />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-12 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-subtle" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-fg">
                  No {sportLabel.toLowerCase()} events match.
                </p>
                <p className="mt-1 text-xs text-muted">
                  Widen the date or location filters to see more fixtures.
                </p>
              </div>
            )}
          </div>

          {data.total > PAGE_SIZE ? (
            <nav
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
              aria-label={`${sportLabel} calendar pages`}
            >
              {hasPrevious && (
                <Link
                  to="/calendar"
                  rel="prev"
                  search={{ ...search, page: page === 2 ? undefined : page - 1 }}
                  className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Previous
                </Link>
              )}
              <p className="text-sm text-muted">
                Page {(data.offset / data.limit + 1).toLocaleString()} of{" "}
                {Math.ceil(data.total / data.limit).toLocaleString()}
              </p>
              {hasNext && page < MAX_CALENDAR_PAGE && (
                <Link
                  to="/calendar"
                  rel="next"
                  search={{ ...search, page: page + 1 }}
                  className="inline-flex h-10 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function AthleticsCalendarCard({ edition }: { edition: AthleticsCalendarItem }) {
  const status = effectiveStatus(edition.event_date, edition.status as EntryStatus);
  const location = [
    ...new Set([edition.city, edition.county, edition.country].filter(Boolean)),
  ].join(", ");
  const distances = splitDistanceLabels(edition.distance_code);
  const spectatorLabel = spectatorAccessLabel(edition.spectator_access_type);

  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="grid gap-3 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center">
        <div>
          <time className="text-sm font-semibold text-accent" dateTime={edition.event_date}>
            {formatRaceDateShort(edition.event_date)}
          </time>
          <p className="mt-1 text-xs text-subtle">
            {edition.start_label ??
              (edition.start_time ? formatStartTime(edition.start_time) : "Time not yet verified")}
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
          {edition.competition_label ? (
            <Badge variant={edition.competition_label === "Diamond League" ? "default" : "outline"}>
              {edition.competition_label}
            </Badge>
          ) : edition.featured ? (
            <Badge variant="default">Major meeting</Badge>
          ) : null}
          <SportBadge sport={edition.sport} />
          {distances.map((distance) => (
            <DistanceBadge
              key={distance}
              distance={distance}
              label={
                edition.surface === "Track" && /^(?:Other|Track & field)$/i.test(distance)
                  ? "Track & field"
                  : undefined
              }
            />
          ))}
          {edition.surface ? <Badge variant="secondary">{edition.surface}</Badge> : null}
          {spectatorLabel ? (
            <Badge variant={edition.spectator_access_type === "free" ? "accent" : "outline"}>
              {spectatorLabel}
            </Badge>
          ) : null}
          <Badge variant={status === "Open" ? "default" : "outline"}>{statusLabel(status)}</Badge>
        </div>
      </div>
    </article>
  );
}

function spectatorAccessLabel(
  accessType: AthleticsCalendarItem["spectator_access_type"],
): string | null {
  switch (accessType) {
    case "free":
      return "Free to watch";
    case "ticketed":
      return "Tickets available";
    case "free_and_ticketed":
      return "Free areas + tickets";
    case "registration_required":
      return "Spectator registration";
    case "sold_out":
      return "Spectator tickets sold out";
    default:
      return null;
  }
}
