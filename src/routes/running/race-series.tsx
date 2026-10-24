import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { RaceGroupBadges } from "@/components/races/RaceGroupBadges";
import { raceGroupDefinitions } from "@/data/race-collections";
import { SUPERHALFS_PATH } from "@/data/superhalfs";
import { listEvents } from "@/runrecs/api";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import type { EventListItem, RaceGroupCode } from "@/lib/athrecs/types";
import { RunningGuidesLink } from "@/components/running/RunningGuidesLink";
import { runningSeriesGuidePath } from "@/lib/running/series-guides";

const loadSeriesGuides = createServerFn({ method: "GET" }).handler(async () => {
  const { getRunningSeriesSummaries } = await import("@/lib/running/series-guides.server");
  return getRunningSeriesSummaries();
});

const groupOrder: RaceGroupCode[] = ["world-marathon-majors", "utmb-world-series", "utmb-index"];

export const Route = createFileRoute("/running/race-series")({
  loader: async () => {
    const [collections, guides] = await Promise.all([
      Promise.all(
        groupOrder.map(async (code) => ({
          code,
          races: await listEvents({ data: { group: code, upcomingOnly: false, limit: 80 } }),
        })),
      ),
      loadSeriesGuides(),
    ]);
    return { collections, guides };
  },
  head: ({ loaderData }) => ({
    links: [{ rel: "canonical", href: `${SITE_URL}/running/race-series` }],
    meta: siteGraphMeta({
      title: "Running race series: road, trail & desert guides | AthRecs",
      description:
        "Compare SuperHalfs, European Marathon Classics, Marathon des Sables and other road, trail and desert series, with entry and runner-planning guides.",
      url: `${SITE_URL}/running/race-series`,
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": `${SITE_URL}/running/race-series#page`,
              url: `${SITE_URL}/running/race-series`,
              name: "Running race series and challenges",
              inLanguage: "en-GB",
              breadcrumb: { "@id": `${SITE_URL}/running/race-series#breadcrumb` },
              mainEntity: {
                "@type": "ItemList",
                itemListElement: [
                  { name: "SuperHalfs", path: SUPERHALFS_PATH },
                  ...raceGroupDefinitions.map((group) => ({
                    name: group.name,
                    path: `/running/race-series#${group.code}`,
                  })),
                  ...(loaderData?.guides ?? []).map((guide) => ({
                    name: guide.name,
                    path: runningSeriesGuidePath(guide.slug),
                  })),
                ].map((item, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: item.name,
                  url: `${SITE_URL}${item.path}`,
                })),
              },
            },
            {
              "@type": "BreadcrumbList",
              "@id": `${SITE_URL}/running/race-series#breadcrumb`,
              itemListElement: [
                { name: "AthRecs", path: "/" },
                { name: "Running", path: "/running" },
                { name: "Race series", path: "/running/race-series" },
              ].map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.name,
                item: `${SITE_URL}${item.path}`,
              })),
            },
          ],
        }).replace(/</g, "\\u003c"),
      },
    ],
  }),
  component: RaceSeriesPage,
});

function RaceSeriesPage() {
  const loaded = Route.useLoaderData();
  const racesByCode = new Map(
    loaded.collections.map((collection) => [collection.code, collection.races]),
  );

  return (
    <div className="space-y-8 pb-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <a href="/" className="hover:text-accent">
          AthRecs
        </a>
        <span aria-hidden="true">/</span>
        <a href="/running" className="hover:text-accent">
          Running
        </a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Race series</span>
      </nav>
      <RunningGuidesLink />
      <header className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="h-1.5 bg-primary" />
        <div className="space-y-4 p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Running race series
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg md:text-4xl">
            Running race series and challenges
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">
            Compare road, trail, mountain and desert races, from a first series challenge to a
            competitive season. Read the guides for entry routes, completion and ranking rules,
            practical preparation and official organiser information.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="#series-guides"
              className="inline-flex min-h-10 items-center rounded-lg border border-border bg-elevated px-3 text-sm font-medium text-fg no-underline hover:border-border-strong"
            >
              Series and challenge guides
            </a>
            <a
              href="#superhalfs"
              className="inline-flex min-h-10 items-center rounded-lg border border-border bg-elevated px-3 text-sm font-medium text-fg no-underline hover:border-border-strong"
            >
              SuperHalfs · 6
            </a>
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

      <section
        id="series-guides"
        aria-labelledby="series-guides-heading"
        className="scroll-mt-24 space-y-4"
      >
        <div className="space-y-2">
          <h2 id="series-guides-heading" className="font-display text-2xl font-semibold">
            Explore series and challenge guides
          </h2>
          <p className="max-w-3xl leading-7 text-muted">
            Find practical advice for amateur, club and competitive runners. Each guide
            distinguishes an event family, a completion challenge or a championship.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {loaded.guides.map((guide) => (
            <a
              key={guide.slug}
              href={runningSeriesGuidePath(guide.slug)}
              className="group flex flex-col rounded-xl border border-border bg-surface p-5 no-underline transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                {guide.format}
              </p>
              <h3 className="mt-2 font-display text-xl font-semibold text-fg">{guide.name}</h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-muted">{guide.shortDescription}</p>
              <span className="mt-4 inline-flex items-center gap-2 font-semibold text-accent">
                Read the runner guide <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        id="superhalfs"
        aria-labelledby="superhalfs-heading"
        className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
      >
        <div className="h-1.5 bg-accent" />
        <div className="space-y-4 p-5 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
            Half marathon series
          </p>
          <h2 id="superhalfs-heading" className="font-display text-2xl font-semibold text-fg">
            SuperHalfs: six cities, six half marathons
          </h2>
          <p className="max-w-3xl leading-7 text-muted">
            Lisbon, Prague, Berlin, Copenhagen, Cardiff and Valencia. Complete the six designated
            races in any order, with no series completion deadline, and work towards the official
            SuperMedal through your SuperPassport.
          </p>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            Our guide brings together race dates, entry options, course information, time limits,
            results links and practical guidance for amateur and elite athletes.
          </p>
          <Link
            to={SUPERHALFS_PATH}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg no-underline hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            Read the 2027 SuperHalfs race preview
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

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
                  to="/running/events"
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
