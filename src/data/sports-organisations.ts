import type { SportPage } from "../lib/athrecs/sport-pages";

export type DirectorySport = SportPage["slug"];
export const ORGANISATION_TYPES = {
  national: "National federation",
  home: "Home-nation governing body",
  international: "International federation / association",
  continental: "Continental federation",
  regional: "Regional governing body",
  specialist: "Specialist sports association",
  funding: "Funding and development",
  olympic: "Olympic / Paralympic body",
  organiser: "Event charity",
} as const;

export type SportsOrganisation = {
  slug: string;
  name: string;
  aliases?: string[];
  type: keyof typeof ORGANISATION_TYPES;
  country: string;
  jurisdiction: string;
  territories: string[];
  sports: DirectorySport[];
  summary: string;
  detail?: string;
  website: string;
  websiteKind?: "member-directory";
  sources: string[];
  related?: string[];
  checkedAt: string;
};

const athletics: DirectorySport[] = ["road-running", "trail-running", "track-and-field"];
const cycling: DirectorySport[] = ["road-cycling", "mountain-biking", "track-cycling", "bmx"];
const multisport: DirectorySport[] = ["triathlon", "duathlon"];
const swimming: DirectorySport[] = ["swimming"];
const gb = ["United Kingdom", "England", "Scotland", "Wales"];
const uk = [...gb, "Northern Ireland"];
const ireland = ["Ireland", "Northern Ireland", "United Kingdom"];
const checkedAt = "2026-10-22";
const record = (
  entry: Omit<SportsOrganisation, "checkedAt">,
  reviewedAt: string = checkedAt,
): SportsOrganisation => ({
  ...entry,
  checkedAt: reviewedAt,
});
const federation = (
  slug: string,
  name: string,
  country: string,
  sports: DirectorySport[],
  website: string,
  summary: string,
  sources: string[] = [website],
  related: string[] = [],
  aliases: string[] = [],
  reviewedAt: string = checkedAt,
): SportsOrganisation =>
  record(
    {
      slug,
      name,
      country,
      jurisdiction: country,
      territories: [country],
      type: "national",
      sports,
      website,
      summary,
      sources,
      related,
      aliases,
    },
    reviewedAt,
  );

/** Editorial directory. Territories describe remit, not athlete eligibility or nationality.
 * Empty sports on funding entries means cross-sport support, not a federation for every sport.
 * Official source references establish organisational roles, not a data-reuse permission.
 */
