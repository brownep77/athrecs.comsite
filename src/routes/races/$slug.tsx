import { isParkrunResult } from "@/lib/athrecs/parkrun-timing";
import { RaceResultsBoard } from "@/components/races/RaceResultsBoard";
import { RaceActions } from "@/components/races/RaceActions";
import { catalogueCalendarRace } from "@/lib/athrecs/catalogue-calendar";
import { FIXTURE_DATE_REVIEWS } from "@/data/fixture-date-reviews";
import { URGENT_RACE_PAGE_NOTICES } from "@/data/urgent-starts-next-2026-10-25-pages";
import { FIXTURE_DETAILS } from "@/data/fixture-details";
import { SportBadge, DistanceBadge } from "@/components/races/EventBadges";
import { ResultDisqualification } from "@/components/athletes/ResultDisqualification";
import { isDisqualified } from "@/lib/athrecs/result-details";
import { useMemo, useState, type ReactNode } from "react";
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
  Ticket,
} from "lucide-react";
import { getPublicRaceResults } from "@/lib/athrecs/public-results-api";
import { getEventAthleteLinks } from "@/lib/athrecs/event-athlete-discovery-api";
import { resultEditionLabel, resultSlug } from "@/lib/athrecs/result-slug";
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
  EditionSpectatorAccess,
  EntryStatus,
  EventListItem,
} from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { TravelFacts } from "@/components/races/TravelFacts";
import { RaceCard } from "@/components/races/RaceCard";
import { EntryOptions } from "@/components/races/EntryOptions";
import { RaceGroupBadges, RaceGroupDetails } from "@/components/races/RaceGroupBadges";
import { venueForEvent } from "@/lib/athrecs/venue";
import { sanitizeDistances } from "@/lib/athrecs/filters";
import { distanceDisplayLabel, formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { resolveCountry, filterCountryName } from "@/lib/athrecs/countries";
import { timeZoneAbbr, timeZoneForPlace } from "@/lib/athrecs/timezone";
import { buildRaceBriefing, sportLabel } from "@/lib/athrecs/race-briefing";
import { raceFormatGuideFor } from "@/data/race-format-guides";
import { raceQualifications, type RaceQualification } from "@/data/race-qualifications";
import { resolveSlugRedirect } from "@/lib/athrecs/slug-redirects";
import { SITE_NAME, SITE_URL, siteGraphMeta, sportsEventJsonLd } from "@/lib/athrecs/seo";
import { breadcrumbJsonLd } from "@/lib/athrecs/breadcrumbs";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { RacePracticalInformation } from "@/components/races/RacePracticalInformation";
import { RaceEntryOptions } from "@/components/races/RaceEntryOptions";
import { compactFixtureLocation } from "@/lib/athrecs/fixture-presentation";
import { editionEntry } from "@/lib/athrecs/race-information";
import { raceSearchContent, nextRaceEdition } from "@/lib/athrecs/race-search-content";
import { SuggestRaceEdit } from "@/components/races/SuggestRaceEdit";
import { racePageMetadata, raceEditionStart } from "@/lib/athrecs/race-page-metadata";
import { publicOrganiserName } from "@/lib/athrecs/seo";
import { reviewedRacePage } from "@/data/race-page-reviews";
import { diamondLeagueMeetingForSlug } from "@/data/diamond-league";
import { DiamondLeagueTv } from "@/components/discovery/DiamondLeagueGuide";

type ArchivePreview = Pick<NonNullable<Awaited<ReturnType<typeof getPublicRaceResults>>>, "edition" | "results" | "providerCredits">;

type EditionRow = {
  id: number;
  event_date: string;
  distance_code: string;
  distance_km: number;
  status: string;
  entry_url: string | null;
  result_provider_names: string[];
  entry_options: EditionEntryOption[];
  spectator_access: EditionSpectatorAccess | null;
  start_time: string | null;
  start_label?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  notes?: string | null;
  result_count: number;
};

export const Route = createFileRoute("/races/$slug")({
  loader: async ({ params }) => {
    const loaded = await getEventBySlug({ data: params.slug });
    const data = loaded ? reviewedRacePage(loaded) : null;
    if (data) {
      if (data.event.slug !== params.slug) {
        throw redirect({
          to: "/races/$slug",
          params: { slug: data.event.slug },
          statusCode: 301,
        });
      }
      const [archiveResults, athleteLinks] = await Promise.all([
        !IS_RUNRECS_SITE &&
        !data.upcoming.length &&
        data.past.length === 1 &&
        data.past[0].result_count > 0
          ? getPublicRaceResults({ data: { editionId: String(data.past[0].id) } })
          : Promise.resolve(null),
        !IS_RUNRECS_SITE && data.past.some((edition) => edition.result_count > 0)
          ? getEventAthleteLinks({ data: data.event.slug })
          : Promise.resolve([]),
      ]);
      return {
        ...data,
        athleteLinks,
        archiveResults: archiveResults
          ? { edition: archiveResults.edition, results: archiveResults.results.slice(0, 5), providerCredits: archiveResults.providerCredits }
          : null,
      };
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
    const { event, upcoming, archiveResults } = loaderData;
    const searchContent = raceSearchContent(loaderData);
    const canonical = `${SITE_URL}/races/${event.slug}`;
    const title = IS_RUNRECS_SITE
      ? searchContent.title.replace(/\| AthRecs$/, "| RunRecs")
      : searchContent.title;
    const description = archiveResults
      ? `Recorded ${archiveResults.edition.distance_code} performances at ${event.name}, ${archiveResults.edition.event_date}, ${[event.city, event.country].filter(Boolean).join(", ")}. ${archiveResults.results
          .slice(0, 3)
          .map((result) => result.athlete_name)
          .join(", ")}. Browse the published race results.`
      : IS_RUNRECS_SITE
        ? event.summary ||
          `${SITE_NAME} event page for ${event.name}: date, local start, venue, distances and past races. Confirm entry on the official site.`
        : searchContent.description;
    const metadata = racePageMetadata(event, upcoming);
    const next = metadata.next;

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
              description: IS_RUNRECS_SITE ? description : searchContent.biography.join(" "),
              city: event.city,
              region: event.county,
              country: event.country,
              startDate: next?.event_date,
              utcOffset: metadata.utcOffset,
              endUtcOffset: metadata.endUtcOffset,
              venue: metadata.venue,
              startTime: metadata.startTime,
              endDate: next?.end_date,
              endTime: metadata.endTime,
              sport: event.sport,
              website: metadata.organiserWebsite,
              organiser: metadata.organiser ?? event.organiser,
              entryOptions: next?.entry_options,
            }),
          ).replace(/</g, "\\u003c"),
        },
        ...(!IS_RUNRECS_SITE
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify(
                  breadcrumbJsonLd([
                    { name: "Events", path: "/races" },
                    { name: event.name, path: `/races/${encodeURIComponent(event.slug)}` },
                  ]),
                ).replace(/</g, "\\u003c"),
              },
            ]
          : []),
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
  const data = Route.useLoaderData();
  return (
    <RacePageContent
      data={data}
      archiveResults={data.archiveResults}
      athleteLinks={data.athleteLinks}
    />
  );
}

