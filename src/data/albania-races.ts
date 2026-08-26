import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-26";

const URLS = {
  ultra4_2026: "https://ultra4charity.com/albania-2026/",
  ultra4_2027: "https://ultra4charity.com/albania-2027/",
  globalLimits: "https://www.global-limits.com/peaks-of-the-balkan",
  peaksUltra: "https://farcorners.tours/albania",
  skampa: "https://marathonskampa.run/",
  vjosa: "https://vjosarace.al/",
  vjosa100: "https://vjosarace.al/carshove/",
  vjosa67: "https://vjosarace.al/permet/",
  vjosa44: "https://vjosarace.al/kelcyre/",
  vjosa26: "https://vjosarace.al/tepelene/",
  vjosa11: "https://vjosarace.al/memaliaj/",
  tirana: "https://www.tiranamarathon.com/en",
  tiranaEntry: "https://ticket.easypay.al/marathon/tirana",
  tiranaRoutes: "https://www.tiranamarathon.com/itinerari",
  berat: "https://beratgreenhalfmarathon.com/",
  enkelana: "https://marathonenkelana.run/",
  shkodra: "https://shkodramarathon.com/?lang=en",
  shkodraRace: "https://shkodramarathon.com/gara?lang=en",
  shkodraSchedule: "https://shkodramarathon.com/itinerari?lang=en",
  shkodraEntry: "https://shkodramarathon.com/regjistrim?lang=en",
  raceForCure: "https://www.raceforthecure.eu/en/Races",
  kukes: "https://www.kukeshalfmarathon.com/",
  martyrsDay: "https://apply.martyrsmemorialday.run/index?eventId=11",
  migrantOfficial: "https://migranttrailrace.run/",
  migrantSecondary: "https://ultraracecalendar.com/events/3927/migrant-trail-race-fushe-arrez/",
  migrantResults2026: "https://my.raceresult.com/414465/",
  migrant100_2026:
    "https://itra.run/Races/RaceDetails/Migrant.Trail.Race..Fush%C3%AB.Arr%C3%ABz.Shtegu.Kreshta.e.Dardhes/2026/116152",
  migrant61_2026:
    "https://itra.run/Races/RaceDetails/Migrant.Trail.Race..Fush%C3%AB.Arr%C3%ABz.Shtegu.i.Kaprollit/2026/116153",
  migrant40_2026:
    "https://itra.run/Races/RaceDetails/Migrant.Trail.Race..Fush%C3%AB.Arr%C3%ABz.Ujvara.e.Kryeziut./2026/116154",
  migrant21_2026:
    "https://itra.run/Races/RaceDetails/Migrant.Trail.Race..Fush%C3%AB.Arr%C3%ABz.Shtegu.I.Pishave/2026/116155",
  migrant10_2026:
    "https://itra.run/Races/RaceDetails/Migrant.Trail.Race..Fush%C3%AB.Arr%C3%ABz.Micoj.River.Trail/2026/116156",
} as const;

type AdvertisedEditionInput = Omit<Edition, "entryOptions" | "entryUrl" | "status"> & {
  status?: Edition["status"];
  entryUrl?: string;
  providerCode?: string;
  providerName?: string;
  entryType?: EntryOptionSeed["entryType"];
};

function entryOption(
  providerCode: string,
  providerName: string,
  entryUrl: string,
  entryType: EntryOptionSeed["entryType"] = "official",
): EntryOptionSeed {
  return {
    providerCode,
    providerName,
    entryUrl,
    entryType,
    status: "open",
    checkedAt: CHECKED_AT,
    sourceUrl: entryUrl,
    isVerified: true,
    isPrimary: true,
  };
}

function advertisedEdition({
  status = "Open",
  entryUrl,
  providerCode,
  providerName,
  entryType = "official",
  ...edition
}: AdvertisedEditionInput): Edition {
  if (!entryUrl || !providerCode || !providerName) {
    return { ...edition, status, publishAllDistances: true };
  }
  return {
    ...edition,
    status,
    publishAllDistances: true,
    entryUrl,
    entryOptions: [entryOption(providerCode, providerName, entryUrl, entryType)],
  };
}

