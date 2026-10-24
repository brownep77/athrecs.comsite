import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  BookOpen,
  CalendarDays,
  ChevronDown,
  Handshake,
  MapPin,
  Search,
  Trophy,
  Tv,
  UserRound,
  X,
} from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { Button } from "@/components/ui/button";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { disciplineIntros, sportGuideText } from "@/lib/athrecs/sport-guide-text";
import {
  parseSportFixtureSearch,
  type SportFixtureSearch,
  type SportPage,
} from "@/lib/athrecs/sport-pages";
import type { SportFixture } from "@/lib/athrecs/sport-fixtures.server";
import type { SportBroadcast } from "@/data/sport-broadcasts";
import { CompactFixtureRow } from "./CompactFixtureRow";
import { useSavedFixtures } from "./useSavedFixtures";
import {
  DISCOVERY_COUNTRIES,
  discoverySportLinks,
  fixtureFilterLabel,
  fixturePageTitle,
} from "./discovery-navigation";

type Props = {
  sport?: SportPage;
  search: SportFixtureSearch;
  fixtures: SportFixture[];
  countries: string[];
  distances: string[];
  months: string[];
  page: number;
  hasMore: boolean;
  broadcasts?: SportBroadcast[];
};

const preview = import.meta.env.VITE_ATHRECS_LAYOUT_PREVIEW === "true";
const sideLink =
  "flex min-h-10 items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] text-muted no-underline hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-accent";
const actionLink =
  "inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-accent no-underline hover:underline focus-visible:outline-2 focus-visible:outline-accent";
const field =
  "h-11 w-full min-w-0 rounded-md border border-border bg-white px-3 text-base text-fg outline-none focus:ring-2 focus:ring-accent/40 sm:text-sm";

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
}

function displayDistance(distance: string) {
  return distance === "Half" ? "Half marathon" : distance === "Ultra" ? "Ultramarathon" : distance;
}

