import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Footprints,
  MapPin,
  Medal,
  Mountain,
  Search,
  Timer,
} from "lucide-react";
import { getHomeSportUpdates, getHomeStats, listEvents } from "@/lib/athrecs/api";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import type { HomeSportUpdate } from "@/lib/athrecs/home-updates";
import type { EventListItem, Sport } from "@/lib/athrecs/types";
import { SITE_URL } from "../seo";

const BOARD_VIEWS = ["upcoming", "results", "regional"] as const;
type BoardView = (typeof BOARD_VIEWS)[number];

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { board?: BoardView } => {
    const board =
      typeof search.board === "string" && BOARD_VIEWS.includes(search.board as BoardView)
        ? (search.board as BoardView)
        : undefined;
    return { board: board && board !== "upcoming" ? board : undefined };
  },
  head: () => ({
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  loader: async () => {
    const [stats, running, parkruns, updates] = await Promise.all([
      getHomeStats(),
      listEvents({ data: { sport: "Running", upcomingOnly: true, limit: 6 } }),
      listEvents({ data: { sport: "Parkrun", upcomingOnly: true, limit: 6 } }),
      getHomeSportUpdates(),
    ]);
    const races = [...running, ...parkruns]
      .filter((race, index, rows) => rows.findIndex((candidate) => candidate.id === race.id) === index)
      .sort((left, right) =>
        (left.next_date ?? "9999-12-31").localeCompare(right.next_date ?? "9999-12-31"),
      )
      .slice(0, 8);
    return { stats, races, updates };
  },
  component: RunRecsHomePage,
});

const distances = [
  { label: "parkrun", sport: "Parkrun" as const, distance: undefined, icon: Footprints },
  { label: "5K", sport: "Running" as const, distance: "5K", icon: Timer },
  { label: "10K", sport: "Running" as const, distance: "10K", icon: Timer },
  { label: "Half marathon", sport: "Running" as const, distance: "Half", icon: Footprints },
  { label: "Marathon", sport: "Running" as const, distance: "Marathon", icon: Medal },
  { label: "Ultra marathon", sport: "Running" as const, distance: "Ultra", icon: Mountain },
] as const;

const qualifiers = [
  { name: "Boston", slug: "boston-marathon" },
  { name: "Comrades", slug: "comrades-marathon" },
  { name: "Two Oceans", slug: "two-oceans-marathon" },
] as const;

