import { CHIP_TIME_CAVEAT } from "@/lib/athrecs/reported-personal-bests";
import type { ReportedRaceRecord } from "@/lib/athrecs/reported-race-history";

export function ReportedRaceResultRows({
  records,
  bestIds,
  hasActions,
}: {
  records: readonly ReportedRaceRecord[];
  bestIds: ReadonlySet<string>;
  hasActions: boolean;
}) {
  return records.map((record) => (
    <tr
      key={record.id}
      id={`reported-result-${record.id}`}
      className="scroll-mt-6 hover:bg-elevated/50"
    >
      <td className="min-w-36 px-3 py-2 text-xs">{record.reportedDate}</td>
      <td className="min-w-64 px-3 py-2">
        <span className="font-medium">{record.event}</span>
        <span className="block text-xs text-muted">{record.uncertainty}</span>
      </td>
      <td className="px-3 py-2 text-xs">Running</td>
      <td className="whitespace-nowrap px-3 py-2 text-xs">{record.distance}</td>
      <td className="min-w-32 px-3 py-2 text-xs">{record.location}</td>
      <td className="min-w-40 px-3 py-2">
        <span className="font-semibold tabular-nums">{record.reportedTime}</span>
        {bestIds.has(record.id) ? (
          <span
            className="ml-2 text-xs font-semibold text-accent"
            aria-label="Personal best, not verified by chip time"
          >
            PB*
          </span>
        ) : null}
        <span className="block text-xs text-muted">{CHIP_TIME_CAVEAT}</span>
      </td>
      <td className="px-3 py-2 text-xs">{record.reportedPlace}</td>
      <td className="px-3 py-2 text-xs">
        {record.entryKind === "stage"
          ? "Stage"
          : record.entryKind === "grouped"
            ? "Grouped race record"
            : "Race"}
      </td>
      <td className="min-w-40 px-3 py-2 text-xs">
        <span className="block text-muted">{record.evidenceLabel}</span>
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
      {hasActions ? <td className="px-3 py-2 text-xs text-muted">—</td> : null}
    </tr>
  ));
}
