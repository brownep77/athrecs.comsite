import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, CalendarDays, Search, Trophy, Tv } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { compactFixtureLocation, formatFixtureStart } from "@/lib/athrecs/fixture-presentation";
import { Button } from "@/components/ui/button";
import { upcomingBroadcasts, type SportBroadcast } from "@/data/sport-broadcasts";
import { getSportFixtures } from "@/lib/athrecs/sport-fixtures-api";
import type { SportFixture } from "@/lib/athrecs/sport-fixtures.server";
import { getSportPage, parseSportFixtureSearch } from "@/lib/athrecs/sport-pages";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/sports/$sport")({
  validateSearch: parseSportFixtureSearch,
  beforeLoad: ({ params, search }) => {
    const page = getSportPage(params.sport);
    if (IS_RUNRECS_SITE || !page) throw notFound();
    if (params.sport !== page.slug) {
      throw redirect({
        to: "/sports/$sport",
        params: { sport: page.slug },
        search,
        statusCode: 301,
      });
    }
  },
  loaderDeps: ({ search }) => search,
  loader: async ({ params, deps }) => {
    const sport = getSportPage(params.sport);
    if (!sport) throw notFound();
    const fixtures = await getSportFixtures({ data: { slug: sport.slug, ...deps } });
    return { sport, ...fixtures, broadcasts: upcomingBroadcasts(sport) };
  },
  staleTime: 60_000,
  head: ({ params, match }) => {
    const sport = getSportPage(params.sport);
    if (!sport) return {};
    const url = `${SITE_URL}/sports/${sport.slug}`;
    return {
      meta: [
        ...siteGraphMeta({
          title: `${sport.label} on TV, fixtures & results | ATHRECS.com`,
          description: `Find ${sport.label.toLowerCase()} on TV and live streams, browse upcoming fixtures and explore results on AthRecs.`,
          url,
        }),
        ...(match.search.q || match.search.country || match.search.distance || match.search.page
          ? [{ name: "robots", content: "noindex, follow" }]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  pendingComponent: () => (
    <p role="status" className="py-12 text-center text-muted">
      Loading fixtures…
    </p>
  ),
  errorComponent: ({ reset }) => (
    <div role="alert" className="space-y-4 py-12 text-center">
      <h1 className="font-display text-2xl">Fixtures are temporarily unavailable</h1>
      <Button onClick={reset}>Try again</Button>
    </div>
  ),
  component: SportPage,
});

const textLink =
  "inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function SportPage() {
  const { sport, broadcasts, fixtures, hasMore, page, countries, distances } =
    Route.useLoaderData();
  const search = Route.useSearch();
  const filtered = !!(search.q || search.country || search.distance);
  const filterControl =
    "h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-base text-fg outline-none focus:ring-2 focus:ring-accent/40";
  return (
    <div className="space-y-7 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {sport.label}
          </h1>
          <p className="mt-2 text-sm text-muted">
            TV & live streams, upcoming fixtures, results, race reports and news.
          </p>
        </div>
        <Button asChild>
          <Link to="/results" search={{ category: sport.slug }}>
            <Trophy className="size-4" aria-hidden="true" /> {sport.label} results
          </Link>
        </Button>
      </header>

      <nav
        aria-label={`${sport.label} page sections`}
        className="flex flex-wrap gap-x-6 border-b border-border"
      >
        <a href="#on-tv" className={textLink}>
          On TV & live streams
        </a>
        <a href="#fixtures" className={textLink}>
          General fixtures
        </a>
        <Link to="/results" search={{ category: sport.slug }} className={textLink}>
          Results <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
        <Link to="/race-reports" search={{ sport: sport.slug }} className={textLink}>
          Race Reports
        </Link>
        <Link to="/news" search={{ sport: sport.slug }} className={textLink}>
          News
        </Link>
        {sport.slug === "road-running" && (
          <>
            <Link to="/running" hash="countries-title" className={textLink}>
              Marathons <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to="/running" hash="half-marathons" className={textLink}>
              Half marathons <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link to="/running/uk-road-ultramarathons" className={textLink}>
              UK road ultramarathons <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </>
        )}
      </nav>

      {sport.slug === "track-and-field" && (
        <section
          aria-labelledby="world-athletics-heading"
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/25 bg-accent-soft/40 p-4 sm:p-5"
        >
          <div className="min-w-0 flex-1 basis-64">
            <h2
              id="world-athletics-heading"
              className="flex items-center gap-2 font-display text-xl font-semibold"
            >
              <CalendarDays className="size-5 shrink-0 text-accent" aria-hidden="true" />
              World Athletics calendar
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Explore the official worldwide calendar of track and field meetings, with dates,
              venues and results. Filter by date, country or competition on World Athletics.
            </p>
          </div>
          <Button asChild>
            <a
              href="https://worldathletics.org/competition/calendar-results?disciplineId=5"
              target="_blank"
              rel="noopener noreferrer"
            >
              View calendar & results
              <ArrowUpRight className="size-4" aria-hidden="true" />
              <span className="sr-only"> on World Athletics (opens in a new tab)</span>
            </a>
          </Button>
        </section>
      )}

      <section id="on-tv" aria-labelledby="on-tv-heading" className="scroll-mt-24 space-y-4">
        <div>
          <h2
            id="on-tv-heading"
            className="flex items-center gap-2 font-display text-2xl font-semibold"
          >
            <Tv className="size-5 text-accent" aria-hidden="true" /> On TV & live streams
          </h2>
          <p className="mt-1 text-sm text-muted">
            Selected upcoming coverage. Availability varies by country; links show the latest
            broadcast schedule.
          </p>
        </div>
        {broadcasts.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {broadcasts.map((broadcast) => (
              <BroadcastCard key={broadcast.id} broadcast={broadcast} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-border bg-surface p-5 text-sm text-muted">
            No upcoming TV or live-stream coverage is confirmed here yet. Browse the fixtures below.
          </p>
        )}
      </section>

      <section id="fixtures" aria-labelledby="fixtures-heading" className="scroll-mt-24 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="fixtures-heading"
              className="flex items-center gap-2 font-display text-2xl font-semibold"
            >
              <CalendarDays className="size-5 text-accent" aria-hidden="true" /> General fixtures
            </h2>
            <p className="mt-1 text-sm text-muted">
              Upcoming events, earliest first. Starts use the venue’s time zone on race day.
            </p>
          </div>
        </div>
        <form
          action={`/sports/${sport.slug}#fixtures`}
          method="get"
          role="search"
          key={`${sport.slug}-${search.q ?? ""}-${search.country ?? ""}-${search.distance ?? ""}`}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
        >
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="sport-fixture-search" className="block text-sm font-medium">
              Search fixtures
            </label>
            <input
              id="sport-fixture-search"
              name="q"
              type="search"
              maxLength={120}
              defaultValue={search.q}
              placeholder="Event, town, city, county or state"
              className={filterControl}
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="sport-fixture-country" className="block text-sm font-medium">
              Country
            </label>
            <select
              id="sport-fixture-country"
              name="country"
              defaultValue={search.country ?? ""}
              className={filterControl}
            >
              <option value="">All countries</option>
              {search.country && !countries.includes(search.country) && (
                <option value={search.country}>{search.country}</option>
              )}
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor="sport-fixture-distance" className="block text-sm font-medium">
              Distance
            </label>
            <select
              id="sport-fixture-distance"
              name="distance"
              defaultValue={search.distance ?? ""}
              className={filterControl}
            >
              <option value="">All distances</option>
              {search.distance && !distances.includes(search.distance) && (
                <option value={search.distance}>{search.distance}</option>
              )}
              {distances.map((distance) => (
                <option key={distance} value={distance}>
                  {distance === "Half"
                    ? "Half marathon"
                    : distance === "Ultra"
                      ? "Ultramarathon"
                      : distance}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:self-end">
            <Button type="submit" className="h-11">
              <Search className="size-4" aria-hidden="true" /> Apply filters
            </Button>
            {filtered ? (
              <Link
                to="/sports/$sport"
                params={{ sport: sport.slug }}
                search={{}}
                hash="fixtures"
                className={textLink}
              >
                Clear filters
              </Link>
            ) : null}
          </div>
        </form>
        {fixtures.length ? (
          <div className="divide-y divide-border rounded-xl border border-border bg-surface px-4 sm:px-5">
            {fixtures.map((fixture) => (
              <FixtureRow
                key={`${fixture.eventId}-${fixture.eventDate}`}
                fixture={fixture}
                category={sport.slug}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted">
            {filtered
              ? "No upcoming fixtures match these filters. Try another country or distance, change your search, or clear the filters."
              : "No upcoming fixtures are listed for this sport yet."}
          </div>
        )}
        {page > 1 || hasMore ? (
          <nav aria-label="Fixture pages" className="flex items-center justify-between gap-3">
            {page > 1 ? (
              <Link
                to="/sports/$sport"
                params={{ sport: sport.slug }}
                search={{ ...search, page: page - 1 }}
                hash="fixtures"
                className={textLink}
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted">Page {page}</span>
            {hasMore && page < 400 ? (
              <Link
                to="/sports/$sport"
                params={{ sport: sport.slug }}
                search={{ ...search, page: page + 1 }}
                hash="fixtures"
                className={textLink}
              >
                Next <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </section>

      <Link
        to="/results"
        search={{ category: sport.slug }}
        className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-soft px-5 font-semibold text-accent no-underline hover:underline"
      >
        <span className="flex items-center gap-2">
          <Trophy className="size-5" aria-hidden="true" /> Browse {sport.label.toLowerCase()}{" "}
          results
        </span>
        <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
      </Link>
    </div>
  );
}

function BroadcastCard({ broadcast }: { broadcast: SportBroadcast }) {
  const date =
    broadcast.startDate === broadcast.endDate
      ? formatRaceDateShort(broadcast.startDate)
      : `${formatRaceDateShort(broadcast.startDate)} – ${formatRaceDateShort(broadcast.endDate)}`;
  const start = broadcast.eventStart
    ? new Intl.DateTimeFormat("en-GB", {
        timeZone: broadcast.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(new Date(broadcast.eventStart))
    : null;
  return (
    <article className="flex flex-col rounded-xl border border-accent/25 bg-accent-soft/40 p-4 sm:p-5">
      <p className="text-sm font-semibold text-accent">{date}</p>
      <h3 className="mt-2 text-lg font-semibold leading-snug">{broadcast.name}</h3>
      <p className="mt-1 text-sm text-muted">
        {broadcast.location}
        {start ? ` · Race start ${start} (local)` : ""}
      </p>
      <p className="mt-4 text-sm font-semibold">{broadcast.broadcaster}</p>
      <p className="mt-1 text-sm leading-6 text-muted">{broadcast.availability}</p>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 pt-3">
        <a href={broadcast.watchUrl} target="_blank" rel="noopener noreferrer" className={textLink}>
          Where to watch <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
        <a
          href={broadcast.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted underline underline-offset-2"
        >
          Coverage details
        </a>
      </div>
    </article>
  );
}

function FixtureRow({ fixture, category }: { fixture: SportFixture; category: string }) {
  const location = compactFixtureLocation(fixture);
  const starts = fixture.starts.map((start) => ({
    ...start,
    label: formatFixtureStart(start.time, fixture.eventDate, fixture.timeZone),
  }));
  const zones = new Set(
    starts
      .filter((start) => /^\d{2}:\d{2} /.test(start.label))
      .map((start) => start.label.slice(6)),
  );
  const sharedZone = zones.size === 1 && ![...zones][0].includes("TBC") ? [...zones][0] : null;
  const notes = [
    ...new Set(starts.map((start) => start.note).filter((note): note is string => !!note)),
  ];
  const compactLink =
    "inline-flex min-h-8 items-center gap-1 text-xs font-medium text-accent underline-offset-2 hover:underline [@media(pointer:coarse)]:min-h-11";
  return (
    <article className="min-w-0 space-y-1 py-3">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <time
          dateTime={fixture.eventDate}
          className="shrink-0 text-xs font-semibold tabular-nums text-accent"
        >
          {formatRaceDateShort(fixture.eventDate)}
        </time>
        <h3 className="min-w-0 font-semibold leading-snug">{fixture.name}</h3>
      </div>
      <p className="text-[13px] leading-5 text-muted">
        <span className="mr-1.5 inline-flex items-center align-middle">
          {fixture.country ? <CountryFlag country={fixture.country} /> : null}
        </span>
        {location.text ? `${location.text}, ` : ""}
        {location.countryCode ? (
          <abbr title={location.countryName} className="no-underline">
            {location.countryCode}
          </abbr>
        ) : !location.text ? (
          "Location TBC"
        ) : null}
        <span aria-hidden="true"> · </span>
        {fixture.summary}
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs leading-5">
        {sharedZone ? <span className="font-medium text-muted">Starts {sharedZone}:</span> : null}
        <ul
          className="contents"
          aria-label={`Distances and race starts${sharedZone ? ` in ${sharedZone}` : ""}`}
        >
          {starts.map((start, index) => (
            <li key={`${start.distance}-${index}`} className="text-muted">
              <span className="font-medium text-fg">
                {formatDistanceWithUnits(start.distance).replace(/^\d+(?:\.\d+)?K · /i, "")}
              </span>
              {" · "}
              <span className="whitespace-nowrap">
                {sharedZone ? start.label.replace(` ${sharedZone}`, "") : start.label}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 sm:ml-auto">
          {fixture.website ? (
            <a
              href={fixture.website}
              target="_blank"
              rel="noopener noreferrer"
              className={compactLink}
            >
              Details <ArrowUpRight className="size-3" aria-hidden="true" />
            </a>
          ) : null}
          <Link to="/results" search={{ category, q: fixture.name }} className={compactLink}>
            Results <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
        {notes.map((note) => (
          <span key={note} className="text-muted">
            {starts.every((start) => start.note === note)
              ? ""
              : `${starts
                  .filter((start) => start.note === note)
                  .map((start) => start.distance)
                  .join(" / ")}: `}
            {note}
          </span>
        ))}
      </div>
    </article>
  );
}
