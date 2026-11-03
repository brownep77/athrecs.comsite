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
  organiser: "Event organiser",
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
  resultReferences?: string[];
  related?: string[];
  checkedAt: string;
};
