export const PLACEHOLDER =
  /^(?:other|unknown|tbc|tbd|n\/?a|unspecified|distance not yet confirmed)?$/i;
export const RACE_FORMAT =
  /^(?:ultra(?:marathon)?|cross[ -]country|xc|fun run|road|trail|fell|mountain|running|triathlon|duathlon|aquathlon|aquabike|swim bike run)$/i;
export const DISTANCE_SPORTS = ["Running", "Parkrun", "Walking", "OCR", "Swimrun"];
export const FIXED_DISTANCE =
  /^(?:(?:[1-9]\d*(?:\.\d+)?|0\.\d*[1-9]\d*)\s*(?:k(?:m)?|mi(?:le)?s?|m)|half(?:[ -]marathon)?|marathon|quarter)$/i;
export const TIMED_DISTANCE =
  /^[1-9]\d*(?:\.\d+)?\s*(?:H|D)(?: (?:Day|Night|Early|Late|Twilight|Daylight))?$/i;

/** A format is not a distance. Timed races have a duration, never an invented total. */
export function hasConfirmedFixtureDistance(sport: string, code: string, km?: number | null) {
  const label = (code ?? "").trim();
  if (km != null && (!Number.isFinite(km) || km < 0)) return false;
  if ((km != null && km > 0) || FIXED_DISTANCE.test(label) || TIMED_DISTANCE.test(label))
    return true;
  if (PLACEHOLDER.test(label) || RACE_FORMAT.test(label)) return false;
  // A track-and-field or pool meeting is a programme, not a fixed-distance race.
  // This does not source-verify the programme or invent distances for its disciplines.
  return !DISTANCE_SPORTS.includes(sport);
}
