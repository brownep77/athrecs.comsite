import { useMutation, useQuery } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { answerMyOwnerRaceReview, listMyOwnerRaceReviews } from "@/lib/athlete-workspace/api";
import { Button } from "@/components/ui/button";

export function OwnerRaceReview() {
  const { user } = useCurrentUserState();
  const query = useQuery({
    queryKey: ["owner-race-reviews", user?.id],
    enabled: Boolean(user),
    queryFn: () => listMyOwnerRaceReviews(),
  });
  const answer = useMutation({
    mutationFn: (data: {
      athleteId: number;
      key: string;
      version: string;
      response: "yes" | "no";
    }) => answerMyOwnerRaceReview({ data }),
    onSuccess: () => query.refetch(),
  });
  if (!user) return null;
  if (query.isError)
    return (
      <p role="alert">
        Possible race matches could not be loaded.{" "}
        <Button variant="ghost" onClick={() => void query.refetch()}>
          Retry
        </Button>
      </p>
    );
  return (
    <>
      {query.data
        ?.filter((group) => group.rows.length > 0)
        .map((group) => (
          <section
            key={group.athleteId}
            className="space-y-3 rounded-xl border bg-white p-5 text-slate-900"
          >
            <h2 className="text-xl font-semibold">Possible races for {group.athleteName}</h2>
            <p>
              Choose the finishes you recognise. You can leave a race pending and come back to it.
              Staff review confirmed matches before adding them to your history.
            </p>
            {group.rows.map((row) => {
              const otherBibChosen = Boolean(
                row.alternativeGroup &&
                group.rows.some(
                  (other) =>
                    other.key !== row.key &&
                    other.alternativeGroup === row.alternativeGroup &&
                    other.response === "yes",
                ),
              );
              const choose = (response: "yes" | "no") =>
                answer.mutate({
                  athleteId: group.athleteId,
                  key: row.key,
                  version: row.version,
                  response,
                });
              return (
                <div key={row.key} className="space-y-1 border-t py-3">
                  <h3 className="font-semibold">
                    {row.race} · {row.date}
                  </h3>
                  <p>
                    {row.time} · Bib {row.bib}
                    {row.hint && ` · ${row.hint}`}
                  </p>
                  {row.response ? (
                    <p>{row.response === "yes" ? "Marked as mine" : "Not mine"}</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span>
                        Pending{row.alternativeGroup && " · choose at most one bib for this race"}
                      </span>
                      <Button
                        disabled={answer.isPending || otherBibChosen}
                        onClick={() => choose("yes")}
                      >
                        Mine
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={answer.isPending}
                        onClick={() => choose("no")}
                      >
                        Not mine
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {answer.isError && <p role="alert">{answer.error.message}</p>}
          </section>
        ))}
    </>
  );
}
