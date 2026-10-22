import type { PublicResultEdition, PublicRaceResult } from "./public-results-api";
import type { ResultsSearch } from "./public-results-search";
import { formatDuration, formatRaceDateShort } from "./format";
import { resultSlug } from "./result-slug";
import { SITE_URL, siteGraphMeta } from "./seo";

/** Describe only the public rows already rendered on this results page. */
export function publicResultsHead(
  edition: PublicResultEdition,
  results: PublicRaceResult[],
  search: Pick<ResultsSearch, "q" | "page">,
) {
  const baseUrl = `${SITE_URL}/results/${resultSlug(edition)}`;
  const filtered = Boolean(search.q);
  const url = !filtered && search.page > 1 ? `${baseUrl}?page=${search.page}` : baseUrl;
  const title = `${edition.event_name} ${edition.distance_code} results — ${edition.event_date.slice(0, 10)}${search.page > 1 ? ` — Page ${search.page}` : ""} | ATHRECS.com`;
  const description = `${edition.result_count.toLocaleString("en-GB")} recorded ${edition.distance_code} performance${edition.result_count === 1 ? "" : "s"} from ${edition.event_name}, ${formatRaceDateShort(edition.event_date)}${edition.city ? `, ${edition.city}` : ""}. Search athlete times and source results; coverage may be partial.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    inLanguage: "en-GB",
    // A results archive describes a completed race, not an event people can
    // attend or buy tickets for. Nested SportsEvent also triggers Google's
    // Event rich-result parser, even inside a CollectionPage.
    about: {
      "@type": "Thing",
      "@id": `${baseUrl}#event`,
      name: `${edition.event_name} ${edition.distance_code}`,
      description: `${edition.sport} race held on ${edition.event_date.slice(0, 10)}${edition.city || edition.country ? ` in ${[edition.city, edition.country].filter(Boolean).join(", ")}` : ""}.`,
    },
    mainEntity: {
      "@type": "ItemList",
      name: `Recorded results on page ${search.page}`,
      numberOfItems: results.length,
      itemListElement: results.map((result) => {
        const finished =
          ["finished", "fin"].includes(result.status.trim().toLowerCase()) && !result.disqualified;
        const details = finished
          ? [
              result.finish_time_seconds !== null
                ? `Recorded time ${formatDuration(result.finish_time_seconds)}`
                : "Finish time not supplied",
              ...(result.chip_time_seconds !== null
                ? [`chip time ${formatDuration(result.chip_time_seconds)}`]
                : []),
              ...(result.gun_time_seconds !== null
                ? [`gun time ${formatDuration(result.gun_time_seconds)}`]
                : []),
              ...(result.overall_place !== null ? [`source position ${result.overall_place}`] : []),
            ].join("; ")
          : result.disqualified
            ? "Disqualified"
            : result.status;
        return {
          "@type": "ListItem",
          // Display order is not an official placing. Never renumber a partial field.
          url: `${url}#result-${result.id}`,
          name: `${result.athlete_name} — ${edition.distance_code} recorded result`,
          description: details,
          item: result.athlete_slug ? {
            "@type": "Person",
            name: result.athlete_name,
            url: `${SITE_URL}/athletes/${encodeURIComponent(result.athlete_slug)}`,
          } : {
            "@type": "Thing",
            name: result.athlete_name,
            description: "Recorded name under review; athlete profile not linked",
          },
        };
      }),
    },
  };
  return {
    meta: siteGraphMeta({ title, description, url }).map((meta) =>
      filtered && "name" in meta && meta.name === "robots"
        ? { name: "robots", content: "noindex, follow" }
        : meta,
    ),
    links: [{ rel: "canonical", href: url }],
    // Search variants remain noindex and do not advertise a different collection.
    scripts: filtered
      ? []
      : [
          {
            type: "application/ld+json",
            children: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          },
        ],
  };
}