function RunRecsHomePage() {
  const { stats, races, updates } = Route.useLoaderData();
  const navigate = useNavigate();
  const routeSearch = Route.useSearch();
  const [query, setQuery] = useState("");
  const boardView = routeSearch.board ?? "upcoming";

  const results = useMemo(
    () => updates.filter((update) => update.kind === "results").slice(0, 8),
    [updates],
  );
  const regional = useMemo(() => updates.filter((update) => update.kind === "fixture").slice(0, 8), [updates]);
  const sportStats = (sport: Sport) =>
    stats.bySport.find((item) => item.sport === sport) ?? { sport, n: 0, upcoming: 0 };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/races",
      search: { q: query.trim() || undefined },
    });
  };

  return (
    <div className="space-y-6 pb-8">
      <section className="grid gap-7 border-b border-border pb-7 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.5fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Running races · Results · Athletes
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Find your next run.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Search road, trail, fell and ultra races, plus parkruns, from local events to world majors.
          </p>
          <form
            onSubmit={submitSearch}
            className="mt-5 grid max-w-3xl gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            role="search"
          >
            <label className="sr-only" htmlFor="runrecs-race-search">
              Race, place or series
            </label>
            <input
              id="runrecs-race-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Race, place or series"
              className="h-12 min-w-0 rounded-xl border border-border bg-surface px-4 text-sm text-fg outline-none placeholder:text-subtle focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-fg transition-colors hover:bg-accent"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Find running events
            </button>
          </form>
        </div>

        <dl className="grid grid-cols-3 gap-3" aria-label="RunRecs coverage">
          <HomeStat label="Events" value={stats.events} />
          <HomeStat label="Clubs" value={stats.clubs} />
          <HomeStat label="Athletes" value={stats.athletes} />
        </dl>
      </section>

      <nav className="flex flex-wrap gap-2" aria-label="Running disciplines">
        {(["Running", "Parkrun"] as const).map((sport) => (
          <Link
            key={sport}
            to="/races"
            search={{ sport }}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-fg no-underline transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <Footprints className="h-4 w-4" aria-hidden="true" />
            <span>{sport === "Parkrun" ? "parkrun" : "Running races"}</span>
            <span className="text-xs tabular text-subtle">
              {sportStats(sport).n.toLocaleString()}
            </span>
          </Link>
        ))}
      </nav>

      <nav className="flex flex-wrap gap-2" aria-label="Running distances">
        {distances.map((item) => (
          <Link
            key={item.label}
            to="/races"
            search={{ sport: item.sport, distance: item.distance }}
            className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 text-sm font-semibold no-underline transition-colors ${
              item.distance === "Ultra"
                ? "border-primary bg-accent-soft text-accent hover:bg-primary hover:text-primary-fg"
                : "border-border bg-surface text-fg hover:border-accent hover:bg-accent-soft"
            }`}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-4 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Live from the running calendar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
                Run board
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Run board view">
              {BOARD_VIEWS.map((view) => (
                <button
                  key={view}
                  type="button"
                  role="tab"
                  aria-selected={boardView === view}
                  onClick={() => {
                    void navigate({
                      to: "/",
                      search: { board: view === "upcoming" ? undefined : view },
                      replace: true,
                      resetScroll: false,
                    });
                  }}
                  className={`min-h-9 rounded-lg border px-3 text-sm font-semibold capitalize transition-colors ${
                    boardView === view
                      ? "border-primary bg-primary text-primary-fg"
                      : "border-border bg-bg text-muted hover:border-accent hover:text-fg"
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>
          </header>

          <div className="px-4 pb-2 sm:px-5">
            {boardView === "upcoming" ? (
              races.length ? (
                races.map((race) => <HomeRaceRow key={race.id} race={race} />)
              ) : (
                <RaceBoardEmpty>New running fixtures will appear here as they are verified.</RaceBoardEmpty>
              )
            ) : boardView === "results" ? (
              results.length ? (
                results.map((update) => <HomeUpdateRow key={update.id} update={update} />)
              ) : (
                <RaceBoardEmpty>Verified running result links will appear here.</RaceBoardEmpty>
              )
            ) : regional.length ? (
              regional.map((update) => <HomeUpdateRow key={update.id} update={update} />)
            ) : (
              <RaceBoardEmpty>Regional running updates will appear here.</RaceBoardEmpty>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg px-4 py-3 sm:px-5">
            <span className="text-xs text-subtle">
              {stats.upcoming.toLocaleString()} upcoming running race days indexed
            </span>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              Full calendar <ArrowRight className="h-4 w-4" />
            </Link>
          </footer>
        </section>

        <aside className="space-y-3">
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
            <h2 className="font-display text-xl font-semibold text-fg">Quick view</h2>
            <div className="mt-3 divide-y divide-border">
              <QuickLink to="/races" label="Open entries" detail="View running races" />
              <QuickLink to="/calendar" label="Recently added" detail="Global running calendar" />
              <QuickLink to="/race-series" label="Race series" detail="Majors · UTMB" />
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
                Qualifiers
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {qualifiers.map((qualifier) => (
                  <Link
                    key={qualifier.slug}
                    to="/races/$slug"
                    params={{ slug: qualifier.slug }}
                    className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent no-underline hover:underline"
                  >
                    {qualifier.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <QuickPanelLink to="/athletes" label="Explore runners" />
          <QuickPanelLink to="/claim-results" label="Claim running results" accent />
          <QuickPanelLink to="/clubs" label="Find a running club" />
        </aside>
      </div>
    </div>
  );
}

function HomeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l-2 border-primary pl-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-semibold tabular text-fg sm:text-2xl">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function HomeRaceRow({ race }: { race: EventListItem }) {
  return (
    <article className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <time className="text-xs font-semibold text-accent" dateTime={race.next_date ?? undefined}>
        {race.next_date ? formatHomeDate(race.next_date) : "Date TBC"}
      </time>
      <div className="min-w-0">
        <Link
          to="/races/$slug"
          params={{ slug: race.slug }}
          className="font-semibold text-fg no-underline hover:text-accent"
        >
          {race.name}
        </Link>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{[race.city, race.country].filter(Boolean).join(", ")}</span>
        </p>
      </div>
      <span className="w-fit rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-muted">
        {race.next_distance ? formatDistanceWithUnits(race.next_distance) : race.sport}
      </span>
    </article>
  );
}

function HomeUpdateRow({ update }: { update: HomeSportUpdate }) {
  return (
    <article className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <time className="text-xs font-semibold text-accent" dateTime={update.eventDate}>
        {formatHomeDate(update.eventDate)}
      </time>
      <div className="min-w-0">
        <Link
          to="/races/$slug"
          params={{ slug: update.eventSlug }}
          className="font-semibold text-fg no-underline hover:text-accent"
        >
          {update.eventName}
        </Link>
        <p className="mt-1 truncate text-xs text-muted">
          {[update.city, update.country].filter(Boolean).join(", ")}
          {update.providerName ? ` · ${update.providerName}` : ""}
        </p>
      </div>
      <span className="w-fit rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-muted">
        {update.kind === "results" ? "Results" : formatDistanceWithUnits(update.distance)}
      </span>
    </article>
  );
}

function RaceBoardEmpty({ children }: { children: React.ReactNode }) {
  return <p className="py-8 text-center text-sm text-muted">{children}</p>;
}

function QuickLink({ to, label, detail }: { to: "/races" | "/calendar" | "/race-series"; label: string; detail: string }) {
  return (
    <Link to={to} className="flex items-center justify-between gap-3 py-3 text-sm no-underline">
      <span className="font-semibold text-fg">{label}</span>
      <span className="text-xs text-subtle">{detail}</span>
    </Link>
  );
}

function QuickPanelLink({
  to,
  label,
  accent = false,
}: {
  to: "/athletes" | "/claim-results" | "/clubs";
  label: string;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex min-h-11 items-center justify-between rounded-xl border px-4 text-sm font-semibold text-fg no-underline shadow-card ${
        accent
          ? "border-accent/30 bg-accent-soft hover:border-accent"
          : "border-border bg-surface hover:border-accent"
      }`}
    >
      {label} <ArrowRight className="h-4 w-4 text-accent" />
    </Link>
  );
}

function formatHomeDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
