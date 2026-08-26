import type { Edition, EntryOptionSeed, Series } from "./types";

const CHECKED_AT = "2026-08-26";

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
  country: "France" | "Spain" | "Portugal";
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
const K5 = d("5K", 5);
const K7 = d("7K", 7);
const K8 = d("8K", 8);
const K10 = d("10K", 10);
const K13 = d("13K", 13);
const K15 = d("15K", 15);
const K20 = d("20K", 20);
const HALF = d("Half", 21.0975);
const MARATHON = d("Marathon", 42.195);
const MILE = d("1 Mile", 1.609344);
const LEAGUE = d("League", 5);

function federationRoadRace(
  slug: string,
  name: string,
  city: string,
  date: string,
  distances: DistanceSpec[],
  source: string,
): RaceConfig {
  return {
    slug,
    name,
    country: "Spain",
    city,
    region: "Spain",
    area: `${city} road course`,
    surface: "Road",
    organiser: "RFEA-registered event organiser",
    website: source,
    source,
    occurrences: [{ date, distances, ...(date >= CHECKED_AT ? { status: "TBC" as const } : {}) }],
  };
}

function portugalRoadRace(
  slug: string,
  name: string,
  city: string,
  date: string,
  distances: DistanceSpec[],
  source = "https://fpacompeticoes.pt/",
): RaceConfig {
  return {
    slug,
    name,
    country: "Portugal",
    city,
    region: "Portugal",
    area: `${city} road course`,
    surface: "Road",
    organiser: "FPA-registered event organiser",
    website: source,
    source,
    occurrences: [{ date, distances, ...(date >= CHECKED_AT ? { status: "TBC" as const } : {}) }],
  };
}

const rfea = (path: string) => `https://atletismorfea.es${path}`;

