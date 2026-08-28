import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-26";

type DistanceSpec = {
  label: string;
  km: number;
  time?: string;
};

type Occurrence = {
  date: string;
  distances: DistanceSpec[];
  source?: string;
  entryUrl?: string;
  note?: string;
};

type RaceConfig = {
  slug: string;
  name: string;
  country: string;
  city: string;
  region: string;
  area: string;
  surface: string;
  organiser: string;
  website: string;
  source: string;
  occurrences: Occurrence[];
  extraDistances?: string[];
};

const d = (label: string, km: number, time?: string): DistanceSpec => ({ label, km, time });

const raceConfigs: RaceConfig[] = [
  // Kosovo: federation, organiser and Albanian-language discovery pass.
  {
    slug: "kosovo-independence-run-junik",
    name: "Vrapimi i Pavarësisë – Kosovo Independence Run",
    country: "Kosovo",
    city: "Junik",
    region: "Gjakovë District",
    area: "Junik town centre",
    surface: "Road",
    organiser: "Athletics Federation of Kosovo, Municipality of Junik and KA Juniku",
    website:
      "https://kosovapress.com/atletet-e-kosoves-nderojne-pavaresine-me-gare-tradicionale-rrugore",
    source:
      "https://kosovapress.com/atletet-e-kosoves-nderojne-pavaresine-me-gare-tradicionale-rrugore",
    occurrences: [
      {
        date: "2026-02-17",
        distances: [d("8K", 8, "11:00"), d("4K", 4, "11:00")],
        note: "The senior and veteran programme advertised 8 km and 4 km road races.",
      },
    ],
  },
  {
    slug: "kosovo-in-motion-prishtina",
    name: "Kosova në Lëvizje – Kosovo in Motion",
    country: "Kosovo",
    city: "Prishtina",
    region: "Prishtina District",
    area: "Prishtina Mall and the N2 corridor",
    surface: "Road",
    organiser: "Decathlon, Athletics Federation of Kosovo and Prishtina Mall",
    website:
      "https://www.koha.net/en/reklama-marketing/behu-pjese-e-gares-vrapuese-kosova-ne-levizje-te-dielen-me-22-mars",
    source:
      "https://www.koha.net/en/reklama-marketing/behu-pjese-e-gares-vrapuese-kosova-ne-levizje-te-dielen-me-22-mars",
    occurrences: [
      {
        date: "2026-03-22",
        distances: [d("12K", 12, "09:00"), d("7K", 7, "09:00")],
        note: "The organiser announcement and Kosovo Police road notice confirm both public routes.",
      },
    ],
  },
  {
    slug: "prishtina-trails",
    name: "Prishtina Trails",
    country: "Kosovo",
    city: "Prishtina",
    region: "Prishtina District",
    area: "Gërmia Park",
    surface: "Trail",
    organiser: "Prishtina Trails",
    website: "https://prishtinatrails.com/",
    source: "https://prishtinatrails.com/",
    occurrences: [
      {
        date: "2026-05-10",
        distances: [d("50K", 50), d("23K", 23), d("10K", 10, "10:00")],
        note: "The organiser results report and ITRA listing confirm the three 2026 courses.",
      },
    ],
  },
  {
    slug: "peja-trail-run",
    name: "Peja Trail Run",
    country: "Kosovo",
    city: "Pejë",
    region: "Pejë District",
    area: "Pejë town square and Rugova foothill trails",
    surface: "Mountain Trail",
    organiser: "Peja Outdoor Festival",
    website: "https://pejatrailrun.org/",
    source: "https://pejatrailrun.org/",
    occurrences: [
      {
        date: "2026-06-14",
        distances: [d("23K", 23, "09:00"), d("10K", 10, "10:00")],
      },
    ],
  },
  {
    slug: "high-scardus-ultra",
    name: "High Scardus Ultra",
    country: "Kosovo",
    city: "Prizren",
    region: "Prizren District and Tetovo Region",
    area: "Sharr Mountains between Prizren and Popova Šapka",
    surface: "Technical Mountain Trail",
    organiser: "Butterfly Outdoor Adventure and Shar Outdoors",
    website: "https://highscardusultra.com/",
    source: "https://highscardusultra.com/program/",
    occurrences: [
      {
        date: "2026-09-05",
        distances: [
          d("58K", 58, "06:00"),
          d("35K", 35, "09:00"),
          d("20K", 20, "10:00"),
          d("10K", 10, "10:00"),
        ],
        note: "This cross-border event has Kosovo starts for 10K and 35K and North Macedonia starts for 20K and 58K; the 58K finishes in Kosovo.",
      },
    ],
  },
  {
    slug: "gjilani-marathon",
    name: "Gjilani Marathon",
    country: "Kosovo",
    city: "Gjilan",
    region: "Gjilan District",
    area: "Agim Ramadani Square and the Gjilan countryside",
    surface: "Road",
    organiser: "Gjilani Marathon",
    website: "https://worldsmarathons.com/marathon/gjilani-half-marathon",
    source: "https://worldsmarathons.com/marathon/gjilani-half-marathon",
    occurrences: [
      {
        date: "2026-09-06",
        distances: [d("Half", 21.0975, "08:30"), d("10K", 10, "08:30"), d("5K", 5, "08:30")],
        note: "The live registration page records the rescheduled 6 September date.",
      },
    ],
  },
  {
    slug: "prishtina-marathon",
    name: "Prishtina Marathon",
    country: "Kosovo",
    city: "Prishtina",
    region: "Prishtina District",
    area: "Prishtina city road courses",
    surface: "Road",
    organiser: "Prishtina Marathon",
    website: "https://prishtinamarathon.com/",
    source: "https://worldathletics.org/competition/calendar-results/results/7242723",
    occurrences: [
      {
        date: "2026-09-20",
        entryUrl: "https://prishtinamarathon.com/",
        distances: [
          d("Marathon", 42.195, "09:00"),
          d("Half", 21.0975, "09:00"),
          d("10K", 10, "09:00"),
          d("5K", 5, "09:00"),
        ],
        note: "World Athletics confirms the date; the official organiser route pages advertise marathon, half-marathon, 10K and 5K starts.",
      },
    ],
  },

  // North Macedonia: full 2026 Macedonian Running League plus confirmed organiser additions.
  {
    slug: "kavadarci-half-marathon",
    name: "Kavadarci Half Marathon",
    country: "North Macedonia",
    city: "Kavadarci",
    region: "Vardar Region",
    area: "Kavadarci city roads",
    surface: "Road",
    organiser: "Kavadarci Half Marathon",
    website: "https://www.mtl.mk/en/races/",
    source: "https://www.mtl.mk/en/races/",
    occurrences: [
      {
        date: "2026-03-08",
        distances: [d("Half", 21, "12:00"), d("10K", 10, "12:00"), d("5K", 5, "12:00")],
      },
    ],
  },
  {
    slug: "sri-chinmoy-marathon-skopje",
    name: "Sri Chinmoy Marathon Skopje",
    country: "North Macedonia",
    city: "Skopje",
    region: "Skopje Region",
    area: "Skopje City Park",
    surface: "Road Loop",
    organiser: "Sri Chinmoy Marathon Team",
    website: "https://mk.srichinmoyraces.org/scm-skopje",
    source: "https://mk.srichinmoyraces.org/scm-skopje",
    occurrences: [
      {
        date: "2026-03-15",
        distances: [
          d("Marathon", 42.195, "07:00"),
          d("Half", 21.0975, "08:00"),
          d("10K", 10, "10:00"),
        ],
      },
      {
        date: "2027-03-14",
        distances: [
          d("Marathon", 42.195, "07:00"),
          d("Half", 21.0975, "08:00"),
          d("10K", 10, "10:00"),
        ],
      },
    ],
  },
  {
    slug: "zegin-spectrathon-skopje",
    name: "Zegin Spectrathon",
    country: "North Macedonia",
    city: "Skopje",
    region: "Skopje Region",
    area: "Skopje city roads",
    surface: "Road",
    organiser: "Zegin",
    website: "https://www.mtl.mk/en/races/",
    source: "https://www.mtl.mk/en/races/",
    occurrences: [{ date: "2026-03-22", distances: [d("10K", 10, "08:00"), d("5K", 5, "08:00")] }],
  },
  {
    slug: "vodno-10k",
    name: "Vodno 10K",
    country: "North Macedonia",
    city: "Skopje",
    region: "Skopje Region",
    area: "Middle Vodno",
    surface: "Road and Trail",
    organiser: "AK Fortius Skopje",
    website: "https://fortius.trki.mk/en/events/vodno-10k-2026",
    source: "https://fortius.trki.mk/en/events/vodno-10k-2026",
    occurrences: [{ date: "2026-03-29", distances: [d("10K", 10, "10:00")] }],
  },
  {
    slug: "superior-runs-shtip",
    name: "Superior Runs",
    country: "North Macedonia",
    city: "Štip",
    region: "Eastern Region",
    area: "Štip city roads",
    surface: "Road",
    organiser: "Superior Runs",
    website: "https://superiorruns.mk/",
    source: "https://www.mtl.mk/en/races/",
    occurrences: [{ date: "2026-04-26", distances: [d("10K", 10, "09:00"), d("5K", 5, "09:00")] }],
  },
  {
    slug: "halkeco-skopje-run",
    name: "HalkEco Skopje Run 10K",
    country: "North Macedonia",
    city: "Skopje",
    region: "Skopje Region",
    area: "Skopje city roads",
    surface: "Road",
    organiser: "Sport Union of Skopje",
    website: "https://skopje.run/",
    source: "https://trki.mk/en",
    occurrences: [
      { date: "2026-05-10", distances: [d("10K", 10, "09:00")] },
      { date: "2027-05-09", distances: [d("10K", 10, "09:00")] },
    ],
  },
  {
    slug: "ohrid-trcat",
    name: "Ohrid TrčaT",
    country: "North Macedonia",
    city: "Ohrid",
    region: "Southwestern Region",
    area: "Ohrid lakeside roads",
    surface: "Road",
    organiser: "Ohrid TrčaT",
    website: "https://www.ohridtrcat.mk/",
    source: "https://www.mtl.mk/en/races/",
    occurrences: [{ date: "2026-06-07", distances: [d("Half", 21, "08:15"), d("5K", 5, "08:15")] }],
  },
  {
    slug: "prespa-run-and-fun",
    name: "Prespa Run & Fun",
    country: "North Macedonia",
    city: "Resen",
    region: "Pelagonia Region",
    area: "Pretor and Krani beside Lake Prespa",
    surface: "Road",
    organiser: "Prespa Hub Resen",
    website: "https://presparunandfun.trki.mk/en/events/prespa-run-fun-2026",
    source: "https://presparunandfun.trki.mk/en/events/prespa-run-fun-2026",
    occurrences: [{ date: "2026-06-20", distances: [d("10K", 10, "09:00"), d("5K", 5, "09:00")] }],
  },
  {
    slug: "ce-trcame-prilep",
    name: "Če Trčame Prilep",
    country: "North Macedonia",
    city: "Prilep",
    region: "Pelagonia Region",
    area: "Prilep city roads",
    surface: "Road",
    organiser: "Če Trčame",
    website: "https://trki.mk/en",
    source: "https://trki.mk/en",
    occurrences: [
      {
        date: "2026-10-18",
        distances: [d("10K", 10, "09:00"), d("5K", 5, "09:00")],
        note: "The live registration platform supersedes the league's earlier 30 August date.",
      },
    ],
  },
  {
    slug: "trcaj-be-bitola",
    name: "Trčaj Be Bitola",
    country: "North Macedonia",
    city: "Bitola",
    region: "Pelagonia Region",
    area: "Bitola city roads",
    surface: "Road",
    organiser: "Trčaj Be",
    website: "https://trcaj.be/",
    source: "https://www.mtl.mk/en/races/",
    occurrences: [
      {
        date: "2026-09-13",
        distances: [d("Half", 21, "09:00"), d("10K", 10, "09:00"), d("5K", 5, "09:00")],
      },
    ],
  },
  {
    slug: "krun-kicevo",
    name: "KRun Kičevo",
    country: "North Macedonia",
    city: "Kičevo",
    region: "Southwestern Region",
    area: "Kičevo city roads",
    surface: "Road",
    organiser: "KRun",
    website: "https://www.krun.mk/",
    source: "https://www.mtl.mk/en/races/",
    occurrences: [{ date: "2026-09-20", distances: [d("10K", 10, "08:30"), d("5K", 5, "08:30")] }],
  },
  {
    slug: "ilinden-life-run",
    name: "Ilinden Life Run",
    country: "North Macedonia",
    city: "Ilinden",
    region: "Skopje Region",
    area: "Ilinden municipality roads",
    surface: "Road",
    organiser: "AK Skopski Maraton",
    website: "https://sm.trki.mk/mk/events/ilinden-life-run-2026",
    source: "https://sm.trki.mk/mk/events/ilinden-life-run-2026",
    occurrences: [{ date: "2026-09-27", distances: [d("10K", 10, "08:00"), d("5K", 5, "08:00")] }],
  },
  {
    slug: "skopje-marathon",
    name: "Wizz Air Skopje Marathon",
    country: "North Macedonia",
    city: "Skopje",
    region: "Skopje Region",
    area: "Central Skopje and the Vardar corridor",
    surface: "Road",
    organiser: "Sport Union of Skopje and AK Skopski Maraton",
    website: "https://skopskimaraton.com.mk/en/",
    source: "https://skopskimaraton.com.mk/en/terms-and-conditions/",
    extraDistances: ["Marathon"],
    occurrences: [
      {
        date: "2026-10-04",
        distances: [d("Half", 21.097, "08:05"), d("5K", 5, "08:00")],
        note: "The existing AIMS marathon record is retained; these are the missing public distances.",
      },
    ],
  },
  {
    slug: "kozjak-trail-north-macedonia",
    name: "Kozjak Trail",
    country: "North Macedonia",
    city: "Malotino",
    region: "Northeastern Region",
    area: "Malotino to Kitka Peak loop",
    surface: "Mountain Trail",
    organiser: "Mountain Running Club Kumanovo",
    website: "https://kumanovo.trki.mk/mk/events/kozjak-trail-2026",
    source: "https://kumanovo.trki.mk/mk/events/kozjak-trail-2026",
    occurrences: [{ date: "2026-10-11", distances: [d("15K", 15, "09:00")] }],
  },
  {
    slug: "strumica-on-street",
    name: "Strumica on Street Half Marathon",
    country: "North Macedonia",
    city: "Strumica",
    region: "Southeastern Region",
    area: "Strumica city loop",
    surface: "Road",
    organiser: "AK Belasica Run Strumica",
    website: "https://akbelasica.trki.mk/mk/events/strumica-na-ulica-2026",
    source: "https://akbelasica.trki.mk/mk/events/strumica-na-ulica-2026",
    occurrences: [
      {
        date: "2026-11-01",
        distances: [d("Half", 21.0975, "10:00"), d("10K", 10, "10:00"), d("5K", 5, "10:00")],
      },
    ],
  },
  {
    slug: "november-run-gevgelija",
    name: "November Run Gevgelija",
    country: "North Macedonia",
    city: "Gevgelija",
    region: "Southeastern Region",
    area: "Gevgelija city course",
    surface: "Road",
    organiser: "AK 7mi Noemvri",
    website: "https://novemberrun.com/en",
    source: "https://novemberrun.com/en",
    occurrences: [{ date: "2026-11-15", distances: [d("10K", 10), d("5K", 5)] }],
  },

  // Croatia: organiser, timing and Croatian-language calendar pass.
  {
    slug: "split-marathon",
    name: "Split Marathon",
    country: "Croatia",
    city: "Split",
    region: "Split-Dalmatia County",
    area: "Split seafront, Marjan and Poljud",
    surface: "Road",
    organiser: "Sportski klub Split maraton",
    website: "https://splitmarathon.com/",
    source: "https://www.runinternational.eu/maps/croatia/1551",
    occurrences: [
      { date: "2026-02-14", distances: [d("5K", 5, "14:00"), d("2K", 2, "15:30")] },
      {
        date: "2026-02-15",
        distances: [
          d("Marathon", 42.195, "09:00"),
          d("Half", 21.0975, "09:00"),
          d("10K", 10, "08:40"),
        ],
      },
    ],
  },
  {
    slug: "rijeka-running-weekend",
    name: "Rijeka Running Weekend",
    country: "Croatia",
    city: "Rijeka",
    region: "Primorje-Gorski Kotar County",
    area: "Rijeka city and waterfront roads",
    surface: "Road",
    organiser: "Rijeka Running Weekend",
    website: "https://www.chamoix.run/en/events/rijeka-half-marathon-10k",
    source: "https://www.chamoix.run/en/events/rijeka-half-marathon-10k",
    occurrences: [
      {
        date: "2026-04-18",
        distances: [d("Half", 21.0975, "09:30"), d("10K", 10, "09:30"), d("5K", 5, "09:30")],
      },
    ],
  },
  {
    slug: "split-night-half",
    name: "Split Night Half",
    country: "Croatia",
    city: "Split",
    region: "Split-Dalmatia County",
    area: "Žnjan Beach and Split seafront",
    surface: "Road",
    organiser: "Sportski klub Split maraton",
    website: "https://splitmarathon.com/",
    source: "https://live.splitmarathon.com/event/SNH26/register",
    occurrences: [
      {
        date: "2026-08-08",
        distances: [d("Half", 21, "22:00"), d("10K", 10, "22:00"), d("5K", 5, "22:00")],
      },
    ],
  },
  {
    slug: "nivea-night-marathon-zagreb",
    name: "NIVEA Night Marathon Zagreb",
    country: "Croatia",
    city: "Zagreb",
    region: "City of Zagreb",
    area: "Zagreb night road circuit",
    surface: "Road",
    organiser: "Zagreb Night Marathon",
    website: "https://runners.hr/utrke/",
    source: "https://runners.hr/utrke/",
    occurrences: [
      {
        date: "2026-08-29",
        distances: [
          d("Marathon", 42.195, "17:00"),
          d("Half", 21.0975, "17:00"),
          d("4.2K", 4.2, "17:00"),
        ],
      },
    ],
  },
  {
    slug: "pula-marathon",
    name: "Pula Marathon",
    country: "Croatia",
    city: "Pula",
    region: "Istria County",
    area: "Pula city centre and seafront",
    surface: "Road",
    organiser: "Pula Marathon",
    website: "https://www.utrka.com/utrke/xica/2026/info/",
    source: "https://www.utrka.com/utrke/xica/2026/info/",
    occurrences: [
      { date: "2026-09-19", distances: [d("Half", 21.0975), d("10K", 10), d("5.99K", 5.99)] },
    ],
  },
  {
    slug: "ston-wall-marathon",
    name: "Ston Wall Marathon",
    country: "Croatia",
    city: "Ston",
    region: "Dubrovnik-Neretva County",
    area: "Ston, Mali Ston and the Walls of Ston",
    surface: "Road and Stone Trail",
    organiser: "Ston Wall Marathon",
    website: "https://visitdubrovnik.hr/hr/kalendar-dogadanja/ston-wall-marathon/",
    source: "https://visitdubrovnik.hr/hr/kalendar-dogadanja/ston-wall-marathon/",
    occurrences: [
      {
        date: "2026-09-20",
        distances: [d("21K", 21, "08:00"), d("10K", 10, "08:00"), d("4K", 4, "08:00")],
      },
    ],
  },
  {
    slug: "run4fh-zagreb",
    name: "RUN4FH Zagreb",
    country: "Croatia",
    city: "Zagreb",
    region: "City of Zagreb",
    area: "Sava embankment by Boćarski dom",
    surface: "Road",
    organiser: "Croatian Hypertension League, Croatian Atherosclerosis Society and Run Croatia",
    website: "https://www.runcroatia.hr/utrke/run4fh-2026",
    source: "https://www.runcroatia.hr/utrke/run4fh-2026",
    occurrences: [{ date: "2026-09-26", distances: [d("5K", 5, "11:00")] }],
  },
  {
    slug: "vinkovci-half-marathon",
    name: "Vinkovci Half Marathon",
    country: "Croatia",
    city: "Vinkovci",
    region: "Vukovar-Syrmia County",
    area: "Central Vinkovci",
    surface: "Road",
    organiser: "Halfmarathon Team Vinkovci",
    website: "https://trkesrbija.rs/dogadjaji/vinkovacki-polumaraton",
    source: "https://trkesrbija.rs/dogadjaji/vinkovacki-polumaraton",
    occurrences: [
      {
        date: "2026-09-27",
        distances: [d("Half", 21.1, "10:00"), d("7K", 7, "10:00"), d("0.8K", 0.8, "09:00")],
      },
    ],
  },
  {
    slug: "wa-34th-zagreb-marathon-7237778",
    name: "Zagreb Marathon, Half and 10K",
    country: "Croatia",
    city: "Zagreb",
    region: "City of Zagreb",
    area: "Central Zagreb road course",
    surface: "Road",
    organiser: "Zagreb Athletics Association",
    website: "https://www.zagreb-marathon.com/",
    source: "https://www.zagreb-marathon.com/hr/prijave/",
    extraDistances: ["Marathon"],
    occurrences: [
      {
        date: "2026-10-11",
        distances: [d("Half", 21.0975), d("10K", 10)],
        note: "The existing AIMS marathon record is retained; these are the missing public distances.",
      },
    ],
  },
  {
    slug: "apfel-arena-makarska-half",
    name: "Apfel Arena Makarska Half Marathon",
    country: "Croatia",
    city: "Makarska",
    region: "Split-Dalmatia County",
    area: "Makarska, Tučepi and Podgora",
    surface: "Road",
    organiser: "Udruga SportAP",
    website: "https://www.utrka.com/utrke/apfelhalf/2026/info/",
    source: "https://www.utrka.com/utrke/apfelhalf/2026/info/",
    occurrences: [
      { date: "2026-10-24", distances: [d("5K", 5, "15:00")] },
      { date: "2026-10-25", distances: [d("Half", 21.098, "09:30")] },
    ],
  },

  // Bosnia and Herzegovina.
  {
    slug: "mostar-run-weekend",
    name: "Mostar Run Weekend",
    country: "Bosnia and Herzegovina",
    city: "Mostar",
    region: "Herzegovina-Neretva Canton",
    area: "Mostar bridges and city roads",
    surface: "Road",
    organiser: "Zdrav život – Kinezis",
    website: "https://mostar.run/en/",
    source: "https://mostar.run/en/",
    occurrences: [
      { date: "2026-03-21", distances: [d("Half", 21.1, "08:30"), d("4K", 4, "12:00")] },
      { date: "2027-03-20", distances: [d("Half", 21.1, "08:30"), d("4K", 4, "12:00")] },
    ],
  },
  {
    slug: "vucko-trail",
    name: "Vučko Trail",
    country: "Bosnia and Herzegovina",
    city: "Sarajevo",
    region: "Sarajevo Canton",
    area: "Bjelašnica and Visočica mountains",
    surface: "Technical Mountain Trail",
    organiser: "PD Željezničar Sarajevo",
    website: "https://vuckotrail.ba/",
    source: "https://vuckotrail.ba/informations/",
    occurrences: [
      { date: "2026-06-19", distances: [d("105K", 105, "20:00")] },
      {
        date: "2026-06-20",
        distances: [
          d("60K", 60, "07:00"),
          d("40K", 40, "08:30"),
          d("26K", 26, "10:00"),
          d("14K", 14, "12:00"),
        ],
      },
    ],
  },
  {
    slug: "sarajevo-half-marathon",
    name: "Sarajevo Half Marathon and 5K",
    country: "Bosnia and Herzegovina",
    city: "Sarajevo",
    region: "Sarajevo Canton",
    area: "Marijin Dvor and central Sarajevo",
    surface: "Road",
    organiser: "NGO Marathon Sarajevo",
    website: "https://sarajevomarathon.ba/en",
    source: "https://sarajevomarathon.ba/en",
    occurrences: [{ date: "2026-09-13", distances: [d("Half", 21.097, "08:30"), d("5K", 5)] }],
  },
  {
    slug: "banja-luka-marathon",
    name: "Banja Luka Marathon",
    country: "Bosnia and Herzegovina",
    city: "Banja Luka",
    region: "Republika Srpska",
    area: "Kastel Fortress, central Banja Luka and the Vrbas",
    surface: "Road",
    organiser: "Banja Luka Marathon",
    website: "https://banjalukamaraton.com/",
    source: "https://go-bosnia.com/de/dogadjaj/banjalucki-polumaraton-2026/",
    occurrences: [
      {
        date: "2026-10-25",
        distances: [
          d("Marathon", 42.195, "08:30"),
          d("Half", 21.1, "08:30"),
          d("10K", 10, "08:30"),
          d("5K", 5),
        ],
      },
    ],
  },

  // Serbia: official organisers, World Athletics and Serbian-language calendar pass.
  {
    slug: "novi-sad-half-marathon",
    name: "Novi Sad Half Marathon",
    country: "Serbia",
    city: "Novi Sad",
    region: "Vojvodina",
    area: "Freedom Square and central Novi Sad",
    surface: "Road",
    organiser: "Novosadski maraton",
    website: "https://www.marathon.org.rs/polumaraton/",
    source: "https://www.marathon.org.rs/polumaraton/",
    occurrences: [
      {
        date: "2026-03-29",
        distances: [d("Half", 21, "11:00"), d("10K", 10, "11:50"), d("5K", 5, "11:50")],
      },
    ],
  },
  {
    slug: "belgrade-nike-10k",
    name: "10K Belgrade Run Nike",
    country: "Serbia",
    city: "Belgrade",
    region: "City of Belgrade",
    area: "Bulevar Nikole Tesle and Ušće",
    surface: "Road",
    organiser: "Belgrade Marathon and Nike",
    website: "https://trkesrbija.rs/dogadjaji/10k-belgrade-run-nike-2026",
    source: "https://worldathletics.org/competition/calendar-results/results/7244711",
    occurrences: [{ date: "2026-09-05", distances: [d("10K", 10, "18:00")] }],
  },
  {
    slug: "civijaski-half-marathon",
    name: "Čivijaški Half Marathon",
    country: "Serbia",
    city: "Šabac",
    region: "Mačva District",
    area: "Šabac city centre",
    surface: "Road",
    organiser: "Fury Runners Šabac",
    website: "https://www.trkesrbija.rs/dogadjaji/civijaski-polumaraton-2026",
    source: "https://www.trkesrbija.rs/dogadjaji/civijaski-polumaraton-2026",
    occurrences: [
      { date: "2026-09-06", distances: [d("Half", 21.1, "08:00"), d("7K", 7, "08:00")] },
    ],
  },
  {
    slug: "race-1300-corporals-arandjelovac",
    name: "Trka 1300 Kaplara",
    country: "Serbia",
    city: "Aranđelovac",
    region: "Šumadija District",
    area: "Aranđelovac city roads",
    surface: "Road",
    organiser: "Sportski savez Aranđelovac",
    website: "https://trkesrbija.rs/dogadjaji/9-trka-1300-kaplara",
    source: "https://trkesrbija.rs/dogadjaji/9-trka-1300-kaplara",
    occurrences: [{ date: "2026-09-12", distances: [d("10K", 10, "11:00"), d("5K", 5, "11:00")] }],
  },
  {
    slug: "zemun-half-marathon",
    name: "Zemun Half Marathon",
    country: "Serbia",
    city: "Zemun",
    region: "City of Belgrade",
    area: "Zemun roads and Danube waterfront",
    surface: "Road",
    organiser: "Sportsko udruženje Zemunski polumaraton",
    website: "https://trkesrbija.rs/dogadjaji/5-zemunski-polumaraton-2026",
    source: "https://trkesrbija.rs/dogadjaji/5-zemunski-polumaraton-2026",
    occurrences: [
      {
        date: "2026-09-13",
        distances: [d("Half", 21.1, "10:00"), d("10.55K", 10.55, "10:00"), d("5K", 5, "10:00")],
      },
    ],
  },
  {
    slug: "radmilovac-trail",
    name: "Radmilovac Trail",
    country: "Serbia",
    city: "Belgrade",
    region: "City of Belgrade",
    area: "Radmilovac orchards, vineyards and ponds",
    surface: "Trail",
    organiser: "University of Belgrade Faculty of Agriculture",
    website: "https://trkesrbija.rs/dogadjaji/radmilovac-trail-2026",
    source: "https://trkesrbija.rs/dogadjaji/radmilovac-trail-2026",
    occurrences: [{ date: "2026-09-19", distances: [d("10K", 10, "10:00"), d("5K", 5, "10:00")] }],
  },
  {
    slug: "zrenjanin-half-marathon",
    name: "Zrenjanin Half Marathon",
    country: "Serbia",
    city: "Zrenjanin",
    region: "Vojvodina",
    area: "Zrenjanin city roads",
    surface: "Road",
    organiser: "SU Zrenjaninski polumaraton",
    website: "https://trkesrbija.rs/dogadjaji/10-zrenjaninski-polumaraton",
    source: "https://trkesrbija.rs/dogadjaji/10-zrenjaninski-polumaraton",
    occurrences: [
      {
        date: "2026-09-20",
        distances: [d("Half", 21.1, "11:00"), d("14K", 14, "11:00"), d("7K", 7, "11:00")],
      },
    ],
  },
  {
    slug: "nis-half-marathon",
    name: "Niš Half Marathon",
    country: "Serbia",
    city: "Niš",
    region: "Nišava District",
    area: "King Milan Square and historic Niš",
    surface: "Road",
    organiser: "AK Radnički 2016 Niš",
    website: "https://trkesrbija.rs/dogadjaji/1-niski-polumaraton-2026",
    source: "https://trkesrbija.rs/dogadjaji/1-niski-polumaraton-2026",
    occurrences: [
      {
        date: "2026-10-03",
        distances: [d("Half", 21.1, "16:30"), d("10K", 10, "16:30"), d("5K", 5, "16:30")],
      },
    ],
  },
  {
    slug: "kragujevac-half-marathon",
    name: "Kragujevac Half Marathon",
    country: "Serbia",
    city: "Kragujevac",
    region: "Šumadija District",
    area: "Kragujevac city centre",
    surface: "Road",
    organiser: "AK Maraton KG",
    website: "https://trkesrbija.rs/dogadjaji/14-kragujevacki-polumaraton",
    source: "https://trkesrbija.rs/dogadjaji/14-kragujevacki-polumaraton",
    occurrences: [
      {
        date: "2026-10-04",
        distances: [d("Half", 21.1, "11:00"), d("10K", 10, "11:00"), d("5K", 5, "11:00")],
      },
    ],
  },
  {
    slug: "novi-sad-marathon",
    name: "Novi Sad Marathon",
    country: "Serbia",
    city: "Novi Sad",
    region: "Vojvodina",
    area: "Freedom Square and central Novi Sad",
    surface: "Road",
    organiser: "Novosadski maraton",
    website: "https://www.marathon.org.rs/en/marathon/",
    source: "https://www.marathon.org.rs/en/marathon/",
    extraDistances: ["Marathon"],
    occurrences: [
      {
        date: "2026-10-11",
        distances: [d("25K", 25, "10:00"), d("10K", 10, "10:45"), d("5K", 5, "10:45")],
        note: "The existing AIMS marathon record is retained; these are the other competitive running distances.",
      },
    ],
  },
  {
    slug: "novi-pazar-half-marathon",
    name: "Novi Pazar Half Marathon",
    country: "Serbia",
    city: "Novi Pazar",
    region: "Raška District",
    area: "Novi Pazar city roads",
    surface: "Road",
    organiser: "Asocijacija Sport za sve Novi Pazar",
    website: "https://trkesrbija.rs/dogadjaji/6-pazarski-polumaraton",
    source: "https://trkesrbija.rs/dogadjaji/6-pazarski-polumaraton",
    occurrences: [
      {
        date: "2026-10-25",
        distances: [d("Half", 21.1, "09:00"), d("10K", 10, "09:00"), d("5K", 5, "09:00")],
      },
    ],
  },
  {
    slug: "european-running-championships-belgrade-2027",
    name: "European Running Championships Belgrade 2027",
    country: "Serbia",
    city: "Belgrade",
    region: "City of Belgrade",
    area: "Belgrade championship and mass-participation road courses",
    surface: "Road",
    organiser: "European Athletics and Belgrade Marathon",
    website: "https://www.erch2027.com/",
    source: "https://www.erch2027.com/course/",
    occurrences: [
      { date: "2027-04-17", distances: [d("Half", 21.0975), d("10K", 10)] },
      { date: "2027-04-18", distances: [d("Marathon", 42.195)] },
    ],
  },

  // Montenegro.
  {
    slug: "one-run-montenegro",
    name: "One Run Montenegro",
    country: "Montenegro",
    city: "Herceg Novi",
    region: "Herceg Novi Municipality",
    area: "Igalo and Herceg Novi seafront",
    surface: "Road",
    organiser: "Multisport Akademija Mayer",
    website: "https://onerunmontenegro.com/",
    source: "https://onerunmontenegro.com/",
    occurrences: [
      {
        date: "2026-05-23",
        distances: [
          d("Half", 21.1, "18:00"),
          d("10K", 10, "18:00"),
          d("5K", 5, "11:00"),
          d("1K", 1, "10:30"),
        ],
      },
    ],
  },
  {
    slug: "durmitor-trail",
    name: "Durmitor Trail",
    country: "Montenegro",
    city: "Žabljak",
    region: "Žabljak Municipality",
    area: "Durmitor National Park lakes and mountain trails",
    surface: "Technical Mountain Trail",
    organiser: "Durmitor Trail",
    website: "https://www.durmitortrail.run/en/raceinfo",
    source: "https://www.durmitortrail.run/en/raceinfo",
    occurrences: [
      { date: "2026-07-11", distances: [d("10K", 10, "09:30"), d("5K", 5, "09:40")] },
      {
        date: "2026-07-12",
        distances: [d("65K", 65, "04:00"), d("42K", 42, "06:00"), d("21K", 21, "08:00")],
      },
    ],
  },
  {
    slug: "bjelasica-trail",
    name: "Bjelasica Trail",
    country: "Montenegro",
    city: "Kolašin",
    region: "Kolašin Municipality",
    area: "Bjelasica mountains and Biogradsko Lake",
    surface: "Technical Mountain Trail",
    organiser: "Bjelasica Ultra Trail",
    website: "https://bjelasicatrail.me/",
    source: "https://bjelasicatrail.me/",
    occurrences: [
      {
        date: "2026-08-08",
        distances: [d("62K", 62, "05:00"), d("40K", 40, "07:00"), d("23K", 23, "07:00")],
      },
      { date: "2026-08-09", distances: [d("12K", 12, "09:00")] },
    ],
  },
  {
    slug: "podgorica-millennium-run",
    name: "NLB Podgorica Millennium Run",
    country: "Montenegro",
    city: "Podgorica",
    region: "Podgorica Capital City",
    area: "Millennium Bridge and Podgorica city roads",
    surface: "Road",
    organiser: "Multisport Akademija Mayer",
    website: "https://www.podgorica.run/",
    source: "https://www.podgorica.run/",
    occurrences: [
      {
        date: "2026-11-08",
        distances: [
          d("Marathon", 42.195, "10:00"),
          d("Half", 21.1, "10:00"),
          d("10K", 10, "10:00"),
          d("5K", 5, "10:15"),
        ],
      },
    ],
  },
  {
    slug: "boka-marathon",
    name: "Bokeški Marathon",
    country: "Montenegro",
    city: "Tivat",
    region: "Bay of Kotor",
    area: "Tivat, Kotor and the Bay of Kotor waterfront",
    surface: "Road",
    organiser: "Triatlon klub Tivat",
    website: "https://bokamarathon.com/",
    source: "https://www.3hn.live/event/BM26/register",
    occurrences: [
      { date: "2026-12-12", distances: [d("10K", 10, "15:00"), d("5K", 5, "15:00")] },
      {
        date: "2026-12-13",
        distances: [d("Marathon", 42.195, "09:00"), d("Half", 21.0975, "09:00")],
      },
    ],
  },

  // Slovenia.
  {
    slug: "istrian-marathon-slovenia",
    name: "Istrian Marathon Slovenia",
    country: "Slovenia",
    city: "Koper",
    region: "Coastal–Karst",
    area: "Koper, Ankaran, Izola and the Slovenian coast",
    surface: "Road and Paved Trail",
    organiser: "Društvo Istrski maraton",
    website: "https://istrski-maraton.si/en/",
    source: "https://istrski-maraton.si/en/useful-informations/program/",
    occurrences: [
      {
        date: "2026-04-12",
        distances: [
          d("Marathon", 42.195, "08:00"),
          d("Half", 21.098, "10:15"),
          d("11.2K", 11.2, "10:00"),
        ],
      },
    ],
  },
  {
    slug: "three-hearts-marathon",
    name: "Three Hearts Marathon",
    country: "Slovenia",
    city: "Radenci",
    region: "Mura Statistical Region",
    area: "Radenci and the Mura countryside",
    surface: "Road",
    organiser: "Športno društvo Tri srca",
    website: "https://www.maraton-radenci.si/en/",
    source: "https://www.maraton-radenci.si/en/",
    extraDistances: ["Marathon"],
    occurrences: [
      {
        date: "2026-05-16",
        distances: [
          d("Marathon", 42.195, "09:00"),
          d("Half", 21.098, "09:00"),
          d("10K", 10, "09:15"),
          d("5.316K", 5.316, "09:15"),
        ],
      },
      {
        date: "2027-05-15",
        distances: [d("Half", 21.098), d("10K", 10), d("5.316K", 5.316)],
        source: "https://races.runna.com/events/three-hearts-marathon-4edf",
        note: "The existing AIMS 2027 marathon record is retained; these are the advertised companion distances.",
      },
    ],
  },
  {
    slug: "bovec-marathon",
    name: "Bovec Marathon",
    country: "Slovenia",
    city: "Bovec",
    region: "Gorizia Statistical Region",
    area: "Bovec and the Soča Valley",
    surface: "Road and Trail",
    organiser: "Športno društvo Bovec maraton",
    website: "https://tekaski-koledar.si/en/races/2026/r000200-blitz-bovec-maraton-2026/",
    source: "https://tekaski-koledar.si/en/races/2026/r000200-blitz-bovec-maraton-2026/",
    occurrences: [
      {
        date: "2026-09-05",
        distances: [d("Marathon", 42, "09:00"), d("22K", 22, "09:00"), d("7.6K", 7.6, "09:00")],
      },
    ],
  },
  {
    slug: "konjice-marathon",
    name: "Konjice Marathon",
    country: "Slovenia",
    city: "Slovenske Konjice",
    region: "Savinja Statistical Region",
    area: "Slovenske Konjice road courses",
    surface: "Road",
    organiser: "Konjiški maraton",
    website: "https://konjiskimaraton.si/en/about-marathon/",
    source: "https://konjiskimaraton.si/en/about-marathon/",
    occurrences: [
      {
        date: "2026-09-27",
        distances: [d("Half", 21, "09:30"), d("10K", 10, "09:30"), d("5K", 5, "09:50")],
      },
    ],
  },
  {
    slug: "ljubljana-marathon",
    name: "NLB Ljubljana Marathon",
    country: "Slovenia",
    city: "Ljubljana",
    region: "Central Slovenia",
    area: "Central Ljubljana road course",
    surface: "Road",
    organiser: "Timing Ljubljana and City of Ljubljana",
    website: "https://ljubljanskimaraton.si/en/",
    source: "https://ljubljanskimaraton.si/en/schedule",
    extraDistances: ["Marathon"],
    occurrences: [
      { date: "2026-10-17", distances: [d("10K", 10, "16:30")] },
      {
        date: "2026-10-18",
        distances: [d("Half", 21.098, "09:00")],
        note: "The existing marathon record is retained; these are the missing public distances.",
      },
    ],
  },
];

