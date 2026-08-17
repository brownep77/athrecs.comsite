import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { RaceGroupBadges } from "@/components/races/RaceGroupBadges";
import { raceGroupDefinitions } from "@/data/race-collections";
import { listEvents } from "@/lib/athrecs/api";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import type { EventListItem, RaceGroupCode } from "@/lib/athrecs/types";

const groupOrder: RaceGroupCode[] = [
  "world-marathon-majors",
  "utmb-world-series",
  "utmb-index",
];

export const Route = createFileRoute("/race-series")({
  loader: async () => {
    const collections = await Promise.all(
      groupOrder.map(async (code) => ({
        code,
        races: await listEvents({ data: { group: code, upcomingOnly: false, limit: 80 } }),
      })),
    );
    return collections;
  },
  head: () => ({
    meta: [
      { title: "World Marathon Majors & UTMB races | ATHRECS" },
      {
        name: "description",
        content:
          "Explore the World Marathon Majors, official UTMB World Series events and verified UTMB Index races on ATHRECS.",
      },
    ],
  }),
  component: RaceSeriesPage,
});

function RaceSeriesPage() {
  const loaded = Route.useLoaderData();
  const racesByCode = new Map(loaded.map((collection) => [collection.code, collection.races]));

  return (
    <div className="space-y-8 pb-10">
      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-primary" />
        <div className="space-y-4 p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Official race collections
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            World Marathon Majors &amp; UTMB races
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            Browse the eight current World Marathon Majors, the official UTMB World Series
            calendar, and individually verified UTMB Index races. UTMB Index races contribute to
            an athlete’s Index but do not award Running Stones.
          </p>
          <div className="flex flex-wrap gap-2">
            {raceGroupDefinitions.map((definition) => (
              <a
                key={definition.code}
                href={`#${definition.code}`}
                className="inline-flex min-h-10 items-center rounded-lg border border-border bg-elevated px-3 text-sm font-medium text-fg no-underline hover:border-border-strong"
              >
                {definition.shortName} · {racesByCode.get(definition.code)?.length ?? 0}
              </a>
            ))}
          </div>
        </div>
      </header>

      {raceGroupDefinitions.map((definition) => {
        const races = racesByCode.get(definition.code) ?? [];
        return (
          <section key={definition.code} id={definition.code} className="scroll-mt-24 space-y-4">
            <div className="space-y-2 rounded-xl border border-border bg-surface p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    <h2 className="font-display text-xl font-semibold text-fg">
                      {definition.name}
                    </h2>
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted">
                    {definition.description}
                  </p>
                </div>
                <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                  {races.length} races
                </span>
              </div>
              <p className="text-sm font-medium text-fg">{definition.qualificationNote}</p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/races"
                  search={{ group: definition.code }}
                  className="inline-flex min-h-10 items-center text-sm font-medium text-accent no-underline hover:underline"
                >
                  Open in race search →
                </Link>
                <a
                  href={definition.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 items-center gap-1 text-sm font-medium text-muted no-underline hover:text-fg"
                >
                  Official source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {races.map((race) => (
                <CollectionRaceCard key={race.id} race={race} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CollectionRaceCard({ race }: { race: EventListItem }) {
  return (
    <article className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong">
      <div className="flex flex-wrap gap-1.5">
        <RaceGroupBadges groups={race.groups} />
      </div>
      <Link
        to="/races/$slug"
        params={{ slug: race.slug }}
        className="block font-semibold leading-snug text-fg no-underline hover:text-accent"
      >
        {race.name}
      </Link>
      <p className="text-sm text-muted">
        {[race.city, race.country].filter(Boolean).join(" · ") || "Location TBC"}
      </p>
      <p className="text-xs font-medium text-subtle">
        {race.next_date
          ? `Next listed: ${formatRaceDateShort(race.next_date)}`
          : "No future date listed"}
      </p>
    </article>
  );
}
