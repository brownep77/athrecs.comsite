import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [751,"302","freddie-mowforth","45:56","MO"],
  [752,"959","lily-churchyard","46:50","FO"],
  [753,"1341","dion-nangle","46:13","MO"],
  [754,"1158","tom-faulkner","45:45","MO"],
  [755,"890","alex-piper","45:04","MO"],
  [756,"795","tommy-salmon","45:23","MO"],
  [757,"651","nathan-mason","45:36","MO"],
  [758,"610","katy-dickinson","46:36","FO"],
  [759,"1110","tom-griffiths","45:29","MO"],
  [760,"1465","simon-hawken","45:52","M45"],
  [761,"1347","mark-lear","46:05","M45"],
  [762,"1408","jonathan-lines","46:36","M40"],
  [763,"901","benjamin-smither","46:04","M45"],
  [764,"837","adam-northcut","46:21","M40"],
  [765,"1026","ollie-wales","45:54","MO"],
  [766,"426","neil-walpole","46:27","M55"],
  [767,"1225","karl-steward","46:29","M50"],
  [768,"490","maciej-zielinski","45:54","MO"],
  [769,"982","tara-adams","46:28","F50"],
  [770,"1535","kelly-burchett","46:23","FO"],
  [771,"1339","nathaniel-laker","46:38","MO"],
  [772,"1366","harry-march","45:58","MO"],
  [773,"1257","rachel-jackson","46:37","F45"],
  [774,"2661","ashley-grote","43:31","M40"],
  [775,"1845","matthew-kirkum","46:53","MO"],
  [776,"4481","shaun-dack","43:55","M50"],
  [777,"2714","sam-dack","43:55","MO"],
  [778,"855","ben-burgess","46:40","M40"],
  [779,"1430","john-lee","45:49","MO"],
  [780,"141","vincent-willard","45:35","MO"],
  [781,"425","christopher-cann","46:19","MO"],
  [782,"1143","georgia-dale","46:34","FO"],
  [783,"1148","simon-smith","46:25","M50"],
  [784,"1638","aaron-roberts","46:40","MO"],
  [785,"1400","jamie-tidswell","45:30","MO"],
  [786,"1180","paul-parker","46:24","M60"],
  [787,"1345","sam-paterson","45:33","MO"],
  [788,"840","james-rhodes","46:13","MO"],
  [789,"1031","stuart-plummer","46:04","M45"],
  [790,"1074","jack-davies","46:31","MO"],
  [791,"1542","steve-costello","45:31","M55"],
  [792,"593","callum-boulter","46:05","MO"],
  [793,"1619","tomasz-pendleton","46:14","MO"],
  [794,"1229","lilibet-tayler","46:51","FO"],
  [795,"917","nick-ross","46:09","M55"],
  [796,"1238","james-bygrave","46:43","MO"],
  [797,"1125","tom-durrell","46:15","MO"],
  [798,"1014","justin-pearce","46:30","M50"],
  [799,"1807","harry-livermore","45:47","MO"],
  [800,"1159","bethany-jackson","45:29","FO"],
] as const;

export const resultsRn2025B7P2: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
