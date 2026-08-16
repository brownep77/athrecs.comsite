import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, MapPin, Users } from "lucide-react";
import { getClubBySlug } from "@/lib/athrecs/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NationFlag } from "@/components/flags/NationFlag";

export const Route = createFileRoute("/clubs/$slug")({
  loader: async ({ params }) => {
    const data = await getClubBySlug({ data: params.slug });
    if (!data) throw notFound();
    return data;
  },
  component: ClubPage,
  notFoundComponent: () => (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-xl font-semibold">Club not found</h1>
      <Button asChild variant="secondary">
        <Link to="/clubs">Back to clubs</Link>
      </Button>
    </div>
  ),
});

function ClubPage() {
  const { club, members } = Route.useLoaderData();
  const location = [...new Set([club.city, club.county, club.country].map((part) => part.trim()))]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-8">
      <Link
        to="/clubs"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted no-underline hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Clubs
      </Link>

      <section className="space-y-4 rounded-xl border border-border bg-surface p-5 shadow-card md:p-7">
        <div className="flex flex-wrap gap-2">
          {club.sports.map((s) => (
            <Badge key={s} variant="accent">
              {s}
            </Badge>
          ))}
          <Badge variant="outline" className="gap-1">
            <Users className="h-3 w-3" />
            {members.length} on Athrecs
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <NationFlag nation={club.country} />
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg md:text-3xl">
            {club.name}
          </h1>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 text-subtle" />
          {location}
        </p>
        <p className="max-w-prose text-sm leading-relaxed text-muted">{club.summary}</p>
        <div className="flex flex-wrap gap-2">
          {club.website && (
            <Button asChild variant="secondary">
              <a href={club.website} target="_blank" rel="noreferrer">
                Club website
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
          <Button asChild variant="secondary">
            <Link to="/athletes">Browse athletes</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-fg">Athletes at this club</h2>
        {members.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
            No athletes linked yet.
          </p>
        ) : (
          <div className="grid gap-2">
            {members.map((m) => (
              <Link
                key={m.id}
                to="/athletes/$slug"
                params={{ slug: m.slug }}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 no-underline shadow-card hover:border-border-strong"
              >
                <div>
                  <p className="font-semibold text-fg">{m.display_name}</p>
                  <p className="text-xs text-muted">
                    {m.city ?? club.city}
                    {" · "}
                    {m.gender === "F" ? "Female" : "Male"}
                  </p>
                </div>
                <Badge variant="outline">{m.result_count} results</Badge>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