export const albaniaRaceSeries: Series[] = [
  {
    slug: "ultra-4-albania-mountain-race",
    name: "Ultra 4 Albania Mountain Race",
    sport: "Running",
    country: "Albania",
    county: "Vlorë County",
    city: "Ksamil",
    area: "Ceraunian Mountains to Butrint National Park",
    surface: "Mountain Trail",
    distances: ["100K", "50K", "25K", "Ultra"],
    summary:
      "A southern Albanian mountain challenge offering 25 km, 50 km and a two-day 100 km race.",
    description:
      "Ultra 4 Albania crosses rocky trails, scrubland and woods in the Ceraunian Mountains before finishing at the Roman theatre in Butrint National Park. The 100 km option is staged over two days; the 25 km and 50 km races run on one day.",
    organiser: "Ultra 4 Charity",
    website: URLS.ultra4_2026,
    featured: false,
    source_url: URLS.ultra4_2026,
  },
  {
    slug: "globallimits-peaks-of-the-balkans",
    name: "GlobalLimits Peaks of the Balkans",
    sport: "Running",
    country: "Albania",
    county: "Shkodër County",
    city: "Shkodër",
    area: "Albania, Kosovo and Montenegro; finish in Theth",
    surface: "Mountain Trail",
    distances: ["200K", "Ultra"],
    summary:
      "A 200 km, six-stage race beginning in Shkodër and crossing Albania, Kosovo and Montenegro.",
    description:
      "GlobalLimits Peaks of the Balkans is a transnational six-stage mountain race over approximately 200 km with about 12,400 metres of ascent and descent. It begins in Shkodër and finishes at the church in Theth.",
    organiser: "GlobalLimits",
    website: URLS.globalLimits,
    featured: false,
    source_url: URLS.globalLimits,
  },
  {
    slug: "the-peaks-ultra-albania",
    name: "The Peaks Ultra",
    sport: "Running",
    country: "Albania",
    county: "Kukës County",
    city: "Valbonë",
    area: "Valbonë and Theth to Vusanje, Montenegro",
    surface: "Technical Mountain Trail",
    distances: ["62K", "42K", "Ultra", "Marathon"],
    summary:
      "A 42 km mountain marathon and 62 km ultra starting in Valbonë and crossing the Accursed Mountains.",
    description:
      "The Peaks Ultra follows remote and technical trails from Valbonë through Theth and high mountain passes before finishing in Vusanje, Montenegro. The 42 km course has about 2,020 metres of ascent and the 62 km course about 3,700 metres.",
    organiser: "Far Corners",
    website: URLS.peaksUltra,
    featured: false,
    source_url: URLS.peaksUltra,
  },
  {
    slug: "skampa-half-marathon-elbasan",
    name: "Skampa Half Marathon",
    sport: "Running",
    country: "Albania",
    county: "Elbasan County",
    city: "Elbasan",
    area: "Elbasan historic centre and city promenades",
    surface: "Road",
    distances: ["Half", "10K", "5K"],
    summary:
      "A flat city-centre road event in Elbasan offering half-marathon, 10 km and 5 km races.",
    description:
      "Skampa starts and finishes near the gate of Elbasan Castle and follows reconstructed streets and promenades through the city. The organiser advertises half-marathon, 10 km and 5 km categories.",
    organiser: "Maraton Albania / Marathon Skampa",
    website: URLS.skampa,
    featured: false,
    source_url: URLS.skampa,
  },
  {
    slug: "vjosa-wild-river-ultra-trail",
    name: "Vjosa Wild River Ultra Trail",
    sport: "Running",
    country: "Albania",
    county: "Gjirokastër County",
    city: "Tepelenë",
    area: "Vjosa River corridor from Çarshovë to Tepelenë",
    surface: "Trail",
    distances: ["100K", "67K", "44K", "26K", "11K", "Ultra"],
    summary:
      "A five-distance trail festival following the Vjosa River, with routes from 11 km to 100 km.",
    description:
      "The International Ultra Trail Vjosa Wild River links communities along the Vjosa River. Routes start in Çarshovë, Përmet, Këlcyrë, Tepelenë or Memaliaj and converge toward Tepelenë.",
    organiser: "Maraton Albania and Vjosa municipalities",
    website: URLS.vjosa,
    featured: false,
    source_url: URLS.vjosa,
  },
  {
    slug: "tirana-marathon",
    name: "Tirana Marathon",
    sport: "Running",
    country: "Albania",
    county: "Tirana County",
    city: "Tirana",
    area: "Central Tirana",
    surface: "Road",
    distances: ["Marathon", "Half", "10K", "2.3K"],
    summary:
      "Albania's largest city marathon, with marathon, half-marathon, 10 km and inclusive WeToo options.",
    description:
      "Tirana Marathon brings thousands of runners into the centre of the Albanian capital. The official event offers marathon, half-marathon and 10 km races; the registration partner also lists the inclusive 2.3 km WeToo category.",
    organiser: "Municipality of Tirana and Athletics Federation of Albania",
    website: URLS.tirana,
    featured: true,
    source_url: URLS.tirana,
  },
  {
    slug: "berat-green-half-marathon",
    name: "Berat Green Half Marathon",
    sport: "Running",
    country: "Albania",
    county: "Berat County",
    city: "Berat",
    area: "Bulevard Republika and Berat historic district",
    surface: "Road",
    distances: ["Half", "10K"],
    summary: "A half-marathon and 10 km road event through Albania's UNESCO-listed city of Berat.",
    description:
      "Berat Green Half Marathon combines officially measured 21.1 km and 10 km routes with views of Berat's historic neighbourhoods and surrounding landscape.",
    organiser: "Berat Green Half Marathon",
    website: URLS.berat,
    featured: false,
    defaultStartTime: "09:00",
    source_url: URLS.berat,
  },
  {
    slug: "enkelana-night-half-marathon",
    name: "Enkelana Night Half Marathon",
    sport: "Running",
    country: "Albania",
    county: "Korçë County",
    city: "Pogradec",
    area: "Lake Ohrid promenade from Lin to Pogradec",
    surface: "Road",
    distances: ["Half", "11.5K"],
    summary: "A lakeside night half-marathon and shorter race finishing in the centre of Pogradec.",
    description:
      "Enkelana's half-marathon starts in Lin and follows the paved Lake Ohrid shoreline to Pogradec. The organiser currently advertises 21 km and 11.5 km options, although one registration marketplace labels the shorter race as 10 km.",
    organiser: "Maraton Albania / Marathon Enkelana",
    website: URLS.enkelana,
    featured: false,
    defaultStartTime: "19:00",
    source_url: URLS.enkelana,
  },
  {
    slug: "shkodra-mini-marathon",
    name: "Shkodra Mini Marathon",
    sport: "Running",
    country: "Albania",
    county: "Shkodër County",
    city: "Shkodër",
    area: "Isa Boletini Square and central Shkodër",
    surface: "Road",
    distances: ["10K", "5K", "2.5K"],
    summary: "A city-centre road event offering 10 km and 5 km races plus youth 2.5 km categories.",
    description:
      "Shkodra Mini Marathon is organised by Vllaznia Atletike with support from the Municipality of Shkodër and the Athletics Federation of Albania. The programme includes open 10 km and 5 km races and separate 2.5 km youth categories for ages 10–15 and 16–18.",
    organiser: "Vllaznia Atletike",
    website: URLS.shkodra,
    featured: false,
    source_url: URLS.shkodraRace,
  },
  {
    slug: "race-for-the-cure-tirana",
    name: "Race for the Cure Tirana",
    sport: "Running",
    country: "Albania",
    county: "Tirana County",
    city: "Tirana",
    area: "Tirana",
    surface: "Road",
    distances: ["5K"],
    summary: "A 5 km charity run in Tirana supporting the European breast-cancer community.",
    description:
      "Race for the Cure Tirana is part of Think Pink Europe's annual series. The competitive programme is a 5 km run, accompanied by a non-competitive 3 km walk.",
    organiser: "Think Pink Europe",
    website: URLS.raceForCure,
    featured: false,
    source_url: URLS.raceForCure,
  },
  {
    slug: "kukes-half-marathon",
    name: "Kukës Half Marathon",
    sport: "Running",
    country: "Albania",
    county: "Kukës County",
    city: "Kukës",
    area: "Kukës city centre and surrounding villages",
    surface: "Road",
    distances: ["Half", "10K"],
    summary: "A half-marathon and 10 km road event through Kukës and its mountain landscape.",
    description:
      "Kukës Half Marathon starts in the city centre and offers separate half-marathon and 10 km races on paved roads through Kukës and its surrounding villages.",
    organiser: "QPR / Municipality of Kukës / Drini Sports and Tours",
    website: URLS.kukes,
    featured: false,
    source_url: URLS.kukes,
  },
  {
    slug: "martyrs-day-marathon-albania",
    name: "International Martyrs’ Day Marathon",
    sport: "Running",
    country: "Albania",
    county: "Tirana County",
    city: "Tirana",
    area: "Tirana",
    surface: "Road",
    distances: ["Half", "10K", "5K"],
    summary:
      "An international 5 km, 10 km and half-marathon programme marking Albania's Martyrs’ Day.",
    description:
      "Maraton Albania's International Martyrs’ Day event offers 5 km, 10 km and half-marathon races, with additional free categories for eligible pupils, students, police, military personnel, pensioners and security-force officers.",
    organiser: "Maraton Albania",
    website: URLS.martyrsDay,
    featured: false,
    defaultStartTime: "16:00",
    source_url: URLS.martyrsDay,
  },
  {
    slug: "migrant-trail-race-fushe-arrez",
    name: "Migrant Trail Race — Fushë-Arrëz",
    sport: "Running",
    country: "Albania",
    county: "Shkodër County",
    city: "Fushë-Arrëz",
    area: "Fushë-Arrëz mountain trails",
    surface: "Mountain Trail",
    distances: ["100K", "61K", "60K", "40K", "21K", "10K", "Ultra"],
    summary:
      "A multi-distance mountain-trail festival in northern Albania, with routes from 10 km to 100 km.",
    description:
      "Migrant Trail Race crosses the mountain trails, pine forests, rivers and villages around Fushë-Arrëz. The completed 2026 programme is verified from the organiser, ITRA and official timing record; the provisional 2027 distances remain TBC until the organiser publishes that edition.",
    organiser: "Maraton Albania and Municipality of Fushë-Arrëz",
    website: URLS.migrantOfficial,
    featured: false,
    source_url: URLS.migrantOfficial,
  },
];

