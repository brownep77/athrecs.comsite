import {
  historyResultAnchor,
  historyResultCountry,
  isCompletedHistoryResult,
  type HistoryResult,
} from "@/lib/athrecs/profile-history-results";
import { CountryFlag } from "./CountryFlag";
import { CompletionMedal } from "./ProfileAchievements";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { ResultDisqualification } from "./ResultDisqualification";

export function HistoricalResultRow({
  result,
  hasActions,
  showEvidence = false,
}: {
  result: HistoryResult;
  hasActions: boolean;
  showEvidence?: boolean;
}) {
  const row = result.performance;
  const field = /jump|shot|^sp\d|discus|javelin|hammer/i.test(row.discipline);
  const combined = /pentathlon|heptathlon|decathlon/i.test(row.discipline);
  const discipline = /^\d+$/.test(row.discipline) ? `${row.discipline} m` : row.discipline;
  const indoor = /i$/.test(row.performance);
  const numericMark = /^\d+(?:\.\d+)?$/.test(row.performance.trim());
  return (
    <tr
      id={historyResultAnchor(result.key)}
      role="row"
      className="scroll-mt-20 hover:bg-elevated/50"
      data-history-result={result.key}
    >
      <td
        role="cell"
        data-label="Date"
        className="whitespace-nowrap px-3 py-2 text-xs tabular-nums"
      >
        {row.dateLabel ||
          (row.date ? formatRaceDateShort(row.date) : row.yearLabel || String(row.year))}
      </td>
      <td role="cell" data-label="Event" className="min-w-44 px-3 py-2 font-medium">
        <span className="inline-flex items-center gap-1.5">
          {isCompletedHistoryResult(row) ? <CompletionMedal /> : null}
          {row.meeting}
        </span>
        {!showEvidence && row.providerName && row.sourceUrls[0] ? (
          <a
            href={row.sourceUrls[0]}
            target="_blank"
            rel="noreferrer"
            className="mt-1 block text-xs font-normal text-accent"
          >
            Results: {row.providerName} ↗
          </a>
        ) : null}
        {row.notes ? (
          <details className="mt-1 max-w-sm whitespace-normal text-xs font-normal text-muted">
            <summary className="cursor-pointer">Result details</summary>
            <p className="mt-1">{row.notes}</p>
          </details>
        ) : null}
        <ResultDisqualification decision={row.disqualification} />
      </td>
      <td role="cell" data-label="Sport" className="px-3 py-2 text-xs">
        {result.sport}
      </td>
      <td
        role="cell"
        data-label="Distance / discipline"
        className="whitespace-nowrap px-3 py-2 text-xs"
      >
        {discipline}
        <span className="block text-[10px] text-subtle">
          {result.sport === "Running"
            ? "Road"
            : combined
              ? "Combined events"
              : field
                ? "Field"
                : "Track"}
          {indoor ? " · Indoor" : ""}
        </span>
      </td>
      <td role="cell" data-label="Location" className="px-3 py-2 text-xs">
        <span className="inline-flex items-center gap-1.5">
          {row.venue || "—"}
          <CountryFlag country={historyResultCountry(row)} />
        </span>
      </td>
      <td
        role="cell"
        data-label="Performance"
        className="whitespace-nowrap px-3 py-2 font-semibold tabular-nums"
      >
        {row.performance || "Not recorded"}
        {numericMark && field ? " m" : numericMark && combined ? " pts" : ""}
        {row.disqualification ? <span aria-label="Disqualified result">*</span> : null}
        {row.verificationStatus === "unverified" ? (
          <span className="block text-xs font-normal text-muted">Unverified</span>
        ) : null}
        {row.wind ? (
          <span className="block text-xs font-normal text-subtle">Wind {row.wind} m/s</span>
        ) : null}
      </td>
      <td role="cell" data-label="Place" className="px-3 py-2 tabular-nums">
        {row.place || "—"}
      </td>
      <td role="cell" data-label="Category" className="px-3 py-2 text-xs">
        {row.ageGroup || "—"}
      </td>
      {showEvidence ? (
        <td role="cell" data-label="Source" className="px-3 py-2 text-xs">
          {row.sourceUrls.map((url, index) => (
            <a key={url} href={url} target="_blank" rel="noreferrer" className="mr-2 text-accent">
              {row.providerName || "Source"}
              {row.sourceUrls.length > 1 ? ` ${index + 1}` : ""} ↗
            </a>
          ))}
        </td>
      ) : null}
      {hasActions ? (
        <td role="cell" data-label="Actions" className="px-3 py-2 text-xs text-muted">
          —
        </td>
      ) : null}
    </tr>
  );
}
