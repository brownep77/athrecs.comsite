import {
  historyResultAnchor,
  historyResultCountry,
  isTrailHistoryResult,
  isCrossCountryHistoryResult,
  type HistoryResult,
} from "@/lib/athrecs/profile-history-results";
import { CountryFlag } from "./CountryFlag";
import { PerformanceAwardIcon, ClassificationAwards, CompetitionTierBadge } from "./ProfileAward";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { ResultDisqualification } from "./ResultDisqualification";
import { ResultEvidence } from "./ResultEvidence";
import { profileDisciplineLabel } from "@/lib/athrecs/profile-timeline";
import { historyAwards, historyCompetition } from "@/lib/athrecs/competition-awards";
import { ResultVerificationBadge } from "./ResultVerificationBadge";
import { HistoricalTiming } from "./ResultTiming";

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
  const awards = historyAwards(row);
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
        {row.endDate && row.endDate !== row.date ? (
          <span className="block text-subtle">to {formatRaceDateShort(row.endDate)}</span>
        ) : null}
      </td>
      <td role="cell" data-label="Event" className="min-w-44 px-3 py-2 font-medium">
        <span className="inline-flex items-center gap-1.5">
          {awards[0] ? <PerformanceAwardIcon award={awards[0]} /> : null}
          {row.meeting || "Meeting not recorded"}
        </span>
        <CompetitionTierBadge context={historyCompetition(row)} />
        <ResultEvidence
          notes={row.notes}
          provider={row.providerName}
          urls={row.sourceUrls}
          showEvidence={showEvidence}
        />
        <ResultDisqualification showEvidence={showEvidence} decision={row.disqualification} />
      </td>
      <td role="cell" data-label="Sport" className="px-3 py-2 text-xs">
        {result.sport}
      </td>
      <td
        role="cell"
        data-label="Distance / discipline"
        className="whitespace-nowrap px-3 py-2 text-xs"
      >
        {profileDisciplineLabel(discipline)}
        {row.providerName !== "DUV Ultra Marathon Statistics" ? (
          <span className="block text-[10px] text-subtle">
            {isCrossCountryHistoryResult(row)
              ? "Cross country"
              : result.sport === "Running"
                ? isTrailHistoryResult(row)
                  ? "Trail"
                  : "Road"
                : combined
                  ? "Combined events"
                  : field
                    ? "Field"
                    : "Track"}
            {indoor ? " · Indoor" : ""}
          </span>
        ) : null}
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
        <ResultVerificationBadge status={row.verificationStatus} provider={row.providerName} />
        <HistoricalTiming
          performance={row.performance}
          discipline={row.discipline}
          timing={row.timing}
        />
        {row.wind ? (
          <span className="block text-xs font-normal text-subtle">Wind {row.wind} m/s</span>
        ) : null}
      </td>
      <td role="cell" data-label="Place" className="px-3 py-2 tabular-nums">
        {row.place || "—"}
        <ClassificationAwards awards={awards} />
        {row.places?.gender != null ? (
          <span className="block text-xs text-muted">Gender: {row.places.gender}</span>
        ) : null}
        {row.places?.category != null ? (
          <span className="block text-xs text-muted">Category: {row.places.category}</span>
        ) : null}
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
