import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
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
  ShieldCheck,
} from "lucide-react";
import { getEditionResults, getEventBySlug } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatDuration,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type {
  EditionEntryOption,
  EditionResultLink,
  EntryStatus,
  EventListItem,
} from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NationBadge } from "@/components/flags/NationFlag";
import { TravelFacts } from "@/components/races/TravelFacts";
import { RaceCard } from "@/components/races/RaceCard";
import { EntryOptions } from "@/components/races/EntryOptions";
import { RaceGroupBadges, RaceGroupDetails } from "@/components/races/RaceGroupBadges";
import { venueForEvent } from "@/lib/athrecs/venue";
import { sanitizeDistances } from "@/lib/athrecs/filters";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { resolveCountry, displayCountryName } from "@/lib/athrecs/countries";
import { timeZoneAbbr, timeZoneForPlace } from "@/lib/athrecs/timezone";
import { buildRaceBriefing, sportLabel } from "@/lib/athrecs/race-briefing";
import { raceFormatGuideFor } from "@/data/race-format-guides";
import { raceQualifications, type RaceQualification } from "@/data/race-qualifications";
import { resolveSlugRedirect } from "@/lib/athrecs/slug-redirects";
import { SITE_NAME, SITE_URL, siteGraphMeta, sportsEventJsonLd } from "@/lib/athrecs/seo";

type EditionRow = {
  id: number;
  event_date: string;
  distance_code: string;
  distance_km: number;
  status: string;
  entry_url: string | null;
  source_url: string | null;
  results_official_url: string | null;
  result_links: EditionResultLink[];
  entry_options: EditionEntryOption[];
  start_time: string | null;
  notes?: string | null;
  result_count: number;
};

