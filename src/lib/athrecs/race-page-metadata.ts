import { FIXTURE_DETAILS, checkedFixtureEventStart } from "../../data/fixture-details.ts";
import { racePageReviewFor } from "../../data/race-page-reviews.ts";
import { raceGuideFor, supplementedStart } from "../../data/runrecs-race-guides.ts";
import { calendarUtc } from "./event-calendar.ts";
import { calendarTimeZoneForPlace } from "./timezone.ts";
import { filterCountryName, resolveCountry } from "./countries.ts";
import { nextRaceEdition } from "./race-search-content.ts";

type Edition = {
  event_date: string;
  distance_code: string;
  status: string;
  start_time: string | null;
  start_label?: string | null;
  end_date?: string | null;
  end_time?: string | null;
};
type Event = {
  slug: string;
  name?: string;
  website?: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
};

/** Exact-date IANA conversion; ambiguous/nonexistent local times stay date-only. */
export function raceUtcOffset(date?: string | null, time?: string | null, zone?: string | null) {
  if (!date || !time || !zone) return undefined;
  const utc = calendarUtc(date, time, zone);
  if (!utc) return undefined;
  const clock = time.length === 5 ? `${time}:00` : time;
  const minutes = (Date.parse(`${date}T${clock}Z`) - Date.parse(utc)) / 60000;
  if (!Number.isInteger(minutes) || Math.abs(minutes) > 840) return undefined;
  const absolute = Math.abs(minutes);
  return `${minutes < 0 ? "-" : "+"}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}

/** Shared catalogue facts, scoped to the programme actually displayed on this page. */
export function racePageMetadata<T extends Edition>(event: Event, upcoming: T[]) {
  const next = nextRaceEdition(upcoming);
  const date = next?.event_date;
  const review = racePageReviewFor(event.slug, date);
  const details = date ? FIXTURE_DETAILS[`${event.slug}|${date}`] : undefined;
  const matchedGuide = raceGuideFor(event, date);
  const programme = upcoming.filter((row) => row.event_date === date && row.status !== "Cancelled");
  // A guide to a different distance is not evidence for this programme's venue.
  const guide =
    matchedGuide && programme.every((row) => Object.hasOwn(matchedGuide.starts, row.distance_code))
      ? matchedGuide
      : undefined;
  const country = resolveCountry(event);
  const zone =
    details?.timeZone ??
    calendarTimeZoneForPlace({
      country: filterCountryName(country),
      county: event.county,
    });
  const clocks = programme.map((row) =>
    row.start_label || details?.starts[row.distance_code]?.label
      ? null
      : supplementedStart(event, row.event_date, row.distance_code, row.start_time),
  );
  const complete =
    clocks.length > 0 &&
    clocks.every((clock) => clock && /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(clock));
  const programmeStart = complete ? (clocks as string[]).slice().sort()[0] : null;
  // An explicitly reviewed programme start (including the first wave) takes precedence.
  const start = checkedFixtureEventStart(
    event.slug,
    date,
    review?.guide.starts.Half ?? programmeStart,
  );
  const utcOffset = raceUtcOffset(date, start, zone);
  const endUtcOffset = raceUtcOffset(next?.end_date, next?.end_time, zone);
  return {
    next,
    // Without a reliable venue zone, a floating local time would imply unsupported precision.
    startTime: utcOffset ? start : null,
    utcOffset,
    endTime: endUtcOffset ? next?.end_time : null,
    endUtcOffset,
    venue: review?.venue ?? {
      name:
        guide?.venue ||
        [event.city, filterCountryName(country)].filter(Boolean).join(", ") ||
        event.name ||
        "Location to be confirmed",
      postalCode: guide?.postcode,
      streetAddress: guide?.streetAddress,
      countryCode: /^[A-Z]{2}$/.test(country.iso) && country.iso !== "UN" ? country.iso : undefined,
    },
    // A general event-directory URL does not identify an organiser's own website.
    organiserWebsite: review?.website ?? guide?.organiser?.url,
    organiser: review?.organiser ?? guide?.organiser?.name,
  };
}

/** Show a confirmed clock in its actual venue zone, without a guessed country default. */
export function raceEditionStart(event: Event, edition?: Edition) {
  if (!edition) return null;
  const details = FIXTURE_DETAILS[`${event.slug}|${edition.event_date}`];
  const checked = details?.starts[edition.distance_code];
  if (checked?.label) return checked.label;
  if (edition.start_label) return edition.start_label;
  const start = supplementedStart(
    event,
    edition.event_date,
    edition.distance_code,
    edition.start_time,
  );
  if (!start || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(start)) return null;
  const zone =
    details?.timeZone ??
    calendarTimeZoneForPlace({
      country: filterCountryName(resolveCountry(event)),
      county: event.county,
    });
  const utc = zone ? calendarUtc(edition.event_date, start, zone) : null;
  const label =
    utc && zone
      ? new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          timeZoneName: "short",
        })
          .formatToParts(new Date(utc))
          .find((part) => part.type === "timeZoneName")?.value
      : null;
  return `${start.slice(0, 5)} ${label || "local time"}`;
}
