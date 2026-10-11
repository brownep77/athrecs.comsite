import { getBritishMarathonCareer } from "./british-marathon-careers";
import { getSanSebastian2026Career } from "./san-sebastian-2026-careers";
import { paulEvansCareer } from "./paul-evans-career";

// Public editorial content checked on 28 September 2026. These highlights do
// not create result rows, personal bests, rankings or automatic medal totals.
type Source = { label: string; url: string; locator: string };
type Highlight = {
  id: string;
  title: string;
  date: string;
  outcomes: readonly string[];
  sources: readonly Source[];
};

const lamarProfile: Source = {
  label: "Lamar University athlete profile",
  url: "https://lamarcardinals.com/sports/track-and-field/roster/freddy--richardson/21627",
  locator: "Freddy Richardson, Colchester, England; career honours and 2024–2025 seasons",
};
const cardiff: Source = {
  label: "England Athletics: Cardiff selection",
  url: "https://www.englandathletics.org/news/england-to-take-on-home-nations-at-cardiff-5k/",
  locator: "2025 men's team: Freddy Richardson, Colchester and Tendering AC",
};
const armagh: Source = {
  label: "England Athletics: Armagh selection",
  url: "https://www.englandathletics.org/news/team-announced-for-armagh-international-2026/",
  locator: "2026 men's team: Freddy Richardson, Colchester and Tendering AC",
};
const indoor2025: Source = {
  label: "Lamar University championship report",
  url: "https://lamarcardinals.com/news/2025/3/3/track-and-field-johnson-wins-three-gold-medals-cardinal-women-take-second-at-slc-title-meet.aspx",
  locator: "Freddy Richardson: men's 3000m gold 8:08.74 and mile silver 4:11.72",
};
const texasRelays: Source = {
  label: "Lamar University race report",
  url: "https://lamarcardinals.com/news/2025/3/27/track-and-field-rainey-richardson-and-sheppard-brown-capture-first-place-in-texas-relays-first-day.aspx",
  locator: "Freddy Richardson, Lamar: men's 1500m winner, 3:45.58",
};
const alumniMuster: Source = {
  label: "Lamar University meet-record report",
  url: "https://lamarcardinals.com/news/2025/5/3/track-and-field-hobday-richardson-set-meet-records-at-texas-ams-alumni-muster.aspx",
  locator: "Freddy Richardson, Lamar: men's 1500m winner, meet record 3:45.34",
};

