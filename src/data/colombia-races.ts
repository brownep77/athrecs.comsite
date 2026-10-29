import type { Edition, Series } from "./types";

/** Official Colombian programmes reviewed on 28 October 2026. No inferred recurrence. */
export const COLOMBIA_CHECKED_AT = "2026-10-28";
export type ColombiaEdition = Edition & { endDate?: string; endSourceUrl?: string; endCheckedAt?: string };

export const colombiaRaceSeries: Series[] = [
  {
    "slug": "media-maraton-de-cucuta",
    "name": "Media Maratón de Cúcuta",
    "sport": "Running",
    "country": "Colombia",
    "county": "Norte de Santander",
    "city": "Cúcuta",
    "area": "Cúcuta",
    "surface": "Road",
    "distances": [
      "21K",
      "10K",
      "5K"
    ],
    "summary": "A 21K, 10K and recreational 5K road-running programme in Cúcuta, Norte de Santander.",
    "description": "A 21K, 10K and recreational 5K road-running programme in Cúcuta, Norte de Santander. The 2026 races take place on 15 November. The 21K starts at 05:30, the 10K at 06:15 and the recreational 5K at 06:20. Times are local to Colombia. Entry is through the organiser-linked Spikes programme.",
    "organiser": "Fundación Corazón de Atleta",
    "website": "https://mediamaratoncucuta.com/",
    "featured": false,
    "source_url": "https://mediamaratoncucuta.com/reglamento-terminos-y-condiciones/"
  },
  {
    "slug": "media-maraton-uraba-corre",
    "name": "Media Maratón Urabá Corre",
    "sport": "Running",
    "country": "Colombia",
    "county": "Antioquia",
    "city": "Apartadó",
    "area": "C.A.F. Vital Health, Carrera 106 No. 104C-14, Apartadó",
    "surface": "Road",
    "distances": [
      "21K",
      "13K",
      "7.5K"
    ],
    "summary": "Road races of 21K, 13K and 7.5K from Apartadó in Colombia’s Urabá area.",
    "description": "Road races of 21K, 13K and 7.5K from Apartadó in Colombia’s Urabá area. The 2026 edition is on 22 November, starting at C.A.F. Vital Health in Apartadó. The published race regulations give 05:35 for 21K and 13K, and 05:50 for 7.5K. These are race starts; the general 05:30 event listing is not the start of every distance.",
    "organiser": "Comfenalco Antioquia, C.A.F. Vital Health and Corporación Run Urabá",
    "website": "https://urabacorre.com.co/",
    "featured": false,
    "source_url": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf"
  },
  {
    "slug": "media-maraton-de-manizales",
    "name": "Media Maratón de Manizales",
    "sport": "Running",
    "country": "Colombia",
    "county": "Caldas",
    "city": "Manizales",
    "area": "Manizales",
    "surface": "Road",
    "distances": [
      "21K",
      "10K",
      "5K"
    ],
    "summary": "A 21K, 10K and 5K road-race programme in Manizales, Caldas.",
    "description": "A 21K, 10K and 5K road-race programme in Manizales, Caldas. The 2026 edition takes place on 29 November. The organiser’s regulations give 06:00 for 21K, 07:30 for 10K and 08:30 for 5K. Check the official programme for the final start venue and arrival arrangements.",
    "organiser": "Media Maratón de Manizales",
    "website": "https://mediamaratonmanizales.com/",
    "featured": false,
    "source_url": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf"
  },
  {
    "slug": "vchallenges-maraton-de-bogota",
    "name": "VCHALLENGES — Maratón de Bogotá",
    "sport": "Running",
    "country": "Colombia",
    "county": "Bogotá D.C.",
    "city": "Bogotá",
    "area": "Parque Obelisco, Avenida Esperanza at Carrera 57, Bogotá",
    "surface": "Road",
    "distances": [
      "Marathon",
      "32K",
      "21K"
    ],
    "summary": "A 42.195 km marathon, 32K and 21K starting at Parque Obelisco in Bogotá.",
    "description": "A 42.195 km marathon, 32K and 21K starting at Parque Obelisco in Bogotá. The 2026 programme takes place on 29 November, with each of the three distances scheduled for 06:30 local time. The start is at Parque Obelisco, Avenida Esperanza at Carrera 57. The organiser may update the route and final arrangements in line with city permits.",
    "organiser": "Ergofitness S.A.S.",
    "website": "https://www.vchallenges.co/2026/challenge/details/vchallenges42k",
    "featured": false,
    "source_url": "https://www.vchallenges.co/2026/challenge/details/vchallenges42k"
  },
  {
    "slug": "media-maraton-del-mar-cartagena",
    "name": "Media Maratón del Mar Sistecrédito",
    "sport": "Running",
    "country": "Colombia",
    "county": "Bolívar",
    "city": "Cartagena de Indias",
    "area": "Sociedad Portuaria de Cartagena",
    "surface": "Road",
    "distances": [
      "Half",
      "10K"
    ],
    "summary": "A half marathon and 10K in Cartagena de Indias, starting at the Sociedad Portuaria.",
    "description": "A half marathon and 10K in Cartagena de Indias, starting at the Sociedad Portuaria. The 2027 edition takes place on 21 February. The half marathon, advertised as 21K, starts at 05:20 and the 10K at 05:50. Runners must use the organiser’s transport to access the port start; choose the official pickup point when registering. The separate children’s programme is on 20 February.",
    "organiser": "MCM Operador de Eventos and MOTIVVA Sport Logistics",
    "website": "https://mediamaratondelmar.com/",
    "featured": false,
    "source_url": "https://mediamaratondelmar.com/pages/informacion-2027"
  },
  {
    "slug": "cristal-run-fest",
    "name": "Cristal RUN FEST",
    "sport": "Running",
    "country": "Colombia",
    "county": "Antioquia",
    "city": "Medellín",
    "area": "Parque Norte, Medellín",
    "surface": "Road",
    "distances": [
      "15K",
      "7K",
      "3K"
    ],
    "summary": "A 3K, 7K and 15K running festival based at Parque Norte in Medellín.",
    "description": "A 3K, 7K and 15K running festival based at Parque Norte in Medellín. The 2027 running festival is on 4 April at Parque Norte. Choose the organiser’s 3K, 7K or 15K option. Race start times have not yet been verified; the kit-collection hours are separate from the race timetable.",
    "organiser": "MCM Operador de Eventos",
    "website": "https://mcmeventos.com/pages/cristal-run-fest",
    "featured": false,
    "source_url": "https://mcmeventos.com/pages/cristal-run-fest"
  },
  {
    "slug": "maraton-de-cali",
    "name": "Maratón de Cali",
    "sport": "Running",
    "country": "Colombia",
    "county": "Valle del Cauca",
    "city": "Cali",
    "area": "Cali — detailed 2027 start venue awaiting confirmation",
    "surface": "Road",
    "distances": [
      "Marathon",
      "15K"
    ],
    "summary": "A 42.195 km road marathon and 15K in Cali, Valle del Cauca.",
    "description": "A 42.195 km road marathon and 15K in Cali, Valle del Cauca. The 2027 marathon and 15K are listed for 25 April. The organiser also advertises shorter and children’s races, but their 2027 race days have not yet been confirmed here. Check the current organiser programme for start times, venue and registration availability.",
    "organiser": "Fundación Campeones del Futuro / Juancho Correlón",
    "website": "https://maratondecali.co/",
    "featured": false,
    "source_url": "https://maratondecali.co/"
  },
  {
    "slug": "21k-covenas",
    "name": "21K Coveñas",
    "sport": "Running",
    "country": "Colombia",
    "county": "Sucre",
    "city": "Coveñas",
    "area": "Coveñas, Sucre",
    "surface": "Road",
    "distances": [
      "21K",
      "10K"
    ],
    "summary": "A 10K and 21K road-running event in Coveñas, Sucre.",
    "description": "A 10K and 21K road-running event in Coveñas, Sucre. MCM Operador de Eventos lists the 2027 race for 30 May in Coveñas. Both 10K and 21K are offered. Race start times have not yet been verified; use the linked organiser and registration pages for the latest programme.",
    "organiser": "MCM Operador de Eventos",
    "website": "https://mcmeventos.com/pages/21k-covenas-2027",
    "featured": false,
    "source_url": "https://mcmeventos.com/pages/21k-covenas-2027"
  },
  {
    "slug": "media-maraton-regiones-colombia",
    "name": "Media Maratón Regiones Colombia",
    "sport": "Running",
    "country": "Colombia",
    "county": "Bolívar",
    "city": "Cartagena de Indias",
    "area": "Barrio Crespo, Avenida Santander, Cartagena de Indias",
    "surface": "Road",
    "distances": [
      "21K",
      "10K",
      "5K"
    ],
    "summary": "A 21K, competitive 10K and recreational 5K in Cartagena de Indias.",
    "description": "A 21K, competitive 10K and recreational 5K in Cartagena de Indias. The third edition is scheduled for 11 July 2027 in Cartagena de Indias. The organiser lists a 21K, competitive 10K and recreational 5K, with the event based in the Crespo area. Start times have not yet been verified.",
    "organiser": "Fundación Interregiones Colombia",
    "website": "https://www.mmregionescolombia.com/",
    "featured": false,
    "source_url": "https://www.mmregionescolombia.com/reglamento.html"
  },
  {
    "slug": "media-maraton-de-bogota-2026-ad1d6f7a",
    "name": "Media Maratón de Bogotá",
    "sport": "Running",
    "country": "Colombia",
    "county": "Bogotá D.C.",
    "city": "Bogotá",
    "area": "Carrera 60, western carriageway between Calle 63 and Calle 53; assembly at Parque Simón Bolívar events plaza",
    "surface": "Road",
    "distances": [
      "Half",
      "10K"
    ],
    "summary": "Bogotá’s half marathon and 10K, with separate starts beside Parque Simón Bolívar.",
    "description": "Bogotá’s half marathon and 10K, with separate starts beside Parque Simón Bolívar. The 2027 Media Maratón de Bogotá is on 25 July. Assembly is in the events plaza of Parque Simón Bolívar, with starts on Carrera 60 between Calle 63 and Calle 53. Half-marathon waves begin at 08:30 and continue at eight-minute intervals to 08:54. The 10K waves run from 10:00 to 10:24. Follow the wave printed on your race number.",
    "organiser": "Correcaminos de Colombia",
    "website": "https://www.mediamaratonbogota.com/",
    "featured": false,
    "source_url": "https://www.mediamaratonbogota.com/reglamento"
  },
  {
    "slug": "media-maraton-del-cafe-pereira",
    "name": "Media Maratón del Café",
    "sport": "Running",
    "country": "Colombia",
    "county": "Risaralda",
    "city": "Pereira",
    "area": "Villa Olímpica de Pereira",
    "surface": "Road",
    "distances": [
      "21K",
      "10K",
      "5K"
    ],
    "summary": "A 21K, 10K and 5K in Pereira, starting and finishing at Villa Olímpica.",
    "description": "A 21K, 10K and 5K in Pereira, starting and finishing at Villa Olímpica. The 2026 race is on 1 November, with 5K, 10K and 21K routes. The organiser identifies Villa Olímpica de Pereira as the start and finish. Per-distance start times have not yet been verified; check the final race instructions before travelling.",
    "organiser": "Media Maratón del Café",
    "website": "https://www.mediamaratoncafe.com.co/",
    "featured": false,
    "source_url": "https://www.mediamaratoncafe.com.co/"
  },
  {
    "slug": "media-maraton-de-la-frontera-ipiales",
    "name": "Media Maratón de la Frontera",
    "sport": "Running",
    "country": "Colombia",
    "county": "Nariño",
    "city": "Ipiales",
    "area": "Ipiales; exact start/finish details await final organiser guidance",
    "surface": "Road",
    "distances": [
      "21K",
      "10K",
      "5K"
    ],
    "summary": "A 21K, 10K and 5K road-running programme in Ipiales, Nariño.",
    "description": "A 21K, 10K and 5K road-running programme in Ipiales, Nariño. The 2026 edition is on 29 November in Ipiales. The official programme offers 5K, 10K and 21K. The organiser says the race timetable is still to be announced. Registration requests are reviewed by the organiser; submitting a request does not confirm a place.",
    "organiser": "Ordepi and Alcaldía Municipal de Ipiales",
    "website": "https://mediamaratonfrontera.com/",
    "featured": false,
    "source_url": "https://mediamaratonfrontera.com/"
  },
  {
    "slug": "salento-trail-challenge",
    "name": "Salento Trail Challenge",
    "sport": "Running",
    "country": "Colombia",
    "county": "Quindío",
    "city": "Salento",
    "area": "Parque principal de Salento",
    "surface": "Trail",
    "distances": [
      "5K",
      "10K",
      "21K",
      "42K"
    ],
    "summary": "Trail races of 5K, 10K, 21K and 42K from the main square in Salento, Quindío.",
    "description": "Trail races of 5K, 10K, 21K and 42K from the main square in Salento, Quindío. The 2026 edition is on 1 November. The current official route pages give 07:30 for all four distances from Salento’s main square. Some downloadable route files are awaiting updates, so check the final race instructions and current entry availability with the organiser.",
    "organiser": "Salento Trail Challenge",
    "website": "https://www.salentotrailchallenge.com/",
    "featured": false,
    "source_url": "https://www.salentotrailchallenge.com/"
  },
  {
    "slug": "pitalito-trail-tour",
    "name": "Pitalito Trail Tour",
    "sport": "Running",
    "country": "Colombia",
    "county": "Huila",
    "city": "Pitalito",
    "area": "Pitalito (precise start venue not established from official page)",
    "surface": "Trail",
    "distances": [
      "42K",
      "21K",
      "10K"
    ],
    "summary": "A 10K, 21K and 42K trail-running programme in Pitalito, Huila.",
    "description": "A 10K, 21K and 42K trail-running programme in Pitalito, Huila. The 2026 edition is on 8 November. The 42K starts at 05:00, with the 21K and 10K at 07:00 local time. The organiser lists registration as closed. Confirm the precise start location and final runner instructions with SABICANN.",
    "organiser": "SABICANN / Macizo Challenge",
    "website": "https://sabicann.com/pitalito-trail-tour/",
    "featured": false,
    "source_url": "https://sabicann.com/pitalito-trail-tour/"
  },
  {
    "slug": "columbia-trail-challenge",
    "name": "Columbia Trail Challenge",
    "sport": "Running",
    "country": "Colombia",
    "county": "Cundinamarca",
    "city": "Choachí",
    "area": "Parque principal de Choachí",
    "surface": "Trail",
    "distances": [
      "11K"
    ],
    "summary": "A mountain trail event from Choachí’s main square, including the 11 km route branded as 10K.",
    "description": "A mountain trail event from Choachí’s main square, including the 11 km route branded as 10K. The 2026 edition takes place on 15 November in Choachí, Cundinamarca. The shorter route starts at 09:00 and is advertised as 10K, with an official technical distance of 11 km. The organiser also advertises a longer route, but conflicting published distances are awaiting clarification.",
    "organiser": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
    "website": "https://columbiatrailchallenge.com/",
    "featured": false,
    "source_url": "https://columbiatrailchallenge.com/"
  },
  {
    "slug": "del-mar-a-la-cima",
    "name": "Del Mar a la Cima",
    "sport": "Running",
    "country": "Colombia",
    "county": "Magdalena",
    "city": "Santa Marta",
    "area": "Santuario Playa Bonita, Buritaca coastal area, Santa Marta",
    "surface": "Trail",
    "distances": [
      "110K",
      "81.2K",
      "42.4K",
      "25.5K",
      "14.5K"
    ],
    "summary": "A multi-distance trail and ultra weekend in the Santa Marta coastal area of Magdalena.",
    "description": "A multi-distance trail and ultra weekend in the Santa Marta coastal area of Magdalena. The 2026 races take place on 28–29 November from Santuario Playa Bonita in the Guachaca–Buritaca coastal area. The Saturday races are 110 km and 81.2 km, both starting at 07:00. On Sunday, the published routes are 42.4 km at 03:00, 25.5 km at 05:45 and 14.5 km at 06:00. These technical lengths differ from some marketed race names. Check the current technical sheet and mandatory equipment for your route.",
    "organiser": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
    "website": "https://delmaralacima.com/",
    "featured": false,
    "source_url": "https://delmaralacima.com/"
  },
  {
    "slug": "the-desert-marathon-colombia",
    "name": "The Desert Marathon",
    "sport": "Running",
    "country": "Colombia",
    "county": "La Guajira",
    "city": "Cabo de la Vela",
    "area": "Cabo de la Vela / La Guajira desert; kit collection in Riohacha",
    "surface": "Trail",
    "distances": [
      "100K",
      "76K",
      "50K"
    ],
    "summary": "Three-stage desert races of approximately 50, 76 and 100 km in La Guajira.",
    "description": "Three-stage desert races of approximately 50, 76 and 100 km in La Guajira. The 2027 race stages run from 28 to 30 May, with kit collection in Riohacha on 27 May. The 50, 76 and 100 km options each cover three stages in La Guajira, around Cabo de la Vela. These are approximate total trail distances, not a single-day road marathon. Registration is listed as sold out and the first-stage clock start has not yet been verified.",
    "organiser": "The Desert Marathon",
    "website": "https://tdmrace.com/",
    "featured": false,
    "source_url": "https://tdmrace.com/reglamento/"
  },
  {
    "slug": "chicamocha-canyon-race",
    "name": "Chicamocha Canyon Race",
    "sport": "Running",
    "country": "Colombia",
    "county": "Santander",
    "city": "San Gil",
    "area": "Centro Comercial El Puente, San Gil; 24K/46K start in Jordán",
    "surface": "Trail",
    "distances": [
      "167K",
      "81K",
      "46K",
      "24K"
    ],
    "summary": "Four trail and ultra routes of approximately 24, 46, 81 and 167 km through Santander.",
    "description": "Four trail and ultra routes of approximately 24, 46, 81 and 167 km through Santander. Chicamocha Canyon Race’s 15th edition runs from 4 to 7 June 2027, with competitive starts on 5 and 6 June. The 167 km route, marketed as 100 miles, starts in San Gil at 08:00 on Saturday. On Sunday, the 81 km route starts in San Gil at 06:00, the 46 km route in Jordán at 07:00, and the 24 km route in Jordán at 08:00. The 24 km finishes in Barichara; the other routes finish in San Gil. The labels maratón and media maratón refer to trail routes of 46 km and 24 km, not standard road distances.",
    "organiser": "Corporación Deporteza",
    "website": "https://chicamochacanyonrace.com/es",
    "featured": false,
    "source_url": "https://chicamochacanyonrace.com/es/la-carrera"
  }
];

