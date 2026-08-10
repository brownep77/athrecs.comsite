import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { RaceCard } from "@/components/races/RaceCard";
import { FilterChips } from "@/components/races/FilterChips";

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
  loader: () => listEvents({ data: {} }),
  component: EventsPage,
});

function EventsPage() {
  const initial = Route.useLoaderData();
  const [sport, setSport] = useState<Sport | "All">("All");
  const [q, setQ] = useState("");

  const unfiltered = sport === "All" && !q;
  const { data = initial } = useQuery({
    queryKey: ["events", sport, q],
    queryFn: () => listEvents({ data: { sport, q: q || undefined } }),
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
          Norfolk fixtures — road running, track & field athletics, cycling,
          swimming, multi-sport, rowing and OCR.
        </p>
      </header>

      <FilterChips
        label="Sport"
        options={[...SPORTS]}
        value={sport}
        onChange={(v) => setSport(v as Sport | "All")}
      />

      <label className="block max-w-md space-y-1.5 text-xs font-medium text-muted">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, city…"
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>

      <p className="text-sm text-subtle">{data.length} events</p>

      <div className="grid gap-2">
        {data.map((r) => (
          <RaceCard key={r.id} race={r} />
        ))}
      </div>
    </div>
  );
}
