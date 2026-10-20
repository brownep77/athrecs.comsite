import { Link } from "@tanstack/react-router";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import {
  ArrowRight,
  CalendarDays,
  Footprints,
  Medal,
  Mountain,
  Search,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import { HALF_MARATHON_COUNTRIES } from "@/data/road-half-marathons/countries";
import { ROAD_HALF_MARATHONS, roadHalfMarathonsForCountry } from "@/data/road-half-marathons";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import { ROAD_MARATHONS, roadMarathonsForCountry } from "@/data/road-marathons";
import { ROAD_ULTRAS } from "@/lib/running/road-ultras";
import { useHomepageTheme } from "@/components/running/HomepageAppearance";
import { homepageCardStyle } from "@/lib/running/homepage-themes";

import { SITE_URL } from "@/lib/athrecs/seo";
import {
  countryCardStyle,
  neutralPastelCardStyle,
  pastelCardClassName,
} from "@/lib/running/country-card-palette";

const homepageCardStyles = {
  blue: {
    background: "linear-gradient(135deg, #dceaff 0%, #edf4ff 100%)",
    borderColor: "#bbd0ee",
    color: "#2c4d76",
  },
  mint: {
    background: "linear-gradient(135deg, #def2e5 0%, #eff9f2 100%)",
    borderColor: "#b9d9c5",
    color: "#275d43",
  },
  lavender: {
    background: "linear-gradient(135deg, #e8def8 0%, #f4effc 100%)",
    borderColor: "#cec0e5",
    color: "#5a3e7e",
  },
  peach: {
    background: "linear-gradient(135deg, #ffe4d4 0%, #fff3e9 100%)",
    borderColor: "#e9c6ad",
    color: "#804523",
  },
  rose: {
    background: "linear-gradient(135deg, #f8dce7 0%, #fdf0f5 100%)",
    borderColor: "#e5bbce",
    color: "#813953",
  },
  butter: {
    background: "linear-gradient(135deg, #f8edc9 0%, #fff9e6 100%)",
    borderColor: "#e2d49d",
    color: "#725719",
  },
};

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
  const theme = useHomepageTheme();
  const compactCardClassName =
    "group rounded-xl border p-4 no-underline transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-600";
  const tools = (
    <nav aria-label="Running tools" className="grid gap-3 sm:grid-cols-3">
      {[
        {
          to: "/running/events",
          title: "Search running races",
          detail: "Road, trail, fell, ultras and parkrun. Filter by country, distance and date.",
          style: homepageCardStyles.blue,
        },
        {
          to: "/running/calendar",
          title: "Running calendar",
          detail: "Browse published race days, start times and locations.",
          style: homepageCardStyles.mint,
        },
        {
          to: "/running/race-series",
          title: "Race series",
          detail: "Explore the World Marathon Majors and UTMB race collections.",
          style: homepageCardStyles.lavender,
        },
      ].map((item, index) => (
        <Link
          key={item.to}
          to={item.to}
          className={pastelCardClassName}
          style={
            homepage || theme !== "colourful"
              ? homepageCardStyle(theme, item.style, "tone", index as 0 | 1 | 2)
              : neutralPastelCardStyle
          }
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
      className={
        homepage
          ? "grid gap-3 sm:grid-cols-3"
          : "flex flex-wrap gap-5 text-base font-semibold text-accent"
      }
    >
      {[
        {
          href: "#half-marathons",
          title: "Half marathons",
          detail: "13.1 miles",
          icon: Footprints,
          style: homepageCardStyles.butter,
        },
        {
          href: "#countries-title",
          title: "Marathons",
          detail: "26.2 miles",
          icon: Medal,
          style: homepageCardStyles.peach,
        },
        {
          href: "#ultras",
          title: "UK road ultras",
          detail: "Beyond the marathon",
          icon: Mountain,
          style: homepageCardStyles.lavender,
        },
      ].map((item, index) => (
        <a
          key={item.href}
          href={item.href}
          className={
            homepage
              ? `${compactCardClassName} flex min-h-24 items-center gap-3`
              : "min-h-11 inline-flex items-center"
          }
          style={
            homepage ? homepageCardStyle(theme, item.style, "tone", index as 0 | 1 | 2) : undefined
          }
        >
          {homepage ? (
            <span className="homepage-distance-icon flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/70">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
          ) : null}
          <span className="min-w-0">
            <span
              className={
                homepage ? "block font-display text-lg font-semibold text-slate-900" : undefined
              }
            >
              {item.title}
            </span>
            {homepage ? (
              <span className="mt-1 block text-sm text-slate-700">{item.detail}</span>
            ) : (
              ` · ${item.detail}`
            )}
          </span>
          {homepage ? <ArrowRight className="ml-auto size-4 shrink-0" aria-hidden="true" /> : null}
        </a>
      ))}
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
            style={homepageCardStyle(theme, countryCardStyle(country.id), "country", 0, country.id)}
          >
            <div className="flex items-center justify-between gap-3">
              <CountryFlag country={country.countryCode} />
              <p className="text-sm font-semibold">
                {roadHalfMarathonsForCountry(country.id).length} half marathon guides
              </p>
            </div>
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
          const style = homepageCardStyle(
            theme,
            countryCardStyle(country.id),
            "country",
            0,
            country.id,
          );
          const content = (
            <>
              <div className="flex items-center justify-between gap-3" style={{ color: style.color }}>
                <CountryFlag country={country.countryCode} />
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
                style={{ color: style.color }}
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
      <header className={homepage ? undefined : "max-w-4xl"}>
        {homepage ? (
          <h1 className="sr-only">Running races, results and athlete profiles</h1>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              AthRecs · Running
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Find your next
              <br />
              <span className="text-accent">running event</span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
              Marathon or half marathon? Choose between 42.195 kilometres and 21.0975 kilometres,
              then find the setting that suits your running. Explore races in the UK, Australia, New
              Zealand, the USA, Canada, Ireland and South Africa, with dates, entry options, course
              maps and previous results. Whether you prefer a busy city start or a smaller field,
              there is plenty to explore. For a longer challenge, discover our UK road ultramarathon
              guide. Then comes the small matter of training for it.
            </p>
            <p className="mt-4 text-sm font-semibold">
              {ROAD_MARATHONS.length + ROAD_HALF_MARATHONS.length + ROAD_ULTRAS.length} race and
              event guides · {MARATHON_COUNTRIES.length} countries · Published dates and dates TBC
            </p>
          </>
        )}
        {homepage ? (
          <nav
            aria-label="Race and athlete shortcuts"
            className="grid grid-cols-2 gap-3 lg:grid-cols-5"
          >
            {(
              [
                {
                  to: "/races",
                  title: "All fixtures",
                  icon: CalendarDays,
                  style: homepageCardStyles.blue,
                },
                {
                  to: "/results",
                  title: "Race results",
                  icon: Trophy,
                  style: homepageCardStyles.peach,
                },
                {
                  to: "/athletes",
                  title: "Find an athlete",
                  icon: Users,
                  style: homepageCardStyles.lavender,
                },
                {
                  to: "/join",
                  title: "Build my profile",
                  icon: UserPlus,
                  style: homepageCardStyles.mint,
                },
                {
                  to: "/athlete-account",
                  title: "Find my results",
                  icon: Search,
                  style: homepageCardStyles.rose,
                },
              ] as const
            ).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`${compactCardClassName} flex min-h-24 flex-col gap-3 last:col-span-2 lg:last:col-span-1`}
                style={homepageCardStyle(theme, item.style)}
              >
                <item.icon className="size-5" aria-hidden="true" />
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  <span className="text-slate-900">{item.title}</span>
                  <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </nav>
        ) : null}
      </header>
      <a href="/races/places" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-5 hover:border-accent">
        <span><span className="block font-semibold">Major races by location</span><span className="mt-1 block text-sm text-muted">Explore continents, countries, states and counties, with upcoming dates and past editions.</span></span>
        <ArrowRight className="size-5" aria-hidden="true" />
      </a>
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
          style={homepageCardStyle(theme, countryCardStyle("uk"), "country", 0, "uk")}
        >
          <div className="flex items-center justify-between gap-3">
            <CountryFlag country="GB" />
            <p className="text-sm font-semibold">{ROAD_ULTRAS.length} events and event series</p>
          </div>
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
