import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [951,"578","philip-brockington","47:06","M50"],
  [952,"399","eva-eccles","48:25","FO"],
  [953,"911","dominic-jarvis","47:38","MO"],
  [954,"1933","clark-hindle","47:49","MO"],
  [955,"1489","ruth-chadwick","48:18","F55"],
  [956,"582","tilly-meyrick","48:20","FO"],
  [957,"900","jonathan-dingle","47:15","M40"],
  [958,"906","jake-gorrod","47:33","MO"],
  [959,"1725","lloyd-cossey","47:54","MO"],
  [960,"1817","james-ames","48:00","MO"],
  [961,"243","leon-neeve","48:11","M45"],
  [962,"701","maud-bissey","47:20","FO"],
  [963,"760","sarah-raynsford","48:12","F45"],
  [964,"1439","dean-johnson","47:51","MO"],
  [965,"1047","richard-crewe","48:04","M50"],
  [966,"1501","matthew-taylor","48:00","M40"],
  [967,"1611","kirsty-wheeler","48:16","FO"],
  [968,"1527","joseph-gilman","47:24","M40"],
  [969,"1640","josh-bothe","47:13","MO"],
  [970,"1645","dave-robinson","47:19","M50"],
  [971,"639","callum-mcveigh","47:53","MO"],
  [972,"1250","ian-chapman","47:12","M50"],
  [973,"817","warren-bryant","48:34","MO"],
  [974,"3191","jefferson-creed","44:48","M55"],
  [975,"1651","megan-wright","47:36","FO"],
  [976,"1838","mike-mead","47:51","MO"],
  [977,"985","lewis-kelly","47:35","MO"],
  [978,"865","kieron-wardrope","47:00","MO"],
  [979,"1191","matthew-rogers","47:53","MO"],
  [980,"705","jonathan-hawes","47:34","M50"],
  [981,"1246","lewis-gray","47:22","MO"],
  [982,"1680","nikki-watson","47:57","FO"],
  [983,"864","grant-king","47:37","M45"],
  [984,"557","james-cooper","48:16","M40"],
  [985,"188","ross-orrick","48:06","MO"],
  [986,"1799","freddy-lowe","47:21","MO"],
  [987,"949","james-burnett","47:08","MO"],
  [988,"741","martin-herrmann","47:15","M45"],
  [989,"3078","reuben-noller","47:05","MO"],
  [990,"501","james-barnes","47:49","MO"],
  [991,"620","tom-messenger","47:07","MO"],
  [992,"1695","james-hall","47:28","MO"],
  [993,"1245","edward-wales","47:52","M40"],
  [994,"1349","simon-willis","47:26","MO"],
  [995,"1935","thomas-butler","44:22","MO"],
  [996,"2227","andrew-hubbard","45:36","M40"],
  [997,"1052","marcus-pead","47:57","M40"],
  [998,"836","ross-browne","48:16","MO"],
  [999,"979","sam-thorpe","47:11","MO"],
  [1000,"179","spencer-gray","47:47","MO"],
] as const;

export const resultsRn2025B8P2: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
  eventSlug: "run-norwich", date: "2025-09-07", distance: "10K", athleteSlug, place, time,
  finishTimeSeconds: toSeconds(time), chipTimeSeconds: toSeconds(time), status: "finished",
  category, resultSource: "official", source: SOURCE, bib,
}));