export const SPORTS_ORGANISATIONS: SportsOrganisation[] = [
  record({
    slug: "sport-england",
    name: "Sport England",
    type: "funding",
    country: "England",
    jurisdiction: "England",
    territories: ["England", "United Kingdom"],
    sports: [],
    website: "https://www.sportengland.org/",
    summary: "Funds and develops grassroots sport and physical activity in England.",
    detail:
      "Invests government and National Lottery money in participation. Its funding and governance requirements are distinct from sport-specific competition rules and the management of Team GB.",
    sources: [
      "https://www.sportengland.org/about-us",
      "https://www.sportengland.org/guidance-and-support/national-governing-bodies",
    ],
    related: ["uk-sport"],
  }),
  record({
    slug: "uk-sport",
    name: "UK Sport",
    type: "funding",
    country: "United Kingdom",
    jurisdiction: "United Kingdom",
    territories: uk,
    sports: [],
    website: "https://www.uksport.gov.uk/",
    summary: "Invests in high-performance Olympic and Paralympic sport across the UK.",
    detail:
      "Directs government and National Lottery investment into high-performance programmes. The British Olympic Association and British Paralympic Association have separate responsibilities for their Games teams.",
    sources: ["https://www.uksport.gov.uk/about-us"],
    related: ["sport-england", "british-olympic-association", "british-paralympic-association"],
  }),
  record({
    slug: "sportscotland",
    name: "sportscotland",
    type: "funding",
    country: "Scotland",
    jurisdiction: "Scotland",
    territories: ["Scotland", "United Kingdom"],
    sports: [],
    website: "https://sportscotland.org.uk/",
    summary: "Scotland’s national agency for sport, supporting participation and performance.",
    sources: ["https://sportscotland.org.uk/"],
  }),
  record({
    slug: "sport-wales",
    name: "Sport Wales",
    type: "funding",
    country: "Wales",
    jurisdiction: "Wales",
    territories: ["Wales", "United Kingdom"],
    sports: [],
    website: "https://sport.wales/",
    summary:
      "Supports Welsh sport through funding, development and research, from grassroots to elite athletes.",
    sources: ["https://sport.wales/"],
  }),
  record({
    slug: "sport-northern-ireland",
    name: "Sport Northern Ireland",
    aliases: ["Sport NI"],
    type: "funding",
    country: "Northern Ireland",
    jurisdiction: "Northern Ireland",
    territories: ["Northern Ireland", "United Kingdom"],
    sports: [],
    website: "https://www.sportni.net/",
    summary: "Supports and invests in sport in Northern Ireland.",
    sources: ["https://www.sportni.net/"],
  }),
  record({
    slug: "sport-ireland",
    name: "Sport Ireland",
    type: "funding",
    country: "Ireland",
    jurisdiction: "Republic of Ireland",
    territories: ["Ireland"],
    sports: [],
    website: "https://www.sportireland.ie/",
    summary:
      "Ireland’s national sports development agency, supporting participation, governing bodies and high performance.",
    sources: ["https://www.sportireland.ie/about-us"],
  }),
  record({
    slug: "british-olympic-association",
    name: "British Olympic Association",
    aliases: ["BOA", "Team GB"],
    type: "olympic",
    country: "United Kingdom",
    jurisdiction: "Great Britain and Northern Ireland Olympic team",
    territories: uk,
    sports: ["road-running", "track-and-field", "triathlon", ...cycling, "swimming"],
    website: "https://www.teamgb.com/",
    summary: "Prepares and manages Team GB for the Olympic Games.",
    detail:
      "The BOA is independently and privately funded. Olympic team management is a separate role from UK Sport’s investment in elite programmes and national federations’ administration of their sports.",
    sources: [
      "https://www.teamgb.com/about-us/9HsI58MhzO0UWwouZWqdI",
      "https://www.teamgb.com/governance/4SgCE1W49O4sRoC0GPTMqh",
    ],
    related: ["uk-sport"],
  }),
  record({
    slug: "british-paralympic-association",
    name: "British Paralympic Association",
    aliases: ["BPA", "ParalympicsGB"],
    type: "olympic",
    country: "United Kingdom",
    jurisdiction: "Great Britain and Northern Ireland Paralympic team",
    territories: uk,
    sports: [
      "road-running",
      "track-and-field",
      "triathlon",
      "road-cycling",
      "track-cycling",
      "swimming",
    ],
    website: "https://paralympics.org.uk/",
    summary: "Selects, prepares and manages ParalympicsGB at the Paralympic Games.",
    sources: ["https://paralympics.org.uk/footer-pages/about-the-bpa"],
    related: ["uk-sport"],
  }),

  record({
    slug: "world-athletics",
    name: "World Athletics",
    aliases: ["IAAF"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: athletics,
    website: "https://worldathletics.org/",
    summary:
      "International federation for athletics, including track and field and running disciplines.",
    sources: ["https://www.uksport.gov.uk/sports/olympic/athletics", "https://worldathletics.org/"],
  }),
  record({
    slug: "world-triathlon",
    name: "World Triathlon",
    aliases: ["ITU"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: multisport,
    website: "https://triathlon.org/",
    summary:
      "International governing body for triathlon and related multisport disciplines, including duathlon.",
    sources: ["https://triathlon.org/governance"],
  }),
  record({
    slug: "uci",
    name: "Union Cycliste Internationale",
    aliases: ["UCI"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: cycling,
    website: "https://www.uci.org/",
    summary:
      "International cycling federation, covering road, track, mountain bike and BMX among its disciplines.",
    sources: ["https://www.uci.org/the-uci/2QDMyzhoBXyWbVrsxge0EH"],
  }),
  record({
    slug: "world-aquatics",
    name: "World Aquatics",
    aliases: ["FINA"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: swimming,
    website: "https://www.worldaquatics.com/",
    summary: "International federation for aquatic sports, including pool and open-water swimming.",
    sources: [
      "https://www.worldaquatics.com/",
      "https://swimireland.ie/about/",
      "https://www.worldaquatics.com/competitions",
      "https://www.worldaquatics.com/results",
      "https://www.worldaquatics.com/athletes",
    ],
  }),

  record({
    slug: "uk-athletics",
    name: "UK Athletics",
    aliases: ["UKA", "British Athletics"],
    type: "national",
    country: "United Kingdom",
    jurisdiction: "United Kingdom",
    territories: uk,
    sports: athletics,
    website: "https://www.uka.org.uk/",
    summary:
      "UK-wide athletics governing body, working with the four home-country athletics federations.",
    sources: [
      "https://www.uka.org.uk/",
      "https://www.englandathletics.org/news/uk-athletics-and-home-countries-commit-to-uk-sport-review-recommended-change-plan/",
    ],
    related: [
      "world-athletics",
      "england-athletics",
      "scottish-athletics",
      "welsh-athletics",
      "athletics-northern-ireland",
    ],
  }),
  ...[
    ["england-athletics", "England Athletics", "England", "https://www.englandathletics.org/"],
    [
      "scottish-athletics",
      "scottishathletics",
      "Scotland",
      "https://www.scottishathletics.org.uk/",
    ],
    ["welsh-athletics", "Welsh Athletics", "Wales", "https://www.welshathletics.org/"],
    [
      "athletics-northern-ireland",
      "Athletics Northern Ireland",
      "Northern Ireland",
      "https://athleticsni.org/",
    ],
  ].map(([slug, name, country, website]) =>
    record({
      slug,
      name,
      country,
      jurisdiction: country,
      territories: [country, "United Kingdom"],
      type: "home",
      sports: athletics,
      website,
      summary: `Supports athletics and running, clubs and competition in ${country}.`,
      sources: [
        website,
        "https://www.englandathletics.org/news/uk-athletics-and-home-countries-commit-to-uk-sport-review-recommended-change-plan/",
      ],
      related: ["uk-athletics"],
    }),
  ),

  record({
  "slug": "british-triathlon",
  "name": "British Triathlon",
  "aliases": [
    "British Triathlon Federation",
    "BTF"
  ],
  "type": "national",
  "country": "United Kingdom",
  "jurisdiction": "Great Britain",
  "territories": [
    "United Kingdom",
    "England",
    "Scotland",
    "Wales"
  ],
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.britishtriathlon.org/",
  "summary": "Governs triathlon, duathlon and related multisport in Great Britain.",
  "detail": "Its member associations are Triathlon England, Triathlon Scotland and Welsh Triathlon. Triathlon Ireland’s remit covers the Republic of Ireland and Northern Ireland. Team eligibility is governed by the relevant selection rules. World Triathlon lists this body as British Triathlon Federation and reports affiliated status (checked 23 October 2026).",
  "sources": [
    "https://www.britishtriathlon.org/about-us",
    "https://www.triathlonireland.com/get-involved/triathlon-ireland-faqs/",
    "https://triathlon.org/members/british-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "triathlon-england",
    "triathlon-scotland",
    "welsh-triathlon",
    "triathlon-ireland"
  ]
}, "2026-10-23"),
  ...[
    [
      "triathlon-england",
      "Triathlon England",
      "England",
      "https://www.britishtriathlon.org/england",
    ],
    ["triathlon-scotland", "Triathlon Scotland", "Scotland", "https://www.triathlonscotland.org/"],
    ["welsh-triathlon", "Triathlon Cymru", "Wales", "https://welshtriathlon.org/"],
  ].map(([slug, name, country, website]) =>
    record({
      slug,
      name,
      country,
      jurisdiction: country,
      territories: [country, "United Kingdom"],
      type: "home",
      sports: multisport,
      website,
      aliases: slug === "welsh-triathlon" ? ["Welsh Triathlon"] : [],
      summary: `Home-nation association for triathlon and related multisport in ${country}, within British Triathlon.`,
      sources: ["https://www.britishtriathlon.org/about-us", website],
      related: ["british-triathlon"],
    }),
  ),

  record({
    slug: "british-cycling",
    name: "British Cycling",
    type: "national",
    country: "United Kingdom",
    jurisdiction: "Great Britain",
    territories: gb,
    sports: cycling,
    website: "https://www.britishcycling.org.uk/",
    summary: "Governs cycling in Britain, working with Scottish Cycling and Beicio Cymru.",
    detail:
      "Covers road, track, mountain bike and BMX. Cycling Ireland is the national governing body across the island of Ireland, including Northern Ireland.",
    sources: ["https://www.britishcycling.org.uk/about", "https://www.cyclingireland.ie/about-us/"],
    related: ["uci", "scottish-cycling", "welsh-cycling", "cycling-ireland"],
  }),
  ...[
    ["scottish-cycling", "Scottish Cycling", "Scotland", "https://scottishcycling.org.uk/"],
    ["welsh-cycling", "Beicio Cymru", "Wales", "https://www.beiciocymru.org/"],
  ].map(([slug, name, country, website]) =>
    record({
      slug,
      name,
      country,
      jurisdiction: country,
      territories: [country, "United Kingdom"],
      type: "home",
      sports: cycling,
      website,
      aliases: slug === "welsh-cycling" ? ["Welsh Cycling", "Welsh Cycling Union"] : [],
      summary: `Governs and develops cycle sport in ${country}, working with British Cycling.`,
      sources: [website, "https://www.britishcycling.org.uk/about"],
      related: ["british-cycling"],
    }),
  ),

  record({
    slug: "aquatics-gb",
    name: "Aquatics GB",
    aliases: ["British Swimming"],
    type: "national",
    country: "United Kingdom",
    jurisdiction: "Great Britain",
    territories: gb,
    sports: swimming,
    website: "https://www.aquaticsgb.com/",
    summary:
      "Leads international high-performance representation for British swimming and other aquatic sports.",
    detail:
      "Its member bodies are Swim England, Scottish Swimming and Swim Wales. Swim Ireland covers the island of Ireland. Aquatics GB was previously known as British Swimming.",
    sources: [
      "https://www.aquaticsgb.com/about-us/",
      "https://www.britishswimming.org/news/general-swimming-news/aquatics-gb-more-just-new-name-british-swimming/",
    ],
    related: ["world-aquatics", "swim-england", "scottish-swimming", "swim-wales", "swim-ireland"],
  }),
  ...[
    ["swim-england", "Swim England", "England", "https://www.swimming.org/swimengland/"],
    ["scottish-swimming", "Scottish Swimming", "Scotland", "https://www.scottishswimming.com/"],
    ["swim-wales", "Swim Wales", "Wales", "https://www.swimwales.org/"],
  ].map(([slug, name, country, website]) =>
    record({
      slug,
      name,
      country,
      jurisdiction: country,
      territories: [country, "United Kingdom"],
      type: "home",
      sports: swimming,
      website,
      summary: `Home-nation governing body for swimming and aquatic sport in ${country}.`,
      sources: ["https://www.aquaticsgb.com/about-us/", website],
      related: ["aquatics-gb"],
    }),
  ),

  record({
    slug: "athletics-ireland",
    name: "Athletics Ireland",
    aliases: ["Athletic Association of Ireland", "AAI"],
    type: "national",
    country: "Ireland",
    jurisdiction: "Island of Ireland, including Northern Ireland",
    territories: ireland,
    sports: athletics,
    website: "https://www.athleticsireland.ie/",
    summary:
      "Ireland’s athletics federation, supporting clubs and athletes across all 32 counties.",
    detail:
      "Athletics Ireland’s membership and Irish national representation extend across the island. Athletics Northern Ireland also has its own governing and development role in Northern Ireland within the UK Athletics structure. These overlapping remits do not determine an athlete’s team eligibility.",
    sources: [
      "https://www.athleticsireland.ie/about/history/",
      "https://www.athleticsireland.ie/wp-content/uploads/2026/06/Athletic-Association-of-Ireland-Bye-Laws-Amended-April-25-2026.pdf",
      "https://athleticsni.org/",
    ],
    related: ["world-athletics", "athletics-northern-ireland"],
  }),
  record({
  "slug": "triathlon-ireland",
  "name": "Triathlon Ireland",
  "type": "national",
  "country": "Ireland",
  "jurisdiction": "Island of Ireland, including Northern Ireland",
  "territories": [
    "Ireland",
    "Northern Ireland",
    "United Kingdom"
  ],
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlonireland.com/",
  "summary": "Governs triathlon, duathlon and related multisport in the Republic of Ireland and Northern Ireland.",
  "sources": [
    "https://www.triathlonireland.com/get-involved/triathlon-ireland-faqs/",
    "https://triathlon.org/members/triathlon-ireland",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "detail": "World Triathlon lists this body as Triathlon Ireland and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  record({
    slug: "cycling-ireland",
    name: "Cycling Ireland",
    type: "national",
    country: "Ireland",
    jurisdiction: "Island of Ireland, including Northern Ireland",
    territories: ireland,
    sports: cycling,
    website: "https://www.cyclingireland.ie/",
    summary:
      "National cycling governing body across the island of Ireland, including Northern Ireland.",
    sources: [
      "https://www.cyclingireland.ie/about-us/",
      "https://www.cyclingireland.ie/governance/",
    ],
    related: ["uci"],
  }),
  record({
    slug: "swim-ireland",
    name: "Swim Ireland",
    type: "national",
    country: "Ireland",
    jurisdiction: "Island of Ireland, including Northern Ireland",
    territories: ireland,
    sports: swimming,
    website: "https://swimireland.ie/",
    summary: "Governs swimming and other aquatic sports across all 32 counties of Ireland.",
    sources: ["https://swimireland.ie/about/"],
    related: ["world-aquatics"],
  }),

  federation(
    "usa-track-field",
    "USA Track & Field",
    "United States",
    athletics,
    "https://www.usatf.org/",
    "US governing body for track and field, long-distance running and race walking.",
    ["https://www.usatf.org/about"],
    ["world-athletics"],
  ),
  federation(
    "usa-cycling",
    "USA Cycling",
    "United States",
    cycling,
    "https://usacycling.org/",
    "National cycling governing body for the United States.",
    ["https://usacycling.org/about-us"],
    ["uci"],
  ),
  federation(
    "usa-swimming",
    "USA Swimming",
    "United States",
    swimming,
    "https://www.usaswimming.org/",
    "National governing body for competitive swimming in the United States.",
    ["https://www.usaswimming.org/about-usas/governance/rules-policies"],
    ["world-aquatics"],
  ),
  record({
  "slug": "usa-triathlon",
  "name": "USA Triathlon",
  "country": "United States",
  "jurisdiction": "United States",
  "territories": [
    "United States"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.usatriathlon.org/",
  "summary": "US governing body for triathlon and multisport, including duathlon.",
  "sources": [
    "https://www.usatriathlon.org/multisport/rules",
    "https://triathlon.org/members/usa-triathlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [],
  "detail": "World Triathlon lists this body as USA Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "athletics-canada",
    "Athletics Canada",
    "Canada",
    athletics,
    "https://athletics.ca/",
    "Canada’s national athletics organisation for track and field and running disciplines.",
    ["https://athletics.ca/"],
    ["world-athletics"],
  ),
  federation(
    "cycling-canada",
    "Cycling Canada",
    "Canada",
    cycling,
    "https://cyclingcanada.ca/",
    "Canada’s national cycling governing body, from amateur to Olympic and Paralympic level.",
    ["https://cyclingcanada.ca/"],
    ["uci"],
  ),
  federation(
    "swimming-canada",
    "Swimming Canada",
    "Canada",
    swimming,
    "https://www.swimming.ca/",
    "Canada’s national organisation for swimming, with competition and performance programmes.",
    ["https://www.swimming.ca/about-us/"],
    ["world-aquatics"],
  ),
  record({
  "slug": "triathlon-canada",
  "name": "Triathlon Canada",
  "country": "Canada",
  "jurisdiction": "Canada",
  "territories": [
    "Canada"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathloncanada.com/",
  "summary": "Canada’s triathlon governing body, also supporting duathlon and related multisport.",
  "sources": [
    "https://www.triathloncanada.com/",
    "https://www.triathloncanada.com/athletes-teams/multisport/",
    "https://triathlon.org/members/triathlon-canada",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [],
  "detail": "World Triathlon lists this body as Triathlon Canada and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "australian-athletics",
    "Australian Athletics",
    "Australia",
    athletics,
    "https://www.athletics.com.au/",
    "Australia’s national athletics organisation for track and field and running.",
    ["https://www.athletics.com.au/"],
    ["world-athletics"],
  ),
  federation(
    "auscycling",
    "AusCycling",
    "Australia",
    cycling,
    "https://auscycling.org.au/",
    "Australia’s recognised national organisation for cycling, mountain bike and BMX.",
    ["https://www.ausport.gov.au/australian_sports_directory", "https://auscycling.org.au/"],
    ["uci"],
  ),
  federation(
    "swimming-australia",
    "Swimming Australia",
    "Australia",
    swimming,
    "https://www.swimming.org.au/",
    "Australia’s national swimming organisation.",
    ["https://www.ausport.gov.au/australian_sports_directory", "https://www.swimming.org.au/"],
    ["world-aquatics"],
  ),
  record({
  "slug": "austriathlon",
  "name": "AusTriathlon",
  "country": "Australia",
  "jurisdiction": "Australia",
  "territories": [
    "Australia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.org.au/",
  "summary": "Australia’s national triathlon organisation, covering triathlon and multisport.",
  "sources": [
    "https://www.ausport.gov.au/australian_sports_directory",
    "https://www.triathlon.org.au/",
    "https://triathlon.org/members/triathlon-australia",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [],
  "detail": "World Triathlon lists this body as AusTriathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "athletics-new-zealand",
    "Athletics New Zealand",
    "New Zealand",
    athletics,
    "https://athletics.org.nz/",
    "New Zealand’s national athletics organisation, supporting running and track and field.",
    ["https://athletics.org.nz/"],
    ["world-athletics"],
  ),
  federation(
    "cycling-new-zealand",
    "Cycling New Zealand",
    "New Zealand",
    cycling,
    "https://www.cyclingnewzealand.nz/",
    "New Zealand’s national cycling organisation.",
    ["https://www.cyclingnewzealand.nz/"],
    ["uci"],
  ),
  federation(
    "swimming-new-zealand",
    "Swimming New Zealand",
    "New Zealand",
    swimming,
    "https://www.swimmingnz.org/",
    "New Zealand’s national swimming organisation.",
    ["https://www.swimmingnz.org/"],
    ["world-aquatics"],
  ),
  record({
  "slug": "triathlon-new-zealand",
  "name": "Triathlon New Zealand",
  "country": "New Zealand",
  "jurisdiction": "New Zealand",
  "territories": [
    "New Zealand"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.kiwi/",
  "summary": "New Zealand’s national triathlon and multisport organisation.",
  "sources": [
    "https://www.triathlon.kiwi/",
    "https://triathlon.org/members/triathlon-new-zealand",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [],
  "detail": "World Triathlon lists this body as Triathlon New Zealand and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "athletics-south-africa",
    "Athletics South Africa",
    "South Africa",
    ["road-running", "track-and-field"],
    "https://athleticssa.org.za/",
    "South Africa’s governing body for track and field, road running, cross country and race walking.",
    ["https://athleticssa.org.za/Newsart/Details?id=379"],
    ["world-athletics"],
  ),
  federation(
    "cycling-south-africa",
    "Cycling South Africa",
    "South Africa",
    cycling,
    "https://www.cyclingsa.com/",
    "South Africa’s national cycling governing body.",
    ["https://www.cyclingsa.com/author/cyclingsa/page/6/"],
    ["uci"],
  ),
  federation(
    "swimming-south-africa",
    "Swimming South Africa",
    "South Africa",
    swimming,
    "https://swimsa.org/",
    "South Africa’s national swimming and aquatic sports organisation.",
    ["https://swimsa.org/"],
    ["world-aquatics"],
  ),
  federation(
    "triathlon-south-africa",
    "Triathlon South Africa",
    "South Africa",
    multisport,
    "https://triathlonsa.co.za/",
    "South Africa’s governing body for triathlon and related multisport.",
    ["https://triathlonsa.co.za/", "https://triathlon.org/members/triathlon-south-africa-tsa", "https://africa.triathlon.org/national-federations"],
    ["world-triathlon"],
    [],
    "2026-10-23",
  ),
  record({
    slug: "parkrun",
    name: "parkrun",
    aliases: ["parkrun Global", "junior parkrun"],
    type: "organiser",
    country: "International",
    jurisdiction: "International event network",
    territories: [
      "International",
      ...uk,
      "Ireland",
      "United States",
      "Canada",
      "Australia",
      "New Zealand",
      "South Africa",
      "Austria",
      "Denmark",
      "Finland",
      "Germany",
      "Italy",
      "Japan",
      "Lithuania",
      "Malaysia",
      "Netherlands",
      "Norway",
      "Poland",
      "Singapore",
      "Sweden",
    ],
    sports: ["parkrun"],
    website: "https://www.parkrun.com/",
    summary: "A global charity organising free weekly 5K and junior 2K community events.",
    detail:
      "Listed here because parkrun has its own AthRecs section. It is an event organisation, rather than a national federation governing all running.",
    sources: [
      "https://www.parkrun.com/",
      "https://donate.parkrun.com/",
      "https://volunteer.parkrun.com/hc/en-us/articles/16858208225170-2-19-Additional-parkrun-Days",
      "https://blog.parkrun.com/fr/2024/05/16/parkrun-france-update/",
    ],
  }),

  // Further national federations: reviewed against official organisation and member pages.
  federation(
    "french-athletics",
    "Fédération Française d’Athlétisme",
    "France",
    athletics,
    "https://www.athle.fr/",
    "National athletics federation covering track and field, road running, and mountain or trail running in France.",
    ["https://www.athle.fr/"],
    ["world-athletics", "european-athletics"],
    ["FFA", "French Athletics Federation"],
  ),
  federation(
    "french-cycling",
    "Fédération Française de Cyclisme",
    "France",
    cycling,
    "https://www.ffc.fr/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in France.",
    ["https://uec.ch/en/federation/french-cycling-federation/1", "https://www.ffc.fr/"],
    ["uci", "uec"],
    ["FFC", "French Cycling Federation"],
  ),
  federation(
    "french-swimming",
    "Fédération Française de Natation",
    "France",
    swimming,
    "https://www.ffnatation.fr/",
    "National federation for swimming and aquatic sports in France.",
    ["https://www.ffnatation.fr/organisation", "https://www.ffnatation.fr/"],
    ["world-aquatics", "european-aquatics"],
    ["FFN", "French Swimming Federation"],
  ),
  record({
  "slug": "french-triathlon",
  "name": "Fédération Française de Triathlon",
  "country": "France",
  "jurisdiction": "France",
  "territories": [
    "France"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.fftri.com/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in France.",
  "sources": [
    "https://triathlon.org/members/federation-francaise-de-triathlon",
    "https://www.fftri.com/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "FFTri",
    "French Triathlon Federation",
    "Federation Francaise de Triathlon"
  ],
  "detail": "World Triathlon lists this body as Federation Francaise de Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "german-athletics",
    "Deutscher Leichtathletik-Verband",
    "Germany",
    athletics,
    "https://www.leichtathletik.de/",
    "National athletics federation covering track and field, road running, and mountain or trail running in Germany.",
    [
      "https://www.leichtathletik.de/nationalmannschaften/nicht-olympisch/berg-trail",
      "https://www.leichtathletik.de/",
    ],
    ["world-athletics", "european-athletics"],
    ["DLV", "German Athletics Association"],
  ),
  federation(
    "german-cycling",
    "German Cycling",
    "Germany",
    cycling,
    "https://germancycling.com/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Germany.",
    ["https://uec.ch/en/federation/german-cycling-federation/19", "https://germancycling.com/"],
    ["uci", "uec"],
    ["Bund Deutscher Radfahrer", "BDR", "German Cycling Federation"],
  ),
  federation(
    "german-swimming",
    "Deutscher Schwimm-Verband",
    "Germany",
    swimming,
    "https://www.dsv.de/",
    "National federation for swimming and aquatic sports in Germany.",
    ["https://www.dsv.de/de/ueberuns/", "https://www.dsv.de/"],
    ["world-aquatics", "european-aquatics"],
    ["DSV", "German Swimming Federation"],
  ),
  record({
  "slug": "german-triathlon",
  "name": "Deutsche Triathlon Union",
  "country": "Germany",
  "jurisdiction": "Germany",
  "territories": [
    "Germany"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlondeutschland.de/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Germany.",
  "sources": [
    "https://triathlon.org/members/deutsche-triathlon-union",
    "https://www.triathlondeutschland.de/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "DTU",
    "German Triathlon Union"
  ],
  "detail": "World Triathlon lists this body as Deutsche Triathlon Union and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "spanish-athletics",
    "Real Federación Española de Atletismo",
    "Spain",
    athletics,
    "https://atletismorfea.es/",
    "National athletics federation covering track and field, road running, and mountain or trail running in Spain.",
    ["https://atletismorfea.es/calendario", "https://atletismorfea.es/"],
    ["world-athletics", "european-athletics"],
    ["RFEA", "Royal Spanish Athletics Federation"],
  ),
  federation(
    "spanish-cycling",
    "Real Federación Española de Ciclismo",
    "Spain",
    cycling,
    "https://www.rfec.com/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Spain.",
    ["https://uec.ch/en/federation/royal-spanish-cycling-federation/14", "https://www.rfec.com/"],
    ["uci", "uec"],
    ["RFEC", "Royal Spanish Cycling Federation"],
  ),
  federation(
    "spanish-swimming",
    "Real Federación Española de Natación",
    "Spain",
    swimming,
    "https://rfen.es/",
    "National federation for swimming and aquatic sports in Spain.",
    ["https://rfen.es/"],
    ["world-aquatics", "european-aquatics"],
    ["RFEN", "Royal Spanish Swimming Federation", "RFEN Aquatics"],
  ),
  record({
  "slug": "spanish-triathlon",
  "name": "Federación Española de Triatlón",
  "country": "Spain",
  "jurisdiction": "Spain",
  "territories": [
    "Spain"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triatlon.org/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Spain.",
  "sources": [
    "https://triathlon.org/members/federacion-espanola-de-triatlon",
    "https://www.triatlon.org/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "FETRI",
    "Spanish Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Federación Española de Triatlón and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "italian-athletics",
    "Federazione Italiana di Atletica Leggera",
    "Italy",
    athletics,
    "https://www.fidal.it/",
    "National athletics federation covering track and field, road running, and mountain or trail running in Italy.",
    [
      "https://www.fidal.it/content/Montagna-e-Trail-Campionati-Regionali-Assoluti-2026/181429",
      "https://www.fidal.it/",
    ],
    ["world-athletics", "european-athletics"],
    ["FIDAL", "Italian Athletics Federation"],
  ),
  federation(
    "italian-cycling",
    "Federazione Ciclistica Italiana",
    "Italy",
    cycling,
    "https://www.federciclismo.it/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Italy.",
    ["https://uec.ch/en/federation/italian-cycling-federation/26", "https://www.federciclismo.it/"],
    ["uci", "uec"],
    ["FCI", "Italian Cycling Federation"],
  ),
  federation(
    "italian-swimming",
    "Federazione Italiana Nuoto",
    "Italy",
    swimming,
    "https://www.federnuoto.it/",
    "National federation for swimming and aquatic sports in Italy.",
    ["https://www.federnuoto.it/home/federazione.html", "https://www.federnuoto.it/"],
    ["world-aquatics", "european-aquatics"],
    ["FIN", "Italian Swimming Federation"],
  ),
  record({
  "slug": "italian-triathlon",
  "name": "Federazione Italiana Triathlon",
  "country": "Italy",
  "jurisdiction": "Italy",
  "territories": [
    "Italy"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.fitri.it/it/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Italy.",
  "sources": [
    "https://triathlon.org/members/italian-triathlon-federation",
    "https://www.fitri.it/it/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "FITri",
    "Italian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Federazione Italiana Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "portuguese-athletics",
    "Federação Portuguesa de Atletismo",
    "Portugal",
    ["road-running", "track-and-field"],
    "https://fpatletismo.pt/",
    "National athletics federation supporting track and field and road running in Portugal.",
    ["https://fpatletismo.pt/"],
    ["world-athletics", "european-athletics"],
    ["FPA", "Portuguese Athletics Federation"],
  ),
  federation(
    "portuguese-cycling",
    "Federação Portuguesa de Ciclismo",
    "Portugal",
    cycling,
    "https://www.fpciclismo.pt/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Portugal.",
    ["https://uec.ch/en/federation/portuguese-cycling-federation/40", "https://www.fpciclismo.pt/"],
    ["uci", "uec"],
    ["FPC", "Portuguese Cycling Federation"],
  ),
  federation(
    "portuguese-swimming",
    "Federação Portuguesa de Natação",
    "Portugal",
    swimming,
    "https://www.fpnatacao.pt/",
    "National federation for swimming and aquatic sports in Portugal.",
    ["https://www.fpnatacao.pt/"],
    ["world-aquatics", "european-aquatics"],
    ["FPN", "Portuguese Swimming Federation"],
  ),
  record({
  "slug": "portuguese-triathlon",
  "name": "Federação de Triatlo de Portugal",
  "country": "Portugal",
  "jurisdiction": "Portugal",
  "territories": [
    "Portugal"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.federacao-triatlo.pt/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Portugal.",
  "sources": [
    "https://triathlon.org/members/federacao-de-triatlo-de-portugal",
    "https://www.federacao-triatlo.pt/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "FTP",
    "Portuguese Triathlon Federation",
    "Federacao de Triatlo de Portugal"
  ],
  "detail": "World Triathlon lists this body as Federacao de Triatlo de Portugal and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "dutch-athletics",
    "Atletiekunie",
    "Netherlands",
    ["road-running", "track-and-field"],
    "https://www.atletiekunie.nl/",
    "National athletics federation supporting track and field and road running in Netherlands.",
    ["https://www.atletiekunie.nl/"],
    ["world-athletics", "european-athletics"],
    ["KNAU", "Royal Dutch Athletics Federation", "Koninklijke Nederlandse Atletiek Unie"],
  ),
  federation(
    "dutch-cycling",
    "Koninklijke Nederlandsche Wielren Unie",
    "Netherlands",
    cycling,
    "https://www.knwu.nl/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Netherlands.",
    ["https://uec.ch/en/federation/royal-dutch-cycling-union/37", "https://www.knwu.nl/"],
    ["uci", "uec"],
    ["KNWU", "Royal Dutch Cycling Union"],
  ),
  federation(
    "dutch-swimming",
    "Koninklijke Nederlandse Zwembond",
    "Netherlands",
    swimming,
    "https://www.knzb.nl/",
    "National federation for swimming and aquatic sports in Netherlands.",
    ["https://www.knzb.nl/knzb", "https://www.knzb.nl/"],
    ["world-aquatics", "european-aquatics"],
    ["KNZB", "Royal Dutch Swimming Federation"],
  ),
  record({
  "slug": "dutch-triathlon",
  "name": "Nederlandse Triathlon Bond",
  "country": "Netherlands",
  "jurisdiction": "Netherlands",
  "territories": [
    "Netherlands"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlonbond.nl/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Netherlands.",
  "sources": [
    "https://triathlon.org/members/nederlandse-triathlon-bond",
    "https://www.triathlonbond.nl/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "NTB",
    "Dutch Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Nederlandse Triathlon Bond and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "belgian-athletics",
    "Belgian Athletics",
    "Belgium",
    ["road-running", "track-and-field"],
    "https://www.belgian-athletics.be/",
    "National athletics federation supporting track and field and road running in Belgium.",
    ["https://www.belgian-athletics.be/"],
    ["world-athletics", "european-athletics"],
    ["Royal Belgian Athletics Federation", "KBAB", "LRBA"],
  ),
  federation(
    "belgian-cycling",
    "Belgian Cycling",
    "Belgium",
    cycling,
    "https://www.belgiancycling.be/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Belgium.",
    [
      "https://uec.ch/en/federation/royal-belgian-cycling-league/7",
      "https://www.belgiancycling.be/",
    ],
    ["uci", "uec"],
    ["Royal Belgian Cycling League"],
  ),
  federation(
    "belgian-swimming",
    "Royal Belgian Swimming Federation",
    "Belgium",
    swimming,
    "https://www.belswim.be/en",
    "National federation for swimming and aquatic sports in Belgium.",
    ["https://www.belswim.be/en"],
    ["world-aquatics", "european-aquatics"],
    ["KBZB", "FRBN", "Koninklijke Belgische Zwembond", "Fédération Royale Belge de Natation"],
  ),
  record({
  "slug": "belgian-triathlon",
  "name": "Belgian Triathlon",
  "country": "Belgium",
  "jurisdiction": "Belgium",
  "territories": [
    "Belgium"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.be/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Belgium.",
  "sources": [
    "https://triathlon.org/members/belgium-triathlon-duathlon-federation",
    "https://www.triathlon.be/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Be3",
    "Belgian Triathlon and Duathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Belgian Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "swiss-athletics",
    "Swiss Athletics",
    "Switzerland",
    ["road-running", "track-and-field"],
    "https://www.swiss-athletics.ch/",
    "National athletics federation supporting track and field and road running in Switzerland.",
    ["https://www.swiss-athletics.ch/"],
    ["world-athletics", "european-athletics"],
    ["Schweizerischer Leichtathletik-Verband"],
  ),
  federation(
    "swiss-cycling",
    "Swiss Cycling",
    "Switzerland",
    cycling,
    "https://www.swiss-cycling.ch/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Switzerland.",
    ["https://uec.ch/en/federation/swiss-cycling/48", "https://www.swiss-cycling.ch/"],
    ["uci", "uec"],
    ["Swiss Cycling Federation"],
  ),
  federation(
    "swiss-aquatics",
    "Swiss Aquatics",
    "Switzerland",
    swimming,
    "https://www.swiss-aquatics.ch/",
    "National federation for swimming and aquatic sports in Switzerland.",
    [
      "https://www.swiss-aquatics.ch/Verband/Organisation/about-us/",
      "https://www.swiss-aquatics.ch/",
    ],
    ["world-aquatics", "european-aquatics"],
    ["Swiss Swimming Federation", "Schweizerischer Schwimmverband"],
  ),
  record({
  "slug": "swiss-triathlon",
  "name": "Swiss Triathlon",
  "country": "Switzerland",
  "jurisdiction": "Switzerland",
  "territories": [
    "Switzerland"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://swisstriathlon.ch/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Switzerland.",
  "sources": [
    "https://triathlon.org/members/swiss-triathlon-federation",
    "https://swisstriathlon.ch/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Swiss Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Swiss Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "swedish-athletics",
    "Svenska Friidrottsförbundet",
    "Sweden",
    ["road-running", "track-and-field"],
    "https://www.friidrott.se/",
    "National athletics federation supporting track and field and road running in Sweden.",
    ["https://www.friidrott.se/"],
    ["world-athletics", "european-athletics"],
    ["Svensk Friidrott", "Swedish Athletics Association"],
  ),
  federation(
    "swedish-cycling",
    "Svenska Cykelförbundet",
    "Sweden",
    cycling,
    "https://scf.se/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Sweden.",
    ["https://uec.ch/en/federation/swedish-cycling-federation/47", "https://scf.se/"],
    ["uci", "uec"],
    ["SCF", "Swedish Cycling Federation"],
  ),
  federation(
    "swedish-swimming",
    "Svenska Simförbundet",
    "Sweden",
    swimming,
    "https://svensksimidrott.se/",
    "National federation for swimming and aquatic sports in Sweden.",
    ["https://svensksimidrott.se/"],
    ["world-aquatics", "european-aquatics"],
    ["Svensk Simidrott", "Sweden Aquatics", "Swedish Swimming Federation", "SSF"],
  ),
  record({
  "slug": "swedish-triathlon",
  "name": "Svenska Triathlonförbundet",
  "country": "Sweden",
  "jurisdiction": "Sweden",
  "territories": [
    "Sweden"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.svensktriathlon.org/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Sweden.",
  "sources": [
    "https://triathlon.org/members/swedish-triathlon-federation",
    "https://www.svensktriathlon.org/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Swedish Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Swedish Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "danish-athletics",
    "Dansk Atletik",
    "Denmark",
    athletics,
    "https://dansk-atletik.dk/",
    "National athletics federation covering track and field, road running, and mountain or trail running in Denmark.",
    ["https://dansk-atletik.dk/"],
    ["world-athletics", "european-athletics"],
    ["Danish Athletics Federation", "Dansk Atletik Forbund", "DAF"],
  ),
  federation(
    "danish-cycling",
    "Danmarks Cykle Union",
    "Denmark",
    cycling,
    "https://cyklingdanmark.dk/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Denmark.",
    ["https://uec.ch/en/federation/danish-cycling-federation/13", "https://cyklingdanmark.dk/"],
    ["uci", "uec"],
    ["DCU", "Danish Cycling Federation"],
  ),
  federation(
    "danish-swimming",
    "SvømDanmark",
    "Denmark",
    swimming,
    "https://www.svoem.org/",
    "National federation for swimming and aquatic sports in Denmark.",
    ["https://www.svoem.org/Aktuelt/Nyheder/Nyhed/?id=8189", "https://www.svoem.org/"],
    ["world-aquatics", "european-aquatics"],
    ["Danish Swimming Federation", "Dansk Svømmeunion", "Swim Denmark"],
  ),
  record({
  "slug": "danish-triathlon",
  "name": "Triatlon Danmark",
  "country": "Denmark",
  "jurisdiction": "Denmark",
  "territories": [
    "Denmark"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triatlon.dk/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Denmark.",
  "sources": [
    "https://triathlon.org/members/danish-triathlon-federation",
    "https://www.triatlon.dk/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Triathlon Denmark",
    "Danish Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Triathlon Denmark and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "japan-athletics",
    "Japan Association of Athletics Federations",
    "Japan",
    ["road-running", "track-and-field"],
    "https://www.jaaf.or.jp/",
    "National athletics federation supporting track and field and road running in Japan.",
    [
      "https://www.jaaf.or.jp/english/about/",
      "https://www.jaaf.or.jp/",
      "https://asianathletics.com/member-federations",
    ],
    ["world-athletics"],
    ["JAAF", "日本陸上競技連盟"],
    "2026-10-23",
  ),
  federation(
    "japan-cycling",
    "Japan Cycling Federation",
    "Japan",
    cycling,
    "https://jcf.or.jp/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Japan.",
    [
      "https://jcf.or.jp/digest/",
      "https://jcf.or.jp/",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["JCF", "日本自転車競技連盟"],
    "2026-10-23",
  ),
  federation(
    "japan-swimming",
    "Japan Swimming Federation",
    "Japan",
    swimming,
    "https://aquatics.or.jp/",
    "National federation for swimming and aquatic sports in Japan.",
    ["https://aquatics.or.jp/about/", "https://aquatics.or.jp/"],
    ["world-aquatics"],
    ["JASF", "日本水泳連盟"],
  ),
  record({
  "slug": "triathlon-japan",
  "name": "Triathlon Japan",
  "country": "Japan",
  "jurisdiction": "Japan",
  "territories": [
    "Japan"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.jtu.or.jp/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Japan.",
  "sources": [
    "https://www.jtu.or.jp/",
    "https://triathlon.org/members/japan-triathlon-union",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Japan Triathlon Union",
    "JTU",
    "トライアスロンジャパン"
  ]
}, "2026-10-23"),
  federation(
    "brazilian-athletics",
    "Confederação Brasileira de Atletismo",
    "Brazil",
    ["road-running", "track-and-field"],
    "https://cbat.org.br/",
    "National athletics federation supporting track and field and road running in Brazil.",
    ["https://cbat.org.br/"],
    ["world-athletics"],
    ["CBAt", "Brazilian Athletics Confederation"],
  ),
  federation(
    "brazilian-cycling",
    "Confederação Brasileira de Ciclismo",
    "Brazil",
    cycling,
    "https://www.cbc.esp.br/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Brazil.",
    ["https://transparenciaconf.cob.org.br/cbc/", "https://www.cbc.esp.br/"],
    ["uci"],
    ["CBC", "Brazilian Cycling Confederation"],
  ),
  federation(
    "brazilian-aquatics",
    "Confederação Brasileira de Desportos Aquáticos",
    "Brazil",
    swimming,
    "https://www.cbda.org.br/",
    "National federation for swimming and aquatic sports in Brazil.",
    ["https://www.cbda.org.br/"],
    ["world-aquatics"],
    ["CBDA", "Brazilian Aquatic Sports Confederation"],
  ),
  record({
  "slug": "brazilian-triathlon",
  "name": "Confederação Brasileira de Triathlon",
  "country": "Brazil",
  "jurisdiction": "Brazil",
  "territories": [
    "Brazil"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://cbtri.org.br/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Brazil.",
  "sources": [
    "https://cbtri.org.br/sobre-nos/",
    "https://cbtri.org.br/",
    "https://triathlon.org/members/brazilian-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "CBTri",
    "Brasil Triathlon",
    "Brazilian Triathlon Confederation",
    "Triathlon Brasil"
  ],
  "detail": "World Triathlon lists this body as Triathlon Brasil and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  record({
    slug: "european-athletics",
    name: "European Athletics",
    aliases: ["European Athletic Association", "EAA"],
    type: "continental",
    country: "International",
    jurisdiction: "Europe",
    territories: ["International"],
    sports: ["road-running", "trail-running", "track-and-field"],
    website: "https://www.european-athletics.com/",
    summary:
      "European governing body for athletics, supporting member federations and organising continental championships.",
    sources: ["https://www.european-athletics.com/stories/your-sport-for-life"],
    related: ["world-athletics"],
  }),
  record({
    slug: "europe-triathlon",
    name: "Europe Triathlon",
    aliases: ["European Triathlon Union", "ETU"],
    type: "continental",
    country: "International",
    jurisdiction: "Europe",
    territories: ["International"],
    sports: ["triathlon", "duathlon"],
    website: "https://europe.triathlon.org/",
    summary:
      "Continental triathlon organisation supporting European member federations and triathlon and multisport championships.",
    sources: ["https://europe.triathlon.org/national-federations"],
    related: ["world-triathlon"],
  }),
  record({
    slug: "uec",
    name: "Union Européenne de Cyclisme",
    aliases: ["UEC", "European Cycling Union"],
    type: "continental",
    country: "International",
    jurisdiction: "Europe",
    territories: ["International"],
    sports: ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    website: "https://www.uec.ch/",
    summary:
      "European cycling confederation organising continental championships across cycling disciplines.",
    sources: ["https://www.uec.ch/en/about-uec"],
    related: ["uci"],
  }),
  record({
    slug: "european-aquatics",
    name: "European Aquatics",
    aliases: ["LEN", "Ligue Européenne de Natation", "European Swimming League"],
    type: "continental",
    country: "International",
    jurisdiction: "Europe",
    territories: ["International"],
    sports: ["swimming"],
    website: "https://europeanaquatics.org/",
    summary:
      "European governing body for swimming and other aquatic sports, affiliated to World Aquatics.",
    sources: ["https://europeanaquatics.org/about-european-aquatics/what-we-do/"],
    related: ["world-aquatics"],
  }),
  record({
    slug: "itra",
    name: "International Trail Running Association",
    aliases: ["ITRA"],
    type: "specialist",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: ["trail-running"],
    website: "https://itra.run/",
    summary:
      "International trail running association supporting runners and organisers through sport development and trail-running information.",
    sources: ["https://itra.run/"],
    related: ["world-athletics", "wmra", "iau"],
    detail:
      "A specialist trail-running association. Its listing does not replace the relevant national athletics federation or imply that it governs every trail event.",
  }),
  record({
    slug: "iau",
    name: "International Association of Ultrarunners",
    aliases: ["IAU"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: ["road-running", "trail-running"],
    website: "https://iau-ultramarathon.org/",
    summary:
      "International organisation for ultradistance running, operating under the patronage of World Athletics.",
    sources: ["https://iau-ultramarathon.org/"],
    related: ["world-athletics", "itra"],
  }),
  record({
    slug: "wmra",
    name: "World Mountain Running Association",
    aliases: ["WMRA"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: ["trail-running"],
    website: "https://www.wmra.info/",
    summary:
      "International association supporting mountain running and international mountain-running competition.",
    sources: ["https://www.wmra.info/", "https://wmra.ch/contact-us/"],
    related: ["world-athletics", "itra"],
  }),
  record({
    slug: "world-masters-athletics",
    name: "World Masters Athletics",
    aliases: ["WMA"],
    type: "international",
    country: "International",
    jurisdiction: "Worldwide",
    territories: ["International"],
    sports: ["road-running", "trail-running", "track-and-field"],
    website: "https://world-masters-athletics.org/",
    summary:
      "Organises and regulates masters athletics internationally for athletes aged 35 and over.",
    sources: ["https://world-masters-athletics.org/"],
    related: ["world-athletics"],
  }),
  record({
    slug: "fell-runners-association",
    name: "Fell Runners Association",
    aliases: ["FRA"],
    type: "specialist",
    country: "England",
    jurisdiction: "England — fell running",
    territories: ["England", "United Kingdom"],
    sports: ["trail-running"],
    website: "https://www.fellrunner.org.uk/",
    summary:
      "Governing body for fell running in England, with race information and support for runners and organisers.",
    sources: ["https://www.fellrunner.org.uk/fra/for-members"],
    related: ["england-athletics", "uk-athletics"],
  }),
  record({
    slug: "trail-running-association",
    name: "Trail Running Association",
    aliases: ["TRA"],
    type: "specialist",
    country: "United Kingdom",
    jurisdiction: "United Kingdom — trail running",
    territories: ["United Kingdom", "England", "Scotland", "Wales", "Northern Ireland"],
    sports: ["trail-running"],
    website: "https://www.tra-uk.org/",
    summary:
      "Promotes trail running across the UK and supports UK Athletics in its management and regulation.",
    sources: ["https://www.tra-uk.org/about"],
    related: ["uk-athletics"],
    detail:
      "Provides guidance and facilities for race organisers. Its race directory lists TRA-licensed trail races in England; this does not mean it permits every trail race across the UK.",
  }),
  record({
    slug: "irish-mountain-running-association",
    name: "Irish Mountain Running Association",
    aliases: ["IMRA"],
    type: "specialist",
    country: "Ireland",
    jurisdiction: "Ireland — mountain running",
    territories: ["Ireland"],
    sports: ["trail-running"],
    website: "https://www.imra.ie/",
    summary:
      "Organises mountain-running races and supports participation in mountain running in Ireland.",
    sources: ["https://www.sportireland.ie/outdoors/trailmountain-running"],
    related: ["athletics-ireland", "northern-ireland-mountain-running-association"],
  }),
  record({
    slug: "northern-ireland-mountain-running-association",
    name: "Northern Ireland Mountain Running Association",
    aliases: ["NIMRA"],
    type: "specialist",
    country: "Northern Ireland",
    jurisdiction: "Northern Ireland — mountain running",
    territories: ["Northern Ireland", "United Kingdom"],
    sports: ["trail-running"],
    website: "https://www.nimra.org.uk/",
    summary:
      "Specialist mountain-running association providing race, championship and participation information in Northern Ireland.",
    sources: ["https://www.nimra.org.uk/"],
    related: ["athletics-northern-ireland", "irish-mountain-running-association"],
  }),
  record({
    slug: "cycling-ulster",
    name: "Cycling Ulster",
    aliases: [],
    type: "regional",
    country: "Northern Ireland",
    jurisdiction: "Nine counties of Ulster, across Northern Ireland and Ireland",
    territories: ["Northern Ireland", "Ireland", "United Kingdom"],
    sports: ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    website: "https://www.cyclingulster.com/",
    summary:
      "Provincial cycling governing body for the nine counties of Ulster, affiliated to Cycling Ireland.",
    sources: ["https://www.cyclingireland.ie/cyclingulster/"],
    related: ["cycling-ireland"],
  }),
  record({
    slug: "swim-ulster",
    name: "Swim Ulster",
    aliases: [],
    type: "regional",
    country: "Northern Ireland",
    jurisdiction: "Ulster, across Northern Ireland and Ireland",
    territories: ["Northern Ireland", "Ireland", "United Kingdom"],
    sports: ["swimming"],
    website: "https://www.swimulster.com/",
    summary:
      "Regional governing body for aquatic sports in Ulster and part of the Swim Ireland family.",
    sources: ["https://www.swimulster.com/about/"],
    related: ["swim-ireland", "sport-northern-ireland"],
  }),
  record({
    slug: "american-trail-running-association",
    name: "American Trail Running Association",
    aliases: ["ATRA"],
    type: "specialist",
    country: "United States",
    jurisdiction: "United States — mountain, ultra and trail running",
    territories: ["United States"],
    sports: ["trail-running"],
    website: "https://trailrunner.com/",
    summary:
      "Nonprofit association serving the mountain, ultra and trail-running community with information and support.",
    sources: ["https://trailrunner.com/about-atra/"],
    related: ["usa-track-field", "itra"],
  }),
  record({
    slug: "us-masters-swimming",
    name: "U.S. Masters Swimming",
    aliases: ["USMS", "US Masters Swimming"],
    type: "specialist",
    country: "United States",
    jurisdiction: "United States — adult swimming",
    territories: ["United States"],
    sports: ["swimming"],
    website: "https://www.usms.org/",
    summary:
      "National membership organisation supporting adult swimmers through clubs, training, events and competition.",
    sources: ["https://www.usms.org/about/what-is-us-masters-swimming"],
    related: ["usa-swimming"],
  }),
  record({
    slug: "masters-swimming-australia",
    name: "Masters Swimming Australia",
    aliases: ["MSA"],
    type: "specialist",
    country: "Australia",
    jurisdiction: "Australia — masters swimming",
    territories: ["Australia"],
    sports: ["swimming"],
    website: "https://mastersswimming.org.au/",
    summary:
      "National masters swimming organisation supporting adult swimmers, affiliated clubs and national championships.",
    sources: ["https://mastersswimming.org.au/about/who-we-are/"],
    related: ["swimming-australia"],
  }),
  record({
    slug: "australian-sports-commission",
    name: "Australian Sports Commission",
    aliases: ["ASC", "Australian Institute of Sport", "AIS"],
    type: "funding",
    country: "Australia",
    jurisdiction: "Australia",
    territories: ["Australia"],
    sports: [],
    website: "https://www.ausport.gov.au/",
    summary:
      "Australian Government agency supporting and investing in sport from participation to international performance.",
    sources: ["https://www.ausport.gov.au/our-organisation"],
    related: ["australian-athletics", "auscycling", "swimming-australia", "austriathlon"],
  }),
  record({
    slug: "sport-new-zealand",
    name: "Sport New Zealand",
    aliases: ["Sport NZ", "Ihi Aotearoa"],
    type: "funding",
    country: "New Zealand",
    jurisdiction: "New Zealand",
    territories: ["New Zealand"],
    sports: [],
    website: "https://sportnz.org.nz/",
    summary: "Leads and invests in New Zealand’s play, active recreation and sport system.",
    sources: ["https://sportnz.org.nz/about/who-we-are/"],
    related: ["high-performance-sport-new-zealand"],
  }),
  record({
    slug: "high-performance-sport-new-zealand",
    name: "High Performance Sport New Zealand",
    aliases: ["HPSNZ", "High Performance Sport NZ"],
    type: "funding",
    country: "New Zealand",
    jurisdiction: "New Zealand — high-performance sport",
    territories: ["New Zealand"],
    sports: [],
    website: "https://hpsnz.org.nz/",
    summary:
      "Partners with national sports organisations to support athletes, coaches and high-performance programmes.",
    sources: ["https://hpsnz.org.nz/about-hpsnz/about-us/"],
    related: ["sport-new-zealand"],
  }),
  record({
    slug: "sport-canada",
    name: "Sport Canada",
    aliases: [],
    type: "funding",
    country: "Canada",
    jurisdiction: "Canada",
    territories: ["Canada"],
    sports: [],
    website: "https://www.canada.ca/en/canadian-heritage/services/role-sport-canada.html",
    summary:
      "Provides federal leadership and funding for Canada’s sport system, athletes and national sport organisations.",
    sources: ["https://www.canada.ca/en/canadian-heritage/services/role-sport-canada.html"],
    related: ["athletics-canada", "cycling-canada", "swimming-canada", "triathlon-canada"],
  }),
  record({
    slug: "sascoc",
    name: "South African Sports Confederation, Olympic and Paralympic Committee",
    aliases: [
      "SASCOC",
      "Team SA",
      "Team South Africa",
      "South African Sports Confederation and Olympic Committee",
    ],
    type: "olympic",
    country: "South Africa",
    jurisdiction: "South Africa",
    territories: ["South Africa"],
    sports: [
      "road-running",
      "track-and-field",
      "road-cycling",
      "mountain-biking",
      "track-cycling",
      "bmx",
      "triathlon",
      "swimming",
    ],
    website: "https://www.teamsa.co.za/",
    summary:
      "Prepares and delivers Team South Africa for Olympic, Paralympic and other international multisport Games.",
    sources: ["https://www.teamsa.co.za/about-sascoc/"],
    related: [
      "athletics-south-africa",
      "cycling-south-africa",
      "swimming-south-africa",
      "triathlon-south-africa",
    ],
  }),

  // Additional national and specialist bodies reviewed on 22 October 2026.
  federation(
    "austrian-athletics",
    "Österreichischer Leichtathletik-Verband",
    "Austria",
    ["road-running", "track-and-field"],
    "https://www.oelv.at/",
    "National athletics federation supporting track and field and road running in Austria.",
    ["https://www.oelv.at/"],
    ["world-athletics", "european-athletics"],
    ["ÖLV", "Austrian Athletics Federation"],
  ),
  federation(
    "austrian-cycling",
    "Cycling Austria",
    "Austria",
    cycling,
    "https://cyclingaustria.at/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Austria.",
    ["https://uec.ch/en/federation/austrian-cycling-federation/5", "https://cyclingaustria.at/"],
    ["uci", "uec"],
    ["Österreichischer Radsport-Verband", "ÖRV", "Austrian Cycling Federation"],
  ),
  federation(
    "austrian-swimming",
    "Österreichischer Schwimmverband",
    "Austria",
    swimming,
    "https://www.schwimmverband.at/",
    "National federation for swimming in Austria, supporting clubs, competition and international representation.",
    ["https://www.schwimmverband.at/"],
    ["world-aquatics", "european-aquatics"],
    ["OSV", "Austrian Swimming Federation"],
  ),
  record({
  "slug": "austrian-triathlon",
  "name": "Triathlon Austria",
  "country": "Austria",
  "jurisdiction": "Austria",
  "territories": [
    "Austria"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon-austria.at/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Austria.",
  "sources": [
    "https://triathlon.org/members/austrian-triathlon-federation",
    "https://www.triathlon-austria.at/de/service-termine",
    "https://www.triathlon-austria.at/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Österreichischer Triathlonverband",
    "ÖTRV",
    "Austrian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Triathlon Austria and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "finnish-athletics",
    "Suomen Urheiluliitto",
    "Finland",
    ["road-running", "track-and-field"],
    "https://www.yleisurheilu.fi/",
    "National athletics federation supporting track and field and road running in Finland.",
    ["https://www.yleisurheilu.fi/suomen-yleisurheilu/", "https://www.yleisurheilu.fi/"],
    ["world-athletics", "european-athletics"],
    [
      "SUL",
      "Finnish Athletics Federation",
      "Finnish Athletics",
      "Suomen Yleisurheilu",
      "Finlands Friidrottsförbund",
    ],
  ),
  federation(
    "finnish-cycling",
    "Suomen Pyöräily",
    "Finland",
    cycling,
    "https://www.pyoraily.fi/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Finland.",
    ["https://uec.ch/en/federation/cycling-union-of-finland/16", "https://www.pyoraily.fi/"],
    ["uci", "uec"],
    ["Cycling Finland", "Cycling Union of Finland"],
  ),
  federation(
    "finnish-swimming",
    "Suomen Uimaliitto",
    "Finland",
    swimming,
    "https://www.uimaliitto.fi/",
    "National federation for swimming in Finland, supporting clubs, competition and international representation.",
    ["https://www.uimaliitto.fi/"],
    ["world-aquatics", "european-aquatics"],
    ["Finnish Swimming Association", "Finnish Swimming Federation"],
  ),
  record({
  "slug": "finnish-triathlon",
  "name": "Triathlon Finland",
  "country": "Finland",
  "jurisdiction": "Finland",
  "territories": [
    "Finland"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.fi/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Finland.",
  "sources": [
    "https://triathlon.org/members/finnish-triathlon-federation",
    "https://www.triathlon.fi/tapahtumat2/",
    "https://www.triathlon.fi/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Suomen Triathlonliitto",
    "Finnish Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Triathlon Finland and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "norwegian-athletics",
    "Norges Friidrettsforbund",
    "Norway",
    ["road-running", "track-and-field"],
    "https://www.friidrett.no/",
    "National athletics federation supporting track and field and road running in Norway.",
    ["https://www.friidrett.no/"],
    ["world-athletics", "european-athletics"],
    ["Norwegian Athletics Federation", "NFIF"],
  ),
  federation(
    "norwegian-cycling",
    "Norges Cykleforbund",
    "Norway",
    cycling,
    "https://www.sykling.no/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Norway.",
    ["https://uec.ch/en/federation/norwegian-cycling-federation/38", "https://www.sykling.no/"],
    ["uci", "uec"],
    ["Norwegian Cycling Federation", "NCF"],
  ),
  federation(
    "norwegian-swimming",
    "Norges Svømmeforbund",
    "Norway",
    swimming,
    "https://svomming.no/",
    "National federation for swimming in Norway, supporting clubs, competition and international representation.",
    ["https://svomming.no/"],
    ["world-aquatics", "european-aquatics"],
    ["Norwegian Swimming Federation", "NSF"],
  ),
  record({
  "slug": "norwegian-triathlon",
  "name": "Norges Triatlonforbund",
  "country": "Norway",
  "jurisdiction": "Norway",
  "territories": [
    "Norway"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triatlonforbundet.no/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Norway.",
  "sources": [
    "https://triathlon.org/members/norwegian-triathlon-federation",
    "https://www.triatlonforbundet.no/terminliste/",
    "https://www.triatlonforbundet.no/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "Norwegian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Norwegian Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "polish-athletics",
    "Polski Związek Lekkiej Atletyki",
    "Poland",
    ["road-running", "track-and-field"],
    "https://pzla.pl/",
    "National athletics federation supporting track and field and road running in Poland.",
    ["https://pzla.pl/"],
    ["world-athletics", "european-athletics"],
    ["PZLA", "Polish Athletics Association"],
  ),
  federation(
    "polish-cycling",
    "Polski Związek Kolarski",
    "Poland",
    cycling,
    "https://www.pzkol.pl/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Poland.",
    ["https://uec.ch/en/federation/polish-cycling-federation/39", "https://www.pzkol.pl/"],
    ["uci", "uec"],
    ["PZKol", "Polish Cycling Federation"],
  ),
  federation(
    "polish-swimming",
    "Polski Związek Pływacki",
    "Poland",
    swimming,
    "https://polswim.pl/",
    "National federation for swimming in Poland, supporting clubs, competition and international representation.",
    ["https://polswim.pl/"],
    ["world-aquatics", "european-aquatics"],
    ["PZP", "Polish Swimming Federation"],
  ),
  record({
  "slug": "polish-triathlon",
  "name": "Polski Związek Triathlonu",
  "country": "Poland",
  "jurisdiction": "Poland",
  "territories": [
    "Poland"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.pl/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Poland.",
  "sources": [
    "https://triathlon.org/members/polski-zwiazek-triathlonu",
    "https://triathlon.pl/kalendarz/",
    "https://www.triathlon.pl/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon",
    "europe-triathlon"
  ],
  "aliases": [
    "PZTri",
    "Polish Triathlon Federation",
    "Polski Zwiazek Triathlonu"
  ],
  "detail": "World Triathlon lists this body as Polski Zwiazek Triathlonu and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "indian-athletics",
    "Athletics Federation of India",
    "India",
    ["road-running", "track-and-field"],
    "https://indianathletics.in/",
    "National athletics federation supporting track and field and road running in India.",
    [
      "https://indianathletics.in/about-afi/",
      "https://indianathletics.in/",
      "https://asianathletics.com/member-federations",
    ],
    ["world-athletics"],
    ["AFI"],
    "2026-10-23",
  ),
  federation(
    "indian-cycling",
    "Cycling Federation of India",
    "India",
    ["road-cycling", "mountain-biking", "track-cycling"],
    "https://www.cfiindia.in/",
    "India’s national cycling federation, with road, track and mountain bike programmes.",
    [
      "https://www.cfiindia.in/about-1",
      "https://www.uci.org/competition-details/2026/ROA/78579",
      "https://www.cfiindia.in/",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["CFI"],
    "2026-10-23",
  ),
  federation(
    "indian-swimming",
    "Swimming Federation of India",
    "India",
    swimming,
    "https://www.swimming.org.in/",
    "National federation for swimming in India, supporting clubs, competition and international representation.",
    ["https://www.swimming.org.in/"],
    ["world-aquatics"],
    ["SFI"],
  ),
  record({
  "slug": "indian-triathlon",
  "name": "Indian Triathlon Federation",
  "country": "India",
  "jurisdiction": "India",
  "territories": [
    "India"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlonindia.com/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in India.",
  "sources": [
    "https://triathlon.org/members/indian-triathlon-federation",
    "https://www.triathlonindia.com/events/event-sanction-process",
    "https://www.triathlonindia.com/",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "ITF"
  ]
}, "2026-10-23"),
  federation(
    "singapore-athletics",
    "Singapore Athletics",
    "Singapore",
    ["road-running", "track-and-field"],
    "https://www.singaporeathletics.org.sg/",
    "National athletics federation supporting track and field and road running in Singapore.",
    ["https://www.singaporeathletics.org.sg/", "https://asianathletics.com/member-federations"],
    ["world-athletics"],
    ["Singapore Athletic Association", "SAA"],
    "2026-10-23",
  ),
  federation(
    "singapore-cycling",
    "Singapore Cycling Federation",
    "Singapore",
    cycling,
    "https://singaporecycling.org.sg/",
    "National cycling federation for road, track, mountain bike and BMX disciplines in Singapore.",
    [
      "https://singaporecycling.org.sg/pages/our-story",
      "https://singaporecycling.org.sg/",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["SCF"],
    "2026-10-23",
  ),
  federation(
    "singapore-aquatics",
    "Singapore Aquatics",
    "Singapore",
    swimming,
    "https://www.sgaquatics.org.sg/",
    "National federation for swimming in Singapore, supporting clubs, competition and international representation.",
    ["https://www.sgaquatics.org.sg/"],
    ["world-aquatics"],
    ["SAQ", "Singapore Swimming Association"],
  ),
  record({
  "slug": "singapore-triathlon",
  "name": "Triathlon Singapore",
  "country": "Singapore",
  "jurisdiction": "Singapore",
  "territories": [
    "Singapore"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlonsingapore.org/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Singapore.",
  "sources": [
    "https://triathlon.org/members/triathlon-association-of-singapore",
    "https://www.triathlonsingapore.org/events/sanctioned-events/",
    "https://www.triathlonsingapore.org/",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Triathlon Association of Singapore",
    "TAS"
  ]
}, "2026-10-23"),
  federation(
    "athletics-kenya",
    "Athletics Kenya",
    "Kenya",
    ["road-running", "track-and-field"],
    "https://www.athleticskenya.or.ke/",
    "National athletics federation supporting track and field and road running in Kenya.",
    [
      "https://www.athleticskenya.or.ke/",
      "https://www.athleticskenya.or.ke/wp-content/uploads/2014/12/Athletics-Kenya-CONSTITUTION-AND-RULES-final-.pdf",
    ],
    ["world-athletics"],
    ["AK"],
  ),
  federation(
    "kenya-aquatics",
    "Kenya Aquatics",
    "Kenya",
    swimming,
    "https://www.kenyaaquatics.org/",
    "National federation for swimming in Kenya, supporting clubs, competition and international representation.",
    ["https://www.kenyaaquatics.org/"],
    ["world-aquatics"],
    ["Kenya Swimming Federation", "KSF"],
  ),
  federation(
    "kenya-triathlon",
    "Kenya Triathlon Federation",
    "Kenya",
    multisport,
    "https://www.triathlonkenya.org/",
    "National federation for triathlon and related multisport, including duathlon, in Kenya.",
    [
      "https://triathlon.org/members/kenyan-triathlon-association",
      "https://www.triathlonkenya.org/",
      "https://africa.triathlon.org/national-federations",
    ],
    ["world-triathlon"],
    ["Kenyan Triathlon Association", "KTF"],
    "2026-10-23",
  ),
  federation(
    "bermuda-athletics",
    "Bermuda National Athletics Association",
    "Bermuda",
    ["road-running", "track-and-field"],
    "https://www.athleticsbda.com/",
    "National athletics federation supporting track and field and road running in Bermuda.",
    ["https://www.athleticsbda.com/"],
    ["world-athletics"],
    ["BNAA"],
  ),
  federation(
    "bermuda-cycling",
    "Bermuda Bicycle Association",
    "Bermuda",
    ["road-cycling", "mountain-biking"],
    "https://www.bermudabicycle.bm/",
    "Bermuda’s national cycling governing body, supporting road cycling and mountain biking.",
    ["https://www.bermudabicycle.bm/about-1", "https://www.bermudabicycle.bm/"],
    ["uci"],
    ["BBA", "Bermuda Cycling"],
  ),
  federation(
    "bermuda-swimming",
    "Bermuda Amateur Swimming Association",
    "Bermuda",
    swimming,
    "https://uk.gomotionapp.com/team/basa/page/home",
    "National federation for swimming in Bermuda, supporting clubs, competition and international representation.",
    [
      "https://nsgbhub.sportsandrec.bm/sport-detail.html?id=367a4826-b74d-4d93-8147-2d07d4c17392",
      "https://uk.gomotionapp.com/team/basa/page/home",
    ],
    ["world-aquatics"],
    ["BASA"],
  ),
  record({
  "slug": "bermuda-triathlon",
  "name": "Bermuda Triathlon Association",
  "country": "Bermuda",
  "jurisdiction": "Bermuda",
  "territories": [
    "Bermuda"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://www.bta.bm/",
  "summary": "Bermuda’s triathlon association, supporting the sport and national representation through World Triathlon.",
  "sources": [
    "https://triathlon.org/members/bermuda-triathlon-federation",
    "https://www.bta.bm/",
    "https://www.bta.bm/about.html",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "BTA",
    "Bermuda Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Bermuda Triathlon Association and reports affiliated status (checked 23 October 2026). The BTA website includes membership, competition rules, newsletters and local event information."
}, "2026-10-24"),
  record({
    slug: "scottish-hill-runners",
    name: "Scottish Hill Runners",
    aliases: ["SHR"],
    type: "specialist",
    country: "Scotland",
    jurisdiction: "Scotland",
    territories: ["Scotland", "United Kingdom"],
    sports: ["trail-running"],
    website: "https://www.scottishhillrunners.uk/",
    summary:
      "Independent association providing information, championships and support for hill runners in Scotland.",
    detail:
      "Its activities include a race calendar, organiser guidance and hill-running championships. Scottish Hill Runners describes itself as a service organisation rather than a sports governing body.",
    sources: ["https://www.scottishhillrunners.uk/info"],
    related: ["scottish-athletics", "fell-runners-association"],
  }),

  federation(
    "czech-athletics",
    "Czech Athletic Federation",
    "Czechia",
    ["road-running", "track-and-field"],
    "https://www.atletika.cz/",
    "National athletics federation supporting track and field and road running in Czechia.",
    ["https://www.atletika.cz/"],
    ["world-athletics"],
    ["Český atletický svaz", "ČAS", "Czech Republic Athletics"],
  ),
  federation(
    "czech-cycling",
    "Czech Cycling Federation",
    "Czechia",
    cycling,
    "https://www.czechcyclingfederation.com/",
    "National governing body for road, track, mountain biking and BMX in Czechia.",
    [
      "https://uec.ch/en/federation/czech-cycling-federation/20",
      "https://www.czechcyclingfederation.com/",
    ],
    ["uci"],
    ["Český svaz cyklistiky", "Czech Republic Cycling"],
  ),
  {
    ...federation(
      "czech-swimming",
      "Czech Swimming Federation",
      "Czechia",
      swimming,
      "https://www.worldaquatics.com/members/national-federations",
      "National federation for swimming and related aquatic disciplines in Czechia, listed by World Aquatics.",
      ["https://www.worldaquatics.com/members/national-federations"],
      ["world-aquatics"],
      ["Český svaz plaveckých sportů", "Czech Republic Swimming"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens World Aquatics’ member directory. Find Czechia for the swimming federation’s current contact information; the separately listed water polo federation has its own remit.",
  },
  record({
  "slug": "czech-triathlon",
  "name": "Czech Triathlon Association",
  "country": "Czechia",
  "jurisdiction": "Czechia",
  "territories": [
    "Czechia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlon.cz/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Czechia.",
  "sources": [
    "https://triathlon.org/members/czech-triathlon-federation",
    "https://triatlon.cz/",
    "https://triatlon.cz/wp-content/uploads/Soutezni-smernice_2026_1F.pdf",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Česká triatlonová asociace",
    "Czech Republic Triathlon"
  ],
  "detail": "World Triathlon lists this body as Czech Triathlon Association and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "hungarian-athletics",
    "Hungarian Athletics Association",
    "Hungary",
    ["road-running", "track-and-field"],
    "https://www.atletika.hu/",
    "National athletics federation supporting track and field and road running in Hungary.",
    ["https://www.atletika.hu/"],
    ["world-athletics"],
    ["Magyar Atlétikai Szövetség", "MASZ"],
  ),
  federation(
    "hungarian-cycling",
    "Hungarian Cycling Federation",
    "Hungary",
    cycling,
    "https://bringasport.hu/",
    "National governing body for road, track, mountain biking and BMX in Hungary.",
    ["https://uec.ch/en/federation/hungarian-cycling-federation/22", "https://bringasport.hu/"],
    ["uci"],
    ["Magyar Kerékpáros Szövetség"],
  ),
  federation(
    "hungarian-swimming",
    "Hungarian Swimming Association",
    "Hungary",
    swimming,
    "https://hunswim.com/",
    "National swimming federation in Hungary, supporting clubs, competition and international representation.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://hunswim.com/",
      "https://www.musz.hu/szabalyzatok/",
    ],
    ["world-aquatics"],
    ["Magyar Úszó Szövetség", "MÚSZ"],
  ),
  record({
  "slug": "hungarian-triathlon",
  "name": "Hungarian Triathlon Federation",
  "country": "Hungary",
  "jurisdiction": "Hungary",
  "territories": [
    "Hungary"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlon.hu/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Hungary.",
  "sources": [
    "https://triathlon.org/members/hungarian-triathlon-federation",
    "https://triatlon.hu/",
    "https://triatlon.hu/versenynaptar/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Magyar Triatlon Szövetség"
  ],
  "detail": "World Triathlon lists this body as Hungarian Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "romanian-athletics",
    "Romanian Athletics Federation",
    "Romania",
    ["road-running", "track-and-field"],
    "https://www.fra.ro/",
    "National athletics federation supporting track and field and road running in Romania.",
    ["https://www.fra.ro/"],
    ["world-athletics"],
    ["Federația Română de Atletism"],
  ),
  federation(
    "romanian-cycling",
    "Romanian Cycling Federation",
    "Romania",
    ["road-cycling", "mountain-biking", "track-cycling"],
    "https://federatiadeciclism.ro/",
    "National cycling federation in Romania, with reviewed coverage of road, track and mountain biking.",
    [
      "https://uec.ch/en/federation/romanian-cycling-federation/41",
      "https://federatiadeciclism.ro/",
    ],
    ["uci"],
    ["Federația Română de Ciclism"],
  ),
  federation(
    "romanian-swimming",
    "Romanian Swimming and Modern Pentathlon Federation",
    "Romania",
    swimming,
    "https://www.frnpm.ro/",
    "National federation responsible for swimming and modern pentathlon in Romania; this directory links its swimming remit.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.frnpm.ro/"],
    ["world-aquatics"],
    ["Federația Română de Natație și Pentatlon Modern", "FRNPM"],
  ),
  record({
  "slug": "romanian-triathlon",
  "name": "Triathlon Romania",
  "country": "Romania",
  "jurisdiction": "Romania",
  "territories": [
    "Romania"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlonromania.ro/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Romania.",
  "sources": [
    "https://triathlon.org/members/romanian-triathlon-federation",
    "https://triatlonromania.ro/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Federația Română de Triatlon",
    "Romanian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Triathlon Romania and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "hellenic-athletics",
    "Hellenic Athletics Federation",
    "Greece",
    ["road-running", "track-and-field"],
    "https://www.segas.gr/",
    "National athletics federation supporting track and field and road running in Greece.",
    ["https://www.segas.gr/"],
    ["world-athletics"],
    ["SEGAS", "ΣΕΓΑΣ", "Hellenic Amateur Athletic Association"],
  ),
  federation(
    "hellenic-cycling",
    "Hellenic Cycling Federation",
    "Greece",
    cycling,
    "https://hellenic-cycling.gr/",
    "National governing body for road, track, mountain biking and BMX in Greece.",
    [
      "https://uec.ch/en/federation/hellenic-cycling-federation/21",
      "https://hellenic-cycling.gr/",
      "https://hellenic-cycling.gr/wp-content/uploads/2023/03/230322_%CE%9A%CE%91%CE%9D%CE%9F%CE%9D%CE%99%CE%A3%CE%9C%CE%9F%CE%99-%CE%A0%CE%9F%CE%94%CE%97%CE%9B%CE%91%CE%A3%CE%99%CE%91%CE%A3-%CE%9D%CE%95%CE%9F%CE%9B%CE%91%CE%99%CE%91%CE%A3-2023.pdf",
    ],
    ["uci"],
    ["Greek Cycling Federation"],
  ),
  federation(
    "hellenic-swimming",
    "Hellenic Swimming Federation",
    "Greece",
    swimming,
    "https://koe.org.gr/",
    "National swimming federation in Greece, supporting clubs, competition and international representation.",
    ["https://www.worldaquatics.com/members/national-federations", "https://koe.org.gr/"],
    ["world-aquatics"],
    ["KOE", "Greek Swimming Federation"],
  ),
  record({
  "slug": "hellenic-triathlon",
  "name": "Hellenic Triathlon Federation",
  "country": "Greece",
  "jurisdiction": "Greece",
  "territories": [
    "Greece"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://hellastriathlon.gr/en/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Greece.",
  "sources": [
    "https://triathlon.org/members/hellenic-triathlon-federation",
    "https://hellastriathlon.gr/en/",
    "https://www.hoc.gr/en/members/hellenic-federation-of-triathlon/",
    "https://hellastriathlon.gr/agonistiko-programma-2026/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Greek Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Hellenic Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "turkish-athletics",
    "Türkiye Athletics Federation",
    "Turkey",
    ["road-running", "track-and-field"],
    "https://taf.org.tr/",
    "National athletics federation supporting track and field and road running in Turkey.",
    ["https://www.turkiye.gov.tr/turkiye-atletizm-federasyonu", "https://taf.org.tr/"],
    ["world-athletics"],
    ["Türkiye Atletizm Federasyonu", "Turkish Athletics Federation", "TAF"],
  ),
  federation(
    "turkish-cycling",
    "Türkiye Cycling Federation",
    "Turkey",
    cycling,
    "https://bisiklet.org.tr/",
    "National governing body for road, track, mountain biking and BMX in Turkey.",
    ["https://uec.ch/en/federation/turkish-cycling-federation/49", "https://bisiklet.org.tr/"],
    ["uci"],
    ["Türkiye Bisiklet Federasyonu", "Turkish Cycling Federation"],
  ),
  federation(
    "turkish-swimming",
    "Türkiye Swimming Federation",
    "Turkey",
    swimming,
    "https://www.tyf.gov.tr/",
    "National swimming federation in Turkey, supporting clubs, competition and international representation.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.tyf.gov.tr/"],
    ["world-aquatics"],
    ["Türkiye Yüzme Federasyonu", "Turkish Swimming Federation"],
  ),
  record({
  "slug": "turkish-triathlon",
  "name": "Türkiye Triathlon Federation",
  "country": "Turkey",
  "jurisdiction": "Turkey",
  "territories": [
    "Turkey"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triatlon.org.tr/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Turkey.",
  "sources": [
    "https://triathlon.org/members/turkish-triathlon-federation",
    "https://www.triatlon.org.tr/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Türkiye Triatlon Federasyonu",
    "Turkish Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Türkiye Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "estonian-athletics",
    "Estonian Athletics Association",
    "Estonia",
    ["road-running", "track-and-field"],
    "https://www.ekjl.ee/",
    "National athletics federation supporting track and field and road running in Estonia.",
    ["https://www.ekjl.ee/"],
    ["world-athletics"],
    ["Eesti Kergejõustikuliit", "EKJL"],
  ),
  federation(
    "estonian-cycling",
    "Estonian Cyclists Union",
    "Estonia",
    cycling,
    "https://ejl.ee/",
    "National governing body for road, track, mountain biking and BMX in Estonia.",
    ["https://uec.ch/en/federation/estonian-cyclists-union/15", "https://ejl.ee/"],
    ["uci"],
    ["Eesti Jalgratturite Liit", "EJL", "Estonian Cycling Federation"],
  ),
  federation(
    "estonian-swimming",
    "Estonian Swimming Federation",
    "Estonia",
    swimming,
    "https://swimming.ee/",
    "National swimming federation in Estonia, supporting clubs, competition and international representation.",
    ["https://www.worldaquatics.com/members/national-federations", "https://swimming.ee/"],
    ["world-aquatics"],
    ["Eesti Ujumisliit"],
  ),
  record({
  "slug": "estonian-triathlon",
  "name": "Estonian Triathlon Association",
  "country": "Estonia",
  "jurisdiction": "Estonia",
  "territories": [
    "Estonia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triatlon.ee/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Estonia.",
  "sources": [
    "https://triathlon.org/members/estonian-triathlon-federation",
    "https://www.triatlon.ee/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Eesti Triatloni Liit",
    "Estonian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Estonian Triathlon Association and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "latvian-athletics",
    "Latvian Athletics Association",
    "Latvia",
    athletics,
    "https://athletics.lv/",
    "National athletics federation for track and field, road running and trail running in Latvia.",
    ["https://athletics.lv/"],
    ["world-athletics"],
    ["Latvijas Vieglatlētikas savienība", "LVS"],
  ),
  federation(
    "latvian-cycling",
    "Latvian Cycling Federation",
    "Latvia",
    cycling,
    "https://lrf.lv/",
    "National governing body for road, track, mountain biking and BMX in Latvia.",
    ["https://uec.ch/en/federation/latvian-cycling-federation/28", "https://lrf.lv/"],
    ["uci"],
    ["Latvijas Riteņbraukšanas federācija", "LRF"],
  ),
  federation(
    "latvian-swimming",
    "Swimming Federation of Latvia",
    "Latvia",
    swimming,
    "https://swimming.lv/",
    "National swimming federation in Latvia, supporting clubs, competition and international representation.",
    ["https://www.worldaquatics.com/members/national-federations", "https://swimming.lv/"],
    ["world-aquatics"],
    ["Latvijas Peldēšanas federācija", "Latvian Swimming Federation"],
  ),
  record({
  "slug": "latvian-triathlon",
  "name": "Latvian Triathlon Federation",
  "country": "Latvia",
  "jurisdiction": "Latvia",
  "territories": [
    "Latvia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triatlons.lv/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Latvia.",
  "sources": [
    "https://triathlon.org/members/latvian-triathlon-federation",
    "https://www.triatlons.lv/",
    "https://www.triatlons.lv/lv/news/ltf-kausa-izcina-ieklautas-sacensibas-2026-gada-sezona-1b95821f-890a-405c-bcf7-44fa6ac86cc7",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Latvijas Triatlona federācija"
  ],
  "detail": "World Triathlon lists this body as Latvian Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "lithuanian-athletics",
    "Lithuanian Athletics Federation",
    "Lithuania",
    ["road-running", "track-and-field"],
    "https://lengvoji.lt/en/",
    "National athletics federation supporting track and field and road running in Lithuania.",
    ["https://lengvoji.lt/en/"],
    ["world-athletics"],
    ["Lietuvos lengvosios atletikos federacija", "LLAF"],
  ),
  federation(
    "lithuanian-cycling",
    "Lithuanian Cycling Federation",
    "Lithuania",
    cycling,
    "https://ldsf.lt/",
    "National governing body for road, track, mountain biking and BMX in Lithuania.",
    ["https://uec.ch/en/federation/lithuanian-cycling-federation/30", "https://ldsf.lt/"],
    ["uci"],
    ["Lietuvos dviračių sporto federacija", "LDSF"],
  ),
  federation(
    "ltu-aquatics",
    "LTU Aquatics",
    "Lithuania",
    swimming,
    "https://ltuaquatics.com/",
    "Lithuania’s national federation for swimming, diving and artistic swimming, now known as LTU Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://ltuaquatics.com/"],
    ["world-aquatics"],
    ["Association LTU Aquatics", "Lithuanian Swimming Federation", "Lietuvos plaukimo federacija"],
  ),
  record({
  "slug": "lithuanian-triathlon",
  "name": "Lithuanian Triathlon Federation",
  "country": "Lithuania",
  "jurisdiction": "Lithuania",
  "territories": [
    "Lithuania"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://www.triatlonas.lt/",
  "summary": "National federation for triathlon in Lithuania, supporting clubs, national championships and international representation.",
  "sources": [
    "https://triathlon.org/members/lithuanian-triathlon-federation",
    "https://www.triatlonas.lt/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Lietuvos triatlono federacija"
  ],
  "detail": "World Triathlon lists this body as Lithuanian Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "mexican-cycling",
    "Unión Ciclista de México",
    "Mexico",
    cycling,
    "https://ucmex.org/",
    "Mexico’s UCI-recognised cycling federation, supporting road, track, mountain biking and BMX.",
    [
      "https://www.copaci.org/la-union-ciclista-internacional-reconoce-nueva-federacion-en-mexico/",
      "https://ucmex.org/",
    ],
    ["uci"],
    ["UCMEX", "Mexican Cycling Union"],
  ),
  {
    ...federation(
      "aquatics-mexico",
      "Aquatics México",
      "Mexico",
      swimming,
      "https://www.worldaquatics.com/members/national-federations",
      "Mexico’s current World Aquatics member federation, bringing together aquatic sports associations, including swimming.",
      [
        "https://www.worldaquatics.com/members/national-federations",
        "https://www.worldaquatics.com/news/4173902/decision-on-mexican-swimming-federation",
      ],
      ["world-aquatics"],
      [
        "Federación de Asociaciones de Deportes Acuáticos Aquatics México",
        "Mexican Aquatics Federation",
      ],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens World Aquatics’ member directory; find Mexico for the current federation. Aquatics México is distinct from the former Mexican Swimming Federation, which World Aquatics expelled in November 2024. No standalone website is listed in the current member entry.",
  },
  record({
  "slug": "mexican-triathlon",
  "name": "Federación Mexicana de Triatlón",
  "country": "Mexico",
  "jurisdiction": "Mexico",
  "territories": [
    "Mexico"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlon.com.mx/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Mexico.",
  "sources": [
    "https://triathlon.org/members/federacion-mexicana-de-triatlon",
    "https://triatlon.com.mx/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Mexican Triathlon Federation",
    "FMTRI",
    "Federacion Mexicana de Triatlon AC"
  ],
  "detail": "World Triathlon lists this body as Federacion Mexicana de Triatlon AC and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "korean-athletics",
    "Korea Association of Athletics Federations",
    "South Korea",
    ["road-running", "track-and-field"],
    "https://www.kaaf.or.kr/",
    "National athletics federation supporting track and field and road running in South Korea.",
    ["https://asianathletics.com/member-federations", "https://www.kaaf.or.kr/"],
    ["world-athletics"],
    ["KAAF", "Republic of Korea Athletics"],
    "2026-10-23",
  ),
  federation(
    "korean-cycling",
    "Korea Cycling Federation",
    "South Korea",
    cycling,
    "https://cycling.or.kr/",
    "National governing body for road, track, mountain biking and BMX in South Korea.",
    [
      "https://www.uci.org/competition-details/2026/ROA/78520",
      "https://cycling.or.kr/",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["KCF", "Republic of Korea Cycling"],
    "2026-10-23",
  ),
  federation(
    "korean-swimming",
    "Korea Swimming Federation",
    "South Korea",
    swimming,
    "https://www.korswim.co.kr/",
    "National swimming federation in South Korea, supporting clubs, competition and international representation.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.korswim.co.kr/"],
    ["world-aquatics"],
    ["KSF", "Republic of Korea Swimming"],
  ),
  record({
  "slug": "korean-triathlon",
  "name": "Korea Triathlon Federation",
  "country": "South Korea",
  "jurisdiction": "South Korea",
  "territories": [
    "South Korea"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triathlon.or.kr/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in South Korea.",
  "sources": [
    "https://triathlon.org/members/korean-triathlon-federation",
    "https://triathlon.or.kr/",
    "https://triathlon.or.kr/events/tour/",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Republic of Korea Triathlon",
    "대한철인3종협회"
  ]
}, "2026-10-23"),

  federation(
    "argentine-athletics",
    "Confederación Argentina de Atletismo",
    "Argentina",
    athletics,
    "https://cada-atletismo.com/",
    "National athletics federation for track and field, road running and trail running in Argentina.",
    [
      "https://atletismosudamericano.com/federaciones/",
      "https://cada-atletismo.com/",
      "https://cada-atletismo.com/nos-renovamos/",
    ],
    ["world-athletics"],
    ["CADA", "Argentine Athletics Confederation"],
  ),
  {
    ...federation(
      "ucra",
      "Unión Ciclista de la República Argentina",
      "Argentina",
      cycling,
      "https://ucraargentina.com/",
      "National cycling umbrella coordinating Argentina’s road and track, mountain-bike and BMX federations.",
      [
        "https://ucraargentina.com/ucra-en-los-juegos-suramericanos-el-ciclismo-argentino-se-prepara-para-hacer-historia/",
        "https://ucraargentina.com/",
      ],
      ["uci", "argentine-road-track-cycling", "argentine-mountain-biking", "argentine-bmx"],
      ["UCRA", "Argentine Cycling Union"],
    ),
    detail:
      "UCRA brings together FACPyR for road and track, FACIMO for mountain biking, and FAB for BMX. The discipline-specific bodies are listed separately below.",
  },
  federation(
    "argentine-road-track-cycling",
    "Federación Argentina de Ciclismo de Pista y Ruta",
    "Argentina",
    ["road-cycling", "track-cycling"],
    "https://ciclismoarg.com.ar/",
    "National federation for road and track cycling in Argentina, within the UCRA umbrella.",
    ["https://ciclismoarg.com.ar/reglamentacion-general/", "https://ciclismoarg.com.ar/"],
    ["ucra", "uci"],
    ["FACPyR", "Argentine Road and Track Cycling Federation"],
  ),
  federation(
    "argentine-mountain-biking",
    "Federación Argentina de Ciclismo de Montaña",
    "Argentina",
    ["mountain-biking"],
    "https://facimo.com/",
    "National federation for mountain biking in Argentina, within the UCRA umbrella.",
    ["https://facimo.com/institucional/", "https://facimo.com/"],
    ["ucra", "uci"],
    ["FACIMO", "Argentine Mountain Bike Federation"],
  ),
  federation(
    "argentine-bmx",
    "Federación Argentina de BMX",
    "Argentina",
    ["bmx"],
    "https://www.bmxargentina.com/",
    "National federation for BMX in Argentina, within the UCRA umbrella.",
    ["https://www.bmxargentina.com/index.php?link=1", "https://www.bmxargentina.com/"],
    ["ucra", "uci"],
    ["FAB", "Argentine BMX Federation", "Federación Argentina de Bicicross"],
  ),
  federation(
    "argentine-aquatics",
    "Confederación Argentina de Deportes Acuáticos",
    "Argentina",
    swimming,
    "https://cadda.org.ar/",
    "National federation for swimming and related aquatic disciplines in Argentina.",
    ["https://www.worldaquatics.com/members/national-federations", "https://cadda.org.ar/"],
    ["world-aquatics"],
    ["CADDA", "Argentine Aquatic Sports Confederation"],
  ),
  record({
  "slug": "argentine-triathlon",
  "name": "Federación Argentina de Triatlón",
  "country": "Argentina",
  "jurisdiction": "Argentina",
  "territories": [
    "Argentina"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/federacion-argentina-de-triatlon",
  "summary": "National federation for triathlon in Argentina, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/federacion-argentina-de-triatlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FAT",
    "Argentine Triathlon Federation",
    "Federación Argentina de Triatlon"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Argentina’s World Triathlon member profile, with current federation contact information and its listed social channel. World Triathlon lists this body as Federación Argentina de Triatlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "chilean-athletics",
    "Federación Atlética de Chile",
    "Chile",
    ["road-running", "track-and-field"],
    "https://fedachi.cl/",
    "National athletics federation supporting track and field and road running in Chile.",
    ["https://atletismosudamericano.com/federaciones/", "https://fedachi.cl/"],
    ["world-athletics"],
    ["FEDACHI", "Chilean Athletics Federation"],
  ),
  federation(
    "chilean-cycling",
    "Federación Deportiva Nacional de Ciclismo de Chile",
    "Chile",
    cycling,
    "https://fdnciclismochile.cl/",
    "National governing body for road, track, mountain biking and BMX in Chile.",
    ["https://fdnciclismochile.cl/collections/quienes-somos", "https://fdnciclismochile.cl/"],
    ["uci"],
    ["FEDENACICH", "Chilean Cycling Federation"],
  ),
  federation(
    "chilean-aquatics",
    "Federación Chilena de Deportes Acuáticos",
    "Chile",
    swimming,
    "https://fechida.cl/",
    "National federation for swimming and related aquatic disciplines in Chile.",
    ["https://www.worldaquatics.com/members/national-federations", "https://fechida.cl/"],
    ["world-aquatics"],
    ["FECHIDA", "Chilean Aquatic Sports Federation"],
  ),
  record({
  "slug": "chilean-triathlon",
  "name": "Federación Chilena de Triatlón",
  "country": "Chile",
  "jurisdiction": "Chile",
  "territories": [
    "Chile"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlonchile.cl/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Chile.",
  "sources": [
    "https://triathlon.org/members/federacion-chilena-de-triathlon",
    "https://triatlonchile.cl/",
    "https://triatlonchile.cl/noticias/convocatoria-internacional-age-group-2026-id-22500",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FECHITRI",
    "Chilean Triathlon Federation",
    "Federacion Chilena de Triatlón"
  ],
  "detail": "World Triathlon lists this body as Federacion Chilena de Triatlón and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  {
    ...federation(
      "colombian-athletics",
      "Federación Colombiana de Atletismo",
      "Colombia",
      ["road-running", "track-and-field"],
      "https://olimpicocol.co/web/federaciones/atletismo-2/",
      "National athletics federation supporting track and field and road running in Colombia.",
      [
        "https://atletismosudamericano.com/federaciones/",
        "https://olimpicocol.co/web/federaciones/atletismo-2/",
      ],
      ["world-athletics"],
      ["FECODATLE", "Colombian Athletics Federation"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Colombian Olympic Committee’s federation profile, which describes FECODATLE’s national role. A usable standalone federation website was not verified in this review.",
  },
  federation(
    "colombian-cycling",
    "Federación Colombiana de Ciclismo",
    "Colombia",
    cycling,
    "https://www.federacioncolombianadeciclismo.com/",
    "National governing body for road, track, mountain biking and BMX in Colombia.",
    [
      "https://olimpicocol.co/web/federaciones/ciclismo-2/",
      "https://www.federacioncolombianadeciclismo.com/",
    ],
    ["uci"],
    ["FCC", "Colombian Cycling Federation", "Fedeciclismo"],
  ),
  federation(
    "colombian-swimming",
    "Federación Colombiana de Natación",
    "Colombia",
    swimming,
    "https://fecna.com.co/",
    "National federation for swimming and related aquatic disciplines in Colombia.",
    ["https://www.worldaquatics.com/members/national-federations", "https://fecna.com.co/"],
    ["world-aquatics"],
    ["FECNA", "Colombian Swimming Federation"],
  ),
  record({
  "slug": "colombian-triathlon",
  "name": "Federación Colombiana de Triatlón",
  "country": "Colombia",
  "jurisdiction": "Colombia",
  "territories": [
    "Colombia"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/federacion-colombiana-de-triathlon",
  "summary": "National federation for triathlon in Colombia, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/federacion-colombiana-de-triathlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FEDECOLTRI",
    "Colombian Triathlon Federation",
    "Federacion Colombiana de Triathlon"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Colombia’s World Triathlon member profile. The standalone federation website was displaying a maintenance page at the time of review. World Triathlon lists this body as Federacion Colombiana de Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "malaysian-athletics",
    "Malaysia Athletics Federation",
    "Malaysia",
    ["road-running", "track-and-field"],
    "https://mafmalaysia.com/",
    "National athletics federation supporting track and field and road running in Malaysia.",
    ["https://asianathletics.com/member-federations", "https://mafmalaysia.com/"],
    ["world-athletics"],
    ["MAF", "Malaysia Athletic Federation", "Kesatuan Olahraga Malaysia", "Malaysian Athletics"],
    "2026-10-23",
  ),
  federation(
    "malaysian-cycling",
    "Malaysian National Cycling Federation",
    "Malaysia",
    cycling,
    "https://www.mncf.my/",
    "National governing body for road, track, mountain biking and BMX in Malaysia.",
    [
      "https://olympics.com.my/single-organization/?sg_id=9",
      "https://www.mncf.my/",
      "https://www.uci.org/competition-details/2027/BMX/80267",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["MNCF", "Persekutuan Kebangsaan Berbasikal Malaysia", "PKBM"],
    "2026-10-23",
  ),
  federation(
    "malaysia-aquatics",
    "Malaysia Aquatics",
    "Malaysia",
    swimming,
    "https://www.malaysiaaquatics.org/",
    "National federation for swimming and related aquatic disciplines in Malaysia.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.malaysiaaquatics.org/",
    ],
    ["world-aquatics"],
    ["Akuatik Malaysia", "MAS", "Amateur Swimming Union of Malaysia", "ASUM"],
  ),
  record({
  "slug": "malaysian-triathlon",
  "name": "Malaysia Triathlon Association",
  "country": "Malaysia",
  "jurisdiction": "Malaysia",
  "territories": [
    "Malaysia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://malaysiatriathlon.wordpress.com/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Malaysia.",
  "sources": [
    "https://triathlon.org/members/triathlon-association-of-malaysia",
    "https://malaysiatriathlon.wordpress.com/",
    "https://malaysiatriathlon.wordpress.com/about-malaysia-triathlon/",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Malaysia Triathlon",
    "Persatuan Triathlon Malaysia Baru",
    "MTA"
  ]
}, "2026-10-23"),
  federation(
    "thai-athletics",
    "Athletic Association of Thailand",
    "Thailand",
    ["road-running", "track-and-field"],
    "https://aat.or.th/",
    "National athletics federation supporting track and field and road running in Thailand.",
    ["https://asianathletics.com/member-federations", "https://aat.or.th/"],
    ["world-athletics"],
    ["AAT", "Thai Athletics"],
    "2026-10-23",
  ),
  federation(
    "thai-cycling",
    "Thailand Cycling Association",
    "Thailand",
    cycling,
    "https://www.thaicycling.or.th/en/",
    "National governing body for road, track, mountain biking and BMX in Thailand.",
    [
      "https://www.thaicycling.or.th/en/about",
      "https://www.thaicycling.or.th/en/",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["Thai Cycling Association", "TCA"],
    "2026-10-23",
  ),
  {
    ...federation(
      "thailand-aquatics",
      "Thailand Aquatic Sports Association",
      "Thailand",
      swimming,
      "https://www.thaiaquatics.or.th/",
      "National federation for swimming and related aquatic disciplines in Thailand.",
      [
        "https://www.worldaquatics.com/members/national-federations",
        "https://www.thaiaquatics.or.th/",
      ],
      ["world-aquatics"],
      [
        "TASA",
        "Thailand Aquatics Association",
        "TAA",
        "Thailand Swimming Association",
        "Thai Swimming",
      ],
    ),
    detail:
      "The federation’s current website uses Thailand Aquatic Sports Association (TASA). World Aquatics’ member directory still lists the older Thailand Swimming Association name; both names are searchable here.",
  },
  record({
  "slug": "thai-triathlon",
  "name": "Thailand Triathlon",
  "country": "Thailand",
  "jurisdiction": "Thailand",
  "territories": [
    "Thailand"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/triathlon-association-of-thailand",
  "summary": "National federation for triathlon in Thailand, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/triathlon-association-of-thailand",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Triathlon Association of Thailand",
    "Thai Triathlon"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Thailand’s World Triathlon member profile, which lists the federation’s affiliation and contact information. No standalone website is listed in that member entry."
}, "2026-10-23"),
  federation(
    "philippine-athletics",
    "Philippine Athletics Track and Field Association",
    "Philippines",
    ["road-running", "track-and-field"],
    "https://www.philippineathletics.org/",
    "National athletics federation supporting track and field and road running in Philippines.",
    [
      "https://asianathletics.com/member-federations",
      "https://www.philippineathletics.org/",
      "https://www.philippineathletics.org/about",
    ],
    ["world-athletics"],
    ["PATAFA", "Philippine Athletics Inc", "Philippines Athletics"],
    "2026-10-23",
  ),
  federation(
    "philcycling",
    "Integrated Cycling Federation of the Philippines",
    "Philippines",
    cycling,
    "https://philcycling.wordpress.com/",
    "National governing body for road, track, mountain biking and BMX in Philippines.",
    [
      "https://philcycling.wordpress.com/about/",
      "https://philcycling.wordpress.com/",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["PhilCycling", "ICFP", "Philippine Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "philippine-aquatics",
    "Philippine Aquatics, Inc.",
    "Philippines",
    swimming,
    "https://www.philippineaquatics.com/index.php/en/",
    "Current World Aquatics member federation for aquatic sports, including swimming, in the Philippines.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.philippineaquatics.com/index.php/en/",
    ],
    ["world-aquatics"],
    ["PAI", "Philippines Aquatics", "Philippine Swimming"],
  ),
  record({
  "slug": "philippine-triathlon",
  "name": "Triathlon Association of the Philippines",
  "country": "Philippines",
  "jurisdiction": "Philippines",
  "territories": [
    "Philippines"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/triathlon-association-of-the-philippines",
  "summary": "National federation for triathlon in Philippines, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/triathlon-association-of-the-philippines",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "TriPhil",
    "Triathlon Philippines",
    "TRAP"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens the Philippines’ World Triathlon member profile, with federation contact details. The standalone site listed there could not be retrieved during this review."
}, "2026-10-23"),
  federation(
    "indonesian-athletics",
    "Persatuan Atletik Seluruh Indonesia",
    "Indonesia",
    ["road-running", "track-and-field"],
    "https://www.pbpasi.org/",
    "National athletics federation supporting track and field and road running in Indonesia.",
    ["https://asianathletics.com/member-federations", "https://www.pbpasi.org/"],
    ["world-athletics"],
    ["PASI", "PB PASI", "Indonesian Athletics Federation", "Athletics Federation of Indonesia"],
    "2026-10-23",
  ),
  {
    ...federation(
      "indonesian-cycling",
      "Indonesian Cycling Federation",
      "Indonesia",
      cycling,
      "https://nocindonesia.id/sport/view/cycling",
      "National governing body for road, track, mountain biking and BMX in Indonesia.",
      [
        "https://nocindonesia.id/sport/view/cycling",
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      ],
      ["uci"],
      [
        "ICF",
        "Indonesia Cycling Federation",
        "Ikatan Sport Sepeda Indonesia",
        "Ikatan Sepeda Sport Indonesia",
        "ISSI",
      ],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Indonesian Olympic Committee’s cycling page, which identifies the national federation and its four Olympic disciplines. The federation’s icf.id website was under construction at the time of review.",
  },
  {
    ...federation(
      "akuatik-indonesia",
      "Akuatik Indonesia",
      "Indonesia",
      swimming,
      "https://akuatikindonesia.id/",
      "National federation for swimming and related aquatic disciplines in Indonesia.",
      [
        "https://www.worldaquatics.com/members/national-federations",
        "https://akuatikindonesia.id/",
        "https://akuatikindonesia.id/tentang",
      ],
      ["world-aquatics"],
      [
        "Indonesia Aquatics",
        "Indonesian Swimming Federation",
        "Persatuan Renang Seluruh Indonesia",
        "PRSI",
        "PB PRSI",
      ],
    ),
    detail:
      "Formerly Persatuan Renang Seluruh Indonesia (PRSI), the federation adopted the Akuatik Indonesia name in August 2023. World Aquatics’ directory retains the older name; both are searchable here.",
  },
  record({
  "slug": "indonesian-triathlon",
  "name": "Indonesian Triathlon Federation",
  "country": "Indonesia",
  "jurisdiction": "Indonesia",
  "territories": [
    "Indonesia"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/indonesian-triathlon-federation",
  "summary": "National federation for triathlon in Indonesia, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/indonesian-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Federasi Triathlon Indonesia",
    "FTI"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Indonesia’s World Triathlon member profile, with federation contact details. The standalone site listed there could not be retrieved during this review."
}, "2026-10-23"),
  federation(
    "hong-kong-athletics",
    "Hong Kong, China Association of Athletics Affiliates",
    "Hong Kong",
    ["road-running", "track-and-field"],
    "https://www.hkaaa.com/",
    "Athletics governing body supporting track and field and road running in Hong Kong.",
    ["https://asianathletics.com/member-federations", "https://www.hkaaa.com/"],
    ["world-athletics"],
    ["HKAAA", "Hong Kong Athletics", "Hong Kong China"],
    "2026-10-23",
  ),
  federation(
    "hong-kong-cycling",
    "The Cycling Association of Hong Kong, China Limited",
    "Hong Kong",
    cycling,
    "https://www.cycling.org.hk/",
    "Governing body for road, track, mountain biking and BMX in Hong Kong.",
    [
      "https://www.hkolympic.org/about-us/national-sports-association/",
      "https://www.cycling.org.hk/",
      "https://www.gov.hk/en/residents/culture/recreation/activities/cycling.htm",
      "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
    ],
    ["uci"],
    ["CAHK", "Hong Kong Cycling", "Hong Kong China"],
    "2026-10-23",
  ),
  federation(
    "hong-kong-swimming",
    "Hong Kong China Swimming Association",
    "Hong Kong",
    swimming,
    "https://www.hkgswimming.org.hk/",
    "Governing body for swimming and related aquatic disciplines in Hong Kong.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.hkgswimming.org.hk/",
    ],
    ["world-aquatics"],
    ["HKGSA", "Hong Kong Swimming", "Hong Kong, China"],
  ),
  record({
  "slug": "hong-kong-triathlon",
  "name": "Triathlon Association of Hong Kong China",
  "country": "Hong Kong",
  "jurisdiction": "Hong Kong",
  "territories": [
    "Hong Kong"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.com.hk/",
  "summary": "Governing body for triathlon and related multisport, including duathlon, in Hong Kong.",
  "sources": [
    "https://triathlon.org/members/hong-kong-triathlon-association",
    "https://www.triathlon.com.hk/",
    "https://www.triathlon.com.hk/en/event/trihk_race_info/",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "TriHK",
    "Hong Kong Triathlon",
    "Hong Kong, China"
  ]
}, "2026-10-23"),

  federation(
    "croatian-athletics",
    "Hrvatski atletski savez",
    "Croatia",
    ["road-running", "track-and-field"],
    "https://www.has.hr/",
    "National athletics federation supporting track and field and road running in Croatia.",
    ["https://balkanathletics.org/about-us/", "https://www.has.hr/"],
    ["world-athletics"],
    ["HAS", "Croatian Athletics Federation"],
  ),
  federation(
    "croatian-cycling",
    "Hrvatski biciklistički savez",
    "Croatia",
    ["road-cycling", "mountain-biking"],
    "https://www.hbs.hr/",
    "National cycling federation supporting road cycling and mountain biking in Croatia.",
    ["https://uec.ch/en/federation/croatian-cycling-federation/12", "https://www.hbs.hr/"],
    ["uci"],
    ["HBS", "Croatian Cycling Federation"],
  ),
  federation(
    "croatian-swimming",
    "Hrvatski plivački savez",
    "Croatia",
    swimming,
    "https://www.croswim.org/",
    "National federation responsible for swimming in Croatia, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.croswim.org/"],
    ["world-aquatics"],
    ["HPS", "Croatian Swimming Federation", "Croatia Swimming Association"],
  ),
  record({
  "slug": "croatian-triathlon",
  "name": "Hrvatski triatlon savez",
  "country": "Croatia",
  "jurisdiction": "Croatia",
  "territories": [
    "Croatia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlon.hr/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Croatia.",
  "sources": [
    "https://triathlon.org/members/croatian-triathlon-federation",
    "https://triatlon.hr/",
    "https://triatlon.hr/wp-content/uploads/2026/05/Raspis-6.Polojski-duatlon-PH-u-SS-duatlonu-2026-2152026.pdf",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "HTS",
    "Croatian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Croatian Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "slovenian-athletics",
    "Atletska zveza Slovenije",
    "Slovenia",
    ["road-running", "track-and-field"],
    "https://slovenska-atletika.si/",
    "National athletics federation supporting track and field and road running in Slovenia.",
    ["https://balkanathletics.org/about-us/", "https://slovenska-atletika.si/"],
    ["world-athletics"],
    ["AZS", "Athletic Federation of Slovenia", "Slovenian Athletics Federation"],
  ),
  federation(
    "slovenian-cycling",
    "Kolesarska zveza Slovenije",
    "Slovenia",
    cycling,
    "https://kolesarska-zveza.si/",
    "National cycling federation supporting road, track, mountain biking and BMX in Slovenia.",
    [
      "https://uec.ch/en/federation/slovenian-cycling-federation/46",
      "https://kolesarska-zveza.si/",
    ],
    ["uci"],
    ["KZS", "Slovenian Cycling Federation"],
  ),
  federation(
    "slovenian-swimming",
    "Plavalna zveza Slovenije",
    "Slovenia",
    swimming,
    "https://www.plavalna-zveza.si/",
    "National federation responsible for swimming in Slovenia, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.plavalna-zveza.si/",
    ],
    ["world-aquatics"],
    ["PZS", "Slovenian Swimming Federation"],
  ),
  record({
  "slug": "slovenian-triathlon",
  "name": "Triatlon zveza Slovenije",
  "country": "Slovenia",
  "jurisdiction": "Slovenia",
  "territories": [
    "Slovenia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlonslovenije.si/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Slovenia.",
  "sources": [
    "https://triathlon.org/members/slovenian-triathlon-federation",
    "https://triatlonslovenije.si/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "TZS",
    "Slovenian Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Slovenian Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "slovak-athletics",
    "Slovenský atletický zväz",
    "Slovakia",
    ["road-running", "track-and-field"],
    "https://www.atletika.sk/",
    "National athletics federation supporting track and field and road running in Slovakia.",
    ["https://www.atletika.sk/kontakty/", "https://www.atletika.sk/"],
    ["world-athletics"],
    ["SAZ", "Slovak Athletic Federation", "Slovak Athletics Federation"],
  ),
  federation(
    "slovak-cycling",
    "Slovenský zväz cyklistiky",
    "Slovakia",
    cycling,
    "https://www.cyklistikaszc.sk/",
    "National cycling federation supporting road, track, mountain biking and BMX in Slovakia.",
    ["https://uec.ch/en/federation/slovak-cycling-federation/45", "https://www.cyklistikaszc.sk/"],
    ["uci"],
    ["SZC", "Slovak Cycling Federation"],
  ),
  federation(
    "slovak-swimming",
    "Slovenská plavecká federácia",
    "Slovakia",
    swimming,
    "https://swimmsvk.sk/",
    "National federation responsible for swimming in Slovakia, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://swimmsvk.sk/"],
    ["world-aquatics"],
    ["SPF", "Slovak Swimming Federation"],
  ),
  record({
  "slug": "slovak-triathlon",
  "name": "Slovenská triatlonová únia",
  "country": "Slovakia",
  "jurisdiction": "Slovakia",
  "territories": [
    "Slovakia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.triathlon.sk/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Slovakia.",
  "sources": [
    "https://triathlon.org/members/slovak-triathlon-union",
    "https://www.triathlon.sk/",
    "https://www.triathlon.sk/vyzva-pre-organizatorov-podujati-v-roku-2026-369",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "STÚ",
    "STU",
    "Slovak Triathlon Union"
  ],
  "detail": "World Triathlon lists this body as Slovak Triathlon Union and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "serbian-athletics",
    "Srpski atletski savez",
    "Serbia",
    ["road-running", "track-and-field"],
    "https://sas.rs/",
    "National athletics federation supporting track and field and road running in Serbia.",
    ["https://balkanathletics.org/about-us/", "https://sas.rs/"],
    ["world-athletics"],
    ["SAS", "Serbian Athletics Federation", "Српски атлетски савез"],
  ),
  federation(
    "serbian-cycling",
    "Biciklistički savez Srbije",
    "Serbia",
    ["road-cycling", "mountain-biking"],
    "https://bss.rs/",
    "National cycling federation supporting road cycling and mountain biking in Serbia.",
    ["https://uec.ch/en/federation/cycling-federation-of-serbia/44", "https://bss.rs/"],
    ["uci"],
    ["BSS", "Cycling Federation of Serbia", "Serbian Cycling Federation"],
  ),
  federation(
    "serbian-swimming",
    "Plivački savez Srbije",
    "Serbia",
    swimming,
    "https://www.serbia-swim.org.rs/",
    "National federation responsible for swimming in Serbia, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.serbia-swim.org.rs/",
    ],
    ["world-aquatics"],
    ["PSS", "Serbian Swimming Federation"],
  ),
  record({
  "slug": "serbian-triathlon",
  "name": "Srpski triatlon",
  "country": "Serbia",
  "jurisdiction": "Serbia",
  "territories": [
    "Serbia"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlon.org.rs/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Serbia.",
  "sources": [
    "https://triathlon.org/members/serbian-triathon-union",
    "https://triatlon.org.rs/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "ST",
    "Serbia Triathlon",
    "Serbian Triathlon Union"
  ],
  "detail": "World Triathlon lists this body as Serbia Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "bulgarian-athletics",
    "Bulgarian Athletics Federation",
    "Bulgaria",
    ["road-running", "track-and-field"],
    "https://bfla.org/",
    "National athletics federation supporting track and field and road running in Bulgaria.",
    ["https://balkanathletics.org/about-us/", "https://bfla.org/"],
    ["world-athletics"],
    ["BFLA", "Българска федерация по лека атлетика"],
  ),
  federation(
    "bulgarian-cycling",
    "Bulgarian Cycling Federation",
    "Bulgaria",
    cycling,
    "https://bgcf.bg/",
    "National cycling federation supporting road, track, mountain biking and BMX in Bulgaria.",
    ["https://uec.ch/en/federation/bulgarian-cycling-union/10", "https://bgcf.bg/"],
    ["uci"],
    ["BCF", "Българска федерация колоездене", "БФК"],
  ),
  federation(
    "bulgarian-swimming",
    "Bulgarian Swimming Federation",
    "Bulgaria",
    swimming,
    "https://bul-swimming.org/",
    "National federation responsible for swimming in Bulgaria, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://bul-swimming.org/"],
    ["world-aquatics"],
    ["BFPS", "Българска федерация плувни спортове"],
  ),
  record({
  "slug": "bulgarian-triathlon",
  "name": "Bulgarian Triathlon Association",
  "country": "Bulgaria",
  "jurisdiction": "Bulgaria",
  "territories": [
    "Bulgaria"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://bat.triathlon.bg/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Bulgaria.",
  "sources": [
    "https://triathlon.org/members/bulgarian-triathlon-federation",
    "https://bat.triathlon.bg/",
    "https://bat.triathlon.bg/wp-content/uploads/2024/04/pravila-za-provezhdane-na-darzhvani-parvenstva-bat.pdf",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "BAT",
    "Българска асоциация по триатлон",
    "БАТ"
  ],
  "detail": "World Triathlon lists this body as Bulgarian Triathlon Association and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "icelandic-athletics",
    "Frjálsíþróttasamband Íslands",
    "Iceland",
    ["road-running", "track-and-field"],
    "https://fri.is/",
    "National athletics federation supporting track and field and road running in Iceland.",
    ["https://fri.is/"],
    ["world-athletics"],
    [
      "FRÍ",
      "Icelandic Athletics Federation",
      "Icelandic Athletic Federation",
      "Frjalsithrottasamband Islands",
    ],
  ),
  federation(
    "icelandic-cycling",
    "Hjólreiðasamband Íslands",
    "Iceland",
    ["road-cycling", "mountain-biking"],
    "https://hri.is/",
    "National cycling federation supporting road cycling and mountain biking in Iceland.",
    [
      "https://uec.ch/en/federation/iceland-cycling-federation/24",
      "https://hri.is/",
      "https://hri.is/vidburdir",
    ],
    ["uci"],
    [
      "HRÍ",
      "Icelandic Cycling Association",
      "Icelandic Cycling Federation",
      "Hjolreidasamband Islands",
    ],
  ),
  federation(
    "icelandic-swimming",
    "Sundsamband Íslands",
    "Iceland",
    swimming,
    "https://www.sundsamband.is/",
    "National federation responsible for swimming in Iceland, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.sundsamband.is/"],
    ["world-aquatics"],
    ["SSÍ", "Icelandic Swimming Association"],
  ),
  record({
  "slug": "icelandic-triathlon",
  "name": "Þríþrautarsamband Íslands",
  "country": "Iceland",
  "jurisdiction": "Iceland",
  "territories": [
    "Iceland"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.is/",
  "summary": "National federation for triathlon in Iceland, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/icelandic-triathlon-committee",
    "https://triathlon.is/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "ÞRÍ",
    "Icelandic Triathlon Federation",
    "Thrithrautarsamband Islands"
  ],
  "detail": "World Triathlon lists this body as Icelandic Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "luxembourg-athletics",
    "Fédération Luxembourgeoise d’Athlétisme",
    "Luxembourg",
    ["road-running", "track-and-field"],
    "https://www.fla.lu/",
    "National athletics federation supporting track and field and road running in Luxembourg.",
    [
      "https://teamletzebuerg.lu/federation/federation-luxembourgeoise-dathletisme-fla/",
      "https://www.fla.lu/",
    ],
    ["world-athletics"],
    ["FLA", "Luxembourg Athletics Federation"],
  ),
  federation(
    "luxembourg-cycling",
    "Fédération du Sport Cycliste Luxembourgeois",
    "Luxembourg",
    ["road-cycling", "mountain-biking", "track-cycling"],
    "https://www.fscl.lu/",
    "National cycling federation supporting road cycling, mountain biking and track cycling in Luxembourg.",
    [
      "https://uec.ch/en/federation/luxembourgish-cycling-federation/31",
      "https://www.fscl.lu/",
      "https://www.fscl.lu/actualite/championnats-du-monde-piste-juniors-uci/",
    ],
    ["uci"],
    ["FSCL", "Luxembourg Cycling Federation"],
  ),
  federation(
    "luxembourg-swimming",
    "Fédération Luxembourgeoise de Natation et de Sauvetage",
    "Luxembourg",
    swimming,
    "https://www.flns.lu/",
    "National federation responsible for swimming in Luxembourg, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.flns.lu/"],
    ["world-aquatics"],
    ["FLNS", "Luxembourg Swimming and Lifesaving Federation"],
  ),
  record({
  "slug": "luxembourg-triathlon",
  "name": "Fédération Luxembourgeoise de Triathlon",
  "country": "Luxembourg",
  "jurisdiction": "Luxembourg",
  "territories": [
    "Luxembourg"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://www.fltri.lu/",
  "summary": "National federation for triathlon and related multisport, including duathlon, in Luxembourg.",
  "sources": [
    "https://triathlon.org/members/federation-luxembourgeoise-de-triathlon",
    "https://www.fltri.lu/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FLTRI",
    "Luxembourg Triathlon Federation",
    "Federation Luxembourgeoise de Triathlon"
  ],
  "detail": "World Triathlon lists this body as Federation Luxembourgeoise de Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "israeli-athletics",
    "Israel Athletics Association",
    "Israel",
    ["road-running", "track-and-field"],
    "https://www.iaa.co.il/",
    "National athletics federation supporting track and field and road running in Israel.",
    ["https://www.iaa.co.il/about-us/", "https://www.iaa.co.il/"],
    ["world-athletics"],
    ["IAA", "Israeli Athletics Association", "איגוד האתלטיקה בישראל"],
  ),
  federation(
    "israeli-cycling",
    "Israel Cycling Federation",
    "Israel",
    ["road-cycling", "mountain-biking", "track-cycling"],
    "https://israelcycling.org.il/",
    "National cycling federation supporting road cycling, mountain biking and track cycling in Israel.",
    ["https://uec.ch/en/federation/israel-cycling-federation/25", "https://israelcycling.org.il/"],
    ["uci"],
    ["ICF", "Israeli Cycling Federation", "איגוד האופניים בישראל"],
  ),
  federation(
    "israeli-swimming",
    "Israel Swimming Association",
    "Israel",
    swimming,
    "https://isr.org.il/",
    "National federation responsible for swimming in Israel, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://isr.org.il/"],
    ["world-aquatics"],
    ["ISA", "Israeli Swimming Association", "איגוד השחייה בישראל"],
  ),
  record({
  "slug": "israeli-triathlon",
  "name": "Israeli Triathlon Association",
  "country": "Israel",
  "jurisdiction": "Israel",
  "territories": [
    "Israel"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://www.triathlon.org.il/",
  "summary": "National federation for triathlon in Israel, recognised by World Triathlon.",
  "sources": [
    "https://triathlon.org/members/israeli-triathlon-association",
    "https://www.triathlon.org.il/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "ITA",
    "Israel Triathlon Association",
    "איגוד הטריאתלון הישראלי"
  ],
  "detail": "World Triathlon lists this body as Israeli Triathlon Association and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),

  federation(
    "jamaican-athletics",
    "Jamaica Athletics Administrative Association",
    "Jamaica",
    ["road-running", "track-and-field"],
    "https://athleticsja.org/",
    "National athletics federation supporting track and field and road running in Jamaica.",
    [
      "https://nacacathletics.org/nacac-members/",
      "https://athleticsja.org/",
      "https://athleticsja.org/events-category/road-running/",
    ],
    ["world-athletics"],
    ["JAAA", "Athletics Jamaica"],
    "2026-10-23",
  ),
  federation(
    "jamaican-cycling",
    "Jamaica Cycling Federation",
    "Jamaica",
    ["road-cycling", "track-cycling"],
    "https://jamaicacycling.com/",
    "National cycling federation supporting road cycling and track cycling in Jamaica.",
    [
      "https://www.copaci.org/en/nf-members/",
      "https://jamaicacycling.com/",
      "https://jamaicacycling.com/about/",
    ],
    ["uci"],
    ["JCF", "Jamaican Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "jamaican-swimming",
    "Aquatic Sports Association of Jamaica",
    "Jamaica",
    ["swimming"],
    "https://www.asaj.com.jm/",
    "National federation responsible for swimming in Jamaica, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.asaj.com.jm/",
      "https://asaj.com.jm/about",
    ],
    ["world-aquatics"],
    ["ASAJ", "Jamaica Swimming", "Jamaican Aquatics"],
    "2026-10-23",
  ),
  record({
  "slug": "jamaican-triathlon",
  "name": "Jamaica Triathlon Association",
  "country": "Jamaica",
  "jurisdiction": "Jamaica",
  "territories": [
    "Jamaica"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/jamaican-triathlon-federation",
  "summary": "National federation for triathlon in Jamaica.",
  "sources": [
    "https://triathlon.org/members/jamaican-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "JTA",
    "Jamaican Triathlon"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Jamaica’s World Triathlon member profile, which lists the association and its social channel. World Triathlon lists this body as Jamaica Triathlon Association and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "barbadian-athletics",
    "Athletics Association of Barbados Inc.",
    "Barbados",
    ["track-and-field"],
    "https://aab.sports.bb/",
    "National athletics federation supporting track and field in Barbados.",
    ["https://nacacathletics.org/nacac-members/", "https://aab.sports.bb/"],
    ["world-athletics"],
    ["AAB", "Athletic Association of Barbados", "Barbados Athletics"],
    "2026-10-23",
  ),
  {
    ...federation(
      "barbadian-cycling",
      "Barbados Cycling Union",
      "Barbados",
      ["road-cycling"],
      "https://olympic.org.bb/barbados-cycling-union-2/",
      "National cycling federation supporting road cycling in Barbados.",
      [
        "https://www.copaci.org/en/nf-members/",
        "https://olympic.org.bb/barbados-cycling-union-2/",
        "https://tbps.gov.bb/news/traffic-management-the-barbados-cycle-union-2026-06-05/",
      ],
      ["uci"],
      ["BCU", "Barbadian Cycling"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Barbados Olympic Association’s current Cycling Union profile and contact information.",
  },
  {
    ...federation(
      "barbadian-swimming",
      "Barbados Aquatic Sports Association",
      "Barbados",
      ["swimming"],
      "https://www.worldaquatics.com/members/national-federations",
      "National federation responsible for swimming in Barbados, recognised by World Aquatics.",
      ["https://www.worldaquatics.com/members/national-federations"],
      ["world-aquatics"],
      ["BASA", "Barbados Swimming", "Swim Barbados"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens World Aquatics’ national-federation directory. Find Barbados for the association’s entry and contact information.",
  },
  record({
  "slug": "barbadian-triathlon",
  "name": "Barbados Federation of Island Triathletes",
  "country": "Barbados",
  "jurisdiction": "Barbados",
  "territories": [
    "Barbados"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triathlonbarbados.com/",
  "summary": "National federation for triathlon and duathlon in Barbados.",
  "sources": [
    "https://triathlon.org/members/barbados-federation-of-island-triathletes",
    "https://triathlonbarbados.com/",
    "https://triathlonbarbados.com/services/duathlon-championships/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "BFIT",
    "Barbados Triathlon"
  ],
  "detail": "World Triathlon lists this body as Barbados Federation of Island Triathletes and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  {
    ...federation(
      "bahamian-athletics",
      "Bahamas Association of Athletic Associations",
      "Bahamas",
      ["track-and-field"],
      "https://www.bahamasolympiccommittee.org/sports",
      "National athletics federation supporting track and field in Bahamas.",
      [
        "https://nacacathletics.org/nacac-members/",
        "https://www.bahamasolympiccommittee.org/sports",
      ],
      ["world-athletics"],
      ["BAAA", "Bahamas Athletics", "Bahamian Athletics"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Bahamas Olympic Committee’s sports directory. Its Athletics entry identifies the BAAA and federation contacts.",
  },
  {
    ...federation(
      "bahamian-cycling",
      "Bahamas Cycling Federation",
      "Bahamas",
      ["road-cycling"],
      "https://www.bahamasolympiccommittee.org/sports",
      "National cycling federation supporting road cycling in Bahamas.",
      [
        "https://www.copaci.org/en/nf-members/",
        "https://www.bahamasolympiccommittee.org/sports",
        "https://www.tribune242.com/news/2026/jun/02/cycling-federation-nationals-returns-to-exuma/",
      ],
      ["uci"],
      ["BCF", "Bahamian Cycling"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Bahamas Olympic Committee’s sports directory. Its Cycling entry identifies the federation and links to its social channel.",
  },
  federation(
    "bahamian-swimming",
    "Bahamas Aquatics Federation",
    "Bahamas",
    ["swimming"],
    "https://www.bahamasaquatics.com/",
    "National federation responsible for swimming in Bahamas, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.bahamasaquatics.com/",
      "https://www.bahamasolympiccommittee.org/sports",
    ],
    ["world-aquatics"],
    ["Bahamas Aquatics", "Bahamas Aquatic Federation", "Bahamas Swimming Federation"],
    "2026-10-23",
  ),
  record({
  "slug": "bahamian-triathlon",
  "name": "Bahamas Triathlon Association",
  "country": "Bahamas",
  "jurisdiction": "Bahamas",
  "territories": [
    "Bahamas"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://www.bahamastriathlon.org/",
  "summary": "National federation for triathlon in Bahamas.",
  "sources": [
    "https://triathlon.org/members/bahamas-triathlon",
    "https://www.bahamastriathlon.org/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "BTA",
    "Bahamian Triathlon"
  ],
  "detail": "World Triathlon lists this body as Bahamas Triathlon Association and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "trinidad-tobago-athletics",
    "National Association of Athletics Administrations of Trinidad and Tobago",
    "Trinidad and Tobago",
    ["track-and-field"],
    "https://naaatt.org/",
    "National athletics federation supporting track and field in Trinidad and Tobago.",
    [
      "https://nacacathletics.org/nacac-members/",
      "https://naaatt.org/",
      "https://naaatt.org/association/contact/",
    ],
    ["world-athletics"],
    ["NAAATT", "NAAA", "Trinidad & Tobago Athletics"],
    "2026-10-23",
  ),
  federation(
    "trinidad-tobago-cycling",
    "Trinidad and Tobago Cycling Federation",
    "Trinidad and Tobago",
    ["road-cycling", "mountain-biking", "track-cycling"],
    "https://ttcyclingfederation.org/",
    "National cycling federation supporting road cycling, mountain biking and track cycling in Trinidad and Tobago.",
    [
      "https://www.copaci.org/en/nf-members/",
      "https://ttcyclingfederation.org/",
      "https://ttcyclingfederation.org/about-us/",
    ],
    ["uci"],
    ["TTCF", "Trinidad & Tobago Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "trinidad-tobago-swimming",
    "Aquatics Sports Association of Trinidad and Tobago",
    "Trinidad and Tobago",
    ["swimming"],
    "https://ttaquatics.com/",
    "National federation responsible for swimming in Trinidad and Tobago, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://ttaquatics.com/",
      "https://ttaquatics.com/about",
    ],
    ["world-aquatics"],
    ["ASATT", "Trinidad & Tobago Swimming", "Aquatic Sports Association of Trinidad & Tobago"],
    "2026-10-23",
  ),
  record({
  "slug": "trinidad-tobago-triathlon",
  "name": "Trinidad and Tobago Triathlon Federation",
  "country": "Trinidad and Tobago",
  "jurisdiction": "Trinidad and Tobago",
  "territories": [
    "Trinidad and Tobago"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triathlon.co.tt/",
  "summary": "National federation for triathlon and duathlon in Trinidad and Tobago.",
  "sources": [
    "https://triathlon.org/members/trinidad-tobago-triathlon-association",
    "https://triathlon.co.tt/",
    "https://triathlon.co.tt/events",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "TTTF",
    "Trinidad & Tobago Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Trinidad & Tobago Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "cypriot-athletics",
    "Cyprus Amateur Athletic Association",
    "Cyprus",
    ["road-running", "track-and-field"],
    "https://koeas.org.cy/",
    "National athletics federation supporting track and field and road running in Cyprus.",
    ["https://balkanathletics.org/about-us/", "https://koeas.org.cy/"],
    ["world-athletics"],
    [
      "KOEAS",
      "CAAA",
      "Κυπριακή Ομοσπονδία Ερασιτεχνικού Αθλητισμού Στίβου",
      "ΚΟΕΑΣ",
      "The Amateur Athletic Association of Cyprus",
    ],
    "2026-10-23",
  ),
  federation(
    "cypriot-cycling",
    "Cyprus Cycling Federation",
    "Cyprus",
    ["road-cycling", "mountain-biking"],
    "https://www.cypruscycling.org/",
    "National cycling federation supporting road cycling and mountain biking in Cyprus.",
    [
      "https://uec.ch/en/federation/cyprus-cycling-federation/11",
      "https://www.cypruscycling.org/",
      "https://www.cypruscycling.org/articles/announcements-of-matches",
    ],
    ["uci"],
    ["CCF", "KOPO", "Κυπριακή Ομοσπονδία Ποδηλασίας"],
    "2026-10-23",
  ),
  federation(
    "cypriot-swimming",
    "Cyprus Swimming Federation",
    "Cyprus",
    ["swimming"],
    "https://koek.org.cy/",
    "National federation responsible for swimming in Cyprus, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://koek.org.cy/"],
    ["world-aquatics"],
    ["KOEK", "Κυπριακή Ομοσπονδία Κολύμβησης"],
    "2026-10-23",
  ),
  record({
  "slug": "cypriot-triathlon",
  "name": "Cyprus Triathlon Federation",
  "country": "Cyprus",
  "jurisdiction": "Cyprus",
  "territories": [
    "Cyprus"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://cytrifed.org/",
  "summary": "National federation for triathlon and duathlon in Cyprus.",
  "sources": [
    "https://triathlon.org/members/cyprus-triathlon-federation",
    "https://cytrifed.org/",
    "https://cytrifed.org/about-us/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "CTF",
    "Cypriot Triathlon"
  ],
  "detail": "World Triathlon lists this body as Cyprus Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "maltese-athletics",
    "Athletics Malta",
    "Malta",
    ["road-running", "track-and-field"],
    "https://athleticsmalta.com/",
    "National athletics federation supporting track and field and road running in Malta.",
    ["https://sportmalta.mt/portfolio/athletics/", "https://athleticsmalta.com/"],
    ["world-athletics"],
    ["Malta Amateur Athletic Association", "MAAA", "Maltese Athletics"],
    "2026-10-23",
  ),
  {
    ...federation(
      "maltese-cycling",
      "Malta Cycling Federation",
      "Malta",
      ["road-cycling"],
      "https://nocmalta.org/associations/cycling/",
      "National cycling federation supporting road cycling in Malta.",
      [
        "https://uec.ch/en/federation/maltese-cycling-federation/33",
        "https://nocmalta.org/associations/cycling/",
        "https://www.uci.org/competition-details/2026/ROA/79850",
      ],
      ["uci"],
      ["MCF", "Maltese Cycling Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Maltese Olympic Committee’s Cycling Federation profile and contact information.",
  },
  federation(
    "maltese-swimming",
    "Aquatic Sports Association of Malta",
    "Malta",
    ["swimming"],
    "https://asaofmalta.eu/",
    "National federation responsible for swimming in Malta, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://asaofmalta.eu/"],
    ["world-aquatics"],
    ["ASA Malta", "Malta Swimming", "Maltese Aquatics"],
    "2026-10-23",
  ),
  record({
  "slug": "maltese-triathlon",
  "name": "Malta Triathlon Federation",
  "country": "Malta",
  "jurisdiction": "Malta",
  "territories": [
    "Malta"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triathlonmalta.org/",
  "summary": "National federation for triathlon and duathlon in Malta.",
  "sources": [
    "https://triathlon.org/members/malta-triathlon-federation",
    "https://triathlonmalta.org/",
    "https://triathlonmalta.org/hall-of-fame/",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "MTF",
    "Maltese Triathlon"
  ],
  "detail": "World Triathlon lists this body as Malta Triathlon Federation and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "mauritian-athletics",
    "Mauritius Athletics Association",
    "Mauritius",
    ["road-running", "track-and-field"],
    "https://mauritiusathletics.org/",
    "National athletics federation supporting track and field and road running in Mauritius.",
    ["https://mauritiusathletics.org/"],
    ["world-athletics"],
    ["MAA", "Mauritius Athletic Association", "Mauritian Athletics"],
    "2026-10-23",
  ),
  {
    ...federation(
      "mauritian-cycling",
      "Fédération Mauricienne de Cyclisme",
      "Mauritius",
      ["road-cycling", "mountain-biking"],
      "https://fr.uci.org/afrique-confederation-continentales-federations-nationales/52DfWCi6lPxLk3dfvEIhyc",
      "National cycling federation supporting road cycling and mountain biking in Mauritius.",
      [
        "https://fr.uci.org/afrique-confederation-continentales-federations-nationales/52DfWCi6lPxLk3dfvEIhyc",
        "https://www.uci.org/competition-details/2025/ROA/76078",
        "https://fr.uci.org/competition-details/2027/MTB/80296",
      ],
      ["uci"],
      ["FMC", "Mauritius Cycling Federation", "Mauritian Cycling Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the UCI’s African national-federation directory. Find Mauritius for the federation’s entry and contact information.",
  },
  federation(
    "mauritian-swimming",
    "Mauritius Swimming Federation",
    "Mauritius",
    ["swimming"],
    "https://mauritiusaquatics.org/",
    "National federation responsible for swimming in Mauritius, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://mauritiusaquatics.org/",
      "https://mauritiusaquatics.org/about/",
    ],
    ["world-aquatics"],
    ["MSF", "Fédération Mauricienne de Natation", "FMN", "Mauritius Aquatics"],
    "2026-10-23",
  ),
  federation(
    "mauritian-triathlon",
    "Fédération Mauricienne de Triathlon",
    "Mauritius",
    ["triathlon", "duathlon"],
    "https://fmtri.mu/",
    "National federation for triathlon and duathlon in Mauritius.",
    ["https://triathlon.org/members/mauritius-triathlon-federation", "https://fmtri.mu/", "https://africa.triathlon.org/national-federations"],
    ["world-triathlon"],
    ["FMTri", "Mauritius Triathlon Federation", "Mauritian Triathlon"],
    "2026-10-23",
  ),
  federation(
    "uruguayan-athletics",
    "Confederación Atlética del Uruguay",
    "Uruguay",
    ["road-running", "track-and-field"],
    "https://confederacionatletica.org/",
    "National athletics federation supporting track and field and road running in Uruguay.",
    [
      "https://cou.org.uy/federacion/confederacion-atletica-del-uruguay/",
      "https://confederacionatletica.org/",
    ],
    ["world-athletics"],
    ["CAU", "Uruguayan Athletics Confederation", "Uruguay Athletics"],
    "2026-10-23",
  ),
  federation(
    "uruguayan-cycling",
    "Federación Ciclista Uruguaya",
    "Uruguay",
    ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    "https://federacionciclista.com.uy/",
    "National cycling federation supporting road cycling, mountain biking, track cycling and BMX in Uruguay.",
    [
      "https://www.copaci.org/en/nf-members/",
      "https://federacionciclista.com.uy/",
      "https://www.federacionciclista.com.uy/tramites/tramite.php?id=8",
    ],
    ["uci"],
    ["FCU", "Uruguayan Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "uruguayan-swimming",
    "Federación Uruguaya de Natación",
    "Uruguay",
    ["swimming"],
    "https://fun.org.uy/",
    "National federation responsible for swimming in Uruguay, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://fun.org.uy/"],
    ["world-aquatics"],
    ["FUN", "Uruguayan Swimming Federation"],
    "2026-10-23",
  ),
  record({
  "slug": "uruguayan-triathlon",
  "name": "Unión de Triatlón del Uruguay",
  "country": "Uruguay",
  "jurisdiction": "Uruguay",
  "territories": [
    "Uruguay"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/uruguay-triathlon-federation",
  "summary": "National federation for triathlon in Uruguay.",
  "sources": [
    "https://triathlon.org/members/uruguay-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "UTU",
    "UTriU",
    "Uruguay Triathlon Union",
    "Unión de Triathlon del Uruguay",
    "Union de Triatlón del Uruguay"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Uruguay’s World Triathlon member profile. The older standalone address currently presents a different amateur organisation, so this directory links to the national federation’s member profile. World Triathlon lists this body as Union de Triatlón del Uruguay and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),

  federation(
    "bolivian-athletics",
    "Federación Atlética de Bolivia",
    "Bolivia",
    ["track-and-field"],
    "https://www.atlebolivia.net/",
    "National athletics federation supporting track and field in Bolivia.",
    ["https://atletismosudamericano.com/federaciones/", "https://www.atlebolivia.net/"],
    ["world-athletics"],
    ["FAB", "Federación Atlética Boliviana", "Bolivian Athletics Federation"],
    "2026-10-23",
  ),
  {
    ...federation(
      "bolivian-cycling",
      "Federación Boliviana de Ciclismo",
      "Bolivia",
      ["road-cycling"],
      "https://comiteolimpicoboliviano.org.bo/federaciones/",
      "National cycling federation supporting road cycling in Bolivia.",
      [
        "https://www.copaci.org/en/nf-members/",
        "https://comiteolimpicoboliviano.org.bo/federaciones/",
        "https://www.copaci.org/tarija-gano-el-nacional-de-ciclismo-de-ruta-de-bolivia/",
      ],
      ["uci"],
      ["FBC", "Bolivian Cycling Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Bolivian Olympic Committee’s federation directory. Find Ciclismo for the national body and its contacts.",
  },
  {
    ...federation(
      "bolivian-swimming",
      "Federación Boliviana de Natación",
      "Bolivia",
      ["swimming"],
      "https://www.worldaquatics.com/members/national-federations",
      "National federation responsible for swimming in Bolivia, recognised by World Aquatics.",
      [
        "https://www.worldaquatics.com/members/national-federations",
        "https://comiteolimpicoboliviano.org.bo/federaciones/",
      ],
      ["world-aquatics"],
      ["FEBONA", "Federación Boliviana de Deportes Acuáticos", "Bolivian Swimming Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens World Aquatics’ national-federation directory. Find Bolivia for the swimming federation’s entry. Its older standalone website now redirects to a social page.",
  },
  record({
  "slug": "bolivian-triathlon",
  "name": "Federación Boliviana de Triatlón",
  "country": "Bolivia",
  "jurisdiction": "Bolivia",
  "territories": [
    "Bolivia"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/bolivian-triathlon-federation",
  "summary": "National federation for triathlon in Bolivia.",
  "sources": [
    "https://triathlon.org/members/bolivian-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Bolivian Triathlon Federation",
    "Bolivia Triathlon"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Bolivia’s World Triathlon member profile and federation contact information. World Triathlon lists this body as Federación Boliviana de Triatlón and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "costa-rican-athletics",
    "Federación Costarricense de Atletismo",
    "Costa Rica",
    ["road-running", "track-and-field"],
    "https://www.fecoa.org/",
    "National athletics federation supporting track and field and road running in Costa Rica.",
    ["https://nacacathletics.org/nacac-members/", "https://www.fecoa.org/"],
    ["world-athletics"],
    ["FECOA", "Costa Rican Athletics Federation"],
    "2026-10-23",
  ),
  federation(
    "costa-rican-cycling",
    "Federación Costarricense de Ciclismo",
    "Costa Rica",
    ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    "https://fecoci.net/",
    "National cycling federation supporting road cycling, mountain biking, track cycling and BMX in Costa Rica.",
    ["https://www.copaci.org/en/nf-members/", "https://fecoci.net/"],
    ["uci"],
    ["FECOCI", "Costa Rican Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "costa-rican-swimming",
    "Federación Costarricense de Deportes Acuáticos",
    "Costa Rica",
    ["swimming"],
    "https://fecodacrc.org/",
    "National federation responsible for swimming in Costa Rica, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://fecodacrc.org/"],
    ["world-aquatics"],
    ["FECODA", "Costa Rican Swimming Federation", "Costa Rica Aquatics"],
    "2026-10-23",
  ),
  record({
  "slug": "costa-rican-triathlon",
  "name": "Federación Unida de Triatlón",
  "country": "Costa Rica",
  "jurisdiction": "Costa Rica",
  "territories": [
    "Costa Rica"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://feutri.org/",
  "summary": "National federation for triathlon and duathlon in Costa Rica.",
  "sources": [
    "https://triathlon.org/members/federacion-unida-de-triatlon-costa-rica",
    "https://feutri.org/",
    "https://feutri.org/tienda/afiliaciones/1-dia-licencia-para-duatlon/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FEUTRI",
    "Federación Unida de Triatlón Costa Rica",
    "Costa Rica Triathlon",
    "Federacion Unida de Triatlon Costa Rica"
  ],
  "detail": "World Triathlon lists this body as Federacion Unida de Triatlon Costa Rica and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  {
    ...federation(
      "dominican-republic-athletics",
      "Federación Dominicana de Asociaciones de Atletismo",
      "Dominican Republic",
      ["track-and-field"],
      "https://nacacathletics.org/nacac-members/",
      "National athletics federation supporting track and field in Dominican Republic.",
      [
        "https://nacacathletics.org/nacac-members/",
        "https://colimdo.org/noticias/federacion-dominicana-de-asociaciones-de-atletismo-entregan-incentivos-a-sus-atletas-medallistas/",
      ],
      ["world-athletics"],
      ["FDAA", "FEDOMATLE", "Dominican Republic Athletics Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens NACAC’s member directory. Find Dominican Republic for the national athletics federation and its contacts.",
  },
  {
    ...federation(
      "dominican-republic-cycling",
      "Federación Dominicana de Ciclismo",
      "Dominican Republic",
      ["road-cycling"],
      "https://www.copaci.org/en/nf-members/",
      "National cycling federation supporting road cycling in Dominican Republic.",
      [
        "https://www.copaci.org/en/nf-members/",
        "https://colimdo.org/noticias/fedoci-da-a-conocer-las-seis-etapas-vuelta-ciclista-internacional/",
      ],
      ["uci"],
      ["FEDOCI", "Dominican Republic Cycling Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens COPACI’s national-federation directory. Find Dominican Republic for the federation’s entry and contact information.",
  },
  federation(
    "dominican-republic-swimming",
    "Federación Dominicana de Deportes Acuáticos RD",
    "Dominican Republic",
    ["swimming"],
    "https://feddard.org/",
    "National federation responsible for swimming in Dominican Republic, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://feddard.org/",
      "https://colimdo.org/noticias/la-fedona-cambia-de-nombre-y-logo-es-ahora-fedda/",
    ],
    ["world-aquatics"],
    [
      "FEDDA",
      "FEDONA",
      "Federación Dominicana de Natación",
      "Dominican Republic Swimming Federation",
    ],
    "2026-10-23",
  ),
  record({
  "slug": "dominican-republic-triathlon",
  "name": "Federación Dominicana de Triatlón",
  "country": "Dominican Republic",
  "jurisdiction": "Dominican Republic",
  "territories": [
    "Dominican Republic"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/federacion-dominicana-de-triathlon",
  "summary": "National federation for triathlon in Dominican Republic.",
  "sources": [
    "https://triathlon.org/members/federacion-dominicana-de-triathlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FEDOTRI",
    "Dominican Republic Triathlon Federation"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens the Dominican Republic’s World Triathlon member profile and federation contact information. World Triathlon lists this body as Federación Dominicana de Triatlón and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "ecuadorian-athletics",
    "Federación Ecuatoriana de Atletismo",
    "Ecuador",
    ["track-and-field"],
    "https://www.featle.org.ec/",
    "National athletics federation supporting track and field in Ecuador.",
    ["https://www.featle.org.ec/"],
    ["world-athletics"],
    ["FEA", "Ecuadorian Athletics Federation"],
    "2026-10-23",
  ),
  federation(
    "ecuadorian-cycling",
    "Federación Ecuatoriana de Ciclismo",
    "Ecuador",
    ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    "https://www.fec.ec/",
    "National cycling federation supporting road cycling, mountain biking, track cycling and BMX in Ecuador.",
    [
      "https://www.copaci.org/en/nf-members/",
      "https://www.fec.ec/",
      "https://fec.ec/reglamentos.html",
    ],
    ["uci"],
    ["FEC", "Ecuadorian Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "ecuadorian-swimming",
    "Federación Ecuatoriana de Natación",
    "Ecuador",
    ["swimming"],
    "https://fena-ecuador.org/",
    "National federation responsible for swimming in Ecuador, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://fena-ecuador.org/"],
    ["world-aquatics"],
    ["FENA", "Ecuadorian Swimming Federation"],
    "2026-10-23",
  ),
  record({
  "slug": "ecuadorian-triathlon",
  "name": "Federación Ecuatoriana de Triatlón",
  "country": "Ecuador",
  "jurisdiction": "Ecuador",
  "territories": [
    "Ecuador"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://triathlon.org/members/federacion-ecuatoriana-de-triatlon",
  "summary": "National federation for triathlon in Ecuador.",
  "sources": [
    "https://triathlon.org/members/federacion-ecuatoriana-de-triatlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "TRIFED",
    "Ecuadorian Triathlon Federation"
  ],
  "websiteKind": "member-directory",
  "detail": "The official link opens Ecuador’s World Triathlon member profile. The standalone address listed there could not be accessed during this review. World Triathlon lists this body as Federación Ecuatoriana de Triatlón and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "guatemalan-athletics",
    "Federación Deportiva Nacional de Atletismo de Guatemala",
    "Guatemala",
    ["track-and-field"],
    "https://fdna.gt/",
    "National athletics federation supporting track and field in Guatemala.",
    ["https://nacacathletics.org/nacac-members/", "https://fdna.gt/"],
    ["world-athletics"],
    ["FDNA", "Federación Nacional de Atletismo de Guatemala", "Guatemalan Athletics Federation"],
    "2026-10-23",
  ),
  federation(
    "guatemalan-cycling",
    "Federación Guatemalteca de Ciclismo",
    "Guatemala",
    ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    "https://fedeciclismogua.org/",
    "National cycling federation supporting road cycling, mountain biking, track cycling and BMX in Guatemala.",
    ["https://www.copaci.org/en/nf-members/", "https://fedeciclismogua.org/"],
    ["uci"],
    ["FGC", "Federación Nacional de Ciclismo de Guatemala", "Guatemalan Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "guatemalan-swimming",
    "Federación Nacional de Natación, Clavados, Polo Acuático y Nado Sincronizado de Guatemala",
    "Guatemala",
    ["swimming"],
    "https://fenadegua.gt/",
    "National federation responsible for swimming in Guatemala, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://fenadegua.gt/",
      "https://cdag.com.gt/deportes/federaciones/federacion-nacional-de-natacion-clavados-polo-acuatico-y-nado-sincronizado-de-guatemala/",
    ],
    ["world-aquatics"],
    ["FENADEGUA", "Guatemalan Swimming Federation", "Guatemala Swimming"],
    "2026-10-23",
  ),
  record({
  "slug": "guatemalan-triathlon",
  "name": "Federación Deportiva Nacional de Triatlón de Guatemala",
  "country": "Guatemala",
  "jurisdiction": "Guatemala",
  "territories": [
    "Guatemala"
  ],
  "type": "national",
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "website": "https://triatlon.gt/",
  "summary": "National federation for triathlon and duathlon in Guatemala.",
  "sources": [
    "https://triathlon.org/members/federacion-nacional-de-triatlon-de-guatemala",
    "https://triatlon.gt/",
    "https://app.triatlon.gt/events/duatlon-nueva-santa-rosa-2026",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "Guatemalan Triathlon Federation",
    "Guatemala Triathlon",
    "Federación deportiva nacional de Triatlón Guatemala"
  ],
  "detail": "World Triathlon lists this body as Federación deportiva nacional de Triatlón Guatemala and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  {
    ...federation(
      "panamanian-athletics",
      "Federación Panameña de Atletismo",
      "Panama",
      ["track-and-field"],
      "https://copanama.com/federaciones/",
      "National athletics federation supporting track and field in Panama.",
      ["https://atletismosudamericano.com/federaciones/", "https://copanama.com/federaciones/"],
      ["world-athletics"],
      ["FEPAT", "Panamanian Athletics Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Panamanian Olympic Committee’s federation directory. Find Atletismo for the national federation and its contact information.",
  },
  {
    ...federation(
      "panamanian-cycling",
      "Federación Panameña de Ciclismo",
      "Panama",
      ["road-cycling"],
      "https://copanama.com/federaciones/",
      "National cycling federation supporting road cycling in Panama.",
      [
        "https://www.copaci.org/en/nf-members/",
        "https://copanama.com/federaciones/",
        "https://www.uci.org/competition-details/2026/ROA/78953",
      ],
      ["uci"],
      ["FEPACI", "Panamanian Cycling Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Panamanian Olympic Committee’s federation directory. Find Ciclismo for the national federation and its contact information.",
  },
  federation(
    "panamanian-swimming",
    "Federación Panameña de Natación",
    "Panama",
    ["swimming"],
    "https://www.fpnpty.com/",
    "National federation responsible for swimming in Panama, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://www.fpnpty.com/"],
    ["world-aquatics"],
    ["FPN", "Panama Swimming Federation", "Panamanian Swimming Federation"],
    "2026-10-23",
  ),
  record({
  "slug": "panamanian-triathlon",
  "name": "Unión de Triatlón de Panamá",
  "country": "Panama",
  "jurisdiction": "Panama",
  "territories": [
    "Panama"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://www.triathlonpanama.com/",
  "summary": "National federation for triathlon in Panama.",
  "sources": [
    "https://triathlon.org/members/union-de-triatlon-de-panama",
    "https://www.triathlonpanama.com/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "UTP",
    "Panama Triathlon Union",
    "Union de Triatlon de Panama"
  ],
  "detail": "World Triathlon lists this body as Unión de Triatlón de Panamá and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "paraguayan-athletics",
    "Federación Paraguaya de Atletismo",
    "Paraguay",
    ["road-running", "track-and-field"],
    "https://www.fpa.org.py/",
    "National athletics federation supporting track and field and road running in Paraguay.",
    ["https://atletismosudamericano.com/federaciones/", "https://www.fpa.org.py/"],
    ["world-athletics"],
    ["FPA", "Paraguayan Athletics Federation"],
    "2026-10-23",
  ),
  {
    ...federation(
      "paraguayan-cycling",
      "Federación Paraguaya de Ciclismo",
      "Paraguay",
      ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
      "https://www.copaci.org/en/nf-members/",
      "National cycling federation supporting road cycling, mountain biking, track cycling and BMX in Paraguay.",
      [
        "https://www.copaci.org/en/nf-members/",
        "https://sites.google.com/view/fpc-paraguay/inicio/instituci%C3%B3n",
        "https://www.snd.gov.py/federaciones/federacion-paraguaya-de-ciclismo/",
      ],
      ["uci"],
      ["FPC", "Paraguayan Cycling Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens COPACI’s national-federation directory. Find Paraguay for the federation’s entry and contacts; its standalone domain was unavailable during this review.",
  },
  federation(
    "paraguayan-swimming",
    "Federación Paraguaya de Deportes Acuáticos",
    "Paraguay",
    ["swimming"],
    "https://fepada.org/",
    "National federation responsible for swimming in Paraguay, recognised by World Aquatics.",
    ["https://www.worldaquatics.com/members/national-federations", "https://fepada.org/"],
    ["world-aquatics"],
    ["FEPADA", "FEPANA", "Federación Paraguaya de Natación", "Paraguayan Swimming Federation"],
    "2026-10-23",
  ),
  record({
  "slug": "paraguayan-triathlon",
  "name": "Federación Paraguaya de Triathlon",
  "country": "Paraguay",
  "jurisdiction": "Paraguay",
  "territories": [
    "Paraguay"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://fepatri.org.py/",
  "summary": "National federation for triathlon in Paraguay.",
  "sources": [
    "https://triathlon.org/members/asociacion-paraguaya-de-triathlon",
    "https://fepatri.org.py/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FEPATRI",
    "Asociación Paraguaya de Triathlon",
    "Paraguayan Triathlon Federation"
  ],
  "detail": "World Triathlon lists this body as Federación Paraguaya de Triathlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),
  federation(
    "peruvian-athletics",
    "Federación Deportiva Peruana de Atletismo",
    "Peru",
    ["road-running", "track-and-field"],
    "https://fedepeatle.org/",
    "National athletics federation supporting track and field and road running in Peru.",
    [
      "https://atletismosudamericano.com/federaciones/",
      "https://fedepeatle.org/",
      "https://fedepeatle.org/calendario-2026/",
      "https://fedepeatle.org/wp-content/uploads/2025/12/Calendario-FDPA-2026.pdf",
    ],
    ["world-athletics"],
    ["FDPA", "Federación Peruana de Atletismo", "Peruvian Athletics Federation"],
    "2026-10-23",
  ),
  federation(
    "peruvian-cycling",
    "Federación Nacional Deportiva Peruana de Ciclismo",
    "Peru",
    ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
    "https://fedepeci.pe/",
    "National cycling federation supporting road cycling, mountain biking, track cycling and BMX in Peru.",
    ["https://www.copaci.org/en/nf-members/", "https://fedepeci.pe/"],
    ["uci"],
    ["FNDPC", "FDPC", "Federación Deportiva Peruana de Ciclismo", "Peruvian Cycling Federation"],
    "2026-10-23",
  ),
  federation(
    "peruvian-swimming",
    "Federación Deportiva Nacional de Deportes Acuáticos",
    "Peru",
    ["swimming"],
    "https://www.fdpn.org/",
    "National federation responsible for swimming in Peru, recognised by World Aquatics.",
    [
      "https://www.worldaquatics.com/members/national-federations",
      "https://www.fdpn.org/",
      "https://www.gob.pe/institucion/ipd/normas-legales/8615392-1288-2026-dinadaf-ipd",
    ],
    ["world-aquatics"],
    ["FDNDA", "FDPN", "Federación Deportiva Peruana de Natación", "Peruvian Swimming Federation"],
    "2026-10-23",
  ),
  record({
  "slug": "peruvian-triathlon",
  "name": "Federación Peruana de Triatlón",
  "country": "Peru",
  "jurisdiction": "Peru",
  "territories": [
    "Peru"
  ],
  "type": "national",
  "sports": [
    "triathlon"
  ],
  "website": "https://fedenatri.pe/",
  "summary": "National federation for triathlon in Peru.",
  "sources": [
    "https://triathlon.org/members/federacion-deportiva-nacional-de-triatlon",
    "https://fedenatri.pe/",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "aliases": [
    "FEDENATRI",
    "Federación Deportiva Nacional de Triatlón",
    "Peruvian Triathlon Federation",
    "Federacion Peruana de Triatlon"
  ],
  "detail": "World Triathlon lists this body as Federacion Peruana de Triatlon and reports affiliated status (checked 23 October 2026)."
}, "2026-10-23"),

  record({
  "slug": "chinese-triathlon",
  "name": "China Triathlon Sports Association",
  "type": "national",
  "country": "China",
  "jurisdiction": "China",
  "territories": [
    "China"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National federation for triathlon in China.",
  "website": "https://triathlon.org/members/china-triathlon-sports-association",
  "sources": [
    "https://triathlon.org/members/china-triathlon-sports-association",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "websiteKind": "member-directory"
}, "2026-10-23"),

  record(
    {
      slug: "chinese-swimming",
      name: "China Swimming Association",
      type: "national",
      country: "China",
      jurisdiction: "China",
      territories: ["China"],
      sports: ["swimming"],
      summary: "National body responsible for swimming in China, recognised by World Aquatics.",
      website: "https://www.worldaquatics.com/members/national-federations",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),

  record({
  "slug": "chinese-taipei-triathlon",
  "name": "Chinese Taipei Triathlon Association",
  "type": "national",
  "country": "Chinese Taipei",
  "jurisdiction": "Chinese Taipei",
  "territories": [
    "Chinese Taipei"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National federation for triathlon in Chinese Taipei.",
  "website": "https://triathlon.org/members/chinese-taipei-triathlon-association",
  "sources": [
    "https://triathlon.org/members/chinese-taipei-triathlon-association",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "websiteKind": "member-directory",
  "aliases": [
    "Taiwan Triathlon"
  ]
}, "2026-10-23"),

  record(
    {
      slug: "chinese-taipei-swimming",
      name: "Chinese Taipei Swimming Association",
      type: "national",
      country: "Chinese Taipei",
      jurisdiction: "Chinese Taipei",
      territories: ["Chinese Taipei"],
      sports: ["swimming"],
      summary:
        "National body responsible for swimming in Chinese Taipei, recognised by World Aquatics.",
      website: "https://www.worldaquatics.com/members/national-federations",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
      websiteKind: "member-directory",
      aliases: ["Taiwan Swimming"],
    },
    "2026-10-23",
  ),

  record({
  "slug": "nepalese-triathlon",
  "name": "Nepal Triathlon Association",
  "type": "national",
  "country": "Nepal",
  "jurisdiction": "Nepal",
  "territories": [
    "Nepal"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National federation for triathlon in Nepal.",
  "website": "https://triathlon.org/members/nepal-triathlon-association-nta",
  "sources": [
    "https://triathlon.org/members/nepal-triathlon-association-nta",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "websiteKind": "member-directory"
}, "2026-10-23"),

  record(
    {
      slug: "nepalese-swimming",
      name: "Nepal Swimming Association",
      type: "national",
      country: "Nepal",
      jurisdiction: "Nepal",
      territories: ["Nepal"],
      sports: ["swimming"],
      summary: "National body responsible for swimming in Nepal, recognised by World Aquatics.",
      website: "https://www.worldaquatics.com/members/national-federations",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),

  record({
  "slug": "vietnamese-triathlon",
  "name": "Vietnam Triathlon Federation",
  "type": "national",
  "country": "Vietnam",
  "jurisdiction": "Vietnam",
  "territories": [
    "Vietnam"
  ],
  "sports": [
    "triathlon",
    "duathlon"
  ],
  "summary": "National federation for triathlon and duathlon in Vietnam.",
  "website": "https://triathlonvietnam.org/",
  "detail": "World Triathlon links this federation domain. On 24 October 2026 its homepage presented the Tam Chúc 2026 event and sponsorship information; use the World Triathlon reference for federation details.",
  "sources": [
    "https://triathlon.org/members/vietnam-triathlon-federation",
    "https://triathlonvietnam.org/",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-24"),

  record(
    {
      slug: "vietnamese-swimming",
      name: "Vietnam Aquatic Sports Association",
      type: "national",
      country: "Vietnam",
      jurisdiction: "Vietnam",
      territories: ["Vietnam"],
      sports: ["swimming"],
      summary: "National body responsible for swimming in Vietnam, recognised by World Aquatics.",
      website: "https://www.worldaquatics.com/members/national-federations",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),

  record({
  "slug": "sri-lankan-triathlon",
  "name": "Sri Lanka Triathlon",
  "type": "national",
  "country": "Sri Lanka",
  "jurisdiction": "Sri Lanka",
  "territories": [
    "Sri Lanka"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National federation for triathlon in Sri Lanka.",
  "website": "https://triathlon.org/members/sri-lanka-triathlon",
  "sources": [
    "https://triathlon.org/members/sri-lanka-triathlon",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "websiteKind": "member-directory"
}, "2026-10-23"),

  record(
    {
      slug: "sri-lankan-swimming",
      name: "Sri Lanka Aquatic Sports Union",
      type: "national",
      country: "Sri Lanka",
      jurisdiction: "Sri Lanka",
      territories: ["Sri Lanka"],
      sports: ["swimming"],
      summary: "National body responsible for swimming in Sri Lanka, recognised by World Aquatics.",
      website: "https://aquatics.lk/en/",
      sources: [
        "https://www.worldaquatics.com/members/national-federations",
        "https://aquatics.lk/en/",
      ],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),

  record({
  "slug": "macau-triathlon",
  "name": "China Macau Triathlon General Association",
  "type": "national",
  "country": "Macau",
  "jurisdiction": "Macau, China",
  "territories": [
    "Macau"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National federation for triathlon in Macau.",
  "website": "https://triathlon.org/members/macau-triathlon-association",
  "sources": [
    "https://triathlon.org/members/macau-triathlon-association",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ],
  "websiteKind": "member-directory",
  "aliases": [
    "Macao Triathlon"
  ]
}, "2026-10-23"),

  record(
    {
      slug: "macau-swimming",
      name: "Associacao Geral de Natacao de Macau, China",
      type: "national",
      country: "Macau",
      jurisdiction: "Macau, China",
      territories: ["Macau"],
      sports: ["swimming"],
      summary: "National body responsible for swimming in Macau, recognised by World Aquatics.",
      website: "https://www.worldaquatics.com/members/national-federations",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
      websiteKind: "member-directory",
      aliases: ["Macao Swimming"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "chinese-athletics",
      name: "Chinese Athletics Association",
      type: "national",
      country: "China",
      jurisdiction: "China",
      territories: ["China"],
      sports: ["track-and-field"],
      summary: "National athletics body for China, listed by Asian Athletics.",
      website: "https://asianathletics.com/member-federations",
      sources: ["https://asianathletics.com/member-federations"],
      related: ["world-athletics"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "chinese-taipei-athletics",
      name: "Chinese Taipei Athletics Association",
      type: "national",
      country: "Chinese Taipei",
      jurisdiction: "Chinese Taipei",
      territories: ["Chinese Taipei"],
      sports: ["track-and-field"],
      summary: "National athletics body for Chinese Taipei, listed by Asian Athletics.",
      website: "https://asianathletics.com/member-federations",
      sources: ["https://asianathletics.com/member-federations"],
      related: ["world-athletics"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "nepalese-athletics",
      name: "Nepal Athletics Association",
      type: "national",
      country: "Nepal",
      jurisdiction: "Nepal",
      territories: ["Nepal"],
      sports: ["track-and-field"],
      summary: "National athletics body for Nepal, listed by Asian Athletics.",
      website: "https://nepalathletics.org.np",
      sources: ["https://asianathletics.com/member-federations", "https://nepalathletics.org.np"],
      related: ["world-athletics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "vietnamese-athletics",
      name: "Vietnam Athletics Federation",
      type: "national",
      country: "Vietnam",
      jurisdiction: "Vietnam",
      territories: ["Vietnam"],
      sports: ["track-and-field"],
      summary: "National athletics body for Vietnam, listed by Asian Athletics.",
      website: "https://asianathletics.com/member-federations",
      sources: ["https://asianathletics.com/member-federations"],
      related: ["world-athletics"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "sri-lankan-athletics",
      name: "Sri Lanka Athletics",
      type: "national",
      country: "Sri Lanka",
      jurisdiction: "Sri Lanka",
      territories: ["Sri Lanka"],
      sports: ["track-and-field"],
      summary: "National athletics body for Sri Lanka, listed by Asian Athletics.",
      website: "https://sriathletics.lk",
      sources: ["https://asianathletics.com/member-federations", "https://sriathletics.lk"],
      related: ["world-athletics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "macau-athletics",
      name: "Associação de Atletismo de Macau",
      type: "national",
      country: "Macau",
      jurisdiction: "Macau, China",
      territories: ["Macau"],
      sports: ["track-and-field"],
      summary: "National athletics body for Macau, listed by Asian Athletics.",
      website: "https://www.aamc.org.mo",
      sources: ["https://asianathletics.com/member-federations", "https://www.aamc.org.mo"],
      related: ["world-athletics"],
      aliases: ["Macao Athletics Association"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "chinese-cycling",
      name: "Chinese Cycling Association",
      type: "national",
      country: "China",
      jurisdiction: "China",
      territories: ["China"],
      sports: ["road-cycling"],
      summary: "National cycling body for China, listed by the Union Cycliste Internationale.",
      website:
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      sources: [
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      ],
      related: ["uci"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "chinese-taipei-cycling",
      name: "Chinese Taipei Cycling Association",
      type: "national",
      country: "Chinese Taipei",
      jurisdiction: "Chinese Taipei",
      territories: ["Chinese Taipei"],
      sports: ["road-cycling", "mountain-biking", "track-cycling", "bmx"],
      summary:
        "National cycling body for Chinese Taipei, listed by the Union Cycliste Internationale.",
      website: "https://cycling.org.tw/",
      sources: [
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
        "https://cycling.org.tw/",
      ],
      related: ["uci"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "nepalese-cycling",
      name: "Nepal Cycling Federation",
      type: "national",
      country: "Nepal",
      jurisdiction: "Nepal",
      territories: ["Nepal"],
      sports: ["mountain-biking"],
      summary: "National cycling body for Nepal, listed by the Union Cycliste Internationale.",
      website: "https://www.nepalcycling.org.np/",
      sources: [
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
        "https://www.nepalcycling.org.np/",
        "https://www.nepalcycling.org.np/events-results/",
      ],
      related: ["uci"],
      aliases: ["Nepal Cycling Association"],
      detail:
        "The UCI lists Nepal Cycling Federation; its own website uses Nepal Cycling Association. Mountain-bike coverage is documented in its events and results.",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "vietnamese-cycling",
      name: "Vietnam Cycling Federation",
      type: "national",
      country: "Vietnam",
      jurisdiction: "Vietnam",
      territories: ["Vietnam"],
      sports: ["road-cycling"],
      summary: "National cycling body for Vietnam, listed by the Union Cycliste Internationale.",
      website:
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      sources: [
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      ],
      related: ["uci"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "sri-lankan-cycling",
      name: "Cycling Federation of Sri Lanka",
      type: "national",
      country: "Sri Lanka",
      jurisdiction: "Sri Lanka",
      territories: ["Sri Lanka"],
      sports: ["road-cycling"],
      summary: "National cycling body for Sri Lanka, listed by the Union Cycliste Internationale.",
      website:
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      sources: [
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      ],
      related: ["uci"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "macau-cycling",
      name: "Associação de Ciclismo de Macau",
      type: "national",
      country: "Macau",
      jurisdiction: "Macau, China",
      territories: ["Macau"],
      sports: ["road-cycling"],
      summary: "National cycling body for Macau, listed by the Union Cycliste Internationale.",
      website:
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      sources: [
        "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
      ],
      related: ["uci"],
      aliases: ["Macao Cycling Association", "Associacão de Ciclismo de Macao, Chine"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),
  record({
  "slug": "bahrain-athletics",
  "name": "Bahrain Athletics Association",
  "type": "national",
  "country": "Bahrain",
  "jurisdiction": "Bahrain",
  "territories": [
    "Bahrain"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Bahrain, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "bahrain-cycling",
  "name": "Bahrain Cycling Association",
  "type": "national",
  "country": "Bahrain",
  "jurisdiction": "Bahrain",
  "territories": [
    "Bahrain"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Bahrain, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "bangladesh-athletics",
  "name": "Bangladesh Athletic Federation",
  "type": "national",
  "country": "Bangladesh",
  "jurisdiction": "Bangladesh",
  "territories": [
    "Bangladesh"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Bangladesh, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "bangladesh-cycling",
  "name": "Bangladesh Cycling Federation",
  "type": "national",
  "country": "Bangladesh",
  "jurisdiction": "Bangladesh",
  "territories": [
    "Bangladesh"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Bangladesh, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "bhutan-athletics",
  "name": "Bhutan Amateur Athletic Federation",
  "type": "national",
  "country": "Bhutan",
  "jurisdiction": "Bhutan",
  "territories": [
    "Bhutan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Bhutan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "bhutan-cycling",
  "name": "Bhutan Cycling Federation",
  "type": "national",
  "country": "Bhutan",
  "jurisdiction": "Bhutan",
  "territories": [
    "Bhutan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Bhutan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "brunei-athletics",
  "name": "Brunei Darussalam Athletics Federation",
  "type": "national",
  "country": "Brunei",
  "jurisdiction": "Brunei",
  "territories": [
    "Brunei"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Brunei, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "brunei-cycling",
  "name": "Brunei Darussalam Cycling Federation",
  "type": "national",
  "country": "Brunei",
  "jurisdiction": "Brunei",
  "territories": [
    "Brunei"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Brunei, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "cambodia-athletics",
  "name": "Khmer Amateur Athletics Federation",
  "type": "national",
  "country": "Cambodia",
  "jurisdiction": "Cambodia",
  "territories": [
    "Cambodia"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Cambodia, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "cambodia-cycling",
  "name": "Cambodian Cycling Federation",
  "type": "national",
  "country": "Cambodia",
  "jurisdiction": "Cambodia",
  "territories": [
    "Cambodia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Cambodia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "kazakhstan-athletics",
  "name": "Athletic Federation of the Republic of Kazakhstan",
  "type": "national",
  "country": "Kazakhstan",
  "jurisdiction": "Kazakhstan",
  "territories": [
    "Kazakhstan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Kazakhstan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "kazakhstan-cycling",
  "name": "Kazakhstan Cycling Federation",
  "type": "national",
  "country": "Kazakhstan",
  "jurisdiction": "Kazakhstan",
  "territories": [
    "Kazakhstan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Kazakhstan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "kyrgyzstan-athletics",
  "name": "Athletics Federation of Kyrgyz Republic",
  "type": "national",
  "country": "Kyrgyzstan",
  "jurisdiction": "Kyrgyzstan",
  "territories": [
    "Kyrgyzstan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Kyrgyzstan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "kyrgyzstan-cycling",
  "name": "Kyrgyzstan Cycling Federation",
  "type": "national",
  "country": "Kyrgyzstan",
  "jurisdiction": "Kyrgyzstan",
  "territories": [
    "Kyrgyzstan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Kyrgyzstan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "laos-athletics",
  "name": "Laos Amateur Athletic Federation",
  "type": "national",
  "country": "Laos",
  "jurisdiction": "Laos",
  "territories": [
    "Laos"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Laos, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "laos-cycling",
  "name": "Laos Cycling Federation",
  "type": "national",
  "country": "Laos",
  "jurisdiction": "Laos",
  "territories": [
    "Laos"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Laos, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "maldives-athletics",
  "name": "Athletics Association of Maldives",
  "type": "national",
  "country": "Maldives",
  "jurisdiction": "Maldives",
  "territories": [
    "Maldives"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Maldives, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "maldives-cycling",
  "name": "Bicycle Association of Maldives",
  "type": "national",
  "country": "Maldives",
  "jurisdiction": "Maldives",
  "territories": [
    "Maldives"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Maldives, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "mongolia-athletics",
  "name": "Mongolian Athletic Federation",
  "type": "national",
  "country": "Mongolia",
  "jurisdiction": "Mongolia",
  "territories": [
    "Mongolia"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Mongolia, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "mongolia-cycling",
  "name": "Mongolian Cycling Federation",
  "type": "national",
  "country": "Mongolia",
  "jurisdiction": "Mongolia",
  "territories": [
    "Mongolia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Mongolia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "pakistan-athletics",
  "name": "Athletics Federation of Pakistan",
  "type": "national",
  "country": "Pakistan",
  "jurisdiction": "Pakistan",
  "territories": [
    "Pakistan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Pakistan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "pakistan-cycling",
  "name": "Pakistan Cycling Federation",
  "type": "national",
  "country": "Pakistan",
  "jurisdiction": "Pakistan",
  "territories": [
    "Pakistan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Pakistan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "united-arab-emirates-athletics",
  "name": "UAE Athletics Federation",
  "type": "national",
  "country": "United Arab Emirates",
  "jurisdiction": "United Arab Emirates",
  "territories": [
    "United Arab Emirates"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for United Arab Emirates, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "united-arab-emirates-cycling",
  "name": "U.A.E. Cycling Federation",
  "type": "national",
  "country": "United Arab Emirates",
  "jurisdiction": "United Arab Emirates",
  "territories": [
    "United Arab Emirates"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for United Arab Emirates, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "iran-athletics",
  "name": "Athletic Federation of I.R. Iran",
  "type": "national",
  "country": "Iran",
  "jurisdiction": "Iran",
  "territories": [
    "Iran"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Iran, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "iran-cycling",
  "name": "Cycling Federation Of The Islamic Republic Of Iran",
  "type": "national",
  "country": "Iran",
  "jurisdiction": "Iran",
  "territories": [
    "Iran"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Iran, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "iraq-athletics",
  "name": "Iraqi Athletics Federation",
  "type": "national",
  "country": "Iraq",
  "jurisdiction": "Iraq",
  "territories": [
    "Iraq"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Iraq, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "iraq-cycling",
  "name": "Iraqi Cycling Federation",
  "type": "national",
  "country": "Iraq",
  "jurisdiction": "Iraq",
  "territories": [
    "Iraq"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Iraq, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "jordan-athletics",
  "name": "Jordan Athletics Federation",
  "type": "national",
  "country": "Jordan",
  "jurisdiction": "Jordan",
  "territories": [
    "Jordan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Jordan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "jordan-cycling",
  "name": "Jordan Cycling Federation",
  "type": "national",
  "country": "Jordan",
  "jurisdiction": "Jordan",
  "territories": [
    "Jordan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Jordan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "kuwait-athletics",
  "name": "Kuwait Athletics Federation",
  "type": "national",
  "country": "Kuwait",
  "jurisdiction": "Kuwait",
  "territories": [
    "Kuwait"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Kuwait, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "kuwait-cycling",
  "name": "Kuwait Cycling Committee",
  "type": "national",
  "country": "Kuwait",
  "jurisdiction": "Kuwait",
  "territories": [
    "Kuwait"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Kuwait, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "lebanon-athletics",
  "name": "Fédération Libanaise d'Athlétisme",
  "type": "national",
  "country": "Lebanon",
  "jurisdiction": "Lebanon",
  "territories": [
    "Lebanon"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Lebanon, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "lebanon-cycling",
  "name": "Federation Libanaise De Cyclisme",
  "type": "national",
  "country": "Lebanon",
  "jurisdiction": "Lebanon",
  "territories": [
    "Lebanon"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Lebanon, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "myanmar-athletics",
  "name": "Myanmar Track & Field Federation",
  "type": "national",
  "country": "Myanmar",
  "jurisdiction": "Myanmar",
  "territories": [
    "Myanmar"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Myanmar, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "myanmar-cycling",
  "name": "Myanmar Cycling Federation",
  "type": "national",
  "country": "Myanmar",
  "jurisdiction": "Myanmar",
  "territories": [
    "Myanmar"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Myanmar, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "oman-athletics",
  "name": "Oman Athletic Association",
  "type": "national",
  "country": "Oman",
  "jurisdiction": "Oman",
  "territories": [
    "Oman"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Oman, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "oman-cycling",
  "name": "Oman Cycling Association",
  "type": "national",
  "country": "Oman",
  "jurisdiction": "Oman",
  "territories": [
    "Oman"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Oman, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "qatar-athletics",
  "name": "Qatar Athletics Federation",
  "type": "national",
  "country": "Qatar",
  "jurisdiction": "Qatar",
  "territories": [
    "Qatar"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Qatar, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "qatar-cycling",
  "name": "Qatar Cycling & Triathlon Federation",
  "type": "national",
  "country": "Qatar",
  "jurisdiction": "Qatar",
  "territories": [
    "Qatar"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Qatar, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "saudi-arabia-athletics",
  "name": "Saudi Arabian Athletics Federation",
  "type": "national",
  "country": "Saudi Arabia",
  "jurisdiction": "Saudi Arabia",
  "territories": [
    "Saudi Arabia"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Saudi Arabia, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "saudi-arabia-cycling",
  "name": "Saudi Cycling Federation",
  "type": "national",
  "country": "Saudi Arabia",
  "jurisdiction": "Saudi Arabia",
  "territories": [
    "Saudi Arabia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Saudi Arabia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "tajikistan-athletics",
  "name": "Athletics Federation of the Republic of Tajikistan",
  "type": "national",
  "country": "Tajikistan",
  "jurisdiction": "Tajikistan",
  "territories": [
    "Tajikistan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Tajikistan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "tajikistan-cycling",
  "name": "Tajikistan Cycling Federation",
  "type": "national",
  "country": "Tajikistan",
  "jurisdiction": "Tajikistan",
  "territories": [
    "Tajikistan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Tajikistan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "turkmenistan-athletics",
  "name": "Amateur Athletic Federation of Turkmenistan",
  "type": "national",
  "country": "Turkmenistan",
  "jurisdiction": "Turkmenistan",
  "territories": [
    "Turkmenistan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Turkmenistan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "turkmenistan-cycling",
  "name": "Turkmenistan Cycling Federation",
  "type": "national",
  "country": "Turkmenistan",
  "jurisdiction": "Turkmenistan",
  "territories": [
    "Turkmenistan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Turkmenistan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "uzbekistan-athletics",
  "name": "The Athletic Federation of Uzbekistan",
  "type": "national",
  "country": "Uzbekistan",
  "jurisdiction": "Uzbekistan",
  "territories": [
    "Uzbekistan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Uzbekistan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "uzbekistan-cycling",
  "name": "Uzbekistan Cycling Federation",
  "type": "national",
  "country": "Uzbekistan",
  "jurisdiction": "Uzbekistan",
  "territories": [
    "Uzbekistan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Uzbekistan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "afghanistan-athletics",
  "name": "Afghanistan Athletic Federation",
  "type": "national",
  "country": "Afghanistan",
  "jurisdiction": "Afghanistan",
  "territories": [
    "Afghanistan"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Afghanistan, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "afghanistan-cycling",
  "name": "Afghanistan Cycling Federation",
  "type": "national",
  "country": "Afghanistan",
  "jurisdiction": "Afghanistan",
  "territories": [
    "Afghanistan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Afghanistan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "north-korea-athletics",
  "name": "Amateur Athletics Association of DPR of Korea",
  "type": "national",
  "country": "North Korea",
  "jurisdiction": "North Korea",
  "territories": [
    "North Korea"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for North Korea, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "north-korea-cycling",
  "name": "Cycling Association of the Democratic People's Republic of Korea",
  "type": "national",
  "country": "North Korea",
  "jurisdiction": "North Korea",
  "territories": [
    "North Korea"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for North Korea, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "palestine-athletics",
  "name": "Palestine Athletic Federation",
  "type": "national",
  "country": "Palestine",
  "jurisdiction": "Palestine",
  "territories": [
    "Palestine"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Palestine, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "palestine-cycling",
  "name": "Palestinian Cycling Federation",
  "type": "national",
  "country": "Palestine",
  "jurisdiction": "Palestine",
  "territories": [
    "Palestine"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Palestine, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "syria-athletics",
  "name": "Syrian Arab Athletic Federation",
  "type": "national",
  "country": "Syria",
  "jurisdiction": "Syria",
  "territories": [
    "Syria"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Syria, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "syria-cycling",
  "name": "Syrian Arab Cycling Federation",
  "type": "national",
  "country": "Syria",
  "jurisdiction": "Syria",
  "territories": [
    "Syria"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Syria, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "timor-leste-athletics",
  "name": "Federação Timor-Leste de Atletismo",
  "type": "national",
  "country": "Timor-Leste",
  "jurisdiction": "Timor-Leste",
  "territories": [
    "Timor-Leste"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Timor-Leste, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "timor-leste-cycling",
  "name": "East Timor Cycling Federation",
  "type": "national",
  "country": "Timor-Leste",
  "jurisdiction": "Timor-Leste",
  "territories": [
    "Timor-Leste"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Timor-Leste, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "yemen-athletics",
  "name": "Yemen Athletics Federation",
  "type": "national",
  "country": "Yemen",
  "jurisdiction": "Yemen",
  "territories": [
    "Yemen"
  ],
  "sports": [
    "track-and-field"
  ],
  "summary": "National athletics body for Yemen, listed by Asian Athletics.",
  "website": "https://asianathletics.com/member-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://asianathletics.com/member-federations"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "yemen-cycling",
  "name": "Yemen Cycling Federation",
  "type": "national",
  "country": "Yemen",
  "jurisdiction": "Yemen",
  "territories": [
    "Yemen"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Yemen, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/asia-continental-confederations-national-federations/2qHYguLi3IuvD3iCfHX9Aa"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "algeria-cycling",
  "name": "FÉDÉRATION ALGÉRIENNE DE CYCLISME",
  "type": "national",
  "country": "Algeria",
  "jurisdiction": "Algeria",
  "territories": [
    "Algeria"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Algeria, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "angola-cycling",
  "name": "FÉDÉRATION CYCLISTE DE L'ANGOLA",
  "type": "national",
  "country": "Angola",
  "jurisdiction": "Angola",
  "territories": [
    "Angola"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Angola, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "benin-cycling",
  "name": "FÉDÉRATION BENINOISE DE CYCLISME",
  "type": "national",
  "country": "Benin",
  "jurisdiction": "Benin",
  "territories": [
    "Benin"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Benin, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "botswana-cycling",
  "name": "BOTSWANA CYCLING ASSOCIATION",
  "type": "national",
  "country": "Botswana",
  "jurisdiction": "Botswana",
  "territories": [
    "Botswana"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Botswana, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "burkina-faso-cycling",
  "name": "FÉDÉRATION BURKINABE DE CYCLISME",
  "type": "national",
  "country": "Burkina Faso",
  "jurisdiction": "Burkina Faso",
  "territories": [
    "Burkina Faso"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Burkina Faso, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "burundi-cycling",
  "name": "FÉDÉRATION BURUNDAISE DE CYCLISME",
  "type": "national",
  "country": "Burundi",
  "jurisdiction": "Burundi",
  "territories": [
    "Burundi"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Burundi, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "cameroon-cycling",
  "name": "FÉDÉRATION CAMEROUNAISE DE CYCLISME",
  "type": "national",
  "country": "Cameroon",
  "jurisdiction": "Cameroon",
  "territories": [
    "Cameroon"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Cameroon, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "cabo-verde-cycling",
  "name": "FEDERAÇÃO CABO - VERDIANA DE CICLISMO",
  "type": "national",
  "country": "Cabo Verde",
  "jurisdiction": "Cabo Verde",
  "territories": [
    "Cabo Verde"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Cabo Verde, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "central-african-republic-cycling",
  "name": "FÉDÉRATION CENTRAFRICAINE DE CYCLISME",
  "type": "national",
  "country": "Central African Republic",
  "jurisdiction": "Central African Republic",
  "territories": [
    "Central African Republic"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Central African Republic, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "chad-cycling",
  "name": "FÉDÉRATION TCHADIENNE DE CYCLISME",
  "type": "national",
  "country": "Chad",
  "jurisdiction": "Chad",
  "territories": [
    "Chad"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Chad, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "comoros-cycling",
  "name": "FÉDÉRATION COMORIENNE DE CYCLISME",
  "type": "national",
  "country": "Comoros",
  "jurisdiction": "Comoros",
  "territories": [
    "Comoros"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Comoros, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "republic-of-the-congo-cycling",
  "name": "FÉDÉRATION CONGOLAISE DE CYCLISME",
  "type": "national",
  "country": "Republic of the Congo",
  "jurisdiction": "Republic of the Congo",
  "territories": [
    "Republic of the Congo"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Republic of the Congo, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "democratic-republic-of-the-congo-cycling",
  "name": "FÉDÉRATION CONGOLAISE DE CYCLISME DE LA RÉPUBLIQUE DÉMOCRATIQUE DU CONGO",
  "type": "national",
  "country": "Democratic Republic of the Congo",
  "jurisdiction": "Democratic Republic of the Congo",
  "territories": [
    "Democratic Republic of the Congo"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Democratic Republic of the Congo, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "djibouti-cycling",
  "name": "FÉDÉRATION DJIBOUTIENNE DE CYCLISME",
  "type": "national",
  "country": "Djibouti",
  "jurisdiction": "Djibouti",
  "territories": [
    "Djibouti"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Djibouti, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "egypt-cycling",
  "name": "EGYPTIAN CYCLING FEDERATION",
  "type": "national",
  "country": "Egypt",
  "jurisdiction": "Egypt",
  "territories": [
    "Egypt"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Egypt, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "equatorial-guinea-cycling",
  "name": "Federación Ecuatoguineana de Ciclismo",
  "type": "national",
  "country": "Equatorial Guinea",
  "jurisdiction": "Equatorial Guinea",
  "territories": [
    "Equatorial Guinea"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Equatorial Guinea, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "eritrea-cycling",
  "name": "ERITREAN NATIONAL CYCLING FEDERATION",
  "type": "national",
  "country": "Eritrea",
  "jurisdiction": "Eritrea",
  "territories": [
    "Eritrea"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Eritrea, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "eswatini-cycling",
  "name": "ESWATINI CYCLING ASSOCIATION",
  "type": "national",
  "country": "Eswatini",
  "jurisdiction": "Eswatini",
  "territories": [
    "Eswatini"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Eswatini, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "ethiopia-cycling",
  "name": "ETHIOPIAN CYCLING FEDERATION",
  "type": "national",
  "country": "Ethiopia",
  "jurisdiction": "Ethiopia",
  "territories": [
    "Ethiopia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Ethiopia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "gabon-cycling",
  "name": "FÉDÉRATION GABONAISE DE CYCLISME",
  "type": "national",
  "country": "Gabon",
  "jurisdiction": "Gabon",
  "territories": [
    "Gabon"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Gabon, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "gambia-cycling",
  "name": "GAMBIA CYCLING ASSOCIATION",
  "type": "national",
  "country": "Gambia",
  "jurisdiction": "Gambia",
  "territories": [
    "Gambia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Gambia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "ghana-cycling",
  "name": "GHANA CYCLING FEDERATION",
  "type": "national",
  "country": "Ghana",
  "jurisdiction": "Ghana",
  "territories": [
    "Ghana"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Ghana, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "guinea-cycling",
  "name": "FÉDÉRATION GUINEENNE DE CYCLISME",
  "type": "national",
  "country": "Guinea",
  "jurisdiction": "Guinea",
  "territories": [
    "Guinea"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Guinea, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "guinea-bissau-cycling",
  "name": "FEDERACAO DE CICLISMO DE GUINE-BISSAU",
  "type": "national",
  "country": "Guinea-Bissau",
  "jurisdiction": "Guinea-Bissau",
  "territories": [
    "Guinea-Bissau"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Guinea-Bissau, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "cote-divoire-cycling",
  "name": "FÉDÉRATION IVOIRIENNE DE CYCLISME",
  "type": "national",
  "country": "Côte d’Ivoire",
  "jurisdiction": "Côte d’Ivoire",
  "territories": [
    "Côte d’Ivoire"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Côte d’Ivoire, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "kenya-cycling",
  "name": "KENYA CYCLING FEDERATION",
  "type": "national",
  "country": "Kenya",
  "jurisdiction": "Kenya",
  "territories": [
    "Kenya"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Kenya, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "lesotho-cycling",
  "name": "LESOTHO CYCLING ASSOCIATION",
  "type": "national",
  "country": "Lesotho",
  "jurisdiction": "Lesotho",
  "territories": [
    "Lesotho"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Lesotho, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "liberia-cycling",
  "name": "LIBERIA NATIONAL CYCLING ASSOCIATION",
  "type": "national",
  "country": "Liberia",
  "jurisdiction": "Liberia",
  "territories": [
    "Liberia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Liberia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "libya-cycling",
  "name": "LIBYAN CYCLING FEDERATION",
  "type": "national",
  "country": "Libya",
  "jurisdiction": "Libya",
  "territories": [
    "Libya"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Libya, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "madagascar-cycling",
  "name": "FÉDÉRATION MALGACHE DE CYCLISME",
  "type": "national",
  "country": "Madagascar",
  "jurisdiction": "Madagascar",
  "territories": [
    "Madagascar"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Madagascar, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "malawi-cycling",
  "name": "CYCLING FEDERATION OF MALAWI",
  "type": "national",
  "country": "Malawi",
  "jurisdiction": "Malawi",
  "territories": [
    "Malawi"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Malawi, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "mali-cycling",
  "name": "FÉDÉRATION MALIENNE DE CYCLISME",
  "type": "national",
  "country": "Mali",
  "jurisdiction": "Mali",
  "territories": [
    "Mali"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Mali, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "mauritania-cycling",
  "name": "FÉDÉRATION MAURITANIENNE DE CYCLISME",
  "type": "national",
  "country": "Mauritania",
  "jurisdiction": "Mauritania",
  "territories": [
    "Mauritania"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Mauritania, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "morocco-cycling",
  "name": "FÉDÉRATION ROYALE MAROCAINE DE CYCLISME",
  "type": "national",
  "country": "Morocco",
  "jurisdiction": "Morocco",
  "territories": [
    "Morocco"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Morocco, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "mozambique-cycling",
  "name": "FEDERAÇÄO MOÇAMBICANA DE CICLISMO",
  "type": "national",
  "country": "Mozambique",
  "jurisdiction": "Mozambique",
  "territories": [
    "Mozambique"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Mozambique, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "namibia-cycling",
  "name": "NAMIBIAN CYCLING FEDERATION",
  "type": "national",
  "country": "Namibia",
  "jurisdiction": "Namibia",
  "territories": [
    "Namibia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Namibia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "niger-cycling",
  "name": "FÉDÉRATION NIGERIENNE DE CYCLISME",
  "type": "national",
  "country": "Niger",
  "jurisdiction": "Niger",
  "territories": [
    "Niger"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Niger, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "nigeria-cycling",
  "name": "CYCLING FEDERATION OF NIGERIA",
  "type": "national",
  "country": "Nigeria",
  "jurisdiction": "Nigeria",
  "territories": [
    "Nigeria"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Nigeria, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "rwanda-cycling",
  "name": "FÉDÉRATION RWANDAISE DE CYCLISME",
  "type": "national",
  "country": "Rwanda",
  "jurisdiction": "Rwanda",
  "territories": [
    "Rwanda"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Rwanda, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "sao-tome-and-principe-cycling",
  "name": "FÉDÉRATION SANTOMEENE DE CYCLISME",
  "type": "national",
  "country": "Sao Tome and Principe",
  "jurisdiction": "Sao Tome and Principe",
  "territories": [
    "Sao Tome and Principe"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Sao Tome and Principe, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "senegal-cycling",
  "name": "FÉDÉRATION SÉNÉGALAISE DE CYCLISME",
  "type": "national",
  "country": "Senegal",
  "jurisdiction": "Senegal",
  "territories": [
    "Senegal"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Senegal, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "seychelles-cycling",
  "name": "UNION CYCLISTE DES SEYCHELLES",
  "type": "national",
  "country": "Seychelles",
  "jurisdiction": "Seychelles",
  "territories": [
    "Seychelles"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Seychelles, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "sierra-leone-cycling",
  "name": "SIERRA LEONE NATIONAL CYCLING ASSOCIATION",
  "type": "national",
  "country": "Sierra Leone",
  "jurisdiction": "Sierra Leone",
  "territories": [
    "Sierra Leone"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Sierra Leone, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "somalia-cycling",
  "name": "SOMALI CYCLING FEDERATION",
  "type": "national",
  "country": "Somalia",
  "jurisdiction": "Somalia",
  "territories": [
    "Somalia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Somalia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "sudan-cycling",
  "name": "SUDAN CYCLING FEDERATION",
  "type": "national",
  "country": "Sudan",
  "jurisdiction": "Sudan",
  "territories": [
    "Sudan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Sudan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "south-sudan-cycling",
  "name": "South Sudan Cycling Federation",
  "type": "national",
  "country": "South Sudan",
  "jurisdiction": "South Sudan",
  "territories": [
    "South Sudan"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for South Sudan, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "togo-cycling",
  "name": "FÉDÉRATION TOGOLAISE DE CYCLISME",
  "type": "national",
  "country": "Togo",
  "jurisdiction": "Togo",
  "territories": [
    "Togo"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Togo, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "tunisia-cycling",
  "name": "FÉDÉRATION TUNISIENNE DE CYCLISME",
  "type": "national",
  "country": "Tunisia",
  "jurisdiction": "Tunisia",
  "territories": [
    "Tunisia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Tunisia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "uganda-cycling",
  "name": "UGANDA CYCLING ASSOCIATION",
  "type": "national",
  "country": "Uganda",
  "jurisdiction": "Uganda",
  "territories": [
    "Uganda"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Uganda, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "tanzania-cycling",
  "name": "CYCLING ASSOCIATION OF TANZANIA",
  "type": "national",
  "country": "Tanzania",
  "jurisdiction": "Tanzania",
  "territories": [
    "Tanzania"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Tanzania, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "zambia-cycling",
  "name": "CYCLING ASSOCIATION OF ZAMBIA",
  "type": "national",
  "country": "Zambia",
  "jurisdiction": "Zambia",
  "territories": [
    "Zambia"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Zambia, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "zimbabwe-cycling",
  "name": "CYCLING ZIMBABWE",
  "type": "national",
  "country": "Zimbabwe",
  "jurisdiction": "Zimbabwe",
  "territories": [
    "Zimbabwe"
  ],
  "sports": [
    "road-cycling"
  ],
  "summary": "National cycling body for Zimbabwe, listed by the Union Cycliste Internationale.",
  "website": "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.uci.org/africa-continental-confederations-national-federations/52DfWCi6lPxLk3dfvEIhyc"
  ],
  "related": [
    "uci"
  ]
}, "2026-10-23"),
  record({
  "slug": "djibouti-athletics",
  "name": "Fédération Djiboutienne d’Athlétisme",
  "type": "national",
  "country": "Djibouti",
  "jurisdiction": "Djibouti",
  "territories": [
    "Djibouti"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Djibouti, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/djibouti",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/djibouti"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "egypt-athletics",
  "name": "Egyptian Athletic Federation",
  "type": "national",
  "country": "Egypt",
  "jurisdiction": "Egypt",
  "territories": [
    "Egypt"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Egypt, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/egypt-egypte",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/egypt-egypte"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "eritrea-athletics",
  "name": "Eritrean National Athletics Federation",
  "type": "national",
  "country": "Eritrea",
  "jurisdiction": "Eritrea",
  "territories": [
    "Eritrea"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Eritrea, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/erytrea-erithree",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/erytrea-erithree"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "ethiopia-athletics",
  "name": "Ethiopian Athletic Federation",
  "type": "national",
  "country": "Ethiopia",
  "jurisdiction": "Ethiopia",
  "territories": [
    "Ethiopia"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Ethiopia, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/ethiopia-ethiopie",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/ethiopia-ethiopie"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "gabon-athletics",
  "name": "Fédération Gabonaise d’Athlétisme",
  "type": "national",
  "country": "Gabon",
  "jurisdiction": "Gabon",
  "territories": [
    "Gabon"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Gabon, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/gabon",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/gabon"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "guinea-athletics",
  "name": "Fédération Guinéenne d’Athlétisme Amateur",
  "type": "national",
  "country": "Guinea",
  "jurisdiction": "Guinea",
  "territories": [
    "Guinea"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Guinea, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/guinea-guinee",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/guinea-guinee"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "lesotho-athletics",
  "name": "Lesotho Amateur Athletics Association",
  "type": "national",
  "country": "Lesotho",
  "jurisdiction": "Lesotho",
  "territories": [
    "Lesotho"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Lesotho, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/lesotho",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/lesotho"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "liberia-athletics",
  "name": "Liberia Track & Field Federation",
  "type": "national",
  "country": "Liberia",
  "jurisdiction": "Liberia",
  "territories": [
    "Liberia"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Liberia, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/liberia",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/liberia"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "madagascar-athletics",
  "name": "Fédération Malagasy d’Athlétisme",
  "type": "national",
  "country": "Madagascar",
  "jurisdiction": "Madagascar",
  "territories": [
    "Madagascar"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Madagascar, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/madagascar",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/madagascar"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "malawi-athletics",
  "name": "Athletics Association of Malawi",
  "type": "national",
  "country": "Malawi",
  "jurisdiction": "Malawi",
  "territories": [
    "Malawi"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Malawi, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/malawi",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/malawi"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "morocco-athletics",
  "name": "Fédération Royale Marocaine d’Athlétisme",
  "type": "national",
  "country": "Morocco",
  "jurisdiction": "Morocco",
  "territories": [
    "Morocco"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Morocco, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/marocco-maroc",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/marocco-maroc"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "mauritania-athletics",
  "name": "Fédération d’Athlétisme de la République Islamique de Mauritanie (FAIM)",
  "type": "national",
  "country": "Mauritania",
  "jurisdiction": "Mauritania",
  "territories": [
    "Mauritania"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Mauritania, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/mauritania-mauritanie",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/mauritania-mauritanie"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "namibia-athletics",
  "name": "Athletics Namibia",
  "type": "national",
  "country": "Namibia",
  "jurisdiction": "Namibia",
  "territories": [
    "Namibia"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Namibia, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/namibia-namibie",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/namibia-namibie"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "niger-athletics",
  "name": "Federation Nigérienne d’Athlétisme",
  "type": "national",
  "country": "Niger",
  "jurisdiction": "Niger",
  "territories": [
    "Niger"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Niger, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/niger",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/niger"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "senegal-athletics",
  "name": "Fédération Sénégalaise d’Athlétisme",
  "type": "national",
  "country": "Senegal",
  "jurisdiction": "Senegal",
  "territories": [
    "Senegal"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Senegal, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/senegal",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/senegal"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "burkina-faso-athletics",
  "name": "Fédération Burkinabé d’Athlétisme",
  "type": "national",
  "country": "Burkina Faso",
  "jurisdiction": "Burkina Faso",
  "territories": [
    "Burkina Faso"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Burkina Faso, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/burkina-faso",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/burkina-faso"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "burundi-athletics",
  "name": "Fédération d’Athlétisme du Burundi",
  "type": "national",
  "country": "Burundi",
  "jurisdiction": "Burundi",
  "territories": [
    "Burundi"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Burundi, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/burundi",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/burundi"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "cameroon-athletics",
  "name": "Fédération Camerounaise d’Athlétisme",
  "type": "national",
  "country": "Cameroon",
  "jurisdiction": "Cameroon",
  "territories": [
    "Cameroon"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Cameroon, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/cameroon-cameroun",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/cameroon-cameroun"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "central-african-republic-athletics",
  "name": "Fédération centrafricaine d’Athlétisme",
  "type": "national",
  "country": "Central African Republic",
  "jurisdiction": "Central African Republic",
  "territories": [
    "Central African Republic"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Central African Republic, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/central-african-republic-republique-centrafricaine",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/central-african-republic-republique-centrafricaine"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "chad-athletics",
  "name": "Fédération Tchadienne d’Athlétisme",
  "type": "national",
  "country": "Chad",
  "jurisdiction": "Chad",
  "territories": [
    "Chad"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Chad, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/chad-tchad",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/chad-tchad"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "comoros-athletics",
  "name": "Fédération Comorienne d’Athlétisme",
  "type": "national",
  "country": "Comoros",
  "jurisdiction": "Comoros",
  "territories": [
    "Comoros"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Comoros, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/comoros-comores",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/comoros-comores"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "republic-of-the-congo-athletics",
  "name": "Fédération Congolaise d’Athlétisme",
  "type": "national",
  "country": "Republic of the Congo",
  "jurisdiction": "Republic of the Congo",
  "territories": [
    "Republic of the Congo"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Republic of the Congo, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/congo",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/congo"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "algeria-athletics",
  "name": "Fédération Algérienne d’Athlétisme",
  "type": "national",
  "country": "Algeria",
  "jurisdiction": "Algeria",
  "territories": [
    "Algeria"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Algeria, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/algeria-algerie",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/algeria-algerie"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "botswana-athletics",
  "name": "Botswana Athletics Association",
  "type": "national",
  "country": "Botswana",
  "jurisdiction": "Botswana",
  "territories": [
    "Botswana"
  ],
  "sports": [
    "road-running",
    "trail-running",
    "track-and-field"
  ],
  "summary": "National athletics body for Botswana, listed in the Confederation of African Athletics member directory.",
  "website": "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/botswana",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.caaweb.org/en/index.php/la-caa/contacts-des-federations-africaines/botswana"
  ],
  "related": [
    "world-athletics"
  ]
}, "2026-10-23"),
  record({
  "slug": "algeria-triathlon",
  "name": "Fédération Algérienne de Triathlon",
  "type": "national",
  "country": "Algeria",
  "jurisdiction": "Algeria",
  "territories": [
    "Algeria"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Algeria, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federation-algerienne-de-triathlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federation-algerienne-de-triathlon",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "burundi-triathlon",
  "name": "Burundi triathlon union",
  "type": "national",
  "country": "Burundi",
  "jurisdiction": "Burundi",
  "territories": [
    "Burundi"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Burundi, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/burundi-triathlon-union",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/burundi-triathlon-union",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "benin-triathlon",
  "name": "Fédération Béninoise de Triathlon",
  "type": "national",
  "country": "Benin",
  "jurisdiction": "Benin",
  "territories": [
    "Benin"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Benin, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/association-de-triathlon-benin",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/association-de-triathlon-benin",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "burkina-faso-triathlon",
  "name": "Federation Burkinabe De Triathlon",
  "type": "national",
  "country": "Burkina Faso",
  "jurisdiction": "Burkina Faso",
  "territories": [
    "Burkina Faso"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Burkina Faso, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/burkina-faso-provisions-member",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/burkina-faso-provisions-member",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "central-african-republic-triathlon",
  "name": "Fédération Centrafricaine de Triathlon",
  "type": "national",
  "country": "Central African Republic",
  "jurisdiction": "Central African Republic",
  "territories": [
    "Central African Republic"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Central African Republic, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federation-centrafricaine-de-triathlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federation-centrafricaine-de-triathlon",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "cote-divoire-triathlon",
  "name": "Fédération Ivoirienne de Triathlon et Disciplines Associées",
  "type": "national",
  "country": "Côte d’Ivoire",
  "jurisdiction": "Côte d’Ivoire",
  "territories": [
    "Côte d’Ivoire"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Côte d’Ivoire, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federation-ivoirienne-de-triathlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federation-ivoirienne-de-triathlon",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "cameroon-triathlon",
  "name": "Cameroun Triathlon",
  "type": "national",
  "country": "Cameroon",
  "jurisdiction": "Cameroon",
  "territories": [
    "Cameroon"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Cameroon, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/cameroon-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/cameroon-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "democratic-republic-of-the-congo-triathlon",
  "name": "DRCongo federation of Triathlon",
  "type": "national",
  "country": "Democratic Republic of the Congo",
  "jurisdiction": "Democratic Republic of the Congo",
  "territories": [
    "Democratic Republic of the Congo"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Democratic Republic of the Congo, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/drcongo-federation-of-triathlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/drcongo-federation-of-triathlon",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "egypt-triathlon",
  "name": "Egyptian Triathlon Federation",
  "type": "national",
  "country": "Egypt",
  "jurisdiction": "Egypt",
  "territories": [
    "Egypt"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Egypt, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/egyptian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/egyptian-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "gambia-triathlon",
  "name": "Gambia Triathlon Union",
  "type": "national",
  "country": "Gambia",
  "jurisdiction": "Gambia",
  "territories": [
    "Gambia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Gambia, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/gambia-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/gambia-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "ghana-triathlon",
  "name": "Ghana Triathlon Federation",
  "type": "national",
  "country": "Ghana",
  "jurisdiction": "Ghana",
  "territories": [
    "Ghana"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Ghana, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/ghana-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/ghana-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "guinea-triathlon",
  "name": "Guinea Triathlon Federation",
  "type": "national",
  "country": "Guinea",
  "jurisdiction": "Guinea",
  "territories": [
    "Guinea"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Guinea, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/guinea-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/guinea-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "libya-triathlon",
  "name": "Libyan Triathlon Federation",
  "type": "national",
  "country": "Libya",
  "jurisdiction": "Libya",
  "territories": [
    "Libya"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Libya, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/libyan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/libyan-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "madagascar-triathlon",
  "name": "Madagascar Triathlon Federation",
  "type": "national",
  "country": "Madagascar",
  "jurisdiction": "Madagascar",
  "territories": [
    "Madagascar"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Madagascar, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/madagascar-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/madagascar-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "morocco-triathlon",
  "name": "Fédération Royale Marocaine de Triathlon",
  "type": "national",
  "country": "Morocco",
  "jurisdiction": "Morocco",
  "territories": [
    "Morocco"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Morocco, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/morocan-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/morocan-triathlon-association",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "mozambique-triathlon",
  "name": "União Moçambicana de Triatlo",
  "type": "national",
  "country": "Mozambique",
  "jurisdiction": "Mozambique",
  "territories": [
    "Mozambique"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Mozambique, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/uniaeo-mocambicana-de-triatlo",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/uniaeo-mocambicana-de-triatlo",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "namibia-triathlon",
  "name": "Namibian Triathlon Federation",
  "type": "national",
  "country": "Namibia",
  "jurisdiction": "Namibia",
  "territories": [
    "Namibia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Namibia, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/namibian-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/namibian-triathlon-association",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "nigeria-triathlon",
  "name": "Triathlon Nigeria",
  "type": "national",
  "country": "Nigeria",
  "jurisdiction": "Nigeria",
  "territories": [
    "Nigeria"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Nigeria, listed by World Triathlon and Africa Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/nigerian-triathlon-union",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/nigerian-triathlon-union",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "niger-triathlon",
  "name": "Fédération Nigérienne de Triathlon",
  "type": "national",
  "country": "Niger",
  "jurisdiction": "Niger",
  "territories": [
    "Niger"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Niger, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/niger",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/niger",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "rwanda-triathlon",
  "name": "Federation Rwandaise de Triathlon",
  "type": "national",
  "country": "Rwanda",
  "jurisdiction": "Rwanda",
  "territories": [
    "Rwanda"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Rwanda, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federation-rwandaise-de-triathlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federation-rwandaise-de-triathlon",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "senegal-triathlon",
  "name": "Senegal Triathlon Federation",
  "type": "national",
  "country": "Senegal",
  "jurisdiction": "Senegal",
  "territories": [
    "Senegal"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Senegal, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/senegal-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/senegal-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "sierra-leone-triathlon",
  "name": "Sierra Leone National Triathlon Association",
  "type": "national",
  "country": "Sierra Leone",
  "jurisdiction": "Sierra Leone",
  "territories": [
    "Sierra Leone"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Sierra Leone, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/sierra-leone-national-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/sierra-leone-national-triathlon-association",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "tanzania-triathlon",
  "name": "Tanzania Triathlon",
  "type": "national",
  "country": "Tanzania",
  "jurisdiction": "Tanzania",
  "territories": [
    "Tanzania"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Tanzania, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/tanzania-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/tanzania-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "togo-triathlon",
  "name": "Togo Triathlon Federation",
  "type": "national",
  "country": "Togo",
  "jurisdiction": "Togo",
  "territories": [
    "Togo"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Togo, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/togo-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/togo-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "tunisia-triathlon",
  "name": "Fédération Tunisienne de Triathlon & Para triathlon",
  "type": "national",
  "country": "Tunisia",
  "jurisdiction": "Tunisia",
  "territories": [
    "Tunisia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Tunisia, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/tunisia-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/tunisia-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "uganda-triathlon",
  "name": "Uganda Triathlon Federation",
  "type": "national",
  "country": "Uganda",
  "jurisdiction": "Uganda",
  "territories": [
    "Uganda"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Uganda, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/uganda-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/uganda-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "zambia-triathlon",
  "name": "Triathlon Zambia",
  "type": "national",
  "country": "Zambia",
  "jurisdiction": "Zambia",
  "territories": [
    "Zambia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Zambia, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/triathlon-zambia",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-zambia",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "zimbabwe-triathlon",
  "name": "Zimbabwe Triathlon Federation",
  "type": "national",
  "country": "Zimbabwe",
  "jurisdiction": "Zimbabwe",
  "territories": [
    "Zimbabwe"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon body for Zimbabwe, listed by World Triathlon and Africa Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/zimbabwe-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/zimbabwe-triathlon-federation",
    "https://africa.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "bangladesh-triathlon",
  "name": "Bangladesh Triathlon Association",
  "type": "national",
  "country": "Bangladesh",
  "jurisdiction": "Bangladesh",
  "territories": [
    "Bangladesh"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Bangladesh, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/triathlon-federation-of-bangladesh",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-federation-of-bangladesh",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "bahrain-triathlon",
  "name": "Bahrain Triathlon Association",
  "type": "national",
  "country": "Bahrain",
  "jurisdiction": "Bahrain",
  "territories": [
    "Bahrain"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Bahrain, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/bahrain-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/bahrain-triathlon-association",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "cambodia-triathlon",
  "name": "Cambodia Triathlon Federation",
  "type": "national",
  "country": "Cambodia",
  "jurisdiction": "Cambodia",
  "territories": [
    "Cambodia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Cambodia, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/cambodia-triathlon-federation-ctf",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/cambodia-triathlon-federation-ctf",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "iran-triathlon",
  "name": "Iran Triathlon Federation",
  "type": "national",
  "country": "Iran",
  "jurisdiction": "Iran",
  "territories": [
    "Iran"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Iran, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/iran-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/iran-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "iraq-triathlon",
  "name": "Iraq Triathlon Federation",
  "type": "national",
  "country": "Iraq",
  "jurisdiction": "Iraq",
  "territories": [
    "Iraq"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Iraq, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/iraq-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/iraq-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "jordan-triathlon",
  "name": "Jordan Triathlon Association",
  "type": "national",
  "country": "Jordan",
  "jurisdiction": "Jordan",
  "territories": [
    "Jordan"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Jordan, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/jordanian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/jordanian-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "kazakhstan-triathlon",
  "name": "Kazakhstan Triathlon Federation",
  "type": "national",
  "country": "Kazakhstan",
  "jurisdiction": "Kazakhstan",
  "territories": [
    "Kazakhstan"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Kazakhstan, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/kazakhstan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/kazakhstan-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "kyrgyzstan-triathlon",
  "name": "Kyrgyz Republic Triathlon Federation",
  "type": "national",
  "country": "Kyrgyzstan",
  "jurisdiction": "Kyrgyzstan",
  "territories": [
    "Kyrgyzstan"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Kyrgyzstan, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/kyrgyzstan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/kyrgyzstan-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "saudi-arabia-triathlon",
  "name": "Saudi Triathlon Federation",
  "type": "national",
  "country": "Saudi Arabia",
  "jurisdiction": "Saudi Arabia",
  "territories": [
    "Saudi Arabia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Saudi Arabia, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/saudi-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/saudi-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "kuwait-triathlon",
  "name": "Kuwait Triathlon Club",
  "type": "national",
  "country": "Kuwait",
  "jurisdiction": "Kuwait",
  "territories": [
    "Kuwait"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Kuwait, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/kuwait-triathlon-committee",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/kuwait-triathlon-committee",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "lebanon-triathlon",
  "name": "Lebanese Triathlon Federation",
  "type": "national",
  "country": "Lebanon",
  "jurisdiction": "Lebanon",
  "territories": [
    "Lebanon"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Lebanon, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/lebanon-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/lebanon-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "maldives-triathlon",
  "name": "Triathlon Association of Maldives",
  "type": "national",
  "country": "Maldives",
  "jurisdiction": "Maldives",
  "territories": [
    "Maldives"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Maldives, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/triathlon-association-of-maldives",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-association-of-maldives",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "mongolia-triathlon",
  "name": "Mongolia Triathlon",
  "type": "national",
  "country": "Mongolia",
  "jurisdiction": "Mongolia",
  "territories": [
    "Mongolia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Mongolia, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/mongolian-triathlon-union",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/mongolian-triathlon-union",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "oman-triathlon",
  "name": "Oman Triathlon Federation",
  "type": "national",
  "country": "Oman",
  "jurisdiction": "Oman",
  "territories": [
    "Oman"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Oman, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/oman-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/oman-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "pakistan-triathlon",
  "name": "Pakistan Triathlon Federation",
  "type": "national",
  "country": "Pakistan",
  "jurisdiction": "Pakistan",
  "territories": [
    "Pakistan"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Pakistan, listed by World Triathlon and Asia Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/pakistan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/pakistan-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "palestine-triathlon",
  "name": "Palestine Triathlon Federation",
  "type": "national",
  "country": "Palestine",
  "jurisdiction": "Palestine",
  "territories": [
    "Palestine"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Palestine, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/palestine-triathlon-committee",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/palestine-triathlon-committee",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "qatar-triathlon",
  "name": "Qatar Triathlon Federation",
  "type": "national",
  "country": "Qatar",
  "jurisdiction": "Qatar",
  "territories": [
    "Qatar"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Qatar, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/qatar-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/qatar-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "syria-triathlon",
  "name": "Syria Arab Triathlon Federation",
  "type": "national",
  "country": "Syria",
  "jurisdiction": "Syria",
  "territories": [
    "Syria"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Syria, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/syrian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/syrian-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "timor-leste-triathlon",
  "name": "Federacao Triatlo de Timor-Leste",
  "type": "national",
  "country": "Timor-Leste",
  "jurisdiction": "Timor-Leste",
  "territories": [
    "Timor-Leste"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Timor-Leste, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federacao-triatlo-de-timor-leste",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacao-triatlo-de-timor-leste",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "united-arab-emirates-triathlon",
  "name": "UAE Triathlon Federation",
  "type": "national",
  "country": "United Arab Emirates",
  "jurisdiction": "United Arab Emirates",
  "territories": [
    "United Arab Emirates"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for United Arab Emirates, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/united-arab-emirates-triathlon-committee",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/united-arab-emirates-triathlon-committee",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "uzbekistan-triathlon",
  "name": "Uzbekistan Triathlon Federation",
  "type": "national",
  "country": "Uzbekistan",
  "jurisdiction": "Uzbekistan",
  "territories": [
    "Uzbekistan"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Uzbekistan, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/uzbekistan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/uzbekistan-triathlon-federation",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "yemen-triathlon",
  "name": "Yemen Aquatics",
  "type": "national",
  "country": "Yemen",
  "jurisdiction": "Yemen",
  "territories": [
    "Yemen"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Yemen, listed by World Triathlon and Asia Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/yemen-aquatics",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/yemen-aquatics",
    "https://asia.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "el-salvador-triathlon",
  "name": "Federación Salvadoreña de Triatlón",
  "type": "national",
  "country": "El Salvador",
  "jurisdiction": "El Salvador",
  "territories": [
    "El Salvador"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for El Salvador, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federacion-salvadorena-de-triatlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacion-salvadorena-de-triatlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "saint-kitts-and-nevis-triathlon",
  "name": "Saint Kitts & Nevis Triathlon Federation",
  "type": "national",
  "country": "Saint Kitts and Nevis",
  "jurisdiction": "Saint Kitts and Nevis",
  "territories": [
    "Saint Kitts and Nevis"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Saint Kitts and Nevis, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/saint-kitts-nevis-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/saint-kitts-nevis-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "puerto-rico-triathlon",
  "name": "Federación Puertorriqueña Triatlón PR",
  "type": "national",
  "country": "Puerto Rico",
  "jurisdiction": "Puerto Rico",
  "territories": [
    "Puerto Rico"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Puerto Rico, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federacion-puertoriquena-de-triatlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacion-puertoriquena-de-triatlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "honduras-triathlon",
  "name": "Honduras Triathlon Federation",
  "type": "national",
  "country": "Honduras",
  "jurisdiction": "Honduras",
  "territories": [
    "Honduras"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Honduras, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/honduras-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/honduras-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "venezuela-triathlon",
  "name": "Federación Venezolana de Triatlón",
  "type": "national",
  "country": "Venezuela",
  "jurisdiction": "Venezuela",
  "territories": [
    "Venezuela"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Venezuela, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federacion-venezolana-de-triatlon-fevetri",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacion-venezolana-de-triatlon-fevetri",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "virgin-islands-triathlon",
  "name": "Virgin Islands Triathlon",
  "type": "national",
  "country": "Virgin Islands",
  "jurisdiction": "Virgin Islands",
  "territories": [
    "Virgin Islands"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Virgin Islands, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/virgin-islands-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/virgin-islands-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "aruba-triathlon",
  "name": "Aruba Triathlon Association",
  "type": "national",
  "country": "Aruba",
  "jurisdiction": "Aruba",
  "territories": [
    "Aruba"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Aruba, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/aruba-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/aruba-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "cuba-triathlon",
  "name": "Federación Cubana de Triatlón",
  "type": "national",
  "country": "Cuba",
  "jurisdiction": "Cuba",
  "territories": [
    "Cuba"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Cuba, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federacion-cubana-de-triatlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacion-cubana-de-triatlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "belize-triathlon",
  "name": "Belize National Triathlon Association",
  "type": "national",
  "country": "Belize",
  "jurisdiction": "Belize",
  "territories": [
    "Belize"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Belize, listed by World Triathlon and Americas Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/belize-national-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/belize-national-triathlon-association",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "antigua-and-barbuda-triathlon",
  "name": "Antigua and Barbuda Triathlon Association",
  "type": "national",
  "country": "Antigua and Barbuda",
  "jurisdiction": "Antigua and Barbuda",
  "territories": [
    "Antigua and Barbuda"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Antigua and Barbuda, listed by World Triathlon and Americas Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/antigua-and-barbuda-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/antigua-and-barbuda-triathlon-association",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "haiti-triathlon",
  "name": "Union de Haitienne Triathlon",
  "type": "national",
  "country": "Haiti",
  "jurisdiction": "Haiti",
  "territories": [
    "Haiti"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Haiti, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/union-de-haitienne-triathlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/union-de-haitienne-triathlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "cayman-islands-triathlon",
  "name": "Cayman Islands Triathlon Association",
  "type": "national",
  "country": "Cayman Islands",
  "jurisdiction": "Cayman Islands",
  "territories": [
    "Cayman Islands"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Cayman Islands, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/cayman-islands-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/cayman-islands-triathlon-federation",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "suriname-triathlon",
  "name": "Surinaamse Triathlon Unie",
  "type": "national",
  "country": "Suriname",
  "jurisdiction": "Suriname",
  "territories": [
    "Suriname"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Suriname, listed by World Triathlon and Americas Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/surinaamse-triathlon-unie",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/surinaamse-triathlon-unie",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "nicaragua-triathlon",
  "name": "Federación Nicaraguense de Triatlón",
  "type": "national",
  "country": "Nicaragua",
  "jurisdiction": "Nicaragua",
  "territories": [
    "Nicaragua"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Nicaragua, listed by World Triathlon and Americas Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/federacion-nicaraguense-de-triatlon",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacion-nicaraguense-de-triatlon",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "grenada-triathlon",
  "name": "Triathlon Grenada",
  "type": "national",
  "country": "Grenada",
  "jurisdiction": "Grenada",
  "territories": [
    "Grenada"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Grenada, listed by World Triathlon and Americas Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/triathlon-grenada",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-grenada",
    "https://americas.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "american-samoa-triathlon",
  "name": "American Samoa Triathlon Association",
  "type": "national",
  "country": "American Samoa",
  "jurisdiction": "American Samoa",
  "territories": [
    "American Samoa"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for American Samoa, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/american-samoa-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/american-samoa-triathlon-association",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "cook-islands-triathlon",
  "name": "Cook Islands Triathlon Association",
  "type": "national",
  "country": "Cook Islands",
  "jurisdiction": "Cook Islands",
  "territories": [
    "Cook Islands"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Cook Islands, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/cook-islands-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/cook-islands-triathlon-federation",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "fiji-triathlon",
  "name": "Fiji Triathlon Association",
  "type": "national",
  "country": "Fiji",
  "jurisdiction": "Fiji",
  "territories": [
    "Fiji"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Fiji, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/fiji-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/fiji-triathlon-association",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "guam-triathlon",
  "name": "Guam Triathlon Federation",
  "type": "national",
  "country": "Guam",
  "jurisdiction": "Guam",
  "territories": [
    "Guam"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Guam, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/guam-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/guam-triathlon-federation",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "northern-mariana-islands-triathlon",
  "name": "Triathlon Association of the CMNI",
  "type": "national",
  "country": "Northern Mariana Islands",
  "jurisdiction": "Northern Mariana Islands",
  "territories": [
    "Northern Mariana Islands"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Northern Mariana Islands, listed by World Triathlon and Oceania Triathlon.",
  "detail": "World Triathlon lists this body as an associate member (checked 23 October 2026); full affiliated membership is not implied.",
  "website": "https://triathlon.org/members/triathlon-association-of-the-cmni",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-association-of-the-cmni",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "palau-triathlon",
  "name": "Belau Triathlon Federation",
  "type": "national",
  "country": "Palau",
  "jurisdiction": "Palau",
  "territories": [
    "Palau"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Palau, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/palau-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/palau-triathlon-federation",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "papua-new-guinea-triathlon",
  "name": "PNG Triathlon Association",
  "type": "national",
  "country": "Papua New Guinea",
  "jurisdiction": "Papua New Guinea",
  "territories": [
    "Papua New Guinea"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Papua New Guinea, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/png-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/png-triathlon-association",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "samoa-triathlon",
  "name": "Tri-Sports Samoa Association",
  "type": "national",
  "country": "Samoa",
  "jurisdiction": "Samoa",
  "territories": [
    "Samoa"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Samoa, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/samoa-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/samoa-triathlon-federation",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "solomon-islands-triathlon",
  "name": "Triathlon Solomon Islands",
  "type": "national",
  "country": "Solomon Islands",
  "jurisdiction": "Solomon Islands",
  "territories": [
    "Solomon Islands"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Solomon Islands, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/triathlon-solomon-islands",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-solomon-islands",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "tahiti-triathlon",
  "name": "Fédération Tahitienne de Triathlon",
  "type": "national",
  "country": "Tahiti",
  "jurisdiction": "Tahiti",
  "territories": [
    "Tahiti"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Tahiti, listed by World Triathlon and Oceania Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026).",
  "website": "https://triathlon.org/members/tahiti-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/tahiti-triathlon-association",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "tonga-triathlon",
  "name": "Tonga - Friendly Islands Triathlon Association",
  "type": "national",
  "country": "Tonga",
  "jurisdiction": "Tonga",
  "territories": [
    "Tonga"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Tonga, listed by World Triathlon and Oceania Triathlon.",
  "detail": "World Triathlon lists this federation as “Not in good standing” (checked 23 October 2026).",
  "website": "https://triathlon.org/members/friendly-islands-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/friendly-islands-triathlon-association",
    "https://oceania.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "albania-triathlon",
  "name": "Albanian Triathlon Federation",
  "type": "national",
  "country": "Albania",
  "jurisdiction": "Albania",
  "territories": [
    "Albania"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Albania, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/albanian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/albanian-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "andorra-triathlon",
  "name": "Federació Andorrana de Triatló",
  "type": "national",
  "country": "Andorra",
  "jurisdiction": "Andorra",
  "territories": [
    "Andorra"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Andorra, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/federacio-andorrana-de-triatlo",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/federacio-andorrana-de-triatlo",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "armenia-triathlon",
  "name": "Armenian Triathlon Federation",
  "type": "national",
  "country": "Armenia",
  "jurisdiction": "Armenia",
  "territories": [
    "Armenia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Armenia, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/armenian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/armenian-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "azerbaijan-triathlon",
  "name": "Azerbaijan Triathlon Federation",
  "type": "national",
  "country": "Azerbaijan",
  "jurisdiction": "Azerbaijan",
  "territories": [
    "Azerbaijan"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Azerbaijan, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/azerbaijan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/azerbaijan-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "bosnia-and-herzegovina-triathlon",
  "name": "Triathlon and Pentathlon Federation of Bosnia and Herzegovina",
  "type": "national",
  "country": "Bosnia and Herzegovina",
  "jurisdiction": "Bosnia and Herzegovina",
  "territories": [
    "Bosnia and Herzegovina"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Bosnia and Herzegovina, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/triathlon-association-in-bosnia-and-herzegovina",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-association-in-bosnia-and-herzegovina",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "belarus-triathlon",
  "name": "Belarusian Triathlon Federation",
  "type": "national",
  "country": "Belarus",
  "jurisdiction": "Belarus",
  "territories": [
    "Belarus"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Belarus, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/belarus-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/belarus-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "faroe-islands-triathlon",
  "name": "The Faroe Islands Triathlon Federation",
  "type": "national",
  "country": "Faroe Islands",
  "jurisdiction": "Faroe Islands",
  "territories": [
    "Faroe Islands"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Faroe Islands, listed by World Triathlon and Europe Triathlon.",
  "detail": "World Triathlon lists this body as an associate member (checked 23 October 2026); full affiliated membership is not implied.",
  "website": "https://triathlon.org/members/the-faroe-islands-triathlon-federation1",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/the-faroe-islands-triathlon-federation1",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "georgia-triathlon",
  "name": "National Triathlon Federation of Georgia",
  "type": "national",
  "country": "Georgia",
  "jurisdiction": "Georgia",
  "territories": [
    "Georgia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Georgia, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/national-triathlon-federation-of-georgia",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/national-triathlon-federation-of-georgia",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "gibraltar-triathlon",
  "name": "Gibraltar Triathlon Association",
  "type": "national",
  "country": "Gibraltar",
  "jurisdiction": "Gibraltar",
  "territories": [
    "Gibraltar"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Gibraltar, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/gibraltar-triathlon-association",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/gibraltar-triathlon-association",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "kosovo-triathlon",
  "name": "Kosovo Triathlon Federation",
  "type": "national",
  "country": "Kosovo",
  "jurisdiction": "Kosovo",
  "territories": [
    "Kosovo"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Kosovo, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/kosovo-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/kosovo-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "liechtenstein-triathlon",
  "name": "Liechtenstein Triathlon Federation",
  "type": "national",
  "country": "Liechtenstein",
  "jurisdiction": "Liechtenstein",
  "territories": [
    "Liechtenstein"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Liechtenstein, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/liechtenstein-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/liechtenstein-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "moldova-triathlon",
  "name": "National Triathlon Federation of the Republic of Moldova",
  "type": "national",
  "country": "Moldova",
  "jurisdiction": "Moldova",
  "territories": [
    "Moldova"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Moldova, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/moldovan-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/moldovan-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "north-macedonia-triathlon",
  "name": "Triathlon Federation of North Macedonia",
  "type": "national",
  "country": "North Macedonia",
  "jurisdiction": "North Macedonia",
  "territories": [
    "North Macedonia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for North Macedonia, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/macedonian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/macedonian-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "montenegro-triathlon",
  "name": "Triathlon Federation of Montenegro",
  "type": "national",
  "country": "Montenegro",
  "jurisdiction": "Montenegro",
  "territories": [
    "Montenegro"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Montenegro, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/triathlon-federation-of-montenegro",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/triathlon-federation-of-montenegro",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "monaco-triathlon",
  "name": "Triathlon Monegasque Federation",
  "type": "national",
  "country": "Monaco",
  "jurisdiction": "Monaco",
  "territories": [
    "Monaco"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Monaco, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/monaco-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/monaco-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "russia-triathlon",
  "name": "Russian Triathlon Federation",
  "type": "national",
  "country": "Russia",
  "jurisdiction": "Russia",
  "territories": [
    "Russia"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Russia, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/russian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/russian-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),
  record({
  "slug": "ukraine-triathlon",
  "name": "Ukrainian Triathlon Federation",
  "type": "national",
  "country": "Ukraine",
  "jurisdiction": "Ukraine",
  "territories": [
    "Ukraine"
  ],
  "sports": [
    "triathlon"
  ],
  "summary": "National triathlon member body for Ukraine, listed by World Triathlon and Europe Triathlon.",
  "detail": "Listed as affiliated by World Triathlon (checked 23 October 2026). Membership status does not establish athlete or event eligibility.",
  "website": "https://triathlon.org/members/ukrainian-triathlon-federation",
  "websiteKind": "member-directory",
  "sources": [
    "https://triathlon.org/members/ukrainian-triathlon-federation",
    "https://europe.triathlon.org/national-federations"
  ],
  "related": [
    "world-triathlon"
  ]
}, "2026-10-23"),

  // World Aquatics African national members, checked 23 October 2026.
  record({
    "slug": "africa-aquatics",
    "name": "Africa Aquatics",
    "aliases": [
      "CANA",
      "African Swimming Confederation"
    ],
    "type": "continental",
    "country": "International",
    "jurisdiction": "Africa",
    "territories": [
      "International"
    ],
    "sports": [
      "swimming"
    ],
    "website": "https://africaaquatics.org/",
    "summary": "Continental aquatic sports organisation for Africa, recognised by World Aquatics.",
    "sources": [
      "https://www.worldaquatics.com/members/continental-organisations",
      "https://africaaquatics.org/events"
    ],
    "related": [
      "world-aquatics"
    ]
  }, "2026-10-23"),
  record({
    "slug": "algeria-swimming",
    "name": "Fédération Algérienne de Natation",
    "country": "Algeria",
    "jurisdiction": "Algeria",
    "territories": [
      "Algeria"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Algeria, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Algeria Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "angola-swimming",
    "name": "Federação Angolana de Natação",
    "country": "Angola",
    "jurisdiction": "Angola",
    "territories": [
      "Angola"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Angola, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Angola Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "burundi-swimming",
    "name": "Fédération Burundaise de Natation",
    "country": "Burundi",
    "jurisdiction": "Burundi",
    "territories": [
      "Burundi"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Burundi, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Burundi Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "benin-swimming",
    "name": "Fédération Béninoise de Natation",
    "country": "Benin",
    "jurisdiction": "Benin",
    "territories": [
      "Benin"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Benin, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Benin Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "botswana-swimming",
    "name": "Botswana Swimming Sport Association",
    "country": "Botswana",
    "jurisdiction": "Botswana",
    "territories": [
      "Botswana"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Botswana, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Botswana Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "burkina-faso-swimming",
    "name": "Fédération Burkinabé de Natation et de Sauvetage",
    "country": "Burkina Faso",
    "jurisdiction": "Burkina Faso",
    "territories": [
      "Burkina Faso"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Burkina Faso, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Burkina Faso Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "central-african-republic-swimming",
    "name": "Fédération Centrafricaine de Natation",
    "country": "Central African Republic",
    "jurisdiction": "Central African Republic",
    "territories": [
      "Central African Republic"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Central African Republic, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Central African Republic Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "republic-of-the-congo-swimming",
    "name": "Fédération Congolaise de Natation",
    "country": "Republic of the Congo",
    "jurisdiction": "Republic of the Congo",
    "territories": [
      "Republic of the Congo"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Republic of the Congo, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Republic of the Congo Swimming Federation",
      "Congo"
    ]
  }, "2026-10-23"),
  record({
    "slug": "chad-swimming",
    "name": "Fédération Tchadienne de Natation Amateur",
    "country": "Chad",
    "jurisdiction": "Chad",
    "territories": [
      "Chad"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Chad, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Chad Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "cote-divoire-swimming",
    "name": "Fédération Ivoirienne de Natation et de Sauvetage",
    "country": "Côte d’Ivoire",
    "jurisdiction": "Côte d’Ivoire",
    "territories": [
      "Côte d’Ivoire"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Côte d’Ivoire, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Côte d’Ivoire Swimming Federation",
      "Côte d'Ivoire"
    ]
  }, "2026-10-23"),
  record({
    "slug": "cameroon-swimming",
    "name": "Fédération Camerounaise de Natation et de Sauvetage",
    "country": "Cameroon",
    "jurisdiction": "Cameroon",
    "territories": [
      "Cameroon"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Cameroon, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Cameroon Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "democratic-republic-of-the-congo-swimming",
    "name": "Fédération de Natation en République Démocratique du Congo",
    "country": "Democratic Republic of the Congo",
    "jurisdiction": "Democratic Republic of the Congo",
    "territories": [
      "Democratic Republic of the Congo"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Democratic Republic of the Congo, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Democratic Republic of the Congo Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "comoros-swimming",
    "name": "Comoros Swimming Federation",
    "country": "Comoros",
    "jurisdiction": "Comoros",
    "territories": [
      "Comoros"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Comoros, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": []
  }, "2026-10-23"),
  record({
    "slug": "cabo-verde-swimming",
    "name": "Federacao Cabo-verdiana de Natacao - FECAN",
    "country": "Cabo Verde",
    "jurisdiction": "Cabo Verde",
    "territories": [
      "Cabo Verde"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Cabo Verde, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Cabo Verde Swimming Federation",
      "Cape Verde"
    ]
  }, "2026-10-23"),
  record({
    "slug": "djibouti-swimming",
    "name": "Fédération Djiboutienne de Natation",
    "country": "Djibouti",
    "jurisdiction": "Djibouti",
    "territories": [
      "Djibouti"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Djibouti, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Djibouti Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "egypt-swimming",
    "name": "Egyptian Swimming Federation",
    "country": "Egypt",
    "jurisdiction": "Egypt",
    "territories": [
      "Egypt"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Egypt, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Egypt Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "eritrea-swimming",
    "name": "Eritrean National Swimming Federation",
    "country": "Eritrea",
    "jurisdiction": "Eritrea",
    "territories": [
      "Eritrea"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Eritrea, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Eritrea Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "ethiopia-swimming",
    "name": "Ethiopian Aquatics Federation",
    "country": "Ethiopia",
    "jurisdiction": "Ethiopia",
    "territories": [
      "Ethiopia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Ethiopia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Ethiopia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "gabon-swimming",
    "name": "Fédération Gabonaise de Natation",
    "country": "Gabon",
    "jurisdiction": "Gabon",
    "territories": [
      "Gabon"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Gabon, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Gabon Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "gambia-swimming",
    "name": "Gambia Swimming & Aquatic Sports Association",
    "country": "Gambia",
    "jurisdiction": "Gambia",
    "territories": [
      "Gambia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Gambia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Gambia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "guinea-bissau-swimming",
    "name": "Guiné-Bissau Aquatics",
    "country": "Guinea-Bissau",
    "jurisdiction": "Guinea-Bissau",
    "territories": [
      "Guinea-Bissau"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Guinea-Bissau, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Guinea-Bissau Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "equatorial-guinea-swimming",
    "name": "Federación Ecuatoguineana de Natación",
    "country": "Equatorial Guinea",
    "jurisdiction": "Equatorial Guinea",
    "territories": [
      "Equatorial Guinea"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Equatorial Guinea, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Equatorial Guinea Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "ghana-swimming",
    "name": "Ghana Swimming Association",
    "country": "Ghana",
    "jurisdiction": "Ghana",
    "territories": [
      "Ghana"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Ghana, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Ghana Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "guinea-swimming",
    "name": "Fédération Guinéenne de Natation et Sauvetage",
    "country": "Guinea",
    "jurisdiction": "Guinea",
    "territories": [
      "Guinea"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Guinea, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations",
      "https://africaaquatics.org/post-standard/back-where-it-began-guinea-to-host-the-third-edition-and-grand-final-of-the-africa-aquatics-open-water-swimming-cup-21-22-november"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Guinea Swimming Federation",
      "Fédération Aquatique de Guinée"
    ]
  }, "2026-10-23"),
  record({
    "slug": "libya-swimming",
    "name": "Libyan Swimming Federation",
    "country": "Libya",
    "jurisdiction": "Libya",
    "territories": [
      "Libya"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Libya, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Libya Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "liberia-swimming",
    "name": "Liberia National Swimming Federation",
    "country": "Liberia",
    "jurisdiction": "Liberia",
    "territories": [
      "Liberia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Liberia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Liberia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "lesotho-swimming",
    "name": "Lesotho Swimmers Association",
    "country": "Lesotho",
    "jurisdiction": "Lesotho",
    "territories": [
      "Lesotho"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Lesotho, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Lesotho Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "madagascar-swimming",
    "name": "Fédération Malgache de Natation",
    "country": "Madagascar",
    "jurisdiction": "Madagascar",
    "territories": [
      "Madagascar"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Madagascar, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Madagascar Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "morocco-swimming",
    "name": "Fédération Royale Marocaine de Natation",
    "country": "Morocco",
    "jurisdiction": "Morocco",
    "territories": [
      "Morocco"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Morocco, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Morocco Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "malawi-swimming",
    "name": "Malawi Aquatic Union",
    "country": "Malawi",
    "jurisdiction": "Malawi",
    "territories": [
      "Malawi"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Malawi, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Malawi Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "mali-swimming",
    "name": "Fédération Malienne de Natation",
    "country": "Mali",
    "jurisdiction": "Mali",
    "territories": [
      "Mali"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Mali, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Mali Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "mozambique-swimming",
    "name": "Federação Moçambicana de Natação",
    "country": "Mozambique",
    "jurisdiction": "Mozambique",
    "territories": [
      "Mozambique"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Mozambique, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Mozambique Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "mauritania-swimming",
    "name": "Fédération Mauritanienne de Natation",
    "country": "Mauritania",
    "jurisdiction": "Mauritania",
    "territories": [
      "Mauritania"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Mauritania, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Mauritania Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "namibia-swimming",
    "name": "Namibia Aquatic Sports Federation",
    "country": "Namibia",
    "jurisdiction": "Namibia",
    "territories": [
      "Namibia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Namibia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Namibia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "nigeria-swimming",
    "name": "Nigeria Aquatics Federation",
    "country": "Nigeria",
    "jurisdiction": "Nigeria",
    "territories": [
      "Nigeria"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Nigeria, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Nigeria Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "niger-swimming",
    "name": "Fédération Nigérienne des Sports Nautiques",
    "country": "Niger",
    "jurisdiction": "Niger",
    "territories": [
      "Niger"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Niger, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Niger Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "rwanda-swimming",
    "name": "Rwanda Swimming Federation",
    "country": "Rwanda",
    "jurisdiction": "Rwanda",
    "territories": [
      "Rwanda"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Rwanda, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": []
  }, "2026-10-23"),
  record({
    "slug": "senegal-swimming",
    "name": "Fédération Sénégalaise de Natation et de Sauvetage",
    "country": "Senegal",
    "jurisdiction": "Senegal",
    "territories": [
      "Senegal"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Senegal, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Senegal Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "seychelles-swimming",
    "name": "Seychelles Aquatics Federation",
    "country": "Seychelles",
    "jurisdiction": "Seychelles",
    "territories": [
      "Seychelles"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Seychelles, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Seychelles Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "sierra-leone-swimming",
    "name": "Sierra Leone Amateur Swimming, Diving and Water Polo Association",
    "country": "Sierra Leone",
    "jurisdiction": "Sierra Leone",
    "territories": [
      "Sierra Leone"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Sierra Leone, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Sierra Leone Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "somalia-swimming",
    "name": "Somali Swimming Federation",
    "country": "Somalia",
    "jurisdiction": "Somalia",
    "territories": [
      "Somalia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Somalia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Somalia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "sao-tome-and-principe-swimming",
    "name": "Federacão de Natação Tomé e Príncipe",
    "country": "Sao Tome and Principe",
    "jurisdiction": "Sao Tome and Principe",
    "territories": [
      "Sao Tome and Principe"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Sao Tome and Principe, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Sao Tome and Principe Swimming Federation",
      "São Tomé e Príncipe"
    ]
  }, "2026-10-23"),
  record({
    "slug": "sudan-swimming",
    "name": "Sudan Amateur Swimming Association",
    "country": "Sudan",
    "jurisdiction": "Sudan",
    "territories": [
      "Sudan"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Sudan, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Sudan Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "eswatini-swimming",
    "name": "Eswatini Swimming Association",
    "country": "Eswatini",
    "jurisdiction": "Eswatini",
    "territories": [
      "Eswatini"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Eswatini, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Eswatini Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "tanzania-swimming",
    "name": "Tanzania Swimming Association",
    "country": "Tanzania",
    "jurisdiction": "Tanzania",
    "territories": [
      "Tanzania"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Tanzania, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Tanzania Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "togo-swimming",
    "name": "Fédération Togolaise de Natation et de Sauvetage",
    "country": "Togo",
    "jurisdiction": "Togo",
    "territories": [
      "Togo"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Togo, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Togo Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "tunisia-swimming",
    "name": "Fédération Tunisienne de Natation",
    "country": "Tunisia",
    "jurisdiction": "Tunisia",
    "territories": [
      "Tunisia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Tunisia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Tunisia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "uganda-swimming",
    "name": "Uganda Aquatics",
    "country": "Uganda",
    "jurisdiction": "Uganda",
    "territories": [
      "Uganda"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Uganda, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Uganda Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "zambia-swimming",
    "name": "Zambia Amateur Swimming Union",
    "country": "Zambia",
    "jurisdiction": "Zambia",
    "territories": [
      "Zambia"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Zambia, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Zambia Swimming Federation"
    ]
  }, "2026-10-23"),
  record({
    "slug": "zimbabwe-swimming",
    "name": "Zimbabwe Aquatic Union",
    "country": "Zimbabwe",
    "jurisdiction": "Zimbabwe",
    "territories": [
      "Zimbabwe"
    ],
    "type": "national",
    "sports": [
      "swimming"
    ],
    "website": "https://www.worldaquatics.com/members/national-federations",
    "websiteKind": "member-directory",
    "summary": "National swimming member body for Zimbabwe, listed by World Aquatics.",
    "detail": "The link opens World Aquatics’ official national-federation directory. Membership identifies the sporting body; it does not establish government funding responsibilities or legislative powers.",
    "sources": [
      "https://www.worldaquatics.com/members/national-federations"
    ],
    "related": [
      "world-aquatics",
      "africa-aquatics"
    ],
    "aliases": [
      "Zimbabwe Swimming Federation"
    ]
  }, "2026-10-23"),

  // Oceania membership checked against both official directories, 23 October 2026.
  record({
  "slug": "american-samoa-swimming",
  "name": "American Samoa Swimming Association",
  "aliases": [
    "American Samoa swimming federation"
  ],
  "type": "national",
  "country": "American Samoa",
  "jurisdiction": "American Samoa",
  "territories": [
    "American Samoa"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for American Samoa by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "cook-islands-swimming",
  "name": "Cook Islands Aquatics Federation",
  "aliases": [
    "Cook Islands swimming federation"
  ],
  "type": "national",
  "country": "Cook Islands",
  "jurisdiction": "Cook Islands",
  "territories": [
    "Cook Islands"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Cook Islands by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "fiji-swimming",
  "name": "Fiji Swimming",
  "aliases": [
    "Fiji swimming federation"
  ],
  "type": "national",
  "country": "Fiji",
  "jurisdiction": "Fiji",
  "territories": [
    "Fiji"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Fiji by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "federated-states-of-micronesia-swimming",
  "name": "Federated States of Micronesia Swimming Association",
  "aliases": [
    "Federated States of Micronesia swimming federation",
    "Federated States of Micronesia"
  ],
  "type": "national",
  "country": "Micronesia",
  "jurisdiction": "Micronesia",
  "territories": [
    "Micronesia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Federated States of Micronesia by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "guam-swimming",
  "name": "Guam Swimming Federation",
  "aliases": [
    "Guam swimming federation"
  ],
  "type": "national",
  "country": "Guam",
  "jurisdiction": "Guam",
  "territories": [
    "Guam"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Guam by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "marshall-islands-swimming",
  "name": "Marshall Islands Swimming Federation",
  "aliases": [
    "Marshall Islands swimming federation"
  ],
  "type": "national",
  "country": "Marshall Islands",
  "jurisdiction": "Marshall Islands",
  "territories": [
    "Marshall Islands"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Marshall Islands by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "northern-mariana-islands-swimming",
  "name": "Northern Mariana Islands Swimming Federation",
  "aliases": [
    "Northern Mariana Islands swimming federation"
  ],
  "type": "national",
  "country": "Northern Mariana Islands",
  "jurisdiction": "Northern Mariana Islands",
  "territories": [
    "Northern Mariana Islands"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Northern Mariana Islands by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "palau-swimming",
  "name": "Palau Swimming Association",
  "aliases": [
    "Palau swimming federation"
  ],
  "type": "national",
  "country": "Palau",
  "jurisdiction": "Palau",
  "territories": [
    "Palau"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Palau by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "papua-new-guinea-swimming",
  "name": "Papua New Guinea Swimming Inc.",
  "aliases": [
    "Papua New Guinea swimming federation"
  ],
  "type": "national",
  "country": "Papua New Guinea",
  "jurisdiction": "Papua New Guinea",
  "territories": [
    "Papua New Guinea"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Papua New Guinea by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "samoa-swimming",
  "name": "Samoa Swimming Association",
  "aliases": [
    "Samoa swimming federation"
  ],
  "type": "national",
  "country": "Samoa",
  "jurisdiction": "Samoa",
  "territories": [
    "Samoa"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Samoa by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "solomon-islands-swimming",
  "name": "Solomon Islands Swimming Federation",
  "aliases": [
    "Solomon Islands swimming federation"
  ],
  "type": "national",
  "country": "Solomon Islands",
  "jurisdiction": "Solomon Islands",
  "territories": [
    "Solomon Islands"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Solomon Islands by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "tonga-swimming",
  "name": "Tonga Swimming Association",
  "aliases": [
    "Tonga swimming federation"
  ],
  "type": "national",
  "country": "Tonga",
  "jurisdiction": "Tonga",
  "territories": [
    "Tonga"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Tonga by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "vanuatu-swimming",
  "name": "Vanuatu Aquatics Federation",
  "aliases": [
    "Vanuatu swimming federation"
  ],
  "type": "national",
  "country": "Vanuatu",
  "jurisdiction": "Vanuatu",
  "territories": [
    "Vanuatu"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The swimming member body listed for Vanuatu by World Aquatics and Oceania Aquatics.",
  "detail": "The official membership directories establish the sporting affiliation. They do not establish government funding responsibilities or legislative powers.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "oceania-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "oceania-aquatics",
  "name": "Oceania Aquatics",
  "aliases": [
    "Oceania Swimming Association",
    "OSA"
  ],
  "type": "continental",
  "country": "International",
  "jurisdiction": "Oceania",
  "territories": [
    "American Samoa",
    "Australia",
    "Cook Islands",
    "Fiji",
    "Micronesia",
    "Guam",
    "Marshall Islands",
    "Northern Mariana Islands",
    "New Zealand",
    "Palau",
    "Papua New Guinea",
    "Samoa",
    "Solomon Islands",
    "Tonga",
    "Vanuatu"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The World Aquatics continental organisation for the Oceania region.",
  "detail": "Connects the national member federations across Oceania and supports aquatic competitions and development.",
  "website": "https://oceaniaaquatics.org/",
  "sources": [
    "https://www.worldaquatics.com/members/continental-organisations",
    "https://oceaniaaquatics.org/",
    "https://oceaniaaquatics.org/members/"
  ],
  "related": [
    "world-aquatics",
    "swimming-australia",
    "swimming-new-zealand"
  ]
}, "2026-10-23"),

  // Americas member bodies checked against World Aquatics, 23 October 2026.
  record(
    {
      slug: "anguilla-swimming",
      name: "Anguilla Amateur Swimming Association",
      aliases: ["Anguilla swimming federation"],
      type: "national",
      country: "Anguilla",
      jurisdiction: "Anguilla",
      territories: ["Anguilla"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Anguilla by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "antigua-and-barbuda-swimming",
      name: "Antigua and Barbuda Swimming Federation",
      aliases: ["Antigua and Barbuda swimming federation"],
      type: "national",
      country: "Antigua and Barbuda",
      jurisdiction: "Antigua and Barbuda",
      territories: ["Antigua and Barbuda"],
      sports: ["swimming"],
      summary:
        "The national aquatics member body listed for Antigua and Barbuda by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "aruba-swimming",
      name: "Aruba Aquatics Federation",
      aliases: ["Aruba swimming federation"],
      type: "national",
      country: "Aruba",
      jurisdiction: "Aruba",
      territories: ["Aruba"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Aruba by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "belize-swimming",
      name: "Belize Aquatics Federation",
      aliases: ["Belize swimming federation"],
      type: "national",
      country: "Belize",
      jurisdiction: "Belize",
      territories: ["Belize"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Belize by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "cayman-islands-swimming",
      name: "Cayman Islands Aquatic Sports Association",
      aliases: ["Cayman Islands swimming federation"],
      type: "national",
      country: "Cayman Islands",
      jurisdiction: "Cayman Islands",
      territories: ["Cayman Islands"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Cayman Islands by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "cuba-swimming",
      name: "Federación Cubana de Natación",
      aliases: ["Cuba swimming federation"],
      type: "national",
      country: "Cuba",
      jurisdiction: "Cuba",
      territories: ["Cuba"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Cuba by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "curacao-swimming",
      name: "Curacao Aquatics Federation",
      aliases: ["Curaçao swimming federation"],
      type: "national",
      country: "Curaçao",
      jurisdiction: "Curaçao",
      territories: ["Curaçao"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Curaçao by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "dominica-swimming",
      name: "Dominica Amateur Swimming Association",
      aliases: ["Dominica swimming federation"],
      type: "national",
      country: "Dominica",
      jurisdiction: "Dominica",
      territories: ["Dominica"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Dominica by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "el-salvador-swimming",
      name: "Federación Salvadoreña de Deportes Acuáticos",
      aliases: ["El Salvador swimming federation"],
      type: "national",
      country: "El Salvador",
      jurisdiction: "El Salvador",
      territories: ["El Salvador"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for El Salvador by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "grenada-swimming",
      name: "Grenada Amateur Swimming Association",
      aliases: ["Grenada swimming federation"],
      type: "national",
      country: "Grenada",
      jurisdiction: "Grenada",
      territories: ["Grenada"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Grenada by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "guyana-swimming",
      name: "Guyana Amateur Swimming Association",
      aliases: ["Guyana swimming federation"],
      type: "national",
      country: "Guyana",
      jurisdiction: "Guyana",
      territories: ["Guyana"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Guyana by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "haiti-swimming",
      name: "Fédération Haitienne des Sports Aquatiques",
      aliases: ["Haiti swimming federation"],
      type: "national",
      country: "Haiti",
      jurisdiction: "Haiti",
      territories: ["Haiti"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Haiti by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "honduras-swimming",
      name: "Federación Hondureña de Natación",
      aliases: ["Honduras swimming federation"],
      type: "national",
      country: "Honduras",
      jurisdiction: "Honduras",
      territories: ["Honduras"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Honduras by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "us-virgin-islands-swimming",
      name: "Virgin Islands Swimming Federation",
      aliases: ["US Virgin Islands swimming federation"],
      type: "national",
      country: "US Virgin Islands",
      jurisdiction: "US Virgin Islands",
      territories: ["US Virgin Islands"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for US Virgin Islands by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "british-virgin-islands-swimming",
      name: "British Virgin Islands Swimming Association",
      aliases: ["British Virgin Islands swimming federation"],
      type: "national",
      country: "British Virgin Islands",
      jurisdiction: "British Virgin Islands",
      territories: ["British Virgin Islands"],
      sports: ["swimming"],
      summary:
        "The national aquatics member body listed for British Virgin Islands by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "saint-lucia-swimming",
      name: "St. Lucia Aquatic Federation",
      aliases: ["Saint Lucia swimming federation"],
      type: "national",
      country: "Saint Lucia",
      jurisdiction: "Saint Lucia",
      territories: ["Saint Lucia"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Saint Lucia by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "sint-maarten-swimming",
      name: "SINT MAARTEN AQUATIC FEDERATION",
      aliases: ["Sint Maarten swimming federation"],
      type: "national",
      country: "Sint Maarten",
      jurisdiction: "Sint Maarten",
      territories: ["Sint Maarten"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Sint Maarten by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "nicaragua-swimming",
      name: "Federación de Natación de Nicaragua",
      aliases: ["Nicaragua swimming federation"],
      type: "national",
      country: "Nicaragua",
      jurisdiction: "Nicaragua",
      territories: ["Nicaragua"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Nicaragua by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "puerto-rico-swimming",
      name: "Federación Puertorriqueña de Natación",
      aliases: ["Puerto Rico swimming federation"],
      type: "national",
      country: "Puerto Rico",
      jurisdiction: "Puerto Rico",
      territories: ["Puerto Rico"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Puerto Rico by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "saint-kitts-and-nevis-swimming",
      name: "St. Kitts Nevis Aquatics Federation",
      aliases: ["Saint Kitts and Nevis swimming federation"],
      type: "national",
      country: "Saint Kitts and Nevis",
      jurisdiction: "Saint Kitts and Nevis",
      territories: ["Saint Kitts and Nevis"],
      sports: ["swimming"],
      summary:
        "The national aquatics member body listed for Saint Kitts and Nevis by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "suriname-swimming",
      name: "Surinaamse Zwem Bond",
      aliases: ["Suriname swimming federation"],
      type: "national",
      country: "Suriname",
      jurisdiction: "Suriname",
      territories: ["Suriname"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Suriname by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "turks-and-caicos-islands-swimming",
      name: "Turks & Caicos Islands Swim Federation",
      aliases: ["Turks and Caicos Islands swimming federation"],
      type: "national",
      country: "Turks and Caicos Islands",
      jurisdiction: "Turks and Caicos Islands",
      territories: ["Turks and Caicos Islands"],
      sports: ["swimming"],
      summary:
        "The national aquatics member body listed for Turks and Caicos Islands by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "venezuela-swimming",
      name: "Federación Venezolana de Deportes Acuáticos",
      aliases: ["Venezuela swimming federation"],
      type: "national",
      country: "Venezuela",
      jurisdiction: "Venezuela",
      territories: ["Venezuela"],
      sports: ["swimming"],
      summary: "The national aquatics member body listed for Venezuela by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),
  record(
    {
      slug: "saint-vincent-and-the-grenadines-swimming",
      name: "St. Vincent and the Grenadines Swimming Federation",
      aliases: ["Saint Vincent and the Grenadines swimming federation"],
      type: "national",
      country: "Saint Vincent and the Grenadines",
      jurisdiction: "Saint Vincent and the Grenadines",
      territories: ["Saint Vincent and the Grenadines"],
      sports: ["swimming"],
      summary:
        "The national aquatics member body listed for Saint Vincent and the Grenadines by World Aquatics.",
      detail:
        "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
      website: "https://www.worldaquatics.com/members/national-federations",
      websiteKind: "member-directory",
      sources: ["https://www.worldaquatics.com/members/national-federations"],
      related: ["world-aquatics"],
    },
    "2026-10-23",
  ),

  // Asian member bodies checked against World Aquatics, 23 October 2026.
  record({
  "slug": "afghanistan-swimming",
  "name": "Afghanistan National Swimming Federation",
  "aliases": [
    "Afghanistan swimming federation"
  ],
  "type": "national",
  "country": "Afghanistan",
  "jurisdiction": "Afghanistan",
  "territories": [
    "Afghanistan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Afghanistan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "bangladesh-swimming",
  "name": "Bangladesh Swimming Federation",
  "aliases": [
    "Bangladesh swimming federation"
  ],
  "type": "national",
  "country": "Bangladesh",
  "jurisdiction": "Bangladesh",
  "territories": [
    "Bangladesh"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Bangladesh by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "bhutan-swimming",
  "name": "Bhutan Aquatics Federation",
  "aliases": [
    "Bhutan swimming federation"
  ],
  "type": "national",
  "country": "Bhutan",
  "jurisdiction": "Bhutan",
  "territories": [
    "Bhutan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Bhutan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "bahrain-swimming",
  "name": "Bahrain Swimming Association",
  "aliases": [
    "Bahrain swimming federation"
  ],
  "type": "national",
  "country": "Bahrain",
  "jurisdiction": "Bahrain",
  "territories": [
    "Bahrain"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Bahrain by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "brunei-swimming",
  "name": "Brunei Amateur Swimming Association",
  "aliases": [
    "Brunei swimming federation"
  ],
  "type": "national",
  "country": "Brunei",
  "jurisdiction": "Brunei",
  "territories": [
    "Brunei"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Brunei by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "cambodia-swimming",
  "name": "Khmer Amateur Swimming Federation",
  "aliases": [
    "Cambodia swimming federation"
  ],
  "type": "national",
  "country": "Cambodia",
  "jurisdiction": "Cambodia",
  "territories": [
    "Cambodia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Cambodia by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "iran-swimming",
  "name": "I.R. Iran Amateur Swimming Federation",
  "aliases": [
    "Iran swimming federation"
  ],
  "type": "national",
  "country": "Iran",
  "jurisdiction": "Iran",
  "territories": [
    "Iran"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Iran by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "iraq-swimming",
  "name": "Iraq Aquatics",
  "aliases": [
    "Iraq swimming federation"
  ],
  "type": "national",
  "country": "Iraq",
  "jurisdiction": "Iraq",
  "territories": [
    "Iraq"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Iraq by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "jordan-swimming",
  "name": "Jordan Swimming Federation",
  "aliases": [
    "Jordan swimming federation"
  ],
  "type": "national",
  "country": "Jordan",
  "jurisdiction": "Jordan",
  "territories": [
    "Jordan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Jordan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "kazakhstan-swimming",
  "name": "Republican Public Association Qazaq Aquatics",
  "aliases": [
    "Kazakhstan swimming federation"
  ],
  "type": "national",
  "country": "Kazakhstan",
  "jurisdiction": "Kazakhstan",
  "territories": [
    "Kazakhstan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Kazakhstan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "kyrgyzstan-swimming",
  "name": "Federation of Aquatic Sports of the Kyrgyz Republic",
  "aliases": [
    "Kyrgyzstan swimming federation"
  ],
  "type": "national",
  "country": "Kyrgyzstan",
  "jurisdiction": "Kyrgyzstan",
  "territories": [
    "Kyrgyzstan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Kyrgyzstan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "saudi-arabia-swimming",
  "name": "Saudi Arabian Swimming Federation",
  "aliases": [
    "Saudi Arabia swimming federation"
  ],
  "type": "national",
  "country": "Saudi Arabia",
  "jurisdiction": "Saudi Arabia",
  "territories": [
    "Saudi Arabia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Saudi Arabia by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "kuwait-swimming",
  "name": "Kuwait Aquatics",
  "aliases": [
    "Kuwait swimming federation"
  ],
  "type": "national",
  "country": "Kuwait",
  "jurisdiction": "Kuwait",
  "territories": [
    "Kuwait"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Kuwait by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "laos-swimming",
  "name": "Lao Swimming Federation",
  "aliases": [
    "Laos swimming federation"
  ],
  "type": "national",
  "country": "Laos",
  "jurisdiction": "Laos",
  "territories": [
    "Laos"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Laos by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "lebanon-swimming",
  "name": "Fédération Libanaise de Natation",
  "aliases": [
    "Lebanon swimming federation"
  ],
  "type": "national",
  "country": "Lebanon",
  "jurisdiction": "Lebanon",
  "territories": [
    "Lebanon"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Lebanon by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "maldives-swimming",
  "name": "Maldives Aquatics",
  "aliases": [
    "Maldives swimming federation"
  ],
  "type": "national",
  "country": "Maldives",
  "jurisdiction": "Maldives",
  "territories": [
    "Maldives"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Maldives by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "mongolia-swimming",
  "name": "Mongolian Amateur Swimming Federation",
  "aliases": [
    "Mongolia swimming federation"
  ],
  "type": "national",
  "country": "Mongolia",
  "jurisdiction": "Mongolia",
  "territories": [
    "Mongolia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Mongolia by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "myanmar-swimming",
  "name": "Myanmar Swimming Federation",
  "aliases": [
    "Myanmar swimming federation"
  ],
  "type": "national",
  "country": "Myanmar",
  "jurisdiction": "Myanmar",
  "territories": [
    "Myanmar"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Myanmar by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "oman-swimming",
  "name": "Oman Aquatics Federation",
  "aliases": [
    "Oman swimming federation"
  ],
  "type": "national",
  "country": "Oman",
  "jurisdiction": "Oman",
  "territories": [
    "Oman"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Oman by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "pakistan-swimming",
  "name": "Pakistan Swimming Federation",
  "aliases": [
    "Pakistan swimming federation"
  ],
  "type": "national",
  "country": "Pakistan",
  "jurisdiction": "Pakistan",
  "territories": [
    "Pakistan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Pakistan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "palestine-swimming",
  "name": "Palestinian Swimming Federation and Aquatic Sports",
  "aliases": [
    "Palestine swimming federation"
  ],
  "type": "national",
  "country": "Palestine",
  "jurisdiction": "Palestine",
  "territories": [
    "Palestine"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Palestine by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "north-korea-swimming",
  "name": "Amateur Swimming Association of D.P.R. Korea",
  "aliases": [
    "North Korea swimming federation"
  ],
  "type": "national",
  "country": "North Korea",
  "jurisdiction": "North Korea",
  "territories": [
    "North Korea"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for North Korea by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "qatar-swimming",
  "name": "Qatar Aquatics Federation",
  "aliases": [
    "Qatar swimming federation"
  ],
  "type": "national",
  "country": "Qatar",
  "jurisdiction": "Qatar",
  "territories": [
    "Qatar"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Qatar by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "syria-swimming",
  "name": "Syrian Arab Swimming and Aquatic Sports Federation",
  "aliases": [
    "Syria swimming federation"
  ],
  "type": "national",
  "country": "Syria",
  "jurisdiction": "Syria",
  "territories": [
    "Syria"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Syria by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "tajikistan-swimming",
  "name": "National Swimming Federation of the Republic of Tajikistan",
  "aliases": [
    "Tajikistan swimming federation"
  ],
  "type": "national",
  "country": "Tajikistan",
  "jurisdiction": "Tajikistan",
  "territories": [
    "Tajikistan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Tajikistan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "turkmenistan-swimming",
  "name": "National Federation of Aquatics of Turkmenistan",
  "aliases": [
    "Turkmenistan swimming federation"
  ],
  "type": "national",
  "country": "Turkmenistan",
  "jurisdiction": "Turkmenistan",
  "territories": [
    "Turkmenistan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Turkmenistan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "timor-leste-swimming",
  "name": "Federação Natação de Timor Leste",
  "aliases": [
    "Timor-Leste swimming federation"
  ],
  "type": "national",
  "country": "Timor-Leste",
  "jurisdiction": "Timor-Leste",
  "territories": [
    "Timor-Leste"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Timor-Leste by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "united-arab-emirates-swimming",
  "name": "UAE Aquatics",
  "aliases": [
    "United Arab Emirates swimming federation"
  ],
  "type": "national",
  "country": "United Arab Emirates",
  "jurisdiction": "United Arab Emirates",
  "territories": [
    "United Arab Emirates"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for United Arab Emirates by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "uzbekistan-swimming",
  "name": "Uzbekistan Aquatics",
  "aliases": [
    "Uzbekistan swimming federation"
  ],
  "type": "national",
  "country": "Uzbekistan",
  "jurisdiction": "Uzbekistan",
  "territories": [
    "Uzbekistan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Uzbekistan by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),
  record({
  "slug": "yemen-swimming",
  "name": "Yemen Swimming & Aquatics Federation",
  "aliases": [
    "Yemen swimming federation"
  ],
  "type": "national",
  "country": "Yemen",
  "jurisdiction": "Yemen",
  "territories": [
    "Yemen"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "The national aquatics member body listed for Yemen by World Aquatics.",
  "detail": "The World Aquatics membership directory establishes the sporting affiliation. It does not establish legislative powers, government funding responsibilities, or availability of fixture, result and athlete-profile data.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-23"),

  record({
  "slug": "andorra-swimming",
  "name": "Federació Andorrana de Natació",
  "type": "national",
  "country": "Andorra",
  "jurisdiction": "Andorra",
  "territories": [
    "Andorra"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Andorra, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "armenia-swimming",
  "name": "Water Kind Sports Association & Swimming Federation of Armenia",
  "type": "national",
  "country": "Armenia",
  "jurisdiction": "Armenia",
  "territories": [
    "Armenia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Armenia, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "azerbaijan-swimming",
  "name": "Azerbaijan Swimming Federation",
  "type": "national",
  "country": "Azerbaijan",
  "jurisdiction": "Azerbaijan",
  "territories": [
    "Azerbaijan"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Azerbaijan, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "bosnia-and-herzegovina-swimming",
  "name": "Swimming Association of Bosnia and Herzegovina",
  "type": "national",
  "country": "Bosnia and Herzegovina",
  "jurisdiction": "Bosnia and Herzegovina",
  "territories": [
    "Bosnia and Herzegovina"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Bosnia and Herzegovina, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "belarus-swimming",
  "name": "Belarusian Swimming Federation",
  "type": "national",
  "country": "Belarus",
  "jurisdiction": "Belarus",
  "territories": [
    "Belarus"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Belarus, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "faroe-islands-swimming",
  "name": "Faroe Islands Aquatics Federation",
  "type": "national",
  "country": "Faroe Islands",
  "jurisdiction": "Faroe Islands",
  "territories": [
    "Faroe Islands"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Faroe Islands, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "georgia-swimming",
  "name": "Georgian Aquatic Sports National Federation",
  "type": "national",
  "country": "Georgia",
  "jurisdiction": "Georgia",
  "territories": [
    "Georgia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Georgia, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "gibraltar-swimming",
  "name": "Gibraltar Amateur Swimming Association",
  "type": "national",
  "country": "Gibraltar",
  "jurisdiction": "Gibraltar",
  "territories": [
    "Gibraltar"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Gibraltar, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "kosovo-swimming",
  "name": "Kosovo Aquatic Sports Federation",
  "type": "national",
  "country": "Kosovo",
  "jurisdiction": "Kosovo",
  "territories": [
    "Kosovo"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Kosovo, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "liechtenstein-swimming",
  "name": "Liechtensteiner Schwimmverband",
  "type": "national",
  "country": "Liechtenstein",
  "jurisdiction": "Liechtenstein",
  "territories": [
    "Liechtenstein"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Liechtenstein, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "moldova-swimming",
  "name": "Water Kind of Sports Federation of the Republic of Moldova",
  "type": "national",
  "country": "Moldova",
  "jurisdiction": "Moldova",
  "territories": [
    "Moldova"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Moldova, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "north-macedonia-swimming",
  "name": "Swimming Federation of North Macedonia",
  "type": "national",
  "country": "North Macedonia",
  "jurisdiction": "North Macedonia",
  "territories": [
    "North Macedonia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for North Macedonia, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "montenegro-swimming",
  "name": "Montenegro Swimming Federation",
  "type": "national",
  "country": "Montenegro",
  "jurisdiction": "Montenegro",
  "territories": [
    "Montenegro"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Montenegro, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "monaco-swimming",
  "name": "Fédération Monégasque de Natation",
  "type": "national",
  "country": "Monaco",
  "jurisdiction": "Monaco",
  "territories": [
    "Monaco"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Monaco, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "russia-swimming",
  "name": "Russian Aquatic Sports Federation",
  "type": "national",
  "country": "Russia",
  "jurisdiction": "Russia",
  "territories": [
    "Russia"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Russia, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "san-marino-swimming",
  "name": "Federazione Sammarinese Nuoto",
  "type": "national",
  "country": "San Marino",
  "jurisdiction": "San Marino",
  "territories": [
    "San Marino"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for San Marino, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "ukraine-swimming",
  "name": "Ukrainian Swimming Federation",
  "type": "national",
  "country": "Ukraine",
  "jurisdiction": "Ukraine",
  "territories": [
    "Ukraine"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Ukraine, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "albania-swimming",
  "name": "Albanian Swimming Federation",
  "type": "national",
  "country": "Albania",
  "jurisdiction": "Albania",
  "territories": [
    "Albania"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "National aquatics member body for Albania, listed by World Aquatics.",
  "detail": "Membership listing checked 24 October 2026. This establishes federation affiliation; competition eligibility and current event services require separate checks.",
  "website": "https://www.worldaquatics.com/members/national-federations",
  "websiteKind": "member-directory",
  "sources": [
    "https://www.worldaquatics.com/members/national-federations"
  ],
  "related": [
    "world-aquatics"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-east-region",
  "name": "Swim England East Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "Swim England East Region",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional swimming organisation publishing championship fixtures and results.",
  "detail": "Competition and results pages inspected on 24 October 2026. Individual athlete results need separate source-row checks.",
  "website": "https://www.eastswimming.org/",
  "sources": [
    "https://www.eastswimming.org/swimming/swimming-competitions/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-south-east-region",
  "name": "Swim England South East Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "Swim England South East Region",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional swimming organisation publishing championship fixtures and results.",
  "detail": "Competition and results pages inspected on 24 October 2026. Individual athlete results need separate source-row checks.",
  "website": "https://www.southeastswimming.org/",
  "sources": [
    "https://www.southeastswimming.org/swimming/long-course-championships-2027/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),

  record({
  "slug": "swim-england-north-west-region",
  "name": "Swim England North West Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "North West Region, England",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional aquatics organisation supporting affiliated clubs, volunteers and competition opportunities.",
  "detail": "Listed among Swim England’s eight regions. Official regional pages inspected on 24 October 2026. Results indexes are research references; individual performances require separate source-row checks.",
  "website": "https://swimnorthwest.org/",
  "sources": [
    "https://www.swimming.org/swimengland/regions/",
    "https://swimnorthwest.org/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-north-east-region",
  "name": "Swim England North East Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "North East Region, England",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional aquatics organisation supporting affiliated clubs, volunteers and competition opportunities.",
  "detail": "Listed among Swim England’s eight regions. Official regional pages inspected on 24 October 2026. Results indexes are research references; individual performances require separate source-row checks.",
  "website": "https://asaner.org.uk/",
  "sources": [
    "https://www.swimming.org/swimengland/regions/",
    "https://asaner.org.uk/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-east-midlands-region",
  "name": "Swim England East Midlands Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "East Midlands Region, England",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional aquatics organisation supporting affiliated clubs, volunteers and competition opportunities.",
  "detail": "Listed among Swim England’s eight regions. Official regional pages inspected on 24 October 2026. Results indexes are research references; individual performances require separate source-row checks.",
  "website": "https://eastmidlandswimming.org/",
  "sources": [
    "https://www.swimming.org/swimengland/regions/",
    "https://eastmidlandswimming.org/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-west-midland-region",
  "name": "Swim England West Midland Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "West Midland Region, England",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional aquatics organisation supporting affiliated clubs, volunteers and competition opportunities.",
  "detail": "Listed among Swim England’s eight regions. Official regional pages inspected on 24 October 2026. Results indexes are research references; individual performances require separate source-row checks.",
  "website": "https://westmidlandswimming.org.uk/",
  "sources": [
    "https://www.swimming.org/swimengland/regions/",
    "https://westmidlandswimming.org.uk/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-london-region",
  "name": "Swim England London Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "London Region, England",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional aquatics organisation supporting affiliated clubs, volunteers and competition opportunities.",
  "detail": "Listed among Swim England’s eight regions. Official regional pages inspected on 24 October 2026. Results indexes are research references; individual performances require separate source-row checks.",
  "website": "https://www.swimming.org/london/",
  "sources": [
    "https://www.swimming.org/swimengland/regions/",
    "https://www.swimming.org/london/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),
  record({
  "slug": "swim-england-south-west-region",
  "name": "Swim England South West Region",
  "type": "regional",
  "country": "England",
  "jurisdiction": "South West Region, England",
  "territories": [
    "England",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Regional aquatics organisation supporting affiliated clubs, volunteers and competition opportunities.",
  "detail": "Listed among Swim England’s eight regions. Official regional pages inspected on 24 October 2026. Results indexes are research references; individual performances require separate source-row checks.",
  "website": "https://www.swimwest.org.uk/",
  "sources": [
    "https://www.swimming.org/swimengland/regions/",
    "https://www.swimwest.org.uk/"
  ],
  "related": [
    "swim-england"
  ]
}, "2026-10-24"),

  record({
  "slug": "sasa-east-district",
  "name": "SASA East District",
  "type": "regional",
  "country": "Scotland",
  "jurisdiction": "SASA East District, Scotland",
  "territories": [
    "Scotland",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Scottish Swimming district supporting affiliated clubs, aquatic competition and volunteers.",
  "detail": "District identity and services checked on its official website on 24 October 2026. Results indexes support research; individual athlete performances require separate source-row checks.",
  "website": "https://www.sasaeastdistrict.org.uk/",
  "sources": [
    "https://www.sasaeastdistrict.org.uk/",
    "https://www.sasaeastdistrict.org.uk/about-us-contact/"
  ],
  "related": [
    "scottish-swimming"
  ]
}, "2026-10-24"),
  record({
  "slug": "sasa-midland-district",
  "name": "SASA Midland District",
  "type": "regional",
  "country": "Scotland",
  "jurisdiction": "SASA Midland District, Scotland",
  "territories": [
    "Scotland",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Scottish Swimming district supporting affiliated clubs, aquatic competition and volunteers.",
  "detail": "District identity and services checked on its official website on 24 October 2026. Results indexes support research; individual athlete performances require separate source-row checks.",
  "website": "https://www.sasamidlanddistrict.co.uk/",
  "sources": [
    "https://www.sasamidlanddistrict.co.uk/",
    "https://www.sasamidlanddistrict.co.uk/about"
  ],
  "related": [
    "scottish-swimming"
  ]
}, "2026-10-24"),
  record({
  "slug": "sasa-north-district",
  "name": "SASA North District",
  "type": "regional",
  "country": "Scotland",
  "jurisdiction": "SASA North District, Scotland",
  "territories": [
    "Scotland",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Scottish Swimming district supporting affiliated clubs, aquatic competition and volunteers.",
  "detail": "District identity and services checked on its official website on 24 October 2026. Results indexes support research; individual athlete performances require separate source-row checks.",
  "website": "https://www.sasanorth.org.uk/",
  "sources": [
    "https://www.sasanorth.org.uk/"
  ],
  "related": [
    "scottish-swimming"
  ]
}, "2026-10-24"),
  record({
  "slug": "sasa-west-district",
  "name": "SASA West District",
  "type": "regional",
  "country": "Scotland",
  "jurisdiction": "SASA West District, Scotland",
  "territories": [
    "Scotland",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Scottish Swimming district supporting affiliated clubs, aquatic competition and volunteers.",
  "detail": "District identity and services checked on its official website on 24 October 2026. Results indexes support research; individual athlete performances require separate source-row checks.",
  "website": "https://www.scotswimwest.co.uk/",
  "sources": [
    "https://www.scotswimwest.co.uk/"
  ],
  "related": [
    "scottish-swimming"
  ]
}, "2026-10-24"),
  record({
  "slug": "scottish-schools-swimming-association",
  "name": "Scottish Schools Swimming Association",
  "type": "specialist",
  "country": "Scotland",
  "jurisdiction": "School swimming in Scotland",
  "territories": [
    "Scotland",
    "United Kingdom"
  ],
  "sports": [
    "swimming"
  ],
  "summary": "Organises Scottish schools swimming championship finals and team relay championships.",
  "detail": "Official 2027 finals announcement and 2026 individual and team results indexes inspected on 24 October 2026. Qualification is administered through area representatives.",
  "website": "https://www.scottishschoolsswimming.co.uk/",
  "sources": [
    "https://www.scottishschoolsswimming.co.uk/"
  ],
  "related": [
    "scottish-swimming"
  ]
}, "2026-10-24"),
  record({
    "slug": "swim-england-norfolk",
    "name": "Swim England Norfolk",
    "aliases": [
      "Norfolk County ASA"
    ],
    "jurisdiction": "Norfolk",
    "website": "https://norfolkswimming.org.uk/",
    "related": [
      "swim-england",
      "swim-england-east-region"
    ],
    "summary": "County swimming association organising competitions and maintaining county swimming records.",
    "detail": "Supports affiliated clubs and county competitions, including the County Championships, relay gala, County Challenge and open-water results.",
    "sources": [
      "https://norfolkswimming.org.uk/",
      "https://norfolkswimming.org.uk/swimming-results/",
      "https://norfolkswimming.org.uk/swimming-records-2/"
    ],
    "type": "regional",
    "country": "England",
    "territories": [
      "England",
      "United Kingdom"
    ],
    "sports": [
      "swimming"
    ]
  }, "2026-10-24"),
  record({
    "slug": "swim-england-suffolk",
    "name": "Swim England Suffolk",
    "aliases": [
      "Suffolk County ASA"
    ],
    "jurisdiction": "Suffolk",
    "website": "https://www.suffolkswimming.org.uk/",
    "related": [
      "swim-england",
      "swim-england-east-region"
    ],
    "summary": "County aquatics association supporting swimming competitions, clubs and volunteers in Suffolk.",
    "detail": "Organises county championships and development competitions, with separate information for masters, open-water swimming, leagues and county records.",
    "sources": [
      "https://www.suffolkswimming.org.uk/",
      "https://www.suffolkswimming.org.uk/county-championships.html",
      "https://www.suffolkswimming.org.uk/results.html"
    ],
    "type": "regional",
    "country": "England",
    "territories": [
      "England",
      "United Kingdom"
    ],
    "sports": [
      "swimming"
    ]
  }, "2026-10-24"),
  record({
    "slug": "swim-england-essex",
    "name": "Swim England Essex",
    "aliases": [
      "Essex County ASA"
    ],
    "jurisdiction": "Essex county swimming",
    "website": "https://www.essexswimming.org/wp/",
    "related": [
      "swim-england",
      "swim-england-east-region",
      "swim-england-london-region"
    ],
    "summary": "County association supporting swimming and other aquatic disciplines across Essex clubs.",
    "detail": "Works across Swim England East and London Regions. Its programme includes age-group, masters, winter and SwimAbility championships, with county records and results archives.",
    "sources": [
      "https://www.essexswimming.org/wp/",
      "https://www.essexswimming.org/wp/?page_id=103",
      "https://www.essexswimming.org/wp/?cat=34"
    ],
    "type": "regional",
    "country": "England",
    "territories": [
      "England",
      "United Kingdom"
    ],
    "sports": [
      "swimming"
    ]
  }, "2026-10-24"),
  record({
    "slug": "cambridgeshire-asa",
    "name": "Cambridgeshire ASA",
    "aliases": [
      "Cambridgeshire County Amateur Swimming Association",
      "Swim England Cambridgeshire"
    ],
    "jurisdiction": "Cambridgeshire",
    "website": "https://www.swimcambs.org/",
    "related": [
      "swim-england",
      "swim-england-east-region"
    ],
    "summary": "County aquatics association organising swimming championships and supporting club development.",
    "detail": "Provides county and development championships, swimming records, meet-licensing information and support for masters, diving, open-water and disability swimming.",
    "sources": [
      "https://www.swimcambs.org/",
      "https://www.swimcambs.org/swimming/competitions/",
      "https://www.swimcambs.org/important-updates-for-2027-championships/"
    ],
    "type": "regional",
    "country": "England",
    "territories": [
      "England",
      "United Kingdom"
    ],
    "sports": [
      "swimming"
    ]
  }, "2026-10-24"),
  record({
    "slug": "hampshire-county-asa",
    "name": "Hampshire County ASA",
    "aliases": [
      "Hampshire County Amateur Swimming Association",
      "Hampshire and Channel Islands ASA"
    ],
    "jurisdiction": "Hampshire and the Channel Islands",
    "website": "https://hampshireswimming.com/",
    "related": [
      "swim-england",
      "swim-england-south-east-region"
    ],
    "summary": "County swimming association organising championship, development and masters competitions.",
    "detail": "Publishes county competition programmes and results for Hampshire and Channel Islands swimmers, with support for clubs, officials and county teams.",
    "sources": [
      "https://hampshireswimming.com/",
      "https://hampshireswimming.com/speed-swimming/county-swimming-competitions/2027-county-swimming-championships",
      "https://hampshireswimming.com/hampshire-county-development-meet-2027"
    ],
    "type": "regional",
    "country": "England",
    "territories": [
      "England",
      "United Kingdom"
    ],
    "sports": [
      "swimming"
    ]
  }, "2026-10-24"),
];
