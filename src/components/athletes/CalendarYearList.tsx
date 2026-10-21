import { Check } from "lucide-react";

export function CalendarYearList({ years }: { years: { year: number; verified: boolean }[] }) {
  return (
    <div className="mt-2 space-y-2 text-xs">
      <ul className="flex flex-wrap gap-1.5" aria-label="Recorded racing years">
        {years.map(({ year, verified }) => (
          <li
            key={year}
            className="flex items-center gap-1 rounded border border-current/20 px-2 py-1"
            aria-label={`${year}: ${verified ? "verified result recorded" : "awaiting verification"}`}
          >
            {year}
            {verified ? <Check className="size-3.5" aria-hidden="true" /> : null}
          </li>
        ))}
      </ul>
      <p>Each year counts once. A tick means at least one result from that year is verified.</p>
      {years.some(({ verified }) => !verified) ? (
        <p>Years without a tick are awaiting verification.</p>
      ) : null}
    </div>
  );
}
