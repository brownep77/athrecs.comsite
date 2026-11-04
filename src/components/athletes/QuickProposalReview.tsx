import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as api from "@/lib/athlete-workspace/api";
import { httpsUrl, identityName, resultIssues, type Batch } from "@/lib/athlete-workspace/core";

const button =
  "min-h-11 rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed";
const input = "min-h-11 w-full min-w-0 rounded-lg border border-slate-300 bg-white p-2 text-sm";
const factors = [
  ["name", "Full name / confirmed previous name"],
  ["athleteId", "Official athlete ID"],
  ["age", "Age fits the race date and category rules"],
  ["club", "Club at the time of the race"],
  ["nationality", "Explicitly recorded nationality"],
  ["residence", "Town / city of residence at the time"],
  ["owner", "Confirmation from the linked athlete"],
] as const;
type Factor = (typeof factors)[number][0];
const declineReasons = [
  "This result belongs to a different athlete.",
  "The identity evidence conflicts with this athlete.",
  "This proposal duplicates a result already recorded.",
  "The source does not support this proposed result.",
];

/** Staff decisions use the existing revision-bound, audited publication endpoint. */
export function QuickProposalReview({
  batch,
  targetId,
  done,
}: {
  batch: Batch;
  targetId: number | null;
  done: () => Promise<void>;
}) {
  const [filter, setFilter] = useState<"pending" | "later" | "all">("pending");
  const [search, setSearch] = useState("");
  const [later, setLater] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [mode, setMode] = useState<"publish" | "reject" | null>(null);
  const [checkedFactors, setFactors] = useState<Factor[]>([]);
  const [note, setNote] = useState("");
  const [against, setAgainst] = useState("");
  const [resolution, setResolution] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState(declineReasons[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [reviewVersion, setReviewVersion] = useState("");
  const saving = useRef(false);
  const receipt = useRef<{ signature: string; requestId: string } | null>(null);
  const decision = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    heading.current?.focus({ preventScroll: true });
  }, [batch.id]);
  const profile = useQuery({
    queryKey: ["athlete-workspace", true, targetId],
    queryFn: () => api.getStaffWorkspace({ data: { athleteId: targetId } }),
    enabled: targetId !== null,
    retry: false,
  });
  const target = profile.data?.profile;
  const pending = batch.entries.filter((r) => r.state === "pending");
  const chosen = batch.entries.filter((r) => selected.includes(r.index) && r.state === "pending");
  const visible = batch.entries.filter(
    (r) =>
      (filter === "all" ||
        (r.state === "pending" &&
          (filter === "later" ? later.includes(r.index) : !later.includes(r.index)))) &&
      `${r.race} ${r.date} ${r.distance} ${r.bib} ${r.time}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const generated = checkedFactors.length
    ? `Identity evidence checked: ${factors
        .filter(([id]) => checkedFactors.includes(id))
        .map(([, label]) => label)
        .join("; ")}.`
    : "";
  const evidence = [generated, note.trim()].filter(Boolean).join("\n");
  const differentSourceName = Boolean(
    target &&
    chosen.some(
      (r) => r.athleteName && identityName(r.athleteName) !== identityName(target.display_name),
    ),
  );
  const currentVersion = `${batch.id}:${batch.revision}:${targetId}`;
  const sameReview = reviewVersion === currentVersion;
  const corroborated =
    checkedFactors.includes("athleteId") ||
    checkedFactors.includes("owner") ||
    (checkedFactors.includes("name") &&
      checkedFactors.some((f) => !["name", "athleteId", "owner"].includes(f))) ||
    note.trim().length >= 12;
  const canPublish = Boolean(
    targetId &&
    target &&
    target.id === targetId &&
    !profile.isFetching &&
    !profile.isError &&
    chosen.length &&
    chosen.length === selected.length &&
    !chosen.some((r) => r.response === "no" || resultIssues(r).length) &&
    sameReview &&
    corroborated &&
    evidence.trim().length >= 12 &&
    confirmed &&
    (!against.trim() || resolution.trim()) &&
    (!differentSourceName || resolution.trim().length >= 12),
  );

  function open(action: "publish" | "reject", indexes: number[]) {
    setSelected(indexes);
    setMode(action);
    setReviewVersion(currentVersion);
    setFactors([]);
    setNote("");
    setAgainst("");
    setResolution("");
    setConfirmed(false);
    receipt.current = null;
    setFailed(false);
    setMessage("");
    requestAnimationFrame(() =>
      decision.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
    );
  }
  async function save() {
    if (
      !targetId ||
      !mode ||
      saving.current ||
      !chosen.length ||
      !sameReview ||
      (mode === "publish" && !canPublish)
    )
      return;
    const payload = {
      batchId: batch.id,
      revision: batch.revision,
      athleteId: targetId,
      indexes: chosen.map((r) => r.index),
      action: mode,
      evidenceFor: mode === "publish" ? evidence : reason,
      evidenceAgainst:
        mode === "publish"
          ? [
              differentSourceName
                ? "The source athlete name differs from the selected profile name."
                : "",
              against,
            ]
              .filter(Boolean)
              .join("\n")
          : "",
      resolution: mode === "publish" ? resolution : "",
      sourceChecked: mode === "publish" && confirmed,
      identityChecked: mode === "publish" && confirmed,
      rightsConfirmed: mode === "publish" && confirmed,
    };
    const signature = JSON.stringify(payload);
    if (receipt.current?.signature !== signature)
      receipt.current = { signature, requestId: crypto.randomUUID() };
    saving.current = true;
    setBusy(true);
    setFailed(false);
    setMessage("");
    try {
      const outcome = await api.reviewStaffPastedResults({
        data: { ...payload, requestId: receipt.current.requestId },
      });
      setMessage(
        mode === "reject"
          ? `${chosen.length} proposal(s) declined.`
          : `${outcome.added} results added; ${outcome.duplicates} duplicates retained.`,
      );
      setMode(null);
      setSelected([]);
      setConfirmed(false);
      receipt.current = null;
      try {
        await done();
      } catch {
        setMessage("Decision saved. Refresh the list before making another decision.");
      }
    } catch (error) {
      setFailed(true);
      setMessage(
        `${error instanceof Error ? error.message : "Decision was not confirmed."} Your choices are retained; retry uses the same request reference.`,
      );
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }
  return (
    <section
      aria-label="Quick result review"
      className="min-w-0 space-y-4 rounded-xl border border-cyan-200 bg-white p-4 sm:p-5"
    >
      <header>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-4 text-xl font-semibold">
          Quick result review
        </h2>
        <p className="text-sm text-slate-600">
          {pending.length} pending · {batch.entries.filter((r) => r.state !== "pending").length}{" "}
          decided · {later.filter((i) => pending.some((r) => r.index === i)).length} set aside in
          this session
        </p>
        <p className="text-sm">
          Target:{" "}
          <strong>
            {target?.display_name ??
              (targetId ? `Athlete #${targetId}` : "Choose an athlete above")}
          </strong>{" "}
          {targetId ? `· #${targetId}` : ""}
        </p>
        {target && (
          <p className="text-xs text-slate-600">
            Recorded club: {target.source_club_name || "Not supplied"} · Residence:{" "}
            {[target.city, target.county, target.country].filter(Boolean).join(", ") ||
              "Not supplied"}{" "}
            · Visibility: {target.profile_visibility}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-600">
          A matching name alone does not establish identity. Check age at the race, historical
          clubs, nationality and residence separately. Missing details are unknown. A
          source-verified time does not prove who ran it.
        </p>
        {profile.isError && (
          <p role="alert">
            Could not load the target profile.{" "}
            <button className="underline" onClick={() => void profile.refetch()}>
              Retry profile
            </button>
          </p>
        )}
      </header>
      <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-0 lg:z-10">
        <div className="flex flex-wrap gap-2" aria-label="Proposal filters">
          {(
            [
              ["pending", "To review"],
              ["later", "Later"],
              ["all", "All outcomes"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              disabled={busy}
              aria-pressed={filter === id}
              className={`${button} ${filter === id ? "border-cyan-800 bg-cyan-50" : "border-slate-300"}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
          <label className="min-w-0 flex-1">
            <span className="sr-only">Filter proposed races</span>
            <input
              className={input}
              placeholder="Find race, date, bib or time…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>{selected.length} selected</span>
          <button
            className={`${button} border-slate-300`}
            disabled={busy || !visible.some((r) => r.state === "pending")}
            onClick={() => {
              setSelected(visible.filter((r) => r.state === "pending").map((r) => r.index));
              setMode(null);
              setConfirmed(false);
            }}
          >
            Select visible pending
          </button>
          <button
            className={`${button} border-slate-300`}
            disabled={busy || !selected.length}
            onClick={() => open("publish", selected)}
          >
            Review selected for approval
          </button>
          <button
            className={`${button} border-slate-300`}
            disabled={busy || !selected.length}
            onClick={() => open("reject", selected)}
          >
            Decline selected
          </button>
          <button
            className="min-h-11 px-2 underline"
            disabled={busy}
            onClick={() => {
              setSelected([]);
              setMode(null);
            }}
          >
            Clear
          </button>
          <button
            className="min-h-11 px-2 underline"
            disabled={busy}
            onClick={() => {
              setMode(null);
              setSelected([]);
              setConfirmed(false);
              void done().catch(() => {
                setFailed(true);
                setMessage("The list could not be refreshed. Try again.");
              });
            }}
          >
            Refresh list
          </button>
        </div>
      </div>
      {message && (
        <p
          role={failed ? "alert" : "status"}
          className={`rounded-lg border p-3 text-sm ${failed ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}
        >
          {message}
        </p>
      )}
      {mode && (
        <div
          ref={decision}
          className="space-y-3 rounded-xl border-2 border-cyan-700 bg-cyan-50 p-4"
        >
          <h3 className="font-semibold">
            {mode === "publish" ? "Approve" : "Decline"} {chosen.length} selected proposal(s){" "}
            {target ? `for ${target.display_name}` : ""}
          </h3>
          <p className="text-sm">
            {chosen
              .map((r) => `${r.race} (${r.date}, ${r.time}, bib ${r.bib || "unknown"})`)
              .join("; ")}
          </p>
          {!sameReview && (
            <p role="alert">The proposals changed. Cancel and open a fresh review before saving.</p>
          )}
          <fieldset disabled={busy} className="min-w-0 space-y-3">
            {mode === "publish" ? (
              <>
                <fieldset>
                  <legend className="text-sm font-semibold">
                    Identity evidence you actually checked
                  </legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {factors.map(([id, label]) => (
                      <label
                        key={id}
                        className="flex min-h-11 items-center gap-2 rounded-lg border border-cyan-200 bg-white p-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={checkedFactors.includes(id)}
                          onChange={(e) => {
                            setFactors(
                              e.target.checked
                                ? [...checkedFactors, id]
                                : checkedFactors.filter((f) => f !== id),
                            );
                            setConfirmed(false);
                          }}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="text-xs text-slate-600">
                  An official athlete ID must identify the person within that provider; a race bib
                  alone is not a permanent athlete ID. Clubs and residence can change, and
                  nationality must be explicitly recorded. These checks record your review; they do
                  not calculate a probability or automatically verify ownership.
                </p>
                <label className="block text-sm">
                  Additional identity evidence / source row (optional with checked evidence)
                  <textarea
                    className={input}
                    value={note}
                    maxLength={2000}
                    onChange={(e) => {
                      setNote(e.target.value);
                      setConfirmed(false);
                    }}
                    placeholder="Add a detail when needed; checked evidence is recorded automatically."
                  />
                </label>
                {differentSourceName && (
                  <p role="alert" className="text-sm text-amber-900">
                    A source name differs from this profile. Record the independent evidence for a
                    previous name or other difference before approval.
                  </p>
                )}
                <details open={differentSourceName || undefined}>
                  <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                    Record a conflict and how it was resolved
                  </summary>
                  <label className="block text-sm">
                    Conflicting evidence
                    <textarea
                      className={input}
                      value={against}
                      maxLength={4000}
                      onChange={(e) => {
                        setAgainst(e.target.value);
                        setConfirmed(false);
                      }}
                    />
                  </label>
                  <label className="block text-sm">
                    Resolution
                    <textarea
                      className={input}
                      value={resolution}
                      maxLength={4000}
                      onChange={(e) => {
                        setResolution(e.target.value);
                        setConfirmed(false);
                      }}
                    />
                  </label>
                </details>
                {evidence && (
                  <p className="whitespace-pre-wrap rounded bg-white p-2 text-xs">
                    Audit note: {evidence}
                  </p>
                )}
                {!corroborated && (
                  <p className="text-xs">
                    Check a name and supporting evidence, an official athlete ID, linked-owner
                    confirmation, or describe the independent evidence in the note.
                  </p>
                )}
                <label className="flex min-h-11 items-start gap-2 text-sm">
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  I checked every selected source row, race date, distance, timing, placing and
                  athlete identity, and authorise adding these results with the profile’s existing
                  visibility.
                </label>
                {chosen.some((r) => r.response === "no" || resultIssues(r).length) && (
                  <p role="alert" className="text-sm text-red-800">
                    A selected proposal was denied by the athlete or has incomplete race facts.
                    Remove it from this approval selection.
                  </p>
                )}
                {!targetId && (
                  <p className="text-sm">Choose the intended athlete before approving.</p>
                )}
              </>
            ) : (
              <label className="block text-sm">
                Reason for declining
                <select
                  aria-label="Reason for declining"
                  className={input}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                >
                  {declineReasons.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <span className="mt-1 block text-xs">
                  The original proposal and this reason remain in the audit. Use Later for uncertain
                  matches.
                </span>
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              <button
                className={`${button} border-cyan-800 bg-cyan-800 text-white`}
                disabled={
                  busy ||
                  !sameReview ||
                  (mode === "publish" ? !canPublish : !targetId || !chosen.length)
                }
                onClick={() => void save()}
              >
                {busy
                  ? "Saving…"
                  : mode === "publish"
                    ? `Approve ${chosen.length} and continue`
                    : `Confirm decline (${chosen.length})`}
              </button>
              <button
                className={`${button} border-slate-300 bg-white`}
                onClick={() => {
                  setMode(null);
                  setConfirmed(false);
                }}
              >
                Cancel
              </button>
            </div>
          </fieldset>
        </div>
      )}
      <div className="space-y-3">
        {visible.map((r) => {
          const issues = resultIssues(r);
          const blocked = r.response === "no" || issues.length > 0;
          return (
            <article
              key={r.index}
              aria-label={`Proposed race ${r.index}`}
              className={`min-w-0 space-y-2 rounded-xl border p-3 sm:p-4 ${selected.includes(r.index) ? "border-cyan-700 bg-cyan-50" : "border-slate-200"}`}
            >
              <div className="flex items-start gap-3">
                {r.state === "pending" && (
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0"
                    aria-label={`Quick select proposed race ${r.index}`}
                    disabled={busy}
                    checked={selected.includes(r.index)}
                    onChange={(e) => {
                      setSelected(
                        e.target.checked
                          ? [...selected, r.index]
                          : selected.filter((i) => i !== r.index),
                      );
                      setMode(null);
                      setConfirmed(false);
                    }}
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="break-words font-semibold">{r.race || "Race missing"}</h3>
                  <p className="text-sm">
                    {r.date || "Date missing"} · {r.distance || "Distance missing"} ·{" "}
                    <strong>{r.time || "Time missing"}</strong> · {r.timingBasis} · Bib{" "}
                    {r.bib || "not supplied"}
                  </p>
                </div>
                <span className="text-xs font-semibold">{r.state}</span>
              </div>
              {(r.athleteName ||
                r.club ||
                r.ageCategory ||
                r.ageAtRace ||
                r.nationality ||
                r.residence ||
                r.sourceAthleteId) && (
                <div className="overflow-x-auto rounded-lg bg-slate-50 p-2">
                  <table className="w-full text-left text-xs">
                    <caption className="pb-2 text-left font-semibold">
                      Identity comparison · missing means unknown
                    </caption>
                    <thead>
                      <tr>
                        <th className="p-1">Detail</th>
                        <th className="p-1">Source result</th>
                        <th className="p-1">Recorded profile / check</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Name", r.athleteName, target?.display_name],
                        [
                          "Club",
                          r.club,
                          target?.source_club_name
                            ? `${target.source_club_name} (check historical club)`
                            : "",
                        ],
                        [
                          "Age / category",
                          [r.ageAtRace, r.ageCategory].filter(Boolean).join(" · "),
                          "Check age at this race date and its category rules",
                        ],
                        [
                          "Nationality",
                          r.nationality,
                          "Check explicitly recorded nationality separately from residence",
                        ],
                        [
                          "Residence",
                          r.residence,
                          target?.city ? `${target.city} (current record; check race date)` : "",
                        ],
                        [
                          "Athlete ID",
                          r.sourceAthleteId,
                          "Check within the source provider; bib is separate",
                        ],
                      ].map(([label, source, recorded]) => (
                        <tr key={label}>
                          <th className="p-1 align-top">{label}</th>
                          <td className="break-words p-1 align-top">{source || "Not supplied"}</td>
                          <td className="break-words p-1 align-top">
                            {recorded || "Not supplied"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p
                className={`text-sm ${r.response === "no" ? "font-semibold text-red-800" : "text-slate-600"}`}
              >
                Athlete:{" "}
                {r.response === "yes"
                  ? "Confirmed mine — still check the source"
                  : r.response === "no"
                    ? "Not mine — approval blocked"
                    : r.response === "unsure"
                      ? "Unsure"
                      : "No response"}
                {r.responseNote ? ` · ${r.responseNote}` : ""}
              </p>
              {!!issues.length && (
                <p className="text-sm text-amber-900">Check: {issues.join("; ")}</p>
              )}
              {r.decisionNote && (
                <p className="text-xs text-slate-600">Decision: {r.decisionNote}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {httpsUrl.safeParse(r.sourceUrl).success && (
                  <a
                    className={`${button} inline-flex items-center border-slate-300`}
                    href={r.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open source
                  </a>
                )}
                {r.state === "pending" && (
                  <>
                    <button
                      className={`${button} border-emerald-700 bg-emerald-700 text-white`}
                      disabled={busy || blocked || !targetId}
                      onClick={() => open("publish", [r.index])}
                    >
                      Approve
                    </button>
                    <button
                      className={`${button} border-red-300 text-red-800`}
                      disabled={busy || !targetId}
                      onClick={() => open("reject", [r.index])}
                    >
                      Decline
                    </button>
                    <button
                      className={`${button} border-slate-300`}
                      disabled={busy}
                      onClick={() => {
                        setLater(
                          later.includes(r.index)
                            ? later.filter((i) => i !== r.index)
                            : [...later, r.index],
                        );
                        setSelected(selected.filter((i) => i !== r.index));
                        setMode(null);
                      }}
                    >
                      {later.includes(r.index) ? "Return to review" : "Later"}
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
        {!visible.length && (
          <p role="status" className="rounded-lg bg-slate-50 p-4 text-sm">
            No proposals in this view. Try All outcomes or clear your search. Later leaves proposals
            pending and resets when this review is reopened.
          </p>
        )}
      </div>
    </section>
  );
}
