import { Award, Flag, Medal, Star, Trophy } from "lucide-react";
import { placingAward, type ProfileAwardKind } from "@/lib/athrecs/profile-awards";
import { hasRecordedFinish } from "@/lib/athrecs/profile-result-presentation";
import type { ProfileResult } from "@/lib/athrecs/profile-records";

const awards = {
  gold: {
    icon: Medal,
    label: "Gold medal · 1st place",
    colour:
      "text-yellow-700 dark:text-yellow-300 [&_circle]:fill-yellow-200 dark:[&_circle]:fill-yellow-900",
  },
  silver: {
    icon: Medal,
    label: "Silver medal · 2nd place",
    colour:
      "text-slate-500 dark:text-slate-300 [&_circle]:fill-slate-200 dark:[&_circle]:fill-slate-700",
  },
  bronze: {
    icon: Medal,
    label: "Bronze medal · 3rd place",
    colour:
      "text-orange-800 dark:text-orange-300 [&_circle]:fill-orange-200 dark:[&_circle]:fill-orange-900",
  },
  finisher: {
    icon: Medal,
    label: "Finisher medal",
    colour:
      "text-teal-700 dark:text-teal-300 [&_circle]:fill-teal-100 dark:[&_circle]:fill-teal-900",
  },
  trophy: {
    icon: Trophy,
    label: "Winner's trophy",
    colour: "text-yellow-700 dark:text-yellow-300",
  },
  "personal-best": {
    icon: Star,
    label: "Personal best",
    colour: "text-violet-700 dark:text-violet-300",
  },
  milestone: {
    icon: Award,
    label: "Career milestone",
    colour: "text-violet-700 dark:text-violet-300",
  },
  participation: {
    icon: Flag,
    label: "Championship participation",
    colour: "text-blue-700 dark:text-blue-300",
  },
} as const;

export function ProfileAward({
  kind,
  completion = false,
  decorative = false,
}: {
  kind: ProfileAwardKind;
  completion?: boolean;
  decorative?: boolean;
}) {
  const { icon: Icon, label, colour } = awards[kind];
  const description = completion ? `Completed event · ${label}` : label;
  return (
    <span
      className={`inline-flex shrink-0 ${colour}`}
      data-profile-award={kind}
      aria-hidden={decorative || undefined}
      title={
        completion
          ? `${description} in the listed race or round — result verification is shown separately`
          : label
      }
    >
      <Icon className="size-5" aria-hidden="true" />
      {!decorative ? <span className="sr-only">{description} · </span> : null}
    </span>
  );
}

export function CompletionMedal({ place }: { place?: string | number | null }) {
  return <ProfileAward kind={placingAward(place)} completion />;
}

export function ResultMedal({ result }: { result: ProfileResult }) {
  if (!hasRecordedFinish(result)) return null;
  return (
    <CompletionMedal
      place={result.conflicting ? null : (result.overallPlace ?? result.displayOverallPlace)}
    />
  );
}

export function ResultMedalKey() {
  return (
    <div
      aria-label="Result medal key"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted"
    >
      {(["gold", "silver", "bronze", "finisher"] as const).map((kind) => (
        <span key={kind} className="inline-flex items-center gap-1">
          <ProfileAward kind={kind} decorative />
          {kind === "gold"
            ? "1st"
            : kind === "silver"
              ? "2nd"
              : kind === "bronze"
                ? "3rd"
                : "Finisher"}
        </span>
      ))}
      <span>Placings in the listed race or round</span>
    </div>
  );
}
