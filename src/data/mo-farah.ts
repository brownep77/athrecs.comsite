import type { AthleteSeed } from "./types";

const OLYMPEDIA = "https://www.olympedia.org/athletes/115344";
const BIOGRAPHY = "https://en.wikipedia.org/wiki/Mo_Farah";

export const moFarahAthlete: AthleteSeed = {
  slug: "mo-farah",
  display_name: "Mo Farah",
  given_name: "Mo",
  family_name: "Farah",
  gender: "M",
  club_slug: "newham-and-essex-beagles-ac",
  source_club_name: "Newham and Essex Beagles",
  city: "",
  county: "",
  country: "United Kingdom",
  nationality: "British",
  nation: "Great Britain & N.I.",
  continent: "Europe",
  commonwealth: true,
  date_of_birth: "1983-03-23",
  aliases: ["Sir Mo Farah", "Mohamed Farah"],
  bio: "British distance runner and four-time Olympic champion. Mo Farah won the 5,000m and 10,000m at both London 2012 and Rio 2016, alongside six world championship titles. He also won the 2018 Chicago Marathon in 2:05:11 and retired from competitive racing in 2023.",
  preferred_distance: "5,000 metres / 10,000 metres / Marathon",
  athrecs_id: "ATH-WA-PRO-0007",
  source_url: OLYMPEDIA,
  profile_type: "Public figure",
  profile_roles: ["Professional athlete", "Olympic champion", "Distance runner"],
  profile_source_checked_at: "2026-09-17",
  profile_links: [
    { label: "Olympic record · Olympedia", url: OLYMPEDIA },
    {
      label: "World Athletics records & results",
      url: "https://worldathletics.org/athletes/-/14189197",
    },
    { label: "Official website", url: "https://www.mofarah.com/" },
    { label: "Career biography and personal bests", url: BIOGRAPHY },
  ],
  notable_achievements: [
    {
      year: 2019,
      title: "Six consecutive Great North Run wins",
      detail:
        "Won every edition from 2014 to 2019, finishing the sixth in 59:07 on the assisted course.",
      source_url:
        "https://worldathletics.org/competition/calendar-results/results/7135647?eventId=10229633",
    },
    {
      year: 2016,
      title: "World Half Marathon Championships bronze",
      detail: "Finished third in Cardiff in 59:59.",
      source_url:
        "https://worldathletics.org/competition/calendar-results/results/7093751?eventId=10229633",
    },
    {
      year: 2012,
      title: "London Olympic double",
      detail: "Gold in the 5,000m (13:41.66) and 10,000m (27:30.42).",
      source_url: OLYMPEDIA,
    },
    {
      year: 2016,
      title: "Rio Olympic double",
      detail: "Defended both titles: 5,000m in 13:03.30 and 10,000m in 27:05.17.",
      source_url: OLYMPEDIA,
    },
    {
      year: 2017,
      title: "Six world championship golds",
      detail:
        "Three 5,000m titles and three 10,000m titles across the 2011, 2013, 2015 and 2017 championships.",
      source_url: OLYMPEDIA,
    },
    {
      year: 2018,
      title: "Chicago Marathon champion",
      detail: "Won in 2:05:11, his marathon personal best.",
      source_url:
        "https://worldathletics.org/competition/calendar-results/results/7122980?eventId=10229634",
    },
  ],
};

// Editorial facts retain hundredths; they are not invented result rows or claims.
export const moFarahCareerBests = [
  { event: "1,500m", time: "3:28.81", location: "Monaco · 2013" },
  { event: "5,000m", time: "12:53.11", location: "Monaco · 2011" },
  { event: "10,000m", time: "26:46.57", location: "Eugene · 2011" },
] as const;

// Intermediate performances are not separate race finishes.
export const moFarahTwoMileRoadBest = {
  time: "8:38",
  year: 2010,
  source: "https://www.powerof10.uk/Home/Athlete/40ad027e-74f4-444d-b84a-d206b38c7716",
} as const;

export const moFarahRoadSplits = [
  {
    distance: "15K",
    time: "42:03",
    date: "2016-03-26",
    event: "World Half Marathon Championships · Cardiff",
    source: "https://en.wikipedia.org/wiki/Mo_Farah#Personal_bests",
  },
  {
    distance: "20K",
    time: "56:27",
    date: "2015-03-22",
    event: "Lisbon Half Marathon",
    source: "https://en.wikipedia.org/wiki/Mo_Farah#Personal_bests",
  },
] as const;

export const moFarahPhoto = {
  src: "/images/athletes/mo-farah-london-2017-cc0.jpg",
  alt: "Mo Farah, wearing the white Great Britain vest and FARAH bib, racing in the 2017 World Championships 5,000m final",
  credit: "Samuel Blanck",
  source: "https://commons.wikimedia.org/wiki/File:Dernier_virage_du_5000m_(36577017945).jpg",
  licence: "https://creativecommons.org/publicdomain/zero/1.0/",
};
