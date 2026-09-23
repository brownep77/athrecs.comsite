import { ProfileEditReviewQueue } from "@/components/athletes/ProfileEditReviewQueue";
import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { UpcomingEventsEditor } from "@/components/athletes/UpcomingEvents";
import {
  getStaffAthleteDirectory,
  exportStaffAthleteDirectory,
  selectAllStaffAthleteProfiles,
  publishStaffAthleteProfiles,
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
  const [selectedNumbers, setSelectedNumbers] = useState<Set<string>>(new Set());
  const [confirmPublish, setConfirmPublish] = useState(false);
  const [publishError, setPublishError] = useState("");
  const queryClient = useQueryClient();
  function changeFilters(next: DirectoryFilters) {
    setSelectedNumbers(new Set());
    setMessage("");
    setFilters(next);
  }
  const query = useQuery({
    queryKey: ["staff-athlete-directory", filters],
    queryFn: () => getStaffAthleteDirectory({ data: filters }),
  });
  const selectAll = useMutation({
    mutationFn: () => selectAllStaffAthleteProfiles({ data: filters }),
    onSuccess: (numbers) => {
      setSelectedNumbers(new Set(numbers));
      setMessage(`Selected ${numbers.length} private source profiles across all matching pages.`);
    },
    onError: (error) => setMessage(error.message),
  });
  const publish = useMutation({
    mutationFn: () =>
      publishStaffAthleteProfiles({ data: { athleteNumbers: [...selectedNumbers] } }),
    onSuccess: async (result) => {
      setSelectedNumbers(new Set());
      setSelected(null);
      setConfirmPublish(false);
      setMessage(
        `${result.published} profiles made public · ${result.resultsPublished} race results published.${result.skipped ? ` ${result.skipped} profiles skipped because they are already public, account-managed or no longer available.` : ""}`,
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["staff-athlete-directory"] }),
        queryClient.invalidateQueries({ queryKey: ["staff-athlete-profile"] }),
      ]);
    },
    onError: (error) => setPublishError(error.message),
  });
  const busy = selectAll.isPending || publish.isPending;
  const pageNumbers =
    query.data?.athletes.filter((p) => p.canPublish).map((p) => p.athleteNumber) ?? [];
  const selectedOnPage = pageNumbers.filter((number) => selectedNumbers.has(number)).length;
  function togglePage(checked: boolean) {
    setSelectedNumbers((previous) => {
      const next = new Set(previous);
      for (const number of pageNumbers) {
        if (checked) next.add(number);
        else next.delete(number);
      }
      return next;
    });
  }
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
      <ProfileEditReviewQueue />
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!busy) changeFilters({ ...filters, q: search, page: 1 });
        }}
      >
        <input
          aria-label="Search athlete directory"
          placeholder="Name, AthRecs ID, club or location"
          value={search}
          disabled={busy}
          onChange={(event) => setSearch(event.target.value)}
          className="h-10 min-w-64 flex-1 rounded border border-border bg-surface px-3 text-sm"
        />
        <select
          aria-label="Filter by sport"
          value={filters.sport}
          disabled={busy}
          onChange={(e) => changeFilters({ ...filters, sport: e.target.value, page: 1 })}
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
          disabled={busy}
          onChange={(e) =>
            changeFilters({
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
        <Button type="submit" variant="secondary" disabled={busy}>
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
          <section
            aria-label="Publish selected athletes"
            className="space-y-2 rounded-lg border border-border bg-surface p-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                disabled={busy || query.isFetching || !pageNumbers.length}
                onClick={() => togglePage(true)}
              >
                Select this page
              </Button>
              <Button
                variant="secondary"
                disabled={busy || query.isFetching || !query.data.publishableTotal}
                onClick={() => {
                  setMessage("");
                  selectAll.mutate();
                }}
              >
                {selectAll.isPending
                  ? "Selecting…"
                  : `Select all matching (${query.data.publishableTotal})`}
              </Button>
              <Button
                variant="ghost"
                disabled={busy || !selectedNumbers.size}
                onClick={() => setSelectedNumbers(new Set())}
              >
                Clear selection
              </Button>
              <span role="status" className="text-sm">
                {selectedNumbers.size} selected
              </span>
              <Button
                disabled={busy || query.isFetching || !selectedNumbers.size}
                onClick={() => {
                  setPublishError("");
                  setConfirmPublish(true);
                }}
              >
                {publish.isPending ? "Publishing…" : `Make public (${selectedNumbers.size})`}
              </Button>
            </div>
            <p className="text-sm text-muted">
              Select private source profiles to publish with their imported race results and source
              histories. Already public profiles and athlete-managed accounts are excluded. Changing
              filters clears your selection.
            </p>
          </section>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-elevated text-xs text-subtle">
                <tr>
                  <th className="px-3 py-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-accent"
                      aria-label="Select all private source profiles on this page"
                      checked={pageNumbers.length > 0 && selectedOnPage === pageNumbers.length}
                      ref={(element) => {
                        if (element)
                          element.indeterminate =
                            selectedOnPage > 0 && selectedOnPage < pageNumbers.length;
                      }}
                      disabled={busy || query.isFetching || !pageNumbers.length}
                      onChange={(event) => togglePage(event.target.checked)}
                    />
                  </th>
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
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        className="size-4 accent-accent"
                        aria-label={`Select ${p.name} (${p.athrecsId})`}
                        checked={selectedNumbers.has(p.athleteNumber)}
                        disabled={busy || query.isFetching || !p.canPublish}
                        onChange={(event) => {
                          const checked = event.target.checked;
                          setSelectedNumbers((previous) => {
                            const next = new Set(previous);
                            if (checked === true) next.add(p.athleteNumber);
                            else next.delete(p.athleteNumber);
                            return next;
                          });
                        }}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">{p.athrecsId}</td>
                    <td className="px-3 py-2 font-medium">
                      <Link
                        to="/admin/athletes/$athleteId"
                        params={{ athleteId: p.athrecsId }}
                        className="text-accent hover:underline"
                      >
                        {p.name}
                      </Link>
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
                      <Link
                        to="/admin/athletes/$athleteId"
                        params={{ athleteId: p.athrecsId }}
                        aria-label={`View profile for ${p.name}`}
                        className="mr-3 inline-block whitespace-nowrap text-xs text-accent hover:underline"
                      >
                        View profile
                      </Link>
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
              disabled={busy || query.isFetching || query.data.page <= 1}
              onClick={() => setFilters({ ...filters, page: query.data!.page - 1 })}
              className="disabled:opacity-40"
            >
              Previous
            </button>
            <span>
              {query.data.page} / {query.data.pages}
            </span>
            <button
              disabled={busy || query.isFetching || query.data.page >= query.data.pages}
              onClick={() => setFilters({ ...filters, page: query.data!.page + 1 })}
              className="disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      ) : null}
      <AlertDialog
        open={confirmPublish}
        onOpenChange={(open) => {
          if (!publish.isPending) setConfirmPublish(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Make {selectedNumbers.size} athlete profiles public?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The selected profiles, imported race results and captured source histories will be
              visible on AthRecs. Only the selected profiles will be published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {publishError ? (
            <p role="alert" className="text-sm">
              {publishError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={publish.isPending}>Cancel</AlertDialogCancel>
            <Button
              disabled={publish.isPending}
              onClick={() => {
                setPublishError("");
                publish.mutate();
              }}
            >
              {publish.isPending ? "Publishing…" : "Confirm make public"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
          <Link
            to="/admin/athletes/$athleteId"
            params={{ athleteId: selected.athrecsId }}
            className="mr-4 inline-block text-sm text-accent hover:underline"
          >
            View profile
          </Link>
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
