import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bike,
  Droplets,
  Footprints,
  MapPin,
  Medal,
  Mountain,
  Search,
  Ship,
  Timer,
  Waves,
  Zap,
} from "lucide-react";
import { getHomeSportUpdates, getHomeStats, listEvents } from "@/lib/athrecs/api";
import { SPORTS } from "@/lib/athrecs/filters";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import {
  homeRegionLabel,
  selectBalancedHomeUpdates,
  type HomeSportUpdate,
} from "@/lib/athrecs/home-updates";
import type { EventListItem, Sport } from "@/lib/athrecs/types";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [stats, running, updates] = await Promise.all([
      getHomeStats(),
      listEvents({
        data: { sport: "Running", upcomingOnly: true, limit: 4 },
      }),
      getHomeSportUpdates(),
    ]);
    return { stats, running, updates };
  },
  component: HomePage,
});

const HOME_SPORTS: readonly (Sport | "All")[] = [
  "All",
  "Running",
  "Athletics",
  "Triathlon",
  "Cycling",
  "Swimming",
  "Parkrun",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
];

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

type BoardView = "upcoming" | "results" | "regional";

function HomePage() {
  const { stats, running, updates } = Route.useLoaderData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [boardView, setBoardView] = useState<BoardView>("upcoming");

  const results = useMemo(
    () => updates.filter((update) => update.kind === "results").slice(0, 4),
    [updates],
  );
  const regional = useMemo(() => selectBalancedHomeUpdates(updates, "All", "All", 4), [updates]);
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
            Global races · Results · Athletes
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">
            Find your next race.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Search every distance and sport, from local events to world majors.
          </p>
          <form
            onSubmit={submitSearch}
            className="mt-5 grid max-w-3xl gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
            role="search"
          >
            <label className="sr-only" htmlFor="homepage-race-search">
              Race, place or series
            </label>
            <input
              id="homepage-race-search"
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
              Find races
            </button>
          </form>
        </div>

        <dl className="grid grid-cols-3 gap-3" aria-label="Athrecs coverage">
          <HomeStat label="Events" value={stats.events} />
          <HomeStat label="Clubs" value={stats.clubs} />
          <HomeStat label="Athletes" value={stats.athletes} />
        </dl>
      </section>

      <nav className="flex flex-wrap gap-2" aria-label="Sports">
        {HOME_SPORTS.map((sport) => {
          const content = (
            <>
              {sport !== "All" ? <SportGlyph sport={sport} className="h-4 w-4" /> : null}
              <span>{sport === "All" ? "All sports" : sport}</span>
              {sport !== "All" ? (
                <span className="text-xs tabular text-subtle">
                  {sportStats(sport).n.toLocaleString()}
                </span>
              ) : null}
            </>
          );
          const className =
            "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-medium text-fg no-underline transition-colors hover:border-accent hover:bg-accent-soft";

          return sport === "All" ? (
            <Link key={sport} to="/races" className={className}>
              {content}
            </Link>
          ) : (
            <Link key={sport} to="/races" search={{ sport }} className={className}>
              {content}
            </Link>
          );
        })}
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
                Live from the calendar
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
                Race board
              </h2>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Race board view">
              {(["upcoming", "results", "regional"] as const).map((view) => (
                <button
                  key={view}
                  id={`race-board-tab-${view}`}
                  type="button"
                  role="tab"
                  aria-controls="race-board-panel"
                  aria-selected={boardView === view}
                  onClick={() => setBoardView(view)}
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

          <div
            id="race-board-panel"
            role="tabpanel"
            aria-labelledby={`race-board-tab-${boardView}`}
            className="px-4 pb-2 sm:px-5"
          >
            {boardView === "upcoming" ? (
              running.length ? (
                running.map((race) => <HomeRaceRow key={race.id} race={race} />)
              ) : (
                <RaceBoardEmpty>New fixtures will appear here as they are verified.</RaceBoardEmpty>
              )
            ) : boardView === "results" ? (
              results.length ? (
                results.map((update) => <HomeUpdateRow key={update.id} update={update} />)
              ) : (
                <RaceBoardEmpty>Verified result links will appear here.</RaceBoardEmpty>
              )
            ) : regional.length ? (
              regional.map((update) => <HomeUpdateRow key={update.id} update={update} regional />)
            ) : (
              <RaceBoardEmpty>Regional fixture and result updates will appear here.</RaceBoardEmpty>
            )}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-bg px-4 py-3 sm:px-5">
            <span className="text-xs text-subtle">
              {stats.upcoming.toLocaleString()} upcoming race days indexed
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
              <QuickLink to="/races" label="Open entries" detail="View races" />
              <QuickLink to="/calendar" label="Recently added" detail="International races" />
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

          <Link
            to="/athletes"
            className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg no-underline shadow-card hover:border-accent"
          >
            Explore athletes <ArrowRight className="h-4 w-4 text-accent" />
          </Link>
          <Link
            to="/clubs"
            className="flex min-h-11 items-center justify-between rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg no-underline shadow-card hover:border-accent"
          >
            Find a club <ArrowRight className="h-4 w-4 text-accent" />
          </Link>
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

function HomeUpdateRow({
  update,
  regional = false,
}: {
  update: HomeSportUpdate;
  regional?: boolean;
}) {
  const place = regional
    ? homeRegionLabel(update)
    : [update.city, update.country].filter(Boolean).join(", ");
  return (
    <article className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <span className="text-xs font-semibold text-accent">
        {update.kind === "results" && !regional ? "Results" : formatHomeDate(update.eventDate)}
      </span>
      <div className="min-w-0">
        <Link
          to="/races/$slug"
          params={{ slug: update.eventSlug }}
          className="font-semibold text-fg no-underline hover:text-accent"
        >
          {update.eventName}
        </Link>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{place || "Location TBC"}</span>
        </p>
      </div>
      <span className="w-fit rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-muted">
        {update.sport}
      </span>
    </article>
  );
}

function RaceBoardEmpty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>;
}

function QuickLink({
  to,
  label,
  detail,
}: {
  to: "/races" | "/calendar" | "/race-series";
  label: string;
  detail: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-3 py-3 text-sm no-underline first:pt-0 last:pb-0"
    >
      <span className="font-medium text-fg">{label}</span>
      <span className="text-right text-xs text-muted">{detail}</span>
    </Link>
  );
}

function SportGlyph({ sport, className }: { sport: Sport; className?: string }) {
  if (sport === "Cycling" || sport === "Aquabike") return <Bike className={className} />;
  if (sport === "Swimming") return <Droplets className={className} />;
  if (sport === "Triathlon") return <Timer className={className} />;
  if (sport === "Duathlon") return <Zap className={className} />;
  if (sport === "Aquathlon") return <Waves className={className} />;
  if (sport === "Rowing") return <Ship className={className} />;
  if (sport === "OCR") return <Mountain className={className} />;
  if (sport === "Athletics") return <Medal className={className} />;
  return <Footprints className={className} />;
}

function formatHomeDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

if (HOME_SPORTS.length !== SPORTS.length || SPORTS.some((sport) => !HOME_SPORTS.includes(sport))) {
  throw new Error("Homepage sport navigation must include every supported sport");
}
