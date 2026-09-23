/** Shared presentation palette: colours depend on the category, never the athlete or card order. */
const tones = {
  coral: "border-red-200 bg-red-100 text-red-950",
  gold: "border-amber-200 bg-amber-100 text-amber-950",
  lime: "border-lime-200 bg-lime-100 text-lime-950",
  green: "border-green-200 bg-green-100 text-green-950",
  teal: "border-teal-200 bg-teal-100 text-teal-950",
  cyan: "border-cyan-200 bg-cyan-100 text-cyan-950",
  blue: "border-blue-200 bg-blue-100 text-blue-950",
  mint: "border-emerald-200 bg-emerald-100 text-emerald-950",
  peach: "border-orange-200 bg-orange-100 text-orange-950",
  sky: "border-sky-200 bg-sky-100 text-sky-950",
  lilac: "border-violet-200 bg-violet-100 text-violet-950",
  orchid: "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-950",
  rose: "border-rose-200 bg-rose-100 text-rose-950",
  lemon: "border-yellow-200 bg-yellow-100 text-yellow-950",
  periwinkle: "border-indigo-200 bg-indigo-100 text-indigo-950",
  lavender: "border-purple-200 bg-purple-100 text-purple-950",
  sand: "border-stone-200 bg-stone-100 text-stone-950",
  slate: "border-slate-200 bg-slate-100 text-slate-950",
  pink: "border-pink-200 bg-pink-100 text-pink-950",
} as const;

export type ProfileTone = keyof typeof tones;
export const profileToneClass = (tone: ProfileTone) => tones[tone];

const standardDistances: readonly (readonly [number, ProfileTone])[] = [
  [0.1, "coral"],
  [0.2, "gold"],
  [0.4, "lime"],
  [0.8, "green"],
  [1.5, "teal"],
  [1.609344, "cyan"],
  [3, "blue"],
  [5, "mint"],
  [8.04672, "peach"],
  [10, "sky"],
  [16.09344, "lilac"],
  [24.14016, "orchid"],
  [21.0975, "rose"],
  [32.18688, "lemon"],
  [42.195, "periwinkle"],
  [50, "lavender"],
  [80.4672, "sand"],
  [100, "slate"],
  [160.9344, "pink"],
];
const fallbackTones = Object.keys(tones) as ProfileTone[];

/** Normalise display aliases only; this never changes result grouping or PB eligibility. */
export function distanceTone(code: string, distanceKm = 0): ProfileTone {
  const label = code.trim().toLowerCase().replaceAll(",", "").replace(/\s+/g, " ");
  if (/^(?:half|half marathon|hm)$/.test(label)) return "rose";
  if (/^(?:full )?marathon$/.test(label)) return "periwinkle";
  let km = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0;
  if (!km) {
    if (/^(?:one |1 )?mile$/.test(label)) km = 1.609344;
    else {
      const match = label.match(/^(\d+(?:\.\d+)?)\s*(k|km|m|mi|miles?)$/);
      if (match) {
        const unit = match[2];
        km = Number(match[1]) * (unit.startsWith("mi") ? 1.609344 : unit === "m" ? 0.001 : 1);
      }
    }
  }
  for (const [standard, tone] of standardDistances) {
    if ([standard, +standard.toFixed(1), +standard.toFixed(2), +standard.toFixed(3)].includes(km))
      return tone;
  }
  if (/^ultra(?: marathon)?$/.test(label)) return "lavender";
  // Uncommon distances still receive a stable colour on every profile and every render.
  const key = km > 0 ? `km:${km.toFixed(3)}` : label;
  const hash = Array.from(key).reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 0);
  return fallbackTones[hash % fallbackTones.length];
}

export const distanceColourClass = (code: string, distanceKm = 0) =>
  profileToneClass(distanceTone(code, distanceKm));

export function achievementTone(id: string): ProfileTone {
  if (id.startsWith("first-")) return distanceTone(id.slice(6));
  switch (id) {
    case "marathons":
    case "marathon-week":
    case "consecutive-marathons":
      return "periwinkle";
    case "ultras":
      return "lavender";
    case "majors":
    case "original-six":
      return "gold";
    case "countries":
      return "peach";
    case "sports":
      return "sky";
    case "years":
      return "sand";
    case "personal-improvement":
      return "cyan";
    default:
      return "mint";
  }
}

export const achievementColourClass = (id: string) => profileToneClass(achievementTone(id));
