import { createFileRoute, notFound } from "@tanstack/react-router";
import { PUBLIC_PAGES } from "@/lib/athrecs/public-pages";
import { COUNTRY_SITES } from "@/lib/athrecs/country-sites";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/site-map")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    meta: siteGraphMeta({
      title: "Browse AthRecs | Sports, athletes, results and countries",
      description:
        "Find your way around AthRecs: athlete profiles, race results, sports fixtures, clubs and country event calendars.",
      url: `${SITE_URL}/site-map`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/site-map` }],
  }),
  component: () => (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="font-display text-3xl font-semibold">Browse AthRecs</h1>
        <p className="text-base text-muted">
          Explore sports, athlete records and events around the world.
        </p>
      </header>
      <section>
        <h2 className="font-display text-2xl font-semibold">Pages and sports</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PUBLIC_PAGES.filter((page) => page.path !== "/site-map").map((page) => (
            <li key={page.path}>
              <a
                href={page.path}
                className="inline-flex min-h-11 items-center text-accent underline"
              >
                {page.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-2xl font-semibold">Events by country</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTRY_SITES.map((site) => (
            <li key={site.slug}>
              <a
                href={`/en/${site.slug}`}
                className="inline-flex min-h-11 items-center text-accent underline"
              >
                {site.country}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  ),
});
