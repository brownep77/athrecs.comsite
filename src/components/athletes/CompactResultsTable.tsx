import { useState } from "react";
import { HistoricalResultRow } from "./HistoricalResultRow";
import { ResultEvidence } from "./ResultEvidence";
import { profileDisciplineLabel } from "@/lib/athrecs/profile-timeline";
import {
  combineResultsHistory,
  resultHistoryYear,
  type HistoryResult,
  type ResultsHistoryEntry,
} from "@/lib/athrecs/profile-history-results";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { type ProfileResult, findPersonalBests, timingBasis } from "@/lib/athrecs/profile-records";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { ProfileEventLink } from "./ProfileEventLink";
import { CountryFlag } from "./CountryFlag";
import { ResultMedal } from "./ProfileAchievements";
import { roadPerformanceCondition } from "@/lib/athrecs/road-performance-conditions";
import { isDisqualified } from "@/lib/athrecs/result-details";
import { ResultDisqualification } from "./ResultDisqualification";

import { ReportedRaceResultRows } from "./ReportedRaceResultRows";
import type { ReportedRaceHistory, ReportedRaceRecord } from "@/lib/athrecs/reported-race-history";
import { selectProfilePersonalBests } from "@/lib/athrecs/reported-personal-bests";

const NO_HISTORY_RESULTS: readonly HistoryResult[] = [];
const NO_REPORTED_RECORDS: readonly ReportedRaceRecord[] = [];
const NO_REPORTED_BEST_IDS = new Set<string>();

