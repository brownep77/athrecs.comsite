import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  Flag,
  Info,
  ListChecks,
  MapPin,
  Medal,
  Route as RouteIcon,
} from "lucide-react";
import { getEditionResults, getEventBySlug } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatDuration,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type { EntryStatus, EventListItem } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NationBadge } from "@/components/flags/NationFlag";
import { TravelFacts } from "@/components/races/TravelFacts";
import { RaceCard } from "@/components/races/RaceCard";
import {
  RaceGroupBadges,
  RaceGroupDetails,
} from "@/components/races/RaceGroupBadges";
import { venueForEvent } from "@/lib/athrecs/venue";
import { sanitizeDistances } from "@/lib/athrecs/filters";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { resolveCountry, displayCountryName } from "@/lib/athrecs/countries";
import { timeZoneAbbr, timeZoneForPlace } from "@/lib/athrecs/timezone";
import { buildRaceBriefing, sportLabel } from "@/lib/athrecs/race-briefing";

type EditionRow = {
  id: number;
  event_date: string;
  distance_code: string;
  distance_km: number;
  status: string;
  entry_url: string | null;
  start_time: string | null;
  notes?: string | null;
  result_count: number;
};

export const Route = createFileRoute("/races/$slug")({
  loader: async ({ params }) => {
    const data = await getEventBySlug({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const name = loaderData?.event.name ?? "Event";
    const city = loaderData?.event.city;
    const title = city ? `${name} — ${city} | ATHRECS` : `${name} | ATHRECS`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `ATHRECS event page for ${name}: date, local start, venue, distances and past races. Confirm entry on the official site.`,
        },
      ],
    };
  },
  component: RacePage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="font-display text-xl font-semibold">Event not found</h1>
      <Button asChild variant="secondary">
        <Link to="/races">Back to events</Link>
      </Button>
    </div>
  ),
});

function RacePage() {
  return <RacePageContent data={Route.useLoaderData()} />;
}

