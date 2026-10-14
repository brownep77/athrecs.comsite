import { Link } from "@tanstack/react-router";
import { ArrowRight, Footprints } from "lucide-react";
import { HALF_MARATHON_COUNTRIES } from "@/data/road-half-marathons/countries";
import { ROAD_HALF_MARATHONS, roadHalfMarathonsForCountry } from "@/data/road-half-marathons";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import { ROAD_MARATHONS, roadMarathonsForCountry } from "@/data/road-marathons";
import { ROAD_ULTRAS } from "@/lib/running/road-ultras";

import { SITE_URL } from "@/lib/athrecs/seo";
import {
  countryCardStyle,
  neutralPastelCardStyle,
  pastelCardClassName,
  runningCountryPalettes,
} from "@/lib/running/country-card-palette";

export function runningGuidesJsonLd(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AthRecs road marathon, half marathon and UK ultra guides",
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: MARATHON_COUNTRIES.length + HALF_MARATHON_COUNTRIES.length + 1,
      itemListElement: [
        ...[...MARATHON_COUNTRIES, ...HALF_MARATHON_COUNTRIES].map((country, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${country.name} road ${country.guide.includes("-half-") ? "half marathons" : "marathons"}`,
          url: `${SITE_URL}/running/${country.guide}`,
        })),
        {
          "@type": "ListItem",
          position: MARATHON_COUNTRIES.length + HALF_MARATHON_COUNTRIES.length + 1,
          name: "UK road ultramarathons",
          url: `${SITE_URL}/running/uk-road-ultramarathons`,
        },
      ],
    },
  };
}

export function RunningLanding({ homepage = false }: { homepage?: boolean }) {
  const tools = (
    <nav aria-label="Running tools" className="grid gap-3 sm:grid-cols-3">
      {[
        {
          to: "/running/events",
          title: "Search running races",
          detail: "Road, trail, fell, ultras and parkrun. Filter by country, distance and date.",
        },
        {
          to: "/running/calendar",
          title: "Running calendar",
          detail: "Browse published race days, start times and locations.",
        },
        {
          to: "/running/race-series",
          title: "Race series",
          detail: "Explore the World Marathon Majors and UTMB race collections.",
        },
      ].map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={pastelCardClassName}
          style={neutralPastelCardStyle}
        >
          <h2 className="font-display text-xl font-semibold text-slate-900">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">{item.detail}</p>
          <span className="mt-3 inline-flex min-h-10 items-center gap-2 font-semibold">
            Explore <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </nav>
  );
  const distances = (
    <nav
      aria-label="Race distances"
      className="flex flex-wrap gap-5 text-base font-semibold text-accent"
    >
      <a href="#half-marathons" className="min-h-11 inline-flex items-center">
        Half marathons · 13.1 miles
      </a>
      <a href="#countries-title" className="min-h-11 inline-flex items-center">
        Marathons · 26.2 miles
      </a>
      <a href="#ultras" className="min-h-11 inline-flex items-center">
        UK road ultras · Beyond the marathon
      </a>
    </nav>
  );
  const halves = (
    <section aria-labelledby="half-marathons">
      <h2
        id="half-marathons"
        className="scroll-mt-24 font-display text-2xl font-semibold text-slate-900"
      >
        Road half marathons by country
      </h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted">
        Find your next 13.1-mile race, from a city start line to a coastal road. Each guide brings
        together dates, entry methods, routes and official results.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {HALF_MARATHON_COUNTRIES.map((country) => (
          <Link
            key={country.id}
            to="/running/$guide"
            params={{ guide: country.guide }}
            className={pastelCardClassName}
            style={countryCardStyle(country.id)}
          >
            <p className="text-sm font-semibold">
              {roadHalfMarathonsForCountry(country.id).length} half marathon guides
            </p>
            <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">
              {country.name}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{country.description}</p>
            <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold">
              Explore road half marathons <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
  const marathons = (
    <section aria-labelledby="countries-title">
      <h2 id="countries-title" className="scroll-mt-24 font-display text-2xl font-semibold">
        Road marathons by country
      </h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MARATHON_COUNTRIES.map((country) => {
          const palette = runningCountryPalettes[country.id];
          const style = countryCardStyle(country.id);
          const content = (
            <>
              <div className="flex items-center justify-between" style={{ color: palette.accent }}>
                <Footprints className="size-6" aria-hidden="true" />
                <span className="text-xs font-semibold">
                  {roadMarathonsForCountry(country.id).length} race guides
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold text-slate-900">
                {country.name}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{country.description}</p>
              <span
                className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold"
                style={{ color: palette.accent }}
              >
                Explore road marathons <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </>
          );
          const className = pastelCardClassName;
          return country.id === "uk" ? (
            <Link key={country.id} to="/running/uk-marathons" className={className} style={style}>
              {content}
            </Link>
          ) : (
            <Link
              key={country.id}
              to="/running/$guide"
              params={{ guide: country.guide }}
              className={className}
              style={style}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="space-y-8 pb-8">
      {homepage ? tools : null}
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {homepage ? "AthRecs · Races, results and athletes" : "AthRecs · Running"}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Find your next
          <br />
          <span className="text-accent">running event</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
          {homepage ? (
            <>
              Choose a country and explore marathons, half marathons and ultras, with race dates,
              entry options, routes and previous results.
            </>
          ) : (
            <>
              Marathon or half marathon? Choose between 42.195 kilometres and 21.0975 kilometres,
              then find the setting that suits your running. Explore races in the UK, Australia, New
              Zealand, the USA, Canada, Ireland and South Africa, with dates, entry options, course
              maps and previous results. Whether you prefer a busy city start or a smaller field,
              there is plenty to explore. For a longer challenge, discover our UK road ultramarathon
              guide. Then comes the small matter of training for it.
            </>
          )}
        </p>
        <p className="mt-4 text-sm font-semibold">
          {ROAD_MARATHONS.length + ROAD_HALF_MARATHONS.length + ROAD_ULTRAS.length} race and event
          guides · {MARATHON_COUNTRIES.length} countries · Published dates and dates TBC
        </p>
        {homepage ? (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-accent">
            <Link to="/races" className="inline-flex min-h-11 items-center">
              All fixtures
            </Link>
            <Link to="/results" className="inline-flex min-h-11 items-center">
              Race results
            </Link>
            <Link to="/athletes" className="inline-flex min-h-11 items-center">
              Find an athlete
            </Link>
            <Link to="/join" className="inline-flex min-h-11 items-center">
              Build my profile
            </Link>
            <Link to="/athlete-account" className="inline-flex min-h-11 items-center">
              Find my results
            </Link>
          </div>
        ) : null}
      </header>
      {homepage ? (
        <>
          {distances}
          {marathons}
          {halves}
        </>
      ) : (
        <>
          {tools}
          {distances}
          {halves}
          {marathons}
        </>
      )}
      <section aria-labelledby="ultras">
        <h2 id="ultras" className="scroll-mt-24 font-display text-2xl font-semibold text-slate-900">
          UK road ultramarathons
        </h2>
        <Link
          to="/running/uk-road-ultramarathons"
          className={`mt-5 max-w-3xl ${pastelCardClassName}`}
          style={countryCardStyle("uk")}
        >
          <p className="text-sm font-semibold">{ROAD_ULTRAS.length} events and event series</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-slate-900">
            Go beyond 26.2 miles
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            Road races, paved-path ultras, timed challenges and longer journeys. Compare distances
            and surfaces, with provisional dates and historical editions clearly labelled.
          </p>
          <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold">
            Explore UK road ultras <ArrowRight className="size-4" aria-hidden="true" />
          </span>
        </Link>
      </section>
      <section className="grid gap-6 border-t border-border pt-7 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Inside each race guide</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Entry methods and eligibility, official route maps, course profiles, confirmed race
            dates, previous results and, where available, category summaries, race news, photos and
            video.
          </p>
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold">Your running record</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Bring your race results, PBs and progress into one athlete profile.
          </p>
          <div className="mt-3 flex flex-wrap gap-5">
            <Link
              to="/athletes"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
            >
              Find an athlete
            </Link>
            <Link
              to="/athlete-account"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-accent"
            >
              Find my results
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
