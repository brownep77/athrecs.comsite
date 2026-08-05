import { Link } from "@tanstack/react-router";
import {
  Bike,
  Clock,
  Droplets,
  Footprints,
  MapPin,
  Medal,
  Mountain,
  Ship,
  Timer,
  Waves,
  Zap,
} from "lucide-react";
import type { EventListItem, Sport } from "@/lib/athrecs/types";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatRaceWeekday,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import { Badge } from "@/components/ui/badge";

function SportIcon({ sport }: { sport: Sport }) {
  if (sport === "Cycling") return <Bike className="h-3.5 w-3.5" />;
  if (sport === "Swimming") return <Droplets className="h-3.5 w-3.5" />;
  if (sport === "Triathlon") return <Timer className="h-3.5 w-3.5" />;
  if (sport === "Duathlon") return <Zap className="h-3.5 w-3.5" />;
  if (sport === "Aquathlon") return <Waves className="h-3.5 w-3.5" />;
  if (sport === "Aquabike") return <Bike className="h-3.5 w-3.5" />;
  if (sport === "Rowing") return <Ship className="h-3.5 w-3.5" />;
  if (sport === "OCR") return <Mountain className="h-3.5 w-3.5" />;
  if (sport === "Athletics") return <Medal className="h-3.5 w-3.5" />;
  return <Footprints className="h-3.5 w-3.5" />;
}

export function RaceCard({ race }: { race: EventListItem }) {
  const focusDate = race.next_date;
  const focusStatus =
    race.next_date && race.next_status
      ? effectiveStatus(race.next_date, race.next_status)
      : null;
  const startLabel = formatStartTime(race.next_start_time);

  return (
    <article className="relative min-w-0 rounded-xl border border-border bg-surface p-3.5 shadow-card transition-colors hover:border-border-strong">
      <div className="flex min-w-0 gap-3">
        <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-border bg-elevated px-1 py-1.5 text-center">
          {focusDate ? (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                {formatRaceWeekday(focusDate)}
              </span>
              <span className="font-display text-lg font-semibold tabular leading-none text-fg">
                {new Date(focusDate + "T12:00:00").getDate()}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-subtle">
                {new Date(focusDate + "T12:00:00").toLocaleDateString("en-GB", {
                  month: "short",
                })}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-subtle">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="accent" className="gap-1">
              <SportIcon sport={race.sport} />
              {race.sport}
            </Badge>
            <Badge variant="outline">{race.surface}</Badge>
            {race.distances.slice(0, 3).map((d) => (
              <Badge key={d} variant="outline">
                {d}
              </Badge>
            ))}
            {focusStatus && (
              <Badge variant={focusStatus === "Finished" ? "default" : "solid"}>
                {statusLabel(focusStatus)}
              </Badge>
            )}
          </div>
          <Link
            to="/races/$slug"
            params={{ slug: race.slug }}
            className="block truncate font-semibold text-fg no-underline hover:text-accent"
          >
            {race.name}
          </Link>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-subtle" />
            <span className="truncate">
              {race.city}, {race.county}
            </span>
          </p>
          {focusDate && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <Clock className="h-3.5 w-3.5 text-subtle" />
              {startLabel ? (
                <>
                  Start <span className="font-medium text-fg">{startLabel}</span>
                </>
              ) : (
                <span className="text-subtle">Start TBC</span>
              )}
            </p>
          )}
          <p className="mt-1 truncate text-xs text-subtle">
            {race.next_date
              ? `Next: ${formatRaceDateShort(race.next_date)}${race.next_distance ? ` · ${race.next_distance}` : ""}`
              : race.past_count > 0
                ? `${race.past_count} past edition${race.past_count === 1 ? "" : "s"}`
                : "No editions"}
            {" · "}
            {race.edition_count} total
          </p>
        </div>
      </div>
    </article>
  );
}
