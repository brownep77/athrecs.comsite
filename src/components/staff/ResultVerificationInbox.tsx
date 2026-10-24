import { ResultCertificates } from "@/components/athletes/ResultCertificates";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStaffResultVerificationInbox,
  reviewResultVerification,
} from "@/lib/athrecs/result-verification-api";
import {
  verificationReviewInput,
  type VerificationReviewInput,
} from "@/lib/athrecs/result-verification";
import { Button } from "@/components/ui/button";

type Case = Awaited<ReturnType<typeof getStaffResultVerificationInbox>>[number];
export function ResultVerificationInbox({ athleteIds = [] }: { athleteIds?: number[] }) {
  const [status, setStatus] = useState<"all" | Case["status"]>("pending"),
    [offset, setOffset] = useState(0);
  const inbox = useQuery({
    queryKey: ["staff-result-verification", athleteIds, status, offset],
    queryFn: () => getStaffResultVerificationInbox({ data: { athleteIds, status, offset } }),
    refetchInterval: 30000,
    retry: false,
  });
  return (
    <section
      id="result-verification"
      className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-5"
    >
      <h2 className="text-xl font-semibold">Result verification inbox</h2>
      <p className="text-sm text-muted">
        Check source rows and athlete identity before verifying. Evidence and review notes stay in
        this staff view. Only the message to the athlete is shared with them.
      </p>
      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          Show{" "}
          <select
            className="min-h-11 rounded border px-3"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setOffset(0);
            }}
          >
            {["pending", "needs_info", "approved", "rejected", "all"].map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" onClick={() => void inbox.refetch()}>
          Refresh inbox
        </Button>
      </div>
      {inbox.isPending ? (
        <p role="status">Loading verification requests…</p>
      ) : inbox.isError ? (
        <p role="alert">Unable to load the verification inbox. Please refresh.</p>
      ) : !inbox.data?.length ? (
        <p>No requests in this view.</p>
      ) : (
        inbox.data
          .slice(0, 50)
          .map((row) => <VerificationCase key={`${row.id}:${row.revision}`} row={row} />)
      )}
      <div className="flex gap-3">
        <Button variant="secondary" disabled={!offset} onClick={() => setOffset(offset - 50)}>
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={!inbox.data || inbox.data.length <= 50}
          onClick={() => setOffset(offset + 50)}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
function VerificationCase({ row }: { row: Case }) {
  const client = useQueryClient(),
    [message, setMessage] = useState("");
  const [review, setReview] = useState<Omit<VerificationReviewInput, "action">>({
    id: row.id,
    revision: row.revision,
    sourceUrl: row.evidenceUrl,
    locator: "",
    identityEvidence: "",
    staffNote: "",
    memberMessage: "",
    sourceChecked: false,
  });
  const mutation = useMutation({
    mutationFn: (action: VerificationReviewInput["action"]) =>
      reviewResultVerification({ data: { ...review, action } }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["staff-result-verification"] }),
        client.invalidateQueries({ queryKey: ["staff-athlete-profile"] }),
        client.invalidateQueries({ queryKey: ["athlete-workspace"] }),
        client.invalidateQueries({ queryKey: ["managed-performance-history"] }),
      ]);
      setMessage("Review saved.");
    },
    onError: (error) =>
      setMessage(error instanceof Error ? error.message : "The review was not saved."),
  });
  const fields = [
    ["sourceUrl", "Source URL checked"],
    ["locator", "Source row locator (bib, row ID or PDF page)"],
    ["identityEvidence", "Athlete identity evidence"],
    ["staffNote", "Private review note"],
    ["memberMessage", "Message to the athlete"],
  ] as const;
  const valid = verificationReviewInput.safeParse({ ...review, action: "needs_info" }).success;
  return (
    <article className="min-w-0 space-y-3 rounded-lg border border-border p-4">
      <h3 className="font-semibold">
        {row.athleteName} · {String(row.snapshot.race ?? "Result")}
      </h3>
      <p className="text-sm">
        {String(row.snapshot.date ?? "")} · {String(row.snapshot.distance ?? "")} ·{" "}
        {typeof row.snapshot.performance === "number"
          ? `${row.snapshot.performance} seconds`
          : String(row.snapshot.performance ?? "")}{" "}
        · {row.status.replace("_", " ")}
      </p>
      <a
        className="text-sm text-accent underline"
        href={`/admin/athlete-workspace?athleteId=${row.athleteId}#result-verification`}
      >
        Open this athlete’s backend
      </a>
      {row.key.startsWith("r:") ? (
        <ResultCertificates resultId={Number(row.key.slice(2))} staff />
      ) : null}
      {row.note ? (
        <p className="whitespace-pre-wrap break-words text-sm">Athlete note: {row.note}</p>
      ) : null}
      {row.evidenceUrl ? (
        <a
          className="block break-words text-sm text-accent underline"
          href={row.evidenceUrl}
          target="_blank"
          rel="noreferrer"
        >
          Athlete supplied result link
        </a>
      ) : null}
      <details>
        <summary className="cursor-pointer text-sm font-semibold">
          Stored result and evidence
        </summary>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">
          {row.snapshot.originalJson}
        </pre>
        {row.staffEvidence ? (
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">
            {row.staffEvidence}
          </pre>
        ) : null}
      </details>
      {row.status === "pending" || row.status === "needs_info" ? (
        <fieldset disabled={mutation.isPending} className="space-y-3">
          {fields.map(([key, label]) => (
            <label className="block text-sm" key={key}>
              {label}
              <textarea
                rows={key === "sourceUrl" ? 1 : 2}
                value={review[key]}
                onChange={(e) => setReview({ ...review, [key]: e.target.value })}
                maxLength={key === "identityEvidence" || key === "staffNote" ? 4000 : 2000}
                className="mt-1 min-h-11 w-full rounded border p-2"
              />
            </label>
          ))}
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={review.sourceChecked}
              onChange={(e) => setReview({ ...review, sourceChecked: e.target.checked })}
            />
            I inspected the source row and matched the athlete, race, date, distance, finish status,
            times and every supplied placing.
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={
                !valid ||
                !review.sourceChecked ||
                !review.sourceUrl ||
                review.locator.trim().length < 2 ||
                review.identityEvidence.trim().length < 12
              }
              onClick={() => mutation.mutate("approve")}
            >
              Verify result
            </Button>
            <Button
              variant="secondary"
              disabled={!valid}
              onClick={() => mutation.mutate("needs_info")}
            >
              Ask for more information
            </Button>
            <Button variant="secondary" disabled={!valid} onClick={() => mutation.mutate("reject")}>
              Reject request
            </Button>
          </div>
        </fieldset>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm">
          Message shown to athlete: {row.memberMessage}
        </p>
      )}
      {message ? <p role="status">{message}</p> : null}
    </article>
  );
}
