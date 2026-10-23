import { SITE_URL } from "@/lib/athrecs/seo";
import type { MarathonCountry } from "@/data/road-marathons/types";

export const RUNNING_GUIDES_PATH = "/running/guides";
// Change only when the directory's own content or template materially changes.
export const RUNNING_GUIDES_MODIFIED = "2026-10-23";

export type RunningGuideDistance = "half-marathon" | "marathon" | "ultra";

/** Only the fields needed by the directory are sent to the browser. */
export type RunningGuideRecord = {
  id: string;
  name: string;
  path: string;
  countryId: MarathonCountry;
  countryName: string;
  countryCode: string;
  distance: RunningGuideDistance;
  location: string;
};

export type RunningGuideCountryLink = {
  name: string;
  path: string;
  distance: RunningGuideDistance;
  count: number;
};

export type RunningGuideCountry = {
  id: MarathonCountry;
  name: string;
  countryCode: string;
  regionLabel: string;
  links: RunningGuideCountryLink[];
  count: number;
};

export type RunningGuideSeries = {
  id: string;
  name: string;
  path: string;
  description: string;
  kind: "series" | "collection";
};

export type RunningGuideCountryPortal = {
  name: string;
  flag: string;
  path: string;
};

export type RunningGuideDirectory = {
  guides: RunningGuideRecord[];
  countries: RunningGuideCountry[];
  series: RunningGuideSeries[];
  portals: RunningGuideCountryPortal[];
  modifiedAt: string;
  totalGuides: number;
};

/** Describes the directory's visible links; it does not claim event rich results. */
export function runningGuideDirectoryJsonLd(data: RunningGuideDirectory) {
  const url = `${SITE_URL}${RUNNING_GUIDES_PATH}`;
  const links = [
    ...data.series,
    ...data.countries.flatMap((country) => country.links),
    ...data.guides,
    ...data.portals,
  ];
  const uniqueLinks = [...new Map(links.map((link) => [link.path, link])).values()];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: "Running race guides by country and series",
        description:
          "Browse running race series, country guides, half marathons, marathons and ultramarathons on AthRecs.",
        url,
        inLanguage: "en-GB",
        dateModified: data.modifiedAt,
        mainEntity: { "@id": `${url}#guides` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#guides`,
        name: "Running guides and country directories",
        numberOfItems: uniqueLinks.length,
        itemListElement: uniqueLinks.map((link, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: link.name,
          url: `${SITE_URL}${link.path}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { name: "Home", path: "/" },
          { name: "Running", path: "/running" },
          { name: "Running guides", path: RUNNING_GUIDES_PATH },
        ].map((link, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: link.name,
          item: `${SITE_URL}${link.path}`,
        })),
      },
    ],
  };
}
