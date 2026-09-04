/**
 * Angola 2026 running races Jan-Aug from TCHACO. No cycling or swimming.
 */
import type { Edition, Series } from "./types";

const CHECKED_AT = "2026-09-04";
const CAL = "https://www.tchacosport.com/calendario-eventos";

function officialEntry(url: string, notes: string): Edition["entryOptions"] {
  return [
    {
      providerCode: "tchaco",
      providerName: "TCHACO Sport",
      entryUrl: url,
      entryType: "official",
      status: "closed",
      checkedAt: CHECKED_AT,
      sourceUrl: url,
      notes,
    },
  ];
}

function series(slug: string, name: string, city: string, county: string, distances: string[], summary: string): Series {
  return {
    slug,
    name,
    sport: "Running",
    country: "Angola",
    county,
    city,
    area: city,
    surface: "Road",
    distances,
    summary,
    description: summary,
    organiser: "TCHACO Sport",
    website: CAL,
    featured: false,
    source_url: CAL,
  };
}

function edition(seriesSlug: string, date: string, distance: string, distanceKm: number, notes: string): Edition {
  return {
    seriesSlug,
    date,
    distance,
    distanceKm,
    status: "Finished",
    entryUrl: CAL,
    entryOptions: officialEntry(CAL, notes),
    source: CAL,
    notes,
  };
}

export const runrecsGapFillAngolaYearSeries: Series[] = [
  series("corrida-andre-quitongo", "Corrida Pedestre André Quitongo", "Luanda", "Luanda", ["10K"], "Road race 11 January 2026."),
  series("corrida-festas-da-quiminha", "Corrida Festas da Quiminha", "Luanda", "Luanda", ["10K"], "Road race 31 January 2026."),
  series("meia-maratona-fuga-a-resistencia", "Meia Maratona Fuga à Resistência", "Luanda", "Luanda", ["Half"], "14th edition half marathon 4 February 2026."),
  series("corrida-caminhos-da-agua", "Corrida Caminhos da Água", "Luanda", "Luanda", ["10K"], "Road race 14 February 2026."),
  series("corrida-inter-de-angola", "Corrida Inter de Angola 50 Anos", "Luanda", "Luanda", ["10K"], "Road race 15 February 2026."),
  series("corrida-sonangol-50-anos", "Corrida Sonangol 50 Anos", "Luanda", "Luanda", ["10K"], "Road race 22 February 2026."),
  series("corrida-fada-40-anos", "Corrida FADA 40 Anos", "Talatona", "Luanda", ["10K"], "Road race 28 February 2026."),
  series("corrida-das-aguas-huila", "Corrida das Águas Huíla", "Lubango", "Huíla", ["10K", "5K"], "Road race 8 March 2026."),
  series("corrida-das-aguas-luanda", "Corrida das Águas Luanda", "Luanda", "Luanda", ["10K", "5K"], "Road race 15 March 2026."),
  series("corrida-das-aguas-benguela", "Corrida das Águas Benguela", "Benguela", "Benguela", ["10K", "5K"], "Road race 21 March 2026."),
  series("corrida-festas-do-mar", "Corrida Festas do Mar", "Luanda", "Luanda", ["10K"], "Road race 28 March 2026."),
  series("corrida-pumangol-18-anos", "Corrida Pumangol 18 Anos", "Luanda", "Luanda", ["10K"], "Road race 29 March 2026."),
  series("meia-maratona-internacional-da-paz-luanda", "Meia Maratona Internacional da Paz", "Luanda", "Luanda", ["Half"], "Peace Half Marathon 4 April 2026."),
  series("corrida-universitaria-de-luanda", "Corrida Universitária de Luanda", "Talatona", "Luanda", ["10K"], "Road race 12 April 2026."),
  series("corrida-unitel-25-anos", "Corrida Unitel 25 Anos", "Luanda", "Luanda", ["10K"], "Road race 25 April 2026."),
  series("corrida-banco-bic-21-anos", "Corrida Banco BIC 21 Anos", "Luanda", "Luanda", ["10K"], "Road race 26 April 2026."),
  series("corrida-ensa-48-anos", "Corrida ENSA 48 Anos", "Luanda", "Luanda", ["10K", "5K"], "Road race 9 May 2026."),
  series("corrida-familia-talatona", "Corrida da Família Administração de Talatona", "Talatona", "Luanda", ["10K"], "Road race 17 May 2026."),
  series("corrida-inapem-empreendedorismo", "Corrida do Empreendedorismo INAPEM", "Luanda", "Luanda", ["10K"], "Road race 24 May 2026."),
  series("corrida-cabship-2026", "Corrida Cabship", "Luanda", "Luanda", ["10K"], "Road race 30 May 2026."),
  series("corrida-dpworld-5-anos", "Corrida DP World 5 Anos", "Luanda", "Luanda", ["10K"], "Road race 6 June 2026."),
  series("corrida-mota-engil-80-anos", "Corrida Mota-Engil 80 Anos", "Luanda", "Luanda", ["10K"], "Road race 13 June 2026."),
  series("corrida-sequele-na-via", "Corrida 4º Aniversário Sequele na Via", "Luanda", "Luanda", ["10K"], "Road race 14 June 2026."),
  series("corrida-solidaria-fistula-obstetrica", "Corrida Solidária pelo Fim da Fístula Obstétrica", "Luanda", "Luanda", ["10K"], "Road race 20 June 2026."),
  series("corrida-fitfeira", "Corrida FitFeira", "Luanda", "Luanda", ["10K"], "FitFeira road races 27-28 June 2026."),
  series("corrida-bfa-33-anos", "Corrida BFA 33 Anos", "Luanda", "Luanda", ["10K", "5K"], "Road race 4 July 2026."),
  series("corrida-atlantico-20-anos", "Corrida Atlântico 20 Anos", "Luanda", "Luanda", ["10K"], "Road race 11 July 2026."),
  series("corrida-etu-26-anos", "Corrida ETU 26 Anos", "Luanda", "Luanda", ["10K"], "Road race 12 July 2026."),
  series("corrida-ocpca", "Corrida do Membro OCPCA", "Luanda", "Luanda", ["10K"], "Road race 18 July 2026."),
  series("corrida-luanda-precisa-de-ti", "Corrida Luanda Precisa de Ti", "Luanda", "Luanda", ["10K"], "Road race 19 July 2026."),
  series("corrida-8-remedios-naturais", "Corrida os 8 Remédios Naturais", "Talatona", "Luanda", ["10K"], "Road race 2 August 2026."),
  series("corrida-banco-bai-huila", "Corrida Banco BAI Huíla", "Lubango", "Huíla", ["10K", "5K"], "Road race 16 August 2026."),
  series("meia-maratona-lubango-chela", "Meia Maratona de Lubango by Água da Chela", "Lubango", "Huíla", ["Half", "5K"], "Half marathon 22 August 2026."),
  series("corrida-bpc-2026", "Corrida BPC", "Luanda", "Luanda", ["10K"], "Road race 30 August 2026."),
];

