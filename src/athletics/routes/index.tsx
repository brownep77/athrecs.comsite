import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Flag,
  MapPin,
  Medal,
  Search,
  Timer,
  Trophy,
  Users,
  UsersRound,
} from "lucide-react";
import { getHomeSportUpdates, getHomeStats, listEvents } from "@/lib/athrecs/api";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { SITE_URL } from "@/lib/athrecs/seo";
import type { HomeSportUpdate } from "@/lib/athrecs/home-updates";
import type { EventListItem } from "@/lib/athrecs/types";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  loader: async () => {
    const [stats, events, updates] = await Promise.all([
      getHomeStats(),
      listEvents({ data: { sport: "Athletics", upcomingOnly: true, limit: 8 } }),
      getHomeSportUpdates(),
    ]);
    return { stats, events, updates };
  },
  component: AthleticsHomePage,
});

const DISCIPLINES = [
  { label: "Track & field", surface: "Track", icon: Medal },
  { label: "Cross country", surface: "XC", icon: Flag },
  { label: "Road athletics", surface: "Road", icon: Timer },
  { label: "Championships", q: "championship", icon: Trophy },
] as const;

function AthleticsHomePage() {
  // The generated route tree retains the base homepage loader type during
  // standalone type-checking; Vite swaps in this Athletics loader at build time.
  const { stats, events, updates } = Route.useLoaderData() as unknown as {
    stats: {
      events: number;
      clubs: number;
      athletes: number;
      upcoming: number;
      bySport: Array<{ sport: string; n: number; upcoming: number }>;
    };
    events: EventListItem[];
    updates: HomeSportUpdate[];
  };
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const resultUpdates = useMemo(
    () => updates.filter((update) => update.kind === "results").slice(0, 6),
    [updates],
  );

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      to: "/races",
      search: { q: query.trim() || undefined },
    });
  };

  return (
    <div className="space-y-7 pb-10">
      <section className="overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-primary" />
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.5fr)] lg:items-end lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Track & field · Cross country · Road athletics
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl lg:text-6xl">
              Athletics events, results and athletes.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Find athletics meetings and championships, follow verified results and discover
              athletes and clubs around the world.
            </p>
            <form
              onSubmit={submitSearch}
              className="mt-6 grid max-w-3xl gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
              role="search"
            >
              <label className="sr-only" htmlFor="athletics-event-search">
                Athletics event, athlete or place
              </label>
              <input
                id="athletics-event-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Meeting, championship, stadium or city"
                className="h-12 min-w-0 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none placeholder:text-subtle focus:ring-2 focus:ring-accent/30"
              />
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-fg transition-colors hover:bg-accent"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Search athletics
              </button>
            </form>
          </div>

          <dl className="grid grid-cols-3 gap-3" aria-label="ATHRECS athletics coverage">
            <HomeStat label="Events" value={stats.events} />
            <HomeStat label="Clubs" value={stats.clubs} />
            <HomeStat label="Athletes" value={stats.athletes} />
          </dl>
        </div>
      </section>

      <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Athletics disciplines">
        {DISCIPLINES.map((discipline) => (
          <Link
            key={discipline.label}
            to="/races"
            search={{
              sport: "Athletics",
              surface: "surface" in discipline ? discipline.surface : undefined,
              q: "q" in discipline ? discipline.q : undefined,
            }}
            className="group flex min-h-24 items-center justify-between rounded-2xl border border-border bg-surface p-4 no-underline shadow-card transition hover:-translate-y-0.5 hover:border-accent"
          >
            <div>
              <p className="font-display text-lg font-semibold text-fg">{discipline.label}</p>
              <p className="mt-1 text-xs text-muted">Browse verified athletics fixtures</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <discipline.icon className="h-5 w-5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:items-start">
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                Upcoming athletics
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg">
                Event calendar
              </h2>
            </div>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              Full calendar <ArrowRight className="h-4 w-4" />
            </Link>
          </header>
          <div className="px-5">
            {events.length ? (
              events.map((event) => <AthleticsEventRow key={event.id} event={event} />)
            ) : (
              <p className="py-8 text-center text-sm text-muted">
                Verified athletics fixtures will appear here as they are added.
              </p>
            )}
          </div>
          <footer className="border-t border-border bg-bg px-5 py-3 text-xs text-subtle">
            {stats.upcoming.toLocaleString()} upcoming athletics competition days indexed
          </footer>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Latest results
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-fg">Recently verified</h2>
            <div className="mt-3 divide-y divide-border">
              {resultUpdates.length ? (
                resultUpdates.map((update) => <ResultUpdateRow key={update.id} update={update} />)
              ) : (
                <p className="py-5 text-sm text-muted">Verified athletics results will appear here.</p>
              )}
            </div>
          </section>

          <QuickLink to="/athletes" icon={Users} label="Explore athletes" />
          <QuickLink to="/clubs" icon={UsersRound} label="Find an athletics club" />
          <QuickLink to="/calendar" icon={CalendarDays} label="Open the athletics calendar" />
          <Link
            to="/claim-results"
            search={{ resultId: undefined }}
            className="flex min-h-12 items-center justify-between rounded-xl border border-accent/30 bg-accent-soft px-4 text-sm font-semibold text-fg no-underline shadow-card hover:border-accent"
          >
            Claim an athletics result <ArrowRight className="h-4 w-4 text-accent" />
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

function AthleticsEventRow({ event }: { event: EventListItem }) {
  return (
    <article className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <time className="text-xs font-semibold text-accent" dateTime={event.next_date ?? undefined}>
        {event.next_date ? formatRaceDateShort(event.next_date) : "Date TBC"}
      </time>
      <div className="min-w-0">
        <Link
          to="/races/$slug"
          params={{ slug: event.slug }}
          className="font-semibold text-fg no-underline hover:text-accent"
        >
          {event.name}
        </Link>
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{[event.city, event.country].filter(Boolean).join(", ")}</span>
        </p>
      </div>
      <span className="w-fit rounded-full bg-elevated px-2.5 py-1 text-xs font-medium text-muted">
        {event.next_distance
          ? formatDistanceWithUnits(event.next_distance)
          : event.surface || "Athletics"}
      </span>
    </article>
  );
}

function ResultUpdateRow({ update }: { update: HomeSportUpdate }) {
  return (
    <Link
      to="/races/$slug"
      params={{ slug: update.eventSlug }}
      className="block py-3 no-underline first:pt-1 last:pb-0"
    >
      <p className="text-sm font-semibold text-fg hover:text-accent">{update.eventName}</p>
      <p className="mt-1 text-xs text-muted">
        {formatRaceDateShort(update.eventDate)} · {formatDistanceWithUnits(update.distance)}
      </p>
    </Link>
  );
}

function QuickLink({
  to,
  icon: Icon,
  label,
}: {
  to: "/athletes" | "/clubs" | "/calendar";
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex min-h-12 items-center justify-between rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-fg no-underline shadow-card hover:border-accent"
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-accent" />
    </Link>
  );
}
