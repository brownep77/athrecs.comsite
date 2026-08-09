import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { getAthleteBySlug } from "@/lib/athrecs/api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/athletes/$slug")({
  loader: async ({ params }) => {
    const data = await getAthleteBySlug({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  component: AthletePage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Athlete not found</h1>
      <Button asChild variant="secondary">
        <Link to="/athletes">Back</Link>
      </Button>
    </div>
  ),
});

function AthletePage() {
  const { athlete, results } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <Link
        to="/athletes"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Athletes
      </Link>

      <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <p className="text-xs font-medium uppercase tracking-wider text-subtle">
          Athlete profile
        </p>
        <h1 className="font-display text-2xl font-semibold text-fg">
          {athlete.display_name}
        </h1>
        {athlete.club && athlete.club_slug ? (
          <p className="text-sm text-muted">
            <Link
              to="/clubs/$slug"
              params={{ slug: athlete.club_slug }}
              className="font-medium text-accent no-underline hover:underline"
            >
              {athlete.club}
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted">Unattached</p>
        )}
        <p className="flex items-center gap-1.5 text-xs text-subtle">
          <MapPin className="h-3.5 w-3.5" />
          {[athlete.city, athlete.county, athlete.country].filter(Boolean).join(" · ")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {athlete.gender === "F" ? "Female" : "Male"}
          </Badge>
          <Badge variant="accent">{results.length} results</Badge>
        </div>
        {athlete.bio && (
          <p className="max-w-prose text-sm text-muted">{athlete.bio}</p>
        )}
        {(athlete.aliases ?? []).length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Other names raced under
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(athlete.aliases ?? []).map((name: string) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">
          Results history
        </h2>
        <p className="text-xs text-subtle">
          Published finish times only - no composite ratings. Confirm on the official timer site.
        </p>
        {results.length === 0 ? (
          <p className="text-sm text-muted">No results yet.</p>
        ) : (
          <div className="grid gap-2">
            {results.map((r) => (
              <Link
                key={r.id}
                to="/races/$slug"
                params={{ slug: r.event_slug }}
                className="flex flex-col gap-1 rounded-xl border border-border bg-surface px-3.5 py-3 no-underline shadow-card hover:border-border-strong sm:flex-row sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{r.distance_code}</Badge>
                    {r.category && (
                      <Badge variant="outline">{r.category}</Badge>
                    )}
                  </div>
                  <p className="font-medium text-fg">{r.event_name}</p>
                  <p className="text-xs text-muted">
                    {formatRaceDateShort(r.event_date)}
                  </p>
                </div>
                <p className="font-semibold tabular text-fg">
                  {formatDuration(r.finish_time_seconds)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
