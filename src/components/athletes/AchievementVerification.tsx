import { BadgeCheck } from "lucide-react";

export function AchievementVerification({ verified }: { verified: boolean }) {
  return (
    <span
      data-achievement-verification={verified ? "verified" : "pending"}
      className={`inline-flex items-center gap-1 text-xs font-normal ${verified ? "text-emerald-700 dark:text-emerald-300" : "text-muted"}`}
      title={verified ? "Supporting results verified" : "Achieved · awaiting verification"}
    >
      {verified ? <BadgeCheck className="size-3.5" aria-hidden="true" /> : null}
      {verified ? "Verified" : "Awaiting verification"}
    </span>
  );
}
