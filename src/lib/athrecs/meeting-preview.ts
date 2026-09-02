/** Original ATHRECS meeting briefs for spectators. Facts only — never copy official guides. */

import {
  FIELD_EVENTS,
  TRACK_EVENTS,
  TRACK_FIELD_EVENTS,
  isFieldOnlyMeeting,
  isTrackOnlyMeeting,
} from "./filters";
import type { EventListItem } from "./types";

export type EliteTier = "world" | "continental" | "national" | "regional";

export type SpectatorLinkKind = "tickets" | "official" | "listing" | "venue";

export type SpectatorLink = {
  href: string;
  label: string;
  kind: SpectatorLinkKind;
};

export type MeetingPreview = {
  tier: EliteTier;
  circuit: string | null;
  lines: [string, string];
  events: string[];
  spectator: SpectatorLink;
};

const WORLD_HINT =
  /\b(diamond league|world athletics|world indoor|world relays|world cross|world road|ultimate championship|olympic|paralympic|world championships?)\b/i;

const CONTINENTAL_HINT =
  /\b(european athletics|european championships?|european team|african championships?|asian championships?|asian games|pan american|nacac|oceania championships?|continental tour|area championships?)\b/i;

const NATIONAL_HINT =
  /\b(national championships?|national series|nationales?|campeonato nacional|meisterschaften|campionati nazionali|kampioenschap|nationals)\b/i;

const LISTING_HOST =
  /worldathletics\.org\/competition\/calendar-results|worldathletics\.org\/competitions/i;

export function classifyEliteTier(input: {
  name: string;
  slug?: string | null;
  organiser?: string | null;
}): EliteTier {
  const blob = `${input.name} ${input.slug ?? ""} ${input.organiser ?? ""}`;
  if (WORLD_HINT.test(blob)) return "world";
  if (CONTINENTAL_HINT.test(blob)) return "continental";
  if (NATIONAL_HINT.test(blob)) return "national";
  return "regional";
}

export const eliteTier = classifyEliteTier;

export function circuitLabel(name: string): string | null {
  if (/diamond league/i.test(name)) return "Diamond League";
  if (/continental tour[^\n]*gold/i.test(name) || (/\bgold\b/i.test(name) && /continental tour/i.test(name))) {
    return "Continental Tour Gold";
  }
  if (/continental tour[^\n]*silver/i.test(name)) return "Continental Tour Silver";
  if (/continental tour[^\n]*bronze/i.test(name)) return "Continental Tour Bronze";
  if (/continental tour/i.test(name)) return "Continental Tour";
  if (/world indoor/i.test(name)) return "World Athletics Indoor";
  if (/world relays/i.test(name)) return "World Athletics Relays";
  if (/ultimate championship/i.test(name)) return "World Athletics Ultimate Championship";
  if (/european athletics|european championships?/i.test(name)) return "European Athletics";
  if (/african championships?/i.test(name)) return "African Athletics";
  if (/asian championships?|asian games/i.test(name)) return "Asian Athletics";
  if (/pan american/i.test(name)) return "Pan American Athletics";
  if (/nacac/i.test(name)) return "NACAC Athletics";
  if (/oceania championships?/i.test(name)) return "Oceania Athletics";
  return null;
}

export function inferMeetingEvents(
  name: string,
  surface?: string | null,
  distances: string[] = [],
): string[] {
  const n = name.toLowerCase();
  const surfaceKey = (surface || "").toLowerCase();
  const found: string[] = [];
  const add = (label: string) => {
    if (!found.includes(label)) found.push(label);
  };

  if (/jump/.test(n) && /throw/.test(n)) {
    for (const event of FIELD_EVENTS) add(event);
  } else {
    if (/high jump/.test(n)) add("High jump");
    if (/long jump/.test(n)) add("Long jump");
    if (/triple jump/.test(n)) add("Triple jump");
    if (/pole vault/.test(n)) add("Pole vault");
    if (/shot/.test(n)) add("Shot put");
    if (/discus/.test(n)) add("Discus");
    if (/hammer/.test(n)) add("Hammer");
    if (/javelin/.test(n)) add("Javelin");
    if (/\bjumps?\b/.test(n)) {
      add("High jump");
      add("Long jump");
      add("Triple jump");
      add("Pole vault");
    }
    if (/\bthrows?\b/.test(n)) {
      add("Shot put");
      add("Discus");
      add("Hammer");
      add("Javelin");
    }
  }

  if (/60m hurdle/.test(n)) add("60m hurdles");
  if (/100m hurdle/.test(n)) add("100m hurdles");
  if (/110m hurdle/.test(n)) add("110m hurdles");
  if (/400m hurdle/.test(n)) add("400m hurdles");
  if (/hurdle/.test(n) && !found.some((label) => /hurdle/.test(label))) {
    add("100m hurdles");
    add("110m hurdles");
    add("400m hurdles");
  }
  if (/steeple/.test(n)) add("3000m steeplechase");
  if (/\b100m\b/.test(n)) add("100m");
  if (/\b200m\b/.test(n)) add("200m");
  if (/\b400m\b/.test(n) && !/hurdle/.test(n)) add("400m");
  if (/\b800m\b/.test(n)) add("800m");
  if (/1500m/.test(n)) add("1500m");
  if (/\bmile\b/.test(n)) add("Mile");
  if (/3000m/.test(n) && !/steeple/.test(n)) add("3000m");
  if (/5000m/.test(n)) add("5000m");
  if (/10,?000m/.test(n)) add("10,000m");
  if (/\b60m\b/.test(n) && !/hurdle/.test(n)) add("60m");
  if (/sprint/.test(n)) {
    add("100m");
    add("200m");
    add("400m");
  }
  if (/mixed/.test(n) && /relay|4\s*[x×]\s*400/.test(n)) add("Mixed 4x400m");
  if (/4\s*[x×]\s*100/.test(n)) add("4x100m");
  if (/4\s*[x×]\s*400/.test(n) && !found.includes("Mixed 4x400m")) add("4x400m");
  if (/relay/.test(n)) {
    add("4x100m");
    add("4x400m");
  }
  if (/heptathlon/.test(n)) add("Heptathlon");
  if (/decathlon/.test(n)) add("Decathlon");
  if (/pentathlon/.test(n)) add("Pentathlon");
  if (/combined/.test(n)) {
    add("Heptathlon");
    add("Decathlon");
  }
  if (/race\s*walk|\bwalks?\b/.test(n) && !/sidewalk/.test(n)) add("Race walk");
  if (/cross[- ]country|\bxc\b/.test(n) || surfaceKey === "xc") add("Cross country");
  if (/half marathon|marathon|10k|5k|road/.test(n) || surfaceKey === "road") add("Road races");

  for (const distance of distances) {
    const d = distance.trim();
    if (!d || d === "Track & field" || d === "Athletics" || d === "Track" || d === "Field") continue;
    if ((TRACK_FIELD_EVENTS as readonly string[]).includes(d)) add(d);
    else if (found.length < 20) add(d);
  }

  if (found.length) return found.slice(0, 20);

  if (surfaceKey === "xc") return ["Cross country"];
  if (surfaceKey === "road") return ["Road races"];
  if (isFieldOnlyMeeting(name)) return [...FIELD_EVENTS];
  if (isTrackOnlyMeeting(name)) return [...TRACK_EVENTS];
  return [...TRACK_FIELD_EVENTS];
}