export const freddyRichardsonCareer = {
  slug: "freddy-richardson",
  checkedAt: "2026-09-28",
  biography: [
    "Freddy Richardson is a British distance runner from Colchester who competes on the track, roads and cross country. A member of Colchester & Tendring AC, he also competed for Lamar University in Texas, winning Southland Conference medals across middle-distance events and cross country.",
    "His 2025 season included the Southland indoor 3000m title, gold as part of Lamar's distance medley relay team and silver in the mile. Outdoors, he won Southland silver over 1500m and bronze over 5000m. He also won the 1500m at the Texas Relays and Texas A&M Alumni Muster, setting a meet record at the latter.",
    "His road-running progression brought England selections for the 2025 Home Nations 5K in Cardiff and the 2026 Armagh International Road Races.",
  ],
  biographySources: [lamarProfile, indoor2025, alumniMuster, cardiff, armagh],
  achievements: [
    {
      id: "england-selections",
      title: "England selections",
      date: "2025–2026",
      outcomes: [
        "Selected for the men's team at the 2025 Home Nations 5K in Cardiff.",
        "Selected for the men's team at the 2026 Armagh International Road Races.",
      ],
      sources: [cardiff, armagh],
    },
    {
      id: "southland-outdoor-2025",
      title: "Southland outdoor championship medals",
      date: "15–17 May 2025 · Houston, Texas",
      outcomes: ["1500m final · Silver · 3:52.61", "5000m · Bronze · 14:42.32"],
      sources: [
        {
          label: "TFRRS: men's 1500m final",
          url: "https://tf.tfrrs.org/results/92076/5661302/Southland_Conference_Outdoor_Track__Field_Championships/Mens-1500-Meters",
          locator:
            "Finals, PL 2, Freddy Richardson, SR-4, Lamar; time corroborated by Lamar profile",
        },
        {
          label: "TFRRS: men's 5000m",
          url: "https://tf.tfrrs.org/results/92076/5661257/Southland_Conference_Outdoor_Track__Field_Championships/Mens-5000-Meters",
          locator: "PL 3, Freddy Richardson, SR-4, Lamar, TIME 14:42.32",
        },
        lamarProfile,
      ],
    },
    {
      id: "alumni-muster-2025",
      title: "Texas A&M Alumni Muster winner",
      date: "3 May 2025 · College Station, Texas",
      outcomes: ["1500m · 1st · 3:45.34", "Meet record at the time of the race."],
      sources: [alumniMuster],
    },
    {
      id: "texas-relays-2025",
      title: "Texas Relays winner",
      date: "27 March 2025 · Austin, Texas",
      outcomes: ["Men's university/college 1500m, Section A · 1st · 3:45.58"],
      sources: [texasRelays],
    },
    {
      id: "southland-indoor-2025",
      title: "Southland indoor champion",
      date: "2–3 March 2025 · Birmingham, Alabama",
      outcomes: [
        "3000m · Gold · 8:08.74",
        "Distance medley relay · Team gold with Lamar · 9:54.36",
        "Mile final · Silver · 4:11.72",
      ],
      sources: [
        indoor2025,
        {
          label: "TFRRS: winning relay team",
          url: "https://tf.tfrrs.org/results/89409/5424384/Southland_Conference_Indoor_Championships_2025/Mens-Distance-Medley-Relay",
          locator:
            "PL 1 Lamar; Richardson, Ellis, Parker, Sheppard-Brown; time corroborated by Lamar profile",
        },
        lamarProfile,
      ],
    },
    {
      id: "ncaa-regionals-2024",
      title: "NCAA South Central regional top 12",
      date: "15 November 2024 · College Station, Texas",
      outcomes: ["Men's 10K cross country · 12th · 29:49.2"],
      sources: [
        {
          label: "TFRRS: regional championship results",
          url: "https://www.tfrrs.org/results/xc/25321/NCAA_Division_I_South_Central_Region_Cross_Country_Championships?meet_hnd=25321",
          locator:
            "Men 10k CC, PL 12, Freddy Richardson, SR-4, Lamar, TIME 29:49.2; scoring place 11 is separate",
        },
      ],
    },
    {
      id: "southland-xc-2024",
      title: "Southland cross-country runner-up",
      date: "1 November 2024 · New Orleans, Louisiana",
      outcomes: ["Men's 8K cross country · 2nd · 24:41.65", "First-team All-Southland honours."],
      sources: [
        {
          label: "Lamar University championship report",
          url: "https://lamarcardinals.com/news/2024/11/1/cross-country-back-to-back-women-repeat-as-conference-champions.aspx",
          locator: "Men's 8K: Richardson second in 24:41.65, first-team honour",
        },
      ],
    },
    {
      id: "southland-outdoor-2024",
      title: "Southland outdoor bronze",
      date: "9–11 May 2024 · Houston, Texas",
      outcomes: ["1500m final · Bronze · 3:53.10"],
      sources: [
        {
          label: "TFRRS: men's 1500m final",
          url: "https://tf.tfrrs.org/results/85440/5277199/Southland_Conference_Outdoor_Track__Field_Championships/Mens-1500-Meters",
          locator:
            "Finals, PL 3, Freddy Richardson, JR-3, Lamar; time corroborated by Lamar profile",
        },
        lamarProfile,
      ],
    },
    {
      id: "southland-indoor-2024",
      title: "Southland indoor silver medals",
      date: "25–26 February 2024 · Birmingham, Alabama",
      outcomes: [
        "Mile final · Silver · 4:16.75",
        "Distance medley relay · Team silver with Lamar · 10:01.50",
      ],
      sources: [
        {
          label: "TFRRS: men's mile final",
          url: "https://tf.tfrrs.org/results/83465/5078519/Southland_Conference_Indoor_Track__Field_Championships/Mens-Mile",
          locator:
            "Finals, PL 2, Freddy Richardson, JR-3, Lamar; time corroborated by Lamar profile",
        },
        {
          label: "TFRRS: relay team",
          url: "https://tf.tfrrs.org/results/83465/5078498/Southland_Conference_Indoor_Track__Field_Championships/Mens-Distance-Medley-Relay",
          locator:
            "PL 2 Lamar; Cisneros, Johnson, Servantes, Richardson; time corroborated by Lamar profile",
        },
        lamarProfile,
      ],
    },
  ] satisfies readonly Highlight[],
  reportedHighlights: [
    {
      id: "london-10000-2026",
      title: "Vitality London 10,000",
      date: "27 September 2026 · London",
      outcomes: [
        "Reported men's 3rd place · 29:53",
        "Athletics Weekly report; official timing confirmation pending.",
      ],
      sources: [
        {
          label: "Athletics Weekly race report",
          url: "https://athleticsweekly.com/news/eilish-mccolgan-claims-record-fourth-london-10000-title-1040013343/",
          locator: "Men's podium: Richardson of Colchester & Tendring, 29:53 behind Sesemann",
        },
      ],
    },
    {
      id: "telford-2025",
      title: "Telford 10K",
      date: "14 December 2025 · Telford",
      outcomes: [
        "Reported 3rd place · 28:57 (28:58)",
        "User-supplied result; not independently verified.",
      ],
      sources: [
        {
          label: "Supplied Power of 10 results link",
          url: "https://www.powerof10.uk/Home/Results/070a9f6c-0687-468d-b194-cf36f3e15f0e",
          locator: "User-supplied 2025 table: 10K, place 3; original time notation preserved",
        },
      ],
    },
    {
      id: "uk-championships-2025",
      title: "UK Athletics Championships",
      date: "3 August 2025 · Birmingham",
      outcomes: [
        "Reported 5000m 12th place · 14:11.56",
        "User-supplied result; not independently verified.",
      ],
      sources: [
        {
          label: "Supplied Power of 10 results link",
          url: "https://www.powerof10.uk/Home/Results/4a7b0073-0096-4eb0-ab23-45a2841f6368",
          locator: "User-supplied 2025 table: 5000m, place 12, 14:11.56",
        },
      ],
    },
  ] satisfies readonly Highlight[],
} as const;

export function getEditorialAthleteCareer(slug: string) {
  if (slug === paulEvansCareer.slug) return paulEvansCareer;
  return slug === freddyRichardsonCareer.slug
    ? freddyRichardsonCareer
    : (getBritishMarathonCareer(slug) ?? getSanSebastian2026Career(slug));
}
