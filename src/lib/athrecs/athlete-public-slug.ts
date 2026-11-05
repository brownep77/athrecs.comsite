import { createHash } from "node:crypto";

/**
 * Build a stable, provider-neutral slug for a source-identified athlete whose
 * real-world identity has not yet been reconciled with an existing AthRecs profile.
 * The source ID is still stored in athlete_source_identities, not exposed in URLs.
 */
export function providerNeutralAthleteSlug(
  normalizedName: string,
  provider: string,
  externalId: string,
): string {
  const base = normalizedName.slice(0, 62).replace(/-+$/g, "");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(base)) throw new Error("Invalid athlete name slug");
  if (!provider.trim() || !externalId.trim()) throw new Error("Source identity required");
  const opaqueId = createHash("sha256")
    .update(`${provider}:${externalId}`)
    .digest("hex")
    .slice(0, 16);
  return `${base}-athlete-${opaqueId}`;
}