export function RacePageContent({
  data,
  localized,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  localized?: { language: string; country: string };
}) {
  const { event, groups, distances, upcoming, past, related } = data;
  const shownDistances = sanitizeDistances(event.name, distances);
  const country = resolveCountry({
    slug: event.slug,
    name: event.name,
    country: event.country,
    county: event.county,
    city: event.city,
    area: event.area,
  });
  const venue = venueForEvent({
    slug: event.slug,
    name: event.name,
    city: event.city,
    county: event.county,
    country: event.country,
    area: event.area,
  });
  const next = upcoming[0];
  const place = {
    country: event.country,
    county: event.county,
    date: next?.event_date,
  };
  const nextStart = formatStartTime(next?.start_time, place);
  const zone = timeZoneForPlace({
    country: event.country,
    county: event.county,
  });
  const zoneAbbr = next?.event_date ? timeZoneAbbr(zone, next.event_date) : timeZoneAbbr(zone);
  const briefing = useMemo(
    () =>
      buildRaceBriefing({
        name: event.name,
        sport: event.sport,
        slug: event.slug,
        city: event.city,
        country: displayCountryName(country),
        surface: event.surface,
        organiser: event.organiser,
        website: event.website,
        nextDate: next ? formatRaceDateShort(next.event_date) : null,
      }),
    [event, country, next],
  );
  const [resultsEditionId, setResultsEditionId] = useState<number | null>(null);
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["edition-results", resultsEditionId],
    queryFn: () => getEditionResults({ data: resultsEditionId! }),
    enabled: resultsEditionId != null,
  });

  const nextStatus = next ? effectiveStatus(next.event_date, next.status as EntryStatus) : null;
  const pastWithResults = past.filter((ed) => ed.result_count > 0);
  const upcomingPreview = event.sport === "Parkrun" ? upcoming.slice(0, 6) : upcoming.slice(0, 12);
  const upcomingHidden = upcoming.length - upcomingPreview.length;
  const pastPreview = past.slice(0, 12);
  const pastHidden = past.length - pastPreview.length;

  return (
    <div className="space-y-8 pb-10">
      {localized ? (
        <Link
          to="/$language/$country/races"
          params={localized}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Events
        </Link>
      ) : (
        <Link
          to="/races"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Events
        </Link>
      )}

      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-primary" />
        <div className="space-y-5 p-5 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <NationBadge info={country} />
            <Badge variant="accent">{sportLabel(event.sport)}</Badge>
            {event.surface && event.surface !== "Other" && (
              <Badge variant="outline">{event.surface}</Badge>
            )}
            {shownDistances.map((d) => (
              <Badge key={d} variant="outline">
                {formatDistanceWithUnits(d)}
              </Badge>
            ))}
            <RaceGroupBadges groups={groups} />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0 space-y-3">
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
                {event.name}
              </h1>
              <p className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <span>
                  {[event.area, event.city, event.county, displayCountryName(country)]
                    .map((part) => part?.trim())
                    .filter((part): part is string => Boolean(part))
                    .filter((part, i, arr) => {
                      const key = part.toLowerCase();
                      if (arr.findIndex((p) => p.toLowerCase() === key) !== i) return false;
                      if (
                        key === "united kingdom" &&
                        arr.some((p) => /^(england|scotland|wales|northern ireland)$/i.test(p))
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .join(" · ")}
                </span>
              </p>
            </div>
            {next ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-left lg:min-w-44 lg:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  Next start
                </p>
                <p className="font-display text-xl font-semibold text-fg">
                  {formatRaceDateShort(next.event_date)}
                </p>
                <p className="text-sm font-medium text-muted">
                  {nextStart ?? (zoneAbbr ? `Time TBC · ${zoneAbbr}` : "Time TBC")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-muted">
                No future date listed
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {event.website && (
              <Button asChild>
                <a href={event.website} target="_blank" rel="noreferrer">
                  Official page
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {next?.entry_url && nextStatus !== "Finished" && (
              <Button asChild variant="secondary">
                <a href={next.entry_url} target="_blank" rel="noreferrer">
                  Entry
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link to="/calendar">
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <RaceGroupDetails groups={groups} />

      <section aria-labelledby="key-facts-heading">
        <h2 id="key-facts-heading" className="mb-3 font-display text-lg font-semibold text-fg">
          Key facts
        </h2>
        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          <Fact
            label="Date"
            value={next ? formatRaceDateShort(next.event_date) : "No future date"}
          />
          <Fact
            label="Local start"
            value={nextStart ?? "Confirm officially"}
            hint={zoneAbbr ? `Venue zone ${zoneAbbr}` : undefined}
          />
          <Fact label="Country" value={displayCountryName(country)} />
          <Fact label="City" value={event.city || "TBC"} />
          <Fact
            label="Distances"
            value={
              shownDistances.length
                ? shownDistances.map((d) => formatDistanceWithUnits(d)).join(" · ")
                : "See official timetable"
            }
          />
          <Fact label="Surface" value={event.surface || "TBC"} />
          <Fact label="Sport" value={sportLabel(event.sport)} />
          <Fact label="Organiser" value={event.organiser || "See official page"} />
          <Fact label="Entry" value={nextStatus ? statusLabel(nextStatus) : "See official page"} />
          <Fact label="Listed from" value={briefing.source.label} />
          <Fact label="Past races on ATHRECS" value={String(past.length)} />
          <Fact
            label="Results held"
            value={
              pastWithResults.length
                ? `${pastWithResults.length} edition${pastWithResults.length === 1 ? "" : "s"}`
                : "None yet"
            }
          />
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card lg:col-span-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-semibold text-fg">Athlete briefing</h2>
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-fg">{briefing.lede}</p>
          <p className="max-w-prose text-sm leading-relaxed text-muted">{briefing.what}</p>
          <p className="max-w-prose text-sm leading-relaxed text-muted">{briefing.confirm}</p>
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card lg:col-span-2">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-semibold text-fg">Before you go</h2>
          </div>
          <ul className="space-y-2">
            {briefing.checklist.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-2">
          <RouteIcon className="h-4 w-4 text-accent" />
          <h2 className="font-display text-lg font-semibold text-fg">Venue and travel</h2>
        </div>
        <TravelFacts venue={venue} startTime={nextStart} />
        <p className="text-xs text-subtle">
          Times are local to the venue ({zoneAbbr || zone}). Parking and transit are ATHRECS
          estimates unless a postcode lookup is stored — confirm on the official page.
        </p>
      </section>

      <EditionList
        title={
          event.sport === "Parkrun"
            ? "Upcoming — weekly through 25 December 2027"
            : "Upcoming races"
        }
        items={upcomingPreview}
        hidden={upcomingHidden}
        country={event.country}
        county={event.county}
      />

      <EditionList
        title="Past races"
        items={pastPreview}
        hidden={pastHidden}
        onResults={(id) => {
          setResultsEditionId(id);
          requestAnimationFrame(() => {
            document
              .getElementById("edition-results")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
        country={event.country}
        county={event.county}
      />

      {resultsEditionId != null && (
        <section id="edition-results" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Medal className="h-4 w-4 text-accent" />
              <h2 className="font-display text-lg font-semibold text-fg">Results</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setResultsEditionId(null)}>
              Close
            </Button>
          </div>
          {isFetching ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : results.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
              No ATHRECS results for this edition yet.
            </p>
          ) : (
            <>
              <p className="text-xs text-subtle">
                Ranked here by finish time only. Official places, DQ notes and age-grades live on
                the timer site.
              </p>
              <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-card">
                <table className="w-full min-w-[28rem] text-left text-sm">
                  <thead className="border-b border-border bg-elevated/60 text-[11px] uppercase tracking-wider text-subtle">
                    <tr>
                      <th className="px-3 py-2.5">Pos</th>
                      <th className="px-3 py-2.5">Athlete</th>
                      <th className="px-3 py-2.5">Club</th>
                      <th className="px-3 py-2.5">Cat</th>
                      <th className="px-3 py-2.5">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => (
                      <tr key={r.id} className="border-b border-border/70 last:border-0">
                        <td className="px-3 py-2.5 tabular text-muted">
                          {r.finish_time_seconds != null ? i + 1 : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          <Link
                            to="/athletes/$slug"
                            params={{ slug: r.athlete_slug }}
                            className="font-medium text-fg no-underline hover:text-accent"
                          >
                            {r.athlete_name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5 text-muted">{r.club ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted">{r.category ?? "—"}</td>
                        <td className="px-3 py-2.5 font-medium tabular">
                          {formatDuration(r.finish_time_seconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      {related.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-semibold text-fg">
              More {sportLabel(event.sport).toLowerCase()} nearby
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {related.map((race: EventListItem) => (
              <RaceCard key={race.slug} race={race} localized={localized} />
            ))}
          </div>
        </section>
      )}

      <aside className="rounded-xl border border-dashed border-border px-4 py-4 text-xs leading-relaxed text-subtle">
        This page is an ATHRECS briefing written from public listing facts (name, date, venue,
        sport, distances). We do not copy official athlete guides, course maps, start lists or
        marketing copy. parkrun, World Athletics, World Triathlon and other names are trademarks of
        their owners. Always confirm entry, rules and the course on the official page
        {briefing.source.url ? (
          <>
            {" "}
            (
            <a
              href={briefing.source.url}
              className="text-muted underline"
              target="_blank"
              rel="noreferrer"
            >
              {briefing.source.label}
            </a>
            )
          </>
        ) : (
          "."
        )}
      </aside>
    </div>
  );
}

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-surface px-4 py-3">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-fg">{value}</dd>
      {hint ? <p className="mt-0.5 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}

function EditionList({
  title,
  items,
  hidden = 0,
  onResults,
  country,
  county,
}: {
  title: string;
  items: EditionRow[];
  hidden?: number;
  onResults?: (id: number) => void;
  country?: string;
  county?: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          None listed yet.
        </p>
      ) : (
        <div className="grid gap-2">
          {items.map((ed) => {
            const st = effectiveStatus(ed.event_date, ed.status as EntryStatus);
            const start = formatStartTime(ed.start_time, {
              country,
              county,
              date: ed.event_date,
            });
            return (
              <div
                key={`${ed.id}-${ed.event_date}`}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="accent">
                      {formatDistanceWithUnits(ed.distance_code, ed.distance_km)}
                    </Badge>
                    <Badge variant={st === "Finished" ? "default" : "solid"}>
                      {statusLabel(st)}
                    </Badge>
                    {ed.result_count > 0 && <Badge variant="outline">Results</Badge>}
                  </div>
                  <p className="text-sm font-semibold text-fg">
                    {formatRaceDateShort(ed.event_date)}
                    {start ? (
                      <span className="ml-2 font-medium text-muted">
                        <Clock3 className="mr-1 inline h-3.5 w-3.5" />
                        {start}
                      </span>
                    ) : null}
                  </p>
                  {ed.notes ? <p className="text-xs text-subtle">{ed.notes}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ed.result_count > 0 && onResults && (
                    <button
                      type="button"
                      onClick={() => onResults(ed.id)}
                      className="inline-flex h-11 min-w-11 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium"
                    >
                      View results
                    </button>
                  )}
                  {ed.entry_url && st !== "Finished" && (
                    <a
                      href={ed.entry_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium text-fg no-underline"
                    >
                      Official
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          {hidden > 0 ? (
            <p className="px-1 text-xs text-subtle">
              {hidden} more date{hidden === 1 ? "" : "s"} on the listing — open the official page
              for the full timetable.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
