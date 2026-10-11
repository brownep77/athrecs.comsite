import { getEditorialAthleteCareer } from "@/data/freddy-richardson";
import { getReportedRaceHistory } from "./reported-race-history";
import { davidGogginsTimedPerformances } from "@/data/david-goggins";
import {
  moFarahCareerBests,
  moFarahPhoto,
  moFarahRoadSplits,
  moFarahTwoMileRoadBest,
} from "@/data/mo-farah";
export function profileEditorial(slug: string) {
  return {
    career: getEditorialAthleteCareer(slug),
    reportedHistory: getReportedRaceHistory(slug),
    overview: {
      sourceUrl: slug === "mo-farah" ? "https://worldathletics.org/athletes/-/14189197" : "",
      timed: slug === "david-goggins" ? davidGogginsTimedPerformances : [],
      bests: slug === "mo-farah" ? moFarahCareerBests : [],
      // Photo attribution/licence is public credit, not private verification evidence.
      photo:
        slug === "mo-farah"
          ? { ...moFarahPhoto, creditUrl: moFarahPhoto.source, source: "" }
          : null,
      splits: slug === "mo-farah" ? moFarahRoadSplits : [],
      twoMile: slug === "mo-farah" ? moFarahTwoMileRoadBest : null,
    },
  };
}
export type ProfileEditorial = ReturnType<typeof profileEditorial>;
