import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[752,"959","Lily","Churchyard","F","FO","46:50","unattached","Unattached","Not supplied",null,null,"lily-churchyard"],
[753,"1341","Dion","Nangle","M","MO","46:13","unattached","Unattached","Not supplied",null,null,"dion-nangle"],
[754,"1158","Tom","Faulkner","M","MO","45:45","unattached","Unattached","Not supplied",null,null,"tom-faulkner"],
[755,"890","Alex","Piper","M","MO","45:04","unattached","Unattached","Not supplied",null,null,"alex-piper"],
[756,"795","Tommy","Salmon","M","MO","45:23","unattached","Unattached","Not supplied",null,null,"tommy-salmon"],
[757,"651","Nathan","Mason","M","MO","45:36","unattached","Unattached","Not supplied",null,null,"nathan-mason"],
[758,"610","Katy","Dickinson","F","FO","46:36","unattached","Unattached","Not supplied",null,null,"katy-dickinson"],
[759,"1110","Tom","Griffiths","M","MO","45:29","unattached","Unattached","Not supplied",null,null,"tom-griffiths"],
[760,"1465","Simon","Hawken","M","M45","45:52","unattached","Unattached","Not supplied",null,null,"simon-hawken"],
[761,"1347","Mark","Lear","M","M45","46:05","unattached","Unattached","Not supplied",null,null,"mark-lear"],
[762,"1408","Jonathan","Lines","M","M40","46:36","unattached","Unattached","Not supplied",null,null,"jonathan-lines"],
[763,"901","Benjamin","Smither","M","M45","46:04","unattached","Unattached","Not supplied",null,null,"benjamin-smither"],
[764,"837","Adam","Northcut","M","M40","46:21","unattached","Unattached","Not supplied",null,null,"adam-northcut"],
[765,"1026","Ollie","Wales","M","MO","45:54","unattached","Unattached","Not supplied",null,null,"ollie-wales"],
[766,"426","Neil","Walpole","M","M55","46:27","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","neil-walpole"],
[767,"1225","Karl","Steward","M","M50","46:29","unattached","Unattached","Not supplied",null,null,"karl-steward"],
[768,"490","Maciej","Zielinski","M","MO","45:54","unattached","Waveney Valley AC","Not supplied",null,null,"maciej-zielinski"],
[769,"982","Tara","Adams","F","F50","46:28","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","tara-adams"],
[770,"1535","Kelly","Burchett","F","FO","46:23","unattached","Unattached","Not supplied",null,null,"kelly-burchett"],
[771,"1339","Nathaniel","Laker","M","MO","46:38","unattached","Unattached","Not supplied",null,null,"nathaniel-laker"],
[772,"1366","Harry","March","M","MO","45:58","unattached","Unattached","Not supplied",null,null,"harry-march"],
[773,"1257","Rachel","Jackson","F","F45","46:37","unattached","Unattached","Not supplied",null,null,"rachel-jackson"],
[774,"2661","Ashley","Grote","M","M40","43:31","unattached","Unattached","Not supplied",null,null,"ashley-grote"],
[775,"1845","Matthew","Kirkum","M","MO","46:53","unattached","Unattached","Not supplied",null,null,"matthew-kirkum"],
[776,"4481","Shaun","Dack","M","M50","43:55","unattached","Unattached","Not supplied",null,null,"shaun-dack"]
];
export const athletesRn2025B7P3: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
