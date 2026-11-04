import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BURE_WINNERS } from "@/data/bure-valley-2026-winners";
import { ArchiveResultPanels } from "@/components/races/ArchiveResultPanels";
import { getPublicEditorialAthleteLinks } from "@/lib/athrecs/editorial-athletes-api";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";

const path = "/results/bure-valley-10-2026";
export const Route = createFileRoute("/results/bure-valley-10-2026")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loader: () => getPublicEditorialAthleteLinks({ data: { slug: "bure-valley-10-2026" } }),
  head: () => ({
    meta: siteGraphMeta({
      title: "Bure Valley 10 2026 results — winners & age categories | AthRecs",
      description:
        "Find the published Bure Valley 10 winners, age-category awards and winning times from Banningham on 27 September 2026.",
      url: `${SITE_URL}${path}`,
    }),
    links: [{ rel: "canonical", href: `${SITE_URL}${path}` }],
  }),
  component: BureResultsPage,
});

function BureResultsPage() {
  const links = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-6xl space-y-6">
      <a href="/results" className="inline-flex min-h-11 items-center text-accent">
        ← All race results
      </a>
      <header className="space-y-3 rounded-md border-l-8 border-[#a4eee1] bg-[#102e38] p-5 text-white sm:p-8">
        <p className="text-sm font-semibold text-[#a4eee1]">
          27 September 2026 · Banningham, Norfolk · 10 miles
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Bure Valley 10 results</h1>
        <p className="text-lg">Published winners and category awards</p>
        <p className="text-sm leading-6 text-white/80">
          This summary covers {BURE_WINNERS.length} published awards. Select a linked runner to open
          their AthRecs profile.
        </p>
      </header>
      <p className="text-sm leading-6 text-muted">
        Category awards exclude the top three overall. Winning times retain the timing provider’s
        published precision.
      </p>
      <section aria-label="Published category awards" className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">Category winners</h2>
        <ArchiveResultPanels
          rows={BURE_WINNERS}
          division={(row) => (row.category.startsWith("Male") ? "men" : "women")}
        >
          {(winners, division) => (
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                {division} · Bure Valley 10 winners, 27 September 2026
              </caption>
              <thead className="border-y border-border bg-elevated/45 text-xs font-semibold text-muted">
                <tr>
                  <th scope="col" className="px-2 py-2">
                    Award
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Runner
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    Winning time
                  </th>
                </tr>
              </thead>
              <tbody>
                {winners.map((row) => (
                  <tr
                    key={row.category}
                    className="border-b border-border/70 align-top last:border-0"
                  >
                    <td className="px-2 py-2">{row.category}</td>
                    <th
                      scope="row"
                      className="px-2 py-2 text-left font-semibold [overflow-wrap:anywhere]"
                    >
                      {links[row.name] ? (
                        <Link
                          to="/athletes/$slug"
                          params={{ slug: links[row.name] }}
                          className="text-fg hover:text-accent hover:underline"
                        >
                          {row.name}
                        </Link>
                      ) : (
                        row.name
                      )}
                    </th>
                    <td className="whitespace-nowrap px-2 py-2 text-right font-mono font-semibold tabular-nums">
                      {row.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ArchiveResultPanels>
        <p className="text-sm text-muted">
          Timing · Sublime Timing / Webscorer. Organiser · Bure Valley Harriers. Checked 30
          September 2026.
        </p>
      </section>
      <nav
        aria-label="Race information"
        className="flex flex-wrap gap-5 text-accent underline underline-offset-2"
      >
        <a href="/race-reports/bure-valley-10-2026">Read the race report</a>
      </nav>
    </article>
  );
}
