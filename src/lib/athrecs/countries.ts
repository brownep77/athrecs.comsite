/** ISO country codes, flags and place-name inference for race venues. */

export type CountryInfo = {
  iso: string;
  name: string;
  ukNation?: "England" | "Scotland" | "Wales" | "Northern Ireland";
  world?: boolean;
};

const NAME_BY_ISO: Record<string, string> = {
  GB: "United Kingdom",
  IE: "Ireland",
  FR: "France",
  DE: "Germany",
  ES: "Spain",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
  PT: "Portugal",
  CH: "Switzerland",
  AT: "Austria",
  SE: "Sweden",
  NO: "Norway",
  DK: "Denmark",
  FI: "Finland",
  IS: "Iceland",
  PL: "Poland",
  CZ: "Czechia",
  HU: "Hungary",
  GR: "Greece",
  CY: "Cyprus",
  MT: "Malta",
  LU: "Luxembourg",
  MC: "Monaco",
  AD: "Andorra",
  GI: "Gibraltar",
  US: "United States",
  CA: "Canada",
  MX: "Mexico",
  BR: "Brazil",
  AR: "Argentina",
  CL: "Chile",
  JP: "Japan",
  CN: "China",
  KR: "South Korea",
  AU: "Australia",
  NZ: "New Zealand",
  ZA: "South Africa",
  KE: "Kenya",
  ET: "Ethiopia",
  MA: "Morocco",
  AE: "United Arab Emirates",
  QA: "Qatar",
  IN: "India",
  SG: "Singapore",
  HK: "Hong Kong",
  TH: "Thailand",
  MY: "Malaysia",
  ID: "Indonesia",
  PH: "Philippines",
  TW: "Taiwan",
  TR: "Turkey",
  UA: "Ukraine",
  RO: "Romania",
  BG: "Bulgaria",
  HR: "Croatia",
  SI: "Slovenia",
  SK: "Slovakia",
  RS: "Serbia",
  EE: "Estonia",
  LV: "Latvia",
  LT: "Lithuania",
  NA: "Namibia",
  SZ: "Eswatini",
  JE: "Jersey",
  GG: "Guernsey",
  IM: "Isle of Man",
  FK: "Falkland Islands",
  SH: "Saint Helena",
  EG: "Egypt",
  WORLD: "World",
};

const ALIAS: Record<string, string> = {
  uk: "GB",
  "united kingdom": "GB",
  "great britain": "GB",
  britain: "GB",
  england: "GB",
  scotland: "GB",
  wales: "GB",
  "northern ireland": "GB",
  ireland: "IE",
  eire: "IE",
  france: "FR",
  germany: "DE",
  spain: "ES",
  italy: "IT",
  netherlands: "NL",
  holland: "NL",
  belgium: "BE",
  portugal: "PT",
  switzerland: "CH",
  austria: "AT",
  sweden: "SE",
  norway: "NO",
  denmark: "DK",
  finland: "FI",
  iceland: "IS",
  poland: "PL",
  "czech republic": "CZ",
  czechia: "CZ",
  hungary: "HU",
  greece: "GR",
  cyprus: "CY",
  malta: "MT",
  usa: "US",
  "united states": "US",
  "united states of america": "US",
  america: "US",
  canada: "CA",
  mexico: "MX",
  brazil: "BR",
  argentina: "AR",
  japan: "JP",
  china: "CN",
  australia: "AU",
  "new zealand": "NZ",
  "south africa": "ZA",
  kenya: "KE",
  morocco: "MA",
  india: "IN",
  singapore: "SG",
  "hong kong": "HK",
  thailand: "TH",
  turkey: "TR",
  chile: "CL",
  ethiopia: "ET",
  "south korea": "KR",
  qatar: "QA",
  "united arab emirates": "AE",
  uae: "AE",
  "the united arab emirates": "AE",
  turkiye: "TR",
  "türkiye": "TR",
  egypt: "EG",
  ukraine: "UA",
  romania: "RO",
  bulgaria: "BG",
  croatia: "HR",
  slovenia: "SI",
  slovakia: "SK",
  serbia: "RS",
  estonia: "EE",
  latvia: "LV",
  malaysia: "MY",
  lithuania: "LT",
  namibia: "NA",
  eswatini: "SZ",
  swaziland: "SZ",
  jersey: "JE",
  guernsey: "GG",
  "isle of man": "IM",
  "falkland islands": "FK",
  "saint helena": "SH",
  "st helena": "SH",
  world: "WORLD",
  international: "WORLD",
};

