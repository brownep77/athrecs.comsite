import type { CalendarRace } from "@/lib/athrecs/event-calendar";
import { AddToCalendar } from "./AddToCalendar";
import { ShareRaceButton } from "./ShareRaceButton";

export function RaceActions({ race }: { race: CalendarRace }) {
  return (
    <div className="flex min-w-0 flex-wrap items-start gap-2">
      <AddToCalendar race={race} />
      <ShareRaceButton key={race.id} race={race} />
    </div>
  );
}
