import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Footprints } from "lucide-react";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { HALF_MARATHON_COUNTRIES } from "@/data/road-half-marathons/countries";
import { ROAD_HALF_MARATHONS, roadHalfMarathonsForCountry } from "@/data/road-half-marathons";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import { ROAD_MARATHONS, roadMarathonsForCountry } from "@/data/road-marathons";
import { ROAD_ULTRAS } from "@/lib/running/road-ultras";

export const Route = createFileRoute("/running/")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    meta: siteGraphMeta({
      title: "Road Race Guides: Marathons, Half Marathons & UK Ultras | ATHRECS",
      description:
        "Explore road marathons and half marathons in seven countries, plus UK road ultramarathons. Compare entry options, routes, dates and results.",
      url: `${SITE_URL}/running`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/running` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AthRecs road marathon, half marathon and UK ultra guides",
          url: `${SITE_URL}/running`,
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
        }),
      },
    ],
  }),
  component: RunningPage,
});

function RunningPage() {
  return (
    <div className="space-y-8 pb-8">
      <header className="max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          AthRecs · Running
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Find your next
          <br />
          <span className="text-accent">road race</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
          Marathon or half marathon? Choose between 42.195 kilometres and 21.0975 kilometres, then
          find the setting that suits your running. Explore races in the UK, Australia, New Zealand,
          the USA, Canada, Ireland and South Africa, with dates, entry options, course maps and
          previous results. Whether you prefer a busy city start or a smaller field, there is plenty
          to explore. For a longer challenge, discover our UK road ultramarathon guide. Then comes
          the small matter of training for it.
        </p>
        <p className="mt-4 text-sm font-semibold">
          {ROAD_MARATHONS.length + ROAD_HALF_MARATHONS.length + ROAD_ULTRAS.length} race and event
          guides · {MARATHON_COUNTRIES.length} countries · Published dates and dates TBC
        </p>
      </header>
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
      <section aria-labelledby="half-marathons">
        <h2 id="half-marathons" className="scroll-mt-24 font-display text-2xl font-semibold">
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
              className="flex flex-col rounded-xl border border-accent/25 bg-accent-soft/20 p-5 hover:border-accent sm:p-6"
            >
              <p className="text-sm font-semibold text-accent">
                {roadHalfMarathonsForCountry(country.id).length} half marathon guides
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold">{country.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{country.description}</p>
              <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent">
                Explore road half marathons <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section aria-labelledby="countries-title">
        <h2 id="countries-title" className="font-display text-2xl font-semibold">
          Road marathons by country
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MARATHON_COUNTRIES.map((country) => {
            const content = (
              <>
                <div className="flex items-center justify-between text-accent">
                  <Footprints className="size-6" aria-hidden="true" />
                  <span className="text-xs font-semibold">
                    {roadMarathonsForCountry(country.id).length} race guides
                  </span>
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-fg">{country.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-muted">{country.description}</p>
                <span className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent">
                  Explore road marathons <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </>
            );
            const className =
              "flex flex-col rounded-xl border border-accent/25 bg-accent-soft/20 p-5 no-underline transition-colors hover:border-accent sm:p-6";
            return country.id === "uk" ? (
              <Link key={country.id} to="/running/uk-marathons" className={className}>
                {content}
              </Link>
            ) : (
              <Link
                key={country.id}
                to="/running/$guide"
                params={{ guide: country.guide }}
                className={className}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </section>
      <section aria-labelledby="ultras">
        <h2 id="ultras" className="scroll-mt-24 font-display text-2xl font-semibold">
          UK road ultramarathons
        </h2>
        <Link
          to="/running/uk-road-ultramarathons"
          className="mt-5 flex max-w-3xl flex-col rounded-xl border border-accent/25 bg-accent-soft/20 p-5 hover:border-accent sm:p-6"
        >
          <p className="text-sm font-semibold text-accent">
            {ROAD_ULTRAS.length} events and event series
          </p>
          <h3 className="mt-3 font-display text-2xl font-semibold">Go beyond 26.2 miles</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Road races, paved-path ultras, timed challenges and longer journeys. Compare distances
            and surfaces, with provisional dates and historical editions clearly labelled.
          </p>
          <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-accent">
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
            Bring your race results, personal bests and progress into one athlete profile.
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
