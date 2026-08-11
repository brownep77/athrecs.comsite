import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [851,"343","eamon-balaam","46:07","MO"],
  [852,"1032","dick-cheung","46:54","M50"],
  [853,"1458","kane-moore","46:10","MO"],
  [854,"568","nathan-edwards","46:14","MO"],
  [855,"1847","joseph-meades","46:20","MO"],
  [856,"353","tom-spurgeon","46:39","MO"],
  [857,"768","archie-fiddy","46:54","MO"],
  [858,"1034","lucinda-bullimore","47:05","F40"],
  [859,"1487","johnathan-lincoln","47:31","M50"],
  [860,"731","amy-balaam","46:59","F40"],
  [861,"935","gavin-small","46:36","M45"],
  [862,"1352","james-trim","46:54","MO"],
  [863,"437","william-parker","47:23","MO"],
  [864,"1243","isabelle-temple","47:07","FO"],
  [865,"547","rory-hill","47:02","MO"],
  [866,"605","joe-jackson","47:08","MO"],
  [867,"957","sarah-stubbs","47:10","F50"],
  [868,"694","george-crowe","47:08","MO"],
  [869,"747","matt-fox","46:11","M45"],
  [870,"1077","john-bishop","47:16","M55"],
  [871,"1255","james-clarkson","47:00","M40"],
  [872,"1654","matthew-woodrow","47:36","MO"],
  [873,"851","nora-ostergaard","46:54","FO"],
  [874,"661","luke-morfitt","46:29","M40"],
  [875,"546","mia-keogh","47:37","FO"],
  [876,"1505","tristan-green","46:37","MO"],
  [877,"1661","marcus-wilkinson","46:06","MO"],
  [878,"632","shaun-conway","47:42","M60"],
  [879,"3488","joe-peek","44:40","MO"],
  [880,"3201","ruby-hutchins","44:28","F40"],
  [881,"942","mark-ollett","46:39","M55"],
  [882,"1706","mark-adams","46:47","M50"],
  [883,"1336","danny-loftus","46:57","MO"],
  [884,"1468","sacha-hill","47:23","F40"],
  [885,"895","matthew-rowe","47:23","M40"],
  [886,"1688","robert-stevens","46:59","M50"],
  [887,"1282","tom-holmes","47:12","MO"],
  [888,"1380","alexander-mcclelland","46:51","MO"],
  [889,"1694","andrew-charge","47:15","M50"],
  [890,"1810","christopher-hamlin","46:46","M45"],
  [891,"561","robbie-starling","47:44","M55"],
  [892,"845","philip-caley","46:51","M45"],
  [893,"1510","tony-demetriou","46:32","M45"],
  [894,"828","thomas-english","47:03","M40"],
  [895,"1006","andy-clitheroe","46:29","M40"],
  [896,"666","joseph-moore","47:08","MO"],
  [897,"893","kevin-garrod","47:35","MO"],
  [898,"1182","thomas-townshend","47:13","M45"],
  [899,"1547","adam-mcphee","47:14","M40"],
  [900,"1355","neil-batchelor","47:09","M45"],
] as const;

export const resultsRn2025B7P4: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
