import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [701,"1103","julia-parsley","45:58","F40"],
  [702,"1632","ian-beggs","45:58","M55"],
  [703,"940","craig-rush","45:53","MO"],
  [704,"1095","marek-zdan","45:52","M40"],
  [705,"1079","tom-nichols","46:06","M40"],
  [706,"1305","catherine-henery","45:51","F60"],
  [707,"905","ben-edwards","45:31","MO"],
  [708,"725","matthew-trollope","46:03","M45"],
  [709,"590","luke-bailey","45:41","MO"],
  [710,"883","richard-strange","45:29","MO"],
  [711,"411","laura-george","46:20","FO"],
  [712,"307","tom-west","45:33","MO"],
  [713,"405","sam-ireland","45:52","MO"],
  [714,"1266","helen-harper-lambert","45:58","FO"],
  [715,"829","robyn-macrae","46:10","FO"],
  [716,"4325","amelia-balding","39:19","FO"],
  [717,"1021","stuart-thompson","45:49","M50"],
  [718,"194","lee-wilson","46:17","M50"],
  [719,"1067","jack-lovick","46:25","MO"],
  [720,"830","richard-stanley","46:15","M40"],
  [721,"7040","ian-stubbs","45:46","M50"],
  [722,"429","paul-williams","46:25","M55"],
  [723,"1684","lawrence-cooke","46:37","M40"],
  [724,"616","harry-ward","45:56","MO"],
  [725,"769","glenn-orford","46:10","M55"],
  [726,"228","kareana-symonds","46:07","F40"],
  [727,"600","marcus-westgate","45:42","M50"],
  [728,"874","declan-smith-howell","45:50","MO"],
  [729,"847","andrew-cheshire","46:24","MO"],
  [730,"672","nicola-hill","46:21","F50"],
  [731,"675","jessica-smith","45:22","F40"],
  [732,"1022","simon-farrow","45:05","M50"],
  [734,"866","leon-edwards","45:32","M40"],
  [735,"854","neil-boyce","46:08","M50"],
  [736,"669","dillon-alexander","45:11","MO"],
  [737,"1331","dave-eaves","45:52","MO"],
  [738,"971","joshua-taylor","46:12","MO"],
  [739,"668","lianne-hunter","46:36","FO"],
  [740,"1544","george-webster","45:55","MO"],
  [741,"1155","andrew-howes","46:41","MO"],
  [742,"1174","luke-horgan","45:17","MO"],
  [743,"1020","nicolas-navarro","46:05","MO"],
  [744,"1211","ethan-hutchings","45:30","MO"],
  [745,"514","ali-bridges","46:09","M40"],
  [746,"1104","leo-dudley","46:14","M40"],
  [747,"853","olivia-butler","45:29","FO"],
  [748,"943","joe-morel","45:38","MO"],
  [749,"676","charlie-moss","46:10","MO"],
  [750,"952","lee-west","45:38","MO"],
] as const;

export const resultsRn2025B7P1: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
