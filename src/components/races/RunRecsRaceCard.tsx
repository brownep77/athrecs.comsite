import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";
import type { EventListItem } from "@/lib/athrecs/types";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatRaceWeekday,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import { sanitizeDistances } from "@/lib/athrecs/filters";
import { venueForEvent } from "@/lib/athrecs/venue";
import { raceLink, raceLocation } from "@/lib/athrecs/race-information";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { RaceGroupBadges } from "./RaceGroupBadges";

export function RunRecsRaceCard({
  race,
  localized,
}: {
  race: EventListItem;
  localized?: { language: string; country: string };
}) {
  const date = race.next_date;
  const status = date && race.next_status ? effectiveStatus(date, race.next_status) : null;
  const venue = venueForEvent(race);
  const location = raceLocation([race.city, race.county, venue.nation]);
  const start = formatStartTime(race.next_start_time, { ...race, date });
  const distances = sanitizeDistances(race.name, race.distances);
  const website = raceLink(race.website);
  const entry = status !== "Closed" && status !== "Finished" ? raceLink(race.next_entry_url) : null;
  const starts = (race.next_starts ?? []).filter(
    (item, index, all) =>
      all.findIndex((other) => other.distance === item.distance && other.time === item.time) ===
      index,
  );
  const detailLink = localized
    ? { to: "/$language/$country/races/$slug" as const, params: { ...localized, slug: race.slug } }
    : { to: "/races/$slug" as const, params: { slug: race.slug } };
  return (
    <article className="min-w-0 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 xl:grid-cols-[3.5rem_minmax(0,1fr)_10rem]">
        <div
          className="self-start rounded-lg border border-border bg-elevated py-2 text-center"
          aria-label={date ? formatRaceDateShort(date) : "Date not announced"}
        >
          {date ? (
            <>
              <p className="text-xs font-semibold text-accent">{formatRaceWeekday(date)}</p>
              <p className="font-display text-2xl font-semibold leading-tight tabular-nums">
                {Number(date.slice(8, 10))}
              </p>
              <p className="text-xs text-muted">
                {new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
                  month: "short",
                  timeZone: "UTC",
                })}
              </p>
              <p className="text-xs text-subtle">{date.slice(0, 4)}</p>
            </>
          ) : (
            <p className="text-xs text-muted">
              Date
              <br />
              TBC
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="font-display text-base font-semibold leading-snug text-fg sm:text-lg">
            <Link {...detailLink} className="no-underline hover:text-accent">
              {race.name}
            </Link>
          </h2>
          <p className="flex items-start gap-1.5 text-sm text-muted">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{location || "Location to be confirmed"}</span>
            <CountryFlag country={venue.nation} />
          </p>
          {race.area && !location.toLowerCase().includes(race.area.toLowerCase()) ? (
            <p className="text-sm text-subtle">{race.area}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
            <span className="font-semibold text-fg">{distances.join(" / ") || "Distance TBC"}</span>
            {race.surface && race.surface !== "Other" ? (
              <span className="text-muted">· {race.surface}</span>
            ) : null}
            {race.sport === "Parkrun" ? <span className="text-muted">· parkrun</span> : null}
          </div>
          {race.summary && race.summary.trim() !== race.name.trim() ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted">{race.summary}</p>
          ) : null}
          <RaceGroupBadges groups={race.groups} />
        </div>
        <div className="col-start-2 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3 xl:col-start-3 xl:row-start-1 xl:flex-col xl:items-start xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
          {date ? (
            <p className="flex items-start gap-1.5 text-sm font-medium">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                {starts.length > 1
                  ? "Starts by distance"
                  : start
                    ? `${start}${distances.length > 1 && race.next_distance ? ` · ${race.next_distance}` : ""}`
                    : "Start time TBC"}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted">
              {race.past_count ? `${race.past_count} past editions` : "Date to be announced"}
            </p>
          )}
          {starts.length > 1 ? (
            <ul className="w-full space-y-1 text-sm text-muted">
              {starts.slice(0, 3).map((item) => (
                <li key={`${item.distance}-${item.time}`}>
                  {item.distance} · {formatStartTime(item.time, { ...race, date }) || "Time TBC"}
                </li>
              ))}
              {starts.length > 3 ? <li>+{starts.length - 3} more on race page</li> : null}
            </ul>
          ) : null}
          {status ? (
            <p
              className={`text-sm ${status === "ClosingSoon" ? "font-semibold text-accent" : "text-muted"}`}
            >
              {statusLabel(status)}
            </p>
          ) : null}
          {entry ? (
            <a
              href={entry}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-accent"
            >
              Official entry
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}
          <Link
            {...detailLink}
            className="inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-accent no-underline hover:underline"
          >
            {date && status !== "Finished" ? "Details & entry" : "Race details"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1 text-sm text-muted hover:text-fg"
            >
              Race website
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
