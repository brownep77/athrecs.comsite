import type { PublicAthletePreview } from "./public-athlete-preview";
import { absoluteUrl, SITE_NAME } from "./seo.ts";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

/** Keep snippets readable without changing the meaning or publishing extra records. */
export function searchSnippet(value: string, limit = 175): string {
  const text = clean(value);
  if (text.length <= limit) return text;
  return `${text
    .slice(0, limit - 1)
    .replace(/\s+\S*$/, "")
    .trimEnd()}…`;
}

/** Only the anonymous, five-result DTO may supply public search metadata. */
export function publicAthleteSearchContent(profile: PublicAthletePreview) {
  const sports = [
    ...new Set(
      profile.sports.map((sport) =>
        /^(running|parkrun|trail running|ultra running)$/i.test(sport) ? "Running" : sport,
      ),
    ),
  ];
  const sportLabel = sports.length <= 2 ? sports.join(" & ") : "Sport";
  const title = `${profile.displayName} — ${sportLabel ? `${sportLabel} results & biography` : "Biography & latest results"} | ${SITE_NAME}`;
  const biography = clean(profile.biography.join(" "));
  const events = [
    ...new Set(
      profile.entries
        .map((entry) =>
          clean(
            entry.kind === "recorded" ? entry.result.eventName : entry.result.performance.meeting,
          ),
        )
        .filter(Boolean),
    ),
  ].slice(0, 2);
  // "Recorded" describes the table, without upgrading unverified results to verified finishes.
  const resultsSummary = events.length
    ? `Recorded results include ${events.join(" and ")}.`
    : "View the public biography and latest recorded results.";
  const intro = biography.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || biography;
  const description = searchSnippet(
    `${intro || `${profile.displayName}'s athlete profile.`} ${resultsSummary}`,
  );
  const url = absoluteUrl(`/athletes/${encodeURIComponent(profile.slug)}`);
  return {
    title,
    description,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: "en-GB",
      mainEntity: {
        "@type": "Person",
        "@id": `${url}#athlete`,
        name: profile.displayName,
        url,
        ...(biography ? { description: biography } : {}),
      },
    },
  };
}
