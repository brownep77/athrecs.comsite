import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  BURE_ORGANISER_URL,
  BURE_PROFILE_SLUGS,
  BURE_RESULTS_URL,
  BURE_WINNERS,
} from "@/data/bure-valley-2026";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

const path = "/results/bure-valley-10-2026";
export const Route = createFileRoute("/results/bure-valley-10-2026")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  head: () => ({
    meta: siteGraphMeta({
      title: "Bure Valley 10 2026 results — winners & age categories | AthRecs",
      description:
        "Bure Valley 10, 27 September 2026: published winners and category awards, race report and official full results link.",
      url: `${SITE_URL}${path}`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}${path}` }],
  }),
  component: BureResultsPage,
});

function BureResultsPage() {
  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <a href="/results" className="inline-flex min-h-11 items-center text-accent">
        ← All race results
      </a>
      <header className="space-y-3 rounded-xl border border-accent/30 bg-accent-soft p-5 sm:p-8">
        <p className="text-sm font-semibold text-accent">
          27 September 2026 · Banningham, Norfolk · 10 miles
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Bure Valley 10 results</h1>
        <p className="text-lg">Published winners and category awards</p>
        <p className="text-sm leading-6 text-muted">
          This is a winners summary, not the complete finishing list. Linked names open their
          AthRecs profiles. The full results are available through the official link below.
        </p>
        <a
          href={BURE_RESULTS_URL}
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 font-semibold text-primary-fg"
        >
          View official full results
        </a>
      </header>
      <p className="text-sm leading-6 text-muted">
        The provider excludes the top three overall from category awards. “Winning time” is
        reproduced as published, with decimal precision; it is not relabelled as chip or gun time.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <caption className="p-4 text-left font-semibold">
            Winners summary · checked 30 September 2026
          </caption>
          <thead className="bg-elevated">
            <tr>
              <th scope="col" className="p-3">
                Award
              </th>
              <th scope="col" className="p-3">
                Runner
              </th>
              <th scope="col" className="p-3 text-right">
                Winning time
              </th>
            </tr>
          </thead>
          <tbody>
            {BURE_WINNERS.map((row) => (
              <tr key={row.category} className="border-t border-border">
                <td className="p-3">{row.category}</td>
                <td className="p-3 font-medium">
                  {BURE_PROFILE_SLUGS[row.name] ? (
                    <Link
                      to="/athletes/$slug"
                      params={{ slug: BURE_PROFILE_SLUGS[row.name] }}
                      className="text-accent underline underline-offset-2"
                    >
                      {row.name}
                    </Link>
                  ) : (
                    row.name
                  )}
                </td>
                <td className="whitespace-nowrap p-3 text-right tabular-nums">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav
        aria-label="Race information"
        className="flex flex-wrap gap-5 text-accent underline underline-offset-2"
      >
        <a href="/race-reports/bure-valley-10-2026">Read the race report</a>
        <a href={BURE_ORGANISER_URL}>Bure Valley Harriers</a>
        <a href={BURE_RESULTS_URL}>Sublime Timing / Webscorer</a>
      </nav>
    </article>
  );
}
