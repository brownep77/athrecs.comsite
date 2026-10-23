import { useMemo } from "react";
import { CalendarPlus, ChevronDown, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildCalendarEvent,
  calendarLinks,
  calendarUnavailable,
  type CalendarRace,
} from "@/lib/athrecs/event-calendar";

/** Native disclosure and form submission work before hydration and without JavaScript. */
export function AddToCalendar({ race }: { race: CalendarRace }) {
  const unavailable = calendarUnavailable(race);
  const event = useMemo(() => buildCalendarEvent(race), [race]);
  const label = `Add ${race.name}, ${race.distance ?? "event"}, ${race.date} to calendar`;
  if (unavailable || !event) {
    return (
      <Button
        type="button"
        variant="secondary"
        disabled
        title={unavailable ?? undefined}
        aria-label={label}
      >
        <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to calendar
      </Button>
    );
  }
  const links = calendarLinks(event);
  // Only public calendar fields travel to the independently validated download.
  const payload: CalendarRace = {
    id: race.id,
    name: race.name,
    date: race.date,
    distance: race.distance,
    startTime: race.startTime,
    startLabel: race.startLabel,
    endDate: race.endDate,
    endTime: race.endTime,
    timeZone: race.timeZone,
    location: race.location,
    pageUrl: race.pageUrl,
    officialUrl: race.officialUrl,
    entryUrl: race.entryUrl,
    status: race.status,
    provisional: race.provisional,
  };
  return (
    <details className="group min-w-0" suppressHydrationWarning>
      <summary
        aria-label={label}
        className="inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-elevated px-4 py-2 text-sm font-medium text-fg hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 [&::-webkit-details-marker]:hidden"
      >
        <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to calendar
        <ChevronDown
          className="h-4 w-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div
        role="group"
        aria-label="Calendar options"
        className="mt-3 max-w-xl space-y-3 rounded-xl border border-border bg-surface p-4"
      >
        <p className="break-words font-semibold">{event.title}</p>
        <p className="text-sm text-muted">
          {race.date}
          {event.startUtc ? ` · ${race.startTime} (${event.timeZone})` : " · Date-only reminder"}
        </p>
        {race.provisional ? (
          <p className="text-sm font-semibold">Provisional date — confirm with the organiser.</p>
        ) : null}
        <p className="text-sm text-muted">{event.notice}</p>
        <form method="post" action="/api/event-calendar" className="grid gap-2 sm:grid-cols-2">
          <input type="hidden" name="race" value={JSON.stringify(payload)} />
          {[
            ["Google Calendar", links.google],
            ["Outlook.com", links.outlook],
            ["Microsoft 365", links.office],
          ].map(([name, href]) => (
            <Button key={name} asChild variant="secondary">
              <a href={href} target="_blank" rel="noopener noreferrer">
                {name}
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          ))}
          <Button asChild variant="secondary">
            <a href={`/my-race-calendar?race=${encodeURIComponent(race.id)}`}>
              Apple Calendar
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button type="submit" variant="secondary" className="sm:col-span-2">
            Download calendar file (.ics)
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
        <p className="text-xs text-muted">
          Google and Outlook open a prepared event for you to save. Apple uses your private AthRecs
          race subscription. Download a one-off file only if you prefer to import it yourself.
        </p>
      </div>
    </details>
  );
}
