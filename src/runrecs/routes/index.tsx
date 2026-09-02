import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Footprints,
  MapPin,
  Medal,
  Mountain,
  Newspaper,
  Search,
  Send,
  Sparkles,
  Timer,
  Trophy,
  UserRoundCheck,
} from "lucide-react";
import { getHomeSportUpdates, getHomeStats, listEvents } from "@/lib/athrecs/api";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import { formatStartTime } from "@/lib/athrecs/format";
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
      .filter(
        (race, index, rows) => rows.findIndex((candidate) => candidate.id === race.id) === index,
      )
      .sort((left, right) =>
        (left.next_date ?? "9999-12-31").localeCompare(right.next_date ?? "9999-12-31"),
      )
      .slice(0, 8);
    return { stats, races, updates };
  },
  component: RunRecsHomePage,
});

const distances = [
  {
    label: "parkrun",
    sport: "Parkrun" as const,
    distance: undefined,
    surface: undefined,
    icon: Footprints,
  },
  { label: "5K", sport: "Running" as const, distance: "5K", surface: undefined, icon: Timer },
  { label: "10K", sport: "Running" as const, distance: "10K", surface: undefined, icon: Timer },
  {
    label: "Half marathon",
    sport: "Running" as const,
    distance: "Half",
    surface: undefined,
    icon: Footprints,
  },
  {
    label: "Marathon",
    sport: "Running" as const,
    distance: "Marathon",
    surface: undefined,
    icon: Medal,
  },
  {
    label: "Ultra",
    sport: "Running" as const,
    distance: "Ultra",
    surface: undefined,
    icon: Mountain,
  },
  {
    label: "Trail",
    sport: "Running" as const,
    distance: undefined,
    surface: "Trail",
    icon: Mountain,
  },
] as const;

const editorialStories = [
  {
    eyebrow: "The big picture",
    title: "The autumn marathon map",
    summary:
      "Berlin, Chicago, Dublin and New York turn the season into one long finish-line story. Find the dates and follow the majors.",
    linkLabel: "Explore the marathon calendar",
    to: "/races" as const,
    search: { sport: "Running" as const, distance: "Marathon" },
    feature: true,
  },
  {
    eyebrow: "Race planning",
    title: "Build a 2027 race year worth remembering",
    summary: "Start with home-nation favourites, then add the race that asks a little more of you.",
    linkLabel: "Open the calendar",
    to: "/calendar" as const,
    feature: false,
  },
  {
    eyebrow: "The explainer",
    title: "Qualifiers, indexes and running stones",
    summary:
      "Boston standards, Comrades qualifiers and the UTMB system — the routes into running’s most wanted starts.",
    linkLabel: "Understand race series",
    to: "/race-series" as const,
    feature: false,
  },
  {
    eyebrow: "Saturday ritual",
    title: "A parkrun is never just another 5K",
    summary:
      "Search the growing parkrun archive and find a familiar start line wherever the weekend takes you.",
    linkLabel: "Find a parkrun",
    to: "/races" as const,
    search: { sport: "Parkrun" as const },
    feature: false,
  },
  {
    eyebrow: "Going long",
    title: "Beyond 42.2 kilometres",
    summary:
      "From Two Oceans to Comrades, discover the races where distance becomes its own kind of landscape.",
    linkLabel: "Explore ultra races",
    to: "/races" as const,
    search: { sport: "Running" as const, distance: "Ultra" },
    feature: false,
  },
] as const;

