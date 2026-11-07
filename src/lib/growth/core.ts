export const GROWTH_METRICS = [
  { key: "fixtures", label: "New fixtures", detail: "Race dates added to the calendar" },
  { key: "results", label: "Results", detail: "Results saved to athlete profiles" },
  { key: "profiles", label: "Profiles", detail: "New athlete profiles" },
  { key: "signups", label: "Sign-ups", detail: "New accounts" },
  { key: "claims", label: "Claims", detail: "Result and profile claims submitted" },
  {
    key: "selfReferrals",
    label: "Self-referrals",
    detail: "Profile set-up and result-match requests from athletes",
  },
  { key: "partners", label: "Partners", detail: "Brand sign-ups and partner applications" },
  {
    key: "importRejections",
    label: "Import rejections",
    detail: "Collected fixture rows held back or found to be duplicates",
  },
] as const;

export type GrowthMetric = (typeof GROWTH_METRICS)[number]["key"];
export type GrowthDay = { day: string } & Record<GrowthMetric, number>;
export type GrowthReport = { generatedAt: string; days: GrowthDay[] };

export function growthTotals(days: GrowthDay[], count: number) {
  const slice = days.slice(0, count);
  return Object.fromEntries(
    GROWTH_METRICS.map(({ key }) => [key, slice.reduce((sum, d) => sum + d[key], 0)]),
  ) as Record<GrowthMetric, number>;
}
