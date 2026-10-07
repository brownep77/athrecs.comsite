import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Footprints } from "lucide-react";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";

export function HomeEventDiscovery() {
  const quickLink =
    "inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
  return (
    <section aria-labelledby="next-event" className="space-y-4">
      <div>
        <h2 id="next-event" className="font-display text-2xl font-semibold">
          Your next event starts here
        </h2>
        <p className="mt-1 text-sm text-muted">
          Find a fixture, choose a date or get to know the course before you enter.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <Link
            to="/races"
            className="flex min-h-11 items-center gap-3 text-fg no-underline hover:text-accent"
          >
            <CalendarDays className="size-6 shrink-0 text-accent" aria-hidden="true" />
            <h3 className="flex-1 font-display text-xl font-semibold">Fixtures & events</h3>
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted">
            Browse running, track and field, Parkrun and triathlon fixtures by place, date and
            distance.
          </p>
          <nav aria-label="Fixture shortcuts" className="mt-2 flex flex-wrap gap-x-5">
            <Link to="/sports/$sport" params={{ sport: "road-running" }} className={quickLink}>
              Road running fixtures
            </Link>
            <Link to="/calendar" className={quickLink}>
              Fixture calendar
            </Link>
            <Link to="/running/calendar" className={quickLink}>
              Running calendar
            </Link>
          </nav>
        </div>
        <div className="rounded-2xl border border-accent/30 bg-accent-soft/30 p-4 sm:p-5">
          <Link
            to="/running"
            className="flex min-h-11 items-center gap-3 text-fg no-underline hover:text-accent"
          >
            <Footprints className="size-6 shrink-0 text-accent" aria-hidden="true" />
            <h3 className="flex-1 font-display text-xl font-semibold">Running race guides</h3>
            <ArrowRight className="size-5" aria-hidden="true" />
          </Link>
          <p className="mt-2 text-sm leading-6 text-muted">
            Compare dates, entry options, routes and past results for your next longer-distance
            race.
          </p>
          <nav aria-label="Race guide distances" className="mt-2 flex flex-wrap gap-x-5">
            <Link to="/running" hash="countries-title" className={quickLink}>
              Marathons
            </Link>
            <Link to="/running" hash="half-marathons" className={quickLink}>
              Half marathons
            </Link>
            <Link to="/running/uk-road-ultramarathons" className={quickLink}>
              UK road ultras
            </Link>
          </nav>
        </div>
      </div>
      <nav
        aria-label="Marathon guides by country"
        className="rounded-xl border border-border px-4 py-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Marathon guides by country
        </p>
        <div className="mt-1 flex flex-wrap gap-x-5">
          {MARATHON_COUNTRIES.map((country) => (
            <Link
              key={country.id}
              to="/running/$guide"
              params={{ guide: country.guide }}
              className={quickLink}
            >
              {country.id === "uk"
                ? `UK marathons${country.calendarYear ? ` ${country.calendarYear}` : ""}`
                : country.id === "usa"
                  ? "USA marathons"
                  : `${country.name} marathons`}
            </Link>
          ))}
        </div>
      </nav>
      <Link to="/find-events" className={quickLink}>
        Find events through other sporting organisations{" "}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
