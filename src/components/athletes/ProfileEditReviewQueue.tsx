import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfileEdits, reviewProfileEdit } from "@/lib/athrecs/profile-edit-suggestions-api";
import { Button } from "@/components/ui/button";

export function ProfileEditReviewQueue() {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["profile-edit-queue"], queryFn: () => getProfileEdits() });
  const review = useMutation({
    mutationFn: (data: { id: number; status: "reviewed" | "dismissed" }) =>
      reviewProfileEdit({ data }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["profile-edit-queue"] }),
  });
  return (
    <details className="rounded-xl border border-border bg-surface p-4">
      <summary className="cursor-pointer font-semibold">
        Suggested profile edits ({query.data?.length ?? 0})
      </summary>
      <p className="mt-2 text-sm text-muted">
        Check the evidence and apply any accepted correction through the athlete record before
        marking it reviewed. Suggestions never change a public profile automatically.
      </p>
      {query.isError ? <p role="alert">Unable to load suggestions.</p> : null}
      {review.isError ? <p role="alert">{review.error.message}</p> : null}
      {query.data?.map((item) => (
        <article key={item.id} className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
          <a
            className="text-accent underline"
            href={`https://www.athrecs.com/athletes/${item.profile_slug}`}
          >
            {item.profile_slug}
          </a>
          <p className="whitespace-pre-wrap">{item.suggestion}</p>
          {item.evidence_url ? (
            <a
              className="block break-all text-accent underline"
              href={item.evidence_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.evidence_url}
            </a>
          ) : null}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={review.isPending}
              onClick={() => review.mutate({ id: item.id, status: "reviewed" })}
            >
              Mark reviewed
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={review.isPending}
              onClick={() => review.mutate({ id: item.id, status: "dismissed" })}
            >
              Dismiss
            </Button>
          </div>
        </article>
      ))}
    </details>
  );
}
