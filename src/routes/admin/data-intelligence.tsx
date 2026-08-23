import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  Globe2,
  Loader2,
  MapPin,
  MousePointerClick,
  RefreshCw,
  ShieldCheck,
  UserRoundSearch,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDataIntelligenceDashboard } from "@/lib/athrecs/data-intelligence-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/data-intelligence")({
  head: () => ({
    meta: [
      { title: "Data & analytics — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: DataIntelligencePage,
});

type DashboardTab = "overview" | "coverage" | "quality" | "site" | "athletes";

const tabs: Array<{ id: DashboardTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "coverage", label: "Coverage" },
  { id: "quality", label: "Data quality" },
  { id: "site", label: "Site analytics" },
  { id: "athletes", label: "Athlete insights" },
];

function DataIntelligencePage() {
  const [tab, setTab] = useState<DashboardTab>("overview");
  const dashboard = useQuery({
    queryKey: ["data-intelligence"],
    queryFn: () => getDataIntelligenceDashboard(),
    staleTime: 60_000,
  });

  if (dashboard.isLoading) {
    return (
      <div className="flex min-h-[24rem] items-center justify-center gap-3 text-sm text-muted">
        <Loader2 className="size-5 animate-spin text-accent" aria-hidden="true" />
        Analysing the ATHRECS catalogue…
      </div>
    );
  }

  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-950">
        <h1 className="font-display text-xl font-semibold">Data intelligence could not load</h1>
        <p className="mt-2 text-sm">
          The database was not changed. Refresh the report after checking the database connection.
        </p>
        <Button className="mt-4" type="button" onClick={() => void dashboard.refetch()}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  const data = dashboard.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-700">
            ATHRECS intelligence
          </p>
          <h1 className="font-display text-3xl font-semibold text-fg">Data & analytics</h1>
          <p className="max-w-3xl text-sm leading-6 text-muted">
            One place to measure catalogue coverage, find incomplete or suspicious records,
            understand site use and analyse consented athlete behaviour.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => void dashboard.refetch()}>
            <RefreshCw
              className={cn("size-4", dashboard.isFetching && "animate-spin")}
              aria-hidden="true"
            />
            Refresh analysis
          </Button>
          <Button asChild>
            <Link to="/admin">
              <Database className="size-4" aria-hidden="true" />
              Import data
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Events"
          value={data.overview.events}
          detail={`${formatNumber(data.overview.upcomingEditions)} upcoming editions`}
          icon={Globe2}
        />
        <MetricCard
          label="Countries"
          value={data.overview.countries}
          detail={`${formatNumber(data.overview.cities)} cities`}
          icon={MapPin}
        />
        <MetricCard
          label="Athletes"
          value={data.overview.athletes}
          detail={`${formatNumber(data.overview.results)} results`}
          icon={Users}
        />
        <MetricCard
          label="30-day visits"
          value={data.overview.sessions30d}
          detail={`${formatNumber(data.overview.pageViews30d)} page views`}
          icon={MousePointerClick}
        />
        <QualityMetric score={data.overview.qualityScore} critical={data.quality.totals.critical} />
      </div>

      <div className="border-b border-border">
        <div
          className="flex gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Data intelligence sections"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                "min-h-11 shrink-0 border-b-2 px-3 text-sm font-medium transition-colors",
                tab === item.id
                  ? "border-accent text-fg"
                  : "border-transparent text-muted hover:text-fg",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" ? <OverviewTab data={data} setTab={setTab} /> : null}
      {tab === "coverage" ? <CoverageTab data={data} /> : null}
      {tab === "quality" ? <QualityTab data={data} /> : null}
      {tab === "site" ? <SiteTab data={data} /> : null}
      {tab === "athletes" ? <AthleteTab data={data} /> : null}

      <p className="text-right text-xs text-subtle">
        Report generated {new Date(data.generatedAt).toLocaleString("en-GB")}
      </p>
    </div>
  );
}

type Dashboard = Awaited<ReturnType<typeof getDataIntelligenceDashboard>>;

function OverviewTab({ data, setTab }: { data: Dashboard; setTab: (tab: DashboardTab) => void }) {
  const priorityIssues = data.quality.issues.slice(0, 5);
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.8fr)]">
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Catalogue mix
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-fg">Events by sport</h2>
          </div>
          <Badge variant="outline">{formatNumber(data.overview.editions)} editions</Badge>
        </div>
        <ChartFrame>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.catalogue.sports.slice(0, 10)}
              margin={{ top: 10, right: 8, bottom: 35, left: -8 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4e6" />
              <XAxis
                dataKey="label"
                angle={-30}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ fill: "#eef5f5" }} />
              <Bar dataKey="count" name="Events" fill="#087f8c" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Action centre
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-fg">Priority data work</h2>
          </div>
          <button
            type="button"
            className="text-xs font-semibold text-accent hover:underline"
            onClick={() => setTab("quality")}
          >
            View queue
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {priorityIssues.length ? (
            priorityIssues.map((issue) => (
              <button
                key={issue.issue_code}
                type="button"
                onClick={() => setTab("quality")}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border px-3 py-3 text-left hover:bg-elevated"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <SeverityDot severity={issue.severity} />
                  <span className="truncate text-sm text-fg">{issue.label}</span>
                </span>
                <strong className="tabular-nums text-sm text-fg">
                  {formatNumber(issue.count)}
                </strong>
              </button>
            ))
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="No quality issues found"
              text="The current automated checks are clear."
            />
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-card xl:col-span-2">
        <div className="grid gap-4 md:grid-cols-3">
          <QuickAction
            icon={ClipboardCheck}
            title="Review fixtures"
            text="Approve safe staged records and keep blocked sources held."
            to="/admin/fixture-review"
          />
          <QuickAction
            icon={Database}
            title="Manage sources"
            text="See approved, blocked and pending collection sources."
            to="/admin/sources"
          />
          <QuickAction
            icon={Globe2}
            title="Find coverage gaps"
            text="Compare countries, regions, cities and postcodes."
            onClick={() => setTab("coverage")}
          />
        </div>
      </section>
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Global gap list
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-fg">
              Countries with no catalogue events yet
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              This compares the live database with the countries supported by ATHRECS. It is a
              collection priority list, not a claim that no races exist in those countries.
            </p>
          </div>
          <Badge variant="outline">
            {formatNumber(data.geography.missingCountries.length)} countries missing
          </Badge>
        </div>
        <div className="mt-4 flex max-h-48 flex-wrap gap-2 overflow-auto">
          {data.geography.missingCountries.map((country) => (
            <span
              key={country.iso}
              className="rounded-full border border-border bg-bg px-3 py-1.5 text-sm text-fg"
            >
              {country.flag} {country.country}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}

function CoverageTab({ data }: { data: Dashboard }) {
  const [dimension, setDimension] = useState<"countries" | "regions" | "cities" | "postcodes">(
    "countries",
  );
  const rows = data.geography[dimension];

  function downloadCsv() {
    const header =
      dimension === "countries"
        ? [
            "Location",
            "Events",
            "Upcoming editions",
            "Missing location data",
            "Missing entry routes",
          ]
        : ["Location", "Events"];
    const body = rows.map((row) => {
      if ("upcoming" in row) {
        return [row.label, row.count, row.upcoming, row.missingLocation, row.missingEntry];
      }
      return [row.label, row.count];
    });
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `athrecs-${dimension}-coverage.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Geographic coverage
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-fg">
              Where ATHRECS has races—and where it does not
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              “Unknown” exposes missing fields. Regions currently fall back to county when a formal
              region has not yet been recorded.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={downloadCsv}>
            <Download className="size-4" aria-hidden="true" />
            Export CSV
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["countries", "regions", "cities", "postcodes"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setDimension(item)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm font-medium capitalize",
                dimension === item
                  ? "border-accent bg-accent text-white"
                  : "border-border bg-bg text-muted hover:text-fg",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(30rem,1.3fr)]">
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows.slice(0, 12)} layout="vertical" margin={{ left: 22, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dbe4e6" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" width={105} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: "#eef5f5" }} />
                <Bar dataKey="count" name="Events" fill="#087f8c" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
          <div className="max-h-[22rem] overflow-auto rounded-lg border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="sticky top-0 bg-elevated text-xs uppercase tracking-wide text-subtle">
                <tr>
                  <th className="px-3 py-2 font-medium">Location</th>
                  <th className="px-3 py-2 text-right font-medium">Events</th>
                  {dimension === "countries" ? (
                    <>
                      <th className="px-3 py-2 text-right font-medium">Upcoming</th>
                      <th className="px-3 py-2 text-right font-medium">Incomplete</th>
                      <th className="px-3 py-2 text-right font-medium">No entry</th>
                    </>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-fg">{row.label}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      {formatNumber(row.count)}
                    </td>
                    {"upcoming" in row ? (
                      <>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatNumber(row.upcoming)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-amber-800">
                          {formatNumber(row.missingLocation)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-red-700">
                          {formatNumber(row.missingEntry)}
                        </td>
                      </>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

function QualityTab({ data }: { data: Dashboard }) {
  const [severity, setSeverity] = useState<"all" | "critical" | "warning" | "info">("all");
  const examples = useMemo(
    () =>
      data.quality.examples.filter((issue) => severity === "all" || issue.severity === severity),
    [data.quality.examples, severity],
  );
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <IssueTotal label="Critical" value={data.quality.totals.critical} tone="red" />
        <IssueTotal label="Warnings" value={data.quality.totals.warning} tone="amber" />
        <IssueTotal label="Information" value={data.quality.totals.info} tone="slate" />
      </div>
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <h2 className="font-display text-xl font-semibold text-fg">Automated checks</h2>
        <p className="mt-1 text-sm text-muted">
          Counts update directly from the database each time this report is refreshed.
        </p>
        <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {data.quality.issues.map((issue) => (
            <div
              key={issue.issue_code}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <span className="flex min-w-0 items-center gap-2">
                <SeverityDot severity={issue.severity} />
                <span className="text-sm text-fg">{issue.label}</span>
              </span>
              <strong className="tabular-nums text-sm">{formatNumber(issue.count)}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-fg">
              Records needing attention
            </h2>
            <p className="mt-1 text-sm text-muted">
              Open the public record to verify the current information, then correct it through the
              import tools.
            </p>
          </div>
          <select
            value={severity}
            onChange={(event) => setSeverity(event.target.value as typeof severity)}
            className="h-10 rounded-lg border border-border bg-bg px-3 text-sm text-fg"
            aria-label="Filter issues by severity"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warnings</option>
            <option value="info">Information</option>
          </select>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
              <tr>
                <th className="px-3 py-2 font-medium">Priority</th>
                <th className="px-3 py-2 font-medium">Event</th>
                <th className="px-3 py-2 font-medium">Location</th>
                <th className="px-3 py-2 font-medium">Issue</th>
                <th className="px-3 py-2 font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((issue) => (
                <tr
                  key={`${issue.event_slug}-${issue.issue_code}`}
                  className="border-t border-border align-top"
                >
                  <td className="px-3 py-3">
                    <SeverityBadge severity={issue.severity} />
                  </td>
                  <td className="px-3 py-3 font-medium text-fg">{issue.event_name}</td>
                  <td className="px-3 py-3 text-muted">
                    {[issue.city, issue.country].filter(Boolean).join(", ") || "Unknown"}
                  </td>
                  <td className="px-3 py-3 text-muted">{issue.detail}</td>
                  <td className="px-3 py-3">
                    <Link
                      to="/races/$slug"
                      params={{ slug: issue.event_slug }}
                      className="font-medium text-accent no-underline hover:underline"
                    >
                      View record
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SiteTab({ data }: { data: Dashboard }) {
  const hasData = data.overview.pageViews30d > 0;
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-950">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div>
            <h2 className="font-semibold">Privacy-first collection</h2>
            <p className="mt-1 text-sm leading-5">
              Analytics only start after a visitor opts in. ATHRECS stores a one-way session hash,
              coarse Vercel geography and the page path—never the IP address, URL query, full
              referrer or raw browser identifier.
            </p>
          </div>
        </div>
      </section>
      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Analytics is ready to collect"
          text="The charts will populate as consenting visitors use the newly deployed site."
        />
      ) : (
        <>
          <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <h2 className="font-display text-xl font-semibold text-fg">
              Visits over the last 30 days
            </h2>
            <ChartFrame>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.site.daily}
                  margin={{ top: 18, right: 12, left: -12, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4e6" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => String(value).slice(5)}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    name="Page views"
                    stroke="#087f8c"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    name="Visits"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </section>
          <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
            <h2 className="font-display text-xl font-semibold text-fg">Most-viewed pages</h2>
            <div className="mt-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead className="bg-elevated text-xs uppercase tracking-wide text-subtle">
                  <tr>
                    <th className="px-3 py-2 font-medium">Page</th>
                    <th className="px-3 py-2 text-right font-medium">Views</th>
                    <th className="px-3 py-2 text-right font-medium">Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {data.site.topPages.map((row) => (
                    <tr key={row.path} className="border-t border-border">
                      <td className="px-3 py-2.5 font-medium text-fg">{row.path}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatNumber(row.views)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {formatNumber(row.sessions)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function AthleteTab({ data }: { data: Dashboard }) {
  const habits = data.athletes.habits;
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <SmallMetric label="Athletes with results" value={data.athletes.activeAthletes} />
          <SmallMetric label="Repeat athletes" value={data.athletes.repeatAthletes} />
          <SmallMetric label="One recorded race" value={data.athletes.oneResult} />
          <SmallMetric label="Average results" value={data.athletes.averageResults} decimals />
          <SmallMetric label="Stated distance" value={data.athletes.profiledAthletes} />
        </div>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h2 className="font-display text-xl font-semibold text-fg">Race frequency</h2>
          <p className="mt-1 text-sm text-muted">
            Based on verified result rows currently held by ATHRECS.
          </p>
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.athletes.frequency}
                margin={{ top: 12, right: 8, left: -8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe4e6" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Athletes" fill="#087f8c" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
          <h2 className="font-display text-xl font-semibold text-fg">Distances athletes race</h2>
          <p className="mt-1 text-sm text-muted">
            Unique athletes by result distance—not a marketing inference.
          </p>
          <ChartFrame>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.athletes.distances.slice(0, 10)}
                layout="vertical"
                margin={{ left: 12, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#dbe4e6" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" width={84} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Athletes" fill="#f59e0b" radius={[0, 5, 5, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </section>
      </div>
      <section className="rounded-xl border border-border bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Consented athlete habits
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-fg">
              Training, racing and product preferences
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted">
              This private dataset is deliberately separate from public athlete profiles. Only
              active performance-insights consent contributes to these aggregates.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-300 bg-emerald-50 text-emerald-900">
              Aggregated only
            </Badge>
            <Button asChild variant="secondary">
              <Link to="/admin/athlete-accounts">Manage athlete accounts</Link>
            </Button>
          </div>
        </div>
        {habits.responses === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={UserRoundSearch}
              title="No consented habit responses yet"
              text="Athlete Account responses appear here only after the athlete links a profile and grants performance-insights consent; no habits are inferred or invented."
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SmallMetric label="Responses" value={habits.responses} />
            <SmallMetric label="Training days/week" value={habits.averageTrainingDays} decimals />
            <SmallMetric label="Weekly distance (km)" value={habits.averageWeeklyKm} decimals />
            <SmallMetric label="Races/year" value={habits.averageRacesPerYear} decimals />
          </div>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Globe2;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</p>
        <Icon className="size-4 text-accent" aria-hidden="true" />
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-fg">{formatNumber(value)}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </section>
  );
}

function QualityMetric({ score, critical }: { score: number; critical: number }) {
  const tone = score >= 85 ? "text-emerald-700" : score >= 65 ? "text-amber-700" : "text-red-700";
  return (
    <section className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Data quality</p>
        <ClipboardCheck className="size-4 text-accent" aria-hidden="true" />
      </div>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", tone)}>{score}%</p>
      <p className="mt-1 text-xs text-muted">{formatNumber(critical)} critical findings</p>
    </section>
  );
}

function SmallMetric({
  label,
  value,
  decimals = false,
}: {
  label: string;
  value: number;
  decimals?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-fg">
        {decimals ? value.toFixed(1) : formatNumber(value)}
      </p>
    </div>
  );
}

function IssueTotal({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "amber" | "slate";
}) {
  const tones = {
    red: "border-red-200 bg-red-50 text-red-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    slate: "border-slate-200 bg-slate-50 text-slate-900",
  };
  return (
    <div className={cn("rounded-xl border p-4", tones[tone])}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(value)}</p>
    </div>
  );
}

function SeverityDot({ severity }: { severity: "critical" | "warning" | "info" }) {
  return (
    <span
      className={cn(
        "size-2.5 shrink-0 rounded-full",
        severity === "critical"
          ? "bg-red-500"
          : severity === "warning"
            ? "bg-amber-500"
            : "bg-slate-400",
      )}
      aria-hidden="true"
    />
  );
}

function SeverityBadge({ severity }: { severity: "critical" | "warning" | "info" }) {
  return (
    <Badge
      className={cn(
        severity === "critical"
          ? "border-red-300 bg-red-50 text-red-900"
          : severity === "warning"
            ? "border-amber-300 bg-amber-50 text-amber-900"
            : "border-slate-300 bg-slate-50 text-slate-800",
      )}
    >
      {severity}
    </Badge>
  );
}

function QuickAction({
  icon: Icon,
  title,
  text,
  to,
  onClick,
}: {
  icon: typeof Database;
  title: string;
  text: string;
  to?: "/admin/fixture-review" | "/admin/sources";
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="rounded-lg bg-accent-soft p-2 text-accent">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <strong className="block text-sm text-fg">{title}</strong>
        <span className="mt-1 block text-xs leading-5 text-muted">{text}</span>
      </span>
    </>
  );
  const className =
    "flex items-start gap-3 rounded-xl border border-border bg-bg p-4 text-left no-underline transition-colors hover:border-accent/40 hover:bg-elevated";
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof AlertCircle;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center">
      <Icon className="mx-auto size-7 text-subtle" aria-hidden="true" />
      <h3 className="mt-3 font-semibold text-fg">{title}</h3>
      <p className="mx-auto mt-1 max-w-xl text-sm text-muted">{text}</p>
    </div>
  );
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 h-[19rem] w-full">{children}</div>;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-GB").format(value);
}