function uniqueDistances(config: RaceConfig): string[] {
  const exact = config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => distance.label),
  );
  const distances = [...new Set([...exact, ...(config.extraDistances ?? [])])];
  if (
    config.occurrences.some((occurrence) =>
      occurrence.distances.some((distance) => distance.km > 42.195),
    )
  ) {
    distances.push("Ultra");
  }
  return [...new Set(distances)];
}

export const westernBalkansRaceSeries: Series[] = raceConfigs.map((config) => ({
  slug: config.slug,
  name: config.name,
  sport: "Running",
  country: config.country,
  county: config.region,
  city: config.city,
  area: config.area,
  surface: config.surface,
  distances: uniqueDistances(config),
  summary: `${config.name} in ${config.city}, with every verified advertised running distance published separately.`,
  description: `${config.name} is listed from organiser, federation, timing or specialist local-calendar evidence checked on ${CHECKED_AT}. AthRecs publishes only explicitly advertised dates and distances.`,
  organiser: config.organiser,
  website: config.website,
  featured: false,
  source_url: config.source,
}));

function entryOption(config: RaceConfig, entryUrl: string): EntryOptionSeed {
  return {
    providerCode: config.slug,
    providerName: config.organiser,
    entryUrl,
    entryType: "official",
    status: "unknown",
    checkedAt: CHECKED_AT,
    sourceUrl: entryUrl,
    isVerified: true,
    isPrimary: true,
  };
}

export const westernBalkansRaceEditions: Edition[] = raceConfigs.flatMap((config) =>
  config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => {
      const source = occurrence.source ?? config.source;
      const isFinished = occurrence.date < CHECKED_AT;
      const entryUrl = occurrence.entryUrl ?? config.website;
      return {
        seriesSlug: config.slug,
        date: occurrence.date,
        distance: distance.label,
        distanceKm: distance.km,
        status: isFinished ? "Finished" : "Open",
        ...(isFinished
          ? {}
          : {
              entryUrl,
              entryOptions: [entryOption(config, entryUrl)],
            }),
        ...(distance.time ? { startTime: distance.time } : {}),
        source,
        notes:
          occurrence.note ??
          `Date, distance and venue checked against the published ${config.name} information on ${CHECKED_AT}.`,
        publishAllDistances: true,
      } satisfies Edition;
    }),
  ),
);
