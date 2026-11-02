import { ArrowDown, ArrowUpRight, Clock3, MapPin, Mountain, Route } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import type { RacePlacePageData } from "@/lib/athrecs/race-places";
import { racePlaceCopy, type RaceCopyParagraph } from "@/lib/athrecs/race-places-copy";
import { colombiaCityLinks, COLOMBIA_TIME_SOURCE } from "@/lib/athrecs/colombia-race-guide";

const paragraph = (parts: RaceCopyParagraph) =>
  parts.map((part, index) =>
    typeof part === "string" ? (
      part
    ) : (
      <a
        key={`${part.href}-${index}`}
        href={part.href}
        className="text-accent underline underline-offset-4 hover:text-fg"
      >
        {part.text}
      </a>
    ),
  );

export function ColombiaRaceHero({ data }: { data: RacePlacePageData }) {
  const copy = racePlaceCopy(data);
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-elevated p-6 md:p-9">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 flex h-1.5">
        <span className="w-1/2 bg-[#fcd116]" />
        <span className="w-1/4 bg-[#003893]" />
        <span className="w-1/4 bg-[#ce1126]" />
      </div>
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div>
          <CountryFlag country="Colombia" showName showCode />
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-accent">
            Find your next start line
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight md:text-5xl">
            {copy.heading}
          </h1>
          <div className="mt-5 max-w-3xl space-y-3 leading-7 text-muted">
            {copy.intro.slice(0, 1).map((parts, index) => (
              <p key={index}>{paragraph(parts)}</p>
            ))}
          </div>
          <a
            href="#upcoming-races"
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-primary-fg hover:opacity-90"
          >
            Explore the race calendar <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </a>
          <div className="mt-5 max-w-3xl space-y-3 leading-7 text-muted">
            {copy.intro.slice(1).map((parts, index) => (
              <p key={index}>{paragraph(parts)}</p>
            ))}
          </div>
        </div>
        <aside
          className="rounded-xl border border-border bg-surface p-5"
          aria-label="Calendar overview"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            In this calendar
          </p>
          <p className="mt-3 font-display text-4xl font-semibold tabular-nums">
            {data.upcomingCount.toLocaleString("en-GB")}
          </p>
          <p className="mt-1 text-sm text-muted">
            upcoming {data.upcomingCount === 1 ? "event" : "events"}
            {data.filters.month || data.filters.city ? " matching your filters" : " listed"}
          </p>
          <div className="mt-5 border-t border-border pt-4 text-sm">
            <p className="flex items-center gap-2 font-semibold">
              <Clock3 aria-hidden="true" className="h-4 w-4 text-accent" /> Colombian local time
            </p>
            <p className="mt-2 leading-6 text-muted">
              UTC−5. Check the start for your distance and wave.
            </p>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted">
            {data.total.toLocaleString("en-GB")} recorded events. Dates and entry availability are
            shown separately.
          </p>
        </aside>
      </div>
    </header>
  );
}

export function ColombiaRacePlanning({ data }: { data: RacePlacePageData }) {
  const cities = colombiaCityLinks(data);
  const runningPath = `${data.place.path}/running`;
  return (
    <section aria-labelledby="colombia-planning-heading" className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Choose your race
        </p>
        <h2 id="colombia-planning-heading" className="mt-2 font-display text-2xl font-semibold">
          Road, trail or a longer challenge
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <a
          href={`${runningPath}/road`}
          className="group rounded-xl border border-border bg-surface p-5 hover:border-accent"
        >
          <Route aria-hidden="true" className="h-6 w-6 text-accent" />
          <h3 className="mt-4 text-lg font-semibold">Road races</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Compare road distances, the exact start location and the timetable for your chosen race.
            Check whether the organiser uses separate waves.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
            Browse road races <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </span>
        </a>
        <a
          href={`${runningPath}/trail`}
          className="group rounded-xl border border-border bg-surface p-5 hover:border-accent"
        >
          <Mountain aria-hidden="true" className="h-6 w-6 text-accent" />
          <h3 className="mt-4 text-lg font-semibold">Trail and ultra</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Look beyond the headline distance. Compare the organiser’s route, elevation gain,
            cut-offs and mandatory kit before choosing an event.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent">
            Browse trail races <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </span>
        </a>
        <div className="rounded-xl border border-border bg-surface p-5">
          <Clock3 aria-hidden="true" className="h-6 w-6 text-accent" />
          <h3 className="mt-4 text-lg font-semibold">Plan the race day</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use Colombian local time, UTC−5. Check bib collection, transport to the start and the
            latest race instructions on the official event website.
          </p>
          <a
            href={COLOMBIA_TIME_SOURCE}
            className="mt-4 inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-accent underline underline-offset-4 hover:text-fg"
          >
            Colombia’s official clock <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
      {cities.length > 1 ? (
        <nav aria-label="Colombia race locations" className="rounded-xl border border-border p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <MapPin aria-hidden="true" className="h-4 w-4 text-accent" /> Find races by location
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map((city) => (
              <a
                key={city.name}
                href={city.href}
                aria-current={data.filters.city === city.name ? "page" : undefined}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:border-accent aria-[current=page]:bg-elevated"
              >
                {city.name}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </section>
  );
}
