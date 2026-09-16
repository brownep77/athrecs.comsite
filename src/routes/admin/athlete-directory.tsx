import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { UpcomingEventsEditor } from "@/components/athletes/UpcomingEvents";
import {
  getStaffAthleteDirectory,
  exportStaffAthleteDirectory,
  type DirectoryFilters,
  type StaffAthlete,
} from "@/lib/athrecs/staff-athlete-directory-api";

export const Route = createFileRoute("/admin/athlete-directory")({
  head: () => ({
    meta: [
      { title: "Athlete directory — ATHRECS Staff" },
      { name: "robots", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: AthleteDirectory,
});
function AthleteDirectory() {
  const [filters, setFilters] = useState<DirectoryFilters>({
    q: "",
    sport: "",
    visibility: "",
    page: 1,
  });
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StaffAthlete | null>(null);
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["staff-athlete-directory", filters],
    queryFn: () => getStaffAthleteDirectory({ data: filters }),
  });
  const download = useMutation({
    mutationFn: () => exportStaffAthleteDirectory({ data: filters }),
    onSuccess: (data) => {
      const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
      const url = URL.createObjectURL(
        new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.filename;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`Exported ${data.count} athletes to Excel.`);
    },
    onError: (error) => setMessage(error.message),
  });
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            Athlete storage
          </p>
          <h1 className="font-display text-3xl font-semibold">Athlete directory</h1>
          <p className="mt-2 text-sm text-muted">
            All athlete profiles, one permanent AthRecs ID across every sport. Linked source records
            are grouped under their account.
          </p>
        </div>
        <Button
          disabled={download.isPending || query.isLoading || query.isError}
          onClick={() => {
            setMessage("");
            download.mutate();
          }}
        >
          {download.isPending ? "Preparing Excel…" : "Export to Excel"}
        </Button>
      </div>
      <p className="text-xs text-muted">
        Staff access only. The Excel export includes all matching athletes, their profile details
        and a separate Sports sheet. It contains private account data.
      </p>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setFilters({ ...filters, q: search, page: 1 });
        }}
      >
        <input
          aria-label="Search athlete directory"
          placeholder="Name, AthRecs ID, club or location"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 min-w-64 flex-1 rounded border border-border bg-surface px-3 text-sm"
        />
        <select
          aria-label="Filter by sport"
          value={filters.sport}
          onChange={(e) => setFilters({ ...filters, sport: e.target.value, page: 1 })}
          className="h-10 rounded border border-border bg-surface px-2 text-sm"
        >
          <option value="">All sports</option>
          {query.data?.sports.map((sport) => (
            <option key={sport}>{sport}</option>
          ))}
        </select>
        <select
          aria-label="Filter by visibility"
          value={filters.visibility}
          onChange={(e) =>
            setFilters({
              ...filters,
              visibility: e.target.value as DirectoryFilters["visibility"],
              page: 1,
            })
          }
          className="h-10 rounded border border-border bg-surface px-2 text-sm"
        >
          <option value="">All visibility</option>
          <option>Public</option>
          <option>Private</option>
        </select>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
      {query.isLoading ? (
        <p>Loading athlete storage…</p>
      ) : query.isError ? (
        <p role="alert">
          Athletes could not load.{" "}
          <button className="text-accent" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : query.data ? (
        <>
          <p className="text-sm text-muted">
            {query.data.total} matching athletes · {query.data.totalStored} stored
          </p>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-elevated text-xs text-subtle">
                <tr>
                  {[
                    "AthRecs ID",
                    "Athlete",
                    "Sports",
                    "Club / team",
                    "Location",
                    "Visibility",
                    "Results",
                    "Manage",
                  ].map((label) => (
                    <th key={label} className="px-3 py-2">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {query.data.athletes.map((p) => (
                  <tr key={p.athleteNumber}>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{p.athrecsId}</td>
                    <td className="px-3 py-2 font-medium">
                      {p.name}
                      <span className="block text-[10px] font-normal text-subtle">
                        {p.registered ? "Registered account" : "Source profile"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.sports.join(" · ") || "Not specified"}</td>
                    <td className="px-3 py-2 text-xs">{p.club || "—"}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2 text-xs">
                        {p.city}
                        <CountryFlag country={p.country} />
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs">{p.visibility}</td>
                    <td className="px-3 py-2 tabular-nums">{p.resultCount}</td>
                    <td className="px-3 py-2">
                      <button
                        className="text-xs text-accent hover:underline"
                        onClick={() => setSelected(p)}
                      >
                        Open record
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!query.data.total ? <p>No athletes match these filters.</p> : null}
          <div className="flex justify-end gap-4 text-sm">
            <button
              disabled={query.data.page <= 1}
              onClick={() => setFilters({ ...filters, page: query.data!.page - 1 })}
              className="disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              {query.data.page} / {query.data.pages}
            </span>
            <button
              disabled={query.data.page >= query.data.pages}
              onClick={() => setFilters({ ...filters, page: query.data!.page + 1 })}
              className="disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      ) : null}
      {selected ? (
        <section className="space-y-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex justify-between">
            <h2 className="font-display text-xl font-semibold">
              {selected.name} · {selected.athrecsId}
            </h2>
            <button className="text-sm text-accent" onClick={() => setSelected(null)}>
              Close record
            </button>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            {[
              ["Nationality", selected.nationality || selected.details.nationality],
              ["Birth country", selected.details.birthCountry],
              ["Birthday display", selected.details.birthdayVisibility],
              ["Running age category", selected.details.runningAgeCategory],
              ["Previous club", selected.details.previousClub],
              ["Coach", selected.details.coach],
              ["Manager", selected.details.manager],
              ["Open to contact", selected.details.acceptContact ? "Yes" : "No"],
              ["Profile visibility", selected.visibility],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-subtle">{label}</dt>
                <dd>{value || "Not supplied"}</dd>
              </div>
            ))}
          </dl>
          {selected.profilePath ? (
            <a
              href={`https://www.athrecs.com${selected.profilePath}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-accent"
            >
              View public profile ↗
            </a>
          ) : null}
          {selected.sources.map((source) => (
            <div key={source.id} className="space-y-2 border-t border-border pt-3">
              <p className="text-xs text-subtle">Source profile: {source.slug}</p>
              <UpcomingEventsEditor athleteId={source.id} />
            </div>
          ))}
          {selected.registered ? (
            <p className="text-xs text-muted">
              Account details and account-owned fixtures are managed by the athlete in their
              account.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
