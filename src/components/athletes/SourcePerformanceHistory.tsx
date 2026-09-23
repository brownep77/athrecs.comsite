import { useState } from "react";
import type { SourceHistory } from "@/lib/athrecs/source-performance-history";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { ResultDisqualification } from "./ResultDisqualification";

export function SourcePerformanceHistory({
  histories,
  showEvidence = false,
}: {
  histories: SourceHistory[];
  showEvidence?: boolean;
}) {
  const [year, setYear] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  if (!histories.length) return null;
  const rows = histories
    .flatMap((history) =>
      history.performances.map((row, index) => ({
        ...row,
        key: `${history.provider}:${history.externalId}:${index}`,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  const years = [...new Set(rows.map((row) => String(row.year)))].sort().reverse();
  const disciplines = [...new Set(rows.map((row) => row.discipline))].sort();
  const filtered = rows.filter(
    (row) =>
      (!year || String(row.year) === year) &&
      (!discipline || row.discipline === discipline) &&
      (!query ||
        [row.meeting, row.venue, row.discipline, row.performance]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 30));
  const active = Math.min(page, pages - 1);
  return (
    <section
      className="space-y-3"
      aria-label={showEvidence ? "Source performance history" : "Performance history"}
    >
      <h2 className="font-display text-lg font-semibold">
        {showEvidence ? "Source performance history" : "Performance history"}{" "}
        <span className="font-sans text-sm text-subtle">{rows.length}</span>
      </h2>
      {showEvidence ? (
        <>
          <p className="text-sm text-muted">
            Original source performances, including decimal times, field marks and annotations.
            These may also appear in Results above and are not added again to personal bests or
            achievement totals.
          </p>
          {histories.map((history) => (
            <p key={`${history.provider}:${history.externalId}`} className="text-xs text-muted">
              <a
                href={history.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {history.provider === "powerof10" ? "Power of 10" : history.provider} profile ↗
              </a>
              {" · "}
              {history.yearsCaptured.length} of {history.yearsExpected.length} source years imported
              {" · "}
              {history.complete
                ? "All available source years captured"
                : "History import in progress"}
            </p>
          ))}
        </>
      ) : null}
      <div className="profile-filters flex flex-wrap gap-2">
        <input
          aria-label={showEvidence ? "Search source history" : "Search performances"}
          placeholder={showEvidence ? "Search source history" : "Search performances"}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(0);
          }}
          className="h-9 rounded border border-border bg-surface px-2 text-sm"
        />
        {[
          {
            label: showEvidence ? "Source history year" : "Performance year",
            value: year,
            options: years,
            set: setYear,
            all: "All years",
          },
          {
            label: showEvidence ? "Source history discipline" : "Performance discipline",
            value: discipline,
            options: disciplines,
            set: setDiscipline,
            all: "All disciplines",
          },
        ].map((filter) => (
          <select
            key={filter.label}
            aria-label={filter.label}
            value={filter.value}
            onChange={(event) => {
              filter.set(event.target.value);
              setPage(0);
            }}
            className="h-9 rounded border border-border bg-surface px-2 text-sm"
          >
            <option value="">{filter.all}</option>
            {filter.options.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        ))}
      </div>
      <div
        className={`${showEvidence ? "max-h-96" : "profile-table-wrap max-h-none sm:max-h-96"} overflow-auto rounded-lg border border-border bg-surface`}
        tabIndex={0}
        aria-label="Performance history table"
      >
        <table
          role="table"
          className={`${showEvidence ? "" : "profile-card-table"} w-full text-left text-sm`}
        >
          <caption className="sr-only">Performances, most recent first</caption>
          <thead role="rowgroup" className="bg-elevated text-xs text-subtle">
            <tr role="row">
              {[
                "Date",
                "Discipline",
                "Performance",
                "Wind",
                "Place",
                "Meeting",
                "Venue",
                "Age group",
                ...(showEvidence ? ["Source"] : []),
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
            {(showEvidence ? filtered.slice(active * 30, (active + 1) * 30) : filtered).map(
              (row) => (
                <tr role="row" key={row.key} className="hover:bg-elevated/50">
                  <td role="cell" data-label="Date" className="whitespace-nowrap px-3 py-2 text-xs">
                    {formatRaceDateShort(row.date)}
                  </td>
                  <td role="cell" data-label="Discipline" className="whitespace-nowrap px-3 py-2">
                    {row.discipline}
                  </td>
                  <td
                    data-label="Performance"
                    className="whitespace-pre-line px-3 py-2 font-semibold tabular-nums"
                  >
                    {row.performance}
                    {row.disqualification ? <span aria-label="Disqualified result">*</span> : null}
                    <ResultDisqualification decision={row.disqualification} />
                    {showEvidence && row.labels.length ? (
                      <span className="block text-xs font-normal text-muted">
                        Source: {row.labels.join(", ")}
                      </span>
                    ) : null}
                  </td>
                  <td role="cell" data-label="Wind" className="px-3 py-2">
                    {row.wind || "—"}
                  </td>
                  <td role="cell" data-label="Place" className="px-3 py-2">
                    {row.place || "—"}
                    {row.disqualification ? (
                      <span className="block text-xs text-muted">Original · void</span>
                    ) : null}
                  </td>
                  <td role="cell" data-label="Meeting" className="min-w-52 px-3 py-2">
                    {row.meeting}
                  </td>
                  <td role="cell" data-label="Venue" className="px-3 py-2">
                    {row.venue}
                  </td>
                  <td
                    role="cell"
                    data-label="Age group"
                    className="whitespace-nowrap px-3 py-2 text-xs"
                  >
                    {row.ageGroup}
                  </td>
                  {showEvidence ? (
                    <td role="cell" data-label="Source" className="px-3 py-2">
                      {row.sourceUrls.map((url, index) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Source history result ${index + 1} for ${row.meeting}`}
                          className="mr-2 whitespace-nowrap text-xs text-accent hover:underline"
                        >
                          Source{row.sourceUrls.length > 1 ? ` ${index + 1}` : ""} ↗
                        </a>
                      ))}
                    </td>
                  ) : null}
                </tr>
              ),
            )}
          </tbody>
        </table>
        {!filtered.length ? (
          <p className="p-4 text-sm text-muted">No performances match these filters.</p>
        ) : null}
      </div>
      {showEvidence ? (
        <div className="flex items-center justify-between gap-2 text-sm">
          <button
            disabled={active === 0}
            onClick={() => setPage(active - 1)}
            className="rounded border border-border px-3 py-1 disabled:opacity-40"
          >
            Previous source results
          </button>
          <span>
            {filtered.length} performances · {active + 1} / {pages}
          </span>
          <button
            disabled={active + 1 >= pages}
            onClick={() => setPage(active + 1)}
            className="rounded border border-border px-3 py-1 disabled:opacity-40"
          >
            Next source results
          </button>
        </div>
      ) : null}
    </section>
  );
}
