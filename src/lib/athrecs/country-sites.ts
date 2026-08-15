import { COUNTRY_GROUPS, flagForCountryFilter, resolveCountry } from "./countries";

export const SITE_LANGUAGES = ["en", "fr", "de", "es", "it", "nl", "pl", "pt"] as const;

export type SiteLanguage = (typeof SITE_LANGUAGES)[number];

export type CountrySite = {
  country: string;
  slug: string;
  iso: string;
  flag: string;
  defaultLanguage: SiteLanguage;
  localName: string;
};

const LANGUAGE_LABELS: Record<SiteLanguage, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  pt: "Português",
};

const DEFAULT_LANGUAGE_BY_COUNTRY: Partial<Record<string, SiteLanguage>> = {
  France: "fr",
  Senegal: "fr",
  Benin: "fr",
  "French Polynesia": "fr",
  Germany: "de",
  Austria: "de",
  Switzerland: "de",
  Spain: "es",
  Chile: "es",
  Peru: "es",
  Argentina: "es",
  Uruguay: "es",
  Venezuela: "es",
  "Costa Rica": "es",
  Italy: "it",
  Netherlands: "nl",
  Poland: "pl",
  Portugal: "pt",
  Brazil: "pt",
  Mozambique: "pt",
};

const LOCAL_NAME_BY_COUNTRY: Partial<Record<string, string>> = {
  France: "France",
  Senegal: "Sénégal",
  Benin: "Bénin",
  "French Polynesia": "Polynésie française",
  Germany: "Deutschland",
  Austria: "Österreich",
  Switzerland: "Schweiz",
  Spain: "España",
  Chile: "Chile",
  Peru: "Perú",
  Argentina: "Argentina",
  Uruguay: "Uruguay",
  Venezuela: "Venezuela",
  "Costa Rica": "Costa Rica",
  Italy: "Italia",
  Netherlands: "Nederland",
  Poland: "Polska",
  Portugal: "Portugal",
  Brazil: "Brasil",
  Mozambique: "Moçambique",
};

