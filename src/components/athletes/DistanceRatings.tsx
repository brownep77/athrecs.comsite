import { useId, useMemo, useState } from "react";
import {
  buildProfileDistanceSummary,
  type ParticipationTally,
} from "@/lib/athrecs/profile-distance-summary";
import { ratePerformance, type PerformanceRating } from "@/lib/athrecs/performance-rating";
import type { ProfileResult } from "@/lib/athrecs/profile-records";
import { timingBasis } from "@/lib/athrecs/profile-records";
import type { SourceHistory } from "@/lib/athrecs/source-performance-history";
import type { AchievementResult } from "@/lib/athrecs/profile-history-results";
import { achievementResultVerified } from "@/lib/athrecs/achievement-verification";
import { formatDuration, formatRaceDateShort, todayIso } from "@/lib/athrecs/format";
import { AchievementVerification } from "./AchievementVerification";

const NO_HISTORIES: readonly SourceHistory[] = [];
const number = (value: number) => value.toLocaleString("en-GB", { maximumFractionDigits: 2 });
type RatedResult = { result: AchievementResult; rating: PerformanceRating };

function time(seconds: number): string {
  const fraction = String(seconds).split(".")[1];
  return `${formatDuration(seconds)}${fraction ? `.${fraction}` : ""}`;
}

function comparisonLabel(rating: PerformanceRating): string {
  return rating.comparison === "road-standard"
    ? "Road"
    : rating.comparison === "course-unadjusted"
      ? "Parkrun · course unadjusted"
      : "Distance-only estimate";
}

function RatingMark({ entry }: { entry?: RatedResult }) {
  if (!entry) return <span className="text-muted">—</span>;
  return (
    <div className="space-y-1">
      <p className="font-semibold tabular-nums">{number(entry.rating.displayScore)} pts</p>
      <p className="tabular-nums">{time(entry.rating.finishTimeSeconds)}</p>
      <p className="text-xs text-muted">{formatRaceDateShort(entry.result.eventDate)}</p>
      <AchievementVerification verified={achievementResultVerified(entry.result)} />
    </div>
  );
}

function ParticipationCard({ title, tally }: { title: string; tally: ParticipationTally }) {
  return (
    <article className="space-y-2 rounded-lg border border-border p-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="text-2xl font-semibold tabular-nums">{number(tally.totalPoints)} points</p>
      <p className="text-sm text-muted">
        {number(tally.completedRaces)} completed {tally.completedRaces === 1 ? "event" : "events"}
        {" · "}
        {number(tally.distanceKm)} km raced
      </p>
      <p className="text-xs text-muted">
        {number(tally.racePoints)} finish points + {number(tally.distancePoints)} distance points
        {tally.ultraBonusPoints > 0 ? <> + {number(tally.ultraBonusPoints)} ultra bonus</> : null}
      </p>
      <p className="text-xs text-muted">
        {number(tally.verifiedRaces)} verified finishes · {number(tally.verifiedTotalPoints)}{" "}
        verified points
      </p>
      {tally.unknownDistanceRaces > 0 ? (
        <p className="text-xs text-muted">
          {tally.unknownDistanceRaces} finishes have no confirmed distance and earn finish points
          only.
        </p>
      ) : null}
    </article>
  );
}

