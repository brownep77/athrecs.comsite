import type { Candidate, Edition, Identity } from "./core.ts";
import { normalizedName, sameCountry } from "./matching.ts";

export type Keeper = { event: Identity; edition: Edition & { id: number } };
export type DuplicateReview = {
  id: string;
  candidate_id: string;
  kept_event_id: number;
  kept_edition_id: number;
  before_state: {
    candidate?: Candidate;
    status: string;
    reason: string;
    event_slug: string;
    event_id: number | null;
    dismissed_at: string | null;
    dismissed_by: string | null;
  };
  kept_snapshot: Keeper;
  reason: string;
  reviewed_by: string;
  reviewed_at: string;
};
export function duplicateCompatibility(candidate: Candidate, keeper: Keeper) {
  const delta = Math.abs(candidate.distanceKm - keeper.edition.distanceKm);
  const blocker =
    keeper.edition.date !== candidate.date
      ? "Choose a fixture on the same date."
      : !sameCountry(candidate, keeper.event.country)
        ? "The countries differ; resolve the location before confirming a duplicate."
        : !Number.isFinite(delta) || delta > Math.max(0.1, candidate.distanceKm * 0.001)
          ? "These are different race distances. Keep distinct distances as separate fixtures."
          : "";
  const differences = [
    delta > 0.025 &&
      `Distance differs: keep ${keeper.edition.distanceKm.toFixed(3)} km; remove the ${candidate.distanceKm.toFixed(3)} km finding.`,
    keeper.event.city &&
      normalizedName(candidate.city) !== normalizedName(keeper.event.city) &&
      `Start location differs: catalogue ${keeper.event.city}; finding ${candidate.city}.`,
  ].filter((x): x is string => Boolean(x));
  return { blocker, differences };
}
export function keptFixtureUnchanged(
  review: DuplicateReview,
  events: Identity[],
  editions: Edition[],
) {
  const event = events.find((e) => e.id === review.kept_event_id);
  const edition = editions.find((e) => e.id === review.kept_edition_id);
  const before = review.kept_snapshot;
  return Boolean(
    event &&
    edition &&
    event.slug === before.event.slug &&
    event.name === before.event.name &&
    event.website === before.event.website &&
    event.country === before.event.country &&
    event.city === before.event.city &&
    edition.eventId === before.edition.eventId &&
    edition.date === before.edition.date &&
    edition.distance === before.edition.distance &&
    edition.distanceKm === before.edition.distanceKm &&
    edition.source === before.edition.source &&
    edition.entryUrl === before.edition.entryUrl,
  );
}
