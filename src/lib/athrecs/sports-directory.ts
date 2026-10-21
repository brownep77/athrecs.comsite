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
const normalise = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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
      "British Triathlon is the governing body for triathlon, duathlon and related multisport in Great Britain. Its member associations are Triathlon England, Triathlon Scotland and Welsh Triathlon. Triathlon Ireland covers the Republic of Ireland and Northern Ireland.",
  },
  {
    question: "Does Sport England make the rules for every sport?",
    answer:
      "Sport England funds and develops participation and sets requirements for organisations it funds. Individual national and international federations set or apply their sports’ competition rules. Funding conditions, sport rules and legislation are separate things.",
  },
  {
    question: "Which countries and sports are included?",
    answer:
      "This first collection covers every sport section currently listed on AthRecs, with national bodies in the UK, Ireland, the United States, Canada, Australia, New Zealand and South Africa, plus UK home-nation and international organisations. It is a growing directory, not an exhaustive list of every federation or specialist association worldwide. Jurisdiction describes an organisation’s remit; it does not determine an athlete’s nationality or team eligibility.",
  },
  {
    question: "Is parkrun a national governing body?",
    answer:
      "Parkrun is a global charity organising free weekly community events. It has its own listing and organisation type here because AthRecs includes a parkrun section. It does not govern all running.",
  },
];
