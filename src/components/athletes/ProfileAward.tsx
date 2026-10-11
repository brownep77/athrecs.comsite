import { Award, Flag, Medal, Star, Trophy, Flame, Globe2, Crown, Shield } from "lucide-react";
import { placingAward, type ProfileAwardKind } from "@/lib/athrecs/profile-awards";
import type { ProfileResult } from "@/lib/athrecs/profile-records";
import {
  COMPETITION_TIERS,
  recordedAwards,
  type CompetitionTier,
  type CompetitionContext,
  type PerformanceAward,
} from "@/lib/athrecs/competition-awards";

function ChampionshipMedal({ tier }: { tier: "olympic" | "paralympic" | "world" }) {
  return (
    <svg
      viewBox="0 0 36 40"
      className="size-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M11 2h5l5 11h-6zM25 2h-5l-5 11h6z" fill="currentColor" fillOpacity=".18" />
      {tier === "world" ? (
        <path d="m18 10 13 7v14l-13 7-13-7V17z" />
      ) : (
        <path d="M8 14C0 23 5 34 15 37M28 14c8 9 3 20-7 23M7 18l-4-2m3 8-4-1m6 7-4 1m7 3-3 3m21-19 4-2m-3 8 4-1m-6 7 4 1m-7 3 3 3" />
      )}
      <circle cx="18" cy="24" r="9" fill="currentColor" fillOpacity=".16" />
      {tier === "world" ? (
        <>
          <ellipse cx="18" cy="24" rx="4" ry="9" />
          <path d="M9 24h18m-16-5h14m-14 10h14" />
        </>
      ) : (
        <path
          d={
            tier === "olympic"
              ? "M18 16c-5 5 4 5-1 10 8-2 7-7 1-10Zm-4 13h8m-7 3h6"
              : "m18 18 2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z"
          }
        />
      )}
    </svg>
  );
}

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
    colour: "text-amber-700 dark:text-amber-300",
  },
  "personal-best": {
    icon: Star,
    label: "Personal best",
    colour: "text-violet-700 dark:text-violet-300",
  },
  milestone: {
    icon: Award,
    label: "Career milestone",
    colour: "text-fuchsia-700 dark:text-fuchsia-300",
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
  tier = "race",
  label: customLabel,
}: {
  kind: ProfileAwardKind;
  completion?: boolean;
  decorative?: boolean;
  tier?: CompetitionTier;
  label?: string;
}) {
  const { icon: Icon, label, colour } = awards[kind];
  const description = completion
    ? `Completed event · ${customLabel ?? label}`
    : (customLabel ?? label);
  const championshipMedal =
    ["gold", "silver", "bronze"].includes(kind) &&
    (tier === "olympic" || tier === "paralympic" || tier === "world");
  const ParticipationIcon =
    tier === "olympic" || tier === "paralympic" ? Flame : tier === "world" ? Globe2 : Flag;
  return (
    <span
      className={`inline-flex shrink-0 ${colour}`}
      data-profile-award={kind}
      data-award-tier={tier}
      aria-hidden={decorative || undefined}
      title={
        completion
          ? `${description} in the listed race or round — result verification is shown separately`
          : description
      }
    >
      {championshipMedal ? (
        <ChampionshipMedal tier={tier as "olympic" | "paralympic" | "world"} />
      ) : kind === "participation" ? (
        <ParticipationIcon className="size-6" aria-hidden="true" />
      ) : tier === "major" && kind === "trophy" ? (
        <Crown className="size-6" aria-hidden="true" />
      ) : ["national", "regional"].includes(tier) && kind === "trophy" ? (
        <Shield className="size-6" aria-hidden="true" />
      ) : (
        <Icon className="size-5" aria-hidden="true" />
      )}
      {!decorative ? <span className="sr-only">{description} · </span> : null}
    </span>
  );
}

export function CompletionMedal({ place }: { place?: string | number | null }) {
  return <ProfileAward kind={placingAward(place)} completion />;
}

export function ResultMedal({ result }: { result: ProfileResult }) {
  const award = recordedAwards(result)[0];
  return award ? <PerformanceAwardIcon award={award} /> : null;
}

export function PerformanceAwardIcon({ award }: { award: PerformanceAward }) {
  return (
    <ProfileAward
      kind={award.kind}
      tier={award.podium ? award.context.tier : "race"}
      label={award.label}
      completion
    />
  );
}

export function ClassificationAwards({ awards }: { awards: PerformanceAward[] }) {
  return awards
    .filter((award) => award.scope !== "overall")
    .map((award) => (
      <span
        key={award.scope}
        data-award-scope={award.scope}
        className="mt-1 flex items-center gap-1 text-xs font-normal"
      >
        <PerformanceAwardIcon award={award} />
        {award.scope === "category" ? award.category : "Gender"} ·{" "}
        {award.kind === "gold" ? "1st" : award.kind === "silver" ? "2nd" : "3rd"}
      </span>
    ));
}

export function CompetitionTierBadge({ context }: { context: CompetitionContext }) {
  if (context.tier === "race") return null;
  return (
    <span
      data-competition-tier={context.tier}
      className="mt-1 block text-[10px] font-medium text-muted"
    >
      {COMPETITION_TIERS[context.tier].label}
      {context.division ? ` · ${context.division}` : ""}
      {context.round !== "unknown" ? ` · ${context.round}` : ""}
    </span>
  );
}

export function ResultMedalKey() {
  return (
    <div className="space-y-2">
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
        <span>Podium places and completed events</span>
      </div>
      <details className="text-xs text-muted">
        <summary className="cursor-pointer font-medium">Award levels & categories</summary>
        <div className="mt-3 grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2">
            <ProfileAward kind="gold" tier="olympic" decorative />
            <span>
              Olympic / Paralympic medals
              <br />
              Verified final podiums
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProfileAward kind="gold" tier="world" decorative />
            <span>
              World Championship medals
              <br />
              Senior, Masters and youth labelled separately
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProfileAward kind="trophy" tier="major" decorative />
            <span>
              Major & international races
              <br />
              Distinct winning trophies
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ProfileAward kind="trophy" tier="national" decorative />
            <span>
              National, regional & club titles
              <br />
              Overall, gender and category kept separate
            </span>
          </div>
        </div>
        <p className="mt-2">
          AthRecs competition tiers describe the event, not an athlete rating. Age/category awards
          require an explicit category placing. Heat results and participation do not earn
          championship medals. Unclassified events keep standard race awards; verification is shown
          separately.
        </p>
      </details>
    </div>
  );
}