export function CompactDiscoveryPage({
  sport,
  search,
  fixtures,
  countries,
  distances,
  months,
  page,
  hasMore,
  broadcasts = [],
}: Props) {
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const saved = useSavedFixtures();
  const running = !sport || sport.sport === "Running";
  const pathname = sport ? `/sports/${sport.slug}` : "/";
  const sportName = sport?.sport ?? "Running";
  const hasFilters = Boolean(search.q || search.country || search.month || search.distance);
  const resultPath = sport ? `/results?category=${sport.slug}` : "/results?category=all-running";
  const directoryPath = `/clubs?sport=${encodeURIComponent(sportName)}`;
  const options = {
    countries:
      search.country && !countries.includes(search.country)
        ? [search.country, ...countries]
        : countries,
    months: [...new Set([...(search.month ? [search.month] : []), ...months])].sort(),
    distances:
      search.distance && !distances.includes(search.distance)
        ? [search.distance, ...distances]
        : distances,
  };

  function changeSearch(next: SportFixtureSearch) {
    if (sport)
      void navigate({
        to: "/sports/$sport",
        params: { sport: sport.slug },
        search: next,
        hash: "fixtures",
      });
    else void navigate({ to: "/", search: next, hash: "fixtures" });
  }
  function filter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    changeSearch(parseSportFixtureSearch(Object.fromEntries(new FormData(event.currentTarget))));
  }

  return (
    <div className="compact-discovery">
      <nav
        aria-label={`${sportName} sections`}
        className="overflow-x-auto bg-[#075667] px-2 text-white sm:px-5 lg:px-7"
      >
        <ul className="flex min-w-max items-stretch gap-1">
          {[
            { label: "Fixtures", path: "#fixtures", active: true },
            { label: "Results", path: resultPath },
            { label: "Athletes", path: `/athletes?sport=${encodeURIComponent(sportName)}` },
            { label: "Clubs", path: directoryPath },
            {
              label: running ? "Guides & series" : "Sport information",
              path: running ? "/running/guides" : "#sport-information",
            },
            { label: "Offers & opportunities", path: "/opportunities" },
          ].map((item) => (
            <li key={item.label}>
              <a
                href={item.path}
                aria-current={item.active ? "page" : undefined}
                className={`inline-flex min-h-12 items-center border-b-3 px-3 text-sm font-medium no-underline hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white sm:px-4 ${item.active ? "border-[#55eadb]" : "border-transparent"}`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid items-start gap-5 bg-[#f5f8f9] px-3 py-5 sm:px-5 lg:grid-cols-[190px_minmax(0,1fr)] lg:px-6 xl:grid-cols-[205px_minmax(0,1fr)_245px] xl:gap-6 2xl:px-8">
        <aside
          className="rounded-lg border border-border bg-white p-3 lg:sticky lg:top-37 lg:max-h-[calc(100dvh_-_10.25rem)] lg:overflow-y-auto lg:overscroll-contain"
          aria-label={`${sportName} navigation`}
        >
          <div>
            <button
              type="button"
              aria-expanded={showSidebar}
              aria-controls="discovery-sidebar-content"
              onClick={() => setShowSidebar(!showSidebar)}
              className="flex min-h-11 w-full items-center justify-between text-sm font-semibold lg:hidden"
            >
              Explore {sportName.toLowerCase()} & guides
              <ChevronDown className="size-4" aria-hidden="true" />
            </button>
            <div
              id="discovery-sidebar-content"
              className={showSidebar ? "block" : "hidden lg:block"}
            >
              <section aria-labelledby="discovery-sport-label">
                <h2 id="discovery-sport-label" className="px-2.5 py-2 text-base font-bold">
                  {sportName === "Athletics"
                    ? "Athletics"
                    : sportName === "Parkrun"
                      ? "parkrun"
                      : sportName}
                </h2>
                <nav aria-label={`${sportName} disciplines`}>
                  {discoverySportLinks(sport).map((link) => (
                    <a
                      key={link.path}
                      href={link.path}
                      aria-current={link.path === pathname ? "page" : undefined}
                      className={`${sideLink} ${link.path === pathname ? "border-l-3 border-accent bg-accent-soft font-semibold text-accent" : ""}`}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              </section>
              <section
                className="mt-4 border-t border-border pt-3"
                aria-labelledby="explore-place-heading"
              >
                <h2
                  id="explore-place-heading"
                  className="flex items-center gap-2 px-2.5 py-2 text-sm font-bold"
                >
                  <MapPin className="size-4 text-accent" aria-hidden="true" />
                  Explore by place
                </h2>
                <nav aria-label="Explore by country">
                  {DISCOVERY_COUNTRIES.map((country) => (
                    <a
                      key={country.slug}
                      href={
                        !sport
                          ? country.path
                          : `${pathname}?country=${encodeURIComponent(country.name)}`
                      }
                      className={sideLink}
                    >
                      <CountryFlag country={country.name} />
                      <span>{country.name}</span>
                    </a>
                  ))}
                </nav>
              </section>
              <section
                className="mt-4 border-t border-border pt-3"
                aria-labelledby="left-guides-heading"
              >
                <h2
                  id="left-guides-heading"
                  className="flex items-center gap-2 px-2.5 py-2 text-sm font-bold"
                >
                  <BookOpen className="size-4 text-accent" aria-hidden="true" />
                  {running ? "Guides" : "Sport links"}
                </h2>
                {running ? (
                  <nav aria-label="Running guides">
                    <a href="/running/guides" className={sideLink}>
                      All running guides
                    </a>
                    <details>
                      <summary className={`${sideLink} cursor-pointer justify-between`}>
                        Road marathon guides
                        <ChevronDown className="size-3.5 shrink-0" aria-hidden="true" />
                      </summary>
                      <div className="ml-3 border-l border-border pl-1">
                        {DISCOVERY_COUNTRIES.map((country) => (
                          <a key={country.slug} href={country.guidePath} className={sideLink}>
                            {country.name} marathons
                          </a>
                        ))}
                      </div>
                    </details>
                    <a href="/running/guides#race-series" className={sideLink}>
                      Race series
                    </a>
                    <a href="/running/guides#race-guides" className={sideLink}>
                      Individual race guides
                    </a>
                  </nav>
                ) : (
                  <nav aria-label={`${sportName} resources`}>
                    <a href="#sport-information" className={sideLink}>
                      Plan your event
                    </a>
                    <a href="#on-tv" className={sideLink}>
                      TV & live streams
                    </a>
                    <a href={`/directory?sport=${sport!.slug}`} className={sideLink}>
                      Federations & governing bodies
                    </a>
                    <a href={`/race-reports?sport=${sport!.slug}`} className={sideLink}>
                      Race reports
                    </a>
                  </nav>
                )}
              </section>
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-5">
          <header className="px-1">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
              {sport ? sport.label : "Running on AthRecs"}
            </p>
            <h1 className="font-display text-[clamp(1.6rem,2.4vw,2.5rem)] font-semibold leading-tight tracking-tight text-[#18313b]">
              {fixturePageTitle(sport)}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
              {sport
                ? (disciplineIntros[sport.slug] ?? sportGuideText(sport.sport).intro)
                : "Your next start line, all in one place. Find races, compare dates and save your favourites."}
            </p>
          </header>

          <section id="fixtures" className="scroll-mt-44" aria-labelledby="fixtures-heading">
            <h2 id="fixtures-heading" className="sr-only">
              Upcoming {sportName.toLowerCase()} fixtures
            </h2>
            <form
              action={pathname}
              method="get"
              onSubmit={filter}
              role="search"
              key={`${pathname}-${JSON.stringify(search)}`}
              className="mb-4 space-y-3"
            >
              {search.q && <input type="hidden" name="q" value={search.q} />}
              <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <label
                  className="col-span-2 space-y-1.5 text-xs font-semibold sm:col-span-1"
                  htmlFor="compact-country"
                >
                  <span>Country</span>
                  <select
                    id="compact-country"
                    name="country"
                    defaultValue={search.country ?? ""}
                    className={field}
                  >
                    <option value="">All countries</option>
                    {options.countries.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-semibold" htmlFor="compact-month">
                  <span>Month</span>
                  <select
                    id="compact-month"
                    name="month"
                    defaultValue={search.month ?? ""}
                    className={field}
                  >
                    <option value="">Any month</option>
                    {options.months.map((value) => (
                      <option key={value} value={value}>
                        {monthLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5 text-xs font-semibold" htmlFor="compact-distance">
                  <span>{fixtureFilterLabel(sport)}</span>
                  <select
                    id="compact-distance"
                    name="distance"
                    defaultValue={search.distance ?? ""}
                    className={field}
                  >
                    <option value="">
                      {sportName === "Athletics"
                        ? "All events"
                        : sportName === "Triathlon" || sportName === "Duathlon"
                          ? "All formats"
                          : "All distances"}
                    </option>
                    {options.distances.map((value) => (
                      <option key={value} value={value}>
                        {displayDistance(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" className="col-span-2 h-11 sm:col-span-1">
                  <Search className="size-4" aria-hidden="true" />
                  Search
                </Button>
              </div>
            </form>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs text-muted">
                Upcoming fixtures · Soonest first{search.q ? ` · “${search.q}”` : ""}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => changeSearch({})}
                  className="inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-accent"
                >
                  <X className="size-3.5" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
            <div className="divide-y divide-border rounded-lg border border-border bg-white">
              {fixtures.length ? (
                fixtures.map((fixture) => (
                  <CompactFixtureRow
                    key={`${fixture.eventId}-${fixture.eventDate}`}
                    fixture={fixture}
                    saved={saved.isSaved(fixture)}
                    onToggleSaved={saved.toggleSaved}
                    saveReady={saved.ready}
                  />
                ))
              ) : (
                <div className="p-7 text-center">
                  <CalendarDays className="mx-auto mb-3 size-7 text-accent" aria-hidden="true" />
                  <h3 className="text-base font-semibold">
                    {hasFilters
                      ? "No fixtures match these filters"
                      : "No upcoming fixtures listed yet"}
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                    {hasFilters
                      ? "Try another country, month or distance, or clear your filters."
                      : `Check the ${sportName.toLowerCase()} information and organiser links below for more ways to explore.`}
                  </p>
                  {hasFilters && (
                    <button type="button" className={actionLink} onClick={() => changeSearch({})}>
                      Show all upcoming fixtures
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              )}
            </div>
            {(page > 1 || hasMore) && (
              <nav
                aria-label="Fixture pages"
                className="mt-3 flex items-center justify-between gap-3"
              >
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => changeSearch({ ...search, page: page - 1 })}
                  className={`${actionLink} disabled:invisible`}
                >
                  ← Previous
                </button>
                <span className="text-xs text-muted">Page {page}</span>
                <button
                  type="button"
                  disabled={!hasMore || page >= 400}
                  onClick={() => changeSearch({ ...search, page: page + 1 })}
                  className={`${actionLink} disabled:invisible`}
                >
                  Next
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </nav>
            )}
          </section>

          {running && (
            <section
              className="flex flex-wrap items-center gap-3 rounded-lg border border-accent/20 bg-accent-soft/60 p-4"
              aria-labelledby="running-guides-promo"
            >
              <BookOpen className="size-8 shrink-0 text-accent" aria-hidden="true" />
              <div className="min-w-0 flex-1 basis-44">
                <h2 id="running-guides-promo" className="font-display text-lg font-semibold">
                  A little planning. A better race day.
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Country marathon guides, course previews and race series.
                </p>
              </div>
              <a href="/running/guides" className={actionLink}>
                Explore guides
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </section>
          )}

          <section
            id="sport-information"
            className="scroll-mt-44 rounded-lg border border-border bg-white p-4"
            aria-labelledby="sport-planning-heading"
          >
            <h2 id="sport-planning-heading" className="text-sm font-semibold">
              {sportName === "Athletics"
                ? "Plan your meeting"
                : sportName === "Cycling"
                  ? "Plan your ride"
                  : sportName === "Swimming"
                    ? "Plan your swim"
                    : sportName === "Parkrun"
                      ? "Before you head to parkrun"
                      : "Plan your race"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {sportGuideText(sportName).planning}
            </p>
            {sportName === "Athletics" && (
              <a
                href="https://worldathletics.org/competition/calendar-results?disciplineId=5"
                target="_blank"
                rel="noopener noreferrer"
                className={actionLink}
              >
                World Athletics calendar & results
                <ArrowUpRight className="size-4" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <div className="mt-2 flex flex-wrap gap-x-5">
              <a href={resultPath} className={actionLink}>
                <Trophy className="size-4" aria-hidden="true" />
                Browse results
              </a>
              <a href={`/athletes?sport=${encodeURIComponent(sportName)}`} className={actionLink}>
                Find an athlete
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </section>

          {sport && (
            <section
              id="on-tv"
              className="scroll-mt-44 rounded-lg border border-border bg-white p-4"
              aria-labelledby="watch-sport-heading"
            >
              <h2
                id="watch-sport-heading"
                className="flex items-center gap-2 text-sm font-semibold"
              >
                <Tv className="size-4 text-accent" aria-hidden="true" />
                TV & live streams
              </h2>
              {broadcasts.length ? (
                <div className="mt-2 divide-y divide-border">
                  {broadcasts.map((broadcast) => (
                    <article key={broadcast.id} className="py-3">
                      <p className="text-xs font-semibold text-accent">
                        {formatRaceDateShort(broadcast.startDate)}
                        {broadcast.endDate !== broadcast.startDate
                          ? ` – ${formatRaceDateShort(broadcast.endDate)}`
                          : ""}
                      </p>
                      <h3 className="mt-1 text-sm font-semibold">{broadcast.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-muted">
                        {broadcast.broadcaster} · {broadcast.availability}
                      </p>
                      <a
                        href={broadcast.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={actionLink}
                      >
                        Where to watch
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-muted">
                  No upcoming coverage is confirmed here yet. Check the event organiser’s latest
                  broadcast information.
                </p>
              )}
            </section>
          )}
        </div>

        <aside aria-label="Your AthRecs" className="space-y-4 lg:col-start-2 xl:col-start-auto">
          <section className="rounded-lg border border-border bg-white p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold">
              <UserRound className="size-5 text-accent" aria-hidden="true" />
              My AthRecs
            </h2>
            <p className="mt-4 font-display text-xl font-semibold leading-tight">
              Your sporting history.
              <br />
              Together.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Find your results and build your athlete profile.
            </p>
            {preview ? (
              <p className="mt-4 rounded-md bg-[#edf5f6] p-3 text-xs leading-5 text-muted">
                Account features are switched off in this test preview.
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                <Button asChild className="w-full">
                  <Link to="/athlete-account">Find my results</Link>
                </Button>
                <Link
                  to="/my-athlete-profile"
                  className="flex min-h-10 items-center justify-center text-xs font-semibold text-accent underline"
                >
                  My athlete profile
                </Link>
              </div>
            )}
          </section>
          <section className="rounded-lg border border-accent/20 bg-[#e6f4f6] p-4">
            <div className="flex items-center gap-2">
              <Handshake className="size-6 shrink-0 text-accent" aria-hidden="true" />
              <h2 className="text-base font-bold">Partner with AthRecs</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Connect your brand with athletes, clubs and event communities.
            </p>
            <Link to="/brands" className={`${actionLink} mt-2`}>
              Explore partnerships
              <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
            </Link>
          </section>
          <section
            id="saved-fixtures"
            className="scroll-mt-44 rounded-lg border border-border bg-white p-4"
            aria-labelledby="saved-fixtures-heading"
          >
            <h2 id="saved-fixtures-heading" className="flex items-center gap-2 text-sm font-bold">
              <Bookmark className="size-4 text-accent" aria-hidden="true" />
              Saved races
              <span className="ml-auto rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">
                {saved.savedFixtures.length}
              </span>
            </h2>
            {!saved.savedFixtures.length ? (
              <p className="py-6 text-center text-sm leading-6 text-muted">
                Save an event to start your shortlist.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {saved.savedFixtures.map((fixture) => (
                  <li key={fixture.key} className="flex items-start gap-2 py-3">
                    <a
                      href={`/races/${encodeURIComponent(fixture.slug)}`}
                      className="min-w-0 flex-1 text-sm font-semibold text-fg no-underline hover:text-accent"
                    >
                      <span className="block">{fixture.name}</span>
                      <span className="mt-1 block text-xs font-normal text-muted">
                        {formatRaceDateShort(fixture.eventDate)}
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => saved.removeSaved(fixture.key)}
                      aria-label={`Remove ${fixture.name} from saved races`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-elevated"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="border-t border-border pt-3 text-[11px] leading-5 text-muted">
              {saved.persistenceAvailable
                ? "Saved on this browser, across all sports."
                : "Browser storage is unavailable. Your shortlist lasts for this visit."}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