export const colombiaRaceEditions: ColombiaEdition[] = [
  {
    "seriesSlug": "media-maraton-de-cucuta",
    "date": "2026-11-15",
    "distance": "21K",
    "distanceKm": 21.0,
    "status": "Open",
    "entryUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
    "source": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-cucuta",
        "providerName": "Fundación Corazón de Atleta",
        "entryUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:30"
  },
  {
    "seriesSlug": "media-maraton-de-cucuta",
    "date": "2026-11-15",
    "distance": "10K",
    "distanceKm": 10.0,
    "status": "Open",
    "entryUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
    "source": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-cucuta",
        "providerName": "Fundación Corazón de Atleta",
        "entryUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:15"
  },
  {
    "seriesSlug": "media-maraton-de-cucuta",
    "date": "2026-11-15",
    "distance": "5K",
    "distanceKm": 5.0,
    "status": "Open",
    "entryUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
    "source": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
    "notes": "Recreational 5K.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-cucuta",
        "providerName": "Fundación Corazón de Atleta",
        "entryUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://app.spikessystem.com/registro/media-maraton-de-cucuta",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:20"
  },
  {
    "seriesSlug": "media-maraton-uraba-corre",
    "date": "2026-11-22",
    "distance": "21K",
    "distanceKm": 21.0,
    "status": "Open",
    "entryUrl": "https://welcu.com/timesporturaba/urabacorre2026",
    "source": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf",
    "notes": "Race start from the edition-specific regulations; the general 05:30 event time is not this distance’s start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-uraba-corre",
        "providerName": "Comfenalco Antioquia, C.A.F. Vital Health and Corporación Run Urabá",
        "entryUrl": "https://welcu.com/timesporturaba/urabacorre2026",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:35"
  },
  {
    "seriesSlug": "media-maraton-uraba-corre",
    "date": "2026-11-22",
    "distance": "13K",
    "distanceKm": 13.0,
    "status": "Open",
    "entryUrl": "https://welcu.com/timesporturaba/urabacorre2026",
    "source": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf",
    "notes": "Race start from the edition-specific regulations; the general 05:30 event time is not this distance’s start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-uraba-corre",
        "providerName": "Comfenalco Antioquia, C.A.F. Vital Health and Corporación Run Urabá",
        "entryUrl": "https://welcu.com/timesporturaba/urabacorre2026",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:35"
  },
  {
    "seriesSlug": "media-maraton-uraba-corre",
    "date": "2026-11-22",
    "distance": "7.5K",
    "distanceKm": 7.5,
    "status": "Open",
    "entryUrl": "https://welcu.com/timesporturaba/urabacorre2026",
    "source": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf",
    "notes": "Race start from the edition-specific regulations; the general 05:30 event time is not this distance’s start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-uraba-corre",
        "providerName": "Comfenalco Antioquia, C.A.F. Vital Health and Corporación Run Urabá",
        "entryUrl": "https://welcu.com/timesporturaba/urabacorre2026",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://urabacorre.com.co/wp-content/uploads/2026/06/REGLAMENTO-MEDIA-MARATON-URABA-CORRE-2026-REGLAMENTO.pdf",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:50"
  },
  {
    "seriesSlug": "media-maraton-de-manizales",
    "date": "2026-11-29",
    "distance": "21K",
    "distanceKm": 21.0,
    "status": "Open",
    "entryUrl": "https://mediamaratonmanizales.com/",
    "source": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-manizales",
        "providerName": "Media Maratón de Manizales",
        "entryUrl": "https://mediamaratonmanizales.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:00"
  },
  {
    "seriesSlug": "media-maraton-de-manizales",
    "date": "2026-11-29",
    "distance": "10K",
    "distanceKm": 10.0,
    "status": "Open",
    "entryUrl": "https://mediamaratonmanizales.com/",
    "source": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-manizales",
        "providerName": "Media Maratón de Manizales",
        "entryUrl": "https://mediamaratonmanizales.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:30"
  },
  {
    "seriesSlug": "media-maraton-de-manizales",
    "date": "2026-11-29",
    "distance": "5K",
    "distanceKm": 5.0,
    "status": "Open",
    "entryUrl": "https://mediamaratonmanizales.com/",
    "source": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-manizales",
        "providerName": "Media Maratón de Manizales",
        "entryUrl": "https://mediamaratonmanizales.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratonmanizales.com/wp-content/uploads/2026/09/reglamentommm.pdf",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "08:30"
  },
  {
    "seriesSlug": "vchallenges-maraton-de-bogota",
    "date": "2026-11-29",
    "distance": "Marathon",
    "distanceKm": 42.195,
    "status": "Open",
    "entryUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges42k",
    "source": "https://www.vchallenges.co/2026/challenge/details/vchallenges42k",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-vchallenges-maraton-de-bogota",
        "providerName": "Ergofitness S.A.S.",
        "entryUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges42k",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges42k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:30"
  },
  {
    "seriesSlug": "vchallenges-maraton-de-bogota",
    "date": "2026-11-29",
    "distance": "32K",
    "distanceKm": 32,
    "status": "Open",
    "entryUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges32k",
    "source": "https://www.vchallenges.co/2026/challenge/details/vchallenges32k",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-vchallenges-maraton-de-bogota",
        "providerName": "Ergofitness S.A.S.",
        "entryUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges32k",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges32k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:30"
  },
  {
    "seriesSlug": "vchallenges-maraton-de-bogota",
    "date": "2026-11-29",
    "distance": "21K",
    "distanceKm": 21,
    "status": "Open",
    "entryUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges21k",
    "source": "https://www.vchallenges.co/2026/challenge/details/vchallenges21k",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-vchallenges-maraton-de-bogota",
        "providerName": "Ergofitness S.A.S.",
        "entryUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges21k",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.vchallenges.co/2026/challenge/details/vchallenges21k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:30"
  },
  {
    "seriesSlug": "media-maraton-del-mar-cartagena",
    "date": "2027-02-21",
    "distance": "Half",
    "distanceKm": 21,
    "status": "Open",
    "entryUrl": "https://mediamaratondelmar.com/",
    "source": "https://mediamaratondelmar.com/pages/informacion-2027",
    "notes": "Advertised as 21K. Use the organiser’s transport to access the Sociedad Portuaria start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "cartagena-half",
        "providerName": "MCM Operador de Eventos and MOTIVVA Sport Logistics",
        "entryUrl": "https://mediamaratondelmar.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratondelmar.com/pages/informacion-2027",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:20"
  },
  {
    "seriesSlug": "media-maraton-del-mar-cartagena",
    "date": "2027-02-21",
    "distance": "10K",
    "distanceKm": 10.0,
    "status": "Open",
    "entryUrl": "https://mediamaratondelmar.com/",
    "source": "https://mediamaratondelmar.com/pages/informacion-2027",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "cartagena-half",
        "providerName": "MCM Operador de Eventos and MOTIVVA Sport Logistics",
        "entryUrl": "https://mediamaratondelmar.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratondelmar.com/pages/informacion-2027",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:50"
  },
  {
    "seriesSlug": "cristal-run-fest",
    "date": "2027-04-04",
    "distance": "15K",
    "distanceKm": 15.0,
    "status": "Open",
    "entryUrl": "https://www.app.spikessystem.com/registro/carrera-cristal-runfest",
    "source": "https://mcmeventos.com/pages/cristal-run-fest",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-cristal-run-fest",
        "providerName": "MCM Operador de Eventos",
        "entryUrl": "https://www.app.spikessystem.com/registro/carrera-cristal-runfest",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mcmeventos.com/pages/cristal-run-fest",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "cristal-run-fest",
    "date": "2027-04-04",
    "distance": "7K",
    "distanceKm": 7.0,
    "status": "Open",
    "entryUrl": "https://www.app.spikessystem.com/registro/carrera-cristal-runfest",
    "source": "https://mcmeventos.com/pages/cristal-run-fest",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-cristal-run-fest",
        "providerName": "MCM Operador de Eventos",
        "entryUrl": "https://www.app.spikessystem.com/registro/carrera-cristal-runfest",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mcmeventos.com/pages/cristal-run-fest",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "cristal-run-fest",
    "date": "2027-04-04",
    "distance": "3K",
    "distanceKm": 3.0,
    "status": "Open",
    "entryUrl": "https://www.app.spikessystem.com/registro/carrera-cristal-runfest",
    "source": "https://mcmeventos.com/pages/cristal-run-fest",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-cristal-run-fest",
        "providerName": "MCM Operador de Eventos",
        "entryUrl": "https://www.app.spikessystem.com/registro/carrera-cristal-runfest",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mcmeventos.com/pages/cristal-run-fest",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "maraton-de-cali",
    "date": "2027-04-25",
    "distance": "Marathon",
    "distanceKm": 42.195,
    "status": "TBC",
    "entryUrl": "https://www.eventrid.com.co/l/fundacioncampeonesdelfuturo",
    "source": "https://maratondecali.co/",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "cali-marathon",
        "providerName": "Fundación Campeones del Futuro / Juancho Correlón",
        "entryUrl": "https://www.eventrid.com.co/l/fundacioncampeonesdelfuturo",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://maratondecali.co/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "maraton-de-cali",
    "date": "2027-04-25",
    "distance": "15K",
    "distanceKm": 15,
    "status": "TBC",
    "entryUrl": "https://www.eventrid.com.co/l/fundacioncampeonesdelfuturo",
    "source": "https://maratondecali.co/",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "cali-marathon",
        "providerName": "Fundación Campeones del Futuro / Juancho Correlón",
        "entryUrl": "https://www.eventrid.com.co/l/fundacioncampeonesdelfuturo",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://maratondecali.co/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "21k-covenas",
    "date": "2027-05-30",
    "distance": "21K",
    "distanceKm": 21.0,
    "status": "Open",
    "entryUrl": "https://www.app.spikessystem.com/registro/21k-covenas-2027",
    "source": "https://mcmeventos.com/pages/21k-covenas-2027",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-21k-covenas",
        "providerName": "MCM Operador de Eventos",
        "entryUrl": "https://www.app.spikessystem.com/registro/21k-covenas-2027",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mcmeventos.com/pages/21k-covenas-2027",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "21k-covenas",
    "date": "2027-05-30",
    "distance": "10K",
    "distanceKm": 10.0,
    "status": "Open",
    "entryUrl": "https://www.app.spikessystem.com/registro/21k-covenas-2027",
    "source": "https://mcmeventos.com/pages/21k-covenas-2027",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-21k-covenas",
        "providerName": "MCM Operador de Eventos",
        "entryUrl": "https://www.app.spikessystem.com/registro/21k-covenas-2027",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mcmeventos.com/pages/21k-covenas-2027",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-regiones-colombia",
    "date": "2027-07-11",
    "distance": "21K",
    "distanceKm": 21.0,
    "status": "Open",
    "entryUrl": "https://www.mmregionescolombia.com/",
    "source": "https://www.mmregionescolombia.com/reglamento.html",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-regiones-colombia",
        "providerName": "Fundación Interregiones Colombia",
        "entryUrl": "https://www.mmregionescolombia.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mmregionescolombia.com/reglamento.html",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-regiones-colombia",
    "date": "2027-07-11",
    "distance": "10K",
    "distanceKm": 10.0,
    "status": "Open",
    "entryUrl": "https://www.mmregionescolombia.com/",
    "source": "https://www.mmregionescolombia.com/reglamento.html",
    "notes": "Start time not yet verified for this edition.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-regiones-colombia",
        "providerName": "Fundación Interregiones Colombia",
        "entryUrl": "https://www.mmregionescolombia.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mmregionescolombia.com/reglamento.html",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-regiones-colombia",
    "date": "2027-07-11",
    "distance": "5K",
    "distanceKm": 5.0,
    "status": "Open",
    "entryUrl": "https://www.mmregionescolombia.com/",
    "source": "https://www.mmregionescolombia.com/reglamento.html",
    "notes": "Recreational 5K.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-regiones-colombia",
        "providerName": "Fundación Interregiones Colombia",
        "entryUrl": "https://www.mmregionescolombia.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mmregionescolombia.com/reglamento.html",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-de-bogota-2026-ad1d6f7a",
    "date": "2027-07-25",
    "distance": "Half",
    "distanceKm": 21.097,
    "status": "Open",
    "entryUrl": "https://www.mediamaratonbogota.com/",
    "source": "https://www.mediamaratonbogota.com/reglamento",
    "notes": "Half marathon / 21K. The official rules state 21,097 metres. First wave 08:30; later waves 08:38, 08:46 and 08:54. Follow your assigned wave.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-bogota-2026-ad1d6f7a",
        "providerName": "Correcaminos de Colombia",
        "entryUrl": "https://www.mediamaratonbogota.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mediamaratonbogota.com/reglamento",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "08:30"
  },
  {
    "seriesSlug": "media-maraton-de-bogota-2026-ad1d6f7a",
    "date": "2027-07-25",
    "distance": "10K",
    "distanceKm": 10,
    "status": "Open",
    "entryUrl": "https://www.mediamaratonbogota.com/",
    "source": "https://www.mediamaratonbogota.com/reglamento",
    "notes": "First wave 10:00; later waves 10:08, 10:16 and 10:24. Follow your assigned wave.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-bogota-2026-ad1d6f7a",
        "providerName": "Correcaminos de Colombia",
        "entryUrl": "https://www.mediamaratonbogota.com/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mediamaratonbogota.com/reglamento",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "10:00"
  },
  {
    "seriesSlug": "media-maraton-del-cafe-pereira",
    "date": "2026-11-01",
    "distance": "21K",
    "distanceKm": 21,
    "status": "TBC",
    "entryUrl": "https://www.eventrid.com.co/eventos/mediamaratoncafe/media-maraton-del-cafe-2026",
    "source": "https://www.mediamaratoncafe.com.co/",
    "notes": "Start time not yet verified. The entry index’s 05:00 is a general event time, not a confirmed distance start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-del-cafe-pereira",
        "providerName": "Media Maratón del Café",
        "entryUrl": "https://www.eventrid.com.co/eventos/mediamaratoncafe/media-maraton-del-cafe-2026",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mediamaratoncafe.com.co/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-del-cafe-pereira",
    "date": "2026-11-01",
    "distance": "10K",
    "distanceKm": 10,
    "status": "TBC",
    "entryUrl": "https://www.eventrid.com.co/eventos/mediamaratoncafe/media-maraton-del-cafe-2026",
    "source": "https://www.mediamaratoncafe.com.co/",
    "notes": "Start time not yet verified. The entry index’s 05:00 is a general event time, not a confirmed distance start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-del-cafe-pereira",
        "providerName": "Media Maratón del Café",
        "entryUrl": "https://www.eventrid.com.co/eventos/mediamaratoncafe/media-maraton-del-cafe-2026",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mediamaratoncafe.com.co/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-del-cafe-pereira",
    "date": "2026-11-01",
    "distance": "5K",
    "distanceKm": 5,
    "status": "TBC",
    "entryUrl": "https://www.eventrid.com.co/eventos/mediamaratoncafe/media-maraton-del-cafe-2026",
    "source": "https://www.mediamaratoncafe.com.co/",
    "notes": "Start time not yet verified. The entry index’s 05:00 is a general event time, not a confirmed distance start.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-del-cafe-pereira",
        "providerName": "Media Maratón del Café",
        "entryUrl": "https://www.eventrid.com.co/eventos/mediamaratoncafe/media-maraton-del-cafe-2026",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.mediamaratoncafe.com.co/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-de-la-frontera-ipiales",
    "date": "2026-11-29",
    "distance": "21K",
    "distanceKm": 21,
    "status": "TBC",
    "entryUrl": "https://mediamaratonfrontera.com/informacion/",
    "source": "https://mediamaratonfrontera.com/",
    "notes": "The organiser says the timetable is to be announced. Start time not yet verified.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-la-frontera-ipiales",
        "providerName": "Ordepi and Alcaldía Municipal de Ipiales",
        "entryUrl": "https://mediamaratonfrontera.com/informacion/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratonfrontera.com/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-de-la-frontera-ipiales",
    "date": "2026-11-29",
    "distance": "10K",
    "distanceKm": 10,
    "status": "TBC",
    "entryUrl": "https://mediamaratonfrontera.com/informacion/",
    "source": "https://mediamaratonfrontera.com/",
    "notes": "The organiser says the timetable is to be announced. Start time not yet verified.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-la-frontera-ipiales",
        "providerName": "Ordepi and Alcaldía Municipal de Ipiales",
        "entryUrl": "https://mediamaratonfrontera.com/informacion/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratonfrontera.com/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "media-maraton-de-la-frontera-ipiales",
    "date": "2026-11-29",
    "distance": "5K",
    "distanceKm": 5,
    "status": "TBC",
    "entryUrl": "https://mediamaratonfrontera.com/informacion/",
    "source": "https://mediamaratonfrontera.com/",
    "notes": "The organiser says the timetable is to be announced. Start time not yet verified.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-media-maraton-de-la-frontera-ipiales",
        "providerName": "Ordepi and Alcaldía Municipal de Ipiales",
        "entryUrl": "https://mediamaratonfrontera.com/informacion/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://mediamaratonfrontera.com/",
        "isVerified": true,
        "isPrimary": true
      }
    ]
  },
  {
    "seriesSlug": "salento-trail-challenge",
    "date": "2026-11-01",
    "distance": "5K",
    "distanceKm": 5,
    "status": "TBC",
    "entryUrl": "https://www.salentotrailchallenge.com/",
    "source": "https://www.salentotrailchallenge.com/5k",
    "notes": "07:30 is the current linked route-page start. Reconfirm the final 2026 instructions; route downloads are being updated.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-salento-trail-challenge",
        "providerName": "Salento Trail Challenge",
        "entryUrl": "https://www.salentotrailchallenge.com/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.salentotrailchallenge.com/5k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:30"
  },
  {
    "seriesSlug": "salento-trail-challenge",
    "date": "2026-11-01",
    "distance": "10K",
    "distanceKm": 10,
    "status": "TBC",
    "entryUrl": "https://www.salentotrailchallenge.com/",
    "source": "https://www.salentotrailchallenge.com/10k",
    "notes": "07:30 is the current linked route-page start. Reconfirm the final 2026 instructions; route downloads are being updated.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-salento-trail-challenge",
        "providerName": "Salento Trail Challenge",
        "entryUrl": "https://www.salentotrailchallenge.com/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.salentotrailchallenge.com/10k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:30"
  },
  {
    "seriesSlug": "salento-trail-challenge",
    "date": "2026-11-01",
    "distance": "21K",
    "distanceKm": 21,
    "status": "TBC",
    "entryUrl": "https://www.salentotrailchallenge.com/",
    "source": "https://www.salentotrailchallenge.com/21k",
    "notes": "07:30 is the current linked route-page start. Reconfirm the final 2026 instructions; route downloads are being updated.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-salento-trail-challenge",
        "providerName": "Salento Trail Challenge",
        "entryUrl": "https://www.salentotrailchallenge.com/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.salentotrailchallenge.com/21k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:30"
  },
  {
    "seriesSlug": "salento-trail-challenge",
    "date": "2026-11-01",
    "distance": "42K",
    "distanceKm": 42,
    "status": "TBC",
    "entryUrl": "https://www.salentotrailchallenge.com/",
    "source": "https://www.salentotrailchallenge.com/42k",
    "notes": "07:30 is the current linked route-page start. Reconfirm the final 2026 instructions; route downloads are being updated.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-salento-trail-challenge",
        "providerName": "Salento Trail Challenge",
        "entryUrl": "https://www.salentotrailchallenge.com/",
        "entryType": "official",
        "status": "unknown",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://www.salentotrailchallenge.com/42k",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:30"
  },
  {
    "seriesSlug": "pitalito-trail-tour",
    "date": "2026-11-08",
    "distance": "42K",
    "distanceKm": 42,
    "status": "Closed",
    "entryUrl": "https://sabicann.com/pitalito-trail-tour/",
    "source": "https://sabicann.com/pitalito-trail-tour/",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-pitalito-trail-tour",
        "providerName": "SABICANN / Macizo Challenge",
        "entryUrl": "https://sabicann.com/pitalito-trail-tour/",
        "entryType": "official",
        "status": "closed",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://sabicann.com/pitalito-trail-tour/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:00"
  },
  {
    "seriesSlug": "pitalito-trail-tour",
    "date": "2026-11-08",
    "distance": "21K",
    "distanceKm": 21,
    "status": "Closed",
    "entryUrl": "https://sabicann.com/pitalito-trail-tour/",
    "source": "https://sabicann.com/pitalito-trail-tour/",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-pitalito-trail-tour",
        "providerName": "SABICANN / Macizo Challenge",
        "entryUrl": "https://sabicann.com/pitalito-trail-tour/",
        "entryType": "official",
        "status": "closed",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://sabicann.com/pitalito-trail-tour/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:00"
  },
  {
    "seriesSlug": "pitalito-trail-tour",
    "date": "2026-11-08",
    "distance": "10K",
    "distanceKm": 10,
    "status": "Closed",
    "entryUrl": "https://sabicann.com/pitalito-trail-tour/",
    "source": "https://sabicann.com/pitalito-trail-tour/",
    "notes": "",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-pitalito-trail-tour",
        "providerName": "SABICANN / Macizo Challenge",
        "entryUrl": "https://sabicann.com/pitalito-trail-tour/",
        "entryType": "official",
        "status": "closed",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://sabicann.com/pitalito-trail-tour/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:00"
  },
  {
    "seriesSlug": "columbia-trail-challenge",
    "date": "2026-11-15",
    "distance": "11K",
    "distanceKm": 11,
    "status": "Open",
    "entryUrl": "https://columbiatrailchallenge.com/pago/",
    "source": "https://columbiatrailchallenge.com/rutasdecarrera/",
    "notes": "The organiser markets this as 10K and publishes a technical route distance of 11 km.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-columbia-trail-challenge",
        "providerName": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
        "entryUrl": "https://columbiatrailchallenge.com/pago/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://columbiatrailchallenge.com/rutasdecarrera/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "09:00"
  },
  {
    "seriesSlug": "del-mar-a-la-cima",
    "date": "2026-11-28",
    "distance": "110K",
    "distanceKm": 110,
    "status": "Open",
    "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
    "source": "https://delmaralacima.com/ficha-tecnica-110k/",
    "notes": "Organiser’s race name: 110K Teyuna. Published trail distance: approximately 110 km.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-del-mar-a-la-cima",
        "providerName": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
        "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://delmaralacima.com/ficha-tecnica-110k/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:00"
  },
  {
    "seriesSlug": "del-mar-a-la-cima",
    "date": "2026-11-28",
    "distance": "81.2K",
    "distanceKm": 81.2,
    "status": "Open",
    "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
    "source": "https://delmaralacima.com/ficha-tecnica-80k/",
    "notes": "Organiser’s race name: 80K. Published trail distance: approximately 81.2 km.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-del-mar-a-la-cima",
        "providerName": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
        "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://delmaralacima.com/ficha-tecnica-80k/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:00"
  },
  {
    "seriesSlug": "del-mar-a-la-cima",
    "date": "2026-11-29",
    "distance": "42.4K",
    "distanceKm": 42.4,
    "status": "Open",
    "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
    "source": "https://delmaralacima.com/ficha-tecnica-42k/",
    "notes": "Organiser’s race name: 42K. Published trail distance: approximately 42.4 km.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-del-mar-a-la-cima",
        "providerName": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
        "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://delmaralacima.com/ficha-tecnica-42k/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "03:00"
  },
  {
    "seriesSlug": "del-mar-a-la-cima",
    "date": "2026-11-29",
    "distance": "25.5K",
    "distanceKm": 25.5,
    "status": "Open",
    "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
    "source": "https://delmaralacima.com/ficha-tecnica-24k/",
    "notes": "Organiser’s race name: 24K. Published trail distance: approximately 25.5 km.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-del-mar-a-la-cima",
        "providerName": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
        "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://delmaralacima.com/ficha-tecnica-24k/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "05:45"
  },
  {
    "seriesSlug": "del-mar-a-la-cima",
    "date": "2026-11-29",
    "distance": "14.5K",
    "distanceKm": 14.5,
    "status": "Open",
    "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
    "source": "https://delmaralacima.com/ficha-tecnica-13k/",
    "notes": "Organiser’s race name: 13K. Published trail distance: approximately 14.5 km.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-del-mar-a-la-cima",
        "providerName": "Aire Libre y Aventura (Quintana Sosa y Compañía S.A.S.)",
        "entryUrl": "https://delmaralacima.com/boleteria-dmalc/",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://delmaralacima.com/ficha-tecnica-13k/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:00"
  },
  {
    "seriesSlug": "the-desert-marathon-colombia",
    "date": "2027-05-28",
    "distance": "100K",
    "distanceKm": 100,
    "status": "Closed",
    "entryUrl": "https://tdmrace.com/",
    "source": "https://tdmrace.com/reglamento/",
    "notes": "Total distance over three stages, 28–30 May 2027. Kit collection is on 27 May. First-stage start time not yet verified.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-the-desert-marathon-colombia",
        "providerName": "The Desert Marathon",
        "entryUrl": "https://tdmrace.com/",
        "entryType": "official",
        "status": "sold_out",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://tdmrace.com/reglamento/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "endDate": "2027-05-30",
    "endSourceUrl": "https://tdmrace.com/100-km/",
    "endCheckedAt": "2026-10-28"
  },
  {
    "seriesSlug": "the-desert-marathon-colombia",
    "date": "2027-05-28",
    "distance": "76K",
    "distanceKm": 76,
    "status": "Closed",
    "entryUrl": "https://tdmrace.com/",
    "source": "https://tdmrace.com/reglamento/",
    "notes": "Total distance over three stages, 28–30 May 2027. Kit collection is on 27 May. First-stage start time not yet verified.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-the-desert-marathon-colombia",
        "providerName": "The Desert Marathon",
        "entryUrl": "https://tdmrace.com/",
        "entryType": "official",
        "status": "sold_out",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://tdmrace.com/reglamento/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "endDate": "2027-05-30",
    "endSourceUrl": "https://tdmrace.com/100-km/",
    "endCheckedAt": "2026-10-28"
  },
  {
    "seriesSlug": "the-desert-marathon-colombia",
    "date": "2027-05-28",
    "distance": "50K",
    "distanceKm": 50,
    "status": "Closed",
    "entryUrl": "https://tdmrace.com/",
    "source": "https://tdmrace.com/reglamento/",
    "notes": "Total distance over three stages, 28–30 May 2027. Kit collection is on 27 May. First-stage start time not yet verified.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-the-desert-marathon-colombia",
        "providerName": "The Desert Marathon",
        "entryUrl": "https://tdmrace.com/",
        "entryType": "official",
        "status": "sold_out",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://tdmrace.com/reglamento/",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "endDate": "2027-05-30",
    "endSourceUrl": "https://tdmrace.com/100-km/",
    "endCheckedAt": "2026-10-28"
  },
  {
    "seriesSlug": "chicamocha-canyon-race",
    "date": "2027-06-05",
    "distance": "167K",
    "distanceKm": 167,
    "status": "Open",
    "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
    "source": "https://chicamochacanyonrace.com/es/cronograma",
    "notes": "Organiser’s race name: 100 miles. Published trail distance: approximately 167 km. Start: Centro Comercial El Puente, San Gil. Finish: Centro Comercial El Puente, San Gil.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-chicamocha-canyon-race",
        "providerName": "Corporación Deporteza",
        "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://chicamochacanyonrace.com/es/cronograma",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "08:00"
  },
  {
    "seriesSlug": "chicamocha-canyon-race",
    "date": "2027-06-06",
    "distance": "81K",
    "distanceKm": 81,
    "status": "Open",
    "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
    "source": "https://chicamochacanyonrace.com/es/cronograma",
    "notes": "Organiser’s race name: 80K. Published trail distance: approximately 81 km. Start: Centro Comercial El Puente, San Gil. Finish: Centro Comercial El Puente, San Gil.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-chicamocha-canyon-race",
        "providerName": "Corporación Deporteza",
        "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://chicamochacanyonrace.com/es/cronograma",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "06:00"
  },
  {
    "seriesSlug": "chicamocha-canyon-race",
    "date": "2027-06-06",
    "distance": "46K",
    "distanceKm": 46,
    "status": "Open",
    "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
    "source": "https://chicamochacanyonrace.com/es/cronograma",
    "notes": "Organiser’s race name: Maratón 46K. Published trail distance: approximately 46 km. Start: Jordán. Finish: Centro Comercial El Puente, San Gil.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-chicamocha-canyon-race",
        "providerName": "Corporación Deporteza",
        "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://chicamochacanyonrace.com/es/cronograma",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "07:00"
  },
  {
    "seriesSlug": "chicamocha-canyon-race",
    "date": "2027-06-06",
    "distance": "24K",
    "distanceKm": 24,
    "status": "Open",
    "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
    "source": "https://chicamochacanyonrace.com/es/cronograma",
    "notes": "Organiser’s race name: Media maratón 24K. Published trail distance: approximately 24 km. Start: Jordán. Finish: Parque principal, Barichara.",
    "publishAllDistances": true,
    "entryOptions": [
      {
        "providerCode": "colombia-chicamocha-canyon-race",
        "providerName": "Corporación Deporteza",
        "entryUrl": "https://chicamochacanyonrace.com/es/inscripciones",
        "entryType": "official",
        "status": "open",
        "checkedAt": "2026-10-28",
        "sourceUrl": "https://chicamochacanyonrace.com/es/cronograma",
        "isVerified": true,
        "isPrimary": true
      }
    ],
    "startTime": "08:00"
  }
];

