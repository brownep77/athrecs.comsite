import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { checkAthleteLink, saveAthleteLink } from "@/lib/athlete-link/api";
import type { LinkReview, LinkReceipt, SaveLinkInput } from "@/lib/athlete-link/core";

const field =
  "mt-1 min-h-11 w-full min-w-0 rounded-lg border border-border bg-white px-3 py-2 text-sm";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-45";
const panel = "min-w-0 space-y-4 rounded-xl border border-border bg-white p-5";
const athleteNumber = (number: string) => `ATH-${number.padStart(6, "0")}`;
export function SingleAthleteLink({ onOpenAthlete }: { onOpenAthlete: (id: number) => void }) {
  const [url, setUrl] = useState(""),
    [name, setName] = useState(""),
    [searchName, setSearchName] = useState("");
  const [review, setReview] = useState<LinkReview | null>(null),
    [receipt, setReceipt] = useState<LinkReceipt | null>(null);
  const [selected, setSelected] = useState(""),
    [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false),
    [different, setDifferent] = useState(false);
  const [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const request = useRef<SaveLinkInput | null>(null),
    nameField = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  useEffect(() => {
    if (review?.state === "needs_name" && !busy) nameField.current?.focus();
  }, [review?.state, busy]);
  function resetReview() {
    setReview(null);
    setReceipt(null);
    setSelected("");
    setConfirmed(false);
    setDifferent(false);
    setReason("");
    setError("");
    request.current = null;
  }
  function editDecision() {
    setConfirmed(false);
    request.current = null;
    setError("");
  }
  async function check() {
    if (busy) return;
    resetReview();
    setBusy("check");
    try {
      const result = await checkAthleteLink({ data: { url, name, searchName } });
      setReview(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The link could not be checked. Try again.");
    } finally {
      setBusy("");
    }
  }
  const target = review?.candidates.find((c) => c.key === selected);
  const canSave = Boolean(
    review?.state === "review" &&
    review.totalCandidates <= review.candidates.length &&
    name.trim().length >= 2 &&
    reason.trim().length >= 12 &&
    confirmed &&
    !busy &&
    !receipt &&
    (selected === "new"
      ? !review.totalCandidates || different
      : target?.id && !target.managed && !target.conflictingSource),
  );
  async function save() {
    if (!canSave || !review) return;
    setBusy("save");
    setError("");
    request.current ??= {
      url: review.source.url,
      name: review.name,
      searchName: review.searchName,
      version: review.version,
      action: selected === "new" ? "create" : "link",
      ...(target?.id ? { athleteId: target.id } : {}),
      requestId: crypto.randomUUID(),
      reason,
      sourceChecked: true,
      identityChecked: true,
      rightsConfirmed: true,
      differentPerson: different,
    };
    try {
      const saved = await saveAthleteLink({ data: request.current });
      setReceipt(saved);
      // A saved receipt remains visible even if background list refresh fails.
      void queryClient.invalidateQueries({ queryKey: ["staff-athlete-directory"] });
      void queryClient.invalidateQueries({ queryKey: ["athlete-workspace"] });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Save was not confirmed. Retry keeps the same request and avoids a second profile.",
      );
    } finally {
      setBusy("");
    }
  }
  return (
    <div className="space-y-5">
      <form
        className={panel}
        onSubmit={(e) => {
          e.preventDefault();
          void check();
        }}
      >
        <div>
          <h2 className="font-display text-2xl font-semibold">Add one athlete from a link</h2>
          <p className="mt-2 text-sm text-muted">
            Check whether the profile is already recorded, then link it to an existing athlete or
            add a private profile.
          </p>
        </div>
        <fieldset disabled={Boolean(busy)} className="space-y-4">
          <label className="block text-sm font-semibold">
            Athlete profile link
            <input
              className={field}
              type="url"
              value={url}
              onChange={(e) => {
                resetReview();
                setUrl(e.target.value);
              }}
              required
              maxLength={2048}
              placeholder="https://worldathletics.org/athletes/…"
            />
          </label>
          <p className="text-sm text-muted">
            World Athletics, Power of 10 and UK Parkrun athlete profiles are supported. Race results
            pages belong in the results tools.
          </p>
          <label className="block text-sm font-semibold">
            Name shown on the source{" "}
            <span className="font-normal text-muted">(needed for a new link)</span>
            <input
              ref={nameField}
              className={field}
              value={name}
              onChange={(e) => {
                resetReview();
                setName(e.target.value);
              }}
              maxLength={200}
              autoComplete="off"
              placeholder="Copy the athlete’s name from their profile"
            />
          </label>
          <details>
            <summary className="cursor-pointer py-2 text-sm font-medium">
              Search an alternative or previous name
            </summary>
            <label className="block text-sm">
              Alternative name
              <input
                className={field}
                value={searchName}
                onChange={(e) => {
                  resetReview();
                  setSearchName(e.target.value);
                }}
                maxLength={200}
              />
            </label>
          </details>
          <button className={button} disabled={!url.trim()}>
            {busy === "check" ? "Checking existing athletes…" : "Check link & existing profiles"}
          </button>
        </fieldset>
      </form>
      {error ? (
        <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm">
          {error}
        </p>
      ) : null}
      {receipt ? (
        <section
          className="space-y-3 rounded-xl border border-emerald-300 bg-emerald-50 p-5"
          aria-live="polite"
        >
          <h2 className="text-xl font-semibold">
            {receipt.created ? "Private athlete profile created" : "Source link saved"}
          </h2>
          <p>
            {receipt.name} · {athleteNumber(receipt.athleteNumber)}
          </p>
          <p className="text-sm">
            {receipt.created
              ? "The profile is ready to edit and review."
              : "The existing profile’s details and visibility have been kept."}{" "}
            Race results are reviewed separately.
          </p>
          <button className={button} onClick={() => onOpenAthlete(receipt.athleteId)}>
            Open profile & review results
          </button>
        </section>
      ) : review ? (
        <section className={panel} aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">
                {review.state === "existing"
                  ? "This source profile is already recorded"
                  : review.state === "conflict"
                    ? "Conflicting source records need review"
                    : review.state === "needs_name"
                      ? "Confirm the source name"
                      : "Choose the athlete to update"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {review.source.label} · Athlete ID {review.source.externalId}
              </p>
            </div>
            <a
              className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-800 underline"
              href={review.source.url}
              target="_blank"
              rel="noreferrer"
            >
              Open source profile
            </a>
          </div>
          <p className="text-sm text-muted">
            The link identifies the provider’s record. Open the source to confirm the person and
            name; this check searches AthRecs and does not import the source’s results.
          </p>
          {review.state === "needs_name" ? (
            <p>
              Enter the name shown on that profile above, then check again to look for duplicates.
            </p>
          ) : null}
          {review.state === "conflict" ? (
            <p className="rounded-lg bg-amber-50 p-3 text-sm">
              More than one stored record uses this source identity. Open the records below for
              review; adding another profile is blocked.
            </p>
          ) : null}
          {review.candidates.length ? (
            <div className="space-y-3">
              {review.candidates.map((c) => (
                <div key={c.key} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <strong>{c.name}</strong>
                      <p className="text-xs text-muted">
                        {athleteNumber(c.number)} · {c.club || "Club not supplied"} ·{" "}
                        {c.country || "Country not supplied"}
                      </p>
                      <p className="mt-1 text-xs">
                        {c.exact
                          ? "Same provider athlete ID"
                          : "Possible name match — check identity"}{" "}
                        · {c.managed ? "Account managed" : c.visibility}
                      </p>
                    </div>
                    {c.id ? (
                      <button
                        type="button"
                        className="min-h-11 text-sm font-semibold text-cyan-800 underline"
                        disabled={Boolean(busy)}
                        onClick={() => onOpenAthlete(c.id!)}
                      >
                        Open profile
                      </button>
                    ) : (
                      <a
                        className="min-h-11 py-2 text-sm font-semibold text-cyan-800 underline"
                        href="/admin/athlete-accounts"
                      >
                        Review account
                      </a>
                    )}
                  </div>
                  {c.conflictingSource ? (
                    <p className="text-sm text-amber-900">
                      This athlete already has a different ID from the same provider. Resolve that
                      conflict before linking.
                    </p>
                  ) : null}
                  {review.state === "review" ? (
                    <label className="flex min-h-11 items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="athlete-link-choice"
                        checked={selected === c.key}
                        disabled={Boolean(busy) || c.managed || c.conflictingSource || !c.id}
                        onChange={() => {
                          editDecision();
                          setSelected(c.key);
                        }}
                      />
                      {c.managed ? "Owner review required" : "Link this source to this athlete"}
                    </label>
                  ) : null}
                </div>
              ))}
            </div>
          ) : review.state === "review" ? (
            <p>
              No possible match was found in the stored directory. Check the source identity before
              creating a new profile.
            </p>
          ) : null}
          {review.totalCandidates > review.candidates.length ? (
            <p className="text-sm text-amber-900">
              Showing {review.candidates.length} of {review.totalCandidates} possible matches. Use a
              more complete name to narrow the check before saving.
            </p>
          ) : null}
          {review.state === "review" && review.totalCandidates <= review.candidates.length ? (
            <fieldset disabled={Boolean(busy)} className="space-y-4 border-t border-border pt-4">
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="athlete-link-choice"
                  checked={selected === "new"}
                  onChange={() => {
                    editDecision();
                    setSelected("new");
                  }}
                />
                Create a new private profile for {review.name}
              </label>
              {selected === "new" && review.totalCandidates > 0 ? (
                <label className="flex items-start gap-2 text-sm">
                  <input
                    className="mt-1"
                    type="checkbox"
                    checked={different}
                    onChange={(e) => {
                      editDecision();
                      setDifferent(e.target.checked);
                    }}
                  />
                  I checked the possible matches. This source describes a different person.
                </label>
              ) : null}
              {selected ? (
                <>
                  <label className="block text-sm font-semibold">
                    Identity evidence / review note
                    <textarea
                      className={field}
                      rows={3}
                      value={reason}
                      onChange={(e) => {
                        editDecision();
                        setReason(e.target.value);
                      }}
                      minLength={12}
                      maxLength={2000}
                      placeholder="What confirms the person? Note their source ID and supporting club or race evidence."
                    />
                  </label>
                  <label className="flex items-start gap-2 text-sm">
                    <input
                      className="mt-1"
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => {
                        request.current = null;
                        setConfirmed(e.target.checked);
                      }}
                    />
                    I opened the source, checked the athlete’s identity and name, and am authorised
                    to save this profile or source link.
                  </label>
                  <p className="text-sm text-muted">
                    {selected === "new"
                      ? "Creates a private profile with the confirmed name and source link. You can add other details afterwards."
                      : "Adds this source identity to the selected profile. It does not change their details, visibility or account ownership."}
                  </p>
                  <button
                    type="button"
                    className={button}
                    disabled={!canSave}
                    onClick={() => void save()}
                  >
                    {busy === "save"
                      ? "Saving…"
                      : selected === "new"
                        ? "Create private athlete profile"
                        : "Save link to existing athlete"}
                  </button>
                </>
              ) : null}
            </fieldset>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
