import { useState } from "react";
import { countryAbbreviation, countryFlag } from "@/lib/athrecs/country-flags";

export function CountryFlag({
  country,
  showName = false,
  showCode = false,
}: {
  country?: string | null;
  showName?: boolean;
  showCode?: boolean;
}) {
  const [failedCode, setFailedCode] = useState("");
  const flag = countryFlag(country);
  // Northern Ireland has no separate flag emoji; use the sporting flag asset.
  const imageCode = flag.name === "Northern Ireland" ? "GB-NIR" : flag.code;
  const abbreviation = countryAbbreviation(country);
  if (!flag.name) return <span aria-label="Country not specified">—</span>;
  if (!flag.code) return <span>{flag.name}</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <span
        role="img"
        aria-label={flag.name}
        title={flag.name}
        data-country-code={imageCode}
        className="inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-slate-200 bg-white align-middle text-[8px] text-slate-700"
      >
        {failedCode === imageCode ? (
          <span aria-hidden="true">{abbreviation}</span>
        ) : (
          <img
            src={`https://flagcdn.com/${imageCode.toLowerCase()}.svg`}
            width={24}
            height={16}
            alt=""
            aria-hidden="true"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailedCode(imageCode)}
            className="h-full w-full object-contain"
          />
        )}
      </span>
      {showCode ? (
        <abbr title={flag.name} className="no-underline">
          {abbreviation}
        </abbr>
      ) : null}
      {showName ? <span>{country}</span> : null}
    </span>
  );
}
