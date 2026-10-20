import type { RacePlacePageData } from "./race-places";
import { sportGuideText } from "./sport-guide-text";

export type RaceCopyPart = string | { text: string; href: string };
export type RaceCopyParagraph = RaceCopyPart[];
const number = (value: number) => value.toLocaleString("en-GB");
const list = (items: string[]) =>
  new Intl.ListFormat("en-GB", { type: "conjunction" }).format(items);
const raceLink = (race: { name: string; slug: string }) => ({
  text: race.name,
  href: `/races/${encodeURIComponent(race.slug)}`,
});
const joinedLinks = (links: { text: string; href: string }[]): RaceCopyParagraph =>
  links.flatMap((link, index) => [
    ...(index ? [index === links.length - 1 ? " and " : ", "] : []),
    link,
  ]);

const articleCountries = new Set([
  "United Kingdom",
  "United States",
  "United Arab Emirates",
  "Netherlands",
  "Philippines",
  "Bahamas",
  "Gambia",
  "Maldives",
  "Seychelles",
  "Comoros",
  "Marshall Islands",
  "Solomon Islands",
  "Cook Islands",
  "Falkland Islands",
]);
export function racePlaceLocation(data: RacePlacePageData, prose = false) {
  if (data.place.kind === "world") return prose ? "the world" : "Worldwide";
  const name = data.place.name;
  const parent = data.ancestors.at(-2);
  const qualified =
    data.place.kind === "region" && parent && parent.name !== name
      ? `${name}, ${parent.name}`
      : name;
  return prose && (articleCountries.has(name) || /^(?:Democratic )?Republic of /.test(name))
    ? `the ${qualified}`
    : qualified;
}

// Only explicit distance codes are described. No course, terrain, popularity,
// ability level or entry availability is inferred from an event's name.
export function runningDistanceNames(data: RacePlacePageData) {
  const known: Record<string, string> = {
    "1K": "1K",
    "3K": "3K",
    "5K": "5K",
    "8K": "8K",
    "10K": "10K",
    "12K": "12K",
    "15K": "15K",
    "20K": "20K",
    "25K": "25K",
    "30K": "30K",
    "50K": "50K",
    "100K": "100K",
    "5mi": "5 mile",
    "10mi": "10 mile",
    "20mi": "20 mile",
    Half: "half marathon",
    Marathon: "marathon",
    Ultra: "ultramarathon",
    Quarter: "quarter marathon",
  };
  return [
    ...new Set(
      [...data.overview.distances]
        .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
        .map(({ code }) => known[code])
        .filter((name): name is string => Boolean(name)),
    ),
  ].slice(0, 6);
}

function raceFocus(data: RacePlacePageData) {
  if (data.facet.terrain && data.facet.distance)
    return `${data.facet.terrain.label.replace(/ running$/i, "")} ${data.facet.distance.heading.toLowerCase()}`;
  if (data.facet.terrain) return data.facet.terrain.heading;
  if (data.facet.distance) return data.facet.distance.heading;
  if (data.facet.sport) return data.facet.sport.heading;
  const sports = data.overview.sports;
  if (sports.length === 1) {
    if (sports[0] === "Running") return "Running races";
    if (sports[0] === "Athletics") return "Athletics events";
    if (sports[0] === "Triathlon") return "Triathlons";
  }
  return "Races and events";
}

