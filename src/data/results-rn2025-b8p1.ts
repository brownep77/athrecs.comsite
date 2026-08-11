import type { ResultSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";

function toSeconds(time: string) {
  const parts = time.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

const rows = [
  [901,"1768","lyndon-ward","46:57","MO"],
  [902,"1332","louise-hudson","47:01","F45"],
  [903,"1291","corbin-griffen","47:24","MO"],
  [904,"2079","rebecca-willis","46:34","FO"],
  [905,"494","james-warren","47:42","MO"],
  [906,"320","connor-woodhouse","47:05","MO"],
  [907,"299","andrew-anthony","48:04","M50"],
  [908,"1123","darrell-oldman","47:50","M60"],
  [909,"1836","finlay-page","48:17","MO"],
  [910,"969","tom-hepburn","47:05","MO"],
  [911,"2176","nathaniel-tolmie","44:51","MO"],
  [912,"1419","leo-blyth","47:21","M45"],
  [913,"1393","fraser-steggles","47:05","MO"],
  [914,"955","marc-gridley","47:13","M45"],
  [915,"1132","frances-cooke","47:20","F40"],
  [916,"1726","luke-townshend","47:35","M45"],
  [917,"404","george-brockhouse","46:46","MO"],
  [918,"1600","chris-ramshaw","47:04","MO"],
  [919,"771","joey-clements","47:13","M40"],
  [920,"1665","lashaun-naurayan","48:20","MO"],
  [921,"1426","james-bates","47:15","M40"],
  [922,"674","paul-price","47:35","M60"],
  [923,"1732","michael-webster","47:41","M60"],
  [924,"1307","matt-frary","47:01","M55"],
  [925,"1831","jack-riggall","48:03","MO"],
  [926,"1601","kieran-macdonald","47:53","MO"],
  [927,"1080","olivia-smith","47:54","FO"],
  [928,"1770","ben-steed","47:59","M40"],
  [929,"1181","owen-rhodes","47:26","MO"],
  [930,"1404","charlie-blandy","47:42","MO"],
  [931,"757","stephen-ramm","47:40","M45"],
  [932,"653","andy-palmer","47:17","M60"],
  [933,"613","claire-brown","47:45","F60"],
  [934,"652","stacey-harper","47:18","F45"],
  [935,"1283","richard-moore","47:41","M40"],
  [936,"1351","duncan-smith","48:20","M65"],
  [937,"1533","ian-minns","47:07","M45"],
  [938,"1049","paul-freestone","46:56","M50"],
  [939,"1204","rob-o-leary","46:52","MO"],
  [940,"1231","cat-wardell","47:46","F50"],
  [941,"761","jonny-ray","47:53","M40"],
  [942,"871","georgia-gittins","46:45","FO"],
  [943,"1374","oliver-gardiner","46:46","MO"],
  [944,"670","ceri-theobald","48:08","M50"],
  [945,"1083","brian-bannon","48:17","MO"],
  [946,"1775","craig-edwards","46:52","M40"],
  [947,"1569","eve-dewsnap","47:29","F45"],
  [948,"1169","edward-brisley","47:37","MO"],
  [949,"827","laura-parry","47:46","FO"],
  [950,"1112","chris-chorley","47:40","M60"],
] as const;

export const resultsRn2025B8P1: ResultSeed[] = rows.map(([place, bib, athleteSlug, time, category]) => ({
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
