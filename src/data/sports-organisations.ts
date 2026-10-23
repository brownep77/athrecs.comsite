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
    sources: ["https://www.worldaquatics.com/", "https://swimireland.ie/about/"],
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
    slug: "british-triathlon",
    name: "British Triathlon",
    aliases: ["British Triathlon Federation", "BTF"],
    type: "national",
    country: "United Kingdom",
    jurisdiction: "Great Britain",
    territories: gb,
    sports: multisport,
    website: "https://www.britishtriathlon.org/",
    summary: "Governs triathlon, duathlon and related multisport in Great Britain.",
    detail:
      "Its member associations are Triathlon England, Triathlon Scotland and Welsh Triathlon. Triathlon Ireland’s remit covers the Republic of Ireland and Northern Ireland. Team eligibility is governed by the relevant selection rules.",
    sources: [
      "https://www.britishtriathlon.org/about-us",
      "https://www.triathlonireland.com/get-involved/triathlon-ireland-faqs/",
    ],
    related: [
      "world-triathlon",
      "triathlon-england",
      "triathlon-scotland",
      "welsh-triathlon",
      "triathlon-ireland",
    ],
  }),
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
    slug: "triathlon-ireland",
    name: "Triathlon Ireland",
    type: "national",
    country: "Ireland",
    jurisdiction: "Island of Ireland, including Northern Ireland",
    territories: ireland,
    sports: multisport,
    website: "https://www.triathlonireland.com/",
    summary:
      "Governs triathlon, duathlon and related multisport in the Republic of Ireland and Northern Ireland.",
    sources: ["https://www.triathlonireland.com/get-involved/triathlon-ireland-faqs/"],
    related: ["world-triathlon"],
  }),
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
  federation(
    "usa-triathlon",
    "USA Triathlon",
    "United States",
    multisport,
    "https://www.usatriathlon.org/",
    "US governing body for triathlon and multisport, including duathlon.",
    ["https://www.usatriathlon.org/multisport/rules"],
    ["world-triathlon"],
  ),
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
  federation(
    "triathlon-canada",
    "Triathlon Canada",
    "Canada",
    multisport,
    "https://www.triathloncanada.com/",
    "Canada’s triathlon governing body, also supporting duathlon and related multisport.",
    [
      "https://www.triathloncanada.com/",
      "https://www.triathloncanada.com/athletes-teams/multisport/",
    ],
    ["world-triathlon"],
  ),
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
  federation(
    "austriathlon",
    "AusTriathlon",
    "Australia",
    multisport,
    "https://www.triathlon.org.au/",
    "Australia’s national triathlon organisation, covering triathlon and multisport.",
    ["https://www.ausport.gov.au/australian_sports_directory", "https://www.triathlon.org.au/"],
    ["world-triathlon"],
  ),
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
  federation(
    "triathlon-new-zealand",
    "Triathlon New Zealand",
    "New Zealand",
    multisport,
    "https://www.triathlon.kiwi/",
    "New Zealand’s national triathlon and multisport organisation.",
    ["https://www.triathlon.kiwi/"],
    ["world-triathlon"],
  ),
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
    ["https://triathlonsa.co.za/"],
    ["world-triathlon"],
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
  federation(
    "french-triathlon",
    "Fédération Française de Triathlon",
    "France",
    multisport,
    "https://www.fftri.com/",
    "National federation for triathlon and related multisport, including duathlon, in France.",
    ["https://triathlon.org/members/federation-francaise-de-triathlon", "https://www.fftri.com/"],
    ["world-triathlon", "europe-triathlon"],
    ["FFTri", "French Triathlon Federation"],
  ),
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
  federation(
    "german-triathlon",
    "Deutsche Triathlon Union",
    "Germany",
    multisport,
    "https://www.triathlondeutschland.de/",
    "National federation for triathlon and related multisport, including duathlon, in Germany.",
    [
      "https://triathlon.org/members/deutsche-triathlon-union",
      "https://www.triathlondeutschland.de/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["DTU", "German Triathlon Union"],
  ),
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
  federation(
    "spanish-triathlon",
    "Federación Española de Triatlón",
    "Spain",
    multisport,
    "https://www.triatlon.org/",
    "National federation for triathlon and related multisport, including duathlon, in Spain.",
    ["https://triathlon.org/members/federacion-espanola-de-triatlon", "https://www.triatlon.org/"],
    ["world-triathlon", "europe-triathlon"],
    ["FETRI", "Spanish Triathlon Federation"],
  ),
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
  federation(
    "italian-triathlon",
    "Federazione Italiana Triathlon",
    "Italy",
    multisport,
    "https://www.fitri.it/it/",
    "National federation for triathlon and related multisport, including duathlon, in Italy.",
    ["https://triathlon.org/members/italian-triathlon-federation", "https://www.fitri.it/it/"],
    ["world-triathlon", "europe-triathlon"],
    ["FITri", "Italian Triathlon Federation"],
  ),
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
  federation(
    "portuguese-triathlon",
    "Federação de Triatlo de Portugal",
    "Portugal",
    multisport,
    "https://www.federacao-triatlo.pt/",
    "National federation for triathlon and related multisport, including duathlon, in Portugal.",
    [
      "https://triathlon.org/members/federacao-de-triatlo-de-portugal",
      "https://www.federacao-triatlo.pt/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["FTP", "Portuguese Triathlon Federation"],
  ),
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
  federation(
    "dutch-triathlon",
    "Nederlandse Triathlon Bond",
    "Netherlands",
    multisport,
    "https://www.triathlonbond.nl/",
    "National federation for triathlon and related multisport, including duathlon, in Netherlands.",
    ["https://triathlon.org/members/nederlandse-triathlon-bond", "https://www.triathlonbond.nl/"],
    ["world-triathlon", "europe-triathlon"],
    ["NTB", "Dutch Triathlon Federation"],
  ),
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
  federation(
    "belgian-triathlon",
    "Belgian Triathlon",
    "Belgium",
    multisport,
    "https://www.triathlon.be/",
    "National federation for triathlon and related multisport, including duathlon, in Belgium.",
    [
      "https://triathlon.org/members/belgium-triathlon-duathlon-federation",
      "https://www.triathlon.be/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["Be3", "Belgian Triathlon and Duathlon Federation"],
  ),
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
  federation(
    "swiss-triathlon",
    "Swiss Triathlon",
    "Switzerland",
    multisport,
    "https://swisstriathlon.ch/",
    "National federation for triathlon and related multisport, including duathlon, in Switzerland.",
    ["https://triathlon.org/members/swiss-triathlon-federation", "https://swisstriathlon.ch/"],
    ["world-triathlon", "europe-triathlon"],
    ["Swiss Triathlon Federation"],
  ),
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
  federation(
    "swedish-triathlon",
    "Svenska Triathlonförbundet",
    "Sweden",
    multisport,
    "https://www.svensktriathlon.org/",
    "National federation for triathlon and related multisport, including duathlon, in Sweden.",
    [
      "https://triathlon.org/members/swedish-triathlon-federation",
      "https://www.svensktriathlon.org/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["Swedish Triathlon Federation"],
  ),
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
  federation(
    "danish-triathlon",
    "Triatlon Danmark",
    "Denmark",
    multisport,
    "https://www.triatlon.dk/",
    "National federation for triathlon and related multisport, including duathlon, in Denmark.",
    ["https://triathlon.org/members/danish-triathlon-federation", "https://www.triatlon.dk/"],
    ["world-triathlon", "europe-triathlon"],
    ["Triathlon Denmark", "Danish Triathlon Federation"],
  ),
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
  federation(
    "triathlon-japan",
    "Triathlon Japan",
    "Japan",
    multisport,
    "https://www.jtu.or.jp/",
    "National federation for triathlon and related multisport, including duathlon, in Japan.",
    ["https://www.jtu.or.jp/"],
    ["world-triathlon"],
    ["Japan Triathlon Union", "JTU", "トライアスロンジャパン"],
  ),
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
  federation(
    "brazilian-triathlon",
    "Confederação Brasileira de Triathlon",
    "Brazil",
    multisport,
    "https://cbtri.org.br/",
    "National federation for triathlon and related multisport, including duathlon, in Brazil.",
    ["https://cbtri.org.br/sobre-nos/", "https://cbtri.org.br/"],
    ["world-triathlon"],
    ["CBTri", "Brasil Triathlon", "Brazilian Triathlon Confederation"],
  ),
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
  federation(
    "austrian-triathlon",
    "Triathlon Austria",
    "Austria",
    multisport,
    "https://www.triathlon-austria.at/",
    "National federation for triathlon and related multisport, including duathlon, in Austria.",
    [
      "https://triathlon.org/members/austrian-triathlon-federation",
      "https://www.triathlon-austria.at/de/service-termine",
      "https://www.triathlon-austria.at/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["Österreichischer Triathlonverband", "ÖTRV", "Austrian Triathlon Federation"],
  ),
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
  federation(
    "finnish-triathlon",
    "Triathlon Finland",
    "Finland",
    multisport,
    "https://www.triathlon.fi/",
    "National federation for triathlon and related multisport, including duathlon, in Finland.",
    [
      "https://triathlon.org/members/finnish-triathlon-federation",
      "https://www.triathlon.fi/tapahtumat2/",
      "https://www.triathlon.fi/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["Suomen Triathlonliitto", "Finnish Triathlon Federation"],
  ),
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
  federation(
    "norwegian-triathlon",
    "Norges Triatlonforbund",
    "Norway",
    multisport,
    "https://www.triatlonforbundet.no/",
    "National federation for triathlon and related multisport, including duathlon, in Norway.",
    [
      "https://triathlon.org/members/norwegian-triathlon-federation",
      "https://www.triatlonforbundet.no/terminliste/",
      "https://www.triatlonforbundet.no/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["Norwegian Triathlon Federation"],
  ),
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
  federation(
    "polish-triathlon",
    "Polski Związek Triathlonu",
    "Poland",
    multisport,
    "https://www.triathlon.pl/",
    "National federation for triathlon and related multisport, including duathlon, in Poland.",
    [
      "https://triathlon.org/members/polski-zwiazek-triathlonu",
      "https://triathlon.pl/kalendarz/",
      "https://www.triathlon.pl/",
    ],
    ["world-triathlon", "europe-triathlon"],
    ["PZTri", "Polish Triathlon Federation"],
  ),
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
  federation(
    "indian-triathlon",
    "Indian Triathlon Federation",
    "India",
    multisport,
    "https://www.triathlonindia.com/",
    "National federation for triathlon and related multisport, including duathlon, in India.",
    [
      "https://triathlon.org/members/indian-triathlon-federation",
      "https://www.triathlonindia.com/events/event-sanction-process",
      "https://www.triathlonindia.com/",
    ],
    ["world-triathlon"],
    ["ITF"],
  ),
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
  federation(
    "singapore-triathlon",
    "Triathlon Singapore",
    "Singapore",
    multisport,
    "https://www.triathlonsingapore.org/",
    "National federation for triathlon and related multisport, including duathlon, in Singapore.",
    [
      "https://triathlon.org/members/triathlon-association-of-singapore",
      "https://www.triathlonsingapore.org/events/sanctioned-events/",
      "https://www.triathlonsingapore.org/",
    ],
    ["world-triathlon"],
    ["Triathlon Association of Singapore", "TAS"],
  ),
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
    ],
    ["world-triathlon"],
    ["Kenyan Triathlon Association", "KTF"],
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
  federation(
    "bermuda-triathlon",
    "Bermuda Triathlon Association",
    "Bermuda",
    ["triathlon"],
    "https://bermudatriathlon.com/",
    "Bermuda’s triathlon association, supporting the sport and national representation through World Triathlon.",
    ["https://triathlon.org/members/bermuda-triathlon-federation", "https://bermudatriathlon.com/"],
    ["world-triathlon"],
    ["BTA", "Bermuda Triathlon Federation"],
  ),
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
  federation(
    "czech-triathlon",
    "Czech Triathlon Association",
    "Czechia",
    multisport,
    "https://triatlon.cz/",
    "National federation for triathlon and related multisport, including duathlon, in Czechia.",
    [
      "https://triathlon.org/members/czech-triathlon-federation",
      "https://triatlon.cz/",
      "https://triatlon.cz/wp-content/uploads/Soutezni-smernice_2026_1F.pdf",
    ],
    ["world-triathlon"],
    ["Česká triatlonová asociace", "Czech Republic Triathlon"],
  ),
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
  federation(
    "hungarian-triathlon",
    "Hungarian Triathlon Federation",
    "Hungary",
    multisport,
    "https://triatlon.hu/",
    "National federation for triathlon and related multisport, including duathlon, in Hungary.",
    [
      "https://triathlon.org/members/hungarian-triathlon-federation",
      "https://triatlon.hu/",
      "https://triatlon.hu/versenynaptar/",
    ],
    ["world-triathlon"],
    ["Magyar Triatlon Szövetség"],
  ),
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
  federation(
    "romanian-triathlon",
    "Triathlon Romania",
    "Romania",
    multisport,
    "https://triatlonromania.ro/",
    "National federation for triathlon and related multisport, including duathlon, in Romania.",
    ["https://triathlon.org/members/romanian-triathlon-federation", "https://triatlonromania.ro/"],
    ["world-triathlon"],
    ["Federația Română de Triatlon", "Romanian Triathlon Federation"],
  ),
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
  federation(
    "hellenic-triathlon",
    "Hellenic Triathlon Federation",
    "Greece",
    multisport,
    "https://hellastriathlon.gr/en/",
    "National federation for triathlon and related multisport, including duathlon, in Greece.",
    [
      "https://triathlon.org/members/hellenic-triathlon-federation",
      "https://hellastriathlon.gr/en/",
      "https://www.hoc.gr/en/members/hellenic-federation-of-triathlon/",
      "https://hellastriathlon.gr/agonistiko-programma-2026/",
    ],
    ["world-triathlon"],
    ["Greek Triathlon Federation"],
  ),
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
  federation(
    "turkish-triathlon",
    "Türkiye Triathlon Federation",
    "Turkey",
    multisport,
    "https://www.triatlon.org.tr/",
    "National federation for triathlon and related multisport, including duathlon, in Turkey.",
    ["https://triathlon.org/members/turkish-triathlon-federation", "https://www.triatlon.org.tr/"],
    ["world-triathlon"],
    ["Türkiye Triatlon Federasyonu", "Turkish Triathlon Federation"],
  ),
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
  federation(
    "estonian-triathlon",
    "Estonian Triathlon Association",
    "Estonia",
    multisport,
    "https://www.triatlon.ee/",
    "National federation for triathlon and related multisport, including duathlon, in Estonia.",
    ["https://triathlon.org/members/estonian-triathlon-federation", "https://www.triatlon.ee/"],
    ["world-triathlon"],
    ["Eesti Triatloni Liit", "Estonian Triathlon Federation"],
  ),
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
  federation(
    "latvian-triathlon",
    "Latvian Triathlon Federation",
    "Latvia",
    multisport,
    "https://www.triatlons.lv/",
    "National federation for triathlon and related multisport, including duathlon, in Latvia.",
    [
      "https://triathlon.org/members/latvian-triathlon-federation",
      "https://www.triatlons.lv/",
      "https://www.triatlons.lv/lv/news/ltf-kausa-izcina-ieklautas-sacensibas-2026-gada-sezona-1b95821f-890a-405c-bcf7-44fa6ac86cc7",
    ],
    ["world-triathlon"],
    ["Latvijas Triatlona federācija"],
  ),
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
  federation(
    "lithuanian-triathlon",
    "Lithuanian Triathlon Federation",
    "Lithuania",
    ["triathlon"],
    "https://www.triatlonas.lt/",
    "National federation for triathlon in Lithuania, supporting clubs, national championships and international representation.",
    ["https://triathlon.org/members/lithuanian-triathlon-federation", "https://www.triatlonas.lt/"],
    ["world-triathlon"],
    ["Lietuvos triatlono federacija"],
  ),
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
  federation(
    "mexican-triathlon",
    "Federación Mexicana de Triatlón",
    "Mexico",
    multisport,
    "https://triatlon.com.mx/",
    "National federation for triathlon and related multisport, including duathlon, in Mexico.",
    ["https://triathlon.org/members/federacion-mexicana-de-triatlon", "https://triatlon.com.mx/"],
    ["world-triathlon"],
    ["Mexican Triathlon Federation", "FMTRI"],
  ),
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
  federation(
    "korean-triathlon",
    "Korea Triathlon Federation",
    "South Korea",
    multisport,
    "https://triathlon.or.kr/",
    "National federation for triathlon and related multisport, including duathlon, in South Korea.",
    [
      "https://triathlon.org/members/korean-triathlon-federation",
      "https://triathlon.or.kr/",
      "https://triathlon.or.kr/events/tour/",
    ],
    ["world-triathlon"],
    ["Republic of Korea Triathlon", "대한철인3종협회"],
  ),

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
  {
    ...federation(
      "argentine-triathlon",
      "Federación Argentina de Triatlón",
      "Argentina",
      ["triathlon"],
      "https://triathlon.org/members/federacion-argentina-de-triatlon",
      "National federation for triathlon in Argentina, recognised by World Triathlon.",
      ["https://triathlon.org/members/federacion-argentina-de-triatlon"],
      ["world-triathlon"],
      ["FAT", "Argentine Triathlon Federation"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Argentina’s World Triathlon member profile, with current federation contact information and its listed social channel.",
  },
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
  federation(
    "chilean-triathlon",
    "Federación Chilena de Triatlón",
    "Chile",
    multisport,
    "https://triatlonchile.cl/",
    "National federation for triathlon and related multisport, including duathlon, in Chile.",
    [
      "https://triathlon.org/members/federacion-chilena-de-triathlon",
      "https://triatlonchile.cl/",
      "https://triatlonchile.cl/noticias/convocatoria-internacional-age-group-2026-id-22500",
    ],
    ["world-triathlon"],
    ["FECHITRI", "Chilean Triathlon Federation"],
  ),
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
  {
    ...federation(
      "colombian-triathlon",
      "Federación Colombiana de Triatlón",
      "Colombia",
      ["triathlon"],
      "https://triathlon.org/members/federacion-colombiana-de-triathlon",
      "National federation for triathlon in Colombia, recognised by World Triathlon.",
      ["https://triathlon.org/members/federacion-colombiana-de-triathlon"],
      ["world-triathlon"],
      ["FEDECOLTRI", "Colombian Triathlon Federation"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Colombia’s World Triathlon member profile. The standalone federation website was displaying a maintenance page at the time of review.",
  },
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
  federation(
    "malaysian-triathlon",
    "Malaysia Triathlon Association",
    "Malaysia",
    multisport,
    "https://malaysiatriathlon.wordpress.com/",
    "National federation for triathlon and related multisport, including duathlon, in Malaysia.",
    [
      "https://triathlon.org/members/triathlon-association-of-malaysia",
      "https://malaysiatriathlon.wordpress.com/",
      "https://malaysiatriathlon.wordpress.com/about-malaysia-triathlon/",
    ],
    ["world-triathlon"],
    ["Malaysia Triathlon", "Persatuan Triathlon Malaysia Baru", "MTA"],
  ),
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
  {
    ...federation(
      "thai-triathlon",
      "Thailand Triathlon",
      "Thailand",
      ["triathlon"],
      "https://triathlon.org/members/triathlon-association-of-thailand",
      "National federation for triathlon in Thailand, recognised by World Triathlon.",
      ["https://triathlon.org/members/triathlon-association-of-thailand"],
      ["world-triathlon"],
      ["Triathlon Association of Thailand", "Thai Triathlon"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Thailand’s World Triathlon member profile, which lists the federation’s affiliation and contact information. No standalone website is listed in that member entry.",
  },
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
  {
    ...federation(
      "philippine-triathlon",
      "Triathlon Association of the Philippines",
      "Philippines",
      ["triathlon"],
      "https://triathlon.org/members/triathlon-association-of-the-philippines",
      "National federation for triathlon in Philippines, recognised by World Triathlon.",
      ["https://triathlon.org/members/triathlon-association-of-the-philippines"],
      ["world-triathlon"],
      ["TriPhil", "Triathlon Philippines", "TRAP"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Philippines’ World Triathlon member profile, with federation contact details. The standalone site listed there could not be retrieved during this review.",
  },
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
  {
    ...federation(
      "indonesian-triathlon",
      "Indonesian Triathlon Federation",
      "Indonesia",
      ["triathlon"],
      "https://triathlon.org/members/indonesian-triathlon-federation",
      "National federation for triathlon in Indonesia, recognised by World Triathlon.",
      ["https://triathlon.org/members/indonesian-triathlon-federation"],
      ["world-triathlon"],
      ["Federasi Triathlon Indonesia", "FTI"],
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Indonesia’s World Triathlon member profile, with federation contact details. The standalone site listed there could not be retrieved during this review.",
  },
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
  federation(
    "hong-kong-triathlon",
    "Triathlon Association of Hong Kong China",
    "Hong Kong",
    multisport,
    "https://www.triathlon.com.hk/",
    "Governing body for triathlon and related multisport, including duathlon, in Hong Kong.",
    [
      "https://triathlon.org/members/hong-kong-triathlon-association",
      "https://www.triathlon.com.hk/",
      "https://www.triathlon.com.hk/en/event/trihk_race_info/",
    ],
    ["world-triathlon"],
    ["TriHK", "Hong Kong Triathlon", "Hong Kong, China"],
  ),

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
  federation(
    "croatian-triathlon",
    "Hrvatski triatlon savez",
    "Croatia",
    multisport,
    "https://triatlon.hr/",
    "National federation for triathlon and related multisport, including duathlon, in Croatia.",
    [
      "https://triathlon.org/members/croatian-triathlon-federation",
      "https://triatlon.hr/",
      "https://triatlon.hr/wp-content/uploads/2026/05/Raspis-6.Polojski-duatlon-PH-u-SS-duatlonu-2026-2152026.pdf",
    ],
    ["world-triathlon"],
    ["HTS", "Croatian Triathlon Federation"],
  ),
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
  federation(
    "slovenian-triathlon",
    "Triatlon zveza Slovenije",
    "Slovenia",
    multisport,
    "https://triatlonslovenije.si/",
    "National federation for triathlon and related multisport, including duathlon, in Slovenia.",
    [
      "https://triathlon.org/members/slovenian-triathlon-federation",
      "https://triatlonslovenije.si/",
    ],
    ["world-triathlon"],
    ["TZS", "Slovenian Triathlon Federation"],
  ),
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
  federation(
    "slovak-triathlon",
    "Slovenská triatlonová únia",
    "Slovakia",
    multisport,
    "https://www.triathlon.sk/",
    "National federation for triathlon and related multisport, including duathlon, in Slovakia.",
    [
      "https://triathlon.org/members/slovak-triathlon-union",
      "https://www.triathlon.sk/",
      "https://www.triathlon.sk/vyzva-pre-organizatorov-podujati-v-roku-2026-369",
    ],
    ["world-triathlon"],
    ["STÚ", "STU", "Slovak Triathlon Union"],
  ),
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
  federation(
    "serbian-triathlon",
    "Srpski triatlon",
    "Serbia",
    multisport,
    "https://triatlon.org.rs/",
    "National federation for triathlon and related multisport, including duathlon, in Serbia.",
    ["https://triathlon.org/members/serbian-triathon-union", "https://triatlon.org.rs/"],
    ["world-triathlon"],
    ["ST", "Serbia Triathlon", "Serbian Triathlon Union"],
  ),
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
  federation(
    "bulgarian-triathlon",
    "Bulgarian Triathlon Association",
    "Bulgaria",
    multisport,
    "https://bat.triathlon.bg/",
    "National federation for triathlon and related multisport, including duathlon, in Bulgaria.",
    [
      "https://triathlon.org/members/bulgarian-triathlon-federation",
      "https://bat.triathlon.bg/",
      "https://bat.triathlon.bg/wp-content/uploads/2024/04/pravila-za-provezhdane-na-darzhvani-parvenstva-bat.pdf",
    ],
    ["world-triathlon"],
    ["BAT", "Българска асоциация по триатлон", "БАТ"],
  ),
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
  federation(
    "icelandic-triathlon",
    "Þríþrautarsamband Íslands",
    "Iceland",
    ["triathlon"],
    "https://triathlon.is/",
    "National federation for triathlon in Iceland, recognised by World Triathlon.",
    ["https://triathlon.org/members/icelandic-triathlon-committee", "https://triathlon.is/"],
    ["world-triathlon"],
    ["ÞRÍ", "Icelandic Triathlon Federation", "Thrithrautarsamband Islands"],
  ),
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
  federation(
    "luxembourg-triathlon",
    "Fédération Luxembourgeoise de Triathlon",
    "Luxembourg",
    multisport,
    "https://www.fltri.lu/",
    "National federation for triathlon and related multisport, including duathlon, in Luxembourg.",
    [
      "https://triathlon.org/members/federation-luxembourgeoise-de-triathlon",
      "https://www.fltri.lu/",
    ],
    ["world-triathlon"],
    ["FLTRI", "Luxembourg Triathlon Federation"],
  ),
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
  federation(
    "israeli-triathlon",
    "Israeli Triathlon Association",
    "Israel",
    ["triathlon"],
    "https://www.triathlon.org.il/",
    "National federation for triathlon in Israel, recognised by World Triathlon.",
    [
      "https://triathlon.org/members/israeli-triathlon-association",
      "https://www.triathlon.org.il/",
    ],
    ["world-triathlon"],
    ["ITA", "Israel Triathlon Association", "איגוד הטריאתלון הישראלי"],
  ),

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
  {
    ...federation(
      "jamaican-triathlon",
      "Jamaica Triathlon Association",
      "Jamaica",
      ["triathlon"],
      "https://triathlon.org/members/jamaican-triathlon-federation",
      "National federation for triathlon in Jamaica.",
      ["https://triathlon.org/members/jamaican-triathlon-federation"],
      ["world-triathlon"],
      ["JTA", "Jamaican Triathlon"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Jamaica’s World Triathlon member profile, which lists the association and its social channel.",
  },
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
  federation(
    "barbadian-triathlon",
    "Barbados Federation of Island Triathletes",
    "Barbados",
    ["triathlon", "duathlon"],
    "https://triathlonbarbados.com/",
    "National federation for triathlon and duathlon in Barbados.",
    [
      "https://triathlon.org/members/barbados-federation-of-island-triathletes",
      "https://triathlonbarbados.com/",
      "https://triathlonbarbados.com/services/duathlon-championships/",
    ],
    ["world-triathlon"],
    ["BFIT", "Barbados Triathlon"],
    "2026-10-23",
  ),
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
  federation(
    "bahamian-triathlon",
    "Bahamas Triathlon Association",
    "Bahamas",
    ["triathlon"],
    "https://www.bahamastriathlon.org/",
    "National federation for triathlon in Bahamas.",
    ["https://triathlon.org/members/bahamas-triathlon", "https://www.bahamastriathlon.org/"],
    ["world-triathlon"],
    ["BTA", "Bahamian Triathlon"],
    "2026-10-23",
  ),
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
  federation(
    "trinidad-tobago-triathlon",
    "Trinidad and Tobago Triathlon Federation",
    "Trinidad and Tobago",
    ["triathlon", "duathlon"],
    "https://triathlon.co.tt/",
    "National federation for triathlon and duathlon in Trinidad and Tobago.",
    [
      "https://triathlon.org/members/trinidad-tobago-triathlon-association",
      "https://triathlon.co.tt/",
      "https://triathlon.co.tt/events",
    ],
    ["world-triathlon"],
    ["TTTF", "Trinidad & Tobago Triathlon Federation"],
    "2026-10-23",
  ),
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
  federation(
    "cypriot-triathlon",
    "Cyprus Triathlon Federation",
    "Cyprus",
    ["triathlon", "duathlon"],
    "https://cytrifed.org/",
    "National federation for triathlon and duathlon in Cyprus.",
    [
      "https://triathlon.org/members/cyprus-triathlon-federation",
      "https://cytrifed.org/",
      "https://cytrifed.org/about-us/",
    ],
    ["world-triathlon"],
    ["CTF", "Cypriot Triathlon"],
    "2026-10-23",
  ),
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
  federation(
    "maltese-triathlon",
    "Malta Triathlon Federation",
    "Malta",
    ["triathlon", "duathlon"],
    "https://triathlonmalta.org/",
    "National federation for triathlon and duathlon in Malta.",
    [
      "https://triathlon.org/members/malta-triathlon-federation",
      "https://triathlonmalta.org/",
      "https://triathlonmalta.org/hall-of-fame/",
    ],
    ["world-triathlon"],
    ["MTF", "Maltese Triathlon"],
    "2026-10-23",
  ),
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
    ["https://triathlon.org/members/mauritius-triathlon-federation", "https://fmtri.mu/"],
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
  {
    ...federation(
      "uruguayan-triathlon",
      "Unión de Triatlón del Uruguay",
      "Uruguay",
      ["triathlon"],
      "https://triathlon.org/members/uruguay-triathlon-federation",
      "National federation for triathlon in Uruguay.",
      ["https://triathlon.org/members/uruguay-triathlon-federation"],
      ["world-triathlon"],
      ["UTU", "UTriU", "Uruguay Triathlon Union", "Unión de Triathlon del Uruguay"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Uruguay’s World Triathlon member profile. The older standalone address currently presents a different amateur organisation, so this directory links to the national federation’s member profile.",
  },

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
  {
    ...federation(
      "bolivian-triathlon",
      "Federación Boliviana de Triatlón",
      "Bolivia",
      ["triathlon"],
      "https://triathlon.org/members/bolivian-triathlon-federation",
      "National federation for triathlon in Bolivia.",
      ["https://triathlon.org/members/bolivian-triathlon-federation"],
      ["world-triathlon"],
      ["Bolivian Triathlon Federation", "Bolivia Triathlon"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Bolivia’s World Triathlon member profile and federation contact information.",
  },
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
  federation(
    "costa-rican-triathlon",
    "Federación Unida de Triatlón",
    "Costa Rica",
    ["triathlon", "duathlon"],
    "https://feutri.org/",
    "National federation for triathlon and duathlon in Costa Rica.",
    [
      "https://triathlon.org/members/federacion-unida-de-triatlon-costa-rica",
      "https://feutri.org/",
      "https://feutri.org/tienda/afiliaciones/1-dia-licencia-para-duatlon/",
    ],
    ["world-triathlon"],
    ["FEUTRI", "Federación Unida de Triatlón Costa Rica", "Costa Rica Triathlon"],
    "2026-10-23",
  ),
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
  {
    ...federation(
      "dominican-republic-triathlon",
      "Federación Dominicana de Triatlón",
      "Dominican Republic",
      ["triathlon"],
      "https://triathlon.org/members/federacion-dominicana-de-triathlon",
      "National federation for triathlon in Dominican Republic.",
      ["https://triathlon.org/members/federacion-dominicana-de-triathlon"],
      ["world-triathlon"],
      ["FEDOTRI", "Dominican Republic Triathlon Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens the Dominican Republic’s World Triathlon member profile and federation contact information.",
  },
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
  {
    ...federation(
      "ecuadorian-triathlon",
      "Federación Ecuatoriana de Triatlón",
      "Ecuador",
      ["triathlon"],
      "https://triathlon.org/members/federacion-ecuatoriana-de-triatlon",
      "National federation for triathlon in Ecuador.",
      ["https://triathlon.org/members/federacion-ecuatoriana-de-triatlon"],
      ["world-triathlon"],
      ["TRIFED", "Ecuadorian Triathlon Federation"],
      "2026-10-23",
    ),
    websiteKind: "member-directory",
    detail:
      "The official link opens Ecuador’s World Triathlon member profile. The standalone address listed there could not be accessed during this review.",
  },
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
  federation(
    "guatemalan-triathlon",
    "Federación Deportiva Nacional de Triatlón de Guatemala",
    "Guatemala",
    ["triathlon", "duathlon"],
    "https://triatlon.gt/",
    "National federation for triathlon and duathlon in Guatemala.",
    [
      "https://triathlon.org/members/federacion-nacional-de-triatlon-de-guatemala",
      "https://triatlon.gt/",
      "https://app.triatlon.gt/events/duatlon-nueva-santa-rosa-2026",
    ],
    ["world-triathlon"],
    ["Guatemalan Triathlon Federation", "Guatemala Triathlon"],
    "2026-10-23",
  ),
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
  federation(
    "panamanian-triathlon",
    "Unión de Triatlón de Panamá",
    "Panama",
    ["triathlon"],
    "https://www.triathlonpanama.com/",
    "National federation for triathlon in Panama.",
    [
      "https://triathlon.org/members/union-de-triatlon-de-panama",
      "https://www.triathlonpanama.com/",
    ],
    ["world-triathlon"],
    ["UTP", "Panama Triathlon Union", "Union de Triatlon de Panama"],
    "2026-10-23",
  ),
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
  federation(
    "paraguayan-triathlon",
    "Federación Paraguaya de Triathlon",
    "Paraguay",
    ["triathlon"],
    "https://fepatri.org.py/",
    "National federation for triathlon in Paraguay.",
    ["https://triathlon.org/members/asociacion-paraguaya-de-triathlon", "https://fepatri.org.py/"],
    ["world-triathlon"],
    ["FEPATRI", "Asociación Paraguaya de Triathlon", "Paraguayan Triathlon Federation"],
    "2026-10-23",
  ),
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
  federation(
    "peruvian-triathlon",
    "Federación Peruana de Triatlón",
    "Peru",
    ["triathlon"],
    "https://fedenatri.pe/",
    "National federation for triathlon in Peru.",
    [
      "https://triathlon.org/members/federacion-deportiva-nacional-de-triatlon",
      "https://fedenatri.pe/",
    ],
    ["world-triathlon"],
    ["FEDENATRI", "Federación Deportiva Nacional de Triatlón", "Peruvian Triathlon Federation"],
    "2026-10-23",
  ),

  record(
    {
      slug: "chinese-triathlon",
      name: "China Triathlon Sports Association",
      type: "national",
      country: "China",
      jurisdiction: "China",
      territories: ["China"],
      sports: ["triathlon"],
      summary: "National federation for triathlon in China.",
      website: "https://triathlon.org/members/china-triathlon-sports-association",
      sources: ["https://triathlon.org/members/china-triathlon-sports-association"],
      related: ["world-triathlon"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),

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

  record(
    {
      slug: "chinese-taipei-triathlon",
      name: "Chinese Taipei Triathlon Association",
      type: "national",
      country: "Chinese Taipei",
      jurisdiction: "Chinese Taipei",
      territories: ["Chinese Taipei"],
      sports: ["triathlon"],
      summary: "National federation for triathlon in Chinese Taipei.",
      website: "https://triathlon.org/members/chinese-taipei-triathlon-association",
      sources: ["https://triathlon.org/members/chinese-taipei-triathlon-association"],
      related: ["world-triathlon"],
      websiteKind: "member-directory",
      aliases: ["Taiwan Triathlon"],
    },
    "2026-10-23",
  ),

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

  record(
    {
      slug: "nepalese-triathlon",
      name: "Nepal Triathlon Association",
      type: "national",
      country: "Nepal",
      jurisdiction: "Nepal",
      territories: ["Nepal"],
      sports: ["triathlon"],
      summary: "National federation for triathlon in Nepal.",
      website: "https://triathlon.org/members/nepal-triathlon-association-nta",
      sources: ["https://triathlon.org/members/nepal-triathlon-association-nta"],
      related: ["world-triathlon"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),

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

  record(
    {
      slug: "vietnamese-triathlon",
      name: "Vietnam Triathlon Federation",
      type: "national",
      country: "Vietnam",
      jurisdiction: "Vietnam",
      territories: ["Vietnam"],
      sports: ["triathlon", "duathlon"],
      summary: "National federation for triathlon and duathlon in Vietnam.",
      website: "https://triathlonvietnam.org/",
      sources: [
        "https://triathlon.org/members/vietnam-triathlon-federation",
        "https://triathlonvietnam.org/",
      ],
      related: ["world-triathlon"],
    },
    "2026-10-23",
  ),

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

  record(
    {
      slug: "sri-lankan-triathlon",
      name: "Sri Lanka Triathlon",
      type: "national",
      country: "Sri Lanka",
      jurisdiction: "Sri Lanka",
      territories: ["Sri Lanka"],
      sports: ["triathlon"],
      summary: "National federation for triathlon in Sri Lanka.",
      website: "https://triathlon.org/members/sri-lanka-triathlon",
      sources: ["https://triathlon.org/members/sri-lanka-triathlon"],
      related: ["world-triathlon"],
      websiteKind: "member-directory",
    },
    "2026-10-23",
  ),

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

  record(
    {
      slug: "macau-triathlon",
      name: "China Macau Triathlon General Association",
      type: "national",
      country: "Macau",
      jurisdiction: "Macau, China",
      territories: ["Macau"],
      sports: ["triathlon"],
      summary: "National federation for triathlon in Macau.",
      website: "https://triathlon.org/members/macau-triathlon-association",
      sources: ["https://triathlon.org/members/macau-triathlon-association"],
      related: ["world-triathlon"],
      websiteKind: "member-directory",
      aliases: ["Macao Triathlon"],
    },
    "2026-10-23",
  ),

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
];
