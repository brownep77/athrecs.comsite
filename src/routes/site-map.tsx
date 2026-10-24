import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { PUBLIC_PAGES } from "@/lib/athrecs/public-pages";
import { COUNTRY_SITES } from "@/lib/athrecs/country-sites";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const loadGuideLinks = createServerFn({ method: "GET" }).handler(async () => {
  const { getRunningGuideDirectory } = await import("@/lib/running/guide-directory.server");
  const directory = await getRunningGuideDirectory();
  return {
    countries: directory.countries.flatMap((country) =>
      country.links.map((link) => ({ name: link.name, path: link.path, country: country.name })),
    ),
    series: directory.series.map((series) => ({ name: series.name, path: series.path })),
  };
});

export const Route = createFileRoute("/site-map")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => loadGuideLinks(),
  head: () => ({
    meta: siteGraphMeta({
      title: "Browse AthRecs | Sports, athletes, results and countries",
      description:
        "Find your way around AthRecs: athlete profiles, race results, sports fixtures, clubs and country event calendars.",
      url: `${SITE_URL}/site-map`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}/site-map` }],
  }),
  component: SiteMapPage,
});

function SiteMapPage() {
  const guides = Route.useLoaderData();
  return (
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
      <section aria-labelledby="running-guide-links">
        <h2 id="running-guide-links" className="font-display text-2xl font-semibold">
          Running country guides and race series
        </h2>
        <p className="mt-3 text-muted">
          Explore the{" "}
          <a href="/running/guides" className="text-accent underline">
            running guides directory
          </a>{" "}
          for individual race guides, course previews and practical runner information.
        </p>
        <h3 className="mt-5 font-display text-xl font-semibold">Country race guides</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {guides.countries.map((guide) => (
            <li key={guide.path}>
              <a
                href={guide.path}
                className="inline-flex min-h-11 items-center gap-2 text-accent underline"
              >
                <span aria-hidden="true">
                  <CountryFlag country={guide.country} />
                </span>
                {guide.name}
              </a>
            </li>
          ))}
        </ul>
        <h3 className="mt-5 font-display text-xl font-semibold">Race series and collections</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {guides.series.map((guide) => (
            <li key={guide.path}>
              <a
                href={guide.path}
                className="inline-flex min-h-11 items-center text-accent underline"
              >
                {guide.name}
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
                <span aria-hidden="true" className="mr-2">
                  {site.flag}
                </span>
                {site.country}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
