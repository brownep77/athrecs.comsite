import { CHIP_TIME_CAVEAT } from "@/lib/athrecs/reported-personal-bests";
import type { ReportedRaceRecord } from "@/lib/athrecs/reported-race-history";

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
      className="scroll-mt-6 hover:bg-elevated/50"
    >
      <td role="cell" data-label="Date" className="min-w-36 px-3 py-2 text-xs">
        {record.reportedDate}
      </td>
      <td role="cell" data-label="Event" className="min-w-64 px-3 py-2">
        <span className="font-medium">{record.event}</span>
        {showEvidence ? (
          <span className="block text-xs text-muted">{record.uncertainty}</span>
        ) : null}
      </td>
      <td role="cell" data-label="Sport" className="px-3 py-2 text-xs">
        Running
      </td>
      <td role="cell" data-label="Distance" className="whitespace-nowrap px-3 py-2 text-xs">
        {record.distance}
      </td>
      <td role="cell" data-label="Location" className="min-w-32 px-3 py-2 text-xs">
        {record.location}
      </td>
      <td role="cell" data-label="Time" className="min-w-40 px-3 py-2">
        <span className="font-semibold tabular-nums">{record.reportedTime}</span>
        {bestIds.has(record.id) ? (
          <span
            className="ml-2 text-xs font-semibold text-accent"
            aria-label="Personal best, not verified by chip time"
          >
            PB*
          </span>
        ) : null}
        <span className="block text-xs text-muted">
          {showEvidence ? CHIP_TIME_CAVEAT : "Reported"}
        </span>
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
