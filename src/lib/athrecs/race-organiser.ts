/** Organiser identities and owned domains checked 26 October 2026.
 * Evidence and scope: docs/organiser-urls-2026-10-26.md.
 * This is deliberately an allowlist, not an inference from an event/entry URL.
 */
const ORGANISERS = [
  {
    names: ["Boston Athletic Association", "Boston Athletic Association (B.A.A.)"],
    hosts: ["baa.org"],
    url: "https://www.baa.org/",
  },
  {
    names: ["RunThrough", "RunThrough Events"],
    hosts: ["runthrough.co.uk"],
    url: "https://www.runthrough.co.uk/",
  },
  { names: ["Nice Work"], hosts: ["nice-work.org.uk"], url: "https://www.nice-work.org.uk/" },
  { names: ["Andali Events"], hosts: ["andalievents.com"], url: "https://www.andalievents.com/" },
  {
    names: ["Florida Running Company"],
    hosts: ["floridarunningco.com"],
    url: "https://www.floridarunningco.com/",
  },
  {
    names: ["Cancer Research UK"],
    hosts: ["raceforlife.cancerresearchuk.org", "cancerresearchuk.org"],
    url: "https://raceforlife.cancerresearchuk.org/",
  },
  {
    names: ["Teignbridge Trotters", "Teignbridge Trotters Running Club"],
    hosts: ["teignbridgetrotters.co.uk"],
    url: "https://www.teignbridgetrotters.co.uk/",
  },
  {
    names: ["parkrun", "parkrun / local volunteer team"],
    // Country domains linked by parkrun's own Additional parkrun days support page.
    hosts: [
      "parkrun.org.uk",
      "parkrun.dk",
      "parkrun.com.au",
      "parkrun.us",
      "parkrun.ie",
      "parkrun.co.za",
      "parkrun.pl",
      "parkrun.co.nz",
      "parkrun.sg",
      "parkrun.it",
      "parkrun.ca",
      "parkrun.se",
      "parkrun.no",
      "parkrun.fi",
      "parkrun.com.de",
      "parkrun.my",
      "parkrun.jp",
      "parkrun.co.nl",
      "parkrun.co.at",
      "parkrun.lt",
      "parkrun.fr",
    ],
    url: "https://www.parkrun.com/",
  },
];

const normalName = (name: string) => name.replace(/\s+/g, " ").trim().toLowerCase();

/** Both the existing identity and the stored site's exact hostname must match. */
export function verifiedOrganiserUrl(name?: string | null, website?: string | null) {
  if (!name || !website) return undefined;
  try {
    const url = new URL(website);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return undefined;
    const host = url.hostname.replace(/^www\./, "");
    return ORGANISERS.find(
      (record) =>
        record.names.some((alias) => normalName(alias) === normalName(name)) &&
        record.hosts.includes(host),
    )?.url;
  } catch {
    return undefined;
  }
}

// These individual guide identities were checked against their official race pages.
// Other guides remain unknown; a directory or entry-service hostname proves no host.
const GUIDE_ORGANISERS: Record<string, string> = {
  "boston-marathon-usa": "Boston Athletic Association",
  "boston-half-marathon": "Boston Athletic Association",
  "dartmoor-discovery": "Teignbridge Trotters",
  "goodwood-50k": "RunThrough",
};

export function verifiedGuideOrganiser(slug: string, website: string) {
  const name = GUIDE_ORGANISERS[slug];
  const url = verifiedOrganiserUrl(name, website);
  return name && url ? { "@type": "Organization", name, url } : undefined;
}