function spectatorAccessLabel(access: EditionSpectatorAccess | null): string | null {
  switch (access?.access_type) {
    case "free":
      return "Free to watch";
    case "ticketed":
      return "Tickets available";
    case "free_and_ticketed":
      return "Free viewing areas and ticketed seating";
    case "registration_required":
      return "Spectator registration required";
    case "sold_out":
      return "Spectator tickets sold out";
    default:
      return null;
  }
}

function formatCheckedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function RacePageContent({
  data,
  localized,
  archiveResults,
  athleteLinks = [],
}: {
  data: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
  localized?: { language: string; country: string };
  archiveResults?: ArchivePreview | null;
  athleteLinks?: Awaited<ReturnType<typeof getEventAthleteLinks>>;
}) {
  const { event, groups, distances, upcoming, past, related } = data;
  const diamondLeagueMeeting = diamondLeagueMeetingForSlug(event.slug);
  const raceBiography = raceSearchContent(data).biography;
  const isRunningEvent = event.sport === "Running" || event.sport === "Parkrun";
  const qualification = raceQualifications[event.slug];
  const shownDistances = sanitizeDistances(
    event.name,
    distances.length ? distances : [...new Set(past.map((edition) => edition.distance_code))],
  );
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
  const location = compactFixtureLocation({ ...event, country: filterCountryName(country) });
  const next = nextRaceEdition(upcoming);
  const nextFixtureDetail = FIXTURE_DETAILS[`${event.slug}|${next?.event_date}`];
  const archived = !next && past.length > 0;
  const nextStart = raceEditionStart(event, next);
  const zone = timeZoneForPlace({
    timeZone: FIXTURE_DETAILS[`${event.slug}|${next?.event_date}`]?.timeZone,
    country: event.country,
    county: event.county,
    date: next?.event_date,
  });
  const zoneAbbr = next?.event_date ? timeZoneAbbr(zone, next.event_date) : timeZoneAbbr(zone);
  const briefing = useMemo(
    () =>
      buildRaceBriefing({
        name: event.name,
        sport: event.sport,
        slug: event.slug,
        city: event.city,
        country: filterCountryName(country),
        surface: event.surface,
        organiser: event.organiser,
        website: event.website,
        sourceUrl: event.source_url,
        nextDate: next ? formatRaceDateShort(next.event_date) : null,
      }),
    [event, country, next],
  );
  const formatGuide = raceFormatGuideFor(event.slug);
  const [resultsEditionId, setResultsEditionId] = useState<number | null>(null);
  function showEditionResults(id: number) {
    setResultsEditionId(id);
    requestAnimationFrame(() => {
      document.getElementById("edition-results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
  const { data: results = [], isFetching } = useQuery({
    queryKey: ["edition-results", resultsEditionId],
    queryFn: () => getEditionResults({ data: resultsEditionId! }),
    enabled: resultsEditionId != null,
  });

  const nextStatus = next ? effectiveStatus(next.event_date, next.status as EntryStatus) : null;
  const nextEntry = next ? editionEntry(next) : null;
  const nextDayEditions = upcoming.filter((edition) => edition.event_date === next?.event_date && edition.status !== "Cancelled");
  const primaryEntry =
    next?.entry_options.find((option) => option.is_primary) ??
    next?.entry_options.find((option) => option.entry_type === "official") ??
    next?.entry_options[0];
  const spectatorAccess = next?.spectator_access ?? null;
  const spectatorLabel = spectatorAccessLabel(spectatorAccess);
  const pastWithResults = past.filter(
    (ed) =>
      ed.result_count > 0 || ed.result_provider_names.length > 0,
  );
  const pastPreview = past.slice(0, 12);
  const pastHidden = past.length - pastPreview.length;

  return (
    <div className="space-y-8 pb-10">
      {localized ? (
        <Link
          to="/$language/$country/races"
          params={localized}
          search={{ sport: event.sport }}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Events
        </Link>
      ) : (
        <Link
          to={isRunningEvent && !IS_RUNRECS_SITE ? "/running/events" : "/races"}
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
            <CountryFlag country={filterCountryName(country)} showCode />
            <SportBadge sport={event.sport} />
            {event.surface && event.surface !== "Other" && (
              <Badge variant="outline">{event.surface}</Badge>
            )}
            {shownDistances.map((d) => (
              <DistanceBadge key={d} distance={d} />
            ))}
            {Object.entries({ ...FIXTURE_DATE_REVIEWS, ...URGENT_RACE_PAGE_NOTICES })
              .filter(([key]) => key.startsWith(`${event.slug}|`))
              .map(([key, review]) => (
                <p
                  key={key}
                  className="w-full rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"
                >
                  {review.note}{" "}
                  <a href={review.sourceUrl} className="underline">
                    Organiser information
                  </a>{" "}
                  · Checked {review.checkedAt}
                </p>
              ))}
            <RaceGroupBadges groups={groups} />
            {spectatorLabel ? <Badge variant="accent">{spectatorLabel}</Badge> : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="min-w-0 space-y-3">
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-fg md:text-4xl">
                {event.name}
              </h1>
              {nextFixtureDetail?.eventPageName ? (
                <p className="text-sm leading-relaxed text-muted">{nextFixtureDetail.summary}</p>
              ) : null}
              <p className="flex items-start gap-2 text-sm text-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-subtle" />
                <span>
                  {location.text || "Location to be confirmed"}
                  {" · "}
                  <CountryFlag country={filterCountryName(country)} showCode />
                </span>
              </p>
            </div>
            {next ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-left lg:min-w-44 lg:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
                  When is the next {event.name}?
                  {nextFixtureDetail?.eventPageName && nextDayEditions.length === 1
                    ? ` · ${distanceDisplayLabel(next.distance_code, next.distance_km)}`
                    : ""}
                </p>
                <p className="font-display text-xl font-semibold text-fg">
                  <time dateTime={next.event_date}>{formatRaceDateShort(next.event_date)}</time>
                </p>
                <p className="text-sm font-medium text-muted">
                  {nextDayEditions.length > 1
                    ? `${nextDayEditions.length} ${isRunningEvent ? "distances" : "races"} · see start times below`
                    : (nextStart ? `Start time · ${nextStart}` :
                      (zoneAbbr ? `Time not yet verified · ${zoneAbbr}` : "Time not yet verified"))}
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
                  {isRunningEvent ? "Race website" : "Official page"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            {isRunningEvent && nextEntry ? (
              <Button asChild variant="secondary">
                <a href={nextEntry.url} target="_blank" rel="noopener noreferrer">
                  {nextEntry.label}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : (
              !isRunningEvent &&
              primaryEntry &&
              nextStatus !== "Finished" && (
                <Button asChild variant="secondary">
                  <a href={primaryEntry.entry_url} target="_blank" rel="noreferrer sponsored">
                    {primaryEntry.entry_type === "official"
                      ? "Official entry"
                      : `Enter via ${primaryEntry.provider_name}`}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )
            )}
            {spectatorAccess?.ticket_url && (
              <Button asChild variant="secondary">
                <a href={spectatorAccess.ticket_url} target="_blank" rel="noreferrer">
                  Spectator tickets
                  <Ticket className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button asChild variant="secondary">
              <Link to={isRunningEvent && !IS_RUNRECS_SITE ? "/running/calendar" : "/calendar"}>
                <CalendarDays className="h-3.5 w-3.5" />
                Calendar
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {!IS_RUNRECS_SITE ? (
        <section
          aria-labelledby="race-biography-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-5"
        >
          <h2 id="race-biography-heading" className="font-display text-xl font-semibold">
            About {event.name}
          </h2>
          <p className="text-sm leading-relaxed text-muted">{raceBiography.join(" ")}</p>
        </section>
      ) : null}

      {archiveResults ? (
        <section
          aria-labelledby="archive-results-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-5"
        >
          <h2 id="archive-results-heading" className="font-display text-xl font-semibold">
            Selected {archiveResults.edition.distance_code} performances ·{" "}
            {formatRaceDateShort(archiveResults.edition.event_date)}
          </h2>
          <p className="text-sm text-muted">
            From the published results for {event.name}.
          </p>
          <RaceResultsBoard
            results={archiveResults.results}
            parkrun={isParkrunResult({ sport: event.sport, eventName: event.name })}
            editionName={resultEditionLabel(archiveResults.edition)}
          />
          {archiveResults.providerCredits.length ? (
            <p className="text-xs text-muted">Results supplied by {archiveResults.providerCredits.join(", ")}</p>
          ) : null}
          <Link
            to="/results/$editionId"
            params={{ editionId: resultSlug(archiveResults.edition) }}
            className="text-sm text-accent underline"
          >
            View recorded results
          </Link>
        </section>
      ) : null}

      {athleteLinks.length ? (
        <section
          aria-labelledby="event-athletes-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-5"
        >
          <h2 id="event-athletes-heading" className="font-display text-lg font-semibold">
            Athlete profiles
          </h2>
          <p className="text-sm text-muted">
            Explore some of the athletes with recorded results at {event.name}.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {athleteLinks.map((athlete) => (
              <li key={athlete.slug}>
                <Link
                  to="/athletes/$slug"
                  params={{ slug: athlete.slug }}
                  className="inline-flex min-h-11 items-center text-sm text-accent hover:underline"
                >
                  {athlete.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {isRunningEvent ? (
        <>
          <nav
            aria-label="Race information"
            className="flex flex-wrap gap-x-5 gap-y-2 border-b border-border pb-3 text-sm font-semibold text-accent"
          >
            <a className="inline-flex min-h-10 items-center" href="#race-schedule">
              Dates & entry
            </a>
            <a className="inline-flex min-h-10 items-center" href="#race-location">
              Location & race day
            </a>
            {event.sport !== "Parkrun" && (
              <a className="inline-flex min-h-10 items-center" href="#entry-options-heading">
                All entry options
              </a>
            )}
            {pastWithResults.length ? (
              <a className="inline-flex min-h-10 items-center" href="#results-heading">
                Results
              </a>
            ) : null}
          </nav>
          <RacePracticalInformation data={data} />
        </>
      ) : null}

      <RaceGroupDetails groups={groups} />

      {qualification && <QualificationDetails qualification={qualification} />}

      {!archived &&
        (isRunningEvent ? (
          <RaceEntryOptions data={data} />
        ) : (
          <EntryOptions
            options={next?.entry_options ?? []}
            editionDate={next?.event_date}
            officialWebsite={event.website}
          />
        ))}

      {spectatorAccess && spectatorLabel ? (
        <section className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-surface p-5 shadow-card">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-accent" aria-hidden="true" />
              <h2 className="font-display text-lg font-semibold text-fg">Spectator access</h2>
            </div>
            <p className="text-sm font-medium text-fg">{spectatorLabel}</p>
            {spectatorAccess.notes ? (
              <p className="max-w-2xl text-sm text-muted">{spectatorAccess.notes}</p>
            ) : null}
            <p className="text-xs text-subtle">
              Checked {formatCheckedDate(spectatorAccess.checked_at)} from the official source.
            </p>
          </div>
          <Button asChild variant="secondary">
            <a
              href={spectatorAccess.ticket_url ?? spectatorAccess.source_url}
              target="_blank"
              rel="noreferrer"
            >
              {spectatorAccess.ticket_url ? "View tickets" : "Spectator information"}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </section>
      ) : null}

      {!isRunningEvent && (
        <section aria-labelledby="key-facts-heading">
          <h2 id="key-facts-heading" className="mb-3 font-display text-lg font-semibold text-fg">
            Key facts
          </h2>
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            <Fact
              label={archived ? "Latest recorded race" : "Date"}
              value={
                next
                  ? formatRaceDateShort(next.event_date)
                  : past[0]
                    ? formatRaceDateShort(past[0].event_date)
                    : "No future date"
              }
            />
            <Fact
              label="Local start"
              value={
                nextDayEditions.length > 1
                  ? "See category starts below"
                  : (nextStart ?? "Confirm officially")
              }
              hint={zoneAbbr ? `Venue zone ${zoneAbbr}` : undefined}
            />
            <Fact
              label="Country"
              value={<CountryFlag country={filterCountryName(country)} showCode />}
            />
            <Fact label="Location" value={location.text || "TBC"} />
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
            <Fact
              label="Organiser"
              value={publicOrganiserName(event.organiser) || "Organiser not yet confirmed"}
            />
            <Fact
              label="Entry"
              value={nextStatus ? statusLabel(nextStatus) : "See official page"}
            />
            <Fact label="Spectators" value={spectatorLabel ?? "Not confirmed"} />
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
      )}

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

      {!isRunningEvent && !archived && (
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
      )}

      {!isRunningEvent && !archived && (
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
      )}

      {!isRunningEvent && !archived && (
        <EditionList
          title={
            event.sport === "Parkrun"
              ? "Upcoming — weekly through 25 December 2027"
              : "Upcoming races"
          }
          items={upcoming}
          calendarEvent={event}
          country={event.country}
          county={event.county}
        />
      )}

      {diamondLeagueMeeting ? <DiamondLeagueTv meeting={diamondLeagueMeeting} /> : null}

      <EditionResultsLinks
        items={pastWithResults}
        eventName={event.result_event_name}
        timingCredit={event.slug === "east-coast-10k" ? "Total Race Timing" : undefined}
        onAthrecsResults={showEditionResults}
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
                      <th className="px-3 py-2.5">Performance</th>
                      <th className="px-3 py-2.5">Claim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r) => (
                      <tr key={r.id} className="border-b border-border/70 last:border-0">
                        <td className="px-3 py-2.5 tabular text-muted">
                          {isDisqualified(r)
                            ? "DQ"
                            : (r.overall_place ?? r.details.reportedPlace ?? "—")}
                        </td>
                        <td className="px-3 py-2.5">
                          <Link
                            to="/athletes/$slug"
                            params={{ slug: r.athlete_slug }}
                            className="font-medium text-fg no-underline hover:text-accent"
                          >
                            {r.athlete_name}
                          </Link>
                          <ResultDisqualification decision={r.details.disqualification} />
                          {r.details.verificationStatus === "unverified" ? (
                            <p className="text-xs text-muted">Unverified result</p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2.5 text-muted">{r.club ?? "—"}</td>
                        <td className="px-3 py-2.5 text-muted">{r.category ?? "—"}</td>
                        <td className="px-3 py-2.5 font-medium tabular">
                          {r.details.reportedPerformance || formatDuration(r.finish_time_seconds)}
                          {isDisqualified(r) ? (
                            <span aria-label="Disqualified result">*</span>
                          ) : null}
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
        eventSlug={event.slug}
        items={pastPreview}
        hidden={pastHidden}
        eventName={event.result_event_name}
        onResults={showEditionResults}
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

      {!isRunningEvent && !archived && (
        <aside className="rounded-xl border border-dashed border-border px-4 py-4 text-xs leading-relaxed text-subtle">
          This page is an ATHRECS briefing written from public listing facts (name, date, venue,
          sport, distances). We do not copy official athlete guides, course maps, start lists or
          marketing copy. parkrun, World Athletics, World Triathlon and other names are trademarks
          of their owners. Always confirm entry, rules and the course on the official page
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
      )}
      <SuggestRaceEdit key={event.slug} slug={event.slug} name={event.name} />
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

function EditionResultsLink({ eventName, edition }: { eventName: string; edition: EditionRow }) {
  const result = {
    edition_id: edition.id,
    event_name: eventName,
    event_date: edition.event_date,
    distance_code: edition.distance_code,
  };
  return (
    <Link
      to="/results/$editionId"
      params={{ editionId: resultSlug(result) }}
      className="inline-flex min-h-11 items-center rounded-md border border-accent/40 px-3 text-xs font-medium text-accent"
    >
      {resultEditionLabel(result)}
    </Link>
  );
}

function EditionResultsLinks({
  items,
  eventName,
  timingCredit,
  onAthrecsResults,
}: {
  items: EditionRow[];
  eventName: string;
  timingCredit?: string;
  onAthrecsResults: (id: number) => void;
}) {
  const grouped = useMemo(() => {
    const byDate = new Map<string, EditionRow[]>();
    for (const item of items) {
      const group = byDate.get(item.event_date) ?? [];
      group.push(item);
      byDate.set(item.event_date, group);
    }
    return [...byDate.entries()].sort(([left], [right]) => right.localeCompare(left));
  }, [items]);

  const cards = grouped.map(([date, editions]) => {
    const providers = [...new Set(editions.flatMap((edition) => edition.result_provider_names))];
    return (
      <div
        key={date}
        className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-fg">{formatRaceDateShort(date)}</p>
          <div className="flex flex-wrap gap-1.5">
            {editions.map((edition) => (
              <DistanceBadge key={edition.id} distance={edition.distance_code} distanceKm={edition.distance_km} />
            ))}
          </div>
          {!timingCredit && providers.length > 0 && (
            <p className="text-xs text-muted">Results supplied by {providers.join(", ")}</p>
          )}
          {editions.every((edition) => edition.result_count === 0) && (
            <p className="text-xs text-muted">AthRecs has yet to publish performances from this edition.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {editions.filter((edition) => edition.result_count > 0).map((edition) => (
            IS_RUNRECS_SITE ? (
              <button
                key={edition.id}
                type="button"
                onClick={() => onAthrecsResults(edition.id)}
                className="inline-flex h-11 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium"
              >
                ATHRECS public · {formatDistanceWithUnits(edition.distance_code, edition.distance_km)}
              </button>
            ) : (
              <EditionResultsLink key={edition.id} edition={edition} eventName={eventName} />
            )
          ))}
        </div>
      </div>
    );
  });

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
          {timingCredit && <p className="mt-1 text-xs text-subtle">Timing by {timingCredit}</p>}
        </div>
        {grouped.length > 0 && (
          <Badge variant="outline">{grouped.length} edition{grouped.length === 1 ? "" : "s"}</Badge>
        )}
      </div>
      {cards.length ? (
        <div className="grid gap-2">
          {cards.slice(0, 12)}
          {cards.length > 12 && (
            <details>
              <summary className="cursor-pointer py-3 text-sm font-medium text-accent">
                Earlier editions ({cards.length - 12})
              </summary>
              <div className="grid gap-2">{cards.slice(12)}</div>
            </details>
          )}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          Results have yet to be added for this race.
        </p>
      )}
    </section>
  );
}

function Fact({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
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
  calendarEvent,
  eventSlug = calendarEvent?.slug,
  eventName,
  hidden = 0,
  onResults,
  country,
  county,
}: {
  title: string;
  items: EditionRow[];
  calendarEvent?: Parameters<typeof catalogueCalendarRace>[0];
  eventSlug?: string;
  eventName?: string;
  hidden?: number;
  onResults?: (id: number) => void;
  country?: string;
  county?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = calendarEvent && !showAll ? items.slice(0, 12) : items;
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          None listed yet.
        </p>
      ) : (
        <div className="grid gap-2">
          {visibleItems.map((ed) => {
            const st = ed.status === "Finished" && !calendarEvent ? "Finished" : effectiveStatus(ed.event_date, ed.status as EntryStatus);
            const publicNote = eventSlug
              ? (FIXTURE_DETAILS[`${eventSlug}|${ed.event_date}`]?.starts[ed.distance_code]
                  ?.publicNote ?? ed.notes)
              : ed.notes;
            const start = eventSlug
              ? raceEditionStart({ ...calendarEvent, slug: eventSlug, country, county }, ed)
              : (ed.start_label ??
                formatStartTime(ed.start_time, { country, county, date: ed.event_date }));
            return (
              <div
                key={`${ed.id}-${ed.event_date}`}
                className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <DistanceBadge distance={ed.distance_code} distanceKm={ed.distance_km} />
                    <Badge variant={st === "Finished" ? "default" : "solid"}>
                      {statusLabel(st)}
                    </Badge>
                    {(ed.result_count > 0 || ed.result_provider_names.length > 0) && <Badge variant="outline">Results</Badge>}
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
                  {ed.end_date ? (
                    <p className="text-xs text-muted">
                      Ends {formatRaceDateShort(ed.end_date)}
                      {ed.end_time ? ` at ${ed.end_time} local time` : ""}
                    </p>
                  ) : null}
                  {publicNote ? <p className="text-xs text-subtle">{publicNote}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {calendarEvent ? (
                    <RaceActions race={catalogueCalendarRace(calendarEvent, ed, SITE_URL)} />
                  ) : null}
                  {ed.result_count > 0 && !IS_RUNRECS_SITE && eventName && (
                    <EditionResultsLink edition={ed} eventName={eventName} />
                  )}
                  {ed.result_count > 0 && IS_RUNRECS_SITE && onResults && (
                    <button
                      type="button"
                      onClick={() => onResults(ed.id)}
                      className="inline-flex h-11 min-w-11 items-center rounded-md border border-border bg-elevated px-3 text-xs font-medium"
                    >
                      View public results
                    </button>
                  )}
                  {st !== "Finished" &&
                    st !== "Cancelled" &&
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
          {items.length > visibleItems.length ? (
            <Button variant="secondary" onClick={() => setShowAll(true)}>
              Show all {items.length} listed events
            </Button>
          ) : null}
          {hidden > 0 ? (
            <p className="px-1 text-xs text-subtle">
              {hidden} earlier date{hidden === 1 ? "" : "s"} in the race history.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
