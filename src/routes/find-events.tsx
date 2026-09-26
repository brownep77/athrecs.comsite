import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, ArrowUpRight, Footprints, Medal, Waves } from "lucide-react";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/find-events")({
  head: () => ({
    meta: siteGraphMeta({
      title: "Find your next event | ATHRECS",
      description:
        "Explore AthRecs road marathon and half marathon guides across seven countries, with entry methods, routes and results, plus specialist event calendars for other sports.",
      url: `${SITE_URL}/find-events`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/find-events` }],
  }),
  component: FindEventsPage,
});

const eventSites = [
  {
    name: "World Athletics",
    sport: "Track, field & athletics",
    description: "The international competition calendar and results.",
    href: "https://worldathletics.org/competition/calendar-results",
    icon: Medal,
  },
  {
    name: "World Triathlon",
    sport: "Triathlon & multisport",
    description: "Search the international event calendar and results.",
    href: "https://triathlon.org/events",
    icon: Activity,
  },
  {
    name: "Swim England",
    sport: "Swimming & aquatics",
    description: "Find aquatics events and competitions through the events hub.",
    href: "https://www.swimming.org/calendar/",
    icon: Waves,
  },
] as const;

function FindEventsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Your next start line
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
          Find your next event
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Explore running guides on AthRecs and specialist event calendars for other sports. Keep
          your athlete profile and sporting records together.
        </p>
      </header>
      <a
        href={IS_RUNRECS_SITE ? "https://www.runrecs.com/races" : "/running"}
        className="group block rounded-3xl border border-accent/30 bg-elevated/60 p-5 no-underline sm:p-7"
      >
        <div className="flex items-center justify-between gap-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Footprints className="size-6" aria-hidden="true" />
          </span>
          <span className="rounded-full border border-accent/20 bg-surface px-3 py-1 text-xs font-semibold text-accent">
            {IS_RUNRECS_SITE ? "RunRecs · Running" : "AthRecs · Running"}
          </span>
        </div>
        <h2 className="mt-4 font-display text-3xl font-semibold text-fg">Running</h2>
        <p className="mt-1 text-sm font-semibold text-accent">Running events</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
          {IS_RUNRECS_SITE
            ? "Explore road, trail, fell and ultra races, plus parkrun. Search by place, distance and date to find your next run."
            : "Explore road marathons and half marathons in the UK, Australia, New Zealand, USA, Canada, Ireland and South Africa. Compare entry methods, routes, dates and previous results."}
        </p>
        <span className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-fg">
          Explore running <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </a>
      {!IS_RUNRECS_SITE ? (
        <p className="text-sm leading-6 text-muted">
          Looking for other distances or surfaces? Browse the{" "}
          <a
            href="https://www.runrecs.com/races"
            className="font-semibold text-accent underline underline-offset-4"
          >
            RunRecs race calendar
          </a>
          .
        </p>
      ) : null}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-semibold">Event calendars for other sports</h2>
          <p className="mt-1 text-sm text-muted">
            These links take you to the governing bodies’ own websites.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {eventSites.map((site) => (
            <a
              key={site.name}
              href={site.href}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5 no-underline shadow-card hover:border-accent"
            >
              <div className="flex items-center justify-between">
                <site.icon className="size-6 text-accent" aria-hidden="true" />
                <ArrowUpRight className="size-4 text-muted" aria-hidden="true" />
              </div>
              <p className="mt-4 text-xs font-semibold text-accent">{site.sport}</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-fg">{site.name}</h3>
              <p className="mt-2 flex-1 text-xs leading-5 text-muted">{site.description}</p>
              <span className="mt-4 text-xs font-semibold text-accent">Visit event calendar</span>
            </a>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-border p-5">
        <h2 className="font-display text-xl font-semibold">More of the SportsRecs family</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          CycRecs, SwimRecs, TriRecs, GymRecs and FitRecs are coming soon. Their event links will be
          added as the sites launch.
        </p>
        <Link
          to="/sportsrecs"
          className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent"
        >
          Explore the network <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
      <Link
        to="/my-athlete-profile"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent"
      >
        Back to my athlete profile <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
