/**
 * Frozen open-category reference times, not current world records.
 * Source: Alan Jones / Tom Bernhard, USATF MLDR 2025 road age-grading tables,
 * row "OC sec" on the first worksheet. Licensed CC0-1.0.
 * Male workbook title: Version 2025-07-27; retrieved 2026-10-23.
 * Provenance and exact source blob SHAs: docs/performance-rating-standards.md.
 */
export const PERFORMANCE_STANDARDS_VERSION = "usatf-mldr-2025-open-v2";

export type PerformanceRatingCategory = "men" | "women";
export type PerformanceRatingDistance = { key: string; label: string; km: number };
export type PerformanceReferenceStandard = PerformanceRatingDistance & {
  men: number;
  women: number;
};

export const PERFORMANCE_REFERENCE_STANDARDS: readonly PerformanceReferenceStandard[] = [
  { key: "1mi", label: "1 mile", km: 1.609344, men: 227, women: 253 },
  { key: "5K", label: "5K", km: 5, men: 769, women: 834 },
  { key: "6K", label: "6K", km: 6, men: 930, women: 1010 },
  { key: "4mi", label: "4 miles", km: 6.437376, men: 1000, women: 1087 },
  { key: "8K", label: "8K", km: 8, men: 1255, women: 1365 },
  { key: "5mi", label: "5 miles", km: 8.04672, men: 1264, women: 1375 },
  { key: "10K", label: "10K", km: 10, men: 1584, women: 1726 },
  { key: "7mi", label: "7 miles", km: 11.265408, men: 1790, women: 1950 },
  { key: "12K", label: "12K", km: 12, men: 1915, women: 2084 },
  { key: "15K", label: "15K", km: 15, men: 2415, women: 2629 },
  { key: "10mi", label: "10 miles", km: 16.09344, men: 2595, women: 2832 },
  { key: "20K", label: "20K", km: 20, men: 3260, women: 3557 },
  { key: "Half", label: "Half marathon", km: 21.0975, men: 3451, women: 3772 },
  { key: "25K", label: "25K", km: 25, men: 4110, women: 4500 },
  { key: "30K", label: "30K", km: 30, men: 4980, women: 5450 },
  { key: "Marathon", label: "Marathon", km: 42.195, men: 7235, women: 7796 },
  { key: "50K", label: "50K", km: 50, men: 8820, women: 9390 },
  { key: "50mi", label: "50 miles", km: 80.4672, men: 16080, women: 17100 },
  { key: "100K", label: "100K", km: 100, men: 21360, women: 23591 },
  { key: "150K", label: "150K", km: 150, men: 36300, women: 39700 },
  { key: "100mi", label: "100 miles", km: 160.9344, men: 39790, women: 43500 },
  { key: "200K", label: "200K", km: 200, men: 52800, women: 57600 },
];
