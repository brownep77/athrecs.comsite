/** Original ATHRECS meeting briefs for spectators. Facts only — never copy official guides. */

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
  if (/continental tour[^\n]*gold/i.test(name) || /\bgold\b/i.test(name) && /continental tour/i.test(name)) {
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
    add("High jump");
    add("Long jump");
    add("Triple jump");
    add("Pole vault");
    add("Shot put");
    add("Discus");
    add("Hammer");
    add("Javelin");
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
    }
    if (/\bthrows?\b/.test(n)) {
      add("Shot put");
      add("Discus");
      add("Javelin");
    }
  }

  if (/hurdle/.test(n)) add("Hurdles");
  if (/sprint|100m|200m|400m/.test(n)) add("Sprints");
  if (/800m|1500m|mile|3000m|5000m|10,?000m|middle[- ]distance/.test(n)) add("Middle distance");
  if (/relay/.test(n)) add("Relays");
  if (/heptathlon|decathlon|combined/.test(n)) add("Combined events");
  if (/race\s*walk|walk/.test(n) && !/sidewalk/.test(n)) add("Race walk");
  if (/cross[- ]country|\bxc\b/.test(n) || surfaceKey === "xc") add("Cross country");
  if (/half marathon|marathon|10k|5k|road/.test(n) || surfaceKey === "road") add("Road races");

  for (const distance of distances) {
    const d = distance.trim();
    if (!d || d === "Track & field" || d === "Athletics") continue;
    if (found.length >= 8) break;
    add(d);
  }

  if (found.length) return found.slice(0, 8);

  if (surfaceKey === "xc") return ["Cross country"];
  if (surfaceKey === "road") return ["Road races"];
  return ["Sprints", "Hurdles", "Middle distance", "Jumps", "Throws"];
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
  const programmeText = programme.slice(0, 4).join(", ");
  const surface =
    event.surface && event.surface !== "Other" ? event.surface.toLowerCase() : "track and field";

  const line1 = circuit
    ? `${event.name} is a ${circuit} meeting${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`
    : tier === "world"
      ? `${event.name} is a world-level athletics meeting${place ? ` in ${place}` : ""}${when ? `, ${when}` : ""}.`
      : tier === "continental"
        ? `${event.name} is a continental athletics fixture${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`
        : tier === "national"
          ? `${event.name} is a national athletics meeting${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`
          : `${event.name} is a ${surface} meeting${place ? ` in ${place}` : ""}${when ? ` on ${when}` : ""}.`;

  const line2 =
    programme.length === 1
      ? `On the programme: ${programme[0]}. Local spectators can follow the timetable from the stands — no entry bib required.`
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
  return [
    place ? `Travel plan to ${place} — arrive before the first track event, not just the headline race` : "Travel plan to the stadium with time to spare before the first event",
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