const ultra4_2026Notes =
  "The official event window is 4–7 September 2026. The 100 km race starts on Saturday and continues on Sunday; the 25 km and 50 km races take place on Sunday 6 September.";
const ultra4_2027Notes =
  "The official event window is 2–6 September 2027. The 100 km race starts on Saturday and continues on Sunday; the 25 km and 50 km races take place on Sunday 5 September.";
const peaksNotes =
  "Both advertised races start in Valbonë, pass through Theth and finish across the border in Vusanje, Montenegro.";
const skampaNotes =
  "The organiser's official schedule places the half marathon, 10 km and 5 km races on Sunday 4 October 2026 at 09:00.";
const tiranaNotes =
  "The official 2026 route and regulations pages advertise the marathon, half marathon, Tirana 10K and inclusive 2.3 km We Too race.";
const beratNotes =
  "The 10 km and half-marathon races are scheduled for Sunday 4 April 2027 at 09:00. The organiser states that registration closes on 31 March 2027.";
const enkelanaNotes =
  "The organiser advertises 21 km and 11.5 km races on Saturday 24 July 2027. The organiser's distance is retained where a marketplace labels the shorter option as 10 km.";
const migrantNotes =
  "Provisional secondary-calendar listing for 7–8 August 2027. It advertises a dated 60 km race and describes a 40 km challenge, but the official organiser has not yet published its 2027 schedule; both remain TBC.";
