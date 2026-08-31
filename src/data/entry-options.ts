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
  ukTenKRelease64EditionOverrides,
  ukTenKRelease64EntryOptions,
  ukTenKRelease64SeriesOverrides,
} from "./uk-10k-release-64";
import {
  allFixtureAliases,
  verifiedFixtureEditionOverrides,
  verifiedFixtureEditionReplacements,
  verifiedFixtureSeriesOverrides,
} from "./fixture-deduplication";
import { ukFiveKEditionOverrides, ukFiveKSeriesOverrides } from "./uk-5k-races";
import {
  ukIrelandFiveKReleaseEditionOverrides,
  ukIrelandFiveKReleaseEditionReplacements,
  ukIrelandFiveKReleaseSeriesOverrides,
} from "./uk-ireland-five-k-release-2026-08-28";
import {
  runrecsFinalFiveKEditionOverrides,
  runrecsFinalFiveKSeriesOverrides,
} from "./runrecs-five-k-final-release-2026-08-31";
import {
  verifiedFiveMileEditionOverrides,
  verifiedFiveMileSeriesOverrides,
} from "./five-mile-races-uk-ireland";
import { verifiedTenKFollowupSeriesOverrides } from "./ten-k-races-uk-ireland-followup";
import { verifiedTenMileSeriesOverrides } from "./ten-mile-races-uk-ireland";
import {
  verifiedHalfMarathonFollowupEditionOverrides,
  verifiedHalfMarathonFollowupEntryOptions,
  verifiedHalfMarathonFollowupSeriesOverrides,
} from "./half-marathons-uk-ireland-followup";
import {
  verifiedHalfToTwentyMileEditionOverrides,
  verifiedHalfToTwentyMileSeriesOverrides,
} from "./half-to-20-mile-races-uk-ireland";
import {
  dailyHalfTenMileEditionOverrides,
  dailyHalfTenMileEntryOptions,
  dailyHalfTenMileSeriesOverrides,
} from "./half-ten-mile-races-uk-ireland-daily-followup";
import {
  nonStandardDistanceEditionOverrides,
  nonStandardDistanceEditionReplacements,
  nonStandardDistanceSeriesOverrides,
  nonStandardDistanceSlugAliases,
} from "./non-standard-races-uk-ireland";
import {
  prominentUkIrelandEditionOverrides,
  prominentUkIrelandEntryOptions,
  prominentUkIrelandSeriesOverrides,
} from "./uk-ireland-prominent-races-2026-2027";

const SEATON_CLASSIC_KEY = "seaton-classic-10k|2026-09-26|10K";
const SEATON_CLASSIC_SOURCE = "https://athleticsni.org/Fixtures/Road-Running";

/** Duplicate catalogue slugs that resolve to one canonical race record. */
export const eventSlugAliases: Readonly<Record<string, string>> = {
  ...allFixtureAliases,
  ...nonStandardDistanceSlugAliases,
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
  ...nonStandardDistanceEditionReplacements,
  ...ukIrelandFiveKReleaseEditionReplacements,
  {
    seriesSlug: "vjosa-wild-river-ultra-trail",
    distance: "100K",
    fromDate: "2026-10-24",
    toDate: "2026-10-25",
  },
];

/** Verified edition corrections across every entry-options research pass. */
export const editionOverrides: Record<string, Partial<Edition>> = {
  ...ukMarathonEditionOverrides,
  ...ukHalfMarathonEditionOverrides,
  ...ukTenKEditionOverrides,
  ...ukTenKRelease64EditionOverrides,
  ...verifiedFixtureEditionOverrides,
  ...ukFiveKEditionOverrides,
  ...ukIrelandFiveKReleaseEditionOverrides,
  ...runrecsFinalFiveKEditionOverrides,
  ...verifiedFiveMileEditionOverrides,
  ...verifiedHalfMarathonFollowupEditionOverrides,
  ...verifiedHalfToTwentyMileEditionOverrides,
  ...dailyHalfTenMileEditionOverrides,
  ...nonStandardDistanceEditionOverrides,
  ...prominentUkIrelandEditionOverrides,
  [SEATON_CLASSIC_KEY]: {
    status: "TBC",
    entryUrl: SEATON_CLASSIC_SOURCE,
    source: SEATON_CLASSIC_SOURCE,
    notes:
      "The fixture and date are confirmed by Athletics Northern Ireland; direct entry availability remains to be confirmed.",
  },
};

/** Verified event metadata corrections across every entry-options research pass. */
export const seriesOverrides: Record<string, Partial<Series>> = {
  ...ukMarathonSeriesOverrides,
  ...ukHalfMarathonSeriesOverrides,
  ...ukTenKSeriesOverrides,
  ...ukTenKRelease64SeriesOverrides,
  ...verifiedFixtureSeriesOverrides,
  ...ukFiveKSeriesOverrides,
  ...ukIrelandFiveKReleaseSeriesOverrides,
  ...runrecsFinalFiveKSeriesOverrides,
  ...verifiedFiveMileSeriesOverrides,
  ...verifiedTenKFollowupSeriesOverrides,
  ...verifiedTenMileSeriesOverrides,
  ...verifiedHalfMarathonFollowupSeriesOverrides,
  ...verifiedHalfToTwentyMileSeriesOverrides,
  ...dailyHalfTenMileSeriesOverrides,
  ...nonStandardDistanceSeriesOverrides,
  ...prominentUkIrelandSeriesOverrides,
};

/** Verified entry providers keyed by series, date and distance. */
export const entryOptions: Record<string, EntryOptionSeed[]> = {
  ...ukMarathonEntryOptions,
  ...ukHalfMarathonEntryOptions,
  ...ukTenKEntryOptions,
  ...ukTenKRelease64EntryOptions,
  ...verifiedHalfMarathonFollowupEntryOptions,
  ...dailyHalfTenMileEntryOptions,
  ...prominentUkIrelandEntryOptions,
  [SEATON_CLASSIC_KEY]: [
    {
      providerCode: "official-seaton-classic-10k-2026",
      providerName: "Athletics Northern Ireland",
      entryUrl: SEATON_CLASSIC_SOURCE,
      entryType: "official",
      status: "unknown",
      checkedAt: "2026-08-27",
      sourceUrl: SEATON_CLASSIC_SOURCE,
      isVerified: true,
      isPrimary: true,
      notes: "Official governing-body fixture page; direct entry page not yet published.",
    },
  ],
};
