import { useState } from "react";
import { ArrowUpRight, CalendarDays, MapPin, Ticket } from "lucide-react";
import type { getEventBySlug } from "@/lib/athrecs/api";
import { editionEntry, raceLink, raceLocation } from "@/lib/athrecs/race-information";
import {
  effectiveStatus,
  formatRaceDateShort,
  formatStartTime,
  statusLabel,
} from "@/lib/athrecs/format";
import { formatDistanceWithUnits } from "@/lib/athrecs/distance";
import type { EntryStatus } from "@/lib/athrecs/types";
import { venueForEvent } from "@/lib/athrecs/venue";
import { raceGuideFor, supplementedStart } from "@/data/runrecs-race-guides";

export function RacePracticalInformation({
  data,
}: {
  data: NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>;
}) {
  const { event, upcoming } = data;
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? upcoming : upcoming.slice(0, event.sport === "Parkrun" ? 6 : 12);
  const venue = venueForEvent(event);
  const guide = raceGuideFor(event, upcoming[0]?.event_date);
  const address = guide?.venue || venue.address;
  const postcode = guide?.postcode || venue.postcode;
  const location = raceLocation([
    address,
    postcode && !address.includes(postcode) ? postcode : null,
    venue.nation,
  ]);
  const mapUrl =
    address !== "Venue TBC"
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
      : null;
  const website = raceLink(event.website);
  const description = event.description?.trim() || event.summary?.trim();

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(17rem,1fr)] lg:items-start">
      <section
        id="race-schedule"
        aria-labelledby="race-schedule-heading"
        className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface"
      >
        <div className="border-b border-border p-4 sm:p-5">
          <h2
            id="race-schedule-heading"
            className="flex items-center gap-2 font-display text-xl font-semibold"
          >
            <CalendarDays className="h-5 w-5 text-accent" />
            Dates, starts & entry
          </h2>
          <p className="mt-1 text-sm text-muted">
            Times are local to the race. Select the entry route for your distance.
          </p>
        </div>
        {visible.length ? (
          <ul className="divide-y divide-border">
            {visible.map((edition) => {
              const start = formatStartTime(
                supplementedStart(
                  event,
                  edition.event_date,
                  edition.distance_code,
                  edition.start_time,
                ),
                { ...event, date: edition.event_date },
              );
              const entry = editionEntry(edition);
              const source = raceLink(edition.source_url);
              const editionGuide = raceGuideFor(event, edition.event_date);
              return (
                <li key={`${edition.id}-${edition.event_date}`} className="space-y-2 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold">
                        {formatDistanceWithUnits(edition.distance_code, edition.distance_km)}
                      </h3>
                      <p className="mt-1 text-sm">{formatRaceDateShort(edition.event_date)}</p>
                      <p
                        className={`mt-1 text-sm ${start ? "font-semibold text-accent" : "text-muted"}`}
                      >
                        {start ? `Starts ${start}` : "Start time not yet confirmed"}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        {statusLabel(
                          effectiveStatus(edition.event_date, edition.status as EntryStatus),
                        )}
                      </p>
                    </div>
                    {entry ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-fg no-underline"
                      >
                        <Ticket className="h-4 w-4" />
                        {entry.label}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : website ? (
                      <a
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-accent"
                      >
                        Check race website
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <p className="text-sm text-muted">Entry link not yet listed</p>
                    )}
                  </div>
                  {edition.notes ? (
                    <p className="text-sm leading-relaxed text-muted">{edition.notes}</p>
                  ) : null}
                  {editionGuide || source ? (
                    <a
                      href={editionGuide?.website || source!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-8 items-center gap-1 text-xs text-subtle hover:text-fg"
                    >
                      {editionGuide
                        ? `Official details checked ${formatRaceDateShort(editionGuide.checked)}`
                        : "Edition source"}
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="p-5 text-sm text-muted">
            The next date has not been announced here. Check the race website for updates.
          </p>
        )}
        {upcoming.length > visible.length ? (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="min-h-11 w-full border-t border-border p-3 text-sm font-semibold text-accent"
          >
            Show all {upcoming.length} listed races
          </button>
        ) : null}
      </section>

      <div className="min-w-0 space-y-5">
        <section
          id="race-location"
          aria-labelledby="race-location-heading"
          className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2
            id="race-location-heading"
            className="flex items-center gap-2 font-display text-xl font-semibold"
          >
            <MapPin className="h-5 w-5 text-accent" />
            Location & race day
          </h2>
          <div>
            <p className="text-sm font-semibold">
              {guide ? "Venue / race HQ" : "Listed venue / area"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{location}</p>
          </div>
          {mapUrl ? (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
            >
              Find this location on a map
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
          {guide ? (
            <dl className="space-y-4">
              {guide.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-sm font-semibold">{fact.label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">{fact.text}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              Confirm the exact start line, parking and arrival instructions with the organiser. A
              listed town or postcode may cover a wider area.
            </p>
          )}
          {guide ? (
            <a
              href={guide.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1 text-xs text-subtle"
            >
              Organiser details · checked {formatRaceDateShort(guide.checked)}
              <ArrowUpRight className="h-3 w-3" />
            </a>
          ) : null}
          {guide?.links?.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-1 text-sm font-medium text-accent"
            >
              {link.label}
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ))}
        </section>
        <section
          aria-labelledby="race-about-heading"
          className="space-y-3 rounded-xl border border-border bg-surface p-4 sm:p-5"
        >
          <h2 id="race-about-heading" className="font-display text-xl font-semibold">
            About the race
          </h2>
          {description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{description}</p>
          ) : (
            <p className="text-sm text-muted">
              A full course description has not been provided yet.
            </p>
          )}
          <dl className="space-y-2 text-sm">
            {event.surface ? (
              <div>
                <dt className="inline font-semibold">Surface: </dt>
                <dd className="inline text-muted">{event.surface}</dd>
              </div>
            ) : null}
            {event.organiser ? (
              <div>
                <dt className="inline font-semibold">Organiser: </dt>
                <dd className="inline text-muted">{event.organiser}</dd>
              </div>
            ) : null}
          </dl>
          {website ? (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent"
            >
              Race website
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </section>
      </div>
    </div>
  );
}
