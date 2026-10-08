import { countryFlag, countryNames } from "./country-flags.ts";
/** ISO country codes, flags and explicit source country labels for race venues. */

export type CountryInfo = {
  iso: string;
  name: string;
  ukNation?: "England" | "Scotland" | "Wales" | "Northern Ireland";
  world?: boolean;
};

const NAME_BY_ISO: Record<string, string> = {
  AL: "Albania",
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
  BA: "Bosnia and Herzegovina",
  HR: "Croatia",
  ME: "Montenegro",
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
  MD: "Moldova",
  PE: "Peru",
  DZ: "Algeria",
  SA: "Saudi Arabia",
  PY: "Paraguay",
  RU: "Russia",
  ZM: "Zambia",
  BW: "Botswana",
  BO: "Bolivia",
  SV: "El Salvador",
  MK: "North Macedonia",
  LK: "Sri Lanka",
  AM: "Armenia",
  IL: "Israel",
  JO: "Jordan",
  FM: "Micronesia",
  PR: "Puerto Rico",
  SN: "Senegal",
  TN: "Tunisia",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  EC: "Ecuador",
  XK: "Kosovo",
  MO: "Macau",
  LB: "Lebanon",
  PF: "French Polynesia",
  BS: "Bahamas",
  BY: "Belarus",
  BJ: "Benin",
  BM: "Bermuda",
  BN: "Brunei",
  TD: "Chad",
  CO: "Colombia",
  CR: "Costa Rica",
  DO: "Dominican Republic",
  GT: "Guatemala",
  IR: "Iran",
  KZ: "Kazakhstan",
  KG: "Kyrgyzstan",
  MH: "Marshall Islands",
  MZ: "Mozambique",
  NP: "Nepal",
  NI: "Nicaragua",
  NG: "Nigeria",
  TJ: "Tajikistan",
  TV: "Tuvalu",
  UG: "Uganda",
  VE: "Venezuela",
  SB: "Solomon Islands",
  OM: "Oman",
  PK: "Pakistan",
  MM: "Myanmar",
  WORLD: "World",
};

const ALIAS: Record<string, string> = {
  albania: "AL",
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
  türkiye: "TR",
  egypt: "EG",
  ukraine: "UA",
  romania: "RO",
  bulgaria: "BG",
  croatia: "HR",
  "bosnia and herzegovina": "BA",
  "bosnia & herzegovina": "BA",
  "bosnia-herzegovina": "BA",
  bosnia: "BA",
  bih: "BA",
  montenegro: "ME",
  "crna gora": "ME",
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
  moldova: "MD",
  "republic of moldova": "MD",
  chisinau: "MD",
  chișinău: "MD",
  peru: "PE",
  algeria: "DZ",
  "saudi arabia": "SA",
  ksa: "SA",
  paraguay: "PY",
  russia: "RU",
  "russian federation": "RU",
  zambia: "ZM",
  botswana: "BW",
  bolivia: "BO",
  "el salvador": "SV",
  "north macedonia": "MK",
  macedonia: "MK",
  "sri lanka": "LK",
  armenia: "AM",
  israel: "IL",
  jordan: "JO",
  micronesia: "FM",
  "puerto rico": "PR",
  senegal: "SN",
  tunisia: "TN",
  uruguay: "UY",
  uzbekistan: "UZ",
  ecuador: "EC",
  kosovo: "XK",
  kos: "XK",
  macau: "MO",
  macao: "MO",
  mac: "MO",
  lebanon: "LB",
  lbn: "LB",
  tahiti: "PF",
  "french polynesia": "PF",
  pyf: "PF",
  bahamas: "BS",
  belarus: "BY",
  benin: "BJ",
  bermuda: "BM",
  brunei: "BN",
  chad: "TD",
  colombia: "CO",
  "costa rica": "CR",
  "dominican republic": "DO",
  guatemala: "GT",
  iran: "IR",
  kazakhstan: "KZ",
  kyrgyzstan: "KG",
  "marshall islands": "MH",
  mozambique: "MZ",
  nepal: "NP",
  nicaragua: "NI",
  nigeria: "NG",
  tajikistan: "TJ",
  tuvalu: "TV",
  uganda: "UG",
  venezuela: "VE",
  "solomon islands": "SB",
  oman: "OM",
  pakistan: "PK",
  myanmar: "MM",
  burma: "MM",
  taiwan: "TW",
  "chinese taipei": "TW",
  "hong kong china": "HK",
  "republic of korea": "KR",
  "the republic of korea": "KR",
  "the united states": "US",
  "the netherlands": "NL",
  "the philippines": "PH",
  "the czech republic": "CZ",
  eur: "WORLD",
  und: "WORLD",
  philippines: "PH",
  monaco: "MC",
  luxembourg: "LU",
  indonesia: "ID",
  gibraltar: "GI",
};

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
  "Belgium",
  "Netherlands",
  "Portugal",
  "Greece",
  "Cyprus",
  "Sweden",
  "Iceland",
  "Czechia",
  "Albania",
  "Kosovo",
  "North Macedonia",
  "Croatia",
  "Bosnia and Herzegovina",
  "Serbia",
  "Montenegro",
  "Slovenia",
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
      "Belgium",
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
      "Albania",
      "Kosovo",
      "North Macedonia",
      "Bosnia and Herzegovina",
      "Serbia",
      "Montenegro",
      "Switzerland",
      "Hungary",
      "Croatia",
      "Slovenia",
      "Moldova",
      "Latvia",
      "Malta",
    ],
  },
  {
    label: "Africa",
    options: [
      "South Africa",
      "Namibia",
      "Eswatini",
      "Kenya",
      "Ethiopia",
      "Egypt",
      "Algeria",
      "Morocco",
      "Tunisia",
      "Senegal",
      "Mozambique",
      "Benin",
    ],
  },
  {
    label: "Americas",
    options: [
      "United States",
      "Canada",
      "Brazil",
      "Chile",
      "Peru",
      "Argentina",
      "Uruguay",
      "Venezuela",
      "Costa Rica",
      "Bermuda",
    ],
  },
  {
    label: "Asia-Pacific",
    options: [
      "Australia",
      "New Zealand",
      "Japan",
      "Singapore",
      "Malaysia",
      "China",
      "Hong Kong",
      "Taiwan",
      "South Korea",
      "Qatar",
      "United Arab Emirates",
      "Saudi Arabia",
      "Iran",
      "Jordan",
      "Kyrgyzstan",
      "French Polynesia",
    ],
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
  if (!countryNames[code]) return "🌐";
  return String.fromCodePoint(...[...code].map((ch) => 127397 + ch.charCodeAt(0)));
}

