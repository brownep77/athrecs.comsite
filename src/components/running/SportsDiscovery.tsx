import { ArrowRight, Bike, Footprints, Medal, Search, Timer, Waves } from "lucide-react";
import { sportColourClass } from "@/lib/athrecs/event-colours";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { COUNTRY_SITES, type CountrySite } from "@/lib/athrecs/country-sites";
import {
  discoveryCountry,
  FEATURED_SPORT_COUNTRIES,
  runningHubPath,
} from "@/lib/running/discovery";
import { useHomepageTheme } from "@/components/running/HomepageAppearance";
import { homepageCardStyle } from "@/lib/running/homepage-themes";
import { neutralPastelCardStyle } from "@/lib/running/country-card-palette";

export function SportChoices({ site }: { site?: CountrySite }) {
  const theme = useHomepageTheme();
  const query = site ? `?country=${encodeURIComponent(site.country)}` : "";
  const sportPath = (slug: string) => `/sports/${slug}${query}`;
  const cards = [
    {
      label: "Running",
      text: "Road, trail, fell and cross country. Choose your running, then find your next race.",
      href: runningHubPath(site),
      icon: Footprints,
    },
    {
      label: "Triathlon",
      text: "Swim, bike and run. Explore fixtures and event information.",
      href: sportPath("triathlon"),
      icon: Timer,
    },
    {
      label: "Track & field",
      text: "Track meetings, field events and competition fixtures.",
      href: sportPath("track-and-field"),
      icon: Medal,
    },
    {
      label: "Duathlon",
      text: "Run, bike and run. Find duathlon fixtures, distances and event details.",
      href: sportPath("duathlon"),
      icon: Timer,
    },
    {
      label: "Swimming",
      text: "Browse swimming fixtures and event information.",
      href: sportPath("swimming"),
      icon: Waves,
    },
    {
      label: "parkrun",
      text: "Find parkrun events and explore the weekly calendar.",
      href: sportPath("parkrun"),
      icon: Footprints,
    },
  ];
  return (
    <section aria-labelledby="choose-sport" className="space-y-4">
      <h2 id="choose-sport" className="font-display text-2xl font-semibold">
        Choose your sport{site ? ` in ${site.country}` : ""}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, index) => (
          <a
            key={card.label}
            href={card.href}
            className={`flex flex-col rounded-xl border p-5 no-underline hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent ${index === 0 ? "border-2 border-accent sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}
            style={homepageCardStyle(
              theme,
              neutralPastelCardStyle,
              "tone",
              (index % 3) as 0 | 1 | 2,
            )}
          >
            <span
              className={`inline-flex size-10 items-center justify-center rounded-lg border ${sportColourClass(card.label)}`}
            >
              <card.icon className="size-6" aria-hidden="true" />
            </span>
            <h3
              className={`mt-4 font-display font-semibold text-slate-900 ${index === 0 ? "text-3xl" : "text-xl"}`}
            >
              {card.label}
            </h3>
            <p className="mt-3 flex-1 text-sm leading-6 text-slate-700">{card.text}</p>
            <span className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold">
              Explore {card.label.toLowerCase()}{" "}
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        ))}
        <div className="rounded-xl border border-border bg-surface p-5 sm:col-span-2 lg:col-span-3">
          <span
            className={`inline-flex size-10 items-center justify-center rounded-lg border ${sportColourClass("Cycling")}`}
          >
            <Bike className="size-6" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-display text-xl font-semibold">Cycling</h3>
          <div className="mt-3 flex flex-wrap gap-x-5">
            {[
              ["Road", "road-cycling"],
              ["Mountain biking", "mountain-biking"],
              ["Track", "track-cycling"],
              ["BMX", "bmx"],
            ].map(([label, slug]) => (
              <a
                key={slug}
                href={sportPath(slug)}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-accent underline underline-offset-4"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SportsDiscovery({ site }: { site?: CountrySite }) {
  const theme = useHomepageTheme();
  return (
    <div className="space-y-7">
      <header className="max-w-3xl">
        {site ? (
          <CountryFlag country={site.country} showName showCode />
        ) : (
          <p className="text-sm font-semibold text-accent">
            AthRecs · Every sport. Your next start line.
          </p>
        )}
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {site ? `Sport in ${site.country}` : "Find your sport. Find your next race."}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {site
            ? `Explore running and other sports in ${site.country}. Choose a sport below, or search for an event you already have in mind.`
            : "Start with running, explore another sport, or choose a country. Find upcoming events, past results and your next challenge."}
        </p>
      </header>
      <form
        action="/running/events"
        method="get"
        role="search"
        aria-label="Find a running race"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4"
      >
        {site ? <input type="hidden" name="country" value={site.country} /> : null}
        <div className="min-w-40 flex-1">
          <label htmlFor="discovery-race-search" className="text-sm font-semibold">
            Find a running race
          </label>
          <input
            id="discovery-race-search"
            name="q"
            type="search"
            placeholder="Race name, town or place"
            maxLength={120}
            className="mt-2 h-12 w-full rounded-lg border border-border bg-bg px-3"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-primary-fg"
        >
          <Search className="size-4" aria-hidden="true" />
          Find races
        </button>
      </form>
      <nav
        aria-label="Race and athlete shortcuts"
        className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-accent"
      >
        {[
          ["/running/calendar", "Running calendar"],
          ["/races", "All fixtures"],
          ["/results", "Race results"],
          ["/athletes", "Find an athlete"],
          ["/join", "Build my profile"],
          ["/athlete-account", "Find my results"],
        ].map(([href, title]) => (
          <a
            key={href}
            href={
              site && href === "/running/calendar"
                ? `/running/events?country=${encodeURIComponent(site.country)}`
                : href
            }
            className="inline-flex min-h-11 items-center underline underline-offset-4"
          >
            {title}
          </a>
        ))}
      </nav>
      <SportChoices site={site} />
      {!site ? (
        <section aria-labelledby="sport-countries" className="space-y-4">
          <h2 id="sport-countries" className="font-display text-2xl font-semibold">
            Explore sports by country
          </h2>
          <p className="text-muted">Choose a country to see its sports, with running first.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_SPORT_COUNTRIES.map(discoveryCountry)
              .filter((country): country is CountrySite => !!country)
              .map((country, index) => (
                <a
                  key={country.slug}
                  href={`/en/${country.slug}`}
                  className="rounded-xl border p-5 no-underline hover:shadow-md"
                  style={homepageCardStyle(
                    theme,
                    neutralPastelCardStyle,
                    "tone",
                    (index % 3) as 0 | 1 | 2,
                  )}
                >
                  <CountryFlag country={country.country} showName showCode />
                  <p className="mt-3 text-sm text-slate-700">
                    Running, other sports and event calendars
                  </p>
                  <span className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold">
                    Explore sports <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                </a>
              ))}
          </div>
          <details className="rounded-xl border border-border p-4">
            <summary className="min-h-11 cursor-pointer font-semibold">
              Browse all countries and territories
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {COUNTRY_SITES.map((country) => (
                <a
                  key={country.slug}
                  href={`/en/${country.slug}`}
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-accent"
                >
                  <CountryFlag country={country.country} />
                  {country.country}
                </a>
              ))}
            </div>
          </details>
        </section>
      ) : null}
    </div>
  );
}
