import { useState } from "react";
import { countryFlag } from "@/lib/athrecs/country-flags";

export function CountryFlag({
  country,
  showName = false,
}: {
  country?: string | null;
  showName?: boolean;
}) {
  const [failedCode, setFailedCode] = useState("");
  const flag = countryFlag(country);
  if (!flag.name) return <span aria-label="Country not specified">—</span>;
  if (!flag.code) return <span>{flag.name}</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span
        role="img"
        aria-label={flag.name}
        title={flag.name}
        data-country-code={flag.code}
        className="inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-white align-middle text-[8px] text-slate-700"
      >
        {failedCode === flag.code ? (
          <span aria-hidden="true">{flag.code.replace("GB-", "")}</span>
        ) : (
          <img
            src={`https://flagcdn.com/${flag.code.toLowerCase()}.svg`}
            width={24}
            height={16}
            alt=""
            aria-hidden="true"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailedCode(flag.code)}
            className="h-full w-full object-contain"
          />
        )}
      </span>
      {showName ? <span>{country}</span> : null}
    </span>
  );
}