type Hint = { iso: string; re: RegExp; ukNation?: CountryInfo["ukNation"] };

const PLACE_HINTS: Hint[] = [
  { iso: "FR", re: /\b(pauillac|m[eé]doc|m[eé]docain|bordeaux|paris|versailles|lyon|marseille|nice|toulouse|lille|nantes|strasbourg|chamonix|annecy|normandy|normandie|provence|brittany|bretagne|france)\b/i },
  { iso: "DE", re: /\b(berlin|munich|m[uü]nchen|hamburg|cologne|k[oö]ln|frankfurt|d[uü]sseldorf|stuttgart|leipzig|dresden|nuremberg|germany|deutschland)\b/i },
  { iso: "ES", re: /\b(valencia|barcelona|madrid|seville|sevilla|bilbao|malaga|m[aá]laga|palma|ibiza|tenerife|spain|espa[nñ]a)\b/i },
  { iso: "IT", re: /\b(rome|roma|milan|milano|venice|venezia|florence|firenze|naples|napoli|turin|torino|verona|italy|italia)\b/i },
  { iso: "NL", re: /\b(amsterdam|rotterdam|utrecht|hague|eindhoven|netherlands|holland)\b/i },
  { iso: "BE", re: /\b(brussels|bruxelles|antwerp|brugge|bruges|ghent|gent|belgium)\b/i },
  { iso: "PT", re: /\b(lisbon|lisboa|porto|portugal)\b/i },
  { iso: "CH", re: /\b(zurich|z[uü]rich|geneva|lausanne|bern|basel|lucerne|switzerland)\b/i },
  { iso: "AT", re: /\b(vienna|wien|salzburg|innsbruck|austria)\b/i },
  { iso: "SE", re: /\b([oö]stersund|stockholm|gothenburg|g[oö]teborg|malm[oö]|sweden)\b/i },
  { iso: "NO", re: /\b(oslo|bergen|stavanger|norway)\b/i },
  { iso: "DK", re: /\b(copenhagen|k[oø]benhavn|aarhus|denmark)\b/i },
  { iso: "FI", re: /\b(helsinki|finland)\b/i },
  { iso: "IS", re: /\b(reykjav[ií]k|iceland)\b/i },
  { iso: "PL", re: /\b(warsaw|krak[oó]w|gdansk|poland)\b/i },
  { iso: "CZ", re: /\b(prague|praha|brno|czech)\b/i },
  { iso: "HU", re: /\b(budapest|hungary)\b/i },
  { iso: "GR", re: /\b(athens|athina|thessaloniki|greece)\b/i },
  { iso: "CY", re: /\b(paphos|limassol|nicosia|larnaca|cyprus)\b/i },
  { iso: "US", re: /\b(hopkinton|new york|nyc|chicago|boston marathon|baa boston|united states|\busa\b|california|massachusetts|illinois)\b/i },
  { iso: "CA", re: /\b(toronto|vancouver|montreal|ottawa|calgary|canada)\b/i },
  { iso: "JP", re: /\b(tokyo|osaka|kyoto|sapporo|japan)\b/i },
  { iso: "AU", re: /\b(sydney|melbourne|brisbane|perth|adelaide|australia)\b/i },
  { iso: "NZ", re: /\b(auckland|wellington|christchurch|new zealand)\b/i },
  { iso: "ZA", re: /\b(cape town|johannesburg|durban|south africa)\b/i },
  { iso: "KE", re: /\b(nairobi|eldoret|kenya)\b/i },
  { iso: "AE", re: /\b(dubai|abu dhabi|uae|united arab emirates)\b/i },
  { iso: "IN", re: /\b(mumbai|delhi|bangalore|bengaluru|india)\b/i },
  { iso: "SG", re: /\b(singapore)\b/i },
  { iso: "HK", re: /\b(hong kong)\b/i },
  { iso: "CN", re: /\b(beijing|shanghai|china)\b/i },
  { iso: "BR", re: /\b(rio de janeiro|s[aã]o paulo|brazil)\b/i },
  { iso: "MX", re: /\b(mexico city|cancun|mexico)\b/i },
  { iso: "TR", re: /\b(istanbul|ankara|turkey|t[uü]rkiye)\b/i },
  { iso: "IE", re: /\b(dublin|cork|galway|limerick|waterford|ireland|eire)\b/i },
  { iso: "GB", re: /\b(belfast|antrim|lisburn|derry|londonderry|newry|omagh|enniskillen|coleraine|northern ireland|\bbt\d)/i, ukNation: "Northern Ireland" },
  { iso: "GB", re: /\b(scotland|glasgow|edinburgh|aberdeen|dundee|inverness|perth|stirling|fife|highlands?|aberfeldy|kenmore|lossiemouth|moray)\b/i, ukNation: "Scotland" },
  { iso: "GB", re: /\b(wales|cymru|cardiff|swansea|newport|wrexham|bangor|aberystwyth|gwynedd)\b/i, ukNation: "Wales" },
];

