import locations from "./fixture-county-regions.json" with { type: "json" };

type RecordedLocation = {
  slug: string;
  country: string;
  city: string;
  area: string;
  county: string;
  region?: string | null;
};

/** Reviewed seed projection only. Never transfer a county to a changed venue. */
export function reviewedFixtureCountyRegion<T extends RecordedLocation>(event: T): T {
  const row = (
    locations as Record<
      string,
      {
        country: string;
        city: string;
        area: string;
        oldCounty: string;
        county: string;
        region: string | null;
      }
    >
  )[event.slug];
  if (
    !row ||
    event.country !== row.country ||
    event.city !== row.city ||
    event.area !== row.area ||
    ![row.oldCounty, row.county].includes(event.county)
  )
    return event;
  return { ...event, county: row.county, region: event.region || row.region };
}
