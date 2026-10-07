import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { getEventBySlug } from "@/lib/athrecs/api";
import { countryMatchesFilter, resolveCountry } from "@/lib/athrecs/countries";
import { countrySiteFromSlug, isSiteLanguage } from "@/lib/athrecs/country-sites";
import { Button } from "@/components/ui/button";
import { RacePageContent } from "@/routes/races/$slug";
import { resolveSlugRedirect } from "@/lib/athrecs/slug-redirects";

export const Route = createFileRoute("/$language/$country/races/$slug")({
  loader: async ({ params }) => {
    const site = countrySiteFromSlug(params.country);
    if (!site || !isSiteLanguage(params.language)) throw notFound();

    const data = await getEventBySlug({ data: params.slug });
    if (!data) {
      const currentSlug = await resolveSlugRedirect({
        data: { entityType: "event", slug: params.slug },
      });
      if (currentSlug && currentSlug !== params.slug) {
        throw redirect({
          to: "/$language/$country/races/$slug",
          params: { ...params, slug: currentSlug },
          statusCode: 301,
        });
      }
      throw notFound();
    }
    if (data.event.slug !== params.slug) {
      throw redirect({
        to: "/$language/$country/races/$slug",
        params: { ...params, slug: data.event.slug },
        statusCode: 301,
      });
    }

    const eventCountry = resolveCountry({
      slug: data.event.slug,
      name: data.event.name,
      country: data.event.country,
      county: data.event.county,
      city: data.event.city,
      area: data.event.area,
    });
    if (!countryMatchesFilter(eventCountry, site.country)) throw notFound();

    return { data, site, language: params.language };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { data } = loaderData;
    const url = `${SITE_URL}/races/${data.event.slug}`;
    return {
      meta: siteGraphMeta({ title: `${data.event.name} | ATHRECS`, description: `${data.event.name}: date, venue, distances, entries and results on AthRecs.`, url }),
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: LocalizedRacePage,
  notFoundComponent: LocalizedRaceNotFound,
});

function LocalizedRacePage() {
  const { data, site, language } = Route.useLoaderData();
  return <RacePageContent data={data} localized={{ language, country: site.slug }} />;
}

function LocalizedRaceNotFound() {
  const params = Route.useParams();
  const site = countrySiteFromSlug(params.country);
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="font-display text-xl font-semibold">Event not found</h1>
      <Button asChild variant="secondary">
        {site && isSiteLanguage(params.language) ? (
          <Link
            to="/$language/$country/races"
            params={{ language: params.language, country: site.slug }}
          >
            Back to events
          </Link>
        ) : (
          <Link to="/races">Back to events</Link>
        )}
      </Button>
    </div>
  );
}