const UK_ENGLAND_HINT =
  /\b(england|norfolk|suffolk|essex|kent|sussex|surrey|london|manchester|liverpool|leeds|birmingham|bristol|sheffield|nottingham|leicester|cambridge|oxford|york|newcastle|cumbria|carlisle|northumberland|lincolnshire|yorkshire|cornwall|devon|dorset|somerset|hampshire|wiltshire|cheshire|lancashire|derbyshire|staffordshire|warwickshire|shropshire|herefordshire|worcestershire|gloucestershire|northamptonshire|bedfordshire|hertfordshire|buckinghamshire|berkshire|oxfordshire|cambridgeshire|rutland|leicestershire|nottinghamshire|lincoln|norwich|ipswich)\b/i;

const WORLD_HINT =
  /\b(world championships?|world athletics|world cup|olympic games|olympics|paralympic|world games)\b/i;

export const COUNTRY_FILTERS = [
  "All",
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "Ireland",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Portugal",
  "Greece",
  "Cyprus",
  "Sweden",
  "Iceland",
  "Czechia",
  "United States",
  "Japan",
  "Australia",
  "New Zealand",
  "South Africa",
  "Namibia",
  "Eswatini",
  "Canada",
  "Poland",
  "Austria",
  "Denmark",
  "Finland",
  "Norway",
  "Lithuania",
  "Singapore",
  "Malaysia",
  "Jersey",
  "Guernsey",
  "Isle of Man",
  "Gibraltar",
  "Falkland Islands",
  "Saint Helena",
  "World",
] as const;

export const COUNTRY_GROUPS: { label: string; options: string[] }[] = [
  {
    label: "United Kingdom & Ireland",
    options: [
      "England",
      "Scotland",
      "Wales",
      "Northern Ireland",
      "Ireland",
      "Jersey",
      "Guernsey",
      "Isle of Man",
      "Gibraltar",
      "Falkland Islands",
      "Saint Helena",
    ],
  },
  {
    label: "Europe",
    options: [
      "France",
      "Germany",
      "Spain",
      "Italy",
      "Netherlands",
      "Portugal",
      "Greece",
      "Cyprus",
      "Poland",
      "Austria",
      "Denmark",
      "Finland",
      "Norway",
      "Sweden",
      "Lithuania",
      "Iceland",
      "Czechia",
      "Switzerland",
      "Hungary",
      "Croatia",
      "Slovenia",
    ],
  },
  { label: "Africa", options: ["South Africa", "Namibia", "Eswatini", "Kenya", "Ethiopia", "Egypt"] },
  { label: "Americas", options: ["United States", "Canada", "Brazil", "Chile"] },
  {
    label: "Asia-Pacific",
    options: ["Australia", "New Zealand", "Japan", "Singapore", "Malaysia", "China", "Hong Kong", "Qatar", "United Arab Emirates"],
  },
  { label: "Other", options: ["World"] },
];

