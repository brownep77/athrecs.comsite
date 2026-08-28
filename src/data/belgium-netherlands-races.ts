import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-27";

type Country = "Belgium" | "Netherlands";
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
  country: Country;
  city: string;
  region: string;
  surface: "Road" | "Trail";
  organiser: string;
  website: string;
  source: string;
  occurrences: Occurrence[];
};

const d = (label: string, km: number, time?: string): DistanceSpec => ({ label, km, time });
const K3 = d("3K", 3);
const K4 = d("4K", 4);
const K42 = d("4.2K", 4.2);
const K5 = d("5K", 5);
const K6 = d("6K", 6);
const K7 = d("7K", 7);
const K75 = d("7.5K", 7.5);
const K8 = d("8K", 8);
const K10 = d("10K", 10);
const K105 = d("10.5K", 10.5);
const QUARTER = d("Quarter Marathon", 10.54875);
const K12 = d("12K", 12);
const K15 = d("15K", 15);
const TEN_MILES = d("10 Miles", 16.09344);
const HALF = d("Half", 21.0975);
const MARATHON = d("Marathon", 42.195);

function race(
  country: Country,
  slug: string,
  name: string,
  city: string,
  region: string,
  surface: "Road" | "Trail",
  website: string,
  occurrences: Occurrence[],
  organiser = name,
  source = website,
): RaceConfig {
  return { country, slug, name, city, region, surface, organiser, website, source, occurrences };
}

