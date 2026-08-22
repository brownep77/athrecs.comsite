import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bike,
  CalendarDays,
  ChevronRight,
  Droplets,
  Footprints,
  Gauge,
  MapPin,
  Medal,
  Mountain,
  Newspaper,
  Route as RouteIcon,
  Ship,
  Timer,
  Trophy,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { getHomeSportUpdates, getHomeStats, listEvents } from "@/lib/athrecs/api";
import { SPORTS } from "@/lib/athrecs/filters";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import {
  homeRegionLabel,
  PRIORITY_HOME_SPORTS,
  selectBalancedHomeUpdates,
  type HomeSportUpdate,
} from "@/lib/athrecs/home-updates";
import type { Sport } from "@/lib/athrecs/types";
import { RaceCard } from "@/components/races/RaceCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const distances = [
  {
    label: "parkrun",
    detail: "Free, weekly 5K",
    sport: "Parkrun" as const,
    icon: Footprints,
    accent: "bg-[#d9f5ef] text-[#087e6e]",
  },
  {
    label: "5K",
    detail: "Fast and accessible",
    sport: "Running" as const,
    distance: "5K",
    icon: Timer,
    accent: "bg-[#e7f2ff] text-[#2563a5]",
  },
  {
    label: "10K",
    detail: "The classic road race",
    sport: "Running" as const,
    distance: "10K",
    icon: Gauge,
    accent: "bg-[#fff0dc] text-[#a85d0b]",
  },
  {
    label: "Half marathon",
    detail: "13.1 miles",
    sport: "Running" as const,
    distance: "Half",
    icon: RouteIcon,
    accent: "bg-[#eee9ff] text-[#6547b8]",
  },
  {
    label: "Marathon",
    detail: "26.2 miles",
    sport: "Running" as const,
    distance: "Marathon",
    icon: Trophy,
    accent: "bg-[#ffe5e0] text-[#ae4937]",
  },
  {
    label: "Ultra marathon",
    detail: "Beyond 26.2 miles",
    sport: "Running" as const,
    distance: "Ultra",
    icon: Mountain,
    accent: "bg-[#e3f5e8] text-[#2f7d45]",
  },
] as const;