function placeLine(city?: string | null, country?: string | null): string {
  return [city, country].filter(Boolean).join(", ");
}

function formatShortDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function meetingKindLabel(name: string, surface?: string | null): string {
  if (isFieldOnlyMeeting(name)) return "field";
  if (isTrackOnlyMeeting(name)) return "track";
  if (surface && surface !== "Other") return surface.toLowerCase();
  return "athletics";
}

export function meetingBriefLines(event: {
  name: string;
  city?: string | null;
  country?: string | null;
  surface?: string | null;
  next_date?: string | null;
  nextDate?: string | null;
  organiser?: string | null;
  slug?: string | null;
  distances?: string[];
}): [string, string] {
  const place = placeLine(event.city, event.country);
  const when = formatShortDate(event.next_date ?? event.nextDate);
  const tier = classifyEliteTier(event);
  const circuit = circuitLabel(event.name);
  const programme = inferMeetingEvents(event.name, event.surface, event.distances ?? []);
  const programmeText = programme.slice(0, 8).join(", ");
  const kind = meetingKindLabel(event.name, event.surface);

  const line1 = circuit
    ? `${event.name} is a ${circuit} meeting${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`
    : tier === "world"
      ? `${event.name} is a world-level athletics meeting${place ? ` in ${place}` : ""}${when ? `, ${when}` : ""}.`
      : tier === "continental"
        ? `${event.name} is a continental athletics fixture${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`
        : tier === "national"
          ? `${event.name} is a national athletics meeting${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`
          : `${event.name} is a ${kind} meeting${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`;

  const line2 =
    programme.length === 1
      ? `On the programme: ${programme[0]}. Local spectators can follow the timetable from the stands — no entry bib required.`
      : isFieldOnlyMeeting(event.name)
        ? `Field events in the meeting include ${programmeText}. Check the spectator link for tickets, gates and the live timetable.`
        : isTrackOnlyMeeting(event.name)
          ? `Track events in the meeting include ${programmeText}. Check the spectator link for tickets, gates and the live timetable.`
          : `Events in the meeting include ${programmeText}. Check the spectator link for tickets, gates and the live timetable.`;

  return [line1, line2];
}

export function spectatorLink(event: {
  name: string;
  website?: string | null;
  city?: string | null;
  country?: string | null;
  area?: string | null;
}): SpectatorLink {
  const website = (event.website || "").trim();
  if (website && !LISTING_HOST.test(website)) {
    const tickets = /ticket|spectator|hospitality|fans/i.test(website);
    return {
      href: website,
      label: tickets ? "Spectator tickets" : "For spectators",
      kind: tickets ? "tickets" : "official",
    };
  }
  if (website) {
    return {
      href: website,
      label: "Meeting info",
      kind: "listing",
    };
  }
  const query = encodeURIComponent(
    [event.name, event.area || event.city, event.country].filter(Boolean).join(" "),
  );
  return {
    href: `https://www.google.com/maps/search/?api=1&query=${query}`,
    label: "Find the venue",
    kind: "venue",
  };
}

export function spectatorChecklist(event: {
  name: string;
  city?: string | null;
  country?: string | null;
  next_date?: string | null;
}): string[] {
  const place = placeLine(event.city, event.country);
  const first = isFieldOnlyMeeting(event.name)
    ? "arrive before the first jump or throw, not just the headline contest"
    : "arrive before the first track event, not just the headline race";
  return [
    place ? `Travel plan to ${place} — ${first}` : "Travel plan to the venue with time to spare before the first event",
    "Tickets or gate information from the spectator link — club meetings are often free",
    "Timetable for the session you want to watch; athletics is a rolling programme, not a mass start",
    "Weather and seating: evening floodlit meetings can run late, daytime championships can be long",
  ];
}

export function buildMeetingPreview(event: EventListItem): MeetingPreview {
  return {
    tier: classifyEliteTier(event),
    circuit: circuitLabel(event.name),
    lines: meetingBriefLines(event),
    events: inferMeetingEvents(event.name, event.surface, event.distances),
    spectator: spectatorLink(event),
  };
}
