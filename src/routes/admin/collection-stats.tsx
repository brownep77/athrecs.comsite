import { useState } from "react";
import { CollectionOperations } from "@/components/staff/CollectionOperations";
import { WebsiteStats } from "@/components/staff/WebsiteStats";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCollectionStats } from "@/lib/collection-stats/api";
import { defaultStatsFilters, statsCsv, type StatsFilters } from "@/lib/collection-stats/core";

export const Route = createFileRoute("/admin/collection-stats")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { section: "collection" | "website" | "operations" } => ({
    section:
      search.section === "website"
        ? "website"
        : search.section === "operations"
          ? "operations"
          : "collection",
  }),
  head: () => ({
    meta: [
      { title: "Stats — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: CollectionStatsPage,
});

const number = (value: number) => value.toLocaleString("en-GB");
const raceGroups = {
  sport: "Sport",
  distance: "Distance",
  country: "Country",
  county: "Country and county",
  detail: "Sport, distance, country and county",
};
const profileGroups = {
  sport: "Sport",
  gender: "Gender",
  nationality: "Nationality",
  sportGenderNationality: "Sport, gender and nationality",
  country: "Country",
  county: "Country and county",
  detail: "Sport, gender, nationality and location",
};

function CollectionStatsPage() {
  const { section } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filters, setFilters] = useState<StatsFilters>(defaultStatsFilters);
  const report = useQuery({
    queryKey: ["collection-stats", filters],
    queryFn: () => getCollectionStats({ data: filters }),
    staleTime: 60_000,
    retry: false,
    enabled: section === "collection",
  });
  const data = report.data;
  function change<K extends keyof StatsFilters>(key: K, value: StatsFilters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      ...(key === "raceCountry" ? { raceCounty: "" } : {}),
      ...(key === "profileCountry" ? { profileCounty: "" } : {}),
    }));
  }
  const raceColumns =
    filters.raceGroup === "detail"
      ? ["Sport", "Distance", "Country", "County"]
      : filters.raceGroup === "county"
        ? ["Country", "County"]
        : [raceGroups[filters.raceGroup]];
  const profileColumns =
    filters.profileGroup === "detail"
      ? ["Sport", "Gender", "Nationality", "Country", "County"]
      : filters.profileGroup === "sportGenderNationality"
        ? ["Sport", "Gender", "Nationality"]
        : filters.profileGroup === "county"
          ? ["Country", "County"]
          : [profileGroups[filters.profileGroup]];
  const raceRows =
    data?.races.rows.map((row) => [
      ...raceColumns.map(
        (column) => row[column.toLowerCase() as "sport" | "distance" | "country" | "county"],
      ),
      row.events,
      row.editions,
    ]) ?? [];
  const profileRows =
    data?.profiles.rows.map((row) => [
      ...profileColumns.map(
        (column) =>
          row[column.toLowerCase() as "sport" | "gender" | "nationality" | "country" | "county"],
      ),
      row.profiles,
      row.publicProfiles,
      row.added7d,
    ]) ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-800">
            <BarChart3 className="size-4" aria-hidden="true" />
            AthRecs statistics
          </p>
          <h1 className="font-display text-3xl font-semibold">Stats</h1>
          <p className="text-sm leading-6 text-slate-600">
            Track data collection, website visitors and Google search performance.
          </p>
        </div>
        {section === "collection" ? (
          <Button
            variant="secondary"
            disabled={report.isFetching}
            onClick={() => void report.refetch()}
          >
            <RefreshCw
              className={`size-4 ${report.isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Refresh counts
          </Button>
        ) : null}
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Statistics sections">
        <Button
          variant={section === "collection" ? "default" : "secondary"}
          aria-current={section === "collection" ? "page" : undefined}
          onClick={() => void navigate({ search: { section: "collection" } })}
        >
          Data collection stats
        </Button>
        <Button
          variant={section === "website" ? "default" : "secondary"}
          aria-current={section === "website" ? "page" : undefined}
          onClick={() => void navigate({ search: { section: "website" } })}
        >
          Website traffic & Google
        </Button>
        <Button
          variant={section === "operations" ? "default" : "secondary"}
          aria-current={section === "operations" ? "page" : undefined}
          onClick={() => void navigate({ search: { section: "operations" } })}
        >
          Collection progress and work to do
        </Button>
      </nav>
      {section === "website" ? (
        <WebsiteStats />
      ) : section === "operations" ? (
        <CollectionOperations />
      ) : (
        <>
          {report.isPending ? (
            <p role="status" className="rounded-xl border bg-white p-6">
              Loading collection counts…
            </p>
          ) : null}
          {report.isError ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900"
            >
              <p>
                Counts could not be refreshed.{" "}
                {data
                  ? "The last successful snapshot is shown below."
                  : "No counts are available; this does not mean the database is empty."}
              </p>
              <Button className="mt-3" variant="secondary" onClick={() => void report.refetch()}>
                Try again
              </Button>
            </div>
          ) : null}

          {data ? (
            <>
              <div
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                aria-label="Whole catalogue totals"
              >
                <Metric
                  label="Unique events"
                  value={data.totals.events}
                  detail="One per retained event record"
                />
                <Metric
                  label="Dated race editions"
                  value={data.totals.editions}
                  detail="One per event, date and distance"
                />
                <Metric
                  label="Athlete profiles"
                  value={data.totals.profiles}
                  detail="All real profiles, public and private"
                />
                <Metric
                  label="Profiles added in 7 days"
                  value={data.totals.added7d}
                  detail="Based on profile creation time"
                />
              </div>
              <p className="text-xs text-slate-600">
                Whole catalogue totals stay unchanged by filters. Snapshot:{" "}
                {new Date(data.generatedAt).toLocaleString("en-GB", { timeZone: "Europe/London" })}{" "}
                (UK time). {number(data.excluded.eventAliases)} known duplicate event aliases and{" "}
                {number(data.excluded.testProfiles)} fictional test profiles excluded.
              </p>

              <section
                aria-labelledby="race-stats-heading"
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <div>
                  <h2 id="race-stats-heading" className="font-display text-2xl font-semibold">
                    Races and fixtures
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    All sports and stored dates, including past, future, TBC and cancelled editions.
                    Select a year to narrow the dated races.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Select
                    label="Race sport"
                    value={filters.sport}
                    values={data.options.sports}
                    onChange={(v) => change("sport", v)}
                  />
                  <Select
                    label="Race distance"
                    value={filters.distance}
                    values={data.options.distances}
                    onChange={(v) => change("distance", v)}
                  />
                  <Select
                    label="Race country"
                    value={filters.raceCountry}
                    values={data.options.raceCountries}
                    onChange={(v) => change("raceCountry", v)}
                  />
                  <Select
                    label="Race county"
                    value={filters.raceCounty}
                    values={data.options.raceCounties}
                    onChange={(v) => change("raceCounty", v)}
                  />
                  <Select
                    label="Race year"
                    value={filters.year === null ? "" : String(filters.year)}
                    values={data.options.years.map(String)}
                    onChange={(v) => change("year", v ? Number(v) : null)}
                  />
                  <Select
                    label="Group races by"
                    value={filters.raceGroup}
                    values={raceGroups}
                    onChange={(v) => change("raceGroup", v as StatsFilters["raceGroup"])}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      sport: "",
                      distance: "",
                      raceCountry: "",
                      raceCounty: "",
                      year: null,
                      raceGroup: "sport",
                    }))
                  }
                >
                  Reset race filters
                </Button>
                <p className="text-sm font-semibold" role="status">
                  Matching totals: {number(data.races.totals.events)} unique events ·{" "}
                  {number(data.races.totals.editions)} dated race editions
                </p>
                <p className="text-xs leading-5 text-slate-600">
                  An event with several distances appears in each relevant distance row. Event
                  counts across those rows overlap; the matching total counts each event once. A
                  listed distance without a dated edition contributes an event but zero editions.
                </p>
                <StatsTable
                  key={`races-${JSON.stringify(filters)}`}
                  title="Race collection breakdown"
                  headers={[...raceColumns, "Events", "Dated editions"]}
                  rows={raceRows}
                  file="race-collection-stats"
                  generatedAt={data.generatedAt}
                  filters={filters}
                />
                <Gaps
                  title="Missing race details in this selection (events)"
                  gaps={data.races.gaps}
                />
              </section>

              <section
                aria-labelledby="profile-stats-heading"
                className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
              >
                <div>
                  <h2 id="profile-stats-heading" className="font-display text-2xl font-semibold">
                    Athlete profiles
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Explore athletes by sport, gender and nationality, or by their recorded
                    location. The matching total counts each athlete profile once.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Select
                    label="Profile sport"
                    value={filters.profileSport}
                    values={data.options.profileSports}
                    onChange={(v) => change("profileSport", v)}
                  />
                  <Select
                    label="Profile gender"
                    value={filters.gender}
                    values={data.options.genders}
                    onChange={(v) => change("gender", v)}
                  />
                  <Select
                    label="Profile nationality"
                    value={filters.nationality}
                    values={data.options.nationalities}
                    onChange={(v) => change("nationality", v)}
                  />
                  <Select
                    label="Profile country"
                    value={filters.profileCountry}
                    values={data.options.profileCountries}
                    onChange={(v) => change("profileCountry", v)}
                  />
                  <Select
                    label="Profile county"
                    value={filters.profileCounty}
                    values={data.options.profileCounties}
                    onChange={(v) => change("profileCounty", v)}
                  />
                  <Select
                    label="Group profiles by"
                    value={filters.profileGroup}
                    values={profileGroups}
                    onChange={(v) => change("profileGroup", v as StatsFilters["profileGroup"])}
                  />
                </div>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      gender: "",
                      profileSport: "",
                      nationality: "",
                      profileCountry: "",
                      profileCounty: "",
                      profileGroup: "gender",
                    }))
                  }
                >
                  Reset profile filters
                </Button>
                <p className="text-sm font-semibold" role="status">
                  Matching totals: {number(data.profiles.totals.profiles)} profiles ·{" "}
                  {number(data.profiles.totals.publicProfiles)} marked public ·{" "}
                  {number(data.profiles.totals.added7d)} added in 7 days
                </p>
                <p className="text-xs leading-5 text-slate-600">
                  Athletes with several recorded sports appear once in each relevant sport row.
                  Those rows overlap; the matching total stays distinct. Sport uses saved results,
                  source histories and declared or evidenced profile sports, including unpublished
                  histories. This classification does not verify a result or an athlete’s identity.
                </p>
                <StatsTable
                  key={`profiles-${JSON.stringify(filters)}`}
                  title="Profile collection breakdown"
                  headers={[...profileColumns, "Profiles", "Marked public", "Added in 7 days"]}
                  rows={profileRows}
                  file="profile-collection-stats"
                  generatedAt={data.generatedAt}
                  filters={filters}
                />
                <Gaps title="Missing profile details in this selection" gaps={data.profiles.gaps} />
                <p className="text-xs leading-5 text-slate-600">
                  Nationality uses the linked athlete’s declaration first, then the profile
                  declaration, recorded source observation or stored nation. Equivalent codes and
                  names share a display label (for example, GBR and British → United Kingdom);
                  original values stay unchanged. Nationality is never inferred from residence or
                  club. Country and county remain location fields. Missing details stay in Unknown.
                  “Marked public” describes stored visibility, not search indexing or account
                  ownership.
                </p>
              </section>
              <p className="text-xs leading-5 text-slate-600">
                These are stored catalogue counts, not a percentage of all races or athletes
                worldwide. Unpublished collection queues are separate. Known aliases are excluded;
                other unresolved duplicate records may still need review.
              </p>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{number(value)}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Select({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: string[] | Record<string, string>;
  onChange: (value: string) => void;
}) {
  const options = Array.isArray(values) ? values.map((v) => [v, v]) : Object.entries(values);
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <select
        aria-label={label}
        className="min-h-11 min-w-0 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {Array.isArray(values) ? <option value="">All</option> : null}
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function Gaps({ title, gaps }: { title: string; gaps: Record<string, number> }) {
  return (
    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950">
      <h3 className="font-semibold">{title}</h3>
      <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
        {Object.entries(gaps).map(([key, count]) => (
          <li key={key}>
            <span className="capitalize">{key}</span>:{" "}
            <strong className="tabular-nums">{number(count)}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatsTable({
  title,
  headers,
  rows,
  file,
  generatedAt,
  filters,
}: {
  title: string;
  headers: string[];
  rows: (string | number | null)[][];
  file: string;
  generatedAt: string;
  filters: StatsFilters;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / 50));
  const currentPage = Math.min(page, pages - 1);
  function download() {
    const csv = statsCsv([
      ["Snapshot", generatedAt],
      ["Filters", JSON.stringify(filters)],
      headers,
      ...rows,
    ]);
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file}-${generatedAt.slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">{number(rows.length)} groups · largest first</p>
        <Button variant="secondary" disabled={!rows.length} onClick={download}>
          <Download className="size-4" aria-hidden="true" />
          Download CSV
        </Button>
      </div>
      <div
        className="max-w-full overflow-x-auto rounded-lg border border-slate-200"
        tabIndex={0}
        role="region"
        aria-label={title}
      >
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col" className="whitespace-nowrap px-4 py-3 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(currentPage * 50, (currentPage + 1) * 50).map((row, index) => (
              <tr key={index} className="border-t border-slate-200 even:bg-slate-50">
                {row.map((value, column) => (
                  <td
                    key={column}
                    className={`px-4 py-3 ${typeof value === "number" ? "tabular-nums" : ""}`}
                  >
                    {typeof value === "number" ? number(value) : (value ?? "Unknown")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? (
          <p className="p-5 text-sm text-slate-600">No records match these filters.</p>
        ) : null}
      </div>
      {pages > 1 ? (
        <div className="flex items-center justify-end gap-3 text-sm">
          <Button
            variant="secondary"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span>
            Page {currentPage + 1} of {pages}
          </span>
          <Button
            variant="secondary"
            disabled={currentPage + 1 >= pages}
            onClick={() => setPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
