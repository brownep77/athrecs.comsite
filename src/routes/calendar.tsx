import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bus, Clock3, MapPin, CircleParking, TrainFront } from "lucide-react";
import { listCalendarEditions } from "@/lib/athrecs/api";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import type { EntryStatus } from "@/lib/athrecs/types";
import { Badge } from "@/components/ui/badge";
import { NationBadge, NationFlag } from "@/components/flags/NationFlag";
import type { VenueDetails } from "@/data/venue-details";

const REGIONS: { value: string; label: string; kind?: "UnitedKingdom" | "Ireland" }[] = [
  { value: "", label: "All UK & Ireland" },
  { value: "England", label: "England", kind: "UnitedKingdom" },
  { value: "Scotland", label: "Scotland", kind: "UnitedKingdom" },
  { value: "Wales", label: "Wales", kind: "UnitedKingdom" },
  { value: "Northern Ireland", label: "N. Ireland", kind: "UnitedKingdom" },
  { value: "Ireland", label: "Ireland", kind: "Ireland" },
  { value: "Norfolk", label: "Norfolk", kind: "UnitedKingdom" },
  { value: "Suffolk", label: "Suffolk", kind: "UnitedKingdom" },
];

type CardModel = {
  id: string;
  event_slug: string;
  event_name: string;
  event_date: string;
  distance_code: string;
  status: EntryStatus;
  start_time: string | null;
  sport: string;
  venue: VenueDetails;
};

const FLAG_EXAMPLES: CardModel[] = [
  {
    id: "ex-britain",
    event_slug: "great-north-run",
    event_name: "AJ Bell Great North Run",
    event_date: "2026-09-13",
    distance_code: "Half",
    status: "Open",
    start_time: "10:40",
    sport: "Running",
    venue: {
      nation: "England",
      address: "Newcastle Quayside, Newcastle upon Tyne, NE1",
      parking: "Town Moor / Quayside public car parks — confirm race-day closures",
      busStop: "Central Station / Quayside buses — check Nexus",
      trainStation: "Newcastle station (0.8 km, NCL)",
    },
  },
  {
    id: "ex-ireland",
    event_slug: "dublin-marathon",
    event_name: "Dublin Marathon",
    event_date: "2026-10-25",
    distance_code: "Marathon",
    status: "Open",
    start_time: "09:00",
    sport: "Running",
    venue: {
      nation: "Ireland",
      address: "Fitzwilliam Square / Leeson Street Lower, Dublin 2",
      parking: "City-centre car parks — expect closures on race morning",
      busStop: "Dublin Bus / Luas to St Stephen’s Green",
      trainStation: "Dublin Pearse / Connolly",
    },
  },
];

export const Route = createFileRoute("/calendar")({
  loader: () => listCalendarEditions({ data: { upcomingOnly: true, limit: 24 } }),
  component: CalendarPage,
});

function Detail({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-xs leading-snug text-muted">
      <span className="mt-0.5 shrink-0 text-subtle">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {label}
        </p>
        <p className="text-fg">{value}</p>
      </div>
    </div>
  );
}

function CalendarPage() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const { data = initial, isFetching } = useQuery({
    queryKey: ["calendar", q, region],
    queryFn: () =>
      listCalendarEditions({
        data: {
          q: q || undefined,
          region: region || undefined,
          upcomingOnly: true,
          limit: 24,
        },
      }),
    initialData: !q && !region ? initial : undefined,
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
          Union Jack for United Kingdom races, Irish flag for Ireland. Next 24 upcoming
          race days below — search or filter for more.
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-border bg-elevated p-3">
        <div>
          <p className="font-display text-lg font-semibold text-fg">
            Flag & travel preview
          </p>
          <p className="text-sm text-muted">
            Union Jack for the United Kingdom, Irish tricolour for Ireland.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <NationBadge kind="UnitedKingdom" />
          <NationBadge kind="Ireland" />
        </div>
        <div className="grid gap-2">
          {FLAG_EXAMPLES.map((ed) => (
            <EventCard key={ed.id} ed={ed} />
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-1.5">
        {REGIONS.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setRegion(r.value)}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
              region === r.value
                ? "border-accent bg-accent-soft text-fg"
                : "border-border bg-surface text-muted hover:border-border-strong"
            }`}
          >
            {r.kind ? <NationFlag kind={r.kind} className="h-3.5 w-5" /> : null}
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

      <p className="text-sm text-subtle">
        {isFetching ? "Loading…" : `${data.length} upcoming race days shown`}
      </p>

      <div className="grid gap-2">
        {data.map((ed) => (
          <EventCard
            key={ed.id}
            ed={{
              id: String(ed.id),
              event_slug: ed.event_slug,
              event_name: ed.event_name,
              event_date: ed.event_date,
              distance_code: ed.distance_code,
              status: ed.status as EntryStatus,
              start_time: ed.start_time,
              sport: ed.sport,
              venue: ed.venue,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function EventCard({ ed }: { ed: CardModel }) {
  const st = effectiveStatus(ed.event_date, ed.status);
  const start = formatStartTime(ed.start_time);
  const venue = ed.venue;
  const nation = venue.nation;

  return (
    <Link
      to="/races/$slug"
      params={{ slug: ed.event_slug }}
      className="block rounded-xl border border-border bg-surface p-3.5 no-underline shadow-card hover:border-border-strong"
    >
      <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <NationBadge nation={nation} />
            <Badge variant="accent">{ed.sport}</Badge>
            <Badge variant="outline">{ed.distance_code}</Badge>
            <Badge variant={st === "Finished" ? "default" : "solid"}>
              {statusLabel(st)}
            </Badge>
          </div>
          <p className="font-display text-base font-semibold leading-snug text-fg">
            {ed.event_name}
          </p>
          <p className="text-sm font-medium text-fg">
            {formatRaceDateShort(ed.event_date)}
            {start ? (
              <span className="text-accent"> · Starts {start}</span>
            ) : (
              <span className="text-subtle"> · Start time TBC</span>
            )}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Detail
              icon={<Clock3 className="h-3.5 w-3.5" />}
              label="Race time"
              value={start ? `${start} start` : "Confirm on event page"}
            />
            <Detail icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={venue.address} />
            <Detail
              icon={<TrainFront className="h-3.5 w-3.5" />}
              label="Nearest train"
              value={venue.trainStation}
            />
            <Detail icon={<Bus className="h-3.5 w-3.5" />} label="Nearest bus" value={venue.busStop} />
            <Detail
              icon={<CircleParking className="h-3.5 w-3.5" />}
              label="Parking"
              value={venue.parking}
            />
          </div>
        </div>
    </Link>
  );
}
