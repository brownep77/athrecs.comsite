import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCollectionOperations } from "@/lib/collection-stats/operations-api";
import {
  operationInput,
  operationHelp,
  operationPageSize,
  operationSections,
  type OperationInput,
  type OperationSection,
} from "@/lib/collection-stats/operations";
import { getVercelStats } from "@/lib/web-stats/api";
import { statsCsv } from "@/lib/collection-stats/core";

const number = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 });
const statusLabels: Record<string, string> = {
  pending: "Waiting for review",
  needs_info: "More information needed",
  needs_changes: "Changes requested",
  held: "Paused for review",
  queued: "Waiting to start",
  processing: "Collection in progress",
  completed_with_errors: "Finished with some errors",
  failed: "Could not complete",
  staged: "Saved for review",
  eligible: "Passed initial checks",
  blocked: "An issue needs resolving",
  review: "Needs review",
  proposed: "Suggested for review",
  approved: "Approved",
  rejected: "Not approved",
  duplicate: "Flagged as a duplicate",
  extracted: "Finished collecting",
  partial: "Partly collected",
  excluded: "Left out",
  linked: "Matched to a main result",
  unlinked: "Not matched yet",
  unmatched: "Not matched yet",
  source_verified: "Checked against source",
  verified_by_administrator: "Checked by staff",
  unverified: "No check recorded",
  TBC: "Date to be confirmed",
  FIN: "Finished",
  DNF: "Did not finish",
  DNS: "Did not start",
  DQ: "Disqualified",
  DSQ: "Disqualified",
  events: "Events",
  editions: "Race dates and distances",
  athletes: "Athlete profiles",
  results: "Results",
};
function displayCell(value: string | number | null | undefined, key: string): string {
  if (value == null)
    return ["percent", "share", "matched", "expected"].includes(key) ? "Unknown" : "—";
  if (typeof value === "number") return number(value);
  if (
    ["oldest", "since", "checked", "status"].includes(key) &&
    /^\d{4}-\d{2}-\d{2}[ T]/.test(value)
  ) {
    const date = new Date(value);
    if (Number.isFinite(date.getTime()))
      return date.toLocaleString("en-GB", {
        timeZone: "Europe/London",
        dateStyle: "medium",
        timeStyle: "short",
      });
  }
  if (key === "status") return statusLabels[value] ?? value.replaceAll("_", " ");
  return key === "label" ? value.replaceAll("_", " ") : value;
}

const workflows: Partial<Record<OperationSection, { label: string; href: string }[]>> = {
  results: [{ label: "Collected results", href: "/admin/result-archive" }],
  sources: [
    { label: "Source registry and collection status", href: "/admin/sources" },
    { label: "Websites and pages to collect from", href: "/admin/event-register" },
    { label: "Result collection attempts", href: "/admin/result-archive" },
  ],
  matching: [
    { label: "Review requests to claim results", href: "/admin/result-claims" },
    { label: "Match collected results to athletes", href: "/admin/result-archive" },
  ],
  verification: [{ label: "Athlete review tools", href: "/admin/athlete-tools" }],
  gaps: [
    { label: "Athlete directory", href: "/admin/athlete-directory" },
    { label: "Event register", href: "/admin/event-register" },
  ],
  duplicates: [{ label: "Race collector", href: "/admin/race-collector" }],
  clubs: [
    { label: "Club applications", href: "/admin/club-registrations" },
    { label: "Find club athletes and results", href: "/admin/club-scanner" },
  ],
  backlog: [
    { label: "Review collected events", href: "/admin/fixture-review" },
    { label: "Review club applications", href: "/admin/club-registrations" },
  ],
  activity: [
    { label: "Website traffic & Google", href: "/admin/collection-stats?section=website" },
    { label: "Registered accounts", href: "/admin/athlete-accounts" },
  ],
};
const control = "mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";

