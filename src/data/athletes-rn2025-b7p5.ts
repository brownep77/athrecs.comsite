import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[802,"1528","Adrian","Sutton","M","M40","45:55","unattached","Unattached","Not supplied",null,null,"adrian-sutton"],
[803,"576","Alan","Bullock","M","M45","46:27","unattached","Unattached","Not supplied",null,null,"alan-bullock"],
[804,"907","James","Chaplin","M","MO","46:20","unattached","Unattached","Not supplied",null,null,"james-chaplin"],
[805,"844","Andrew","Woods","M","M45","46:30","unattached","Unattached","Not supplied",null,null,"andrew-woods"],
[806,"822","Daniel","Easton","M","M45","47:14","unattached","Springfield Striders RC","Not supplied",null,null,"daniel-easton"],
[807,"1029","Joey","Millar","M","MO","46:27","unattached","Unattached","Not supplied",null,null,"joey-millar"],
[808,"1629","Josh","Youngs","M","MO","46:12","unattached","Unattached","Not supplied",null,null,"josh-youngs"],
[809,"1296","Louise","Griffin","F","F40","46:45","unattached","Unattached","Not supplied",null,null,"louise-griffin"],
[810,"536","Stephen","Belderbos","M","M45","46:48","unattached","Unattached","Not supplied",null,null,"stephen-belderbos"],
[811,"1518","Jacob","Malone","M","M45","46:52","unattached","Unattached","Not supplied",null,null,"jacob-malone"],
[812,"1840","Neil","Ashley","M","M50","46:53","unattached","Unattached","Not supplied",null,null,"neil-ashley"],
[813,"1096","Kieron","Hetherington","M","MO","46:27","unattached","Unattached","Not supplied",null,null,"kieron-hetherington"],
[814,"1179","Jim","Lowe","M","M45","46:26","unattached","Lindley Running Club","Not supplied",null,null,"jim-lowe"],
[815,"1193","Sam","Percy","M","MO","46:03","unattached","Unattached","Not supplied",null,null,"sam-percy"],
[816,"1139","Isaac","Hacon","M","MO","46:29","unattached","Unattached","Not supplied",null,null,"isaac-hacon"],
[817,"1669","Minnie","Andrews","F","FO","47:11","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","minnie-andrews"],
[818,"361","Bob","Lightowler","M","MO","46:45","unattached","Unattached","Not supplied",null,null,"bob-lightowler"],
[819,"1361","David","Keely","M","MO","46:17","unattached","Unattached","Not supplied",null,null,"david-keely"],
[820,"2426","William","Smithson","M","MO","44:15","unattached","Unattached","Not supplied",null,null,"william-smithson"],
[822,"1724","Marc","Huggins","M","M55","46:44","unattached","Unattached","Not supplied",null,null,"marc-huggins"],
[823,"317","Mark","Willeard","M","M55","47:09","unattached","Unattached","Not supplied",null,null,"mark-willeard"],
[824,"1338","Andy","Halls","M","MO","47:01","unattached","Unattached","Not supplied",null,null,"andy-halls"],
[825,"1839","Jacob","Wardrop","M","MO","46:19","unattached","Unattached","Not supplied",null,null,"jacob-wardrop"],
[826,"1295","Ashley","Dease-vincent","M","M40","47:08","unattached","Unattached","Not supplied",null,null,"ashley-dease-vincent"],
[827,"332","Hannah","Colby","F","FO","47:14","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","hannah-colby"]
];
export const athletesRn2025B7P5: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
