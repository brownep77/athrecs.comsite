import { useId, useMemo, useState } from "react";
import { Trigger as DialogTrigger } from "@radix-ui/react-dialog";
import { CalendarPlus, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  buildCalendarEvent,
  calendarFilename,
  calendarIcs,
  calendarLinks,
  calendarUnavailable,
  type CalendarRace,
} from "@/lib/athrecs/event-calendar";

/** One edition per control: never silently export a different distance or date. */
export function AddToCalendar({ race }: { race: CalendarRace }) {
  const noticeId = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unavailable = calendarUnavailable(race);
  const event = useMemo(() => (open ? buildCalendarEvent(race) : null), [open, race]);
  const links = event ? calendarLinks(event) : null;
  const download = () => {
    if (!event) return;
    setError(null);
    try {
      const url = URL.createObjectURL(
        new Blob([calendarIcs(event)], { type: "text/calendar;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = calendarFilename(event);
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Safari may not start consuming the blob synchronously.
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      setError("The calendar file could not be created. Please try a calendar link or try again.");
    }
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          disabled={Boolean(unavailable)}
          title={unavailable ?? undefined}
          aria-label={`Add ${race.name}, ${race.distance ?? "event"}, ${race.date} to calendar`}
        >
          <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to calendar
        </Button>
      </DialogTrigger>
      {open && event && links ? (
        <DialogContent className="max-h-[85dvh] overflow-y-auto" aria-describedby={noticeId}>
          <DialogHeader>
            <DialogTitle>Add to calendar</DialogTitle>
          </DialogHeader>
          <p className="break-words font-semibold">{event.title}</p>
          <p className="text-sm text-muted">
            {race.date}
            {event.startUtc ? ` · ${race.startTime} (${event.timeZone})` : " · Date-only reminder"}
          </p>
          {race.provisional ? (
            <p className="text-sm font-semibold">Provisional date — confirm with the organiser.</p>
          ) : null}
          <p className="text-sm text-muted">{event.notice}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Google Calendar", links.google],
              ["Outlook.com", links.outlook],
              ["Microsoft 365", links.office],
            ].map(([label, href]) => (
              <Button key={label} asChild variant="secondary">
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            ))}
            <Button type="button" variant="secondary" onClick={download}>
              Apple Calendar
              <Download className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button type="button" variant="secondary" onClick={download} className="sm:col-span-2">
              Other calendars (.ics)
              <Download className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <p id={noticeId} className="text-xs text-muted">
            Review and save in your calendar. For Apple and other calendar apps, open the downloaded
            file. This is a one-off copy; check the race page for changes or cancellations.
          </p>
          {error ? (
            <p role="alert" className="text-sm">
              {error}
            </p>
          ) : null}
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
