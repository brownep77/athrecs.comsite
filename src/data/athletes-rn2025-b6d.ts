import type { AthleteSeed } from "./types";

const SOURCE = "https://www.runnorwich.co.uk/wp-content/uploads/sites/3/2025/09/Run-Norwich-10K-25-Full-Results-by-Chiptime.pdf";
type AthleteRow = readonly [number,string,string,string,"M"|"F",string,string,string,string,string,string|null,string|null,string];
const rows: AthleteRow[] = [
[677,"541","Chris","Drake","M","MO","45:19","unattached","Unattached","Not supplied",null,null,"chris-drake"],
[678,"679","Daniel","Gardiner","M","M55","45:52","bungay-black-dog-rc","Bungay Black Dog RC","Norfolk","Norfolk","England","daniel-gardiner"],
[679,"1668","Tom","Hall","M","MO","45:06","unattached","Unattached","Not supplied",null,null,"tom-hall"],
[680,"1066","Charlotte","Harris Cook","F","F40","45:30","bure-valley-harriers","Bure Valley Harriers","Norfolk","Norfolk","England","charlotte-harris-cook"],
[681,"1003","Henry","Doe","M","MO","45:43","unattached","Unattached","Not supplied",null,null,"henry-doe"],
[682,"720","Shaun","Hurr","M","M45","45:31","bure-valley-harriers","Bure Valley Harriers","Norfolk","Norfolk","England","shaun-hurr"],
[683,"1420","Craig","Mccann","M","M40","45:10","unattached","Unattached","Not supplied",null,null,"craig-mccann"],
[684,"673","Evan","Simpson","M","MO","45:11","unattached","Unattached","Not supplied",null,null,"evan-simpson"],
[685,"621","Carlene","Johnson","F","FO","45:19","unattached","Unattached","Not supplied",null,null,"carlene-johnson"],
[686,"962","Stacy","Tovell","M","M50","45:56","unattached","Unattached","Not supplied",null,null,"stacy-tovell"],
[687,"1642","Will","Bryan","M","MO","45:13","unattached","Unattached","Not supplied",null,null,"will-bryan"],
[688,"1017","Brendan","Scott","M","MO","45:37","unattached","Unattached","Not supplied",null,null,"brendan-scott"],
[689,"794","Alan","Diaper","M","M50","45:38","great-yarmouth-road-runners","Great Yarmouth Road Runners","Norfolk","Norfolk","England","alan-diaper"],
[690,"1613","Daniel","De Boltz","M","MO","45:50","unattached","Unattached","Not supplied",null,null,"daniel-de-boltz"],
[691,"1160","Mark","Judd","M","M55","45:52","unattached","Unattached","Not supplied",null,null,"mark-judd"],
[692,"349","Matthew","Wigg","M","M40","45:51","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","matthew-wigg"],
[693,"1403","Christopher","Wigg","M","M50","45:51","unattached","Unattached","Not supplied",null,null,"christopher-wigg"],
[694,"655","Mark","Langdale","M","M55","46:02","unattached","Unattached","Not supplied",null,null,"mark-langdale"],
[695,"539","Dudley","Garner","M","M40","45:54","city-of-norwich-ac","City Of Norwich AC","Norfolk","Norfolk","England","dudley-garner"],
[696,"1044","Lee","Johnson","M","M40","45:22","ryston-runners","Ryston Runners","Norfolk","Norfolk","England","lee-johnson"],
[697,"749","Clare","Sandall","F","F45","46:07","norwich-road-runners","Norwich Road Runners","Norfolk","Norfolk","England","clare-sandall"],
[698,"680","Jason","Brunt","M","M50","46:04","norfolk-gazelles","Norfolk Gazelles AC","Norfolk","Norfolk","England","jason-brunt"],
[699,"1237","Chris","Johnson","M","M40","45:14","reepham-runners","Reepham Runners","Norfolk","Norfolk","England","chris-johnson"],
[700,"1617","Josh","Goddard","M","MO","45:53","unattached","Unattached","Not supplied",null,null,"josh-goddard"]
];
export const athletesRn2025B6D: AthleteSeed[] = rows.map(([place,bib,given_name,family_name,gender,default_category,chipTime,club_slug,source_club_name,city,county,country,slug]) => {
  const display_name=`${given_name} ${family_name}`;
  const clubText=source_club_name==="Unattached"?"":`, representing ${source_club_name}`;
  return {slug,display_name,given_name,family_name,gender,club_slug,source_club_name,city,...(county?{county}:{}),...(country?{country}:{}),bio:`${display_name} finished in place ${place} at Run Norwich 10K on 7 September 2025, recording an official chip time of ${chipTime}${clubText}.`,race_entry_name:display_name,default_category,default_bib:bib,preferred_distance:"10K",athrecs_id:`RN25-${bib}`,notes:`Run Norwich 2025: place ${place}; category ${default_category}; bib ${bib}; official chip time ${chipTime}.`,source_url:SOURCE};
});
