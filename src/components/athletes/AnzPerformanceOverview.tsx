import { useMemo, useState } from "react";
import { Medal, TrendingUp, Trophy } from "lucide-react";
import { ANZ_PROVIDER, anzProgress, anzTime, type AnzMedal } from "@/lib/anz/core";
import type { SourceHistory } from "@/lib/athrecs/source-performance-history";
import { formatRaceDateShort } from "@/lib/athrecs/format";

export function AnzPerformanceOverview({
  histories,
  medals,
  coach,
}: {
  histories: readonly SourceHistory[];
  medals: readonly AnzMedal[];
  coach: { name: string; slug: string } | null;
}) {
  const events = useMemo(() => anzProgress(histories), [histories]);
  const [selected, setSelected] = useState("");
  const event = events.find((e) => e.discipline === selected) ?? events[0];
  const source = histories.find((h) => h.provider === ANZ_PROVIDER);
  if (!source || !events.length) return null;
  const first = event.years[0],
    latest = event.years.at(-1)!;
  const improvement = ((anzTime(first)! - anzTime(latest)!) / anzTime(first)!) * 100;
  const range = event.years.map((r) => anzTime(r)!);
  const min = Math.min(...range),
    max = Math.max(...range),
    span = max - min || 1;
  const x = (i: number) =>
    event.years.length === 1 ? 300 : 38 + (i * 524) / (event.years.length - 1);
  const y = (seconds: number) => 140 - ((max - seconds) / span) * 106;
  const latestResult = [...event.rows].sort((a, b) => b.date.localeCompare(a.date))[0];
  return (
    <section aria-label="ANZ performance overview" className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <Trophy className="size-5 text-accent" aria-hidden="true" />
            PBs
          </h2>
          <p className="mt-1 text-sm text-muted">
            Best eligible performances in the recorded ranking history.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {events.map((item) => (
          <button
            type="button"
            key={item.discipline}
            aria-pressed={event.discipline === item.discipline}
            onClick={() => setSelected(item.discipline)}
            className={`min-w-0 rounded-xl border p-4 text-left transition-colors ${event.discipline === item.discipline ? "border-accent bg-accent-soft" : "border-border bg-surface hover:bg-elevated"}`}
          >
            <span className="block text-sm font-semibold">
              {item.discipline}
              <span className="ml-2 text-xs font-normal text-muted">{item.surface}</span>
            </span>
            <strong className="my-1 block text-2xl tabular-nums">{item.best.performance}</strong>
            <span className="block text-xs text-muted">
              {formatRaceDateShort(item.best.date)} · {item.best.venue}
            </span>
            <span className="mt-1 block truncate text-xs text-muted" title={item.best.meeting}>
              {item.best.meeting}
            </span>
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
            <TrendingUp className="size-5 text-accent" aria-hidden="true" />
            Progress by year
          </h3>
          <label className="flex items-center gap-2 text-sm">
            Event
            <select
              value={event.discipline}
              onChange={(e) => setSelected(e.target.value)}
              className="min-h-11 rounded-lg border border-border bg-surface px-3"
            >
              {events.map((e) => (
                <option key={e.discipline}>{e.discipline}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-2 text-sm text-muted">
          {event.rows.length} recorded {event.rows.length === 1 ? "performance" : "performances"} ·
          Best: <strong className="text-fg">{event.best.performance}</strong>
        </p>
        {event.years.length > 1 ? (
          <>
            <p className="mt-1 text-sm">
              {Math.abs(improvement).toFixed(1)}% {improvement >= 0 ? "faster" : "slower"} annual
              best from {first.year} to {latest.year}.
            </p>
            <svg
              viewBox="0 0 600 185"
              role="img"
              aria-label={`${event.discipline} annual best times, with faster times higher. ${event.years.map((r) => `${r.year}: ${r.performance}`).join("; ")}`}
              className="mt-4 w-full overflow-visible text-accent"
            >
              <line x1="38" x2="562" y1="145" y2="145" stroke="currentColor" opacity="0.2" />
              <polyline
                points={range.map((seconds, i) => `${x(i)},${y(seconds)}`).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              {event.years.map((r, i) => (
                <g key={r.year}>
                  <circle cx={x(i)} cy={y(anzTime(r)!)} r="4" fill="currentColor" />
                  <text
                    x={x(i)}
                    y={y(anzTime(r)!) - 12}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="12"
                  >
                    {r.performance}
                  </text>
                  <text x={x(i)} y="172" textAnchor="middle" fill="currentColor" fontSize="12">
                    {r.year}
                  </text>
                </g>
              ))}
            </svg>
            <p className="text-xs text-muted">
              Faster times appear higher. Gaps mean no performance is recorded for that year.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted">
            One year is available for this event. Further results will extend the progression.
          </p>
        )}
        <details className="mt-4 border-t border-border pt-3">
          <summary className="cursor-pointer py-1 text-sm font-medium">Annual best details</summary>
          <div className="overflow-x-auto">
            <table className="mt-2 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2">Year</th>
                  <th>Time</th>
                  <th>Date</th>
                  <th>Meeting</th>
                </tr>
              </thead>
              <tbody>
                {event.years.map((r) => (
                  <tr key={r.year} className="border-b border-border/50">
                    <td className="py-2 pr-3">{r.year}</td>
                    <td className="pr-3 tabular-nums">{r.performance}</td>
                    <td className="whitespace-nowrap pr-3">{formatRaceDateShort(r.date)}</td>
                    <td>{r.meeting}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
        <p className="mt-3 text-xs text-muted">
          Latest {event.discipline}: {latestResult.performance} ·{" "}
          {formatRaceDateShort(latestResult.date)} · {latestResult.meeting}
        </p>
      </div>
      {medals.length ? (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
            <Medal className="size-5 text-amber-700" aria-hidden="true" />
            New Zealand championship medals
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {medals.map((m) => (
              <article
                key={`${m.year}-${m.event}-${m.medal}`}
                className="rounded-xl border border-border bg-surface p-4 no-underline hover:bg-elevated"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {m.year} · {m.medal}
                </span>
                <strong className="mt-1 block">
                  {m.event} · {m.performance}
                </strong>
                <span className="text-sm text-muted">{m.ageGroup}</span>
              </article>
            ))}
          </div>
        </div>
      ) : null}
      <div className="space-y-1 text-xs text-muted">
        {coach ? (
          <p>
            Coach:{" "}
            {coach.slug ? (
              <a href={`/athletes/${coach.slug}`} className="font-semibold text-accent underline">
                {coach.name}
              </a>
            ) : (
              coach.name
            )}{" "}
          </p>
        ) : null}
        <p>
          {source.performances.length} ranking performances. This may not be a complete race
          history.
        </p>
        <p>
          Club races, cross-country and relay results can come from additional sources in the race
          history below.
        </p>
        <p>
          Original time precision is retained. Road and track events are separate; Chip or gun
          timing is unspecified here.
        </p>
      </div>
    </section>
  );
}
