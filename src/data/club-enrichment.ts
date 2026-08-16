import type { ClubSeed } from "./types";
import { clubEnrichmentPartA } from "./club-enrichment-a.ts";
import { clubEnrichmentPartB } from "./club-enrichment-b.ts";

export const clubSlugAliases: Record<string, string> = {
  "bungay-black-dog": "bungay-black-dog-rc",
  "cambridge-coleridge-ac": "cambridge-and-coleridge-ac",
  "coltishall-jaguars-rc": "coltishall-jaguars",
  "dereham-runners-ac": "dereham-runners",
  "great-yarmouth-and-district-ac": "great-yarmouth-district-ac",
  "harlow-running-tri-club": "harlow-running-and-tri-club",
  "hercules-wimbledon-ac": "hercules-wimbledon",
  "norfolk-gazelles-ac": "norfolk-gazelles",
  "north-norfolk-harriers-athletics-club": "north-norfolk-harriers",
  "tri-anglia-triathlon-club": "tri-anglia",
  "winchester-and-district-ac": "winchester-district-ac",
};

export const auditedClubAdditions: ClubSeed[] = [
  {
    slug: "ventura-runners",
    name: "Ventura Runners",
    city: "Tidworth",
    county: "",
    country: "England",
    sports: ["Running", "Athletics"],
    website: "https://www.vrrunners.co.uk/",
    summary: "England Athletics affiliated running club.",
    source_names: ["Ventura Runners"],
  },
];

export const clubEnrichment: Record<string, Partial<ClubSeed>> = {
  ...clubEnrichmentPartA,
  ...clubEnrichmentPartB,
};
