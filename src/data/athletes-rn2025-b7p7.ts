import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[853,"1458","Kane","Moore","M","MO","46:10","unattached","Unattached","Not supplied",null,null,"kane-moore"],
[854,"568","Nathan","Edwards","M","MO","46:14","unattached","Unattached","Not supplied",null,null,"nathan-edwards"],
[855,"1847","Joseph","Meades","M","MO","46:20","unattached","Unattached","Not supplied",null,null,"joseph-meades"],
[856,"353","Tom","Spurgeon","M","MO","46:39","unattached","Unattached","Not supplied",null,null,"tom-spurgeon"],
[857,"768","Archie","Fiddy","M","MO","46:54","unattached","Unattached","Not supplied",null,null,"archie-fiddy"],
[858,"1034","Lucinda","Bullimore","F","F40","47:05","unattached","Great Yarmouth & District AC","Not supplied",null,null,"lucinda-bullimore"],
[859,"1487","Johnathan","Lincoln","M","M50","47:31","lowestoft-road-runners","Lowestoft Road Runners","Norfolk","Norfolk","England","johnathan-lincoln"],
[860,"731","Amy","Balaam","F","F40","46:59","bure-valley-harriers","Bure Valley Harriers","Norfolk","Norfolk","England","amy-balaam"],
[861,"935","Gavin","Small","M","M45","46:36","tri-anglia","Tri-Anglia Triathlon Club","Norfolk","Norfolk","England","gavin-small"],
[862,"1352","James","Trim","M","MO","46:54","ryston-runners","Ryston Runners","Norfolk","Norfolk","England","james-trim"],
[863,"437","William","Parker","M","MO","47:23","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","william-parker"],
[864,"1243","Isabelle","Temple","F","FO","47:07","unattached","Unattached","Not supplied",null,null,"isabelle-temple"],
[865,"547","Rory","Hill","M","MO","47:02","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","rory-hill"],
[866,"605","Joe","Jackson","M","MO","47:08","unattached","Unattached","Not supplied",null,null,"joe-jackson"],
[867,"957","Sarah","Stubbs","F","F50","47:10","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","sarah-stubbs"],
[868,"694","George","Crowe","M","MO","47:08","unattached","Unattached","Not supplied",null,null,"george-crowe"],
[869,"747","Matt","Fox","M","M45","46:11","unattached","Unattached","Not supplied",null,null,"matt-fox"],
[870,"1077","John","Bishop","M","M55","47:16","unattached","Unattached","Not supplied",null,null,"john-bishop"],
[871,"1255","James","Clarkson","M","M40","47:00","unattached","Unattached","Not supplied",null,null,"james-clarkson"],
[872,"1654","Matthew","Woodrow","M","MO","47:36","unattached","Unattached","Not supplied",null,null,"matthew-woodrow"],
[873,"851","Nora","Ostergaard","F","FO","46:54","unattached","Unattached","Not supplied",null,null,"nora-ostergaard"],
[874,"661","Luke","Morfitt","M","M40","46:29","unattached","Unattached","Not supplied",null,null,"luke-morfitt"],
[875,"546","Mia","Keogh","F","FO","47:37","unattached","Unattached","Not supplied",null,null,"mia-keogh"],
[876,"1505","Tristan","Green","M","MO","46:37","unattached","Unattached","Not supplied",null,null,"tristan-green"],
[877,"1661","Marcus","Wilkinson","M","MO","46:06","unattached","Unattached","Not supplied",null,null,"marcus-wilkinson"]
];
export const athletesRn2025B7P7: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
