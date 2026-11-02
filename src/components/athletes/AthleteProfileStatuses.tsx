import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { publicProfileStatuses } from "@/lib/athrecs/athlete-profile-roles";

/** Keep editorial status badges identical before and after sign-in. */
export function AthleteProfileStatuses({ roles }: { roles?: readonly string[] }) {
  const statuses = publicProfileStatuses(roles);
  if (!statuses.length) return null;

  return (
    <div className="flex flex-wrap gap-2" aria-label="Profile status">
      {statuses.map((status) => (
        <Badge
          key={status}
          variant="outline"
          className={
            status === "Running legend"
              ? "gap-1.5 border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
              : undefined
          }
        >
          {status === "Running legend" ? <Trophy className="size-3.5" aria-hidden="true" /> : null}
          {status}
        </Badge>
      ))}
    </div>
  );
}
