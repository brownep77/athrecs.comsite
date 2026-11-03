import type { PublicRaceResult } from "@/lib/athrecs/public-results-api";
import { RaceResultsBoard } from "./RaceResultsBoard";

/** Reports and archive pages show the same recorded field and claim actions. */
export function RecordedRoadResults({ results, caption }: {
  results: PublicRaceResult[];
  caption: string;
}) {
  return <RaceResultsBoard results={results} editionName={caption} parkrun={false} />;
}
