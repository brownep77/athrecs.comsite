import type { Edition, EntryOptionSeed, Series } from "./types";
import {
  ukMarathonEditionOverrides,
  ukMarathonEditionReplacements,
  ukMarathonEntryOptions,
  ukMarathonSeriesOverrides,
} from "./entry-options-uk-marathons";
import {
  ukHalfMarathonEditionOverrides,
  ukHalfMarathonEditionReplacements,
  ukHalfMarathonEntryOptions,
  ukHalfMarathonSeriesOverrides,
} from "./entry-options-uk-half-marathons";
import {
  ukTenKEditionOverrides,
  ukTenKEditionReplacements,
  ukTenKEntryOptions,
  ukTenKSeriesOverrides,
} from "./entry-options-uk-10ks";
import {
  allFixtureAliases,
  verifiedFixtureEditionOverrides,
  verifiedFixtureEditionReplacements,
  verifiedFixtureSeriesOverrides,
} from "./fixture-deduplication";

/** Duplicate catalogue slugs that resolve to one canonical race record. */
export const eventSlugAliases: Readonly<Record<string, string>> = {
  ...allFixtureAliases,
};

export function canonicalEventSlug(slug: string): string {
  return eventSlugAliases[slug] ?? slug;
}

/** All safe edition migrations needed before the catalogue is upserted. */
export const editionReplacements = [
  ...ukMarathonEditionReplacements,
  ...ukHalfMarathonEditionReplacements,
  ...ukTenKEditionReplacements,
  ...verifiedFixtureEditionReplacements,
];

/** Verified edition corrections across every entry-options research pass. */
export const editionOverrides: Record<string, Partial<Edition>> = {
  ...ukMarathonEditionOverrides,
  ...ukHalfMarathonEditionOverrides,
  ...ukTenKEditionOverrides,
  ...verifiedFixtureEditionOverrides,
};

/** Verified event metadata corrections across every entry-options research pass. */
export const seriesOverrides: Record<string, Partial<Series>> = {
  ...ukMarathonSeriesOverrides,
  ...ukHalfMarathonSeriesOverrides,
  ...ukTenKSeriesOverrides,
  ...verifiedFixtureSeriesOverrides,
};

/** Verified entry providers keyed by series, date and distance. */
export const entryOptions: Record<string, EntryOptionSeed[]> = {
  ...ukMarathonEntryOptions,
  ...ukHalfMarathonEntryOptions,
  ...ukTenKEntryOptions,
};
