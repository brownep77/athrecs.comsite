import { compactFixtureLocation } from "./fixture-presentation.ts";
import { sanitizeDistances } from "./filters.ts";
import { publicOrganiserName } from "./seo.ts";
import { searchSnippet } from "./search-text.ts";
import { raceGuideFor } from "../../data/runrecs-race-guides.ts";
import { racePageReviewFor } from "../../data/race-page-reviews.ts";

type Edition = { event_date: string; distance_code: string; status: string; result_count?: number };
type Race = {
  event: {
    slug?: string;
    name: string;
    sport: string;
    city?: string | null;
    county?: string | null;
    country?: string | null;
    area?: string | null;
    surface?: string | null;
    organiser?: string | null;
  };
  distances: string[];
  upcoming: Edition[];
  past: Edition[];
};
const known = (value?: string | null) => {
  const text = value?.replace(/\s+/g, " ").trim() ?? "";
  return /^(?:unknown|tbc|other|n\/?a|see official (?:site|website)|not recorded|[-—])$/i.test(text)
    ? ""
    : text;
};
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
const distanceName = (value: string) => (value === "Half" ? "half marathon" : value);

/** Share the same next edition across the visible header, title and event metadata. */
export function nextRaceEdition<T extends Edition>(upcoming: T[]): T | undefined {
  return upcoming
    .filter((row) => row.status !== "Cancelled" && validDate(row.event_date))
    .sort((a, b) => a.event_date.localeCompare(b.event_date))[0];
}

/** A readable race biography from existing catalogue facts, without invented history. */
export function raceSearchContent(data: Race) {
  const { event, upcoming, past } = data;
  const location = compactFixtureLocation({ ...event, country: known(event.country) });
  const place = [location.text, known(location.countryName)].filter(Boolean).join(", ");
  const sport = known(event.sport).toLowerCase();
  const surface = known(event.surface);
  const distances = [
    ...new Set(
      sanitizeDistances(
        event.name,
        data.distances.length
          ? data.distances
          : [...upcoming, ...past].map((row) => row.distance_code),
      )
        .map(known)
        .filter(Boolean)
        .map(distanceName),
    ),
  ];
  const next = nextRaceEdition(upcoming);
  const review = racePageReviewFor(event.slug, next?.event_date);
  const years = [
    ...new Set(
      past
        .filter((row) => row.status !== "Cancelled" && validDate(row.event_date))
        .map((row) => row.event_date.slice(0, 4)),
    ),
  ].sort();
  const lead = `${event.name} is ${/^[aeiou]/i.test(sport) ? "an" : "a"} ${sport ? `${sport} ` : ""}event${place ? ` in ${place}` : ""}.`;
  const facts = [lead];
  if (distances.length)
    facts.push(
      `Recorded disciplines include ${distances.slice(0, 8).join(", ")}${distances.length > 8 ? " and other events" : ""}.`,
    );
  if (surface) facts.push(`The listed surface is ${surface.toLowerCase()}.`);
  const guide = event.slug ? raceGuideFor({ slug: event.slug }, next?.event_date) : undefined;
  const organiser = publicOrganiserName(guide?.organiser?.name ?? event.organiser);
  if (organiser) facts.push(`The listed organiser is ${organiser}.`);
  if (next)
    facts.push(
      `The next listed date is ${formatDate(next.event_date)}. Check the organiser's information for entry and race-day arrangements.`,
    );
  else facts.push("No future date is currently listed on ATHRECS.");
  if (years.length)
    facts.push(
      `The ATHRECS archive includes editions ${years.length === 1 ? `from ${years[0]}` : `from ${years[0]} to ${years.at(-1)}`}. This describes the editions recorded here, not the event's founding date or complete history.`,
    );
  const timing = next
    ? `Next listed date: ${formatDate(next.event_date)}.`
    : years.length
      ? `Recorded editions: ${years[0]}${years.length > 1 ? `–${years.at(-1)}` : ""}.`
      : "Race details and recorded editions.";
  const titleName = `${event.name}${next && !new RegExp(`\\b${next.event_date.slice(0, 4)}\\b`).test(event.name) ? ` ${next.event_date.slice(0, 4)}` : ""}`;
  const titleSuffix = next ? "Date & Entry" : years.length ? "Results & History" : "Race Details";
  const standardTitle = `${titleName} | ${titleSuffix} | AthRecs`;
  return {
    biography: review
      ? [...review.biography, ...facts.filter((fact) => fact.startsWith("The ATHRECS archive"))]
      : facts,
    title:
      review?.title ??
      (standardTitle.length <= 80
        ? standardTitle
        : `${titleName}${!next && years.length ? " | Results" : ""} | AthRecs`),
    description:
      review?.description ??
      searchSnippet(
        `${event.name}. ${timing}${place ? ` ${place}.` : ""}${distances.length ? ` ${distances.slice(0, 3).join(", ")}.` : ""}`,
      ),
    next,
  };
}
