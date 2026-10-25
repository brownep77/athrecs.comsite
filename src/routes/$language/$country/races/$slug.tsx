import { SITE_URL, siteGraphMeta, sportsEventJsonLd } from "@/lib/athrecs/seo";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { raceSearchContent } from "@/lib/athrecs/race-search-content";
import { racePageMetadata } from "@/lib/athrecs/race-page-metadata";
import { reviewedRacePage } from "@/data/race-page-reviews";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
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

    const loaded = await getEventBySlug({ data: params.slug });
    const data = loaded ? reviewedRacePage(loaded) : null;
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
    const content = raceSearchContent(data);
    const metadata = racePageMetadata(data.event, data.upcoming);
    const next = metadata.next;
    return {
      meta: siteGraphMeta({
        title: IS_RUNRECS_SITE ? content.title.replace(/\| AthRecs$/, "| RunRecs") : content.title,
        description: content.description,
        url,
      }),
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(
            sportsEventJsonLd({
              ...data.event,
              description: content.biography.join(" "),
              region: data.event.county,
              startDate: next?.event_date,
              startTime: metadata.startTime,
              utcOffset: metadata.utcOffset,
              endDate: next?.end_date,
              endTime: metadata.endTime,
              endUtcOffset: metadata.endUtcOffset,
              venue: metadata.venue,
              organiser: metadata.organiser ?? data.event.organiser,
              website: metadata.organiserWebsite,
              entryOptions: next?.entry_options,
            }),
          ).replace(/</g, "\\u003c"),
        },
      ],
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
