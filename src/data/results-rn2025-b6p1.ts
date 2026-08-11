import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [501,"1090","robert-groves","44:20","MO"],
  [502,"927","freddie-henley-hunter","43:59","MO"],
  [503,"998","toby-blyth","43:55","MO"],
  [504,"477","gary-grand","44:25","M60"],
  [505,"1506","olly-huggett","44:23","MO"],
  [506,"312","zac-sowter","43:47","MO"],
  [507,"1806","alastair-drew","44:39","M40"],
  [508,"142","jack-fussey","44:48","MO"],
  [509,"1115","jack-jillings","42:55","MO"],
  [510,"602","joanne-watkins","44:40","F40"],
  [511,"980","daryl-aldous","43:55","M40"],
  [512,"1093","darren-moore","44:06","M50"],
  [513,"703","brendan-edwards","44:22","MO"],
  [514,"315","rob-riley","44:15","MO"],
  [515,"1674","matthew-cozens","43:45","M40"],
  [516,"370","karl-coulson","44:16","M55"],
  [517,"619","stuart-clark","44:29","MO"],
  [518,"831","richard-palmer","44:19","M40"],
  [519,"1637","dan-deag","44:27","MO"],
  [520,"1111","tom-allenby","44:01","MO"],
  [521,"806","matthew-pask","44:25","M55"],
  [522,"526","lewis-wilkins","44:27","MO"],
  [523,"1200","michael-brouse","44:21","M40"],
  [524,"1367","neil-dobson","44:32","M40"],
  [526,"1036","keane-pye","44:16","MO"],
  [527,"690","sarah-crockett","44:00","FO"],
  [528,"686","nick-richards","44:41","M50"],
  [529,"1425","peter-graveling","43:25","MO"],
  [530,"888","gregory-stevenson","44:34","M50"],
  [531,"1541","matthew-moore","43:44","M40"],
  [532,"656","liam-frost","44:36","MO"],
  [533,"550","james-watson","44:44","M45"],
  [534,"351","matt-goode","44:45","MO"],
  [535,"898","chris-woodcock","44:50","M40"],
  [536,"1183","mark-bloomfield","44:41","M55"],
  [537,"579","tom-dutton","44:27","M40"],
  [538,"1537","ben-houchen","43:21","M40"],
  [539,"963","gav-smith","44:09","M45"],
  [540,"862","jamie-davey","44:40","MO"],
  [541,"624","steve-newman","44:10","M55"],
  [542,"298","danny-sweatman","44:50","M40"],
  [543,"2909","ben-hopkins-lefevre","41:52","M45"],
  [544,"493","elliot-rose","44:12","MO"],
  [545,"438","jason-hurst","44:30","M50"],
  [546,"555","paul-thorpe","44:54","M45"],
  [547,"978,"oscar-bond","44:34","MO"],
  [548,"884","christopher-reeve","44:20","MO"],
  [549,"630","joshua-landles","44:06","MO"],
  [550,"815","lydia-randles","43:40","FO"],
] as const;

export const resultsRn2025B6P1: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
