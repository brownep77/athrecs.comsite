export type MarathonCountry =
  "uk" | "australia" | "new-zealand" | "usa" | "canada" | "ireland" | "south-africa";

export type RaceLink = { label: string; url: string };

export type RoadRace = {
  distanceKm?: 21.0975 | 42.195;
  slug: string;
  name: string;
  country: MarathonCountry;
  city: string;
  region?: string;
  nation?: string;
  timeZone: string;
  officialUrl: string;
  description: string;
  course: { summary: string; surface: string; profile: string; links: RaceLink[] };
  entryMethods: { name: string; description: string; url: string }[];
  editions: { date: string; endDate?: string; sourceUrl: string }[];
  nextDateNote?: string;
  dateNotes?: { text: string; sourceUrl: string; expiresAfter: string }[];
  fieldSize?: { display: string; basis: string; year: string; sourceUrl: string; note?: string };
  practical?: { label: string; value: string; sourceUrl: string }[];
  media: { label: string; url: string; kind: "news" | "video" | "photos" }[];
  resultsUrl: string;
  resultsLabel?: string;
  pastEditions: {
    year: number;
    date?: string;
    resultsUrl: string;
    summary: string;
    categories: { category: string; summary: string; sourceUrl: string }[];
  }[];
  sources: RaceLink[];
  checkedAt: string;
};

export type MarathonCountryGuide = {
  id: MarathonCountry;
  name: string;
  guide: string;
  countryCode: string;
  regionLabel: string;
  description: string;
};

/** Compatibility name for existing full-marathon records. */
export type RoadMarathon = RoadRace;
export type RoadHalfMarathon = RoadRace & { distanceKm: 21.0975 };