export function countrySlug(country: string): string {
  return country
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const COUNTRY_NAMES = [
  "United Kingdom",
  ...COUNTRY_GROUPS.flatMap((group) => group.options),
].filter((country, index, countries) => countries.indexOf(country) === index);

export const COUNTRY_SITES: CountrySite[] = COUNTRY_NAMES.map((country) => {
  const info = resolveCountry({ country, name: country });
  return {
    country,
    slug: countrySlug(country),
    iso: info.iso,
    flag: flagForCountryFilter(country),
    defaultLanguage: DEFAULT_LANGUAGE_BY_COUNTRY[country] ?? "en",
    localName: LOCAL_NAME_BY_COUNTRY[country] ?? country,
  };
});

const COUNTRY_BY_SLUG = new Map(COUNTRY_SITES.map((site) => [site.slug, site]));
const COUNTRY_BY_NAME = new Map(COUNTRY_SITES.map((site) => [site.country, site]));

export function isSiteLanguage(value: string): value is SiteLanguage {
  return SITE_LANGUAGES.includes(value as SiteLanguage);
}

export function languageLabel(language: SiteLanguage): string {
  return LANGUAGE_LABELS[language];
}

export function countrySiteFromSlug(slug: string): CountrySite | undefined {
  return COUNTRY_BY_SLUG.get(slug);
}

export function countrySiteFromName(country: string): CountrySite | undefined {
  return COUNTRY_BY_NAME.get(country);
}

export function displayCountryForLanguage(site: CountrySite, language: SiteLanguage): string {
  return language === site.defaultLanguage ? site.localName : site.country;
}

export function countryHomePath(site: CountrySite, language = site.defaultLanguage): string {
  return `/${language}/${site.slug}`;
}

export function countryRacesPath(site: CountrySite, language = site.defaultLanguage): string {
  return `${countryHomePath(site, language)}/races`;
}

export type CountryCopy = {
  home: string;
  events: string;
  athletes: string;
  clubs: string;
  calendar: string;
  language: string;
  country: string;
  runningFirst: string;
  heroTitle: string;
  heroIntro: string;
  exploreRunning: string;
  raceCalendar: string;
  chooseDistance: string;
  chooseDistanceBody: string;
  allRunningEvents: string;
  parkrunDetail: string;
  fiveKDetail: string;
  tenKDetail: string;
  halfMarathon: string;
  halfDetail: string;
  marathon: string;
  marathonDetail: string;
  triathlon: string;
  triathlonBody: string;
  cycling: string;
  cyclingBody: string;
  explore: string;
  upcoming: string;
  upcomingBody: string;
  allRaces: string;
  racesIn: string;
  racesIntro: string;
  noRaces: string;
  backToCountry: string;
};

const COPY: Record<SiteLanguage, CountryCopy> = {
  en: {
    home: "Home",
    events: "Events",
    athletes: "Athletes",
    clubs: "Clubs",
    calendar: "Calendar",
    language: "Language",
    country: "Country",
    runningFirst: "Running first",
    heroTitle: "Find your next start line in {country}.",
    heroIntro:
      "Discover local parkruns, 5Ks and 10Ks through to half marathons, marathons and multisport events.",
    exploreRunning: "Explore running",
    raceCalendar: "Race calendar",
    chooseDistance: "Choose your distance",
    chooseDistanceBody: "Start with the race you know — or find your next challenge.",
    allRunningEvents: "All running events",
    parkrunDetail: "Free, weekly 5K",
    fiveKDetail: "Fast and accessible",
    tenKDetail: "The classic road race",
    halfMarathon: "Half marathon",
    halfDetail: "13.1 miles",
    marathon: "Marathon",
    marathonDetail: "26.2 miles",
    triathlon: "Triathlon",
    triathlonBody: "Sprint, standard, middle-distance and full-distance events.",
    cycling: "Cycling",
    cyclingBody: "Road, trail, track and mixed-terrain rides and races.",
    explore: "Explore",
    upcoming: "Coming up",
    upcomingBody: "Upcoming events in {country}.",
    allRaces: "All races",
    racesIn: "Races in {country}",
    racesIntro: "Every event shown below is filtered to {country}.",
    noRaces: "No upcoming races are listed for these filters yet.",
    backToCountry: "Back to {country}",
  },
  fr: {
    home: "Accueil",
    events: "Épreuves",
    athletes: "Athlètes",
    clubs: "Clubs",
    calendar: "Calendrier",
    language: "Langue",
    country: "Pays",
    runningFirst: "Course à pied en priorité",
    heroTitle: "Trouvez votre prochaine ligne de départ en {country}.",
    heroIntro:
      "Découvrez les parkruns, 5 km et 10 km locaux, ainsi que les semi-marathons, marathons et épreuves multisports.",
    exploreRunning: "Découvrir les courses",
    raceCalendar: "Calendrier des courses",
    chooseDistance: "Choisissez votre distance",
    chooseDistanceBody: "Commencez par votre distance habituelle ou relevez un nouveau défi.",
    allRunningEvents: "Toutes les courses à pied",
    parkrunDetail: "5 km gratuit chaque semaine",
    fiveKDetail: "Rapide et accessible",
    tenKDetail: "La course sur route classique",
    halfMarathon: "Semi-marathon",
    halfDetail: "21,1 km",
    marathon: "Marathon",
    marathonDetail: "42,2 km",
    triathlon: "Triathlon",
    triathlonBody: "Formats sprint, standard, moyenne et longue distance.",
    cycling: "Cyclisme",
    cyclingBody: "Épreuves sur route, sentier, piste et terrains mixtes.",
    explore: "Découvrir",
    upcoming: "À venir",
    upcomingBody: "Prochaines épreuves en {country}.",
    allRaces: "Toutes les épreuves",
    racesIn: "Épreuves en {country}",
    racesIntro: "Toutes les épreuves ci-dessous sont filtrées pour la {country}.",
    noRaces: "Aucune épreuve à venir ne correspond encore à ces filtres.",
    backToCountry: "Retour à la page {country}",
  },
  de: {
    home: "Startseite",
    events: "Wettkämpfe",
    athletes: "Athleten",
    clubs: "Vereine",
    calendar: "Kalender",
    language: "Sprache",
    country: "Land",
    runningFirst: "Laufen im Mittelpunkt",
    heroTitle: "Finde deine nächste Startlinie in {country}.",
    heroIntro:
      "Entdecke lokale parkruns, 5- und 10-km-Läufe, Halbmarathons, Marathons und Multisport-Events.",
    exploreRunning: "Läufe entdecken",
    raceCalendar: "Laufkalender",
    chooseDistance: "Wähle deine Distanz",
    chooseDistanceBody: "Starte mit deiner gewohnten Distanz oder finde eine neue Herausforderung.",
    allRunningEvents: "Alle Laufveranstaltungen",
    parkrunDetail: "Kostenloser wöchentlicher 5-km-Lauf",
    fiveKDetail: "Schnell und zugänglich",
    tenKDetail: "Der klassische Straßenlauf",
    halfMarathon: "Halbmarathon",
    halfDetail: "21,1 km",
    marathon: "Marathon",
    marathonDetail: "42,2 km",
    triathlon: "Triathlon",
    triathlonBody: "Sprint-, Standard-, Mittel- und Langdistanz-Events.",
    cycling: "Radsport",
    cyclingBody: "Straßen-, Trail-, Bahn- und Mixed-Terrain-Events.",
    explore: "Entdecken",
    upcoming: "Demnächst",
    upcomingBody: "Kommende Veranstaltungen in {country}.",
    allRaces: "Alle Wettkämpfe",
    racesIn: "Wettkämpfe in {country}",
    racesIntro: "Alle unten aufgeführten Veranstaltungen sind nach {country} gefiltert.",
    noRaces: "Für diese Filter sind noch keine kommenden Wettkämpfe eingetragen.",
    backToCountry: "Zurück zu {country}",
  },
  es: {
    home: "Inicio",
    events: "Carreras",
    athletes: "Atletas",
    clubs: "Clubes",
    calendar: "Calendario",
    language: "Idioma",
    country: "País",
    runningFirst: "Running en primer plano",
    heroTitle: "Encuentra tu próxima línea de salida en {country}.",
    heroIntro:
      "Descubre parkruns locales, carreras de 5 y 10 km, medias maratones, maratones y pruebas multideporte.",
    exploreRunning: "Explorar carreras",
    raceCalendar: "Calendario de carreras",
    chooseDistance: "Elige tu distancia",
    chooseDistanceBody: "Empieza por la distancia que conoces o descubre tu próximo reto.",
    allRunningEvents: "Todas las carreras",
    parkrunDetail: "5 km gratis cada semana",
    fiveKDetail: "Rápida y accesible",
    tenKDetail: "La clásica carrera en ruta",
    halfMarathon: "Media maratón",
    halfDetail: "21,1 km",
    marathon: "Maratón",
    marathonDetail: "42,2 km",
    triathlon: "Triatlón",
    triathlonBody: "Pruebas sprint, estándar, media y larga distancia.",
    cycling: "Ciclismo",
    cyclingBody: "Pruebas de carretera, trail, pista y terreno mixto.",
    explore: "Explorar",
    upcoming: "Próximamente",
    upcomingBody: "Próximas pruebas en {country}.",
    allRaces: "Todas las carreras",
    racesIn: "Carreras en {country}",
    racesIntro: "Todas las pruebas que aparecen están filtradas para {country}.",
    noRaces: "Todavía no hay próximas carreras para estos filtros.",
    backToCountry: "Volver a {country}",
  },
  it: {
    home: "Home",
    events: "Gare",
    athletes: "Atleti",
    clubs: "Società",
    calendar: "Calendario",
    language: "Lingua",
    country: "Paese",
    runningFirst: "La corsa al centro",
    heroTitle: "Trova la tua prossima linea di partenza in {country}.",
    heroIntro:
      "Scopri parkrun locali, gare da 5 e 10 km, mezze maratone, maratone ed eventi multisport.",
    exploreRunning: "Scopri le gare",
    raceCalendar: "Calendario gare",
    chooseDistance: "Scegli la distanza",
    chooseDistanceBody: "Parti dalla distanza che conosci o trova la tua prossima sfida.",
    allRunningEvents: "Tutte le gare di corsa",
    parkrunDetail: "5 km gratuito ogni settimana",
    fiveKDetail: "Veloce e accessibile",
    tenKDetail: "La classica corsa su strada",
    halfMarathon: "Mezza maratona",
    halfDetail: "21,1 km",
    marathon: "Maratona",
    marathonDetail: "42,2 km",
    triathlon: "Triathlon",
    triathlonBody: "Eventi sprint, standard, media e lunga distanza.",
    cycling: "Ciclismo",
    cyclingBody: "Gare su strada, trail, pista e terreno misto.",
    explore: "Scopri",
    upcoming: "In arrivo",
    upcomingBody: "Prossimi eventi in {country}.",
    allRaces: "Tutte le gare",
    racesIn: "Gare in {country}",
    racesIntro: "Tutti gli eventi mostrati sono filtrati per {country}.",
    noRaces: "Non ci sono ancora gare future per questi filtri.",
    backToCountry: "Torna a {country}",
  },
  nl: {
    home: "Home",
    events: "Wedstrijden",
    athletes: "Atleten",
    clubs: "Clubs",
    calendar: "Kalender",
    language: "Taal",
    country: "Land",
    runningFirst: "Hardlopen voorop",
    heroTitle: "Vind je volgende startlijn in {country}.",
    heroIntro:
      "Ontdek lokale parkruns, 5 en 10 kilometer, halve marathons, marathons en multisportevenementen.",
    exploreRunning: "Hardloopevenementen",
    raceCalendar: "Wedstrijdkalender",
    chooseDistance: "Kies je afstand",
    chooseDistanceBody: "Begin met de afstand die je kent of vind je volgende uitdaging.",
    allRunningEvents: "Alle hardloopevenementen",
    parkrunDetail: "Gratis wekelijkse 5 km",
    fiveKDetail: "Snel en toegankelijk",
    tenKDetail: "De klassieke wegwedstrijd",
    halfMarathon: "Halve marathon",
    halfDetail: "21,1 km",
    marathon: "Marathon",
    marathonDetail: "42,2 km",
    triathlon: "Triathlon",
    triathlonBody: "Sprint-, standaard-, midden- en langeafstandsevenementen.",
    cycling: "Wielrennen",
    cyclingBody: "Weg-, trail-, baan- en gemengde evenementen.",
    explore: "Ontdek",
    upcoming: "Binnenkort",
    upcomingBody: "Aankomende evenementen in {country}.",
    allRaces: "Alle wedstrijden",
    racesIn: "Wedstrijden in {country}",
    racesIntro: "Alle onderstaande evenementen zijn gefilterd op {country}.",
    noRaces: "Voor deze filters zijn nog geen komende wedstrijden opgenomen.",
    backToCountry: "Terug naar {country}",
  },
  pl: {
    home: "Strona główna",
    events: "Zawody",
    athletes: "Zawodnicy",
    clubs: "Kluby",
    calendar: "Kalendarz",
    language: "Język",
    country: "Kraj",
    runningFirst: "Bieganie na pierwszym miejscu",
    heroTitle: "Znajdź swój kolejny start w kraju: {country}.",
    heroIntro:
      "Odkrywaj lokalne parkruny, biegi na 5 i 10 km, półmaratony, maratony oraz zawody multisportowe.",
    exploreRunning: "Odkrywaj biegi",
    raceCalendar: "Kalendarz biegów",
    chooseDistance: "Wybierz dystans",
    chooseDistanceBody: "Zacznij od znanego dystansu lub znajdź kolejne wyzwanie.",
    allRunningEvents: "Wszystkie biegi",
    parkrunDetail: "Bezpłatne cotygodniowe 5 km",
    fiveKDetail: "Szybki i dostępny",
    tenKDetail: "Klasyczny bieg uliczny",
    halfMarathon: "Półmaraton",
    halfDetail: "21,1 km",
    marathon: "Maraton",
    marathonDetail: "42,2 km",
    triathlon: "Triathlon",
    triathlonBody: "Zawody sprinterskie, standardowe, średnie i długie.",
    cycling: "Kolarstwo",
    cyclingBody: "Zawody szosowe, terenowe, torowe i mieszane.",
    explore: "Odkrywaj",
    upcoming: "Nadchodzące",
    upcomingBody: "Nadchodzące wydarzenia w kraju: {country}.",
    allRaces: "Wszystkie zawody",
    racesIn: "Zawody w kraju: {country}",
    racesIntro: "Wszystkie wydarzenia poniżej są filtrowane dla kraju: {country}.",
    noRaces: "Dla tych filtrów nie ma jeszcze nadchodzących zawodów.",
    backToCountry: "Powrót: {country}",
  },
  pt: {
    home: "Início",
    events: "Provas",
    athletes: "Atletas",
    clubs: "Clubes",
    calendar: "Calendário",
    language: "Idioma",
    country: "País",
    runningFirst: "Corrida em primeiro lugar",
    heroTitle: "Encontre a sua próxima linha de partida em {country}.",
    heroIntro:
      "Descubra parkruns locais, provas de 5 e 10 km, meias maratonas, maratonas e eventos multidesportivos.",
    exploreRunning: "Explorar corridas",
    raceCalendar: "Calendário de provas",
    chooseDistance: "Escolha a distância",
    chooseDistanceBody: "Comece pela distância que conhece ou encontre o próximo desafio.",
    allRunningEvents: "Todas as corridas",
    parkrunDetail: "5 km gratuito todas as semanas",
    fiveKDetail: "Rápida e acessível",
    tenKDetail: "A clássica corrida de estrada",
    halfMarathon: "Meia maratona",
    halfDetail: "21,1 km",
    marathon: "Maratona",
    marathonDetail: "42,2 km",
    triathlon: "Triatlo",
    triathlonBody: "Eventos sprint, standard, média e longa distância.",
    cycling: "Ciclismo",
    cyclingBody: "Provas de estrada, trilho, pista e terreno misto.",
    explore: "Explorar",
    upcoming: "Em breve",
    upcomingBody: "Próximos eventos em {country}.",
    allRaces: "Todas as provas",
    racesIn: "Provas em {country}",
    racesIntro: "Todos os eventos apresentados estão filtrados para {country}.",
    noRaces: "Ainda não existem provas futuras para estes filtros.",
    backToCountry: "Voltar a {country}",
  },
};

export function copyForLanguage(language: SiteLanguage): CountryCopy {
  return COPY[language];
}

export function translateCountryText(text: string, country: string): string {
  return text.replaceAll("{country}", country);
}