export function countryFromIso(iso: string, ukNation?: CountryInfo["ukNation"]): CountryInfo {
  if (iso === "WORLD") return { iso: "WORLD", name: "World", world: true };
  return {
    iso,
    name:
      iso === "GB" ? ukNation || "United Kingdom" : NAME_BY_ISO[iso] || countryNames[iso] || iso,
    ukNation: iso === "GB" ? ukNation : undefined,
    world: false,
  };
}

export function isWorldEvent(name?: string | null): boolean {
  return !!name && WORLD_HINT.test(name);
}

function normCountryKey(value?: string | null): string {
  return (value || "")
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/^the\s+/i, "")
    .trim()
    .toLowerCase();
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
  const countryKey = normCountryKey(input.country);
  const flag = countryFlag(countryKey);
  if (flag.emoji === "🌐") return countryFromIso("WORLD");
  if (flag.code) {
    const home = ["England", "Scotland", "Wales", "Northern Ireland"].includes(flag.name)
      ? (flag.name as CountryInfo["ukNation"])
      : undefined;
    return countryFromIso(flag.code.startsWith("GB-") ? "GB" : flag.code, home);
  }
  const alias = ALIAS[countryKey];
  if (alias) return countryFromIso(alias);
  // Never override an explicit unknown value using a race title or a city-name guess.
  if (countryKey) return { iso: "UN", name: input.country!.trim(), world: false };
  // Source venue labels often end in an explicit country/code, e.g. Doha (QAT).
  // City names and source website regions are not country evidence.
  for (const value of [input.city, input.area, input.address]) {
    const suffix = value?.match(/(?:\(([A-Z]{2,3})\)|,\s*([^,]+))\s*$/);
    const explicit = countryFlag(suffix?.[1] ?? suffix?.[2]);
    if (explicit.code) return resolveCountry({ country: explicit.name });
  }
  return { iso: "UN", name: "Country TBC", world: false };
}

export function displayCountryName(info: CountryInfo): string {
  if (info.iso === "GB") return "United Kingdom";
  return info.name;
}

export function filterCountryName(info: CountryInfo): string {
  if (info.iso === "GB") return info.ukNation || "United Kingdom";
  return info.name;
}

export function countryMatchesFilter(info: CountryInfo, filter?: string | null): boolean {
  if (!filter || filter === "All") return true;
  if (filter === "United Kingdom" || filter === "Britain") return info.iso === "GB";
  if (filter === "World") return info.iso === "WORLD" || info.world === true;
  if (
    filter === "England" ||
    filter === "Scotland" ||
    filter === "Wales" ||
    filter === "Northern Ireland"
  ) {
    return info.iso === "GB" && info.ukNation === filter;
  }
  const expected = resolveCountry({ country: filter });
  if (expected.ukNation) return info.iso === "GB" && info.ukNation === expected.ukNation;
  return info.name === filter || (expected.iso !== "UN" && info.iso === expected.iso);
}

export function flagForCountryFilter(name: string): string {
  if (!name || name === "All") return "";
  if (name === "World") return "🌐";
  const info = resolveCountry({ country: name, name });
  return isoToFlagEmoji(info.iso);
}
