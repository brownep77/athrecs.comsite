import { isWmmSource, publicProfileResultNotes } from "@/lib/athrecs/profile-source-presentation";

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

/** Compact public access to the original evidence, including source disagreements. */
export function ResultEvidence({
  notes,
  provider,
  urls,
  splits = [],
  showEvidence = false,
}: {
  notes?: string;
  provider?: string | null;
  urls: readonly string[];
  splits?: readonly { label: string; time: string }[];
  showEvidence?: boolean;
}) {
  const visibleNotes = showEvidence ? notes : publicProfileResultNotes(notes, provider, urls);
  const visibleUrls = showEvidence ? urls : urls.filter((url) => !isWmmSource(null, [url]));
  const visibleProvider = !showEvidence && isWmmSource(provider) ? null : provider;
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
                  {sourceLabel(url, visibleProvider)}
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
