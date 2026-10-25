import { countryFlag } from "../athrecs/country-flags.ts";

type ClubSearchProfile = {
  slug: string;
  name: string;
  summary: string;
  city: string;
  county: string;
  country: string;
  sports: string[];
  website: string | null;
  address: string | null;
  postcode: string | null;
  address_kind?: string;
  contact_url: string | null;
  contacts: Array<{ role: string; email?: string; phone?: string }>;
  socials: Array<{ url: string }>;
  profile?: { founded_year?: number; scope?: string } | null;
};

/** Describe sparse directory entries without inventing club history or facilities. */
export function clubProfileSummary(club: ClubSearchProfile, siteName: string) {
  const summary = club.summary.replace(/\s+/g, " ").trim();
  const name = club.name.replace(/\s+/g, " ").trim();
  const comparable = (value: string) => value.toLowerCase().replace(/[.!]+$/, "");
  if (summary && comparable(summary) !== comparable(name)) return summary;

  const place =
    club.profile?.scope === "global"
      ? "Worldwide"
      : [...new Set([club.city, club.county, club.country].map((value) => value.trim()))]
          .filter(Boolean)
          .join(", ");
  return `${name}${place ? ` (${place})` : ""} club profile on ${siteName}. View available club details and public athlete profiles.`;
}

export function clubSearchMetadata(club: ClubSearchProfile, siteUrl: string, siteName: string) {
  const canonical = `${siteUrl}/clubs/${encodeURIComponent(club.slug)}`;
  const place =
    club.profile?.scope === "global" ? "Worldwide" : club.city || club.county || club.country;
  const title = `${club.name}${place ? ` | ${place}` : ""} | ${siteName}`;
  const summary = clubProfileSummary(club, siteName);
  const description =
    summary.length <= 165 ? summary : `${summary.slice(0, 162).replace(/\s+\S*$/, "")}…`;
  const flag = countryFlag(club.country);
  const countryCode = flag.code.startsWith("GB-") ? "GB" : flag.code || undefined;
  // A governing-body correspondence location must not masquerade as a training venue.
  const verifiedVenue = ["training", "clubhouse"].includes(club.address_kind ?? "");
  const address =
    club.profile?.scope === "global" || !(club.city || club.county || countryCode)
      ? undefined
      : {
          "@type": "PostalAddress",
          streetAddress: verifiedVenue ? club.address || undefined : undefined,
          addressLocality: club.city || undefined,
          addressRegion: club.county || undefined,
          postalCode: verifiedVenue ? club.postcode || undefined : undefined,
          addressCountry: countryCode,
        };
  const officialWebsite =
    club.website &&
    !/englandathletics\.org|welshathletics\.org|membership\.athleticsireland\.ie|app\.triathlonireland\.com|athleticsni\.org|belfastrunning\.com|specialolympics\.ie/.test(
      club.website,
    )
      ? club.website
      : undefined;
  const organization = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "@id": `${canonical}#club`,
    name: club.name,
    url: canonical,
    description: summary,
    sport: club.sports.map((s) => (s === "TrackAndField" ? "Track and field" : s)),
    sameAs: [...new Set([officialWebsite, ...club.socials.map((s) => s.url)].filter(Boolean))],
    address,
    foundingDate: club.profile?.founded_year?.toString(),
    contactPoint: club.contacts
      .filter((c) => c.email || c.phone)
      .map((c) => ({
        "@type": "ContactPoint",
        contactType: c.role,
        email: c.email,
        telephone: c.phone,
        url: club.contact_url || undefined,
      })),
  };
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Clubs", item: `${siteUrl}/clubs` },
      { "@type": "ListItem", position: 2, name: club.name, item: canonical },
    ],
  };
  return {
    canonical,
    title,
    description,
    organization: club.slug === "unattached" ? null : organization,
    breadcrumbs,
  };
}

export function safeClubJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
