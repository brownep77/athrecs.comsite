import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { RaceCard } from "@/components/races/RaceCard";
import { FilterChips } from "@/components/races/FilterChips";
import { DISTANCE_FILTERS, TERRAIN_FILTERS } from "@/lib/athrecs/filters";

const SPORTS = [
  "All",
  "Running",
  "Athletics",
  "Parkrun",
  "TrackAndField",
  "Cycling",
  "Swimming",
  "Triathlon",
  "Duathlon",
  "Aquathlon",
  "Aquabike",
  "Rowing",
  "OCR",
] as const;

export const Route = createFileRoute("/races/")({
  loader: () => listEvents({ data: { upcomingOnly: true, limit: 40 } }),
  component: EventsPage,
});

function EventsPage() {
  const initial = Route.useLoaderData();
  const [sport, setSport] = useState<Sport | "All">("All");
  const [distance, setDistance] = useState("All");
  const [surface, setSurface] = useState("All");
  const [q, setQ] = useState("");

  const unfiltered = sport === "All" && distance === "All" && surface === "All" && !q;
  const { data = initial } = useQuery({
    queryKey: ["events", sport, distance, surface, q],
    queryFn: () =>
      listEvents({
        data: {
          sport,
          q: q || undefined,
          distance: distance === "All" ? undefined : distance,
          surface: surface === "All" ? undefined : surface,
          upcomingOnly: true,
          limit: 40,
        },
      }),
    initialData: unfiltered ? initial : undefined,
    placeholderData: (prev) => prev ?? (unfiltered ? initial : undefined),
    staleTime: 30_000,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Events
        </h1>
        <p className="text-sm text-muted">
          Filter by sport, distance or terrain. Multi-distance races show a
          label for each distance so you can search 5K, 10K, Half and more.
        </p>
      </header>

      <FilterChips
        label="Sport"
        options={[...SPORTS]}
        value={sport}
        onChange={(v) => setSport(v as Sport | "All")}
      />
      <FilterChips
        label="Distance"
        options={[...DISTANCE_FILTERS]}
        value={distance}
        onChange={setDistance}
      />
      <FilterChips
        label="Terrain"
        options={[...TERRAIN_FILTERS]}
        value={surface}
        onChange={setSurface}
      />

      <label className="block max-w-md space-y-1.5 text-xs font-medium text-muted">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, city, 10K, trail…"
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>

      <p className="text-sm text-subtle">{data.length} upcoming events shown</p>

      <div className="grid gap-2">
        {data.map((r) => (
          <RaceCard key={r.id} race={r} />
        ))}
      </div>
    </div>
  );
}
