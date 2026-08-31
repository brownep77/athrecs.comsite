export type PublicSiteBrand = "athrecs" | "runrecs";

const configuredBrand = import.meta.env.VITE_SITE_BRAND?.trim().toLowerCase();

/** The default repository build is ATHRECS; RunRecs is selected explicitly by Vite. */
export const PUBLIC_SITE_BRAND: PublicSiteBrand =
  configuredBrand === "runrecs" ? "runrecs" : "athrecs";

export const IS_ATHRECS_SITE = PUBLIC_SITE_BRAND === "athrecs";
export const IS_RUNRECS_SITE = PUBLIC_SITE_BRAND === "runrecs";

export function sportIsInPublicSiteScope(sport: string | null | undefined): boolean {
  if (!sport) return false;
  return IS_RUNRECS_SITE ? sport === "Running" || sport === "Parkrun" : sport === "Athletics";
}

export function scopedSportLabel(): string {
  return IS_RUNRECS_SITE ? "Running and Parkrun" : "Athletics";
}
