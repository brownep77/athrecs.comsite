import { useState } from "react";
import { Bookmark, Check, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { CountryFlag } from "@/components/athletes/CountryFlag";
import { AddToCalendar } from "@/components/races/AddToCalendar";
import { ShareRaceButton } from "@/components/races/ShareRaceButton";
import { useHomepageTheme } from "@/components/running/HomepageAppearance";
import { compactFixtureLocation, formatFixtureStart } from "@/lib/athrecs/fixture-presentation";
import { validCalendarDate } from "@/lib/athrecs/event-calendar";
import { cn } from "@/lib/utils";
import type { SportFixture } from "@/lib/athrecs/sport-fixtures.server";

type Props = {
  fixture: SportFixture;
  saved: boolean;
  onToggleSaved: (fixture: SportFixture) => void;
  saveReady?: boolean;
};

const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-accent no-underline transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

function distanceLabel(distance: string) {
  if (distance === "Half") return "Half marathon";
  if (distance === "Ultra") return "Ultramarathon";
  return distance;
}

function statusLabel(status: string | null | undefined) {
  if (/cancelled|canceled/i.test(status ?? "")) return "Cancelled";
  if (/postponed/i.test(status ?? "")) return "Postponed";
  if (/finished/i.test(status ?? "")) return "Finished";
  return null;
}

/** Compact public catalogue card; every action retains its actual race-edition identity. */
export function CompactFixtureRow({ fixture, saved, onToggleSaved, saveReady = true }: Props) {
  const theme = useHomepageTheme();
  const [selectedEdition, setSelectedEdition] = useState(fixture.starts[0]?.editionId);
  const selectedStart =
    fixture.starts.find((start) => start.editionId === selectedEdition) ?? fixture.starts[0];
  const calendarRace = selectedStart?.calendarRace ?? null;
  const location = compactFixtureLocation(fixture);
  const hasDate = validCalendarDate(fixture.eventDate);
  const date = hasDate ? new Date(`${fixture.eventDate}T00:00:00Z`) : null;
  const dateLabel = date
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    : "Date to be confirmed";
  const pagePath = fixture.slug ? `/races/${encodeURIComponent(fixture.slug)}` : null;
  const notes = [...new Set(fixture.starts.map((start) => start.note).filter(Boolean))];

  return (
    <article className="compact-fixture-row min-w-0 border-b border-border bg-surface p-4 last:border-b-0 sm:px-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <time
          dateTime={hasDate ? fixture.eventDate : undefined}
          aria-label={dateLabel}
          className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-accent/20 bg-accent-soft py-2 text-accent"
        >
          <span
            aria-hidden="true"
            className="whitespace-nowrap text-[9px] leading-[15px] font-bold uppercase"
          >
            {date
              ? `${new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(date)} · ${new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(date)}`
              : "Date"}
          </span>
          <span aria-hidden="true" className="text-2xl font-bold leading-7">
            {date ? date.getUTCDate() : "TBC"}
          </span>
          {date ? (
            <span aria-hidden="true" className="text-[10px] font-medium">
              {date.getUTCFullYear()}
            </span>
          ) : null}
        </time>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-6 text-fg">
            {pagePath ? (
              <a
                href={pagePath}
                className="no-underline hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {fixture.name}
              </a>
            ) : (
              fixture.name
            )}
          </h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-5 text-muted">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              {[location.text, location.countryName].filter(Boolean).join(", ") || "Location TBC"}
            </span>
            {fixture.country ? <CountryFlag country={fixture.country} /> : null}
          </p>
          <ul
            aria-label="Race distances and local starts"
            className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs leading-5 text-muted"
          >
            {fixture.starts.map((start) => {
              const status = statusLabel(start.status);
              const description = (
                <>
                  <span className="font-semibold text-accent">{distanceLabel(start.distance)}</span>
                  <span aria-hidden="true"> · </span>
                  <span>
                    {start.label ??
                      formatFixtureStart(start.time, fixture.eventDate, fixture.timeZone)}
                  </span>
                </>
              );
              return (
                <li key={start.editionId}>
                  {fixture.starts.length > 1 ? (
                    <button
                      type="button"
                      aria-pressed={selectedStart?.editionId === start.editionId}
                      title="Use this distance for calendar and sharing"
                      onClick={() => setSelectedEdition(start.editionId)}
                      className={cn(
                        "min-h-11 rounded-md border px-2.5 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        selectedStart?.editionId === start.editionId
                          ? "border-accent bg-accent-soft"
                          : "border-border bg-surface hover:bg-accent-soft",
                      )}
                    >
                      {description}
                    </button>
                  ) : (
                    description
                  )}
                  {status ? (
                    <span
                      className={`ml-1.5 font-semibold ${theme === "midnight" ? "text-rose-300" : "text-[#9f3a30]"}`}
                    >
                      {status}
                    </span>
                  ) : null}
                  {start.calendarRace?.provisional ? (
                    <span
                      className={`ml-1.5 font-semibold ${theme === "midnight" ? "text-amber-300" : "text-[#8b651d]"}`}
                    >
                      Provisional date
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {fixture.summary ? (
            <p className="mt-1.5 text-xs leading-5 text-muted">{fixture.summary}</p>
          ) : null}
          {notes.length ? (
            <div className="mt-1.5 space-y-1 text-xs leading-5 text-muted">
              {notes.map((note) => (
                <p key={note}>
                  {fixture.starts.every((start) => start.note === note)
                    ? ""
                    : `${fixture.starts
                        .filter((start) => start.note === note)
                        .map((start) => distanceLabel(start.distance))
                        .join(" / ")}: `}
                  {note}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="compact-fixture-actions mt-3 flex min-w-0 flex-wrap items-start gap-2 sm:pl-[72px] [&>details>summary]:px-3 [&>details>summary]:text-xs">
        {pagePath ? (
          <a
            href={pagePath}
            className={cn(
              actionClass,
              "border-accent bg-accent text-primary-fg hover:bg-accent/90",
            )}
          >
            Details <ChevronRight className="size-3.5" aria-hidden="true" />
          </a>
        ) : fixture.website ? (
          <a
            href={fixture.website}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
          >
            Event website <ExternalLink className="size-3.5" aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
        <button
          type="button"
          className={actionClass}
          aria-pressed={saved}
          aria-label={`${saved ? "Saved race" : "Save race"}: ${fixture.name}${saved ? ". Remove from saved races" : " to saved races"}`}
          title={saved ? "Remove from saved races" : "Save to your race shortlist in this browser"}
          disabled={!saveReady || !fixture.slug}
          onClick={() => onToggleSaved(fixture)}
        >
          {saved ? (
            <Check className="size-3.5" aria-hidden="true" />
          ) : (
            <Bookmark className="size-3.5" aria-hidden="true" />
          )}
          {saved ? "Saved race" : "Save race"}
        </button>
        {calendarRace ? (
          <AddToCalendar key={`calendar-${calendarRace.id}`} race={calendarRace} />
        ) : null}
        {calendarRace ? (
          <ShareRaceButton key={`share-${calendarRace.id}`} race={calendarRace} />
        ) : null}
      </div>
    </article>
  );
}
