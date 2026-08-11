import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[878,"632","Shaun","Conway","M","M60","47:42","unattached","Unattached","Not supplied",null,null,"shaun-conway"],
[879,"3488","Joe","Peek","M","MO","44:40","unattached","Unattached","Not supplied",null,null,"joe-peek"],
[880,"3201","Ruby","Hutchins","F","F40","44:28","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","ruby-hutchins"],
[881,"942","Mark","Ollett","M","M55","46:39","unattached","Unattached","Not supplied",null,null,"mark-ollett"],
[882,"1706","Mark","Adams","M","M50","46:47","unattached","Unattached","Not supplied",null,null,"mark-adams"],
[883,"1336","Danny","Loftus","M","MO","46:57","unattached","Unattached","Not supplied",null,null,"danny-loftus"],
[884,"1468","Sacha","Hill","F","F40","47:23","unattached","Unattached","Not supplied",null,null,"sacha-hill"],
[885,"895","Matthew","Rowe","M","M40","47:23","unattached","Unattached","Not supplied",null,null,"matthew-rowe"],
[886,"1688","Robert","Stevens","M","M50","46:59","unattached","Unattached","Not supplied",null,null,"robert-stevens"],
[887,"1282","Tom","Holmes","M","MO","47:12","unattached","Unattached","Not supplied",null,null,"tom-holmes"],
[888,"1380","Alexander","Mcclelland","M","MO","46:51","unattached","Unattached","Not supplied",null,null,"alexander-mcclelland"],
[889,"1694","Andrew","Charge","M","M50","47:15","great-yarmouth-road-runners","Great Yarmouth Road Runners","Norfolk","Norfolk","England","andrew-charge"],
[890,"1810","Christopher","Hamlin","M","M45","46:46","tri-anglia","Tri-Anglia Triathlon Club","Norfolk","Norfolk","England","christopher-hamlin"],
[891,"561,"Robbie","Starling","M","M55","47:44","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","robbie-starling"],
[892,"845","Philip","Caley","M","M45","46:51","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","philip-caley"],
[893,"1510","Tony","Demetriou","M","M45","46:32","unattached","Unattached","Not supplied",null,null,"tony-demetriou"],
[894,"828","Thomas","English","M","M40","47:03","unattached","Unattached","Not supplied",null,null,"thomas-english"],
[895,"1006","Andy","Clitheroe","M","M40","46:29","unattached","Unattached","Not supplied",null,null,"andy-clitheroe"],
[896,"666","Joseph","Moore","M","MO","47:08","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","joseph-moore"],
[897,"893","Kevin","Garrod","M","MO","47:35","unattached","Unattached","Not supplied",null,null,"kevin-garrod"],
[898,"1182","Thomas","Townshend","M","M45","47:13","unattached","Unattached","Not supplied",null,null,"thomas-townshend"],
[899,"1547","Adam","Mcphee","M","M40","47:14","unattached","Unattached","Not supplied",null,null,"adam-mcphee"],
[900,"1355","Neil","Batchelor","M","M45","47:09","unattached","Unattached","Not supplied",null,null,"neil-batchelor"]
];
export const athletesRn2025B7P8: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
