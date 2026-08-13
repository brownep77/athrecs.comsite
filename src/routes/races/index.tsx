import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listEvents } from "@/lib/athrecs/api";
import type { Sport } from "@/lib/athrecs/types";
import { RaceCard } from "@/components/races/RaceCard";
import {
  EMPTY_SEARCH,
  EventSearch,
  isEmptySearch,
  searchToApi,
  type EventSearchValues,
} from "@/components/races/EventSearch";

export const Route = createFileRoute("/races/")({
  loader: () => listEvents({ data: { upcomingOnly: true, limit: 40 } }),
  component: EventsPage,
});

function EventsPage() {
  const initial = Route.useLoaderData();
  const [filters, setFilters] = useState<EventSearchValues>(EMPTY_SEARCH);
  const empty = isEmptySearch(filters);

  const { data = initial } = useQuery({
    queryKey: ["events", filters],
    queryFn: () =>
      listEvents({
        data: {
          ...searchToApi(filters),
          sport: (searchToApi(filters).sport as Sport | undefined) ?? undefined,
          upcomingOnly: !filters.dateFrom && !filters.dateTo && !filters.month,
          limit: 80,
        },
      }),
    initialData: empty ? initial : undefined,
    placeholderData: (prev) => prev ?? (empty ? initial : undefined),
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
          Search by country, county, city, postcode, month or date range.
          Use the Country menu for Australia, South Africa, Japan, the USA and every other parkrun nation.
        </p>
      </header>

      <EventSearch value={filters} onChange={setFilters} />

      <p className="text-sm text-subtle">{data.length} events shown</p>

      <div className="grid gap-2">
        {data.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            No events match those filters.
          </p>
        ) : (
          data.map((r) => <RaceCard key={r.id} race={r} />)
        )}
      </div>
    </div>
  );
}
