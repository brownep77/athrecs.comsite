import { compactFixtureLocation } from "./fixture-presentation.ts";
import { distanceDisplayLabel } from "./distance.ts";
import { nextRaceEdition } from "./race-search-content.ts";
import { raceEditionStart } from "./race-page-metadata.ts";
import { editionEntry, raceLink } from "./race-information.ts";
import type { EditionEntryOption } from "./types";

type QuestionEdition = {
  event_date: string;
  distance_code: string;
  distance_km: number;
  status: string;
  start_time: string | null;
  start_label?: string | null;
  end_date?: string | null;
  entry_url?: string | null;
  entry_options: EditionEntryOption[];
};

export type RaceQuestion = {
  question: string;
  answer: string;
  link?: { href: string; label: string };
};

const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

/** Visible, source-scoped answers for people and search; no inferred race facts. */
export function raceQuestions(data: {
  event: {
    slug: string;
    name: string;
    sport: string;
    city?: string | null;
    county?: string | null;
    country?: string | null;
    website?: string | null;
  };
  upcoming: QuestionEdition[];
}): RaceQuestion[] {
  const { event } = data;
  const next = nextRaceEdition(data.upcoming);
  const programme = next
    ? data.upcoming.filter(
        (row) => row.event_date === next.event_date && row.status !== "Cancelled",
      )
    : [];
  const location = compactFixtureLocation(event);
  const place = [...new Set([location.text, location.countryName].filter(Boolean))].join(", ");
  const distances = [
    ...new Set(programme.map((row) => distanceDisplayLabel(row.distance_code, row.distance_km))),
  ];
  const end = next?.end_date;
  const validEnd =
    end &&
    next &&
    end > next.event_date &&
    /^\d{4}-\d{2}-\d{2}$/.test(end) &&
    Number.isFinite(Date.parse(end)) &&
    new Date(end).toISOString().slice(0, 10) === end;
  const when = next
    ? validEnd
      ? `The next listed programme for ${event.name} runs from ${dateLabel(next.event_date)} to ${dateLabel(end)}.`
      : `The next listed date for ${event.name} is ${dateLabel(next.event_date)}.`
    : `No future date is currently listed for ${event.name}.`;
  const starts = programme.map((row) => ({
    distance: distanceDisplayLabel(row.distance_code, row.distance_km),
    start: raceEditionStart(event, row),
  }));
  const startAnswer = starts.length
    ? `Listed starts for ${dateLabel(next!.event_date)}: ${starts
        .map((row) => `${row.distance}: ${row.start ?? "start time not yet verified"}`)
        .join("; ")}. Times are local to the race venue.`
    : "A future race start time has not yet been verified.";
  const entry = next ? editionEntry(next) : null;
  const website = raceLink(event.website);
  return [
    { question: "When is the next event?", answer: when },
    {
      question: "Where is it held?",
      answer: place
        ? `${event.name} is listed in ${place}. Check the event's race-day instructions for the exact start location.`
        : `The venue for ${event.name} has not yet been confirmed.`,
    },
    {
      question: "Which distances are listed?",
      answer:
        next && distances.length
          ? `The programme listed for ${dateLabel(next.event_date)} includes ${distances.join(", ")}.${event.sport === "HYROX" ? " HYROX combines running with workout stations; this is not a standalone running race." : ""}`
          : "No future distance programme is currently listed. Earlier editions may have a different programme.",
    },
    {
      question: "What time does it start?",
      answer:
        event.sport === "HYROX"
          ? `${startAnswer} HYROX competitors must check their division schedule and assigned individual start slot.`
          : `${startAnswer} Follow the start or wave assigned to your entry.`,
    },
    {
      question: "How do I enter?",
      answer: entry
        ? "Use the listed entry options for your distance. Check the entry page for current availability, eligibility and deadlines."
        : "An available entry route is not confirmed here. Check the event website for the current registration arrangements.",
      ...(entry
        ? { link: { href: entry.url, label: entry.label } }
        : website
          ? { link: { href: website, label: "Event website" } }
          : {}),
    },
  ];
}
