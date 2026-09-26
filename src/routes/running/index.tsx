import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Footprints } from "lucide-react";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { MARATHON_COUNTRIES } from "@/data/road-marathons/countries";
import { ROAD_MARATHONS, roadMarathonsForCountry } from "@/data/road-marathons";

export const Route = createFileRoute("/running/")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    meta: siteGraphMeta({
      title: "Road Marathon Guides: Dates, Entry & Results | ATHRECS",
      description:
        "Explore road marathons in the UK, Australia, New Zealand, USA, Canada, Ireland and South Africa. Compare entry options, routes, dates and results.",
      url: `${SITE_URL}/running`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/running` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "AthRecs running and road marathon guides",
          url: `${SITE_URL}/running`,
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: MARATHON_COUNTRIES.length,
            itemListElement: MARATHON_COUNTRIES.map((country, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `${country.name} road marathons`,
              url: `${SITE_URL}/running/${country.guide}`,
            })),
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
          <span className="text-accent">road marathon</span>
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-7 text-muted">
          A road marathon is 26.2 miles, or 42.195 kilometres. Choosing which one to run takes a
          little more explaining. Explore races in the UK, Australia, New Zealand, the USA, Canada,
          Ireland and South Africa, with dates, entry options, course maps and previous results.
          Whether you want a busy city start or a smaller field, find a race that suits your
          running. Then comes the small matter of training for it.
        </p>
        <p className="mt-4 text-sm font-semibold">
          {ROAD_MARATHONS.length} race guides · {MARATHON_COUNTRIES.length} countries · Confirmed
          dates through 2027
        </p>
      </header>
      <section aria-labelledby="countries-title">
        <h2 id="countries-title" className="font-display text-2xl font-semibold">
          Choose a country
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
      <section className="grid gap-6 border-t border-border pt-7 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-semibold">Inside each race guide</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Entry methods and eligibility, official route maps, course profiles, confirmed race
            dates, previous editions, category result summaries and links to race news, photos and
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
