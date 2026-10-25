import { FIXTURE_DETAILS } from "../../data/fixture-details.ts";
import { raceGuideFor, supplementedStart } from "../../data/runrecs-race-guides.ts";
import { calendarTimeZoneForPlace } from "./timezone.ts";
import { formatDistanceWithUnits } from "./distance.ts";
import type { CalendarRace } from "./event-calendar.ts";
import { racePageReviewFor } from "../../data/race-page-reviews.ts";

/** Use only the selected edition's public practical details; HQ is not necessarily the start. */
export function catalogueCalendarDetails(
  event: {
    slug: string;
    website?: string | null;
    town?: string | null;
    city?: string | null;
    county?: string | null;
    state?: string | null;
    country?: string | null;
  },
  date: string,
  distance: string,
) {
  const detail = FIXTURE_DETAILS[`${event.slug}|${date}`];
  const matchedGuide = racePageReviewFor(event.slug, date)?.guide ?? raceGuideFor(event, date);
  const guide =
    matchedGuide && Object.hasOwn(matchedGuide.starts, distance) ? matchedGuide : undefined;
  const area = [
    detail?.place?.town ?? event.town,
    detail?.place?.city ?? event.city,
    detail?.place?.county ?? event.county,
    detail?.place?.state ?? event.state,
    event.country,
  ];
  const location = [
    ...new Set(
      (guide
        ? [
            guide.venue,
            guide.postcode && !guide.venue.includes(guide.postcode) ? guide.postcode : null,
            event.country,
          ]
        : area
      ).filter(Boolean),
    ),
  ].join(", ");
  const raceDayInformation = [
    detail?.starts[distance]?.publicNote,
    ...(guide?.facts
      .filter(({ label }) =>
        /^(Start(?: and finish)?|Race-day schedule|Arrival(?: and parking)?|Parking)$/i.test(label),
      )
      .map(({ label, text }) => `${label}: ${text}`) ?? []),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 2000);
  return { location, raceDayInformation, officialUrl: guide?.website || event.website };
}

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
    name: details?.starts[edition.distance_code] ? (details.displayName ?? event.name) : event.name,
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
    ...catalogueCalendarDetails(event, edition.event_date, edition.distance_code),
    pageUrl: `${siteUrl}/races/${encodeURIComponent(event.slug)}`,
    entryUrl: edition.entry_options?.find(
      (option) => option.entry_type === "official" && option.is_verified,
    )?.entry_url,
    status: edition.status,
  };
}
