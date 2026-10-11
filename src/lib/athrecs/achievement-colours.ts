import type { CSSProperties } from "react";

/** Stable category colours. Medal metals are reserved for the placing icons. */
export const ACHIEVEMENT_HUES = {
  "world-record": 315,
  olympic: 225,
  paralympic: 185,
  "world-championship": 0,
  continental: 24,
  national: 270,
  regional: 52,
  county: 82,
  club: 145,
  "age-group": 335,
  team: 200,
  ranking: 290,
  "personal-best": 255,
  finishes: 165,
  marathons: 240,
  ultras: 280,
  majors: 35,
  "original-six": 60,
  countries: 15,
  sports: 205,
  years: 105,
  "personal-improvement": 175,
  "marathon-week": 220,
  "consecutive-marathons": 300,
  "first-mile": 120,
  "first-5K": 150,
  "first-10K": 195,
  "first-half marathon": 350,
  parkrun: 135,
  volunteer: 95,
} as const;

function hashKey(key: string) {
  let value = 2166136261;
  for (const char of key) value = Math.imul(value ^ char.charCodeAt(0), 16777619);
  // Mix neighbouring IDs so similar achievement names receive visibly different hues.
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}

/** One colour per distinct label in a collection; new labels use distinct shades. */
export function achievementPalette(keys: readonly string[]): Map<string, CSSProperties> {
  const used = new Set<string>();
  const palette = new Map<string, CSSProperties>();
  for (const key of [...new Set(keys)].sort()) {
    const category = key.replace(/^(?:metric|milestone|major|career|win|pb):/, "");
    const hash = hashKey(key);
    let hue = ACHIEVEMENT_HUES[category as keyof typeof ACHIEVEMENT_HUES] ?? (hash % 36000) / 100;
    // Summary counts and earned milestones use different shades of their category.
    const lightness = key.startsWith("milestone:") ? 85 : key.startsWith("metric:") ? 93 : 89;
    let background = `hsl(${hue} 68% ${lightness}%)`;
    while (used.has(background)) {
      hue = Math.round(((hue + 0.37) % 360) * 100) / 100;
      background = `hsl(${hue} 68% ${lightness}%)`;
    }
    used.add(background);
    palette.set(key, {
      backgroundColor: background,
      borderColor: `hsl(${hue} 52% 55%)`,
      color: `hsl(${hue} 75% 18%)`,
    });
  }
  return palette;
}
