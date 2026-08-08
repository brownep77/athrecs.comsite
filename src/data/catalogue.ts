/** Norfolk multi-sport catalogue. */

export type Sport =
  | "Running"
  | "Cycling"
  | "Swimming"
  | "Triathlon"
  | "Duathlon"
  | "Aquathlon"
  | "Aquabike"
  | "Rowing"
  | "OCR"
  | "Athletics";

export type Series = {
  slug: string;
  name: string;
  sport: Sport;
  city: string;
  area: string;
  surface: string;
  distances: string[];
  summary: string;
  description: string;
  organiser: string;
  website: string;
  featured?: boolean;
  defaultStartTime?: string;
};

export type Edition = {
  seriesSlug: string;
  date: string;
  distance: string;
  distanceKm: number;
  status: "Open" | "ClosingSoon" | "Closed" | "Finished" | "TBC";
  entryUrl?: string;
  startTime?: string;
  source: string;
};

export type ClubSeed = {
  slug: string;
  name: string;
  city: string;
  sports: string[];
  website?: string;
  summary: string;
};

export type AthleteSeed = {
  slug: string;
  display_name: string;
  gender: "M" | "F";
  club_slug: string;
  city: string;
  bio: string;
};

export type ResultSeed = {
  eventSlug: string;
  date: string;
  distance: string;
  athleteSlug: string;
  place: number;
  time: string;
  category: string;
  source: string;
};

export const clubs: ClubSeed[] = [
  {
    slug: "city-of-norwich-ac",
    name: "City of Norwich AC",
    city: "Norwich",
    sports: ["Athletics", "Running"],
    website: "https://www.conac.org.uk/",
    summary: "Norwich multi-discipline athletics club.",
  },
  {
    slug: "unattached",
    name: "Unattached",
    city: "Norfolk",
    sports: ["Running"],
    summary: "Independent athletes racing Norfolk events.",
  },
  {
    slug: "norwich-road-runners",
    name: "Norwich Road Runners",
    city: "Norwich",
    sports: ["Running"],
    summary: "Large Norwich road running club.",
  },
];

export const athletes: AthleteSeed[] = [
  {
    slug: "paul-browne",
    display_name: "Paul Browne",
    gender: "M",
    club_slug: "unattached",
    city: "Norfolk",
    bio: "Unattached — Norfolk road races.",
  },
  {
    slug: "logan-smith",
    display_name: "Logan Smith",
    gender: "M",
    club_slug: "city-of-norwich-ac",
    city: "Norwich",
    bio: "City of Norwich AC.",
  },
  {
    slug: "danny-adams",
    display_name: "Danny Adams",
    gender: "M",
    club_slug: "city-of-norwich-ac",
    city: "Norwich",
    bio: "City of Norwich AC road racer.",
  },
];

export const results: ResultSeed[] = [];

export const seriesList: Series[] = [
  {
    slug: "wroxham-5k",
    name: "Wroxham 5K",
    sport: "Running",
    city: "Wroxham",
    area: "Broads",
    surface: "Road",
    distances: ["5K"],
    summary: "Midweek Broads 5K.",
    description: "Wroxham 5K midweek road race.",
    organiser: "Local / TRT",
    website: "https://totalracetiming.co.uk/raceresults/690",
    featured: true,
  },
];

export const editions: Edition[] = [
  {
    seriesSlug: "wroxham-5k",
    date: "2026-07-01",
    distance: "5K",
    distanceKm: 5,
    status: "Finished",
    source: "https://totalracetiming.co.uk/raceresults/690",
  },
];
