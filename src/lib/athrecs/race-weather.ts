import snapshots from "../../data/race-day-weather.json";

export type RaceDayWeather = {
  date: string;
  locality: string;
  timezone: string;
  stationId: string;
  stationName: string;
  stationLatitude: number;
  stationLongitude: number;
  stationElevation: number | null;
  retrievedOn: string;
  status: "available" | "unavailable";
  minC?: number;
  maxC?: number;
  windKph?: number | null;
  gustKph?: number | null;
  humidityPct?: number | null;
  precipitationMm?: number | null;
  conditionCodes?: number[];
  hours?: number;
  expectedHours?: number;
  modelFilled?: boolean;
};

const weather = snapshots as Record<string, RaceDayWeather>;

/** Edition lookup only: weather never establishes an athlete's participation. */
export function raceDayWeather(eventSlug: string, date: string): RaceDayWeather | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return weather[`${eventSlug}|${date}`] ?? null;
}

export function raceWeatherCondition(codes: readonly number[] = []): string {
  if (codes.some((code) => code >= 23)) return "Storms at times";
  if (codes.some((code) => [10, 11, 12, 13, 19, 20].includes(code))) return "Wintry mix";
  if (codes.some((code) => [14, 15, 16, 21, 22].includes(code))) return "Snow at times";
  if (codes.some((code) => [7, 8, 9, 17, 18].includes(code))) return "Rain at times";
  if (codes.some((code) => [5, 6].includes(code))) return "Fog at times";
  if (codes.some((code) => [3, 4].includes(code))) return "Cloud at times";
  if (codes.some((code) => [1, 2].includes(code))) return "Clear / fair reported";
  return "Conditions unavailable";
}

export function raceWeatherTemperature(weather: RaceDayWeather): string {
  if (weather.minC == null || weather.maxC == null) return "Temperature unavailable";
  const low = Math.round(weather.minC);
  const high = Math.round(weather.maxC);
  return low === high ? `${low}°C` : `${low}–${high}°C`;
}