type Row = Omit<ProfileResult, "athleteName">;
export function CompactResultsTable({
  results,
  entries,
  hasHistory = false,
  action,
  claimable = false,
  personalBestIds,
  showEvidence = false,
  reportedRecords = NO_REPORTED_RECORDS,
  reportedBestIds = NO_REPORTED_BEST_IDS,
}: {
  results: Row[];
  entries?: ResultsHistoryEntry[];
  hasHistory?: boolean;
  showEvidence?: boolean;
  reportedRecords?: readonly ReportedRaceRecord[];
  reportedBestIds?: ReadonlySet<string>;
  personalBestIds?: ReadonlySet<number>;
  action?: (result: Row) => ReactNode;
  claimable?: boolean;
}) {
  const bestIds = personalBestIds ?? new Set(findPersonalBests(results).map((r) => r.resultId));
  return (
    <div
      className={`${showEvidence ? "" : "profile-table-wrap"} overflow-x-auto rounded-lg border border-border bg-surface`}
    >
      <table
        role="table"
        className={`${showEvidence ? "" : "profile-card-table"} w-full text-left text-sm`}
      >
        <caption className="sr-only">Athlete results history</caption>
        <thead role="rowgroup" className="bg-elevated text-xs text-subtle">
          <tr role="row">
            {[
              "Date",
              "Event",
              "Sport",
              hasHistory ? "Distance / discipline" : "Distance",
              "Location",
              hasHistory ? "Performance" : "Time",
              "Place",
              "Category",
              ...(showEvidence ? ["Source"] : []),
              ...(action || claimable ? ["Actions"] : []),
            ].map((label) => (
              <th
                role="columnheader"
                key={label}
                scope="col"
                className="whitespace-nowrap px-3 py-2 font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody role="rowgroup" className="divide-y divide-border">
          {(entries ?? combineResultsHistory(results, [])).map((entry) => {
            if (entry.kind === "history")
              return (
                <HistoricalResultRow
                  key={entry.result.key}
                  result={entry.result}
                  hasActions={Boolean(action || claimable)}
                  showEvidence={showEvidence}
                />
              );
            const result = entry.result;
            return (
              <tr role="row" key={result.resultId} className="hover:bg-elevated/50">
                <td
                  role="cell"
                  data-label="Date"
                  className="whitespace-nowrap px-3 py-2 text-xs tabular-nums"
                >
                  {formatRaceDateShort(result.eventDate)}
                </td>
                <td role="cell" data-label="Event" className="min-w-44 px-3 py-2 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ResultMedal result={result} />
                    <ProfileEventLink
                      result={result}
                      className="text-fg no-underline hover:text-accent hover:underline"
                    >
                      {result.eventName}
                    </ProfileEventLink>
                  </span>
                  <ResultDisqualification decision={result.details?.disqualification} />
                  <ResultEvidence
                    notes={result.details?.note}
                    provider={result.resultSource}
                    urls={result.sourceUrls}
                    splits={result.details?.splits}
                    showEvidence={showEvidence}
                  />
                  {result.conflicting ? (
                    <span className="block text-xs text-amber-800">
                      Conflicting result · excluded from PBs
                    </span>
                  ) : null}
                  {showEvidence && roadPerformanceCondition(result) ? (
                    <span className="block text-xs text-muted">
                      {roadPerformanceCondition(result)!.note}
                    </span>
                  ) : null}
                </td>
                <td role="cell" data-label="Sport" className="px-3 py-2 text-xs">
                  {result.sport}
                </td>
                <td
                  role="cell"
                  data-label={hasHistory ? "Distance / discipline" : "Distance"}
                  className="whitespace-nowrap px-3 py-2 text-xs"
                >
                  {profileDisciplineLabel(result.distanceCode)}
                  <span className="block text-[10px] text-subtle">{result.surface}</span>
                </td>
                <td role="cell" data-label="Location" className="px-3 py-2">
                  <span className="inline-flex flex-wrap items-center gap-2 text-xs">
                    {result.city}
                    <CountryFlag country={result.country} />
                  </span>
                </td>
                <td
                  data-label={hasHistory ? "Performance" : "Time"}
                  className="whitespace-nowrap px-3 py-2 font-semibold tabular-nums"
                >
                  {isDisqualified(result) ||
                  result.status === "finished" ||
                  result.status === "FIN" ||
                  !result.status
                    ? formatDuration(result.finishTimeSeconds)
                    : result.status}
                  {isDisqualified(result) ? <span aria-label="Disqualified result">*</span> : null}
                  {!isDisqualified(result) && bestIds.has(result.resultId) ? (
                    <span
                      className="ml-2 rounded bg-accent-soft px-1.5 py-0.5 text-xs font-semibold text-accent"
                      aria-label="Personal best"
                    >
                      PB
                    </span>
                  ) : null}
                  {showEvidence ? (
                    <span className="block text-xs font-normal text-subtle">
                      {isDisqualified(result)
                        ? "Original time · disqualified"
                        : timingBasis(result)}
                      {result.chipTimeSeconds != null
                        ? ` · Chip ${formatDuration(result.chipTimeSeconds)}`
                        : ""}
                      {result.gunTimeSeconds != null
                        ? ` · Gun ${formatDuration(result.gunTimeSeconds)}`
                        : ""}
                    </span>
                  ) : null}
                </td>
                <td role="cell" data-label="Place" className="px-3 py-2 tabular-nums">
                  {result.overallPlace ?? "—"}
                  {isDisqualified(result) ? (
                    <span className="block text-[10px] text-subtle">Original · void</span>
                  ) : null}
                </td>
                <td role="cell" data-label="Category" className="px-3 py-2 text-xs">
                  {result.category || "—"}
                </td>
                {showEvidence ? (
                  <td role="cell" data-label="Source" className="px-3 py-2">
                    {result.sourceUrls.length ? (
                      result.sourceUrls.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="mr-2 inline-block min-h-7 max-w-64 whitespace-normal break-words align-top text-xs text-accent hover:underline"
                          aria-label={`${result.resultSource?.trim() || "Source"}${result.sourceUrls.length > 1 ? ` ${index + 1}` : ""} result source for ${result.eventName}`}
                        >
                          {result.resultSource?.trim() || "Source"}
                          {result.sourceUrls.length > 1 ? ` ${index + 1}` : ""} ↗
                        </a>
                      ))
                    ) : (
                      <span className="text-subtle">—</span>
                    )}
                  </td>
                ) : null}
                {action || claimable ? (
                  <td role="cell" data-label="Actions" className="px-3 py-2">
                    {action?.(result)}
                    {claimable ? (
                      <Link
                        to="/claim-results"
                        search={{ resultId: result.resultId }}
                        aria-label="Claim this profile"
                        className="text-xs text-accent"
                      >
                        Claim profile
                      </Link>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            );
          })}
          <ReportedRaceResultRows
            records={reportedRecords}
            bestIds={reportedBestIds}
            hasActions={Boolean(action || claimable)}
            showEvidence={showEvidence}
          />
        </tbody>
      </table>
    </div>
  );
}
export function CompactResults({
  results,
  historyResults = NO_HISTORY_RESULTS,
  claimable = false,
  reportedHistory,
  showEvidence = false,
}: {
  results: Row[];
  historyResults?: readonly HistoryResult[];
  claimable?: boolean;
  reportedHistory?: ReportedRaceHistory;
  showEvidence?: boolean;
}) {
  const [sport, setSport] = useState("");
  const [year, setYear] = useState("");
  const [q, setQ] = useState("");
  const [distance, setDistance] = useState("");

  const reportedRecords = reportedHistory?.records ?? NO_REPORTED_RECORDS;
  const reportYear = (record: ReportedRaceRecord) =>
    record.reportedDate.match(/^\d{4}\b/)?.[0] ?? "Unknown";
  const entries = combineResultsHistory(results, historyResults);
  const sports = [
    ...new Set([
      ...entries.map((r) => r.result.sport),
      ...(reportedRecords.length ? ["Running"] : []),
    ]),
  ].sort();
  const years = [
    ...new Set([...entries.map(resultHistoryYear), ...reportedRecords.map(reportYear)]),
  ]
    .sort()
    .reverse();
  const distances = [
    ...new Set(
      entries.map((entry) =>
        profileDisciplineLabel(
          entry.kind === "recorded"
            ? entry.result.distanceCode
            : entry.result.performance.discipline,
        ),
      ),
    ),
  ].sort();
  const filtered = entries.filter((entry) => {
    const search =
      entry.kind === "recorded"
        ? [entry.result.eventName, entry.result.distanceCode, entry.result.city]
        : [
            entry.result.performance.meeting,
            entry.result.performance.discipline,
            entry.result.performance.venue,
            entry.result.performance.performance,
          ];
    return (
      (!sport || entry.result.sport === sport) &&
      (!year || resultHistoryYear(entry) === year) &&
      (!distance ||
        profileDisciplineLabel(
          entry.kind === "recorded"
            ? entry.result.distanceCode
            : entry.result.performance.discipline,
        ) === distance) &&
      (!q || search.join(" ").toLowerCase().includes(q.toLowerCase()))
    );
  });
  const filteredReports = reportedRecords
    .filter(
      (r) =>
        (!sport || sport === "Running") &&
        (!year || reportYear(r) === year) &&
        !distance &&
        (!q || r.event.toLowerCase().includes(q.toLowerCase())),
    )
    .sort((a, b) =>
      (reportYear(b) === "Unknown" ? "" : reportYear(b)).localeCompare(
        reportYear(a) === "Unknown" ? "" : reportYear(a),
      ),
    );
  const total = filtered.length + filteredReports.length;

  const bests = selectProfilePersonalBests(results, reportedHistory?.personalBests);
  const bestIds = new Set(
    bests.flatMap((best) => (best.kind === "recorded" ? [best.value.resultId] : [])),
  );
  const reportedBestIds = new Set(
    bests.flatMap((best) =>
      best.kind === "reported" && best.value.recordId ? [best.value.recordId] : [],
    ),
  );
  const previewSize = 8;
  const previewReports = Math.max(0, previewSize - filtered.length);
  return (
    <section className="space-y-3" id={reportedHistory ? "race-results" : undefined}>
      <div className="profile-filters flex flex-wrap items-center gap-2">
        <h2 className="mr-auto font-display text-lg font-semibold">
          Results <span className="font-sans text-sm text-subtle">{total}</span>
        </h2>
        <input
          aria-label="Search results"
          placeholder="Search results"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
          className="h-9 max-w-full rounded border border-border bg-surface px-2 text-sm"
        />
        {[
          { label: "Sport", value: sport, options: sports, set: setSport },
          { label: "Year", value: year, options: years, set: setYear },
          { label: "Discipline", value: distance, options: distances, set: setDistance },
        ].map((filter) => (
          <select
            key={filter.label}
            aria-label={filter.label}
            value={filter.value}
            onChange={(e) => {
              filter.set(e.target.value);
            }}
            className="h-9 max-w-full rounded border border-border bg-surface px-2 text-sm"
          >
            <option value="">All {filter.label.toLowerCase()}s</option>
            {filter.options.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        ))}
      </div>
      {showEvidence && reportedHistory ? (
        <p className="text-sm text-muted">{reportedHistory.description}</p>
      ) : null}
      {total ? (
        <CompactResultsTable
          results={results}
          entries={filtered.slice(0, previewSize)}
          hasHistory={historyResults.length > 0}
          showEvidence={showEvidence}
          claimable={claimable}
          personalBestIds={bestIds}
          reportedRecords={filteredReports.slice(0, previewReports)}
          reportedBestIds={reportedBestIds}
        />
      ) : (
        <p className="rounded-lg border border-border p-4 text-sm text-muted">
          No results in this selection.
        </p>
      )}
      {total > previewSize ? (
        <details
          className="rounded-lg border border-border bg-surface p-3"
          key={`${sport}:${year}:${distance}:${q}`}
        >
          <summary className="cursor-pointer text-sm font-semibold text-accent">
            Show all {total} results
          </summary>
          <div className="mt-3">
            <CompactResultsTable
              results={results}
              entries={filtered.slice(previewSize)}
              hasHistory={historyResults.length > 0}
              claimable={claimable}
              showEvidence={showEvidence}
              personalBestIds={bestIds}
              reportedRecords={filteredReports.slice(previewReports)}
              reportedBestIds={reportedBestIds}
            />
          </div>
        </details>
      ) : null}
    </section>
  );
}
