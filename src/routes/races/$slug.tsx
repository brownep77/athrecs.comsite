import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { getEditionResults, getEventBySlug } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatDuration,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type { EntryStatus } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NationBadge } from "@/components/flags/NationFlag";
import { TravelFacts } from "@/components/races/TravelFacts";
import { venueForEvent } from "@/lib/athrecs/venue";
import { sanitizeDistances } from "@/lib/athrecs/filters";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";

export const Route = createFileRoute("/races/$slug")({
  loader: async ({ params }) => {
    const data = await getEventBySlug({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  component: RacePage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Race not found</h1>
      <Button asChild variant="secondary">
        <Link to="/races">Back to races</Link>
      </Button>
    </div>
  ),
});

function RacePage() {
  const { event, distances, upcoming, past } = Route.useLoaderData();
  const shownDistances = sanitizeDistances(event.name, distances);
  const venue = venueForEvent({
    slug: event.slug,
    name: event.name,
    city: event.city,
    county: event.county,
    country: event.country,
    area: event.area,
  });
  const nextStart = formatStartTime(upcoming[0]?.start_time, {
    country: event.country,
    county: event.county,
    date: upcoming[0]?.event_date,
  });
  const [resultsEditionId, setResultsEditionId] = useState<number | null>(null);
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["edition-results", resultsEditionId],
    queryFn: () => getEditionResults({ data: resultsEditionId! }),
    enabled: resultsEditionId != null,
  });

  return (
    <div className="space-y-8">
      <Link
        to="/races"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Races
      </Link>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <div className="flex flex-wrap gap-1.5">
          <NationBadge nation={venue.nation} />
          <Badge variant="accent">{event.sport}</Badge>
          <Badge variant="outline">{event.surface}</Badge>
          <Badge variant="outline">{event.county}</Badge>
          {shownDistances.map((d) => (
            <Badge key={d} variant="outline">
              {formatDistanceWithUnits(d)}
            </Badge>
          ))}
        </div>
        <h1 className="font-display text-2xl font-semibold text-fg">{event.name}</h1>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 text-subtle" />
          {[event.city, event.area, event.county].filter(Boolean).join(" · ")}
        </p>
        <TravelFacts venue={venue} startTime={nextStart} />
        {event.summary && (
          <p className="max-w-prose text-sm text-muted">{event.summary}</p>
        )}
        {event.description && event.description !== event.summary && (
          <p className="max-w-prose text-sm text-muted">{event.description}</p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {event.website && (
            <Button asChild variant="secondary" size="sm">
              <a href={event.website} target="_blank" rel="noreferrer">
                Official site
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
          {event.organiser && (
            <span className="text-xs text-subtle self-center">
              Organiser: {event.organiser}
            </span>
          )}
        </div>
      </section>

      <EditionList
        title={
          event.sport === "Parkrun"
            ? "Upcoming — every week through 25 December 2027"
            : "Upcoming"
        }
        items={upcoming}
        country={event.country}
        county={event.county}
      />
      <EditionList
        title="Past editions"
        items={past}
        onResults={(id) => setResultsEditionId(id)}
        country={event.country}
        county={event.county}
      />

      {resultsEditionId != null && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-fg">Results</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResultsEditionId(null)}
            >
              Close
            </Button>
          </div>
          {isFetching ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted">No results for this edition.</p>
          ) : (
            <>
            <p className="mb-2 text-xs text-subtle">
              Ranked by finish time only. Confirm full results on the official timer site.
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
    </div>
  );
}

function EditionList({
  title,
  items,
  onResults,
  country,
  county,
}: {
  title: string;
  items: Array<{
    id: number;
    event_date: string;
    distance_code: string;
    distance_km: number;
    status: string;
    entry_url: string | null;
    start_time: string | null;
    result_count: number;
  }>;
  onResults?: (id: number) => void;
  country?: string;
  county?: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          None listed.
        </p>
      ) : (
        <div className="grid gap-2">
          {items.map((ed) => {
            const st = effectiveStatus(
              ed.event_date,
              ed.status as EntryStatus,
            );
            const start = formatStartTime(ed.start_time, {
              country,
              county,
              date: ed.event_date,
            });
            return (
              <div
                key={ed.id}
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
                    {ed.result_count > 0 && (
                      <Badge variant="outline">Results</Badge>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-fg">
                    {formatRaceDateShort(ed.event_date)}
                    {start ? (
                      <span className="ml-2 font-medium text-muted">· {start}</span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ed.result_count > 0 && onResults && (
                    <button
                      type="button"
                      onClick={() => onResults(ed.id)}
                      className="inline-flex h-9 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium"
                    >
                      View results
                    </button>
                  )}
                  {ed.entry_url && st !== "Finished" && (
                    <a
                      href={ed.entry_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium no-underline text-fg"
                    >
                      Enter
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
