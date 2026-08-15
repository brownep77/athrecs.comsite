import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Bike,
  CalendarDays,
  ChevronRight,
  Footprints,
  Gauge,
  MapPin,
  Route as RouteIcon,
  Timer,
  Trophy,
  Users,
  Waves,
} from "lucide-react";
import { getHomeStats, listEvents } from "@/lib/athrecs/api";
import { flagForCountryFilter } from "@/lib/athrecs/countries";
import { countrySiteFromName } from "@/lib/athrecs/country-sites";
import { COUNTRY_GROUPS } from "@/lib/athrecs/filters";
import { RaceCard } from "@/components/races/RaceCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [stats, running] = await Promise.all([
      getHomeStats(),
      listEvents({
        data: { sport: "Running", upcomingOnly: true, limit: 4 },
      }),
    ]);
    return { stats, running };
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
] as const;

function HomePage() {
  const { stats, running } = Route.useLoaderData();
  const navigate = useNavigate();
  const [country, setCountry] = useState("All");
  const countFor = (sport: string) => stats.bySport.find((item) => item.sport === sport)?.n ?? 0;

  const browseCountry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (country === "All") {
      void navigate({ to: "/races" });
      return;
    }
    const site = countrySiteFromName(country);
    if (!site) return;
    void navigate({
      to: "/$language/$country",
      params: { language: site.defaultLanguage, country: site.slug },
    });
  };

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
        <div className="pointer-events-none absolute -right-16 top-8 h-72 w-72 rounded-full border border-primary/15" />
        <div className="pointer-events-none absolute -right-3 top-21 h-48 w-48 rounded-full border border-primary/15" />

        <div className="relative grid gap-9 px-6 py-9 sm:px-9 md:px-12 md:py-14 lg:grid-cols-[1.35fr_0.65fr] lg:items-end lg:gap-14">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-subtle">
              <span className="rounded-full border border-primary/20 bg-accent-soft px-3 py-1.5 text-accent">
                Running first
              </span>
              <span>Triathlon</span>
              <span className="h-1 w-1 rounded-full bg-border-strong" />
              <span>Cycling</span>
            </div>
            <h1 className="max-w-3xl font-display text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl md:text-7xl">
              Find your next
              <span className="block text-accent">start line.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
              Discover running events from local parkruns and 5Ks to European marathons, then
              explore triathlon and cycling across one growing race directory.
            </p>
            <form
              onSubmit={browseCountry}
              className="mt-7 grid max-w-xl gap-2 rounded-2xl border border-border bg-elevated/80 p-3 sm:grid-cols-[1fr_auto] sm:items-end"
            >
              <label className="grid gap-1.5 text-xs font-semibold text-muted">
                Select your country
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-fg outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <option value="All">All countries</option>
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  {COUNTRY_GROUPS.map((group) => (
                    <optgroup key={group.label} label={group.label}>
                      {group.options.map((option) => (
                        <option key={option} value={option}>
                          {flagForCountryFilter(option)} {option}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
              <Button
                type="submit"
                size="lg"
                className="h-11 bg-primary text-white hover:bg-[#0a9a86]"
              >
                Open country homepage
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-primary text-white hover:bg-[#0a9a86]">
                <Link to="/races" search={{ sport: "Running" }}>
                  Explore running
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
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-elevated/75 p-3 backdrop-blur-sm">
            <HeroStat value={stats.events.toLocaleString()} label="Events" />
            <HeroStat value={stats.clubs.toLocaleString()} label="Clubs" />
            <HeroStat value={stats.athletes.toLocaleString()} label="Athletes" />
            <HeroStat value="One place" label="To find your race" />
            <div className="col-span-2 flex items-center gap-3 rounded-xl bg-accent-soft px-4 py-3">
              <MapPin className="h-5 w-5 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-muted">
                Norfolk roots. UK, Ireland, Europe and world events.
              </p>
            </div>
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

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
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

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5 shadow-card">
      <p className="font-display text-2xl font-semibold tracking-tight text-fg">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-subtle">{label}</p>
    </div>
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