function HomePage() {
  const { stats, running, updates } = Route.useLoaderData();
  const [newsSport, setNewsSport] = useState<Sport | "All">("All");
  const [newsRegion, setNewsRegion] = useState("All");
  const sportStats = (sport: string) =>
    stats.bySport.find((item) => item.sport === sport) ?? { sport, n: 0, upcoming: 0 };
  const countFor = (sport: string) => sportStats(sport).n;
  const newsRegions = useMemo(
    () => [...new Set(updates.map(homeRegionLabel))].sort((a, b) => a.localeCompare(b)),
    [updates],
  );
  const visibleUpdates = useMemo(
    () => selectBalancedHomeUpdates(updates, newsSport, newsRegion),
    [newsRegion, newsSport, updates],
  );
  const otherSports = SPORTS.filter(
    (sport): sport is Sport => sport !== "All" && !PRIORITY_HOME_SPORTS.includes(sport),
  );

  return (
    <div className="space-y-12 pb-8 md:space-y-16">
      <section className="relative isolate overflow-hidden rounded-[1.75rem] border border-border bg-surface text-fg shadow-[0_24px_70px_rgba(45,52,57,0.10)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 84% 18%, rgba(12,171,149,0.20), transparent 30%), radial-gradient(circle at 62% 115%, rgba(12,171,149,0.12), transparent 38%)",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute -right-20 -top-12 h-80 w-80 rounded-full border border-primary/15" />
        <div className="pointer-events-none absolute right-10 top-14 h-52 w-52 rounded-full border border-primary/15" />

        <div className="relative px-6 py-10 sm:px-9 md:px-12 md:py-16 lg:px-14 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            ATHRECS · Global race intelligence
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Find your next race.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
            Discover running events from local parkruns and 5Ks to major marathons and ultras,
            then explore athletics, triathlon and cycling across one growing race directory.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-primary text-white hover:bg-[#0a9a86]">
              <Link to="/races" search={{ sport: "Running" }}>
                Find a race
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="border-border bg-elevated text-fg hover:bg-accent-soft"
            >
              <Link to="/calendar">
                <CalendarDays className="h-4 w-4" />
                Race calendar
              </Link>
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-2" aria-label="Sports covered">
            {["Running", "Athletics", "Triathlon", "Cycling"].map((sport) => (
              <span
                key={sport}
                className="rounded-full border border-primary/10 bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Running"
          title="Choose your distance"
          body="Start with the race you know — or find the next challenge to work towards."
          action={
            <Link
              to="/races"
              search={{ sport: "Running" }}
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              All running events <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {distances.map((item, index) => (
            <Link
              key={item.label}
              to="/races"
              search={{
                sport: item.sport,
                distance: "distance" in item ? item.distance : undefined,
              }}
              className={`group relative min-h-44 overflow-hidden rounded-2xl border border-border bg-surface p-5 no-underline shadow-card transition duration-200 hover:-translate-y-1 hover:border-border-strong hover:shadow-lg ${
                index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.accent}`}
              >
                <item.icon className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <h3 className="mt-7 font-display text-xl font-semibold tracking-tight text-fg">
                {item.label}
              </h3>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
              <ChevronRight className="absolute bottom-5 right-5 h-5 w-5 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="The whole calendar"
          title="Every sport, counted"
          body="Running, athletics, triathlon and cycling lead the homepage, with live event and upcoming-fixture counts across every sport in ATHRECS."
          action={
            <Link
              to="/races"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              Browse all sports <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PRIORITY_HOME_SPORTS.map((sport) => (
            <SportCountCard key={sport} sport={sport} stats={sportStats(sport)} priority />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface p-3 shadow-card">
          {otherSports.map((sport) => {
            const sportCount = sportStats(sport);
            return (
              <Link
                key={sport}
                to="/races"
                search={{ sport }}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-bg px-3 text-sm font-medium text-muted no-underline transition-colors hover:border-accent hover:text-fg"
              >
                <SportGlyph sport={sport} className="h-4 w-4 text-accent" />
                {sport}
                <span className="rounded-full bg-elevated px-2 py-0.5 text-xs tabular text-subtle">
                  {sportCount.n.toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <SportPanel
          icon={Activity}
          kicker="Swim · Bike · Run"
          title="Triathlon"
          body="Find sprint, standard, middle-distance and full-distance events — with duathlon and aquathlon nearby."
          count={countFor("Triathlon")}
          search={{ sport: "Triathlon" }}
          links={[
            { label: "Sprint", search: { sport: "Triathlon", format: "Sprint" } },
            { label: "Standard", search: { sport: "Triathlon", format: "Standard" } },
            { label: "Middle", search: { sport: "Triathlon", format: "Middle" } },
          ]}
          decoration={<Waves className="h-28 w-28" strokeWidth={1} />}
        />
        <SportPanel
          icon={Bike}
          kicker="Road · Trail · Track"
          title="Cycling"
          body="Browse rides and races by discipline, from road events to trails, tracks and mixed terrain."
          count={countFor("Cycling")}
          search={{ sport: "Cycling" }}
          links={[
            { label: "Road", search: { sport: "Cycling", surface: "Road" } },
            { label: "Trail", search: { sport: "Cycling", surface: "Trail" } },
            { label: "Track", search: { sport: "Cycling", surface: "Track" } },
          ]}
          decoration={<Bike className="h-28 w-28" strokeWidth={1} />}
        />
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="News by sport and place"
          title="Sport news & regional updates"
          body="Original ATHRECS updates generated from verified fixtures, entry status and result links—without copying publishers’ article text or images."
          action={
            <Link
              to="/calendar"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              Open the calendar <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />

        <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card md:grid-cols-[1fr_15rem] md:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
              Choose a sport
            </p>
            <div className="flex flex-wrap gap-2">
              {SPORTS.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setNewsSport(sport)}
                  className={`min-h-10 rounded-full border px-3 text-sm font-medium transition-colors ${
                    newsSport === sport
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-bg text-muted hover:border-border-strong hover:text-fg"
                  }`}
                >
                  {sport === "All" ? "All sports" : sport}
                </button>
              ))}
            </div>
          </div>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
            Region
            <select
              value={newsRegion}
              onChange={(event) => setNewsRegion(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm font-medium normal-case tracking-normal text-fg outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="All">All regions</option>
              {newsRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </label>
        </div>

        {visibleUpdates.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {visibleUpdates.map((update) => (
              <HomeUpdateCard key={update.id} update={update} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center">
            <Newspaper className="mx-auto h-7 w-7 text-subtle" aria-hidden="true" />
            <p className="mt-3 font-semibold text-fg">No matching updates yet</p>
            <p className="mt-1 text-sm text-muted">
              New verified fixtures and results will appear here automatically.
            </p>
          </div>
        )}

        <p className="text-xs leading-relaxed text-subtle">
          ATHRECS updates use our own database facts and wording. External reporting can be added
          only from an approved licensed source with attribution.
        </p>
      </section>

      <section className="space-y-5">
        <SectionHeading
          eyebrow="Coming up"
          title="Upcoming running events"
          body="Real races from the ATHRECS calendar, ready to explore."
          action={
            <Link
              to="/calendar"
              className="inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
            >
              Full calendar <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-2">
          {running.map((race) => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-[#e3f5f1]">
        <div className="grid gap-6 px-6 py-8 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:py-10">
          <div className="flex gap-4">
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-accent shadow-card sm:flex">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#087e6e]">
                More than a race list
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
                Events, athletes, clubs and results — connected.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                Find a start line today, then follow the people, performances and communities that
                make sport matter.
              </p>
            </div>
          </div>
          <Button asChild variant="secondary" className="bg-white">
            <Link to="/athletes">
              Explore athletes
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function SportGlyph({
  sport,
  className,
}: {
  sport: Sport;
  className?: string;
}) {
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

function SportCountCard({
  sport,
  stats,
  priority = false,
}: {
  sport: Sport;
  stats: { n: number; upcoming: number };
  priority?: boolean;
}) {
  return (
    <Link
      to="/races"
      search={{ sport }}
      className={`group rounded-2xl border p-5 no-underline shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-border-strong ${
        priority ? "border-primary/20 bg-[#e3f5f1]" : "border-border bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-cyan-300">
          <SportGlyph sport={sport} className="h-5 w-5" />
        </span>
        <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-accent" />
      </div>
      <p className="mt-5 font-display text-3xl font-semibold tabular tracking-tight text-fg">
        {stats.n.toLocaleString()}
      </p>
      <h3 className="mt-0.5 font-semibold text-fg">{sport} events</h3>
      <p className="mt-2 text-xs text-muted">
        {stats.upcoming.toLocaleString()} with upcoming fixtures
      </p>
    </Link>
  );
}

function HomeUpdateCard({ update }: { update: HomeSportUpdate }) {
  const isResults = update.kind === "results";
  const status = update.status.toLowerCase();
  const isOpen = status === "open" || status === "closingsoon";
  const title = isResults
    ? `${update.eventName} results are available`
    : isOpen
      ? `${update.eventName}: entries ${status === "closingsoon" ? "closing soon" : "open"}`
      : `Next up: ${update.eventName}`;
  const place = [update.city, homeRegionLabel(update)].filter(Boolean).join(" · ");

  return (
    <article className="flex min-h-56 flex-col rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent" className="gap-1">
          <SportGlyph sport={update.sport} className="h-3.5 w-3.5" />
          {update.sport}
        </Badge>
        <Badge variant={isResults ? "solid" : "outline"}>
          {isResults ? "Results update" : "Fixture update"}
        </Badge>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-fg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {update.distance} · {formatRaceDateShort(update.eventDate)}
        {place ? ` · ${place}` : ""}.
        {isResults && update.providerName ? ` Verified link from ${update.providerName}.` : ""}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-subtle">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{homeRegionLabel(update)}</span>
        </span>
        <Link
          to="/races/$slug"
          params={{ slug: update.eventSlug }}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
        >
          Race page <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
          {title}
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}

type SportSearch = {
  sport: "Triathlon" | "Cycling";
  format?: string;
  surface?: string;
};

function SportPanel({
  icon: Icon,
  kicker,
  title,
  body,
  count,
  search,
  links,
  decoration,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  kicker: string;
  title: string;
  body: string;
  count: number;
  search: SportSearch;
  links: { label: string; search: SportSearch }[];
  decoration: React.ReactNode;
}) {
  return (
    <article className="group relative isolate min-h-72 overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card md:p-7">
      <div className="pointer-events-none absolute -bottom-7 -right-5 -z-10 text-elevated transition-transform duration-300 group-hover:-translate-x-2 group-hover:-translate-y-2">
        {decoration}
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#263238] text-[#48d2bd]">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        {count > 0 ? (
          <span className="rounded-full bg-elevated px-3 py-1 text-xs font-medium text-muted">
            {count.toLocaleString()} events
          </span>
        ) : null}
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
        {kicker}
      </p>
      <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-fg">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.label}
            to="/races"
            search={link.search}
            className="rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-medium text-muted no-underline hover:border-border-strong hover:text-fg"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <Link
        to="/races"
        search={search}
        className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
      >
        Explore {title.toLowerCase()} <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
