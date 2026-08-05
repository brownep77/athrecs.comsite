import { createFileRoute, Link } from "@tanstack/react-router";
import { listCalendarEditions } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type { EntryStatus } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/calendar")({
  loader: () => listCalendarEditions(),
  component: CalendarPage,
});

function CalendarPage() {
  const editions = Route.useLoaderData();

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Calendar
        </h1>
        <p className="text-sm text-muted">
          All listed Norfolk race days by date.
        </p>
      </header>

      <div className="grid gap-2">
        {editions.map((ed) => {
          const st = effectiveStatus(ed.event_date, ed.status as EntryStatus);
          const start = formatStartTime(ed.start_time);
          return (
            <Link
              key={ed.id}
              to="/races/$slug"
              params={{ slug: ed.event_slug }}
              className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3.5 py-3 no-underline shadow-card hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="mb-1 flex flex-wrap gap-1.5">
                  <Badge variant="accent">{ed.sport}</Badge>
                  <Badge variant="outline">{ed.distance_code}</Badge>
                  <Badge variant={st === "Finished" ? "default" : "solid"}>
                    {statusLabel(st)}
                  </Badge>
                </div>
                <p className="font-semibold text-fg">{ed.event_name}</p>
                <p className="text-xs text-muted">
                  {formatRaceDateShort(ed.event_date)}
                  {start ? ` · ${start}` : ""} · {ed.city}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
