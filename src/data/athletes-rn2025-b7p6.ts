import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[828,"1056","Scott","Wreford","M","MO","46:48","unattached","Unattached","Not supplied",null,null,"scott-wreford"],
[829,"1011","Lisa","Greengrass","F","F45","46:54","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","lisa-greengrass"],
[830,"755","Ben","Howes","M","MO","46:12","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","ben-howes"],
[831,"1472","Daniel","Green","M","MO","46:02","unattached","Unattached","Not supplied",null,null,"daniel-green"],
[832,"1455","Bradley","Stansbury","M","MO","46:06","unattached","Unattached","Not supplied",null,null,"bradley-stansbury"],
[833,"1251","Christopher","Downs","M","M40","47:14","unattached","Unattached","Not supplied",null,null,"christopher-downs"],
[834,"1285","Thomas","Lacey","M","M40","46:16","unattached","Unattached","Not supplied",null,null,"thomas-lacey"],
[835,"1281","Lee","Duneclift","M","M40","46:58","unattached","Unattached","Not supplied",null,null,"lee-duneclift"],
[836,"1590","Steven","Mills","M","M40","46:53","unattached","Unattached","Not supplied",null,null,"steven-mills"],
[837,"1241","Alex","Peek","M","MO","46:10","unattached","Unattached","Not supplied",null,null,"alex-peek"],
[838,"474","Will","Coulson","M","MO","47:35","unattached","Unattached","Not supplied",null,null,"will-coulson"],
[839,"1764","Jordan","Smith","M","MO","46:46","unattached","Unattached","Not supplied",null,null,"jordan-smith"],
[840,"770","Daryl","London","M","M45","47:01","north-norfolk-beach-runners","North Norfolk Beach Runners","Norfolk","Norfolk","England","daryl-london"],
[841,"958","Matt","Wickham","M","M40","47:05","unattached","Unattached","Not supplied",null,null,"matt-wickham"],
[842,"1646","Angela","Ransome","F","F60","47:08","unattached","Unattached","Not supplied",null,null,"angela-ransome"],
[843,"1192","Frankie","Evans","M","MO","47:08","unattached","Unattached","Not supplied",null,null,"frankie-evans"],
[844,"896","Tom","Larby","M","MO","46:45","unattached","Unattached","Not supplied",null,null,"tom-larby"],
[845,"997","Callum","Davenport","M","MO","46:58","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","callum-davenport"],
[846,"1053","Andrew","Millis","M","MO","47:04","unattached","Vegan Runners UK","Not supplied",null,null,"andrew-millis"],
[847,"452","Paul","Smith","M","M50","47:03","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","paul-smith"],
[848,"1641","Edward","Povey","M","MO","46:21","unattached","Zoom Tri Club Bournemouth","Not supplied",null,null,"edward-povey"],
[849,"341","Louis","Moore","M","MO","47:14","unattached","Unattached","Not supplied",null,null,"louis-moore"],
[850,"1055","Jack","Cheung","M","M50","46:54","unattached","Unattached","Not supplied",null,null,"jack-cheung"],
[851,"343","Eamon","Balaam","M","MO","46:07","unattached","Unattached","Not supplied",null,null,"eamon-balaam"],
[852,"1032","Dick","Cheung","M","M50","46:54","unattached","Unattached","Not supplied",null,null,"dick-cheung"]
];
export const athletesRn2025B7P6: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
