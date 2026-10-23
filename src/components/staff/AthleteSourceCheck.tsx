import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkAthleteSource } from "@/lib/athlete-finder/source-check-api";
import {
  sourceCheckSchema,
  type SourceCheckInput,
  type SourceReviewCapture,
} from "@/lib/athlete-finder/source-check";
import { queueBrowserCapture } from "@/lib/results-archive/browser-handoff";

export function AthleteSourceCheck({
  name,
  aliases,
  club,
}: {
  name: string;
  aliases: string[];
  club: string;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [handoff, setHandoff] = useState<number | null>(null);
  const check = useMutation({
    mutationFn: (input: SourceCheckInput) => checkAthleteSource({ data: input }),
  });
  const response = !check.isPending && !check.isError ? check.data : undefined;
  async function review(capture: SourceReviewCapture) {
    setHandoff(capture.table);
    setError("");
    try {
      const id = crypto.randomUUID();
      await queueBrowserCapture(id, capture.json);
      window.location.assign(`/admin/result-archive#import=${id}`);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not prepare the import review. Try again.",
      );
      setHandoff(null);
    }
  }
  return (
    <section
      aria-labelledby="live-source-heading"
      className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
    >
      <div>
        <h2 id="live-source-heading" className="flex items-center gap-2 text-xl font-semibold">
          <Globe aria-hidden="true" className="size-5" />
          Check a results URL
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
          Have a saved link but no result rows? Check one Total Race Timing results page using the
          athlete name and other racing names above. The page is fetched when you ask; matching rows
          can then be reviewed and saved.
        </p>
        <p className="mt-1 text-xs text-muted">
          First supported website: totalracetiming.co.uk. One page per check; this does not search
          every race or the wider internet. Year and source filters above apply to stored search
          only.
        </p>
      </div>
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          const parsed = sourceCheckSchema.safeParse({ url, name, aliases, club });
          if (!parsed.success) {
            setError(parsed.error.issues[0]?.message ?? "Check the name and results URL.");
            return;
          }
          setError("");
          check.mutate(parsed.data);
        }}
      >
        <label className="min-w-0 flex-1 text-sm font-medium">
          Official results page URL
          <input
            type="url"
            required
            maxLength={1500}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste an actual Total Race Timing race results link"
            className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-border bg-bg px-3 py-2 text-sm"
          />
        </label>
        <Button type="submit" disabled={check.isPending}>
          {check.isPending ? "Checking page…" : "Check result page"}
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm text-red-800">
          {error}
        </p>
      )}
      {check.isPending && (
        <p role="status" className="text-sm">
          Fetching the supported page and comparing the recorded names…
        </p>
      )}
      {check.isError && (
        <p role="alert" className="text-sm text-red-800">
          The page check did not finish.{" "}
          {check.error instanceof Error ? check.error.message : "Try again."}
        </p>
      )}
      {response && (
        <div className="space-y-3" aria-live="polite">
          <div className="rounded-lg bg-elevated p-3 text-sm">
            <p className="font-semibold">
              {response.status === "checked"
                ? `${response.matchedRows ?? 0} possible matching rows on this page`
                : "This page could not be checked"}
            </p>
            <p className="mt-2 break-all text-xs">
              {response.coverage.pagesChecked ? "Checked page: " : "Requested page: "}
              <a
                href={response.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {response.sourceUrl}
              </a>
            </p>
            {response.status === "checked" && (
              <p>
                {response.eventName} · {response.sourceRows?.toLocaleString() ?? "Unknown"} source
                rows on the page
              </p>
            )}
            {response.fetchedAt && (
              <p className="mt-1 text-xs text-muted">
                Fetched {new Date(response.fetchedAt).toLocaleString("en-GB")} · Preview only; not
                saved to the archive
              </p>
            )}
            {response.truncated && (
              <p className="mt-1">
                Showing the first {response.returnedRows} matches. Narrow the racing names before
                import.
              </p>
            )}
            {!!response.retryAfterSeconds && (
              <p>Try again in at least {response.retryAfterSeconds} seconds.</p>
            )}
          </div>
          {!!response.issues.length && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
              {response.issues.map((issue, index) => (
                <li key={`${index}:${issue}`}>{issue}</li>
              ))}
            </ul>
          )}
          {response.rows.map((row) => (
            <details key={row.key} className="rounded-lg border border-border p-3 text-sm">
              <summary className="cursor-pointer font-medium">
                {row.name} · {row.club || "Club not supplied"} ·{" "}
                {row.distance || "Distance not supplied"} · Row {row.row}
              </summary>
              <p className="mt-2 text-xs text-muted">
                {row.matchReason}. Identity requires review.
              </p>
              <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(row.original).map(([heading, value]) => (
                  <div key={heading}>
                    <dt className="text-xs text-muted">{heading}</dt>
                    <dd className="break-words">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
              {!!row.issues.length && (
                <p className="mt-2 text-xs text-muted">{row.issues.join(" ")}</p>
              )}
            </details>
          ))}
          {!!response.reviewCaptures.length && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-sm">
                Open matching rows in the existing importer to choose the race, map columns and
                review identities before saving. Only the selected matching rows will be included.
              </p>
              <div className="flex flex-wrap gap-2">
                {response.reviewCaptures.map((capture) => (
                  <Button
                    key={capture.table}
                    variant="secondary"
                    disabled={handoff !== null}
                    onClick={() => void review(capture)}
                  >
                    {handoff === capture.table
                      ? "Preparing review…"
                      : `Review ${capture.matchedRows} matching rows · ${capture.label}`}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-xs leading-5 text-muted">
        For other websites, use an existing collector or{" "}
        <a href="/admin/result-archive#import" className="underline">
          import the source results
        </a>
        . A URL is a reference; it becomes searchable here after result rows are extracted and
        saved.
      </p>
    </section>
  );
}