export const Route = createFileRoute("/races/$slug")({
  loader: async ({ params }) => {
    const data = await getEventBySlug({ data: params.slug });
    if (data) {
      if (data.event.slug !== params.slug) {
        throw redirect({
          to: "/races/$slug",
          params: { slug: data.event.slug },
          statusCode: 301,
        });
      }
      return data;
    }

    const currentSlug = await resolveSlugRedirect({
      data: { entityType: "event", slug: params.slug },
    });
    if (currentSlug && currentSlug !== params.slug) {
      throw redirect({
        to: "/races/$slug",
        params: { slug: currentSlug },
        statusCode: 301,
      });
    }
    throw notFound();
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { event, upcoming } = loaderData;
    const canonical = `${SITE_URL}/races/${event.slug}`;
    const title = event.city
      ? `${event.name} — ${event.city} | ${SITE_NAME}`
      : `${event.name} | ${SITE_NAME}`;
    const description =
      event.summary ||
      `ATHRECS event page for ${event.name}: date, local start, venue, distances and past races. Confirm entry on the official site.`;
    const next = upcoming[0];

    return {
      meta: siteGraphMeta({
        title,
        description,
        url: canonical,
        type: "website",
      }),
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            sportsEventJsonLd({
              name: event.name,
              slug: event.slug,
              description,
              city: event.city,
              country: event.country,
              startDate: next?.event_date,
              startTime: next?.start_time,
              sport: event.sport,
              website: event.website,
            }),
          ),
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
  const qualification = raceQualifications[event.slug];
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
  const formatGuide = raceFormatGuideFor(event.slug);
  const [resultsEditionId, setResultsEditionId] = useState<number | null>(null);
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["edition-results", resultsEditionId],
    queryFn: () => getEditionResults({ data: resultsEditionId! }),
    enabled: resultsEditionId != null,
  });

  const nextStatus = next ? effectiveStatus(next.event_date, next.status as EntryStatus) : null;
  const primaryEntry =
    next?.entry_options.find((option) => option.is_primary) ??
    next?.entry_options.find((option) => option.entry_type === "official") ??
    next?.entry_options[0];
  const pastWithResults = past.filter(
    (ed) =>
      ed.result_count > 0 ||
      ed.result_links.length > 0 ||
      Boolean(ed.results_official_url?.trim()) ||
      isRunAbcUrl(ed.source_url),
  );
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
            {primaryEntry && nextStatus !== "Finished" && (
              <Button asChild variant="secondary">
                <a href={primaryEntry.entry_url} target="_blank" rel="noreferrer sponsored">
                  {primaryEntry.entry_type === "official"
                    ? "Official entry"
                    : `Enter via ${primaryEntry.provider_name}`}
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

      {qualification && <QualificationDetails qualification={qualification} />}

      <EntryOptions
        options={next?.entry_options ?? []}
        editionDate={next?.event_date}
        officialWebsite={event.website}
      />

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
            label="Results listed"
            value={
              pastWithResults.length
                ? `${pastWithResults.length} edition${pastWithResults.length === 1 ? "" : "s"}`
                : "None yet"
            }
          />
        </dl>
      </section>

      {formatGuide && (
        <section
          aria-labelledby="race-format-heading"
          className="space-y-5 rounded-xl border border-border bg-surface p-5 shadow-card md:p-6"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-accent" />
              <h2 id="race-format-heading" className="font-display text-lg font-semibold text-fg">
                {formatGuide.title}
              </h2>
            </div>
            <p className="max-w-4xl text-sm leading-relaxed text-muted">{formatGuide.overview}</p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {formatGuide.facts.map((fact) => (
              <div key={fact.label} className="rounded-lg border border-border bg-elevated p-3">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold leading-snug text-fg">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold text-fg">
              {formatGuide.stageTitle}
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="border-b border-border bg-elevated/60 text-[11px] uppercase tracking-wider text-subtle">
                  <tr>
                    <th className="px-3 py-2.5">Stage</th>
                    <th className="px-3 py-2.5">Distance</th>
                    <th className="px-3 py-2.5">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {formatGuide.stages.map((stage) => (
                    <tr key={stage.stage} className="border-b border-border/70 last:border-0">
                      <th scope="row" className="px-3 py-2.5 font-semibold text-fg">
                        {stage.stage}
                      </th>
                      <td className="px-3 py-2.5 font-medium tabular text-fg">{stage.distance}</td>
                      <td className="px-3 py-2.5 text-muted">{stage.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs leading-relaxed text-subtle">{formatGuide.stageNote}</p>
          </div>

          <div className="space-y-3">
            <h3 className="font-display text-base font-semibold text-fg">What the format means</h3>
            <ul className="grid gap-2 md:grid-cols-2">
              {formatGuide.essentials.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={formatGuide.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent no-underline hover:underline"
          >
            {formatGuide.sourceLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </section>
      )}

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

      <EditionResultsLinks
        items={pastWithResults}
        onAthrecsResults={(id) => {
          setResultsEditionId(id);
          requestAnimationFrame(() => {
            document
              .getElementById("edition-results")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }}
      />

      {resultsEditionId != null && (
        <section id="edition-results" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Medal className="h-4 w-4 text-accent" />
              <h2 className="font-display text-lg font-semibold text-fg">
                Published ATHRECS results
              </h2>
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
                Public-figure and athlete-approved results only. Other archived participant rows
                remain private and are available through the signed-in claim flow.
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
                      <th className="px-3 py-2.5">Claim</th>
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
                        <td className="px-3 py-2.5">
                          <Link
                            to="/claim-results"
                            search={{ resultId: r.id }}
                            className="inline-flex min-h-10 items-center text-xs font-medium text-accent no-underline hover:underline"
                          >
                            Claim
                          </Link>
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

function QualificationDetails({ qualification }: { qualification: RaceQualification }) {
  return (
    <section
      aria-labelledby="race-qualification-heading"
      className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <h2
            id="race-qualification-heading"
            className="font-display text-lg font-semibold text-fg"
          >
            {qualification.heading}
          </h2>
          <span className="text-xs text-subtle">Checked {qualification.checkedAt}</span>
        </div>
        <p className="max-w-4xl text-sm leading-relaxed text-muted">{qualification.summary}</p>
        {qualification.window && (
          <p className="text-sm font-medium text-fg">{qualification.window}</p>
        )}
      </div>

      <ul className="grid gap-2 md:grid-cols-3">
        {qualification.requirements.map((requirement) => (
          <li
            key={requirement}
            className="flex gap-2 rounded-lg border border-border bg-elevated p-3 text-sm leading-relaxed text-muted"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{requirement}</span>
          </li>
        ))}
      </ul>

      {qualification.tables?.map((table) => (
        <div key={table.caption} className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <caption className="bg-elevated px-3 py-2 text-left font-semibold text-fg">
              {table.caption}
            </caption>
            <thead className="border-y border-border bg-elevated/60 text-xs uppercase tracking-wide text-subtle">
              <tr>
                {table.headers.map((header) => (
                  <th key={header} className="px-3 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join("|")} className="border-b border-border/70 last:border-0">
                  {row.map((cell, index) => (
                    <td
                      key={`${index}-${cell}`}
                      className={`px-3 py-2 ${index === 0 ? "font-medium text-fg" : "tabular text-muted"}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {qualification.note && (
        <p className="rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">
          {qualification.note}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <a
          href={qualification.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-accent no-underline hover:underline"
        >
          Official qualification rules <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {qualification.additionalLinks?.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-muted no-underline hover:text-fg hover:underline"
          >
            {link.label} <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </section>
  );
}

function resultProvider(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    const labels: Record<string, string> = {
      "chiptiming.co.uk": "Chip Timing UK",
      "results.frsys.uk": "FR Systems",
      "runabc.co.uk": "runABC",
      "totalracetiming.co.uk": "Total Race Timing",
      "results.sporthive.com": "Sporthive",
      "sportmaniacs.com": "Sportmaniacs",
      "my.raceresult.com": "Race Result",
      "parkrun.org.uk": "parkrun",
    };
    return labels[host] ?? host;
  } catch {
    return "Official provider";
  }
}

function canonicalResultUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return url.trim();
  }
}

function isRunAbcUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "runabc.co.uk";
  } catch {
    return false;
  }
}

function EditionResultsLinks({
  items,
  onAthrecsResults,
}: {
  items: EditionRow[];
  onAthrecsResults: (id: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const grouped = useMemo(() => {
    const byDate = new Map<string, EditionRow[]>();
    for (const item of items) {
      const group = byDate.get(item.event_date) ?? [];
      group.push(item);
      byDate.set(item.event_date, group);
    }
    return [...byDate.entries()]
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([date, editions]) => ({ date, editions }));
  }, [items]);
  const shown = showAll ? grouped : grouped.slice(0, 12);

  return (
    <section aria-labelledby="results-heading" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Medal className="h-4 w-4 text-accent" />
            <h2 id="results-heading" className="font-display text-lg font-semibold text-fg">
              Results
            </h2>
          </div>
          <p className="mt-1 text-xs text-subtle">
            Public-figure or athlete-approved ATHRECS results, plus verified organiser links.
          </p>
        </div>
        {grouped.length > 0 ? (
          <Badge variant="outline">
            {grouped.length} edition{grouped.length === 1 ? "" : "s"}
          </Badge>
        ) : null}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          No verified results links have been added yet.
        </p>
      ) : (
        <div className="grid gap-2">
          {shown.map(({ date, editions }) => {
            const externalLinks = new Map<string, { label: string; url: string }>();
            for (const edition of editions) {
              let editionHasDirectLink = false;
              for (const resultLink of edition.result_links) {
                const canonical = canonicalResultUrl(resultLink.results_url);
                if (!externalLinks.has(canonical)) {
                  externalLinks.set(canonical, {
                    label: `Results · ${resultLink.provider_name}`,
                    url: resultLink.results_url,
                  });
                }
                editionHasDirectLink = true;
              }
              const officialUrl = edition.results_official_url?.trim();
              if (officialUrl) {
                const canonical = canonicalResultUrl(officialUrl);
                if (!externalLinks.has(canonical)) {
                  externalLinks.set(canonical, {
                    label: `Results · ${resultProvider(officialUrl)}`,
                    url: officialUrl,
                  });
                }
                editionHasDirectLink = true;
              }
              if (!editionHasDirectLink && isRunAbcUrl(edition.source_url)) {
                const runAbcUrl = edition.source_url!.trim();
                const canonical = canonicalResultUrl(runAbcUrl);
                if (!externalLinks.has(canonical)) {
                  externalLinks.set(canonical, {
                    label: "Find results · runABC",
                    url: runAbcUrl,
                  });
                }
              }
            }
            return (
              <div
                key={date}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-fg">{formatRaceDateShort(date)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {editions.map((edition) => (
                      <Badge key={edition.id} variant="accent">
                        {formatDistanceWithUnits(edition.distance_code, edition.distance_km)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editions
                    .filter((edition) => edition.result_count > 0)
                    .map((edition) => (
                      <button
                        key={`athrecs-${edition.id}`}
                        type="button"
                        onClick={() => onAthrecsResults(edition.id)}
                        className="inline-flex h-11 min-w-11 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium"
                      >
                        ATHRECS public ·{" "}
                        {formatDistanceWithUnits(edition.distance_code, edition.distance_km)}
                      </button>
                    ))}
                  {[...externalLinks.values()].map((link) => (
                    <a
                      key={canonicalResultUrl(link.url)}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-11 items-center gap-1.5 rounded-md border border-border bg-elevated px-3 text-xs font-medium text-fg no-underline hover:border-accent hover:text-accent"
                    >
                      {link.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {grouped.length > 12 ? (
        <Button variant="secondary" size="sm" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Show latest 12" : `Show all ${grouped.length} editions`}
        </Button>
      ) : null}
    </section>
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
                    {(ed.result_count > 0 ||
                      ed.result_links.length > 0 ||
                      ed.results_official_url ||
                      isRunAbcUrl(ed.source_url)) && <Badge variant="outline">Results</Badge>}
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
                      View public results
                    </button>
                  )}
                  {st !== "Finished" &&
                    ed.entry_options.slice(0, 3).map((option) => (
                      <a
                        key={`${ed.id}-${option.provider_code}`}
                        href={option.entry_url}
                        target="_blank"
                        rel="noreferrer sponsored"
                        className="inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium text-fg no-underline"
                      >
                        {option.entry_type === "official" ? "Official entry" : option.provider_name}
                      </a>
                    ))}
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
