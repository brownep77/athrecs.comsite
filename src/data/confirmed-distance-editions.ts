import corrections from "./confirmed-distance-editions-2026-10-26.json" with { type: "json" };
import type { Edition } from "./types";

/** Edition-specific source corrections; original values remain in the staff audit. */
export function reviewConfirmedDistances(editions: Edition[], eventSlugs: Set<string>): Edition[] {
  const key = (edition: Edition) => `${edition.seriesSlug}|${edition.date}|${edition.distance}`;
  // Some canonical events exist only in the live catalogue. Do not invent seed identities.
  const replacements = (corrections as Array<Edition & { replacesDistance?: string }>).filter(
    (edition) => eventSlugs.has(edition.seriesSlug),
  );
  const replaced = new Set(
    replacements.flatMap((edition) => [
      key(edition),
      ...(edition.replacesDistance
        ? [`${edition.seriesSlug}|${edition.date}|${edition.replacesDistance}`]
        : []),
    ]),
  );
  return [
    ...editions.filter((edition) => !replaced.has(key(edition))),
    ...replacements.map(({ replacesDistance, ...edition }) => {
      const original = editions.find(
        (candidate) =>
          candidate.seriesSlug === edition.seriesSlug &&
          candidate.date === edition.date &&
          candidate.distance === (replacesDistance ?? edition.distance),
      );
      return { ...original, ...edition };
    }),
  ];
}
