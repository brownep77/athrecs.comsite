import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCalendarEditions } from "@/lib/athrecs/api";
import { SITE_NAME } from "@/lib/athrecs/seo";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type { EntryStatus, RaceGroupInfo } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import { NationBadge } from "@/components/flags/NationFlag";
import { RaceGroupBadges } from "@/components/races/RaceGroupBadges";
import { TravelFacts } from "@/components/races/TravelFacts";
import { sanitizeDistances, splitDistanceLabels } from "@/lib/athrecs/filters";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import type { VenueDetails } from "@/data/venue-details";
import {
  EMPTY_SEARCH,
  EventSearch,
  isEmptySearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

type CardModel = {
  id: string;
  event_slug: string;
  event_name: string;
  event_date: string;
  distance_code: string;
  status: EntryStatus;
  start_time: string | null;
  sport: string;
  surface?: string;
  venue: VenueDetails;
  country?: string;
  county?: string;
  groups?: RaceGroupInfo[];
};

const FLAG_EXAMPLES: CardModel[] = [
  {
    id: "ex-britain",
    event_slug: "great-north-run",
    event_name: "AJ Bell Great North Run",
    event_date: "2026-09-13",
    distance_code: "Half",
    status: "Open",
    start_time: "10:40",
    sport: "Running",
    venue: {
      nation: "England",
      address: "Newcastle Quayside, Newcastle upon Tyne, NE1",
      parking: "Town Moor / Quayside public car parks — confirm race-day closures",
      busStop: "Central Station / Quayside buses — check Nexus",
      trainStation: "Newcastle station (0.8 km, NCL)",
    },
  },
  {
    id: "ex-ireland",
    event_slug: "dublin-marathon",
    event_name: "Dublin Marathon",
    event_date: "2026-10-25",
    distance_code: "Marathon",
    status: "Open",
    start_time: "09:00",
    sport: "Running",
    venue: {
      nation: "Ireland",
      address: "Fitzwilliam Square / Leeson Street Lower, Dublin 2",
      parking: "City-centre car parks — expect closures on race morning",
      busStop: "Dublin Bus / Luas to St Stephen’s Green",
      trainStation: "Dublin Pearse / Connolly",
    },
  },
  {
    id: "ex-france",
    event_slug: "medoc-marathon",
    event_name: "Médoc Marathon",
    event_date: "2026-09-05",
    distance_code: "Marathon",
    status: "Open",
    start_time: "09:30",
    sport: "Running",
    venue: {
      nation: "France",
      address: "Pauillac, Médoc, Gironde, France",
      parking: "Pauillac town and château parking — confirm race instructions",
      busStop: "Local buses to Pauillac — check TransGironde",
      trainStation: "Pauillac station",
    },
  },
];

const HIGHLIGHTED_RACE_QUERIES = ["Comrades", "Two Oceans", "Boston Marathon"] as const;

export const Route = createFileRoute("/calendar")({
  loader: async () => {
    const [initial, ...highlightSets] = await Promise.all([
      listCalendarEditions({ data: { upcomingOnly: true, limit: 24 } }),
      ...HIGHLIGHTED_RACE_QUERIES.map((q) =>
        listCalendarEditions({ data: { q, upcomingOnly: true, limit: 8 } }),
      ),
    ]);
    const highlighted = highlightSets
      .flat()
      .filter(
        (edition, index, editions) =>
          editions.findIndex((candidate) => candidate.id === edition.id) === index,
      )
      .sort(
        (left, right) =>
          left.event_date.localeCompare(right.event_date) ||
          left.event_name.localeCompare(right.event_name),
      );
    return { initial, highlighted };
  },
  component: CalendarPage,
});

function CalendarPage() {
  const { initial, highlighted } = Route.useLoaderData();
  const [filters, setFilters] = useState<EventSearchValues>(EMPTY_SEARCH);
  const [mobileOpen, setMobileOpen] = useState(false);
  const empty = isEmptySearch(filters);
  const { data = initial, isFetching } = useQuery({
    queryKey: ["calendar", filters],
    queryFn: () =>
      listCalendarEditions({
        data: {
          ...searchToApi(filters),
          upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
          limit: 40,
        },
      }),
    initialData: empty ? initial : undefined,
    staleTime: 30_000,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">Calendar</h1>
          <p className="max-w-2xl text-sm text-muted">
            Use the country, area or region, distance and surface dropdowns, then narrow by city,
            postcode or date.
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

      {highlighted.length > 0 ? (
        <section
          aria-labelledby="recently-added-races-heading"
          className="space-y-3 rounded-xl border border-accent/40 bg-surface p-4 shadow-card"
        >
          <div className="space-y-1">
            <h2
              id="recently-added-races-heading"
              className="font-display text-lg font-semibold text-fg"
            >
              Recently added international races
            </h2>
            <p className="text-sm text-muted">
              Comrades, Two Oceans and Boston are now in the {SITE_NAME} calendar with their latest
              official dates and qualification guidance.
            </p>
          </div>
          <div className="grid gap-2 lg:grid-cols-2">
            {highlighted.map((ed) => (
              <EventCard
                key={`highlight-${ed.id}`}
                ed={{
                  id: String(ed.id),
                  event_slug: ed.event_slug,
                  event_name: ed.event_name,
                  event_date: ed.event_date,
                  distance_code: ed.distance_code,
                  status: ed.status as EntryStatus,
                  start_time: ed.start_time,
                  sport: ed.sport,
                  surface: ed.surface,
                  venue: ed.venue,
                  country: ed.country,
                  county: ed.county,
                  groups: ed.groups,
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-xl border border-border bg-elevated p-3 lg:col-span-2">
        <div>
          <p className="font-display text-lg font-semibold text-fg">Flag & travel preview</p>
          <p className="text-sm text-muted">
            Union Jack for the United Kingdom, Irish tricolour for Ireland, and the correct national
            flag for every other country.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NationBadge kind="UnitedKingdom" />
          <NationBadge kind="Ireland" />
          <NationBadge nation="France" />
          <NationBadge kind="World" />
        </div>
        <div className="grid gap-2">
          {FLAG_EXAMPLES.map((ed) => (
            <EventCard key={ed.id} ed={ed} />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,300px)_1fr] lg:items-start">
        <div
          className={
            mobileOpen
              ? "block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
              : "hidden lg:block lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto"
          }
        >
          <EventSearch value={filters} onChange={setFilters} variant="sidebar" />
        </div>

        <div className="min-w-0 space-y-3">
          <p className="text-sm text-subtle">
            {isFetching ? "Loading…" : `${data.length} upcoming race days shown`}
          </p>

          <div className="grid gap-2">
            {data.map((ed) => (
              <EventCard
                key={ed.id}
                ed={{
                  id: String(ed.id),
                  event_slug: ed.event_slug,
                  event_name: ed.event_name,
                  event_date: ed.event_date,
                  distance_code: ed.distance_code,
                  status: ed.status as EntryStatus,
                  start_time: ed.start_time,
                  sport: ed.sport,
                  surface: ed.surface,
                  venue: ed.venue,
                  country: ed.country,
                  county: ed.county,
                  groups: ed.groups,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventCard({ ed }: { ed: CardModel }) {
  const st = effectiveStatus(ed.event_date, ed.status);
  const start = formatStartTime(ed.start_time, {
    country: ed.country,
    county: ed.county,
    nation: ed.venue.nation,
    date: ed.event_date,
  });
  const venue = ed.venue;
  const nation = venue.nation;
  const distances = sanitizeDistances(ed.event_name, splitDistanceLabels(ed.distance_code));

  return (
    <Link
      to="/races/$slug"
      params={{ slug: ed.event_slug }}
      className="block rounded-xl border border-border bg-surface p-3.5 no-underline shadow-card hover:border-border-strong"
    >
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <NationBadge nation={nation} />
          <Badge variant="accent">{ed.sport}</Badge>
          {ed.surface ? <Badge variant="outline">{ed.surface}</Badge> : null}
          {distances.map((code) => (
            <Badge key={code} variant="outline">
              {formatDistanceWithUnits(code)}
            </Badge>
          ))}
          <RaceGroupBadges groups={ed.groups ?? []} />
          <Badge variant={st === "Finished" ? "default" : "solid"}>{statusLabel(st)}</Badge>
        </div>
        <p className="font-display text-base font-semibold leading-snug text-fg">{ed.event_name}</p>
        <p className="text-sm font-medium text-fg">
          {formatRaceDateShort(ed.event_date)}
          {start ? (
            <span className="text-accent"> · Starts {start}</span>
          ) : (
            <span className="text-subtle"> · Start time TBC</span>
          )}
        </p>
        <TravelFacts venue={venue} startTime={start} />
      </div>
    </Link>
  );
}
