import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-27";

type SourceTier = "official" | "federation" | "calendar";
type DistanceSpec = { label: string; km: number; time?: string };
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
  city: string;
  region: string;
  surface: string;
  organiser: string;
  website: string;
  source: string;
  occurrences: Occurrence[];
  featured: boolean;
  sourceTier: SourceTier;
  note?: string;
};

// This array is intentionally strict JSON so the standalone verifier can parse it without importing Vite.
const raceConfigs: RaceConfig[] = [
  {
    "slug": "brussels-airport-marathon",
    "name": "Brussels Airport Marathon & Half Marathon",
    "city": "Brussels",
    "region": "Brussels-Capital",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://www.brusselsmarathon.be/",
    "source": "https://pressroom.brusselsairport.be/en-brussels-airport-marathon-2025",
    "occurrences": [
      {
        "date": "2025-11-02",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ],
        "note": "Confirmed 20th edition. The organiser currently publishes no subsequent date; no speculative 2026/2027 edition is created."
      }
    ],
    "featured": true,
    "sourceTier": "official",
    "note": "The confirmed 20th edition is retained. The organiser has not published a later edition date, so no future date is guessed."
  },
  {
    "slug": "tour-des-clochers-membach",
    "name": "Tour des Clochers",
    "city": "Membach",
    "region": "Liège",
    "surface": "Mixed",
    "organiser": "Tour des Clochers / Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "source": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "occurrences": [
      {
        "date": "2026-01-25",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "18K",
            "km": 18.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Challenge Delhalle opener; adult short and main courses are included."
  },
  {
    "slug": "baloise-antwerp-park-miles",
    "name": "Baloise Antwerp Park Miles",
    "city": "Antwerp",
    "region": "Antwerp",
    "surface": "Trail",
    "organiser": "Golazo Sports",
    "website": "https://baloiseantwerpparkmiles.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-02-01",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "20K",
            "km": 20.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "besox-halve-van-oostende",
    "name": "Besox Halve van Oostende",
    "city": "Ostend",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://halvevanoostende.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-02-08",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "la-printaniere-erpent",
    "name": "La Printanière",
    "city": "Erpent",
    "region": "Namur",
    "surface": "Mixed",
    "organiser": "Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/2026/01/31/delhalle-2-14-la-printaniere/",
    "source": "https://challenge-delhalle.be/index.php/2026/01/31/delhalle-2-14-la-printaniere/",
    "occurrences": [
      {
        "date": "2026-02-14",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "15.7K",
            "km": 15.7
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "cross-de-bousval",
    "name": "Cross de Bousval",
    "city": "Bousval",
    "region": "Walloon Brabant",
    "surface": "Mixed",
    "organiser": "Cross de Bousval ASBL / Challenge Delhalle",
    "website": "https://www.lebousvalien.be/event/48eme-cross-de-bousval/",
    "source": "https://www.lebousvalien.be/event/48eme-cross-de-bousval/",
    "occurrences": [
      {
        "date": "2026-03-01",
        "distances": [
          {
            "label": "5.1K",
            "km": 5.1
          },
          {
            "label": "10.7K",
            "km": 10.7
          },
          {
            "label": "15.5K",
            "km": 15.5
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "nationaal-park-marathon",
    "name": "Nationaal Park Marathon",
    "city": "Maasmechelen",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Golazo Sports",
    "website": "https://nationaalparkmarathon.be/",
    "source": "https://nationaalparkmarathon.be/nl/praktische-info/",
    "occurrences": [
      {
        "date": "2026-03-01",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Only the Sunday RUN programme is included; the Saturday 28 February programme is walking-only and is excluded."
  },
  {
    "slug": "la-chaumontoise",
    "name": "La Chaumontoise – Mémorial Max Roberti",
    "city": "Chaumont-Gistoux",
    "region": "Walloon Brabant",
    "surface": "Mixed",
    "organiser": "JC Ronvau / Challenge Delhalle",
    "website": "https://jcronvau.be/index.php/2025/11/01/14-03-2026-la-chaumontoise/",
    "source": "https://jcronvau.be/index.php/2025/11/01/14-03-2026-la-chaumontoise/",
    "occurrences": [
      {
        "date": "2026-03-14",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "energyvision-cretes-de-spa",
    "name": "EnergyVision Crêtes de Spa",
    "city": "Spa",
    "region": "Liège",
    "surface": "Trail",
    "organiser": "Golazo Sports",
    "website": "https://cretesdespa.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-03-28",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "21K",
            "km": 21.0
          }
        ],
        "note": "The 1K children's race is excluded; the unsupported prior 5K adult row is retired."
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "The 1K children's race is excluded; the unsupported prior 5K adult row is retired."
  },
  {
    "slug": "la-louviere-fast-run",
    "name": "La Louvière Fast Run",
    "city": "La Louvière",
    "region": "Hainaut",
    "surface": "Road",
    "organiser": "LBFA Road Tour",
    "website": "https://lbfa.be/fr/trakks-lbfa-road-tour",
    "source": "https://lbfa.be/fr/trakks-lbfa-road-tour",
    "occurrences": [
      {
        "date": "2026-03-28",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "federation"
  },
  {
    "slug": "20-km-principaute-chimay",
    "name": "20 km de la Principauté de Chimay",
    "city": "Chimay",
    "region": "Hainaut",
    "surface": "Mixed",
    "organiser": "Jogging Athlétique Club de l’Oise / Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "source": "https://www.godare.events/en/events/street-running-calendar/20-km-de-la-principaute",
    "occurrences": [
      {
        "date": "2026-04-11",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "20K",
            "km": 20.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "federation"
  },
  {
    "slug": "baloise-antwerp-10-miles",
    "name": "Baloise Antwerp 10 Miles",
    "city": "Antwerp",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://baloiseantwerp10miles.be/en/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-04-25",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          }
        ]
      },
      {
        "date": "2026-04-26",
        "distances": [
          {
            "label": "10 Miles",
            "km": 16.09344
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Official 2026 programme uses a 6K short run and the 10 Miles main race; the earlier 5-mile row is retired."
  },
  {
    "slug": "rund-um-den-see-butgenbach",
    "name": "Rund um den See Bütgenbach",
    "city": "Bütgenbach",
    "region": "Liège",
    "surface": "Mixed",
    "organiser": "SC Bütgenbach / Challenge Delhalle",
    "website": "https://www.ostbelgien.eu/de/events/fiche/2026-04-25/44-halbmarathon-rund-um-den-see",
    "source": "https://www.ostbelgien.eu/de/events/fiche/2026-04-25/44-halbmarathon-rund-um-den-see",
    "occurrences": [
      {
        "date": "2026-04-25",
        "distances": [
          {
            "label": "4.9K",
            "km": 4.9
          },
          {
            "label": "11.6K",
            "km": 11.6
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "energyvision-genk-loopt",
    "name": "EnergyVision Genk Loopt!",
    "city": "Genk",
    "region": "Limburg",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://genkloopt.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-05-03",
        "distances": [
          {
            "label": "3K",
            "km": 3.0
          },
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ],
        "note": "Official programme states 16K, not 10 miles."
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Official programme states 16K, not 10 miles."
  },
  {
    "slug": "abdijrun-herkenrode",
    "name": "Abdijrun Herkenrode",
    "city": "Hasselt",
    "region": "Limburg",
    "surface": "Road",
    "organiser": "Abdijrun Herkenrode",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "brasserrun",
    "name": "BrasserRun & Walk",
    "city": "Schepdaal",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "BrasserRun",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "15K",
            "km": 15.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "laatem-lopen",
    "name": "Laat’em Lopen",
    "city": "Sint-Martens-Latem",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Laat'em Lopen",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "15K",
            "km": 15.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "leonardo-run",
    "name": "Leonardo Run",
    "city": "Denderleeuw",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Leonardo Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "3.5K",
            "km": 3.5
          },
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "10.5K",
            "km": 10.5
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "run-fun-diest",
    "name": "Run & Fun Diest",
    "city": "Diest",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "Run & Fun Diest",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "val-dheure",
    "name": "Val d’Heure",
    "city": "Ham-sur-Heure",
    "region": "Hainaut",
    "surface": "Mixed",
    "organiser": "Jogging Club Ham-sur-Heure / Challenge Delhalle",
    "website": "https://www.jchsh.be/",
    "source": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "viersel-loop",
    "name": "Viersel Loop",
    "city": "Viersel",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Viersel Loop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-09",
        "distances": [
          {
            "label": "3.3K",
            "km": 3.3
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "halve-van-schoten",
    "name": "De Halve van Schoten",
    "city": "Schoten",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "De Halve van Schoten",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-10",
        "distances": [
          {
            "label": "10.5K",
            "km": 10.5
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "plantentuinjogging",
    "name": "Plantentuinjogging",
    "city": "Meise",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "Plantentuinjogging",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-10",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "13.8K",
            "km": 13.8
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "reuzenloop",
    "name": "Reuzenloop",
    "city": "Borgerhout",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Reuzenloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-10",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "besox-abdijentocht",
    "name": "Besox Abdijentocht",
    "city": "Averbode",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "Golazo Sports",
    "website": "https://abdijentocht.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-05-14",
        "distances": [
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "bon-secours-nature-race",
    "name": "Bon-Secours Nature Race",
    "city": "Péruwelz",
    "region": "Hainaut",
    "surface": "Trail",
    "organiser": "Bon-Secours Nature Race",
    "website": "https://www.bonsecoursnaturerace.be/",
    "source": "https://www.bonsecoursnaturerace.be/",
    "occurrences": [
      {
        "date": "2026-05-17",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "23K",
            "km": 23.0
          },
          {
            "label": "30K",
            "km": 30.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "bernadetteloop",
    "name": "Bernadetteloop",
    "city": "Ghent",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Bernadetteloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-22",
        "distances": [
          {
            "label": "2.5K",
            "km": 2.5
          },
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "jogging-de-flone",
    "name": "Jogging de Flône",
    "city": "Amay",
    "region": "Liège",
    "surface": "Road",
    "organiser": "Jogging de Flône",
    "website": "https://www.jogging.org/fr/calendrier/",
    "source": "https://www.jogging.org/fr/calendrier/",
    "occurrences": [
      {
        "date": "2026-05-22",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "lievegem-loopt",
    "name": "Lievegem Loopt",
    "city": "Lievegem",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Effetto Corsa Running",
    "website": "https://www.godare.events/nl/events/stratenloopkalender/lievegem-loopt",
    "source": "https://www.godare.events/nl/events/stratenloopkalender/lievegem-loopt",
    "occurrences": [
      {
        "date": "2026-05-22",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar",
    "note": "Adult programme; the 1.1K kids run is excluded."
  },
  {
    "slug": "kortrijk-loopt",
    "name": "Runner’s Lab Kortrijk Loopt",
    "city": "Kortrijk",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Runner's Lab",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-22",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "quooker-10-mijl-van-malle",
    "name": "Quooker 10 Mijl van Malle",
    "city": "Oostmalle",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "10 Mijl van Malle",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-24",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "10 Miles",
            "km": 16.09344
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "den-elewijtse-halve",
    "name": "Den Elewijtse Halve",
    "city": "Elewijt",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "Den Elewijtse Halve",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-25",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10.5K",
            "km": 10.5
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "koning-van-de-hotond",
    "name": "Koning(in) van de Hotond",
    "city": "Kluisbergen",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Koning(in) van de Hotond",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-25",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "12K",
            "km": 12.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "dare-to-run-alveringem",
    "name": "Dare to Run Alveringem",
    "city": "Alveringem",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Dare to Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-29",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "gijzegem-loopt",
    "name": "Gijzegem Loopt",
    "city": "Gijzegem",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Gijzegem Loopt",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-29",
        "distances": [
          {
            "label": "3.5K",
            "km": 3.5
          },
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "10.5K",
            "km": 10.5
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "sint-andreasloop",
    "name": "Sint Andreasloop",
    "city": "Ostend",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Sint Andreasloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-29",
        "distances": [
          {
            "label": "6.6K",
            "km": 6.6
          },
          {
            "label": "9.9K",
            "km": 9.9
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "muideloop",
    "name": "Muideloop",
    "city": "Ghent",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Muideloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-05-30",
        "distances": [
          {
            "label": "3.4K",
            "km": 3.4
          },
          {
            "label": "6.8K",
            "km": 6.8
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "grensloop-menen",
    "name": "Grensloop Menen",
    "city": "Menen",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Grensloop Menen",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-05",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "koningin-van-de-muur",
    "name": "Koningin van de Muur",
    "city": "Geraardsbergen",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Koningin van de Muur",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-06",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "12K",
            "km": 12.0
          },
          {
            "label": "20K",
            "km": 20.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trail-godefroy",
    "name": "Trail Godefroy",
    "city": "Bouillon",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Trail Godefroy",
    "website": "https://www.trailgodefroy.be/",
    "source": "https://www.racemappr.com/events/trail-godefroy-bouillon-2026",
    "occurrences": [
      {
        "date": "2026-06-06",
        "distances": [
          {
            "label": "20K",
            "km": 20.0
          },
          {
            "label": "35K",
            "km": 35.0
          },
          {
            "label": "50K",
            "km": 50.0
          },
          {
            "label": "75K",
            "km": 75.0
          },
          {
            "label": "100K",
            "km": 100.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "faluintjesjogging",
    "name": "Faluintjesjogging",
    "city": "Moorsel",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Faluintjesjogging",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-07",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "la-djiblotinne",
    "name": "La Djiblotinne",
    "city": "Gembloux",
    "region": "Namur",
    "surface": "Trail",
    "organiser": "Groupe Athlétique de Gembloux / Challenge Delhalle",
    "website": "https://gagembloux.be/la-djiblotinne/",
    "source": "https://gagembloux.be/la-djiblotinne/",
    "occurrences": [
      {
        "date": "2026-06-07",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "12K",
            "km": 12.0
          },
          {
            "label": "21K",
            "km": 21.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "lentejogging-dijle-nostrum",
    "name": "Lentejogging Dijle Nostrum",
    "city": "Hever",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "Dijle Nostrum",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-07",
        "distances": [
          {
            "label": "5.5K",
            "km": 5.5
          },
          {
            "label": "10.9K",
            "km": 10.9
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "ohm-trail",
    "name": "OHM Trail",
    "city": "Aywaille",
    "region": "Liège",
    "surface": "Trail",
    "organiser": "OHM Trail",
    "website": "https://www.ohmtrail.be/",
    "source": "https://www.ultratiming.be/evenement/ohm-trail-2026/",
    "occurrences": [
      {
        "date": "2026-06-07",
        "distances": [
          {
            "label": "11K",
            "km": 11.0
          },
          {
            "label": "24K",
            "km": 24.0
          },
          {
            "label": "35K",
            "km": 35.0
          },
          {
            "label": "55K",
            "km": 55.0
          },
          {
            "label": "83K",
            "km": 83.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "troubadour-trail",
    "name": "Troubadour Trail",
    "city": "Sint-Gillis-Waas",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Troubadour Trail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-07",
        "distances": [
          {
            "label": "8.6K",
            "km": 8.6
          },
          {
            "label": "14.7K",
            "km": 14.7
          },
          {
            "label": "21.5K",
            "km": 21.5
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "augustijn-bierloop-melsen",
    "name": "Augustijn Bierloop Melsen",
    "city": "Melsen",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Augustijn Bierloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-12",
        "distances": [
          {
            "label": "3K",
            "km": 3.0
          },
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "9K",
            "km": 9.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "springfest-run",
    "name": "Springfest Run",
    "city": "Westerlo",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Springfest Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-12",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "zesheuveltjesloop",
    "name": "Zesheuveltjesloop",
    "city": "Wervik",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Zesheuveltjesloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-12",
        "distances": [
          {
            "label": "10.5K",
            "km": 10.5
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "memorial-filip-vanhaecke",
    "name": "Memorial Filip Vanhaecke",
    "city": "Ardooie",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Memorial Filip Vanhaecke",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-06-13",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "forges-foret-anlier",
    "name": "Les Forges de la Forêt d’Anlier",
    "city": "Habay-la-Neuve",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Habay Runners Club / Challenge Delhalle",
    "website": "https://www.les-forges-anlier.be/",
    "source": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "occurrences": [
      {
        "date": "2026-06-20",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "brita-urban-trail-brussels",
    "name": "BRITA Urban Trail Brussels",
    "city": "Brussels",
    "region": "Brussels-Capital",
    "surface": "Mixed",
    "organiser": "Golazo Sports",
    "website": "https://brusselsurbantrail.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-06-28",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "trail-de-la-hulle",
    "name": "Trail de la Hulle",
    "city": "Gedinne",
    "region": "Namur",
    "surface": "Trail",
    "organiser": "Trail de la Hulle",
    "website": "https://www.traildelahulle.be/",
    "source": "https://www.jogging.org/fr/calendrier/",
    "occurrences": [
      {
        "date": "2026-06-28",
        "distances": [
          {
            "label": "9.5K",
            "km": 9.5
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "22K",
            "km": 22.0
          },
          {
            "label": "32K",
            "km": 32.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "festival-trail-semois",
    "name": "Festival Trail Semois",
    "city": "Herbeumont",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Festival Trail Semois",
    "website": "https://festivaltrailsemois.be/",
    "source": "https://www.racemappr.com/events/festival-trail-semois-2026",
    "occurrences": [
      {
        "date": "2026-07-04",
        "distances": [
          {
            "label": "9K",
            "km": 9.0
          },
          {
            "label": "17K",
            "km": 17.0
          },
          {
            "label": "34K",
            "km": 34.0
          },
          {
            "label": "49K",
            "km": 49.0
          },
          {
            "label": "70K",
            "km": 70.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "primagaz-classic-tessenderlo",
    "name": "The Primagaz Classic Tessenderlo",
    "city": "Tessenderlo",
    "region": "Limburg",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://theclassictessenderlo.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-07-06",
        "distances": [
          {
            "label": "4K",
            "km": 4.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "jogging-trail-hermeton",
    "name": "Jogging & Trail de l’Hermeton",
    "city": "Romedenne",
    "region": "Namur",
    "surface": "Trail",
    "organiser": "Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "source": "https://challenge-delhalle.be/index.php/inscriptions-aux-courses/",
    "occurrences": [
      {
        "date": "2026-07-11",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "24K",
            "km": 24.0
          },
          {
            "label": "33K",
            "km": 33.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "lenfer-du-viroin-summer",
    "name": "L’Enfer du Viroin Summer Trail",
    "city": "Nismes",
    "region": "Namur",
    "surface": "Trail",
    "organiser": "L’Enfer du Viroin",
    "website": "https://lenferduviroin.be/en",
    "source": "https://lenferduviroin.be/en",
    "occurrences": [
      {
        "date": "2026-08-14",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "25K",
            "km": 25.0
          },
          {
            "label": "35K",
            "km": 35.0
          },
          {
            "label": "45K",
            "km": 45.0
          },
          {
            "label": "60K",
            "km": 60.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "the-big-bertha",
    "name": "The Big Bertha",
    "city": "Ans",
    "region": "Liège",
    "surface": "Trail",
    "organiser": "The Big Bertha",
    "website": "https://www.finishers.com/en/event/the-big-bertha",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-08-16",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "homevast-beverse-5-miles",
    "name": "Homevast Beverse 5 Miles",
    "city": "Beveren",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Homevast Beverse 5 Miles",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-27",
        "distances": [
          {
            "label": "5 Miles",
            "km": 8.04672
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "coastrun-middelkerke",
    "name": "Coastrun Middelkerke",
    "city": "Westende",
    "region": "West Flanders",
    "surface": "Trail",
    "organiser": "Sportdienst Middelkerke",
    "website": "https://www.middelkerke.be/nl/coastrun",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-28",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "danst-sjanst-run",
    "name": "Danst & Sjanst Run",
    "city": "Turnhout",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Danst & Sjanst Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-28",
        "distances": [
          {
            "label": "2.5K",
            "km": 2.5
          },
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "7.5K",
            "km": 7.5
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "dwars-door-bouwel",
    "name": "Dwars door Bouwel",
    "city": "Bouwel",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Dwars door Bouwel",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-28",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "brugse-ekiden",
    "name": "Brugse Ekiden",
    "city": "Bruges",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Brugse Ekiden",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "descente-de-la-lesse",
    "name": "Descente de la Lesse",
    "city": "Dinant",
    "region": "Namur",
    "surface": "Trail",
    "organiser": "Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "source": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "12K",
            "km": 12.0
          },
          {
            "label": "20K",
            "km": 20.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "kravalvatrail",
    "name": "KravALVAtrail",
    "city": "Baardegem",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "KravALVAtrail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "9K",
            "km": 9.0
          },
          {
            "label": "13K",
            "km": 13.0
          },
          {
            "label": "20K",
            "km": 20.0
          },
          {
            "label": "28K",
            "km": 28.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "kruibeeksepolderloop",
    "name": "Kruibeeksepolderloop",
    "city": "Beveren-Kruibeke-Zwijndrecht",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Kruibeeksepolderloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "lo-cal-run",
    "name": "Lo Cal Run",
    "city": "Lo-Reninge",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Lo Cal Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "15K",
            "km": 15.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "rheaxion-run-walk",
    "name": "RheAxion Run & Walk",
    "city": "Melsbroek",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "RheAxion",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trail-4th-engineer-battalion",
    "name": "Trail of the 4th Engineer Battalion",
    "city": "Amay",
    "region": "Liège",
    "surface": "Trail",
    "organiser": "4th Engineer Battalion",
    "website": "https://www.finishers.com/en/event/trail-of-the-4th-engineer-battalion",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-08-30",
        "distances": [
          {
            "label": "11K",
            "km": 11.0
          },
          {
            "label": "17K",
            "km": 17.0
          },
          {
            "label": "25K",
            "km": 25.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "stratenloop-berendrecht",
    "name": "Stratenloop Berendrecht",
    "city": "Berendrecht",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Stratenloop Berendrecht",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-08-31",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "kapittelloop",
    "name": "Kapittelloop",
    "city": "Brasschaat",
    "region": "Antwerp",
    "surface": "Park",
    "organiser": "AC BREAK",
    "website": "https://kapittelloop.be",
    "source": "https://www.loopkalender.be/nl/race/kapittelloop-1",
    "occurrences": [
      {
        "date": "2026-09-04",
        "distances": [
          {
            "label": "4K",
            "km": 4.0
          },
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "10 Miles",
            "km": 16.09344
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "ballekes-run",
    "name": "Ballekes Run",
    "city": "Sint-Job-in-'t-Goor",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Ballekes Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-05",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "cavaloop",
    "name": "Cavaloop",
    "city": "Zele",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Cavaloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-05",
        "distances": [
          {
            "label": "3K",
            "km": 3.0
          },
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "9K",
            "km": 9.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "corrida-temploutoise",
    "name": "Corrida Temploutoise",
    "city": "Temploux",
    "region": "Namur",
    "surface": "Road",
    "organiser": "Corrida Temploutoise",
    "website": "https://www.finishers.com/en/event/corrida-temploutoise",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-09-05",
        "distances": [
          {
            "label": "3K",
            "km": 3.0
          },
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "9K",
            "km": 9.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar",
    "note": "Adult/open races only; the 1.5K youth course is excluded."
  },
  {
    "slug": "teut-trail",
    "name": "Teut Trail",
    "city": "Zonhoven",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Teut Trail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-05",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "la-belle-iloise",
    "name": "La Belle Iloise",
    "city": "Liège",
    "region": "Liège",
    "surface": "Road",
    "organiser": "La Belle Iloise",
    "website": "https://www.jogging.org/fr/calendrier/",
    "source": "https://www.jogging.org/fr/calendrier/",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "lievegem-trail",
    "name": "Lievegem Trail",
    "city": "Lievegem",
    "region": "East Flanders",
    "surface": "Mixed",
    "organiser": "Effetto Corsa Running",
    "website": "https://www.effettocorsa.be/",
    "source": "https://www.loopkalender.be/nl/wedstrijd/lievegem-trail",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "7.5K",
            "km": 7.5
          },
          {
            "label": "9K",
            "km": 9.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "31K",
            "km": 31.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "memorial-rik-clerckx",
    "name": "Memorial Rik Clerckx",
    "city": "Linkhout",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Memorial Rik Clerckx vzw",
    "website": "https://memorialrc.be/",
    "source": "https://www.loopkalender.be/nl/race/memorial-rik-clerckx-0",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "11K",
            "km": 11.0
          },
          {
            "label": "10 Miles",
            "km": 16.09344
          },
          {
            "label": "25K",
            "km": 25.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "rechte-deur-oogle",
    "name": "Rechte Deur Oogle",
    "city": "Hooglede",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Rechte Deur Oogle",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "semi-marathon-estaimpuis",
    "name": "Semi-marathon d’Estaimpuis",
    "city": "Estaimpuis",
    "region": "Hainaut",
    "surface": "Road",
    "organiser": "ASBL Marathon Estaimpuis",
    "website": "https://www.semi-marathon-estaimpuis.be/",
    "source": "https://www.jogging.org/fr/calendrier/fiche/2026/75",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "trail-des-chevaliers",
    "name": "Trail des Chevaliers",
    "city": "Marche-en-Famenne",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Trail des Chevaliers",
    "website": "https://www.traildeschevaliers.be/",
    "source": "https://www.jogging.org/fr/calendrier/",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "18K",
            "km": 18.0
          },
          {
            "label": "25K",
            "km": 25.0
          },
          {
            "label": "35K",
            "km": 35.0
          },
          {
            "label": "60K",
            "km": 60.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "trail-of-the-three-rocks",
    "name": "Trail of the 3 Rocks",
    "city": "Vielsalm",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Trail of the 3 Rocks",
    "website": "https://www.finishers.com/en/event/trail-of-the-3-rocks",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "25K",
            "km": 25.0
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "veldmuistrail",
    "name": "Veldmuistrail",
    "city": "Zwevezele",
    "region": "West Flanders",
    "surface": "Trail",
    "organiser": "Veldmuistrail",
    "website": "https://veldmuistrail.be/",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-06",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "rabona-run",
    "name": "Rabona Run",
    "city": "Sint-Andries",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Rabona Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-11",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "wanzele-loopt",
    "name": "Wanzele Loopt",
    "city": "Wanzele",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Wanzele Loopt",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-11",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "city-trail-zwevegem",
    "name": "City Trail Zwevegem",
    "city": "Zwevegem",
    "region": "West Flanders",
    "surface": "Mixed",
    "organiser": "City Trail Zwevegem",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "3.5K",
            "km": 3.5
          },
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "9.5K",
            "km": 9.5
          },
          {
            "label": "13K",
            "km": 13.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "loepduuvel",
    "name": "Loeëpduuvel",
    "city": "Asse",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "Loeëpduuvel",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "15K",
            "km": 15.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trailbeats",
    "name": "Trailbeats",
    "city": "Oostkamp",
    "region": "West Flanders",
    "surface": "Trail",
    "organiser": "Trailbeats",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-12",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "11K",
            "km": 11.0
          },
          {
            "label": "16K",
            "km": 16.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "30K",
            "km": 30.0
          },
          {
            "label": "43K",
            "km": 43.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "thoracique-de-la-houssiere",
    "name": "La Thoracique de la Houssière",
    "city": "Braine-le-Comte",
    "region": "Hainaut",
    "surface": "Trail",
    "organiser": "Challenge Delhalle",
    "website": "https://houssiere.eu/index.php/actualite/",
    "source": "https://houssiere.eu/index.php/actualite/",
    "occurrences": [
      {
        "date": "2026-09-13",
        "distances": [
          {
            "label": "6.4K",
            "km": 6.4
          },
          {
            "label": "12.4K",
            "km": 12.4
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Official organiser programme confirms the 6.4K Mini-Thoracique and 12.4K Thoracique."
  },
  {
    "slug": "qbuild-arlon-half-marathon",
    "name": "Qbuild Arlon Marathon",
    "city": "Arlon",
    "region": "Luxembourg",
    "surface": "Road",
    "organiser": "Qbuild Arlon Marathon",
    "website": "https://arlonmarathon.be/infos/",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-09-13",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ],
        "note": "The full marathon is restored alongside the 10K and half marathon."
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "The full marathon is restored alongside the 10K and half marathon."
  },
  {
    "slug": "juve-run-schoonaarde",
    "name": "Juvé-Run Stratenloop Schoonaarde",
    "city": "Schoonaarde",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "KFC Juventus Schoonaarde",
    "website": "https://kfcjschoonaarde.be/",
    "source": "https://www.loopkalender.be/en/race/5-de-juv%C3%A9-run-stratenloop-schoonaarde",
    "occurrences": [
      {
        "date": "2026-09-18",
        "distances": [
          {
            "label": "5.2K",
            "km": 5.2
          },
          {
            "label": "7.8K",
            "km": 7.8
          },
          {
            "label": "10.4K",
            "km": 10.4
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar",
    "note": "Adult timed programme; confectionery and junior-only races are excluded."
  },
  {
    "slug": "dampicourt-speed-race",
    "name": "Dampicourt Speed Race",
    "city": "Rouvroy",
    "region": "Luxembourg",
    "surface": "Road",
    "organiser": "LBFA Road Tour",
    "website": "https://lbfa.be/fr/trakks-lbfa-road-tour",
    "source": "https://lbfa.be/fr/trakks-lbfa-road-tour",
    "occurrences": [
      {
        "date": "2026-09-19",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "federation"
  },
  {
    "slug": "trail-des-fees",
    "name": "Trail des Fées",
    "city": "Bertrix",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Trail des Fées",
    "website": "https://www.finishers.com/en/event/trail-des-fees",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-09-19",
        "distances": [
          {
            "label": "12K",
            "km": 12.0
          },
          {
            "label": "13K",
            "km": 13.0
          },
          {
            "label": "22K",
            "km": 22.0
          },
          {
            "label": "37K",
            "km": 37.0
          },
          {
            "label": "55K",
            "km": 55.0
          }
        ],
        "note": "Youth distances and a malformed 1,200 km aggregator value are excluded."
      }
    ],
    "featured": false,
    "sourceTier": "calendar",
    "note": "Youth distances and a malformed 1,200 km aggregator value are excluded."
  },
  {
    "slug": "briqville-classic",
    "name": "Briqville Classic",
    "city": "Steendorp",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Gemeentebestuur Temse",
    "website": "https://www.temse.be/briqville-classic",
    "source": "https://www.godare.events/nl/events/natuurloopkalender/natuurloop-briqville-classic-1",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "3 x 7K Relay",
            "km": 21.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar",
    "note": "Municipal event date cross-checked with the published running programme."
  },
  {
    "slug": "herfstjogging-boortmeerbeek",
    "name": "Herfstjogging Boortmeerbeek",
    "city": "Boortmeerbeek",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "Herfstjogging Boortmeerbeek",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "3.5K",
            "km": 3.5
          },
          {
            "label": "6.7K",
            "km": 6.7
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "in-flanders-fields-marathon",
    "name": "In Flanders Fields Marathon & Half Marathon",
    "city": "Diksmuide",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "In Flanders Fields Marathon",
    "website": "https://www.marathonieper.be/",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "lichtervelde-loopt",
    "name": "Lichtervelde Loopt",
    "city": "Lichtervelde",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Lichtervelde Loopt",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "maes-gent-10-mijl",
    "name": "MAES Gent 10 Mijl",
    "city": "Ghent",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://gent10mijl.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "miles-for-humanity",
    "name": "Miles for Humanity Trailrun",
    "city": "Leuven",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "11.11.11",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "3 Miles",
            "km": 4.82803
          },
          {
            "label": "6 Miles",
            "km": 9.65606
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "ronse-run",
    "name": "Ronse Run",
    "city": "Ronse",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Ronse Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trail-du-barrage",
    "name": "Trail du Barrage",
    "city": "Nisramont",
    "region": "Luxembourg",
    "surface": "Trail",
    "organiser": "Trail du Barrage",
    "website": "https://www.finishers.com/en/event/trail-du-barrage",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "18K",
            "km": 18.0
          },
          {
            "label": "23K",
            "km": 23.0
          },
          {
            "label": "34K",
            "km": 34.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "zolder-42",
    "name": "Zolder 42",
    "city": "Heusden-Zolder",
    "region": "Limburg",
    "surface": "Road",
    "organiser": "Zolder 42",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-20",
        "distances": [
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "kontich-loopt",
    "name": "Kontich Loopt!",
    "city": "Kontich",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Kontich Loopt",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-25",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "abele-run",
    "name": "Abele Run",
    "city": "Watou-Abele",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Abele Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-26",
        "distances": [
          {
            "label": "4.5K",
            "km": 4.5
          },
          {
            "label": "9K",
            "km": 9.0
          },
          {
            "label": "13.5K",
            "km": 13.5
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "dwars-door-kruisem",
    "name": "Dwars door Kruisem",
    "city": "Huise",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Dwars door Kruisem",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-26",
        "distances": [
          {
            "label": "10.5K",
            "km": 10.5
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "gpa-run-in-memory-of-lenn",
    "name": "GPA Run In Memory Of Lenn",
    "city": "Burcht",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "GPA Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-26",
        "distances": [
          {
            "label": "4.3K",
            "km": 4.3
          },
          {
            "label": "5 Miles",
            "km": 8.04672
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "saladekermisloop-egem",
    "name": "Saladekermisloop Egem",
    "city": "Egem",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Saladekermisloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-26",
        "distances": [
          {
            "label": "3.3K",
            "km": 3.3
          },
          {
            "label": "6.6K",
            "km": 6.6
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "alpro-leiecorrida",
    "name": "Alpro Leiecorrida",
    "city": "Wevelgem",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Leiemarathon vzw",
    "website": "https://leiecorrida.be/",
    "source": "https://leiecorrida.be/",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10.5K",
            "km": 10.5
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Official programme includes 5K, 10.5K quarter marathon and half marathon; kids and G-loop are excluded."
  },
  {
    "slug": "aveve-natuurloop",
    "name": "Aveve Natuurloop",
    "city": "Landen",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "Aveve Natuurloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "az-delta-run",
    "name": "AZ Delta Run",
    "city": "Rumbeke",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "AZ Delta",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "bosloop-beringen",
    "name": "Bosloop Beringen",
    "city": "Koersel",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Bosloop Beringen",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "4K",
            "km": 4.0
          },
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "bosmarathon-buggenhout",
    "name": "Bosmarathon Buggenhout",
    "city": "Buggenhout",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Bosmarathon",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "energyvision-dwars-door-mechelen",
    "name": "EnergyVision Dwars door Mechelen",
    "city": "Mechelen",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://dwarsdoormechelen.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ],
        "note": "Official 2026 programme: 6K, 10K and half marathon; the unsupported 5K row is retired."
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Official 2026 programme: 6K, 10K and half marathon; the unsupported 5K row is retired."
  },
  {
    "slug": "fun-industry-run",
    "name": "Fun Industry Run",
    "city": "Aalter",
    "region": "East Flanders",
    "surface": "Mixed",
    "organiser": "Fun Industry Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "halve-marathon-turnhout",
    "name": "Halve Marathon Turnhout",
    "city": "Turnhout",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Vansweevelt Vastgoed Halve Marathon Turnhout",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "kerel-trail",
    "name": "Kerel Trail",
    "city": "Tielrode",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Kerel Trail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "5.3K",
            "km": 5.3
          },
          {
            "label": "13.5K",
            "km": 13.5
          },
          {
            "label": "17.7K",
            "km": 17.7
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "maarkedal-trail",
    "name": "Maarkedal Trail",
    "city": "Schorisse",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Maarkedal Trail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "14K",
            "km": 14.0
          },
          {
            "label": "23K",
            "km": 23.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "maasrun-lanaken",
    "name": "Maasrun Lanaken",
    "city": "Lanaken",
    "region": "Limburg",
    "surface": "Road",
    "organiser": "Maasrun Lanaken",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "2.5K",
            "km": 2.5
          },
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "marathon-de-lourthe",
    "name": "Marathon de l’Ourthe",
    "city": "Hamoir",
    "region": "Liège",
    "surface": "Trail",
    "organiser": "Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "source": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          },
          {
            "label": "Marathon",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "run-to-kick",
    "name": "RUN TO KICK",
    "city": "Brussels",
    "region": "Brussels-Capital",
    "surface": "Road",
    "organiser": "RUN TO KICK",
    "website": "https://www.runtokick.be/",
    "source": "https://www.finishers.com/en/destinations/europe/belgium",
    "occurrences": [
      {
        "date": "2026-09-27",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "den-halve-van-geshaa",
    "name": "Den Halve van Geshaa",
    "city": "Putte",
    "region": "Antwerp",
    "surface": "Road",
    "organiser": "Den Halve van Geshaa",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-03",
        "distances": [
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ],
        "note": "The listed format is three 7K loops; AthRecs records the full 21K race."
      }
    ],
    "featured": false,
    "sourceTier": "calendar",
    "note": "The listed format is three 7K loops; AthRecs records the full 21K race."
  },
  {
    "slug": "fluo-nightrun-brasschaat",
    "name": "Fluo Nightrun Brasschaat",
    "city": "Brasschaat",
    "region": "Antwerp",
    "surface": "Mixed",
    "organiser": "Fluo Nightrun Brasschaat",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-03",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "kesseloop",
    "name": "Kesseloop",
    "city": "Kessel-Lo",
    "region": "Flemish Brabant",
    "surface": "Road",
    "organiser": "Kesseloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-04",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trappistenjogging",
    "name": "Trappistenjogging",
    "city": "Malle",
    "region": "Antwerp",
    "surface": "Trail",
    "organiser": "Trappistenjogging",
    "website": "https://trappistenjogging.be/",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-04",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "16K",
            "km": 16.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "team-run-kortrijk",
    "name": "Decathlon & Athlead Team Run",
    "city": "Kortrijk",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Athlead",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-07",
        "distances": [
          {
            "label": "4 x 5K Relay",
            "km": 20.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "corpuss-run-geluwe",
    "name": "Corpuss Run – Dwars door Geluwe",
    "city": "Geluwe",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Corpuss Run – Dwars door Geluwe",
    "website": "https://www.dwarsdoorgeluwe.be",
    "source": "https://www.loopkalender.be/nl/wedstrijd/corpuss-run-dwars-door-geluwe",
    "occurrences": [
      {
        "date": "2026-10-10",
        "distances": [
          {
            "label": "4K",
            "km": 4.0
          },
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "10 Miles",
            "km": 16.09344
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "h3o-trailrun",
    "name": "H3O Trailrun",
    "city": "Halle",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "H3O Trailrun",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-10",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "16K",
            "km": 16.0
          },
          {
            "label": "28K",
            "km": 28.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "loop-door-de-bomen",
    "name": "Loop door de Bomen",
    "city": "Hechtel-Eksel",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Loop door de Bomen",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-10",
        "distances": [
          {
            "label": "3K",
            "km": 3.0
          },
          {
            "label": "6K",
            "km": 6.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trailrun-leopoldsburg",
    "name": "Trailrun Leopoldsburg",
    "city": "Leopoldsburg",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Trailrun Leopoldsburg",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-11",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "brussels-ekiden",
    "name": "Brussels Ekiden",
    "city": "Brussels",
    "region": "Brussels-Capital",
    "surface": "Road",
    "organiser": "Golazo Sports",
    "website": "https://brusselsekiden.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-10-17",
        "distances": [
          {
            "label": "Marathon Relay",
            "km": 42.195
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "run-into-the-zone",
    "name": "Run Into The Zone",
    "city": "Waregem",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Run Into The Zone",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-17",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "11-trail-roeselare",
    "name": "11.trail Roeselare",
    "city": "Roeselare",
    "region": "West Flanders",
    "surface": "Trail",
    "organiser": "11.trail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-18",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "la-chatelettaine",
    "name": "La Châtelettaine",
    "city": "Châtelet",
    "region": "Hainaut",
    "surface": "Mixed",
    "organiser": "Union Athlétique Châtelet / Challenge Delhalle",
    "website": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "source": "https://challenge-delhalle.be/index.php/agenda-2026/",
    "occurrences": [
      {
        "date": "2026-10-18",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "14K",
            "km": 14.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "trage-wegen-jogging",
    "name": "Trage Wegen Jogging",
    "city": "Boutersem",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "Voetweg 41",
    "website": "https://www.voetweg41.be/twj",
    "source": "https://www.voetweg41.be/twj",
    "occurrences": [
      {
        "date": "2026-10-18",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "16K",
            "km": 16.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "halloween-nighttrail",
    "name": "Halloween Nighttrail",
    "city": "Lichtaart",
    "region": "Antwerp",
    "surface": "Trail",
    "organiser": "Halloween Nighttrail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-24",
        "distances": [
          {
            "label": "4K",
            "km": 4.0
          },
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "14K",
            "km": 14.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "brita-urban-trail-ghent",
    "name": "BRITA Urban Trail Ghent",
    "city": "Ghent",
    "region": "East Flanders",
    "surface": "Mixed",
    "organiser": "Golazo Sports",
    "website": "https://genturbantrail.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-10-25",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "retie-trail",
    "name": "Retie Trail",
    "city": "Retie",
    "region": "Antwerp",
    "surface": "Trail",
    "organiser": "Retie Trail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-25",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "17K",
            "km": 17.0
          },
          {
            "label": "31K",
            "km": 31.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "ultra-trail-kempen",
    "name": "Ultra Trail Kempen",
    "city": "Malle",
    "region": "Antwerp",
    "surface": "Trail",
    "organiser": "Ultra Trail Kempen",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-10-31",
        "distances": [
          {
            "label": "50K",
            "km": 50.0
          },
          {
            "label": "100K",
            "km": 100.0
          },
          {
            "label": "160K",
            "km": 160.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "donkmeerloop",
    "name": "De Mooiste Halve / Donkmeerloop",
    "city": "Berlare",
    "region": "East Flanders",
    "surface": "Road",
    "organiser": "Donkmeerloop",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-01",
        "distances": [
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "havenwereld-run",
    "name": "Havenwereld Run",
    "city": "Beveren",
    "region": "East Flanders",
    "surface": "Mixed",
    "organiser": "Golazo Sports",
    "website": "https://havenwereldrunandwalk.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-11-08",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "12K",
            "km": 12.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "brita-urban-trail-antwerp",
    "name": "BRITA Urban Trail Antwerpen",
    "city": "Antwerp",
    "region": "Antwerp",
    "surface": "Mixed",
    "organiser": "Golazo Sports",
    "website": "https://antwerpurbantrail.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-11-15",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "13K",
            "km": 13.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "ferremen-dottertrail",
    "name": "De FERREmen Dottertrail",
    "city": "Haaltert",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "FERREmen Dottertrail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-15",
        "distances": [
          {
            "label": "7.5K",
            "km": 7.5
          },
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "22K",
            "km": 22.0
          },
          {
            "label": "32K",
            "km": 32.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "stayen-great-half",
    "name": "Stayen Great Half Sint-Truiden",
    "city": "Sint-Truiden",
    "region": "Limburg",
    "surface": "Road",
    "organiser": "Stayen Great Half",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-15",
        "distances": [
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trail-for-nature",
    "name": "Trail For Nature",
    "city": "Herent",
    "region": "Flemish Brabant",
    "surface": "Trail",
    "organiser": "Trail For Nature",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-15",
        "distances": [
          {
            "label": "7.5K",
            "km": 7.5
          },
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "22K",
            "km": 22.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "duinengordeltrail",
    "name": "Duinengordeltrail",
    "city": "Oudsbergen",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Duinengordeltrail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-21",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "11K",
            "km": 11.0
          },
          {
            "label": "16K",
            "km": 16.0
          },
          {
            "label": "22K",
            "km": 22.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "trail-knokke-heist",
    "name": "Besox Trail Knokke-Heist",
    "city": "Knokke-Heist",
    "region": "West Flanders",
    "surface": "Trail",
    "organiser": "Golazo Sports",
    "website": "https://trailknokkeheist.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-11-22",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "17K",
            "km": 17.0
          },
          {
            "label": "24K",
            "km": 24.0
          }
        ],
        "note": "Official organiser calendar publishes 24K rather than the previous 25K."
      }
    ],
    "featured": false,
    "sourceTier": "official",
    "note": "Official organiser calendar publishes 24K rather than the previous 25K."
  },
  {
    "slug": "poppies-run",
    "name": "Poppies’ Run",
    "city": "Zonnebeke",
    "region": "West Flanders",
    "surface": "Road",
    "organiser": "Poppies' Run",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-22",
        "distances": [
          {
            "label": "5.5K",
            "km": 5.5
          },
          {
            "label": "13K",
            "km": 13.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "chocomoussetrail",
    "name": "Chocomoussetrail",
    "city": "Everbeek",
    "region": "East Flanders",
    "surface": "Trail",
    "organiser": "Chocomoussetrail",
    "website": "https://www.loopkalender.be/nl",
    "source": "https://www.loopkalender.be/nl",
    "occurrences": [
      {
        "date": "2026-11-29",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "10K",
            "km": 10.0
          },
          {
            "label": "15K",
            "km": 15.0
          },
          {
            "label": "Half Marathon",
            "km": 21.0975
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "calendar"
  },
  {
    "slug": "brita-urban-trail-mechelen",
    "name": "BRITA Urban Trail Mechelen",
    "city": "Mechelen",
    "region": "Antwerp",
    "surface": "Mixed",
    "organiser": "Golazo Sports",
    "website": "https://mechelenurbantrail.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-12-12",
        "distances": [
          {
            "label": "7K",
            "km": 7.0
          },
          {
            "label": "12K",
            "km": 12.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "besox-mijnentocht",
    "name": "Besox Mijnentocht",
    "city": "Beringen",
    "region": "Limburg",
    "surface": "Trail",
    "organiser": "Golazo Sports",
    "website": "https://mijnentocht.be/",
    "source": "https://golazorunningevents.com/fr/evenements/",
    "occurrences": [
      {
        "date": "2026-12-13",
        "distances": [
          {
            "label": "8K",
            "km": 8.0
          },
          {
            "label": "16.5K",
            "km": 16.5
          },
          {
            "label": "21.5K",
            "km": 21.5
          },
          {
            "label": "31K",
            "km": 31.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "official"
  },
  {
    "slug": "corrida-de-hannut",
    "name": "Corrida de Hannut",
    "city": "Hannut",
    "region": "Liège",
    "surface": "Road",
    "organiser": "LBFA Road Tour",
    "website": "https://lbfa.be/fr/trakks-lbfa-road-tour",
    "source": "https://lbfa.be/fr/trakks-lbfa-road-tour",
    "occurrences": [
      {
        "date": "2026-12-19",
        "distances": [
          {
            "label": "5K",
            "km": 5.0
          },
          {
            "label": "10K",
            "km": 10.0
          }
        ]
      }
    ],
    "featured": false,
    "sourceTier": "federation"
  },
  {
    "slug": "20-km-de-bruxelles",
    "name": "20 km de Bruxelles / 20 km door Brussel",
    "city": "Brussels",
    "region": "Brussels-Capital",
    "surface": "Road",
    "organiser": "S.I. Brussels Promotion",
    "website": "https://www.20kmdebruxelles.be/en/",
    "source": "https://www.20kmdebruxelles.be/en/general/",
    "occurrences": [
      {
        "date": "2027-05-30",
        "distances": [
          {
            "label": "20K",
            "km": 20.0
          }
        ]
      }
    ],
    "featured": true,
    "sourceTier": "official"
  }
];

export const belgiumComprehensiveReplacementSlugs = new Set([
  "baloise-antwerp-10-miles",
  "energyvision-cretes-de-spa",
  "energyvision-genk-loopt",
  "qbuild-arlon-half-marathon",
  "energyvision-dwars-door-mechelen",
  "trail-knokke-heist",
]);

function uniqueDistances(config: RaceConfig): string[] {
  const labels = config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => distance.label),
  );
  if (config.occurrences.some((occurrence) => occurrence.distances.some((item) => item.km > 42.195))) {
    labels.push("Ultra");
  }
  return [...new Set(labels)];
}

export const belgiumComprehensiveRaceSeries: Series[] = raceConfigs.map((config) => ({
  slug: config.slug,
  name: config.name,
  sport: "Running",
  country: "Belgium",
  county: config.region,
  city: config.city,
  area: `${config.city}, ${config.region} — ${config.surface.toLowerCase()} running`,
  surface: config.surface,
  distances: uniqueDistances(config),
  summary: `${config.name} in ${config.city}, with each confirmed adult/open running distance listed separately.`,
  description:
    config.note ??
    `${config.name} was checked against ${config.sourceTier} Belgian race evidence on ${CHECKED_AT}. AthRecs publishes exact dates and distances only and does not infer unannounced editions.`,
  organiser: config.organiser,
  website: config.website,
  featured: config.featured,
  source_url: config.source,
}));

function officialEntryOption(config: RaceConfig, entryUrl: string): EntryOptionSeed {
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

export const belgiumComprehensiveRaceEditions: Edition[] = raceConfigs.flatMap((config) =>
  config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => {
      const source = occurrence.source ?? config.source;
      const isFinished = occurrence.date < CHECKED_AT;
      const status = isFinished ? "Finished" : (occurrence.status ?? "Open");
      const entryUrl = occurrence.entryUrl ?? config.website;
      const hasVerifiedOfficialEntry =
        !isFinished &&
        status === "Open" &&
        config.sourceTier === "official" &&
        entryUrl.startsWith("https://");

      return {
        seriesSlug: config.slug,
        date: occurrence.date,
        distance: distance.label,
        distanceKm: distance.km,
        status,
        ...(hasVerifiedOfficialEntry
          ? { entryUrl, entryOptions: [officialEntryOption(config, entryUrl)] }
          : {}),
        ...(distance.time ? { startTime: distance.time } : {}),
        source,
        notes:
          occurrence.note ??
          config.note ??
          (config.sourceTier === "calendar"
            ? `Exact date and distance checked against an established Belgian calendar on ${CHECKED_AT}; registration status must be confirmed with the organiser.`
            : `Date, distance and venue checked against published Belgian race evidence on ${CHECKED_AT}.`),
        publishAllDistances: true,
      } satisfies Edition;
    }),
  ),
);
