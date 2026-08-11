import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [652,"1373","matthew-boulter","44:18","MO"],
  [653,"1226","scott-bemment","45:28","M50"],
  [654,"518","james-bowman","45:12","MO"],
  [655,"594","vickie-hallam","45:34","F45"],
  [656,"928","aj-johnson","45:13","MO"],
  [657,"1129","matthew-wardle","45:27","MO"],
  [658,"881","aidan-overton","45:41","MO"],
  [659,"143","joe-prendergast","44:58","MO"],
  [660,"1553","joe-palmer","45:20","M45"],
  [661,"1178","mark-robbins","45:33","M40"],
  [662,"1433","declan-nicol","45:18","MO"],
  [663,"1164","samuel-sadd","44:50","MO"],
  [664,"921","alex-curl","45:33","MO"],
  [665,"2870","jason-reynolds","42:52","MO"],
  [666,"1325","ian-carrell","45:42","M55"],
  [667,"925","patrick-dickinson","44:55","MO"],
  [668,"422","tom-walters","45:39","MO"],
  [669,"604","mark-ogden","44:53","M50"],
  [670,"509","david-grealy","45:32","MO"],
  [671,"1194","michael-fleckney","45:22","MO"],
  [672,"564","george-chesney","45:29","MO"],
  [673,"1471","richard-huggins","44:57","M45"],
  [674,"1746","georgie-paganini","45:14","FO"],
  [675,"1561","nick-moore","45:27","MO"],
  [676,"767","thomas-payne","45:56","MO"],
  [677,"541","chris-drake","45:19","MO"],
  [678,"679","daniel-gardiner","45:52","M55"],
  [679,"1668","tom-hall","45:06","MO"],
  [680,"1066","charlotte-harris-cook","45:30","F40"],
  [681,"1003","henry-doe","45:43","MO"],
  [682,"720","shaun-hurr","45:31","M45"],
  [683,"1420","craig-mccann","45:10","M40"],
  [684,"673","evan-simpson","45:11","MO"],
  [685,"621","carlene-johnson","45:19","FO"],
  [686,"962","stacy-tovell","45:56","M50"],
  [687,"1642","will-bryan","45:13","MO"],
  [688,"1017","brendan-scott","45:37","MO"],
  [689,"794","alan-diaper","45:38","M50"],
  [690,"1613","daniel-de-boltz","45:50","MO"],
  [691,"1160","mark-judd","45:52","M55"],
  [692,"349","matthew-wigg","45:51","M40"],
  [693,"1403","christopher-wigg","45:51","M50"],
  [694,"655","mark-langdale","46:02","M55"],
  [695,"539","dudley-garner","45:54","M40"],
  [696,"1044","lee-johnson","45:22","M40"],
  [697,"749","clare-sandall","46:07","F45"],
  [698,"680","jason-brunt","46:04","M50"],
  [699,"1237","chris-johnson","45:14","M40"],
  [700,"1617","josh-goddard","45:53","MO"],
] as const;

export const resultsRn2025B6P4: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
