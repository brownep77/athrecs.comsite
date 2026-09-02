/** Original ATHRECS meeting previews for homepage and country cards.
 *  Facts only — never copy official programmes or ticket pages.
 */

import { eventSourceOf } from "./race-briefing";
import type { EventListItem } from "./types";

export type MeetingTier = "world" | "continental" | "national" | "regional";

export type SpectatorLink = {
  href: string;
  label: string;
  kind: "organiser" | "official-listing" | "event-page";
};

export type MeetingPreview = {
  tier: MeetingTier;
  lines: [string, string];
  programme: string[];
  spectator: SpectatorLink;
  attendanceHook: string;
};

const WORLD_PATTERNS =
  /\b(diamond league|weltklasse|memorial van damme|athletissima|golden gala|herculis|bislett|prefottane|stockholm bauhaus|london athletics meet|doha diamond|xiamen diamond|shanghai diamond|rabat diamond|rome diamond|oslo diamond|ultimate championship|world athletics championships|world indoor championships|world relays|world cross country|world road running|olympic)\b/i;

const CONTINENTAL_PATTERNS =
  /\b(continental tour|istaf|golden spike|fbk games|kip keino|paavo nurmi|gyulai|han\u017eekovi\u0107|hanzekovic|irena szewi\u0144ska|kusoci\u0144ski|kusocinski|palio citt\u00e0 della quercia|athlos|european athletics|african athletics|asian athletics|nacac|oceania athletics|consudatle|south american championships|area championships|area senior)\b/i;

const NATIONAL_PATTERNS =
  /\b(national championships?|nationals|campeonato nacional|campionati italiani|deutsche meisterschaften|uk athletics|british championships|aaa championships|indian athletics|copa nacional)\b/i;

export function classifyMeetingTier(input: {
  name: string;
  slug?: string;
  surface?: string | null;
  groups?: Array<{ label?: string; code?: string }>;
}): MeetingTier {
  const hay = `${input.name} ${input.slug ?? ""} ${(input.groups ?? [])
    .map((group) => `${group.label ?? ""} ${group.code ?? ""}`)
    .join(" ")}`;
  if (WORLD_PATTERNS.test(hay) || /diamond/i.test(hay)) return "world";
  if (CONTINENTAL_PATTERNS.test(hay) || /\b(gold|silver|bronze) (level|tour)\b/i.test(hay)) {
    return "continental";
  }
  if (NATIONAL_PATTERNS.test(hay)) return "national";
  return "regional";
}

export function inferMeetingProgramme(input: {
  name: string;
  surface?: string | null;
  distances?: string[] | null;
  summary?: string | null;
}): string[] {
  const hay = `${input.name} ${input.surface ?? ""} ${(input.distances ?? []).join(" ")} ${input.summary ?? ""}`.toLowerCase();
  const items: string[] = [];
  const add = (label: string) => {
    if (!items.includes(label)) items.push(label);
  };

  if (/\b(cross[- ]country|xc)\b/.test(hay)) add("Cross country");
  if (/\b(race ?walk|walk)\b/.test(hay)) add("Race walk");
  if (/\b(marathon|half marathon|10k|5k|road)\b/.test(hay) && !/track/.test(hay)) add("Road race");
  if (/\b(heptathlon|decathlon|combined)\b/.test(hay)) add("Combined events");
  if (/\b(4\s*[x×]\s*100|4\s*[x×]\s*400|relay)\b/.test(hay)) add("Relays");
  if (/\b(100|200|400|sprint|dash|flutlicht|night of athletics)\b/.test(hay)) add("Sprints");
  if (/\b(800|1500|mile|3000|5000|10000|distance)\b/.test(hay)) add("Middle / long distance");
  if (/\b(hurdle|steeple)\b/.test(hay)) add("Hurdles / steeplechase");
  if (/\b(high jump|pole vault|long jump|triple jump|jump)\b/.test(hay)) add("Jumps");
  if (/\b(shot|discus|hammer|javelin|throw|heitjate)\b/.test(hay)) add("Throws");
  if (/\b(pole vault|tyczka|asta)\b/.test(hay)) add("Pole vault");
  if (/\b(high jump|hochsprung)\b/.test(hay)) add("High jump");

  for (const distance of input.distances ?? []) {
    const clean = distance.trim();
    if (clean && clean !== "Track & field" && clean !== "Other" && !items.includes(clean)) {
      add(clean);
    }
  }

  if (!items.length) {
    if (/\bxc\b|cross/.test(hay)) return ["Cross country"];
    if ((input.surface ?? "").toLowerCase() === "road") return ["Road athletics"];
    return ["Sprints", "Hurdles", "Jumps", "Throws"];
  }

  return items.slice(0, 6);
}

