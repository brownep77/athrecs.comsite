import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getMyArchiveMatches, requestMyArchiveMatch } from "@/lib/results-archive/member-api";

export function ArchivedResultSuggestions({ userId }: { userId: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const matches = useQuery({
    queryKey: ["my-archive-suggestions", userId],
    queryFn: () => getMyArchiveMatches(),
    staleTime: 60000,
    refetchInterval: 60000,
  });
  const request = useMutation({
    mutationFn: (id: number) =>
      requestMyArchiveMatch({
        data: { entryId: id, revision: matches.data!.find((r) => r.id === id)!.revision, note },
      }),
    onSuccess: () => {
      setSelected(null);
      setNote("");
      void matches.refetch();
    },
  });
  if (matches.isPending)
    return <p className="p-4 text-sm text-muted">Checking saved race fields…</p>;
  if (matches.isError)
    return (
      <p className="p-4 text-sm text-muted">
        Saved race fields could not be checked.{" "}
        <button className="underline" onClick={() => void matches.refetch()}>
          Retry
        </button>
      </p>
    );
  if (!matches.data?.length) return null;
  return (
    <div className="border-b border-border p-4">
      <h3 className="font-semibold">Other saved race results matching your name</h3>
      <p className="mb-3 text-sm text-muted">
        These entries have not yet been linked to an athlete. Ask us to check any that are yours. A
        name match alone does not confirm identity.
      </p>
      <div className="space-y-2">
        {matches.data.map((r) => (
          <article className="rounded-lg border border-border p-3" key={r.id}>
            <strong>{r.event}</strong>
            <p className="text-sm">
              {r.name} · {r.date} · {r.distance} · {r.status}
            </p>
            {r.requested ? (
              <p className="text-sm">Requested — awaiting staff review.</p>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="mt-2"
                onClick={() => {
                  setSelected(r.id);
                  setNote("");
                }}
              >
                This could be mine
              </Button>
            )}
            {selected === r.id && (
              <div className="mt-3 space-y-2">
                <label className="flex flex-col text-sm">
                  What helps us confirm this result?
                  <textarea
                    className="rounded border border-border bg-bg p-2"
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="For example, your bib, club or a link to supporting evidence"
                  />
                </label>
                <Button
                  disabled={request.isPending || note.trim().length < 12}
                  onClick={() => request.mutate(r.id)}
                >
                  Request a match review
                </Button>
                {request.isError && <p role="alert">{request.error.message}</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
