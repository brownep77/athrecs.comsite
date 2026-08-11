import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[527,"690","Sarah","Crockett","F","FO","44:00","unattached","Fulham Running Club","Not supplied",null,null,"sarah-crockett"],
[528,"686","Nick","Richards","M","M50","44:41","unattached","Unattached","Not supplied",null,null,"nick-richards"],
[529,"1425","Peter","Graveling","M","MO","43:25","unattached","Unattached","Not supplied",null,null,"peter-graveling"],
[530,"888","Gregory","Stevenson","M","M50","44:34","unattached","Unattached","Not supplied",null,null,"gregory-stevenson"],
[531,"1541","Matthew","Moore","M","M40","43:44","unattached","Unattached","Not supplied",null,null,"matthew-moore"],
[532,"656","Liam","Frost","M","MO","44:36","great-yarmouth-road-runners","Great Yarmouth Road Runners","Norfolk","Norfolk","England","liam-frost"],
[533,"550","James","Watson","M","M45","44:44","unattached","Unattached","Not supplied",null,null,"james-watson"],
[534,"351","Matt","Goode","M","MO","44:45","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","matt-goode"],
[535,"898","Chris","Woodcock","M","M40","44:50","lowestoft-road-runners","Lowestoft Road Runners","Norfolk","Norfolk","England","chris-woodcock"],
[536,"1183","Mark","Bloomfield","M","M55","44:41","unattached","Unattached","Not supplied",null,null,"mark-bloomfield"],
[537,"579","Tom","Dutton","M","M40","44:27","bungay-black-dog-rc","Bungay Black Dog RC","Norfolk","Norfolk","England","tom-dutton"],
[538,"1537","Ben","Houchen","M","M40","43:21","unattached","Unattached","Not supplied",null,null,"ben-houchen"],
[539,"963","Gav","Smith","M","M45","44:09","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","gav-smith"],
[540,"862","Jamie","Davey","M","MO","44:40","unattached","Unattached","Not supplied",null,null,"jamie-davey"],
[541,"624","Steve","Newman","M","M55","44:10","bungay-black-dog-rc","Bungay Black Dog RC","Norfolk","Norfolk","England","steve-newman"],
[542,"298","Danny","Sweatman","M","M40","44:50","unattached","Unattached","Not supplied",null,null,"danny-sweatman"],
[543,"2909","Ben","Hopkins-lefevre","M","M45","41:52","unattached","Unattached","Not supplied",null,null,"ben-hopkins-lefevre"],
[544,"493","Elliot","Rose","M","MO","44:12","unattached","Unattached","Not supplied",null,null,"elliot-rose"],
[545,"438","Jason","Hurst","M","M50","44:30","wymondham-ac","Wymondham AC","Norfolk","Norfolk","England","jason-hurst"],
[546,"555","Paul","Thorpe","M","M45","44:54","unattached","Hamwic Harriers Running Club","Not supplied",null,null,"paul-thorpe"],
[547,"978","Oscar","Bond","M","MO","44:34","unattached","Unattached","Not supplied",null,null,"oscar-bond"],
[548,"884","Christopher","Reeve","M","MO","44:20","unattached","Unattached","Not supplied",null,null,"christopher-reeve"],
[549,"630","Joshua","Landles","M","MO","44:06","unattached","Unattached","Not supplied",null,null,"joshua-landles"],
[550,"815","Lydia","Randles","F","FO","43:40","unattached","Unattached","Not supplied",null,null,"lydia-randles"],
[551,"1107","Ben","Cliffe","M","MO","43:53","unattached","Unattached","Not supplied",null,null,"ben-cliffe"]
];
export const athletesRn2025B6P2: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
