import type {
  Edition,
  EntryOptionSeed,
  EntryOptionStatus,
  Series,
  Sport,
} from "./types";

/**
 * Curated German endurance-race selection requested for ATHRECS.
 *
 * The local source adds 38 regional and national fixtures across running,
 * cycling, triathlon and duathlon. BMW BERLIN-MARATHON and the in-window
 * German IRONMAN 70.3 races are already supplied by the higher-priority AIMS
 * and IRONMAN calendars; the permanent verifier checks that they remain
 * published without creating duplicate event cards here.
 */
export const GERMANY_ENDURANCE_CHECKED_AT = "2026-08-28";
export const GERMANY_ENDURANCE_WINDOW_END = "2027-08-27";

type DistanceSpec = {
  label: string;
  km: number;
  time?: string;
};

type Occurrence = {
  date: string;
  distances: DistanceSpec[];
  status?: "Open" | "Closed" | "TBC";
  source?: string;
  entryUrl?: string;
  note?: string;
};

type RaceConfig = {
  slug: string;
  name: string;
  sport: Sport;
  region: string;
  city: string;
  area: string;
  surface: string;
  organiser: string;
  website: string;
  source: string;
  occurrences: Occurrence[];
  summary: string;
  description: string;
};

const raceConfigs: RaceConfig[] = [
  {
    "slug": "international-16-talsperren-rundfahrt",
    "name": "29th International 16-Talsperren-Rundfahrt",
    "sport": "Cycling",
    "region": "North Rhine-Westphalia",
    "city": "Gevelsberg",
    "area": "Gevelsberg and the surrounding reservoir roads and trails",
    "surface": "Mixed",
    "organiser": "Ski-Club Gevelsberg 1963 e.V.",
    "website": "https://breitensport.rad-net.de/breitensportkalender/termine/2026/29.int.-16-talsperren-rundfahrt-%28rtf%29-marathon%3B9976867.html",
    "source": "https://breitensport.rad-net.de/breitensportkalender/termine/2026/29.int.-16-talsperren-rundfahrt-%28rtf%29-marathon%3B9976867.html",
    "occurrences": [
      {
        "date": "2026-08-29",
        "distances": [
          {
            "label": "14K CTF",
            "km": 14
          },
          {
            "label": "35K CTF",
            "km": 35
          },
          {
            "label": "71K RTF",
            "km": 71
          },
          {
            "label": "113K RTF",
            "km": 113
          },
          {
            "label": "142K RTF",
            "km": 142
          },
          {
            "label": "203K Road Marathon",
            "km": 203
          }
        ],
        "note": "German Cycling's 2026 calendar also lists the companion 14/35 km CTF and 203 km road-marathon formats."
      }
    ],
    "summary": "Official German Cycling calendar fixture offering CTF, RTF and road-marathon routes from Gevelsberg.",
    "description": "Official German Cycling calendar fixture offering CTF, RTF and road-marathon routes from Gevelsberg."
  },
  {
    "slug": "sparkassen-knappenman",
    "name": "Sparkassen KnappenMan",
    "sport": "Triathlon",
    "region": "Saxony",
    "city": "Lohsa",
    "area": "Dreiweiberner See",
    "surface": "Mixed",
    "organiser": "Triathlonverein Hoyerswerda e.V.",
    "website": "https://www.knappenman.de/",
    "source": "https://www.knappenman.de/",
    "occurrences": [
      {
        "date": "2026-08-29",
        "distances": [
          {
            "label": "Junior",
            "km": 2.5
          },
          {
            "label": "Jedermann",
            "km": 12.8
          },
          {
            "label": "Sprint",
            "km": 25.75
          },
          {
            "label": "Olympic",
            "km": 51.5
          }
        ],
        "note": "Saturday programme: junior, Jedermann, sprint and Olympic-distance races."
      },
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "Middle",
            "km": 113
          },
          {
            "label": "Long",
            "km": 226
          },
          {
            "label": "Relay",
            "km": 226
          }
        ],
        "note": "Sunday programme: middle and long-distance individual and relay races."
      }
    ],
    "summary": "Two-day triathlon festival at Dreiweiberner See with junior, sprint, Olympic, middle and long-distance racing.",
    "description": "Two-day triathlon festival at Dreiweiberner See with junior, sprint, Olympic, middle and long-distance racing."
  },
  {
    "slug": "duensberg-celtic-race",
    "name": "Dünsberg Celtic Race / German MTB Marathon Championships",
    "sport": "Cycling",
    "region": "Hesse",
    "city": "Biebertal",
    "area": "Dünsberg and Biebertal forest trails",
    "surface": "MTB / Gravel",
    "organiser": "AMC Rodheim-Bieber e.V.",
    "website": "https://meldungen.rad-net.de/modules.php?ID_Veranstaltung=42659&mode=ascr_detail&name=Ausschreibung&pgID_Veranstaltung=4",
    "source": "https://meldungen.rad-net.de/modules.php?ID_Veranstaltung=42659&mode=ascr_detail&name=Ausschreibung&pgID_Veranstaltung=4",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "29.9K Mini Marathon",
            "km": 29.9
          },
          {
            "label": "41.2K MTB",
            "km": 41.2
          },
          {
            "label": "57.2K Gravel",
            "km": 57.2
          },
          {
            "label": "82.4K MTB",
            "km": 82.4
          },
          {
            "label": "123.6K XCM",
            "km": 123.6
          }
        ],
        "note": "The official German Cycling listing includes a 57.2 km gravel race alongside four MTB-marathon formats."
      }
    ],
    "summary": "German Cycling championship and open MTB/gravel marathon programme around the Dünsberg.",
    "description": "German Cycling championship and open MTB/gravel marathon programme around the Dünsberg."
  },
  {
    "slug": "kallinchen-triathlon",
    "name": "Kallinchen Triathlon",
    "sport": "Triathlon",
    "region": "Brandenburg",
    "city": "Kallinchen",
    "area": "Motzener See",
    "surface": "Mixed",
    "organiser": "Triathlon Team Berlin e.V.",
    "website": "https://kallinchentriathlon.de/Startseite/",
    "source": "https://kallinchentriathlon.de/Startseite/",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "Kids (0.1/2.8/0.6)",
            "km": 3.5
          },
          {
            "label": "Supersprint (0.3/13/2.8)",
            "km": 16.1
          },
          {
            "label": "Sprint (0.75/26/5)",
            "km": 31.75
          },
          {
            "label": "Olympic (1.5/39/10)",
            "km": 50.5
          }
        ],
        "status": "Closed",
        "note": "The official registration portal showed the 2026 event as sold out when checked on 28 August 2026."
      }
    ],
    "summary": "Traditional open triathlon at Motzener See with children, supersprint, sprint and Olympic races.",
    "description": "Traditional open triathlon at Motzener See with children, supersprint, sprint and Olympic races."
  },
  {
    "slug": "riderman",
    "name": "RiderMan",
    "sport": "Cycling",
    "region": "Baden-Württemberg",
    "city": "Bad Dürrheim",
    "area": "Black Forest closed-road stage courses",
    "surface": "Road",
    "organiser": "Sauser Event GmbH",
    "website": "https://www.riderman.de/",
    "source": "https://www.riderman.de/",
    "occurrences": [
      {
        "date": "2026-09-04",
        "distances": [
          {
            "label": "Stage 1 Time Trial",
            "km": 16.1
          }
        ],
        "status": "Closed",
        "note": "Registration closed on 24 August 2026."
      },
      {
        "date": "2026-09-05",
        "distances": [
          {
            "label": "Stage 2 Road Race",
            "km": 112.9
          }
        ],
        "status": "Closed",
        "note": "Registration closed on 24 August 2026."
      },
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "Stage 3 Road Race",
            "km": 95
          }
        ],
        "status": "Closed",
        "note": "Registration closed on 24 August 2026."
      }
    ],
    "summary": "Three-stage mass-participation road race on fully closed Black Forest roads.",
    "description": "Three-stage mass-participation road race on fully closed Black Forest roads."
  },
  {
    "slug": "berlinwoman-triathlon",
    "name": "BerlinWoMan Triathlon",
    "sport": "Triathlon",
    "region": "Berlin",
    "city": "Berlin",
    "area": "Wannsee and Grunewald",
    "surface": "Mixed",
    "organiser": "Weltraumjogger Berlin e.V.",
    "website": "https://www.berlinman.de/",
    "source": "https://www.berlin.de/en/sports-leisure/running/5931834-7813334-berlinman-triathlon.en.html",
    "occurrences": [
      {
        "date": "2026-09-05",
        "distances": [
          {
            "label": "Middle (2/80/21)",
            "km": 103
          },
          {
            "label": "AquaBike (2/80)",
            "km": 82
          },
          {
            "label": "Middle Relay",
            "km": 103
          }
        ]
      },
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "Sprint (0.75/20/5)",
            "km": 25.75
          },
          {
            "label": "Sprint Relay",
            "km": 25.75
          }
        ]
      }
    ],
    "summary": "Biennial Berlin triathlon weekend with middle-distance, sprint, relay and aquabike races.",
    "description": "Biennial Berlin triathlon weekend with middle-distance, sprint, relay and aquabike races."
  },
  {
    "slug": "koln-triathlon",
    "name": "Köln Triathlon",
    "sport": "Triathlon",
    "region": "North Rhine-Westphalia",
    "city": "Cologne",
    "area": "Rhine and central Cologne",
    "surface": "Mixed",
    "organiser": "Köln Triathlon Veranstaltungs GmbH",
    "website": "https://www.koeln-triathlon.com/en/",
    "source": "https://www.koeln-triathlon.com/en/",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "Sprint",
            "km": 25.75
          },
          {
            "label": "Olympic",
            "km": 51.5
          },
          {
            "label": "Middle",
            "km": 113
          },
          {
            "label": "Olympic Relay",
            "km": 51.5
          },
          {
            "label": "Middle Relay",
            "km": 113
          }
        ]
      }
    ],
    "summary": "Rhine-based Cologne triathlon with sprint, Olympic and middle-distance individual and relay formats.",
    "description": "Rhine-based Cologne triathlon with sprint, Olympic and middle-distance individual and relay formats."
  },
  {
    "slug": "nibelungen-triathlon-xanten",
    "name": "Nibelungen-Triathlon Xanten",
    "sport": "Triathlon",
    "region": "North Rhine-Westphalia",
    "city": "Xanten",
    "area": "Xantener Südsee and Lower Rhine roads",
    "surface": "Mixed",
    "organiser": "TV Xanten 05/22 e.V.",
    "website": "https://www.triathlon-xanten.de/ausschreibung",
    "source": "https://www.triathlon-xanten.de/ausschreibung",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "Draxi (0.5/17/5)",
            "km": 22.5
          },
          {
            "label": "Draxi Relay",
            "km": 22.5
          },
          {
            "label": "Olympic (1.5/42/10)",
            "km": 53.5
          },
          {
            "label": "Olympic Relay",
            "km": 53.5
          }
        ],
        "status": "Closed",
        "note": "The official registration period had ended when checked on 28 August 2026."
      }
    ],
    "summary": "Long-running Xanten triathlon with Draxi and Olympic-distance individual and relay races.",
    "description": "Long-running Xanten triathlon with Draxi and Olympic-distance individual and relay races."
  },
  {
    "slug": "p-weg-marathon-running",
    "name": "P-Weg Marathon – Running Events",
    "sport": "Running",
    "region": "North Rhine-Westphalia",
    "city": "Plettenberg",
    "area": "Sauerland forest and hill routes",
    "surface": "Trail / Mixed",
    "organiser": "P-Weg Team e.V.",
    "website": "https://p-weg.de/informationen/laeufer/",
    "source": "https://p-weg.de/informationen/laeufer/",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "12K",
            "km": 12
          },
          {
            "label": "Half",
            "km": 21.1
          },
          {
            "label": "Marathon",
            "km": 42
          },
          {
            "label": "73K",
            "km": 73
          }
        ]
      }
    ],
    "summary": "Demanding forest-and-gravel running programme around Plettenberg, from 12 km to 73 km.",
    "description": "Demanding forest-and-gravel running programme around Plettenberg, from 12 km to 73 km."
  },
  {
    "slug": "vulkanbike-eifel-marathon",
    "name": "VulkanBike Eifel-Marathon",
    "sport": "Cycling",
    "region": "Rhineland-Palatinate",
    "city": "Daun",
    "area": "Vulkaneifel MTB and gravel trails",
    "surface": "MTB / Gravel",
    "organiser": "VulkanBike Eifel-Marathon",
    "website": "https://www.vulkan.bike/",
    "source": "https://www.vulkan.bike/",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "25K",
            "km": 25
          },
          {
            "label": "38K",
            "km": 38
          },
          {
            "label": "65K",
            "km": 65
          },
          {
            "label": "90K",
            "km": 90
          },
          {
            "label": "101K",
            "km": 101
          },
          {
            "label": "38K E-Bike",
            "km": 38
          },
          {
            "label": "65K E-Bike",
            "km": 65
          }
        ]
      }
    ],
    "summary": "Official MTB, gravel and e-bike marathon programme in the Vulkaneifel.",
    "description": "Official MTB, gravel and e-bike marathon programme in the Vulkaneifel."
  },
  {
    "slug": "oranke-open-triathlon",
    "name": "Oranke Open Triathlon",
    "sport": "Triathlon",
    "region": "Berlin",
    "city": "Berlin",
    "area": "Orankesee",
    "surface": "Mixed",
    "organiser": "Triathlon Verein Berlin 09 e.V.",
    "website": "https://www.berlin-timing.de/Oranke-Triathlon",
    "source": "https://www.berlin-timing.de/Oranke-Triathlon",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "Open Competition (0.1/2.6/1)",
            "km": 3.7
          },
          {
            "label": "Open Race (0.25/3.9/1)",
            "km": 5.15
          },
          {
            "label": "Open Competition Relay",
            "km": 3.7
          },
          {
            "label": "Open Race Relay",
            "km": 5.15
          }
        ]
      }
    ],
    "summary": "Accessible short-course triathlon and relay programme at Berlin's Orankesee.",
    "description": "Accessible short-course triathlon and relay programme at Berlin's Orankesee."
  },
  {
    "slug": "schwarzwald-bike-marathon",
    "name": "Schwarzwald Bike Marathon",
    "sport": "Cycling",
    "region": "Baden-Württemberg",
    "city": "Furtwangen",
    "area": "Black Forest MTB and gravel routes",
    "surface": "MTB / Gravel",
    "organiser": "Schwarzwald Bike Marathon e.V.",
    "website": "https://www.schwarzwald-bike-marathon.de/zeitplan-programm/",
    "source": "https://www.schwarzwald-bike-marathon.de/zeitplan-programm/",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "Kids Cup",
            "km": 1
          }
        ],
        "note": "Youth programme; exact lap distance varies by age category."
      },
      {
        "date": "2026-09-13",
        "distances": [
          {
            "label": "46K MTB",
            "km": 46
          },
          {
            "label": "46K E-Bike",
            "km": 46
          },
          {
            "label": "56K Gravel",
            "km": 56
          },
          {
            "label": "59K MTB",
            "km": 59
          },
          {
            "label": "94K MTB",
            "km": 94
          }
        ]
      }
    ],
    "summary": "Black Forest bike weekend combining MTB, gravel, e-bike and youth racing.",
    "description": "Black Forest bike weekend combining MTB, gravel, e-bike and youth racing."
  },
  {
    "slug": "p-weg-mtb-marathon",
    "name": "P-Weg MTB Marathon",
    "sport": "Cycling",
    "region": "North Rhine-Westphalia",
    "city": "Plettenberg",
    "area": "Sauerland forest trails",
    "surface": "MTB",
    "organiser": "P-Weg Team e.V.",
    "website": "https://p-weg.de/informationen/allgemeine-infos/",
    "source": "https://p-weg.de/informationen/allgemeine-infos/",
    "occurrences": [
      {
        "date": "2026-09-13",
        "distances": [
          {
            "label": "21K MTB",
            "km": 21
          },
          {
            "label": "45K MTB",
            "km": 45
          },
          {
            "label": "51K E-MTB",
            "km": 51
          },
          {
            "label": "76K MTB",
            "km": 76
          }
        ]
      }
    ],
    "summary": "MTB and e-MTB marathon races on the forest roads and technical trails around Plettenberg.",
    "description": "MTB and e-MTB marathon races on the forest roads and technical trails around Plettenberg."
  },
  {
    "slug": "muensterland-giro-leezencups",
    "name": "Sparkassen Münsterland Giro LeezenCups",
    "sport": "Cycling",
    "region": "North Rhine-Westphalia",
    "city": "Münster",
    "area": "Münster and Münsterland closed roads",
    "surface": "Road",
    "organiser": "Stadt Münster",
    "website": "https://muensterland-giro.de/",
    "source": "https://muensterland-giro.de/",
    "occurrences": [
      {
        "date": "2026-10-03",
        "distances": [
          {
            "label": "65K",
            "km": 65
          },
          {
            "label": "95K",
            "km": 95
          },
          {
            "label": "125K",
            "km": 125
          }
        ],
        "status": "Closed",
        "note": "All three LeezenCup distances were shown as sold out when checked on 28 August 2026."
      }
    ],
    "summary": "Major mass-participation closed-road cycling event through Münsterland.",
    "description": "Major mass-participation closed-road cycling event through Münsterland."
  },
  {
    "slug": "cologne-marathon",
    "name": "Generali Köln Marathon",
    "sport": "Running",
    "region": "North Rhine-Westphalia",
    "city": "Cologne",
    "area": "Cologne city road courses",
    "surface": "Road",
    "organiser": "Kölner Marathon Veranstaltungs- und Werbe GmbH",
    "website": "https://koeln-marathon.de/",
    "source": "https://koeln-marathon.de/",
    "occurrences": [
      {
        "date": "2026-10-04",
        "distances": [
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Cologne's major city marathon weekend with half marathon and relay formats.",
    "description": "Cologne's major city marathon weekend with half marathon and relay formats."
  },
  {
    "slug": "wa-marathon-m-nchen-by-brooks-7236403",
    "name": "MARATHON MÜNCHEN by Brooks",
    "sport": "Running",
    "region": "Bavaria",
    "city": "Munich",
    "area": "Munich city road courses",
    "surface": "Road",
    "organiser": "Laufstatt Event gGmbH",
    "website": "https://marathonmuenchen.org/",
    "source": "https://marathonmuenchen.org/faq/",
    "occurrences": [
      {
        "date": "2026-10-11",
        "distances": [
          {
            "label": "10K",
            "km": 10
          },
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Munich city marathon programme with 10K, half marathon, marathon and relay.",
    "description": "Munich city marathon programme with 10K, half marathon, marathon and relay."
  },
  {
    "slug": "westenergie-marathon-essen",
    "name": "Westenergie Marathon Essen",
    "sport": "Running",
    "region": "North Rhine-Westphalia",
    "city": "Essen",
    "area": "Baldeneysee",
    "surface": "Road",
    "organiser": "TUSEM Essen",
    "website": "https://westenergie-marathon.de/",
    "source": "https://westenergie-marathon.de/",
    "occurrences": [
      {
        "date": "2026-10-11",
        "distances": [
          {
            "label": "Westenergie Seerunde",
            "km": 18.6
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "AllbauTeamStaffel",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Traditional flat lakeside marathon, lake lap and team relay around Baldeneysee.",
    "description": "Traditional flat lakeside marathon, lake lap and team relay around Baldeneysee."
  },
  {
    "slug": "powerman-wurselen",
    "name": "POWERMAN Würselen",
    "sport": "Duathlon",
    "region": "North Rhine-Westphalia",
    "city": "Würselen",
    "area": "Würselen and Aachen region",
    "surface": "Road",
    "organiser": "Powerman Germany / DLC Aachen",
    "website": "https://powerman.org/wurselen/",
    "source": "https://powerman.org/wurselen/",
    "occurrences": [
      {
        "date": "2026-10-11",
        "distances": [
          {
            "label": "Sprint (5/20/5)",
            "km": 30
          },
          {
            "label": "Short (10/40/5)",
            "km": 55
          }
        ]
      }
    ],
    "summary": "Run-bike-run event hosting the German short-distance duathlon championships.",
    "description": "Run-bike-run event hosting the German short-distance duathlon championships."
  },
  {
    "slug": "stadtwerke-lubeck-marathon",
    "name": "Stadtwerke Lübeck Marathon",
    "sport": "Running",
    "region": "Schleswig-Holstein",
    "city": "Lübeck",
    "area": "Lübeck and Travemünde road courses",
    "surface": "Road",
    "organiser": "Lübecker Marathon e.V.",
    "website": "https://swhl-marathon.de/en/",
    "source": "https://swhl-marathon.de/en/",
    "occurrences": [
      {
        "date": "2026-10-18",
        "distances": [
          {
            "label": "5K",
            "km": 5
          },
          {
            "label": "10K",
            "km": 10
          },
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Duo Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Lübeck road-running festival with distances from 5K to marathon and team formats.",
    "description": "Lübeck road-running festival with distances from 5K to marathon and team formats."
  },
  {
    "slug": "dresden-marathon",
    "name": "DRESDEN-MARATHON",
    "sport": "Running",
    "region": "Saxony",
    "city": "Dresden",
    "area": "Dresden city road courses",
    "surface": "Road",
    "organiser": "DRESDEN-MARATHON e.V.",
    "website": "https://www.dresden-marathon.com/",
    "source": "https://www.dresden-marathon.com/",
    "occurrences": [
      {
        "date": "2026-10-24",
        "distances": [
          {
            "label": "5K",
            "km": 5
          }
        ]
      },
      {
        "date": "2026-10-25",
        "distances": [
          {
            "label": "10K",
            "km": 10
          },
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Dresden road-running weekend with 5K, 10K, half marathon, marathon and relay.",
    "description": "Dresden road-running weekend with 5K, 10K, half marathon, marathon and relay."
  },
  {
    "slug": "frankfurt-marathon",
    "name": "Mainova Frankfurt Marathon",
    "sport": "Running",
    "region": "Hesse",
    "city": "Frankfurt am Main",
    "area": "Frankfurt city road course",
    "surface": "Road",
    "organiser": "motion events GmbH",
    "website": "https://www.frankfurt-marathon.com/en/",
    "source": "https://www.frankfurt-marathon.com/en/",
    "occurrences": [
      {
        "date": "2026-10-25",
        "distances": [
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Frankfurt's international city marathon and four-person relay.",
    "description": "Frankfurt's international city marathon and four-person relay."
  },
  {
    "slug": "roentgenlauf",
    "name": "Röntgenlauf",
    "sport": "Running",
    "region": "North Rhine-Westphalia",
    "city": "Remscheid",
    "area": "Röntgenweg and Bergisches Land",
    "surface": "Trail / Mixed",
    "organiser": "Röntgenlauf e.V.",
    "website": "https://www.roentgenlauf.de/",
    "source": "https://www.roentgenlauf.de/",
    "occurrences": [
      {
        "date": "2026-10-25",
        "distances": [
          {
            "label": "5K",
            "km": 5
          },
          {
            "label": "10K",
            "km": 10
          },
          {
            "label": "Half",
            "km": 21.1
          },
          {
            "label": "Marathon",
            "km": 42.2
          },
          {
            "label": "63.3K Ultra",
            "km": 63.3
          }
        ]
      }
    ],
    "summary": "Mixed-terrain running festival on the Röntgenweg, including a 63.3 km ultra.",
    "description": "Mixed-terrain running festival on the Röntgenweg, including a 63.3 km ultra."
  },
  {
    "slug": "rodgau-50k-ultramarathon",
    "name": "Rodgau 50 km Ultramarathon",
    "sport": "Running",
    "region": "Hesse",
    "city": "Rodgau-Dudenhofen",
    "area": "Dudenhofen multi-lap mixed-surface course",
    "surface": "Mixed",
    "organiser": "RLT Rodgau",
    "website": "https://ultra.rlt-rodgau.de/ausschreibung-ultramarathon-rlt-rodgau/",
    "source": "https://ultra.rlt-rodgau.de/ausschreibung-ultramarathon-rlt-rodgau/",
    "occurrences": [
      {
        "date": "2027-01-30",
        "distances": [
          {
            "label": "50K",
            "km": 50
          }
        ]
      }
    ],
    "summary": "DLV-approved 50 km ultramarathon on a fast multi-lap course in Rodgau.",
    "description": "DLV-approved 50 km ultramarathon on a fast multi-lap course in Rodgau."
  },
  {
    "slug": "brocken-challenge",
    "name": "Brocken-Challenge",
    "sport": "Running",
    "region": "Lower Saxony / Saxony-Anhalt",
    "city": "Göttingen",
    "area": "Göttingen to the Brocken summit",
    "surface": "Winter Trail",
    "organiser": "Brocken-Challenge e.V.",
    "website": "https://www.brocken-challenge.de/ausschreibung/ausschreibung.html",
    "source": "https://www.brocken-challenge.de/ausschreibung/ausschreibung.html",
    "occurrences": [
      {
        "date": "2027-02-13",
        "distances": [
          {
            "label": "Approx. 80–86K",
            "km": 83
          }
        ],
        "note": "The organiser describes a weather- and routing-dependent distance of roughly 80–86 km."
      }
    ],
    "summary": "Winter point-to-point trail ultra from Göttingen to the summit of the Brocken.",
    "description": "Winter point-to-point trail ultra from Göttingen to the summit of the Brocken."
  },
  {
    "slug": "mein-freiburg-marathon",
    "name": "MEIN FREIBURG MARATHON",
    "sport": "Running",
    "region": "Baden-Württemberg",
    "city": "Freiburg im Breisgau",
    "area": "Freiburg city road courses",
    "surface": "Road",
    "organiser": "Freiburg Wirtschaft Touristik und Messe GmbH & Co. KG",
    "website": "https://www.mein-freiburgmarathon.de/",
    "source": "https://www.mein-freiburgmarathon.de/",
    "occurrences": [
      {
        "date": "2027-04-03",
        "distances": [
          {
            "label": "10K",
            "km": 10
          }
        ]
      },
      {
        "date": "2027-04-04",
        "distances": [
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Freiburg city marathon weekend with 10K, half-marathon and marathon races.",
    "description": "Freiburg city marathon weekend with 10K, half-marathon and marathon races."
  },
  {
    "slug": "hannover-marathon",
    "name": "ADAC Marathon Hannover",
    "sport": "Running",
    "region": "Lower Saxony",
    "city": "Hanover",
    "area": "Hanover city road courses",
    "surface": "Road",
    "organiser": "eichels Event GmbH",
    "website": "https://www.marathon-hannover.de/",
    "source": "https://www.marathon-hannover.de/teilnehmer/allgemeine-infos.html",
    "occurrences": [
      {
        "date": "2027-04-11",
        "distances": [
          {
            "label": "10K",
            "km": 10
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          },
          {
            "label": "Half",
            "km": 21.0975
          }
        ]
      }
    ],
    "summary": "Fast Hanover road-running programme with 10K, half marathon, marathon and relay.",
    "description": "Fast Hanover road-running programme with 10K, half marathon, marathon and relay."
  },
  {
    "slug": "harzquerung",
    "name": "HarzQuerung",
    "sport": "Running",
    "region": "Saxony-Anhalt / Thuringia",
    "city": "Wernigerode",
    "area": "Harz routes to Benneckenstein and Nordhausen",
    "surface": "Trail",
    "organiser": "Harz-Gebirgslaufverein Wernigerode e.V.",
    "website": "https://harz-querung.de/",
    "source": "https://harz-querung.de/",
    "occurrences": [
      {
        "date": "2027-04-24",
        "distances": [
          {
            "label": "Approx. 25K",
            "km": 25
          },
          {
            "label": "Approx. 28K",
            "km": 28
          },
          {
            "label": "Approx. 51K",
            "km": 51
          }
        ]
      }
    ],
    "summary": "Point-to-point forest and mountain trail races crossing the Harz.",
    "description": "Point-to-point forest and mountain trail races crossing the Harz."
  },
  {
    "slug": "hamburg-marathon",
    "name": "Haspa Marathon Hamburg",
    "sport": "Running",
    "region": "Hamburg",
    "city": "Hamburg",
    "area": "Hamburg city road courses",
    "surface": "Road",
    "organiser": "Marathon Hamburg Veranstaltungs GmbH",
    "website": "https://haspa-marathon-hamburg.de/en/",
    "source": "https://haspa-marathon-hamburg.de/en/",
    "occurrences": [
      {
        "date": "2027-04-25",
        "distances": [
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "summary": "Hamburg's major city marathon with half-marathon and relay options.",
    "description": "Hamburg's major city marathon with half-marathon and relay options."
  },
  {
    "slug": "gutsmuths-rennsteiglauf",
    "name": "GutsMuths-Rennsteiglauf",
    "sport": "Running",
    "region": "Thuringia",
    "city": "Schmiedefeld am Rennsteig",
    "area": "Rennsteig routes from Eisenach, Neuhaus and Oberhof",
    "surface": "Cross-country / Trail",
    "organiser": "GutsMuths-Rennsteiglaufverein e.V.",
    "website": "https://www.rennsteiglauf.de/",
    "source": "https://www.rennsteiglauf.de/wettkampf/strecken/marathon/",
    "occurrences": [
      {
        "date": "2027-05-22",
        "distances": [
          {
            "label": "Half",
            "km": 21.1
          },
          {
            "label": "Marathon",
            "km": 42.2
          },
          {
            "label": "73.9K Supermarathon",
            "km": 73.9
          }
        ]
      }
    ],
    "summary": "Germany's classic cross-country running festival along the Rennsteig.",
    "description": "Germany's classic cross-country running festival along the Rennsteig."
  },
  {
    "slug": "mecklenburger-seen-runde",
    "name": "Mecklenburger Seen Runde",
    "sport": "Cycling",
    "region": "Mecklenburg-Vorpommern",
    "city": "Neubrandenburg",
    "area": "Mecklenburg Lake District",
    "surface": "Road",
    "organiser": "Mecklenburger Seen Runde GmbH",
    "website": "https://www.mecklenburger-seen-runde.de/de",
    "source": "https://www.mecklenburger-seen-runde.de/de",
    "occurrences": [
      {
        "date": "2027-05-28",
        "distances": [
          {
            "label": "300K",
            "km": 300
          }
        ],
        "note": "The 300 km ride starts on Friday evening and continues into Saturday."
      },
      {
        "date": "2027-05-29",
        "distances": [
          {
            "label": "Women's 100K",
            "km": 100
          },
          {
            "label": "Mini-MSR",
            "km": 30
          }
        ],
        "note": "The Mini-MSR distance varies by supporting ride; 30 km is retained as the principal advertised route."
      }
    ],
    "summary": "Long-distance non-stop road cycling challenge through the Mecklenburg Lake District.",
    "description": "Long-distance non-stop road cycling challenge through the Mecklenburg Lake District."
  },
  {
    "slug": "memmert-rothsee-triathlon",
    "name": "Memmert Rothsee Triathlon",
    "sport": "Triathlon",
    "region": "Bavaria",
    "city": "Hilpoltstein",
    "area": "Rothsee",
    "surface": "Mixed",
    "organiser": "Rothsee-Triathlon e.V.",
    "website": "https://rothsee-triathlon.de/",
    "source": "https://rothsee-triathlon.de/",
    "occurrences": [
      {
        "date": "2027-06-19",
        "distances": [
          {
            "label": "Sprint (0.75/19.5/5)",
            "km": 25.25
          },
          {
            "label": "Sprint Relay",
            "km": 25.25
          }
        ]
      },
      {
        "date": "2027-06-20",
        "distances": [
          {
            "label": "Olympic (1.5/42/10)",
            "km": 53.5
          },
          {
            "label": "Olympic Relay",
            "km": 53.5
          }
        ]
      }
    ],
    "summary": "Popular Bavarian triathlon weekend at Rothsee with sprint, Olympic and relay racing.",
    "description": "Popular Bavarian triathlon weekend at Rothsee with sprint, Olympic and relay racing."
  },
  {
    "slug": "indeland-triathlon",
    "name": "indeland-Triathlon",
    "sport": "Triathlon",
    "region": "North Rhine-Westphalia",
    "city": "Eschweiler",
    "area": "Blausteinsee, Eschweiler and Aldenhoven",
    "surface": "Mixed",
    "organiser": "indeland-Triathlon",
    "website": "https://www.indeland-triathlon.de/",
    "source": "https://www.indeland-triathlon.de/",
    "occurrences": [
      {
        "date": "2027-06-20",
        "distances": [
          {
            "label": "Sprint",
            "km": 25.75
          },
          {
            "label": "Olympic",
            "km": 51.5
          },
          {
            "label": "Middle",
            "km": 113
          },
          {
            "label": "Relay",
            "km": 113
          }
        ]
      }
    ],
    "summary": "Regional triathlon festival offering sprint, Olympic, middle-distance and relay formats.",
    "description": "Regional triathlon festival offering sprint, Olympic, middle-distance and relay formats."
  },
  {
    "slug": "werbellinsee-triathlon",
    "name": "Werbellinsee Triathlon",
    "sport": "Triathlon",
    "region": "Brandenburg",
    "city": "Joachimsthal",
    "area": "Werbellinsee",
    "surface": "Mixed / Gravel",
    "organiser": "Werbellinsee Triathlon",
    "website": "https://werbellinseetriathlon.de/wettkampf/ausschreibung/",
    "source": "https://werbellinseetriathlon.de/wettkampf/ausschreibung/",
    "occurrences": [
      {
        "date": "2027-06-26",
        "distances": [
          {
            "label": "Volkstriathlon (0.4/12/3)",
            "km": 15.4
          },
          {
            "label": "Sprint (0.7/19/4.75)",
            "km": 24.45
          },
          {
            "label": "Gravel (1.5/26/7.5)",
            "km": 35
          },
          {
            "label": "Olympic (1.5/39/9.3)",
            "km": 49.8
          },
          {
            "label": "Kids",
            "km": 3
          }
        ]
      }
    ],
    "summary": "Open-water triathlon programme at Werbellinsee, including a gravel-bike format.",
    "description": "Open-water triathlon programme at Werbellinsee, including a gravel-bike format."
  },
  {
    "slug": "u-trail-lamer-winkel",
    "name": "Dynafit U. Trail Lamer Winkel",
    "sport": "Running",
    "region": "Bavaria",
    "city": "Lam",
    "area": "Lamer Winkel and Bavarian Forest mountain trails",
    "surface": "Mountain Trail",
    "organiser": "U. Trail Lamer Winkel",
    "website": "https://utlw.de/",
    "source": "https://utlw.de/",
    "occurrences": [
      {
        "date": "2027-07-03",
        "distances": [
          {
            "label": "12K",
            "km": 12
          },
          {
            "label": "23K",
            "km": 23
          },
          {
            "label": "54K",
            "km": 54
          }
        ]
      }
    ],
    "summary": "Mountain trail and ultra races in the Bavarian Forest.",
    "description": "Mountain trail and ultra races in the Bavarian Forest."
  },
  {
    "slug": "rad-am-ring",
    "name": "Rad am Ring",
    "sport": "Cycling",
    "region": "Rhineland-Palatinate",
    "city": "Nürburg",
    "area": "Nürburgring and Eifel",
    "surface": "Road / Gravel",
    "organiser": "eventwerkstatt GmbH",
    "website": "https://radamring.de/de",
    "source": "https://radamring.de/de",
    "occurrences": [
      {
        "date": "2027-07-24",
        "distances": [
          {
            "label": "25K Road",
            "km": 25
          },
          {
            "label": "75K Road",
            "km": 75
          },
          {
            "label": "150K Road",
            "km": 150
          },
          {
            "label": "24-Hour Solo/Team",
            "km": 624
          },
          {
            "label": "Gravel",
            "km": 80
          }
        ],
        "note": "The event weekend runs 23–25 July 2027. The 24-hour distance is lap-based; 624 km is a 24-lap reference, not a fixed requirement."
      }
    ],
    "summary": "Road, gravel and 24-hour endurance cycling weekend on and around the Nürburgring.",
    "description": "Road, gravel and 24-hour endurance cycling weekend on and around the Nürburgring."
  },
  {
    "slug": "ostseeman-triathlon-glucksburg",
    "name": "OstseeMan Triathlon Glücksburg",
    "sport": "Triathlon",
    "region": "Schleswig-Holstein",
    "city": "Glücksburg",
    "area": "Flensburg Fjord",
    "surface": "Mixed",
    "organiser": "OstseeMan Sport Promotion UG",
    "website": "https://www.ostseeman.de/wettkampf.html",
    "source": "https://www.ostseeman.de/wettkampf.html",
    "occurrences": [
      {
        "date": "2027-08-01",
        "distances": [
          {
            "label": "Middle",
            "km": 113
          },
          {
            "label": "Middle Relay",
            "km": 113
          },
          {
            "label": "Long",
            "km": 226
          },
          {
            "label": "Long Relay",
            "km": 226
          }
        ],
        "note": "The official event weekend is 31 July–1 August 2027; principal triathlon races are on Sunday 1 August."
      }
    ],
    "summary": "Long- and middle-distance coastal triathlon on Flensburg Fjord.",
    "description": "Long- and middle-distance coastal triathlon on Flensburg Fjord."
  },
  {
    "slug": "allgau-panorama-marathon",
    "name": "Allgäu Panorama Marathon",
    "sport": "Running",
    "region": "Bavaria",
    "city": "Sonthofen",
    "area": "Oberallgäu alpine routes",
    "surface": "Mountain Trail / Mixed",
    "organiser": "Allgäu Panorama Marathon",
    "website": "https://www.allgaeu-panorama-marathon.de/",
    "source": "https://www.allgaeu-panorama-marathon.de/",
    "occurrences": [
      {
        "date": "2027-08-07",
        "distances": [
          {
            "label": "5K",
            "km": 5
          }
        ]
      },
      {
        "date": "2027-08-08",
        "distances": [
          {
            "label": "Hörnerlauf 18K",
            "km": 18
          },
          {
            "label": "Half",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          },
          {
            "label": "Approx. 69.5K Ultra",
            "km": 69.5
          }
        ]
      }
    ],
    "summary": "Alpine running weekend in the Oberallgäu with road-to-trail distances up to 69.5 km.",
    "description": "Alpine running weekend in the Oberallgäu with road-to-trail distances up to 69.5 km."
  },
  {
    "slug": "100meilenberlin",
    "name": "100MeilenBerlin / Berlin Wall Race",
    "sport": "Running",
    "region": "Berlin",
    "city": "Berlin",
    "area": "Berlin Wall Trail through Berlin and Brandenburg",
    "surface": "Mixed",
    "organiser": "LG Mauerweg Berlin e.V.",
    "website": "https://www.100meilen.de/?lang=en",
    "source": "https://www.100meilen.de/?lang=en",
    "occurrences": [
      {
        "date": "2027-08-14",
        "distances": [
          {
            "label": "100 Miles Solo",
            "km": 161
          },
          {
            "label": "100 Miles Relay",
            "km": 161
          }
        ]
      }
    ],
    "summary": "100-mile ultramarathon following the historic Berlin Wall Trail.",
    "description": "100-mile ultramarathon following the historic Berlin Wall Trail."
  }
];

function uniqueDistances(config: RaceConfig): string[] {
  const exact = config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => distance.label),
  );
  if (config.occurrences.some((occurrence) => occurrence.distances.some((item) => item.km > 42.195))) {
    exact.push(config.sport === "Running" ? "Ultra" : "Endurance");
  }
  return [...new Set(exact)];
}

export const germanyEnduranceExpectedSeriesSlugs = raceConfigs.map((config) => config.slug);

export const germanyEnduranceRaceSeries: Series[] = raceConfigs.map((config) => ({
  slug: config.slug,
  name: config.name,
  sport: config.sport,
  country: "Germany",
  county: config.region,
  city: config.city,
  area: config.area,
  surface: config.surface,
  distances: uniqueDistances(config),
  summary: config.summary,
  description: `${config.description} Dates and distances were checked against the cited organiser or governing-body source on ${GERMANY_ENDURANCE_CHECKED_AT}.`,
  organiser: config.organiser,
  website: config.website,
  featured: false,
  source_url: config.source,
}));

function entryOption(
  config: RaceConfig,
  entryUrl: string,
  status: EntryOptionStatus,
  sourceUrl: string,
  notes?: string,
): EntryOptionSeed {
  return {
    providerCode: config.slug,
    providerName: config.organiser,
    entryUrl,
    entryType: "official",
    status,
    checkedAt: GERMANY_ENDURANCE_CHECKED_AT,
    sourceUrl,
    isVerified: true,
    isPrimary: true,
    notes,
  };
}

export const germanyEnduranceRaceEditions: Edition[] = raceConfigs.flatMap((config) =>
  config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => {
      const source = occurrence.source ?? config.source;
      const entryUrl = occurrence.entryUrl ?? config.website;
      const isFinished = occurrence.date < GERMANY_ENDURANCE_CHECKED_AT;
      const status: Edition["status"] = isFinished
        ? "Finished"
        : (occurrence.status ?? "Open");
      const optionStatus: EntryOptionStatus =
        status === "Finished"
          ? "closed"
          : status === "Closed"
            ? /sold out/i.test(occurrence.note ?? "")
              ? "sold_out"
              : "closed"
            : "unknown";

      return {
        seriesSlug: config.slug,
        date: occurrence.date,
        distance: distance.label,
        distanceKm: distance.km,
        status,
        entryUrl,
        entryOptions: [entryOption(config, entryUrl, optionStatus, source, occurrence.note)],
        ...(distance.time ? { startTime: distance.time } : {}),
        source,
        notes:
          occurrence.note ??
          `Date, distance and location checked against the published ${config.name} information on ${GERMANY_ENDURANCE_CHECKED_AT}.`,
        publishAllDistances: true,
      } satisfies Edition;
    }),
  ),
);

export const germanyEnduranceCalendarStats = {
  checkedAt: GERMANY_ENDURANCE_CHECKED_AT,
  windowEnd: GERMANY_ENDURANCE_WINDOW_END,
  series: germanyEnduranceRaceSeries.length,
  editions: germanyEnduranceRaceEditions.length,
  sports: [...new Set(germanyEnduranceRaceSeries.map((series) => series.sport))],
  firstDate: germanyEnduranceRaceEditions
    .map((edition) => edition.date)
    .sort()[0],
  lastDate: germanyEnduranceRaceEditions
    .map((edition) => edition.date)
    .sort()
    .at(-1),
};
