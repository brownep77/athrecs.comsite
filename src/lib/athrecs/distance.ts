const KM_PER_MILE = 1.609344;

const CODE_KM: Record<string, number> = {
  "1K": 1,
  "3K": 3,
  "5K": 5,
  "8K": 8,
  "10K": 10,
  "12K": 12,
  "15K": 15,
  "20K": 20,
  "21K": 21,
  "25K": 25,
  "30K": 30,
  "50K": 50,
  "100K": 100,
  "5mi": 8.047,
  "10mi": 16.093,
  "20mi": 32.187,
  Quarter: 10.54875,
  Half: 21.0975,
  Marathon: 42.195,
};

export function kmFromDistanceCode(code: string, knownKm?: number | null): number | null {
  if (knownKm && knownKm > 0) return knownKm;
  const key = code.trim();
  if (CODE_KM[key] != null) return CODE_KM[key];
  const kmMatch = key.match(/^(\d+(?:\.\d+)?)\s*k(?:m)?$/i);
  if (kmMatch) return Number(kmMatch[1]);
  const mileMatch = key.match(/^(\d+(?:\.\d+)?)\s*mi(?:le)?s?$/i);
  if (mileMatch) return Number(mileMatch[1]) * KM_PER_MILE;
  const metreMatch = key.match(/^(\d+(?:\.\d+)?)\s*m$/);
  if (metreMatch) return Number(metreMatch[1]) / 1000;
  return null;
}

export function formatKmMiles(km: number, approx = false): string {
  const miles = km / KM_PER_MILE;
  const roundedKm = Math.abs(km - Math.round(km)) < 0.05;
  const kmLabel = roundedKm ? `${Math.round(km)} km` : `${km.toFixed(1)} km`;
  const miLabel = `${miles.toFixed(1)} mi`;
  if (approx) return `${kmLabel}+ / ${miles.toFixed(0)}+ mi`;
  return `${kmLabel} / ${miLabel}`;
}

/** Internal placeholder codes must never masquerade as named race distances. */
export function distanceDisplayLabel(code: string, knownKm?: number | null): string {
  const label = code.trim();
  if (!label || /^(other|unknown|tbc|tbd|n\/?a|unspecified)$/i.test(label)) {
    return knownKm && Number.isFinite(knownKm) && knownKm > 0
      ? formatKmMiles(knownKm)
      : "Distance not yet confirmed";
  }
  if (label === "Half") return "Half marathon";
  if (label === "Ultra") return "Ultramarathon";
  return label;
}

export function formatDistanceWithUnits(code: string, knownKm?: number | null): string {
  const label = code.trim();
  if (!label || /^(other|unknown|tbc|tbd|n\/?a|unspecified)$/i.test(label))
    return distanceDisplayLabel(label, knownKm);
  const known = knownKm && knownKm > 0 ? knownKm : null;
  if (label === "Ultra" && !known) return "Ultra";
  const km = kmFromDistanceCode(label, known);
  if (!km) return label;
  return `${label} · ${formatKmMiles(km)}`;
}
