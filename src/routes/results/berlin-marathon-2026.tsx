import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Download, Copy, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IS_RUNRECS_SITE } from "@/lib/site-scope";
import { siteGraphMeta } from "@/lib/athrecs/seo";
import snapshot from "@/data/berlin-marathon-2026.json";
import {
  BERLIN_PATH,
  BERLIN_URL,
  BERLIN_OFFICIAL,
  berlinSnapshotSchema,
  berlinSearch,
  berlinSelection,
  berlinPlace,
  berlinTitle,
  berlinShareUrl,
  berlinCaption,
  type BerlinResult,
  type BerlinView,
} from "@/lib/athrecs/berlin-results";

const data = berlinSnapshotSchema.parse(snapshot);
const description =
  "Berlin Marathon 2026 results hub: men, women and age categories, with official results links and AthRecs cards to share on Instagram and X.";
export const Route = createFileRoute("/results/berlin-marathon-2026")({
  beforeLoad: () => {
    if (IS_RUNRECS_SITE) throw notFound();
  },
  validateSearch: berlinSearch,
  head: () => ({
    meta: siteGraphMeta({
      title: "Berlin Marathon 2026 results — men, women & age groups | AthRecs",
      description,
      url: BERLIN_URL,
      image: "https://www.athrecs.com/berlin-marathon-2026-x.png",
    }),
    links: [{ rel: "canonical", href: BERLIN_URL }],
  }),
  component: BerlinResultsPage,
});
const field =
  "h-11 w-full rounded-lg border border-border bg-bg px-3 text-base text-fg focus:outline-none focus:ring-2 focus:ring-accent";
const views: { value: BerlinView; label: string }[] = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "age", label: "Age categories" },
  { value: "all", label: "Find a runner" },
];

function BerlinResultsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const rows = berlinSelection(data, search);
  const categories = [
    ...new Set(
      data.results.flatMap((row) =>
        row.category && row.gender === search.ageGender ? [row.category] : [],
      ),
    ),
  ].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const pageSize = search.view === "all" || search.q ? 50 : 10;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const page = Math.min(search.page, pageCount);
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const caption = berlinCaption(data, search);
  const rankLabel =
    search.view === "age" ? "Category pos" : search.view === "all" ? "Overall pos" : "Gender pos";
  async function download(format: "instagram" | "x", runner?: BerlinResult) {
    setBusy(true);
    setMessage("");
    try {
      const { berlinCard, downloadBerlinCard } = await import("@/lib/athrecs/berlin-social");
      const blob = await berlinCard(
        data,
        search,
        runner ? [runner] : rows.slice(0, 10),
        format,
        Boolean(runner),
      );
      const suffix = (
        runner?.bib ??
        `${search.view}-${search.view === "age" ? search.ageGender : ""}-${search.category}`
      ).replace(/[^a-z0-9-]/gi, "-");
      downloadBerlinCard(blob, `athrecs-berlin-2026-${suffix}-${format}.png`);
      setMessage(
        `${format === "instagram" ? "Instagram" : "X"} image downloaded. Attach it to your post.`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Download failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMessage(`${label} copied.`);
    } catch {
      setMessage("Copy is unavailable in this browser. Select and copy the caption below.");
    }
  }
  return (
    <div className="space-y-6">
      <Link
        to="/results"
        search={{}}
        className="inline-flex min-h-10 items-center gap-2 text-sm text-accent"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All race results
      </Link>
      <header className="overflow-hidden rounded-2xl border border-teal-800 bg-[#082d32] text-white">
        <div className="border-l-8 border-[#10c1b2] p-5 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#75e6da]">
            27 September 2026 · Germany · 42.195 km
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Berlin Marathon</h1>
          <p className="mt-2 text-xl text-teal-100">Men, women & age-category results</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-md border border-white/20 px-3 py-2 text-sm font-medium">
              <Clock3 className="size-4" aria-hidden="true" />
              {data.status === "awaiting"
                ? "Awaiting verified results"
                : data.status === "official"
                  ? "Official results"
                  : "Provisional results"}
            </span>
            <span className="text-sm text-teal-100">
              {data.results.length.toLocaleString("en-GB")} results published on AthRecs
            </span>
          </div>
          <a
            href={BERLIN_OFFICIAL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#47ded0] px-4 py-2 font-semibold text-[#082d32] no-underline hover:bg-white"
          >
            Open official results & tracking
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </header>

      <section
        aria-label="Berlin results"
        className="overflow-hidden rounded-xl border border-border bg-surface"
      >
        <nav
          aria-label="Result views"
          className="grid grid-cols-2 gap-1 border-b border-border bg-elevated/40 p-2 sm:grid-cols-4"
        >
          {views.map((view) => (
            <Link
              key={view.value}
              to={BERLIN_PATH}
              search={{ view: view.value, ageGender: "men", category: "", q: "", page: 1 }}
              aria-current={search.view === view.value ? "page" : undefined}
              className={`flex min-h-12 items-center justify-center rounded-lg px-3 text-center text-sm font-semibold no-underline ${search.view === view.value ? "bg-primary text-primary-fg" : "text-fg hover:bg-elevated"}`}
            >
              {view.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="text-2xl font-bold">{berlinTitle(search)}</h2>
            <p className="text-sm text-muted">
              {data.updatedAt
                ? `Updated ${new Date(data.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })} UK`
                : "Results will be added after verification"}
            </p>
          </div>
          {search.view === "age" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block max-w-md space-y-2 text-sm font-medium">
                Category classification
                <select
                  className={field}
                  value={search.ageGender}
                  onChange={(event) =>
                    void navigate({
                      search: {
                        ...search,
                        ageGender: event.target.value as typeof search.ageGender,
                        category: "",
                        page: 1,
                      },
                    })
                  }
                >
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  {data.results.some((row) => row.gender === "other") && (
                    <option value="other">Other classifications</option>
                  )}
                </select>
              </label>
              <label className="block max-w-md space-y-2 text-sm font-medium">
                Official age category
                <select
                  className={field}
                  value={search.category}
                  onChange={(event) =>
                    void navigate({ search: { ...search, category: event.target.value, page: 1 } })
                  }
                >
                  <option value="">
                    {categories.length
                      ? "Choose an age category"
                      : "Awaiting official age categories"}
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
          {search.view === "all" && (
            <form action={BERLIN_PATH} method="get" className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="view" value="all" />
              <label className="min-w-0 flex-1 space-y-2 text-sm font-medium">
                Runner, bib number or club
                <input
                  key={search.q}
                  name="q"
                  defaultValue={search.q}
                  maxLength={120}
                  placeholder="Search published results"
                  className={field}
                />
              </label>
              <Button type="submit" className="h-11">
                Search
              </Button>
            </form>
          )}
          {rows.length ? (
            <>
              <p className="text-sm text-muted">
                {data.coverage === "complete"
                  ? "Complete published field."
                  : `${data.coverage === "highlights" ? "Selected highlights" : "Partial results"} — this is not the full field.`}{" "}
                Placings are the organiser’s published positions.
              </p>
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label="Berlin results table, scroll horizontally on small screens"
              >
                <table className="w-full min-w-[720px] text-left text-sm">
                  <caption className="sr-only">
                    {berlinTitle(search)}. Gun and chip times are shown separately.
                  </caption>
                  <thead className="bg-accent-soft text-accent">
                    <tr>
                      {[rankLabel, "Athlete / club", "Category", "Gun", "Chip", "Share"].map(
                        (label) => (
                          <th key={label} scope="col" className="px-3 py-3">
                            {label}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="px-3 py-4 font-bold tabular-nums">
                          {berlinPlace(row, search.view) ?? "—"}
                        </td>
                        <td className="max-w-64 px-3 py-4">
                          <p className="font-semibold">{row.name}</p>
                          <p className="mt-1 text-muted">
                            {[row.country, row.club].filter(Boolean).join(" · ")}
                          </p>
                          <p className="mt-1 text-xs text-muted">Bib {row.bib}</p>
                        </td>
                        <td className="px-3 py-4">
                          {row.category ?? "—"}
                          <p className="text-xs text-muted">
                            {row.categoryPlace ? `Position ${row.categoryPlace}` : ""}
                          </p>
                        </td>
                        <td className="px-3 py-4 tabular-nums">{row.gunTime ?? "—"}</td>
                        <td className="px-3 py-4 tabular-nums">{row.chipTime ?? "—"}</td>
                        <td className="px-3 py-4">
                          <button
                            disabled={busy}
                            onClick={() => void download("instagram", row)}
                            className="min-h-11 font-semibold text-accent underline disabled:opacity-50"
                            aria-label={`Download ${row.name}'s Instagram result card`}
                          >
                            Instagram
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => void download("x", row)}
                            className="block min-h-11 font-semibold text-accent underline disabled:opacity-50"
                            aria-label={`Download ${row.name}'s X result card`}
                          >
                            X card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {pageCount > 1 && (
                <nav aria-label="Result pages" className="flex items-center justify-between gap-2">
                  <Button
                    variant="secondary"
                    disabled={page <= 1}
                    onClick={() => void navigate({ search: { ...search, page: page - 1 } })}
                  >
                    Previous
                  </Button>
                  <p className="text-sm">
                    Page {page} of {pageCount}
                  </p>
                  <Button
                    variant="secondary"
                    disabled={page >= pageCount}
                    onClick={() => void navigate({ search: { ...search, page: page + 1 } })}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-accent/30 bg-accent-soft/30 px-5 py-10 text-center">
              <h3 className="text-xl font-semibold">
                {data.results.length
                  ? search.view === "age" && !search.category
                    ? "Choose an age category"
                    : "No published results match this view"
                  : "Results to follow"}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
                {data.results.length
                  ? "You can also search the organiser’s results for the full field."
                  : "Verified finish times and placings have not been added here yet. The official results service covers the full field, including age groups."}
              </p>
              <a
                href={BERLIN_OFFICIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent underline"
              >
                Find a runner in the official results
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </section>

      <section
        className="grid gap-6 rounded-xl border border-border bg-surface p-5 sm:p-6 lg:grid-cols-[1fr_1fr]"
        aria-labelledby="share-berlin"
      >
        <div>
          <h2 id="share-berlin" className="text-2xl font-bold">
            Share Berlin
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            Download a card for this view. Instagram uses a portrait image; X uses a landscape
            image.{" "}
            {rows.length
              ? "Cards show up to ten published results."
              : "For now, cards say “Awaiting verified results”."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void download("instagram")}>
              <Download className="size-4" aria-hidden="true" />
              Instagram image
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => void download("x")}>
              <Download className="size-4" aria-hidden="true" />X image
            </Button>
            <Button variant="secondary" onClick={() => void copy(caption, "Caption")}>
              <Copy className="size-4" aria-hidden="true" />
              Copy caption
            </Button>
            <Button variant="secondary" onClick={() => void copy(berlinShareUrl(search), "Link")}>
              Copy page link
            </Button>
          </div>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-1 font-semibold text-accent underline"
          >
            Open post in X<ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="mt-1 text-sm text-muted">
            Attach the downloaded image before posting. Instagram: upload the image and paste the
            caption.
          </p>
          <p role="status" aria-live="polite" className="mt-3 text-sm font-medium text-accent">
            {busy ? "Preparing image…" : message}
          </p>
        </div>
        <div className="min-w-0">
          <label htmlFor="berlin-caption" className="text-sm font-semibold">
            Post caption
          </label>
          <textarea
            id="berlin-caption"
            readOnly
            value={caption}
            rows={8}
            className="mt-2 w-full resize-y rounded-lg border border-border bg-bg p-4 text-sm leading-6"
          />
          <p className="mt-2 text-sm text-muted">Public page · no AthRecs account needed</p>
        </div>
      </section>
      <p className="text-sm leading-6 text-muted">
        AthRecs results coverage. Independent of the race organiser.{" "}
        <a
          href="https://www.bmw-berlin-marathon.com/en/your-race/results"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          Official results: SCC EVENTS / Mika Timing.
        </a>
      </p>
    </div>
  );
}