function dateText(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function racePlaceCopy(data: RacePlacePageData) {
  const location = racePlaceLocation(data, true);
  const focus = raceFocus(data);
  const distances = runningDistanceNames(data);
  const raceTypes = distances.map((distance) =>
    distance.endsWith("marathon") ? `${distance}s` : `${distance} races`,
  );
  const eventWord = data.upcomingCount === 1 ? "event" : "events";
  const hasUpcoming = data.upcomingCount > 0;
  const heading = data.archive
    ? `Past races and dates to be announced in ${location}`
    : data.place.kind === "world"
      ? data.facet.sport
        ? `${focus} around the world`
        : "Find races around the world"
      : !data.facet.sport && data.place.kind === "region"
        ? `${data.place.name} sports and events`
        : `${focus} in ${location}`;
  const intro: RaceCopyParagraph[] = [];
  const questions: { question: string; answer: RaceCopyParagraph }[] = [];
  const parent = data.ancestors.at(-2);
  const populatedChildren = data.children
    .filter((child) => child.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  if (!data.total) {
    intro.push([`We do not have race listings for ${location} yet.`]);
    if (parent)
      intro.push(["You can keep looking in ", { text: parent.name, href: parent.path }, "."]);
  } else if (data.archive) {
    intro.push([
      `Browse ${number(data.archiveCount)} race ${data.archiveCount === 1 ? "guide" : "guides"} in ${location} without an upcoming edition currently listed. These may be past events, cancelled editions or races awaiting a new date.`,
    ]);
    intro.push([
      "A previous edition does not mean a race will return. For events with a future date, use the ",
      { text: "upcoming race calendar", href: data.path },
      ".",
    ]);
  } else {
    if (hasUpcoming) {
      const first =
        data.place.kind === "world"
          ? "Build your racing calendar, close to home or further afield."
          : data.place.kind === "continent"
            ? `Compare ${focus.toLowerCase()} across ${location} and choose where to compete next.`
            : `Find ${focus.toLowerCase()} in ${location}.`;
      intro.push([
        `${first} Compare ${number(data.upcomingCount)} upcoming ${eventWord} by date and location. Open a race guide for the course, recorded editions and official entry information where available.`,
      ]);
      if (raceTypes.length && !data.facet.distance)
        intro.push([`Upcoming running events include ${list(raceTypes)}.`]);
    } else {
      intro.push([
        data.filters.month || data.filters.city
          ? `No upcoming races match these filters in ${location}. Clear the filters to see other dates and locations.`
          : `Explore ${number(data.total)} recorded ${data.total === 1 ? "event" : "events"} in ${location}. No upcoming dates are currently listed, but you can still browse the race guides and previous editions.`,
      ]);
    }
    const examples = (data.races.length ? data.races : data.archivePreview).slice(0, 3);
    if (examples.length)
      intro.push([
        hasUpcoming
          ? examples.length === 1
            ? "One event to explore is "
            : "Events to explore include "
          : "The recorded events include ",
        ...joinedLinks(examples.map(raceLink)),
        ".",
      ]);
    if (populatedChildren.length > 1)
      intro.push([
        data.place.kind === "world"
          ? "Start with a continent, including "
          : "Narrow your search to ",
        ...joinedLinks(
          populatedChildren.slice(0, 3).map((child) => ({ text: child.name, href: child.path })),
        ),
        populatedChildren.length > 3 ? ", or browse the other locations below." : ".",
      ]);
  }

  if (data.total && !data.archive) {
    if (data.facet.sport) {
      const guide = sportGuideText(data.facet.sport.sport);
      intro.push([guide.intro]);
      questions.push({
        question: `What should I check before a ${data.facet.sport.label.toLowerCase()} event in ${data.place.name}?`,
        answer: [guide.planning],
      });
    } else if (data.place.kind === "region") {
      const towns = data.cities
        .slice()
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
        .map((item) => item.value);
      if (towns.length)
        intro.push([
          `Use this ${data.place.name} sports homepage to explore recorded events in ${list(towns)}. Choose a sport below or compare dates across the county.`,
        ]);
    }
    const nextAnswer: RaceCopyParagraph = [];
    if (hasUpcoming) {
      data.overview.nextRaces.forEach((race, index) => {
        if (index) nextAnswer.push(" ");
        nextAnswer.push(raceLink(race), ` is listed for ${dateText(race.next.date)}`);
        if (race.next.endDate && race.next.endDate !== race.next.date)
          nextAnswer.push(` to ${dateText(race.next.endDate)}`);
        if (race.next.status === "Closed") nextAnswer.push(" (entry closed)");
        if (race.next.status === "TBC") nextAnswer.push(" (status to be confirmed)");
        nextAnswer.push(".");
      });
      nextAnswer.push(
        " Check the race guide and organiser’s latest information before making plans.",
      );
    } else {
      nextAnswer.push(
        data.filters.month || data.filters.city
          ? `No upcoming races match the selected filters. Clear the filters to browse the full ${location} calendar.`
          : `There are no upcoming dates listed for ${location} at present. The recorded race guides remain available, and a new edition will appear in the calendar when it is added to AthRecs.`,
      );
    }
    questions.push({
      question: `Which ${focus.toLowerCase()} are coming up in ${location}?`,
      answer: nextAnswer,
    });
    if (distances.length && !data.facet.distance)
      questions.push({
        question: `What running distances are listed in ${location}?`,
        answer: [
          `Look for ${list(raceTypes)} in the upcoming listings. If an event offers several distances, check the individual race guide to choose the edition and distance you want to enter.`,
        ],
      });
    questions.push({
      question: `Where can I find race entry details for ${location}?`,
      answer: [
        "Follow the link from the race guide to the organiser or entry provider, where one is available. Check the entry deadline, eligibility and current availability there. A listed race date does not necessarily mean entries are still open.",
      ],
    });
    questions.push({
      question: "Why has a race moved out of the upcoming calendar?",
      answer: [
        "Once its listed dates have passed, a race moves to the past-editions view unless another upcoming edition is recorded. Cancelled events also leave the upcoming list. The race guide stays available, and the event returns when a new date is added.",
      ],
    });
  }

  const shortLocation = data.place.kind === "world" ? "Worldwide" : data.place.name;
  const titleFocus = data.facet.terrain
    ? focus
    : data.facet.distance
      ? data.facet.distance.heading
      : data.facet.sport
        ? data.facet.sport.heading.toLowerCase()
        : data.place.kind === "region"
          ? "sports & events calendar"
          : `${focus === "Triathlons" ? "triathlon" : focus === "Athletics events" ? "athletics" : "race"} calendar`;
  const title = `${shortLocation} ${titleFocus}${data.archive ? " — past editions" : ""}${data.page > 1 ? ` — page ${data.page}` : ""}${data.place.kind === "region" && parent && parent.name !== data.place.name ? ` | ${parent.name}` : ""} | AthRecs`;
  const description = data.archive
    ? `Browse ${number(data.archiveCount)} race guides in ${location} awaiting a new date or with past editions. Find recorded events and links to the upcoming calendar.`
    : !data.total
      ? `Race listings for ${location} are not available yet. Browse the surrounding locations on AthRecs to plan your next event.`
      : !hasUpcoming
        ? `Explore ${number(data.total)} recorded events in ${location}. Browse race guides and past editions, and check back for new dates on AthRecs.`
        : `Find ${number(data.upcomingCount)} upcoming ${data.facet.sport ? (data.upcomingCount === 1 ? focus.toLowerCase().replace(/s$/, "") : focus.toLowerCase()) : eventWord} in ${location}.${raceTypes.length && !data.facet.distance ? ` Includes ${list(raceTypes.slice(0, 3))}.` : ""} Compare dates and entry details on AthRecs.`;
  if (data.filters.month || data.filters.city)
    intro.unshift([
      `Showing ${data.filters.city ? `events in ${data.filters.city}` : "events"}${data.filters.month ? ` during ${new Date(`${data.filters.month}-01T12:00:00Z`).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })}` : ""}.`,
    ]);
  return {
    heading,
    intro,
    questions,
    title,
    description: `${data.page > 1 ? `Page ${data.page}. ` : ""}${description}`,
  };
}
