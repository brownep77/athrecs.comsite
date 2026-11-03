import { upcomingRoadEditions } from "./road-marathon-calendar";
import { createServerFn } from "@tanstack/react-start";
import type { MarathonCountry, RoadRace } from "../../data/road-marathons/types";
import { isResultDocument } from "../athrecs/result-document";

export function publicRoadRace(race: RoadRace): RoadRace {
  const resultUrls = new Set([
    race.resultsUrl,
    ...race.pastEditions.flatMap((edition) => [edition.resultsUrl, ...edition.categories.map((category) => category.sourceUrl)]),
  ]);
  if (race.fieldSize && /finishers?|result/i.test(race.fieldSize.basis)) resultUrls.add(race.fieldSize.sourceUrl);
  // Organisers sometimes use their own homepage for entry, course and result information.
  const privateUrl = (url: string, label = "") =>
    isResultDocument(url, label) || (resultUrls.has(url) && url !== race.officialUrl && !race.entryMethods.some((method) => method.url === url));
  const keep = (link: { url: string; label: string }) => !privateUrl(link.url, link.label);
  const information = (url: string) => privateUrl(url) ? "" : url;
  return {
    ...race,
    officialUrl: information(race.officialUrl),
    resultsUrl: "",
    resultsLabel: undefined,
    editions: race.editions.map((edition) => ({ ...edition, sourceUrl: information(edition.sourceUrl) })),
    dateNotes: race.dateNotes?.map((note) => ({ ...note, sourceUrl: information(note.sourceUrl) })),
    fieldSize: race.fieldSize && { ...race.fieldSize, sourceUrl: information(race.fieldSize.sourceUrl) },
    practical: race.practical?.map((item) => ({ ...item, sourceUrl: information(item.sourceUrl) })),
    course: { ...race.course, links: race.course.links.filter(keep) },
    entryMethods: race.entryMethods.filter((method) => !privateUrl(method.url)),
    media: race.media.filter(keep),
    pastEditions: race.pastEditions.map((edition) => ({
      ...edition, resultsUrl: "", categories: edition.categories.map((category) => ({ ...category, sourceUrl: "" })),
    })),
    sources: race.sources.filter(keep),
  };
}

export const getRoadGuideCountry = createServerFn({ method: "GET" })
  .validator((input: { country: MarathonCountry; half: boolean }) => input)
  .handler(async ({ data }) => {
    const races = data.half
      ? (await import("../../data/road-half-marathons")).roadHalfMarathonsForCountry(data.country)
      : (await import("../../data/road-marathons")).roadMarathonsForCountry(data.country);
    return races.map(publicRoadRace);
  });

export const getRoadGuideRace = createServerFn({ method: "GET" })
  .validator((slug: string) => slug)
  .handler(async ({ data }) => {
    const { roadHalfMarathonBySlug, roadHalfMarathonsForCountry } = await import("../../data/road-half-marathons");
    const { roadMarathonBySlug, roadMarathonsForCountry } = await import("../../data/road-marathons");
    const race = roadHalfMarathonBySlug(data) ?? roadMarathonBySlug(data);
    if (!race) return null;
    const candidates = race.distanceKm === 21.0975 ? roadHalfMarathonsForCountry(race.country) : roadMarathonsForCountry(race.country);
    const now = new Date().toISOString();
    const related = candidates
      .filter((item) => item.slug !== race.slug)
      .sort(
        (a, b) =>
          Number(b.region === race.region) - Number(a.region === race.region) ||
          a.name.localeCompare(b.name),
      )
      .slice(0, 4)
      .map((item) => ({
        slug: item.slug,
        name: item.name,
        city: item.city,
        region: item.region,
        timeZone: item.timeZone,
        profile: item.course.profile,
        nextDate: upcomingRoadEditions(item, now)[0]?.date,
        field: item.fieldSize
          ? `${item.fieldSize.display} (${item.fieldSize.basis}, ${item.fieldSize.year})`
          : undefined,
      }));
    return { race: publicRoadRace(race), related, now };
  });
