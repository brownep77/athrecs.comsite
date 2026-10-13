import { compactFixtureLocation } from "./fixture-presentation.ts";
import { sanitizeDistances } from "./filters.ts";
import { SITE_NAME } from "./seo.ts";
import { searchSnippet } from "./search-text.ts";

type Edition = { event_date: string; distance_code: string; status: string; result_count?: number };
type Race = {
  event: {
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
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
const distanceName = (value: string) => (value === "Half" ? "half marathon" : value);

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
  const next = upcoming
    .filter((row) => row.status !== "Cancelled" && validDate(row.event_date))
    .sort((a, b) => a.event_date.localeCompare(b.event_date))[0];
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
  if (known(event.organiser)) facts.push(`The listed organiser is ${known(event.organiser)}.`);
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
  return {
    biography: facts,
    title: `${event.name}${next ? ` ${next.event_date.slice(0, 4)}` : " results & history"}${place ? ` — ${place}` : ""} | ${SITE_NAME}`,
    description: searchSnippet(
      `${event.name}${place ? ` in ${place}` : ""}${distances.length ? `: ${distances.slice(0, 3).join(", ")}` : ""}. ${timing}`,
    ),
    next,
  };
}
