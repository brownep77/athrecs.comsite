import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [551,"1107","ben-cliffe","43:53","MO"],
  [552,"419","richard-nobes","44:52","M40"],
  [553,"172","richard-turner","44:12","M40"],
  [554,"780","kierran-haynes","44:22","MO"],
  [555,"786","jacob-last","44:51","MO"],
  [556,"457","vashti-macdonald-clink","44:49","F45"],
  [557,"797","harly-moon","44:29","FO"],
  [558,"1275","jonathan-gale","45:20","MO"],
  [559,"774","tom-askew","44:19","M40"],
  [560,"784","heidi-bacon","44:50","F40"],
  [561,"310","ian-callaghan","44:26","M50"],
  [562,"346","shane-hall","44:49","MO"],
  [563,"178","cormac-odriscoll","44:40","MO"],
  [564,"635","nathan-west","45:01","MO"],
  [565,"1199","toby-elsom","44:15","MO"],
  [566,"1198","alastair-elsom","44:15","MO"],
  [567,"1140","lewis-batch","44:25","MO"],
  [568,"994","david-asker","44:26","M40"],
  [569,"152","david-tayler","44:56","MO"],
  [570,"1087","adam-bevington","44:28","M40"],
  [571,"1268","paul-wheeler","45:04","M40"],
  [572,"470","jack-blandy","44:42","MO"],
  [573,"164","wayne-ramsbottom","44:49","M55"],
  [574,"1196","shane-west","45:05","MO"],
  [575,"1015","david-wright","44:49","M40"],
  [576,"799","carl-fairbrother","44:02","MO"],
  [577,"723","dean-howard","44:49","M50"],
  [578,"657","stanley-hodds","45:01","MO"],
  [579,"702","graham-ohara","45:13","M50"],
  [580,"1205","nathan-shoesmith","45:24","MO"],
  [581,"739","paul-guille","45:02","MO"],
  [582,"1025","alex-snow","45:03","MO"],
  [583,"1316","jake-stagg","44:25","MO"],
  [584,"783","ben-moore","45:06","MO"],
  [585,"1372","stephen-aspery","43:50","MO"],
  [586,"1437","conor-saunders","44:03","MO"],
  [587,"1186","mark-appleton","44:40","MO"],
  [588,"599","sam-webb","45:07","MO"],
  [589,"368","liam-quadling","45:07","MO"],
  [590,"1039","oliver-forkes","44:48","MO"],
  [591,"1652","olly-farrow","45:01","M40"],
  [592,"1094","rob-mcvicar","45:00","M45"],
  [593,"1850","jon-rowden","44:00","M55"],
  [594,"513","sebastian-polomski","44:46","M40"],
  [595,"1821","james-byrne","44:11","MO"],
  [596,"1013","james-boulton","44:53","MO"],
  [597,"160","max-fisher","45:09","MO"],
  [599,"904","josh-bloyce","45:10","MO"],
  [600,"798","thomas-galer","43:56","MO"],
] as const;

export const resultsRn2025B6P2: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
