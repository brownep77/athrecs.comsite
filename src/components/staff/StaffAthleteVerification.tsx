import { ResultCertificates } from "@/components/athletes/ResultCertificates";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  getStaffProfileVerification,
  getStaffVerificationResults,
  saveStaffProfileVerification,
  saveStaffResultVerification,
} from "@/lib/athrecs/staff-athlete-verification-api";
import { staffResultVerificationInput } from "@/lib/athrecs/staff-athlete-verification";

type ProfileReview = Awaited<ReturnType<typeof getStaffProfileVerification>>;
type Result = Awaited<ReturnType<typeof getStaffVerificationResults>>[number];
export function StaffAthleteVerification({ athleteNumber }: { athleteNumber: string }) {
  const [offset, setOffset] = useState(0);
  const profile = useQuery({
    queryKey: ["staff-profile-verification", athleteNumber],
    queryFn: () => getStaffProfileVerification({ data: { athleteNumber } }),
    retry: false,
  });
  const results = useQuery({
    queryKey: ["staff-verification-results", athleteNumber, offset],
    queryFn: () => getStaffVerificationResults({ data: { athleteNumber, offset } }),
    retry: false,
  });
  return (
    <section
      className="space-y-4 rounded-xl border border-border bg-surface p-5"
      aria-label="Staff verification"
    >
      <h2 className="text-xl font-semibold">Profile & result verification</h2>
      <p className="text-sm text-muted">
        Review any athlete here, whether their profile is claimed or unclaimed. Sources and review
        notes are visible only to staff.
      </p>
      {profile.isPending ? (
        <p role="status">Loading profile review…</p>
      ) : profile.isError ? (
        <p role="alert">
          Unable to load profile verification.{" "}
          <button onClick={() => void profile.refetch()} className="underline">
            Try again
          </button>
        </p>
      ) : (
        <ProfileCheckbox
          key={profile.data.version}
          athleteNumber={athleteNumber}
          review={profile.data}
        />
      )}
      <h3 className="font-semibold">Result verification & sources</h3>
      <p className="text-sm text-muted">
        Results count towards achievements immediately. Verify each result after checking its
        source; achievement ticks update from those confirmed results. Stored copies are shown
        separately for review.
      </p>
      {results.isPending ? (
        <p role="status">Loading results…</p>
      ) : results.isError ? (
        <p role="alert">
          Unable to load results.{" "}
          <button onClick={() => void results.refetch()} className="underline">
            Try again
          </button>
        </p>
      ) : results.data.length ? (
        <div className="space-y-3">
          {results.data.slice(0, 50).map((row) => (
            <ResultCheckbox
              key={`${JSON.stringify(row.target)}:${row.version}`}
              row={row}
              athleteNumber={athleteNumber}
            />
          ))}
        </div>
      ) : (
        <p>No stored results on this profile yet.</p>
      )}
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          disabled={!offset || results.isFetching}
          onClick={() => setOffset(offset - 50)}
        >
          Previous results
        </Button>
        <span className="text-sm">Page {offset / 50 + 1}</span>
        <Button
          variant="secondary"
          disabled={results.isFetching || !results.data || results.data.length <= 50}
          onClick={() => setOffset(offset + 50)}
        >
          Next results
        </Button>
      </div>
    </section>
  );
}
function ProfileCheckbox({
  athleteNumber,
  review,
}: {
  athleteNumber: string;
  review: ProfileReview;
}) {
  const client = useQueryClient();
  const [verified, setVerified] = useState(review.verified),
    [note, setNote] = useState("");
  const save = useMutation({
    mutationFn: () =>
      saveStaffProfileVerification({
        data: { athleteNumber, verified, note, expectedVersion: review.version },
      }),
    onSuccess: () =>
      client.invalidateQueries({ queryKey: ["staff-profile-verification", athleteNumber] }),
  });
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <label className="flex min-h-11 items-center gap-2 font-semibold">
        <input
          type="checkbox"
          checked={verified}
          disabled={save.isPending}
          onChange={(e) => setVerified(e.target.checked)}
          className="size-4"
        />
        Profile details verified
      </label>
      <p className="text-xs text-muted">
        This records your check of the athlete’s profile details. Result verification and account
        ownership have their own checks.
      </p>
      {review.stale ? (
        <p role="status" className="text-sm">
          Profile details have changed since the last check. Please review them again.
        </p>
      ) : null}
      {review.reviewedAt ? (
        <p className="text-xs text-muted">
          Last saved {review.reviewedAt} · Staff {review.reviewedBy}
        </p>
      ) : null}
      {review.note ? (
        <p className="whitespace-pre-wrap text-sm">Last review: {review.note}</p>
      ) : null}
      {verified !== review.verified || review.stale ? (
        <>
          <label className="block text-sm">
            Private review note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={4000}
              className="mt-1 w-full rounded border p-2"
              rows={2}
            />
          </label>
          <Button
            disabled={save.isPending || note.trim().length < 12}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save profile verification"}
          </Button>
        </>
      ) : null}
      {save.isError ? <p role="alert">{save.error.message}</p> : null}
    </div>
  );
}
function ResultCheckbox({ athleteNumber, row }: { athleteNumber: string; row: Result }) {
  const client = useQueryClient();
  const [verified, setVerified] = useState(row.verified),
    [note, setNote] = useState("");
  const [sourceUrl, setSourceUrl] = useState(row.urls[0] ?? ""),
    [locator, setLocator] = useState("");
  const [identityEvidence, setIdentityEvidence] = useState(""),
    [sourceChecked, setSourceChecked] = useState(false);
  const data = {
    athleteNumber,
    target: row.target,
    expectedVersion: row.version,
    verified,
    note,
    sourceUrl,
    locator,
    identityEvidence,
    sourceChecked,
  };
  const save = useMutation({
    mutationFn: () => saveStaffResultVerification({ data }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["staff-verification-results", athleteNumber] }),
        client.invalidateQueries({ queryKey: ["staff-athlete-profile"] }),
        client.invalidateQueries({ queryKey: ["staff-result-verification"] }),
      ]);
    },
  });
  return (
    <article className="min-w-0 space-y-2 rounded-lg border border-border p-4">
      <h4 className="font-semibold">{row.event}</h4>
      <p className="text-sm">
        {row.date} · {row.discipline} · {row.performance}
      </p>
      <p className="text-xs text-muted">
        {row.published ? "Published record" : "Private record"} · Sourced from:{" "}
        {row.provider || "Not recorded"}
      </p>
      <div className="flex flex-wrap gap-3">
        {row.urls.map((url, i) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="break-all text-sm text-accent underline"
          >
            Source {i + 1}: {url}
          </a>
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={verified}
          disabled={save.isPending}
          onChange={(e) => setVerified(e.target.checked)}
          className="size-4"
        />
        Result verified
      </label>
      {row.target.kind === "result" ? (
        <ResultCertificates resultId={row.target.resultId} staff />
      ) : null}
      <details className="text-xs">
        <summary className="cursor-pointer">Stored result & previous review</summary>
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words">
          {row.originalJson}
        </pre>
      </details>
      {verified !== row.verified ? (
        <fieldset disabled={save.isPending} className="space-y-3">
          {verified ? (
            <>
              <label className="block text-sm">
                Source URL checked
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border p-2"
                  maxLength={2000}
                />
              </label>
              <label className="block text-sm">
                Bib, result row or PDF page
                <input
                  value={locator}
                  onChange={(e) => setLocator(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded border p-2"
                  maxLength={2000}
                />
              </label>
              <label className="block text-sm">
                How the athlete was matched
                <textarea
                  value={identityEvidence}
                  onChange={(e) => setIdentityEvidence(e.target.value)}
                  className="mt-1 w-full rounded border p-2"
                  maxLength={4000}
                  rows={2}
                />
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sourceChecked}
                  onChange={(e) => setSourceChecked(e.target.checked)}
                />
                I checked the source row against the athlete, event, date, distance, finish status,
                times and placings.
              </label>
            </>
          ) : null}
          <label className="block text-sm">
            Private review note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded border p-2"
              maxLength={4000}
              rows={2}
            />
          </label>
          <Button
            disabled={save.isPending || !staffResultVerificationInput.safeParse(data).success}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save result verification"}
          </Button>
        </fieldset>
      ) : null}
      {save.isError ? <p role="alert">{save.error.message}</p> : null}
    </article>
  );
}
