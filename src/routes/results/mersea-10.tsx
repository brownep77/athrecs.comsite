import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ArchiveResultPanels } from "@/components/races/ArchiveResultPanels";
import { Button } from "@/components/ui/button";
import { formatRaceDateShort } from "@/lib/athrecs/format";
import {
  getMerseaArchive,
  merseaSearch,
  merseaPath,
  type MerseaEdition,
  type MerseaResult,
} from "@/lib/athrecs/mersea-results";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";

const url = SITE_URL + merseaPath;
export const Route = createFileRoute("/results/mersea-10")({
  validateSearch: merseaSearch,
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  loaderDeps: ({ search }) => ({ year: search.year, q: search.q }),
  loader: async ({ deps }) => {
    const data = await getMerseaArchive({ data: deps });
    if (deps.year && !data.editions.some((edition) => edition.year === deps.year)) throw notFound();
    return data;
  },
  head: ({ match }) => {
    const year = match.search.year;
    const canonical = year ? `${url}?year=${year}` : url;
    return {
      meta: siteGraphMeta({
        title: `Mersea Island 10 Mile results${year ? ` · ${year}` : " archive"} | AthRecs`,
        description:
          "Find historical Mersea Island Lions 10 Mile road race results from West Mersea, Essex. Browse by edition or search by runner, club or race number.",
        url: canonical,
      }).map((tag) =>
        match.search.q && "name" in tag && tag.name === "robots"
          ? { name: "robots", content: "noindex, follow" }
          : tag,
      ),
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: MerseaArchive,
});

const field = "mt-1.5 h-11 w-full rounded-lg border border-border bg-bg px-3 text-base text-fg";
const detailFields: { field: keyof MerseaResult; label: string }[] = [
  { field: "sourceAward", label: "Award" },
  { field: "sourcePosition", label: "Race place on source sheet" },
  { field: "bib", label: "Race number" },
  { field: "sex", label: "Sex" },
  { field: "genderPosition", label: "Gender place" },
  { field: "age", label: "Age" },
  { field: "category", label: "Category" },
  { field: "categoryPosition", label: "Category place" },
];
function coverageLabel(edition: { coverage: MerseaEdition["coverage"]; count: number }) {
  const count = edition.count.toLocaleString("en-GB");
  if (edition.coverage === "full") return `Full results · ${count} records`;
  if (edition.coverage === "partial") return `Partial results · ${count} recorded`;
  return "Finisher list unavailable";
}

function EditionResults({ edition }: { edition: MerseaEdition & { count: number } }) {
  const rows = edition.rows;
  return (
    <section className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <header>
        <h2 className="font-display text-xl font-semibold">
          <Link to={merseaPath} search={{ year: edition.year }} className="text-fg hover:underline">
            {edition.date ? formatRaceDateShort(edition.date) : edition.year}
          </Link>
        </h2>
        <p className="mt-1 text-sm font-semibold text-accent">{coverageLabel(edition)}</p>
      </header>
      {edition.note && <p className="text-sm leading-6 text-muted">{edition.note}</p>}
      {edition.providers.length > 0 && (
        <p className="text-sm text-muted">Sources · {edition.providers.join(" · ")}</p>
      )}
      {rows.length > 0 && (
        <ArchiveResultPanels
          rows={rows}
          division={(row) => (row.sex === "M" ? "men" : row.sex === "F" ? "women" : "other")}
        >
          {(finishers, division) => (
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                {division} · Mersea 10-mile results, {edition.year}
              </caption>
              <thead className="border-y border-border bg-elevated/45 text-xs text-muted">
                <tr>
                  <th scope="col" className="px-2 py-2">
                    Race place
                  </th>
                  <th scope="col" className="px-2 py-2">
                    Runner
                  </th>
                  <th scope="col" className="px-2 py-2 text-right">
                    Finish time
                  </th>
                </tr>
              </thead>
              <tbody>
                {finishers.map((row, i) => {
                  const fields = detailFields.filter(
                    ({ field }) =>
                      row[field] != null &&
                      (field !== "sourcePosition" || row.sourcePosition !== row.position),
                  );
                  return (
                    <tr key={i} className="border-b border-border/70 align-top last:border-0">
                      <td className="px-2 py-2 font-mono tabular-nums">{row.position ?? "—"}</td>
                      <th
                        scope="row"
                        className="px-2 py-2 text-left font-normal [overflow-wrap:anywhere]"
                      >
                        <span className="font-semibold">{row.name ?? "Name not published"}</span>
                        {row.club && <span className="block text-xs text-muted">{row.club}</span>}
                        {fields.length > 0 && (
                          <details className="mt-1 text-xs text-muted">
                            <summary className="cursor-pointer text-accent">
                              Details
                              <span className="sr-only"> for {row.name ?? "unnamed runner"}</span>
                            </summary>
                            {fields.map(({ field, label }) => (
                              <p key={field}>
                                {label} · {row[field]}
                              </p>
                            ))}
                          </details>
                        )}
                      </th>
                      <td className="whitespace-nowrap px-2 py-2 text-right font-mono font-semibold tabular-nums">
                        {row.finishTime ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ArchiveResultPanels>
      )}
    </section>
  );
}

function MerseaArchive() {
  const { year, q } = Route.useSearch();
  const { editions, results } = Route.useLoaderData();
  const matches = results.reduce((total, item) => total + item.rows.length, 0);
  return (
    <article className="space-y-5">
      <Link
        to="/results"
        search={{}}
        className="inline-flex min-h-10 items-center gap-2 text-sm text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> All race results
      </Link>
      <header className="space-y-2 rounded-md border-l-8 border-[#a4eee1] bg-[#102e38] p-5 text-white sm:p-7">
        <p className="text-sm font-semibold text-[#a4eee1]">
          West Mersea, Essex · 10 miles · Road running
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          Mersea Island Lions 10 Mile results
        </h1>
        <p className="text-sm leading-6 text-white/80">
          Choose a year to see its recorded results, or search across the archive.
        </p>
      </header>
      <form
        action={merseaPath}
        method="get"
        key={`${year ?? ""}/${q ?? ""}`}
        className="grid items-end gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_2fr_auto]"
      >
        <label className="text-sm font-medium">
          Race year
          <select name="year" className={field} defaultValue={year ?? ""}>
            <option value="">All years</option>
            {editions.map((edition) => (
              <option key={edition.year} value={edition.year}>
                {edition.year}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Runner, club or race number
          <input
            type="search"
            name="q"
            maxLength={120}
            defaultValue={q ?? ""}
            placeholder="Search the results"
            className={field}
          />
        </label>
        <Button type="submit" className="h-11">
          Show results
        </Button>
      </form>
      {year || q ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span role="status">
              {q
                ? `${matches} matching record${matches === 1 ? "" : "s"} for “${q}”`
                : `${year} edition`}
            </span>
            <Link to={merseaPath} search={{}} className="text-accent underline">
              Browse all editions
            </Link>
          </div>
          {results.map((edition) => (
            <EditionResults key={edition.year} edition={edition} />
          ))}
        </>
      ) : (
        <section aria-label="Race editions">
          <h2 className="mb-3 font-display text-xl font-semibold">Results by year</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {editions.map((edition) => (
              <li key={edition.year}>
                <Link
                  to={merseaPath}
                  search={{ year: edition.year }}
                  className="block rounded-lg border border-border bg-surface p-4 no-underline hover:border-accent"
                >
                  <span className="font-semibold text-fg">
                    {edition.date ? formatRaceDateShort(edition.date) : edition.year}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{coverageLabel(edition)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
