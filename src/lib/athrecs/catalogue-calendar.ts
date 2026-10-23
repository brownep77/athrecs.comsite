import { FIXTURE_DETAILS } from "../../data/fixture-details.ts";
import { supplementedStart } from "../../data/runrecs-race-guides.ts";
import { calendarTimeZoneForPlace } from "./timezone.ts";
import { formatDistanceWithUnits } from "./distance.ts";
import type { CalendarRace } from "./event-calendar.ts";

export function catalogueCalendarRace(
  event: {
    slug: string;
    name: string;
    country?: string | null;
    county?: string | null;
    city?: string | null;
    website?: string | null;
  },
  edition: {
    id: number;
    event_date: string;
    distance_code: string;
    distance_km: number;
    status: string;
    start_time: string | null;
    start_label?: string | null;
    end_date?: string | null;
    end_time?: string | null;
    entry_options?: Array<{ entry_type: string; is_verified: boolean; entry_url: string }>;
  },
  siteUrl: string,
): CalendarRace {
  const details = FIXTURE_DETAILS[`${event.slug}|${edition.event_date}`];
  return {
    id: `edition-${edition.id}-${edition.distance_code}`,
    name: event.name,
    date: edition.event_date,
    distance: formatDistanceWithUnits(edition.distance_code, edition.distance_km),
    startTime: supplementedStart(
      event,
      edition.event_date,
      edition.distance_code,
      edition.start_time,
    ),
    startLabel: details?.starts[edition.distance_code]?.label ?? edition.start_label,
    endDate: edition.end_date,
    endTime: edition.end_time,
    timeZone: details?.timeZone ?? calendarTimeZoneForPlace(event),
    location: [...new Set([event.city, event.county, event.country].filter(Boolean))].join(", "),
    pageUrl: `${siteUrl}/races/${encodeURIComponent(event.slug)}`,
    officialUrl: event.website,
    entryUrl: edition.entry_options?.find(
      (option) => option.entry_type === "official" && option.is_verified,
    )?.entry_url,
    status: edition.status,
  };
}