const raceConfigs: RaceConfig[] = [
  // Belgium — organiser, municipality and official event pages in Dutch, French and English.
  race(
    "Belgium",
    "bashirs-run-gentbrugge",
    "Runners' lab Bashir's Run",
    "Gentbrugge",
    "East Flanders",
    "Road",
    "https://www.sportaround.be/activiteiten/runners%27-lab-bashir%27s-run",
    [{ date: "2026-03-08", distances: [K5, K10, HALF] }],
    "Sportaround",
  ),
  race(
    "Belgium",
    "sofico-gent-marathon",
    "Sofico Gent Marathon",
    "Ghent",
    "East Flanders",
    "Road",
    "https://soficogentmarathon.com/en/",
    [
      {
        date: "2026-03-29",
        distances: [HALF, MARATHON],
        source:
          "https://soficogentmarathon.com/en/record-number-of-marathon-runners-including-3500-ghent-residents-at-the-start/",
      },
    ],
    "Sofico Gent Marathon",
  ),
  race(
    "Belgium",
    "energyvision-cretes-de-spa",
    "EnergyVision Crêtes de Spa",
    "Spa",
    "Liège",
    "Trail",
    "https://runningtour.be/nl/kalender/",
    [{ date: "2026-03-28", distances: [K5, K10, d("21K", 21)] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "baloise-antwerp-10-miles",
    "Baloise Antwerp 10 Miles",
    "Antwerp",
    "Antwerp",
    "Road",
    "https://antwerp10miles.be/en/",
    [
      { date: "2026-04-25", distances: [d("5 Miles", 8.04672)] },
      { date: "2026-04-26", distances: [TEN_MILES] },
    ],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "leuven-marathon",
    "Leuven Marathon",
    "Leuven",
    "Flemish Brabant",
    "Road",
    "https://leuvenmarathon.com/en/homepage/",
    [
      { date: "2026-04-19", distances: [K10, HALF, MARATHON] },
      { date: "2027-04-11", distances: [K10, HALF, MARATHON] },
    ],
  ),
  race(
    "Belgium",
    "energyvision-knokke-run",
    "EnergyVision Knokke Run",
    "Knokke-Heist",
    "West Flanders",
    "Road",
    "https://www.knokke-heist.be/nieuws/2026-do-30-apr-enorme-populariteit-halve-marathon-stuwt-energyvision-knokke-run-naar",
    [{ date: "2026-05-01", distances: [K6, K10, HALF] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "belgian-front-memorial-trail",
    "Belgian Front Memorial Trail",
    "Ypres",
    "West Flanders",
    "Trail",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-05-02", distances: [K5, HALF, d("100.9K", 100.9)] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "great-breweries-marathon",
    "Great Breweries Marathon",
    "Puurs-Sint-Amands",
    "Antwerp",
    "Road",
    "https://greatbreweriesmarathon.be/en/practical-info-run/",
    [{ date: "2026-05-03", distances: [d("17K", 17), d("25K", 25), MARATHON] }],
  ),
  race(
    "Belgium",
    "energyvision-genk-loopt",
    "EnergyVision Genk Loopt",
    "Genk",
    "Limburg",
    "Road",
    "https://genkloopt.be/en/",
    [{ date: "2026-05-03", distances: [K3, K5, K10, TEN_MILES] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "stroomloop",
    "Stroomloop",
    "Oudenaarde",
    "East Flanders",
    "Trail",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-05-09", distances: [K7, d("14K", 14), d("21K", 21)] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "dwars-door-brugge",
    "EnergyVision Dwars door Brugge",
    "Bruges",
    "West Flanders",
    "Road",
    "https://www.visitbruges.be/en/plan-your-visit/mobility/energyvision-dwars-door-brugge-2026-accessibility",
    [{ date: "2026-05-10", distances: [K5, K15] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "trek-stadsloop-gent",
    "TREK Stadsloop Gent",
    "Ghent",
    "East Flanders",
    "Road",
    "https://runningtour.be/nl/kalender/",
    [{ date: "2026-05-17", distances: [K5, K10] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "anita-great-half-mechelen",
    "Anita Great Half Mechelen",
    "Mechelen",
    "Antwerp",
    "Road",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-05-31", distances: [HALF] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "oleus-flandrien-trail",
    "OLEUS Flandrien Trail",
    "Kluisbergen",
    "East Flanders",
    "Trail",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-06-28", distances: [d("17.5K", 17.5), d("22.5K", 22.5), d("43K", 43)] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "bosland-run",
    "Bosland Run",
    "Lommel",
    "Limburg",
    "Trail",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-08-30", distances: [K105, d("25K", 25), d("32K", 32), d("50K", 50)] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "ecotrail-brussels",
    "EcoTrail Brussels",
    "Brussels",
    "Brussels-Capital",
    "Trail",
    "https://www.zatopekmagazine.com/en/europatrail/",
    [{ date: "2026-09-05", distances: [K5, K10, d("24K", 24), d("46K", 46), d("80K", 80)] }],
  ),
  race(
    "Belgium",
    "wa-deloitte-fast-fun-5-10km-trakks-lbfa-road-tour-7244627",
    "Deloitte Fast & Fun 5&10km",
    "Braine-le-Château",
    "Walloon Brabant",
    "Road",
    "https://worldathletics.org/competition/calendar-results/results/7244627",
    [{ date: "2026-09-06", distances: [K5, K10] }],
    "Deloitte Fast & Fun",
  ),
  race(
    "Belgium",
    "balloonloop",
    "Balloonloop",
    "Sint-Niklaas",
    "East Flanders",
    "Road",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-09-06", distances: [K5, K10] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "semi-marathon-de-binche",
    "Semi-Marathon de Binche",
    "Binche",
    "Hainaut",
    "Road",
    "https://www.semimarathonbinche.be/component/content/category/11-courses.html",
    [{ date: "2026-09-12", distances: [K6, d("11.4K", 11.4), HALF] }],
  ),
  race(
    "Belgium",
    "qbuild-arlon-half-marathon",
    "Qbuild Arlon Semi-Marathon",
    "Arlon",
    "Luxembourg",
    "Road",
    "https://arlonmarathon.be/infos/",
    [{ date: "2026-09-13", distances: [K10, HALF] }],
    "Qbuild Arlon Semi-Marathon",
  ),
  race(
    "Belgium",
    "energyvision-jogging-ville-de-namur",
    "EnergyVision Jogging Ville de Namur",
    "Namur",
    "Namur",
    "Road",
    "https://runningtour.be/nl/kalender/",
    [{ date: "2026-09-13", distances: [K5, K10] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "walls-great-half-antwerpen",
    "WALLS Great Half Antwerpen",
    "Antwerp",
    "Antwerp",
    "Road",
    "https://www.keeponrunning.be/en/events/",
    [{ date: "2026-09-20", distances: [HALF] }],
    "Keep on Running",
  ),
  race(
    "Belgium",
    "nieuwpoort-marathon",
    "Nieuwpoort Marathon",
    "Nieuwpoort",
    "West Flanders",
    "Road",
    "https://www.nieuwpoortmarathon.com/faq/",
    [{ date: "2026-09-20", distances: [K5, K10, HALF, MARATHON] }],
  ),
  race(
    "Belgium",
    "energyvision-semi-marathon-de-nivelles",
    "EnergyVision Semi-Marathon de Nivelles",
    "Nivelles",
    "Walloon Brabant",
    "Road",
    "https://runningtour.be/nl/kalender/",
    [{ date: "2026-09-20", distances: [K5, K12, HALF] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "energyvision-dwars-door-mechelen",
    "EnergyVision Dwars door Mechelen",
    "Mechelen",
    "Antwerp",
    "Road",
    "https://runningtour.be/nl/kalender/",
    [{ date: "2026-09-27", distances: [K5, K10] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "mons-half-marathon",
    "Mons Half Marathon",
    "Mons",
    "Hainaut",
    "Road",
    "https://visitwallonia.com/en-gb/content/half-marathon-mons",
    [{ date: "2026-10-04", distances: [K5, K10, HALF] }],
  ),
  race(
    "Belgium",
    "bruges-marathon",
    "Athora Great Bruges Marathon",
    "Bruges",
    "West Flanders",
    "Road",
    "https://athorabrugesmarathon.com/en/practical-info/",
    [
      {
        date: "2026-10-11",
        distances: [HALF, MARATHON],
        note: "The organiser's 8K is a family walk and is intentionally excluded from the running calendar.",
      },
    ],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "energyvision-dwars-door-hasselt",
    "EnergyVision Dwars door Hasselt",
    "Hasselt",
    "Limburg",
    "Road",
    "https://runningtour.be/nl/kalender/",
    [{ date: "2026-10-11", distances: [K3, K5, K10, K15, HALF] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "trek-antwerp-marathon",
    "TREK Antwerp Marathon",
    "Antwerp",
    "Antwerp",
    "Road",
    "https://antwerpmarathon.com/en/homepage/",
    [{ date: "2026-10-18", distances: [K10, HALF, MARATHON] }],
    "Golazo Sports",
  ),
  race(
    "Belgium",
    "gtlc-winter",
    "Grand Trail des Lacs & Châteaux Winter",
    "Ovifat",
    "Liège",
    "Trail",
    "https://grandtrail.be/en/winter/programme/",
    [
      { date: "2026-11-07", distances: [d("22K", 22), d("65K", 65), d("80K", 80)] },
      { date: "2026-11-08", distances: [d("16K", 16), d("36K", 36), d("50K", 50)] },
    ],
    "Grand Trail des Lacs & Châteaux",
  ),
  race(
    "Belgium",
    "trail-knokke-heist",
    "Trail Knokke-Heist",
    "Knokke-Heist",
    "West Flanders",
    "Trail",
    "https://trailknokkeheist.be/",
    [{ date: "2026-11-22", distances: [K8, d("17K", 17), d("25K", 25)] }],
  ),
  race(
    "Belgium",
    "gtlc-summer",
    "Grand Trail des Lacs & Châteaux Summer",
    "Ovifat",
    "Liège",
    "Trail",
    "https://grandtrail.be/en/summer/la-course/",
    [
      { date: "2027-05-15", distances: [d("8.59K", 8.59), d("22K", 22), d("87K", 87)] },
      { date: "2027-05-16", distances: [d("47K", 47)] },
    ],
    "Grand Trail des Lacs & Châteaux",
  ),
  race(
    "Belgium",
    "belgian-road-10k-torhout",
    "Belgian Road 10K Championships Torhout",
    "Torhout",
    "West Flanders",
    "Road",
    "https://www.atletiek.be/competitie/atleten/buiten-stadion",
    [{ date: "2026-09-18", distances: [K10] }],
    "Atletiek Vlaanderen / Nacht van Vlaanderen",
  ),

  // Netherlands — public adult races only; walking and youth-only formats are excluded.
  race(
    "Netherlands",
    "20-van-alphen",
    "20 van Alphen",
    "Alphen aan den Rijn",
    "South Holland",
    "Road",
    "https://20vanalphen.nl/parcours/",
    [{ date: "2026-03-01", distances: [K5, K10, HALF] }],
  ),
  race(
    "Netherlands",
    "schoorl-run",
    "Groet uit Schoorl Run",
    "Schoorl",
    "North Holland",
    "Road",
    "https://www.groetuitschoorlrun.nl/english",
    [
      {
        date: "2026-02-08",
        distances: [K10, HALF, d("30K", 30)],
        source:
          "https://www.lechampion.nl/individuele-startbewijzen-groet-uit-schoorl-run-volledig-uitverkocht",
      },
      { date: "2027-02-14", distances: [K10, HALF, d("30K", 30)] },
    ],
    "Le Champion",
  ),
  race(
    "Netherlands",
    "nn-cpc-loop-den-haag",
    "NN CPC Loop Den Haag",
    "The Hague",
    "South Holland",
    "Road",
    "https://nncpcloopdenhaag.nl/en/",
    [
      {
        date: "2026-03-15",
        distances: [K5, K10, HALF],
        source: "https://nncpcloopdenhaag.nl/en/register/10-km-loop/",
      },
      { date: "2027-03-14", distances: [K5, K10, HALF] },
    ],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "stevensloop",
    "Alfa Laval Stevensloop",
    "Nijmegen",
    "Gelderland",
    "Road",
    "https://www.stevensloop.nl/",
    [
      { date: "2026-03-15", distances: [K5, K10, HALF] },
      {
        date: "2027-03-21",
        distances: [K5, K10, HALF],
        source: "https://www.stevensloop.nl/deelnemers/stevensloop/gratis-bus",
      },
    ],
    "Stichting Zevenheuvelenloop",
  ),
  race(
    "Netherlands",
    "arrow-venloop",
    "Arrow Venloop",
    "Venlo",
    "Limburg",
    "Road",
    "https://venloop.nl/en/running/arrow-venloop/",
    [
      {
        date: "2026-03-29",
        distances: [K5, K10, HALF],
        source: "https://venloop.nl/en/10-km-arrow-venloop-already-sold-out-in-january/",
      },
      {
        date: "2027-03-21",
        distances: [K5, K10, HALF],
        status: "Closed",
        source: "https://venloop.nl/en/running/arrow-venloop/distances/",
      },
    ],
    "Stichting Venloop",
  ),
  race(
    "Netherlands",
    "zandvoort-circuit-run",
    "Zandvoort Circuit Run",
    "Zandvoort",
    "North Holland",
    "Road",
    "https://www.zandvoortcircuitrun.nl/english",
    [
      {
        date: "2026-03-29",
        distances: [K4, K12, TEN_MILES],
        source: "https://www.zandvoortcircuitrun.nl/programma",
      },
      { date: "2027-03-21", distances: [K4, K12, TEN_MILES] },
    ],
    "Le Champion",
  ),
  race(
    "Netherlands",
    "enschede-marathon",
    "Enschede Marathon",
    "Enschede",
    "Overijssel",
    "Road",
    "https://www.enschedemarathon.nl/en/",
    [
      { date: "2026-04-12", distances: [K5, K10, HALF, MARATHON] },
      { date: "2027-04-11", distances: [K5, K10, HALF, MARATHON] },
    ],
  ),
  race(
    "Netherlands",
    "rotterdam-marathon",
    "NN Marathon Rotterdam",
    "Rotterdam",
    "South Holland",
    "Road",
    "https://nnmarathonrotterdam.nl/en/",
    [
      {
        date: "2026-04-11",
        distances: [K42],
        source: "https://nnmarathonrotterdam.nl/en/register/",
      },
      {
        date: "2026-04-12",
        distances: [K10, MARATHON],
        source: "https://nnmarathonrotterdam.nl/en/register/nn-marathon-rotterdam/",
      },
      { date: "2027-04-10", distances: [K42] },
      { date: "2027-04-11", distances: [K10, MARATHON] },
    ],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "kika-hilversum-city-run",
    "KiKa Hilversum City Run",
    "Hilversum",
    "North Holland",
    "Road",
    "https://www.kikahilversumcityrun.nl/english",
    [{ date: "2026-04-12", distances: [K5, K10] }],
  ),
  race(
    "Netherlands",
    "asml-half-veldhoven",
    "ASML Half Veldhoven",
    "Veldhoven",
    "North Brabant",
    "Road",
    "https://asmlhalvevanveldhoven.nl/en/event-info/",
    [{ date: "2026-04-19", distances: [K5, K10, HALF] }],
  ),
  race(
    "Netherlands",
    "alkmaar-city-run",
    "Alkmaar City Run",
    "Alkmaar",
    "North Holland",
    "Road",
    "https://www.alkmaarcityrun.nl/english",
    [{ date: "2026-05-13", distances: [K5, K10] }],
    "Le Champion",
  ),
  race(
    "Netherlands",
    "marathon-amersfoort",
    "Marathon Amersfoort",
    "Amersfoort",
    "Utrecht",
    "Road",
    "https://marathonamersfoort.nl/programma/",
    [
      {
        date: "2026-05-31",
        distances: [K5, K10, d("21K", 21)],
        note: "The separate 30 May training marathon is not published as a race fixture.",
      },
    ],
  ),
  race(
    "Netherlands",
    "hipro-utrecht-marathon",
    "HiPRO Utrecht Marathon",
    "Utrecht",
    "Utrecht",
    "Road",
    "https://utrechtmarathon.com/en/event-info/",
    [{ date: "2026-05-31", distances: [K10, HALF, MARATHON] }],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "vestingloop-den-bosch",
    "Vestingloop Den Bosch",
    "'s-Hertogenbosch",
    "North Brabant",
    "Road",
    "https://vestingloop.nl/event-info/",
    [{ date: "2026-05-31", distances: [K5, K10, K15] }],
  ),
  race(
    "Netherlands",
    "maastrichts-mooiste",
    "Maastrichts Mooiste",
    "Maastricht",
    "Limburg",
    "Road",
    "https://www.maastrichtbereikbaar.nl/en/agenda/maastrichts-mooiste",
    [{ date: "2026-06-07", distances: [K5, K10, TEN_MILES] }],
  ),
  race(
    "Netherlands",
    "almere-weerwater-run",
    "Almere Weerwater Run",
    "Almere",
    "Flevoland",
    "Road",
    "https://almereweerwaterrun.nl/",
    [{ date: "2026-06-14", distances: [K5, K10, K15] }],
  ),
  race(
    "Netherlands",
    "wa-dam-tot-damloop-7238027",
    "NN Dam tot Damloop",
    "Amsterdam",
    "North Holland",
    "Road",
    "https://www.nndamloop.com/",
    [
      { date: "2026-09-19", distances: [d("5 Miles", 8.04672)] },
      { date: "2026-09-20", distances: [TEN_MILES] },
    ],
    "Le Champion",
  ),
  race(
    "Netherlands",
    "halve-van-haarlem",
    "Halve van Haarlem",
    "Haarlem",
    "North Holland",
    "Road",
    "https://www.halvevanhaarlem.nl/",
    [{ date: "2026-09-27", distances: [K5, K10, HALF] }],
  ),
  race(
    "Netherlands",
    "tilburg-ten-miles",
    "Tilburg Ten Miles",
    "Tilburg",
    "North Brabant",
    "Road",
    "https://tilburgtenmiles.nl/event-info/",
    [{ date: "2026-09-27", distances: [K5, K10, TEN_MILES] }],
  ),
  race(
    "Netherlands",
    "kustmarathon-zeeland",
    "Kustmarathon Zeeland",
    "Zoutelande",
    "Zeeland",
    "Trail",
    "https://www.kustmarathon.nl/wedstrijd/kustmarathon/",
    [
      { date: "2026-10-02", distances: [K5, K10, d("11K", 11), d("16K", 16)] },
      { date: "2026-10-03", distances: [MARATHON] },
    ],
  ),
  race(
    "Netherlands",
    "singelloop-utrecht",
    "Singelloop Utrecht",
    "Utrecht",
    "Utrecht",
    "Road",
    "https://singellooputrecht.nl/",
    [
      {
        date: "2026-10-04",
        distances: [K5, K10],
        note: "Only the organiser's timed 5K and 10K are published; no half marathon is advertised.",
      },
    ],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "menzis-4-mijl-groningen",
    "Menzis 4 Mijl van Groningen",
    "Groningen",
    "Groningen",
    "Road",
    "https://4mijl.nl/event-info/",
    [{ date: "2026-10-11", distances: [d("4 Miles", 6.437376)] }],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "eindhoven-marathon",
    "ASML Marathon Eindhoven",
    "Eindhoven",
    "North Brabant",
    "Road",
    "https://asmlmarathoneindhoven.nl/en/event-info/",
    [
      { date: "2026-10-10", distances: [K5] },
      { date: "2026-10-11", distances: [QUARTER, HALF, MARATHON] },
    ],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "amsterdam-marathon",
    "TCS Amsterdam Marathon",
    "Amsterdam",
    "North Holland",
    "Road",
    "https://www.tcsamsterdammarathon.eu/",
    [
      {
        date: "2026-10-17",
        distances: [K75],
        source: "https://www.tcsamsterdammarathon.eu/program",
      },
      {
        date: "2026-10-18",
        distances: [HALF, MARATHON],
        source: "https://www.tcsamsterdammarathon.eu/frequently-asked-questions",
      },
    ],
    "Le Champion",
  ),
  race(
    "Netherlands",
    "berenloop-terschelling",
    "Berenloop Terschelling",
    "West-Terschelling",
    "Friesland",
    "Road",
    "https://terschelling.org/en/event/453/berenloop-marathon.html",
    [
      { date: "2026-10-31", distances: [K5, K10] },
      { date: "2026-11-01", distances: [HALF, MARATHON] },
    ],
  ),
  race(
    "Netherlands",
    "wa-marathon-the-hague-7243223",
    "Marathon The Hague",
    "The Hague",
    "South Holland",
    "Road",
    "https://nnmarathonthehague.nl/en/",
    [{ date: "2026-11-01", distances: [K5, K10, MARATHON] }],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "zevenheuvelenloop",
    "Zevenheuvelenloop",
    "Nijmegen",
    "Gelderland",
    "Road",
    "https://zevenheuvelenloop.nl/",
    [
      { date: "2026-11-14", distances: [K7] },
      { date: "2026-11-15", distances: [K15] },
    ],
    "Stichting Zevenheuvelenloop",
  ),
  race(
    "Netherlands",
    "spijkenisse-spark-marathon",
    "Spijkenisse SPARK Marathon",
    "Spijkenisse",
    "South Holland",
    "Road",
    "https://www.hardlopen.nl/evenementen/44206-spijkenisse-spark-marathon/",
    [{ date: "2026-11-29", distances: [K5, K10, HALF, MARATHON] }],
    "Atletiekvereniging SPARK",
  ),
  race(
    "Netherlands",
    "dsw-bruggenloop-rotterdam",
    "DSW Bruggenloop Rotterdam",
    "Rotterdam",
    "South Holland",
    "Road",
    "https://bruggenloop.nl/",
    [{ date: "2026-12-13", distances: [K15] }],
    "Golazo Sports",
  ),
  race(
    "Netherlands",
    "egmond-half-marathon",
    "NN Egmond Half Marathon",
    "Egmond aan Zee",
    "North Holland",
    "Road",
    "https://www.lechampion.nl/egmond-evenementen",
    [{ date: "2027-01-10", distances: [K105, HALF] }],
    "Le Champion",
  ),
  race(
    "Netherlands",
    "lentemarathon-amstelveen",
    "KPMG Lentemarathon Amstelveen",
    "Amstelveen",
    "North Holland",
    "Road",
    "https://www.lentemarathon.nl/en/home/",
    [
      { date: "2027-03-20", distances: [K5] },
      { date: "2027-03-21", distances: [K10, HALF, MARATHON] },
    ],
  ),
  race(
    "Netherlands",
    "amgen-singelloop-breda",
    "Amgen Singelloop Breda",
    "Breda",
    "North Brabant",
    "Road",
    "https://www.amgensingelloopbreda.nl/",
    [
      {
        date: "2027-04-04",
        distances: [K5, K10, HALF],
        source: "https://www.amgensingelloopbreda.nl/en/sign-up",
      },
    ],
    "Le Champion",
  ),
];

function uniqueDistances(config: RaceConfig): string[] {
  const exact = config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => distance.label),
  );
  if (
    config.occurrences.some((occurrence) => occurrence.distances.some((item) => item.km > 42.195))
  ) {
    exact.push("Ultra");
  }
  return [...new Set(exact)];
}

export const belgiumNetherlandsRaceSeries: Series[] = raceConfigs.map((config) => ({
  slug: config.slug,
  name: config.name,
  sport: "Running",
  country: config.country,
  county: config.region,
  city: config.city,
  area: `${config.city} ${config.surface.toLowerCase()} courses`,
  surface: config.surface,
  distances: uniqueDistances(config),
  summary: `${config.name} in ${config.city}, with every verified timed public running distance published separately.`,
  description: `${config.name} is listed from organiser, municipality or governing-body evidence checked on ${CHECKED_AT}. AthRecs publishes only explicitly advertised dates and distances.`,
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

export const belgiumNetherlandsRaceEditions: Edition[] = raceConfigs.flatMap((config) =>
  config.occurrences.flatMap((occurrence) =>
    occurrence.distances.map((distance) => {
      const source = occurrence.source ?? config.source;
      const isFinished = occurrence.date < CHECKED_AT;
      const status = isFinished ? "Finished" : (occurrence.status ?? "Open");
      const entryUrl = occurrence.entryUrl ?? config.website;
      return {
        seriesSlug: config.slug,
        date: occurrence.date,
        distance: distance.label,
        distanceKm: distance.km,
        status,
        ...(!isFinished && status === "Open"
          ? { entryUrl, entryOptions: [entryOption(config, entryUrl)] }
          : {}),
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
