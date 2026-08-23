import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-23";

const URLS = {
  ultra4_2026: "https://ultra4charity.com/albania-2026/",
  ultra4_2027: "https://ultra4charity.com/albania-2027/",
  globalLimits: "https://www.global-limits.com/peaks-of-the-balkan",
  peaksUltra: "https://farcorners.tours/albania",
  skampa: "https://marathonskampa.run/",
  vjosa: "https://vjosarace.al/",
  tirana: "https://www.tiranamarathon.com/en",
  berat: "https://beratgreenhalfmarathon.com/",
  enkelana: "https://marathonenkelana.run/",
  shkodra: "https://shkodramarathon.com/?lang=en",
  shkodraRace: "https://shkodramarathon.com/gara?lang=en",
  shkodraEntry: "https://shkodramarathon.com/regjistrim?lang=en",
  raceForCure: "https://www.raceforthecure.eu/en/Races",
  migrantOfficial: "https://migranttrailrace.run/",
  migrantSecondary:
    "https://ultraracecalendar.com/events/3927/migrant-trail-race-fushe-arrez/",
} as const;

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
    distances: ["100K", "67K", "44K", "27K", "11K", "Ultra"],
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
    summary:
      "A half-marathon and 10 km road event through Albania's UNESCO-listed city of Berat.",
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
    summary:
      "A lakeside night half-marathon and shorter race finishing in the centre of Pogradec.",
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
    summary:
      "A city-centre road event offering 10 km and 5 km races plus youth 2.5 km categories.",
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
    summary:
      "A 5 km charity run in Tirana supporting the European breast-cancer community.",
    description:
      "Race for the Cure Tirana is part of Think Pink Europe's annual series. The competitive programme is a 5 km run, accompanied by a non-competitive 3 km walk.",
    organiser: "Think Pink Europe",
    website: URLS.raceForCure,
    featured: false,
    source_url: URLS.raceForCure,
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
    distances: ["60K", "40K", "Ultra"],
    summary:
      "A provisional 2027 mountain-trail event in northern Albania, currently listed with 40 km and 60 km routes.",
    description:
      "The 2027 Migrant Trail Race is currently present only on a secondary ultra calendar. The official organiser's website still displays the completed 2026 edition, so the date and distances remain TBC.",
    organiser: "Maraton Albania and Municipality of Fushë-Arrëz",
    website: URLS.migrantOfficial,
    featured: false,
    source_url: URLS.migrantSecondary,
  },
];