export const PARKRUN_COUNTRY_SHORTCUTS = [
  "All",
  "England",
  "Ireland",
  "Australia",
  "New Zealand",
  "South Africa",
  "United States",
  "Canada",
  "Germany",
  "Poland",
  "Japan",
] as const;

export function isoToFlagEmoji(iso: string): string {
  if (iso === "WORLD") return "🌐";
  const code = iso === "GB" ? "GB" : iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(
    ...[...code].map((ch) => 127397 + ch.charCodeAt(0)),
  );
}

export function countryFromIso(iso: string, ukNation?: CountryInfo["ukNation"]): CountryInfo {
  if (iso === "WORLD") return { iso: "WORLD", name: "World", world: true };
  return {
    iso,
    name: iso === "GB" ? ukNation || "United Kingdom" : NAME_BY_ISO[iso] || iso,
    ukNation: iso === "GB" ? ukNation : undefined,
    world: false,
  };
}

export function isWorldEvent(name?: string | null): boolean {
  return !!name && WORLD_HINT.test(name);
}

export function resolveCountry(input: {
  slug?: string | null;
  name?: string | null;
  country?: string | null;
  county?: string | null;
  city?: string | null;
  area?: string | null;
  address?: string | null;
}): CountryInfo {
  const blob = [input.name, input.area, input.city, input.county, input.country, input.address, input.slug]
    .filter(Boolean)
    .join(" ");

  // UK Lincolnshire Boston must win over US Boston.
  if (/\bboston\b/i.test(blob) && /\b(lincolnshire|santa run|terrier|uk boston)\b/i.test(blob)) {
    return countryFromIso("GB", "England");
  }

  for (const hint of PLACE_HINTS) {
    if (hint.re.test(blob)) {
      if (hint.iso === "IE" && /northern/i.test(blob)) continue;
      if (hint.iso === "GB" && hint.ukNation === "Scotland" && UK_ENGLAND_HINT.test(blob) && !/\bscotland\b/i.test(blob)) {
        continue;
      }
      return countryFromIso(hint.iso, hint.ukNation);
    }
  }

  const alias = ALIAS[(input.country || "").trim().toLowerCase()];
  if (alias === "GB") {
    const nation = /scotland/i.test(input.country || "")
      ? "Scotland"
      : /wales/i.test(input.country || "")
        ? "Wales"
        : /northern/i.test(input.country || "")
          ? "Northern Ireland"
          : "England";
    return countryFromIso("GB", nation);
  }
  if (alias) return countryFromIso(alias);

  if (UK_ENGLAND_HINT.test(blob)) return countryFromIso("GB", "England");
  if (isWorldEvent(input.name)) return countryFromIso("WORLD");
  return countryFromIso("GB", "England");
}

export function displayCountryName(info: CountryInfo): string {
  if (info.iso === "GB") return "United Kingdom";
  return info.name;
}

export function filterCountryName(info: CountryInfo): string {
  if (info.iso === "GB") return info.ukNation || "England";
  return info.name;
}

export function countryMatchesFilter(info: CountryInfo, filter?: string | null): boolean {
  if (!filter || filter === "All") return true;
  if (filter === "United Kingdom" || filter === "Britain") return info.iso === "GB";
  if (filter === "World") return info.iso === "WORLD" || info.world === true;
  if (filter === "England" || filter === "Scotland" || filter === "Wales" || filter === "Northern Ireland") {
    return info.iso === "GB" && info.ukNation === filter;
  }
  return info.name === filter || info.iso === filter;
}

export function flagForCountryFilter(name: string): string {
  if (!name || name === "All") return "";
  if (name === "World") return "🌐";
  const info = resolveCountry({ country: name, name });
  return isoToFlagEmoji(info.iso);
}
