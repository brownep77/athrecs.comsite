import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Search, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPublicResultEditions } from "@/lib/athrecs/public-results-api";
import { normalizeResultsSearch } from "@/lib/athrecs/public-results-search";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/results/")({
  validateSearch: (raw: Record<string, unknown>): { q?: string; sport?: string; year?: string; distance?: string; page?: number } => {
    const search = normalizeResultsSearch(raw);
    return {
      q: search.q || undefined,
      sport: search.sport || undefined,
      year: search.year || undefined,
      distance: search.distance || undefined,
      page: search.page > 1 ? search.page : undefined,
    };
  },
  beforeLoad: () => { if (IS_RUNRECS_SITE) throw notFound(); },
  loaderDeps: ({ search }) => normalizeResultsSearch(search),
  loader: ({ deps }) => listPublicResultEditions({ data: deps }),
  staleTime: 60_000,
  head: ({ match }) => ({
    meta: [
      ...siteGraphMeta({
        title: "Race results | ATHRECS.com",
        description: "Explore race results on AthRecs. Find a race, view performances and connect results to your athlete profile.",
        url: `${SITE_URL}/results`,
      }),
      ...(Object.values(match.search).some(Boolean)
        ? [{ name: "robots", content: "noindex, follow" }]
        : []),
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/results` }],
  }),
  pendingComponent: () => <p role="status" className="py-12 text-center text-muted">Loading results…</p>,
  errorComponent: () => (
    <div className="space-y-3 py-12 text-center">
      <h1 className="font-display text-2xl">Results are temporarily unavailable</h1>
      <a href="/results" className="text-accent underline">Try again</a>
    </div>
  ),
  component: ResultsPage,
});

const fieldClass = "h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40";

function ResultsPage() {
  const data = Route.useLoaderData();
  const search = normalizeResultsSearch(Route.useSearch());
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">ATHRECS</p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Results</h1>
          <p className="text-sm leading-6 text-muted">Find a race, explore performances and add your results to your athlete profile.</p>
        </div>
        <Button asChild variant="secondary">
          <Link to="/athlete-account"><Search className="size-4" aria-hidden="true" />Find my results</Link>
        </Button>
      </header>

      <form action="/results" method="get" className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_0.7fr_1fr_auto]">
          <label className="space-y-1.5 text-xs font-medium text-muted">Race or location
            <input className={fieldClass} name="q" defaultValue={search.q} maxLength={120} placeholder="Search race, town or country" />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted">Sport
            <input className={fieldClass} name="sport" defaultValue={search.sport} maxLength={60} list="result-sports" placeholder="All sports" />
            <datalist id="result-sports">{["Running", "Parkrun", "Athletics", "Triathlon", "Cycling", "Swimming", "Gymnastics"].map((sport) => <option key={sport} value={sport} />)}</datalist>
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted">Year
            <input className={fieldClass} name="year" defaultValue={search.year} inputMode="numeric" pattern="[0-9]{4}" maxLength={4} placeholder="All years" />
          </label>
          <label className="space-y-1.5 text-xs font-medium text-muted">Distance
            <input className={fieldClass} name="distance" defaultValue={search.distance} maxLength={40} list="result-distances" placeholder="All distances" />
            <datalist id="result-distances">{["5K", "10K", "5M", "10M", "Half", "Marathon", "Ultra"].map((distance) => <option key={distance} value={distance} />)}</datalist>
          </label>
          <Button type="submit" className="h-11 self-end">Search</Button>
        </div>
        {search.q || search.sport || search.year || search.distance ? <a href="/results" className="mt-3 inline-block text-xs text-accent underline">Clear filters</a> : null}
      </form>

      <section aria-label="Race results" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Race results archive</h2>
          <span className="text-xs text-muted">Newest first</span>
        </div>
        {data.editions.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {data.editions.map((edition) => (
              <Link key={edition.edition_id} to="/results/$editionId" params={{ editionId: String(edition.edition_id) }}
                className="group flex min-w-0 items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4 no-underline shadow-card transition-colors hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap gap-2"><Badge variant="outline">{edition.sport}</Badge><Badge variant="outline">{edition.distance_code}</Badge></div>
                  <h3 className="font-semibold leading-snug text-fg group-hover:text-accent">{edition.event_name}</h3>
                  <p className="text-sm text-muted">{formatRaceDateShort(edition.event_date)}</p>
                  <p className="text-xs text-muted">{[edition.city, edition.country].filter(Boolean).join(", ")}</p>
                  <p className="flex items-center gap-1.5 text-xs font-medium text-accent"><Trophy className="size-3.5" aria-hidden="true" />{edition.result_count.toLocaleString("en-GB")} results recorded</p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <h3 className="font-semibold">No recorded race results match this search</h3>
            <p className="mt-2 text-sm text-muted">Try a different race or year, or use Find my results for your personal matches.</p>
          </div>
        )}
      </section>
      <nav aria-label="Results archive pages" className="flex items-center justify-between gap-3">
        {search.page > 1 ? <Button asChild variant="secondary"><Link to="/results" search={{ ...search, page: search.page - 1 }}>Previous</Link></Button> : <span />}
        <span className="text-xs text-muted">Page {search.page}</span>
        {data.hasMore && search.page < 1000 ? <Button asChild variant="secondary"><Link to="/results" search={{ ...search, page: search.page + 1 }}>Next</Link></Button> : <span />}
      </nav>
    </div>
  );
}
