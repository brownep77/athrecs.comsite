import { Link } from "@tanstack/react-router";
import { BadgeCheck, CircleHelp, GitMerge, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  resolveClubVerification,
  type ClubVerificationTier,
} from "@/lib/athrecs/club-verification";

const TIER_STYLES: Record<ClubVerificationTier, string> = {
  V1: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  V2: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  V3: "border-border bg-elevated text-muted",
  V4: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  V5: "border-orange-500/40 bg-orange-500/10 text-orange-800 dark:text-orange-200",
  NA: "border-border bg-transparent text-subtle",
};

function TierIcon({ tier }: { tier: ClubVerificationTier }) {
  if (tier === "V1" || tier === "V2") {
    return <BadgeCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  }
  if (tier === "V5") {
    return <GitMerge className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  }
  if (tier === "V4") {
    return <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden />;
  }
  return <CircleHelp className="h-3.5 w-3.5 shrink-0" aria-hidden />;
}

type Props = {
  slug: string;
  website?: string | null;
  member_count?: number;
  name?: string;
  /** compact = small chip; button = chip + criteria link affordance */
  variant?: "compact" | "button";
  className?: string;
};

/**
 * Verification status control for a club.
 * Sits next to the club name on list and detail pages; links to full criteria.
 */
export function ClubVerificationBadge({
  slug,
  website,
  member_count,
  name,
  variant = "button",
  className,
}: Props) {
  const info = resolveClubVerification({ slug, website, member_count, name });

  const chip = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        TIER_STYLES[info.tier],
        className,
      )}
      title={info.reason}
    >
      <TierIcon tier={info.tier} />
      {info.label}
    </span>
  );

  if (variant === "compact") {
    return chip;
  }

  return (
    <Link
      to="/clubs"
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 no-underline",
        className,
      )}
      title={`${info.reason} — view verification criteria`}
      aria-label={`${info.label}: ${info.reason}. View club verification criteria.`}
    >
      {chip}
      <span className="text-[11px] font-medium text-accent opacity-90 group-hover:underline">
        Criteria
      </span>
    </Link>
  );
}