const majorRaces = [
  {
    name: "Great North Run",
    slug: "great-north-run",
    place: "Newcastle to South Shields",
    timing: "13 Sep 2026",
    badge: "UK classic",
  },
  {
    name: "Berlin Marathon",
    slug: "berlin-marathon",
    place: "Berlin, Germany",
    timing: "27 Sep 2026",
    badge: "World major",
  },
  {
    name: "Chicago Marathon",
    slug: "chicago-marathon",
    place: "Chicago, USA",
    timing: "11 Oct 2026",
    badge: "World major",
  },
  {
    name: "Dublin Marathon",
    slug: "dublin-marathon",
    place: "Dublin, Ireland",
    timing: "Oct 2026",
    badge: "Irish classic",
  },
  {
    name: "New York City Marathon",
    slug: "new-york-city-marathon",
    place: "New York, USA",
    timing: "1 Nov 2026",
    badge: "World major",
  },
  {
    name: "Two Oceans Marathon",
    slug: "two-oceans-marathon",
    place: "Cape Town, South Africa",
    timing: "3–4 Apr 2027",
    badge: "Iconic ultra",
  },
  {
    name: "Boston Marathon",
    slug: "boston-marathon",
    place: "Boston, USA",
    timing: "19 Apr 2027",
    badge: "World major",
  },
  {
    name: "London Marathon",
    slug: "london-marathon",
    place: "London, England",
    timing: "24 Apr 2027",
    badge: "World major",
  },
  {
    name: "Comrades Marathon",
    slug: "comrades-marathon",
    place: "South Africa",
    timing: "13 Jun 2027",
    badge: "100th edition",
  },
] as const;

const comingSoon = [
  {
    title: "Training plans",
    description: "Plans built around your race, distance and available weeks.",
    icon: ClipboardList,
  },
  {
    title: "Runner rankings",
    description: "Comparable performances across distances, age groups and seasons.",
    icon: Trophy,
  },
  {
    title: "Running news",
    description: "The race stories, entry updates and results worth knowing.",
    icon: Newspaper,
  },
  {
    title: "Claim your runner profile",
    description: "Take control of your public running identity and verified history.",
    icon: UserRoundCheck,
  },
  {
    title: "Submit a race",
    description: "Help organisers add new races and keep event details current.",
    icon: Send,
  },
  {
    title: "Submit results",
    description: "Send official result sets and connect runners to their performances.",
    icon: Medal,
  },
] as const;

