import type { Edition, Series } from "./types";
import {
  belgiumEliteYouthCompetitionEditions,
  belgiumEliteYouthCompetitionSeries,
} from "./belgium-elite-youth-competitions";

/**
 * Small, hand-checked fixture batches for sports with thin coverage.
 *
 * Every row is event-level metadata verified against the linked organiser or
 * governing-body page. Participant-level results are deliberately excluded.
 */
export const verifiedAllSportSeries: Series[] = [
  ...belgiumEliteYouthCompetitionSeries,
  {
    slug: "british-rowing-beach-sprint-championships",
    name: "British Rowing Beach Sprint Championships",
    sport: "Rowing",
    country: "England",
    county: "Dorset",
    city: "Bournemouth",
    area: "Bournemouth Beach",
    surface: "Beach",
    distances: ["Beach Sprint"],
    summary: "British Rowing's national beach sprint championships in Bournemouth.",
    description:
      "Three days of coastal rowing time trials and knockout racing for solo, double and mixed-crew classes on Bournemouth Beach.",
    organiser: "British Rowing",
    website:
      "https://www.britishrowing.org/competition-calendar/british-rowing-beach-sprint-championships/",
    featured: false,
    source_url:
      "https://www.britishrowing.org/competition-calendar/british-rowing-beach-sprint-championships/",
  },
  {
    slug: "reading-triathlon-aquabike",
    name: "Reading Triathlon Aquabike",
    sport: "Aquabike",
    country: "England",
    county: "Berkshire",
    city: "Reading",
    area: "Hi5 Open Water Swim Centre, Pingewood",
    surface: "Open Water / Road",
    distances: ["Standard", "Sprint"],
    summary: "Open-water aquabike racing at the home of the Reading Triathlon.",
    description:
      "Tri2O's British Triathlon-permitted event offers a 1,500m swim and 40km bike, plus a 750m swim and 22km sprint option.",
    organiser: "Tri2O Triathlon Club",
    website: "https://www.tri2o.club/reading-triathlon-about/",
    featured: false,
    source_url: "https://www.tri2o.club/reading-triathlon-about/",
  },
  {
    slug: "tough-mudder-london-west",
    name: "Tough Mudder London West",
    sport: "OCR",
    country: "England",
    county: "Buckinghamshire",
    city: "Henley-on-Thames",
    area: "Culden Faw Estate",
    surface: "Mixed Terrain",
    distances: ["15K", "5K"],
    summary: "Tough Mudder obstacle-course racing at Culden Faw Estate.",
    description:
      "A two-day obstacle-course weekend across Culden Faw's woodland trails, hills and water-filled ditches, with 15K and 5K options.",
    organiser: "Tough Mudder UK",
    website: "https://uk.toughmudder.com/events/london-west/",
    featured: false,
    source_url: "https://uk.toughmudder.com/events/london-west/",
  },
];

export const verifiedAllSportEditions: Edition[] = [
  ...belgiumEliteYouthCompetitionEditions,
  {
    seriesSlug: "british-rowing-beach-sprint-championships",
    date: "2026-09-04",
    distance: "Beach Sprint",
    distanceKm: 0.5,
    status: "ClosingSoon",
    entryUrl:
      "https://www.britishrowing.org/competition-calendar/british-rowing-beach-sprint-championships/",
    entryOptions: [
      {
        providerCode: "british-rowing",
        providerName: "British Rowing",
        entryUrl:
          "https://www.britishrowing.org/competition-calendar/british-rowing-beach-sprint-championships/",
        entryType: "official",
        status: "closing_soon",
        closesAt: "2026-08-26T11:00:00+01:00",
        checkedAt: "2026-08-19",
        sourceUrl:
          "https://www.britishrowing.org/competition-calendar/british-rowing-beach-sprint-championships/",
        isVerified: true,
        isPrimary: true,
        notes: "Official page links onward to BROE2 and states the closing time.",
      },
    ],
    source:
      "https://www.britishrowing.org/competition-calendar/british-rowing-beach-sprint-championships/",
    notes: "Runs 4-6 September 2026; fixture date is the first competition day.",
  },
  {
    seriesSlug: "reading-triathlon-aquabike",
    date: "2026-09-13",
    distance: "Standard",
    distanceKm: 41.5,
    status: "Open",
    entryUrl:
      "https://tri2o-triathlon-club.eventrac.co.uk/e/reading-triathlon-aquathlon-and-aquabike-2026-13990",
    entryOptions: [
      {
        providerCode: "tri2o-eventrac",
        providerName: "Tri2O / Eventrac",
        entryUrl:
          "https://tri2o-triathlon-club.eventrac.co.uk/e/reading-triathlon-aquathlon-and-aquabike-2026-13990",
        entryType: "official",
        status: "open",
        checkedAt: "2026-08-19",
        sourceUrl: "https://www.tri2o.club/reading-triathlon-about/",
        isVerified: true,
        isPrimary: true,
        notes: "Organiser-linked entry page; standard and sprint aquabike options are listed.",
      },
    ],
    source: "https://www.tri2o.club/reading-triathlon-about/",
    notes: "Standard distance shown; the same fixture also offers a sprint aquabike.",
  },
  {
    seriesSlug: "tough-mudder-london-west",
    date: "2027-05-08",
    distance: "15K",
    distanceKm: 15,
    status: "Open",
    entryUrl: "https://uk.toughmudder.com/events/london-west/",
    entryOptions: [
      {
        providerCode: "tough-mudder-uk",
        providerName: "Tough Mudder UK",
        entryUrl: "https://uk.toughmudder.com/events/london-west/",
        entryType: "official",
        status: "open",
        checkedAt: "2026-08-19",
        sourceUrl: "https://uk.toughmudder.com/events/london-west/",
        isVerified: true,
        isPrimary: true,
        notes: "Official event page provides registration for the 15K and 5K events.",
      },
    ],
    source: "https://uk.toughmudder.com/events/london-west/",
    notes: "Runs 8-9 May 2027; fixture date is the first event day.",
  },
];
