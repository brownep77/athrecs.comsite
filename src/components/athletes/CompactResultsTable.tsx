import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { type ProfileResult, findPersonalBests, timingBasis } from "@/lib/athrecs/profile-records";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { ProfileEventLink } from "./ProfileEventLink";
import { CountryFlag } from "./CountryFlag";
import { ResultMedal } from "./ProfileAchievements";

type Row = Omit<ProfileResult, "athleteName">;
export function CompactResultsTable({
  results,
  action,
  claimable = false,
  personalBestIds,
}: {
  results: Row[];
  personalBestIds?: ReadonlySet<number>;
  action?: (result: Row) => ReactNode;
  claimable?: boolean;
}) {
  const bestIds = personalBestIds ?? new Set(findPersonalBests(results).map((r) => r.resultId));
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Athlete results, most recent first</caption>
        <thead className="bg-elevated text-xs text-subtle">
          <tr>
            {[
              "Date",
              "Event",
              "Sport",
              "Distance",
              "Location",
              "Time",
              "Place",
              "Category",
              "Source",
              ...(action || claimable ? ["Actions"] : []),
            ].map((label) => (
              <th key={label} scope="col" className="whitespace-nowrap px-3 py-2 font-medium">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((result) => (
            <tr key={result.resultId} className="hover:bg-elevated/50">
              <td className="whitespace-nowrap px-3 py-2 text-xs tabular-nums">
                {formatRaceDateShort(result.eventDate)}
              </td>
              <td className="min-w-44 px-3 py-2 font-medium">
                <span className="flex items-center gap-1.5">
                  <ResultMedal result={result} />
                  <ProfileEventLink
                    result={result}
                    className="text-fg no-underline hover:text-accent hover:underline"
                  >
                    {result.eventName}
                  </ProfileEventLink>
                </span>
                {result.conflicting ? (
                  <span className="block text-xs text-amber-800">
                    Sources differ · excluded from PBs
                  </span>
                ) : null}
              </td>
              <td className="px-3 py-2 text-xs">{result.sport}</td>
              <td className="whitespace-nowrap px-3 py-2 text-xs">
                {result.distanceCode}
                <span className="block text-[10px] text-subtle">{result.surface}</span>
              </td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs">
                  {result.city}
                  <CountryFlag country={result.country} />
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-semibold tabular-nums">
                {result.status === "finished" || result.status === "FIN" || !result.status
                  ? formatDuration(result.finishTimeSeconds)
                  : result.status}
                {bestIds.has(result.resultId) ? (
                  <span
                    className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent"
                    aria-label="Personal best"
                  >
                    PB
                  </span>
                ) : null}
                <span className="block text-[10px] font-normal text-subtle">
                  {timingBasis(result)}
                </span>
              </td>
              <td className="px-3 py-2 tabular-nums">{result.overallPlace ?? "—"}</td>
              <td className="px-3 py-2 text-xs">{result.category || "—"}</td>
              <td className="px-3 py-2">
                {result.sourceUrls.length ? (
                  result.sourceUrls.map((url, index) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="mr-2 inline-flex min-h-7 items-center whitespace-nowrap text-xs text-accent hover:underline"
                      aria-label={`Result source ${index + 1} for ${result.eventName}`}
                    >
                      Source{result.sourceUrls.length > 1 ? ` ${index + 1}` : ""} ↗
                    </a>
                  ))
                ) : (
                  <span className="text-subtle">—</span>
                )}
              </td>
              {action || claimable ? (
                <td className="px-3 py-2">
                  {action?.(result)}
                  {claimable ? (
                    <Link
                      to="/claim-results"
                      search={{ resultId: result.resultId }}
                      aria-label="Claim this result"
                      className="text-xs text-accent"
                    >
                      Claim
                    </Link>
                  ) : null}
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function CompactResults({
  results,
  claimable = false,
}: {
  results: Row[];
  claimable?: boolean;
}) {
  const [sport, setSport] = useState("");
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const sports = [...new Set(results.map((r) => r.sport))].sort();
  const years = [...new Set(results.map((r) => r.eventDate.slice(0, 4)))].sort().reverse();
  const filtered = results.filter(
    (r) =>
      (!sport || r.sport === sport) &&
      (!year || r.eventDate.startsWith(year)) &&
      (!q || r.eventName.toLowerCase().includes(q.toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 30));
  const active = Math.min(page, pages - 1);
  const bestIds = new Set(findPersonalBests(results).map((r) => r.resultId));
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-display text-lg font-semibold">
          Results <span className="font-sans text-sm text-subtle">{filtered.length}</span>
        </h2>
        <input
          aria-label="Search results"
          placeholder="Search results"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          className="h-9 rounded border border-border bg-surface px-2 text-sm"
        />
        {[
          { label: "Sport", value: sport, options: sports, set: setSport },
          { label: "Year", value: year, options: years, set: setYear },
        ].map((filter) => (
          <select
            key={filter.label}
            aria-label={filter.label}
            value={filter.value}
            onChange={(e) => {
              filter.set(e.target.value);
              setPage(0);
            }}
            className="h-9 rounded border border-border bg-surface px-2 text-sm"
          >
            <option value="">All {filter.label.toLowerCase()}s</option>
            {filter.options.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        ))}
      </div>
      {filtered.length ? (
        <CompactResultsTable
          results={filtered.slice(active * 30, (active + 1) * 30)}
          claimable={claimable}
          personalBestIds={bestIds}
        />
      ) : (
        <p className="rounded-lg border border-border p-4 text-sm text-muted">
          No results in this selection.
        </p>
      )}
      {pages > 1 ? (
        <div className="flex justify-end gap-4 text-sm">
          <button
            disabled={!active}
            onClick={() => setPage(active - 1)}
            className="disabled:opacity-40"
          >
            Previous
          </button>
          <span>
            {active + 1} / {pages}
          </span>
          <button
            disabled={active + 1 >= pages}
            onClick={() => setPage(active + 1)}
            className="disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </section>
  );
}
