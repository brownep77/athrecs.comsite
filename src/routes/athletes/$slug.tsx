import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { getAthleteBySlug } from "@/lib/athrecs/api";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { athletes as athleteCatalogue } from "@/data/athletes";
import { publicFigureAthletes } from "@/data/rich-roll";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/athletes/$slug")({
  loader: async ({ params }) => {
    const data = await getAthleteBySlug({ data: params.slug });
    if (!data) throw notFound();
    const seed = [...athleteCatalogue, ...publicFigureAthletes].find((a) => a.slug === params.slug);
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
        profile_type: seed?.profile_type ?? data.athlete.profile_type ?? "Athlete",
        profile_roles:
          seed?.profile_roles ??
          data.athlete.profile_roles
            ?.split(",")
            .map((role: string) => role.trim())
            .filter(Boolean) ??
          [],
        profile_source_checked_at:
          seed?.profile_source_checked_at ?? data.athlete.profile_source_checked_at ?? null,
        profile_links: seed?.profile_links ?? [],
        notable_achievements: seed?.notable_achievements ?? [],
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
  const sourceCheckedAt = formatDob(athlete.profile_source_checked_at);
  const isPublicFigure = athlete.profile_type === "Public figure";
  const detailRows: { label: string; value: string }[] = [];
  if (dob) detailRows.push({ label: "Date of birth", value: dob });
  if (athlete.place_of_birth)
    detailRows.push({ label: "Place of birth", value: athlete.place_of_birth });
  if (athlete.country_of_birth)
    detailRows.push({
      label: "Country of birth",
      value: athlete.country_of_birth,
    });
  if (athlete.nationality) detailRows.push({ label: "Nationality", value: athlete.nationality });
  if (athlete.address) detailRows.push({ label: "Address", value: athlete.address });
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
          {isPublicFigure ? "Public figure athlete profile" : "Athlete profile"}
        </p>
        <h1 className="font-display text-2xl font-semibold text-fg">{athlete.display_name}</h1>
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
          {isPublicFigure && <Badge variant="accent">Public figure</Badge>}
          <Badge variant="outline">
            {athlete.gender === "F" ? "Female" : athlete.gender === "M" ? "Male" : athlete.gender}
          </Badge>
          <Badge variant="accent">{results.length} results</Badge>
          {athlete.profile_roles.map((role: string) => (
            <Badge key={role} variant="outline">
              {role}
            </Badge>
          ))}
        </div>
        {athlete.bio && <p className="max-w-prose text-sm text-muted">{athlete.bio}</p>}
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
        {isPublicFigure && sourceCheckedAt && (
          <p className="border-t border-border pt-3 text-xs text-subtle">
            Public biographical and race sources checked {sourceCheckedAt}. This label does not mean
            the athlete has claimed the account.
          </p>
        )}
      </section>

      {athlete.profile_links.length > 0 && (
        <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
          <h2 className="font-display text-lg font-semibold text-fg">Official links</h2>
          <div className="flex flex-wrap gap-2">
            {athlete.profile_links.map((link: { label: string; url: string }) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-sm font-medium text-accent no-underline hover:border-border-strong hover:underline"
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </section>
      )}

      {athlete.notable_achievements.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-fg">
            Notable endurance achievements
          </h2>
          <div className="grid gap-2">
            {athlete.notable_achievements.map(
              (achievement: {
                year: number;
                title: string;
                detail: string;
                source_url: string;
              }) => (
                <article
                  key={`${achievement.year}-${achievement.title}`}
                  className="rounded-xl border border-border bg-surface p-4 shadow-card"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{achievement.year}</Badge>
                    <h3 className="font-semibold text-fg">{achievement.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-muted">{achievement.detail}</p>
                  <a
                    href={achievement.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex min-h-11 items-center text-xs font-medium text-accent no-underline hover:underline"
                  >
                    Source ↗
                  </a>
                </article>
              ),
            )}
          </div>
        </section>
      )}

      {detailRows.length > 0 && (
        <section className="space-y-3 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
          <h2 className="font-display text-lg font-semibold text-fg">Personal details</h2>
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
        <h2 className="font-display text-lg font-semibold text-fg">Results history</h2>
        <p className="text-xs text-subtle">
          Published finish times only - no composite ratings. Confirm on the official timer site.
        </p>
        {results.length === 0 ? (
          <p className="text-sm text-muted">No results yet.</p>
        ) : (
          <div className="grid gap-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-surface px-3.5 py-3 shadow-card hover:border-border-strong"
              >
                <Link
                  to="/races/$slug"
                  params={{ slug: r.event_slug }}
                  className="flex flex-col gap-1 no-underline sm:flex-row sm:justify-between"
                >
                  <div>
                    <div className="mb-1 flex flex-wrap gap-1.5">
                      <Badge variant="outline">{r.distance_code}</Badge>
                      {r.category && <Badge variant="outline">{r.category}</Badge>}
                      {r.overall_place != null && (
                        <Badge variant="outline">Place {r.overall_place}</Badge>
                      )}
                    </div>
                    <p className="font-medium text-fg">{r.event_name}</p>
                    <p className="text-xs text-muted">{formatRaceDateShort(r.event_date)}</p>
                  </div>
                  <p className="font-semibold tabular text-fg">
                    {formatDuration(r.finish_time_seconds)}
                  </p>
                </Link>
                {r.source_url && (
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex min-h-11 items-center text-xs font-medium text-accent no-underline hover:underline"
                  >
                    Official result ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
