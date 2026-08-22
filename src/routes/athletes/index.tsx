import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAthletes } from "@/lib/athrecs/api";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/athletes/")({
  loader: () => listAthletes({ data: {} }),
  component: AthletesPage,
});

function AthletesPage() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const { data = initial } = useQuery({
    queryKey: ["athletes", q],
    queryFn: () => listAthletes({ data: { q: q || undefined } }),
    initialData: !q ? initial : undefined,
    placeholderData: (prev) => prev ?? (!q ? initial : undefined),
    staleTime: 30_000,
    refetchOnMount: false,
  });

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">Athletes</h1>
          <Link
            to="/clubs"
            className="text-sm font-medium text-accent no-underline hover:underline"
          >
            Clubs →
          </Link>
        </div>
        <p className="text-sm text-muted">
          Athlete profiles linked to clubs and source-checked race results.
        </p>
      </header>

      <label className="block max-w-md space-y-1.5 text-xs font-medium text-muted">
        Search
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, club, city…"
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg outline-none focus:ring-2 focus:ring-accent/30"
        />
      </label>

      <p className="text-sm text-subtle">{data.length} athletes</p>

      <div className="grid gap-2">
        {data.map((a) => (
          <Link
            key={a.id}
            to="/athletes/$slug"
            params={{ slug: a.slug }}
            className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3.5 py-3 no-underline shadow-card hover:border-border-strong sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-fg">{a.display_name}</p>
              <p className="text-xs text-muted">
                {a.club ? (
                  <>
                    {a.club}
                    {a.city ? ` · ${a.city}` : ""}
                  </>
                ) : (
                  (a.city ?? "Unattached")
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {a.profile_type === "Public figure" && <Badge variant="accent">Public figure</Badge>}
              <Badge variant="outline">
                {a.gender === "F" ? "Female" : a.gender === "M" ? "Male" : a.gender}
              </Badge>
              <Badge variant={a.profile_type === "Public figure" ? "outline" : "accent"}>
                {a.result_count} results
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
