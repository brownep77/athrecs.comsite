import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [1051,"1122","peter-aldred","49:12","M50"],
  [1052,"1172","rachel-lambert","48:59","FO"],
  [1053,"1357","martin-scothern","47:51","M60"],
  [1054,"1085","jimmy-seymour","48:18","MO"],
  [1055,"1166","phil-beecher","45:50","MO"],
  [1056,"1469","paula-carr","48:44","F60"],
  [1057,"843","dale-hurren","48:49","M65"],
  [1058,"1434","ryan-sadler","47:54","MO"],
  [1059,"1759","george-couzens","48:03","MO"],
  [1060,"1707","sam-loaker","48:16","MO"],
  [1061,"1177","david-gough","48:18","M50"],
  [1062,"244","elin-anderson","48:13","FO"],
  [1063,"746","archie-campbell","48:55","M40"],
  [1064,"1102","greg-ward","48:39","M55"],
  [1065,"1124","brian-jack","48:42","M60"],
  [1066,"433","sundee-denton-chandler","49:19","FO"],
  [1067,"396","terry-hubbard","45:26","M50"],
  [1068,"1700","matthew-webb","48:10","MO"],
  [1069,"1310","rebecca-bond","48:47","FO"],
  [1070,"1913","matthew-quick","45:30","MO"],
  [1071,"1220","emily-chatten","48:14","FO"],
  [1072,"1672","tom-hutt","48:57","MO"],
  [1073,"1302","michael-turner","48:20","MO"],
  [1074,"754","lee-cook","48:12","M40"],
  [1075,"1605","iain-hill","46:19","M45"],
  [1076,"1119","shane-kelly","47:53","M45"],
  [1077,"1667","daniel-halifax","48:57","M40"],
  [1078,"2413","oliver-baxter","46:21","MO"],
  [1079,"1073","simon-wardale","48:01","M60"],
  [1080,"1391","steven-newson","48:30","M50"],
  [1081,"1147","william-stoner","49:08","MO"],
  [1082,"1631","oliver-smith","49:19","MO"],
  [1083,"1054","richard-manington","49:00","MO"],
  [1084,"1959","tommy-router","46:00","MO"],
  [1085,"1042","stuart-harper","49:09","M45"],
  [1086,"1633","sean-cockrell","48:50","M55"],
  [1087,"1346","melissa-goodall","48:17","FO"],
  [1088,"986","toby-wellard","48:37","MO"],
  [1089,"548","tyrone-young","48:33","M40"],
  [1090,"294","james-crickmore","49:17","MO"],
  [1091,"3024","david-thomas","45:53","M40"],
  [1092,"1116","sean-lambert","49:06","MO"],
  [1093,"930","paul-tripp","48:44","M50"],
  [1094,"1731","justin-fox","48:12","M45"],
  [1095,"724","tristan-langley","49:03","MO"],
  [1096,"736","corin-thoday","48:16","M50"],
  [1097,"1267","samuel-lambert","48:55","MO"],
  [1098,"625","jason-cole","48:14","M40"],
  [1099,"1576","andrew-piff","48:00","MO"],
  [1100,"1763","victoria-lynskey","48:55","FO"],
] as const;

export const resultsRn2025B8P4: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
  eventSlug: "run-norwich", date: "2025-09-07", distance: "10K", athleteSlug, place, time,
  finishTimeSeconds: toSeconds(time), chipTimeSeconds: toSeconds(time), status: "finished",
  category, resultSource: "official", source: SOURCE, bib,
}));
