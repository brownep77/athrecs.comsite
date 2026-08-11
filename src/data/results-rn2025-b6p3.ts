import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [601,"1423","timothy-bishop","45:05","M55"],
  [602,"646","george-crane","44:52","MO"],
  [603,"609","will-johnson","44:41","M45"],
  [604,"894","graham-horne","45:04","M40"],
  [605,"402","dan-goodwin","45:08","M45"],
  [606,"1364","brandon-woodhouse","44:53","MO"],
  [607,"1539","jack-bye","44:54","MO"],
  [608,"607","christopher-noller","45:12","M50"],
  [609,"480","will-waddingham","44:33","MO"],
  [610,"365","charlie-huggett","44:16","MO"],
  [611,"734","rebecca-main","44:38","F40"],
  [612,"863","jake-kerr","45:02","MO"],
  [613,"873","adam-wright","45:13","MO"],
  [614,"1507","simon-elliott","45:28","MO"],
  [615,"781","jack-dring","44:02","MO"],
  [616,"842","alex-day","44:39","MO"],
  [617,"1084","jacob-calvo-penfold","44:31","MO"],
  [618,"931","luke-fish","44:59","MO"],
  [619,"159","ben-nockolds","45:18","MO"],
  [620,"1059","will-moy","44:52","MO"],
  [621,"112","michael-wilce","44:48","MO"],
  [622,"914","shannon-brown","45:09","FO"],
  [623,"1494","ella-woodcock","45:16","FO"],
  [624,"1385","ben-miller","44:35","MO"],
  [625,"1596","harry-cowper-johnson","45:01","MO"],
  [626,"1203","ewan-gallagher","44:33","MO"],
  [627,"1359","ian-brown","45:38","M55"],
  [628,"1150","matthew-parkes","45:37","MO"],
  [629,"318","zlatin-milanov","45:09","MO"],
  [630,"499","daniel-stocks","44:35","MO"],
  [631,"334","james-smith","44:25","MO"],
  [632,"475","annie-draper","45:47","FO"],
  [633,"832","jack-webb","44:42","MO"],
  [635,"833","george-smy","44:21","MO"],
  [636,"974","chloe-ward","44:26","FO"],
  [637,"1659","clive-parkerson","45:18","M50"],
  [638,"968","brett-colclough","45:38","MO"],
  [639,"463","alan-kyle","44:58","M40"],
  [640,"1213","milly-chalcraft","45:05","FO"],
  [641,"1092","neil-park","44:29","M45"],
  [642,"583","liam-killington","44:56","MO"],
  [643,"551","becky-willett","45:33","FO"],
  [644,"528","steve-ely","45:16","M50"],
  [645,"892","chris-ashling","45:34","M45"],
  [646,"804","andrew-buck","44:54","M45"],
  [647,"699","james-vaughan","45:14","MO"],
  [648,"440","joshua-brett","45:14","MO"],
  [649,"1503","bryn-harrison","44:43","MO"],
  [650,"1308","dean-fiske","45:26","M40"],
  [651,"692","jack-keeble","45:37","MO"],
] as const;

export const resultsRn2025B6P3: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
  eventSlug: "run-norwich",
  date: "2025-09-07",
  distance: "10K",
  athleteSlug,
  place,
  time,
  finishTimeSeconds: toSeconds(time),
  chipTimeSeconds: toSeconds(time),
  status: "finished",
  category,
  resultSource: "official",
  source: SOURCE,
  bib,
}));
