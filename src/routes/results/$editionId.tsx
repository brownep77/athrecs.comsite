import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, SearchCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublicRaceResults } from "@/lib/athrecs/public-results-api";
import { normalizeResultsSearch, parseResultsEditionId } from "@/lib/athrecs/public-results-search";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

export const Route = createFileRoute("/results/$editionId")({
  validateSearch: (raw: Record<string, unknown>) => {
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
    if (!data) throw notFound();
    return data;
  },
  staleTime: 60_000,
  head: ({ loaderData, match }) => {
    if (!loaderData) return {};
    const edition = loaderData.edition;
    const url = `${SITE_URL}/results/${edition.edition_id}`;
    return {
      meta: [
        ...siteGraphMeta({
          title: `${edition.event_name} ${edition.event_date.slice(0, 4)} results | ATHRECS.com`,
          description: `Recorded results for ${edition.event_name}, ${edition.distance_code}, ${formatRaceDateShort(edition.event_date)}. Explore performances and athlete profiles on AthRecs.`,
          url,
        }),
        ...(match.search.q || match.search.page ? [{ name: "robots", content: "noindex, follow" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
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
  const { edition, results, hasMore } = Route.useLoaderData();
  const search = normalizeResultsSearch(Route.useSearch());
  const params = { editionId: String(edition.edition_id) };
  return (
    <div className="space-y-5">
      <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-accent no-underline hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />All results</Link>
      <header className="space-y-3">
        <div className="flex flex-wrap gap-2"><Badge variant="outline">{edition.sport}</Badge><Badge variant="outline">{edition.distance_code}</Badge></div>
        <h1 className="font-display text-3xl font-semibold leading-tight">{edition.event_name}</h1>
        <p className="text-sm text-muted">{formatRaceDateShort(edition.event_date)}{edition.city ? ` · ${edition.city}` : ""}{edition.country ? ` · ${edition.country}` : ""}</p>
        <p className="text-sm font-medium text-accent">{edition.result_count.toLocaleString("en-GB")} results recorded on AthRecs</p>
      </header>

      <form action={`/results/${edition.edition_id}`} method="get" className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4">
        <label className="min-w-0 flex-1 basis-64 space-y-1.5 text-xs font-medium text-muted">Athlete, profile club or category
          <input name="q" defaultValue={search.q} maxLength={120} placeholder="Search these results" className="h-11 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40" />
        </label>
        <Button type="submit" className="h-11">Search</Button>
        {search.q ? <a href={`/results/${edition.edition_id}`} className="py-3 text-sm text-accent underline">Clear</a> : null}
      </form>

      <section aria-label="Recorded race results" className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
        <div className="overflow-x-auto" role="region" aria-label="Race results table; scroll horizontally on small screens" tabIndex={0}>
          <table className="w-full min-w-[58rem] text-left text-sm">
            <caption className="sr-only">Recorded results for {edition.event_name}. Placings are as recorded, not recalculated for this list.</caption>
            <thead className="border-b border-border bg-accent-soft/40 text-[11px] uppercase tracking-wide text-muted">
              <tr>{["Pos", "Athlete", "Profile club", "Category", "Time", "Chip", "Gun", ""].map((label, index) => <th key={index} scope="col" className="px-3 py-3">{label || <span className="sr-only">Claim result</span>}</th>)}</tr>
            </thead>
            <tbody>
              {results.map((result) => {
                const finished = ["finished", "fin"].includes(result.status.trim().toLowerCase()) && !result.disqualified;
                return (
                  <tr key={result.id} className="border-b border-border/70 last:border-0 hover:bg-elevated/40">
                    <td className="px-3 py-4 align-top font-semibold tabular-nums">{result.disqualified ? "—" : result.overall_place ?? "—"}</td>
                    <td className="px-3 py-4 align-top">
                      <Link to="/athletes/$slug" params={{ slug: result.athlete_slug }} className="font-semibold text-fg no-underline hover:text-accent">{result.athlete_name}</Link>
                      {!finished ? <p className="mt-1 text-xs text-muted">{result.disqualified ? "Disqualified" : result.status}</p> : null}
                      {finished && result.gender_place !== null ? <p className="mt-1 text-xs text-muted">Gender position {result.gender_place}</p> : null}
                    </td>
                    <td className="max-w-44 px-3 py-4 align-top text-muted">{result.profile_club || "—"}</td>
                    <td className="px-3 py-4 align-top text-muted">{result.category || "—"}{finished && result.category_place !== null ? <p className="mt-1 text-xs">Position {result.category_place}</p> : null}</td>
                    <td className="whitespace-nowrap px-3 py-4 align-top font-semibold tabular-nums">{finished ? formatDuration(result.finish_time_seconds) : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-4 align-top tabular-nums text-muted">{finished ? formatDuration(result.chip_time_seconds) : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-4 align-top tabular-nums text-muted">{finished ? formatDuration(result.gun_time_seconds) : "—"}</td>
                    <td className="px-3 py-4 align-top"><Link to="/claim-results" search={{ resultId: result.id }} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-accent no-underline hover:bg-accent-soft"><SearchCheck className="size-4 shrink-0" aria-hidden="true" />Claim this result</Link></td>
                  </tr>
                );
              })}
              {!results.length ? <tr><td colSpan={8} className="p-8 text-center text-muted">No recorded results match this search.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
      <nav aria-label="Race result pages" className="flex items-center justify-between gap-3">
        {search.page > 1 ? <Button asChild variant="secondary"><Link to="/results/$editionId" params={params} search={{ q: search.q || undefined, page: search.page - 1 }}>Previous</Link></Button> : <span />}
        <span className="text-xs text-muted">Page {search.page}</span>
        {hasMore && search.page < 1000 ? <Button asChild variant="secondary"><Link to="/results/$editionId" params={params} search={{ q: search.q || undefined, page: search.page + 1 }}>Next</Link></Button> : <span />}
      </nav>
    </div>
  );
}
