import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRaceEdits, reviewRaceEdit } from "@/lib/athrecs/race-edit-suggestions-api";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/athrecs/seo";

export function RaceEditReviewQueue() {
  const [page, setPage] = useState(0);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["race-edit-queue", page],
    queryFn: () => getRaceEdits({ data: { page } }),
  });
  const review = useMutation({
    mutationFn: (data: { id: number; status: "reviewed" | "dismissed" }) =>
      reviewRaceEdit({ data }),
    onSuccess: async () => {
      setPage(0);
      await client.invalidateQueries({ queryKey: ["race-edit-queue"] });
    },
  });
  return (
    <section className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <h1 className="font-display text-2xl font-semibold">
        Suggested race edits{query.data ? ` (${query.data.total})` : ""}
      </h1>
      <p className="text-sm text-muted">
        Check the organiser’s evidence and apply any accepted correction to the race record before
        marking it reviewed. Suggestions do not update public pages automatically.
      </p>
      {query.isPending ? <p role="status">Loading suggestions…</p> : null}
      {query.isError ? (
        <div role="alert">
          <p>Unable to load suggestions.</p>
          <Button onClick={() => void query.refetch()}>Try again</Button>
        </div>
      ) : null}
      {review.isError ? <p role="alert">{review.error.message}</p> : null}
      {query.data?.total === 0 ? <p>No race suggestions awaiting review.</p> : null}
      {query.data?.items.map((item) => (
        <article key={item.id} className="space-y-3 border-t border-border pt-4 text-sm">
          <a
            className="font-semibold text-accent underline"
            href={`${item.race_path.startsWith("/running/") ? "https://www.athrecs.com" : SITE_URL}${item.race_path}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.race_name}
          </a>
          <p className="text-xs text-muted">
            Submitted{" "}
            {new Date(item.created_at).toLocaleDateString("en-GB", { timeZone: "Europe/London" })} ·
            {item.event_id ? `Event ${item.event_id}` : "Race guide"}
          </p>
          <p className="whitespace-pre-wrap break-words">{item.suggestion}</p>
          {item.evidence_url ? (
            <a
              className="block break-all text-accent underline"
              href={item.evidence_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Supporting link: {item.evidence_url}
            </a>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={review.isPending}
              onClick={() => review.mutate({ id: item.id, status: "reviewed" })}
            >
              Mark reviewed
            </Button>
            <Button
              variant="secondary"
              disabled={review.isPending}
              onClick={() => review.mutate({ id: item.id, status: "dismissed" })}
            >
              Dismiss
            </Button>
          </div>
        </article>
      ))}
      {query.data && query.data.total > 50 ? (
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={page === 0 || query.isFetching}
            onClick={() => setPage((value) => value - 1)}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page + 1} of {Math.ceil(query.data.total / 50)}
          </span>
          <Button
            variant="secondary"
            disabled={(page + 1) * 50 >= query.data.total || query.isFetching}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </section>
  );
}
