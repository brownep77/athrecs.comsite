import {
  displayCountryName,
  isoToFlagEmoji,
  resolveCountry,
  type CountryInfo,
} from "@/lib/athrecs/countries";
import { cn } from "@/lib/utils";

export type FlagKind = "UnitedKingdom" | "Ireland" | "World" | string;

export function countryInfoFromNation(
  nation?: string,
  kind?: FlagKind,
): CountryInfo {
  if (kind === "UnitedKingdom") return resolveCountry({ country: "United Kingdom" });
  if (kind === "Ireland") return resolveCountry({ country: "Ireland" });
  if (kind === "World") return resolveCountry({ country: "World" });
  return resolveCountry({ country: nation, city: nation, name: nation });
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

function WorldFlag() {
  return (
    <svg viewBox="0 0 60 36" className="h-full w-full" aria-hidden>
      <rect width="60" height="36" fill="#1a365d" />
      <circle cx="30" cy="18" r="11" fill="none" stroke="#7dd3fc" strokeWidth="1.4" />
      <ellipse cx="30" cy="18" rx="5" ry="11" fill="none" stroke="#7dd3fc" strokeWidth="1.2" />
      <path d="M19 18h22 M30 7v22 M21 11h18 M21 25h18" stroke="#7dd3fc" strokeWidth="1" />
    </svg>
  );
}

function EmojiFlag({ iso }: { iso: string }) {
  return (
    <span className="flex h-full w-full items-center justify-center bg-elevated text-[1.35rem] leading-none">
      {isoToFlagEmoji(iso)}
    </span>
  );
}

function FlagFace({ info }: { info: CountryInfo }) {
  if (info.iso === "GB") return <UnionJack />;
  if (info.iso === "IE") return <IrishTricolour />;
  if (info.iso === "WORLD") return <WorldFlag />;
  return <EmojiFlag iso={info.iso} />;
}

export function NationFlag({
  nation,
  kind,
  info,
  className,
}: {
  nation?: string;
  kind?: FlagKind;
  info?: CountryInfo;
  className?: string;
}) {
  const resolved = info ?? countryInfoFromNation(nation, kind);
  const label = displayCountryName(resolved);
  return (
    <span
      className={cn(
        "inline-flex h-7 w-11 shrink-0 overflow-hidden rounded-sm border-2 border-fg/20 bg-elevated shadow-sm",
        className,
      )}
      title={label}
      aria-label={label}
    >
      <FlagFace info={resolved} />
    </span>
  );
}

export function NationBadge({
  nation,
  kind,
  info,
  className,
}: {
  nation?: string;
  kind?: FlagKind;
  info?: CountryInfo;
  className?: string;
}) {
  const resolved = info ?? countryInfoFromNation(nation, kind);
  const label = displayCountryName(resolved);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-border bg-elevated px-2 py-1",
        className,
      )}
    >
      <NationFlag info={resolved} className="h-6 w-10" />
      <span className="text-sm font-semibold text-fg">{label}</span>
    </span>
  );
}