export function DistanceRatings({
  results,
  sourceHistories = NO_HISTORIES,
  sourceGender = "",
}: {
  results: readonly ProfileResult[];
  sourceHistories?: readonly SourceHistory[];
  sourceGender?: string;
}) {
  const seasonId = useId();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const day = todayIso();
  const { summary, rated, groups } = useMemo(() => {
    const today = new Date(`${day}T12:00:00Z`);
    const summary = buildProfileDistanceSummary(results, sourceHistories, today);
    const rated = summary.finishes.flatMap((result): RatedResult[] => {
      const rating = ratePerformance(result, sourceGender, today);
      return rating ? [{ result, rating }] : [];
    });
    const grouped = new Map<string, { label: string; km: number; entries: RatedResult[] }>();
    for (const entry of rated) {
      const { rating, result } = entry;
      const key = `${rating.group}|${rating.category}`;
      const group = grouped.get(key) ?? {
        label: `${rating.distance.label} · ${rating.comparison === "course-unadjusted" ? "Parkrun" : result.surface || "Unknown surface"} · ${rating.category === "men" ? "Men" : "Women"}`,
        km: rating.distance.km,
        entries: [],
      };
      group.entries.push(entry);
      grouped.set(key, group);
    }
    return {
      summary,
      rated: rated.sort((a, b) => b.result.eventDate.localeCompare(a.result.eventDate)),
      groups: [...grouped.entries()].sort(
        ([, a], [, b]) => a.km - b.km || a.label.localeCompare(b.label),
      ),
    };
  }, [results, sourceHistories, sourceGender, day]);
  const yearOptions = [
    ...new Set([summary.seasonYear, ...summary.seasons.map((entry) => entry.year)]),
  ].sort((a, b) => b - a);
  const year =
    selectedYear != null && yearOptions.includes(selectedYear) ? selectedYear : summary.seasonYear;
  const season = summary.seasons.find((entry) => entry.year === year) ?? summary.currentSeason;
  const seasonRated = rated.filter(({ result }) => Number(result.eventDate.slice(0, 4)) === year);
  const best = (entries: RatedResult[]) =>
    entries.reduce<RatedResult | undefined>(
      (winner, entry) => (!winner || entry.rating.score > winner.rating.score ? entry : winner),
      undefined,
    );
  if (!summary.allTime.completedRaces) return null;

  return (
    <section
      aria-label="Distance ratings and race points"
      className="space-y-4 rounded-xl border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Distance ratings & race points</h2>
        <div className="flex items-center gap-2 text-sm">
          <label htmlFor={seasonId}>Season</label>
          <select
            id={seasonId}
            value={year}
            onChange={(event) => {
              setSelectedYear(Number(event.target.value));
              setVisibleCount(10);
            }}
            className="min-h-11 rounded-lg border border-border bg-surface px-3"
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
                {option === summary.seasonYear ? " · current" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-muted">
        Based on the results linked to this profile. Seasons run from 1 January to 31 December.
        Verification is shown separately; the racing record may be incomplete.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <ParticipationCard title="All-time participation" tally={summary.allTime} />
        <ParticipationCard title={`${year} participation`} tally={season} />
      </div>
      <p className="text-xs text-muted">
        Participation covers running events of 1 km or longer: 10 points per completed event + 1
        point per kilometre raced, with an increasing distance bonus for ultras. Parkrun counts as a
        completed event. Recorded running finishes of unknown distance earn finish points only.
      </p>
      <details className="rounded-lg border border-border p-3">
        <summary className="min-h-8 cursor-pointer text-sm font-semibold">
          Ultra participation bonuses
        </summary>
        <p className="mt-2 text-xs text-muted">
          Distance points increase as each individual race gets longer. Add 10 completion points to
          the distance points below. The bonus applies to that race’s distance, independently of
          other races completed.
        </p>
        <p className="mt-2 text-xs text-muted">
          Totals use unrounded distances and bonuses. Rounded components may differ from the total
          by 0.01 points.
        </p>
        <table className="mt-3 w-full text-left text-xs">
          <caption className="sr-only">
            Distance points earned in successive parts of each race
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="p-2">
                Part of each race
              </th>
              <th scope="col" className="p-2">
                Points per km
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <th scope="row" className="p-2 font-normal">
                First 42.195 km
              </th>
              <td className="p-2">1</td>
            </tr>
            <tr className="border-b border-border">
              <th scope="row" className="p-2 font-normal">
                Beyond 42.195 km, up to 100 km
              </th>
              <td className="p-2">3</td>
            </tr>
            <tr className="border-b border-border">
              <th scope="row" className="p-2 font-normal">
                Beyond 100 km, up to 100 miles
              </th>
              <td className="p-2">4</td>
            </tr>
            <tr>
              <th scope="row" className="p-2 font-normal">
                Beyond 100 miles
              </th>
              <td className="p-2">5</td>
            </tr>
          </tbody>
        </table>
      </details>
      {groups.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="pb-3 text-left font-semibold">
              Performance rating by distance
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="p-2">
                  Distance & category
                </th>
                <th scope="col" className="p-2">
                  All-time best
                </th>
                <th scope="col" className="p-2">
                  {year} best
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map(([key, group]) => (
                <tr key={key} className="border-b border-border align-top">
                  <th scope="row" className="p-2 font-medium">
                    {group.label}
                    {group.entries.some(
                      ({ rating }) => rating.comparison === "distance-only-estimate",
                    ) ? (
                      <p className="mt-1 text-xs font-normal text-muted">Distance-only estimate</p>
                    ) : null}
                  </th>
                  <td className="p-2">
                    <RatingMark entry={best(group.entries)} />
                  </td>
                  <td className="p-2">
                    <RatingMark
                      entry={best(
                        group.entries.filter(
                          ({ result }) => Number(result.eventDate.slice(0, 4)) === year,
                        ),
                      )}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Time ratings need a recorded finish time, a supported distance of at least 1 km and a
          supplied men’s or women’s racing category.
        </p>
      )}
      <details className="rounded-lg border border-border p-3">
        <summary className="min-h-8 cursor-pointer text-sm font-semibold">How ratings work</summary>
        <div className="mt-2 space-y-2 text-xs text-muted">
          <p>
            Rating = 1,000 × the fixed 2025 open-category reference time ÷ recorded finish time.
            Higher is faster. The same distance, category and time always receive the same rating,
            whichever year they were recorded.
          </p>
          <p>
            These are time ratings without an age adjustment. Road, track, parkrun and trail are
            kept separate. Parkrun scores do not adjust for the course. Trail and other surfaces use
            a distance-only estimate, which does not adjust for elevation, terrain or conditions.
          </p>
          <p>
            Time ratings cover 1 km to 200 km. Distances without an exact reference use a modelled
            reference and are marked as estimates. Longer or unknown distances can earn
            participation points without a time rating.
          </p>
          <p>
            All-time and season bests use the highest eligible individual rating. Timings keep their
            recorded chip, gun or unknown basis. Duplicate results, conflicting records,
            non-finishes, disqualifications, future results, splits and excluded results do not earn
            points.
          </p>
        </div>
      </details>
      {rated.length > 0 ? (
        <details className="rounded-lg border border-border p-3">
          <summary className="min-h-8 cursor-pointer text-sm font-semibold">
            Every rated performance · {year} ({seasonRated.length})
          </summary>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <caption className="sr-only">Individual performance ratings for {year}</caption>
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="p-2">
                    Event
                  </th>
                  <th scope="col" className="p-2">
                    Distance
                  </th>
                  <th scope="col" className="p-2">
                    Time
                  </th>
                  <th scope="col" className="p-2">
                    Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {seasonRated.slice(0, visibleCount).map(({ result, rating }) => (
                  <tr
                    key={`${result.resultId}|${result.eventDate}|${rating.group}`}
                    className="border-b border-border align-top"
                  >
                    <td className="p-2">
                      {result.eventName}
                      <p className="text-muted">{formatRaceDateShort(result.eventDate)}</p>
                    </td>
                    <td className="p-2">
                      {rating.distance.label}
                      <p className="text-muted">{comparisonLabel(rating)}</p>
                    </td>
                    <td className="p-2 tabular-nums">
                      {time(rating.finishTimeSeconds)}
                      <p className="text-muted">
                        {result.history
                          ? (result.history.performance.timing?.basis ?? "unknown")
                          : timingBasis(result)}
                      </p>
                    </td>
                    <td className="p-2">
                      <p className="font-semibold tabular-nums">{number(rating.displayScore)}</p>
                      <AchievementVerification verified={achievementResultVerified(result)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {seasonRated.length === 0 ? (
            <p className="text-sm text-muted">No rated performances recorded in {year}.</p>
          ) : null}
          {seasonRated.length > visibleCount ? (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 20)}
              className="mt-3 min-h-11 rounded-lg border border-border px-3 text-sm"
            >
              Show more performances
            </button>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}