function placeLine(city?: string | null, country?: string | null): string {
  return [city, country].filter(Boolean).join(", ");
}

function datePhrase(iso?: string | null): string {
  if (!iso) return "date to be confirmed";
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function meetingBriefLines(input: {
  name: string;
  city?: string | null;
  country?: string | null;
  surface?: string | null;
  nextDate?: string | null;
  distances?: string[] | null;
  summary?: string | null;
}): [string, string] {
  const place = placeLine(input.city, input.country);
  const programme = inferMeetingProgramme(input);
  const when = datePhrase(input.nextDate);
  const surface =
    input.surface && input.surface !== "Other" ? input.surface.toLowerCase() : "track and field";
  const line1 = place
    ? `${input.name} is a ${surface} meeting in ${place} on ${when}.`
    : `${input.name} is a ${surface} meeting on ${when}.`;
  const line2 = `On the programme: ${programme.join(", ")}. Check the official page for the live timetable before you travel.`;
  return [line1, line2];
}

function isWorldAthleticsListing(url: string): boolean {
  return /worldathletics\.org/i.test(url);
}

export function spectatorLinkForEvent(input: {
  slug: string;
  name: string;
  website?: string | null;
  sport?: EventListItem["sport"];
  organiser?: string | null;
}): SpectatorLink {
  const website = input.website?.trim() || "";
  if (website && !isWorldAthleticsListing(website)) {
    return {
      href: website,
      label: "Spectators",
      kind: "organiser",
    };
  }
  if (website) {
    return {
      href: website,
      label: "Official listing",
      kind: "official-listing",
    };
  }
  const source = eventSourceOf({
    slug: input.slug,
    sport: input.sport ?? "Athletics",
    website: input.website,
    organiser: input.organiser,
  });
  if (source.url) {
    return {
      href: source.url,
      label: source.kind === "world-athletics" ? "Official listing" : "Spectators",
      kind: source.kind === "world-athletics" ? "official-listing" : "organiser",
    };
  }
  return {
    href: `/races/${encodeURIComponent(input.slug)}#spectators`,
    label: "Spectator guide",
    kind: "event-page",
  };
}

export function attendanceHook(input: {
  name: string;
  city?: string | null;
  country?: string | null;
  tier: MeetingTier;
}): string {
  const city = input.city?.trim();
  if (input.tier === "world") {
    return city
      ? `World-level athletics is in ${city} — the cheapest way to see it is from the stands.`
      : "World-level athletics is easier to watch in person than most people think.";
  }
  if (input.tier === "continental") {
    return city
      ? `A Continental Tour night in ${city} is built for local crowds as much as for marks.`
      : "Continental Tour meetings are staged for spectators in the home stadium.";
  }
  if (input.tier === "national") {
    return city
      ? `National championship athletics in ${city} is the place to watch the next team for this country.`
      : "National championships are the best free-or-cheap window onto a country's best athletes.";
  }
  return city
    ? `A regional meeting in ${city} is how local clubs fill a stadium — bring family and stay for the last event.`
    : "Regional meetings are the easiest way to watch live athletics near home.";
}

export function buildMeetingPreview(event: Pick<
  EventListItem,
  | "name"
  | "slug"
  | "city"
  | "country"
  | "surface"
  | "summary"
  | "organiser"
  | "website"
  | "distances"
  | "next_date"
  | "sport"
  | "groups"
>): MeetingPreview {
  const tier = classifyMeetingTier(event);
  return {
    tier,
    lines: meetingBriefLines({
      name: event.name,
      city: event.city,
      country: event.country,
      surface: event.surface,
      nextDate: event.next_date,
      distances: event.distances,
      summary: event.summary,
    }),
    programme: inferMeetingProgramme(event),
    spectator: spectatorLinkForEvent(event),
    attendanceHook: attendanceHook({ ...event, tier }),
  };
}
