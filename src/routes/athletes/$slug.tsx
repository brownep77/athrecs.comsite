import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { getAthleteBySlug } from "@/lib/athrecs/api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { athletes as athleteCatalogue } from "@/data/athletes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/athletes/$slug")({
  loader: async ({ params }) => {
    const data = await getAthleteBySlug({ data: params.slug });
    if (!data) throw notFound();
    const seed = athleteCatalogue.find((a) => a.slug === params.slug);
    return {
      ...data,
      athlete: {
        ...data.athlete,
        aliases: seed?.aliases ?? [],
        date_of_birth: seed?.date_of_birth ?? null,
        place_of_birth: seed?.place_of_birth ?? null,
        country_of_birth: seed?.country_of_birth ?? null,
        address: seed?.address ?? null,
        nationality: seed?.nationality ?? null,
        notes: seed?.notes ?? null,
      },
    };
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

function formatDob(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function AthletePage() {
  const { athlete, results } = Route.useLoaderData();
  const aliases = athlete.aliases ?? [];
  const dob = formatDob(athlete.date_of_birth);
  const detailRows: { label: string; value: string }[] = [];
  if (dob) detailRows.push({ label: "Date of birth", value: dob });
  if (athlete.place_of_birth)
    detailRows.push({ label: "Place of birth", value: athlete.place_of_birth });
  if (athlete.country_of_birth)
    detailRows.push({
      label: "Country of birth",
      value: athlete.country_of_birth,
    });
  if (athlete.nationality)
    detailRows.push({ label: "Nationality", value: athlete.nationality });
  if (athlete.address)
    detailRows.push({ label: "Address", value: athlete.address });
  if (athlete.notes) detailRows.push({ label: "Notes", value: athlete.notes });

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
          {[athlete.city, athlete.county, athlete.country]
            .filter(Boolean)
            .join(" · ")}
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
        {aliases.length > 0 && (
          <div className="space-y-1.5 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wider text-subtle">
              Other names raced under
            </p>
            <div className="flex flex-wrap gap-1.5">
              {aliases.map((name: string) => (
                <Badge key={name} variant="outline">
                  {name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </section>

      {detailRows.length > 0 && (
        <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
          <h2 className="font-display text-lg font-semibold text-fg">
            Personal details
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            {detailRows.map((row) => (
              <div key={row.label} className="space-y-0.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-subtle">
                  {row.label}
                </dt>
                <dd className="text-sm text-fg">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">
          Results history
        </h2>
        <p className="text-xs text-subtle">
          Published finish times only - no composite ratings. Confirm on the
          official timer site.
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
