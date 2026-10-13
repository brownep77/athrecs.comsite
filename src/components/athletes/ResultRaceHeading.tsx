import { formatRaceDateShort } from "@/lib/athrecs/format";
import { ResultDistance } from "./ResultDistance";

export function ResultRaceHeading({
  race,
  distance,
  date,
  performance,
}: {
  race: string;
  distance: string;
  date: string;
  performance: string;
}) {
  return (
    <div className="mb-2 space-y-3">
      <div>
        <p className="text-xs text-muted">Race name</p>
        <h3 className="break-words text-base font-semibold">{race || "Recorded performance"}</h3>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <dt className="mb-1 text-xs text-muted">Distance</dt>
          <dd>
            <ResultDistance distance={distance} />
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-muted">Race date</dt>
          <dd className="text-sm font-medium">
            {/^\d{4}-\d{2}-\d{2}$/.test(date) ? formatRaceDateShort(date) : date || "Not recorded"}
          </dd>
        </div>
        <div>
          <dt className="mb-1 text-xs text-muted">Performance</dt>
          <dd className="text-sm font-semibold tabular-nums">{performance || "Not recorded"}</dd>
        </div>
      </dl>
    </div>
  );
}
