import { createFileRoute, notFound } from "@tanstack/react-router";
import { listUnlinkedResults } from "@/lib/athrecs/unlinked-results-api";
import { normalizeResultsSearch } from "@/lib/athrecs/public-results-search";
import { formatDuration, formatRaceDateShort } from "@/lib/athrecs/format";
import { resultCredit } from "@/lib/athrecs/result-credit";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SITE_URL } from "@/lib/athrecs/seo";

export const Route = createFileRoute("/results/unlinked")({
  validateSearch: (raw: Record<string, unknown>) => {
    const { q, year, page } = normalizeResultsSearch(raw);
    return { q: q || undefined, year: year || undefined, page: page > 1 ? page : undefined };
  },
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loaderDeps: ({ search }) => normalizeResultsSearch(search),
  loader: ({ deps }) => listUnlinkedResults({ data: deps }),
  staleTime: 60_000,
  head: () => ({
    meta: [
      { title: "Results awaiting a profile match | ATHRECS.com" },
      { name: "robots", content: "noindex, follow" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/results/unlinked` }],
  }),
  pendingComponent: () => (
    <p role="status" className="py-12 text-center">
      Loading results…
    </p>
  ),
  errorComponent: () => (
    <p className="py-12">
      Results are temporarily unavailable.{" "}
      <a href="/results/unlinked" className="underline">
        Try again
      </a>
      .
    </p>
  ),
  component: UnlinkedResultsPage,
});

function UnlinkedResultsPage() {
  const { results, hasMore } = Route.useLoaderData();
  const search = normalizeResultsSearch(Route.useSearch());
  const pageUrl = (page: number) =>
    `/results/unlinked?${new URLSearchParams({ q: search.q, year: search.year, page: String(page) })}`;
  return (
    <div className="space-y-6">
      <a href="/results" className="text-accent underline">
        All results
      </a>
      <header className="max-w-3xl space-y-2">
        <h1 className="font-display text-3xl font-semibold">Results awaiting a profile match</h1>
        <p className="text-muted">
          These results contain an incomplete or damaged name. The original result is retained while
          we check the name and the right athlete profile. No profile match is confirmed.
        </p>
      </header>
      <form
        method="get"
        action="/results/unlinked"
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-surface p-4"
      >
        <label className="flex flex-1 flex-col gap-1">
          Name or race
          <input
            name="q"
            defaultValue={search.q}
            maxLength={120}
            className="h-11 rounded border border-border bg-bg px-3"
          />
        </label>
        <label className="flex flex-col gap-1">
          Year
          <input
            name="year"
            defaultValue={search.year}
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            className="h-11 w-28 rounded border border-border bg-bg px-3"
          />
        </label>
        <button className="h-11 rounded bg-accent px-5 font-semibold text-white">Search</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <caption className="p-3 text-left text-muted">
            Names are shown as recorded. Question marks are unresolved characters. A listed
            performance does not confirm athlete identity.
          </caption>
          <thead className="bg-surface">
            <tr>
              {[
                "Recorded name",
                "Race",
                "Date / year",
                "Distance",
                "Performance",
                "Results provider",
              ].map((h) => (
                <th key={h} scope="col" className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((row) => {
              const credit = resultCredit(row.source_url, row.provider);
              return (
                <tr key={row.key} className="border-t border-border">
                  <td className="p-3 font-medium">
                    {row.source_name}
                    <span className="block text-xs font-normal text-muted">Name under review</span>
                  </td>
                  <td className="p-3">{row.meeting}</td>
                  <td className="whitespace-nowrap p-3">
                    {row.date
                      ? formatRaceDateShort(row.date)
                      : `${row.year || "Unknown"} · date not supplied`}
                  </td>
                  <td className="p-3">{row.discipline}</td>
                  <td className="whitespace-nowrap p-3">
                    {row.performance ||
                      (row.finish_time_seconds !== null
                        ? formatDuration(row.finish_time_seconds)
                        : "—")}
                    {row.status && !["finished", "fin"].includes(row.status.toLowerCase()) ? <span className="block text-xs text-muted">{row.status}</span> : null}
                    {row.verification_status === "unverified" ? <span className="block text-xs text-muted">Unverified result</span> : null}
                  </td>
                  <td className="p-3">
                    {credit ? (
                      <a
                        href={credit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline"
                      >
                        {credit.name}
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!results.length && <p className="p-6">No results match these filters.</p>}
      </div>
      <nav aria-label="Result pages" className="flex justify-between gap-4">
        {search.page > 1 ? (
          <a href={pageUrl(search.page - 1)} className="text-accent underline">
            Previous page
          </a>
        ) : (
          <span />
        )}
        {hasMore && (
          <a href={pageUrl(search.page + 1)} className="text-accent underline">
            Next page
          </a>
        )}
      </nav>
    </div>
  );
}