const raceConfigs: RaceConfig[] = [
  // France. The FFA calendar is discovery-only because its page expressly forbids copying.
  // Every record below is therefore supported by a separate organiser-owned page.
  {
    slug: "paris-marathon",
    name: "Paris Marathon",
    country: "France",
    city: "Paris",
    region: "Île-de-France",
    area: "Paris city road course",
    surface: "Road",
    organiser: "Amaury Sport Organisation",
    website: "https://www.schneiderelectricparismarathon.com/",
    source:
      "https://www.schneiderelectricparismarathon.com/en/news/the-worlds-largest-marathon/290",
    occurrences: [{ date: "2026-04-12", distances: [MARATHON] }],
  },
  {
    slug: "grande-course-du-grand-paris",
    name: "Grande Course du Grand Paris",
    country: "France",
    city: "Paris",
    region: "Île-de-France",
    area: "Paris to Saint-Denis",
    surface: "Road",
    organiser: "Grande Course du Grand Paris",
    website: "https://lagrandecourse.fr/",
    source: "https://lagrandecourse.fr/reglement-general/",
    occurrences: [
      {
        date: "2026-04-05",
        distances: [K10, HALF],
        note: "The organiser rules identify the 10K and half marathon as timed; the untimed 5K is excluded.",
      },
    ],
  },
  {
    slug: "adidas-10k-paris",
    name: "adidas 10K Paris",
    country: "France",
    city: "Paris",
    region: "Île-de-France",
    area: "Central Paris",
    surface: "Road",
    organiser: "adidas 10K Paris",
    website: "https://www.adidas10kparis.fr/",
    source: "https://www.adidas10kparis.fr/fr/actus/une-consigne-bagage-a-ta-disposition/12",
    occurrences: [
      { date: "2026-06-07", distances: [K10] },
      {
        date: "2027-05-23",
        distances: [K10],
        source: "https://www.adidas10kparis.fr/fr/",
      },
    ],
  },
  {
    slug: "vingt-kilometres-de-paris",
    name: "Harmonie Mutuelle 20km de Paris",
    country: "France",
    city: "Paris",
    region: "Île-de-France",
    area: "Paris city road course",
    surface: "Road",
    organiser: "20km de Paris",
    website: "https://www.harmonie-mutuelle.20kmparis.com/en/",
    source: "https://www.harmonie-mutuelle.20kmparis.com/en/",
    occurrences: [{ date: "2026-10-11", distances: [K20] }],
  },
  {
    slug: "run-in-lyon",
    name: "Run In Lyon",
    country: "France",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    area: "Lyon city road courses",
    surface: "Road",
    organiser: "Amaury Sport Organisation",
    website: "https://www.runinlyon.com/fr",
    source: "https://www.runinlyon.com/fr",
    occurrences: [
      {
        date: "2026-10-04",
        distances: [K10, HALF, MARATHON],
        note: "The organiser advertises three timed races; its untimed solidarity 5K is excluded.",
      },
    ],
  },
  {
    slug: "marathon-de-bordeaux",
    name: "Marathon de Bordeaux",
    country: "France",
    city: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    area: "Bordeaux city road courses",
    surface: "Road",
    organiser: "Amaury Sport Organisation",
    website: "https://www.timeto.com/fr/evenement/marathon-de-bordeaux-ag2r-la-mondiale",
    source: "https://www.timeto.com/fr/evenement/marathon-de-bordeaux-ag2r-la-mondiale",
    occurrences: [{ date: "2026-11-08", distances: [K10, HALF, MARATHON] }],
  },
  {
    slug: "marathon-du-beaujolais",
    name: "Marathon du Beaujolais",
    country: "France",
    city: "Villefranche-sur-Saône",
    region: "Auvergne-Rhône-Alpes",
    area: "Beaujolais vineyard road courses",
    surface: "Road",
    organiser: "Marathon du Beaujolais",
    website: "https://www.timeto.com/fr/evenement/marathon-du-beaujolais-ag2r-la-mondiale",
    source: "https://www.timeto.com/fr/evenement/marathon-du-beaujolais-ag2r-la-mondiale",
    occurrences: [{ date: "2026-11-21", distances: [K13, HALF, MARATHON] }],
  },
  {
    slug: "dix-k-inedit-paris",
    name: "10K inédit Paris",
    country: "France",
    city: "Paris",
    region: "Île-de-France",
    area: "Paris road course",
    surface: "Road",
    organiser: "10K inédit",
    website: "https://www.timeto.com/fr/evenement/10k-inedit",
    source: "https://www.timeto.com/fr/evenement/10k-inedit",
    occurrences: [{ date: "2026-01-18", distances: [K10] }],
  },
  {
    slug: "marathon-de-nantes",
    name: "Abalone Marathon de Nantes",
    country: "France",
    city: "Nantes",
    region: "Pays de la Loire",
    area: "Nantes city road courses",
    surface: "Road",
    organiser: "Nantes Métropole Athlétisme",
    website: "https://www.marathondenantes.com/",
    source: "https://www.marathondenantes.com/inscription-marathon/reglement",
    occurrences: [
      {
        date: "2026-04-25",
        distances: [K10],
        source: "https://www.marathondenantes.com/foulees",
      },
      { date: "2026-04-26", distances: [HALF, MARATHON] },
      {
        date: "2027-04-24",
        distances: [K10],
        source: "https://www.marathondenantes.com/foulees",
      },
      { date: "2027-04-25", distances: [HALF, MARATHON] },
    ],
  },
  {
    slug: "annecy-lake-marathon",
    name: "Annecy Lake Marathon",
    country: "France",
    city: "Annecy",
    region: "Auvergne-Rhône-Alpes",
    area: "Annecy and Lake Annecy",
    surface: "Road",
    organiser: "Annecy Haute-Savoie Athlétisme",
    website: "https://event.ahsa-athletisme.com/language/en/races-en/annecy-lake-marathon/",
    source: "https://event.ahsa-athletisme.com/language/en/races-en/annecy-lake-marathon/",
    occurrences: [{ date: "2026-04-19", distances: [K5, K10, HALF, MARATHON] }],
  },
  {
    slug: "marathon-de-la-liberte",
    name: "Marathon de la Liberté",
    country: "France",
    city: "Caen",
    region: "Normandy",
    area: "Caen and the Normandy Landing Beaches",
    surface: "Road",
    organiser: "Marathon de la Liberté",
    website: "https://www.marathondelaliberte.fr/",
    source: "https://www.marathondelaliberte.fr/",
    occurrences: [{ date: "2026-06-07", distances: [K10, HALF, MARATHON] }],
  },
  {
    slug: "french-riviera-marathon-2",
    name: "French Riviera Marathon Nice-Cannes",
    country: "France",
    city: "Nice",
    region: "Provence-Alpes-Côte d'Azur",
    area: "Nice to Cannes coastal road",
    surface: "Road",
    organiser: "Azur Sport Organisation",
    website: "https://www.marathon06.com/2026/",
    source: "https://www.marathon06.com/2026/infos/parcours-et-profil.htm",
    occurrences: [
      {
        date: "2026-11-08",
        distances: [K20, MARATHON],
        note: "The organiser route page explicitly advertises individual marathon and 20K courses; relay formats are excluded.",
      },
    ],
  },
  {
    slug: "euro-marathon-metz",
    name: "Euro Marathon Metz",
    country: "France",
    city: "Metz",
    region: "Grand Est",
    area: "Metz and the Eurométropole",
    surface: "Road",
    organiser: "Euro Marathon Metz",
    website: "https://www.marathon-eurometropolemetz.eu/",
    source: "https://www.marathon-eurometropolemetz.eu/levenement",
    occurrences: [{ date: "2026-10-11", distances: [K10, HALF, MARATHON] }],
  },
  {
    slug: "foulee-suresnoise",
    name: "Foulée Suresnoise",
    country: "France",
    city: "Suresnes",
    region: "Île-de-France",
    area: "Suresnes road courses",
    surface: "Road",
    organiser: "City of Suresnes",
    website: "https://www.suresnes.fr/foulee-suresnoise-a-vos-marques-prets-partez/",
    source: "https://www.suresnes.fr/foulee-suresnoise-a-vos-marques-prets-partez/",
    occurrences: [
      { date: "2026-10-03", distances: [K5] },
      { date: "2026-10-04", distances: [K10, HALF] },
    ],
  },
  {
    slug: "tournefeuille-10k-half-marathon",
    name: "10K et Semi-Marathon de Tournefeuille",
    country: "France",
    city: "Tournefeuille",
    region: "Occitanie",
    area: "Tournefeuille and La Ramée",
    surface: "Road",
    organiser: "ATHLÉ 632",
    website: "https://semimarathontournefeuille.fr/",
    source: "https://semimarathontournefeuille.fr/",
    occurrences: [{ date: "2026-10-11", distances: [K10, HALF] }],
  },
  {
    slug: "marathon-cote-damour",
    name: "Marathon International de la Côte d'Amour",
    country: "France",
    city: "Guérande",
    region: "Pays de la Loire",
    area: "Guérande and La Baule peninsula",
    surface: "Road",
    organiser: "Marathon International de la Côte d'Amour",
    website: "https://www.marathondelacotedamour.com/",
    source:
      "https://www.ville-guerande.fr/evenements/marathon-international-de-la-cote-damour-amarris-2/",
    occurrences: [
      { date: "2026-11-07", distances: [K5, K10] },
      { date: "2026-11-08", distances: [HALF, MARATHON] },
    ],
  },
  {
    slug: "durance-10k-half-marathon",
    name: "10K et Semi-Marathon de la Durance",
    country: "France",
    city: "Charleval",
    region: "Provence-Alpes-Côte d'Azur",
    area: "Charleval-en-Provence road courses",
    surface: "Road",
    organiser: "Semi-Marathon et 10K de la Durance",
    website: "https://www.semi-marathon-et-10-km-de-la-durance.fr/fr",
    source: "https://www.semi-marathon-et-10-km-de-la-durance.fr/fr",
    occurrences: [{ date: "2026-11-08", distances: [K10, HALF] }],
  },

  // Spain. Distances are included only when explicit in the RFEA title/category.
  federationRoadRace(
    "valencia-10k-ibercaja",
    "10K Valencia Ibercaja by Kiprun",
    "Valencia",
    "2026-01-11",
    [K10],
    rfea("/calendario/campeonato/10k-valencia-ibercaja-kiprun-0"),
  ),
  federationRoadRace(
    "santa-pola-10k-internacional",
    "10K Internacional Santa Pola",
    "Santa Pola",
    "2026-01-18",
    [K10],
    rfea("/calendario/campeonato/10k-internacional-santa-pola-2026"),
  ),
  federationRoadRace(
    "granollers-half-marathon",
    "Mitja Marató Granollers Les Franqueses La Garriga",
    "Granollers",
    "2026-01-18",
    [HALF],
    rfea("/calendario/campeonato/40-mitja-marato-granollers-les-franqueses-la-garriga"),
  ),
  federationRoadRace(
    "santa-pola-half-marathon",
    "Mitja Marató Internacional Vila de Santa Pola",
    "Santa Pola",
    "2026-01-18",
    [HALF],
    rfea("/calendario/campeonato/34a-mitja-marato-internacional-vila-de-santa-pola-2026"),
  ),
  federationRoadRace(
    "seville-half-marathon",
    "Medio Maratón de Sevilla",
    "Seville",
    "2026-01-25",
    [HALF],
    rfea("/calendario/campeonato/medio-maraton-de-sevilla-1"),
  ),
  federationRoadRace(
    "getafe-half-marathon",
    "Media Maratón Ciudad de Getafe",
    "Getafe",
    "2026-01-25",
    [HALF],
    rfea("/calendario/campeonato/media-maraton-ciudad-de-getafe-5"),
  ),
  federationRoadRace(
    "castello-half-marathon",
    "Media Maratón de Castelló",
    "Castellón",
    "2026-01-25",
    [HALF],
    rfea("/calendario/campeonato/41a-edicion-media-maraton-de-castello-2026"),
  ),
  federationRoadRace(
    "murcia-marathon",
    "TotalEnergies Maratón Murcia Costa Cálida",
    "Murcia",
    "2026-02-01",
    [K10, HALF, MARATHON],
    rfea("/calendario/campeonato/totalenergies-maraton-media-maraton-y-10k-murcia-costa-calida"),
  ),
  federationRoadRace(
    "terrassa-half-marathon",
    "Mitja Marató Internacional de Terrassa",
    "Terrassa",
    "2026-02-01",
    [HALF],
    rfea("/calendario/campeonato/mitja-marato-international-de-terrassa-0"),
  ),
  federationRoadRace(
    "ulia-10k",
    "10K Gimnástica de Ulía Internacional",
    "San Sebastián",
    "2026-02-08",
    [K10],
    rfea("/calendario/campeonato/95o-10k-gimnastica-de-ulia-internacional-donostia"),
  ),
  federationRoadRace(
    "rotary-elche-10k",
    "10K Rotary Elche",
    "Elche",
    "2026-02-08",
    [K10],
    rfea("/calendario/campeonato/10k-rotary-elche-0"),
  ),
  federationRoadRace(
    "seville-marathon-breakfast-run",
    "Zurich Maratón Sevilla Breakfast Run",
    "Seville",
    "2026-02-14",
    [K5],
    rfea("/calendario/campeonato/5-k-breakfast-run-zurich-maraton-sevilla-2026"),
  ),
  federationRoadRace(
    "barcelona-half-marathon",
    "Hyundai Mitja Marató de Barcelona by Brooks",
    "Barcelona",
    "2026-02-15",
    [HALF],
    rfea("/calendario/campeonato/hyundai-mitja-marato-barcelona-brooks"),
  ),
  federationRoadRace(
    "seville-marathon",
    "Zurich Maratón de Sevilla",
    "Seville",
    "2026-02-15",
    [MARATHON],
    rfea("/calendario/campeonato/zurich-maraton-de-sevilla-2026"),
  ),
  federationRoadRace(
    "ibiza-platja-den-bossa-10k",
    "10K Ibiza-Platja d'en Bossa",
    "Ibiza",
    "2026-02-15",
    [K10],
    rfea("/calendario/campeonato/10k-ibiza-platja-den-bossa-0"),
  ),
  federationRoadRace(
    "alicante-half-marathon",
    "Meridiano Media Maratón Internacional Aguas de Alicante",
    "Alicante",
    "2026-02-22",
    [K10, HALF],
    rfea("/calendario/campeonato/30a-meridiano-media-maraton-internacional-10k-aguas-de-alicante"),
  ),
  federationRoadRace(
    "castellon-marathon",
    "Maratón BP Castellón",
    "Castellón",
    "2026-02-22",
    [MARATHON],
    rfea("/calendario/campeonato/maraton-bp-castellon-3"),
  ),
  federationRoadRace(
    "castellon-10k-facsa",
    "10K FACSA Castellón",
    "Castellón",
    "2026-02-22",
    [K10],
    rfea("/calendario/campeonato/10k-facsa-castellon-2"),
  ),
  federationRoadRace(
    "barakaldo-10k-5k",
    "Barakaldo 10K y 5K",
    "Barakaldo",
    "2026-03-01",
    [K5, K10],
    rfea("/calendario/campeonato/xi-10k-y-5k-barakaldo"),
  ),
  federationRoadRace(
    "coruna-half-marathon",
    "Medio Maratón Coruña 21",
    "A Coruña",
    "2026-03-01",
    [HALF],
    rfea("/calendario/campeonato/xviii-medio-maraton-coruna-21"),
  ),
  federationRoadRace(
    "bilbao-10k-internacional",
    "10K Internacional Bilbao",
    "Bilbao",
    "2026-03-07",
    [K10],
    rfea("/calendario/campeonato/ii-10k-internacional-bilbao"),
  ),
  federationRoadRace(
    "madrid-activa-15k",
    "15K MetLife Madrid Activa",
    "Madrid",
    "2026-03-08",
    [K15],
    rfea("/calendario/campeonato/15k-metlife-madrid-activa-2026"),
  ),
  federationRoadRace(
    "barcelona-marathon",
    "Zurich Marató de Barcelona",
    "Barcelona",
    "2026-03-15",
    [MARATHON],
    rfea("/calendario/campeonato/zurich-marato-barcelona-2"),
  ),
  federationRoadRace(
    "camargo-10k-pedro-velarde",
    "10K Camargo Pedro Velarde",
    "Camargo",
    "2026-03-15",
    [K10],
    rfea("/calendario/campeonato/10k-camargo-pedro-velarde-0"),
  ),
  federationRoadRace(
    "malaga-half-marathon",
    "TotalEnergies Medio Maratón de Málaga",
    "Málaga",
    "2026-03-15",
    [HALF],
    rfea("/calendario/campeonato/totalenergies-medio-maraton-de-malaga-2026"),
  ),
  federationRoadRace(
    "talavera-10k-ciudad-de-la-ceramica",
    "10K Ciudad de la Cerámica",
    "Talavera de la Reina",
    "2026-03-15",
    [K10],
    rfea("/calendario/campeonato/xvi-10km-ciudad-de-la-ceramica"),
  ),
  federationRoadRace(
    "spain-50k-100k-road-championships",
    "Campeonato de España de 50K y 100K",
    "Málaga",
    "2026-03-21",
    [d("50K", 50), d("100K", 100)],
    rfea("/calendario/campeonato/campeonato-de-espana-de-50-km-y-100-km-absoluto-y-master"),
  ),
  federationRoadRace(
    "azkoitia-azpeitia-half-marathon",
    "Media Maratón Internacional Azkoitia-Azpeitia",
    "Azpeitia",
    "2026-03-21",
    [HALF],
    rfea(
      "/calendario/campeonato/33-media-maraton-internacional-azkoitia-azpeitia-memorial-diego-garcia",
    ),
  ),
  federationRoadRace(
    "madrid-half-marathon",
    "Movistar Madrid Medio Maratón",
    "Madrid",
    "2026-03-22",
    [HALF],
    rfea("/calendario/campeonato/xxv-movistar-madrid-medio-maraton"),
  ),
  federationRoadRace(
    "elche-half-marathon",
    "Media Maratón Internacional Ciudad de Elche",
    "Elche",
    "2026-03-22",
    [K10, HALF],
    rfea("/calendario/campeonato/53a-media-maraton-internacional-y-10k-ciudad-de-elche"),
  ),
  federationRoadRace(
    "leon-half-marathon",
    "Media Maratón Ciudad de León",
    "León",
    "2026-03-22",
    [HALF],
    rfea("/calendario/campeonato/xvi-media-maraton-ciudad-de-leon-bernesga-motor-2026"),
  ),
  federationRoadRace(
    "vila-real-5k",
    "5K SME Vila-real",
    "Vila-real",
    "2026-03-22",
    [K5],
    rfea("/calendario/campeonato/5k-sme-vila-real"),
  ),
  federationRoadRace(
    "segovia-half-marathon",
    "Media Maratón Cajaviva Segovia",
    "Segovia",
    "2026-03-28",
    [HALF],
    rfea("/calendario/campeonato/xviii-media-maraton-cajaviva-segovia"),
  ),
  federationRoadRace(
    "getxo-half-marathon",
    "Media Maratón y 10K de Getxo",
    "Getxo",
    "2026-03-29",
    [K10, HALF],
    rfea("/calendario/campeonato/media-maraton-y-10k-de-getxo-0"),
  ),
  federationRoadRace(
    "merida-half-marathon",
    "Media Maratón Mérida Patrimonio de la Humanidad",
    "Mérida",
    "2026-04-11",
    [K5, MILE, HALF],
    rfea(
      "/calendario/campeonato/campeonato-de-espana-ruta-medio-maraton-abs-y-master-5-km-y-milla-absoluto-1",
    ),
  ),
  federationRoadRace(
    "santander-urban-mile",
    "Milla Urbana de Santander",
    "Santander",
    "2026-04-11",
    [MILE],
    rfea("/calendario/campeonato/xi-milla-urbana-de-santander"),
  ),
  federationRoadRace(
    "zaragoza-marathon",
    "MANN-FILTER Maratón de Zaragoza",
    "Zaragoza",
    "2026-04-12",
    [MARATHON],
    rfea("/calendario/campeonato/mann-filter-maraton-de-zaragoza-2"),
  ),
  federationRoadRace(
    "almeria-half-marathon",
    "Medio Maratón Almería",
    "Almería",
    "2026-04-12",
    [HALF],
    rfea("/calendario/campeonato/xxvii-medio-maraton-almeria-2026"),
  ),
  federationRoadRace(
    "las-galletas-half-marathon",
    "Medio Maratón Las Galletas",
    "Arona",
    "2026-04-12",
    [HALF],
    rfea("/calendario/campeonato/xxix-medio-maraton-las-galletas-2026"),
  ),
  federationRoadRace(
    "laredo-10k",
    "10 Kilómetros en Ruta Villa de Laredo",
    "Laredo",
    "2026-04-18",
    [K10],
    rfea("/calendario/campeonato/10-kilometros-en-ruta-villa-de-laredo"),
  ),
  federationRoadRace(
    "chiclana-half-marathon",
    "Viamed Media Maratón Ciudad de Chiclana",
    "Chiclana de la Frontera",
    "2026-04-19",
    [HALF],
    rfea("/calendario/campeonato/viamed-media-maraton-ciudad-de-chiclana"),
  ),
  federationRoadRace(
    "granada-half-marathon",
    "Media Maratón Ciudad de Granada",
    "Granada",
    "2026-04-25",
    [HALF],
    rfea("/calendario/campeonato/42-media-maraton-ciudad-de-granada"),
  ),
  federationRoadRace(
    "valencia-abierta-al-mar-15k",
    "15K Valencia Abierta al Mar",
    "Valencia",
    "2026-04-26",
    [K15],
    rfea("/calendario/campeonato/15k-valencia-abierta-al-mar-0"),
  ),
  federationRoadRace(
    "ontinyent-kilometro-42-5k",
    "5K Kilómetro 42 Ontinyent",
    "Ontinyent",
    "2026-04-26",
    [K5],
    rfea("/calendario/campeonato/iv-5k-kilometro-42-ontiyent"),
  ),
  federationRoadRace(
    "oliva-5k-21k",
    "5K y 21K de Oliva a Oliva Nova",
    "Oliva",
    "2026-05-01",
    [K5, d("21K", 21)],
    rfea("/calendario/campeonato/ii-5-y-21-km-de-oliva-oliva-nova"),
  ),
  federationRoadRace(
    "aranda-de-duero-urban-mile",
    "Milla Urbana de Aranda de Duero",
    "Aranda de Duero",
    "2026-05-16",
    [MILE],
    rfea("/calendario/campeonato/42-milla-urbana-de-aranda-de-duero"),
  ),
  federationRoadRace(
    "real-valle-de-cayon-mile",
    "Milla Urbana Real Valle de Cayón",
    "Sarón",
    "2026-05-23",
    [MILE],
    rfea("/calendario/campeonato/xxii-milla-urbana-real-valle-de-cayon"),
  ),
  federationRoadRace(
    "albacete-night-10k",
    "10K Nocturna Internacional Ciudad de Albacete",
    "Albacete",
    "2026-05-23",
    [K10],
    rfea("/calendario/campeonato/v-10k-nocturna-internacional-ciudad-de-albacete-2026"),
  ),
  federationRoadRace(
    "huelva-puerta-del-descubrimiento-10k",
    "10K Huelva Puerta del Descubrimiento",
    "Huelva",
    "2026-06-06",
    [K10],
    rfea("/calendario/campeonato/viii-edicion-10k-huelva-puerta-del-descubrimiento"),
  ),
  federationRoadRace(
    "santa-pola-summer-10k",
    "10K Internacional Santa Pola Summer Race",
    "Santa Pola",
    "2026-06-06",
    [K10],
    rfea("/calendario/campeonato/10k-internacional-santa-pola-summer-race"),
  ),
  federationRoadRace(
    "gandia-night-10k",
    "10K Nocturna Playa de Gandia",
    "Gandia",
    "2026-06-06",
    [K10],
    rfea("/calendario/campeonato/10k-nocturna-playa-de-gandia-memorial-toni-herreros-0"),
  ),
  federationRoadRace(
    "ribamontan-al-mar-10k",
    "10K Ribamontán al Mar",
    "Ribamontán al Mar",
    "2026-08-22",
    [K10],
    rfea("/calendario"),
  ),
  federationRoadRace(
    "bajo-pas-half-marathon",
    "Medio Maratón Bajo Pas",
    "Oruña de Piélagos",
    "2026-09-12",
    [HALF],
    rfea("/calendario"),
  ),
  federationRoadRace(
    "ribadesella-10k",
    "10K Villa de Ribadesella",
    "Ribadesella",
    "2026-09-19",
    [K10],
    rfea("/calendario"),
  ),
  federationRoadRace(
    "iau-100k-world-championships-spain",
    "IAU 100K World Championships",
    "Los Alcázares",
    "2026-09-20",
    [d("100K", 100)],
    rfea("/calendario"),
  ),

  // Portugal. The FPA portal is used for dates already run or presently advertised.
  portugalRoadRace(
    "corrida-dos-reis-10k",
    "Corrida dos Reis / National Road 10K",
    "Figueira da Foz",
    "2026-01-17",
    [K10],
    "https://fpatletismo.pt/atletismo/geral/2026/01/figueira-da-foz-preparada-para-receber-a-33-a-edicao-dos-campeonatos-nacionais-de-estrada-10-km/",
  ),
  portugalRoadRace(
    "porto-santo-half-marathon",
    "Porto Santo Half Marathon",
    "Porto Santo",
    "2026-03-14",
    [HALF],
  ),
  portugalRoadRace(
    "portugal-road-5k-championship",
    "Portugal Road 5K Championship",
    "Braga",
    "2026-03-15",
    [K5],
  ),
  portugalRoadRace("corrida-sao-jose", "Corrida de São José", "Póvoa de Lanhoso", "2026-03-21", [
    K10,
  ]),
  portugalRoadRace("vizela-urban-mile", "Milha Urbana de Vizela", "Vizela", "2026-03-28", [MILE]),
  portugalRoadRace(
    "portugal-road-mile-championship",
    "Portugal Road Mile Championship",
    "Funchal",
    "2026-04-18",
    [MILE],
  ),
  portugalRoadRace(
    "famalicao-urban-mile",
    "Milha Urbana de Famalicão",
    "Vila Nova de Famalicão",
    "2026-04-18",
    [MILE],
  ),
  portugalRoadRace("eiras-urban-mile", "Milha Urbana de Eiras", "Eiras", "2026-04-18", [MILE]),
  portugalRoadRace("milha-da-rampa", "Milha da Rampa", "Machico", "2026-04-18", [MILE]),
  portugalRoadRace("obidos-half-marathon", "Meia Maratona de Óbidos", "Óbidos", "2026-04-19", [
    HALF,
  ]),
  portugalRoadRace("milha-de-cristal", "Milha de Cristal", "Marinha Grande", "2026-04-24", [MILE]),
  portugalRoadRace("tabua-mile-league", "Milha e Légua de Tábua", "Tábua", "2026-04-25", [
    MILE,
    LEAGUE,
  ]),
  portugalRoadRace(
    "aveiro-half-marathon-championship",
    "National Half Marathon Championship",
    "Aveiro",
    "2026-04-26",
    [HALF],
  ),
  portugalRoadRace(
    "district-road-10k-5k",
    "District Road 10K and 5K Championships",
    "Leiria",
    "2026-04-26",
    [K5, K10],
  ),
  portugalRoadRace("bravos-half-marathon", "Meia Maratona dos Bravos", "Funchal", "2026-05-01", [
    HALF,
  ]),
  portugalRoadRace("bravos-10k-mile", "10K dos Bravos e Milha", "Funchal", "2026-05-01", [
    K10,
    MILE,
  ]),
  portugalRoadRace("milha-de-monforte", "Milha de Monforte", "Monforte", "2026-05-15", [MILE]),
  portugalRoadRace("milha-joao-de-deus", "Milha João de Deus", "Faro", "2026-05-24", [MILE]),
  portugalRoadRace(
    "ponte-de-sor-half-marathon",
    "Meia Maratona de Ponte de Sor",
    "Ponte de Sor",
    "2026-05-30",
    [HALF],
  ),
  portugalRoadRace("calheta-half-marathon", "Meia Maratona da Calheta", "Calheta", "2026-05-31", [
    HALF,
  ]),
  {
    slug: "rota-dos-piratas-trail",
    name: "Rota dos Piratas Trail",
    country: "Portugal",
    city: "Porto Santo",
    region: "Madeira",
    area: "Porto Santo trails",
    surface: "Trail",
    organiser: "Rota dos Piratas",
    website: "https://fpatletismo.pt/resultados-2/",
    source: "https://fpatletismo.pt/resultados-2/",
    occurrences: [{ date: "2026-05-17", distances: [d("30K", 30), d("17K", 17), d("12K", 12)] }],
  },
  portugalRoadRace("milha-de-ceira", "Milha de Ceira", "Ceira", "2026-06-04", [MILE]),
  portugalRoadRace("milha-de-altura", "Milha de Altura", "Altura", "2026-06-10", [MILE]),
  portugalRoadRace(
    "almograve-half-marathon",
    "Meia Maratona Almograve-Zambujeira",
    "Almograve",
    "2026-06-10",
    [HALF],
  ),
  portugalRoadRace("darque-urban-mile", "Milha Urbana de Darque", "Darque", "2026-07-04", [MILE]),
  portugalRoadRace("santo-tirso-mile", "Milha de Santo Tirso", "Santo Tirso", "2026-06-20", [MILE]),
  portugalRoadRace(
    "rainha-dona-leonor-half-marathon",
    "Meia Maratona Rainha Dona Leonor",
    "Caldas da Rainha",
    "2026-06-14",
    [HALF],
  ),
  portugalRoadRace("porto-do-funchal-mile", "Milha do Porto do Funchal", "Funchal", "2026-07-18", [
    MILE,
  ]),
  portugalRoadRace("dulce-felix-mile", "Milha Dulce Félix", "Guimarães", "2026-07-18", [MILE]),
  portugalRoadRace(
    "praia-osso-da-baleia-league",
    "Légua da Praia do Osso da Baleia",
    "Pombal",
    "2026-07-19",
    [LEAGUE],
  ),
  portugalRoadRace("bodo-10k", "Prova do Bodo 10K", "Pombal", "2026-07-25", [K10]),
  portugalRoadRace("jose-do-carmo-mile", "Milha José do Carmo", "Funchal", "2026-07-25", [MILE]),
  portugalRoadRace("vila-boim-mile", "Milha de Vila Boim", "Vila Boim", "2026-08-01", [MILE]),
  portugalRoadRace("cross-road-11k", "Cross Road 11K", "Madeira", "2026-08-02", [d("11K", 11)]),
  portugalRoadRace("cerveja-mile", "Milha da Cerveja", "Vermoim", "2026-09-12", [MILE]),
  portugalRoadRace(
    "benedita-half-marathon",
    "Meia Maratona da Benedita",
    "Benedita",
    "2026-09-13",
    [HALF],
  ),
  portugalRoadRace(
    "reino-da-pedra-50-mile",
    "50 Milhas no Reino da Pedra",
    "Alqueidão da Serra",
    "2026-09-19",
    [d("50 Miles", 80.4672)],
  ),
  portugalRoadRace("ameal-half-marathon", "Ameal Half Marathon", "Ameal", "2026-09-27", [HALF]),
  portugalRoadRace(
    "cidade-berco-half-marathon",
    "Meia Maratona Cidade Berço",
    "Guimarães",
    "2026-10-05",
    [HALF],
  ),
  portugalRoadRace("vermoil-double-league", "Dupla-Légua de Vermoil", "Vermoil", "2026-11-01", [
    K10,
  ]),
  {
    slug: "funchal-marathon",
    name: "Funchal Marathon",
    country: "Portugal",
    city: "Funchal",
    region: "Madeira",
    area: "Funchal road courses",
    surface: "Road",
    organiser: "Associação de Atletismo da Madeira",
    website: "https://www.madeiramarathon.com/",
    source: "https://www.madeiramarathon.com/",
    extraDistances: ["Marathon"],
    occurrences: [
      {
        date: "2026-01-17",
        distances: [MARATHON],
        source: "https://fpatletismo.pt/resultados-2/",
      },
      {
        date: "2027-01-31",
        distances: [K8, HALF],
        note: "The existing 2027 marathon row is retained; these are its advertised companion distances.",
      },
    ],
  },
  {
    slug: "cascais-half-marathon",
    name: "Montepio Meia Maratona de Cascais",
    country: "Portugal",
    city: "Cascais",
    region: "Lisbon District",
    area: "Cascais road courses",
    surface: "Road",
    organiser: "HMS Sports",
    website: "https://meiamaratonadecascais.pt/site/",
    source: "https://meiamaratonadecascais.pt/site/",
    extraDistances: ["Half"],
    occurrences: [
      {
        date: "2027-02-07",
        distances: [K5, K10],
        note: "The existing 2027 half-marathon row is retained; these are its advertised companion distances.",
      },
    ],
  },
  {
    slug: "lisbon-half-marathon",
    name: "EDP Lisbon Half Marathon",
    country: "Portugal",
    city: "Lisbon",
    region: "Lisbon District",
    area: "25 de Abril Bridge to Belém",
    surface: "Road",
    organiser: "Maratona Clube de Portugal",
    website: "https://maratonaclubedeportugal.com/corrida-marco/edp-meia-maratona-de-lisboa/",
    source: "https://maratonaclubedeportugal.com/corrida-marco/edp-meia-maratona-de-lisboa/",
    extraDistances: ["Half"],
    occurrences: [
      {
        date: "2026-03-08",
        distances: [HALF],
        source: "https://fpacompeticoes.pt/",
      },
      {
        date: "2027-03-06",
        distances: [K7],
        source: "https://maratonaclubedeportugal.com/corrida-marco/hyundai-7k/",
      },
      {
        date: "2027-03-07",
        distances: [K10],
        source: "https://maratonaclubedeportugal.com/corrida-marco/vodafone-10k/",
        note: "The existing 2027 half-marathon row is retained; the organiser confirms a separately timed 10K.",
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
    config.occurrences.some((occurrence) => occurrence.distances.some((item) => item.km > 42.195))
  ) {
    distances.push("Ultra");
  }
  return [...new Set(distances)];
}

export const franceSpainPortugalRaceSeries: Series[] = raceConfigs.map((config) => ({
  slug: config.slug,
  name: config.name,
  sport: "Running",
  country: config.country,
  county: config.region,
  city: config.city,
  area: config.area,
  surface: config.surface,
  distances: uniqueDistances(config),
  summary: `${config.name} in ${config.city}, with every verified timed running distance published separately.`,
  description: `${config.name} is listed from organiser or governing-body evidence checked on ${CHECKED_AT}. AthRecs publishes only explicitly advertised dates and distances.`,
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

export const franceSpainPortugalRaceEditions: Edition[] = raceConfigs.flatMap((config) =>
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
