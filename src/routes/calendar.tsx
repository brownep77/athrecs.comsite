import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listCalendarEditions } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type { EntryStatus } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";

const REGIONS = [
  { value: "", label: "All UK" },
  { value: "England", label: "England" },
  { value: "Scotland", label: "Scotland" },
  { value: "Wales", label: "Wales" },
  { value: "Norfolk", label: "Norfolk" },
  { value: "Suffolk", label: "Suffolk" },
] as const;

export const Route = createFileRoute("/calendar")({
  loader: () => listCalendarEditions({ data: { upcomingOnly: true } }),
  component: CalendarPage,
});

function CalendarPage() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const { data = initial } = useQuery({
    queryKey: ["calendar", q, region],
    queryFn: () =>
      listCalendarEditions({
        data: { q: q || undefined, region: region || undefined, upcomingOnly: true },
      }),
    initialData: !q && !region ? initial : undefined,
    placeholderData: (prev) => prev ?? (!q && !region ? initial : undefined),
    staleTime: 30_000,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Calendar
        </h1>
        <p className="text-sm text-muted">
          Upcoming UK race days from runABC (Scotland, North, Midlands, South)
          plus Norfolk & Suffolk fixtures. Confirm entry on the event page.
        </p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setRegion(r.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              region === r.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface text-muted hover:border-border-strong"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <label className="block max-w-md space-y-1.5 text-xs font-medium text-muted">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Race, city, county…"
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>

      <p className="text-sm text-subtle">{data.length} upcoming race days</p>

      <div className="grid gap-2">
        {data.map((ed) => {
          const st = effectiveStatus(ed.event_date, ed.status as EntryStatus);
          const start = formatStartTime(ed.start_time);
          const place = [ed.city, ed.county].filter(Boolean).join(" · ");
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
                  {start ? ` · ${start}` : ""} · {place}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
