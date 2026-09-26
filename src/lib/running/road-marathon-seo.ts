import type { MarathonCountryGuide, RoadMarathon } from "@/data/road-marathons/types";
import { countryGuide } from "@/data/road-marathons/countries";
import { SITE_URL, siteGraphMeta } from "@/lib/athrecs/seo";
import { roadMarathonDate, upcomingRoadEditions } from "./road-marathon-calendar";

export const roadRacePath = (race: RoadMarathon) => `/running/races/${race.slug}`;
export const roadCountryPath = (country: MarathonCountryGuide) => `/running/${country.guide}`;
export const roadRaceLocation = (race: RoadMarathon, countryName?: string) =>
  [...new Set([race.city, race.region, race.nation, countryName].filter(Boolean))].join(", ");

function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

function head(title: string, description: string, path: string, graph: unknown[]) {
  const url = `${SITE_URL}${path}`;
  return {
    meta: siteGraphMeta({ title, description, url }),
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      },
    ],
  };
}

export function countryMarathonQuestions(
  country: MarathonCountryGuide,
  races: readonly RoadMarathon[],
  now: string,
) {
  const location = ["uk", "usa"].includes(country.id) ? `the ${country.name}` : country.name;
  const upcoming = races
    .flatMap((race) =>
      upcomingRoadEditions(race, now).map((edition) => ({ name: race.name, ...edition })),
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);
  return [
    {
      question: `Which road marathons are included in this ${country.name} guide?`,
      answer: `This AthRecs guide includes ${races.length} road marathons in ${location}, including ${races
        .slice(0, 5)
        .map((race) => race.name)
        .join(", ")}. Open a race guide for its course, entry options, dates and previous results.`,
    },
    {
      question: `When are the next road marathons in ${location}?`,
      answer: upcoming.length
        ? `The next confirmed dates in this guide are ${upcoming.map((race) => `${race.name} on ${roadMarathonDate(race.date, race.endDate)}`).join("; ")}. All dates are local to the race.`
        : "Upcoming race dates are TBC (to be confirmed). Each race guide links to the organiser for the latest announcements.",
    },
    {
      question: `How do I enter a road marathon in ${location}?`,
      answer:
        "Open an individual race guide to compare its entry methods and eligibility rules. Follow the official entry links for registration windows, qualifying requirements, fees and available places.",
    },
    {
      question: "Where can I find past race and category results?",
      answer:
        "Each race guide has a past-results section with race summaries and a link to the official archive. Open the full results to search for a runner or see the complete category standings.",
    },
  ];
}

export function countryMarathonHead(
  country: MarathonCountryGuide,
  races: readonly RoadMarathon[],
  now: string,
) {
  const path = roadCountryPath(country);
  const url = `${SITE_URL}${path}`;
  const shortName = country.id === "uk" ? "UK" : country.id === "usa" ? "USA" : country.name;
  const title = `${shortName} Road Marathons: Dates, Entry & Results | ATHRECS`;
  const description = `Compare ${races.length} road marathons in ${country.name}: confirmed dates through 2027, entry methods, course guides, field sizes and previous results.`;
  return head(title, description, path, [
    {
      "@type": "CollectionPage",
      "@id": url,
      name: title,
      url,
      description,
      inLanguage: "en-GB",
      dateModified: [...races]
        .map((race) => race.checkedAt)
        .sort()
        .at(-1),
      author: { "@type": "Organization", name: "AthRecs", url: SITE_URL },
      mainEntity: { "@id": `${url}#races` },
    },
    {
      "@type": "ItemList",
      "@id": `${url}#races`,
      name: `${country.name} road marathons`,
      numberOfItems: races.length,
      itemListElement: races.map((race, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "WebPage",
          name: race.name,
          url: `${SITE_URL}${roadRacePath(race)}`,
          description: race.description,
        },
      })),
    },
    {
      "@type": "ItemList",
      "@id": `${url}#upcoming`,
      name: "Confirmed upcoming marathon dates through 2027",
      numberOfItems: races.reduce(
        (count, race) => count + upcomingRoadEditions(race, now).length,
        0,
      ),
      itemListElement: races.flatMap((race) =>
        upcomingRoadEditions(race, now).map((edition) => ({
          "@type": "Thing",
          name: `${race.name}: ${roadMarathonDate(edition.date, edition.endDate)}`,
          url: `${SITE_URL}${roadRacePath(race)}#dates`,
          sameAs: edition.sourceUrl,
        })),
      ),
    },
    {
      "@type": "FAQPage",
      mainEntity: countryMarathonQuestions(country, races, now).map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    breadcrumb([
      { name: "AthRecs", path: "/" },
      { name: "Running", path: "/running" },
      { name: `${country.name} marathons`, path },
    ]),
  ]);
}

export function roadRaceQuestions(race: RoadMarathon, now: string) {
  const upcoming = upcomingRoadEditions(race, now);
  return [
    {
      question: `When is ${race.name}?`,
      answer: upcoming.length
        ? `Confirmed upcoming dates: ${upcoming.map((edition) => roadMarathonDate(edition.date, edition.endDate)).join("; ")}. Dates are local to the race.`
        : "The next race date is TBC (to be confirmed). Check the official organiser for the latest announcements.",
    },
    {
      question: `How do I enter ${race.name}?`,
      answer: race.entryMethods.length
        ? race.entryMethods.map((method) => `${method.name}: ${method.description}`).join(" ")
        : "Follow the official organiser's entry page for the available entry routes and eligibility requirements.",
    },
    { question: `What is the ${race.name} course like?`, answer: race.course.summary },
    {
      question: `Where can I find past ${race.name} results?`,
      answer:
        "The past races and results section links to the official results archive and individual editions. Use the full results for participant searches and published category standings.",
    },
  ];
}

export function roadRaceHead(race: RoadMarathon, now: string) {
  const country = countryGuide(race.country)!;
  const path = roadRacePath(race);
  const url = `${SITE_URL}${path}`;
  const title = `${race.name}: Entry, Route, Dates & Results | ATHRECS`;
  const description = `${race.name} in ${roadRaceLocation(race, country.name)}: find race dates, entry options, the course route, previous results and race photos.`;
  return head(title, description, path, [
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: title,
      description,
      inLanguage: "en-GB",
      dateModified: race.checkedAt,
      author: { "@type": "Organization", name: "AthRecs", url: SITE_URL },
      about: { "@type": "Thing", name: race.name, sameAs: race.officialUrl },
      citation: race.sources.map((source) => source.url),
    },
    ...upcomingRoadEditions(race, now).map((edition) => ({
      "@type": "SportsEvent",
      "@id": `${url}#edition-${edition.date}`,
      name: `${race.name} ${edition.date.slice(0, 4)}`,
      url: `${url}#dates`,
      startDate: edition.date,
      endDate: edition.endDate ?? edition.date,
      sport: "Running",
      description: race.description,
      sameAs: edition.sourceUrl,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: {
        "@type": "Place",
        name: roadRaceLocation(race),
        address: {
          "@type": "PostalAddress",
          addressLocality: race.city,
          addressRegion: race.region,
          addressCountry: country.countryCode,
        },
      },
    })),
    {
      "@type": "FAQPage",
      mainEntity: roadRaceQuestions(race, now).map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
    breadcrumb([
      { name: "AthRecs", path: "/" },
      { name: "Running", path: "/running" },
      { name: `${country.name} marathons`, path: roadCountryPath(country) },
      { name: race.name, path },
    ]),
  ]);
}
