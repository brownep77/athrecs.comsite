import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

/** Run Norwich 2025-09-07 official places 401–500 gaps. */
const rows = [
  [401,"812","anthony-kendrick","43:10","MO"],
  [402,"719","chris-wells","43:19","M45"],
  [403,"453","jack-crosthwaite","42:35","MO"],
  [404,"1169","sam-thompson","43:08","MO"],
  [405,"468","tom-hughes","43:07","MO"],
  [406,"148","daniel-smith","43:19","MO"],
  [407,"641","james-wilson","43:22","MO"],
  [408,"523","mark-jones","43:15","M40"],
  [409,"891","oliver-brown","43:18","MO"],
  [410,"334","ryan-taylor","43:24","MO"],
] as const;

export const resultsRn2025B5: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
  eventSlug: "run-norwich",
  date: "2025-09-07",
  distance: "10K",
  athleteSlug,
  place,
  time,
  finishTimeSeconds: toSeconds(time),
  chipTimeSeconds: toSeconds(time),
  status: "finished",
  category,
  resultSource: "official",
  source: SOURCE,
  bib,
}));