export const runrecsGapFillAngolaYearEditions: Edition[] = [
  edition("corrida-andre-quitongo", "2026-01-11", "10K", 10, "TCHACO running calendar."),
  edition("corrida-festas-da-quiminha", "2026-01-31", "10K", 10, "TCHACO running calendar."),
  edition("meia-maratona-fuga-a-resistencia", "2026-02-04", "Half", 21.0975, "14th edition half marathon."),
  edition("corrida-caminhos-da-agua", "2026-02-14", "10K", 10, "TCHACO running calendar."),
  edition("corrida-inter-de-angola", "2026-02-15", "10K", 10, "TCHACO running calendar."),
  edition("corrida-sonangol-50-anos", "2026-02-22", "10K", 10, "TCHACO running calendar."),
  edition("corrida-fada-40-anos", "2026-02-28", "10K", 10, "TCHACO running calendar."),
  edition("corrida-das-aguas-huila", "2026-03-08", "10K", 10, "TCHACO running calendar."),
  edition("corrida-das-aguas-luanda", "2026-03-15", "10K", 10, "TCHACO running calendar."),
  edition("corrida-das-aguas-benguela", "2026-03-21", "10K", 10, "TCHACO running calendar."),
  edition("corrida-festas-do-mar", "2026-03-28", "10K", 10, "TCHACO running calendar."),
  edition("corrida-pumangol-18-anos", "2026-03-29", "10K", 10, "TCHACO running calendar."),
  edition("meia-maratona-internacional-da-paz-luanda", "2026-04-04", "Half", 21.0975, "Official Peace Half Marathon."),
  edition("corrida-universitaria-de-luanda", "2026-04-12", "10K", 10, "TCHACO running calendar."),
  edition("corrida-unitel-25-anos", "2026-04-25", "10K", 10, "TCHACO running calendar."),
  edition("corrida-banco-bic-21-anos", "2026-04-26", "10K", 10, "TCHACO running calendar."),
  edition("corrida-ensa-48-anos", "2026-05-09", "10K", 10, "TCHACO running calendar."),
  edition("corrida-familia-talatona", "2026-05-17", "10K", 10, "TCHACO running calendar."),
  edition("corrida-inapem-empreendedorismo", "2026-05-24", "10K", 10, "TCHACO running calendar."),
  edition("corrida-cabship-2026", "2026-05-30", "10K", 10, "TCHACO running calendar."),
  edition("corrida-dpworld-5-anos", "2026-06-06", "10K", 10, "TCHACO running calendar."),
  edition("corrida-mota-engil-80-anos", "2026-06-13", "10K", 10, "TCHACO running calendar."),
  edition("corrida-sequele-na-via", "2026-06-14", "10K", 10, "TCHACO running calendar."),
  edition("corrida-solidaria-fistula-obstetrica", "2026-06-20", "10K", 10, "TCHACO running calendar."),
  edition("corrida-fitfeira", "2026-06-27", "10K", 10, "FitFeira day 1."),
  edition("corrida-fitfeira", "2026-06-28", "10K", 10, "FitFeira day 2."),
  edition("corrida-bfa-33-anos", "2026-07-04", "10K", 10, "TCHACO running calendar."),
  edition("corrida-atlantico-20-anos", "2026-07-11", "10K", 10, "TCHACO running calendar."),
  edition("corrida-etu-26-anos", "2026-07-12", "10K", 10, "TCHACO running calendar."),
  edition("corrida-ocpca", "2026-07-18", "10K", 10, "TCHACO running calendar."),
  edition("corrida-luanda-precisa-de-ti", "2026-07-19", "10K", 10, "TCHACO running calendar."),
  edition("corrida-8-remedios-naturais", "2026-08-02", "10K", 10, "TCHACO running calendar."),
  edition("corrida-banco-bai-huila", "2026-08-16", "10K", 10, "TCHACO running calendar."),
  edition("meia-maratona-lubango-chela", "2026-08-22", "Half", 21.0975, "Official Lubango Chela half marathon."),
  edition("corrida-bpc-2026", "2026-08-30", "10K", 10, "TCHACO running calendar."),
];
