import { ArrowRight } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { type CountrySite, countrySlug } from "@/lib/athrecs/country-sites";
import {
  DISCOVERY_CONTINENTS,
  RUNNING_DISCIPLINES,
  countryPlacePath,
  runningDisciplinePath,
  runningHubPath,
} from "@/lib/running/discovery";
import type { PlaceTerrain } from "@/lib/athrecs/race-place-facets";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import { HALF_MARATHON_COUNTRIES } from "@/data/road-half-marathons/countries";

const cardClass =
  "rounded-xl border border-border bg-surface p-5 hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
const linkClass = "inline-flex min-h-11 items-center text-accent underline underline-offset-4";
export function RunningDiscovery({ site }: { site?: CountrySite }) {
  const place = site && countryPlacePath(site);
  const search = site ? `?country=${encodeURIComponent(site.country)}` : "";
  return (
    <div className="space-y-7 pb-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <a href="/" className={linkClass}>
          AthRecs
        </a>
        {site ? (
          <>
            {" "}
            /{" "}
            <a href={`/en/${site.slug}`} className={linkClass}>
              {site.country}
            </a>
          </>
        ) : null}{" "}
        / <span aria-current="page">Running</span>
      </nav>
      <header className="max-w-3xl">
        {site ? <CountryFlag country={site.country} showName showCode /> : null}
        <h1 className="mt-3 font-display text-4xl font-semibold">
          {site ? `Running in ${site.country}` : "Find your next running event"}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          Choose road, trail, fell or cross country, then narrow down the location and distance.{" "}
          {site
            ? `Your country stays set to ${site.country}.`
            : "Browse by continent and country, or go straight to race search."}
        </p>
      </header>
      <nav aria-label="Running tools" className="flex flex-wrap gap-x-6 font-semibold">
        <a href={`/running/events${search}`} className={linkClass}>
          Search running races
        </a>
        <a href={site ? `/running/events${search}` : "/running/calendar"} className={linkClass}>
          Running calendar
        </a>
        <a href="/running/race-series" className={linkClass}>
          Race series
        </a>
        <a href={place ? `${place}/running` : "/races/places/running"} className={linkClass}>
          All running races by location
        </a>
      </nav>
      <section aria-labelledby="running-disciplines" className="space-y-4">
        <h2 id="running-disciplines" className="font-display text-2xl font-semibold">
          Choose your running
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {RUNNING_DISCIPLINES.map((item) => (
            <a key={item.slug} href={runningDisciplinePath(item.slug, site)} className={cardClass}>
              <h3 className="font-display text-2xl font-semibold">{item.label}</h3>
              <p className="mt-3 leading-7 text-muted">{item.description}</p>
              <span className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-accent">
                Explore {item.label.toLowerCase()}{" "}
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-2xl font-semibold">Choose a distance</h2>
        <p className="text-muted">
          Already know your distance? Go straight to matching running races.
        </p>
        <div className="flex flex-wrap gap-x-6">
          {[
            ["5K", "5k"],
            ["10K", "10k"],
            ["Half marathon", "half-marathon"],
            ["Marathon", "marathon"],
            ["Ultra", "ultra"],
          ].map(([label, slug]) => (
            <a
              key={slug}
              href={`${place ?? "/races/places"}/running/${slug}`}
              className={linkClass}
            >
              {label}
            </a>
          ))}
        </div>
      </section>
      <nav aria-label="More running events" className="flex flex-wrap gap-x-6">
        <a href={`/sports/parkrun${search}`} className={linkClass}>
          Find parkrun events
        </a>
        <a href={`/sports/track-and-field${search}`} className={linkClass}>
          Explore track & field
        </a>
        {site ? (
          <a href="/running" className={linkClass}>
            Explore running worldwide
          </a>
        ) : null}
      </nav>
    </div>
  );
}

export function RunningDisciplineDiscovery({ discipline }: { discipline: PlaceTerrain }) {
  return (
    <div className="space-y-7 pb-8">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <a href="/" className={linkClass}>
          AthRecs
        </a>{" "}
        /{" "}
        <a href={runningHubPath()} className={linkClass}>
          Running
        </a>{" "}
        / <span aria-current="page">{discipline.label}</span>
      </nav>
      <header className="max-w-3xl">
        <h1 className="font-display text-4xl font-semibold">
          {discipline.heading} around the world
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {discipline.description} Choose a continent to browse countries, then narrow down to a
          state, county or area.
        </p>
      </header>
      <a
        href={`/running/events?sport=Running&surface=${encodeURIComponent(discipline.surface)}`}
        className={linkClass}
      >
        Search all {discipline.label.toLowerCase()} races
      </a>
      <section aria-labelledby="running-continents" className="space-y-4">
        <h2 id="running-continents" className="font-display text-2xl font-semibold">
          Choose a continent
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DISCOVERY_CONTINENTS.map((continent) => (
            <a
              key={continent}
              href={`/races/places/${countrySlug(continent)}/running/${discipline.slug}`}
              className={cardClass}
            >
              <h3 className="font-display text-xl font-semibold">{continent}</h3>
              <p className="mt-3 text-muted">Browse {discipline.label.toLowerCase()} by country</p>
              <ArrowRight className="mt-4 size-5 text-accent" aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
      {discipline.slug === "road" ? (
        <section className="space-y-5 border-t border-border pt-6">
          <h2 className="font-display text-2xl font-semibold">Road race guides</h2>
          <p className="text-muted">
            Looking for a longer race? Explore the established marathon and half-marathon guides.
          </p>
          {[
            { title: "Road marathons by country", items: MARATHON_COUNTRIES },
            { title: "Road half marathons by country", items: HALF_MARATHON_COUNTRIES },
          ].map((group) => (
            <div key={group.title}>
              <h3
                id={group.title.includes("half") ? "half-marathons" : "countries-title"}
                className="scroll-mt-24 text-lg font-semibold"
              >
                {group.title}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-6">
                {group.items.map((item) => (
                  <a key={item.id} className={linkClass} href={`/running/${item.guide}`}>
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          ))}
          <a href="/running/uk-road-ultramarathons" className={linkClass}>
            UK road ultramarathons
          </a>
        </section>
      ) : null}
    </div>
  );
}
