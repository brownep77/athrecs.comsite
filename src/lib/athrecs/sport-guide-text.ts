/** Practical editorial copy; local examples and dates come from the catalogue. */
const guides: Record<string, { intro: string; planning: string }> = {
  Running: {
    intro:
      "Compare running races by distance, date and surface, from shorter road events to trail races and ultras.",
    planning:
      "Choose your distance, then check the route, elevation, cut-off time and entry conditions in the organiser’s race guide.",
  },
  Athletics: {
    intro:
      "Explore athletics meetings and track and field events, with dates, venues and recorded disciplines.",
    planning:
      "A meeting’s opening time may differ from your event’s start. Check the final timetable, age groups, entry standards and declarations before travelling.",
  },
  Parkrun: {
    intro:
      "Find parkrun locations and distinguish 5K events from 2K junior events using the distance labels.",
    planning:
      "Check the individual event’s course page, start time and cancellation notices. A regular weekly schedule does not confirm that every future date will take place.",
  },
  Cycling: {
    intro:
      "Browse cycling events by distance and date, then compare the riding discipline and start location.",
    planning:
      "Check whether the event uses a mass start, individual start or departure window. Review the route, surface, cut-off times and equipment requirements with the organiser.",
  },
  Swimming: {
    intro:
      "Explore swimming events and advertised distances, with links to the event’s own information.",
    planning:
      "Check whether the event is in a pool or open water, then read the organiser’s wave times, eligibility, equipment rules and event-day arrangements.",
  },
  Triathlon: {
    intro:
      "Compare triathlons by date and format, then check the swim, bike and run distances separately.",
    planning:
      "Format names do not replace the advertised leg distances. Check the swim start or wave assignment, transition opening times and briefing details for your entry.",
  },
  Duathlon: {
    intro:
      "Find duathlon events and compare their run, bike and final run stages before choosing a race.",
    planning:
      "Check all three leg distances, the cycling route, transition arrangements and your assigned start wave in the organiser’s current guide.",
  },
  "Functional Fitness": {
    intro:
      "Explore hybrid races and functional fitness competitions, including HYROX, DEKA and CrossFit.",
    planning:
      "Choose the competition format and division, then check the organiser’s workout standards, equipment and scoring rules.",
  },
  HYROX: {
    intro: "Find HYROX events combining running and workout stations, with dates and locations.",
    planning:
      "Check your individual, doubles or relay division, workout standards and assigned start wave. Compare performances within the same division and format.",
  },
  DEKA: {
    intro:
      "Explore DEKA fitness competitions and compare their dates, locations and advertised formats.",
    planning:
      "Check whether your entry is for FIT, MILE, STRONG or another DEKA format, then read the current competition standards and start arrangements.",
  },
  CrossFit: {
    intro: "Explore CrossFit competitions, from local events to the Open and championship stages.",
    planning:
      "Check the workout standards, division, score submission deadline and judging requirements. Workout scores and overall standings depend on the competition rules.",
  },
  OCR: {
    intro:
      "Find obstacle course races and compare their dates, locations and advertised distances.",
    planning:
      "Check the obstacle rules, penalties, competitive or participation category, course distance and equipment requirements.",
  },
  Swimrun: {
    intro: "Explore swimrun events combining repeated swimming and running sections.",
    planning:
      "Check each swim and run section, whether the entry is solo or paired, and the organiser’s equipment, cut-off and team rules.",
  },
  Aquathlon: {
    intro: "Find aquathlon events combining swimming and running.",
    planning:
      "Check the exact order and distances of the swim and run legs, the venue and your assigned start wave.",
  },
  Aquabike: {
    intro: "Explore aquabike events combining swimming and cycling.",
    planning:
      "Check both leg distances, the swim start, transition arrangements and where the official finish is recorded.",
  },
  Rowing: {
    intro: "Explore rowing events and compare dates, venues and advertised race formats.",
    planning:
      "Check the boat class, crew category, course distance and race timetable with the organiser.",
  },
  "Indoor Rowing": {
    intro:
      "Find indoor rowing competitions and compare dates, locations and advertised distances or formats.",
    planning:
      "Check the machine standard, distance or timed format, age and weight categories, and whether racing is in person or online.",
  },
  Orienteering: {
    intro: "Explore orienteering events that combine navigation with outdoor competition.",
    planning:
      "Check the course length and difficulty, map and timing arrangements, start window and any mandatory equipment.",
  },
  "Adventure Racing": {
    intro: "Find adventure races combining endurance disciplines and navigation.",
    planning:
      "Check the disciplines, team size, navigation rules, mandatory equipment, checkpoints and overall time limit.",
  },
};
export function sportGuideText(sport: string) {
  return (
    guides[sport] ?? {
      intro: "Explore upcoming events, recorded results and organiser information.",
      planning: "Check the organiser’s current programme, entry conditions and start arrangements.",
    }
  );
}

export const disciplineIntros: Record<string, string> = {
  "road-running":
    "Find road running events from shorter races to marathons and ultras. Compare advertised distances, dates and locations, then open the event information for entry details and race starts.",
  "trail-running":
    "Explore trail running fixtures and compare distances and locations. Review each organiser’s route, terrain, elevation and cut-off information when choosing an event.",
  "track-and-field":
    "Browse track and field meetings, fixtures and recorded results. Check the meeting programme for the disciplines offered and the timetable for your specific event.",
  "road-cycling":
    "Discover road cycling fixtures and advertised ride distances. Compare start locations and dates, then check the organiser’s route, departure window and entry requirements.",
  "mountain-biking":
    "Find mountain biking and cross-country cycling fixtures. Compare dates and venues, and use the organiser’s guide to check the course, category and equipment requirements.",
  "track-cycling":
    "Browse track cycling events and velodrome fixtures. Check the session timetable, race format, category and entry conditions before making plans.",
  bmx: "Explore BMX racing and freestyle fixtures by date and location. Follow the event information for categories, practice sessions, competition schedules and entry details.",
};
