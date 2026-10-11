function sourceLabel(url: string, provider?: string | null): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "worldathletics.org") return "World Athletics";
    if (host === "belgraveharriers.info" || host === "belgraveharriers.com")
      return "Belgrave Harriers";
    if (host === "paulevanscoaching.com") return "Paul Evans Coaching";
  } catch {
    // Keep the recorded attribution when the source has no usable hostname.
  }
  return provider?.trim() || "Result source";
}

/** Staff-only access to the original evidence, including source disagreements. */
export function ResultEvidence({
  notes,
  provider,
  urls,
  splits = [],
  showEvidence = false,
  sourceLabels = [],
}: {
  notes?: string;
  provider?: string | null;
  urls: readonly string[];
  splits?: readonly { label: string; time: string }[];
  showEvidence?: boolean;
  sourceLabels?: readonly { label: string; url: string }[];
}) {
  if (!showEvidence) return null;
  const visibleNotes = notes;
  const visibleUrls = urls;
  const visibleProvider = provider;
  if (!visibleNotes && !visibleUrls.length && !splits.length) return null;
  return (
    <details className="result-evidence mt-1 max-w-lg whitespace-normal text-xs font-normal text-muted">
      <summary className="cursor-pointer text-accent">Details & sources</summary>
      <div className="space-y-2 py-2 leading-relaxed">
        {splits.map((split) => (
          <p key={`${split.label}:${split.time}`}>
            {split.label}: <strong>{split.time}</strong>
          </p>
        ))}
        {visibleNotes ? <p className="whitespace-pre-line">{visibleNotes}</p> : null}
        {visibleUrls.length ? (
          <ul className="space-y-1">
            {visibleUrls.map((url, i) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-8 items-center text-accent underline underline-offset-2"
                >
                  {sourceLabels.find((source) => source.url === url)?.label ||
                    sourceLabel(url, visibleProvider)}
                  {visibleUrls.length > 1 ? ` · source ${i + 1}` : ""} ↗
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}
