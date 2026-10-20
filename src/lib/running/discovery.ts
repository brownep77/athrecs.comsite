import { COUNTRY_CONTINENTS } from "@/data/country-continents";
import { countryFromIso, resolveCountry } from "@/lib/athrecs/countries";
import { COUNTRY_SITES, countrySlug, type CountrySite } from "@/lib/athrecs/country-sites";
import { PLACE_TERRAINS } from "@/lib/athrecs/race-place-facets";
import { SITE_URL } from "@/lib/athrecs/seo";

export const RUNNING_DISCIPLINES = PLACE_TERRAINS;
export const DISCOVERY_CONTINENTS = [
  "Europe",
  "North America",
  "Oceania",
  "Africa",
  "Asia",
  "South America",
  "Antarctica",
];
export const FEATURED_SPORT_COUNTRIES = [
  "united-kingdom",
  "ireland",
  "united-states",
  "canada",
  "australia",
  "new-zealand",
  "south-africa",
];
export const discoveryCountry = (slug?: string) => COUNTRY_SITES.find((site) => site.slug === slug);
export function countryPlacePath(site: CountrySite) {
  const info = resolveCountry({ country: site.country });
  const continent = COUNTRY_CONTINENTS[info.iso];
  if (!continent) return null;
  return `/races/places/${countrySlug(continent)}/${countrySlug(countryFromIso(info.iso).name)}${info.ukNation ? `/${countrySlug(info.ukNation)}` : ""}`;
}
export function runningHubPath(site?: CountrySite) {
  return site ? `/running?country=${encodeURIComponent(site.slug)}` : "/running";
}
export function runningDisciplinePath(slug: string, site?: CountrySite) {
  const place = site && countryPlacePath(site);
  return place ? `${place}/running/${slug}` : `/running/${slug}`;
}
export function discoveryJsonLd(
  url: string,
  name: string,
  links: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: links.length,
      itemListElement: links.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: SITE_URL + item.path,
      })),
    },
  };
}
