import { useMemo, useState } from "react";
import {
  eligiblePerformance,
  performanceGroup,
  timingBasis,
  type ProfileResult,
} from "@/lib/athrecs/profile-records";
import { formatDuration } from "@/lib/athrecs/format";

export function ProfileProgress({ results }: { results: ProfileResult[] }) {
  const groups = useMemo(() => {
    const options = new Map<string, string>();
    for (const result of results.filter(eligiblePerformance))
      options.set(
        performanceGroup(result),
        `${result.sport} · ${result.distanceCode} · ${result.surface} · ${timingBasis(result)}`,
      );
    return [...options];
  }, [results]);
  const [chosen, setChosen] = useState("");
  const selected = groups.some(([key]) => key === chosen) ? chosen : (groups[0]?.[0] ?? "");
  const years = useMemo(() => {
    const best = new Map<string, ProfileResult>();
    for (const result of results.filter(
      (result) => eligiblePerformance(result) && performanceGroup(result) === selected,
    )) {
      const year = result.eventDate.slice(0, 4);
      if (!best.has(year) || result.finishTimeSeconds! < best.get(year)!.finishTimeSeconds!)
        best.set(year, result);
    }
    return [...best].sort(([a], [b]) => a.localeCompare(b));
  }, [results, selected]);
  const maximum = Math.max(1, ...years.map(([, result]) => result.finishTimeSeconds!));
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card md:p-6">
      <h2 className="font-display text-2xl font-semibold">Your progress</h2>
      <p className="mt-2 text-sm text-muted">
        Your fastest linked performance each year. Compare the same sport, distance, surface and
        timing type; a shorter bar is faster.
      </p>
      {!groups.length ? (
        <p className="mt-6 rounded-xl bg-elevated p-5 text-sm text-muted">
          Add a completed result with a measured distance and time to see your progress.
        </p>
      ) : (
        <>
          <label className="mt-5 block text-sm font-semibold" htmlFor="progress-distance">
            Compare performances
          </label>
          <select
            id="progress-distance"
            value={selected}
            onChange={(event) => setChosen(event.target.value)}
            className="mt-2 h-11 w-full max-w-xl rounded-lg border border-border bg-bg px-3 text-sm"
          >
            {groups.map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <div className="mt-6 space-y-5">
            {years.map(([year, result]) => (
              <div key={year} className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-3">
                <span className="text-sm font-semibold">{year}</span>
                <div>
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span className="font-semibold tabular-nums">
                      {formatDuration(result.finishTimeSeconds)}
                    </span>
                    <span className="text-muted">{result.eventName}</span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(3, (result.finishTimeSeconds! / maximum) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {years.length === 1 ? (
            <p className="mt-5 text-sm text-muted">
              One year is available so far. Earlier or future results will extend this view.
            </p>
          ) : null}
        </>
      )}
    </section>
  );
}