export function CollectionOperations({
  initialSection = "results",
}: {
  initialSection?: OperationSection;
}) {
  const [filters, setFilters] = useState<OperationInput>(() =>
    operationInput.parse({
      section: initialSection,
      group: initialSection === "sources" ? "fixtures" : "sport",
    }),
  );
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [search, setSearch] = useState("");
  const report = useQuery({
    queryKey: ["collection-operations", filters],
    queryFn: () => getCollectionOperations({ data: filters }),
    staleTime: 60_000,
    refetchInterval: autoRefresh && filters.section === "sources" ? 60_000 : false,
    refetchIntervalInBackground: false,
    retry: false,
  });
  const trafficDays = filters.days === 30 ? 28 : filters.days;
  const traffic = useQuery({
    queryKey: ["operations-traffic", trafficDays],
    queryFn: () => getVercelStats({ data: { days: trafficDays } }),
    enabled: filters.section === "activity",
    staleTime: 300_000,
    retry: false,
  });
  const data = report.data;
  const help = operationHelp[filters.section];
  function changeSection(section: OperationSection) {
    setSearch("");
    setFilters(
      operationInput.parse({
        section,
        days: filters.days,
        group: section === "sources" ? "inventory" : "sport",
      }),
    );
  }
  function resetDetail() {
    setSearch("");
    setFilters((f) => ({ ...f, mode: "summary", key: "", page: 0, q: "" }));
  }
  function download() {
    if (!data) return;
    const content = statsCsv([
      ["Figures loaded at (UTC)", new Date(data.generatedAt).toISOString()],
      ["Report", data.title, filters.group],
      ...data.notes.map((note) => ["Note", note]),
      data.columns.map((c) => c.label),
      ...data.rows.map((r) =>
        data.columns.map((c) =>
          typeof r[c.key] === "string" ? displayCell(r[c.key], c.key) : (r[c.key] ?? null),
        ),
      ),
    ]);
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `athrecs-${filters.section}-${filters.mode}-page-${filters.page + 1}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  const groups =
    filters.section === "results"
      ? [
          ["sport", "Sport"],
          ["distance", "Distance"],
          ["country", "Country"],
          ["year", "Race year"],
        ]
      : filters.section === "sources"
        ? [
            ["fixtures", "Fixture sources by sport"],
            ["athleteSources", "Athlete sources and share"],
            ["resultSources", "Main result sources and share"],
            ["profileResults", "Results for each athlete and source"],
            ["inventory", "Pages we have found"],
            ["imports", "Attempts to collect results"],
            ["datasets", "Saved results sheets"],
          ]
        : filters.section === "growth"
          ? [
              ["sport", "Type of entry"],
              ["daily", "Day by day"],
            ]
          : [];
  return (
    <section className="space-y-5" aria-label="Collection progress and work to do">
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-semibold">
              {initialSection === "sources"
                ? "Sources & coverage"
                : "Collection progress and work to do"}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              See what we have saved, what needs checking and what is still waiting. Choose a
              question below. Each report explains its figures and where to go next.
            </p>
          </div>
          <Button
            variant="secondary"
            disabled={report.isFetching || (filters.section === "activity" && traffic.isFetching)}
            onClick={() => {
              void report.refetch();
              if (filters.section === "activity") void traffic.refetch();
            }}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Update figures
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">
            What would you like to see?
            <select
              className={control}
              aria-label="What would you like to see?"
              value={filters.section}
              onChange={(e) => changeSection(e.target.value as OperationSection)}
            >
              {Object.entries(operationSections).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {groups.length > 0 ? (
            <label className="text-sm font-medium">
              Show figures by
              <select
                className={control}
                aria-label="Show figures by"
                value={filters.group}
                onChange={(e) => {
                  setSearch("");
                  setFilters((f) => ({
                    ...f,
                    group: e.target.value as OperationInput["group"],
                    page: 0,
                    key: "",
                    mode: "summary",
                    q: "",
                  }));
                }}
              >
                {groups.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {["growth", "activity"].includes(filters.section) ? (
            <label className="text-sm font-medium">
              Reporting period
              <select
                className={control}
                aria-label="Reporting period"
                value={filters.days}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    days: Number(e.target.value) as OperationInput["days"],
                    page: 0,
                  }))
                }
              >
                <option value={7}>Last 7 days, including today</option>
                <option value={30}>Last 30 days, including today</option>
                <option value={90}>Last 90 days, including today</option>
              </select>
            </label>
          ) : null}
        </div>
        {filters.section === "sources" ? (
          <div className="space-y-2 text-sm text-slate-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(event) => setAutoRefresh(event.target.checked)}
              />
              Refresh stored figures every minute while this tab is open
            </label>
            <p>
              Figures reflect saved data at the time shown. Refreshing does not scan external
              websites. Source capture and last-attempt dates are shown separately where recorded.
            </p>
          </div>
        ) : null}
        <details className="rounded-lg border border-slate-200 p-3">
          <summary className="cursor-pointer font-medium text-cyan-900">
            See all 11 reports and what they mean
          </summary>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {Object.entries(operationSections).map(([value, label]) => (
              <li key={value}>
                <button
                  type="button"
                  className="text-left font-medium text-cyan-800 underline underline-offset-4"
                  onClick={() => changeSection(value as OperationSection)}
                >
                  {label}
                </button>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {operationHelp[value as OperationSection].summary}
                </p>
              </li>
            ))}
          </ul>
        </details>
        <div
          className="space-y-2 rounded-lg bg-cyan-50 p-4 text-sm leading-6"
          aria-label="About this report"
        >
          <p className="font-medium text-slate-900">{help.summary}</p>
          <p className="text-slate-700">{help.example}</p>
          <p className="text-slate-700">
            <strong>What you can do:</strong> {help.action}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Related staff tools">
          {(workflows[filters.section] ?? []).map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-medium text-cyan-800 underline underline-offset-4"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      {filters.section === "activity" ? (
        <div className="rounded-xl border bg-white p-5 space-y-2" aria-label="Website visits">
          <h3 className="font-semibold">Website visits</h3>
          {traffic.isError ? (
            <p role="alert" className="text-sm text-red-800">
              Visitor figures could not refresh. Any previously loaded figures are shown below.
            </p>
          ) : null}
          {traffic.isPending ? (
            <p role="status">Loading visitor report…</p>
          ) : traffic.data?.status === "ready" ? (
            <>
              <p className="text-xl font-bold">
                {number(traffic.data.report.visitors)} visitors ·{" "}
                {number(traffic.data.report.pageviews)} page views
              </p>
              <p className="text-xs text-slate-600">
                Vercel report:{" "}
                {new Date(traffic.data.report.since).toLocaleString("en-GB", {
                  timeZone: "Europe/London",
                })}{" "}
                to{" "}
                {new Date(traffic.data.report.until).toLocaleString("en-GB", {
                  timeZone: "Europe/London",
                })}{" "}
                (UK time). Visitors use a rolling {trafficDays}-day window including today; account
                activity below uses {filters.days} UK calendar days.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-600">
              {traffic.data
                ? traffic.data.message
                : "The visitor report is unavailable. This does not mean zero visits."}
            </p>
          )}
          <a
            className="text-sm text-cyan-800 underline"
            href="/admin/collection-stats?section=website"
          >
            Open website reporting and connections
          </a>
          <p className="text-xs text-slate-600">
            Visits and account actions are separate totals. One person may appear in several groups.
            These figures do not tell us what percentage of visitors signed up.
          </p>
        </div>
      ) : null}
      {report.isPending ? (
        <p role="status" className="rounded-xl border bg-white p-5">
          Loading figures…
        </p>
      ) : null}
      {report.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900">
          <p>
            This report could not be refreshed.{" "}
            {data
              ? "The last figures we successfully loaded are shown."
              : "Figures are unavailable. This does not mean there are no entries."}
          </p>
          <Button variant="secondary" className="mt-3" onClick={() => void report.refetch()}>
            Try loading the figures again
          </Button>
        </div>
      ) : null}
      {data ? (
        <>
          {data.metrics.length > 0 ? (
            <div
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
              aria-label="Operations totals"
            >
              {data.metrics.map((metric) => (
                <div key={metric.label} className="rounded-xl border bg-white p-4">
                  <p className="text-sm text-slate-600">{metric.label}</p>
                  <p className="my-2 text-2xl font-bold">
                    {metric.value == null ? "Not recorded" : number(metric.value)}
                  </p>
                  {metric.detail ? (
                    <p className="text-sm leading-6 text-slate-600">{metric.detail}</p>
                  ) : null}
                  {metric.drill ? (
                    <button
                      className="mt-2 text-sm text-cyan-800 underline"
                      onClick={() => {
                        setSearch("");
                        setFilters((f) => ({
                          ...f,
                          mode: "records",
                          key: metric.drill!,
                          page: 0,
                          q: "",
                        }));
                      }}
                    >
                      See entries
                    </button>
                  ) : metric.href ? (
                    <a
                      className="mt-2 inline-block text-sm text-cyan-800 underline"
                      href={metric.href}
                    >
                      Open related entries
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
            <div>
              <h3 className="font-display text-xl font-semibold">
                {data.title}
                {filters.mode === "records" ? " — individual entries" : ""}
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{data.description}</p>
            </div>
            {filters.mode === "records" ? (
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" onClick={resetDetail}>
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to report
                </Button>
                <p className="text-sm text-slate-600">
                  Individual entries in the group you selected.
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <form
                className="flex flex-wrap items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setFilters((f) => ({ ...f, q: search, page: 0 }));
                }}
              >
                <label className="text-sm font-medium">
                  Search this report
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    maxLength={120}
                    className={control}
                    type="search"
                  />
                </label>
                <Button variant="secondary" type="submit">
                  Search report
                </Button>
                {filters.q ? (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setFilters((f) => ({ ...f, q: "", page: 0 }));
                    }}
                  >
                    Clear search
                  </Button>
                ) : null}
              </form>
              <Button variant="secondary" disabled={!data.rows.length} onClick={download}>
                <Download className="size-4" aria-hidden="true" />
                Download this page for Excel
              </Button>
            </div>
            <p className="text-xs text-slate-500">
              {number(data.total)} {filters.mode === "records" ? "entries" : "groups"} ·{" "}
              {data.total
                ? `${number(filters.page * operationPageSize + 1)}–${number(Math.min((filters.page + 1) * operationPageSize, data.total))}`
                : "0"}{" "}
              shown · Figures last loaded{" "}
              {new Date(data.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}{" "}
              (UK time)
            </p>
            <div
              className="max-w-full overflow-x-auto rounded-lg border border-slate-200"
              tabIndex={0}
              role="region"
              aria-label="Scrollable operations table"
            >
              <table className="w-full text-left text-sm" aria-label="Operations report table">
                <thead className="bg-slate-100">
                  <tr>
                    {data.columns.map((c) => (
                      <th
                        key={c.key}
                        scope="col"
                        className={`px-3 py-3 ${c.numeric ? "text-right" : ""}`}
                      >
                        {c.label}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-3">
                      Review
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.length ? (
                    data.rows.map((row) => (
                      <tr key={row.key} className="border-t odd:bg-white even:bg-slate-50">
                        {data.columns.map((c) => (
                          <td
                            key={c.key}
                            className={`px-3 py-3 ${c.numeric ? "text-right tabular-nums" : "min-w-28 max-w-sm break-words"}`}
                          >
                            {displayCell(row[c.key], c.key)}
                          </td>
                        ))}
                        <td className="px-3 py-3">
                          {row.drill ? (
                            <button
                              className="font-medium text-cyan-800 underline underline-offset-4 whitespace-nowrap"
                              aria-label={`See entries: ${row.label}`}
                              onClick={() => {
                                setSearch("");
                                setFilters((f) => ({
                                  ...f,
                                  mode: "records",
                                  key: row.drill!,
                                  page: 0,
                                  q: "",
                                }));
                              }}
                            >
                              See entries
                            </button>
                          ) : row.href ? (
                            <a
                              className="font-medium text-cyan-800 underline underline-offset-4 whitespace-nowrap"
                              href={row.href}
                            >
                              Open entry
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={data.columns.length + 1} className="p-5 text-slate-600">
                        No entries match this report or search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {data.total > operationPageSize || filters.page > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  disabled={filters.page === 0 || report.isFetching}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                >
                  Previous page
                </Button>
                <span className="text-sm">Page {filters.page + 1}</span>
                <Button
                  variant="secondary"
                  disabled={
                    (filters.page + 1) * operationPageSize >= data.total || report.isFetching
                  }
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                >
                  Next page
                </Button>
              </div>
            ) : null}
            <div className="space-y-2 border-t pt-3 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-900">How these figures are counted</p>
              {data.notes.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
