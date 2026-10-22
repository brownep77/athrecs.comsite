import {
  ORGANISATION_TYPES,
  SPORTS_ORGANISATIONS,
  type DirectorySport,
} from "../../data/sports-organisations.ts";
import { SPORT_PAGES } from "./sport-pages.ts";

export type DirectorySearch = {
  q?: string;
  country?: string;
  sport?: DirectorySport;
  type?: keyof typeof ORGANISATION_TYPES;
};

export const DIRECTORY_COUNTRIES = [
  ...new Set(SPORTS_ORGANISATIONS.flatMap((body) => body.territories)),
].sort();
export const DIRECTORY_NATIONAL_COUNTRIES = [
  ...new Set(
    SPORTS_ORGANISATIONS.filter((body) => body.type === "national").map((body) => body.country),
  ),
].sort();
const normalise = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/ł/g, "l")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss");

export function parseDirectorySearch(raw: Record<string, unknown>): DirectorySearch {
  return {
    q: typeof raw.q === "string" ? raw.q.trim().slice(0, 120) || undefined : undefined,
    country:
      typeof raw.country === "string" && DIRECTORY_COUNTRIES.includes(raw.country)
        ? raw.country
        : undefined,
    sport: SPORT_PAGES.find((sport) => sport.slug === raw.sport)?.slug,
    type:
      typeof raw.type === "string" && Object.hasOwn(ORGANISATION_TYPES, raw.type)
        ? (raw.type as DirectorySearch["type"])
        : undefined,
  };
}

export function filterSportsOrganisations(search: DirectorySearch) {
  const words = normalise(search.q ?? "")
    .split(/\s+/)
    .filter(Boolean);
  return SPORTS_ORGANISATIONS.filter((body) => {
    if (search.country && !body.territories.includes(search.country)) return false;
    if (search.sport && !body.sports.includes(search.sport) && body.type !== "funding")
      return false;
    if (search.type && search.type !== body.type) return false;
    const haystack = normalise(
      [
        body.name,
        ...(body.aliases ?? []),
        body.country,
        body.jurisdiction,
        body.summary,
        body.detail ?? "",
        ORGANISATION_TYPES[body.type],
        ...body.sports.map((slug) => SPORT_PAGES.find((page) => page.slug === slug)?.label ?? slug),
      ].join(" "),
    );
    const tokens = haystack.split(/[^\p{L}\p{N}]+/u);
    return words.every((word) => tokens.some((token) => token.startsWith(word)));
  }).sort((a, b) => a.name.localeCompare(b.name, "en"));
}

export function getSportsOrganisation(slug: string) {
  return SPORTS_ORGANISATIONS.find((body) => body.slug === slug);
}

export const DIRECTORY_QUESTIONS = [
  {
    question: "Who funds sport, and who runs Team GB?",
    answer:
      "Sport England invests in grassroots sport and physical activity in England. UK Sport invests in elite Olympic and Paralympic programmes across the UK. The British Olympic Association prepares and manages Team GB and is independently funded. The British Paralympic Association manages ParalympicsGB. Sports federations govern their individual sports; these organisations have distinct roles.",
  },
  {
    question: "Who governs triathlon and duathlon in Britain?",
    answer:
      "British Triathlon is the governing body for triathlon, duathlon and related multisport in Great Britain. Its member associations are Triathlon England, Triathlon Scotland and Triathlon Cymru (Welsh Triathlon). Triathlon Ireland covers the Republic of Ireland and Northern Ireland.",
  },
  {
    question: "Does Sport England make the rules for every sport?",
    answer:
      "Sport England funds and develops participation and sets requirements for organisations it funds. Individual national and international federations set or apply their sports’ competition rules. Funding conditions, sport rules and legislation are separate things.",
  },
  {
    question: "Which countries, territories and sports are included?",
    answer: `The directory covers every sport section currently listed on AthRecs, with national federations in ${DIRECTORY_NATIONAL_COUNTRIES.length} countries and territories across Europe, the Americas, Africa, Asia and Oceania. It also includes home-nation and regional bodies, specialist associations, funding agencies and international organisations. Use the country and sport filters to find the relevant entries. Coverage is growing and is not exhaustive in every country or discipline. Jurisdiction describes an organisation’s remit; it does not determine an athlete’s nationality or team eligibility.`,
  },
  {
    question: "How do regional and specialist organisations fit in?",
    answer:
      "Regional bodies serve a defined area: Cycling Ulster covers the nine counties of Ulster, across Northern Ireland and Ireland, while Swim Ulster is part of the Swim Ireland family. Specialist associations focus on activities such as fell running, trail running or masters swimming. Their profiles explain their particular roles; they do not automatically replace the national federation. Continental federations support member countries and continental competition.",
  },
  {
    question: "Is parkrun a national governing body?",
    answer:
      "Parkrun is a global charity organising free weekly community events. It has its own listing and organisation type here because AthRecs includes a parkrun section. It does not govern all running.",
  },
];
