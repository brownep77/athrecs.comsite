import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [801,"1438","mobolaji-adekunle","45:40","MO"],
  [802,"1528","adrian-sutton","45:55","M40"],
  [803,"576","alan-bullock","46:27","M45"],
  [804,"907","james-chaplin","46:20","MO"],
  [805,"844","andrew-woods","46:30","M45"],
  [806,"822","daniel-easton","47:14","M45"],
  [807,"1029","joey-millar","46:27","MO"],
  [808,"1629","josh-youngs","46:12","MO"],
  [809,"1296","louise-griffin","46:45","F40"],
  [810,"536","stephen-belderbos","46:48","M45"],
  [811,"1518","jacob-malone","46:52","M45"],
  [812,"1840","neil-ashley","46:53","M50"],
  [813,"1096","kieron-hetherington","46:27","MO"],
  [814,"1179","jim-lowe","46:26","M45"],
  [815,"1193","sam-percy","46:03","MO"],
  [816,"1139","isaac-hacon","46:29","MO"],
  [817,"1669","minnie-andrews","47:11","FO"],
  [818,"361","bob-lightowler","46:45","MO"],
  [819,"1361","david-keely","46:17","MO"],
  [820,"2426","william-smithson","44:15","MO"],
  [821,"534","dan-gould","46:56","MO"],
  [822,"1724","marc-huggins","46:44","M55"],
  [823,"317","mark-willeard","47:09","M55"],
  [824,"1338","andy-halls","47:01","MO"],
  [825,"1839","jacob-wardrop","46:19","MO"],
  [826,"1295","ashley-dease-vincent","47:08","M40"],
  [827,"332","hannah-colby","47:14","FO"],
  [828,"1056","scott-wreford","46:48","MO"],
  [829,"1011","lisa-greengrass","46:54","F45"],
  [830,"755","ben-howes","46:12","MO"],
  [831,"1472","daniel-green","46:02","MO"],
  [832,"1455","bradley-stansbury","46:06","MO"],
  [833,"1251","christopher-downs","47:14","M40"],
  [834,"1285","thomas-lacey","46:16","M40"],
  [835,"1281","lee-duneclift","46:58","M40"],
  [836,"1590","steven-mills","46:53","M40"],
  [837,"1241","alex-peek","46:10","MO"],
  [838,"474","will-coulson","47:35","MO"],
  [839,"1764","jordan-smith","46:46","MO"],
  [840,"770","daryl-london","47:01","M45"],
  [841,"958","matt-wickham","47:05","M40"],
  [842,"1646","angela-ransome","47:08","F60"],
  [843,"1192","frankie-evans","47:08","MO"],
  [844,"896","tom-larby","46:45","MO"],
  [845,"997","callum-davenport","46:58","MO"],
  [846,"1053","andrew-millis","47:04","MO"],
  [847,"452","paul-smith","47:03","M50"],
  [848,"1641","edward-povey","46:21","MO"],
  [849,"341","louis-moore","47:14","MO"],
  [850,"1055","jack-cheung","46:54","M50"],
] as const;

export const resultsRn2025B7P3: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