export const albaniaRaceEditions: Edition[] = [
  {
    seriesSlug: "ultra-4-albania-mountain-race",
    date: "2026-09-05",
    distance: "100K",
    distanceKm: 100,
    status: "Open",
    entryUrl: URLS.ultra4_2026,
    entryOptions: [
      entryOption(
        "ultra-4-charity",
        "Ultra 4 Charity",
        URLS.ultra4_2026,
        "charity",
      ),
    ],
    source: URLS.ultra4_2026,
    notes:
      "The event window is 4–7 September 2026. The 100 km race begins on Saturday 5 September and continues on Sunday; the 25 km and 50 km races take place on Sunday 6 September.",
  },
  {
    seriesSlug: "globallimits-peaks-of-the-balkans",
    date: "2026-09-11",
    distance: "200K",
    distanceKm: 200,
    status: "Open",
    entryUrl: URLS.globalLimits,
    entryOptions: [
      entryOption("global-limits", "GlobalLimits", URLS.globalLimits),
    ],
    source: URLS.globalLimits,
    notes:
      "The published event window is 11–19 September 2026. This is a 200 km, six-stage transnational race through Albania, Kosovo and Montenegro, beginning in Shkodër and finishing in Theth.",
  },
  {
    seriesSlug: "the-peaks-ultra-albania",
    date: "2026-09-26",
    distance: "62K",
    distanceKm: 62,
    status: "Open",
    entryUrl: URLS.peaksUltra,
    entryOptions: [
      entryOption("far-corners", "Far Corners", URLS.peaksUltra, "tour_operator"),
    ],
    source: URLS.peaksUltra,
    notes:
      "Both the 42 km and 62 km races start in Valbonë, pass through Theth and finish across the border in Vusanje, Montenegro.",
  },
  {
    seriesSlug: "skampa-half-marathon-elbasan",
    date: "2026-10-04",
    distance: "Half",
    distanceKm: 21.0975,
    status: "Open",
    entryUrl: URLS.skampa,
    entryOptions: [
      entryOption("marathon-skampa", "Marathon Skampa", URLS.skampa),
    ],
    source: URLS.skampa,
    notes:
      "Race day is Sunday 4 October 2026. The organiser advertises 5 km, 10 km and half-marathon races; published schedule pages vary between 08:30 and 09:00, so the start time should be reconfirmed.",
  },
  {
    seriesSlug: "shkodra-mini-marathon",
    date: "2026-10-04",
    distance: "10K",
    distanceKm: 10,
    status: "Open",
    entryUrl: URLS.shkodraEntry,
    entryOptions: [
      entryOption(
        "shkodra-mini-marathon",
        "Shkodra Mini Marathon",
        URLS.shkodraEntry,
      ),
    ],
    source: URLS.shkodraRace,
    notes:
      "The official programme includes 10 km and 5 km races for adults and free 2.5 km youth races in two age groups. The youth races begin at 09:30; bib and race-pack collection runs from 08:00 to 09:00.",
  },
  {
    seriesSlug: "race-for-the-cure-tirana",
    date: "2026-10-10",
    distance: "5K",
    distanceKm: 5,
    status: "Open",
    entryUrl: URLS.raceForCure,
    entryOptions: [
      entryOption(
        "think-pink-europe",
        "Think Pink Europe",
        URLS.raceForCure,
        "charity",
      ),
    ],
    source: URLS.raceForCure,
    notes:
      "Think Pink Europe's official race calendar lists the Tirana event for Saturday 10 October 2026. The competitive distance is 5 km; the programme also includes a non-competitive 3 km walk.",
  },
  {
    seriesSlug: "vjosa-wild-river-ultra-trail",
    date: "2026-10-24",
    distance: "100K",
    distanceKm: 100,
    status: "Open",
    entryUrl: URLS.vjosa,
    entryOptions: [
      entryOption("vjosa-race", "Vjosa Wild River Ultra Trail", URLS.vjosa),
    ],
    source: URLS.vjosa,
    notes:
      "The official event window is 24–25 October 2026. Routes of 11 km, 27 km, 44 km, 67 km and 100 km start at different points along the Vjosa River.",
  },
  {
    seriesSlug: "tirana-marathon",
    date: "2026-10-25",
    distance: "Marathon",
    distanceKm: 42.195,
    status: "Open",
    entryUrl: URLS.tirana,
    entryOptions: [
      entryOption("tirana-marathon", "Tirana Marathon", URLS.tirana),
    ],
    source: URLS.tirana,
    notes:
      "The official 2026 programme offers marathon, half-marathon and 10 km races. A registration partner also lists a 2.3 km inclusive WeToo category.",
  },
  {
    seriesSlug: "berat-green-half-marathon",
    date: "2027-04-04",
    distance: "Half",
    distanceKm: 21.0975,
    status: "Open",
    entryUrl: URLS.berat,
    entryOptions: [
      entryOption(
        "berat-green-half",
        "Berat Green Half Marathon",
        URLS.berat,
      ),
    ],
    startTime: "09:00",
    source: URLS.berat,
    notes:
      "The 10 km and half-marathon races are scheduled for Sunday 4 April 2027 at 09:00. The organiser states that registration closes on 31 March 2027.",
  },
  {
    seriesSlug: "enkelana-night-half-marathon",
    date: "2027-07-24",
    distance: "Half",
    distanceKm: 21,
    status: "Open",
    entryUrl: URLS.enkelana,
    entryOptions: [
      entryOption("marathon-enkelana", "Marathon Enkelana", URLS.enkelana),
    ],
    startTime: "19:00",
    source: URLS.enkelana,
    notes:
      "The organiser advertises 21 km and 11.5 km races on Saturday 24 July 2027. A registration marketplace currently labels the shorter option as 10 km, so the organiser's 11.5 km figure is retained.",
  },
  {
    seriesSlug: "migrant-trail-race-fushe-arrez",
    date: "2027-08-07",
    distance: "60K",
    distanceKm: 60,
    status: "TBC",
    source: URLS.migrantSecondary,
    notes:
      "Provisional secondary-calendar listing for 7–8 August 2027 with 40 km and 60 km routes. The official organiser's website has not yet published a 2027 edition or registration link.",
  },
  {
    seriesSlug: "ultra-4-albania-mountain-race",
    date: "2027-09-04",
    distance: "100K",
    distanceKm: 100,
    status: "Open",
    entryUrl: URLS.ultra4_2027,
    entryOptions: [
      entryOption(
        "ultra-4-charity",
        "Ultra 4 Charity",
        URLS.ultra4_2027,
        "charity",
      ),
    ],
    source: URLS.ultra4_2027,
    notes:
      "The event window is 2–6 September 2027. The 100 km race begins on Saturday 4 September and continues on Sunday; the 25 km and 50 km races take place on Sunday 5 September.",
  },
];
