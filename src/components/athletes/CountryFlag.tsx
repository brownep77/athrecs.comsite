import { NationFlag } from "@/components/flags/NationFlag";
import { useId } from "react";
import { countryFlag } from "@/lib/athrecs/country-flags";

export function CountryFlag({
  country,
  showName = false,
}: {
  country?: string | null;
  showName?: boolean;
}) {
  const id = useId();
  const flag = countryFlag(country);
  if (!flag.name) return <span aria-label="Country not specified">—</span>;
  if (!flag.code) return <span>{flag.name}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        tabIndex={0}
        role="img"
        aria-label={flag.name}
        aria-describedby={id}
        className="group relative inline-flex cursor-help items-center rounded focus-visible:outline-2 focus-visible:outline-accent"
      >
        {flag.code === "GB" || flag.code === "IE" ? (
          <span aria-hidden="true">
            <NationFlag info={{ iso: flag.code, name: flag.name }} className="h-4 w-6 border" />
          </span>
        ) : flag.code === "GB-ENG" ? (
          <svg aria-hidden="true" width="22" height="15" viewBox="0 0 30 20">
            <path fill="#fff" stroke="#ddd" d="M0 0h30v20H0z" />
            <path stroke="#ce1124" strokeWidth="4" d="M15 0v20M0 10h30" />
          </svg>
        ) : flag.code === "GB-SCT" ? (
          <svg aria-hidden="true" width="22" height="15" viewBox="0 0 30 20">
            <path fill="#0065bd" d="M0 0h30v20H0z" />
            <path stroke="#fff" strokeWidth="4" d="m0 0 30 20M30 0 0 20" />
          </svg>
        ) : (
          <span aria-hidden="true" className="text-lg leading-none">
            {flag.code === "GB-WLS"
              ? "🏴\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}"
              : flag.emoji}
          </span>
        )}
        <span
          id={id}
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs font-normal text-white opacity-0 shadow group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {flag.name}
        </span>
      </span>
      {showName ? <span>{country}</span> : null}
    </span>
  );
}
