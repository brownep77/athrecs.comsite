import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flag, Medal, Timer, Trophy } from "lucide-react";
import { listEvents } from "@/lib/athrecs/api";
import { RaceCard } from "@/components/races/RaceCard";

const COLLECTIONS = [
  {
    key: "track-field",
    title: "Track & field",
    description: "Outdoor and indoor meetings covering track races, jumps, throws and combined events.",
    icon: Medal,
    filter: { surface: "Track" },
  },
  {
    key: "cross-country",
    title: "Cross country",
    description: "Cross-country leagues, championships and international fixtures.",
    icon: Flag,
    filter: { surface: "XC" },
  },
  {
    key: "road-athletics",
    title: "Road athletics",
    description: "Licensed road athletics meetings and championship races classified as Athletics.",
    icon: Timer,
    filter: { surface: "Road" },
  },
  {
    key: "championships",
    title: "Championships",
    description: "National, continental and world-level athletics championships in the calendar.",
    icon: Trophy,
    filter: { q: "championship" },
  },
] as const;

export const Route = createFileRoute("/race-series")({
  loader: async () => {
    const results = await Promise.all(
      COLLECTIONS.map((collection) =>
        listEvents({
          data: {
            sport: "Athletics",
            upcomingOnly: true,
            limit: 8,
            ...collection.filter,
          },
        }),
      ),
    );
    return COLLECTIONS.map((collection, index) => ({
      ...collection,
      events: results[index] ?? [],
    }));
  },
  head: () => ({
    meta: [
      { title: "Athletics disciplines and championships | ATHRECS" },
      {
        name: "description",
        content:
          "Browse track and field, cross-country, road athletics and championship fixtures on ATHRECS.",
      },
    ],
  }),
  component: AthleticsCollectionsPage,
});

function AthleticsCollectionsPage() {
  const collections = Route.useLoaderData();

  return (
    <div className="space-y-8 pb-10">
      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-primary" />
        <div className="space-y-4 p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Athletics collections
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            Disciplines and championships
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            Explore the athletics calendar by competition setting, from track and field meetings
            to cross-country and road championships.
          </p>
          <div className="flex flex-wrap gap-2">
            {collections.map((collection) => (
              <a
                key={collection.key}
                href={`#${collection.key}`}
                className="inline-flex min-h-10 items-center rounded-lg border border-border bg-elevated px-3 text-sm font-medium text-fg no-underline hover:border-accent"
              >
                {collection.title} · {collection.events.length}
              </a>
            ))}
          </div>
        </div>
      </header>

      {collections.map((collection) => (
        <section key={collection.key} id={collection.key} className="scroll-mt-24 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <collection.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-fg">{collection.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm text-muted">{collection.description}</p>
                </div>
              </div>
              <Link
                to="/races"
                search={{
                  sport: "Athletics",
                  surface: "surface" in collection.filter ? collection.filter.surface : undefined,
                  q: "q" in collection.filter ? collection.filter.q : undefined,
                }}
                className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-2">
            {collection.events.length ? (
              collection.events.map((event) => <RaceCard key={event.id} race={event} />)
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
                No upcoming verified {collection.title.toLowerCase()} fixtures are currently listed.
              </p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
