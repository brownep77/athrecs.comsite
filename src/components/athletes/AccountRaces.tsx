import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AthleteAccountData } from "@/lib/athrecs/athlete-account-api";
import { getMyProfileResultVisibility } from "@/lib/athrecs/athlete-profile-results-api";
import { combineProfileResults } from "@/lib/athrecs/profile-records";
import { sportIsInAthleteProfileScope } from "@/lib/site-scope";
import { AthleteResultsSection } from "./AthleteResultsSection";
import { ProfileRecordHighlights } from "./ProfileAchievements";
import { ProfileProgress } from "./ProfileProgress";

export function AccountRaces({
  account,
  view,
}: {
  account: AthleteAccountData;
  view: "races" | "achievements" | "progress";
}) {
  const visibility = useQuery({
    queryKey: ["my-profile-result-visibility"],
    queryFn: () => getMyProfileResultVisibility(),
    retry: false,
  });
  const { visible, hidden } = useMemo(() => {
    const hiddenIds = new Set(visibility.data?.hiddenResultIds ?? []);
    const all = combineProfileResults(
      account.claimedResults.filter((result) => sportIsInAthleteProfileScope(result.sport)),
    );
    const isHidden = (result: (typeof all)[number]) =>
      (result.sourceResultIds ?? [result.resultId]).some((id) => hiddenIds.has(id));
    return { visible: all.filter((result) => !isHidden(result)), hidden: all.filter(isHidden) };
  }, [account.claimedResults, visibility.data]);

  if (visibility.isPending)
    return (
      <p role="status" className="p-5 text-muted">
        Loading your races…
      </p>
    );
  if (visibility.isError)
    return (
      <div role="alert" className="space-y-3 rounded-xl border border-border bg-surface p-5">
        <p>Your races could not be loaded.</p>
        <Button type="button" variant="secondary" onClick={() => void visibility.refetch()}>
          Try again
        </Button>
      </div>
    );
  if (view === "progress") return <ProfileProgress results={visible} />;
  if (view === "achievements")
    return visible.length ? (
      <ProfileRecordHighlights results={visible} />
    ) : (
      <p className="rounded-xl border border-border bg-surface p-5 text-muted">
        Add your race results to see your personal bests and achievements.
      </p>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
        <div>
          <h2 className="font-display text-xl font-semibold">My races</h2>
          <p className="mt-1 text-sm text-muted">
            Add results, remove races from your profile or restore them later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/athlete-account" search={{ section: "potential" }}>
              <Plus className="size-4" aria-hidden="true" />
              Add races
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/claim-results" search={{ resultId: undefined }}>
              Find a result / manage claims
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/athlete-results">Submit a missing result</Link>
          </Button>
        </div>
      </div>
      <AthleteResultsSection results={visible} hiddenResults={hidden} />
    </div>
  );
}
