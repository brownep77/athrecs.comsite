import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [1001,"1327","lewis-webster","47:48","MO"],
  [1002,"1280","antony-bellingall","47:38","M45"],
  [1003,"716","hayley-hawes","47:47","F40"],
  [1004,"718","liam-mason","47:33","MO"],
  [1005,"1411","dan-paris","47:14","MO"],
  [1006,"1500","george-wadsley","47:51","MO"],
  [1007,"849","sophie-redgrave","48:45","FO"],
  [1008,"1543","sean-reeve","48:50","M55"],
  [1009,"1635","joshua-woolnough","47:45","M40"],
  [1010,"903","kirk-wright","47:42","MO"],
  [1011,"1444","ted-morgan","47:42","MO"],
  [1012,"1597","rebecca-thorby","48:15","F45"],
  [1013,"1441","adele-edwards","47:29","F40"],
  [1014,"250","chalank-nasim","48:58","MO"],
  [1015,"1314","chris-fisher","47:30","MO"],
  [1016,"2872","owen-fox","44:37","MO"],
  [1017,"2559","miles-dhawan-foster","45:52","MO"],
  [1018,"2136","oliver-copling","45:00","M40"],
  [1019,"2052","samuel-ely","44:51","MO"],
  [1020,"1477","ronan-carter","47:48","MO"],
  [1021,"1558","scott-allen","48:58","M40"],
  [1022,"671","william-muter","47:55","MO"],
  [1023,"1145","mark-thorby","48:24","M45"],
  [1024,"857","daniel-dowe","48:32","MO"],
  [1025,"1105","luke-channell","47:48","MO"],
  [1026,"1486","adam-kobylecki","48:14","MO"],
  [1027,"1526","stokely-howard","47:45","MO"],
  [1028,"995","keith-blake","48:59","M65"],
  [1029,"835","matthew-stocks","48:01","MO"],
  [1030,"1666","lewis-thurston","47:59","MO"],
  [1031,"498","kieren-davies","48:06","M45"],
  [1032,"1592","oliver-whitehouse","47:37","MO"],
  [1033,"1060","jay-vos","47:29","MO"],
  [1034,"3654","luke-johnson","45:46","M40"],
  [1035,"2255","mark-penson","46:02","M40"],
  [1036,"926","john-osborne","49:00","M45"],
  [1037,"1736","thomas-ramsay","48:21","MO"],
  [1038,"1591","ellena-white","48:48","FO"],
  [1039,"1007","amy-wright","48:48","FO"],
  [1040,"1772","liam-payne","49:00","M40"],
  [1041,"2315","michael-burris","45:33","MO"],
  [1042,"1028","matt-cox","48:25","MO"],
  [1043,"601","joshua-cadwallader","47:49","MO"],
  [1044,"1214","richard-brown","46:05","MO"],
  [1045,"2736","ian-burnaby-parsons","45:29","M40"],
  [1046,"1369","connor-pells","48:12","MO"],
  [1047,"1457","ivan-cuturello","48:23","MO"],
  [1048,"2172","jake-goldstraw","45:34","MO"],
  [1049,"1298","kalina-mcneilly","48:00","FO"],
  [1050,"1242","eden-simmonds","49:08","FO"],
] as const;

export const resultsRn2025B8P3: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
  eventSlug: "run-norwich", date: "2025-09-07", distance: "10K", athleteSlug, place, time,
  finishTimeSeconds: toSeconds(time), chipTimeSeconds: toSeconds(time), status: "finished",
  category, resultSource: "official", source: SOURCE, bib,
}));
