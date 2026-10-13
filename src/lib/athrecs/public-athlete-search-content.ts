import type { PublicAthletePreview } from "./public-athlete-preview";
import { absoluteUrl, SITE_NAME } from "./seo.ts";
import { publicAthleteNarrative, publicNationality } from "./public-athlete-narrative.ts";

import { searchSnippet } from "./search-text.ts";
export { searchSnippet } from "./search-text.ts";

const clean = (value: string) => value.replace(/\s+/g, " ").trim();

/** Only the anonymous preview and its bounded public career summary supply metadata. */
export function publicAthleteSearchContent(profile: PublicAthletePreview) {
  const sports = [
    ...new Set(
      profile.sports.map((sport) =>
        /^(running|parkrun|trail running|ultra running)$/i.test(sport) ? "Running" : sport,
      ),
    ),
  ];
  const sportLabel = sports.length <= 2 ? sports.join(" & ") : "Sport";
  const nationality = publicNationality(profile.nationality);
  const title = `${profile.displayName} — ${sportLabel ? `${sportLabel} results & biography` : "Biography & latest results"}${nationality ? ` · ${nationality}` : ""} | ${SITE_NAME}`;
  const biography = clean(publicAthleteNarrative(profile).join(" "));
  const career = profile.careerSummary;
  const careerText = career
    ? `${career.text} Selected recorded events: ${career.events
        .map((event) => `${event.name} (${event.year}; ${event.verification.toLowerCase()})`)
        .join("; ")}.`
    : "";
  const events = [
    ...new Set(
      career?.events.length
        ? career.events.map((event) => event.name)
        : profile.entries
            .map((entry) =>
              clean(
                entry.kind === "recorded"
                  ? entry.result.eventName
                  : entry.result.performance.meeting,
              ),
            )
            .filter(Boolean),
    ),
  ].slice(0, 2);
  // "Recorded" describes the table, without upgrading unverified results to verified finishes.
  const resultsSummary = events.length
    ? `Recorded results include ${events.join(" and ")}.`
    : "View the public biography and latest recorded results.";
  // Initials belong to the name, not the end of the first biography sentence.
  const namePrefix = biography.startsWith(clean(profile.displayName))
    ? clean(profile.displayName)
    : "";
  const remainder = biography.slice(namePrefix.length).trimStart();
  const sentence = remainder.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || remainder;
  const intro = [namePrefix, sentence].filter(Boolean).join(" ");
  const generatedIntro =
    /with (?:.+ results recorded on ATHRECS|a public profile on ATHRECS)\./.test(intro);
  const identity = generatedIntro
    ? `${profile.displayName} — ${sportLabel || "Sport"} results${nationality ? `; recorded nationality: ${nationality}` : ""}.`
    : intro;
  const description = searchSnippet(
    `${identity || `${profile.displayName}'s athlete profile.`} ${resultsSummary}`,
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
        ...(nationality ? { nationality: { "@type": "Country", name: nationality } } : {}),
        ...(profile.club && !/^(?:unattached|unknown|tbc|n\/?a)$/i.test(profile.club.trim())
          ? {
              memberOf: {
                "@type": "SportsOrganization",
                name: profile.club,
                ...(profile.clubSlug
                  ? { url: absoluteUrl(`/clubs/${encodeURIComponent(profile.clubSlug)}`) }
                  : {}),
              },
            }
          : {}),
        ...(biography || careerText
          ? { description: [biography, careerText].filter(Boolean).join(" ") }
          : {}),
      },
    },
  };
}
