import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, MapPin, UserRound } from "lucide-react";
import { AthleteDirectoryCard } from "@/components/athletes/AthleteDirectoryCard";
import { CompactFixtureRow } from "@/components/discovery/CompactFixtureRow";
import { useSavedFixtures } from "@/components/discovery/useSavedFixtures";
import { getAthleteDirectory } from "@/lib/athrecs/athlete-directory-api";
import { getRunningFixtures, getSportFixtures } from "@/lib/athrecs/sport-fixtures-api";
import {
  discoveryFixtureHref,
  discoveryPlaceMatches,
  parseDiscoverySearch,
} from "@/lib/athrecs/discovery-search";
import { getSportPage } from "@/lib/athrecs/sport-pages";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/search")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  validateSearch: parseDiscoverySearch,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (!deps.q) return null;
    const [athletes, fixtures] = await Promise.allSettled([
      getAthleteDirectory({ data: { q: deps.q, pageSize: 8, includeFacets: false } }),
      deps.sport
        ? getSportFixtures({ data: { ...deps, slug: deps.sport } })
        : getRunningFixtures({ data: deps }),
    ]);
    return {
      athletes: athletes.status === "fulfilled" ? athletes.value : null,
      fixtures: fixtures.status === "fulfilled" ? fixtures.value : null,
    };
  },
  headers: () => ({ "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, follow" }),
  head: () => ({
    meta: [
      { title: "Search athletes, fixtures and places | ATHRECS" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  pendingComponent: () => (
    <p role="status" className="p-8 text-muted">
      Searching athletes, fixtures and places…
    </p>
  ),
  errorComponent: ({ reset }) => (
    <div role="alert" className="space-y-3 p-8">
      <p>Search is temporarily unavailable.</p>
      <button onClick={reset} className="min-h-11 text-accent underline">
        Try again
      </button>
    </div>
  ),
  component: SearchPage,
});

const linkClass =
  "inline-flex min-h-11 items-center text-sm font-semibold text-accent no-underline hover:underline focus-visible:outline-2 focus-visible:outline-accent";
const headingClass = "flex items-center gap-2 font-display text-xl font-semibold";

function SearchPage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const saved = useSavedFixtures();
  const sportLabel = getSportPage(search.sport)?.label ?? "Running";
  const fixtures = data?.fixtures?.fixtures ?? [];
  const places = discoveryPlaceMatches(fixtures, search);
  const filters = [search.country, search.month, search.distance].filter(Boolean);

  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-3">
        <h1 className="font-display text-2xl font-semibold text-fg sm:text-3xl">
          {search.q ? `Search results for “${search.q}”` : "Search AthRecs"}
        </h1>
        <p className="text-sm text-muted">
          Find athletes by name, upcoming {sportLabel.toLowerCase()} fixtures and places.
        </p>
        {search.q ? (
          <nav aria-label="Search result categories" className="flex flex-wrap gap-x-6">
            <a href="#search-athletes" className={linkClass}>
              Athletes
            </a>
            <a href="#search-fixtures" className={linkClass}>
              Fixtures
            </a>
            <a href="#search-places" className={linkClass}>
              Places
            </a>
          </nav>
        ) : (
          <p className="text-sm text-muted">
            Enter a name, event or place in the search bar above.
          </p>
        )}
      </header>
      {data ? (
        <>
          <section
            id="search-athletes"
            aria-labelledby="search-athletes-heading"
            className="scroll-mt-52 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="search-athletes-heading" className={headingClass}>
                <UserRound className="size-5 text-accent" aria-hidden="true" />
                Athletes
              </h2>
              <Link to="/athletes" search={{ q: search.q }} className={linkClass}>
                See all matching athletes →
              </Link>
            </div>
            <p className="text-sm text-muted">Athlete names are searched across all sports.</p>
            {data.athletes ? (
              data.athletes.athletes.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {data.athletes.athletes.map((athlete) => (
                    <AthleteDirectoryCard key={athlete.id} athlete={athlete} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  No public athlete profiles matched this search. Try a full name or a different
                  spelling.
                </p>
              )
            ) : (
              <p role="status" className="text-sm text-muted">
                Athlete search is temporarily unavailable. Please try again.
              </p>
            )}
          </section>
          <section
            id="search-fixtures"
            aria-labelledby="search-fixtures-heading"
            className="scroll-mt-52 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="search-fixtures-heading" className={headingClass}>
                <CalendarDays className="size-5 text-accent" aria-hidden="true" />
                {sportLabel} fixtures
              </h2>
              <a href={discoveryFixtureHref(search)} className={linkClass}>
                See all matching fixtures →
              </a>
            </div>
            {filters.length ? (
              <p className="text-sm text-muted">
                Fixture filters: {filters.join(" · ")}.{" "}
                <a
                  href={`/search?${new URLSearchParams({ q: search.q ?? "", ...(search.sport ? { sport: search.sport } : {}) })}`}
                  className={linkClass}
                >
                  Clear fixture filters
                </a>
              </p>
            ) : null}
            {data.fixtures ? (
              fixtures.length ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  {fixtures.slice(0, 8).map((fixture) => (
                    <CompactFixtureRow
                      key={`${fixture.eventId}-${fixture.eventDate}`}
                      fixture={fixture}
                      saved={saved.isSaved(fixture)}
                      onToggleSaved={saved.toggleSaved}
                      saveReady={saved.ready}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  No upcoming fixtures matched this search
                  {filters.length ? " with these filters" : ""}.
                </p>
              )
            ) : (
              <p role="status" className="text-sm text-muted">
                Fixture search is temporarily unavailable. Please try again.
              </p>
            )}
          </section>
          <section
            id="search-places"
            aria-labelledby="search-places-heading"
            className="scroll-mt-52 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="search-places-heading" className={headingClass}>
                <MapPin className="size-5 text-accent" aria-hidden="true" />
                Places
              </h2>
              <Link to="/races/places" search={{}} className={linkClass}>
                Browse all places →
              </Link>
            </div>
            <p className="text-sm text-muted">
              Matching place names from the current fixture results.
            </p>
            {places.length ? (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {places.map((place) => (
                  <li key={place.href + place.country}>
                    <a
                      href={place.href}
                      className="flex min-h-14 items-center gap-3 rounded-xl border border-border bg-surface p-4 text-sm text-fg no-underline hover:border-accent focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <MapPin className="size-4 shrink-0 text-accent" aria-hidden="true" />
                      <span>
                        <strong className="block">{place.name}</strong>
                        {place.country && place.country !== place.name ? (
                          <span className="text-xs text-muted">{place.country}</span>
                        ) : null}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">
                {data.fixtures
                  ? "No place names matched within these fixture results."
                  : "Place matches are temporarily unavailable."}
              </p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
