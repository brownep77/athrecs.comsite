import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { DIRECTORY_COUNTRIES } from "@/lib/athrecs/sports-directory";
import { SportsDiscovery } from "@/components/running/SportsDiscovery";
import {
  COUNTRY_SITES,
  countrySiteFromSlug,
  isSiteLanguage,
  type CountrySite,
} from "@/lib/athrecs/country-sites";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { discoveryJsonLd, runningHubPath } from "@/lib/running/discovery";

export const Route = createFileRoute("/$language/$country/")({
  loader: ({ params }) => {
    const site = countrySiteFromSlug(params.country);
    if (!site || !isSiteLanguage(params.language)) throw notFound();
    return { site };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { site } = loaderData;
    // Editorial copy is English. Preserve the established canonical language.
    const url = `${SITE_URL}/en/${site.slug}`;
    const title = `Sport in ${site.country}: running, races & events | AthRecs`;
    return {
      meta: siteGraphMeta({
        title,
        description: `Explore running and other sports in ${site.country}. Choose road, trail, triathlon, track and field, cycling or swimming and find events on AthRecs.`,
        url,
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            discoveryJsonLd(url, title, [
              { name: `Running in ${site.country}`, path: runningHubPath(site) },
            ]),
          ),
        },
      ],
    };
  },
  component: CountrySportsPage,
});
function CountrySportsPage() {
  // Vite replaces the base country route; the generated tree retains its loader type.
  const { site } = Route.useLoaderData() as unknown as { site: CountrySite };
  return (
    <div className="space-y-6 pb-8">
      <nav aria-label="Breadcrumb" className="flex min-h-11 items-center gap-2 text-sm">
        <a className="text-accent underline" href="/">
          AthRecs
        </a>
        <span>/</span>
        <span aria-current="page">{site.country}</span>
      </nav>
      <form action="/running" method="get" className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 max-w-md">
          <label htmlFor="sport-country" className="block text-sm font-semibold">
            Choose another country
          </label>
          <select
            id="sport-country"
            name="country"
            defaultValue={site.slug}
            className="mt-2 min-h-11 w-full max-w-full rounded-lg border border-border bg-surface px-3"
          >
            {COUNTRY_SITES.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.country}
              </option>
            ))}
          </select>
        </div>
        <button
          className="min-h-11 rounded-lg border border-border px-4 font-semibold"
          type="submit"
        >
          Explore running
        </button>
      </form>
      <SportsDiscovery site={site} />
      <Link
        to="/directory"
        search={{
          country: DIRECTORY_COUNTRIES.includes(site.country) ? site.country : "International",
        }}
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm font-semibold"
      >
        {DIRECTORY_COUNTRIES.includes(site.country)
          ? `Sports federations and governing bodies in ${site.country}`
          : "International sports federations"}{" "}
        →
      </Link>
    </div>
  );
}
