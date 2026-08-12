import type { VenueNation } from "@/data/venue-details";
import { cn } from "@/lib/utils";

export type FlagKind = "Britain" | "Ireland";

export function flagKind(nation: VenueNation | string | undefined): FlagKind {
  return nation === "Ireland" ? "Ireland" : "Britain";
}

function UnionJack() {
  return (
    <svg viewBox="0 0 60 36" className="h-full w-full" aria-hidden>
      <rect width="60" height="36" fill="#012169" />
      <path d="M0 0 L60 36 M60 0 L0 36" stroke="#fff" strokeWidth="7.2" />
      <path d="M0 0 L60 36" stroke="#c8102e" strokeWidth="2.4" />
      <path d="M60 0 L0 36" stroke="#c8102e" strokeWidth="2.4" />
      <rect x="24" width="12" height="36" fill="#fff" />
      <rect y="12" width="60" height="12" fill="#fff" />
      <rect x="26.4" width="7.2" height="36" fill="#c8102e" />
      <rect y="14.4" width="60" height="7.2" fill="#c8102e" />
    </svg>
  );
}

function IrishTricolour() {
  return (
    <svg viewBox="0 0 60 36" className="h-full w-full" aria-hidden>
      <rect width="20" height="36" fill="#169b62" />
      <rect x="20" width="20" height="36" fill="#fff" />
      <rect x="40" width="20" height="36" fill="#ff883e" />
    </svg>
  );
}

export function NationFlag({
  nation,
  kind,
  className,
}: {
  nation?: VenueNation;
  kind?: FlagKind;
  className?: string;
}) {
  const resolved = kind ?? flagKind(nation);
  return (
    <span
      className={cn(
        "inline-flex h-7 w-11 shrink-0 overflow-hidden rounded-sm border-2 border-fg/20 bg-elevated shadow-sm",
        className,
      )}
      title={resolved === "Ireland" ? "Ireland" : "Britain"}
      aria-label={resolved === "Ireland" ? "Ireland" : "Britain"}
    >
      {resolved === "Ireland" ? <IrishTricolour /> : <UnionJack />}
    </span>
  );
}

export function NationBadge({
  nation,
  kind,
  className,
}: {
  nation?: VenueNation;
  kind?: FlagKind;
  className?: string;
}) {
  const resolved = kind ?? flagKind(nation);
  const label = resolved === "Ireland" ? "Ireland" : "Britain";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-2 py-1",
        className,
      )}
    >
      <NationFlag kind={resolved} className="h-6 w-10" />
      <span className="text-sm font-semibold text-fg">{label}</span>
    </span>
  );
}
