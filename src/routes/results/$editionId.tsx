import { isParkrunResult, PARKRUN_TIMING_EXPLANATION } from "@/lib/athrecs/parkrun-timing";
import { ClaimProfilePrompt } from "@/components/athletes/ClaimProfilePrompt";
import { SportBadge, DistanceBadge } from "@/components/races/EventBadges";
import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RaceResultsBoard } from "@/components/races/RaceResultsBoard";
import { getPublicRaceResults } from "@/lib/athrecs/public-results-api";
import { normalizeResultsSearch, parseResultsEditionId } from "@/lib/athrecs/public-results-search";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import { publicResultsHead } from "@/lib/athrecs/public-results-seo";
import { resultEditionLabel, resultSlug } from "@/lib/athrecs/result-slug";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/results/$editionId")({
  validateSearch: (raw: Record<string, unknown>): { q?: string; page?: number } => {
    const search = normalizeResultsSearch(raw);
    return { q: search.q || undefined, page: search.page > 1 ? search.page : undefined };
  },
  beforeLoad: ({ params }) => {
    if (IS_RUNRECS_SITE) throw notFound();
    try { parseResultsEditionId(params.editionId); } catch { throw notFound(); }
  },
  loaderDeps: ({ search }) => normalizeResultsSearch(search),
  loader: async ({ params, deps }) => {
    const data = await getPublicRaceResults({ data: { editionId: params.editionId, q: deps.q, page: deps.page } });
    if (!data || (!deps.q && deps.page > 1 && !data.results.length)) throw notFound();
    const canonicalSlug = resultSlug(data.edition);
    if (params.editionId !== canonicalSlug) throw redirect({ to: "/results/$editionId", params: { editionId: canonicalSlug }, search: { q: deps.q || undefined, page: deps.page > 1 ? deps.page : undefined }, statusCode: 301 });
    return data;
  },
  staleTime: 60_000,
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    return publicResultsHead(loaderData.edition, loaderData.results, normalizeResultsSearch(match.search));
  },
  pendingComponent: () => <p role="status" className="py-12 text-center text-muted">Loading race results…</p>,
  notFoundComponent: () => (
    <div className="space-y-3 py-12 text-center">
      <h1 className="font-display text-2xl">Race results not available</h1>
      <p className="text-sm text-muted">This edition does not have public results available here.</p>
      <a href="/results" className="text-accent underline">Browse results</a>
    </div>
  ),
  errorComponent: () => (
    <div className="space-y-3 py-12 text-center">
      <h1 className="font-display text-2xl">Race results are temporarily unavailable</h1>
      <a href="/results" className="text-accent underline">Return to results</a>
    </div>
  ),
  component: RaceResultsPage,
});

function RaceResultsPage() {
  const { edition, results, hasMore, timingCredit, providerCredits } = Route.useLoaderData();
  const parkrun = isParkrunResult({ sport: edition.sport, eventName: edition.event_name });
  const search = normalizeResultsSearch(Route.useSearch());
  const params = { editionId: resultSlug(edition) };
  return (
    <div className="space-y-5">
      <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-accent no-underline hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />All results</Link>
      <header className="overflow-hidden rounded-md border border-border bg-surface">
        <div className="space-y-2 border-t-4 border-[#1daaa5] bg-[#102e38] px-4 py-5 sm:px-6 sm:py-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#a4eee1]">AthRecs results archive</p>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">{resultEditionLabel(edition)}</h1>
          <p className="text-sm text-[#d4e4e3]">
            <time dateTime={edition.event_date}>{formatRaceDateShort(edition.event_date)}</time>
            {edition.city && ` · ${edition.city}`}{edition.country && ` · ${edition.country}`}
          </p>
        </div>
        <div className="space-y-2 px-4 py-4 text-sm text-muted sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <SportBadge sport={edition.sport} /><DistanceBadge distance={edition.distance_code} />
            <span className="font-medium text-fg">{edition.result_count.toLocaleString("en-GB")} {edition.result_count === 1 ? "performance" : "performances"} in the archive</span>
          </div>
          <p>This archive may cover only part of the field. Placings and nationalities are shown as recorded for the race.</p>
          {parkrun && <p>{PARKRUN_TIMING_EXPLANATION}</p>}
          {timingCredit ? <p>Timing by {timingCredit}</p> : providerCredits.length > 0 && <p>Results credited to {providerCredits.join(", ")}</p>}
          {edition.event_slug && (
            <Link to="/races/$slug" params={{ slug: edition.event_slug }} className="inline-block text-accent underline">
              {edition.event_name} race details and past editions
            </Link>
          )}
        </div>
      </header>

      <ClaimProfilePrompt context="results" />

      <form action={`/results/${resultSlug(edition)}`} method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="min-w-0 flex-1 basis-64 space-y-1.5 text-xs font-medium text-muted">Athlete, bib, club or category
          <input name="q" defaultValue={search.q} maxLength={120} placeholder="Search these results" className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40" />
        </label>
        <Button type="submit" className="h-11">Search</Button>
        {search.q ? <a href={`/results/${resultSlug(edition)}`} className="py-3 text-sm text-accent underline">Clear</a> : null}
      </form>

      <RaceResultsBoard results={results} parkrun={parkrun} editionName={edition.event_name} />
      <nav aria-label="Race result pages" className="flex items-center justify-between gap-3">
        {search.page > 1 ? <Button asChild variant="secondary"><Link to="/results/$editionId" params={params} search={{ q: search.q || undefined, page: search.page > 2 ? search.page - 1 : undefined }}>Previous</Link></Button> : <span />}
        <span className="text-xs text-muted">Page {search.page}</span>
        {hasMore && search.page < 1000 ? <Button asChild variant="secondary"><Link to="/results/$editionId" params={params} search={{ q: search.q || undefined, page: search.page + 1 }}>Next</Link></Button> : <span />}
      </nav>
      {search.page > 1 && !search.q ? <Link to="/results/$editionId" params={params} search={{}} className="inline-block text-sm text-accent underline">First page of results</Link> : null}
    </div>
  );
}
