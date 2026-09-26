import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin, Search, Trophy, Tv } from "lucide-react";
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
        ...(match.search.q || match.search.page
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
  const { sport, broadcasts, fixtures, hasMore, page } = Route.useLoaderData();
  const search = Route.useSearch();
  return (
    <div className="space-y-7 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {sport.label}
          </h1>
          <p className="mt-2 text-sm text-muted">
            TV & live streams, upcoming fixtures and results.
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
      </nav>

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
              Upcoming events, earliest first. Race start times are local to the venue.
            </p>
          </div>
        </div>
        <form
          action={`/sports/${sport.slug}#fixtures`}
          method="get"
          role="search"
          className="flex flex-wrap gap-2"
        >
          <label htmlFor="sport-fixture-search" className="sr-only">
            Search fixtures by event or location
          </label>
          <input
            id="sport-fixture-search"
            key={search.q ?? ""}
            name="q"
            type="search"
            maxLength={120}
            defaultValue={search.q}
            placeholder="Search event, city or country"
            className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/40"
          />
          <Button type="submit" className="h-11">
            <Search className="size-4" aria-hidden="true" /> Search
          </Button>
          {search.q ? (
            <Link
              to="/sports/$sport"
              params={{ sport: sport.slug }}
              search={{}}
              hash="fixtures"
              className={textLink}
            >
              Clear
            </Link>
          ) : null}
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
            {search.q
              ? "No upcoming fixtures match this search. Try another event or location."
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
          Coverage checked {formatRaceDateShort(broadcast.checkedAt)}
        </a>
      </div>
    </article>
  );
}

function FixtureRow({ fixture, category }: { fixture: SportFixture; category: string }) {
  return (
    <article className="grid gap-3 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-start">
      <time dateTime={fixture.eventDate} className="text-sm font-semibold text-accent">
        {formatRaceDateShort(fixture.eventDate)}
      </time>
      <div className="min-w-0">
        <h3 className="font-semibold leading-snug">{fixture.name}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          {[fixture.city, fixture.country].filter(Boolean).join(", ") || "Location to be confirmed"}
        </p>
        <ul
          className="mt-2 flex flex-wrap gap-1.5"
          aria-label="Distances and local race start times"
        >
          {fixture.starts.map((start, index) => (
            <li
              key={`${start.distance}-${index}`}
              className="rounded-md bg-elevated px-2 py-1 text-xs text-muted"
            >
              {formatDistanceWithUnits(start.distance)} ·{" "}
              {start.time
                ? `${/^\d{2}:\d{2}/.test(start.time) ? start.time.slice(0, 5) : start.time} local`
                : "Start time TBC"}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-x-4 sm:flex-col sm:items-end">
        {fixture.website ? (
          <a href={fixture.website} target="_blank" rel="noopener noreferrer" className={textLink}>
            Official event <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
        <Link to="/results" search={{ category, q: fixture.name }} className={textLink}>
          Past results <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
