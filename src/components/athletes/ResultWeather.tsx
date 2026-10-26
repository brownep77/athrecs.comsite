import { CloudSun, ChevronDown } from "lucide-react";
import {
  raceDayWeather,
  raceWeatherCondition,
  raceWeatherTemperature,
} from "@/lib/athrecs/race-weather";

/** A short disclosure keeps weather inside the existing race-name column. */
export function ResultWeather({ eventSlug, eventDate }: { eventSlug: string; eventDate: string }) {
  const weather = raceDayWeather(eventSlug, eventDate);
  if (!weather) return null;
  if (weather.status === "unavailable")
    return <span className="block text-[11px] font-normal text-subtle">Weather unavailable</span>;
  return (
    <details className="result-weather mt-1 min-w-0 text-[11px] font-normal leading-4 text-muted">
      <summary
        className="flex min-h-7 cursor-pointer list-none items-start gap-1 rounded focus-visible:outline-2 focus-visible:outline-accent"
        aria-label={`Race-day weather: ${raceWeatherTemperature(weather)}, ${raceWeatherCondition(weather.conditionCodes)}. Show details`}
      >
        <CloudSun className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
        <span>
          Day {raceWeatherTemperature(weather)} · {raceWeatherCondition(weather.conditionCodes)}
        </span>
        <ChevronDown className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      </summary>
      <div className="mt-1 space-y-2 whitespace-normal rounded border border-border bg-surface p-2 text-xs leading-5">
        <p>
          <strong>Race-day weather · {weather.locality}</strong>
          <br />
          {weather.date} · {weather.timezone}. Local calendar day, including overnight; race start
          time has not been used.
        </p>
        <p>
          Hourly temperature range: {weather.minC}–{weather.maxC}°C ({weather.hours}/
          {weather.expectedHours} hours).
          <br />
          Mean wind: {weather.windKph == null ? "Unavailable" : `${weather.windKph} km/h`}.
          {weather.gustKph != null ? ` Peak gust: ${weather.gustKph} km/h.` : ""}
          <br />
          Mean humidity: {weather.humidityPct == null ? "Unavailable" : `${weather.humidityPct}%`}.
          <br />
          Day precipitation:{" "}
          {weather.precipitationMm == null ? "Incomplete data" : `${weather.precipitationMm} mm`}.
        </p>
        <p>
          {weather.stationName} station ({weather.stationLatitude}, {weather.stationLongitude}).
          Nearby-area weather; conditions on the course may differ, especially on coasts and hills.{" "}
          {weather.modelFilled ? "Includes model estimates." : "Station observations."} Conditions
          describe reports during the day, not the whole race. Averages use available hours; missing
          observations are not treated as dry weather.
        </p>
        <p className="text-[11px]">
          Weather:{" "}
          <a
            className="text-accent underline"
            href={`https://meteostat.net/en/station/${weather.stationId}?t=${weather.date}/${weather.date}`}
            target="_blank"
            rel="noreferrer"
          >
            Meteostat
          </a>{" "}
          and its{" "}
          <a
            className="text-accent underline"
            href="https://dev.meteostat.net/providers"
            target="_blank"
            rel="noreferrer"
          >
            data providers
          </a>
          ,{" "}
          <a
            className="text-accent underline"
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
          . Summarised and rounded by AthRecs. Retrieved {weather.retrievedOn}.
        </p>
      </div>
    </details>
  );
}
