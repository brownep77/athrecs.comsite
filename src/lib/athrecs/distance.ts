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
  "21K": 21.1,
  "25K": 25,
  "30K": 30,
  "50K": 50,
  "100K": 100,
  "5mi": 8.047,
  "10mi": 16.093,
  "20mi": 32.187,
  Half: 21.0975,
  Marathon: 42.195,
  Ultra: 50,
};

export function kmFromDistanceCode(code: string, knownKm?: number | null): number | null {
  if (knownKm && knownKm > 0) return knownKm;
  const key = code.trim();
  if (CODE_KM[key] != null) return CODE_KM[key];
  const kmMatch = key.match(/^(\d+(?:\.\d+)?)\s*k(?:m)?$/i);
  if (kmMatch) return Number(kmMatch[1]);
  const mileMatch = key.match(/^(\d+(?:\.\d+)?)\s*mi(?:le)?s?$/i);
  if (mileMatch) return Number(mileMatch[1]) * KM_PER_MILE;
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

export function formatDistanceWithUnits(
  code: string,
  knownKm?: number | null,
): string {
  const label = code.trim();
  if (!label) return "";
  if (label === "Other") return "Other";
  const known = knownKm && knownKm > 0 ? knownKm : null;
  if (label === "Ultra" && !known) return `Ultra · ${formatKmMiles(50, true)}`;
  const km = kmFromDistanceCode(label, known);
  if (!km) return label;
  return `${label} · ${formatKmMiles(km)}`;
}
