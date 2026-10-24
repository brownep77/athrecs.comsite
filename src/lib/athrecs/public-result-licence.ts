/** Required public reuse credits, separate from private result-verification evidence. */
export const PUBLIC_RESULT_LICENCE_CREDIT_IDS = ["pace-notes-marathon-corpus-v3"] as const;
export type PublicResultLicenceCreditId = (typeof PUBLIC_RESULT_LICENCE_CREDIT_IDS)[number];

const credits = {
  "pace-notes-marathon-corpus-v3": {
    creator: "Andrew Kam / Pace Notes",
    title: "Pace Notes: marathon race results corpus (5 km splits)",
    publicationUrl: "https://doi.org/10.6084/m9.figshare.33965155.v3",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    changes: "Selected London Marathon editions; names reordered for display.",
  },
} as const;

/** Only fixed registry identifiers may cross the public evidence boundary. */
export function publicResultLicenceCreditIds(value: unknown): PublicResultLicenceCreditId[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter((id): id is PublicResultLicenceCreditId =>
            PUBLIC_RESULT_LICENCE_CREDIT_IDS.some((allowed) => id === allowed),
          ),
        ),
      ]
    : [];
}

export function publicResultLicenceCredit(id: PublicResultLicenceCreditId) {
  return credits[id];
}

/** Use the complete visible history so display deduplication cannot discard a credit. */
export function profileResultLicenceCredits(
  histories: readonly {
    provider?: unknown;
    publicLicenceCredits?: unknown;
    performances?: readonly { profileExcluded?: boolean; syntheticTest?: boolean }[];
  }[],
): PublicResultLicenceCreditId[] {
  return [
    ...new Set(
      histories.flatMap((history) => {
        if (!history.performances?.some((row) => !row.profileExcluded && !row.syntheticTest))
          return [];
        return history.provider === "Pace Notes"
          ? [PUBLIC_RESULT_LICENCE_CREDIT_IDS[0]]
          : publicResultLicenceCreditIds(history.publicLicenceCredits);
      }),
    ),
  ];
}
