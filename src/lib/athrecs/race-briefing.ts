/** Original ATHRECS athlete briefings. Facts only — never copy official guides. */

import type { Sport } from "./types";

export type EventSource = {
  label: string;
  kind: "world-triathlon" | "world-athletics" | "parkrun" | "results-base" | "find-a-race" | "runabc" | "organiser";
  url?: string | null;
};

export function eventSourceOf(input: {
  slug: string;
  sport: Sport;
  website?: string | null;
  organiser?: string | null;
}): EventSource {
  const url = input.website || "";
  const slug = input.slug.toLowerCase();
  if (slug.startsWith("wt-") || /triathlon\.org/i.test(url)) {
    return { label: "World Triathlon calendar", kind: "world-triathlon", url: url || "https://events.triathlon.org/" };
  }
  if (slug.startsWith("wa-") || /worldathletics\.org/i.test(url)) {
    return { label: "World Athletics calendar", kind: "world-athletics", url: url || "https://worldathletics.org/competition/calendar-results" };
  }
  if (input.sport === "Parkrun" || /parkrun/i.test(url)) {
    return { label: "parkrun", kind: "parkrun", url: url || "https://www.parkrun.com/" };
  }
  if (slug.startsWith("rb-") || /resultsbase\.net/i.test(url)) {
    return { label: "Results Base listing", kind: "results-base", url };
  }
  if (/findarace\.com/i.test(url)) {
    return { label: "Find A Race listing", kind: "find-a-race", url };
  }
  if (/runabc\.co\.uk/i.test(url) || slug.startsWith("runabc")) {
    return { label: "RunABC listing", kind: "runabc", url };
  }
  return { label: input.organiser || "Event organiser", kind: "organiser", url: url || null };
}

export function sportLabel(sport: Sport): string {
  if (sport === "Parkrun") return "parkrun";
  if (sport === "OCR") return "Obstacle course";
  return sport;
}

function placeLine(city?: string | null, country?: string | null): string {
  return [city, country].filter(Boolean).join(", ");
}

function sportWhat(sport: Sport, name: string): string {
  const n = name.toLowerCase();
  switch (sport) {
    case "Triathlon":
      return "A triathlon is swim, bike and run, usually with two transition areas. Distances range from super-sprint to long-course. Drafting, wetsuit rules and water temperature are set by the organiser on the day.";
    case "Duathlon":
      return "A duathlon is run, bike, run. There is no swim. Transitions still decide the race — practise racking and a clean mount line.";
    case "Aquathlon":
      return "An aquathlon is swim then run. There is no bike. Check whether the swim is pool or open water and how far the run-out is from the water to the timing mat.";
    case "Aquabike":
      return "An aquabike is swim then bike — no run. It is often staged beside a triathlon so you share the same swim and bike course.";
    case "Parkrun":
      return /junior/i.test(n)
        ? "Junior parkrun is a free, timed 2 km run for children, held on Sundays. A parent or guardian needs to register the child once and bring the barcode."
        : "parkrun is a free, weekly, timed 5 km community run. Register once on parkrun.com, bring your barcode, and volunteer when you can.";
    case "Athletics":
      return "This is a track and field meeting: sprints, hurdles, jumps, throws and sometimes a road or race-walk event on the same programme. The timetable, not a mass start, is what you need.";
    case "Cycling":
      return "A mass-start ride or race on the road or mixed surface. Confirm whether it is a sportive, a closed-road race or a time trial — the rules and support are different.";
    case "Swimming":
      return "An open-water or pool race. Cut-offs, wave starts and wetsuit policy come from the organiser. Never treat a listing time as a guarantee of water conditions.";
    case "Rowing":
      return "A regatta or head race. Boat class, division and tide window are on the official draw — ATHRECS only records the meeting, not the lane draw.";
    case "OCR":
      return "An obstacle-course race. Mandatory kit, obstacle standards and penalty rules vary by series. Read the official athlete notes before you travel.";
    default:
      return "A running event. Confirm the exact distance, surface and start procedure on the official page — listings sometimes bundle more than one race on the same day.";
  }
}

function athleteChecklist(sport: Sport): string[] {
  const common = [
    "Entry confirmation and start time from the official page",
    "Travel time to the venue, plus a buffer for parking or transit",
    "Weather for the start hour in the local timezone",
  ];
  switch (sport) {
    case "Triathlon":
    case "Duathlon":
    case "Aquathlon":
    case "Aquabike":
      return [
        ...common,
        "Bike check, helmet and race-number rules",
        "Wetsuit / swim-cap policy and water temperature notice",
        "Transition layout and racking time",
      ];
    case "Parkrun":
      return [
        "Barcode (printed or on the parkrun app)",
        "Arrive early enough to hear the first-timers' briefing",
        "Volunteer rota if you can give a week back",
      ];
    case "Athletics":
      return [
        ...common,
        "Your event's call-room or warm-up time — not just the first gun",
        "Implement / spike rules for the facility",
        "Whether the meeting is permit-level (for qualification marks)",
      ];
    case "Cycling":
      return [
        ...common,
        "Helmet and lights if required",
        "Feed-station plan or self-supported rules",
        "Whether the course uses live traffic",
      ];
    case "Swimming":
      return [
        ...common,
        "Wetsuit rule and water temperature",
        "Cap, goggles and bright tow-float if required",
        "Cut-off and safety-cover details",
      ];
    case "OCR":
      return [
        ...common,
        "Mandatory kit list from the organiser",
        "Obstacle penalty or band system",
        "Footwear that can handle mud and walls",
      ];
    case "Rowing":
      return [
        ...common,
        "Boat class and crew weigh-in if it applies",
        "Trailered boat arrival window",
        "Tide and stream notes on the official notice",
      ];
    default:
      return [
        ...common,
        "Distance you are actually entered in if the day has more than one race",
        "Surface (road, trail, track, mixed) and shoe choice",
        "Bag drop, toilets and start-pen time",
      ];
  }
}

export type RaceBriefing = {
  lede: string;
  what: string;
  confirm: string;
  checklist: string[];
  source: EventSource;
};

export function buildRaceBriefing(input: {
  name: string;
  sport: Sport;
  slug: string;
  city?: string | null;
  country?: string | null;
  surface?: string | null;
  organiser?: string | null;
  website?: string | null;
  nextDate?: string | null;
}): RaceBriefing {
  const source = eventSourceOf(input);
  const place = placeLine(input.city, input.country);
  const surface = input.surface && input.surface !== "Other" ? ` on ${input.surface.toLowerCase()} surface` : "";
  const when = input.nextDate ? ` Next date on ATHRECS is ${input.nextDate}.` : "";
  return {
    source,
    lede: `${input.name} is a ${sportLabel(input.sport).toLowerCase()} event${place ? ` in ${place}` : ""}${surface}. ATHRECS lists public facts so you can decide whether to enter — it is not the official athlete guide.${when}`,
    what: sportWhat(input.sport, input.name),
    confirm:
      "Course maps, start lists, cut-offs, prices and eligibility live on the official page. We do not copy those documents. If a fact here disagrees with the organiser, the organiser is right.",
    checklist: athleteChecklist(input.sport),
  };
}
