import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  getClubScans,
  startClubScan,
  stepClubScan,
  controlClubScan,
  reviewClubResults,
  publishClubResults,
  recheckClubResults,
  findClubAthletes,
  getClubReviewHistory,
} from "@/lib/club-scanner/api";
import type { Candidate, Filters, ReviewInput } from "@/lib/club-scanner/core";
const inputClass = "rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg";
const statuses = [
  "all",
  "proposed",
  "held",
  "approved",
  "published",
  "dismissed",
  "duplicate",
] as const;
export function ClubScanner() {
  const today = new Date().toISOString().slice(0, 10),
    client = useQueryClient();
  const [filters, setFilters] = useState<Filters>({ status: "all", q: "", page: 1 });
  const [clubId, setClubId] = useState(""),
    [aliases, setAliases] = useState(""),
    [from, setFrom] = useState(`${Number(today.slice(0, 4)) - 5}${today.slice(4)}`),
    [to, setTo] = useState(today),
    [urls, setUrls] = useState(""),
    [discover, setDiscover] = useState(true);
  const [selected, setSelected] = useState<string[]>([]),
    [message, setMessage] = useState(""),
    [open, setOpen] = useState<Candidate | null>(null),
    [confirm, setConfirm] = useState(false);
  const [reason, setReason] = useState(""),
    [evidence, setEvidence] = useState(""),
    [reviewed, setReviewed] = useState(false),
    [action, setAction] = useState<ReviewInput["action"]>("suggested"),
    [athleteId, setAthleteId] = useState(""),
    [athleteQuery, setAthleteQuery] = useState("");
  const query = useQuery({
    queryKey: ["club-scans", filters],
    queryFn: () => getClubScans({ data: filters }),
    refetchInterval: (q) =>
      q.state.data?.runs.some((r) => r.status === "running") ? 15000 : false,
  });
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["club-scans"] });
    await client.invalidateQueries({ queryKey: ["club-review-history"] });
  };
  const fail = (e: Error) => setMessage(e.message);
  const start = useMutation({
    mutationFn: () =>
      startClubScan({
        data: {
          clubId: Number(clubId),
          aliases: aliases
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          dateFrom: from,
          dateTo: to,
          discover,
          urls: urls
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }),
    onSuccess: async (r) => {
      setFilters({ status: "all", q: "", page: 1, runId: r.id });
      setSelected([]);
      setMessage("Scan queued. Progress is saved; you can leave and return.");
      await refresh();
    },
    onError: fail,
  });
  const step = useMutation({
    mutationFn: () => stepClubScan({ data: { id: query.data!.runId! } }),
    onSuccess: async () => {
      setMessage("Processed the next available source.");
      await refresh();
    },
    onError: fail,
  });
  const control = useMutation({
    mutationFn: (action: "pause" | "resume" | "retry" | "cancel") =>
      controlClubScan({ data: { id: query.data!.runId!, action } }),
    onSuccess: refresh,
    onError: fail,
  });
  const review = useMutation({
    mutationFn: () =>
      reviewClubResults({
        data: {
          ids: selected,
          action,
          reason,
          evidenceUrl: evidence || undefined,
          sourcesReviewed: reviewed,
          ...(athleteId ? { athleteId: Number(athleteId) } : {}),
        },
      }),
    onSuccess: async (r) => {
      setMessage(`${r.reviewed} review decisions saved.`);
      setSelected([]);
      setOpen(null);
      await refresh();
    },
    onError: fail,
  });
  const publish = useMutation({
    mutationFn: () => publishClubResults({ data: { ids: selected } }),
    onSuccess: async (r) => {
      setMessage(
        `${r.published} source results published · ${r.newProfiles} profiles created · ${r.duplicates} duplicates skipped · ${r.held} held for comparison.`,
      );
      setConfirm(false);
      setSelected([]);
      setOpen(null);
      await refresh();
    },
    onError: (e) => {
      setConfirm(false);
      fail(e);
    },
  });
  const recheck = useMutation({
    mutationFn: () => recheckClubResults({ data: { ids: selected } }),
    onSuccess: async (r) => {
      setMessage(`${r.checked} sources rechecked. Previous approvals cleared for a fresh review.`);
      setSelected([]);
      setOpen(null);
      await refresh();
    },
    onError: fail,
  });
  const search = useQuery({
    queryKey: ["club-athlete-search", athleteQuery],
    queryFn: () => findClubAthletes({ data: { q: athleteQuery } }),
    enabled: athleteQuery.trim().length >= 2,
  });
  const history = useQuery({
    queryKey: ["club-review-history", open?.id],
    queryFn: () => getClubReviewHistory({ data: { id: open!.id } }),
    enabled: !!open,
  });
  const busy =
    start.isPending ||
    step.isPending ||
    control.isPending ||
    review.isPending ||
    publish.isPending ||
    recheck.isPending;
  const current = query.data?.runs.find((r) => r.id === query.data?.runId),
    rows = query.data?.candidates ?? [];
  const eligible =
    selected.length > 0 &&
    selected.length <= 10 &&
    selected.every((id) => rows.some((r) => r.id === id && r.status === "approved"));
  function change(next: Filters) {
    setFilters(next);
    setSelected([]);
    setOpen(null);
  }
  function inspect(c: Candidate) {
    setOpen(c);
    setSelected([c.id]);
    setReason(c.decision?.reason ?? "");
    setEvidence(c.decision?.evidenceUrl ?? c.data.url);
    setReviewed(false);
    setAction(c.status === "held" ? "hold" : "suggested");
    setAthleteId(c.decision?.athleteId?.toString() ?? "");
  }
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-accent">Athlete collection</p>
        <h1 className="font-display text-3xl font-semibold">Club athlete scanner</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">
          Find club-labelled race results, review athlete identities and publish source histories.
          Scans save proposals; profiles are created when you publish approved results.
        </p>
      </header>
      <form
        className="grid gap-4 rounded-xl border border-border bg-surface p-5 md:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          start.mutate();
        }}
      >
        <label className="grid gap-1 text-sm">
          Running club
          <select
            required
            className={inputClass}
            value={clubId}
            onChange={(e) => {
              setClubId(e.target.value);
              const club = query.data?.clubs.find((c) => c.id === Number(e.target.value));
              setAliases(club?.name ?? "");
            }}
          >
            <option value="">Choose a club</option>
            {query.data?.clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Exact club names in results
          <textarea
            className={inputClass}
            value={aliases}
            onChange={(e) => setAliases(e.target.value)}
            rows={2}
            placeholder={"Wymondham AC\nWymondham Athletics Club"}
          />
          <span className="text-xs text-muted">
            One name per line. Add abbreviations only when they identify this club.
          </span>
        </label>
        <label className="grid gap-1 text-sm">
          From
          <input
            type="date"
            required
            className={inputClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          To
          <input
            type="date"
            required
            max={today}
            className={inputClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={discover}
            onChange={(e) => setDiscover(e.target.checked)}
          />
          Scan the Total Race Timing results archive
        </label>
        <label className="grid gap-1 text-sm">
          Additional result links
          <textarea
            className={inputClass}
            rows={2}
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder="https://… (one per line)"
          />
          <span className="text-xs text-muted">
            TRT pages are scanned. Other providers and PDFs are saved as manual-review links.
          </span>
        </label>
        <div className="md:col-span-2">
          <Button disabled={busy || !clubId}>
            {start.isPending ? "Starting…" : "Start club scan"}
          </Button>
          <span className="ml-3 text-xs text-muted">
            Partial provider coverage · no AI research charges
          </span>
        </div>
      </form>
      {message && (
        <p role="status" className="rounded-lg border border-border bg-surface p-3 text-sm">
          {message}
        </p>
      )}
      {query.isError && <p role="alert">Unable to load scans: {query.error.message}</p>}
      {query.isLoading && <p>Loading club scans…</p>}
      <section className="space-y-4" aria-label="Scan progress">
        <div className="flex flex-wrap items-center gap-2">
          <label>
            Saved scan{" "}
            <select
              className={inputClass}
              value={query.data?.runId ?? ""}
              onChange={(e) => change({ ...filters, runId: e.target.value, page: 1 })}
            >
              <option value="" disabled>
                Select a scan
              </option>
              {query.data?.runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.club_name} · {r.scope.dateFrom}–{r.scope.dateTo} · {r.status}
                </option>
              ))}
            </select>
          </label>
          {current && (
            <>
              <Button
                variant="secondary"
                disabled={busy || current.status !== "running"}
                onClick={() => step.mutate()}
              >
                {step.isPending ? "Scanning source…" : "Process next source"}
              </Button>
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => control.mutate(current.status === "running" ? "pause" : "resume")}
              >
                {current.status === "running" ? "Pause" : "Resume"}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => control.mutate("retry")}>
                Retry failed sources
              </Button>
              <Button
                variant="ghost"
                disabled={busy || current.status === "cancelled"}
                onClick={() => control.mutate("cancel")}
              >
                Cancel scan
              </Button>
            </>
          )}
        </div>
        {current && (
          <p className="text-sm text-muted">
            {query.data?.jobs.map((j) => `${j.n} sources ${j.status}`).join(" · ")}. Background
            processing runs one source at a time when the production worker is available. “Process
            next source” also works on demand.
          </p>
        )}
        {!!query.data?.problems.length && (
          <details>
            <summary className="cursor-pointer text-sm font-medium">
              Sources needing attention ({query.data.problems.length})
            </summary>
            <ul className="mt-2 space-y-2 text-sm">
              {query.data.problems.map((p) => (
                <li key={p.id}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline"
                  >
                    Open source
                  </a>{" "}
                  — {p.error}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
      <section aria-label="Results review" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Results review</h2>
          <p className="text-sm text-muted">
            {query.data?.counts.map((c) => `${c.n} ${c.status}`).join(" · ")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label>
            Status{" "}
            <select
              className={inputClass}
              value={filters.status}
              onChange={(e) =>
                change({ ...filters, status: e.target.value as Filters["status"], page: 1 })
              }
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <input
            aria-label="Search results review"
            className={inputClass}
            value={filters.q}
            onChange={(e) => change({ ...filters, q: e.target.value, page: 1 })}
            placeholder="Athlete or race"
          />
          <Button
            variant="secondary"
            disabled={busy || !rows.length}
            onClick={() => {
              setOpen(null);
              setSelected(
                rows.filter((c) => !["published", "duplicate"].includes(c.status)).map((c) => c.id),
              );
              setReason("");
              setEvidence("");
              setReviewed(false);
              setAction("suggested");
              setAthleteId("");
            }}
          >
            Select reviewable rows on this page
          </Button>
          <Button
            variant="secondary"
            disabled={busy || !rows.some((c) => c.status === "approved")}
            onClick={() => {
              setOpen(null);
              setSelected(
                rows
                  .filter((c) => c.status === "approved")
                  .slice(0, 10)
                  .map((c) => c.id),
              );
            }}
          >
            Select up to 10 approved
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSelected([]);
              setOpen(null);
            }}
          >
            Clear selection
          </Button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface">
              <tr>
                {["Select", "Athlete", "Race / date", "Source time", "Decision", "Review"].map(
                  (t) => (
                    <th className="p-3" key={t}>
                      {t}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className={`border-t border-border ${c.status === "held" ? "bg-amber-500/5" : ""}`}
                >
                  <td className="p-3">
                    <input
                      aria-label={`Select ${c.data.name} ${c.data.performance.meeting} ${c.data.performance.date}`}
                      type="checkbox"
                      disabled={busy || ["published", "duplicate"].includes(c.status)}
                      checked={selected.includes(c.id)}
                      onChange={(e) => {
                        setOpen(null);
                        setSelected((s) =>
                          e.target.checked ? [...s, c.id] : s.filter((id) => id !== c.id),
                        );
                      }}
                    />
                  </td>
                  <td className="p-3 font-medium">
                    {c.data.name}
                    <div className="text-xs font-normal text-muted">
                      {c.data.gender} · {c.data.club} · {c.data.performance.ageGroup}
                    </div>
                  </td>
                  <td className="p-3">
                    {c.data.performance.meeting}
                    <div className="text-xs text-muted">
                      {c.data.performance.date || "Date unresolved"} ·{" "}
                      {c.data.performance.discipline}
                    </div>
                  </td>
                  <td className="p-3 tabular-nums">
                    {c.data.performance.performance || "Unresolved"}
                    <div className="text-xs text-muted">
                      {c.data.raw["Chip Time"]
                        ? "Chip time"
                        : c.data.raw["Gun Time"] && !c.data.raw.Time
                          ? "Gun time"
                          : "Source time"}
                    </div>
                  </td>
                  <td className="p-3">
                    {c.status}
                    <div className="max-w-xs text-xs text-muted">
                      {c.issues.join("; ") ||
                        (c.matches.length ? "Existing profile proposed" : "New profile proposed")}
                    </div>
                  </td>
                  <td className="p-3">
                    <Button variant="secondary" disabled={busy} onClick={() => inspect(c)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <p className="p-5 text-sm text-muted">
              No results in this view. Start a scan, process a source, or change the filter.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={filters.page === 1 || busy}
            onClick={() => change({ ...filters, page: filters.page - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {filters.page} · {query.data?.total ?? 0} results
          </span>
          <Button
            variant="secondary"
            disabled={filters.page * 50 >= (query.data?.total ?? 0) || busy}
            onClick={() => change({ ...filters, page: filters.page + 1 })}
          >
            Next
          </Button>
        </div>
      </section>
      {open && (
        <section
          className="space-y-3 rounded-xl border border-border bg-surface p-5"
          aria-label="Source comparison"
        >
          <h2 className="text-lg font-semibold">{open.data.name} — source comparison</h2>
          <p className="text-sm">
            <a
              className="text-accent underline"
              href={open.data.url}
              target="_blank"
              rel="noreferrer"
            >
              Open original result table
            </a>{" "}
            · Bib {open.data.bib} · Captured {open.data.checkedAt.slice(0, 10)}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(open.data.raw).map(([k, v]) => (
                    <tr key={k} className="border-b border-border">
                      <th className="py-1 text-left">{k || "Unlabelled"}</th>
                      <td>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="font-medium">Possible profiles</h3>
              {open.matches.length ? (
                open.matches.map((m) => (
                  <p className="my-2 text-sm" key={m.id}>
                    {m.name} · {m.club || "Club unknown"} · {m.gender}{" "}
                    <a
                      href={`/admin/athletes/ATH-${String(m.number).padStart(6, "0")}`}
                      className="text-accent underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Inspect
                    </a>
                    {m.managed || m.visibility !== "public"
                      ? " · separate publication review required"
                      : ""}
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted">
                  No automatic match found. Check name variants before approving a new profile.
                </p>
              )}
              <p className="mt-3 text-sm text-amber-700">{open.issues.join("; ")}</p>
            </div>
          </div>
          <details>
            <summary>Review history</summary>
            {history.data?.map((r, i) => (
              <p className="my-2 text-sm" key={i}>
                {String(r.created_at)} · {String(r.actor)} · {String(r.action)}: {String(r.reason)}
              </p>
            ))}
          </details>
        </section>
      )}
      {!!selected.length && (
        <section
          className="space-y-3 rounded-xl border border-accent/30 bg-surface p-5"
          aria-label="Review decisions"
        >
          <h2 className="text-lg font-semibold">
            Decision for {selected.length} selected result{selected.length === 1 ? "" : "s"}
          </h2>
          <p className="text-sm text-muted">
            Approval records your identity decision. Publishing rechecks source values and
            duplicates, then adds a source history. Source histories stay separate from canonical
            race results and PBs.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Decision
              <select
                className={inputClass}
                value={action}
                onChange={(e) => setAction(e.target.value as ReviewInput["action"])}
              >
                <option value="suggested">Approve unambiguous suggestions</option>
                <option value="create">Approve a distinct new athlete</option>
                <option value="link">Link to an existing athlete</option>
                <option value="hold">Hold for more evidence</option>
                <option value="dismiss">Dismiss</option>
                <option value="reopen">Reopen review</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Supporting evidence URL
              <input
                type="url"
                className={inputClass}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="https://…"
              />
            </label>
            {action === "link" && (
              <>
                <label className="grid gap-1 text-sm">
                  Find athlete
                  <input
                    className={inputClass}
                    value={athleteQuery}
                    onChange={(e) => setAthleteQuery(e.target.value)}
                    placeholder="Search full or variant name"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  Existing profile
                  <select
                    className={inputClass}
                    value={athleteId}
                    onChange={(e) => setAthleteId(e.target.value)}
                  >
                    <option value="">Choose verified identity</option>
                    {search.data?.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                        disabled={m.managed || m.visibility !== "public"}
                      >
                        {m.name} · {m.club || "Club unknown"} · {m.gender}
                        {m.managed || m.visibility !== "public" ? " (separate review)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
            <label className="grid gap-1 text-sm md:col-span-2">
              Identity evidence or reason
              <textarea
                className={inputClass}
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What distinguishes this athlete? Record name, club, category or bib evidence and any uncertainty."
              />
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
            />
            I checked every selected source row, the athlete identity and proposed grouping,
            including name variants and existing profiles.
          </label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || reason.trim().length < 12} onClick={() => review.mutate()}>
              {review.isPending ? "Saving…" : "Save review decision"}
            </Button>
            <Button
              variant="secondary"
              disabled={busy || selected.length > 10}
              onClick={() => recheck.mutate()}
            >
              Recheck selected sources (up to 10)
            </Button>
            <Button disabled={busy || !eligible} onClick={() => setConfirm(true)}>
              {publish.isPending ? "Publishing…" : `Publish approved (${selected.length})`}
            </Button>
          </div>
          <p className="text-xs text-muted">
            Publish up to 10 approved results together. Held source-format errors cannot be
            overridden by an identity decision.
          </p>
        </section>
      )}
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish {selected.length} reviewed results?</AlertDialogTitle>
            <AlertDialogDescription>
              This creates approved new athlete profiles and adds source histories to approved
              existing profiles. The source rows and duplicate checks run again before any
              publication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <Button disabled={busy} onClick={() => publish.mutate()}>
              Confirm publication
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
