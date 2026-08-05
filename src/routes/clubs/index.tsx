import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listClubs } from "@/lib/athrecs/api";
import { ClubCard } from "@/components/clubs/ClubCard";

export const Route = createFileRoute("/clubs/")({
  loader: () => listClubs({ data: {} }),
  component: ClubsPage,
});

function ClubsPage() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const { data = initial } = useQuery({
    queryKey: ["clubs", q],
    queryFn: () => listClubs({ data: { q: q || undefined } }),
    initialData: !q ? initial : undefined,
    placeholderData: (prev) => prev ?? (!q ? initial : undefined),
    staleTime: 30_000,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Clubs
          </h1>
          <Link
            to="/athletes"
            className="text-sm font-medium text-accent no-underline hover:underline"
          >
            Athletes →
          </Link>
        </div>
        <p className="text-sm text-muted">
          Norfolk running, cycling, swim and multi-sport clubs — next to athletes
          in the app.
        </p>
      </header>

      <label className="block max-w-md space-y-1.5 text-xs font-medium text-muted">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Club name, city, sport…"
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>

      <p className="text-sm text-subtle">{data.length} clubs</p>

      <div className="grid gap-2 sm:grid-cols-2">
        {data.map((c) => (
          <ClubCard key={c.id} club={c} />
        ))}
      </div>
    </div>
  );
}
