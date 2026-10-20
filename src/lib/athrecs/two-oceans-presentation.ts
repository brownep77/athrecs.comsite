export const TWO_OCEANS_SERIES_SLUG = "two-oceans-marathon";
export const TWO_OCEANS_HALF_SLUG = "two-oceans-half-marathon";
export const TWO_OCEANS_HALF_NAME = "Two Oceans Half Marathon";

/** Both distances retain their existing event and edition IDs in storage. */
export function twoOceansSourceSlug(slug: string): string {
  return slug === TWO_OCEANS_HALF_SLUG ? TWO_OCEANS_SERIES_SLUG : slug;
}

export function twoOceansCalendarPresentation<
  T extends { event_slug: string; event_name: string; distance_code: string },
>(edition: T): T {
  if (edition.event_slug !== TWO_OCEANS_SERIES_SLUG || edition.distance_code !== "Half")
    return edition;
  return {
    ...edition,
    event_slug: TWO_OCEANS_HALF_SLUG,
    event_name: TWO_OCEANS_HALF_NAME,
  };
}

/** Present the half marathon separately without moving or duplicating results. */
export function twoOceansRacePresentation<
  T extends {
    event: { slug: string; name: string; summary: string; description: string };
    distances: string[];
    upcoming: Array<{ distance_code: string }>;
    past: Array<{ distance_code: string }>;
  },
>(data: T, requestedSlug: string): T {
  if (requestedSlug !== TWO_OCEANS_HALF_SLUG || data.event.slug !== TWO_OCEANS_SERIES_SLUG)
    return data;
  return {
    ...data,
    event: {
      ...data.event,
      slug: TWO_OCEANS_HALF_SLUG,
      name: TWO_OCEANS_HALF_NAME,
      summary: "Two Oceans Half Marathon is a 21.1km road race in Cape Town, South Africa.",
      description:
        "The Two Oceans Half Marathon is the 21.1km road race held during the Two Oceans weekend in Cape Town, finishing at the University of Cape Town.",
    },
    distances: ["Half"],
    upcoming: data.upcoming.filter((edition) => edition.distance_code === "Half"),
    past: data.past.filter((edition) => edition.distance_code === "Half"),
  };
}