export const colombiaSeriesOverrides: Record<string, Series> = Object.fromEntries(colombiaRaceSeries.map((event) => [event.slug, event]));

/** Frozen public metadata read before review; publication rejects concurrent changes. */
export const colombiaExistingEventBaselines = {
  "maraton-de-cali": {
    "id": 3686622,
    "slug": "maraton-de-cali",
    "name": "Maratón de Cali",
    "sport": "Running",
    "country": "Colombia",
    "county": "Valle del Cauca",
    "city": "Cali",
    "area": "Cali",
    "surface": "Road",
    "summary": "AIMS-listed Cali World Athletics Label marathon.",
    "description": "Maratón de Cali 2027 is Sunday 25 April 2027.",
    "organiser": "Maratón de Cali",
    "website": "https://maratondecali.co/en/the-race/"
  },
  "media-maraton-del-mar-cartagena": {
    "id": 3783833,
    "slug": "media-maraton-del-mar-cartagena",
    "name": "Media Maratón del Mar Sistecrédito",
    "sport": "Running",
    "country": "Colombia",
    "county": "Bolívar",
    "city": "Cartagena",
    "area": "Cartagena de Indias",
    "surface": "Road",
    "summary": "Cartagena February half marathon.",
    "description": "The 2027 Media Maratón del Mar is Sunday 21 February 2027.",
    "organiser": "Media Maratón del Mar",
    "website": "https://mediamaratondelmar.com/pages/informacion-2027"
  },
  "media-maraton-de-bogota-2026-ad1d6f7a": {
    "id": 4380500,
    "slug": "media-maraton-de-bogota-2026-ad1d6f7a",
    "name": "Media Maraton de Bogota",
    "sport": "Running",
    "country": "Colombia",
    "county": "",
    "city": "Bogotá",
    "area": "",
    "surface": "Road",
    "summary": "Media Maraton de Bogota",
    "description": "Media Maraton de Bogota",
    "organiser": "",
    "website": ""
  }
};