const migrant2026Notes =
  "The organiser's completed 2026 programme, the ITRA race record and the official timing page confirm this advertised trail distance and race day.";

export const albaniaRaceEditions: Edition[] = [
  ...[
    { distance: "Half", distanceKm: 21.0975, startTime: "09:30" },
    { distance: "10K", distanceKm: 10, startTime: "09:45" },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "kukes-half-marathon",
      date: "2026-04-26",
      ...race,
      status: "Finished",
      source: URLS.kukes,
      notes:
        "The official organiser schedule confirms the half marathon and 10 km starts in Kukës on Sunday 26 April 2026.",
    }),
  ),
  ...[
    { distance: "Half", distanceKm: 21 },
    { distance: "10K", distanceKm: 10 },
    { distance: "5K", distanceKm: 5 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "martyrs-day-marathon-albania",
      date: "2026-05-05",
      ...race,
      status: "Finished",
      startTime: "16:00",
      source: URLS.martyrsDay,
      notes:
        "The direct official registration page confirms all three distances, the 16:00 local start and Tuesday 5 May 2026 date.",
    }),
  ),
  ...[
    {
      date: "2026-08-08",
      distance: "100K",
      distanceKm: 100,
      startTime: "03:00",
      source: URLS.migrant100_2026,
    },
    {
      date: "2026-08-08",
      distance: "61K",
      distanceKm: 61,
      source: URLS.migrant61_2026,
    },
    {
      date: "2026-08-08",
      distance: "40K",
      distanceKm: 40,
      startTime: "07:00",
      source: URLS.migrant40_2026,
    },
    {
      date: "2026-08-09",
      distance: "21K",
      distanceKm: 21.64,
      startTime: "08:00",
      source: URLS.migrant21_2026,
    },
    {
      date: "2026-08-09",
      distance: "10K",
      distanceKm: 10.48,
      startTime: "08:00",
      source: URLS.migrant10_2026,
    },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "migrant-trail-race-fushe-arrez",
      ...race,
      status: "Finished",
      resultsOfficialUrl: URLS.migrantResults2026,
      resultsAccess: "link_only",
      notes: migrant2026Notes,
    }),
  ),
  ...[
    { date: "2026-09-05", distance: "100K", distanceKm: 100 },
    { date: "2026-09-06", distance: "50K", distanceKm: 50 },
    { date: "2026-09-06", distance: "25K", distanceKm: 25 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "ultra-4-albania-mountain-race",
      ...race,
      entryUrl: URLS.ultra4_2026,
      providerCode: "ultra-4-charity",
      providerName: "Ultra 4 Charity",
      entryType: "charity",
      source: URLS.ultra4_2026,
      notes: ultra4_2026Notes,
    }),
  ),
  advertisedEdition({
    seriesSlug: "globallimits-peaks-of-the-balkans",
    date: "2026-09-11",
    distance: "200K",
    distanceKm: 200,
    entryUrl: URLS.globalLimits,
    providerCode: "global-limits",
    providerName: "GlobalLimits",
    source: URLS.globalLimits,
    notes:
      "The published event window is 11–19 September 2026. This is a 200 km, six-stage transnational race through Albania, Kosovo and Montenegro, beginning in Shkodër and finishing in Theth.",
  }),
  ...[
    { distance: "62K", distanceKm: 62 },
    { distance: "42K", distanceKm: 42 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "the-peaks-ultra-albania",
      date: "2026-09-26",
      ...race,
      entryUrl: URLS.peaksUltra,
      providerCode: "far-corners",
      providerName: "Far Corners",
      entryType: "tour_operator",
      source: URLS.peaksUltra,
      notes: peaksNotes,
    }),
  ),
  ...[
    { distance: "Half", distanceKm: 21.0975 },
    { distance: "10K", distanceKm: 10 },
    { distance: "5K", distanceKm: 5 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "skampa-half-marathon-elbasan",
      date: "2026-10-04",
      ...race,
      startTime: "09:00",
      entryUrl: URLS.skampa,
      providerCode: "marathon-skampa",
      providerName: "Marathon Skampa",
      source: URLS.skampa,
      notes: skampaNotes,
    }),
  ),
  ...[
    { distance: "10K", distanceKm: 10, startTime: "11:00" },
    { distance: "5K", distanceKm: 5, startTime: "10:00" },
    { distance: "2.5K", distanceKm: 2.5, startTime: "09:30" },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "shkodra-mini-marathon",
      date: "2026-10-04",
      ...race,
      entryUrl: URLS.shkodraEntry,
      providerCode: "shkodra-mini-marathon",
      providerName: "Shkodra Mini Marathon",
      source: URLS.shkodraSchedule,
      notes:
        "The official programme lists separate 2.5 km youth, 5 km adult and 10 km adult starts on 4 October 2026.",
    }),
  ),
  advertisedEdition({
    seriesSlug: "race-for-the-cure-tirana",
    date: "2026-10-10",
    distance: "5K",
    distanceKm: 5,
    entryUrl: URLS.raceForCure,
    providerCode: "think-pink-europe",
    providerName: "Think Pink Europe",
    entryType: "charity",
    source: URLS.raceForCure,
    notes:
      "Think Pink Europe's official race calendar lists the Tirana event for Saturday 10 October 2026. The competitive distance is 5 km; the programme also includes a non-competitive 3 km walk.",
  }),
  ...[
    { distance: "100K", distanceKm: 100, startTime: "04:00", source: URLS.vjosa100 },
    { distance: "67K", distanceKm: 67, startTime: "06:00", source: URLS.vjosa67 },
    { distance: "44K", distanceKm: 44, startTime: "09:00", source: URLS.vjosa44 },
    { distance: "26K", distanceKm: 26, startTime: "11:00", source: URLS.vjosa26 },
    { distance: "11K", distanceKm: 11, startTime: "12:00", source: URLS.vjosa11 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "vjosa-wild-river-ultra-trail",
      date: "2026-10-25",
      ...race,
      entryUrl: URLS.vjosa,
      providerCode: "vjosa-race",
      providerName: "Vjosa Wild River Ultra Trail",
      notes:
        "The official route page confirms this distance, its start time and the corrected Sunday 25 October 2026 race date.",
    }),
  ),
  ...[
    { distance: "Marathon", distanceKm: 42.195 },
    { distance: "Half", distanceKm: 21.0975 },
    { distance: "10K", distanceKm: 10 },
    { distance: "2.3K", distanceKm: 2.3 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "tirana-marathon",
      date: "2026-10-25",
      ...race,
      entryUrl: URLS.tiranaEntry,
      providerCode: "tirana-marathon",
      providerName: "Tirana Marathon",
      source: URLS.tiranaRoutes,
      notes: tiranaNotes,
    }),
  ),
  ...[
    { distance: "Half", distanceKm: 21.0975 },
    { distance: "10K", distanceKm: 10 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "berat-green-half-marathon",
      date: "2027-04-04",
      ...race,
      startTime: "09:00",
      entryUrl: URLS.berat,
      providerCode: "berat-green-half",
      providerName: "Berat Green Half Marathon",
      source: URLS.berat,
      notes: beratNotes,
    }),
  ),
  ...[
    { distance: "Half", distanceKm: 21 },
    { distance: "11.5K", distanceKm: 11.5 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "enkelana-night-half-marathon",
      date: "2027-07-24",
      ...race,
      startTime: "19:00",
      entryUrl: URLS.enkelana,
      providerCode: "marathon-enkelana",
      providerName: "Marathon Enkelana",
      source: URLS.enkelana,
      notes: enkelanaNotes,
    }),
  ),
  ...[
    { distance: "60K", distanceKm: 60 },
    { distance: "40K", distanceKm: 40 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "migrant-trail-race-fushe-arrez",
      date: "2027-08-07",
      ...race,
      status: "TBC",
      source: URLS.migrantSecondary,
      notes: migrantNotes,
    }),
  ),
  ...[
    { date: "2027-09-04", distance: "100K", distanceKm: 100 },
    { date: "2027-09-05", distance: "50K", distanceKm: 50 },
    { date: "2027-09-05", distance: "25K", distanceKm: 25 },
  ].map((race) =>
    advertisedEdition({
      seriesSlug: "ultra-4-albania-mountain-race",
      ...race,
      entryUrl: URLS.ultra4_2027,
      providerCode: "ultra-4-charity",
      providerName: "Ultra 4 Charity",
      entryType: "charity",
      source: URLS.ultra4_2027,
      notes: ultra4_2027Notes,
    }),
  ),
];