function RunRecsHomePage() {
  // The committed ATHRECS route tree still describes the base homepage during
  // standalone type-checking; Vite swaps in this loader for RunRecs builds.
  const { stats, races, updates } = Route.useLoaderData() as unknown as {
    stats: {
      events: number;
      clubs: number;
      athletes: number;
      upcoming: number;
      bySport: Array<{ sport: string; n: number; upcoming: number }>;
    };
    races: EventListItem[];
    updates: HomeSportUpdate[];
  };
  const navigate = useNavigate();
  const routeSearch = Route.useSearch();
  const [query, setQuery] = useState("");
  const boardView = routeSearch.board ?? "upcoming";

  const results = useMemo(
    () => updates.filter((update) => update.kind === "results").slice(0, 8),
    [updates],
  );
  const regional = useMemo(
    () => updates.filter((update) => update.kind === "fixture").slice(0, 8),
    [updates],
  );
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
    <div className="space-y-12 pb-10 md:space-y-16">
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="grid lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <div className="p-5 sm:p-8 lg:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Stories · Race guides · The running calendar
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-tight text-fg sm:text-5xl lg:text-6xl">
              Every race starts long before the gun.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Major dates, local finds and the stories that make a place on the start line mean
              something. RunRecs is your guide to what to run next.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/calendar"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-fg no-underline hover:bg-accent"
              >
                Explore the calendar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/race-series"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-bg px-4 text-sm font-semibold text-fg no-underline hover:border-accent"
              >
                Follow major race series
              </Link>
            </div>
          </div>

          <Link
            to="/races"
            search={{ sport: "Running", distance: "Marathon" }}
            className="group flex min-h-80 flex-col justify-between bg-primary p-6 text-primary-fg no-underline sm:p-8 lg:min-h-full"
            aria-label="Read our guide to the autumn marathon season"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]">
                Lead story
              </span>
              <BookOpen className="h-5 w-5 opacity-80" aria-hidden="true" />
            </div>
            <div className="mt-16">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] opacity-75">
                Sep — Nov 2026
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Autumn belongs to the marathon.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-6 opacity-80">
                Four cities. Four very different roads to 42.2 kilometres. One season to follow.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                Open the race guide
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </span>
            </div>
          </Link>
        </div>

        <dl className="grid grid-cols-3 border-t border-border bg-bg" aria-label="RunRecs coverage">
          <HomeStat label="Events" value={stats.events} />
          <HomeStat label="Clubs" value={stats.clubs} />
          <HomeStat label="Athletes" value={stats.athletes} />
        </dl>
      </section>

      <section aria-labelledby="find-a-race-title">
        <div className="grid gap-5 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              Start with the race
            </p>
            <h2
              id="find-a-race-title"
              className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl"
            >
              Where do you want to run?
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Search by race, place or series, then narrow the calendar by country, region, distance
              and surface.
            </p>
          </div>
          <form
            onSubmit={submitSearch}
            className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"
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
              placeholder="Try ‘Dublin’, ‘trail’ or ‘Great North Run’"
              className="h-12 min-w-0 rounded-xl border border-border bg-bg px-4 text-sm text-fg outline-none placeholder:text-subtle focus:ring-2 focus:ring-accent/30"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-fg transition-colors hover:bg-accent"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Find a race
            </button>
          </form>
        </div>

        <nav className="mt-3 flex flex-wrap gap-2" aria-label="Popular running searches">
          {distances.map((item) => (
            <Link
              key={item.label}
              to="/races"
              search={{ sport: item.sport, distance: item.distance, surface: item.surface }}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-sm font-semibold text-fg no-underline transition-colors hover:border-accent hover:bg-accent-soft"
            >
              <item.icon className="h-4 w-4 text-accent" aria-hidden="true" />
              {item.label}
              {item.label === "parkrun" ? (
                <span className="text-xs font-normal tabular text-subtle">
                  {sportStats("Parkrun").n.toLocaleString()}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </section>

      <section aria-labelledby="stories-title">
        <SectionHeading
          id="stories-title"
          eyebrow="Read before you race"
          title="Stories & guides"
          description="Useful ways into the calendar — from the biggest city marathons to the Saturday morning start line."
        />
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {editorialStories.map((story) => (
            <EditorialStoryCard key={story.title} story={story} />
          ))}
        </div>
      </section>

      <section aria-labelledby="major-races-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            id="major-races-title"
            eyebrow="Dates for the diary"
            title="Major races to follow"
            description="The start lines, city streets and landmark editions shaping the next running year."
          />
          <Link
            to="/race-series"
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
          >
            All major series <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {majorRaces.map((race) => (
            <Link
              key={race.slug}
              to="/races/$slug"
              params={{ slug: race.slug }}
              className="group flex min-h-40 flex-col justify-between bg-surface p-5 text-fg no-underline transition-colors hover:bg-accent-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-primary-fg">
                  {race.badge}
                </span>
                <ChevronRight
                  className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent"
                  aria-hidden="true"
                />
              </div>
              <div className="mt-8">
                <h3 className="font-display text-xl font-semibold leading-tight tracking-tight">
                  {race.name}
                </h3>
                <p className="mt-2 text-xs font-semibold text-accent">{race.timing}</p>
                <p className="mt-1 text-xs text-muted">{race.place}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="run-board-title">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border p-4 sm:p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  Live from the calendar
                </p>
                <h2
                  id="run-board-title"
                  className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg"
                >
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
                  <RaceBoardEmpty>
                    New running fixtures will appear here as they are verified.
                  </RaceBoardEmpty>
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
                Full calendar <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </footer>
          </div>

          <aside className="space-y-3" aria-label="Explore RunRecs">
            <QuickPanelLink to="/races" label="Browse every race" icon={Search} />
            <QuickPanelLink to="/calendar" label="Open the calendar" icon={CalendarDays} />
            <QuickPanelLink to="/athletes" label="Explore runners" icon={Footprints} />
            <QuickPanelLink to="/claim-results" label="Claim a race result" icon={Medal} accent />
            <QuickPanelLink to="/clubs" label="Find a running club" icon={MapPin} />
          </aside>
        </div>
      </section>

      <section
        aria-labelledby="coming-soon-title"
        className="rounded-2xl bg-primary p-5 text-primary-fg sm:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
              The next miles
            </p>
            <h2
              id="coming-soon-title"
              className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Coming to RunRecs
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 opacity-75 sm:text-base">
              The calendar is only the beginning. These features are being planned now and are
              clearly marked until they are ready.
            </p>
          </div>
          <Sparkles className="hidden h-8 w-8 opacity-70 sm:block" aria-hidden="true" />
        </div>

        <div className="mt-7 grid gap-px overflow-hidden rounded-xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoon.map((item) => (
            <article key={item.title} className="bg-primary p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-full border border-white/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] opacity-80">
                  Coming soon
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 opacity-70">{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
      <h2
        id={id}
        className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl"
      >
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted sm:text-base">{description}</p>
    </div>
  );
}

function EditorialStoryCard({ story }: { story: (typeof editorialStories)[number] }) {
  const content = (
    <>
      <div>
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${story.feature ? "text-primary-fg/70" : "text-accent"}`}
        >
          {story.eyebrow}
        </p>
        <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
          {story.title}
        </h3>
        <p
          className={`mt-3 text-sm leading-6 ${story.feature ? "text-primary-fg/75" : "text-muted"}`}
        >
          {story.summary}
        </p>
      </div>
      <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold">
        {story.linkLabel}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </span>
    </>
  );

  const className = `group flex min-h-72 flex-col justify-between p-5 no-underline sm:p-6 ${
    story.feature
      ? "bg-primary text-primary-fg md:col-span-2"
      : "border border-border bg-surface text-fg shadow-card hover:border-accent"
  }`;

  if (story.to === "/races") {
    return (
      <Link to={story.to} search={story.search} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <Link to={story.to} className={className}>
      {content}
    </Link>
  );
}

function HomeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-4 py-4 text-center sm:px-6 sm:py-5 [&+&]:border-l [&+&]:border-border">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-subtle">{label}</dt>
      <dd className="mt-1 font-display text-xl font-semibold tabular text-fg sm:text-2xl">
        {value.toLocaleString()}
      </dd>
    </div>
  );
}

function HomeRaceRow({ race }: { race: EventListItem }) {
  const start = formatStartTime(race.next_start_time, {
    country: race.country,
    county: race.county,
    date: race.next_date,
  });
  const competition = race.groups[0]?.label;

  return (
    <article className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
      <div>
        <time
          className="block text-xs font-semibold text-accent"
          dateTime={race.next_date ?? undefined}
        >
          {race.next_date ? formatHomeDate(race.next_date) : "Date TBC"}
        </time>
        <span className="mt-1 block text-[11px] text-subtle">{start ?? "Time TBC"}</span>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/races/$slug"
            params={{ slug: race.slug }}
            className="font-semibold text-fg no-underline hover:text-accent"
          >
            {race.name}
          </Link>
          {competition ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary-fg">
              {competition}
            </span>
          ) : null}
        </div>
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
    <article className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-3">
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

function QuickPanelLink({
  to,
  label,
  icon: Icon,
  accent = false,
}: {
  to: "/races" | "/calendar" | "/athletes" | "/claim-results" | "/clubs";
  label: string;
  icon: typeof Search;
  accent?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group flex min-h-12 items-center justify-between rounded-xl border px-4 text-sm font-semibold text-fg no-underline shadow-card ${
        accent
          ? "border-accent/30 bg-accent-soft hover:border-accent"
          : "border-border bg-surface hover:border-accent"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
        {label}
      </span>
      <ArrowRight
        className="h-4 w-4 text-accent transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
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
