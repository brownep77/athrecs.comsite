import type { PublicAthletePreview } from "./public-athlete-preview";
import { absoluteUrl, SITE_NAME } from "./seo.ts";
import { publicAthleteNarrative, publicNationality } from "./public-athlete-narrative.ts";
import { publicAthleteResultPath } from "./public-athlete-result-pages.ts";

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
  const presentation = profile.biography.length ? profile.biographyPresentation : undefined;
  const title = profile.channelArchive
    ? `${profile.displayName} — English Channel swims & biography | ${SITE_NAME}`
    : presentation
      ? `${presentation.title} | ${SITE_NAME}`
      : `${profile.displayName} — ${sportLabel ? `${sportLabel} results & biography` : "Biography & latest results"}${nationality ? ` · ${nationality}` : ""} | ${SITE_NAME}`;
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
    (profile.channelArchive
      ? profile.displayName + "’s English Channel swims. " + profile.channelArchive.highlight
      : presentation?.description) ??
      `${identity || `${profile.displayName}'s athlete profile.`} ${resultsSummary}`,
  );
  const athleteUrl = absoluteUrl(publicAthleteResultPath(profile.slug));
  const url = absoluteUrl(publicAthleteResultPath(profile.slug, profile.resultPage));
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
      ...(profile.channelArchive
        ? { relatedLink: absoluteUrl("/swimming/english-channel/" + profile.slug) }
        : {}),
      mainEntity: {
        "@type": "Person",
        "@id": `${athleteUrl}#athlete`,
        name: profile.displayName,
        url: athleteUrl,
        ...(presentation?.alternateName ? { alternateName: presentation.alternateName } : {}),
        ...(presentation?.sameAs ? { sameAs: presentation.sameAs } : {}),
        ...(presentation?.podcast
          ? {
              subjectOf: {
                "@type": "PodcastSeries",
                name: presentation.podcast.name,
                url: presentation.podcast.url,
                datePublished: presentation.podcast.datePublished,
                creator: {
                  "@type": "Person",
                  "@id": `${athleteUrl}#athlete`,
                  name: profile.displayName,
                },
              },
            }
          : {}),
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
