import { ResultDistance } from "./ResultDistance";
import { distanceResultStyle } from "@/lib/athrecs/profile-colours";
import { CHIP_TIME_CAVEAT } from "@/lib/athrecs/reported-personal-bests";
import type { ReportedRaceRecord } from "@/lib/athrecs/reported-race-history";
import { hasReportedFinish, reportedResultSport } from "@/lib/athrecs/profile-result-presentation";
import { CompletionMedal } from "./ProfileAward";
import { CountryFlag } from "./CountryFlag";
import { ResultVerificationBadge } from "./ResultVerificationBadge";
import { ResultEvidence } from "./ResultEvidence";
import { countryFlag } from "@/lib/athrecs/country-flags";
import { HistoricalTiming } from "./ResultTiming";

export function ReportedRaceResultRows({
  records,
  bestIds,
  hasActions,
  showEvidence = false,
}: {
  records: readonly ReportedRaceRecord[];
  bestIds: ReadonlySet<string>;
  hasActions: boolean;
  showEvidence?: boolean;
}) {
  return records.map((record) => (
    <tr
      role="row"
      key={record.id}
      id={`reported-result-${record.id}`}
      className="distance-result scroll-mt-6"
      style={distanceResultStyle(record.distance)}
    >
      <td role="cell" data-label="Race date" className="min-w-36 px-3 py-2 text-xs">
        {record.reportedDate}
      </td>
      <td role="cell" data-label="Race name" className="min-w-64 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 font-medium">
          {hasReportedFinish(record) ? <CompletionMedal place={record.reportedPlace} /> : null}
          {record.event}
        </span>
        <ResultEvidence
          notes={record.uncertainty}
          urls={record.sources.map((source) => source.url)}
          sourceLabels={record.sources}
          showEvidence={showEvidence}
        />
      </td>
      <td role="cell" data-label="Sport" className="px-3 py-2 text-xs">
        {reportedResultSport(record)}
      </td>
      <td role="cell" data-label="Distance" className="whitespace-nowrap px-3 py-2 text-xs">
        <ResultDistance distance={record.distance} />
      </td>
      <td role="cell" data-label="Location" className="min-w-32 px-3 py-2 text-xs">
        <span className="inline-flex flex-wrap items-center gap-1.5">
          {record.location}
          <CountryFlag
            country={countryFlag(record.location.split(",").at(-1)?.trim()).code || ""}
          />
        </span>
      </td>
      <td role="cell" data-label="Time" className="min-w-40 px-3 py-2">
        <span className="font-semibold tabular-nums">{record.reportedTime}</span>
        {bestIds.has(record.id) ? (
          <span
            className="ml-2 text-xs font-semibold text-accent"
            aria-label="PB, not verified by chip time"
          >
            PB*
          </span>
        ) : null}
        <ResultVerificationBadge status="unverified" />
        <HistoricalTiming performance={record.reportedTime} discipline={record.distance} />
        {showEvidence ? <span className="block text-xs text-muted">{CHIP_TIME_CAVEAT}</span> : null}
      </td>
      <td role="cell" data-label="Place" className="px-3 py-2 text-xs">
        {record.reportedPlace}
      </td>
      <td role="cell" data-label="Category" className="px-3 py-2 text-xs">
        {record.entryKind === "stage"
          ? "Stage"
          : record.entryKind === "grouped"
            ? "Grouped race record"
            : "Race"}
      </td>
      {showEvidence ? (
        <td role="cell" data-label="Source" className="min-w-40 px-3 py-2 text-xs">
          {showEvidence ? <span className="block text-muted">{record.evidenceLabel}</span> : null}
          {record.sources.map((source) => (
            <a
              key={source.url}
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="mr-2 inline-flex min-h-7 text-accent hover:underline"
            >
              {source.label} ↗
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
  ));
}
